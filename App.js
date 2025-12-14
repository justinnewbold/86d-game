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
// COMPETITION SYSTEM (Phase 4)
// ============================================
const COMPETITOR_TYPES = [
  { id: 'local_indie', name: 'Local Independent', icon: '🏠', threat: 0.1, priceCompetition: 0.05, qualityFocus: 0.8 },
  { id: 'regional_chain', name: 'Regional Chain', icon: '🏪', threat: 0.2, priceCompetition: 0.15, qualityFocus: 0.6 },
  { id: 'national_chain', name: 'National Chain', icon: '🏢', threat: 0.3, priceCompetition: 0.25, qualityFocus: 0.4 },
  { id: 'ghost_kitchen', name: 'Ghost Kitchen', icon: '👻', threat: 0.15, priceCompetition: 0.2, qualityFocus: 0.5, deliveryOnly: true },
  { id: 'fast_casual', name: 'Fast Casual', icon: '🚀', threat: 0.25, priceCompetition: 0.2, qualityFocus: 0.7 },
  { id: 'fine_dining', name: 'Fine Dining', icon: '✨', threat: 0.1, priceCompetition: 0, qualityFocus: 0.95, priceUp: true },
];

const COMPETITOR_NAMES = {
  burgers: ['Burger Barn', 'Patty Palace', 'Bun & Done', 'Stack Attack', 'Grillmasters'],
  mexican: ['Casa Grande', 'Taco Town', 'El Sabor', 'Fiesta Fresh', 'Salsa Sisters'],
  pizza: ['Slice Heaven', 'Dough Bros', 'Pie Perfect', 'Crust & Co', 'Pepperoni Pete'],
  chinese: ['Golden Dragon', 'Wok This Way', 'Lucky Panda', 'Oriental Garden', 'Jade Palace'],
  japanese: ['Sakura Sushi', 'Tokyo Table', 'Rising Sun', 'Wasabi House', 'Ninja Kitchen'],
  default: ['The Competition', 'Rival Kitchen', 'Other Place', 'Next Door', 'Down the Street'],
};

const generateCompetitor = (cuisine, locationType) => {
  const type = COMPETITOR_TYPES[Math.floor(Math.random() * COMPETITOR_TYPES.length)];
  const names = COMPETITOR_NAMES[cuisine] || COMPETITOR_NAMES.default;
  return {
    id: Date.now() + Math.random(),
    name: names[Math.floor(Math.random() * names.length)],
    type: type.id,
    icon: type.icon,
    threat: type.threat * (0.8 + Math.random() * 0.4),
    reputation: 50 + Math.floor(Math.random() * 40),
    priceLevel: Math.floor(Math.random() * 3) + 1, // 1-3: $, $$, $$$
    weeksOpen: Math.floor(Math.random() * 100),
    aggressive: Math.random() > 0.7,
    specialties: [],
  };
};

// ============================================
// VENDOR SYSTEM (Phase 4)
// ============================================
const VENDORS = [
  { id: 'sysco', name: 'Sysco', icon: '🚛', type: 'broadline', priceLevel: 1.0, quality: 0.7, reliability: 0.9, minOrder: 500 },
  { id: 'usfoods', name: 'US Foods', icon: '🚚', type: 'broadline', priceLevel: 0.98, quality: 0.72, reliability: 0.88, minOrder: 400 },
  { id: 'pfg', name: 'Performance Food', icon: '📦', type: 'broadline', priceLevel: 0.95, quality: 0.68, reliability: 0.85, minOrder: 300 },
  { id: 'local_farms', name: 'Local Farms Co-op', icon: '🌾', type: 'specialty', priceLevel: 1.15, quality: 0.95, reliability: 0.7, minOrder: 200, seasonal: true },
  { id: 'premium_meats', name: 'Premium Meats Inc', icon: '🥩', type: 'protein', priceLevel: 1.25, quality: 0.92, reliability: 0.85, minOrder: 300 },
  { id: 'ocean_fresh', name: 'Ocean Fresh Seafood', icon: '🦐', type: 'seafood', priceLevel: 1.3, quality: 0.9, reliability: 0.75, minOrder: 250 },
  { id: 'bakery_direct', name: 'Artisan Bakery Direct', icon: '🥖', type: 'bakery', priceLevel: 1.1, quality: 0.88, reliability: 0.82, minOrder: 100 },
  { id: 'beverage_kings', name: 'Beverage Kings', icon: '🥤', type: 'beverage', priceLevel: 0.9, quality: 0.75, reliability: 0.95, minOrder: 200 },
];

const VENDOR_DEALS = [
  { id: 'volume_discount', name: 'Volume Discount', description: '10% off orders over $2K/week', discount: 0.1, minWeeklyOrder: 2000 },
  { id: 'loyalty_program', name: 'Loyalty Program', description: '5% rebate after 6 months', discount: 0.05, minWeeks: 24 },
  { id: 'exclusive_contract', name: 'Exclusive Contract', description: '15% off for 1-year commitment', discount: 0.15, commitment: 52, penalty: 10000 },
  { id: 'early_pay', name: 'Early Payment', description: '2% off for payment within 10 days', discount: 0.02, requiresCash: true },
];

// ============================================
// EVENTS CALENDAR (Phase 4)
// ============================================
const CALENDAR_EVENTS = [
  { id: 'valentines', name: "Valentine's Day", icon: '💕', week: 7, revenueBoost: 0.4, type: 'romantic', tip: 'Offer special prix fixe menus' },
  { id: 'mothers_day', name: "Mother's Day", icon: '💐', week: 19, revenueBoost: 0.5, type: 'family', tip: 'Book reservations early, add brunch' },
  { id: 'fathers_day', name: "Father's Day", icon: '👔', week: 24, revenueBoost: 0.3, type: 'family', tip: 'Steak specials work well' },
  { id: 'july_4th', name: 'Independence Day', icon: '🎆', week: 27, revenueBoost: 0.2, type: 'holiday', tip: 'BBQ themes, outdoor seating premium' },
  { id: 'labor_day', name: 'Labor Day', icon: '⚒️', week: 36, revenueBoost: 0.1, type: 'holiday', tip: 'Last summer hurrah - end of season specials' },
  { id: 'halloween', name: 'Halloween', icon: '🎃', week: 44, revenueBoost: 0.15, type: 'theme', tip: 'Themed cocktails and decor' },
  { id: 'thanksgiving', name: 'Thanksgiving', icon: '🦃', week: 47, revenueBoost: -0.3, type: 'holiday', tip: 'Most dine at home - consider catering' },
  { id: 'christmas_eve', name: 'Christmas Eve', icon: '🎄', week: 51, revenueBoost: 0.2, type: 'holiday', tip: 'Special hours, limited menu' },
  { id: 'new_years', name: "New Year's Eve", icon: '🥂', week: 52, revenueBoost: 0.6, type: 'celebration', tip: 'Premium pricing accepted, require deposits' },
  { id: 'super_bowl', name: 'Super Bowl', icon: '🏈', week: 6, revenueBoost: 0.35, type: 'sports', tip: 'Wings, nachos, delivery surge' },
  { id: 'march_madness', name: 'March Madness Start', icon: '🏀', week: 11, revenueBoost: 0.15, type: 'sports', tip: 'Bar traffic up, add screens' },
  { id: 'cinco_de_mayo', name: 'Cinco de Mayo', icon: '🇲🇽', week: 18, revenueBoost: 0.25, type: 'theme', tip: 'Margarita specials (if applicable)' },
  { id: 'restaurant_week', name: 'Restaurant Week', icon: '🍽️', week: 30, revenueBoost: 0.2, type: 'industry', tip: 'Lower margins but great exposure' },
];

const SEASONAL_EFFECTS = {
  winter: { weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51, 52], modifier: -0.1, heating: 500 },
  spring: { weeks: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], modifier: 0.05, patioBoost: 0.15 },
  summer: { weeks: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], modifier: -0.05, acCost: 400 },
  fall: { weeks: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], modifier: 0.1, peakSeason: true },
};

// ============================================
// TUTORIAL SYSTEM (Phase 4)
// ============================================
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to 86\'d!',
    message: 'Ready to build your restaurant empire? I\'m Chef Marcus, your mentor. I\'ve seen it all in 30 years - successes, failures, and everything in between. Let me show you around.',
    highlight: null,
    action: 'continue',
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    message: 'This is your dashboard. Every number tells a story. Green is good, red means trouble. Watch your cash like a hawk - it\'s the lifeblood of your business.',
    highlight: 'quickStats',
    action: 'continue',
  },
  {
    id: 'week',
    title: 'The Weekly Grind',
    message: 'Time moves in weeks. Each week you\'ll face decisions, collect revenue, and pay bills. Hit "NEXT WEEK" when you\'re ready to advance.',
    highlight: 'nextWeekButton',
    action: 'nextWeek',
  },
  {
    id: 'staff',
    title: 'Your Team',
    message: 'Staff is your biggest expense AND your biggest asset. Underpay and they leave. Overpay and you go broke. Find the balance. Happy staff = happy customers.',
    highlight: 'staffTab',
    action: 'goToStaff',
  },
  {
    id: 'scenarios',
    title: 'Crisis & Opportunity',
    message: 'Random events will test you. No-shows, equipment failures, great reviews - they all happen. Your choices have real consequences. There are no undo buttons in this business.',
    highlight: null,
    action: 'continue',
  },
  {
    id: 'mentor',
    title: 'I\'m Here to Help',
    message: 'Tap on my bar anytime to ask questions. I\'ll give you my honest take - not what you want to hear, but what you need to hear. Good luck, chef.',
    highlight: 'aiBar',
    action: 'complete',
  },
];

