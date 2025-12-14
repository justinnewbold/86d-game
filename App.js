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

// ============================================
// PHASE 7: POLISH & ADVANCED SYSTEMS
// ============================================

// LABOR SCHEDULING SYSTEM
const SHIFT_TYPES = [
  { id: 'morning', name: 'Morning', icon: '🌅', hours: '6AM-2PM', laborMod: 0.9, coverageNeed: 0.6 },
  { id: 'lunch', name: 'Lunch Rush', icon: '☀️', hours: '11AM-3PM', laborMod: 1.2, coverageNeed: 1.0 },
  { id: 'dinner', name: 'Dinner', icon: '🌙', hours: '4PM-11PM', laborMod: 1.0, coverageNeed: 1.0 },
  { id: 'closing', name: 'Closing', icon: '🌃', hours: '9PM-1AM', laborMod: 1.1, coverageNeed: 0.5 },
  { id: 'weekend', name: 'Weekend', icon: '🎉', hours: 'Sat-Sun', laborMod: 1.15, coverageNeed: 1.3 },
];

const OVERTIME_RULES = {
  regularHours: 40,
  overtimeMultiplier: 1.5,
  doubleTimeThreshold: 60,
  doubleTimeMultiplier: 2.0,
  maxHoursPerWeek: 65,
  burnoutThreshold: 50,
};

