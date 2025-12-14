import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

// ============================================
// THEME & UTILITIES
// ============================================
const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
  info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

const formatCurrency = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
const formatPct = (v) => `${(v * 100).toFixed(1)}%`;

// ============================================
// AI MENTOR SYSTEM
// ============================================
const getAIMentorResponse = async (context, game, setup) => {
  const totalLocations = game.locations?.length || 1;
  const totalCash = game.locations?.reduce((sum, loc) => sum + loc.cash, 0) || game.cash;
  const totalStaff = game.locations?.reduce((sum, loc) => sum + loc.staff.length, 0) || game.staff?.length || 0;
  
  const prompt = `You are Chef Marcus, an AI mentor in a restaurant business simulator game called "86'd". 

Your personality:
- 30 years in the restaurant industry
- Opened 12 restaurants, failed at 4, learned from all
- Direct but supportive - you warn but don't block decisions
- You celebrate wins genuinely
- You teach through reflection on past choices

Current empire state:
- Total Locations: ${totalLocations}
- Restaurant: ${setup.name || 'Unnamed'} (${setup.cuisine} cuisine)
- Week: ${game.week}
- Total Cash: $${totalCash.toLocaleString()}
- Total Staff: ${totalStaff}
- Franchises: ${game.franchises?.length || 0}
- Empire Valuation: $${(game.empireValuation || 0).toLocaleString()}

Context: ${context}

Respond as Chef Marcus in 2-3 sentences. Be conversational and direct. Reference specific numbers when relevant.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.response || getFallbackResponse(context, game);
  } catch (error) {
    return getFallbackResponse(context, game);
  }
};

const getFallbackResponse = (context, game) => {
  const responses = {
    empire: [
      "Multiple locations means multiple headaches. But also multiple revenue streams.",
      "Scaling is about systems, not hustle. Document everything.",
      "Your managers are your multipliers. Invest in them.",
    ],
    franchise: [
      "Franchising is selling a system, not just a brand. Is yours ready?",
      "Franchisees will cut corners you never imagined. Build in quality controls.",
      "The best franchisees are operators, not investors.",
    ],
    location: [
      "Each location has its own personality. What works here might not work there.",
      "Don't spread yourself too thin. Master one before opening another.",
      "Location #2 fails at twice the rate of #1. Be ready.",
    ],
    default: [
      "Building an empire takes patience. One week at a time.",
      "The numbers don't lie. Trust them over your gut.",
      "Every decision compounds. Make good ones.",
    ]
  };
  
  let category = 'default';
  if (context.includes('empire') || context.includes('locations')) category = 'empire';
  else if (context.includes('franchise')) category = 'franchise';
  else if (context.includes('location') || context.includes('expansion')) category = 'location';
  
  const options = responses[category];
  return options[Math.floor(Math.random() * options.length)];
};

// ============================================
// EXPANDED DATA SETS
// ============================================
const CUISINES = [
  { id: 'burgers', name: 'Burgers & American', icon: '🍔', foodCost: 0.28, avgTicket: 14, difficulty: 'Easy' },
  { id: 'mexican', name: 'Mexican', icon: '🌮', foodCost: 0.26, avgTicket: 12, difficulty: 'Easy' },
  { id: 'pizza', name: 'Pizza & Italian-American', icon: '🍕', foodCost: 0.24, avgTicket: 18, difficulty: 'Easy' },
  { id: 'chinese', name: 'Chinese', icon: '🥡', foodCost: 0.27, avgTicket: 13, difficulty: 'Medium' },
  { id: 'japanese', name: 'Japanese', icon: '🍣', foodCost: 0.32, avgTicket: 22, difficulty: 'Hard' },
  { id: 'thai', name: 'Thai', icon: '🍜', foodCost: 0.28, avgTicket: 15, difficulty: 'Medium' },
  { id: 'indian', name: 'Indian', icon: '🍛', foodCost: 0.26, avgTicket: 16, difficulty: 'Medium' },
  { id: 'korean', name: 'Korean', icon: '🥘', foodCost: 0.29, avgTicket: 18, difficulty: 'Medium' },
  { id: 'vietnamese', name: 'Vietnamese', icon: '🍲', foodCost: 0.27, avgTicket: 14, difficulty: 'Medium' },
  { id: 'mediterranean', name: 'Mediterranean', icon: '🥙', foodCost: 0.30, avgTicket: 15, difficulty: 'Medium' },
  { id: 'seafood', name: 'Seafood', icon: '🦞', foodCost: 0.35, avgTicket: 45, difficulty: 'Hard' },
  { id: 'steakhouse', name: 'Steakhouse', icon: '🥩', foodCost: 0.38, avgTicket: 95, difficulty: 'Hard' },
  { id: 'bbq', name: 'BBQ & Smokehouse', icon: '🍖', foodCost: 0.30, avgTicket: 18, difficulty: 'Medium' },
  { id: 'cafe', name: 'Café & Coffee Shop', icon: '☕', foodCost: 0.22, avgTicket: 9, difficulty: 'Easy' },
  { id: 'vegan', name: 'Vegan & Plant-Based', icon: '🥗', foodCost: 0.32, avgTicket: 16, difficulty: 'Medium' },
  { id: 'ramen', name: 'Ramen Shop', icon: '🍜', foodCost: 0.26, avgTicket: 15, difficulty: 'Medium' },
  { id: 'sushi', name: 'Sushi Bar', icon: '🍱', foodCost: 0.34, avgTicket: 55, difficulty: 'Hard' },
  { id: 'tapas', name: 'Tapas & Small Plates', icon: '🫒', foodCost: 0.29, avgTicket: 24, difficulty: 'Medium' },
  { id: 'pub', name: 'Gastropub', icon: '🍺', foodCost: 0.28, avgTicket: 22, difficulty: 'Medium' },
  { id: 'brunch', name: 'Brunch Spot', icon: '🥞', foodCost: 0.26, avgTicket: 18, difficulty: 'Easy' },
  { id: 'foodtruck', name: 'Food Truck', icon: '🚚', foodCost: 0.26, avgTicket: 12, difficulty: 'Easy' },
  { id: 'finedining', name: 'Fine Dining', icon: '✨', foodCost: 0.30, avgTicket: 175, difficulty: 'Expert' },
];

const STAFF_TEMPLATES = [
  { role: 'Line Cook', wage: 16, icon: '👨‍🍳', department: 'kitchen', skillCap: 8 },
  { role: 'Prep Cook', wage: 14, icon: '🔪', department: 'kitchen', skillCap: 6 },
  { role: 'Server', wage: 8, icon: '🍽️', department: 'foh', skillCap: 8 },
  { role: 'Host', wage: 12, icon: '📋', department: 'foh', skillCap: 6 },
  { role: 'Dishwasher', wage: 13, icon: '🧽', department: 'kitchen', skillCap: 5 },
  { role: 'Bartender', wage: 10, icon: '🍸', department: 'bar', skillCap: 8 },
  { role: 'Sous Chef', wage: 24, icon: '👨‍🍳', department: 'kitchen', skillCap: 9 },
  { role: 'Executive Chef', wage: 35, icon: '👨‍🍳', department: 'kitchen', skillCap: 10 },
  { role: 'General Manager', wage: 28, icon: '👔', department: 'management', skillCap: 10, canManage: true },
  { role: 'Assistant Manager', wage: 20, icon: '📊', department: 'management', skillCap: 8 },
  { role: 'Expeditor', wage: 15, icon: '📢', department: 'kitchen', skillCap: 7 },
  { role: 'Busser', wage: 11, icon: '🧹', department: 'foh', skillCap: 5 },
  { role: 'District Manager', wage: 45, icon: '🏢', department: 'corporate', skillCap: 10, canManageMultiple: true },
  { role: 'Operations Director', wage: 55, icon: '📈', department: 'corporate', skillCap: 10, canManageMultiple: true },
];

const TRAINING_PROGRAMS = [
  { id: 'food_safety', name: 'Food Safety Cert', icon: '🛡️', cost: 200, weeks: 1, skillBoost: 1, cert: 'ServSafe', morale: 5 },
  { id: 'wine_101', name: 'Wine Fundamentals', icon: '🍷', cost: 350, weeks: 2, skillBoost: 2, cert: 'Wine 101', morale: 10 },
  { id: 'leadership', name: 'Leadership Training', icon: '⭐', cost: 500, weeks: 3, skillBoost: 2, cert: 'Team Lead', morale: 15 },
  { id: 'mixology', name: 'Advanced Mixology', icon: '🍹', cost: 400, weeks: 2, skillBoost: 2, cert: 'Mixologist', morale: 10 },
  { id: 'customer_service', name: 'Service Excellence', icon: '🎯', cost: 250, weeks: 1, skillBoost: 1, cert: 'Service Pro', morale: 10 },
  { id: 'management', name: 'Management Bootcamp', icon: '📈', cost: 800, weeks: 4, skillBoost: 3, cert: 'Manager Cert', morale: 20 },
  { id: 'multi_unit', name: 'Multi-Unit Management', icon: '🏢', cost: 1500, weeks: 6, skillBoost: 4, cert: 'Multi-Unit', morale: 25 },
  { id: 'franchise_ops', name: 'Franchise Operations', icon: '🌐', cost: 2000, weeks: 8, skillBoost: 5, cert: 'Franchise Pro', morale: 30 },
];

const EQUIPMENT = [
  { id: 'fryer', name: 'Commercial Fryer', icon: '🍟', cost: 3500, maintenance: 50, effect: { capacity: 0.05, speed: 0.05 } },
  { id: 'oven', name: 'Convection Oven', icon: '🔥', cost: 8000, maintenance: 75, effect: { capacity: 0.08, quality: 0.05 } },
  { id: 'walkin', name: 'Walk-In Cooler', icon: '❄️', cost: 12000, maintenance: 100, effect: { spoilage: -0.5, capacity: 0.05 } },
  { id: 'pos', name: 'Modern POS System', icon: '💻', cost: 5000, maintenance: 150, effect: { speed: 0.15, accuracy: 0.1 } },
  { id: 'dishwasher', name: 'Commercial Dishwasher', icon: '🧽', cost: 6000, maintenance: 60, effect: { labor: -0.05, speed: 0.05 } },
  { id: 'espresso', name: 'Espresso Machine', icon: '☕', cost: 8000, maintenance: 80, effect: { revenue: 0.05, ticket: 0.03 } },
  { id: 'grill', name: 'Flat Top Grill', icon: '🥓', cost: 4500, maintenance: 40, effect: { capacity: 0.06, speed: 0.04 } },
  { id: 'hood', name: 'Ventilation Hood', icon: '💨', cost: 15000, maintenance: 200, effect: { safety: 0.2, comfort: 0.1 } },
  { id: 'ice_machine', name: 'Ice Machine', icon: '🧊', cost: 3000, maintenance: 45, effect: { bar_revenue: 0.08 } },
  { id: 'mixer', name: 'Stand Mixer', icon: '🎂', cost: 2000, maintenance: 20, effect: { prep_speed: 0.1 } },
];

const UPGRADES = [
  { id: 'patio', name: 'Outdoor Patio', icon: '☀️', cost: 25000, effect: { capacity: 0.25, seasonal: true } },
  { id: 'bar', name: 'Full Bar License', icon: '🍸', cost: 40000, effect: { revenue: 0.15, ticket: 0.2 } },
  { id: 'private_room', name: 'Private Dining Room', icon: '🚪', cost: 35000, effect: { events: true, ticket: 0.1 } },
  { id: 'renovation', name: 'Full Renovation', icon: '🎨', cost: 50000, effect: { satisfaction: 0.2, reputation: 10 } },
  { id: 'kitchen_expand', name: 'Kitchen Expansion', icon: '👨‍🍳', cost: 75000, effect: { capacity: 0.3, speed: 0.15 } },
  { id: 'signage', name: 'Premium Signage', icon: '💡', cost: 15000, effect: { visibility: 0.15, reputation: 5 } },
  { id: 'parking', name: 'Valet Parking', icon: '🚗', cost: 20000, effect: { premium_customers: 0.2 } },
  { id: 'sound', name: 'Sound System', icon: '🔊', cost: 8000, effect: { ambiance: 0.1, satisfaction: 0.05 } },
];

const MARKETING_CHANNELS = [
  { id: 'social_organic', name: 'Social Media (Organic)', icon: '📱', costPerWeek: 0, effect: { reach: 0.02, followers: 10 } },
  { id: 'social_paid', name: 'Social Media Ads', icon: '📣', costPerWeek: 500, effect: { reach: 0.08, followers: 50 } },
  { id: 'google_ads', name: 'Google Ads', icon: '🔍', costPerWeek: 750, effect: { reach: 0.1, newCustomers: 0.15 } },
  { id: 'influencer', name: 'Influencer Partnership', icon: '⭐', costPerWeek: 1000, effect: { reach: 0.12, reputation: 2 } },
  { id: 'email', name: 'Email Marketing', icon: '📧', costPerWeek: 100, effect: { retention: 0.1, regulars: 0.05 } },
  { id: 'local_pr', name: 'Local PR/Press', icon: '📰', costPerWeek: 300, effect: { reputation: 3, reach: 0.05 } },
  { id: 'loyalty', name: 'Loyalty Program', icon: '💳', costPerWeek: 200, effect: { retention: 0.2, regulars: 0.1 } },
  { id: 'events', name: 'Community Events', icon: '🎉', costPerWeek: 400, effect: { reputation: 2, reach: 0.06 } },
];

const DELIVERY_PLATFORMS = [
  { id: 'doordash', name: 'DoorDash', icon: '🚪', commission: 0.25, setup: 500, reach: 0.3 },
  { id: 'ubereats', name: 'Uber Eats', icon: '🚗', commission: 0.30, setup: 0, reach: 0.35 },
  { id: 'grubhub', name: 'Grubhub', icon: '🍽️', commission: 0.28, setup: 250, reach: 0.25 },
  { id: 'postmates', name: 'Postmates', icon: '📦', commission: 0.27, setup: 200, reach: 0.15 },
  { id: 'direct', name: 'Direct Delivery', icon: '🏠', commission: 0.05, setup: 2000, reach: 0.1 },
];

const VIRTUAL_BRANDS = [
  { id: 'wings', name: 'Wing Boss', icon: '🍗', avgTicket: 22, setupCost: 2000 },
  { id: 'burgers', name: 'Smash Stack', icon: '🍔', avgTicket: 18, setupCost: 1500 },
  { id: 'healthy', name: 'Green Machine', icon: '🥗', avgTicket: 16, setupCost: 1800 },
  { id: 'tacos', name: 'Taco Libre', icon: '🌮', avgTicket: 15, setupCost: 1500 },
  { id: 'pizza', name: 'Slice Society', icon: '🍕', avgTicket: 20, setupCost: 2000 },
  { id: 'asian', name: 'Wok This Way', icon: '🥡', avgTicket: 17, setupCost: 1800 },
  { id: 'breakfast', name: 'Morning Glory', icon: '🥞', avgTicket: 14, setupCost: 1200 },
  { id: 'dessert', name: 'Sweet Tooth', icon: '🧁', avgTicket: 12, setupCost: 1000 },
];

const LOANS = [
  { id: 'bank_small', name: 'Bank Loan (Small)', amount: 25000, rate: 0.08, term: 52, weeklyPayment: 520 },
  { id: 'bank_medium', name: 'Bank Loan (Medium)', amount: 50000, rate: 0.09, term: 104, weeklyPayment: 550 },
  { id: 'bank_large', name: 'Bank Loan (Large)', amount: 100000, rate: 0.10, term: 156, weeklyPayment: 750 },
  { id: 'sba', name: 'SBA Loan', amount: 75000, rate: 0.065, term: 260, weeklyPayment: 350 },
  { id: 'expansion', name: 'Expansion Loan', amount: 200000, rate: 0.085, term: 260, weeklyPayment: 950 },
  { id: 'investor', name: 'Angel Investor', amount: 50000, rate: 0.15, term: 104, weeklyPayment: 625, equity: 0.1 },
  { id: 'family', name: 'Family Loan', amount: 20000, rate: 0.03, term: 104, weeklyPayment: 200 },
  { id: 'predatory', name: 'Quick Cash Advance', amount: 15000, rate: 0.35, term: 26, weeklyPayment: 750 },
];

// ============================================
// LOCATION & EXPANSION SYSTEM
// ============================================
const LOCATION_TYPES = [
  { id: 'urban_downtown', name: 'Urban Downtown', icon: '🏙️', rentMod: 1.5, trafficMod: 1.4, competitionMod: 1.3, buildoutCost: 150000 },
  { id: 'urban_neighborhood', name: 'Urban Neighborhood', icon: '🏘️', rentMod: 1.2, trafficMod: 1.2, competitionMod: 1.1, buildoutCost: 120000 },
  { id: 'suburban_strip', name: 'Suburban Strip Mall', icon: '🛒', rentMod: 0.9, trafficMod: 1.0, competitionMod: 1.0, buildoutCost: 100000 },
  { id: 'suburban_standalone', name: 'Suburban Standalone', icon: '🏠', rentMod: 1.0, trafficMod: 0.9, competitionMod: 0.8, buildoutCost: 130000 },
  { id: 'mall_food_court', name: 'Mall Food Court', icon: '🏬', rentMod: 1.3, trafficMod: 1.5, competitionMod: 1.4, buildoutCost: 80000 },
  { id: 'airport', name: 'Airport Terminal', icon: '✈️', rentMod: 2.0, trafficMod: 1.8, competitionMod: 0.7, buildoutCost: 200000 },
  { id: 'rural', name: 'Rural Main Street', icon: '🌾', rentMod: 0.6, trafficMod: 0.7, competitionMod: 0.5, buildoutCost: 70000 },
  { id: 'ghost_kitchen', name: 'Ghost Kitchen', icon: '👻', rentMod: 0.4, trafficMod: 0, competitionMod: 0.3, buildoutCost: 40000, deliveryOnly: true },
];

const MARKETS = [
  { id: 'same_city', name: 'Same City', icon: '📍', distanceMod: 1.0, brandBonus: 0.2, managementCost: 0 },
  { id: 'nearby_city', name: 'Nearby City (50mi)', icon: '🚗', distanceMod: 0.9, brandBonus: 0.1, managementCost: 500 },
  { id: 'regional', name: 'Regional (200mi)', icon: '🗺️', distanceMod: 0.7, brandBonus: 0.05, managementCost: 1500 },
  { id: 'new_state', name: 'New State', icon: '🏛️', distanceMod: 0.5, brandBonus: 0, managementCost: 3000, requiresManager: true },
  { id: 'national', name: 'National Expansion', icon: '🇺🇸', distanceMod: 0.3, brandBonus: 0, managementCost: 5000, requiresManager: true },
];

const FRANCHISE_TIERS = [
  { id: 'single', name: 'Single Unit Franchise', fee: 35000, royalty: 0.05, marketingFee: 0.02, minLocations: 1, training: 4 },
  { id: 'area', name: 'Area Developer', fee: 100000, royalty: 0.045, marketingFee: 0.02, minLocations: 3, training: 6 },
  { id: 'master', name: 'Master Franchisee', fee: 250000, royalty: 0.04, marketingFee: 0.015, minLocations: 10, training: 8 },
];

// ============================================
// EMPIRE SCENARIOS (Multi-location specific)
// ============================================
const EMPIRE_SCENARIOS = [
  {
    id: 'manager_poached', type: 'crisis', title: '🏃 Manager Poached',
    message: 'Your best GM just got offered a position at a competitor. They want 25% more to stay.',
    options: [
      { text: 'Match + 10% bonus structure', successChance: 0.9, success: { cash: -15000, morale: 10 }, fail: { loseManager: true } },
      { text: 'Counter with equity stake', successChance: 0.7, success: { equity: -2, morale: 20 }, fail: { loseManager: true } },
      { text: 'Wish them well, promote from within', successChance: 0.6, success: { loseManager: true, promoteInternal: true }, fail: { loseManager: true, locationPerformance: -0.2 } },
    ],
    lesson: 'Great managers are worth fighting for. But building bench strength is even more important.',
    minLocations: 2,
  },
  {
    id: 'supply_chain_multi', type: 'crisis', title: '🚛 Supply Chain Crisis',
    message: 'Your main distributor is having issues. All locations are affected. Premium vendor available at 20% higher cost.',
    options: [
      { text: 'Switch all locations to premium vendor', successChance: 0.95, success: { foodCostMod: 0.05, allLocations: true }, fail: {} },
      { text: 'Scramble for local suppliers per location', successChance: 0.6, success: { foodCostMod: 0.02 }, fail: { reputation: -10, allLocations: true } },
      { text: 'Reduce menu temporarily at all locations', successChance: 0.8, success: { capacity: -0.2, allLocations: true }, fail: { reputation: -15, allLocations: true } },
    ],
    lesson: 'Centralized purchasing saves money but creates single points of failure.',
    minLocations: 2,
  },
  {
    id: 'brand_crisis', type: 'crisis', title: '📱 Viral Brand Crisis',
    message: 'A video showing a food safety issue at one location is going viral. All locations are being tagged.',
    options: [
      { text: 'Immediate transparency + comp meals', successChance: 0.7, success: { cash: -20000, reputation: -5, allLocations: true }, fail: { reputation: -25, allLocations: true } },
      { text: 'PR firm damage control', successChance: 0.6, success: { cash: -15000, reputation: -10, allLocations: true }, fail: { reputation: -30, allLocations: true } },
      { text: 'Stay quiet and wait it out', successChance: 0.3, success: { reputation: -15, allLocations: true }, fail: { reputation: -40, allLocations: true, covers: -30 } },
    ],
    lesson: 'In the age of social media, every location represents your entire brand.',
    minLocations: 2,
  },
  {
    id: 'franchise_applicant', type: 'opportunity', title: '🤝 Franchise Inquiry',
    message: 'A well-funded group wants to franchise 5 locations in a new market. They have restaurant experience.',
    options: [
      { text: 'Accept - sign franchise agreement', successChance: 0.8, success: { cash: 175000, newFranchises: 5 }, fail: { cash: 35000, reputation: -10 } },
      { text: 'Negotiate better terms', successChance: 0.5, success: { cash: 200000, newFranchises: 5 }, fail: { reputation: -5 } },
      { text: 'Decline - not ready to franchise', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Franchising is a different business than restaurants. Make sure you\'re ready.',
    minLocations: 3,
    minReputation: 70,
  },
  {
    id: 'corporate_buyout', type: 'opportunity', title: '💰 Buyout Offer',
    message: 'A private equity firm wants to buy your entire operation. They\'re offering 4x annual revenue.',
    options: [
      { text: 'Accept the offer', successChance: 1.0, success: { endGame: 'buyout' }, fail: {} },
      { text: 'Counter at 6x revenue', successChance: 0.4, success: { endGame: 'buyout_premium' }, fail: { reputation: 5 } },
      { text: 'Decline - keep building', successChance: 1.0, success: { reputation: 10 }, fail: {} },
    ],
    lesson: 'Know your number. But also know what you\'d do the day after you sell.',
    minLocations: 5,
    minValuation: 2000000,
  },
  {
    id: 'district_expansion', type: 'opportunity', title: '🏗️ Prime Real Estate',
    message: 'A developer is offering you first pick on 3 locations in a new mixed-use development. 20% below market rent.',
    options: [
      { text: 'Commit to all 3 locations', successChance: 0.7, success: { newLocationOpportunity: 3, rentDiscount: 0.2 }, fail: { cash: -50000 } },
      { text: 'Take 1 location, option on others', successChance: 0.9, success: { newLocationOpportunity: 1, rentDiscount: 0.15 }, fail: {} },
      { text: 'Pass - too much too fast', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'The best deals require the most capital. Build your war chest.',
    minLocations: 2,
    minCash: 200000,
  },
  {
    id: 'unionization', type: 'staff', title: '✊ Union Talk',
    message: 'Employees across multiple locations are talking about unionizing. A vote could happen in weeks.',
    options: [
      { text: 'Proactively raise wages 15% company-wide', successChance: 0.7, success: { laborCostMod: 0.15, morale: 25, allLocations: true }, fail: { morale: 10, allLocations: true } },
      { text: 'Hire labor relations consultant', successChance: 0.5, success: { cash: -25000 }, fail: { unionized: true, allLocations: true } },
      { text: 'Accept unionization, negotiate fairly', successChance: 0.8, success: { unionized: true, morale: 15, allLocations: true }, fail: { morale: -20, allLocations: true } },
    ],
    lesson: 'Happy employees rarely unionize. This is a symptom, not the disease.',
    minLocations: 3,
    minStaff: 30,
  },
  {
    id: 'franchisee_failing', type: 'crisis', title: '📉 Struggling Franchisee',
    message: 'One of your franchisees is failing. They\'re 3 months behind on royalties and quality is slipping.',
    options: [
      { text: 'Buy them out at discount', successChance: 0.8, success: { cash: -75000, convertToOwned: true }, fail: { cash: -75000, reputation: -10 } },
      { text: 'Send support team, defer royalties', successChance: 0.5, success: { cash: -10000 }, fail: { terminateFranchise: true, reputation: -15 } },
      { text: 'Terminate franchise agreement', successChance: 0.9, success: { terminateFranchise: true, reputation: -5 }, fail: { reputation: -20, legal: 25000 } },
    ],
    lesson: 'Your brand is only as strong as your weakest franchisee.',
    minFranchises: 1,
  },
];

const SCENARIOS = [
  // CRISIS SCENARIOS
  {
    id: 'health_inspection', type: 'crisis', title: '🏥 Health Inspection',
    message: 'Health inspector just walked in unannounced. Your kitchen is about to be evaluated.',
    options: [
      { text: 'Welcome them confidently', successChance: 0.7, success: { reputation: 5, achievement: 'clean_kitchen' }, fail: { cash: -2000, reputation: -15 } },
      { text: 'Stall while staff cleans up', successChance: 0.4, success: { reputation: 2 }, fail: { cash: -3000, reputation: -20 } },
    ],
    lesson: 'Keep your kitchen inspection-ready at all times.',
    minWeek: 2,
  },
  {
    id: 'staff_walkout', type: 'crisis', title: '🚪 Staff Walkout',
    message: 'Three of your staff are threatening to quit unless they get raises. It\'s Friday at 4pm.',
    options: [
      { text: 'Give 10% raises immediately', successChance: 0.9, success: { laborCostMod: 0.1, morale: 15 }, fail: { staff: -1 } },
      { text: 'Negotiate - offer 5% now, 5% in 3 months', successChance: 0.6, success: { laborCostMod: 0.05, morale: 5 }, fail: { staff: -2, morale: -20 } },
      { text: 'Call their bluff', successChance: 0.3, success: { reputation: 5 }, fail: { staff: -3, reputation: -10, morale: -30 } },
    ],
    lesson: 'Invest in your team before problems escalate.',
    minWeek: 8,
  },
  {
    id: 'equipment_failure', type: 'crisis', title: '🔧 Equipment Breakdown',
    message: 'Your main cooler died overnight. You have about 4 hours before food spoils.',
    options: [
      { text: 'Emergency repair ($3,500)', successChance: 0.85, success: { cash: -3500 }, fail: { cash: -3500, foodWaste: 2500 } },
      { text: 'Buy bags of ice, get creative ($200)', successChance: 0.5, success: { cash: -200 }, fail: { cash: -200, foodWaste: 4000 } },
      { text: 'Close for the day, salvage what you can', successChance: 1.0, success: { cash: -1500, reputation: -5 }, fail: {} },
    ],
    lesson: 'Budget for equipment emergencies.',
    minWeek: 4,
  },
  {
    id: 'viral_review', type: 'opportunity', title: '📱 Viral Review',
    message: 'A food blogger with 500K followers loved your food and wants to feature you.',
    options: [
      { text: 'Roll out the red carpet', successChance: 0.75, success: { reputation: 20, covers: 50, followers: 500 }, fail: { reputation: -10 } },
      { text: 'Treat them like anyone else', successChance: 0.5, success: { reputation: 10, followers: 100 }, fail: { reputation: -5 } },
    ],
    lesson: 'Every guest could be your next advocate or critic.',
    minWeek: 6,
  },
  {
    id: 'catering_gig', type: 'opportunity', title: '🎉 Catering Opportunity',
    message: 'A local company wants you to cater their 200-person corporate event next month.',
    options: [
      { text: 'Accept the $12,000 contract', successChance: 0.7, success: { cash: 12000, reputation: 10, burnout: 10 }, fail: { cash: 4000, reputation: -15 } },
      { text: 'Negotiate for $15,000', successChance: 0.5, success: { cash: 15000, reputation: 10 }, fail: { reputation: -5 } },
      { text: 'Politely decline - too risky', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Catering is high-margin but high-stakes.',
    minWeek: 8,
  },
  {
    id: 'second_location_opportunity', type: 'opportunity', title: '🏢 Second Location',
    message: 'A great location just opened up. Similar demographics, reasonable rent. This could be your chance to expand.',
    options: [
      { text: 'Pursue it - start negotiations', successChance: 0.8, success: { expansionOpportunity: true }, fail: { cash: -5000, burnout: 10 } },
      { text: 'Not ready - need more runway', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Second locations fail at 2x the rate of first ones. Perfect your systems first.',
    minWeek: 52,
    minCash: 150000,
    maxLocations: 1,
  },
];

const CUSTOMER_TYPES = [
  { id: 'regular', name: 'Regular', icon: '😊', spendMod: 1.0, frequency: 0.35, tipMod: 1.1 },
  { id: 'first_timer', name: 'First Timer', icon: '🆕', spendMod: 0.9, frequency: 0.20, tipMod: 1.0 },
  { id: 'critic', name: 'Food Critic', icon: '📝', spendMod: 1.3, frequency: 0.02, tipMod: 0.9 },
  { id: 'influencer', name: 'Influencer', icon: '📱', spendMod: 0.8, frequency: 0.05, tipMod: 0.7 },
  { id: 'difficult', name: 'Difficult Guest', icon: '😤', spendMod: 1.1, frequency: 0.08, tipMod: 0.5 },
  { id: 'big_spender', name: 'Big Spender', icon: '💰', spendMod: 1.8, frequency: 0.05, tipMod: 1.5 },
  { id: 'date_night', name: 'Date Night', icon: '💕', spendMod: 1.4, frequency: 0.10, tipMod: 1.2 },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', spendMod: 1.3, frequency: 0.10, tipMod: 1.0 },
  { id: 'business', name: 'Business Lunch', icon: '💼', spendMod: 1.5, frequency: 0.05, tipMod: 1.3 },
];

// ============================================
// ACHIEVEMENTS & GOALS
// ============================================
const ACHIEVEMENTS = {
  // Survival
  first_week: { name: 'First Week', desc: 'Survive week 1', icon: '📅', category: 'survival', points: 10 },
  first_month: { name: 'First Month', desc: 'Survive 4 weeks', icon: '🗓️', category: 'survival', points: 25 },
  three_months: { name: 'Quarter', desc: 'Survive 13 weeks', icon: '📊', category: 'survival', points: 50 },
  six_months: { name: 'Halfway', desc: 'Survive 26 weeks', icon: '⏳', category: 'survival', points: 100 },
  survivor: { name: 'Survivor', desc: 'Survive 52 weeks', icon: '🏆', category: 'survival', points: 250 },
  two_years: { name: 'Veteran', desc: 'Survive 104 weeks', icon: '🎖️', category: 'survival', points: 500 },
  // Financial
  first_profit: { name: 'In The Black', desc: 'First profitable week', icon: '💚', category: 'financial', points: 25 },
  profit_streak: { name: 'Hot Streak', desc: '10 profitable weeks in a row', icon: '🔥', category: 'financial', points: 100 },
  fifty_k: { name: 'Cushion', desc: 'Reach $50K cash', icon: '💰', category: 'financial', points: 75 },
  hundred_k: { name: 'Six Figures', desc: 'Reach $100K cash', icon: '🤑', category: 'financial', points: 150 },
  quarter_mil: { name: 'Wealthy', desc: 'Reach $250K cash', icon: '💎', category: 'financial', points: 250 },
  millionaire: { name: 'Millionaire', desc: 'Reach $1M cash', icon: '🏰', category: 'financial', points: 500 },
  debt_free: { name: 'Debt Free', desc: 'Pay off all loans', icon: '🆓', category: 'financial', points: 100 },
  // Staff
  first_hire: { name: 'First Hire', desc: 'Hire your first employee', icon: '🤝', category: 'staff', points: 15 },
  full_team: { name: 'Full House', desc: 'Have 10+ staff', icon: '👥', category: 'staff', points: 75 },
  dream_team: { name: 'Dream Team', desc: 'All staff skill 7+', icon: '⭐', category: 'staff', points: 200 },
  loyalty: { name: 'Loyalty', desc: 'Keep an employee 52 weeks', icon: '💍', category: 'staff', points: 100 },
  trainer: { name: 'Trainer', desc: 'Train 5 employees', icon: '📚', category: 'staff', points: 50 },
  // Empire
  second_location: { name: 'Expansion', desc: 'Open second location', icon: '🏪', category: 'empire', points: 300 },
  three_locations: { name: 'Chain', desc: 'Own 3 locations', icon: '🔗', category: 'empire', points: 400 },
  five_locations: { name: 'Regional Power', desc: 'Own 5 locations', icon: '🗺️', category: 'empire', points: 600 },
  ten_locations: { name: 'Empire', desc: 'Own 10 locations', icon: '👑', category: 'empire', points: 1000 },
  first_franchise: { name: 'Franchisor', desc: 'Sell first franchise', icon: '🤝', category: 'empire', points: 400 },
  franchise_five: { name: 'Franchise Network', desc: 'Have 5 franchises', icon: '🌐', category: 'empire', points: 600 },
  franchise_ten: { name: 'Franchise Empire', desc: 'Have 10 franchises', icon: '🏛️', category: 'empire', points: 1000 },
  million_valuation: { name: 'Millionaire (Valuation)', desc: 'Empire worth $1M', icon: '💎', category: 'empire', points: 500 },
  five_million: { name: 'Multi-Millionaire', desc: 'Empire worth $5M', icon: '🏆', category: 'empire', points: 800 },
  ten_million: { name: 'Mogul', desc: 'Empire worth $10M', icon: '👑', category: 'empire', points: 1000 },
  // Operations
  menu_master: { name: 'Menu Master', desc: 'Have 15 menu items', icon: '📋', category: 'operations', points: 50 },
  fully_equipped: { name: 'Fully Equipped', desc: 'Own 5+ equipment', icon: '⚙️', category: 'operations', points: 75 },
  delivery_king: { name: 'Delivery King', desc: 'Enable all delivery platforms', icon: '🛵', category: 'operations', points: 75 },
  virtual_mogul: { name: 'Virtual Mogul', desc: 'Run 3 virtual brands', icon: '👻', category: 'operations', points: 150 },
  clean_kitchen: { name: 'Clean Kitchen', desc: 'Pass health inspection', icon: '🛡️', category: 'operations', points: 50 },
};

const GOALS = [
  { id: 'survive', name: 'Survival', desc: 'Keep the doors open for 1 year', target: { weeks: 52 }, difficulty: 'Normal' },
  { id: 'profit', name: 'Profitability', desc: 'Build $100K in cash reserves', target: { cash: 100000 }, difficulty: 'Hard' },
  { id: 'empire', name: 'Empire Builder', desc: 'Own 5 locations', target: { locations: 5 }, difficulty: 'Expert' },
  { id: 'franchise', name: 'Franchise King', desc: 'Have 10 total units (owned + franchised)', target: { totalUnits: 10 }, difficulty: 'Expert' },
  { id: 'valuation', name: 'Exit Ready', desc: 'Build a $5M empire valuation', target: { valuation: 5000000 }, difficulty: 'Master' },
  { id: 'legacy', name: 'Legacy', desc: 'Build a $10M empire with 20+ units', target: { valuation: 10000000, totalUnits: 20 }, difficulty: 'Legendary' },
  { id: 'sandbox', name: 'Sandbox', desc: 'No win condition - just play', target: {}, difficulty: 'Zen' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateName = () => {
  const first = ['Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Jamie', 'Quinn', 'Avery', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jesse', 'Kai', 'Logan', 'Marley', 'Noah', 'Parker', 'Reese', 'Sage', 'Tatum'];
  return first[Math.floor(Math.random() * first.length)];
};

const generateMenuItem = (cuisine) => {
  const items = {
    burgers: ['Classic Smash', 'Bacon Double', 'Mushroom Swiss', 'BBQ Bacon', 'Veggie Burger', 'Patty Melt', 'Western Burger', 'Jalapeño Popper'],
    mexican: ['Street Tacos', 'Burrito Bowl', 'Quesadilla Grande', 'Enchiladas Verdes', 'Nachos Supreme', 'Carnitas Plate', 'Fish Tacos', 'Birria Tacos'],
    pizza: ['Margherita', 'Pepperoni', 'Supreme', 'White Pizza', 'Meat Lovers', 'Hawaiian', 'Buffalo Chicken', 'Veggie Deluxe'],
    default: ['House Special', 'Chef\'s Choice', 'Daily Feature', 'Signature Dish', 'Classic Favorite', 'Popular Pick', 'Customer Fave', 'Must Try'],
  };
  const list = items[cuisine] || items.default;
  return list[Math.floor(Math.random() * list.length)];
};

const generateLocationName = (market, type) => {
  const prefixes = ['Downtown', 'Midtown', 'Uptown', 'East Side', 'West End', 'North Point', 'South Gate', 'Central', 'Harbor', 'Park'];
  const suffixes = ['Plaza', 'Square', 'Center', 'Corner', 'Station', 'Point', 'Place', 'Commons', 'Village', 'District'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const calculateLocationValuation = (location, cuisine) => {
  const annualRevenue = (location.totalRevenue / Math.max(1, location.weeksOpen)) * 52;
  const revenueMult = location.reputation > 80 ? 3 : location.reputation > 60 ? 2.5 : 2;
  const equipmentValue = location.equipment.length * 3000;
  const upgradeValue = location.upgrades.reduce((sum, u) => sum + (UPGRADES.find(up => up.id === u)?.cost || 0) * 0.5, 0);
  return Math.round(annualRevenue * revenueMult + equipmentValue + upgradeValue);
};

const calculateEmpireValuation = (game, setup) => {
  let total = 0;
  
  // Owned locations
  if (game.locations) {
    game.locations.forEach(loc => {
      total += calculateLocationValuation(loc, setup.cuisine);
      total += loc.cash;
    });
  }
  
  // Franchise value (royalty stream)
  if (game.franchises) {
    game.franchises.forEach(f => {
      const annualRoyalty = f.weeklyRoyalty * 52;
      total += annualRoyalty * 5; // 5x royalty multiple
    });
  }
  
  // Brand value multiplier based on total units
  const totalUnits = (game.locations?.length || 0) + (game.franchises?.length || 0);
  const brandMultiplier = totalUnits > 20 ? 1.5 : totalUnits > 10 ? 1.3 : totalUnits > 5 ? 1.15 : 1;
  
  return Math.round(total * brandMultiplier);
};

// Mini Chart Component
const MiniChart = ({ data, color, height = 40 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(Math.abs), 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 8 }}>
      {data.slice(-12).map((v, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: v >= 0 ? color : colors.accent, height: Math.max(2, ((v - min) / range) * height), borderRadius: 2 }} />
      ))}
    </View>
  );
};

// Create new location object
const createLocation = (id, name, locationType, market, cuisine, startingCash) => {
  const type = LOCATION_TYPES.find(t => t.id === locationType);
  const mkt = MARKETS.find(m => m.id === market);
  const cuisineData = CUISINES.find(c => c.id === cuisine);
  
  return {
    id,
    name,
    locationType,
    market,
    isGhostKitchen: type?.deliveryOnly || false,
    
    // Financials
    cash: startingCash,
    totalRevenue: 0,
    totalProfit: 0,
    weeklyHistory: [],
    
    // Operations
    staff: [],
    menu: [{ id: Date.now(), name: generateMenuItem(cuisine), price: cuisineData.avgTicket, cost: cuisineData.avgTicket * cuisineData.foodCost, popular: true, is86d: false }],
    equipment: [],
    upgrades: [],
    marketing: { channels: ['social_organic'], socialFollowers: 50 },
    delivery: { platforms: [], orders: 0 },
    virtualBrands: [],
    
    // Metrics
    reputation: 50,
    morale: 70,
    covers: Math.floor(30 * (type?.trafficMod || 1)),
    weeksOpen: 0,
    
    // Manager
    manager: null,
    managerAutonomy: 0.5, // 0-1, how much AI decides for this location
    
    // Costs
    rent: Math.floor(3000 * (type?.rentMod || 1)),
    avgTicket: cuisineData.avgTicket,
    foodCostPct: cuisineData.foodCost,
    
    // Last week
    lastWeekRevenue: 0,
    lastWeekProfit: 0,
    lastWeekCovers: 0,
  };
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  // Screen State
  const [screen, setScreen] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Setup State
  const [setup, setSetup] = useState({
    cuisine: null,
    capital: 75000,
    name: '',
    location: 'urban_neighborhood',
    market: 'same_city',
    goal: 'survive',
    experience: 'none',
  });
  
  // Game State
  const [game, setGame] = useState(null);
  
  // Active Location (for multi-location management)
  const [activeLocationId, setActiveLocationId] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [scenario, setScenario] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Modal State
  const [cuisineModal, setCuisineModal] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [staffModal, setStaffModal] = useState(false);
  const [trainingModal, setTrainingModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [marketingModal, setMarketingModal] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [loanModal, setLoanModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [aiChatModal, setAiChatModal] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [expansionModal, setExpansionModal] = useState(false);
  const [franchiseModal, setFranchiseModal] = useState(false);
  const [empireModal, setEmpireModal] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: '', type: 'suburban_strip', market: 'same_city' });
  
  // Save State
  const [savedGames, setSavedGames] = useState([]);

  // Get active location
  const getActiveLocation = useCallback(() => {
    if (!game || !game.locations) return null;
    return game.locations.find(l => l.id === activeLocationId) || game.locations[0];
  }, [game, activeLocationId]);

  // Initialize Game
  const initGame = useCallback(() => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const locationType = LOCATION_TYPES.find(t => t.id === setup.location);
    
    const firstLocation = createLocation(
      1,
      setup.name || `${cuisine.name} - Original`,
      setup.location,
      setup.market,
      setup.cuisine,
      setup.capital * 0.7 // 70% goes to first location, 30% reserve
    );
    
    firstLocation.staff = [
      { id: 1, name: generateName(), role: 'Line Cook', wage: 16, skill: 5, weeks: 0, training: [], morale: 70, icon: '👨‍🍳', department: 'kitchen' }
    ];
    
    const initialGame = {
      week: 0,
      
      // Empire-level
      locations: [firstLocation],
      franchises: [],
      corporateStaff: [],
      
      // Finances
      corporateCash: setup.capital * 0.3, // 30% corporate reserve
      totalRevenue: 0,
      totalProfit: 0,
      loans: [],
      equity: 100,
      
      // Empire metrics
      empireValuation: setup.capital,
      brandStrength: 50,
      
      // Progress
      achievements: ['first_week'],
      scenariosSeen: [],
      profitStreak: 0,
      
      // Owner
      burnout: 0,
      ownerHours: 65,
      
      // Franchise system
      franchiseEnabled: false,
      franchiseFee: 35000,
      royaltyRate: 0.05,
    };
    
    setGame(initialGame);
    setActiveLocationId(1);
    setScreen('dashboard');
    
    // Initial AI greeting
    setTimeout(async () => {
      setAiLoading(true);
      const response = await getAIMentorResponse('Player just opened their first restaurant. Give encouraging but realistic opening advice.', initialGame, setup);
      setAiMessage(response);
      setAiLoading(false);
    }, 500);
  }, [setup]);

  // ============================================
  // LOCATION PROCESSING
  // ============================================
  const processLocationWeek = useCallback((location, cuisine) => {
    const type = LOCATION_TYPES.find(t => t.id === location.locationType);
    
    // Calculate modifiers
    const equipCapacityMod = location.equipment.reduce((sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.effect?.capacity || 0), 0);
    const upgradeCapacityMod = location.upgrades.reduce((sum, u) => sum + (UPGRADES.find(up => up.id === u)?.effect?.capacity || 0), 0);
    const marketingReachMod = location.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.effect?.reach || 0), 0);
    const staffQualityMod = location.staff.length > 0 ? location.staff.reduce((sum, s) => sum + s.skill, 0) / location.staff.length / 20 : 0;
    const moraleMod = (location.morale - 50) / 200;
    const managerBonus = location.manager ? location.manager.skill * 0.02 : 0;
    
    // Covers calculation
    let weekCovers = location.isGhostKitchen ? 0 : Math.floor(location.covers * (type?.trafficMod || 1));
    weekCovers = Math.floor(weekCovers * (1 + equipCapacityMod + upgradeCapacityMod + marketingReachMod + staffQualityMod + managerBonus));
    weekCovers = Math.floor(weekCovers * (1 + location.reputation / 200));
    weekCovers = Math.floor(weekCovers * (1 + moraleMod));
    weekCovers = Math.floor(weekCovers * (0.85 + Math.random() * 0.3));
    
    // Revenue calculation
    let totalSpend = 0;
    for (let i = 0; i < weekCovers; i++) {
      const rand = Math.random();
      let cumulative = 0;
      let type = CUSTOMER_TYPES[0];
      for (const ct of CUSTOMER_TYPES) {
        cumulative += ct.frequency;
        if (rand <= cumulative) { type = ct; break; }
      }
      totalSpend += location.avgTicket * type.spendMod * (0.9 + Math.random() * 0.2);
    }
    
    const dineInRevenue = totalSpend;
    
    // Delivery revenue
    const deliveryOrders = location.delivery.platforms.length > 0 ? Math.floor((location.isGhostKitchen ? 80 : weekCovers * 0.25) * location.delivery.platforms.length / 3) : 0;
    const avgCommission = location.delivery.platforms.length > 0 
      ? location.delivery.platforms.reduce((sum, p) => sum + (DELIVERY_PLATFORMS.find(dp => dp.id === p)?.commission || 0.25), 0) / location.delivery.platforms.length 
      : 0;
    const deliveryRevenue = deliveryOrders * location.avgTicket * (1 - avgCommission);
    
    // Virtual brand revenue
    const virtualBrandRevenue = location.virtualBrands.reduce((sum, vb) => {
      const brand = VIRTUAL_BRANDS.find(v => v.id === vb);
      if (!brand) return sum;
      const orders = Math.floor(15 + Math.random() * 20);
      return sum + orders * brand.avgTicket * 0.70;
    }, 0);
    
    // Bar revenue
    const barRevenue = location.upgrades.includes('bar') ? weekCovers * 8 * (0.3 + Math.random() * 0.4) : 0;
    
    const totalRevenue = dineInRevenue + deliveryRevenue + virtualBrandRevenue + barRevenue;
    
    // Costs
    const foodCost = totalRevenue * location.foodCostPct;
    const laborCost = location.staff.reduce((sum, s) => sum + s.wage * 40, 0);
    const rent = location.rent;
    const utilities = Math.floor(rent * 0.15);
    const marketingCost = location.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.costPerWeek || 0), 0);
    const equipmentMaint = location.equipment.reduce((sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.maintenance || 0), 0) / 4;
    const ccFees = totalRevenue * 0.025;
    
    const totalCosts = foodCost + laborCost + rent + utilities + marketingCost + equipmentMaint + ccFees;
    const weekProfit = totalRevenue - totalCosts;
    
    // Update staff
    const updatedStaff = location.staff.map(s => {
      let newMorale = s.morale;
      if (weekProfit > 0) newMorale += 2;
      if (weekProfit < -1000) newMorale -= 5;
      newMorale = Math.max(20, Math.min(100, newMorale + (Math.random() - 0.5) * 5));
      const skillGain = s.weeks > 0 && s.weeks % 8 === 0 && s.skill < 10 ? 0.5 : 0;
      return { ...s, weeks: s.weeks + 1, morale: Math.round(newMorale), skill: Math.min(10, s.skill + skillGain) };
    }).filter(s => !(s.morale < 30 && Math.random() < 0.3)); // Staff quits
    
    const avgMorale = updatedStaff.length > 0 ? updatedStaff.reduce((sum, s) => sum + s.morale, 0) / updatedStaff.length : 50;
    
    // Update history
    const newHistory = [...location.weeklyHistory, { 
      week: location.weeksOpen + 1, 
      revenue: totalRevenue, 
      profit: weekProfit, 
      covers: weekCovers + deliveryOrders,
    }].slice(-52);
    
    return {
      ...location,
      cash: location.cash + weekProfit,
      totalRevenue: location.totalRevenue + totalRevenue,
      totalProfit: location.totalProfit + weekProfit,
      lastWeekRevenue: totalRevenue,
      lastWeekProfit: weekProfit,
      lastWeekCovers: weekCovers + deliveryOrders,
      staff: updatedStaff,
      morale: Math.round(avgMorale),
      weeksOpen: location.weeksOpen + 1,
      weeklyHistory: newHistory,
      reputation: Math.min(100, Math.max(0, location.reputation + (weekProfit > 0 ? 1 : -1))),
      delivery: { ...location.delivery, orders: location.delivery.orders + deliveryOrders },
    };
  }, []);

  // ============================================
  // MAIN WEEK PROCESSING
  // ============================================
  const processWeek = useCallback(async () => {
    if (!game) return;
    
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    
    setGame(g => {
      // Process all locations
      const updatedLocations = g.locations.map(loc => processLocationWeek(loc, cuisine));
      
      // Calculate empire totals
      const totalLocationCash = updatedLocations.reduce((sum, l) => sum + l.cash, 0);
      const totalWeekRevenue = updatedLocations.reduce((sum, l) => sum + l.lastWeekRevenue, 0);
      const totalWeekProfit = updatedLocations.reduce((sum, l) => sum + l.lastWeekProfit, 0);
      
      // Process franchise royalties
      const franchiseRoyalties = g.franchises.reduce((sum, f) => sum + f.weeklyRoyalty, 0);
      
      // Loan payments from corporate
      const loanPayments = g.loans.reduce((sum, l) => {
        const loan = LOANS.find(lo => lo.id === l.type);
        return sum + (loan?.weeklyPayment || 0);
      }, 0);
      
      // Corporate costs (management, district managers, etc)
      const corporateCosts = g.corporateStaff.reduce((sum, s) => sum + s.wage * 40, 0);
      const marketCosts = g.locations.reduce((sum, l) => {
        const mkt = MARKETS.find(m => m.id === l.market);
        return sum + (mkt?.managementCost || 0);
      }, 0);
      
      // Update corporate cash
      const newCorporateCash = g.corporateCash + franchiseRoyalties - loanPayments - corporateCosts - marketCosts;
      
      // Calculate empire valuation
      const empireValuation = calculateEmpireValuation({ ...g, locations: updatedLocations }, setup);
      
      // Update achievements
      const newAchievements = [...g.achievements];
      const weekNum = g.week + 1;
      const totalLocations = updatedLocations.length;
      const totalFranchises = g.franchises.length;
      const totalUnits = totalLocations + totalFranchises;
      
      if (weekNum >= 4 && !newAchievements.includes('first_month')) newAchievements.push('first_month');
      if (weekNum >= 13 && !newAchievements.includes('three_months')) newAchievements.push('three_months');
      if (weekNum >= 26 && !newAchievements.includes('six_months')) newAchievements.push('six_months');
      if (weekNum >= 52 && !newAchievements.includes('survivor')) newAchievements.push('survivor');
      if (weekNum >= 104 && !newAchievements.includes('two_years')) newAchievements.push('two_years');
      if (totalWeekProfit > 0 && !newAchievements.includes('first_profit')) newAchievements.push('first_profit');
      if (totalLocations >= 2 && !newAchievements.includes('second_location')) newAchievements.push('second_location');
      if (totalLocations >= 3 && !newAchievements.includes('three_locations')) newAchievements.push('three_locations');
      if (totalLocations >= 5 && !newAchievements.includes('five_locations')) newAchievements.push('five_locations');
      if (totalLocations >= 10 && !newAchievements.includes('ten_locations')) newAchievements.push('ten_locations');
      if (totalFranchises >= 1 && !newAchievements.includes('first_franchise')) newAchievements.push('first_franchise');
      if (totalFranchises >= 5 && !newAchievements.includes('franchise_five')) newAchievements.push('franchise_five');
      if (totalFranchises >= 10 && !newAchievements.includes('franchise_ten')) newAchievements.push('franchise_ten');
      if (empireValuation >= 1000000 && !newAchievements.includes('million_valuation')) newAchievements.push('million_valuation');
      if (empireValuation >= 5000000 && !newAchievements.includes('five_million')) newAchievements.push('five_million');
      if (empireValuation >= 10000000 && !newAchievements.includes('ten_million')) newAchievements.push('ten_million');
      
      // Check for scenarios
      const allScenarios = [...SCENARIOS, ...EMPIRE_SCENARIOS];
      const availableScenarios = allScenarios.filter(s => {
        if (g.scenariosSeen.includes(s.id)) return false;
        if (s.minWeek && weekNum < s.minWeek) return false;
        if (s.minCash && totalLocationCash + newCorporateCash < s.minCash) return false;
        if (s.minLocations && totalLocations < s.minLocations) return false;
        if (s.maxLocations && totalLocations > s.maxLocations) return false;
        if (s.minFranchises && totalFranchises < s.minFranchises) return false;
        if (s.minReputation && updatedLocations[0].reputation < s.minReputation) return false;
        if (s.minValuation && empireValuation < s.minValuation) return false;
        return true;
      });
      
      if (Math.random() < 0.15 && availableScenarios.length > 0 && weekNum > 1) {
        const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
        setTimeout(() => setScenario(randomScenario), 500);
      }
      
      // Check game end conditions
      const lowestCash = Math.min(...updatedLocations.map(l => l.cash), newCorporateCash);
      if (lowestCash < -50000) {
        setTimeout(() => setScreen('gameover'), 100);
      }
      
      // Check win conditions
      const goal = GOALS.find(gl => gl.id === setup.goal);
      if (goal && goal.id !== 'sandbox') {
        if (goal.target.weeks && weekNum >= goal.target.weeks) setTimeout(() => setScreen('win'), 100);
        if (goal.target.cash && totalLocationCash + newCorporateCash >= goal.target.cash) setTimeout(() => setScreen('win'), 100);
        if (goal.target.locations && totalLocations >= goal.target.locations) setTimeout(() => setScreen('win'), 100);
        if (goal.target.totalUnits && totalUnits >= goal.target.totalUnits) setTimeout(() => setScreen('win'), 100);
        if (goal.target.valuation && empireValuation >= goal.target.valuation) setTimeout(() => setScreen('win'), 100);
      }
      
      // Update owner burnout
      const locationsWithoutManagers = updatedLocations.filter(l => !l.manager).length;
      const burnoutChange = locationsWithoutManagers > 1 ? 8 : locationsWithoutManagers === 1 ? 3 : -2;
      
      return {
        ...g,
        week: weekNum,
        locations: updatedLocations,
        corporateCash: newCorporateCash,
        totalRevenue: g.totalRevenue + totalWeekRevenue,
        totalProfit: g.totalProfit + totalWeekProfit,
        empireValuation,
        achievements: newAchievements,
        profitStreak: totalWeekProfit > 0 ? g.profitStreak + 1 : 0,
        burnout: Math.min(100, Math.max(0, g.burnout + burnoutChange)),
      };
    });
    
    // Get AI commentary
    setTimeout(async () => {
      if (game) {
        setAiLoading(true);
        const totalLocations = game.locations?.length || 1;
        const context = totalLocations > 1 
          ? `Empire weekly summary - ${totalLocations} locations. Give brief multi-unit perspective.`
          : game.locations?.[0]?.lastWeekProfit > 0 
            ? 'Weekly summary - profitable week.'
            : 'Weekly summary - lost money this week.';
        const response = await getAIMentorResponse(context, game, setup);
        setAiMessage(response);
        setAiLoading(false);
      }
    }, 800);
  }, [game, setup, processLocationWeek]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
  
  const hireStaff = (template, locationId = null) => {
    const loc = locationId ? game.locations.find(l => l.id === locationId) : getActiveLocation();
    if (!loc || loc.cash < template.wage * 40) return;
    
    const newStaff = {
      id: Date.now(),
      name: generateName(),
      role: template.role,
      wage: template.wage,
      skill: 3 + Math.floor(Math.random() * 3),
      weeks: 0,
      training: [],
      morale: 65 + Math.floor(Math.random() * 20),
      icon: template.icon,
      department: template.department,
      canManage: template.canManage || false,
      canManageMultiple: template.canManageMultiple || false,
    };
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        cash: l.cash - template.wage * 40,
        staff: [...l.staff, newStaff],
      } : l),
      achievements: g.achievements.includes('first_hire') ? g.achievements : [...g.achievements, 'first_hire'],
    }));
    setStaffModal(false);
  };

  const hireCorporateStaff = (template) => {
    if (!game || game.corporateCash < template.wage * 40) return;
    
    const newStaff = {
      id: Date.now(),
      name: generateName(),
      role: template.role,
      wage: template.wage,
      skill: 5 + Math.floor(Math.random() * 3),
      weeks: 0,
      training: [],
      morale: 70,
      icon: template.icon,
      department: template.department,
      canManageMultiple: template.canManageMultiple || false,
    };
    
    setGame(g => ({
      ...g,
      corporateCash: g.corporateCash - template.wage * 40,
      corporateStaff: [...g.corporateStaff, newStaff],
    }));
  };

  const fireStaff = (staffId, locationId = null) => {
    const loc = locationId ? game.locations.find(l => l.id === locationId) : getActiveLocation();
    if (!loc) return;
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        staff: l.staff.filter(s => s.id !== staffId),
        morale: Math.max(30, l.morale - 10),
        manager: l.manager?.id === staffId ? null : l.manager,
      } : l),
    }));
  };

  const promoteToManager = (staffId, locationId = null) => {
    const loc = locationId ? game.locations.find(l => l.id === locationId) : getActiveLocation();
    if (!loc) return;
    
    const staff = loc.staff.find(s => s.id === staffId);
    if (!staff || !staff.canManage) return;
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        manager: staff,
        staff: l.staff.map(s => s.id === staffId ? { ...s, wage: s.wage + 5, morale: Math.min(100, s.morale + 20) } : s),
      } : l),
    }));
  };

  const startTraining = (program) => {
    if (!selectedStaff || !game) return;
    const loc = getActiveLocation();
    if (!loc || loc.cash < program.cost) return;
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        cash: l.cash - program.cost,
        staff: l.staff.map(s => s.id === selectedStaff.id ? {
          ...s,
          training: [...s.training, program.id],
          skill: Math.min(10, s.skill + program.skillBoost),
          morale: Math.min(100, s.morale + program.morale),
          canManage: program.id === 'management' || program.id === 'multi_unit' ? true : s.canManage,
        } : s),
      } : l),
    }));
    setTrainingModal(false);
    setSelectedStaff(null);
  };

  const addMenuItem = () => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const loc = getActiveLocation();
    if (!cuisine || !loc) return;
    
    const priceVariance = 0.7 + Math.random() * 0.6;
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        menu: [...l.menu, {
          id: Date.now(),
          name: generateMenuItem(setup.cuisine),
          price: Math.round(cuisine.avgTicket * priceVariance * 100) / 100,
          cost: cuisine.avgTicket * cuisine.foodCost * priceVariance,
          popular: Math.random() > 0.7,
          is86d: false,
        }],
      } : l),
    }));
  };

  const toggle86 = (itemId) => {
    const loc = getActiveLocation();
    if (!loc) return;
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        menu: l.menu.map(m => m.id === itemId ? { ...m, is86d: !m.is86d } : m),
      } : l),
    }));
  };

  const buyEquipment = (eq) => {
    const loc = getActiveLocation();
    if (!loc || loc.cash < eq.cost || loc.equipment.includes(eq.id)) return;
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        cash: l.cash - eq.cost,
        equipment: [...l.equipment, eq.id],
      } : l),
    }));
  };

  const buyUpgrade = (up) => {
    const loc = getActiveLocation();
    if (!loc || loc.cash < up.cost || loc.upgrades.includes(up.id)) return;
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        cash: l.cash - up.cost,
        upgrades: [...l.upgrades, up.id],
        reputation: l.reputation + (up.effect.reputation || 0),
      } : l),
    }));
  };

  const toggleMarketingChannel = (channelId) => {
    const loc = getActiveLocation();
    if (!loc) return;
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        marketing: {
          ...l.marketing,
          channels: l.marketing.channels.includes(channelId)
            ? l.marketing.channels.filter(c => c !== channelId)
            : [...l.marketing.channels, channelId],
        },
      } : l),
    }));
  };

  const toggleDeliveryPlatform = (platformId) => {
    const platform = DELIVERY_PLATFORMS.find(p => p.id === platformId);
    const loc = getActiveLocation();
    if (!platform || !loc) return;
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => {
        if (l.id !== loc.id) return l;
        const isActive = l.delivery.platforms.includes(platformId);
        if (isActive) {
          return { ...l, delivery: { ...l.delivery, platforms: l.delivery.platforms.filter(p => p !== platformId) } };
        } else if (l.cash >= platform.setup) {
          return { ...l, cash: l.cash - platform.setup, delivery: { ...l.delivery, platforms: [...l.delivery.platforms, platformId] } };
        }
        return l;
      }),
    }));
  };

  const launchVirtualBrand = (brandId) => {
    const brand = VIRTUAL_BRANDS.find(b => b.id === brandId);
    const loc = getActiveLocation();
    if (!loc || !brand || loc.virtualBrands.includes(brandId) || loc.cash < brand.setupCost) return;
    
    setGame(g => ({
      ...g,
      locations: g.locations.map(l => l.id === loc.id ? {
        ...l,
        cash: l.cash - brand.setupCost,
        virtualBrands: [...l.virtualBrands, brandId],
      } : l),
    }));
  };

  const takeLoan = (loanId) => {
    const loan = LOANS.find(l => l.id === loanId);
    if (!loan || !game) return;
    setGame(g => ({
      ...g,
      corporateCash: g.corporateCash + loan.amount,
      loans: [...g.loans, { type: loanId, remaining: loan.term, principal: loan.amount }],
      equity: g.equity - (loan.equity || 0),
    }));
    setLoanModal(false);
  };

  // ============================================
  // EXPANSION & FRANCHISE HANDLERS
  // ============================================
  
  const openNewLocation = () => {
    const type = LOCATION_TYPES.find(t => t.id === newLocationData.type);
    const mkt = MARKETS.find(m => m.id === newLocationData.market);
    
    if (!type || !mkt || !game) return;
    
    const totalCost = type.buildoutCost;
    if (game.corporateCash < totalCost) {
      alert('Not enough corporate cash for buildout!');
      return;
    }
    
    const newId = Math.max(...game.locations.map(l => l.id)) + 1;
    const newLocation = createLocation(
      newId,
      newLocationData.name || generateLocationName(newLocationData.market, newLocationData.type),
      newLocationData.type,
      newLocationData.market,
      setup.cuisine,
      totalCost * 0.3 // Starting operating cash
    );
    
    setGame(g => ({
      ...g,
      corporateCash: g.corporateCash - totalCost,
      locations: [...g.locations, newLocation],
    }));
    
    setExpansionModal(false);
    setNewLocationData({ name: '', type: 'suburban_strip', market: 'same_city' });
    
    // AI response
    setTimeout(async () => {
      setAiLoading(true);
      const response = await getAIMentorResponse(`Player just opened location #${newId}. This is a ${type.name} in a ${mkt.name} market. Give expansion advice.`, game, setup);
      setAiMessage(response);
      setAiLoading(false);
    }, 500);
  };

  const enableFranchising = () => {
    if (!game || game.locations.length < 3) {
      alert('Need at least 3 successful locations before franchising');
      return;
    }
    if (game.corporateCash < 50000) {
      alert('Need $50K for franchise system setup');
      return;
    }
    
    setGame(g => ({
      ...g,
      corporateCash: g.corporateCash - 50000,
      franchiseEnabled: true,
    }));
  };

  const sellFranchise = (tier) => {
    const franchiseTier = FRANCHISE_TIERS.find(t => t.id === tier);
    if (!franchiseTier || !game || !game.franchiseEnabled) return;
    
    const avgLocationRevenue = game.locations.reduce((sum, l) => sum + (l.totalRevenue / Math.max(1, l.weeksOpen)), 0) / game.locations.length;
    const weeklyRoyalty = avgLocationRevenue * franchiseTier.royalty;
    
    const newFranchise = {
      id: Date.now(),
      tier: tier,
      name: `Franchisee ${game.franchises.length + 1}`,
      weeklyRoyalty,
      weeksActive: 0,
      performance: 0.8 + Math.random() * 0.4, // 80-120% performance vs company average
      quality: 70 + Math.floor(Math.random() * 20),
    };
    
    setGame(g => ({
      ...g,
      corporateCash: g.corporateCash + franchiseTier.fee,
      franchises: [...g.franchises, newFranchise],
    }));
    
    setFranchiseModal(false);
  };

  const handleScenarioChoice = async (option) => {
    const success = Math.random() <= option.successChance;
    const outcome = success ? option.success : option.fail;
    setScenarioResult({ success, outcome });
    
    setGame(g => {
      let updated = { ...g, scenariosSeen: [...g.scenariosSeen, scenario.id] };
      
      // Handle empire-wide effects
      if (outcome.allLocations) {
        updated.locations = updated.locations.map(l => {
          let loc = { ...l };
          if (outcome.reputation) loc.reputation = Math.min(100, Math.max(0, loc.reputation + outcome.reputation));
          if (outcome.morale) loc.morale = Math.min(100, Math.max(0, loc.morale + outcome.morale));
          if (outcome.covers) loc.covers += outcome.covers;
          if (outcome.foodCostMod) loc.foodCostPct += outcome.foodCostMod;
          if (outcome.laborCostMod) {
            loc.staff = loc.staff.map(s => ({ ...s, wage: Math.round(s.wage * (1 + outcome.laborCostMod)) }));
          }
          return loc;
        });
      }
      
      // Handle single location effects
      if (!outcome.allLocations) {
        const loc = getActiveLocation();
        if (loc) {
          updated.locations = updated.locations.map(l => {
            if (l.id !== loc.id) return l;
            let newLoc = { ...l };
            if (outcome.cash) newLoc.cash += outcome.cash;
            if (outcome.reputation) newLoc.reputation = Math.min(100, Math.max(0, newLoc.reputation + outcome.reputation));
            if (outcome.morale) newLoc.morale = Math.min(100, Math.max(0, newLoc.morale + outcome.morale));
            if (outcome.burnout) updated.burnout = Math.min(100, Math.max(0, updated.burnout + outcome.burnout));
            if (outcome.covers) newLoc.covers += outcome.covers;
            if (outcome.followers) newLoc.marketing.socialFollowers += outcome.followers;
            return newLoc;
          });
        }
      }
      
      // Corporate cash effects
      if (outcome.cash && outcome.allLocations) {
        updated.corporateCash += outcome.cash;
      }
      
      // Expansion opportunity
      if (outcome.expansionOpportunity) {
        setExpansionModal(true);
      }
      
      // New franchises
      if (outcome.newFranchises) {
        const avgRevenue = updated.locations.reduce((sum, l) => sum + (l.totalRevenue / Math.max(1, l.weeksOpen)), 0) / updated.locations.length;
        for (let i = 0; i < outcome.newFranchises; i++) {
          updated.franchises.push({
            id: Date.now() + i,
            tier: 'area',
            name: `Area Developer ${updated.franchises.length + 1}`,
            weeklyRoyalty: avgRevenue * 0.045,
            weeksActive: 0,
            performance: 0.9 + Math.random() * 0.2,
            quality: 75 + Math.floor(Math.random() * 15),
          });
        }
      }
      
      // Equity changes
      if (outcome.equity) {
        updated.equity += outcome.equity;
      }
      
      // End game conditions
      if (outcome.endGame === 'buyout') {
        setTimeout(() => setScreen('win'), 100);
      }
      
      return updated;
    });
    
    setAiLoading(true);
    const context = `Player faced "${scenario.title}" and ${success ? 'succeeded' : 'failed'}. Give brief commentary.`;
    const response = await getAIMentorResponse(context, game, setup);
    setAiMessage(response);
    setAiLoading(false);
  };

  const closeScenario = () => {
    setScenario(null);
    setScenarioResult(null);
  };

  const askAI = async () => {
    if (!aiChatInput.trim() || !game) return;
    setAiLoading(true);
    const response = await getAIMentorResponse(`Player asks: "${aiChatInput}"`, game, setup);
    setAiMessage(response);
    setAiChatInput('');
    setAiLoading(false);
  };

  const saveGame = (slot) => {
    const save = { slot, date: new Date().toISOString(), setup, game };
    setSavedGames(prev => [...prev.filter(s => s.slot !== slot), save]);
    setSaveModal(false);
  };

  const loadGame = (save) => {
    setSetup(save.setup);
    setGame(save.game);
    setActiveLocationId(save.game.locations[0].id);
    setScreen('dashboard');
    setSaveModal(false);
  };

  const restart = () => {
    setScreen('welcome');
    setOnboardingStep(0);
    setSetup({ cuisine: null, capital: 75000, name: '', location: 'urban_neighborhood', market: 'same_city', goal: 'survive', experience: 'none' });
    setGame(null);
    setScenario(null);
    setScenarioResult(null);
    setAiMessage('');
  };

  // ============================================
  // RENDER - WELCOME SCREEN
  // ============================================
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <View style={styles.welcomeDivider} />
          <Text style={styles.welcomeQuote}>"The restaurant business doesn't care about your dreams."</Text>
          <Text style={styles.welcomeSubtext}>Build your restaurant empire.{'\n'}Learn from an AI mentor.{'\n'}Scale or get 86'd.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setScreen('onboarding')}>
            <Text style={styles.startButtonText}>BUILD YOUR EMPIRE</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v5.0.0 • Phase 3 • Empire Building</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - ONBOARDING
  // ============================================
  if (screen === 'onboarding') {
    const steps = [
      { title: 'Choose Your Cuisine', key: 'cuisine' },
      { title: 'Starting Capital', key: 'capital' },
      { title: 'Name Your Restaurant', key: 'name' },
      { title: 'First Location', key: 'location' },
      { title: 'Set Your Goal', key: 'goal' },
    ];
    const step = steps[onboardingStep];
    const canContinue = step.key === 'cuisine' ? setup.cuisine : step.key === 'name' ? setup.name.length > 0 : true;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.onboardingContainer}>
          <View style={styles.onboardingContent}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${((onboardingStep + 1) / steps.length) * 100}%` }]} />
            </View>
            <Text style={styles.stepText}>STEP {onboardingStep + 1} OF {steps.length}</Text>
            
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {step.key === 'cuisine' && "What type of food will you build your empire on? This affects everything - food costs, average ticket, and complexity."}
                {step.key === 'capital' && "How much are you starting with? This is your war chest - first location plus corporate reserve."}
                {step.key === 'name' && "What's your brand? This will be the foundation of your empire."}
                {step.key === 'location' && "Where will you open your flagship location? This sets the tone for expansion."}
                {step.key === 'goal' && "How big do you want to build? Single location survival or multi-state empire?"}
              </Text>
            </View>

            {step.key === 'cuisine' && (
              <>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setCuisineModal(true)}>
                  {setup.cuisine ? (
                    <Text style={styles.dropdownText}>{CUISINES.find(c => c.id === setup.cuisine)?.icon} {CUISINES.find(c => c.id === setup.cuisine)?.name}</Text>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select cuisine type...</Text>
                  )}
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {setup.cuisine && (
                  <View style={styles.selectedCuisine}>
                    <Text style={styles.selectedIcon}>{CUISINES.find(c => c.id === setup.cuisine)?.icon}</Text>
                    <View>
                      <Text style={styles.selectedName}>{CUISINES.find(c => c.id === setup.cuisine)?.name}</Text>
                      <Text style={styles.selectedStats}>Food Cost: {formatPct(CUISINES.find(c => c.id === setup.cuisine)?.foodCost)} • Avg Ticket: {formatCurrency(CUISINES.find(c => c.id === setup.cuisine)?.avgTicket)}</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {step.key === 'capital' && (
              <>
                <View style={styles.capitalDisplay}>
                  <Text style={[styles.capitalAmount, { color: setup.capital < 75000 ? colors.accent : setup.capital < 150000 ? colors.warning : colors.success }]}>{formatCurrency(setup.capital)}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: setup.capital < 75000 ? colors.accent : setup.capital < 150000 ? colors.warning : setup.capital < 300000 ? colors.success : colors.purple }]}>
                    <Text style={styles.tierText}>{setup.capital < 75000 ? 'BOOTSTRAP' : setup.capital < 150000 ? 'STANDARD' : setup.capital < 300000 ? 'WELL-FUNDED' : 'EMPIRE READY'}</Text>
                  </View>
                  <Text style={styles.tierDesc}>
                    {setup.capital < 75000 && "Tight. One location, no safety net."}
                    {setup.capital >= 75000 && setup.capital < 150000 && "Solid start. Room to breathe."}
                    {setup.capital >= 150000 && setup.capital < 300000 && "Good runway for location #1 + reserve for #2."}
                    {setup.capital >= 300000 && "Ready to scale fast if you execute."}
                  </Text>
                </View>
                <Slider style={styles.slider} minimumValue={50000} maximumValue={500000} step={10000} value={setup.capital} onValueChange={(v) => setSetup(s => ({ ...s, capital: v }))} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.surfaceLight} thumbTintColor={colors.primary} />
                <View style={styles.sliderLabels}><Text style={styles.sliderLabel}>$50K</Text><Text style={styles.sliderLabel}>$500K</Text></View>
              </>
            )}

            {step.key === 'name' && (
              <TextInput style={styles.textInput} placeholder="e.g., The Golden Fork" placeholderTextColor={colors.textMuted} value={setup.name} onChangeText={(t) => setSetup(s => ({ ...s, name: t }))} />
            )}

            {step.key === 'location' && (
              <View style={styles.goalOptions}>
                {LOCATION_TYPES.slice(0, 6).map(loc => (
                  <TouchableOpacity key={loc.id} style={[styles.goalButton, setup.location === loc.id && styles.goalButtonActive]} onPress={() => setSetup(s => ({ ...s, location: loc.id }))}>
                    <Text style={{ fontSize: 24 }}>{loc.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.goalText, setup.location === loc.id && styles.goalTextActive]}>{loc.name}</Text>
                      <Text style={styles.goalDesc}>Rent: {loc.rentMod > 1 ? '+' : ''}{Math.round((loc.rentMod - 1) * 100)}% • Traffic: {loc.trafficMod > 1 ? '+' : ''}{Math.round((loc.trafficMod - 1) * 100)}% • Buildout: {formatCurrency(loc.buildoutCost)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step.key === 'goal' && (
              <View style={styles.goalOptions}>
                {GOALS.map(g => (
                  <TouchableOpacity key={g.id} style={[styles.goalButton, setup.goal === g.id && styles.goalButtonActive]} onPress={() => setSetup(s => ({ ...s, goal: g.id }))}>
                    <Text style={[styles.goalText, setup.goal === g.id && styles.goalTextActive]}>{g.name}</Text>
                    <Text style={styles.goalDesc}>{g.desc} • {g.difficulty}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]} onPress={() => onboardingStep < steps.length - 1 ? setOnboardingStep(s => s + 1) : initGame()} disabled={!canContinue}>
              <Text style={[styles.continueButtonText, !canContinue && styles.continueButtonTextDisabled]}>{onboardingStep < steps.length - 1 ? 'CONTINUE' : 'OPEN YOUR DOORS'}</Text>
            </TouchableOpacity>
            
            {onboardingStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={() => setOnboardingStep(s => s - 1)}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Cuisine Modal */}
        <Modal visible={cuisineModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Cuisine</Text>
                <TouchableOpacity onPress={() => setCuisineModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.searchInput} placeholder="Search cuisines..." placeholderTextColor={colors.textMuted} value={cuisineSearch} onChangeText={setCuisineSearch} />
              <ScrollView style={styles.cuisineList}>
                {CUISINES.filter(c => c.name.toLowerCase().includes(cuisineSearch.toLowerCase())).map(c => (
                  <TouchableOpacity key={c.id} style={[styles.cuisineOption, setup.cuisine === c.id && styles.cuisineOptionSelected]} onPress={() => { setSetup(s => ({ ...s, cuisine: c.id })); setCuisineModal(false); }}>
                    <Text style={styles.cuisineIcon}>{c.icon}</Text>
                    <View style={styles.cuisineInfo}>
                      <Text style={[styles.cuisineName, setup.cuisine === c.id && styles.cuisineNameSelected]}>{c.name}</Text>
                      <Text style={styles.cuisineStats}>Food: {formatPct(c.foodCost)} • Ticket: {formatCurrency(c.avgTicket)} • {c.difficulty}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - SCENARIO
  // ============================================
  if (scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.scenarioContainer}>
          <View style={styles.scenarioContent}>
            <View style={[styles.scenarioTypeBadge, { backgroundColor: scenario.type === 'crisis' ? colors.accent : scenario.type === 'opportunity' ? colors.success : colors.info }]}>
              <Text style={styles.scenarioTypeText}>{scenario.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioSubtitle}>Week {game?.week} • {game?.locations?.length > 1 ? 'Empire-wide' : getActiveLocation()?.name}</Text>
            <View style={styles.scenarioMessageBox}>
              <Text style={styles.scenarioMessage}>{scenario.message}</Text>
            </View>
            
            {!scenarioResult ? (
              scenario.options.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.scenarioOption} onPress={() => handleScenarioChoice(opt)}>
                  <Text style={styles.scenarioOptionText}>{opt.text}</Text>
                  <Text style={styles.scenarioChance}>{Math.round(opt.successChance * 100)}%</Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <View style={styles.scenarioResult}>
                  <Text style={[styles.scenarioResultText, { color: scenarioResult.success ? colors.success : colors.accent }]}>
                    {scenarioResult.success ? '✓ SUCCESS' : '✗ FAILED'}
                  </Text>
                </View>
                <View style={styles.aiCommentBox}>
                  <Text style={styles.aiCommentLabel}>👨‍🍳 Chef Marcus</Text>
                  {aiLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.aiCommentText}>{aiMessage}</Text>}
                </View>
                <View style={styles.lessonBox}>
                  <Text style={styles.lessonLabel}>💡 LESSON</Text>
                  <Text style={styles.lessonText}>{scenario.lesson}</Text>
                </View>
                <TouchableOpacity style={styles.continueButton} onPress={closeScenario}>
                  <Text style={styles.continueButtonText}>CONTINUE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - GAME OVER / WIN
  // ============================================
  if (screen === 'gameover' || screen === 'win') {
    const isWin = screen === 'win';
    const totalUnits = (game?.locations?.length || 0) + (game?.franchises?.length || 0);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.endContainer}>
          <Text style={{ fontSize: 64 }}>{isWin ? '🏆' : '💀'}</Text>
          <Text style={[styles.endTitle, { color: isWin ? colors.success : colors.accent }]}>{isWin ? 'EMPIRE BUILT!' : '86\'d'}</Text>
          <Text style={styles.endSubtitle}>{isWin ? 'You achieved your goal' : 'Your empire has collapsed'}</Text>
          <View style={[styles.endDivider, { backgroundColor: isWin ? colors.success : colors.accent }]} />
          <View style={styles.endStats}>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Weeks</Text><Text style={styles.endStatValue}>{game?.week}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Locations Owned</Text><Text style={styles.endStatValue}>{game?.locations?.length || 0}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Franchises</Text><Text style={styles.endStatValue}>{game?.franchises?.length || 0}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Units</Text><Text style={styles.endStatValue}>{totalUnits}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Empire Valuation</Text><Text style={[styles.endStatValue, { color: colors.success }]}>{formatCurrency(game?.empireValuation || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game?.totalRevenue || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game?.achievements?.length || 0}/{Object.keys(ACHIEVEMENTS).length}</Text></View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={restart}>
            <Text style={styles.restartButtonText}>{isWin ? 'PLAY AGAIN' : 'TRY AGAIN'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - MAIN DASHBOARD
  // ============================================
  if (screen === 'dashboard' && game) {
    const loc = getActiveLocation();
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const totalCash = game.locations.reduce((sum, l) => sum + l.cash, 0) + game.corporateCash;
    const totalUnits = game.locations.length + game.franchises.length;
    const isMultiLocation = game.locations.length > 1;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Empire Header */}
        <View style={styles.empireHeader}>
          <View style={styles.empireHeaderLeft}>
            <Text style={styles.empireName}>{setup.name}</Text>
            <Text style={styles.empireStats}>{totalUnits} Units • Week {game.week}</Text>
          </View>
          <View style={styles.empireHeaderRight}>
            <Text style={styles.empireValuation}>{formatCurrency(game.empireValuation)}</Text>
            <Text style={styles.empireValuationLabel}>Empire Value</Text>
          </View>
        </View>

        {/* Location Selector (if multiple) */}
        {isMultiLocation && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationSelector}>
            <TouchableOpacity 
              style={[styles.locationTab, !activeLocationId && styles.locationTabActive]} 
              onPress={() => setEmpireModal(true)}
            >
              <Text style={styles.locationTabIcon}>🏛️</Text>
              <Text style={[styles.locationTabText, !activeLocationId && styles.locationTabTextActive]}>Empire</Text>
            </TouchableOpacity>
            {game.locations.map(l => (
              <TouchableOpacity 
                key={l.id} 
                style={[styles.locationTab, activeLocationId === l.id && styles.locationTabActive]}
                onPress={() => setActiveLocationId(l.id)}
              >
                <Text style={styles.locationTabIcon}>{LOCATION_TYPES.find(t => t.id === l.locationType)?.icon || '🏪'}</Text>
                <View>
                  <Text style={[styles.locationTabText, activeLocationId === l.id && styles.locationTabTextActive]} numberOfLines={1}>{l.name}</Text>
                  <Text style={styles.locationTabCash}>{formatCurrency(l.cash)}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addLocationTab} onPress={() => setExpansionModal(true)}>
              <Text style={styles.addLocationIcon}>+</Text>
              <Text style={styles.addLocationText}>New</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* AI Message Bar */}
        <TouchableOpacity style={styles.aiBar} onPress={() => setAiChatModal(true)}>
          <Text style={styles.aiBarIcon}>👨‍🍳</Text>
          {aiLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginLeft: 10 }} />
          ) : (
            <Text style={styles.aiBarText} numberOfLines={2}>{aiMessage || 'Tap to chat with Chef Marcus...'}</Text>
          )}
        </TouchableOpacity>

        {/* Warning Banners */}
        {loc && loc.cash < 5000 && (
          <View style={[styles.warningBanner, { backgroundColor: colors.accent }]}>
            <Text style={styles.warningText}>⚠️ LOW CASH at {loc.name} - {formatCurrency(loc.cash)}</Text>
          </View>
        )}
        {game.burnout > 70 && (
          <View style={[styles.warningBanner, { backgroundColor: colors.warning }]}>
            <Text style={styles.warningText}>🔥 HIGH BURNOUT - {game.locations.filter(l => !l.manager).length} locations without managers</Text>
          </View>
        )}

        <ScrollView style={styles.dashboardScroll}>
          {/* Quick Stats */}
          {loc && (
            <View style={styles.quickStats}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Location Cash</Text>
                <Text style={[styles.statValue, { color: loc.cash > 0 ? colors.success : colors.accent }]}>{formatCurrency(loc.cash)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Last Week</Text>
                <Text style={[styles.statValue, { color: loc.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{loc.lastWeekProfit >= 0 ? '+' : ''}{formatCurrency(loc.lastWeekProfit)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Covers</Text>
                <Text style={styles.statValue}>{loc.lastWeekCovers}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Reputation</Text>
                <Text style={[styles.statValue, { color: loc.reputation > 70 ? colors.success : loc.reputation > 40 ? colors.warning : colors.accent }]}>{loc.reputation}%</Text>
              </View>
            </View>
          )}

          {/* Corporate Stats (if multi-location) */}
          {isMultiLocation && (
            <View style={styles.corporateStats}>
              <Text style={styles.sectionTitle}>Empire Overview</Text>
              <View style={styles.corporateRow}>
                <View style={styles.corporateStat}>
                  <Text style={styles.corporateStatLabel}>Corporate Cash</Text>
                  <Text style={styles.corporateStatValue}>{formatCurrency(game.corporateCash)}</Text>
                </View>
                <View style={styles.corporateStat}>
                  <Text style={styles.corporateStatLabel}>Franchise Royalties</Text>
                  <Text style={styles.corporateStatValue}>{formatCurrency(game.franchises.reduce((s, f) => s + f.weeklyRoyalty, 0))}/wk</Text>
                </View>
                <View style={styles.corporateStat}>
                  <Text style={styles.corporateStatLabel}>Total Staff</Text>
                  <Text style={styles.corporateStatValue}>{game.locations.reduce((s, l) => s + l.staff.length, 0)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Mini Chart */}
          {loc && loc.weeklyHistory.length > 1 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Revenue Trend (12 weeks)</Text>
              <MiniChart data={loc.weeklyHistory.map(w => w.revenue)} color={colors.info} height={50} />
              <Text style={styles.chartTitle}>Profit Trend</Text>
              <MiniChart data={loc.weeklyHistory.map(w => w.profit)} color={colors.success} height={50} />
            </View>
          )}

          {/* Tab Navigation */}
          <View style={styles.tabBar}>
            {['overview', 'staff', 'ops', 'finance', 'empire'].map(tab => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && loc && (
              <>
                {/* Health Meters */}
                <View style={styles.healthMeters}>
                  <View style={styles.meterContainer}>
                    <Text style={styles.meterLabel}>Owner Burnout</Text>
                    <View style={styles.meterBar}>
                      <View style={[styles.meterFill, { width: `${game.burnout}%`, backgroundColor: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]} />
                    </View>
                    <Text style={styles.meterValue}>{game.burnout}%</Text>
                  </View>
                  <View style={styles.meterContainer}>
                    <Text style={styles.meterLabel}>Team Morale</Text>
                    <View style={styles.meterBar}>
                      <View style={[styles.meterFill, { width: `${loc.morale}%`, backgroundColor: loc.morale > 70 ? colors.success : loc.morale > 40 ? colors.warning : colors.accent }]} />
                    </View>
                    <Text style={styles.meterValue}>{loc.morale}%</Text>
                  </View>
                </View>

                {/* Manager Status */}
                <View style={styles.managerCard}>
                  <Text style={styles.managerLabel}>Location Manager</Text>
                  {loc.manager ? (
                    <View style={styles.managerInfo}>
                      <Text style={styles.managerIcon}>{loc.manager.icon}</Text>
                      <View>
                        <Text style={styles.managerName}>{loc.manager.name}</Text>
                        <Text style={styles.managerRole}>{loc.manager.role} • Skill {loc.manager.skill}/10</Text>
                      </View>
                      <View style={[styles.managerBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.managerBadgeText}>Active</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noManager}>
                      <Text style={styles.noManagerText}>No manager assigned - YOU are running this location</Text>
                      <Text style={styles.noManagerHint}>Hire a GM and promote them to reduce burnout</Text>
                    </View>
                  )}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setStaffModal(true)}>
                    <Text style={styles.quickActionIcon}>👥</Text>
                    <Text style={styles.quickActionText}>Staff</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setMarketingModal(true)}>
                    <Text style={styles.quickActionIcon}>📣</Text>
                    <Text style={styles.quickActionText}>Marketing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setDeliveryModal(true)}>
                    <Text style={styles.quickActionIcon}>🛵</Text>
                    <Text style={styles.quickActionText}>Delivery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setLoanModal(true)}>
                    <Text style={styles.quickActionIcon}>💰</Text>
                    <Text style={styles.quickActionText}>Finance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setAnalyticsModal(true)}>
                    <Text style={styles.quickActionIcon}>📊</Text>
                    <Text style={styles.quickActionText}>Analytics</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setSaveModal(true)}>
                    <Text style={styles.quickActionIcon}>💾</Text>
                    <Text style={styles.quickActionText}>Save</Text>
                  </TouchableOpacity>
                </View>

                {/* Active Systems Badges */}
                <Text style={styles.sectionTitle}>Active Systems</Text>
                <View style={styles.badgeContainer}>
                  {loc.marketing.channels.map(c => (
                    <View key={c} style={styles.badge}><Text style={styles.badgeText}>{MARKETING_CHANNELS.find(m => m.id === c)?.icon} {MARKETING_CHANNELS.find(m => m.id === c)?.name}</Text></View>
                  ))}
                  {loc.delivery.platforms.map(p => (
                    <View key={p} style={[styles.badge, { backgroundColor: colors.info }]}><Text style={styles.badgeText}>{DELIVERY_PLATFORMS.find(d => d.id === p)?.icon} {DELIVERY_PLATFORMS.find(d => d.id === p)?.name}</Text></View>
                  ))}
                  {loc.virtualBrands.map(v => (
                    <View key={v} style={[styles.badge, { backgroundColor: colors.purple }]}><Text style={styles.badgeText}>{VIRTUAL_BRANDS.find(vb => vb.id === v)?.icon} {VIRTUAL_BRANDS.find(vb => vb.id === v)?.name}</Text></View>
                  ))}
                  {loc.equipment.map(e => (
                    <View key={e} style={[styles.badge, { backgroundColor: colors.surfaceLight }]}><Text style={styles.badgeText}>{EQUIPMENT.find(eq => eq.id === e)?.icon} {EQUIPMENT.find(eq => eq.id === e)?.name}</Text></View>
                  ))}
                </View>
              </>
            )}

            {/* STAFF TAB */}
            {activeTab === 'staff' && loc && (
              <>
                <View style={styles.staffHeader}>
                  <Text style={styles.sectionTitle}>Staff ({loc.staff.length})</Text>
                  <TouchableOpacity style={styles.hireButton} onPress={() => setStaffModal(true)}>
                    <Text style={styles.hireButtonText}>+ HIRE</Text>
                  </TouchableOpacity>
                </View>
                
                {loc.staff.length === 0 ? (
                  <Text style={styles.emptyText}>No staff hired yet. Running solo!</Text>
                ) : (
                  loc.staff.map(s => (
                    <View key={s.id} style={styles.staffCard}>
                      <Text style={styles.staffIcon}>{s.icon}</Text>
                      <View style={styles.staffInfo}>
                        <Text style={styles.staffName}>{s.name}</Text>
                        <Text style={styles.staffRole}>{s.role} • ${s.wage}/hr • Skill {s.skill}/10</Text>
                        <View style={styles.staffMoraleBar}>
                          <View style={[styles.staffMoraleFill, { width: `${s.morale}%`, backgroundColor: s.morale > 60 ? colors.success : colors.warning }]} />
                        </View>
                      </View>
                      <View style={styles.staffActions}>
                        {s.canManage && !loc.manager && (
                          <TouchableOpacity style={styles.promoteBtn} onPress={() => promoteToManager(s.id)}>
                            <Text style={styles.promoteBtnText}>⬆️</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.trainBtn} onPress={() => { setSelectedStaff(s); setTrainingModal(true); }}>
                          <Text style={styles.trainBtnText}>📚</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.fireBtn} onPress={() => fireStaff(s.id)}>
                          <Text style={styles.fireBtnText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* OPS TAB */}
            {activeTab === 'ops' && loc && (
              <>
                {/* Menu */}
                <View style={styles.menuHeader}>
                  <Text style={styles.sectionTitle}>Menu ({loc.menu.length} items)</Text>
                  <TouchableOpacity style={styles.addMenuBtn} onPress={addMenuItem}>
                    <Text style={styles.addMenuBtnText}>+ ADD ITEM</Text>
                  </TouchableOpacity>
                </View>
                {loc.menu.map(item => (
                  <TouchableOpacity key={item.id} style={[styles.menuItem, item.is86d && styles.menuItem86d]} onPress={() => toggle86(item.id)}>
                    <View>
                      <Text style={[styles.menuItemName, item.is86d && styles.menuItemName86d]}>{item.name}</Text>
                      <Text style={styles.menuItemPrice}>{formatCurrency(item.price)} • Cost: {formatCurrency(item.cost)}</Text>
                    </View>
                    <Text style={styles.menuStatus}>{item.is86d ? '86\'d' : item.popular ? '⭐' : ''}</Text>
                  </TouchableOpacity>
                ))}

                {/* Equipment */}
                <Text style={styles.sectionTitle}>Equipment</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipmentScroll}>
                  {EQUIPMENT.map(eq => {
                    const owned = loc.equipment.includes(eq.id);
                    return (
                      <TouchableOpacity key={eq.id} style={[styles.equipmentCard, owned && styles.equipmentOwned]} onPress={() => !owned && buyEquipment(eq)} disabled={owned}>
                        <Text style={styles.equipmentIcon}>{eq.icon}</Text>
                        <Text style={styles.equipmentName}>{eq.name}</Text>
                        <Text style={styles.equipmentCost}>{owned ? 'OWNED' : formatCurrency(eq.cost)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Upgrades */}
                <Text style={styles.sectionTitle}>Upgrades</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipmentScroll}>
                  {UPGRADES.map(up => {
                    const owned = loc.upgrades.includes(up.id);
                    return (
                      <TouchableOpacity key={up.id} style={[styles.equipmentCard, owned && styles.equipmentOwned]} onPress={() => !owned && buyUpgrade(up)} disabled={owned}>
                        <Text style={styles.equipmentIcon}>{up.icon}</Text>
                        <Text style={styles.equipmentName}>{up.name}</Text>
                        <Text style={styles.equipmentCost}>{owned ? 'DONE' : formatCurrency(up.cost)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Virtual Brands */}
                <Text style={styles.sectionTitle}>Virtual Brands (Ghost Kitchens)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipmentScroll}>
                  {VIRTUAL_BRANDS.map(vb => {
                    const active = loc.virtualBrands.includes(vb.id);
                    return (
                      <TouchableOpacity key={vb.id} style={[styles.equipmentCard, active && styles.equipmentOwned]} onPress={() => !active && launchVirtualBrand(vb.id)} disabled={active}>
                        <Text style={styles.equipmentIcon}>{vb.icon}</Text>
                        <Text style={styles.equipmentName}>{vb.name}</Text>
                        <Text style={styles.equipmentCost}>{active ? 'ACTIVE' : formatCurrency(vb.setupCost)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* FINANCE TAB */}
            {activeTab === 'finance' && loc && (
              <>
                {/* P&L Summary */}
                <Text style={styles.sectionTitle}>Last Week P&L</Text>
                <View style={styles.plCard}>
                  <View style={styles.plRow}><Text style={styles.plLabel}>Revenue</Text><Text style={[styles.plValue, { color: colors.success }]}>{formatCurrency(loc.lastWeekRevenue)}</Text></View>
                  <View style={styles.plDivider} />
                  <View style={styles.plRow}><Text style={styles.plLabel}>Food Cost ({formatPct(loc.foodCostPct)})</Text><Text style={styles.plValue}>-{formatCurrency(loc.lastWeekRevenue * loc.foodCostPct)}</Text></View>
                  <View style={styles.plRow}><Text style={styles.plLabel}>Labor</Text><Text style={styles.plValue}>-{formatCurrency(loc.staff.reduce((s, st) => s + st.wage * 40, 0))}</Text></View>
                  <View style={styles.plRow}><Text style={styles.plLabel}>Rent</Text><Text style={styles.plValue}>-{formatCurrency(loc.rent)}</Text></View>
                  <View style={styles.plRow}><Text style={styles.plLabel}>Marketing</Text><Text style={styles.plValue}>-{formatCurrency(loc.marketing.channels.reduce((s, c) => s + (MARKETING_CHANNELS.find(m => m.id === c)?.costPerWeek || 0), 0))}</Text></View>
                  <View style={styles.plDivider} />
                  <View style={styles.plRow}><Text style={[styles.plLabel, { fontWeight: 'bold' }]}>Net Profit</Text><Text style={[styles.plValue, { color: loc.lastWeekProfit >= 0 ? colors.success : colors.accent, fontWeight: 'bold' }]}>{loc.lastWeekProfit >= 0 ? '+' : ''}{formatCurrency(loc.lastWeekProfit)}</Text></View>
                </View>

                {/* Loans */}
                <View style={styles.loanHeader}>
                  <Text style={styles.sectionTitle}>Active Loans</Text>
                  <TouchableOpacity style={styles.loanBtn} onPress={() => setLoanModal(true)}>
                    <Text style={styles.loanBtnText}>+ NEW LOAN</Text>
                  </TouchableOpacity>
                </View>
                {game.loans.length === 0 ? (
                  <Text style={styles.emptyText}>No active loans - debt free!</Text>
                ) : (
                  game.loans.map((loan, i) => {
                    const loanData = LOANS.find(l => l.id === loan.type);
                    return (
                      <View key={i} style={styles.loanCard}>
                        <Text style={styles.loanName}>{loanData?.name}</Text>
                        <Text style={styles.loanDetails}>{loan.remaining} weeks left • {formatCurrency(loanData?.weeklyPayment || 0)}/week</Text>
                      </View>
                    );
                  })
                )}

                {/* Equity */}
                <View style={styles.equityCard}>
                  <Text style={styles.equityLabel}>Your Equity</Text>
                  <Text style={[styles.equityValue, { color: game.equity >= 80 ? colors.success : game.equity >= 50 ? colors.warning : colors.accent }]}>{game.equity}%</Text>
                </View>
              </>
            )}

            {/* EMPIRE TAB */}
            {activeTab === 'empire' && (
              <>
                {/* Empire Stats */}
                <View style={styles.empireStatsCard}>
                  <View style={styles.empireStat}>
                    <Text style={styles.empireStatValue}>{game.locations.length}</Text>
                    <Text style={styles.empireStatLabel}>Owned</Text>
                  </View>
                  <View style={styles.empireStat}>
                    <Text style={styles.empireStatValue}>{game.franchises.length}</Text>
                    <Text style={styles.empireStatLabel}>Franchises</Text>
                  </View>
                  <View style={styles.empireStat}>
                    <Text style={[styles.empireStatValue, { color: colors.success }]}>{formatCurrency(game.empireValuation)}</Text>
                    <Text style={styles.empireStatLabel}>Valuation</Text>
                  </View>
                </View>

                {/* Expansion */}
                <Text style={styles.sectionTitle}>Expansion</Text>
                <TouchableOpacity style={styles.expansionButton} onPress={() => setExpansionModal(true)}>
                  <Text style={styles.expansionButtonIcon}>🏪</Text>
                  <View>
                    <Text style={styles.expansionButtonTitle}>Open New Location</Text>
                    <Text style={styles.expansionButtonDesc}>Expand your owned footprint</Text>
                  </View>
                </TouchableOpacity>

                {/* Franchising */}
                <Text style={styles.sectionTitle}>Franchising</Text>
                {!game.franchiseEnabled ? (
                  <TouchableOpacity 
                    style={[styles.expansionButton, game.locations.length < 3 && styles.expansionButtonDisabled]} 
                    onPress={enableFranchising}
                    disabled={game.locations.length < 3}
                  >
                    <Text style={styles.expansionButtonIcon}>🌐</Text>
                    <View>
                      <Text style={styles.expansionButtonTitle}>Enable Franchising</Text>
                      <Text style={styles.expansionButtonDesc}>
                        {game.locations.length < 3 
                          ? `Need 3 locations first (have ${game.locations.length})` 
                          : '$50K setup • Let others expand your brand'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.franchiseEnabled}>
                      <Text style={styles.franchiseEnabledText}>✓ Franchising Active</Text>
                      <Text style={styles.franchiseRate}>{formatPct(game.royaltyRate)} royalty rate</Text>
                    </View>
                    <TouchableOpacity style={styles.expansionButton} onPress={() => setFranchiseModal(true)}>
                      <Text style={styles.expansionButtonIcon}>🤝</Text>
                      <View>
                        <Text style={styles.expansionButtonTitle}>Sell Franchise</Text>
                        <Text style={styles.expansionButtonDesc}>Find franchisees to grow your brand</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                {/* Active Franchises */}
                {game.franchises.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Active Franchises ({game.franchises.length})</Text>
                    {game.franchises.map(f => (
                      <View key={f.id} style={styles.franchiseCard}>
                        <View>
                          <Text style={styles.franchiseName}>{f.name}</Text>
                          <Text style={styles.franchiseTier}>{FRANCHISE_TIERS.find(t => t.id === f.tier)?.name}</Text>
                        </View>
                        <View style={styles.franchiseStats}>
                          <Text style={styles.franchiseRoyalty}>{formatCurrency(f.weeklyRoyalty)}/wk</Text>
                          <Text style={styles.franchiseQuality}>Quality: {f.quality}%</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* All Locations List */}
                <Text style={styles.sectionTitle}>All Locations</Text>
                {game.locations.map(l => (
                  <TouchableOpacity key={l.id} style={styles.locationCard} onPress={() => setActiveLocationId(l.id)}>
                    <Text style={styles.locationCardIcon}>{LOCATION_TYPES.find(t => t.id === l.locationType)?.icon}</Text>
                    <View style={styles.locationCardInfo}>
                      <Text style={styles.locationCardName}>{l.name}</Text>
                      <Text style={styles.locationCardDetails}>{l.staff.length} staff • Rep: {l.reputation}% • {l.manager ? '✓ Managed' : '⚠️ No Manager'}</Text>
                    </View>
                    <View>
                      <Text style={[styles.locationCardCash, { color: l.cash > 0 ? colors.success : colors.accent }]}>{formatCurrency(l.cash)}</Text>
                      <Text style={[styles.locationCardProfit, { color: l.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{l.lastWeekProfit >= 0 ? '+' : ''}{formatCurrency(l.lastWeekProfit)}/wk</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.nextWeekButton} onPress={processWeek}>
            <Text style={styles.nextWeekButtonText}>▶ NEXT WEEK</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* MODALS */}
        {/* ============================================ */}

        {/* Staff Hire Modal */}
        <Modal visible={staffModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hire Staff</Text>
                <TouchableOpacity onPress={() => setStaffModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {STAFF_TEMPLATES.filter(t => !t.canManageMultiple).map(t => (
                  <TouchableOpacity key={t.role} style={styles.hireOption} onPress={() => hireStaff(t)}>
                    <Text style={styles.hireIcon}>{t.icon}</Text>
                    <View style={styles.hireInfo}>
                      <Text style={styles.hireName}>{t.role}</Text>
                      <Text style={styles.hireWage}>${t.wage}/hr • {t.department}</Text>
                    </View>
                    <Text style={styles.hireCost}>{formatCurrency(t.wage * 40)}/wk</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Training Modal */}
        <Modal visible={trainingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Training: {selectedStaff?.name}</Text>
                <TouchableOpacity onPress={() => { setTrainingModal(false); setSelectedStaff(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {TRAINING_PROGRAMS.map(p => {
                  const completed = selectedStaff?.training?.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.trainingOption, completed && styles.trainingCompleted]} onPress={() => !completed && startTraining(p)} disabled={completed}>
                      <Text style={styles.trainingIcon}>{p.icon}</Text>
                      <View style={styles.trainingInfo}>
                        <Text style={styles.trainingName}>{p.name}</Text>
                        <Text style={styles.trainingDesc}>+{p.skillBoost} skill • +{p.morale} morale • {p.weeks}wk</Text>
                      </View>
                      <Text style={styles.trainingCost}>{completed ? '✓' : formatCurrency(p.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Marketing Modal */}
        <Modal visible={marketingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Marketing Channels</Text>
                <TouchableOpacity onPress={() => setMarketingModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {MARKETING_CHANNELS.map(c => {
                  const active = loc?.marketing.channels.includes(c.id);
                  return (
                    <TouchableOpacity key={c.id} style={[styles.channelOption, active && styles.channelActive]} onPress={() => toggleMarketingChannel(c.id)}>
                      <Text style={styles.channelIcon}>{c.icon}</Text>
                      <View style={styles.channelInfo}>
                        <Text style={[styles.channelName, active && styles.channelNameActive]}>{c.name}</Text>
                        <Text style={styles.channelEffect}>+{Math.round(c.effect.reach * 100)}% reach</Text>
                      </View>
                      <Text style={styles.channelCost}>{c.costPerWeek > 0 ? `${formatCurrency(c.costPerWeek)}/wk` : 'FREE'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Delivery Modal */}
        <Modal visible={deliveryModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delivery Platforms</Text>
                <TouchableOpacity onPress={() => setDeliveryModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {DELIVERY_PLATFORMS.map(p => {
                  const active = loc?.delivery.platforms.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.deliveryOption, active && styles.deliveryActive]} onPress={() => toggleDeliveryPlatform(p.id)}>
                      <Text style={styles.deliveryIcon}>{p.icon}</Text>
                      <View style={styles.deliveryInfo}>
                        <Text style={[styles.deliveryName, active && styles.deliveryNameActive]}>{p.name}</Text>
                        <Text style={styles.deliveryCommission}>{formatPct(p.commission)} commission • +{Math.round(p.reach * 100)}% reach</Text>
                      </View>
                      <Text style={styles.deliveryCost}>{active ? '✓ ACTIVE' : p.setup > 0 ? formatCurrency(p.setup) : 'FREE'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Loan Modal */}
        <Modal visible={loanModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Financing Options</Text>
                <TouchableOpacity onPress={() => setLoanModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Loans add to CORPORATE cash</Text>
              <ScrollView>
                {LOANS.map(l => (
                  <TouchableOpacity key={l.id} style={styles.loanOption} onPress={() => takeLoan(l.id)}>
                    <View style={styles.loanOptionInfo}>
                      <Text style={styles.loanOptionName}>{l.name}</Text>
                      <Text style={styles.loanOptionDetails}>{formatCurrency(l.amount)} @ {formatPct(l.rate)} • {l.term} weeks</Text>
                      {l.equity && <Text style={styles.loanEquity}>⚠️ -{l.equity * 100}% equity</Text>}
                    </View>
                    <Text style={styles.loanPayment}>{formatCurrency(l.weeklyPayment)}/wk</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Analytics Modal */}
        <Modal visible={analyticsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Analytics - {loc?.name}</Text>
                <TouchableOpacity onPress={() => setAnalyticsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {loc && (
                  <>
                    <Text style={styles.analyticsSection}>Lifetime Stats</Text>
                    <View style={styles.analyticsGrid}>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{loc.weeksOpen}</Text><Text style={styles.analyticsLabel}>Weeks Open</Text></View>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{formatCurrency(loc.totalRevenue)}</Text><Text style={styles.analyticsLabel}>Total Revenue</Text></View>
                      <View style={styles.analyticsStat}><Text style={[styles.analyticsValue, { color: loc.totalProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(loc.totalProfit)}</Text><Text style={styles.analyticsLabel}>Total Profit</Text></View>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{formatCurrency(calculateLocationValuation(loc, setup.cuisine))}</Text><Text style={styles.analyticsLabel}>Location Value</Text></View>
                    </View>
                    <Text style={styles.analyticsSection}>Key Ratios</Text>
                    <View style={styles.analyticsGrid}>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{formatPct(loc.foodCostPct)}</Text><Text style={styles.analyticsLabel}>Food Cost %</Text></View>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{loc.staff.length > 0 ? formatPct(loc.staff.reduce((s, st) => s + st.wage * 40, 0) / Math.max(1, loc.lastWeekRevenue)) : '0%'}</Text><Text style={styles.analyticsLabel}>Labor Cost %</Text></View>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{loc.lastWeekRevenue > 0 ? formatPct(loc.lastWeekProfit / loc.lastWeekRevenue) : '0%'}</Text><Text style={styles.analyticsLabel}>Profit Margin</Text></View>
                      <View style={styles.analyticsStat}><Text style={styles.analyticsValue}>{formatCurrency(loc.lastWeekRevenue / Math.max(1, loc.lastWeekCovers))}</Text><Text style={styles.analyticsLabel}>Avg Check</Text></View>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Expansion Modal */}
        <Modal visible={expansionModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Open New Location</Text>
                <TouchableOpacity onPress={() => setExpansionModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.inputLabel}>Location Name</Text>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="e.g., Downtown Plaza" 
                  placeholderTextColor={colors.textMuted} 
                  value={newLocationData.name} 
                  onChangeText={t => setNewLocationData(d => ({ ...d, name: t }))} 
                />

                <Text style={styles.inputLabel}>Location Type</Text>
                {LOCATION_TYPES.map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={[styles.locationTypeOption, newLocationData.type === t.id && styles.locationTypeSelected]}
                    onPress={() => setNewLocationData(d => ({ ...d, type: t.id }))}
                  >
                    <Text style={styles.locationTypeIcon}>{t.icon}</Text>
                    <View style={styles.locationTypeInfo}>
                      <Text style={[styles.locationTypeName, newLocationData.type === t.id && styles.locationTypeNameSelected]}>{t.name}</Text>
                      <Text style={styles.locationTypeDetails}>Rent: {t.rentMod > 1 ? '+' : ''}{Math.round((t.rentMod - 1) * 100)}% • Traffic: {t.trafficMod > 1 ? '+' : ''}{Math.round((t.trafficMod - 1) * 100)}%</Text>
                    </View>
                    <Text style={styles.locationTypeCost}>{formatCurrency(t.buildoutCost)}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.inputLabel}>Market</Text>
                {MARKETS.map(m => (
                  <TouchableOpacity 
                    key={m.id} 
                    style={[styles.marketOption, newLocationData.market === m.id && styles.marketSelected]}
                    onPress={() => setNewLocationData(d => ({ ...d, market: m.id }))}
                  >
                    <Text style={styles.marketIcon}>{m.icon}</Text>
                    <View style={styles.marketInfo}>
                      <Text style={[styles.marketName, newLocationData.market === m.id && styles.marketNameSelected]}>{m.name}</Text>
                      <Text style={styles.marketDetails}>Brand bonus: +{Math.round(m.brandBonus * 100)}% • Management: {m.managementCost > 0 ? `${formatCurrency(m.managementCost)}/wk` : 'None'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.expansionSummary}>
                  <Text style={styles.expansionSummaryTitle}>Total Investment</Text>
                  <Text style={styles.expansionSummaryValue}>{formatCurrency(LOCATION_TYPES.find(t => t.id === newLocationData.type)?.buildoutCost || 0)}</Text>
                  <Text style={styles.expansionSummaryNote}>Corporate Cash: {formatCurrency(game.corporateCash)}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.expandButton, game.corporateCash < (LOCATION_TYPES.find(t => t.id === newLocationData.type)?.buildoutCost || 0) && styles.expandButtonDisabled]}
                  onPress={openNewLocation}
                  disabled={game.corporateCash < (LOCATION_TYPES.find(t => t.id === newLocationData.type)?.buildoutCost || 0)}
                >
                  <Text style={styles.expandButtonText}>OPEN LOCATION</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Franchise Modal */}
        <Modal visible={franchiseModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sell Franchise</Text>
                <TouchableOpacity onPress={() => setFranchiseModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.franchiseIntro}>Choose a franchise tier to offer:</Text>
                {FRANCHISE_TIERS.map(tier => (
                  <TouchableOpacity key={tier.id} style={styles.franchiseTierOption} onPress={() => sellFranchise(tier.id)}>
                    <View style={styles.franchiseTierInfo}>
                      <Text style={styles.franchiseTierName}>{tier.name}</Text>
                      <Text style={styles.franchiseTierDetails}>Min {tier.minLocations} locations • {tier.training} weeks training</Text>
                      <Text style={styles.franchiseTierRates}>Royalty: {formatPct(tier.royalty)} + Marketing: {formatPct(tier.marketingFee)}</Text>
                    </View>
                    <View>
                      <Text style={styles.franchiseTierFee}>{formatCurrency(tier.fee)}</Text>
                      <Text style={styles.franchiseTierFeeLabel}>One-time fee</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AI Chat Modal */}
        <Modal visible={aiChatModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👨‍🍳 Chat with Chef Marcus</Text>
                <TouchableOpacity onPress={() => setAiChatModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.aiChatContainer}>
                <View style={styles.aiResponse}>
                  {aiLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.aiResponseText}>{aiMessage || 'Ask me anything about running your empire...'}</Text>}
                </View>
                <View style={styles.aiInputRow}>
                  <TextInput style={styles.aiInput} placeholder="Ask about staff, expansion, finances..." placeholderTextColor={colors.textMuted} value={aiChatInput} onChangeText={setAiChatInput} />
                  <TouchableOpacity style={styles.aiSendBtn} onPress={askAI}><Text style={styles.aiSendBtnText}>→</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Save/Load Modal */}
        <Modal visible={saveModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Save / Load Game</Text>
                <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {[1, 2, 3].map(slot => {
                  const save = savedGames.find(s => s.slot === slot);
                  return (
                    <View key={slot} style={styles.saveSlot}>
                      <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                      {save ? (
                        <>
                          <Text style={styles.saveSlotInfo}>{save.setup.name} • Week {save.game.week} • {save.game.locations.length} locations</Text>
                          <View style={styles.saveSlotButtons}>
                            <TouchableOpacity style={styles.loadBtn} onPress={() => loadGame(save)}><Text style={styles.loadBtnText}>LOAD</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.overwriteBtn} onPress={() => saveGame(slot)}><Text style={styles.overwriteBtnText}>OVERWRITE</Text></TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <TouchableOpacity style={styles.saveBtn} onPress={() => saveGame(slot)}><Text style={styles.saveBtnText}>SAVE HERE</Text></TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    );
  }

  return null;
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Welcome
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  welcomeTitle: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -3 },
  welcomeDivider: { width: 60, height: 4, backgroundColor: colors.primary, marginVertical: 20 },
  welcomeQuote: { fontSize: 16, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },
  welcomeSubtext: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  startButton: { backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 8 },
  startButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  versionText: { color: colors.textMuted, fontSize: 12, marginTop: 30 },

  // Onboarding
  onboardingContainer: { flex: 1 },
  onboardingContent: { padding: 20 },
  progressBarContainer: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 20 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  stepText: { color: colors.textMuted, fontSize: 12, marginBottom: 10, letterSpacing: 1 },
  messageBox: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: colors.primary },
  messageText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  dropdownButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dropdownText: { color: colors.textPrimary, fontSize: 16 },
  dropdownPlaceholder: { color: colors.textMuted, fontSize: 16 },
  dropdownArrow: { color: colors.textMuted },
  selectedCuisine: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  selectedIcon: { fontSize: 40, marginRight: 15 },
  selectedName: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
  selectedStats: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  capitalDisplay: { alignItems: 'center', marginBottom: 10 },
  capitalAmount: { fontSize: 48, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  tierText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  tierDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { color: colors.textMuted, fontSize: 12 },
  textInput: { backgroundColor: colors.surface, color: colors.textPrimary, padding: 16, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  goalOptions: { gap: 10 },
  goalButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  goalButtonActive: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  goalText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  goalTextActive: { color: colors.primary },
  goalDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  continueButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  continueButtonDisabled: { backgroundColor: colors.surfaceLight },
  continueButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  continueButtonTextDisabled: { color: colors.textMuted },
  backButton: { alignItems: 'center', marginTop: 15 },
  backButtonText: { color: colors.textSecondary, fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  modalSubtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 15 },
  modalClose: { color: colors.textMuted, fontSize: 24 },
  searchInput: { backgroundColor: colors.surfaceLight, color: colors.textPrimary, padding: 12, borderRadius: 8, marginBottom: 15 },
  cuisineList: { maxHeight: 400 },
  cuisineOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  cuisineOptionSelected: { backgroundColor: colors.surfaceLight },
  cuisineIcon: { fontSize: 28, marginRight: 12 },
  cuisineInfo: { flex: 1 },
  cuisineName: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
  cuisineNameSelected: { color: colors.primary },
  cuisineStats: { color: colors.textMuted, fontSize: 12 },

  // Scenario
  scenarioContainer: { flex: 1 },
  scenarioContent: { padding: 20 },
  scenarioTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 15 },
  scenarioTypeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  scenarioTitle: { color: colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: 5 },
  scenarioSubtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 20 },
  scenarioMessageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 25 },
  scenarioMessage: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
  scenarioOption: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scenarioOptionText: { color: colors.textPrimary, fontSize: 15, flex: 1, marginRight: 10 },
  scenarioChance: { color: colors.textMuted, fontSize: 13 },
  scenarioResult: { alignItems: 'center', marginVertical: 20 },
  scenarioResultText: { fontSize: 24, fontWeight: '700' },
  aiCommentBox: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, marginBottom: 15 },
  aiCommentLabel: { color: colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  aiCommentText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  lessonBox: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 25, borderLeftWidth: 3, borderLeftColor: colors.warning },
  lessonLabel: { color: colors.warning, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  lessonText: { color: colors.textSecondary, fontSize: 14, fontStyle: 'italic' },

  // End Screen
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  endTitle: { fontSize: 36, fontWeight: '900', marginTop: 20 },
  endSubtitle: { color: colors.textSecondary, fontSize: 16, marginTop: 10 },
  endDivider: { width: 60, height: 4, marginVertical: 25 },
  endStats: { width: '100%', maxWidth: 300 },
  endStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  endStatLabel: { color: colors.textSecondary, fontSize: 14 },
  endStatValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  restartButton: { backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 8, marginTop: 30 },
  restartButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },

  // Empire Header
  empireHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  empireHeaderLeft: {},
  empireName: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  empireStats: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  empireHeaderRight: { alignItems: 'flex-end' },
  empireValuation: { color: colors.success, fontSize: 20, fontWeight: '700' },
  empireValuationLabel: { color: colors.textMuted, fontSize: 10 },

  // Location Selector
  locationSelector: { backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  locationTab: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  locationTabActive: { backgroundColor: colors.primary },
  locationTabIcon: { fontSize: 16, marginRight: 6 },
  locationTabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500', maxWidth: 80 },
  locationTabTextActive: { color: colors.background },
  locationTabCash: { color: colors.textMuted, fontSize: 10 },
  addLocationTab: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.textMuted },
  addLocationIcon: { color: colors.textMuted, fontSize: 18 },
  addLocationText: { color: colors.textMuted, fontSize: 10 },

  // AI Bar
  aiBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, marginHorizontal: 10, marginTop: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.primary },
  aiBarIcon: { fontSize: 20 },
  aiBarText: { color: colors.textSecondary, fontSize: 13, flex: 1, marginLeft: 10 },

  // Warning Banner
  warningBanner: { padding: 10, marginHorizontal: 10, marginTop: 10, borderRadius: 6 },
  warningText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Dashboard
  dashboardScroll: { flex: 1 },
  quickStats: { flexDirection: 'row', padding: 10, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: 8, alignItems: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 10 },
  statValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },

  // Corporate Stats
  corporateStats: { backgroundColor: colors.surface, margin: 10, padding: 15, borderRadius: 8 },
  corporateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  corporateStat: { alignItems: 'center' },
  corporateStatLabel: { color: colors.textMuted, fontSize: 10 },
  corporateStatValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 },

  // Charts
  chartContainer: { backgroundColor: colors.surface, margin: 10, padding: 15, borderRadius: 8 },
  chartTitle: { color: colors.textMuted, fontSize: 11, marginBottom: 5, marginTop: 10 },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: 10, borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  tabTextActive: { color: colors.background },
  tabContent: { padding: 10 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 15, marginBottom: 10 },

  // Health Meters
  healthMeters: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  meterContainer: { flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
  meterLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 6 },
  meterBar: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3 },
  meterFill: { height: 6, borderRadius: 3 },
  meterValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 6 },

  // Manager Card
  managerCard: { backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 10 },
  managerLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 10 },
  managerInfo: { flexDirection: 'row', alignItems: 'center' },
  managerIcon: { fontSize: 28, marginRight: 12 },
  managerName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  managerRole: { color: colors.textMuted, fontSize: 12 },
  managerBadge: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  managerBadgeText: { color: colors.textPrimary, fontSize: 10, fontWeight: '600' },
  noManager: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 6 },
  noManagerText: { color: colors.warning, fontSize: 13 },
  noManagerHint: { color: colors.textMuted, fontSize: 11, marginTop: 4 },

  // Quick Actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAction: { width: (width - 60) / 3, backgroundColor: colors.surface, padding: 15, borderRadius: 8, alignItems: 'center' },
  quickActionIcon: { fontSize: 24, marginBottom: 6 },
  quickActionText: { color: colors.textSecondary, fontSize: 11 },

  // Badges
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: colors.textPrimary, fontSize: 10 },

  // Staff
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hireButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  hireButtonText: { color: colors.background, fontSize: 12, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 20 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  staffIcon: { fontSize: 24, marginRight: 10 },
  staffInfo: { flex: 1 },
  staffName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  staffRole: { color: colors.textMuted, fontSize: 11 },
  staffMoraleBar: { height: 3, backgroundColor: colors.surfaceLight, borderRadius: 2, marginTop: 6, width: 80 },
  staffMoraleFill: { height: 3, borderRadius: 2 },
  staffActions: { flexDirection: 'row', gap: 8 },
  promoteBtn: { backgroundColor: colors.success, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  promoteBtnText: { fontSize: 12 },
  trainBtn: { backgroundColor: colors.info, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  trainBtnText: { fontSize: 12 },
  fireBtn: { backgroundColor: colors.accent, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fireBtnText: { color: colors.textPrimary, fontSize: 14 },

  // Menu
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addMenuBtn: { backgroundColor: colors.info, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  addMenuBtnText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 6 },
  menuItem86d: { opacity: 0.5 },
  menuItemName: { color: colors.textPrimary, fontSize: 14 },
  menuItemName86d: { textDecorationLine: 'line-through' },
  menuItemPrice: { color: colors.textMuted, fontSize: 11 },
  menuStatus: { color: colors.warning, fontSize: 12 },

  // Equipment
  equipmentScroll: { marginBottom: 10 },
  equipmentCard: { width: 100, backgroundColor: colors.surface, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  equipmentOwned: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.success },
  equipmentIcon: { fontSize: 28, marginBottom: 6 },
  equipmentName: { color: colors.textPrimary, fontSize: 11, textAlign: 'center' },
  equipmentCost: { color: colors.textMuted, fontSize: 10, marginTop: 4 },

  // P&L
  plCard: { backgroundColor: colors.surface, padding: 15, borderRadius: 8 },
  plRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  plLabel: { color: colors.textSecondary, fontSize: 13 },
  plValue: { color: colors.textPrimary, fontSize: 13 },
  plDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

  // Loans
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loanBtn: { backgroundColor: colors.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  loanBtnText: { color: colors.background, fontSize: 12, fontWeight: '600' },
  loanCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  loanName: { color: colors.textPrimary, fontSize: 14 },
  loanDetails: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  equityCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  equityLabel: { color: colors.textMuted, fontSize: 12 },
  equityValue: { fontSize: 36, fontWeight: '700', marginTop: 6 },

  // Empire Tab
  empireStatsCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 20, borderRadius: 8, justifyContent: 'space-around' },
  empireStat: { alignItems: 'center' },
  empireStatValue: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  empireStatLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  expansionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 10 },
  expansionButtonDisabled: { opacity: 0.5 },
  expansionButtonIcon: { fontSize: 32, marginRight: 15 },
  expansionButtonTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  expansionButtonDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  franchiseEnabled: { backgroundColor: colors.success, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  franchiseEnabledText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  franchiseRate: { color: colors.textPrimary, fontSize: 12 },
  franchiseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  franchiseName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  franchiseTier: { color: colors.textMuted, fontSize: 11 },
  franchiseStats: { alignItems: 'flex-end' },
  franchiseRoyalty: { color: colors.success, fontSize: 14, fontWeight: '600' },
  franchiseQuality: { color: colors.textMuted, fontSize: 11 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  locationCardIcon: { fontSize: 24, marginRight: 12 },
  locationCardInfo: { flex: 1 },
  locationCardName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  locationCardDetails: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  locationCardCash: { fontSize: 14, fontWeight: '600' },
  locationCardProfit: { fontSize: 11, marginTop: 2 },

  // Modal Hire
  hireOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  hireIcon: { fontSize: 24, marginRight: 12 },
  hireInfo: { flex: 1 },
  hireName: { color: colors.textPrimary, fontSize: 14 },
  hireWage: { color: colors.textMuted, fontSize: 11 },
  hireCost: { color: colors.warning, fontSize: 12, fontWeight: '600' },

  // Modal Training
  trainingOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  trainingCompleted: { opacity: 0.5 },
  trainingIcon: { fontSize: 24, marginRight: 12 },
  trainingInfo: { flex: 1 },
  trainingName: { color: colors.textPrimary, fontSize: 14 },
  trainingDesc: { color: colors.textMuted, fontSize: 11 },
  trainingCost: { color: colors.success, fontSize: 14, fontWeight: '600' },

  // Modal Marketing/Delivery
  channelOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  channelActive: { backgroundColor: colors.success, borderColor: colors.success },
  channelIcon: { fontSize: 24, marginRight: 12 },
  channelInfo: { flex: 1 },
  channelName: { color: colors.textPrimary, fontSize: 14 },
  channelNameActive: { color: colors.textPrimary, fontWeight: '600' },
  channelEffect: { color: colors.textMuted, fontSize: 11 },
  channelCost: { color: colors.textSecondary, fontSize: 12 },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  deliveryActive: { backgroundColor: colors.info },
  deliveryIcon: { fontSize: 24, marginRight: 12 },
  deliveryInfo: { flex: 1 },
  deliveryName: { color: colors.textPrimary, fontSize: 14 },
  deliveryNameActive: { fontWeight: '600' },
  deliveryCommission: { color: colors.textMuted, fontSize: 11 },
  deliveryCost: { color: colors.textSecondary, fontSize: 12 },

  // Modal Loan
  loanOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  loanOptionInfo: { flex: 1 },
  loanOptionName: { color: colors.textPrimary, fontSize: 14 },
  loanOptionDetails: { color: colors.textMuted, fontSize: 11 },
  loanEquity: { color: colors.accent, fontSize: 11, marginTop: 2 },
  loanPayment: { color: colors.warning, fontSize: 14, fontWeight: '600' },

  // Modal Analytics
  analyticsSection: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 15, marginBottom: 10 },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  analyticsStat: { width: '47%', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, alignItems: 'center' },
  analyticsValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  analyticsLabel: { color: colors.textMuted, fontSize: 10, marginTop: 4 },

  // Modal Expansion
  inputLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 15, marginBottom: 8 },
  locationTypeOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  locationTypeSelected: { backgroundColor: colors.primary },
  locationTypeIcon: { fontSize: 24, marginRight: 12 },
  locationTypeInfo: { flex: 1 },
  locationTypeName: { color: colors.textPrimary, fontSize: 14 },
  locationTypeNameSelected: { fontWeight: '600' },
  locationTypeDetails: { color: colors.textMuted, fontSize: 11 },
  locationTypeCost: { color: colors.warning, fontSize: 12, fontWeight: '600' },
  marketOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  marketSelected: { backgroundColor: colors.info },
  marketIcon: { fontSize: 20, marginRight: 12 },
  marketInfo: { flex: 1 },
  marketName: { color: colors.textPrimary, fontSize: 14 },
  marketNameSelected: { fontWeight: '600' },
  marketDetails: { color: colors.textMuted, fontSize: 11 },
  expansionSummary: { backgroundColor: colors.surface, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 15 },
  expansionSummaryTitle: { color: colors.textMuted, fontSize: 12 },
  expansionSummaryValue: { color: colors.primary, fontSize: 28, fontWeight: '700', marginTop: 6 },
  expansionSummaryNote: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  expandButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  expandButtonDisabled: { backgroundColor: colors.surfaceLight },
  expandButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },

  // Modal Franchise
  franchiseIntro: { color: colors.textSecondary, fontSize: 14, marginBottom: 15 },
  franchiseTierOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 8, marginBottom: 10 },
  franchiseTierInfo: { flex: 1 },
  franchiseTierName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  franchiseTierDetails: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  franchiseTierRates: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  franchiseTierFee: { color: colors.success, fontSize: 20, fontWeight: '700' },
  franchiseTierFeeLabel: { color: colors.textMuted, fontSize: 10 },

  // Modal AI Chat
  aiChatContainer: { flex: 1 },
  aiResponse: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 8, minHeight: 150, marginBottom: 15 },
  aiResponseText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  aiInputRow: { flexDirection: 'row', gap: 10 },
  aiInput: { flex: 1, backgroundColor: colors.surface, color: colors.textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  aiSendBtn: { backgroundColor: colors.primary, width: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  aiSendBtnText: { color: colors.background, fontSize: 20, fontWeight: '700' },

  // Modal Save
  saveSlot: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 8, marginBottom: 10 },
  saveSlotTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  saveSlotInfo: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  saveSlotButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  loadBtn: { flex: 1, backgroundColor: colors.info, padding: 10, borderRadius: 6, alignItems: 'center' },
  loadBtnText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  overwriteBtn: { flex: 1, backgroundColor: colors.warning, padding: 10, borderRadius: 6, alignItems: 'center' },
  overwriteBtnText: { color: colors.background, fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.success, padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },

  // Bottom Bar
  bottomBar: { padding: 15, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  nextWeekButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  nextWeekButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
});

  // ============================================
  // RENDER - MAIN DASHBOARD
  // ============================================
  if (screen === 'dashboard' && game) {
    const activeLocation = getActiveLocation();
    const totalCash = game.locations.reduce((sum, l) => sum + l.cash, 0) + game.corporateCash;
    const totalStaff = game.locations.reduce((sum, l) => sum + l.staff.length, 0) + game.corporateStaff.length;
    const avgReputation = game.locations.reduce((sum, l) => sum + l.reputation, 0) / game.locations.length;
    const totalUnits = game.locations.length + game.franchises.length;
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    
    // Warning conditions
    const lowCash = activeLocation && activeLocation.cash < 5000;
    const highBurnout = game.burnout > 70;
    const lowMorale = activeLocation && activeLocation.morale < 40;
    const needsManagers = game.locations.filter(l => !l.manager).length > 1;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{setup.name}</Text>
            <Text style={styles.headerSubtitle}>Week {game.week} • {game.locations.length} Location{game.locations.length > 1 ? 's' : ''}{game.franchises.length > 0 ? ` + ${game.franchises.length} Franchise${game.franchises.length > 1 ? 's' : ''}` : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => setEmpireModal(true)} style={styles.empireButton}>
            <Text style={styles.empireButtonText}>👑</Text>
          </TouchableOpacity>
        </View>

        {/* Location Selector (if multiple) */}
        {game.locations.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationTabs}>
            <TouchableOpacity style={[styles.locationTab, !activeLocationId && styles.locationTabActive]} onPress={() => setActiveLocationId(null)}>
              <Text style={[styles.locationTabText, !activeLocationId && styles.locationTabTextActive]}>🏢 Empire</Text>
            </TouchableOpacity>
            {game.locations.map(loc => (
              <TouchableOpacity key={loc.id} style={[styles.locationTab, activeLocationId === loc.id && styles.locationTabActive]} onPress={() => setActiveLocationId(loc.id)}>
                <Text style={[styles.locationTabText, activeLocationId === loc.id && styles.locationTabTextActive]}>{loc.isGhostKitchen ? '👻' : '🏪'} {loc.name.substring(0, 12)}</Text>
                <Text style={[styles.locationTabCash, loc.cash < 0 && { color: colors.accent }]}>{formatCurrency(loc.cash)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Warning Banner */}
        {(lowCash || highBurnout || lowMorale || needsManagers) && (
          <View style={styles.warningBanner}>
            {lowCash && <Text style={styles.warningText}>⚠️ Low Cash</Text>}
            {highBurnout && <Text style={styles.warningText}>🔥 High Burnout</Text>}
            {lowMorale && <Text style={styles.warningText}>😞 Low Morale</Text>}
            {needsManagers && <Text style={styles.warningText}>👔 Need Managers</Text>}
          </View>
        )}

        {/* AI Message Bar */}
        <TouchableOpacity style={styles.aiBar} onPress={() => setAiChatModal(true)}>
          <Text style={styles.aiBarIcon}>👨‍🍳</Text>
          {aiLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.aiBarText} numberOfLines={2}>{aiMessage || 'Tap to chat with Chef Marcus'}</Text>}
        </TouchableOpacity>

        <ScrollView style={styles.dashboardContent}>
          {/* Empire Overview (shown when no specific location selected OR empire tab) */}
          {(!activeLocationId || game.locations.length === 1) && (
            <View style={styles.empireOverview}>
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatCurrency(game.empireValuation)}</Text>
                  <Text style={styles.statLabel}>Empire Value</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatCurrency(totalCash)}</Text>
                  <Text style={styles.statLabel}>Total Cash</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{totalUnits}</Text>
                  <Text style={styles.statLabel}>Total Units</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{Math.round(avgReputation)}%</Text>
                  <Text style={styles.statLabel}>Avg Reputation</Text>
                </View>
              </View>
              
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatCurrency(game.corporateCash)}</Text>
                  <Text style={styles.statLabel}>Corporate Cash</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]}>{game.burnout}%</Text>
                  <Text style={styles.statLabel}>Owner Burnout</Text>
                </View>
              </View>
            </View>
          )}

          {/* Location-specific view */}
          {activeLocation && activeLocationId && (
            <>
              {/* Location Stats */}
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, activeLocation.cash < 0 && { color: colors.accent }]}>{formatCurrency(activeLocation.cash)}</Text>
                  <Text style={styles.statLabel}>Cash</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: activeLocation.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(activeLocation.lastWeekProfit)}</Text>
                  <Text style={styles.statLabel}>Last Week</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{activeLocation.reputation}%</Text>
                  <Text style={styles.statLabel}>Reputation</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{activeLocation.lastWeekCovers}</Text>
                  <Text style={styles.statLabel}>Covers</Text>
                </View>
              </View>

              {/* Location Health */}
              <View style={styles.healthSection}>
                <View style={styles.healthRow}>
                  <Text style={styles.healthLabel}>Team Morale</Text>
                  <View style={styles.healthBarBg}>
                    <View style={[styles.healthBar, { width: `${activeLocation.morale}%`, backgroundColor: activeLocation.morale > 60 ? colors.success : activeLocation.morale > 40 ? colors.warning : colors.accent }]} />
                  </View>
                  <Text style={styles.healthValue}>{activeLocation.morale}%</Text>
                </View>
                <View style={styles.healthRow}>
                  <Text style={styles.healthLabel}>Manager</Text>
                  <Text style={[styles.healthValue, { color: activeLocation.manager ? colors.success : colors.warning }]}>
                    {activeLocation.manager ? `${activeLocation.manager.name} (${activeLocation.manager.skill}/10)` : 'None assigned'}
                  </Text>
                </View>
              </View>

              {/* Revenue Chart */}
              {activeLocation.weeklyHistory.length > 1 && (
                <View style={styles.chartSection}>
                  <Text style={styles.sectionTitle}>Revenue Trend</Text>
                  <MiniChart data={activeLocation.weeklyHistory.map(w => w.revenue)} color={colors.primary} height={50} />
                  <Text style={styles.sectionTitle}>Profit Trend</Text>
                  <MiniChart data={activeLocation.weeklyHistory.map(w => w.profit)} color={colors.success} height={50} />
                </View>
              )}
            </>
          )}

          {/* Tab Navigation */}
          <View style={styles.tabNav}>
            {['overview', 'staff', 'ops', 'finance'].map(tab => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && activeLocation && (
            <View style={styles.tabContent}>
              {/* Quick Actions */}
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setStaffModal(true)}>
                  <Text style={styles.actionIcon}>👥</Text>
                  <Text style={styles.actionText}>Hire</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setMarketingModal(true)}>
                  <Text style={styles.actionIcon}>📣</Text>
                  <Text style={styles.actionText}>Marketing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setDeliveryModal(true)}>
                  <Text style={styles.actionIcon}>🛵</Text>
                  <Text style={styles.actionText}>Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setExpansionModal(true)}>
                  <Text style={styles.actionIcon}>🏗️</Text>
                  <Text style={styles.actionText}>Expand</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setFranchiseModal(true)}>
                  <Text style={styles.actionIcon}>🤝</Text>
                  <Text style={styles.actionText}>Franchise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setLoanModal(true)}>
                  <Text style={styles.actionIcon}>🏦</Text>
                  <Text style={styles.actionText}>Financing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setAnalyticsModal(true)}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <Text style={styles.actionText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setSaveModal(true)}>
                  <Text style={styles.actionIcon}>💾</Text>
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* Active Systems */}
              <Text style={styles.sectionTitle}>Active Systems</Text>
              <View style={styles.badgeRow}>
                {activeLocation.marketing.channels.map(c => (
                  <View key={c} style={styles.badge}><Text style={styles.badgeText}>{MARKETING_CHANNELS.find(mc => mc.id === c)?.icon} {MARKETING_CHANNELS.find(mc => mc.id === c)?.name}</Text></View>
                ))}
                {activeLocation.delivery.platforms.map(p => (
                  <View key={p} style={[styles.badge, { backgroundColor: colors.info }]}><Text style={styles.badgeText}>{DELIVERY_PLATFORMS.find(dp => dp.id === p)?.icon} {DELIVERY_PLATFORMS.find(dp => dp.id === p)?.name}</Text></View>
                ))}
                {activeLocation.virtualBrands.map(vb => (
                  <View key={vb} style={[styles.badge, { backgroundColor: colors.purple }]}><Text style={styles.badgeText}>{VIRTUAL_BRANDS.find(v => v.id === vb)?.icon} {VIRTUAL_BRANDS.find(v => v.id === vb)?.name}</Text></View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'staff' && activeLocation && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Staff ({activeLocation.staff.length})</Text>
                <TouchableOpacity style={styles.smallButton} onPress={() => setStaffModal(true)}>
                  <Text style={styles.smallButtonText}>+ Hire</Text>
                </TouchableOpacity>
              </View>
              
              {activeLocation.staff.map(s => (
                <View key={s.id} style={styles.staffCard}>
                  <Text style={styles.staffIcon}>{s.icon}</Text>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{s.name} {activeLocation.manager?.id === s.id && '👔'}</Text>
                    <Text style={styles.staffRole}>{s.role} • ${s.wage}/hr • Skill {s.skill}/10</Text>
                    <View style={styles.moraleBar}>
                      <View style={[styles.moraleFill, { width: `${s.morale}%`, backgroundColor: s.morale > 60 ? colors.success : s.morale > 40 ? colors.warning : colors.accent }]} />
                    </View>
                  </View>
                  <View style={styles.staffActions}>
                    {s.canManage && !activeLocation.manager && (
                      <TouchableOpacity style={styles.microButton} onPress={() => promoteToManager(s.id)}>
                        <Text style={styles.microButtonText}>👔</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.microButton} onPress={() => { setSelectedStaff(s); setTrainingModal(true); }}>
                      <Text style={styles.microButtonText}>📚</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.microButton, { backgroundColor: colors.accent }]} onPress={() => fireStaff(s.id)}>
                      <Text style={styles.microButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {activeLocation.staff.length === 0 && (
                <Text style={styles.emptyText}>No staff hired yet</Text>
              )}
            </View>
          )}

          {activeTab === 'ops' && activeLocation && (
            <View style={styles.tabContent}>
              {/* Menu */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Menu ({activeLocation.menu.length} items)</Text>
                <TouchableOpacity style={styles.smallButton} onPress={addMenuItem}>
                  <Text style={styles.smallButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {activeLocation.menu.slice(0, 5).map(item => (
                <View key={item.id} style={[styles.menuItem, item.is86d && styles.menuItem86d]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemName, item.is86d && styles.menuItemName86d]}>{item.name} {item.popular && '⭐'}</Text>
                    <Text style={styles.menuItemPrice}>{formatCurrency(item.price)} • Cost: {formatCurrency(item.cost)}</Text>
                  </View>
                  <TouchableOpacity style={styles.toggle86} onPress={() => toggle86(item.id)}>
                    <Text style={styles.toggle86Text}>{item.is86d ? 'RESTORE' : "86"}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Equipment */}
              <Text style={styles.sectionTitle}>Equipment</Text>
              <View style={styles.equipGrid}>
                {EQUIPMENT.slice(0, 6).map(eq => {
                  const owned = activeLocation.equipment.includes(eq.id);
                  return (
                    <TouchableOpacity key={eq.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => !owned && buyEquipment(eq)} disabled={owned}>
                      <Text style={{ fontSize: 20 }}>{eq.icon}</Text>
                      <Text style={styles.equipName}>{eq.name}</Text>
                      <Text style={styles.equipPrice}>{owned ? 'OWNED' : formatCurrency(eq.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Upgrades */}
              <Text style={styles.sectionTitle}>Upgrades</Text>
              <View style={styles.equipGrid}>
                {UPGRADES.slice(0, 4).map(up => {
                  const owned = activeLocation.upgrades.includes(up.id);
                  return (
                    <TouchableOpacity key={up.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => !owned && buyUpgrade(up)} disabled={owned}>
                      <Text style={{ fontSize: 20 }}>{up.icon}</Text>
                      <Text style={styles.equipName}>{up.name}</Text>
                      <Text style={styles.equipPrice}>{owned ? 'OWNED' : formatCurrency(up.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {activeTab === 'finance' && (
            <View style={styles.tabContent}>
              {/* Empire Financials */}
              <Text style={styles.sectionTitle}>Empire Financials</Text>
              <View style={styles.financeGrid}>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Total Cash (All Locations)</Text>
                  <Text style={styles.financeValue}>{formatCurrency(game.locations.reduce((sum, l) => sum + l.cash, 0))}</Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Corporate Reserve</Text>
                  <Text style={styles.financeValue}>{formatCurrency(game.corporateCash)}</Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Weekly Franchise Royalties</Text>
                  <Text style={[styles.financeValue, { color: colors.success }]}>{formatCurrency(game.franchises.reduce((sum, f) => sum + f.weeklyRoyalty, 0))}</Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Weekly Loan Payments</Text>
                  <Text style={[styles.financeValue, { color: colors.accent }]}>-{formatCurrency(game.loans.reduce((sum, l) => sum + (LOANS.find(lo => lo.id === l.type)?.weeklyPayment || 0), 0))}</Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Empire Valuation</Text>
                  <Text style={[styles.financeValue, { color: colors.primary, fontWeight: 'bold' }]}>{formatCurrency(game.empireValuation)}</Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Your Equity</Text>
                  <Text style={styles.financeValue}>{game.equity}%</Text>
                </View>
              </View>

              {/* Active Loans */}
              {game.loans.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Active Loans</Text>
                  {game.loans.map((loan, i) => {
                    const loanData = LOANS.find(l => l.id === loan.type);
                    return (
                      <View key={i} style={styles.loanCard}>
                        <Text style={styles.loanName}>{loanData?.name}</Text>
                        <Text style={styles.loanDetails}>{formatCurrency(loan.principal)} • {formatCurrency(loanData?.weeklyPayment || 0)}/week • {loan.remaining} weeks left</Text>
                      </View>
                    );
                  })}
                </>
              )}

              {/* Franchises */}
              {game.franchises.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Franchises</Text>
                  {game.franchises.map((f, i) => (
                    <View key={i} style={styles.franchiseCard}>
                      <Text style={styles.franchiseName}>{f.name}</Text>
                      <Text style={styles.franchiseDetails}>Royalty: {formatCurrency(f.weeklyRoyalty)}/week • Quality: {f.quality}%</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {/* Padding at bottom */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Process Week Button */}
        <View style={styles.weekButtonContainer}>
          <TouchableOpacity style={styles.weekButton} onPress={processWeek}>
            <Text style={styles.weekButtonText}>PROCESS WEEK {game.week + 1}</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* MODALS */}
        {/* ============================================ */}

        {/* Staff Hire Modal */}
        <Modal visible={staffModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hire Staff</Text>
                <TouchableOpacity onPress={() => setStaffModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Location Cash: {formatCurrency(activeLocation?.cash || 0)}</Text>
              <ScrollView style={styles.modalScroll}>
                {STAFF_TEMPLATES.filter(t => t.department !== 'corporate').map(t => (
                  <TouchableOpacity key={t.role} style={styles.hireOption} onPress={() => hireStaff(t)}>
                    <Text style={styles.hireIcon}>{t.icon}</Text>
                    <View style={styles.hireInfo}>
                      <Text style={styles.hireName}>{t.role}</Text>
                      <Text style={styles.hireDetails}>${t.wage}/hr • {t.department} {t.canManage && '• Can Manage'}</Text>
                    </View>
                    <Text style={styles.hireCost}>{formatCurrency(t.wage * 40)}/wk</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Training Modal */}
        <Modal visible={trainingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Training: {selectedStaff?.name}</Text>
                <TouchableOpacity onPress={() => { setTrainingModal(false); setSelectedStaff(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {TRAINING_PROGRAMS.map(p => {
                  const hasTraining = selectedStaff?.training?.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.trainingOption, hasTraining && styles.trainingComplete]} onPress={() => !hasTraining && startTraining(p)} disabled={hasTraining}>
                      <Text style={styles.trainingIcon}>{p.icon}</Text>
                      <View style={styles.trainingInfo}>
                        <Text style={styles.trainingName}>{p.name}</Text>
                        <Text style={styles.trainingDetails}>+{p.skillBoost} skill • +{p.morale} morale • {p.weeks} week{p.weeks > 1 ? 's' : ''}</Text>
                      </View>
                      <Text style={styles.trainingCost}>{hasTraining ? '✓' : formatCurrency(p.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Marketing Modal */}
        <Modal visible={marketingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Marketing Channels</Text>
                <TouchableOpacity onPress={() => setMarketingModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {MARKETING_CHANNELS.map(ch => {
                  const active = activeLocation?.marketing?.channels?.includes(ch.id);
                  return (
                    <TouchableOpacity key={ch.id} style={[styles.channelOption, active && styles.channelActive]} onPress={() => toggleMarketingChannel(ch.id)}>
                      <Text style={styles.channelIcon}>{ch.icon}</Text>
                      <View style={styles.channelInfo}>
                        <Text style={styles.channelName}>{ch.name}</Text>
                        <Text style={styles.channelDetails}>{ch.costPerWeek > 0 ? `${formatCurrency(ch.costPerWeek)}/week` : 'Free'} • +{Math.round(ch.effect.reach * 100)}% reach</Text>
                      </View>
                      <View style={[styles.channelToggle, active && styles.channelToggleActive]}>
                        <Text style={styles.channelToggleText}>{active ? 'ON' : 'OFF'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Delivery Modal */}
        <Modal visible={deliveryModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delivery & Virtual Brands</Text>
                <TouchableOpacity onPress={() => setDeliveryModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.subsectionTitle}>Delivery Platforms</Text>
                {DELIVERY_PLATFORMS.map(p => {
                  const active = activeLocation?.delivery?.platforms?.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.deliveryOption, active && styles.deliveryActive]} onPress={() => toggleDeliveryPlatform(p.id)}>
                      <Text style={styles.deliveryIcon}>{p.icon}</Text>
                      <View style={styles.deliveryInfo}>
                        <Text style={styles.deliveryName}>{p.name}</Text>
                        <Text style={styles.deliveryDetails}>{Math.round(p.commission * 100)}% commission • Setup: {formatCurrency(p.setup)}</Text>
                      </View>
                      <View style={[styles.channelToggle, active && styles.channelToggleActive]}>
                        <Text style={styles.channelToggleText}>{active ? 'ON' : 'OFF'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                
                <Text style={styles.subsectionTitle}>Virtual Brands (Ghost Kitchens)</Text>
                {VIRTUAL_BRANDS.map(vb => {
                  const active = activeLocation?.virtualBrands?.includes(vb.id);
                  return (
                    <TouchableOpacity key={vb.id} style={[styles.deliveryOption, active && styles.deliveryActive]} onPress={() => !active && launchVirtualBrand(vb.id)} disabled={active}>
                      <Text style={styles.deliveryIcon}>{vb.icon}</Text>
                      <View style={styles.deliveryInfo}>
                        <Text style={styles.deliveryName}>{vb.name}</Text>
                        <Text style={styles.deliveryDetails}>Avg ticket: {formatCurrency(vb.avgTicket)} • Setup: {formatCurrency(vb.setupCost)}</Text>
                      </View>
                      <Text style={styles.deliveryCost}>{active ? '✓ ACTIVE' : 'LAUNCH'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Expansion Modal */}
        <Modal visible={expansionModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Open New Location</Text>
                <TouchableOpacity onPress={() => setExpansionModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Corporate Cash: {formatCurrency(game?.corporateCash || 0)}</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.subsectionTitle}>Location Name</Text>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="e.g., Downtown" 
                  placeholderTextColor={colors.textMuted} 
                  value={newLocationData.name} 
                  onChangeText={t => setNewLocationData(d => ({ ...d, name: t }))} 
                />
                
                <Text style={styles.subsectionTitle}>Location Type</Text>
                {LOCATION_TYPES.map(lt => (
                  <TouchableOpacity key={lt.id} style={[styles.locationOption, newLocationData.type === lt.id && styles.locationOptionActive]} onPress={() => setNewLocationData(d => ({ ...d, type: lt.id }))}>
                    <Text style={{ fontSize: 20 }}>{lt.icon}</Text>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{lt.name}</Text>
                      <Text style={styles.locationDetails}>Buildout: {formatCurrency(lt.buildoutCost)} • Rent: {lt.rentMod > 1 ? '+' : ''}{Math.round((lt.rentMod - 1) * 100)}%</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <Text style={styles.subsectionTitle}>Market</Text>
                {MARKETS.map(m => (
                  <TouchableOpacity key={m.id} style={[styles.locationOption, newLocationData.market === m.id && styles.locationOptionActive]} onPress={() => setNewLocationData(d => ({ ...d, market: m.id }))}>
                    <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{m.name}</Text>
                      <Text style={styles.locationDetails}>Brand Boost: {Math.round(m.brandBonus * 100)}% • Mgmt Cost: {formatCurrency(m.managementCost)}/wk {m.requiresManager && '• Needs Manager'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <View style={styles.expansionSummary}>
                  <Text style={styles.summaryTitle}>Total Cost: {formatCurrency(LOCATION_TYPES.find(t => t.id === newLocationData.type)?.buildoutCost || 0)}</Text>
                </View>
                
                <TouchableOpacity style={styles.expandButton} onPress={openNewLocation}>
                  <Text style={styles.expandButtonText}>OPEN LOCATION</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Franchise Modal */}
        <Modal visible={franchiseModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Franchising</Text>
                <TouchableOpacity onPress={() => setFranchiseModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {!game?.franchiseEnabled ? (
                  <>
                    <Text style={styles.franchiseExplain}>
                      Franchising lets others open restaurants under your brand. You get upfront fees + ongoing royalties.
                    </Text>
                    <Text style={styles.franchiseRequirements}>
                      Requirements:{'\n'}• 3+ successful locations{'\n'}• $50K setup cost{'\n'}• Documented systems
                    </Text>
                    <TouchableOpacity 
                      style={[styles.expandButton, (game?.locations?.length < 3 || game?.corporateCash < 50000) && styles.expandButtonDisabled]} 
                      onPress={enableFranchising}
                      disabled={game?.locations?.length < 3 || game?.corporateCash < 50000}
                    >
                      <Text style={styles.expandButtonText}>
                        {game?.locations?.length < 3 ? `NEED ${3 - game?.locations?.length} MORE LOCATIONS` : game?.corporateCash < 50000 ? 'NEED $50K' : 'ENABLE FRANCHISING ($50K)'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.franchiseExplain}>
                      Your franchise program is active! Sell franchise licenses to expand your brand.
                    </Text>
                    <Text style={styles.subsectionTitle}>Sell Franchise</Text>
                    {FRANCHISE_TIERS.map(tier => (
                      <TouchableOpacity key={tier.id} style={styles.franchiseTierCard} onPress={() => sellFranchise(tier.id)}>
                        <Text style={styles.franchiseTierName}>{tier.name}</Text>
                        <Text style={styles.franchiseTierDetails}>
                          Fee: {formatCurrency(tier.fee)} • Royalty: {formatPct(tier.royalty)} • Min {tier.minLocations} unit{tier.minLocations > 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.sellFranchiseText}>SELL →</Text>
                      </TouchableOpacity>
                    ))}
                    
                    {game?.franchises?.length > 0 && (
                      <>
                        <Text style={styles.subsectionTitle}>Your Franchises ({game.franchises.length})</Text>
                        {game.franchises.map((f, i) => (
                          <View key={i} style={styles.existingFranchise}>
                            <Text style={styles.existingFranchiseName}>{f.name}</Text>
                            <Text style={styles.existingFranchiseDetails}>
                              Royalty: {formatCurrency(f.weeklyRoyalty)}/wk • Quality: {f.quality}%
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Loan Modal */}
        <Modal visible={loanModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Financing Options</Text>
                <TouchableOpacity onPress={() => setLoanModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {LOANS.map(loan => (
                  <TouchableOpacity key={loan.id} style={styles.loanOption} onPress={() => takeLoan(loan.id)}>
                    <View style={styles.loanInfo}>
                      <Text style={styles.loanOptionName}>{loan.name}</Text>
                      <Text style={styles.loanOptionDetails}>
                        {formatCurrency(loan.amount)} • {formatPct(loan.rate)} APR • {loan.term} weeks
                      </Text>
                      <Text style={styles.loanPayment}>{formatCurrency(loan.weeklyPayment)}/week {loan.equity && `• ${loan.equity * 100}% equity`}</Text>
                    </View>
                    <Text style={styles.loanTake}>TAKE →</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Analytics Modal */}
        <Modal visible={analyticsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Empire Analytics</Text>
                <TouchableOpacity onPress={() => setAnalyticsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.subsectionTitle}>Key Metrics</Text>
                <View style={styles.analyticsGrid}>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsValue}>{game?.week}</Text>
                    <Text style={styles.analyticsLabel}>Weeks</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsValue}>{game?.locations?.length + game?.franchises?.length}</Text>
                    <Text style={styles.analyticsLabel}>Total Units</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsValue}>{formatCurrency(game?.empireValuation || 0)}</Text>
                    <Text style={styles.analyticsLabel}>Valuation</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsValue}>{totalStaff}</Text>
                    <Text style={styles.analyticsLabel}>Total Staff</Text>
                  </View>
                </View>
                
                <Text style={styles.subsectionTitle}>Location Performance</Text>
                {game?.locations?.map(loc => (
                  <View key={loc.id} style={styles.locationPerf}>
                    <Text style={styles.locationPerfName}>{loc.name}</Text>
                    <View style={styles.locationPerfRow}>
                      <Text style={styles.locationPerfLabel}>Cash:</Text>
                      <Text style={[styles.locationPerfValue, loc.cash < 0 && { color: colors.accent }]}>{formatCurrency(loc.cash)}</Text>
                    </View>
                    <View style={styles.locationPerfRow}>
                      <Text style={styles.locationPerfLabel}>Last Week:</Text>
                      <Text style={[styles.locationPerfValue, { color: loc.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(loc.lastWeekProfit)}</Text>
                    </View>
                    <View style={styles.locationPerfRow}>
                      <Text style={styles.locationPerfLabel}>Reputation:</Text>
                      <Text style={styles.locationPerfValue}>{loc.reputation}%</Text>
                    </View>
                    <View style={styles.locationPerfRow}>
                      <Text style={styles.locationPerfLabel}>Manager:</Text>
                      <Text style={styles.locationPerfValue}>{loc.manager ? loc.manager.name : 'None'}</Text>
                    </View>
                  </View>
                ))}

                <Text style={styles.subsectionTitle}>Achievements ({game?.achievements?.length || 0})</Text>
                <View style={styles.achievementGrid}>
                  {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
                    const unlocked = game?.achievements?.includes(id);
                    return (
                      <View key={id} style={[styles.achievementCard, !unlocked && styles.achievementLocked]}>
                        <Text style={styles.achievementIcon}>{unlocked ? ach.icon : '🔒'}</Text>
                        <Text style={styles.achievementName}>{ach.name}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Empire Overview Modal */}
        <Modal visible={empireModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👑 Empire Overview</Text>
                <TouchableOpacity onPress={() => setEmpireModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.empireHeader}>
                  <Text style={styles.empireName}>{setup.name} Empire</Text>
                  <Text style={styles.empireValuationBig}>{formatCurrency(game?.empireValuation || 0)}</Text>
                  <Text style={styles.empireValuationLabel}>Total Valuation</Text>
                </View>
                
                <View style={styles.empireStats}>
                  <View style={styles.empireStat}>
                    <Text style={styles.empireStatValue}>{game?.locations?.length}</Text>
                    <Text style={styles.empireStatLabel}>Owned</Text>
                  </View>
                  <View style={styles.empireStat}>
                    <Text style={styles.empireStatValue}>{game?.franchises?.length}</Text>
                    <Text style={styles.empireStatLabel}>Franchised</Text>
                  </View>
                  <View style={styles.empireStat}>
                    <Text style={styles.empireStatValue}>{game?.equity}%</Text>
                    <Text style={styles.empireStatLabel}>Your Equity</Text>
                  </View>
                </View>
                
                <Text style={styles.subsectionTitle}>All Locations</Text>
                {game?.locations?.map(loc => (
                  <TouchableOpacity key={loc.id} style={styles.empireLocation} onPress={() => { setActiveLocationId(loc.id); setEmpireModal(false); }}>
                    <Text style={{ fontSize: 24 }}>{loc.isGhostKitchen ? '👻' : '🏪'}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.empireLocationName}>{loc.name}</Text>
                      <Text style={styles.empireLocationDetails}>
                        {LOCATION_TYPES.find(t => t.id === loc.locationType)?.name} • {MARKETS.find(m => m.id === loc.market)?.name}
                      </Text>
                      <Text style={[styles.empireLocationCash, loc.cash < 0 && { color: colors.accent }]}>
                        {formatCurrency(loc.cash)} • {loc.staff.length} staff • {loc.reputation}% rep
                      </Text>
                    </View>
                    <Text style={styles.empireLocationArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Save/Load Modal */}
        <Modal visible={saveModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Save / Load Game</Text>
                <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {[1, 2, 3].map(slot => {
                  const save = savedGames.find(s => s.slot === slot);
                  return (
                    <View key={slot} style={styles.saveSlot}>
                      <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                      {save ? (
                        <>
                          <Text style={styles.saveSlotInfo}>{save.setup.name} • Week {save.game.week} • {save.game.locations.length} locations</Text>
                          <Text style={styles.saveSlotDate}>{new Date(save.date).toLocaleDateString()}</Text>
                          <View style={styles.saveSlotButtons}>
                            <TouchableOpacity style={styles.loadButton} onPress={() => loadGame(save)}>
                              <Text style={styles.loadButtonText}>Load</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={() => saveGame(slot)}>
                              <Text style={styles.saveButtonText}>Overwrite</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                          <Text style={styles.saveSlotEmpty}>Empty</Text>
                          <TouchableOpacity style={styles.saveButton} onPress={() => saveGame(slot)}>
                            <Text style={styles.saveButtonText}>Save Here</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
                <TouchableOpacity style={styles.restartFromSave} onPress={restart}>
                  <Text style={styles.restartFromSaveText}>🔄 Restart Game</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AI Chat Modal */}
        <Modal visible={aiChatModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👨‍🍳 Chef Marcus</Text>
                <TouchableOpacity onPress={() => setAiChatModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.aiChatContent}>
                <View style={styles.aiChatBubble}>
                  {aiLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.aiChatText}>{aiMessage || "What's on your mind? Ask me anything about running your empire."}</Text>}
                </View>
                <View style={styles.aiChatInputRow}>
                  <TextInput style={styles.aiChatInput} placeholder="Ask Chef Marcus..." placeholderTextColor={colors.textMuted} value={aiChatInput} onChangeText={setAiChatInput} />
                  <TouchableOpacity style={styles.aiChatSend} onPress={askAI}>
                    <Text style={styles.aiChatSendText}>→</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.aiQuickQuestions}>
                  {['Should I expand?', 'Is franchising right for me?', 'How do I reduce burnout?', 'What should I focus on?'].map(q => (
                    <TouchableOpacity key={q} style={styles.aiQuickQ} onPress={() => { setAiChatInput(q); }}>
                      <Text style={styles.aiQuickQText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return null;
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Welcome
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  welcomeTitle: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -2 },
  welcomeDivider: { width: 60, height: 3, backgroundColor: colors.primary, marginVertical: 24 },
  welcomeQuote: { fontSize: 16, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 16, maxWidth: 320 },
  welcomeSubtext: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  startButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 8 },
  startButtonText: { color: colors.background, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  versionText: { position: 'absolute', bottom: 32, fontSize: 12, color: colors.textMuted },

  // Onboarding
  onboardingContainer: { flex: 1 },
  onboardingContent: { padding: 24 },
  progressBarContainer: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 16 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  stepText: { fontSize: 12, color: colors.textMuted, letterSpacing: 2, marginBottom: 8 },
  messageBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderLeftWidth: 3, borderLeftColor: colors.primary },
  messageText: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  dropdownButton: { backgroundColor: colors.surface, borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dropdownText: { fontSize: 16, color: colors.textPrimary },
  dropdownPlaceholder: { fontSize: 16, color: colors.textMuted },
  dropdownArrow: { fontSize: 12, color: colors.textMuted },
  selectedCuisine: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  selectedIcon: { fontSize: 40, marginRight: 16 },
  selectedName: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  selectedStats: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  capitalDisplay: { alignItems: 'center', marginBottom: 16 },
  capitalAmount: { fontSize: 48, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  tierText: { fontSize: 11, fontWeight: '700', color: colors.background, letterSpacing: 1 },
  tierDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, color: colors.textMuted },
  textInput: { backgroundColor: colors.surface, borderRadius: 8, padding: 16, fontSize: 16, color: colors.textPrimary, marginBottom: 16 },
  goalOptions: { marginBottom: 24 },
  goalButton: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  goalButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  goalText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  goalTextActive: { color: colors.background },
  goalDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  continueButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  continueButtonDisabled: { backgroundColor: colors.surfaceLight },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: colors.background, letterSpacing: 1 },
  continueButtonTextDisabled: { color: colors.textMuted },
  backButton: { padding: 16, alignItems: 'center' },
  backButtonText: { fontSize: 14, color: colors.textSecondary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 20, paddingTop: 8 },
  modalClose: { fontSize: 20, color: colors.textSecondary },
  modalScroll: { padding: 20 },
  searchInput: { backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 12, fontSize: 15, color: colors.textPrimary, marginBottom: 16 },
  cuisineList: { maxHeight: 400 },
  cuisineOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  cuisineOptionSelected: { backgroundColor: colors.primary },
  cuisineIcon: { fontSize: 28, marginRight: 12 },
  cuisineInfo: { flex: 1 },
  cuisineName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  cuisineNameSelected: { color: colors.background },
  cuisineStats: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empireButton: { backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
  empireButtonText: { fontSize: 20 },

  // Location Tabs
  locationTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 8 },
  locationTab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 4 },
  locationTabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  locationTabText: { fontSize: 13, color: colors.textSecondary },
  locationTabTextActive: { color: colors.primary, fontWeight: '600' },
  locationTabCash: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Warning Banner
  warningBanner: { flexDirection: 'row', backgroundColor: colors.accent + '20', padding: 8, justifyContent: 'center', flexWrap: 'wrap', gap: 12 },
  warningText: { fontSize: 12, color: colors.accent, fontWeight: '600' },

  // AI Bar
  aiBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  aiBarIcon: { fontSize: 24, marginRight: 12 },
  aiBarText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  // Dashboard
  dashboardContent: { flex: 1 },
  empireOverview: { padding: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  statBox: { width: '50%', padding: 8 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Health Section
  healthSection: { paddingHorizontal: 16, marginBottom: 16 },
  healthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  healthLabel: { width: 100, fontSize: 12, color: colors.textSecondary },
  healthBarBg: { flex: 1, height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, marginHorizontal: 8 },
  healthBar: { height: 8, borderRadius: 4 },
  healthValue: { width: 60, fontSize: 12, color: colors.textPrimary, textAlign: 'right' },

  // Chart
  chartSection: { paddingHorizontal: 16, marginBottom: 16 },

  // Tab Navigation
  tabNav: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },

  // Tab Content
  tabContent: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, marginTop: 8 },
  subsectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 16, marginBottom: 8 },
  smallButton: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  smallButtonText: { fontSize: 12, fontWeight: '600', color: colors.background },

  // Action Grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { width: '23%', backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionText: { fontSize: 10, color: colors.textSecondary },

  // Badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: colors.success + '30', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { fontSize: 11, color: colors.textPrimary },

  // Staff Card
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  staffIcon: { fontSize: 28, marginRight: 12 },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  staffRole: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  moraleBar: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginTop: 6 },
  moraleFill: { height: 4, borderRadius: 2 },
  staffActions: { flexDirection: 'row', gap: 6 },
  microButton: { backgroundColor: colors.surfaceLight, padding: 8, borderRadius: 6 },
  microButtonText: { fontSize: 14 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', padding: 24 },

  // Menu Item
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 8 },
  menuItem86d: { opacity: 0.5 },
  menuItemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  menuItemName86d: { textDecorationLine: 'line-through' },
  menuItemPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  toggle86: { backgroundColor: colors.accent, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  toggle86Text: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },

  // Equipment Grid
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  equipCard: { width: '48%', backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  equipCardOwned: { borderWidth: 2, borderColor: colors.success },
  equipName: { fontSize: 12, color: colors.textPrimary, marginTop: 8, textAlign: 'center' },
  equipPrice: { fontSize: 11, color: colors.primary, marginTop: 4, fontWeight: '600' },

  // Finance
  financeGrid: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  financeLabel: { fontSize: 13, color: colors.textSecondary },
  financeValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  loanCard: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 8 },
  loanName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  loanDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  franchiseCard: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 8 },
  franchiseName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  franchiseDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  // Week Button
  weekButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: colors.background },
  weekButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  weekButtonText: { fontSize: 16, fontWeight: '700', color: colors.background, letterSpacing: 1 },

  // Hire Modal
  hireOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  hireIcon: { fontSize: 28, marginRight: 12 },
  hireInfo: { flex: 1 },
  hireName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  hireDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  hireCost: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Training Modal
  trainingOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  trainingComplete: { opacity: 0.5 },
  trainingIcon: { fontSize: 28, marginRight: 12 },
  trainingInfo: { flex: 1 },
  trainingName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  trainingDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  trainingCost: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Channel/Delivery Options
  channelOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  channelActive: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  channelIcon: { fontSize: 24, marginRight: 12 },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  channelDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  channelToggle: { backgroundColor: colors.surfaceLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  channelToggleActive: { backgroundColor: colors.success },
  channelToggleText: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  deliveryActive: { backgroundColor: colors.info + '20', borderWidth: 1, borderColor: colors.info },
  deliveryIcon: { fontSize: 24, marginRight: 12 },
  deliveryInfo: { flex: 1 },
  deliveryName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  deliveryDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  deliveryCost: { fontSize: 12, fontWeight: '600', color: colors.success },

  // Expansion Modal
  locationOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  locationOptionActive: { backgroundColor: colors.primary + '30', borderWidth: 1, borderColor: colors.primary },
  locationInfo: { flex: 1, marginLeft: 12 },
  locationName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  locationDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  expansionSummary: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginVertical: 16, alignItems: 'center' },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  expandButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  expandButtonDisabled: { backgroundColor: colors.surfaceLight },
  expandButtonText: { fontSize: 14, fontWeight: '700', color: colors.background, letterSpacing: 1 },

  // Franchise Modal
  franchiseExplain: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  franchiseRequirements: { fontSize: 13, color: colors.textMuted, backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 16 },
  franchiseTierCard: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 12 },
  franchiseTierName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  franchiseTierDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sellFranchiseText: { fontSize: 13, color: colors.primary, fontWeight: '700', marginTop: 8 },
  existingFranchise: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 8 },
  existingFranchiseName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  existingFranchiseDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  // Loan Modal
  loanOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  loanInfo: { flex: 1 },
  loanOptionName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  loanOptionDetails: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  loanPayment: { fontSize: 11, color: colors.warning, marginTop: 2 },
  loanTake: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  // Analytics Modal
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  analyticsCard: { width: '48%', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, alignItems: 'center' },
  analyticsValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  analyticsLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  locationPerf: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  locationPerfName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  locationPerfRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  locationPerfLabel: { fontSize: 12, color: colors.textSecondary },
  locationPerfValue: { fontSize: 12, color: colors.textPrimary },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievementCard: { width: '23%', backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 8, alignItems: 'center' },
  achievementLocked: { opacity: 0.4 },
  achievementIcon: { fontSize: 20 },
  achievementName: { fontSize: 9, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

  // Empire Modal
  empireHeader: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 },
  empireName: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  empireValuationBig: { fontSize: 36, fontWeight: '700', color: colors.primary },
  empireValuationLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  empireStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  empireStat: { alignItems: 'center' },
  empireStatValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  empireStatLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  empireLocation: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 8 },
  empireLocationName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  empireLocationDetails: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  empireLocationCash: { fontSize: 12, color: colors.success, marginTop: 4 },
  empireLocationArrow: { fontSize: 18, color: colors.textMuted },

  // Save Modal
  saveSlot: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 12 },
  saveSlotTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  saveSlotInfo: { fontSize: 13, color: colors.textSecondary },
  saveSlotDate: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  saveSlotEmpty: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  saveSlotButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  loadButton: { flex: 1, backgroundColor: colors.info, padding: 10, borderRadius: 8, alignItems: 'center' },
  loadButtonText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  saveButton: { flex: 1, backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { fontSize: 13, fontWeight: '600', color: colors.background },
  restartFromSave: { padding: 16, alignItems: 'center' },
  restartFromSaveText: { fontSize: 14, color: colors.accent },

  // AI Chat Modal
  aiChatContent: { padding: 20 },
  aiChatBubble: { backgroundColor: colors.surfaceLight, borderRadius: 16, padding: 16, marginBottom: 16 },
  aiChatText: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  aiChatInputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  aiChatInput: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, fontSize: 15, color: colors.textPrimary },
  aiChatSend: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, justifyContent: 'center' },
  aiChatSendText: { fontSize: 18, color: colors.background },
  aiQuickQuestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aiQuickQ: { backgroundColor: colors.surfaceLight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  aiQuickQText: { fontSize: 12, color: colors.textSecondary },

  // Scenario
  scenarioContainer: { flex: 1 },
  scenarioContent: { padding: 24 },
  scenarioTypeBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, marginBottom: 16 },
  scenarioTypeText: { fontSize: 11, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 },
  scenarioTitle: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  scenarioSubtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  scenarioMessageBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 24 },
  scenarioMessage: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  scenarioOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  scenarioOptionText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  scenarioChance: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  scenarioResult: { alignItems: 'center', marginBottom: 24 },
  scenarioResultText: { fontSize: 24, fontWeight: '700' },
  aiCommentBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  aiCommentLabel: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 8 },
  aiCommentText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  lessonBox: { backgroundColor: colors.primary + '15', borderRadius: 12, padding: 16, marginBottom: 24 },
  lessonLabel: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  lessonText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  // End Screens
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  endTitle: { fontSize: 36, fontWeight: '900', marginTop: 16 },
  endSubtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  endDivider: { width: 60, height: 3, marginVertical: 24 },
  endStats: { width: '100%', backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24 },
  endStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  endStatLabel: { fontSize: 14, color: colors.textSecondary },
  endStatValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  restartButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 8 },
  restartButtonText: { fontSize: 16, fontWeight: '700', color: colors.background, letterSpacing: 1 },
});