// ============================================
// STATISTICS & MILESTONES (Phase 4)
// ============================================
const MILESTONES = [
  { id: 'first_profit', name: 'First Profit', description: 'Achieve positive weekly profit', icon: '💵', stat: 'weeklyProfit', threshold: 0, reward: 1000 },
  { id: 'week_10k', name: '$10K Week', description: 'Hit $10,000 weekly revenue', icon: '📈', stat: 'weeklyRevenue', threshold: 10000, reward: 2500 },
  { id: 'week_25k', name: '$25K Week', description: 'Hit $25,000 weekly revenue', icon: '🚀', stat: 'weeklyRevenue', threshold: 25000, reward: 5000 },
  { id: 'week_50k', name: '$50K Week', description: 'Hit $50,000 weekly revenue', icon: '💎', stat: 'weeklyRevenue', threshold: 50000, reward: 10000 },
  { id: 'staff_10', name: 'Growing Team', description: 'Employ 10+ staff members', icon: '👥', stat: 'totalStaff', threshold: 10, reward: 2000 },
  { id: 'staff_25', name: 'Small Army', description: 'Employ 25+ staff members', icon: '🎖️', stat: 'totalStaff', threshold: 25, reward: 5000 },
  { id: 'reputation_80', name: 'Well Regarded', description: 'Reach 80% reputation', icon: '⭐', stat: 'reputation', threshold: 80, reward: 3000 },
  { id: 'reputation_95', name: 'Legendary', description: 'Reach 95% reputation', icon: '👑', stat: 'reputation', threshold: 95, reward: 10000 },
  { id: 'survive_52', name: 'Year One', description: 'Survive 52 weeks', icon: '🎂', stat: 'weeks', threshold: 52, reward: 15000 },
  { id: 'survive_104', name: 'Year Two', description: 'Survive 104 weeks', icon: '🎉', stat: 'weeks', threshold: 104, reward: 25000 },
  { id: 'location_2', name: 'Expansion', description: 'Open a second location', icon: '🏪', stat: 'locations', threshold: 2, reward: 5000 },
  { id: 'location_5', name: 'Mini Empire', description: 'Own 5 locations', icon: '🏛️', stat: 'locations', threshold: 5, reward: 20000 },
  { id: 'franchise_1', name: 'Franchisor', description: 'Sell your first franchise', icon: '🤝', stat: 'franchises', threshold: 1, reward: 10000 },
  { id: 'valuation_1m', name: 'Millionaire', description: 'Empire valued at $1M+', icon: '💰', stat: 'valuation', threshold: 1000000, reward: 25000 },
  { id: 'valuation_5m', name: 'Mogul', description: 'Empire valued at $5M+', icon: '🏆', stat: 'valuation', threshold: 5000000, reward: 50000 },
];

// ============================================
// PHASE 5: ENGAGEMENT & POLISH SYSTEMS
// ============================================

// DIFFICULTY MODES
const DIFFICULTY_MODES = [
  { 
    id: 'easy', name: 'Easy', icon: '😊', description: 'Learning the ropes',
    revenueMultiplier: 1.3, costMultiplier: 0.8, scenarioChance: 0.15, negativeScenarioChance: 0.3,
    startingBonus: 25000, staffLoyaltyBonus: 10, reputationDecayRate: 0.5,
  },
  { 
    id: 'normal', name: 'Normal', icon: '😐', description: 'The real deal',
    revenueMultiplier: 1.0, costMultiplier: 1.0, scenarioChance: 0.25, negativeScenarioChance: 0.5,
    startingBonus: 0, staffLoyaltyBonus: 0, reputationDecayRate: 1.0,
  },
  { 
    id: 'hard', name: 'Hard', icon: '😤', description: 'For experienced operators',
    revenueMultiplier: 0.85, costMultiplier: 1.15, scenarioChance: 0.35, negativeScenarioChance: 0.65,
    startingBonus: -10000, staffLoyaltyBonus: -5, reputationDecayRate: 1.5,
  },
  { 
    id: 'nightmare', name: 'Nightmare', icon: '💀', description: 'Pure chaos - good luck',
    revenueMultiplier: 0.7, costMultiplier: 1.3, scenarioChance: 0.5, negativeScenarioChance: 0.8,
    startingBonus: -20000, staffLoyaltyBonus: -10, reputationDecayRate: 2.0, noLoans: true,
  },
];

// GAME SPEED OPTIONS
const SPEED_OPTIONS = [
  { id: 'pause', name: 'Paused', icon: '⏸️', interval: null },
  { id: '1x', name: '1x', icon: '▶️', interval: 3000 },
  { id: '2x', name: '2x', icon: '⏩', interval: 1500 },
  { id: '4x', name: '4x', icon: '⏭️', interval: 750 },
  { id: '10x', name: '10x', icon: '🚀', interval: 300 },
];

// THEME SYSTEM
const THEMES = {
  dark: {
    id: 'dark', name: 'Dark (Default)', icon: '🌙',
    colors: {
      background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
      primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
      info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
      textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
    }
  },
  midnight: {
    id: 'midnight', name: 'Midnight Blue', icon: '🌃',
    colors: {
      background: '#0a192f', surface: '#112240', surfaceLight: '#1d3557',
      primary: '#64ffda', accent: '#f72585', success: '#00b894', warning: '#ff7675',
      info: '#74b9ff', purple: '#a29bfe', pink: '#fd79a8', cyan: '#00cec9',
      textPrimary: '#ccd6f6', textSecondary: '#8892b0', textMuted: '#495670', border: '#233554',
    }
  },
  retro: {
    id: 'retro', name: 'Retro Arcade', icon: '🕹️',
    colors: {
      background: '#1a1a2e', surface: '#16213e', surfaceLight: '#0f3460',
      primary: '#e94560', accent: '#ff6b6b', success: '#00ff41', warning: '#ffd93d',
      info: '#00fff5', purple: '#9b59b6', pink: '#ff00ff', cyan: '#00ffff',
      textPrimary: '#ffffff', textSecondary: '#94a3b8', textMuted: '#64748b', border: '#334155',
    }
  },
  coffee: {
    id: 'coffee', name: 'Coffee House', icon: '☕',
    colors: {
      background: '#1c1610', surface: '#2c221a', surfaceLight: '#3d2e23',
      primary: '#c49a6c', accent: '#8b4513', success: '#228b22', warning: '#d2691e',
      info: '#4682b4', purple: '#9370db', pink: '#bc8f8f', cyan: '#5f9ea0',
      textPrimary: '#f5deb3', textSecondary: '#d2b48c', textMuted: '#a0896c', border: '#4a3728',
    }
  },
  neon: {
    id: 'neon', name: 'Neon Nights', icon: '💜',
    colors: {
      background: '#0d0221', surface: '#190535', surfaceLight: '#2b0a4d',
      primary: '#ff00ff', accent: '#00ffff', success: '#39ff14', warning: '#ff6600',
      info: '#00bfff', purple: '#bf00ff', pink: '#ff1493', cyan: '#00ffff',
      textPrimary: '#ffffff', textSecondary: '#e0b0ff', textMuted: '#9d4edd', border: '#4c1d95',
    }
  },
};

// GAMEPLAY TIPS
const GAMEPLAY_TIPS = [
  { id: 1, tip: "💡 Keep 4-6 weeks of expenses in cash reserves for emergencies." },
  { id: 2, tip: "💡 A line cook at $18/hr costs you ~$27/hr after all expenses." },
  { id: 3, tip: "💡 Social media marketing has the best ROI for new restaurants." },
  { id: 4, tip: "💡 Prime cost (food + labor) should stay under 65% of revenue." },
  { id: 5, tip: "💡 Train staff to reduce turnover - it's cheaper than hiring new." },
  { id: 6, tip: "💡 Delivery apps take 15-30% - factor that into your pricing." },
  { id: 7, tip: "💡 Don't expand until your first location is consistently profitable." },
  { id: 8, tip: "💡 Negotiate with vendors quarterly - prices change." },
  { id: 9, tip: "💡 A great manager can run a location for you - invest in them." },
  { id: 10, tip: "💡 Ghost kitchens have low overhead but zero walk-in traffic." },
  { id: 11, tip: "💡 The restaurant that survives isn't the best - it's the most adaptable." },
  { id: 12, tip: "💡 Equipment failures always happen at the worst time. Maintain proactively." },
];

// PRESTIGE SYSTEM (New Game+)
const PRESTIGE_BONUSES = [
  { level: 1, name: 'Experienced Owner', bonus: 'Start with +$10K and +5% reputation', cashBonus: 10000, repBonus: 5 },
  { level: 2, name: 'Seasoned Pro', bonus: 'Start with +$25K and industry contacts', cashBonus: 25000, repBonus: 8, vendorDiscount: 0.05 },
  { level: 3, name: 'Industry Veteran', bonus: 'Start with +$50K and loyal staff', cashBonus: 50000, repBonus: 10, startingStaff: 3 },
  { level: 4, name: 'Restaurant Legend', bonus: 'Start with +$100K and fame', cashBonus: 100000, repBonus: 15, startingStaff: 5 },
  { level: 5, name: 'Culinary Titan', bonus: 'Start with +$250K empire', cashBonus: 250000, repBonus: 20, startingStaff: 8 },
];

