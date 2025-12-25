// ============================================
// LOCATION RESEARCH SERVICE
// ============================================
// Fetches and caches AI-researched economic data for US cities
// Runs in the background to not block game startup

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCityData, BASELINE_CITY, US_CITIES } from '../constants/usLocations';
import type { LocationEconomicData, LocationResearchStatus } from '../types/game';

// Storage key prefix for caching
const CACHE_KEY_PREFIX = '@86d_location_cache_';
const CACHE_EXPIRY_DAYS = 7; // Cache research results for 7 days

// Platform-safe storage
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
};

// Get cache key for a city
const getCacheKey = (city: string, state: string): string => {
  return `${CACHE_KEY_PREFIX}${city.toLowerCase().replace(/\s+/g, '_')}_${state.toLowerCase()}`;
};

// Check if cached data is still valid
const isCacheValid = (cachedData: LocationEconomicData): boolean => {
  if (!cachedData.researchedAt) return false;
  const cachedDate = new Date(cachedData.researchedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff < CACHE_EXPIRY_DAYS;
};

// Get cached location data
export const getCachedLocationData = async (
  city: string,
  state: string
): Promise<LocationEconomicData | null> => {
  try {
    const cacheKey = getCacheKey(city, state);
    const cached = await storage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached) as LocationEconomicData;
      if (isCacheValid(data)) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Error reading location cache:', error);
  }
  return null;
};

// Save location data to cache
const cacheLocationData = async (data: LocationEconomicData): Promise<void> => {
  try {
    const cacheKey = getCacheKey(data.city, data.state);
    await storage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Error caching location data:', error);
  }
};

// Get base location data from constants (instant, no API call)
export const getBaseLocationData = (city: string, state: string): LocationEconomicData => {
  const cityData = getCityData(city, state);

  if (cityData) {
    return {
      city: cityData.city,
      state: cityData.state,
      costOfLiving: cityData.costOfLiving,
      wageMultiplier: cityData.wageMultiplier,
      rentMultiplier: cityData.rentMultiplier,
      ticketMultiplier: cityData.ticketMultiplier,
      trafficMultiplier: cityData.trafficMultiplier,
      competitionLevel: cityData.competitionLevel,
      foodCostMultiplier: cityData.foodCostMultiplier,
      tier: cityData.tier,
      aiResearched: false,
    };
  }

  // Unknown city - use baseline with slight randomization for variety
  const randomVariance = () => 0.9 + Math.random() * 0.2; // 0.9 to 1.1

  return {
    city,
    state,
    costOfLiving: randomVariance(),
    wageMultiplier: randomVariance(),
    rentMultiplier: randomVariance(),
    ticketMultiplier: randomVariance(),
    trafficMultiplier: randomVariance(),
    competitionLevel: randomVariance(),
    foodCostMultiplier: randomVariance(),
    tier: 4, // Default to value market for unknown cities
    aiResearched: false,
  };
};

// Research location data using AI (runs in background)
export const researchLocationData = async (
  city: string,
  state: string,
  onProgress?: (status: LocationResearchStatus) => void
): Promise<LocationEconomicData> => {
  // First check cache
  const cached = await getCachedLocationData(city, state);
  if (cached) {
    onProgress?.('complete');
    return cached;
  }

  // Start with base data
  const baseData = getBaseLocationData(city, state);
  onProgress?.('loading');

  try {
    // Call AI research API
    const response = await fetch('/api/location-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, state }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const aiData = await response.json();

    // Merge AI data with base data
    const enrichedData: LocationEconomicData = {
      ...baseData,
      ...aiData,
      city,
      state,
      aiResearched: true,
      researchedAt: new Date().toISOString(),
    };

    // Cache the result
    await cacheLocationData(enrichedData);

    onProgress?.('complete');
    return enrichedData;
  } catch (error) {
    console.warn('Location research failed, using base data:', error);
    onProgress?.('error');
    // Return base data on error - game can still be played
    return baseData;
  }
};

// Apply location modifiers to game values
export const applyLocationModifiers = (
  baseValue: number,
  multiplier: number
): number => {
  return Math.round(baseValue * multiplier);
};

// Calculate modified rent based on location
export const calculateLocationRent = (
  baseRent: number,
  locationData: LocationEconomicData
): number => {
  return applyLocationModifiers(baseRent, locationData.rentMultiplier);
};

// Calculate modified wage based on location
export const calculateLocationWage = (
  baseWage: number,
  locationData: LocationEconomicData
): number => {
  return applyLocationModifiers(baseWage, locationData.wageMultiplier);
};

// Calculate modified ticket price based on location
export const calculateLocationTicket = (
  baseTicket: number,
  locationData: LocationEconomicData
): number => {
  // Round to nearest 0.50 for realistic pricing
  const modified = baseTicket * locationData.ticketMultiplier;
  return Math.round(modified * 2) / 2;
};

// Calculate modified covers based on location traffic
export const calculateLocationCovers = (
  baseCovers: number,
  locationData: LocationEconomicData
): number => {
  return applyLocationModifiers(baseCovers, locationData.trafficMultiplier);
};

// Calculate modified food cost percentage based on location
export const calculateLocationFoodCost = (
  baseFoodCostPct: number,
  locationData: LocationEconomicData
): number => {
  // Food cost is capped at realistic bounds
  const modified = baseFoodCostPct * locationData.foodCostMultiplier;
  return Math.min(0.45, Math.max(0.20, modified));
};

// Get difficulty adjustment text for UI
export const getLocationDifficultyText = (locationData: LocationEconomicData): string => {
  const avgMultiplier = (
    locationData.rentMultiplier +
    locationData.wageMultiplier +
    locationData.competitionLevel
  ) / 3;

  if (avgMultiplier > 1.5) return 'Very Hard';
  if (avgMultiplier > 1.25) return 'Hard';
  if (avgMultiplier > 1.0) return 'Medium';
  if (avgMultiplier > 0.85) return 'Easy';
  return 'Very Easy';
};

// Get location summary for display
export const getLocationSummary = (locationData: LocationEconomicData): string => {
  const parts: string[] = [];

  if (locationData.tier === 1) {
    parts.push('Premium market with high costs and high potential.');
  } else if (locationData.tier === 2) {
    parts.push('Growing market with solid economics.');
  } else if (locationData.tier <= 3) {
    parts.push('Balanced market with moderate costs.');
  } else if (locationData.tier === 4) {
    parts.push('Value market with lower barriers to entry.');
  } else {
    parts.push('Budget-friendly market ideal for bootstrapping.');
  }

  if (locationData.foodScene) {
    parts.push(locationData.foodScene);
  }

  return parts.join(' ');
};

// Get all popular cities for quick selection
export const getPopularCities = () => {
  return US_CITIES.filter(c =>
    ['New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
     'San Francisco', 'Seattle', 'Miami', 'Denver', 'Austin',
     'Nashville', 'Atlanta', 'Las Vegas', 'Portland', 'Boston'].includes(c.city)
  );
};
