// ============================================
// LOCATION & EXPANSION SYSTEM
// ============================================

export const LOCATION_TYPES = [
  { id: 'urban_downtown', name: 'Urban Downtown', icon: '🏙️', rentMod: 1.5, trafficMod: 1.4, competitionMod: 1.3, buildoutCost: 150000 },
  { id: 'urban_neighborhood', name: 'Urban Neighborhood', icon: '🏘️', rentMod: 1.2, trafficMod: 1.2, competitionMod: 1.1, buildoutCost: 120000 },
  { id: 'suburban_strip', name: 'Suburban Strip Mall', icon: '🛒', rentMod: 0.9, trafficMod: 1.0, competitionMod: 1.0, buildoutCost: 100000 },
  { id: 'suburban_standalone', name: 'Suburban Standalone', icon: '🏠', rentMod: 1.0, trafficMod: 0.9, competitionMod: 0.8, buildoutCost: 130000 },
  { id: 'mall_food_court', name: 'Mall Food Court', icon: '🏬', rentMod: 1.3, trafficMod: 1.5, competitionMod: 1.4, buildoutCost: 80000 },
  { id: 'airport', name: 'Airport Terminal', icon: '✈️', rentMod: 2.0, trafficMod: 1.8, competitionMod: 0.7, buildoutCost: 200000 },
  { id: 'rural', name: 'Rural Main Street', icon: '🌾', rentMod: 0.6, trafficMod: 0.7, competitionMod: 0.5, buildoutCost: 70000 },
  { id: 'ghost_kitchen', name: 'Ghost Kitchen', icon: '👻', rentMod: 0.4, trafficMod: 0, competitionMod: 0.3, buildoutCost: 40000, deliveryOnly: true },
];

export const MARKETS = [
  { id: 'same_city', name: 'Same City', icon: '📍', distanceMod: 1.0, brandBonus: 0.2, managementCost: 0 },
  { id: 'nearby_city', name: 'Nearby City (50mi)', icon: '🚗', distanceMod: 0.9, brandBonus: 0.1, managementCost: 500 },
  { id: 'regional', name: 'Regional (200mi)', icon: '🗺️', distanceMod: 0.7, brandBonus: 0.05, managementCost: 1500 },
  { id: 'new_state', name: 'New State', icon: '🏛️', distanceMod: 0.5, brandBonus: 0, managementCost: 3000, requiresManager: true },
  { id: 'national', name: 'National Expansion', icon: '🇺🇸', distanceMod: 0.3, brandBonus: 0, managementCost: 5000, requiresManager: true },
];

export const FRANCHISE_TIERS = [
  { id: 'single', name: 'Single Unit Franchise', fee: 35000, royalty: 0.05, marketingFee: 0.02, minLocations: 1, training: 4 },
  { id: 'area', name: 'Area Developer', fee: 100000, royalty: 0.045, marketingFee: 0.02, minLocations: 3, training: 6 },
  { id: 'master', name: 'Master Franchisee', fee: 250000, royalty: 0.04, marketingFee: 0.015, minLocations: 10, training: 8 },
];

export const INTERNATIONAL_MARKETS = [
  { id: 'canada', name: 'Canada', icon: '🇨🇦', currency: 'CAD', exchangeRate: 1.35, difficulty: 1.0, laborCost: 1.1, regulations: 'moderate', taxRate: 0.26, tip: 'Similar to US but stricter labor laws' },
  { id: 'uk', name: 'United Kingdom', icon: '🇬🇧', currency: 'GBP', exchangeRate: 0.79, difficulty: 1.2, laborCost: 1.2, regulations: 'strict', taxRate: 0.19, tip: 'Strong pub/cafe culture, Brexit import rules' },
  { id: 'mexico', name: 'Mexico', icon: '🇲🇽', currency: 'MXN', exchangeRate: 17.5, difficulty: 0.8, laborCost: 0.4, regulations: 'moderate', taxRate: 0.30, tip: 'Lower costs but supply chain challenges' },
  { id: 'japan', name: 'Japan', icon: '🇯🇵', currency: 'JPY', exchangeRate: 149, difficulty: 1.5, laborCost: 0.9, regulations: 'strict', taxRate: 0.23, tip: 'High standards, small portions, service culture' },
  { id: 'uae', name: 'UAE', icon: '🇦🇪', currency: 'AED', exchangeRate: 3.67, difficulty: 1.3, laborCost: 0.6, regulations: 'strict', taxRate: 0, tip: 'No income tax, strict halal requirements' },
  { id: 'australia', name: 'Australia', icon: '🇦🇺', currency: 'AUD', exchangeRate: 1.55, difficulty: 1.1, laborCost: 1.4, regulations: 'strict', taxRate: 0.30, tip: 'Highest minimum wage, brunch capital' },
  { id: 'singapore', name: 'Singapore', icon: '🇸🇬', currency: 'SGD', exchangeRate: 1.35, difficulty: 1.4, laborCost: 0.8, regulations: 'strict', taxRate: 0.17, tip: 'Hawker culture, high rent, food-obsessed' },
  { id: 'germany', name: 'Germany', icon: '🇩🇪', currency: 'EUR', exchangeRate: 0.92, difficulty: 1.2, laborCost: 1.3, regulations: 'strict', taxRate: 0.30, tip: 'Strong regulations, quality focus' },
];