// PHASE 5 ACHIEVEMENTS
const PHASE5_ACHIEVEMENTS = [
  { id: 'nightmare_survivor', name: 'Nightmare Survivor', description: 'Survive 52 weeks on Nightmare', icon: '💀', reward: 50000 },
  { id: 'speedrunner', name: 'Speedrunner', description: 'Reach $1M valuation in under 52 weeks', icon: '⚡', reward: 25000 },
  { id: 'staff_loyalty', name: 'Staff Loyalty', description: 'Keep same employee for 52+ weeks', icon: '💪', reward: 10000 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'All metrics positive for a week', icon: '✨', reward: 5000 },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Recover from negative cash to $100K+', icon: '🔥', reward: 20000 },
  { id: 'no_loans', name: 'Bootstrap King', description: 'Reach $500K valuation without loans', icon: '💎', reward: 30000 },
  { id: 'franchise_empire', name: 'Franchise Empire', description: 'Have 10 active franchises', icon: '🌐', reward: 75000 },
  { id: 'theme_collector', name: 'Theme Collector', description: 'Try all 5 color themes', icon: '🎨', reward: 2500 },
];

// PHASE 6 ACHIEVEMENTS
const PHASE6_ACHIEVEMENTS = [
  { id: 'investor_funded', name: 'Investor Funded', description: 'Secure your first investor', icon: '🏦', reward: 15000 },
  { id: 'property_owner', name: 'Property Owner', description: 'Buy your first building', icon: '🏢', reward: 50000 },
  { id: 'catering_king', name: 'Catering King', description: 'Sign 3 catering contracts', icon: '🍽️', reward: 20000 },
  { id: 'food_truck_fleet', name: 'Fleet Owner', description: 'Own 3 food trucks', icon: '🚚', reward: 35000 },
  { id: 'tv_star', name: 'TV Star', description: 'Appear on a cooking show', icon: '📺', reward: 25000 },
  { id: 'cookbook_author', name: 'Cookbook Author', description: 'Sign a cookbook deal', icon: '📚', reward: 30000 },
  { id: 'recession_survivor', name: 'Recession Survivor', description: 'Stay profitable through a recession', icon: '📉', reward: 40000 },
  { id: 'ipo_complete', name: 'Wall Street', description: 'Complete an IPO', icon: '📈', reward: 100000 },
  { id: 'strategic_exit', name: 'Strategic Exit', description: 'Sell your company successfully', icon: '🎯', reward: 75000 },
  { id: 'real_estate_mogul', name: 'Real Estate Mogul', description: 'Own $5M in property', icon: '🏛️', reward: 60000 },
];

// HALL OF FAME CATEGORIES
const HALL_OF_FAME_CATEGORIES = [
  { id: 'longest_run', name: 'Longest Run', icon: '📅', stat: 'weeksSurvived', format: (v) => `${v} weeks` },
  { id: 'highest_revenue', name: 'Highest Revenue', icon: '💰', stat: 'peakWeeklyRevenue', format: (v) => `$${v.toLocaleString()}` },
  { id: 'biggest_empire', name: 'Biggest Empire', icon: '🏛️', stat: 'maxLocations', format: (v) => `${v} locations` },
  { id: 'highest_valuation', name: 'Highest Valuation', icon: '🏆', stat: 'peakValuation', format: (v) => `$${(v/1000000).toFixed(2)}M` },
  { id: 'most_staff', name: 'Most Staff', icon: '👥', stat: 'maxStaff', format: (v) => `${v} employees` },
];

// ============================================
// PHASE 6: ADVANCED BUSINESS & ENDGAME SYSTEMS
// ============================================

// INVESTOR SYSTEM - Angels, VCs, Private Equity
const INVESTOR_TYPES = [
  { 
    id: 'angel', name: 'Angel Investor', icon: '👼', 
    minValuation: 250000, maxValuation: 1000000, equityRange: [5, 15],
    investment: [50000, 150000], boardSeat: false, 
    personality: 'supportive', controlLevel: 0.1,
    terms: 'Flexible terms, industry connections, patient capital'
  },
  { 
    id: 'restaurant_fund', name: 'Restaurant Fund', icon: '🍽️', 
    minValuation: 500000, maxValuation: 3000000, equityRange: [15, 30],
    investment: [200000, 500000], boardSeat: true, 
    personality: 'operational', controlLevel: 0.3,
    terms: 'Operating expertise, vendor relationships, expects 5-year exit'
  },
  { 
    id: 'vc', name: 'Venture Capital', icon: '🚀', 
    minValuation: 2000000, maxValuation: 10000000, equityRange: [20, 35],
    investment: [500000, 2000000], boardSeat: true, 
    personality: 'aggressive', controlLevel: 0.4,
    terms: 'Expects rapid scaling, board control, 3-5 year exit to IPO or acquisition'
  },
  { 
    id: 'pe', name: 'Private Equity', icon: '🏦', 
    minValuation: 5000000, maxValuation: 50000000, equityRange: [51, 80],
    investment: [2000000, 10000000], boardSeat: true, 
    personality: 'cost-cutting', controlLevel: 0.7,
    terms: 'Majority stake, operational changes, debt financing, 5-7 year hold'
  },
  { 
    id: 'strategic', name: 'Strategic Investor', icon: '🤝', 
    minValuation: 3000000, maxValuation: 20000000, equityRange: [10, 30],
    investment: [500000, 3000000], boardSeat: true, 
    personality: 'strategic', controlLevel: 0.3,
    terms: 'Synergy focus, possible future acquisition, access to resources'
  },
];

const INVESTOR_DEMANDS = [
  { id: 'growth_target', name: 'Growth Mandate', description: 'Open 3 new locations in 12 months', type: 'expansion' },
  { id: 'cost_cutting', name: 'Cost Optimization', description: 'Reduce labor to 28% of revenue', type: 'efficiency' },
  { id: 'cfo_hire', name: 'Professional Management', description: 'Hire a CFO within 6 months', type: 'hiring' },
  { id: 'franchise_push', name: 'Franchise Acceleration', description: 'Sell 5 franchises this year', type: 'franchise' },
  { id: 'tech_upgrade', name: 'Technology Investment', description: 'Implement enterprise POS system', type: 'capex' },
  { id: 'marketing_spend', name: 'Brand Building', description: 'Spend $100K on marketing', type: 'marketing' },
];

// REAL ESTATE SYSTEM - Own vs Lease
const REAL_ESTATE_OPTIONS = [
  { 
    id: 'triple_net', name: 'Triple Net Lease', icon: '📋',
    description: 'Pay base rent plus taxes, insurance, maintenance',
    baseRentMod: 0.8, additionalCosts: 0.25, flexibility: 'high',
    termYears: 5, renewalOption: true
  },
  { 
    id: 'gross_lease', name: 'Gross Lease', icon: '🏠',
    description: 'All-inclusive rent, landlord covers expenses',
    baseRentMod: 1.2, additionalCosts: 0, flexibility: 'medium',
    termYears: 3, renewalOption: true
  },
  { 
    id: 'percentage_lease', name: 'Percentage Lease', icon: '📊',
    description: 'Lower base rent + percentage of gross sales',
    baseRentMod: 0.5, salesPercentage: 0.06, flexibility: 'medium',
    termYears: 5, renewalOption: true
  },
  { 
    id: 'own_property', name: 'Purchase Property', icon: '🏢',
    description: 'Buy the building outright',
    downPayment: 0.25, mortgageRate: 0.065, termYears: 30,
    appreciation: 0.03, flexibility: 'low', equity: true
  },
  { 
    id: 'sale_leaseback', name: 'Sale-Leaseback', icon: '🔄',
    description: 'Sell property, lease it back - unlock capital',
    cashUnlock: 0.9, newRentMod: 1.1, flexibility: 'medium',
    termYears: 15, renewalOption: true
  },
];

// CATERING & EVENTS SYSTEM - B2B Revenue
const CATERING_TYPES = [
  { id: 'corporate_lunch', name: 'Corporate Lunch', icon: '💼', avgOrder: 800, frequency: 'weekly', margin: 0.35, setupCost: 2000 },
  { id: 'corporate_event', name: 'Corporate Event', icon: '🎉', avgOrder: 5000, frequency: 'monthly', margin: 0.40, setupCost: 5000 },
  { id: 'wedding', name: 'Wedding Catering', icon: '💒', avgOrder: 15000, frequency: 'seasonal', margin: 0.45, setupCost: 10000 },
  { id: 'private_party', name: 'Private Parties', icon: '🎂', avgOrder: 2000, frequency: 'weekly', margin: 0.38, setupCost: 3000 },
  { id: 'food_service', name: 'Contract Food Service', icon: '🏢', avgOrder: 3000, frequency: 'daily', margin: 0.25, setupCost: 15000 },
  { id: 'meal_prep', name: 'Meal Prep Service', icon: '📦', avgOrder: 500, frequency: 'weekly', margin: 0.30, setupCost: 5000 },
];