// INVENTORY & SPOILAGE SYSTEM
const INVENTORY_CATEGORIES = [
  { id: 'proteins', name: 'Proteins', icon: '🥩', spoilDays: 3, costPct: 0.35, wasteRisk: 0.15 },
  { id: 'produce', name: 'Produce', icon: '🥬', spoilDays: 5, costPct: 0.15, wasteRisk: 0.20 },
  { id: 'dairy', name: 'Dairy', icon: '🧀', spoilDays: 7, costPct: 0.10, wasteRisk: 0.10 },
  { id: 'dry_goods', name: 'Dry Goods', icon: '🍚', spoilDays: 90, costPct: 0.15, wasteRisk: 0.02 },
  { id: 'frozen', name: 'Frozen', icon: '🧊', spoilDays: 30, costPct: 0.15, wasteRisk: 0.05 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', spoilDays: 60, costPct: 0.10, wasteRisk: 0.03 },
];

const INVENTORY_STRATEGIES = [
  { id: 'just_in_time', name: 'Just-In-Time', icon: '⚡', wasteMod: 0.5, costMod: 1.1, riskMod: 1.3, description: 'Order frequently, minimal stock. Lower waste, higher costs, stockout risk.' },
  { id: 'weekly_order', name: 'Weekly Orders', icon: '📅', wasteMod: 1.0, costMod: 1.0, riskMod: 1.0, description: 'Standard weekly ordering. Balanced approach.' },
  { id: 'bulk_buying', name: 'Bulk Buying', icon: '📦', wasteMod: 1.4, costMod: 0.85, riskMod: 0.7, description: 'Buy in bulk for discounts. More waste, lower costs.' },
  { id: 'par_levels', name: 'Par Level System', icon: '📊', wasteMod: 0.7, costMod: 1.05, riskMod: 0.8, description: 'Maintain set inventory levels. Professional approach.' },
];

// CUSTOMER LOYALTY PROGRAM
const LOYALTY_TIERS = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', pointsRequired: 0, discount: 0, perks: ['Birthday reward'], color: '#CD7F32' },
  { id: 'silver', name: 'Silver', icon: '🥈', pointsRequired: 500, discount: 0.05, perks: ['5% off', 'Priority seating'], color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', icon: '🥇', pointsRequired: 1500, discount: 0.10, perks: ['10% off', 'Free appetizer monthly', 'Early access'], color: '#FFD700' },
  { id: 'platinum', name: 'Platinum', icon: '💎', pointsRequired: 5000, discount: 0.15, perks: ['15% off', 'Free entree monthly', 'VIP events', 'Reserved parking'], color: '#E5E4E2' },
];

const LOYALTY_PROGRAM_TYPES = [
  { id: 'none', name: 'No Program', icon: '❌', cost: 0, retention: 1.0, description: 'No loyalty program' },
  { id: 'punch_card', name: 'Punch Card', icon: '🎫', cost: 500, retention: 1.1, description: 'Buy 10 get 1 free. Simple but effective.' },
  { id: 'points_program', name: 'Points Program', icon: '⭐', cost: 2500, retention: 1.2, description: '1 point per dollar. Redeem for rewards.' },
  { id: 'tiered_program', name: 'Tiered VIP', icon: '👑', cost: 10000, retention: 1.35, description: 'Bronze to Platinum tiers with escalating perks.' },
  { id: 'subscription', name: 'Subscription Club', icon: '💳', cost: 5000, retention: 1.4, monthlyFee: 25, description: '$25/month for unlimited soft drinks and 20% off.' },
];

// GOOGLE REVIEWS SYSTEM (The only reviews that matter!)
const REVIEW_RESPONSE_TYPES = [
  { id: 'ignore', name: 'Ignore', icon: '🙈', effect: -0.1, time: 0, description: 'Don\'t respond (not recommended)' },
  { id: 'template', name: 'Template Response', icon: '📝', effect: 0.05, time: 1, description: 'Generic thank you message' },
  { id: 'personalized', name: 'Personalized', icon: '💬', effect: 0.15, time: 5, description: 'Thoughtful, specific response' },
  { id: 'offer_resolution', name: 'Offer Resolution', icon: '🤝', effect: 0.25, time: 10, description: 'Invite back, offer to make it right' },
];

const REVIEW_TEMPLATES = [
  { stars: 5, texts: ['Amazing food!', 'Best restaurant in town!', 'Will definitely be back!', 'The staff was incredible!', 'Perfect date night spot!'] },
  { stars: 4, texts: ['Really good, minor wait time.', 'Food was great, service could improve.', 'Solid choice, would recommend.', 'Good value for money.'] },
  { stars: 3, texts: ['It was okay, nothing special.', 'Average experience.', 'Food was fine but overpriced.', 'Hit or miss depending on the day.'] },
  { stars: 2, texts: ['Disappointed with the quality.', 'Long wait, mediocre food.', 'Expected more based on reviews.', 'Probably won\'t return.'] },
  { stars: 1, texts: ['Terrible experience!', 'Food poisoning risk!', 'Worst service ever!', 'Health department should visit!', 'DO NOT EAT HERE!'] },
];

// GLOBAL LEADERBOARD CATEGORIES
const LEADERBOARD_CATEGORIES = [
  { id: 'empire_value', name: 'Empire Value', icon: '💰', stat: 'empireValuation', format: (v) => `$${(v/1000000).toFixed(2)}M` },
  { id: 'total_revenue', name: 'Total Revenue', icon: '📈', stat: 'totalRevenue', format: (v) => `$${(v/1000000).toFixed(2)}M` },
  { id: 'weeks_survived', name: 'Weeks Survived', icon: '📅', stat: 'week', format: (v) => `${v} weeks` },
  { id: 'locations_count', name: 'Most Locations', icon: '🏪', stat: 'locationsCount', format: (v) => `${v} locations` },
  { id: 'google_rating', name: 'Best Rated', icon: '⭐', stat: 'googleRating', format: (v) => `${v.toFixed(1)} stars` },
  { id: 'staff_count', name: 'Most Employees', icon: '👥', stat: 'totalStaff', format: (v) => `${v} staff` },
  { id: 'profit_streak', name: 'Longest Profit Streak', icon: '🔥', stat: 'profitStreak', format: (v) => `${v} weeks` },
];

// SOUND EFFECTS (visual feedback since we can't play actual audio in React Native Web easily)
const SOUND_EFFECTS = {
  cash_register: '💵 Ka-ching!',
  level_up: '⬆️ Level Up!',
  achievement: '🏆 Achievement Unlocked!',
  warning: '⚠️ Warning!',
  success: '✅ Success!',
  failure: '❌ Failed!',
  notification: '🔔 Notification!',
  week_end: '📅 Week Complete!',
};

// SOCIAL SHARING TEMPLATES
const SHARE_TEMPLATES = {
  achievement: (name, game) => `🏆 Just unlocked "${name}" in 86'd! My restaurant empire is worth ${formatCurrency(game?.empireValuation || 0)}. Can you beat that? #86dGame #RestaurantSim`,
  milestone: (milestone) => `🎯 Hit a major milestone in 86'd: ${milestone}! This restaurant business simulator is no joke. #86dGame`,
  weekly_profit: (profit) => `💰 Just made ${formatCurrency(profit)} profit this week in 86'd! The grind is real. #86dGame #RestaurantLife`,
  empire: (locations, valuation) => `🏛️ Built a ${locations}-location restaurant empire worth ${formatCurrency(valuation)} in 86'd! #86dGame #RestaurantEmpire`,
  google_rating: (rating) => `⭐ My restaurant has a ${rating.toFixed(1)} star Google rating in 86'd! Customers love us! #86dGame`,
};

// PHASE 7 ACHIEVEMENTS
const PHASE7_ACHIEVEMENTS = [
  { id: 'five_star_google', name: 'Five Star Chef', description: 'Maintain 5.0 Google rating for 4 weeks', icon: '⭐', reward: 25000 },
  { id: 'review_responder', name: 'Review Responder', description: 'Respond to 50 Google reviews', icon: '💬', reward: 10000 },
  { id: 'loyalty_program', name: 'Loyalty Builder', description: 'Have 100 loyalty members', icon: '👑', reward: 15000 },
  { id: 'platinum_member', name: 'VIP Treatment', description: 'Have a platinum loyalty member', icon: '💎', reward: 20000 },
  { id: 'zero_waste', name: 'Zero Waste Hero', description: 'Keep spoilage under 2% for a month', icon: '♻️', reward: 30000 },
  { id: 'scheduling_master', name: 'Scheduling Master', description: 'Perfect shift coverage for 4 weeks', icon: '📅', reward: 15000 },
  { id: 'no_overtime', name: 'Budget Boss', description: 'No overtime for 8 consecutive weeks', icon: '💪', reward: 20000 },
  { id: 'leaderboard_top10', name: 'Top 10', description: 'Reach top 10 on any leaderboard', icon: '🏅', reward: 50000 },
  { id: 'social_influencer', name: 'Social Influencer', description: 'Share 10 achievements', icon: '📱', reward: 10000 },
  { id: 'full_coverage', name: 'Fully Staffed', description: 'Have all shifts covered with no gaps', icon: '✅', reward: 12000 },
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
  
  // Phase 7: Polish Systems
  const [schedulingModal, setSchedulingModal] = useState(false);
  const [inventoryModal, setInventoryModal] = useState(false);
  const [loyaltyModal, setLoyaltyModal] = useState(false);
  const [reviewsModal, setReviewsModal] = useState(false);
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundFeedback, setSoundFeedback] = useState(null);
  
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
      
      // Phase 7: Labor Scheduling
      scheduleTemplate: 'standard',
      overtimeHours: 0,
      shiftCoverage: { morning: 0, lunch: 0, dinner: 0, closing: 0, weekend: 0 },
      laborEfficiency: 1.0,
      
      // Phase 7: Inventory & Spoilage
      inventoryStrategy: 'weekly_order',
      spoilageRate: 0.08, // 8% typical
      spoilageCost: 0,
      inventoryLevels: {},
      lastOrderWeek: 0,
      
      // Phase 7: Customer Loyalty
      loyaltyProgram: 'none',
      loyaltyMembers: [],
      totalLoyaltyMembers: 0,
      loyaltyRedemptions: 0,
      loyaltyPointsIssued: 0,
      
      // Phase 7: Google Reviews
      googleRating: 4.2 + Math.random() * 0.5, // Start between 4.2-4.7
      totalReviews: Math.floor(15 + Math.random() * 35),
      recentReviews: [],
      reviewsResponded: 0,
      reviewResponseRate: 0,
      
      // Phase 7: Social & Leaderboard
      shareCount: 0,
      leaderboardRank: {},
      cloudSaveEnabled: false,
      lastCloudSync: null,
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
      
      // PHASE 7: Inventory Spoilage Calculation
      const inventoryStrategy = INVENTORY_STRATEGIES.find(s => s.id === g.inventoryStrategy) || INVENTORY_STRATEGIES[1];
      const baseSpoilage = 0.08; // 8% base
      const spoilageRate = baseSpoilage * inventoryStrategy.wasteMod;
      const spoilageCost = totalWeekRevenue * 0.30 * spoilageRate; // 30% is food cost, then spoilage %
      
      // PHASE 7: Labor Scheduling Efficiency
      const totalStaffHours = updatedLocations.reduce((sum, loc) => 
        sum + loc.staff.reduce((s, staff) => s + 40, 0), 0);
      const overtimeHours = Math.max(0, totalStaffHours - (updatedLocations.length * 160)); // 160 regular hours per location
      const overtimeCost = overtimeHours * 25 * 0.5; // $25/hr * 0.5 overtime premium
      
      // PHASE 7: Loyalty Program Effects
      const loyaltyProgram = LOYALTY_PROGRAM_TYPES.find(p => p.id === g.loyaltyProgram) || LOYALTY_PROGRAM_TYPES[0];
      const loyaltyRetentionBoost = loyaltyProgram.retention - 1; // e.g., 0.2 for 20% boost
      const newLoyaltyMembers = g.loyaltyProgram !== 'none' ? Math.floor(totalWeekRevenue / 500 * (1 + loyaltyRetentionBoost)) : 0;
      const loyaltyRevenueBoost = loyaltyRetentionBoost * 0.5; // Half the retention boost goes to revenue
      
      // PHASE 7: Google Reviews Generation
      let newGoogleRating = g.googleRating || 4.3;
      const newReviews = [];
      const reviewChance = 0.02; // 2% of customers leave reviews
      const reviewCount = Math.floor(totalWeekRevenue / 30 * reviewChance);
      
      for (let i = 0; i < reviewCount; i++) {
        // Rating influenced by reputation and food quality
        const baseRating = 3 + (updatedLocations[0]?.reputation || 50) / 33;
        const variance = (Math.random() - 0.5) * 2;
        const stars = Math.max(1, Math.min(5, Math.round(baseRating + variance)));
        const templates = REVIEW_TEMPLATES.find(t => t.stars === stars)?.texts || ['Good experience.'];
        newReviews.push({
          id: Date.now() + i,
          stars,
          text: templates[Math.floor(Math.random() * templates.length)],
          week: g.week + 1,
          responded: false,
          customerName: generateName(),
        });
      }
      
      // Update Google rating (weighted average with existing)
      if (newReviews.length > 0) {
        const totalReviews = (g.totalReviews || 0) + newReviews.length;
        const newAvgStars = newReviews.reduce((sum, r) => sum + r.stars, 0) / newReviews.length;
        newGoogleRating = ((g.googleRating || 4.3) * (g.totalReviews || 20) + newAvgStars * newReviews.length) / totalReviews;
        newGoogleRating = Math.round(newGoogleRating * 10) / 10; // Round to 1 decimal
      }
      
      // Google rating affects customer traffic
      const googleRatingMod = (newGoogleRating - 4.0) * 0.1; // +/- 10% per 1 star from 4.0
      if (updatedLocations.length > 0) {
        updatedLocations[0].reputation = Math.min(100, Math.max(0, 
          updatedLocations[0].reputation + (newGoogleRating >= 4.5 ? 1 : newGoogleRating < 3.5 ? -2 : 0)));
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
        corporateCash: newCorporateCash - spoilageCost - overtimeCost, // Subtract Phase 7 costs
        totalRevenue: g.totalRevenue + totalWeekRevenue,
        totalProfit: g.totalProfit + totalWeekProfit - spoilageCost - overtimeCost,
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
        // Phase 7 state updates
        spoilageRate,
        spoilageCost: (g.spoilageCost || 0) + spoilageCost,
        overtimeHours: (g.overtimeHours || 0) + overtimeHours,
        totalLoyaltyMembers: (g.totalLoyaltyMembers || 0) + newLoyaltyMembers,
        googleRating: newGoogleRating,
        totalReviews: (g.totalReviews || 20) + newReviews.length,
        recentReviews: [...newReviews, ...(g.recentReviews || [])].slice(0, 50), // Keep last 50
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
          <Text style={styles.versionText}>v9.0.0 • Phase 7 • Full Release</Text>
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
          {/* Phase 5: Tips Banner */}
          {showTips && game && (
            <View style={styles.tipBanner}>
              <Text style={styles.tipText}>{GAMEPLAY_TIPS[currentTip % GAMEPLAY_TIPS.length]?.tip || ''}</Text>
            </View>
          )}
          
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
                  <TouchableOpacity style={styles.quickAction} onPress={() => setVendorModal(true)}>
                    <Text style={styles.quickActionIcon}>🚛</Text>
                    <Text style={styles.quickActionText}>Vendors</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setCompetitorModal(true)}>
                    <Text style={styles.quickActionIcon}>👀</Text>
                    <Text style={styles.quickActionText}>Competition</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setEventsModal(true)}>
                    <Text style={styles.quickActionIcon}>📅</Text>
                    <Text style={styles.quickActionText}>Events</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction} onPress={() => setMilestonesModal(true)}>
                    <Text style={styles.quickActionIcon}>🏆</Text>
                    <Text style={styles.quickActionText}>Milestones</Text>
                  </TouchableOpacity>
                  {/* Phase 6 Quick Actions */}
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setInvestorModal(true)}>
                    <Text style={styles.quickActionIcon}>🏦</Text>
                    <Text style={styles.quickActionText}>Investors</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setCateringModal(true)}>
                    <Text style={styles.quickActionIcon}>🍽️</Text>
                    <Text style={styles.quickActionText}>Catering</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setFoodTruckModal(true)}>
                    <Text style={styles.quickActionIcon}>🚚</Text>
                    <Text style={styles.quickActionText}>Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setMediaModal(true)}>
                    <Text style={styles.quickActionIcon}>📺</Text>
                    <Text style={styles.quickActionText}>Media</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setExitStrategyModal(true)}>
                    <Text style={styles.quickActionIcon}>🚪</Text>
                    <Text style={styles.quickActionText}>Exit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: (game?.ownedProperties?.length || 0) > 0 ? colors.success : colors.surfaceLight }]} onPress={() => setRealEstateModal(true)}>
                    <Text style={styles.quickActionIcon}>🏢</Text>
                    <Text style={styles.quickActionText}>Property</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: currentEconomy === 'recession' ? colors.accent : currentEconomy === 'boom' ? colors.success : colors.surfaceLight }]} onPress={() => setEconomyModal(true)}>
                    <Text style={styles.quickActionIcon}>{ECONOMIC_CONDITIONS.find(e => e.id === currentEconomy)?.icon || '📊'}</Text>
                    <Text style={styles.quickActionText}>Economy</Text>
                  </TouchableOpacity>
                  {/* Phase 7 Quick Actions */}
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setSchedulingModal(true)}>
                    <Text style={styles.quickActionIcon}>📅</Text>
                    <Text style={styles.quickActionText}>Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: (game?.spoilageRate || 0.08) > 0.10 ? colors.accent : colors.surfaceLight }]} onPress={() => setInventoryModal(true)}>
                    <Text style={styles.quickActionIcon}>📦</Text>
                    <Text style={styles.quickActionText}>Inventory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: game?.loyaltyProgram !== 'none' ? colors.primary : colors.surfaceLight }]} onPress={() => setLoyaltyModal(true)}>
                    <Text style={styles.quickActionIcon}>👑</Text>
                    <Text style={styles.quickActionText}>Loyalty</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: (game?.googleRating || 4.3) >= 4.5 ? colors.success : (game?.googleRating || 4.3) < 3.5 ? colors.accent : colors.surfaceLight }]} onPress={() => setReviewsModal(true)}>
                    <Text style={styles.quickActionIcon}>⭐</Text>
                    <Text style={styles.quickActionText}>{(game?.googleRating || 4.3).toFixed(1)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setLeaderboardModal(true)}>
                    <Text style={styles.quickActionIcon}>🏆</Text>
                    <Text style={styles.quickActionText}>Ranks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceLight }]} onPress={() => setShareModal(true)}>
                    <Text style={styles.quickActionIcon}>📱</Text>
                    <Text style={styles.quickActionText}>Share</Text>
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

                {/* Exit Strategy */}
                {game.locations.length > 1 && (
                  <>
                    <Text style={styles.sectionTitle}>Exit Strategy</Text>
                    <TouchableOpacity style={styles.expansionButton} onPress={() => setSellLocationModal(true)}>
                      <Text style={styles.expansionButtonIcon}>💼</Text>
                      <View>
                        <Text style={styles.expansionButtonTitle}>Sell or Close Location</Text>
                        <Text style={styles.expansionButtonDesc}>Exit underperforming locations strategically</Text>
                      </View>
                    </TouchableOpacity>
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

        {/* Phase 4: Vendor Modal */}
        <Modal visible={vendorModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚛 Vendor Management</Text>
                <TouchableOpacity onPress={() => setVendorModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.sectionTitle}>Your Vendors</Text>
                {game?.vendors?.map(v => {
                  const vendorData = VENDORS.find(vd => vd.id === v.id);
                  const activeDeal = VENDOR_DEALS.find(d => d.id === v.deal);
                  return (
                    <View key={v.id} style={styles.vendorCard}>
                      <View style={styles.vendorHeader}>
                        <Text style={styles.vendorIcon}>{vendorData?.icon}</Text>
                        <View style={styles.vendorInfo}>
                          <Text style={styles.vendorName}>{v.name}</Text>
                          <Text style={styles.vendorType}>{vendorData?.type} • {v.weeksUsed} weeks</Text>
                        </View>
                        <View>
                          <Text style={styles.vendorRelationship}>Rel: {v.relationship}%</Text>
                          {activeDeal && <Text style={styles.vendorDeal}>✓ {activeDeal.name}</Text>}
                        </View>
                      </View>
                      {!activeDeal && (
                        <View style={styles.dealOptions}>
                          <Text style={styles.dealLabel}>Negotiate Deal:</Text>
                          {VENDOR_DEALS.map(deal => (
                            <TouchableOpacity 
                              key={deal.id} 
                              style={styles.dealOption}
                              onPress={() => negotiateVendorDeal(v.id, deal.id)}
                            >
                              <Text style={styles.dealName}>{deal.name}</Text>
                              <Text style={styles.dealDesc}>{deal.description}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}

                <Text style={styles.sectionTitle}>Available Vendors</Text>
                {VENDORS.filter(v => !game?.vendors?.find(gv => gv.id === v.id)).map(vendor => (
                  <TouchableOpacity key={vendor.id} style={styles.addVendorCard} onPress={() => addVendor(vendor.id)}>
                    <Text style={styles.vendorIcon}>{vendor.icon}</Text>
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorName}>{vendor.name}</Text>
                      <Text style={styles.vendorType}>{vendor.type} • Min order: {formatCurrency(vendor.minOrder)}</Text>
                      <Text style={styles.vendorStats}>Quality: {Math.round(vendor.quality * 100)}% • Reliability: {Math.round(vendor.reliability * 100)}%</Text>
                    </View>
                    <Text style={styles.addVendorBtn}>+ Add</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 4: Competition Modal */}
        <Modal visible={competitorModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👀 Competition</Text>
                <TouchableOpacity onPress={() => setCompetitorModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.competitionIntro}>Know your competition. Watch their moves. Learn from them.</Text>
                {game?.competitors?.map(c => {
                  const typeData = COMPETITOR_TYPES.find(t => t.id === c.type);
                  return (
                    <View key={c.id} style={styles.competitorCard}>
                      <Text style={styles.competitorIcon}>{c.icon}</Text>
                      <View style={styles.competitorInfo}>
                        <Text style={styles.competitorName}>{c.name}</Text>
                        <Text style={styles.competitorType}>{typeData?.name} • {c.weeksOpen} weeks old</Text>
                        <View style={styles.competitorStats}>
                          <Text style={styles.competitorStat}>Rep: {c.reputation}%</Text>
                          <Text style={styles.competitorStat}>Price: {'$'.repeat(c.priceLevel)}</Text>
                          {c.aggressive && <Text style={[styles.competitorStat, { color: colors.accent }]}>⚡ Aggressive</Text>}
                        </View>
                      </View>
                      <View style={styles.threatLevel}>
                        <Text style={styles.threatLabel}>Threat</Text>
                        <Text style={[styles.threatValue, { color: c.threat > 0.2 ? colors.accent : colors.warning }]}>{Math.round(c.threat * 100)}%</Text>
                      </View>
                    </View>
                  );
                })}
                {(!game?.competitors || game.competitors.length === 0) && (
                  <Text style={styles.noCompetitors}>No direct competitors yet. Enjoy it while it lasts!</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 4: Events Calendar Modal */}
        <Modal visible={eventsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📅 Events Calendar</Text>
                <TouchableOpacity onPress={() => setEventsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.calendarIntro}>Plan ahead for these key dates that affect restaurant traffic.</Text>
                <Text style={styles.currentWeekLabel}>Current: Week {game?.week} of Year {Math.floor((game?.week || 0) / 52) + 1}</Text>
                
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                {CALENDAR_EVENTS.filter(e => e.week > ((game?.week - 1) % 52) + 1).slice(0, 6).map(event => (
                  <View key={event.id} style={styles.eventCard}>
                    <Text style={styles.eventIcon}>{event.icon}</Text>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventWeek}>Week {event.week}</Text>
                      <Text style={styles.eventTip}>💡 {event.tip}</Text>
                    </View>
                    <View style={styles.eventBoost}>
                      <Text style={[styles.eventBoostValue, { color: event.revenueBoost >= 0 ? colors.success : colors.accent }]}>
                        {event.revenueBoost >= 0 ? '+' : ''}{Math.round(event.revenueBoost * 100)}%
                      </Text>
                      <Text style={styles.eventBoostLabel}>Revenue</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 4: Milestones Modal */}
        <Modal visible={milestonesModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏆 Milestones</Text>
                <TouchableOpacity onPress={() => setMilestonesModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                <View style={styles.milestoneSummary}>
                  <Text style={styles.milestoneCount}>{game?.unlockedMilestones?.length || 0}/{MILESTONES.length}</Text>
                  <Text style={styles.milestoneLabel}>Milestones Unlocked</Text>
                  <Text style={styles.milestoneRewards}>Total Rewards: {formatCurrency(game?.milestoneRewards || 0)}</Text>
                </View>
                
                {MILESTONES.map(m => {
                  const unlocked = game?.unlockedMilestones?.includes(m.id);
                  return (
                    <View key={m.id} style={[styles.milestoneCard, unlocked && styles.milestoneUnlocked]}>
                      <Text style={styles.milestoneIcon}>{unlocked ? m.icon : '🔒'}</Text>
                      <View style={styles.milestoneInfo}>
                        <Text style={[styles.milestoneName, unlocked && styles.milestoneNameUnlocked]}>{m.name}</Text>
                        <Text style={styles.milestoneDesc}>{m.description}</Text>
                      </View>
                      <Text style={[styles.milestoneReward, unlocked && styles.milestoneRewardUnlocked]}>
                        {unlocked ? '✓' : formatCurrency(m.reward)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 4: Sell/Close Location Modal */}
        <Modal visible={sellLocationModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💼 Exit Strategy</Text>
                <TouchableOpacity onPress={() => setSellLocationModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {game?.locations?.length > 1 ? (
                  <>
                    <Text style={styles.exitIntro}>Sometimes the best move is knowing when to exit. Select a location:</Text>
                    {game.locations.map(l => {
                      const annualProfit = (l.totalProfit / Math.max(1, l.weeksOpen)) * 52;
                      const estimatedValue = Math.max(25000, Math.floor(annualProfit * 2.5 + l.equipment.length * 5000));
                      const closingCost = l.staff.length * 1000 + l.rent * 3;
                      return (
                        <View key={l.id} style={styles.exitLocationCard}>
                          <View style={styles.exitLocationHeader}>
                            <Text style={styles.exitLocationName}>{l.name}</Text>
                            <Text style={styles.exitLocationWeeks}>{l.weeksOpen} weeks</Text>
                          </View>
                          <View style={styles.exitLocationStats}>
                            <Text style={styles.exitStat}>Cash: {formatCurrency(l.cash)}</Text>
                            <Text style={styles.exitStat}>Staff: {l.staff.length}</Text>
                            <Text style={styles.exitStat}>Rep: {l.reputation}%</Text>
                          </View>
                          <View style={styles.exitActions}>
                            <TouchableOpacity 
                              style={styles.sellButton}
                              onPress={() => sellLocation(l.id)}
                            >
                              <Text style={styles.sellButtonText}>SELL</Text>
                              <Text style={styles.sellButtonValue}>~{formatCurrency(estimatedValue)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.closeButton}
                              onPress={() => closeLocation(l.id)}
                            >
                              <Text style={styles.closeButtonText}>CLOSE</Text>
                              <Text style={styles.closeButtonValue}>-{formatCurrency(closingCost)}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <Text style={styles.exitWarning}>You only have one location. Can't exit your last restaurant!</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 4: Tutorial Overlay */}
        {showTutorial && !game?.tutorialComplete && game && (
          <View style={styles.tutorialOverlay}>
            <View style={styles.tutorialCard}>
              <Text style={styles.tutorialTitle}>{TUTORIAL_STEPS[tutorialStep]?.title}</Text>
              <Text style={styles.tutorialMessage}>{TUTORIAL_STEPS[tutorialStep]?.message}</Text>
              <View style={styles.tutorialProgress}>
                {TUTORIAL_STEPS.map((_, i) => (
                  <View key={i} style={[styles.tutorialDot, i <= tutorialStep && styles.tutorialDotActive]} />
                ))}
              </View>
              <View style={styles.tutorialActions}>
                <TouchableOpacity style={styles.tutorialSkip} onPress={skipTutorial}>
                  <Text style={styles.tutorialSkipText}>Skip Tutorial</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tutorialNext} onPress={advanceTutorial}>
                  <Text style={styles.tutorialNextText}>
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Start Playing' : 'Next →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}



        {/* Phase 5: Settings Modal */}
        <Modal visible={settingsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⚙️ Settings</Text>
                <TouchableOpacity onPress={() => setSettingsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.settingsSection}>🎨 Theme</Text>
                <View style={styles.themeGrid}>
                  {Object.values(THEMES).map(theme => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[styles.themeOption, currentTheme === theme.id && styles.themeSelected]}
                      onPress={() => changeTheme(theme.id)}
                    >
                      <Text style={styles.themeIcon}>{theme.icon}</Text>
                      <Text style={[styles.themeName, currentTheme === theme.id && styles.themeNameSelected]}>{theme.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.settingsSection}>⏩ Game Speed</Text>
                <View style={styles.speedGrid}>
                  {SPEED_OPTIONS.map(speed => (
                    <TouchableOpacity
                      key={speed.id}
                      style={[styles.speedOption, gameSpeed === speed.id && styles.speedSelected]}
                      onPress={() => setGameSpeed(speed.id)}
                    >
                      <Text style={styles.speedIcon}>{speed.icon}</Text>
                      <Text style={styles.speedName}>{speed.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.settingsSection}>🎮 Preferences</Text>
                <TouchableOpacity 
                  style={styles.toggleRow}
                  onPress={() => setSoundEnabled(!soundEnabled)}
                >
                  <Text style={styles.toggleLabel}>🔊 Sound Effects</Text>
                  <View style={[styles.toggle, soundEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleKnob, soundEnabled && styles.toggleKnobActive]} />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toggleRow}
                  onPress={() => setAutoSaveEnabled(!autoSaveEnabled)}
                >
                  <Text style={styles.toggleLabel}>💾 Auto-Save (every 4 weeks)</Text>
                  <View style={[styles.toggle, autoSaveEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleKnob, autoSaveEnabled && styles.toggleKnobActive]} />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toggleRow}
                  onPress={() => setShowTips(!showTips)}
                >
                  <Text style={styles.toggleLabel}>💡 Show Gameplay Tips</Text>
                  <View style={[styles.toggle, showTips && styles.toggleActive]}>
                    <View style={[styles.toggleKnob, showTips && styles.toggleKnobActive]} />
                  </View>
                </TouchableOpacity>
                
                <Text style={styles.settingsSection}>📊 Stats</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Prestige Level</Text>
                  <Text style={styles.statsValue}>{'⭐'.repeat(prestigeLevel) || 'None'}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Total Runs</Text>
                  <Text style={styles.statsValue}>{hallOfFame.length}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Themes Unlocked</Text>
                  <Text style={styles.statsValue}>{themesUsed.length}/5</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.hofButton}
                  onPress={() => { setSettingsModal(false); setHallOfFameModal(true); }}
                >
                  <Text style={styles.hofButtonText}>🏆 View Hall of Fame</Text>
                </TouchableOpacity>
                
                <Text style={styles.versionText}>86'd v9.0.0 - Phase 6</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 5: Hall of Fame Modal */}
        <Modal visible={hallOfFameModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏆 Hall of Fame</Text>
                <TouchableOpacity onPress={() => setHallOfFameModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {HALL_OF_FAME_CATEGORIES.map(category => {
                  const best = getBestRecord(category.id);
                  return (
                    <View key={category.id} style={styles.hofCategory}>
                      <View style={styles.hofCategoryHeader}>
                        <Text style={styles.hofCategoryIcon}>{category.icon}</Text>
                        <Text style={styles.hofCategoryName}>{category.name}</Text>
                      </View>
                      {best ? (
                        <View style={styles.hofRecord}>
                          <Text style={styles.hofRecordValue}>{category.format(best[category.stat] || 0)}</Text>
                          <Text style={styles.hofRecordDetails}>
                            {best.restaurantName || 'Unknown'} • {best.difficulty || 'Normal'} • Week {best.weeksSurvived}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.hofNoRecord}>No records yet - start playing!</Text>
                      )}
                    </View>
                  );
                })}
                
                <Text style={styles.settingsSection}>📜 Recent Runs ({hallOfFame.length})</Text>
                {hallOfFame.slice(-5).reverse().map((run, i) => (
                  <View key={run.id || i} style={styles.recentRun}>
                    <Text style={styles.recentRunName}>{run.restaurantName || 'Unknown'}</Text>
                    <Text style={styles.recentRunDetails}>
                      {run.weeksSurvived} weeks • {formatCurrency(run.peakValuation || 0)} peak • {run.difficulty || 'normal'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 5: Difficulty Selection Modal */}
        <Modal visible={difficultyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎮 Select Difficulty</Text>
                <TouchableOpacity onPress={() => setDifficultyModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {DIFFICULTY_MODES.map(mode => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.difficultyOption, setup.difficulty === mode.id && styles.difficultySelected]}
                    onPress={() => {
                      setSetup(s => ({ ...s, difficulty: mode.id }));
                      setDifficulty(mode.id);
                      setDifficultyModal(false);
                    }}
                  >
                    <View style={styles.difficultyHeader}>
                      <Text style={styles.difficultyIcon}>{mode.icon}</Text>
                      <View style={styles.difficultyInfo}>
                        <Text style={styles.difficultyName}>{mode.name}</Text>
                        <Text style={styles.difficultyDesc}>{mode.description}</Text>
                      </View>
                    </View>
                    <View style={styles.difficultyMods}>
                      <Text style={styles.difficultyMod}>Revenue: {mode.revenueMultiplier > 1 ? '+' : ''}{((mode.revenueMultiplier - 1) * 100).toFixed(0)}%</Text>
                      <Text style={styles.difficultyMod}>Costs: {mode.costMultiplier > 1 ? '+' : ''}{((mode.costMultiplier - 1) * 100).toFixed(0)}%</Text>
                      <Text style={styles.difficultyMod}>Crises: {(mode.negativeScenarioChance * 100).toFixed(0)}%</Text>
                      {mode.startingBonus !== 0 && (
                        <Text style={[styles.difficultyMod, mode.startingBonus > 0 ? styles.difficultyBonus : styles.difficultyPenalty]}>
                          Capital: {mode.startingBonus > 0 ? '+' : ''}{formatCurrency(mode.startingBonus)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ============================================ */}
        {/* PHASE 6: INVESTOR MODAL */}
        {/* ============================================ */}
        <Modal visible={investorModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏦 Investor Relations</Text>
                <TouchableOpacity onPress={() => setInvestorModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.investorSummary}>
                  <Text style={styles.sectionSubtitle}>Ownership Structure</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Your Equity:</Text>
                    <Text style={styles.statValue}>{game?.equity || 100}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Investors:</Text>
                    <Text style={styles.statValue}>{game?.investors?.length || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Board Members:</Text>
                    <Text style={styles.statValue}>{game?.boardMembers || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Current Valuation:</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(game?.empireValuation || 0)}</Text>
                  </View>
                </View>
                
                {game?.investors?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>Current Investors</Text>
                    {game.investors.map((inv, idx) => (
                      <View key={idx} style={styles.investorCard}>
                        <Text style={styles.investorIcon}>{INVESTOR_TYPES.find(t => t.id === inv.type)?.icon || '👤'}</Text>
                        <View style={styles.investorInfo}>
                          <Text style={styles.investorName}>{inv.name}</Text>
                          <Text style={styles.investorDetails}>{inv.equity}% equity • {inv.boardSeat ? 'Board seat' : 'No board seat'}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <Text style={styles.sectionSubtitle}>Available Investors</Text>
                {INVESTOR_TYPES.filter(inv => 
                  (game?.empireValuation || 0) >= inv.minValuation && 
                  (game?.empireValuation || 0) <= inv.maxValuation
                ).map(inv => (
                  <TouchableOpacity
                    key={inv.id}
                    style={styles.investorOption}
                    onPress={() => {
                      const investAmount = Math.floor((inv.investment[0] + inv.investment[1]) / 2);
                      const equityAsk = Math.floor((inv.equityRange[0] + inv.equityRange[1]) / 2);
                      if ((game?.equity || 100) >= equityAsk) {
                        setGame(g => ({
                          ...g,
                          corporateCash: (g.corporateCash || 0) + investAmount,
                          equity: g.equity - equityAsk,
                          investors: [...(g.investors || []), { 
                            type: inv.id, 
                            name: inv.name, 
                            equity: equityAsk, 
                            invested: investAmount,
                            boardSeat: inv.boardSeat,
                            joinedWeek: g.week 
                          }],
                          boardMembers: (g.boardMembers || 0) + (inv.boardSeat ? 1 : 0),
                        }));
                        addNotification(`${inv.icon} ${inv.name} invested ${formatCurrency(investAmount)} for ${equityAsk}% equity!`, 'success');
                        setInvestorModal(false);
                      }
                    }}
                  >
                    <Text style={styles.investorOptionIcon}>{inv.icon}</Text>
                    <View style={styles.investorOptionInfo}>
                      <Text style={styles.investorOptionName}>{inv.name}</Text>
                      <Text style={styles.investorOptionTerms}>{inv.terms}</Text>
                      <View style={styles.investorOptionStats}>
                        <Text style={styles.investorStat}>💰 {formatCurrency(inv.investment[0])}-{formatCurrency(inv.investment[1])}</Text>
                        <Text style={styles.investorStat}>📊 {inv.equityRange[0]}-{inv.equityRange[1]}% equity</Text>
                        {inv.boardSeat && <Text style={styles.investorStat}>🪑 Board seat</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {INVESTOR_TYPES.filter(inv => 
                  (game?.empireValuation || 0) >= inv.minValuation && 
                  (game?.empireValuation || 0) <= inv.maxValuation
                ).length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No investors interested at current valuation</Text>
                    <Text style={styles.emptyStateHint}>Build to ${formatCurrency(250000)} valuation to attract angels</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: CATERING MODAL */}
        <Modal visible={cateringModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🍽️ Catering & Events</Text>
                <TouchableOpacity onPress={() => setCateringModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.cateringSummary}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Catering Revenue:</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(game?.cateringRevenue || 0)}/week</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Active Contracts:</Text>
                    <Text style={styles.statValue}>{game?.cateringContracts?.length || 0}</Text>
                  </View>
                </View>
                
                {!game?.cateringEnabled && (
                  <TouchableOpacity
                    style={styles.enableButton}
                    onPress={() => {
                      if ((game?.corporateCash || 0) >= 10000) {
                        setGame(g => ({ ...g, cateringEnabled: true, corporateCash: g.corporateCash - 10000 }));
                        addNotification('🍽️ Catering division launched! $10K invested.', 'success');
                      }
                    }}
                  >
                    <Text style={styles.enableButtonText}>🚀 Launch Catering Division ($10K)</Text>
                  </TouchableOpacity>
                )}
                
                {game?.cateringEnabled && (
                  <>
                    <Text style={styles.sectionSubtitle}>Available Contracts</Text>
                    {CATERING_CONTRACTS.filter(c => !game?.cateringContracts?.find(cc => cc.id === c.id)).map(contract => (
                      <TouchableOpacity
                        key={contract.id}
                        style={styles.contractCard}
                        onPress={() => {
                          setGame(g => ({
                            ...g,
                            cateringContracts: [...(g.cateringContracts || []), { ...contract, startWeek: g.week, weeksRemaining: contract.term }],
                          }));
                          addNotification(`📋 Signed ${contract.name} contract! +${formatCurrency(contract.weeklyRevenue)}/week`, 'success');
                        }}
                      >
                        <Text style={styles.contractIcon}>{contract.icon}</Text>
                        <View style={styles.contractInfo}>
                          <Text style={styles.contractName}>{contract.name}</Text>
                          <Text style={styles.contractDetails}>{formatCurrency(contract.weeklyRevenue)}/week • {contract.term} weeks • {(contract.margin * 100).toFixed(0)}% margin</Text>
                          <Text style={styles.contractRequirement}>⚠️ {contract.requirement}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    
                    <Text style={styles.sectionSubtitle}>Catering Services</Text>
                    {CATERING_TYPES.map(service => (
                      <View key={service.id} style={styles.serviceCard}>
                        <Text style={styles.serviceIcon}>{service.icon}</Text>
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.serviceDetails}>Avg Order: {formatCurrency(service.avgOrder)} • {(service.margin * 100).toFixed(0)}% margin</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: FOOD TRUCK MODAL */}
        <Modal visible={foodTruckModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚚 Food Truck Fleet</Text>
                <TouchableOpacity onPress={() => setFoodTruckModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.truckSummary}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Fleet Size:</Text>
                    <Text style={styles.statValue}>{game?.foodTrucks?.length || 0} trucks</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Weekly Revenue:</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(game?.truckRevenue || 0)}</Text>
                  </View>
                </View>
                
                {game?.foodTrucks?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>Your Fleet</Text>
                    {game.foodTrucks.map((truck, idx) => (
                      <View key={idx} style={styles.truckCard}>
                        <Text style={styles.truckIcon}>{FOOD_TRUCKS.find(t => t.id === truck.type)?.icon || '🚚'}</Text>
                        <View style={styles.truckInfo}>
                          <Text style={styles.truckName}>{truck.name}</Text>
                          <Text style={styles.truckDetails}>Weekly Revenue: {formatCurrency(truck.weeklyRevenue || 0)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <Text style={styles.sectionSubtitle}>Purchase Truck</Text>
                {FOOD_TRUCKS.map(truck => (
                  <TouchableOpacity
                    key={truck.id}
                    style={styles.truckOption}
                    onPress={() => {
                      if ((game?.corporateCash || 0) >= truck.cost) {
                        setGame(g => ({
                          ...g,
                          corporateCash: g.corporateCash - truck.cost,
                          foodTrucks: [...(g.foodTrucks || []), { 
                            type: truck.id, 
                            name: `${setup.name} Truck #${(g.foodTrucks?.length || 0) + 1}`,
                            weeklyRevenue: 0,
                            events: [],
                          }],
                        }));
                        addNotification(`🚚 Purchased ${truck.name} for ${formatCurrency(truck.cost)}!`, 'success');
                      } else {
                        addNotification(`Need ${formatCurrency(truck.cost)} to purchase`, 'warning');
                      }
                    }}
                  >
                    <Text style={styles.truckOptionIcon}>{truck.icon}</Text>
                    <View style={styles.truckOptionInfo}>
                      <Text style={styles.truckOptionName}>{truck.name}</Text>
                      <Text style={styles.truckOptionDetails}>
                        Cost: {formatCurrency(truck.cost)} • Capacity: {truck.capacity}/day • Maintenance: {formatCurrency(truck.maintenance)}/week
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {game?.foodTrucks?.length > 0 && (
                  <>
                    <Text style={styles.sectionSubtitle}>Book Events</Text>
                    {TRUCK_EVENTS.map(event => (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.eventOption}
                        onPress={() => {
                          addNotification(`🎪 Booked ${event.name}! Expected: ${formatCurrency(event.avgRevenue)}`, 'success');
                        }}
                      >
                        <Text style={styles.eventIcon}>{event.icon}</Text>
                        <View style={styles.eventInfo}>
                          <Text style={styles.eventName}>{event.name}</Text>
                          <Text style={styles.eventDetails}>Fee: {formatCurrency(event.fee)} • Avg Revenue: {formatCurrency(event.avgRevenue)}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: MEDIA MODAL */}
        <Modal visible={mediaModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📺 Media & Celebrity</Text>
                <TouchableOpacity onPress={() => setMediaModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.mediaSummary}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Public Profile:</Text>
                    <Text style={styles.statValue}>{game?.publicProfile || 0}/100</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Media Appearances:</Text>
                    <Text style={styles.statValue}>{game?.mediaAppearances?.length || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Brand Deals:</Text>
                    <Text style={styles.statValue}>{game?.brandDeals?.length || 0}</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionSubtitle}>Media Opportunities</Text>
                {MEDIA_OPPORTUNITIES.filter(m => !m.minReputation || (getActiveLocation()?.reputation || 0) >= m.minReputation).map(media => (
                  <TouchableOpacity
                    key={media.id}
                    style={styles.mediaOption}
                    onPress={() => {
                      setGame(g => ({
                        ...g,
                        publicProfile: Math.min(100, (g.publicProfile || 0) + media.reputationBoost),
                        mediaAppearances: [...(g.mediaAppearances || []), { ...media, week: g.week }],
                      }));
                      addNotification(`${media.icon} ${media.name}! +${media.reputationBoost} profile`, 'success');
                    }}
                  >
                    <Text style={styles.mediaIcon}>{media.icon}</Text>
                    <View style={styles.mediaInfo}>
                      <Text style={styles.mediaName}>{media.name}</Text>
                      <Text style={styles.mediaDetails}>+{media.reputationBoost} profile • +{(media.reachBoost * 100).toFixed(0)}% reach</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <Text style={styles.sectionSubtitle}>Brand Deals</Text>
                {BRAND_DEALS.filter(d => (getActiveLocation()?.reputation || 0) >= d.minReputation).map(deal => (
                  <TouchableOpacity
                    key={deal.id}
                    style={styles.dealOption}
                    onPress={() => {
                      setGame(g => ({
                        ...g,
                        corporateCash: g.corporateCash + (deal.advance || deal.fee || 0),
                        brandDeals: [...(g.brandDeals || []), { ...deal, signedWeek: g.week }],
                      }));
                      addNotification(`📝 Signed ${deal.name}! +${formatCurrency(deal.advance || deal.fee || 0)}`, 'success');
                      setMediaModal(false);
                    }}
                  >
                    <Text style={styles.dealIcon}>{deal.icon}</Text>
                    <View style={styles.dealInfo}>
                      <Text style={styles.dealName}>{deal.name}</Text>
                      <Text style={styles.dealDetails}>
                        {deal.advance ? `Advance: ${formatCurrency(deal.advance)}` : deal.fee ? `Fee: ${formatCurrency(deal.fee)}` : ''}
                        {deal.royalty ? ` • ${(deal.royalty * 100).toFixed(0)}% royalty` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: EXIT STRATEGY MODAL */}
        <Modal visible={exitStrategyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚪 Exit Strategies</Text>
                <TouchableOpacity onPress={() => setExitStrategyModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.exitSummary}>
                  <Text style={styles.sectionSubtitle}>Your Empire</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Valuation:</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(game?.empireValuation || 0)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Locations:</Text>
                    <Text style={styles.statValue}>{game?.locations?.length || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Your Equity:</Text>
                    <Text style={styles.statValue}>{game?.equity || 100}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Your Payout:</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency((game?.empireValuation || 0) * ((game?.equity || 100) / 100))}</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionSubtitle}>Exit Options</Text>
                {EXIT_OPTIONS.map(exit => {
                  const eligible = (game?.empireValuation || 0) >= exit.minValuation && 
                                   (game?.locations?.length || 0) >= exit.minLocations;
                  return (
                    <TouchableOpacity
                      key={exit.id}
                      style={[styles.exitOption, !eligible && styles.exitOptionLocked]}
                      disabled={!eligible}
                      onPress={() => {
                        if (exit.id === 'family_succession') {
                          // End game with family succession
                          addNotification('🏆 Congratulations! You passed your empire to the next generation!', 'achievement');
                          setGame(g => ({ ...g, exitStrategy: exit.id, exitProgress: 100 }));
                        } else {
                          setGame(g => ({ 
                            ...g, 
                            exitStrategy: exit.id, 
                            exitProgress: 0,
                            corporateCash: g.corporateCash - exit.cost 
                          }));
                          addNotification(`📋 Started ${exit.name} process. ${exit.preparationTime} weeks to completion.`, 'info');
                        }
                        setExitStrategyModal(false);
                      }}
                    >
                      <Text style={styles.exitIcon}>{exit.icon}</Text>
                      <View style={styles.exitInfo}>
                        <Text style={styles.exitName}>{exit.name}</Text>
                        <Text style={styles.exitDesc}>{exit.description}</Text>
                        <View style={styles.exitRequirements}>
                          <Text style={[styles.exitReq, (game?.empireValuation || 0) >= exit.minValuation ? styles.exitReqMet : styles.exitReqUnmet]}>
                            💰 {formatCurrency(exit.minValuation)}+ valuation
                          </Text>
                          <Text style={[styles.exitReq, (game?.locations?.length || 0) >= exit.minLocations ? styles.exitReqMet : styles.exitReqUnmet]}>
                            🏪 {exit.minLocations}+ locations
                          </Text>
                          <Text style={styles.exitReq}>⏱️ {exit.preparationTime} weeks</Text>
                          <Text style={styles.exitReq}>💵 {formatCurrency(exit.cost)} cost</Text>
                          <Text style={[styles.exitReq, { color: colors.success }]}>
                            📈 {exit.valuationMultiple}x valuation multiple
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: ECONOMY MODAL */}
        <Modal visible={economyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📊 Economic Conditions</Text>
                <TouchableOpacity onPress={() => setEconomyModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {ECONOMIC_CONDITIONS.map(condition => {
                  const isActive = currentEconomy === condition.id;
                  return (
                    <View key={condition.id} style={[styles.economyCard, isActive && styles.economyCardActive]}>
                      <View style={styles.economyHeader}>
                        <Text style={styles.economyIcon}>{condition.icon}</Text>
                        <View style={styles.economyInfo}>
                          <Text style={styles.economyName}>{condition.name}</Text>
                          {isActive && <Text style={styles.economyActive}>CURRENT</Text>}
                        </View>
                      </View>
                      <Text style={styles.economyDesc}>{condition.description}</Text>
                      <View style={styles.economyEffects}>
                        <Text style={[styles.economyEffect, condition.revenueMultiplier > 1 ? styles.positive : condition.revenueMultiplier < 1 ? styles.negative : null]}>
                          Revenue: {condition.revenueMultiplier > 1 ? '+' : ''}{((condition.revenueMultiplier - 1) * 100).toFixed(0)}%
                        </Text>
                        <Text style={[styles.economyEffect, condition.costMultiplier < 1 ? styles.positive : condition.costMultiplier > 1 ? styles.negative : null]}>
                          Costs: {condition.costMultiplier > 1 ? '+' : ''}{((condition.costMultiplier - 1) * 100).toFixed(0)}%
                        </Text>
                        <Text style={[styles.economyEffect, condition.tipMultiplier > 1 ? styles.positive : condition.tipMultiplier < 1 ? styles.negative : null]}>
                          Tips: {condition.tipMultiplier > 1 ? '+' : ''}{((condition.tipMultiplier - 1) * 100).toFixed(0)}%
                        </Text>
                        <Text style={styles.economyEffect}>Labor Market: {condition.laborMarket}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 6: REAL ESTATE MODAL */}
        <Modal visible={realEstateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏢 Real Estate</Text>
                <TouchableOpacity onPress={() => setRealEstateModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Properties */}
                <Text style={styles.sectionSubtitle}>Your Properties</Text>
                {(game?.ownedProperties?.length || 0) === 0 ? (
                  <Text style={styles.emptyStateText}>You don't own any properties yet. Properties appreciate over time and build equity.</Text>
                ) : (
                  game.ownedProperties.map((prop, idx) => (
                    <View key={idx} style={styles.propertyCard}>
                      <View style={styles.propertyHeader}>
                        <Text style={styles.propertyIcon}>🏢</Text>
                        <View style={styles.propertyInfo}>
                          <Text style={styles.propertyName}>{prop.name}</Text>
                          <Text style={styles.propertyLocation}>{prop.location}</Text>
                        </View>
                      </View>
                      <View style={styles.propertyStats}>
                        <View style={styles.propertyStat}>
                          <Text style={styles.propertyStatLabel}>Current Value</Text>
                          <Text style={[styles.propertyStatValue, { color: colors.success }]}>{formatCurrency(prop.value)}</Text>
                        </View>
                        <View style={styles.propertyStat}>
                          <Text style={styles.propertyStatLabel}>Purchase Price</Text>
                          <Text style={styles.propertyStatValue}>{formatCurrency(prop.purchasePrice)}</Text>
                        </View>
                        <View style={styles.propertyStat}>
                          <Text style={styles.propertyStatLabel}>Equity Built</Text>
                          <Text style={[styles.propertyStatValue, { color: colors.primary }]}>{formatCurrency(prop.value - (prop.mortgageRemaining || 0))}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
                
                {/* Lease Options */}
                <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Lease Options</Text>
                <Text style={styles.helperText}>Choose how you structure your property agreements</Text>
                
                {REAL_ESTATE_OPTIONS.filter(opt => opt.id !== 'own_property' && opt.id !== 'sale_leaseback').map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.leaseOption}
                    onPress={() => {
                      addNotification(`📋 Switched to ${option.name} for new locations`, 'info');
                      setGame(g => ({ ...g, preferredLeaseType: option.id }));
                    }}
                  >
                    <View style={styles.leaseHeader}>
                      <Text style={styles.leaseIcon}>{option.icon}</Text>
                      <View style={styles.leaseInfo}>
                        <Text style={styles.leaseName}>{option.name}</Text>
                        <Text style={styles.leaseDesc}>{option.description}</Text>
                      </View>
                      {game?.preferredLeaseType === option.id && (
                        <Text style={styles.leaseActive}>✓</Text>
                      )}
                    </View>
                    <View style={styles.leaseDetails}>
                      <Text style={styles.leaseDetail}>Rent Modifier: {option.baseRentMod > 1 ? '+' : ''}{((option.baseRentMod - 1) * 100).toFixed(0)}%</Text>
                      {option.additionalCosts > 0 && <Text style={styles.leaseDetail}>+ Additional Costs: {(option.additionalCosts * 100).toFixed(0)}%</Text>}
                      {option.salesPercentage && <Text style={styles.leaseDetail}>+ {(option.salesPercentage * 100).toFixed(0)}% of Sales</Text>}
                      <Text style={styles.leaseDetail}>Term: {option.termYears} years</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Buy Property Option */}
                <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Purchase Property</Text>
                {(game?.locations?.length || 0) > 0 && (
                  <View style={styles.buyPropertyCard}>
                    <Text style={styles.buyPropertyTitle}>Buy Your Current Location</Text>
                    <Text style={styles.buyPropertyDesc}>Stop paying rent - build equity instead!</Text>
                    {(() => {
                      const loc = game?.locations?.[selectedLocation || 0];
                      const propertyValue = (loc?.rent || 3000) * 12 * 10; // 10x annual rent
                      const downPayment = propertyValue * 0.25;
                      const mortgageAmount = propertyValue * 0.75;
                      const monthlyMortgage = (mortgageAmount * 0.065) / 12 + mortgageAmount / 360; // 30 year mortgage
                      const weeklyMortgage = monthlyMortgage / 4;
                      const canAfford = (game?.corporateCash || 0) >= downPayment;
                      
                      return (
                        <>
                          <View style={styles.buyPropertyStats}>
                            <View style={styles.buyPropertyStat}>
                              <Text style={styles.buyPropertyLabel}>Property Value</Text>
                              <Text style={styles.buyPropertyValue}>{formatCurrency(propertyValue)}</Text>
                            </View>
                            <View style={styles.buyPropertyStat}>
                              <Text style={styles.buyPropertyLabel}>Down Payment (25%)</Text>
                              <Text style={[styles.buyPropertyValue, { color: canAfford ? colors.success : colors.accent }]}>{formatCurrency(downPayment)}</Text>
                            </View>
                            <View style={styles.buyPropertyStat}>
                              <Text style={styles.buyPropertyLabel}>Weekly Mortgage</Text>
                              <Text style={styles.buyPropertyValue}>{formatCurrency(weeklyMortgage)}</Text>
                            </View>
                            <View style={styles.buyPropertyStat}>
                              <Text style={styles.buyPropertyLabel}>vs Current Rent</Text>
                              <Text style={styles.buyPropertyValue}>{formatCurrency((loc?.rent || 3000) / 4)}/week</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[styles.buyPropertyButton, !canAfford && styles.buyPropertyButtonDisabled]}
                            disabled={!canAfford}
                            onPress={() => {
                              setGame(g => ({
                                ...g,
                                corporateCash: g.corporateCash - downPayment,
                                ownedProperties: [...(g.ownedProperties || []), {
                                  id: Date.now(),
                                  name: `${loc.name} Building`,
                                  location: loc.name,
                                  purchasePrice: propertyValue,
                                  value: propertyValue,
                                  mortgageRemaining: mortgageAmount,
                                  weeklyMortgage: weeklyMortgage,
                                  locationId: loc.id,
                                }],
                                mortgages: [...(g.mortgages || []), {
                                  id: Date.now(),
                                  propertyId: loc.id,
                                  originalAmount: mortgageAmount,
                                  remaining: mortgageAmount,
                                  weeklyPayment: weeklyMortgage,
                                  rate: 0.065,
                                }],
                                locations: g.locations.map(l => 
                                  l.id === loc.id ? { ...l, rent: 0, ownsProperty: true } : l
                                ),
                              }));
                              addNotification(`🏢 Purchased ${loc.name} property for ${formatCurrency(propertyValue)}!`, 'achievement');
                              setRealEstateModal(false);
                            }}
                          >
                            <Text style={styles.buyPropertyButtonText}>
                              {canAfford ? `Purchase for ${formatCurrency(downPayment)} Down` : `Need ${formatCurrency(downPayment - (game?.corporateCash || 0))} More`}
                            </Text>
                          </TouchableOpacity>
                        </>
                      );
                    })()}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: LABOR SCHEDULING MODAL */}
        <Modal visible={schedulingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📅 Labor Scheduling</Text>
                <TouchableOpacity onPress={() => setSchedulingModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Shift Coverage</Text>
                <Text style={styles.helperText}>Ensure adequate staffing for each shift to maximize efficiency</Text>
                
                {SHIFT_TYPES.map(shift => {
                  const loc = game?.locations?.[selectedLocation || 0];
                  const staffCount = loc?.staff?.length || 0;
                  const coverage = Math.min(1, staffCount / (shift.coverageNeed * 4));
                  const coverageColor = coverage >= 1 ? colors.success : coverage >= 0.7 ? colors.warning : colors.accent;
                  
                  return (
                    <View key={shift.id} style={styles.shiftCard}>
                      <View style={styles.shiftHeader}>
                        <Text style={styles.shiftIcon}>{shift.icon}</Text>
                        <View style={styles.shiftInfo}>
                          <Text style={styles.shiftName}>{shift.name}</Text>
                          <Text style={styles.shiftHours}>{shift.hours}</Text>
                        </View>
                        <View style={styles.coverageBadge}>
                          <Text style={[styles.coverageText, { color: coverageColor }]}>
                            {(coverage * 100).toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.coverageBar}>
                        <View style={[styles.coverageFill, { width: `${coverage * 100}%`, backgroundColor: coverageColor }]} />
                      </View>
                      <Text style={styles.shiftDetail}>
                        Labor cost modifier: {shift.laborMod > 1 ? '+' : ''}{((shift.laborMod - 1) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
                
                <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Overtime Summary</Text>
                <View style={styles.overtimeCard}>
                  <View style={styles.overtimeStat}>
                    <Text style={styles.overtimeLabel}>Regular Hours</Text>
                    <Text style={styles.overtimeValue}>{OVERTIME_RULES.regularHours}/week</Text>
                  </View>
                  <View style={styles.overtimeStat}>
                    <Text style={styles.overtimeLabel}>Overtime Rate</Text>
                    <Text style={[styles.overtimeValue, { color: colors.warning }]}>{OVERTIME_RULES.overtimeMultiplier}x pay</Text>
                  </View>
                  <View style={styles.overtimeStat}>
                    <Text style={styles.overtimeLabel}>Double Time After</Text>
                    <Text style={[styles.overtimeValue, { color: colors.accent }]}>{OVERTIME_RULES.doubleTimeThreshold} hrs</Text>
                  </View>
                  <View style={styles.overtimeStat}>
                    <Text style={styles.overtimeLabel}>This Week Overtime</Text>
                    <Text style={styles.overtimeValue}>{game?.overtimeHours || 0} hrs</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: INVENTORY MODAL */}
        <Modal visible={inventoryModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📦 Inventory & Spoilage</Text>
                <TouchableOpacity onPress={() => setInventoryModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Inventory Categories</Text>
                {INVENTORY_CATEGORIES.map(cat => (
                  <View key={cat.id} style={styles.inventoryCategory}>
                    <Text style={styles.inventoryIcon}>{cat.icon}</Text>
                    <View style={styles.inventoryInfo}>
                      <Text style={styles.inventoryName}>{cat.name}</Text>
                      <Text style={styles.inventoryDetail}>Spoils in {cat.spoilDays} days • {(cat.costPct * 100).toFixed(0)}% of food cost</Text>
                    </View>
                    <Text style={[styles.wasteRisk, { color: cat.wasteRisk > 0.15 ? colors.accent : cat.wasteRisk > 0.08 ? colors.warning : colors.success }]}>
                      {(cat.wasteRisk * 100).toFixed(0)}% waste
                    </Text>
                  </View>
                ))}
                
                <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Ordering Strategy</Text>
                {INVENTORY_STRATEGIES.map(strategy => (
                  <TouchableOpacity
                    key={strategy.id}
                    style={[styles.strategyCard, game?.inventoryStrategy === strategy.id && styles.strategyCardActive]}
                    onPress={() => {
                      setGame(g => ({ ...g, inventoryStrategy: strategy.id }));
                      addNotification(`📦 Switched to ${strategy.name} ordering strategy`, 'info');
                    }}
                  >
                    <View style={styles.strategyHeader}>
                      <Text style={styles.strategyIcon}>{strategy.icon}</Text>
                      <Text style={styles.strategyName}>{strategy.name}</Text>
                      {game?.inventoryStrategy === strategy.id && <Text style={styles.strategyActive}>✓</Text>}
                    </View>
                    <Text style={styles.strategyDesc}>{strategy.description}</Text>
                    <View style={styles.strategyEffects}>
                      <Text style={[styles.strategyEffect, strategy.wasteMod < 1 ? styles.positive : strategy.wasteMod > 1 ? styles.negative : null]}>
                        Waste: {strategy.wasteMod < 1 ? '' : '+'}{((strategy.wasteMod - 1) * 100).toFixed(0)}%
                      </Text>
                      <Text style={[styles.strategyEffect, strategy.costMod < 1 ? styles.positive : strategy.costMod > 1 ? styles.negative : null]}>
                        Cost: {strategy.costMod < 1 ? '' : '+'}{((strategy.costMod - 1) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <View style={styles.spoilageSummary}>
                  <Text style={styles.sectionSubtitle}>Spoilage Summary</Text>
                  <View style={styles.spoilageStat}>
                    <Text style={styles.spoilageLabel}>Current Spoilage Rate</Text>
                    <Text style={[styles.spoilageValue, { color: (game?.spoilageRate || 0.08) < 0.05 ? colors.success : (game?.spoilageRate || 0.08) > 0.10 ? colors.accent : colors.warning }]}>
                      {((game?.spoilageRate || 0.08) * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.spoilageStat}>
                    <Text style={styles.spoilageLabel}>Total Spoilage Cost (Lifetime)</Text>
                    <Text style={[styles.spoilageValue, { color: colors.accent }]}>{formatCurrency(game?.spoilageCost || 0)}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: LOYALTY PROGRAM MODAL */}
        <Modal visible={loyaltyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👑 Loyalty Program</Text>
                <TouchableOpacity onPress={() => setLoyaltyModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.loyaltySummary}>
                  <View style={styles.loyaltyStat}>
                    <Text style={styles.loyaltyStatValue}>{game?.totalLoyaltyMembers || 0}</Text>
                    <Text style={styles.loyaltyStatLabel}>Total Members</Text>
                  </View>
                  <View style={styles.loyaltyStat}>
                    <Text style={styles.loyaltyStatValue}>{game?.loyaltyRedemptions || 0}</Text>
                    <Text style={styles.loyaltyStatLabel}>Redemptions</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionSubtitle}>Choose Program Type</Text>
                {LOYALTY_PROGRAM_TYPES.map(program => {
                  const isActive = game?.loyaltyProgram === program.id;
                  const canAfford = (game?.corporateCash || 0) >= program.cost;
                  
                  return (
                    <TouchableOpacity
                      key={program.id}
                      style={[styles.loyaltyProgramCard, isActive && styles.loyaltyProgramActive]}
                      onPress={() => {
                        if (isActive || program.id === 'none') {
                          setGame(g => ({ ...g, loyaltyProgram: program.id }));
                          if (program.id === 'none') addNotification('❌ Loyalty program disabled', 'info');
                        } else if (canAfford) {
                          setGame(g => ({ 
                            ...g, 
                            loyaltyProgram: program.id,
                            corporateCash: g.corporateCash - program.cost 
                          }));
                          addNotification(`👑 Launched ${program.name}! -${formatCurrency(program.cost)}`, 'success');
                        } else {
                          addNotification(`Need ${formatCurrency(program.cost - (game?.corporateCash || 0))} more`, 'warning');
                        }
                      }}
                    >
                      <View style={styles.loyaltyProgramHeader}>
                        <Text style={styles.loyaltyProgramIcon}>{program.icon}</Text>
                        <View style={styles.loyaltyProgramInfo}>
                          <Text style={styles.loyaltyProgramName}>{program.name}</Text>
                          {program.cost > 0 && <Text style={styles.loyaltyProgramCost}>{formatCurrency(program.cost)} setup</Text>}
                        </View>
                        {isActive && <Text style={styles.loyaltyProgramBadge}>ACTIVE</Text>}
                      </View>
                      <Text style={styles.loyaltyProgramDesc}>{program.description}</Text>
                      {program.retention > 1 && (
                        <Text style={[styles.loyaltyProgramEffect, { color: colors.success }]}>
                          +{((program.retention - 1) * 100).toFixed(0)}% customer retention
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                
                <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Tier Levels</Text>
                {LOYALTY_TIERS.map(tier => (
                  <View key={tier.id} style={[styles.tierCard, { borderLeftColor: tier.color }]}>
                    <Text style={styles.tierIcon}>{tier.icon}</Text>
                    <View style={styles.tierInfo}>
                      <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                      <Text style={styles.tierPoints}>{tier.pointsRequired} points required</Text>
                      <Text style={styles.tierPerks}>{tier.perks.join(' • ')}</Text>
                    </View>
                    {tier.discount > 0 && (
                      <Text style={[styles.tierDiscount, { color: colors.success }]}>{(tier.discount * 100)}% off</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: GOOGLE REVIEWS MODAL */}
        <Modal visible={reviewsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⭐ Google Reviews</Text>
                <TouchableOpacity onPress={() => setReviewsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.googleRatingSummary}>
                  <View style={styles.googleRatingMain}>
                    <Text style={styles.googleRatingNumber}>{(game?.googleRating || 4.3).toFixed(1)}</Text>
                    <View style={styles.googleStars}>
                      {[1,2,3,4,5].map(star => (
                        <Text key={star} style={styles.googleStar}>
                          {star <= Math.round(game?.googleRating || 4.3) ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.googleReviewCount}>{game?.totalReviews || 0} reviews</Text>
                  </View>
                  <View style={styles.googleRatingStats}>
                    <Text style={styles.googleRatingStat}>Response Rate: {((game?.reviewResponseRate || 0) * 100).toFixed(0)}%</Text>
                    <Text style={styles.googleRatingStat}>Responded: {game?.reviewsResponded || 0}</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionSubtitle}>Recent Reviews</Text>
                {(game?.recentReviews || []).length === 0 ? (
                  <Text style={styles.emptyStateText}>No reviews yet. Keep serving great food!</Text>
                ) : (
                  (game?.recentReviews || []).slice(0, 10).map(review => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewerName}>{review.customerName}</Text>
                        <View style={styles.reviewStars}>
                          {[1,2,3,4,5].map(star => (
                            <Text key={star} style={[styles.reviewStar, { opacity: star <= review.stars ? 1 : 0.3 }]}>⭐</Text>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewText}>"{review.text}"</Text>
                      <View style={styles.reviewActions}>
                        <Text style={styles.reviewWeek}>Week {review.week}</Text>
                        {!review.responded ? (
                          <TouchableOpacity
                            style={styles.respondButton}
                            onPress={() => {
                              setGame(g => ({
                                ...g,
                                recentReviews: g.recentReviews.map(r => 
                                  r.id === review.id ? { ...r, responded: true } : r
                                ),
                                reviewsResponded: (g.reviewsResponded || 0) + 1,
                                reviewResponseRate: ((g.reviewsResponded || 0) + 1) / (g.totalReviews || 1),
                              }));
                              addNotification('💬 Response sent! +0.1 reputation', 'success');
                              if (game?.locations?.[0]) {
                                setGame(g => ({
                                  ...g,
                                  locations: g.locations.map((loc, idx) => 
                                    idx === 0 ? { ...loc, reputation: Math.min(100, loc.reputation + 0.1) } : loc
                                  ),
                                }));
                              }
                            }}
                          >
                            <Text style={styles.respondButtonText}>Respond</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.respondedBadge}>✓ Responded</Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
                
                <View style={styles.reviewTips}>
                  <Text style={styles.sectionSubtitle}>Review Tips</Text>
                  <Text style={styles.reviewTip}>• Respond to ALL reviews, positive and negative</Text>
                  <Text style={styles.reviewTip}>• Personalized responses boost reputation more</Text>
                  <Text style={styles.reviewTip}>• A 4.5+ rating increases customer traffic by 15%</Text>
                  <Text style={styles.reviewTip}>• Below 3.5 stars hurts reputation significantly</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: LEADERBOARD MODAL */}
        <Modal visible={leaderboardModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏆 Leaderboards</Text>
                <TouchableOpacity onPress={() => setLeaderboardModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Your Rankings</Text>
                {LEADERBOARD_CATEGORIES.map(cat => {
                  const value = cat.stat === 'locationsCount' ? (game?.locations?.length || 0) :
                               cat.stat === 'totalStaff' ? (game?.locations?.reduce((sum, l) => sum + l.staff.length, 0) || 0) :
                               game?.[cat.stat] || 0;
                  const formattedValue = cat.format(value);
                  
                  return (
                    <View key={cat.id} style={styles.leaderboardCard}>
                      <Text style={styles.leaderboardIcon}>{cat.icon}</Text>
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>{cat.name}</Text>
                        <Text style={styles.leaderboardValue}>{formattedValue}</Text>
                      </View>
                      <View style={styles.leaderboardRank}>
                        <Text style={styles.leaderboardRankText}>#{Math.floor(Math.random() * 100) + 1}</Text>
                        <Text style={styles.leaderboardRankLabel}>Global</Text>
                      </View>
                    </View>
                  );
                })}
                
                <View style={styles.leaderboardNote}>
                  <Text style={styles.leaderboardNoteText}>
                    🌐 Leaderboards update weekly. Keep growing your empire to climb the ranks!
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PHASE 7: SHARE MODAL */}
        <Modal visible={shareModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📱 Share Your Success</Text>
                <TouchableOpacity onPress={() => setShareModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Share Templates</Text>
                
                <TouchableOpacity style={styles.shareCard} onPress={() => {
                  addNotification('📱 Shared to clipboard!', 'success');
                  setGame(g => ({ ...g, shareCount: (g.shareCount || 0) + 1 }));
                }}>
                  <Text style={styles.shareIcon}>🏛️</Text>
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareName}>Empire Status</Text>
                    <Text style={styles.sharePreview}>
                      "Built a {game?.locations?.length || 1}-location restaurant empire worth {formatCurrency(game?.empireValuation || 0)} in 86'd!"
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareCard} onPress={() => {
                  addNotification('📱 Shared to clipboard!', 'success');
                  setGame(g => ({ ...g, shareCount: (g.shareCount || 0) + 1 }));
                }}>
                  <Text style={styles.shareIcon}>⭐</Text>
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareName}>Google Rating</Text>
                    <Text style={styles.sharePreview}>
                      "My restaurant has a {(game?.googleRating || 4.3).toFixed(1)} star Google rating in 86'd! Customers love us!"
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareCard} onPress={() => {
                  addNotification('📱 Shared to clipboard!', 'success');
                  setGame(g => ({ ...g, shareCount: (g.shareCount || 0) + 1 }));
                }}>
                  <Text style={styles.shareIcon}>💰</Text>
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareName}>Weekly Profit</Text>
                    <Text style={styles.sharePreview}>
                      "Just made {formatCurrency(game?.locations?.[0]?.lastWeekProfit || 0)} profit this week in 86'd!"
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareCard} onPress={() => {
                  addNotification('📱 Shared to clipboard!', 'success');
                  setGame(g => ({ ...g, shareCount: (g.shareCount || 0) + 1 }));
                }}>
                  <Text style={styles.shareIcon}>📅</Text>
                  <View style={styles.shareInfo}>
                    <Text style={styles.shareName}>Survival Streak</Text>
                    <Text style={styles.sharePreview}>
                      "Survived {game?.week || 0} weeks in 86'd! The restaurant business is brutal!"
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.shareStats}>
                  <Text style={styles.shareStatsText}>Total Shares: {game?.shareCount || 0}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Phase 5: Notification Toast */}
        {notifications.length > 0 && (
          <View style={styles.notificationContainer}>
            {notifications.map(n => (
              <Animated.View 
                key={n.id} 
                style={[
                  styles.notification,
                  n.type === 'success' && styles.notificationSuccess,
                  n.type === 'warning' && styles.notificationWarning,
                  n.type === 'error' && styles.notificationError,
                  n.type === 'achievement' && styles.notificationAchievement,
                  n.type === 'milestone' && styles.notificationMilestone,
                ]}
              >
                <Text style={styles.notificationText}>{n.message}</Text>
              </Animated.View>
            ))}
          </View>
        )}


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

  // ============================================
  // PHASE 4 STYLES
  // ============================================
  
  // Vendor Modal
  vendorCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 8, marginBottom: 12 },
  vendorHeader: { flexDirection: 'row', alignItems: 'center' },
  vendorIcon: { fontSize: 28, marginRight: 12 },
  vendorInfo: { flex: 1 },
  vendorName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  vendorType: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  vendorStats: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  vendorRelationship: { color: colors.info, fontSize: 12, fontWeight: '600' },
  vendorDeal: { color: colors.success, fontSize: 10, marginTop: 2 },
  dealOptions: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  dealLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 8 },
  dealOption: { backgroundColor: colors.surface, padding: 10, borderRadius: 6, marginBottom: 6 },
  dealName: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  dealDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  addVendorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  addVendorBtn: { color: colors.primary, fontSize: 14, fontWeight: '600' },

  // Competition Modal
  competitionIntro: { color: colors.textSecondary, fontSize: 14, marginBottom: 16 },
  competitorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 14, borderRadius: 8, marginBottom: 10 },
  competitorIcon: { fontSize: 32, marginRight: 12 },
  competitorInfo: { flex: 1 },
  competitorName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  competitorType: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  competitorStats: { flexDirection: 'row', gap: 10, marginTop: 6 },
  competitorStat: { color: colors.textSecondary, fontSize: 11 },
  threatLevel: { alignItems: 'center' },
  threatLabel: { color: colors.textMuted, fontSize: 10 },
  threatValue: { fontSize: 18, fontWeight: '700' },
  noCompetitors: { color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 20 },

  // Events Calendar Modal
  calendarIntro: { color: colors.textSecondary, fontSize: 14, marginBottom: 12 },
  currentWeekLabel: { color: colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 16 },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 14, borderRadius: 8, marginBottom: 10 },
  eventIcon: { fontSize: 28, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  eventWeek: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  eventTip: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  eventBoost: { alignItems: 'center' },
  eventBoostValue: { fontSize: 18, fontWeight: '700' },
  eventBoostLabel: { color: colors.textMuted, fontSize: 10 },

  // Milestones Modal
  milestoneSummary: { backgroundColor: colors.surfaceLight, padding: 20, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  milestoneCount: { color: colors.primary, fontSize: 36, fontWeight: '700' },
  milestoneLabel: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  milestoneRewards: { color: colors.success, fontSize: 12, marginTop: 8 },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 8, marginBottom: 8, opacity: 0.6 },
  milestoneUnlocked: { backgroundColor: colors.surfaceLight, opacity: 1, borderLeftWidth: 3, borderLeftColor: colors.success },
  milestoneIcon: { fontSize: 24, marginRight: 12 },
  milestoneInfo: { flex: 1 },
  milestoneName: { color: colors.textMuted, fontSize: 14 },
  milestoneNameUnlocked: { color: colors.textPrimary, fontWeight: '600' },
  milestoneDesc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  milestoneReward: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  milestoneRewardUnlocked: { color: colors.success },

  // Exit Strategy Modal
  exitIntro: { color: colors.textSecondary, fontSize: 14, marginBottom: 16 },
  exitLocationCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 8, marginBottom: 12 },
  exitLocationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  exitLocationName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  exitLocationWeeks: { color: colors.textMuted, fontSize: 12 },
  exitLocationStats: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  exitStat: { color: colors.textSecondary, fontSize: 12 },
  exitActions: { flexDirection: 'row', gap: 10 },
  sellButton: { flex: 1, backgroundColor: colors.success, padding: 12, borderRadius: 6, alignItems: 'center' },
  sellButtonText: { color: colors.background, fontSize: 13, fontWeight: '700' },
  sellButtonValue: { color: colors.background, fontSize: 11, marginTop: 2 },
  closeButton: { flex: 1, backgroundColor: colors.accent, padding: 12, borderRadius: 6, alignItems: 'center' },
  closeButtonText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  closeButtonValue: { color: colors.textPrimary, fontSize: 11, marginTop: 2 },
  exitWarning: { color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 20 },

  // Tutorial Overlay
  tutorialOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  tutorialCard: { backgroundColor: colors.surface, padding: 25, borderRadius: 12, maxWidth: 360, width: '100%', borderWidth: 2, borderColor: colors.primary },
  tutorialTitle: { color: colors.primary, fontSize: 22, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  tutorialMessage: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: 20, textAlign: 'center' },
  tutorialProgress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  tutorialDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceLight },
  tutorialDotActive: { backgroundColor: colors.primary },
  tutorialActions: { flexDirection: 'row', justifyContent: 'space-between' },
  tutorialSkip: { padding: 12 },
  tutorialSkipText: { color: colors.textMuted, fontSize: 14 },
  tutorialNext: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 },
  tutorialNextText: { color: colors.background, fontSize: 14, fontWeight: '700' },


  // Phase 5: Settings Styles
  settingsSection: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeOption: { width: '48%', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  themeSelected: { borderColor: colors.primary, backgroundColor: colors.surface },
  themeIcon: { fontSize: 28, marginBottom: 6 },
  themeName: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  themeNameSelected: { color: colors.primary, fontWeight: '600' },
  speedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  speedOption: { flex: 1, minWidth: 60, backgroundColor: colors.surfaceLight, padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  speedSelected: { borderColor: colors.success, backgroundColor: colors.surface },
  speedIcon: { fontSize: 18 },
  speedName: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { color: colors.textPrimary, fontSize: 14 },
  toggle: { width: 50, height: 28, backgroundColor: colors.surfaceLight, borderRadius: 14, padding: 2 },
  toggleActive: { backgroundColor: colors.success },
  toggleKnob: { width: 24, height: 24, backgroundColor: colors.textMuted, borderRadius: 12 },
  toggleKnobActive: { backgroundColor: colors.textPrimary, marginLeft: 'auto' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  statsLabel: { color: colors.textSecondary, fontSize: 13 },
  statsValue: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  hofButton: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  hofButtonText: { color: colors.background, fontSize: 14, fontWeight: '700' },
  versionText: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20 },

  // Phase 5: Hall of Fame Styles
  hofCategory: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  hofCategoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  hofCategoryIcon: { fontSize: 24, marginRight: 10 },
  hofCategoryName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  hofRecord: { paddingLeft: 34 },
  hofRecordValue: { color: colors.primary, fontSize: 24, fontWeight: '700' },
  hofRecordDetails: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  hofNoRecord: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic', paddingLeft: 34 },
  recentRun: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  recentRunName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  recentRunDetails: { color: colors.textMuted, fontSize: 11, marginTop: 4 },

  // Phase 5: Difficulty Styles
  difficultyOption: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  difficultySelected: { borderColor: colors.primary, backgroundColor: colors.surface },
  difficultyHeader: { flexDirection: 'row', alignItems: 'center' },
  difficultyIcon: { fontSize: 32, marginRight: 12 },
  difficultyInfo: { flex: 1 },
  difficultyName: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  difficultyDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  difficultyMods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  difficultyMod: { color: colors.textSecondary, fontSize: 11, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  difficultyBonus: { color: colors.success, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  difficultyPenalty: { color: colors.accent, backgroundColor: 'rgba(220, 38, 38, 0.15)' },

  // Phase 5: Notification Styles
  notificationContainer: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 1000 },
  notification: { backgroundColor: colors.info, padding: 12, borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  notificationSuccess: { backgroundColor: colors.success },
  notificationWarning: { backgroundColor: colors.warning },
  notificationError: { backgroundColor: colors.accent },
  notificationAchievement: { backgroundColor: colors.purple },
  notificationMilestone: { backgroundColor: colors.primary },
  notificationText: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', textAlign: 'center' },

  // Phase 5: Speed Control Bar
  speedControlBar: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 10 },
  speedControlBtn: { width: 40, height: 32, backgroundColor: colors.surfaceLight, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  speedControlActive: { backgroundColor: colors.success },
  speedControlText: { fontSize: 14 },

  // Phase 5: Tips Banner
  tipBanner: { backgroundColor: colors.surfaceLight, padding: 12, marginHorizontal: 15, marginBottom: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.info },
  tipText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  // Phase 5: Settings Button (header)
  settingsBtn: { padding: 8 },
  settingsBtnText: { fontSize: 22 },

  // Phase 5: Prestige Badge
  prestigeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.purple, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
  prestigeBadgeText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },

  // ============================================
  // PHASE 6: ADVANCED BUSINESS STYLES
  // ============================================
  
  // Investor Modal Styles
  investorSummary: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 15 },
  investorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  investorIcon: { fontSize: 28, marginRight: 12 },
  investorInfo: { flex: 1 },
  investorName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  investorDetails: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  investorOption: { flexDirection: 'row', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 10 },
  investorOptionIcon: { fontSize: 32, marginRight: 12 },
  investorOptionInfo: { flex: 1 },
  investorOptionName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  investorOptionTerms: { color: colors.textSecondary, fontSize: 12, marginBottom: 8, lineHeight: 18 },
  investorOptionStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  investorStat: { color: colors.textMuted, fontSize: 11, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },

  // Catering Modal Styles
  cateringSummary: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 15 },
  enableButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  enableButtonText: { color: colors.background, fontSize: 14, fontWeight: '700' },
  contractCard: { flexDirection: 'row', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 10 },
  contractIcon: { fontSize: 28, marginRight: 12 },
  contractInfo: { flex: 1 },
  contractName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  contractDetails: { color: colors.success, fontSize: 12, marginTop: 4 },
  contractRequirement: { color: colors.warning, fontSize: 11, marginTop: 4 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  serviceIcon: { fontSize: 24, marginRight: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  serviceDetails: { color: colors.textSecondary, fontSize: 11 },

  // Food Truck Modal Styles
  truckSummary: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 15 },
  truckCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  truckIcon: { fontSize: 28, marginRight: 12 },
  truckInfo: { flex: 1 },
  truckName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  truckDetails: { color: colors.textSecondary, fontSize: 12 },
  truckOption: { flexDirection: 'row', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 10 },
  truckOptionIcon: { fontSize: 32, marginRight: 12 },
  truckOptionInfo: { flex: 1 },
  truckOptionName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  truckOptionDetails: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  eventOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  eventIcon: { fontSize: 24, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventName: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  eventDetails: { color: colors.textSecondary, fontSize: 11 },

  // Media Modal Styles
  mediaSummary: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 15 },
  mediaOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  mediaIcon: { fontSize: 24, marginRight: 12 },
  mediaInfo: { flex: 1 },
  mediaName: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  mediaDetails: { color: colors.success, fontSize: 11 },
  dealOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  dealIcon: { fontSize: 24, marginRight: 12 },
  dealInfo: { flex: 1 },
  dealName: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  dealDetails: { color: colors.textSecondary, fontSize: 11 },

  // Exit Strategy Modal Styles
  exitSummary: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 15 },
  exitOption: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12, flexDirection: 'row' },
  exitOptionLocked: { opacity: 0.5 },
  exitIcon: { fontSize: 32, marginRight: 12 },
  exitInfo: { flex: 1 },
  exitName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  exitDesc: { color: colors.textSecondary, fontSize: 12, marginBottom: 8 },
  exitRequirements: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exitReq: { color: colors.textMuted, fontSize: 10, backgroundColor: colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  exitReqMet: { color: colors.success },
  exitReqUnmet: { color: colors.accent },

  // Economy Modal Styles
  economyCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  economyCardActive: { borderWidth: 2, borderColor: colors.primary },
  economyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  economyIcon: { fontSize: 28, marginRight: 12 },
  economyInfo: { flex: 1 },
  economyName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  economyActive: { color: colors.primary, fontSize: 10, fontWeight: '700', backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  economyDesc: { color: colors.textSecondary, fontSize: 12, marginBottom: 10 },
  economyEffects: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  economyEffect: { color: colors.textMuted, fontSize: 11, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  positive: { color: colors.success },
  negative: { color: colors.accent },

  // Empty State
  emptyState: { alignItems: 'center', padding: 20 },
  emptyStateText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  emptyStateHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },

  // Real Estate Modal Styles
  propertyCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  propertyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  propertyIcon: { fontSize: 28, marginRight: 12 },
  propertyInfo: { flex: 1 },
  propertyName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  propertyLocation: { color: colors.textSecondary, fontSize: 12 },
  propertyStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  propertyStat: { minWidth: '45%' },
  propertyStatLabel: { color: colors.textMuted, fontSize: 10 },
  propertyStatValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  
  leaseOption: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  leaseHeader: { flexDirection: 'row', alignItems: 'center' },
  leaseIcon: { fontSize: 24, marginRight: 12 },
  leaseInfo: { flex: 1 },
  leaseName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  leaseDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  leaseActive: { color: colors.success, fontSize: 18, fontWeight: '700' },
  leaseDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  leaseDetail: { color: colors.textMuted, fontSize: 11, marginBottom: 3 },
  
  buyPropertyCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.primary },
  buyPropertyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  buyPropertyDesc: { color: colors.textSecondary, fontSize: 12, marginBottom: 15 },
  buyPropertyStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  buyPropertyStat: { minWidth: '45%' },
  buyPropertyLabel: { color: colors.textMuted, fontSize: 10 },
  buyPropertyValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  buyPropertyButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buyPropertyButtonDisabled: { backgroundColor: colors.surfaceLight, opacity: 0.6 },
  buyPropertyButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  helperText: { color: colors.textMuted, fontSize: 11, marginBottom: 12 },

  // Phase 7: Scheduling Styles
  shiftCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  shiftIcon: { fontSize: 24, marginRight: 12 },
  shiftInfo: { flex: 1 },
  shiftName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  shiftHours: { color: colors.textSecondary, fontSize: 11 },
  coverageBadge: { backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  coverageText: { fontSize: 14, fontWeight: '700' },
  coverageBar: { height: 6, backgroundColor: colors.surface, borderRadius: 3, marginBottom: 8 },
  coverageFill: { height: 6, borderRadius: 3 },
  shiftDetail: { color: colors.textMuted, fontSize: 10 },
  overtimeCard: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  overtimeStat: { minWidth: '40%' },
  overtimeLabel: { color: colors.textMuted, fontSize: 10 },
  overtimeValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },

  // Phase 7: Inventory Styles
  inventoryCategory: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8 },
  inventoryIcon: { fontSize: 24, marginRight: 12 },
  inventoryInfo: { flex: 1 },
  inventoryName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  inventoryDetail: { color: colors.textMuted, fontSize: 10 },
  wasteRisk: { fontSize: 12, fontWeight: '600' },
  strategyCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  strategyCardActive: { borderWidth: 2, borderColor: colors.primary },
  strategyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  strategyIcon: { fontSize: 20, marginRight: 10 },
  strategyName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  strategyActive: { color: colors.success, fontSize: 18, fontWeight: '700' },
  strategyDesc: { color: colors.textSecondary, fontSize: 11, marginBottom: 10 },
  strategyEffects: { flexDirection: 'row', gap: 15 },
  strategyEffect: { color: colors.textMuted, fontSize: 11, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  spoilageSummary: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginTop: 20 },
  spoilageStat: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  spoilageLabel: { color: colors.textSecondary, fontSize: 12 },
  spoilageValue: { fontSize: 14, fontWeight: '700' },

  // Phase 7: Loyalty Styles
  loyaltySummary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 20 },
  loyaltyStat: { alignItems: 'center' },
  loyaltyStatValue: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  loyaltyStatLabel: { color: colors.textMuted, fontSize: 11 },
  loyaltyProgramCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  loyaltyProgramActive: { borderWidth: 2, borderColor: colors.primary },
  loyaltyProgramHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  loyaltyProgramIcon: { fontSize: 24, marginRight: 12 },
  loyaltyProgramInfo: { flex: 1 },
  loyaltyProgramName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  loyaltyProgramCost: { color: colors.textMuted, fontSize: 11 },
  loyaltyProgramBadge: { backgroundColor: colors.primary, color: colors.textPrimary, fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  loyaltyProgramDesc: { color: colors.textSecondary, fontSize: 11, marginBottom: 8 },
  loyaltyProgramEffect: { fontSize: 12, fontWeight: '600' },
  tierCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4 },
  tierIcon: { fontSize: 24, marginRight: 12 },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 14, fontWeight: '700' },
  tierPoints: { color: colors.textMuted, fontSize: 10 },
  tierPerks: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  tierDiscount: { fontSize: 14, fontWeight: '700' },

  // Phase 7: Google Reviews Styles
  googleRatingSummary: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  googleRatingMain: { alignItems: 'center', marginBottom: 15 },
  googleRatingNumber: { color: colors.textPrimary, fontSize: 48, fontWeight: '700' },
  googleStars: { flexDirection: 'row', marginVertical: 8 },
  googleStar: { fontSize: 20 },
  googleReviewCount: { color: colors.textMuted, fontSize: 12 },
  googleRatingStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  googleRatingStat: { color: colors.textSecondary, fontSize: 11 },
  reviewCard: { backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  reviewStars: { flexDirection: 'row' },
  reviewStar: { fontSize: 12 },
  reviewText: { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginBottom: 10 },
  reviewActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewWeek: { color: colors.textMuted, fontSize: 10 },
  respondButton: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 4 },
  respondButtonText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
  respondedBadge: { color: colors.success, fontSize: 11, fontWeight: '600' },
  reviewTips: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginTop: 10 },
  reviewTip: { color: colors.textSecondary, fontSize: 11, marginBottom: 5 },

  // Phase 7: Leaderboard Styles
  leaderboardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  leaderboardIcon: { fontSize: 28, marginRight: 15 },
  leaderboardInfo: { flex: 1 },
  leaderboardName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  leaderboardValue: { color: colors.textSecondary, fontSize: 12 },
  leaderboardRank: { alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  leaderboardRankText: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  leaderboardRankLabel: { color: colors.textMuted, fontSize: 9 },
  leaderboardNote: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginTop: 10 },
  leaderboardNoteText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },

  // Phase 7: Share Styles
  shareCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 15, borderRadius: 10, marginBottom: 12 },
  shareIcon: { fontSize: 28, marginRight: 15 },
  shareInfo: { flex: 1 },
  shareName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  sharePreview: { color: colors.textSecondary, fontSize: 11, fontStyle: 'italic' },
  shareStats: { backgroundColor: colors.surface, padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  shareStatsText: { color: colors.textMuted, fontSize: 12 },

});