const CATERING_CONTRACTS = [
  { id: 'tech_campus', name: 'Tech Campus Cafeteria', icon: '💻', weeklyRevenue: 8000, term: 52, margin: 0.22, requirement: 'High volume capacity' },
  { id: 'hospital', name: 'Hospital Café', icon: '🏥', weeklyRevenue: 5000, term: 104, margin: 0.20, requirement: 'Health certifications' },
  { id: 'university', name: 'University Dining', icon: '🎓', weeklyRevenue: 12000, term: 40, margin: 0.18, requirement: 'Seasonal, volume swings' },
  { id: 'office_tower', name: 'Office Tower Exclusive', icon: '🏙️', weeklyRevenue: 6000, term: 52, margin: 0.28, requirement: 'Premium quality' },
];

// FOOD TRUCK FLEET SYSTEM
const FOOD_TRUCKS = [
  { id: 'basic', name: 'Basic Food Truck', icon: '🚚', cost: 45000, capacity: 100, range: 'local', maintenance: 500, permits: 2000 },
  { id: 'premium', name: 'Premium Food Truck', icon: '🚛', cost: 85000, capacity: 150, range: 'regional', maintenance: 750, permits: 3000 },
  { id: 'trailer', name: 'Concession Trailer', icon: '🎪', cost: 25000, capacity: 80, range: 'events', maintenance: 300, permits: 1500 },
  { id: 'cart', name: 'Food Cart', icon: '🛒', cost: 8000, capacity: 40, range: 'downtown', maintenance: 100, permits: 500 },
];

const TRUCK_EVENTS = [
  { id: 'farmers_market', name: 'Farmers Market', icon: '🥬', fee: 150, avgRevenue: 1200, frequency: 'weekly' },
  { id: 'food_festival', name: 'Food Festival', icon: '🎪', fee: 500, avgRevenue: 5000, frequency: 'monthly' },
  { id: 'corporate_park', name: 'Office Park Lunch', icon: '🏢', fee: 100, avgRevenue: 800, frequency: 'daily' },
  { id: 'brewery', name: 'Brewery Partnership', icon: '🍺', fee: 0, revShare: 0.15, avgRevenue: 1500, frequency: 'weekly' },
  { id: 'concert', name: 'Concert/Stadium', icon: '🎸', fee: 1000, avgRevenue: 8000, frequency: 'event' },
  { id: 'private_event', name: 'Private Event Booking', icon: '🎂', fee: 0, avgRevenue: 2500, frequency: 'booking' },
];

// MEDIA & CELEBRITY SYSTEM
const MEDIA_OPPORTUNITIES = [
  { id: 'local_news', name: 'Local News Feature', icon: '📺', cost: 0, reputationBoost: 5, reachBoost: 0.05, duration: 4 },
  { id: 'food_magazine', name: 'Food Magazine Article', icon: '📰', cost: 500, reputationBoost: 10, reachBoost: 0.08, duration: 8 },
  { id: 'podcast_guest', name: 'Podcast Appearance', icon: '🎙️', cost: 0, reputationBoost: 3, reachBoost: 0.03, duration: 12 },
  { id: 'cooking_show', name: 'Cooking Show Guest', icon: '👨‍🍳', cost: 0, reputationBoost: 15, reachBoost: 0.15, duration: 8, minReputation: 70 },
  { id: 'reality_show', name: 'Reality TV Appearance', icon: '🎬', cost: 0, reputationBoost: 25, reachBoost: 0.30, duration: 16, minReputation: 80 },
  { id: 'own_show', name: 'Own TV Series', icon: '⭐', cost: 0, reputationBoost: 40, reachBoost: 0.50, weeklyIncome: 10000, minReputation: 90 },
];

const BRAND_DEALS = [
  { id: 'cookbook', name: 'Cookbook Deal', icon: '📚', advance: 50000, royalty: 0.08, effort: 'high', minReputation: 75 },
  { id: 'product_line', name: 'Retail Product Line', icon: '🏪', advance: 100000, royalty: 0.05, effort: 'medium', minReputation: 80 },
  { id: 'endorsement', name: 'Brand Endorsement', icon: '📢', fee: 25000, duration: 52, effort: 'low', minReputation: 70 },
  { id: 'consulting', name: 'Restaurant Consulting', icon: '💼', fee: 5000, perEngagement: true, effort: 'high', minReputation: 85 },
  { id: 'licensing', name: 'Brand Licensing', icon: '™️', upfront: 200000, royalty: 0.03, effort: 'low', minReputation: 90 },
];

// ECONOMIC CYCLES SYSTEM
const ECONOMIC_CONDITIONS = [
  { 
    id: 'boom', name: 'Economic Boom', icon: '📈',
    revenueMultiplier: 1.25, costMultiplier: 1.1, laborMarket: 'tight',
    consumerConfidence: 1.3, tipMultiplier: 1.2, description: 'High spending, hard to hire'
  },
  { 
    id: 'stable', name: 'Stable Economy', icon: '➡️',
    revenueMultiplier: 1.0, costMultiplier: 1.0, laborMarket: 'normal',
    consumerConfidence: 1.0, tipMultiplier: 1.0, description: 'Steady as she goes'
  },
  { 
    id: 'slowdown', name: 'Economic Slowdown', icon: '📉',
    revenueMultiplier: 0.9, costMultiplier: 0.95, laborMarket: 'loose',
    consumerConfidence: 0.85, tipMultiplier: 0.9, description: 'Cautious spending, easier hiring'
  },
  { 
    id: 'recession', name: 'Recession', icon: '🔻',
    revenueMultiplier: 0.75, costMultiplier: 0.85, laborMarket: 'abundant',
    consumerConfidence: 0.6, tipMultiplier: 0.7, description: 'Survival mode, cut costs'
  },
  { 
    id: 'inflation', name: 'High Inflation', icon: '💸',
    revenueMultiplier: 1.1, costMultiplier: 1.35, laborMarket: 'tight',
    consumerConfidence: 0.9, tipMultiplier: 0.85, description: 'Costs rising faster than prices'
  },
];

const ECONOMIC_EVENTS = [
  { id: 'rate_hike', name: 'Interest Rate Hike', effect: { loanRates: 0.02, expansion: -0.2 }, duration: 26 },
  { id: 'stimulus', name: 'Government Stimulus', effect: { revenue: 0.15, tips: 0.25 }, duration: 12 },
  { id: 'supply_shock', name: 'Supply Chain Disruption', effect: { foodCost: 0.2, availability: -0.15 }, duration: 16 },
  { id: 'labor_shortage', name: 'Labor Shortage', effect: { wages: 0.15, retention: -0.1 }, duration: 20 },
  { id: 'gas_spike', name: 'Fuel Price Spike', effect: { deliveryCost: 0.3, supplyCost: 0.1 }, duration: 8 },
];

// ADVANCED EXIT STRATEGIES
const EXIT_OPTIONS = [
  { 
    id: 'ipo', name: 'Initial Public Offering (IPO)', icon: '📈',
    minValuation: 50000000, minLocations: 50, preparationTime: 104,
    cost: 2000000, valuationMultiple: 1.5, description: 'Go public on stock exchange'
  },
  { 
    id: 'strategic_sale', name: 'Strategic Acquisition', icon: '🤝',
    minValuation: 5000000, minLocations: 5, preparationTime: 26,
    cost: 100000, valuationMultiple: 1.2, description: 'Sell to larger restaurant group'
  },
  { 
    id: 'pe_buyout', name: 'PE Leveraged Buyout', icon: '🏦',
    minValuation: 10000000, minLocations: 10, preparationTime: 26,
    cost: 150000, valuationMultiple: 1.0, description: 'Private equity acquires majority'
  },
  { 
    id: 'spac', name: 'SPAC Merger', icon: '🚀',
    minValuation: 25000000, minLocations: 25, preparationTime: 52,
    cost: 500000, valuationMultiple: 1.3, description: 'Merge with blank check company'
  },
  { 
    id: 'management_buyout', name: 'Management Buyout', icon: '👔',
    minValuation: 2000000, minLocations: 3, preparationTime: 13,
    cost: 50000, valuationMultiple: 0.9, description: 'Sell to your management team'
  },
  { 
    id: 'esop', name: 'Employee Ownership (ESOP)', icon: '👥',
    minValuation: 3000000, minLocations: 3, preparationTime: 52,
    cost: 100000, valuationMultiple: 0.85, description: 'Gradual sale to employees'
  },
  { 
    id: 'family_succession', name: 'Family Succession', icon: '👨‍👩‍👧‍👦',
    minValuation: 0, minLocations: 1, preparationTime: 104,
    cost: 25000, valuationMultiple: 0, description: 'Pass to next generation'
  },
];

// PHASE 6 SCENARIOS
const PHASE_6_SCENARIOS = [
  {
    id: 'vc_interest', type: 'opportunity', title: '🚀 VC Interest',
    message: 'A venture capital firm sees potential in your brand. They want to invest $1M for 25% equity and a board seat. They expect 10x growth in 5 years.',
    options: [
      { text: 'Accept the investment', successChance: 1.0, success: { cash: 1000000, equity: -25, addInvestor: 'vc' }, fail: {} },
      { text: 'Negotiate for 20%', successChance: 0.5, success: { cash: 1000000, equity: -20, addInvestor: 'vc' }, fail: { reputation: -2 } },
      { text: 'Decline - stay independent', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
    lesson: 'VC money comes with strings. Make sure your vision aligns with their timeline.',
    minValuation: 2000000,
  },
  {
    id: 'real_estate_opportunity', type: 'opportunity', title: '🏢 Buy Your Building',
    message: 'Your landlord is selling the building. You have first right of refusal at $800K. Property values have been rising 5% annually.',
    options: [
      { text: 'Buy it (25% down)', successChance: 0.9, success: { cash: -200000, addProperty: true, monthlyRent: 0 }, fail: { cash: -50000 } },
      { text: 'Negotiate lower price', successChance: 0.4, success: { cash: -160000, addProperty: true }, fail: { newLandlord: true, rentIncrease: 0.15 } },
      { text: 'Pass - stay a tenant', successChance: 1.0, success: { newLandlord: true, rentIncrease: 0.1 }, fail: {} },
    ],
    lesson: 'Owning real estate builds wealth but ties up capital. Know your priorities.',
    minCash: 200000,
  },
  {
    id: 'catering_contract', type: 'opportunity', title: '💼 Corporate Contract',
    message: 'A Fortune 500 company wants you to cater their campus cafeteria. $6K/week guaranteed for 2 years, but you need to hire dedicated staff.',
    options: [
      { text: 'Accept the contract', successChance: 0.85, success: { weeklyIncome: 6000, hireRequired: 5, addContract: 'tech_campus' }, fail: { reputation: -10, penalty: 25000 } },
      { text: 'Counter with higher margin', successChance: 0.4, success: { weeklyIncome: 7500, hireRequired: 5 }, fail: {} },
      { text: 'Decline - focus on restaurant', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Contract food service is steady but low-margin. It\'s a different business model.',
    minLocations: 1,
    minReputation: 65,
  },
  {
    id: 'food_truck_offer', type: 'opportunity', title: '🚚 Food Truck Opportunity',
    message: 'A food truck builder is offering a custom truck at 30% off ($55K). Perfect for testing new markets and events.',
    options: [
      { text: 'Buy the truck', successChance: 1.0, success: { cash: -55000, addTruck: 'premium' }, fail: {} },
      { text: 'Start with a cart instead ($8K)', successChance: 1.0, success: { cash: -8000, addTruck: 'cart' }, fail: {} },
      { text: 'Not interested right now', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Food trucks are lower risk expansion but operationally complex. Start small.',
    minCash: 60000,
  },
  {
    id: 'tv_show_invite', type: 'opportunity', title: '🎬 Reality Show Invitation',
    message: 'A food reality show wants to feature your restaurant! Great exposure but they want drama and access for 3 weeks.',
    options: [
      { text: 'Accept - embrace the spotlight', successChance: 0.7, success: { reputation: 25, reach: 0.3, morale: -10 }, fail: { reputation: -15, morale: -20 } },
      { text: 'Accept with conditions', successChance: 0.5, success: { reputation: 15, reach: 0.2 }, fail: { reputation: -5 } },
      { text: 'Decline politely', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Media exposure is a double-edged sword. The wrong story can hurt more than help.',
    minReputation: 75,
  },
  {
    id: 'recession_hits', type: 'crisis', title: '📉 Economic Recession',
    message: 'The economy has entered recession. Consumer spending is down 25% and unemployment is rising. How do you adapt?',
    options: [
      { text: 'Cut costs aggressively', successChance: 0.8, success: { costs: -0.2, morale: -15, quality: -0.1 }, fail: { reputation: -10, morale: -25 } },
      { text: 'Launch value menu', successChance: 0.7, success: { avgTicket: -0.15, covers: 0.1, reputation: 5 }, fail: { margin: -0.1 } },
      { text: 'Double down on quality', successChance: 0.5, success: { reputation: 15, premiumCustomers: 0.2 }, fail: { cash: -20000, covers: -0.2 } },
    ],
    lesson: 'Recessions test your business model. Value and quality both have paths forward.',
    economic: 'recession',
  },
  {
    id: 'cookbook_deal', type: 'opportunity', title: '📚 Cookbook Offer',
    message: 'A publisher wants to release your cookbook. $50K advance plus 8% royalties. You\'ll need to dedicate significant time.',
    options: [
      { text: 'Accept the deal', successChance: 0.8, success: { cash: 50000, reputation: 10, burnout: 15 }, fail: { reputation: -5 } },
      { text: 'Negotiate ghostwriter', successChance: 0.6, success: { cash: 35000, reputation: 8 }, fail: {} },
      { text: 'Decline - too busy', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Side projects can build your brand but distract from operations. Delegate well.',
    minReputation: 75,
  },
  {
    id: 'ipo_banker', type: 'opportunity', title: '📈 IPO Discussion',
    message: 'An investment banker believes your company could go public. The process would take 2 years and cost $2M, but could value you at 1.5x current.',
    options: [
      { text: 'Begin IPO process', successChance: 0.6, success: { startIPO: true, cash: -500000 }, fail: { cash: -200000, reputation: -10 } },
      { text: 'Explore SPAC merger instead', successChance: 0.5, success: { startSPAC: true, cash: -250000 }, fail: {} },
      { text: 'Not ready yet', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Public companies face scrutiny private ones don\'t. Make sure you\'re ready.',
    minValuation: 25000000,
    minLocations: 25,
  },
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

// INVESTOR DEMAND SCENARIOS (triggered when you have investors)
const INVESTOR_SCENARIOS = [
  {
    id: 'investor_growth_demand', type: 'investor', title: '📊 Board Pressure',
    message: 'Your investors are unhappy with growth pace. They\'re demanding you open 3 locations in the next 6 months or they\'ll vote to replace you as CEO.',
    options: [
      { text: 'Commit to aggressive expansion', successChance: 0.6, success: { reputation: 5, investorHappiness: 20 }, fail: { reputation: -10, investorHappiness: -30 } },
      { text: 'Propose 2 locations, better margins', successChance: 0.7, success: { investorHappiness: 10 }, fail: { investorHappiness: -15 } },
      { text: 'Push back - quality over quantity', successChance: 0.4, success: { reputation: 10, investorHappiness: -10 }, fail: { ceoPressure: true, investorHappiness: -40 } },
    ],
    lesson: 'Outside investors have timelines. Make sure yours match before taking money.',
    requiresInvestors: true,
  },
  {
    id: 'investor_cost_cutting', type: 'investor', title: '✂️ Cost Cutting Mandate',
    message: 'The PE firm on your board is demanding 15% cost reduction. They want to cut labor and renegotiate supplier contracts.',
    options: [
      { text: 'Implement cuts across the board', successChance: 0.8, success: { costs: -0.15, morale: -20, investorHappiness: 25 }, fail: { reputation: -15, morale: -30 } },
      { text: 'Find savings without layoffs', successChance: 0.5, success: { costs: -0.08, investorHappiness: 10 }, fail: { investorHappiness: -10 } },
      { text: 'Refuse - protect the team', successChance: 0.3, success: { morale: 15, reputation: 5 }, fail: { investorHappiness: -35, boardConflict: true } },
    ],
    lesson: 'PE firms optimize for returns. Culture often takes a backseat.',
    requiresInvestors: true,
    investorType: 'pe',
  },
  {
    id: 'investor_franchise_push', type: 'investor', title: '🏪 Franchise Acceleration',
    message: 'Your strategic investor wants you to franchise aggressively. They\'re connected to 50 potential franchisees.',
    options: [
      { text: 'Accept their franchisee network', successChance: 0.7, success: { newFranchises: 5, cash: 175000, investorHappiness: 20 }, fail: { reputation: -10, qualityIssues: true } },
      { text: 'Cherry-pick best candidates', successChance: 0.8, success: { newFranchises: 2, cash: 70000, investorHappiness: 5 }, fail: { investorHappiness: -10 } },
      { text: 'Decline - not ready to scale', successChance: 1.0, success: { investorHappiness: -15 }, fail: {} },
    ],
    lesson: 'Connected investors open doors. Make sure you\'re ready to walk through them.',
    requiresInvestors: true,
    investorType: 'strategic',
  },
  {
    id: 'investor_tech_upgrade', type: 'investor', title: '💻 Technology Mandate',
    message: 'Your VC investor insists on a $200K investment in enterprise software - POS, inventory, and analytics platforms.',
    options: [
      { text: 'Implement full tech stack', successChance: 0.7, success: { cash: -200000, efficiency: 0.1, investorHappiness: 20 }, fail: { cash: -200000, morale: -15 } },
      { text: 'Phase it over 18 months', successChance: 0.8, success: { cash: -75000, efficiency: 0.05, investorHappiness: 5 }, fail: { investorHappiness: -10 } },
      { text: 'Decline - current systems work', successChance: 1.0, success: { investorHappiness: -20 }, fail: {} },
    ],
    lesson: 'Tech investments have long payback periods. Make sure the timing is right.',
    requiresInvestors: true,
    investorType: 'vc',
  },
  {
    id: 'investor_exit_pressure', type: 'investor', title: '🚪 Exit Timeline',
    message: 'Your investors are pushing for an exit within 18 months. They want you to start talking to potential buyers.',
    options: [
      { text: 'Begin confidential sale process', successChance: 0.6, success: { exitTimeline: 18, investorHappiness: 25 }, fail: { reputation: -10, staffAnxiety: true } },
      { text: 'Propose IPO path instead', successChance: 0.4, success: { startIPO: true, investorHappiness: 15 }, fail: { investorHappiness: -15 } },
      { text: 'Push back on timeline', successChance: 0.3, success: { investorHappiness: -10 }, fail: { boardConflict: true, investorHappiness: -30 } },
    ],
    lesson: 'Investors invest to exit. Understand their timeline before taking money.',
    requiresInvestors: true,
    minValuation: 5000000,
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
    difficulty: 'normal',
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
  
  // Phase 4: New modal states
  const [tutorialModal, setTutorialModal] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [vendorModal, setVendorModal] = useState(false);
  const [competitorModal, setCompetitorModal] = useState(false);
  const [eventsModal, setEventsModal] = useState(false);
  const [sellLocationModal, setSellLocationModal] = useState(false);
  const [milestonesModal, setMilestonesModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Phase 5: Settings & Engagement states
  const [settingsModal, setSettingsModal] = useState(false);
  const [hallOfFameModal, setHallOfFameModal] = useState(false);
  const [statsModal, setStatsModal] = useState(false);
  const [difficultyModal, setDifficultyModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [difficulty, setDifficulty] = useState('normal');
  const [gameSpeed, setGameSpeed] = useState('pause');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [totalRunsCompleted, setTotalRunsCompleted] = useState(0);
  const [themesUsed, setThemesUsed] = useState(['dark']);
  const autoAdvanceRef = useRef(null);
  
  // Phase 6: Advanced Business states
  const [investorModal, setInvestorModal] = useState(false);
  const [cateringModal, setCateringModal] = useState(false);
  const [foodTruckModal, setFoodTruckModal] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);
  const [realEstateModal, setRealEstateModal] = useState(false);
  const [exitStrategyModal, setExitStrategyModal] = useState(false);
  const [economyModal, setEconomyModal] = useState(false);
  const [currentEconomy, setCurrentEconomy] = useState('stable');
  const [economyWeeksRemaining, setEconomyWeeksRemaining] = useState(0);
  
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
      
      // Phase 4: Competition
      competitors: [generateCompetitor(setup.cuisine, setup.location)],
      
      // Phase 4: Vendors
      vendors: [{
        id: 'sysco',
        name: 'Sysco',
        weeksUsed: 0,
        deal: null,
        priceLevel: 1.0,
        relationship: 50,
      }],
      
      // Phase 4: Events & Calendar
      currentSeason: 'fall',
      upcomingEvents: [],
      completedEvents: [],
      
      // Phase 4: Milestones
      unlockedMilestones: [],
      milestoneRewards: 0,
      
      // Phase 4: Tutorial
      tutorialComplete: false,
      tutorialProgress: 0,
      
      // Phase 4: Statistics
      stats: {
        peakWeeklyRevenue: 0,
        peakWeeklyProfit: 0,
        totalCustomersServed: 0,
        employeesHired: 1,
        employeesFired: 0,
        scenariosWon: 0,
        scenariosLost: 0,
        locationsOpened: 1,
        locationsClosed: 0,
        franchisesSold: 0,
      },
      
      // Phase 6: Investors
      investors: [],
      totalEquitySold: 0,
      boardMembers: 0,
      investorDemands: [],
      
      // Phase 6: Real Estate
      ownedProperties: [],
      totalPropertyValue: 0,
      mortgages: [],
      
      // Phase 6: Catering & Events
      cateringEnabled: false,
      cateringContracts: [],
      cateringRevenue: 0,
      cateringCapacity: 0,
      
      // Phase 6: Food Trucks
      foodTrucks: [],
      truckEvents: [],
      truckRevenue: 0,
      
      // Phase 6: Media & Celebrity
      mediaAppearances: [],
      brandDeals: [],
      publicProfile: 0,
      cookbookSales: 0,
      
      // Phase 6: Economic Conditions
      economicCondition: 'stable',
      economicEffects: {},
      economyCycleWeek: 0,
      
      // Phase 6: Exit Planning
      exitStrategy: null,
      exitProgress: 0,
      ipoReady: false,
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
    
    const baseRevenue = dineInRevenue + deliveryRevenue + virtualBrandRevenue + barRevenue;
    
    // Apply economic multiplier (passed from parent via game state)
    const economicMultiplier = location.economicRevenueMultiplier || 1;
    const totalRevenue = baseRevenue * economicMultiplier;
    
    // Costs (also affected by economic conditions)
    const economicCostMultiplier = location.economicCostMultiplier || 1;
    const foodCost = totalRevenue * location.foodCostPct * economicCostMultiplier;
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
      // Get current economic condition and its effects
      const currentCondition = ECONOMIC_CONDITIONS.find(e => e.id === g.economicCondition) || ECONOMIC_CONDITIONS[1]; // default to stable
      const economicRevenueMultiplier = currentCondition.revenueMultiplier;
      const economicCostMultiplier = currentCondition.costMultiplier;
      
      // Apply economic effects to all locations before processing
      const locationsWithEconomics = g.locations.map(loc => ({
        ...loc,
        economicRevenueMultiplier,
        economicCostMultiplier,
      }));
      
      // Process all locations
      const updatedLocations = locationsWithEconomics.map(loc => processLocationWeek(loc, cuisine));
      
      // Calculate empire totals
      const totalLocationCash = updatedLocations.reduce((sum, l) => sum + l.cash, 0);
      const totalWeekRevenue = updatedLocations.reduce((sum, l) => sum + l.lastWeekRevenue, 0);
      const totalWeekProfit = updatedLocations.reduce((sum, l) => sum + l.lastWeekProfit, 0);
      
      // Process franchise royalties
      const franchiseRoyalties = g.franchises.reduce((sum, f) => sum + f.weeklyRoyalty, 0);
      
      // PHASE 6: Catering Revenue
      const cateringRevenue = g.cateringEnabled ? g.cateringContracts.reduce((sum, contract) => {
        const contractData = CATERING_CONTRACTS.find(c => c.id === contract.id);
        return sum + (contractData?.weeklyRevenue || 0);
      }, 0) : 0;
      
      // PHASE 6: Food Truck Revenue
      const truckRevenue = g.foodTrucks.reduce((sum, truck) => {
        const eventRevenue = truck.currentEvent ? (truck.eventRevenue || 800) : 0;
        return sum + eventRevenue;
      }, 0);
      
      // PHASE 6: Media/Brand Deal Revenue
      const brandDealRevenue = g.brandDeals.reduce((sum, deal) => {
        const dealData = BRAND_DEALS.find(d => d.id === deal.id);
        if (dealData?.type === 'royalty' && deal.active) {
          return sum + (dealData.weeklyRoyalty || 0);
        }
        return sum;
      }, 0);
      
      // PHASE 6: Property appreciation (if owning properties)
      const propertyAppreciation = g.ownedProperties.reduce((sum, prop) => {
        return sum + (prop.value * 0.0006); // ~3% annual = 0.06% weekly
      }, 0);
      
      // Loan payments from corporate
      const loanPayments = g.loans.reduce((sum, l) => {
        const loan = LOANS.find(lo => lo.id === l.type);
        return sum + (loan?.weeklyPayment || 0);
      }, 0);
      
      // PHASE 6: Mortgage payments
      const mortgagePayments = g.mortgages.reduce((sum, m) => sum + (m.weeklyPayment || 0), 0);
      
      // Corporate costs (management, district managers, etc)
      const corporateCosts = g.corporateStaff.reduce((sum, s) => sum + s.wage * 40, 0);
      const marketCosts = g.locations.reduce((sum, l) => {
        const mkt = MARKETS.find(m => m.id === l.market);
        return sum + (mkt?.managementCost || 0);
      }, 0);
      
      // Update corporate cash with all Phase 6 revenue streams
      const newCorporateCash = g.corporateCash 
        + franchiseRoyalties 
        + cateringRevenue 
        + truckRevenue 
        + brandDealRevenue
        + propertyAppreciation
        - loanPayments 
        - mortgagePayments
        - corporateCosts 
        - marketCosts;
      
      // Calculate empire valuation
      const empireValuation = calculateEmpireValuation({ ...g, locations: updatedLocations }, setup);
      
      // PHASE 6: Update property values
      const updatedProperties = g.ownedProperties.map(prop => ({
        ...prop,
        value: prop.value * 1.0006 // ~3% annual appreciation
      }));
      
      // PHASE 6: Exit Strategy Progress
      let newExitProgress = g.exitProgress;
      if (g.exitStrategy && g.exitProgress < 100) {
        const exitOption = EXIT_OPTIONS.find(e => e.id === g.exitStrategy);
        if (exitOption) {
          const progressPerWeek = 100 / exitOption.preparationTime;
          newExitProgress = Math.min(100, g.exitProgress + progressPerWeek);
        }
      }
      
      // PHASE 6: Economic Cycle Transitions (small chance each week)
      let newEconomicCondition = g.economicCondition;
      if (Math.random() < 0.03) { // 3% chance per week to shift
        const currentIdx = ECONOMIC_CONDITIONS.findIndex(e => e.id === g.economicCondition);
        const shift = Math.random() < 0.5 ? -1 : 1;
        const newIdx = Math.max(0, Math.min(ECONOMIC_CONDITIONS.length - 1, currentIdx + shift));
        if (newIdx !== currentIdx) {
          newEconomicCondition = ECONOMIC_CONDITIONS[newIdx].id;
          setTimeout(() => {
            addNotification(`📊 Economic shift: ${ECONOMIC_CONDITIONS[newIdx].name}`, 
              newIdx < currentIdx ? 'warning' : 'info');
          }, 1000);
        }
      }
      
      // PHASE 6: Media reputation boost
      const mediaBoost = g.mediaAppearances.reduce((sum, app) => {
        const media = MEDIA_OPPORTUNITIES.find(m => m.id === app.id);
        return sum + (media?.reputationBoost || 0) * 0.1; // Decay over time
      }, 0);
      
      // Apply media boost to primary location reputation
      if (updatedLocations.length > 0 && mediaBoost > 0) {
        updatedLocations[0].reputation = Math.min(100, updatedLocations[0].reputation + mediaBoost);
      }
      
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
      const allScenarios = [...SCENARIOS, ...EMPIRE_SCENARIOS, ...PHASE_6_SCENARIOS, ...INVESTOR_SCENARIOS];
      const hasInvestors = (g.investors?.length || 0) > 0;
      const investorTypes = g.investors?.map(inv => inv.type) || [];
      
      const availableScenarios = allScenarios.filter(s => {
        if (g.scenariosSeen.includes(s.id)) return false;
        if (s.minWeek && weekNum < s.minWeek) return false;
        if (s.minCash && totalLocationCash + newCorporateCash < s.minCash) return false;
        if (s.minLocations && totalLocations < s.minLocations) return false;
        if (s.maxLocations && totalLocations > s.maxLocations) return false;
        if (s.minFranchises && totalFranchises < s.minFranchises) return false;
        if (s.minReputation && updatedLocations[0].reputation < s.minReputation) return false;
        if (s.minValuation && empireValuation < s.minValuation) return false;
        // Phase 6: Investor requirements
        if (s.requiresInvestors && !hasInvestors) return false;
        if (s.investorType && !investorTypes.includes(s.investorType)) return false;
        // Phase 6: Economic condition requirements
        if (s.economic && g.economicCondition !== s.economic) return false;
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
      
      // Phase 6: Exit strategy completion
      if (newExitProgress >= 100 && g.exitStrategy) {
        const exitOption = EXIT_OPTIONS.find(e => e.id === g.exitStrategy);
        if (exitOption) {
          const finalPayout = empireValuation * exitOption.valuationMultiple * ((g.equity || 100) / 100);
          setTimeout(() => {
            addNotification(`🎉 ${exitOption.name} complete! Your payout: ${formatCurrency(finalPayout)}`, 'achievement');
            setScreen('win');
          }, 500);
        }
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
        // Phase 6 state updates
        cateringRevenue: (g.cateringRevenue || 0) + cateringRevenue,
        truckRevenue: (g.truckRevenue || 0) + truckRevenue,
        ownedProperties: updatedProperties,
        exitProgress: newExitProgress,
        economicCondition: newEconomicCondition,
        totalPropertyValue: updatedProperties.reduce((sum, p) => sum + p.value, 0),
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
        
        // Phase 4: Check milestones after week processing
        checkMilestones();
        
        // Phase 4: Check competition
        checkCompetition();
      }
    }, 800);
  }, [game, setup, processLocationWeek, checkMilestones, checkCompetition]);

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

  // ============================================
  // PHASE 4: VENDOR MANAGEMENT
  // ============================================
  const negotiateVendorDeal = (vendorId, dealId) => {
    if (!game) return;
    const vendor = VENDORS.find(v => v.id === vendorId);
    const deal = VENDOR_DEALS.find(d => d.id === dealId);
    if (!vendor || !deal) return;
    
    const currentVendor = game.vendors.find(v => v.id === vendorId);
    const relationship = currentVendor?.relationship || 50;
    const successChance = 0.5 + (relationship / 200);
    const success = Math.random() < successChance;
    
    if (success) {
      setGame(g => ({
        ...g,
        vendors: g.vendors.map(v => 
          v.id === vendorId 
            ? { ...v, deal: dealId, relationship: Math.min(100, v.relationship + 10) }
            : v
        ),
      }));
      setAiMessage(`Great news! ${vendor.name} agreed to the ${deal.name}. That\'s going to save you money.`);
    } else {
      setGame(g => ({
        ...g,
        vendors: g.vendors.map(v => 
          v.id === vendorId 
            ? { ...v, relationship: Math.max(0, v.relationship - 5) }
            : v
        ),
      }));
      setAiMessage(`${vendor.name} declined the ${deal.name}. Build more history with them and try again.`);
    }
  };

  const addVendor = (vendorId) => {
    if (!game) return;
    const vendor = VENDORS.find(v => v.id === vendorId);
    if (!vendor || game.vendors.find(v => v.id === vendorId)) return;
    
    setGame(g => ({
      ...g,
      vendors: [...g.vendors, {
        id: vendorId,
        name: vendor.name,
        weeksUsed: 0,
        deal: null,
        priceLevel: vendor.priceLevel,
        relationship: 30,
      }],
    }));
  };

  // ============================================
  // PHASE 4: COMPETITION SYSTEM
  // ============================================
  const checkCompetition = useCallback(() => {
    if (!game) return;
    
    // Randomly spawn new competitor every ~20 weeks
    if (game.week > 0 && game.week % 20 === 0 && Math.random() > 0.6) {
      const newCompetitor = generateCompetitor(setup.cuisine, setup.location);
      setGame(g => ({
        ...g,
        competitors: [...g.competitors, newCompetitor],
      }));
      setAiMessage(`Heads up - a new competitor just opened nearby: ${newCompetitor.name}. Keep an eye on them.`);
    }
    
    // Update competitor strengths
    setGame(g => ({
      ...g,
      competitors: g.competitors.map(c => ({
        ...c,
        reputation: Math.min(95, Math.max(10, c.reputation + (Math.random() - 0.5) * 5)),
        weeksOpen: c.weeksOpen + 1,
      })).filter(c => c.reputation > 15 || Math.random() > 0.1), // Weak competitors might close
    }));
  }, [game, setup]);

  // ============================================
  // PHASE 4: CALENDAR EVENTS
  // ============================================
  const checkCalendarEvents = useCallback(() => {
    if (!game) return { boost: 0, event: null };
    
    const weekOfYear = ((game.week - 1) % 52) + 1;
    const currentEvent = CALENDAR_EVENTS.find(e => e.week === weekOfYear);
    
    // Determine season
    let season = 'fall';
    for (const [s, data] of Object.entries(SEASONAL_EFFECTS)) {
      if (data.weeks.includes(weekOfYear)) {
        season = s;
        break;
      }
    }
    
    return {
      boost: currentEvent?.revenueBoost || 0,
      event: currentEvent,
      season,
      seasonalMod: SEASONAL_EFFECTS[season]?.modifier || 0,
    };
  }, [game]);

  // ============================================
  // PHASE 4: MILESTONES
  // ============================================
  const checkMilestones = useCallback(() => {
    if (!game) return;
    
    const newMilestones = [];
    const loc = getActiveLocation();
    const totalStaff = game.locations.reduce((sum, l) => sum + l.staff.length, 0);
    
    MILESTONES.forEach(m => {
      if (game.unlockedMilestones.includes(m.id)) return;
      
      let achieved = false;
      switch (m.stat) {
        case 'weeklyProfit': achieved = loc?.lastWeekProfit > m.threshold; break;
        case 'weeklyRevenue': achieved = loc?.lastWeekRevenue > m.threshold; break;
        case 'totalStaff': achieved = totalStaff >= m.threshold; break;
        case 'reputation': achieved = loc?.reputation >= m.threshold; break;
        case 'weeks': achieved = game.week >= m.threshold; break;
        case 'locations': achieved = game.locations.length >= m.threshold; break;
        case 'franchises': achieved = game.franchises.length >= m.threshold; break;
        case 'valuation': achieved = game.empireValuation >= m.threshold; break;
      }
      
      if (achieved) newMilestones.push(m);
    });
    
    if (newMilestones.length > 0) {
      const totalReward = newMilestones.reduce((sum, m) => sum + m.reward, 0);
      setGame(g => ({
        ...g,
        unlockedMilestones: [...g.unlockedMilestones, ...newMilestones.map(m => m.id)],
        milestoneRewards: g.milestoneRewards + totalReward,
        corporateCash: g.corporateCash + totalReward,
      }));
      
      const milestoneNames = newMilestones.map(m => m.name).join(', ');
      setAiMessage(`🎉 Milestone${newMilestones.length > 1 ? 's' : ''} unlocked: ${milestoneNames}! Bonus: ${formatCurrency(totalReward)}`);
    }
  }, [game, getActiveLocation]);

  // ============================================
  // PHASE 4: SELL/CLOSE LOCATION
  // ============================================
  const sellLocation = (locationId) => {
    if (!game || game.locations.length <= 1) {
      alert('Cannot sell your last location!');
      return;
    }
    
    const location = game.locations.find(l => l.id === locationId);
    if (!location) return;
    
    // Valuation: 2-3x annual profit + assets
    const annualProfit = (location.totalProfit / Math.max(1, location.weeksOpen)) * 52;
    const assetValue = location.equipment.length * 5000 + location.upgrades.length * 15000;
    const salePrice = Math.max(25000, Math.floor(annualProfit * (2 + Math.random()) + assetValue));
    
    setGame(g => ({
      ...g,
      locations: g.locations.filter(l => l.id !== locationId),
      corporateCash: g.corporateCash + salePrice,
      stats: { ...g.stats, locationsClosed: g.stats.locationsClosed + 1 },
    }));
    
    // Switch to another location
    const remainingLocations = game.locations.filter(l => l.id !== locationId);
    if (remainingLocations.length > 0) {
      setActiveLocationId(remainingLocations[0].id);
    }
    
    setSellLocationModal(false);
    setAiMessage(`Sold ${location.name} for ${formatCurrency(salePrice)}. Sometimes knowing when to exit is the smartest move.`);
  };

  const closeLocation = (locationId) => {
    if (!game || game.locations.length <= 1) {
      alert('Cannot close your last location!');
      return;
    }
    
    const location = game.locations.find(l => l.id === locationId);
    if (!location) return;
    
    // Closing costs: severance, lease break, etc.
    const closingCost = location.staff.length * 1000 + location.rent * 3;
    
    setGame(g => ({
      ...g,
      locations: g.locations.filter(l => l.id !== locationId),
      corporateCash: g.corporateCash - closingCost,
      stats: { ...g.stats, locationsClosed: g.stats.locationsClosed + 1 },
    }));
    
    const remainingLocations = game.locations.filter(l => l.id !== locationId);
    if (remainingLocations.length > 0) {
      setActiveLocationId(remainingLocations[0].id);
    }
    
    setSellLocationModal(false);
    setAiMessage(`Closed ${location.name}. Closing costs: ${formatCurrency(closingCost)}. Not every location works out - that\'s business.`);
  };

  // ============================================
  // PHASE 4: TUTORIAL
  // ============================================
  const advanceTutorial = () => {
    const nextStep = tutorialStep + 1;
    if (nextStep >= TUTORIAL_STEPS.length) {
      setShowTutorial(false);
      setGame(g => ({ ...g, tutorialComplete: true }));
      setAiMessage('Tutorial complete! You\'ve got the basics. Now the real learning begins. Good luck, chef!');
    } else {
      setTutorialStep(nextStep);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setGame(g => g ? { ...g, tutorialComplete: true } : g);
  };

  // ============================================
  // PHASE 5: SETTINGS & ENGAGEMENT FUNCTIONS
  // ============================================
  
  // Theme Management
  const getThemeColors = useCallback(() => {
    return THEMES[currentTheme]?.colors || THEMES.dark.colors;
  }, [currentTheme]);
  
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    if (!themesUsed.includes(themeId)) {
      setThemesUsed([...themesUsed, themeId]);
      // Check for theme collector achievement
      if (themesUsed.length + 1 >= 5) {
        addNotification('achievement', '🎨 Theme Collector achievement unlocked!');
      }
    }
    try {
      localStorage.setItem('86d_theme', themeId);
    } catch (e) {}
  };
  
  // Notification System
  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);
  
  // Auto-Advance System
  useEffect(() => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    
    const speedOption = SPEED_OPTIONS.find(s => s.id === gameSpeed);
    if (speedOption?.interval && game && screen === 'game' && !scenario) {
      autoAdvanceRef.current = setInterval(() => {
        processWeek();
      }, speedOption.interval);
    }
    
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, [gameSpeed, game, screen, scenario, processWeek]);
  
  // Tips Rotation
  useEffect(() => {
    if (showTips && game) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % GAMEPLAY_TIPS.length);
      }, 30000); // Change tip every 30 seconds
      return () => clearInterval(tipInterval);
    }
  }, [showTips, game]);
  
  // Auto-Save
  useEffect(() => {
    if (autoSaveEnabled && game && game.week > 0 && game.week % 4 === 0) {
      try {
        const autoSave = {
          game, setup, savedAt: new Date().toISOString(), name: 'Auto-Save',
          week: game.week, cash: game.corporateCash + game.locations.reduce((s, l) => s + l.cash, 0),
        };
        localStorage.setItem('86d_autosave', JSON.stringify(autoSave));
      } catch (e) {}
    }
  }, [game?.week, autoSaveEnabled, game, setup]);
  
  // Hall of Fame Update
  const updateHallOfFame = useCallback(() => {
    if (!game) return;
    
    const currentRun = {
      id: Date.now(),
      date: new Date().toISOString(),
      cuisine: setup.cuisine,
      restaurantName: setup.name,
      difficulty: setup.difficulty || 'normal',
      weeksSurvived: game.week,
      peakWeeklyRevenue: game.stats?.peakWeeklyRevenue || 0,
      maxLocations: Math.max(game.locations?.length || 1, game.stats?.locationsOpened || 1),
      peakValuation: game.empireValuation || 0,
      maxStaff: game.stats?.employeesHired || game.locations?.reduce((s, l) => s + l.staff.length, 0) || 0,
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem('86d_hall_of_fame') || '[]');
      const updated = [...existing, currentRun].slice(-50); // Keep last 50 runs
      localStorage.setItem('86d_hall_of_fame', JSON.stringify(updated));
      setHallOfFame(updated);
    } catch (e) {}
  }, [game, setup]);
  
  // Load Hall of Fame on mount
  useEffect(() => {
    try {
      const hof = JSON.parse(localStorage.getItem('86d_hall_of_fame') || '[]');
      setHallOfFame(hof);
      const savedTheme = localStorage.getItem('86d_theme');
      if (savedTheme && THEMES[savedTheme]) setCurrentTheme(savedTheme);
      const savedPrestige = parseInt(localStorage.getItem('86d_prestige') || '0');
      setPrestigeLevel(savedPrestige);
    } catch (e) {}
  }, []);
  
  // Prestige System
  const calculatePrestigePoints = () => {
    if (!game) return 0;
    let points = 0;
    points += Math.floor(game.week / 52); // 1 point per year survived
    points += Math.floor((game.empireValuation || 0) / 500000); // 1 point per $500K valuation
    points += (game.locations?.length || 1) - 1; // 1 point per extra location
    points += Math.floor((game.franchises?.length || 0) / 2); // 1 point per 2 franchises
    if (setup.difficulty === 'hard') points *= 1.5;
    if (setup.difficulty === 'nightmare') points *= 2;
    return Math.floor(points);
  };
  
  const startNewGamePlus = () => {
    const points = calculatePrestigePoints();
    const newPrestige = Math.min(5, prestigeLevel + Math.floor(points / 10));
    
    updateHallOfFame();
    setPrestigeLevel(newPrestige);
    setTotalRunsCompleted(prev => prev + 1);
    
    try {
      localStorage.setItem('86d_prestige', String(newPrestige));
    } catch (e) {}
    
    // Reset to welcome with prestige bonus message
    setGame(null);
    setScreen('welcome');
    setOnboardingStep(0);
    addNotification('milestone', `New Game+ started! Prestige Level ${newPrestige}`);
  };
  
  // Get Prestige Bonus for current level
  const getPrestigeBonus = () => {
    if (prestigeLevel <= 0) return null;
    return PRESTIGE_BONUSES[Math.min(prestigeLevel, PRESTIGE_BONUSES.length) - 1];
  };
  
  // Get best record for a category
  const getBestRecord = (categoryId) => {
    const category = HALL_OF_FAME_CATEGORIES.find(c => c.id === categoryId);
    if (!category || hallOfFame.length === 0) return null;
    
    const sorted = [...hallOfFame].sort((a, b) => (b[category.stat] || 0) - (a[category.stat] || 0));
    return sorted[0];
  };
  
  // Get difficulty modifier
  const getDifficultyMod = () => {
    return DIFFICULTY_MODES.find(d => d.id === (setup.difficulty || difficulty)) || DIFFICULTY_MODES[1];
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

  // Simple test return
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ color: '#F59E0B', fontSize: 48, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>86'd</Text>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20, textAlign: 'center' }}>Logic Test - All Hooks Loaded</Text>
        
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Screen State: {screen}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Setup: {JSON.stringify(setup).slice(0, 50)}...</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Game Speed: {gameSpeed}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Difficulty: {difficulty}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Theme: {currentTheme}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Prestige Level: {prestigeLevel}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Hall of Fame Entries: {hallOfFame.length}</Text>
        <Text style={{ color: '#0f0', fontSize: 14, marginBottom: 5 }}>✓ Notifications: {notifications.length}</Text>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#F59E0B', padding: 15, borderRadius: 8, marginTop: 20 }}
          onPress={() => setScreen(screen === 'welcome' ? 'setup' : 'welcome')}
        >
          <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
            Toggle Screen (Current: {screen})
          </Text>
        </TouchableOpacity>
        
        <Text style={{ color: '#737373', fontSize: 12, textAlign: 'center', marginTop: 20 }}>v8.5.0 - 2738 Lines Logic Test</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
});
