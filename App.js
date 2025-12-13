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
// AI MENTOR SYSTEM (Gemini Integration)
// ============================================
const AI_PERSONALITY = {
  name: "Chef Marcus",
  background: "30 years in the industry, opened 12 restaurants, failed at 4, learned from all of them",
  style: "Direct but supportive. Warns but doesn't block. Celebrates wins genuinely.",
  phrases: {
    greetings: ["Alright, let's see what we're working with.", "Another week in the trenches.", "Let's talk business."],
    warnings: ["I've seen this before...", "Red flag here.", "This is where most people mess up."],
    praise: ["Now that's what I like to see.", "You're figuring this out.", "Smart move."],
    tough_love: ["Look, I'm not going to sugarcoat this.", "You need to hear this.", "Real talk:"],
  }
};

const getAIMentorResponse = async (context, game, setup) => {
  const prompt = `You are Chef Marcus, an AI mentor in a restaurant business simulator game called "86'd". 

Your personality:
- 30 years in the restaurant industry
- Opened 12 restaurants, failed at 4, learned from all
- Direct but supportive - you warn but don't block decisions
- You celebrate wins genuinely
- You teach through reflection on past choices
- You get more hands-off as the player proves themselves

Current game state:
- Restaurant: ${setup.name || 'Unnamed'} (${setup.cuisine} cuisine)
- Week: ${game.week}
- Cash: $${game.cash.toLocaleString()}
- Last week profit: $${game.lastWeekProfit?.toLocaleString() || 0}
- Staff count: ${game.staff?.length || 0}
- Reputation: ${game.reputation}%
- Burnout: ${game.burnout}%
- Equipment owned: ${game.equipment?.length || 0}
- Delivery platforms: ${game.delivery?.platforms?.length || 0}

Context for this response: ${context}

Respond as Chef Marcus in 2-3 sentences. Be conversational, direct, and genuinely helpful. If things are going badly, be honest but constructive. If things are going well, acknowledge it without being over the top. Reference specific numbers from the game state when relevant.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.response || getFallbackResponse(context, game);
  } catch (error) {
    console.log('AI Error:', error);
    return getFallbackResponse(context, game);
  }
};

const getFallbackResponse = (context, game) => {
  const responses = {
    weekly_good: [
      "Profitable week. Keep that momentum going.",
      "The numbers are moving in the right direction. Don't get comfortable though.",
      "Good week. Now let's make the next one better.",
    ],
    weekly_bad: [
      "Rough week. It happens. What matters is how you respond.",
      "We need to talk about these numbers. Where's the bleeding coming from?",
      "This is where most people panic. Don't. Analyze and adjust.",
    ],
    low_cash: [
      "Cash is getting tight. Time to get creative or cut costs.",
      "I've been here before. You need to stop the bleeding fast.",
      "Red alert on cash. Every dollar matters right now.",
    ],
    high_burnout: [
      "You're burning out. I've seen owners destroy themselves. Delegate something.",
      "Your burnout is showing. A tired owner makes expensive mistakes.",
      "Hire help or cut hours. You can't run this thing from a hospital bed.",
    ],
    scenario: [
      "This is a test. How you handle it defines what kind of operator you'll be.",
      "Moment of truth. There's no perfect answer here, just trade-offs.",
      "I've seen this situation before. Think it through.",
    ],
    default: [
      "Keep your head down and execute.",
      "One week at a time. That's how you build something.",
      "Focus on what you can control.",
    ]
  };
  
  let category = 'default';
  if (context.includes('weekly') && game.lastWeekProfit > 0) category = 'weekly_good';
  else if (context.includes('weekly') && game.lastWeekProfit <= 0) category = 'weekly_bad';
  else if (game.cash < 10000) category = 'low_cash';
  else if (game.burnout > 70) category = 'high_burnout';
  else if (context.includes('scenario')) category = 'scenario';
  
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
  { role: 'General Manager', wage: 26, icon: '👔', department: 'management', skillCap: 10 },
  { role: 'Assistant Manager', wage: 18, icon: '📊', department: 'management', skillCap: 8 },
  { role: 'Expeditor', wage: 15, icon: '📢', department: 'kitchen', skillCap: 7 },
  { role: 'Busser', wage: 11, icon: '🧹', department: 'foh', skillCap: 5 },
];

const TRAINING_PROGRAMS = [
  { id: 'food_safety', name: 'Food Safety Cert', icon: '🛡️', cost: 200, weeks: 1, skillBoost: 1, cert: 'ServSafe', morale: 5 },
  { id: 'wine_101', name: 'Wine Fundamentals', icon: '🍷', cost: 350, weeks: 2, skillBoost: 2, cert: 'Wine 101', morale: 10 },
  { id: 'leadership', name: 'Leadership Training', icon: '⭐', cost: 500, weeks: 3, skillBoost: 2, cert: 'Team Lead', morale: 15 },
  { id: 'mixology', name: 'Advanced Mixology', icon: '🍹', cost: 400, weeks: 2, skillBoost: 2, cert: 'Mixologist', morale: 10 },
  { id: 'customer_service', name: 'Service Excellence', icon: '🎯', cost: 250, weeks: 1, skillBoost: 1, cert: 'Service Pro', morale: 10 },
  { id: 'management', name: 'Management Bootcamp', icon: '📈', cost: 800, weeks: 4, skillBoost: 3, cert: 'Manager Cert', morale: 20 },
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
  { id: 'investor', name: 'Angel Investor', amount: 50000, rate: 0.15, term: 104, weeklyPayment: 625, equity: 0.1 },
  { id: 'family', name: 'Family Loan', amount: 20000, rate: 0.03, term: 104, weeklyPayment: 200 },
  { id: 'predatory', name: 'Quick Cash Advance', amount: 15000, rate: 0.35, term: 26, weeklyPayment: 750 },
];

// ============================================
// EXPANDED SCENARIOS (25+)
// ============================================
const SCENARIOS = [
  // CRISIS SCENARIOS
  {
    id: 'health_inspection', type: 'crisis', title: '🏥 Health Inspection',
    message: 'Health inspector just walked in unannounced. Your kitchen is about to be evaluated.',
    options: [
      { text: 'Welcome them confidently', successChance: 0.7, success: { reputation: 5, achievement: 'clean_kitchen' }, fail: { cash: -2000, reputation: -15 } },
      { text: 'Stall while staff cleans up', successChance: 0.4, success: { reputation: 2 }, fail: { cash: -3000, reputation: -20 } },
    ],
    lesson: 'Keep your kitchen inspection-ready at all times. The cost of violations far exceeds prevention.',
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
    lesson: 'Invest in your team before problems escalate. Replacing staff costs 3x their monthly wage.',
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
    lesson: 'Budget for equipment emergencies. A maintenance fund saves you from desperate decisions.',
    minWeek: 4,
  },
  {
    id: 'no_show_chef', type: 'crisis', title: '👨‍🍳 Chef No-Show',
    message: 'Your head cook didn\'t show up. No call, no text. It\'s Saturday night and you\'re fully booked.',
    options: [
      { text: 'Get on the line yourself', successChance: 0.6, success: { burnout: 15, reputation: 5 }, fail: { reputation: -10, burnout: 25 } },
      { text: 'Call in a temp agency cook ($500)', successChance: 0.5, success: { cash: -500 }, fail: { cash: -500, reputation: -15 } },
      { text: 'Simplify the menu, push through', successChance: 0.7, success: { reputation: -3 }, fail: { reputation: -12 } },
    ],
    lesson: 'Always have backup contacts. Cross-train your team so no single person is indispensable.',
    minWeek: 6,
  },
  {
    id: 'food_cost_spike', type: 'crisis', title: '📈 Supply Chain Crisis',
    message: 'Your main protein supplier just raised prices 30%. Other suppliers are weeks out.',
    options: [
      { text: 'Absorb the cost temporarily', successChance: 1.0, success: { foodCostMod: 0.08 }, fail: {} },
      { text: 'Raise menu prices 15%', successChance: 0.6, success: { avgTicketMod: 0.15 }, fail: { customers: -15, reputation: -5 } },
      { text: 'Change your menu items', successChance: 0.7, success: { foodCostMod: 0.03 }, fail: { reputation: -8 } },
    ],
    lesson: 'Diversify suppliers. Never depend on a single source for critical ingredients.',
    minWeek: 10,
  },
  {
    id: 'pos_crash', type: 'crisis', title: '💻 POS System Down',
    message: 'Your point-of-sale system crashed during dinner rush. Cards aren\'t processing.',
    options: [
      { text: 'Cash only, apologize profusely', successChance: 0.7, success: { cash: -800, reputation: -5 }, fail: { cash: -1500, reputation: -15 } },
      { text: 'Use Square reader on your phone', successChance: 0.8, success: { cash: -200 }, fail: { cash: -500, reputation: -8 } },
      { text: 'Comp meals, get contact info for bills later', successChance: 0.5, success: { reputation: 10, cash: -2000 }, fail: { cash: -3500 } },
    ],
    lesson: 'Always have a backup payment system. Technology fails at the worst moments.',
    minWeek: 3,
  },
  {
    id: 'employee_theft', type: 'crisis', title: '🚨 Employee Theft',
    message: 'You caught an employee stealing from the register on camera. They\'ve worked here 8 months.',
    options: [
      { text: 'Fire immediately, file police report', successChance: 0.9, success: { staff: -1, morale: -10 }, fail: { reputation: -5 } },
      { text: 'Confront privately, give second chance', successChance: 0.3, success: { morale: 5 }, fail: { cash: -2000, morale: -20 } },
      { text: 'Fire quietly, avoid drama', successChance: 0.8, success: { staff: -1 }, fail: { morale: -15 } },
    ],
    lesson: 'Trust but verify. Regular cash counts and inventory checks prevent theft.',
    minWeek: 12,
  },
  {
    id: 'bad_review_viral', type: 'crisis', title: '📱 Viral Bad Review',
    message: 'A customer posted a scathing review with photos that\'s going viral locally. 50K views.',
    options: [
      { text: 'Public apology, offer to make it right', successChance: 0.7, success: { reputation: -5 }, fail: { reputation: -20 } },
      { text: 'Respond professionally, state your side', successChance: 0.5, success: { reputation: -8 }, fail: { reputation: -25 } },
      { text: 'Ignore it, let it blow over', successChance: 0.4, success: { reputation: -10 }, fail: { reputation: -30, customers: -20 } },
    ],
    lesson: 'Respond to every review. A thoughtful response to criticism often impresses more than the original complaint.',
    minWeek: 8,
  },
  {
    id: 'rent_increase', type: 'crisis', title: '🏢 Landlord Pressure',
    message: 'Your landlord wants to increase rent by 25% when your lease renews in 2 months.',
    options: [
      { text: 'Negotiate hard, threaten to leave', successChance: 0.5, success: { rentMod: 0.1 }, fail: { rentMod: 0.25 } },
      { text: 'Accept the increase', successChance: 1.0, success: { rentMod: 0.25 }, fail: {} },
      { text: 'Start looking for new locations', successChance: 0.6, success: { rentMod: 0.15 }, fail: { cash: -5000, rentMod: 0.2 } },
    ],
    lesson: 'Location is everything, but so is cash flow. Know your numbers before negotiating.',
    minWeek: 20,
  },
  {
    id: 'kitchen_fire', type: 'crisis', title: '🔥 Kitchen Fire',
    message: 'A small grease fire broke out. It\'s contained but there\'s damage and the fire department is here.',
    options: [
      { text: 'Close for repairs, reopen in 3 days', successChance: 0.9, success: { cash: -8000, closedWeeks: 0.5 }, fail: { cash: -15000, reputation: -10 } },
      { text: 'Stay open, work around the damage', successChance: 0.4, success: { cash: -3000, reputation: -5 }, fail: { cash: -3000, reputation: -20, closedWeeks: 1 } },
    ],
    lesson: 'Insurance. Fire suppression systems. Regular hood cleaning. All cheaper than this.',
    minWeek: 15,
  },
  // OPPORTUNITY SCENARIOS
  {
    id: 'viral_review', type: 'opportunity', title: '📱 Viral Review',
    message: 'A food blogger with 500K followers loved your food and wants to feature you.',
    options: [
      { text: 'Roll out the red carpet', successChance: 0.75, success: { reputation: 20, customers: 50, followers: 500 }, fail: { reputation: -10 } },
      { text: 'Treat them like anyone else', successChance: 0.5, success: { reputation: 10, followers: 100 }, fail: { reputation: -5 } },
    ],
    lesson: 'Every guest could be your next advocate or critic. Consistency matters.',
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
    lesson: 'Catering is high-margin but high-stakes. One bad event can kill your reputation.',
    minWeek: 8,
  },
  {
    id: 'press_feature', type: 'opportunity', title: '📰 Press Feature',
    message: 'The local newspaper wants to feature you in their "Best New Restaurants" issue.',
    options: [
      { text: 'Enthusiastically accept', successChance: 0.9, success: { reputation: 15, customers: 30 }, fail: { reputation: 5 } },
    ],
    lesson: 'Good press is free marketing. Always say yes to legitimate media.',
    minWeek: 4,
  },
  {
    id: 'delivery_partnership', type: 'opportunity', title: '🚗 Delivery Partnership',
    message: 'DoorDash rep is offering featured placement with reduced 20% commission for 3 months.',
    options: [
      { text: 'Sign up for the partnership', successChance: 0.8, success: { deliveryEnabled: 'doordash', cash: 500 }, fail: { cash: -500 } },
      { text: 'Negotiate for 15% commission', successChance: 0.4, success: { deliveryEnabled: 'doordash', commissionMod: -0.05 }, fail: { reputation: -2 } },
      { text: 'Focus on dine-in only', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
    lesson: 'Delivery expands reach but watch those commission fees. Do the math on unit economics.',
    minWeek: 5,
  },
  {
    id: 'franchise_inquiry', type: 'opportunity', title: '🏪 Franchise Interest',
    message: 'An investor approached you about franchising your concept. They have deep pockets.',
    options: [
      { text: 'Hear them out, start discussions', successChance: 0.6, success: { cash: 5000, franchiseOpportunity: true }, fail: { burnout: 10 } },
      { text: 'Not ready yet, focus on current location', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Franchising too early kills brands. Master one location before scaling.',
    minWeek: 40,
  },
  {
    id: 'ghost_kitchen', type: 'opportunity', title: '👻 Virtual Brand Opportunity',
    message: 'Your kitchen has downtime. You could launch a delivery-only virtual brand with minimal investment.',
    options: [
      { text: 'Launch a wing brand ($2,000)', successChance: 0.7, success: { virtualBrand: 'wings', cash: -2000 }, fail: { cash: -2000 } },
      { text: 'Launch a burger brand ($1,500)', successChance: 0.75, success: { virtualBrand: 'burgers', cash: -1500 }, fail: { cash: -1500 } },
      { text: 'Not worth the complexity', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Virtual brands can add revenue without adding seats. Low risk, moderate reward.',
    minWeek: 12,
  },
  {
    id: 'private_event', type: 'opportunity', title: '🥂 Private Event Request',
    message: 'Someone wants to book your entire restaurant for a 50-person birthday party.',
    options: [
      { text: 'Accept for $5,000 minimum', successChance: 0.8, success: { cash: 5000, reputation: 5 }, fail: { cash: 2000, reputation: -5 } },
      { text: 'Counter with $7,500 minimum', successChance: 0.5, success: { cash: 7500, reputation: 5 }, fail: { reputation: -2 } },
      { text: 'Decline - need regular covers', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Private events are guaranteed revenue but opportunity cost is real. Price accordingly.',
    minWeek: 10,
  },
  {
    id: 'second_location', type: 'opportunity', title: '🏢 Second Location',
    message: 'Perfect location opened up nearby. Similar demographics, reasonable rent. $150K to build out.',
    options: [
      { text: 'Pursue it - start negotiations', successChance: 0.5, success: { secondLocation: true, cash: -150000 }, fail: { cash: -10000, burnout: 20 } },
      { text: 'Not ready - need more runway', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Second locations fail at 2x the rate of first ones. Perfect your systems first.',
    minWeek: 52,
    minCash: 200000,
  },
  // STAFF SCENARIOS
  {
    id: 'star_employee_offer', type: 'staff', title: '⭐ Poaching Attempt',
    message: 'Your best cook just got offered $5/hr more at a competitor. They\'re considering it.',
    options: [
      { text: 'Match the offer', successChance: 0.9, success: { laborCostMod: 0.08, morale: 10 }, fail: { staff: -1 } },
      { text: 'Counter with $3/hr raise + title', successChance: 0.7, success: { laborCostMod: 0.05, morale: 15 }, fail: { staff: -1, morale: -15 } },
      { text: 'Wish them well', successChance: 1.0, success: { staff: -1 }, fail: {} },
    ],
    lesson: 'Good people are worth paying for. The cost of turnover exceeds the cost of retention.',
    minWeek: 15,
  },
  {
    id: 'toxic_employee', type: 'staff', title: '😤 Toxic Team Member',
    message: 'One employee is talented but creating drama. Three others have complained about them.',
    options: [
      { text: 'Fire them immediately', successChance: 0.8, success: { staff: -1, morale: 20 }, fail: { morale: 10 } },
      { text: 'Final warning, behavior plan', successChance: 0.4, success: { morale: 5 }, fail: { morale: -15, staff: -2 } },
      { text: 'Talk to them privately', successChance: 0.5, success: { morale: 10 }, fail: { morale: -10 } },
    ],
    lesson: 'One toxic person can destroy team culture. Speed matters in these decisions.',
    minWeek: 10,
  },
  {
    id: 'workers_comp', type: 'staff', title: '🏥 Workplace Injury',
    message: 'A dishwasher slipped and hurt their back. They\'re talking about workers comp.',
    options: [
      { text: 'Handle it properly - file the claim', successChance: 0.9, success: { cash: -3000, morale: 10 }, fail: { cash: -8000 } },
      { text: 'Offer cash payment to avoid claim', successChance: 0.3, success: { cash: -1000 }, fail: { cash: -15000, reputation: -10 } },
    ],
    lesson: 'Workers comp exists for a reason. Cutting corners here can destroy you.',
    minWeek: 8,
  },
  // FINANCIAL SCENARIOS
  {
    id: 'loan_offer', type: 'financial', title: '💰 Loan Offer',
    message: 'Your bank is offering a $50K line of credit at 9% interest. Payments would be $550/week.',
    options: [
      { text: 'Accept - runway is valuable', successChance: 1.0, success: { cash: 50000, loan: 'bank_medium' }, fail: {} },
      { text: 'Negotiate for better terms', successChance: 0.4, success: { cash: 50000, loan: 'bank_medium_better' }, fail: {} },
      { text: 'Decline - stay lean', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Debt is a tool. Used wisely it enables growth. Used poorly it kills businesses.',
    minWeek: 12,
  },
  {
    id: 'investor_pitch', type: 'financial', title: '💼 Investor Meeting',
    message: 'An angel investor wants to put in $75K for 15% equity. They have restaurant experience.',
    options: [
      { text: 'Accept the investment', successChance: 0.8, success: { cash: 75000, equity: -15 }, fail: { burnout: 10 } },
      { text: 'Counter at 10% equity', successChance: 0.4, success: { cash: 75000, equity: -10 }, fail: { reputation: -2 } },
      { text: 'Stay independent', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Smart money (experienced investors) is often worth more than the cash they bring.',
    minWeek: 20,
    minCash: 30000,
  },
  {
    id: 'predatory_loan', type: 'financial', title: '🦈 Quick Cash Offer',
    message: 'A guy offers you $15K cash advance. Payback is $750/week for 26 weeks. You need the money.',
    options: [
      { text: 'Take it - desperate times', successChance: 1.0, success: { cash: 15000, loan: 'predatory' }, fail: {} },
      { text: 'Hard pass - that\'s loan sharking', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Predatory loans kill restaurants. That 35% effective rate will crush you.',
    minWeek: 8,
    maxCash: 15000,
  },
  // SEASONAL SCENARIOS
  {
    id: 'january_slump', type: 'seasonal', title: '❄️ January Dead Zone',
    message: 'New Year\'s resolutions have killed dining out. Traffic is down 40% and your regulars disappeared.',
    options: [
      { text: 'Push healthy menu items hard', successChance: 0.6, success: { customers: 10 }, fail: { customers: -10 } },
      { text: 'Deep discounts to drive traffic', successChance: 0.5, success: { customers: 20, avgTicketMod: -0.2 }, fail: { reputation: -5 } },
      { text: 'Reduce hours, cut costs, survive', successChance: 0.8, success: { laborCostMod: -0.15 }, fail: { morale: -10 } },
    ],
    lesson: 'January-February kills restaurants. Plan for it. Build reserves in Q4.',
    triggerWeek: [1, 2, 3, 4, 5, 53, 54, 55, 56, 57],
  },
  {
    id: 'summer_slump', type: 'seasonal', title: '☀️ Summer Slowdown',
    message: 'Everyone\'s on vacation. Families are gone, lunch traffic crashed. It\'s dead out here.',
    options: [
      { text: 'Summer specials and happy hours', successChance: 0.7, success: { customers: 15 }, fail: { cash: -500 } },
      { text: 'Focus on tourists and visitors', successChance: 0.5, success: { customers: 10, newCustomers: 0.1 }, fail: { reputation: -3 } },
      { text: 'Push delivery and catering', successChance: 0.6, success: { deliveryOrders: 0.3 }, fail: {} },
    ],
    lesson: 'Summer hits different markets differently. Know your customer base.',
    triggerWeek: [26, 27, 28, 29, 30, 31, 32, 33],
  },
];

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
  zero_turnover: { name: 'Zero Turnover', desc: 'No quits for 26 weeks', icon: '🎯', category: 'staff', points: 150 },
  // Operations
  menu_master: { name: 'Menu Master', desc: 'Have 15 menu items', icon: '📋', category: 'operations', points: 50 },
  fully_equipped: { name: 'Fully Equipped', desc: 'Own 5+ equipment', icon: '⚙️', category: 'operations', points: 75 },
  upgraded: { name: 'Upgraded', desc: 'Purchase 3 upgrades', icon: '🔧', category: 'operations', points: 100 },
  clean_kitchen: { name: 'Clean Kitchen', desc: 'Pass health inspection', icon: '🛡️', category: 'operations', points: 50 },
  delivery_king: { name: 'Delivery King', desc: 'Enable all delivery platforms', icon: '🛵', category: 'operations', points: 75 },
  virtual_mogul: { name: 'Virtual Mogul', desc: 'Run 3 virtual brands', icon: '👻', category: 'operations', points: 150 },
  // Customer
  thousand_served: { name: '1K Served', desc: 'Serve 1,000 customers', icon: '🎉', category: 'customer', points: 50 },
  ten_thousand: { name: '10K Served', desc: 'Serve 10,000 customers', icon: '🎊', category: 'customer', points: 150 },
  five_star: { name: 'Five Star', desc: 'Reach 95% reputation', icon: '⭐', category: 'customer', points: 200 },
  regular_army: { name: 'Regular Army', desc: '50% repeat customers', icon: '😊', category: 'customer', points: 100 },
  // Growth
  second_location: { name: 'Expansion', desc: 'Open second location', icon: '🏪', category: 'growth', points: 300 },
  franchise: { name: 'Franchise', desc: 'Launch franchise program', icon: '🌐', category: 'growth', points: 500 },
  empire: { name: 'Empire', desc: 'Own 5+ locations', icon: '👑', category: 'growth', points: 1000 },
};

const GOALS = [
  { id: 'survive', name: 'Survival', desc: 'Keep the doors open for 1 year', target: { weeks: 52 }, difficulty: 'Normal' },
  { id: 'profit', name: 'Profitability', desc: 'Build $100K in cash reserves', target: { cash: 100000 }, difficulty: 'Hard' },
  { id: 'reputation', name: 'Reputation', desc: 'Reach 90% reputation rating', target: { reputation: 90 }, difficulty: 'Hard' },
  { id: 'empire', name: 'Empire Builder', desc: 'Open a second location', target: { locations: 2 }, difficulty: 'Expert' },
  { id: 'legacy', name: 'Legacy', desc: 'Build a restaurant worth $500K', target: { valuation: 500000 }, difficulty: 'Expert' },
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
    chinese: ['Kung Pao Chicken', 'General Tso\'s', 'Lo Mein', 'Fried Rice', 'Orange Chicken', 'Beef & Broccoli', 'Sweet & Sour Pork', 'Mapo Tofu'],
    japanese: ['Tonkotsu Ramen', 'Chicken Teriyaki', 'Tempura Combo', 'Katsu Curry', 'Chirashi Don', 'Udon Noodles', 'Gyoza Plate', 'Bento Box'],
    thai: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Massaman Curry', 'Basil Chicken', 'Pad See Ew', 'Som Tum Salad', 'Mango Sticky Rice'],
    indian: ['Butter Chicken', 'Tikka Masala', 'Lamb Biryani', 'Samosa Platter', 'Palak Paneer', 'Tandoori Mixed Grill', 'Dal Makhani', 'Garlic Naan'],
    korean: ['Bibimbap', 'Korean BBQ Set', 'Japchae', 'Kimchi Jjigae', 'Bulgogi Bowl', 'Tteokbokki', 'Fried Chicken', 'Sundubu'],
    default: ['House Special', 'Chef\'s Choice', 'Daily Feature', 'Signature Dish', 'Classic Favorite', 'Popular Pick', 'Customer Fave', 'Must Try'],
  };
  const list = items[cuisine] || items.default;
  return list[Math.floor(Math.random() * list.length)];
};

const calculateValuation = (game, setup) => {
  // Simple restaurant valuation: revenue multiple + assets
  const annualRevenue = (game.totalRevenue / Math.max(1, game.week)) * 52;
  const revenueMult = game.reputation > 80 ? 2.5 : game.reputation > 60 ? 2 : 1.5;
  const equipmentValue = game.equipment.length * 3000;
  const upgradeValue = game.upgrades.reduce((sum, u) => sum + (UPGRADES.find(up => up.id === u)?.cost || 0) * 0.5, 0);
  return Math.round(annualRevenue * revenueMult + equipmentValue + upgradeValue + game.cash);
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

// Typing Animation Component
const TypeWriter = ({ text, speed = 30, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(t => t + text[i]);
        i++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return <Text style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 24 }}>{displayed}<Text style={{ color: colors.primary }}>▊</Text></Text>;
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
    location: 'urban',
    city: '',
    goal: 'survive',
    experience: 'none',
  });
  
  // Game State
  const [game, setGame] = useState(null);
  
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
  const [pnlModal, setPnlModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [aiChatModal, setAiChatModal] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  
  // Save State
  const [savedGames, setSavedGames] = useState([]);

  // Initialize Game
  const initGame = useCallback(() => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const locationMod = { urban: 1.2, suburban: 1.0, rural: 0.8 }[setup.location] || 1;
    const baseCovers = Math.floor(40 + (setup.capital / 15000) * 10);
    
    const initialGame = {
      week: 0,
      cash: setup.capital,
      totalRevenue: 0,
      totalProfit: 0,
      reputation: 50,
      burnout: 0,
      ownerHours: 65,
      morale: 70,
      
      // Staff
      staff: [
        { id: 1, name: generateName(), role: 'Line Cook', wage: 16, skill: 5, weeks: 0, training: [], morale: 70, icon: '👨‍🍳', department: 'kitchen' }
      ],
      
      // Menu
      menu: [
        { id: 1, name: generateMenuItem(setup.cuisine), price: cuisine.avgTicket, cost: cuisine.avgTicket * cuisine.foodCost, popular: true, is86d: false }
      ],
      
      // Financials
      avgTicket: cuisine.avgTicket,
      foodCostPct: cuisine.foodCost,
      laborCostPct: 0.30,
      covers: baseCovers,
      locationMod,
      rent: Math.floor(setup.capital * 0.03),
      loans: [],
      equity: 100,
      
      // Customers
      customersServed: { total: 0, byType: {} },
      regulars: 0,
      
      // Operations
      equipment: [],
      upgrades: [],
      marketing: { channels: ['social_organic'], promotions: [], socialFollowers: 100, loyaltyMembers: 0 },
      delivery: { platforms: [], orders: 0 },
      virtualBrands: [],
      
      // Progress
      weeklyHistory: [],
      achievements: ['first_week'],
      scenariosSeen: [],
      profitStreak: 0,
      locations: 1,
      
      // Last Week Data
      lastWeekRevenue: 0,
      lastWeekProfit: 0,
      lastWeekCosts: {},
      lastWeekCovers: 0,
    };
    
    setGame(initialGame);
    setScreen('dashboard');
    
    // Initial AI greeting
    setTimeout(async () => {
      setAiLoading(true);
      const response = await getAIMentorResponse('Player just opened their restaurant. Give them encouraging but realistic opening advice.', initialGame, setup);
      setAiMessage(response);
      setAiLoading(false);
    }, 500);
  }, [setup]);

  // ============================================
  // GAME LOGIC
  // ============================================
  
  const processWeek = useCallback(async () => {
    if (!game) return;
    
    setGame(g => {
      const cuisine = CUISINES.find(c => c.id === setup.cuisine);
      
      // Calculate all modifiers
      const equipCapacityMod = g.equipment.reduce((sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.effect?.capacity || 0), 0);
      const upgradeCapacityMod = g.upgrades.reduce((sum, u) => sum + (UPGRADES.find(up => up.id === u)?.effect?.capacity || 0), 0);
      const marketingReachMod = g.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.effect?.reach || 0), 0);
      const staffQualityMod = g.staff.length > 0 ? g.staff.reduce((sum, s) => sum + s.skill, 0) / g.staff.length / 20 : 0;
      const moraleMod = (g.morale - 50) / 200; // -0.25 to +0.25
      
      // Base covers calculation
      let weekCovers = Math.floor(g.covers * g.locationMod);
      weekCovers = Math.floor(weekCovers * (1 + equipCapacityMod + upgradeCapacityMod + marketingReachMod + staffQualityMod));
      weekCovers = Math.floor(weekCovers * (1 + g.reputation / 200));
      weekCovers = Math.floor(weekCovers * (1 + moraleMod));
      weekCovers = Math.floor(weekCovers * (0.85 + Math.random() * 0.3)); // Natural variance
      
      // Customer types and spending
      const customersByType = {};
      let totalSpend = 0;
      let tips = 0;
      
      for (let i = 0; i < weekCovers; i++) {
        const rand = Math.random();
        let cumulative = 0;
        let type = CUSTOMER_TYPES[0];
        for (const ct of CUSTOMER_TYPES) {
          cumulative += ct.frequency;
          if (rand <= cumulative) { type = ct; break; }
        }
        customersByType[type.id] = (customersByType[type.id] || 0) + 1;
        const spend = g.avgTicket * type.spendMod * (0.9 + Math.random() * 0.2);
        totalSpend += spend;
        tips += spend * 0.18 * type.tipMod;
      }
      
      // Revenue streams
      const dineInRevenue = totalSpend;
      
      // Delivery revenue
      const deliveryOrders = g.delivery.platforms.length > 0 ? Math.floor(weekCovers * 0.25 * g.delivery.platforms.length / 3) : 0;
      const avgCommission = g.delivery.platforms.length > 0 
        ? g.delivery.platforms.reduce((sum, p) => sum + (DELIVERY_PLATFORMS.find(dp => dp.id === p)?.commission || 0.25), 0) / g.delivery.platforms.length 
        : 0;
      const deliveryRevenue = deliveryOrders * g.avgTicket * (1 - avgCommission);
      
      // Virtual brand revenue
      const virtualBrandRevenue = g.virtualBrands.reduce((sum, vb) => {
        const brand = VIRTUAL_BRANDS.find(v => v.id === vb);
        if (!brand) return sum;
        const orders = Math.floor(15 + Math.random() * 20);
        return sum + orders * brand.avgTicket * 0.70;
      }, 0);
      
      // Bar revenue if upgraded
      const barRevenue = g.upgrades.includes('bar') ? weekCovers * 8 * (0.3 + Math.random() * 0.4) : 0;
      
      const totalRevenue = dineInRevenue + deliveryRevenue + virtualBrandRevenue + barRevenue;
      
      // COSTS
      const foodCost = totalRevenue * g.foodCostPct;
      const laborCost = g.staff.reduce((sum, s) => sum + s.wage * 40, 0) + (g.ownerHours > 40 ? 0 : (40 - g.ownerHours) * 20);
      const rent = g.rent;
      const utilities = Math.floor(rent * 0.15);
      const marketingCost = g.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.costPerWeek || 0), 0);
      const equipmentMaint = g.equipment.reduce((sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.maintenance || 0), 0) / 4;
      const loanPayments = g.loans.reduce((sum, l) => {
        const loan = LOANS.find(lo => lo.id === l.type);
        return sum + (loan?.weeklyPayment || 0);
      }, 0);
      const ccFees = totalRevenue * 0.025;
      
      const totalCosts = foodCost + laborCost + rent + utilities + marketingCost + equipmentMaint + loanPayments + ccFees;
      const weekProfit = totalRevenue - totalCosts;
      
      // Update staff morale and skills
      const updatedStaff = g.staff.map(s => {
        let newMorale = s.morale;
        if (weekProfit > 0) newMorale += 2;
        if (weekProfit < -1000) newMorale -= 5;
        if (g.burnout > 70) newMorale -= 3;
        newMorale = Math.max(20, Math.min(100, newMorale + (Math.random() - 0.5) * 5));
        
        // Skill improvement over time
        const skillGain = s.weeks > 0 && s.weeks % 8 === 0 && s.skill < (STAFF_TEMPLATES.find(t => t.role === s.role)?.skillCap || 10) ? 0.5 : 0;
        
        return { ...s, weeks: s.weeks + 1, morale: Math.round(newMorale), skill: Math.min(10, s.skill + skillGain) };
      });
      
      // Random staff quit check
      const quitThreshold = 30;
      const stayingStaff = updatedStaff.filter(s => {
        if (s.morale < quitThreshold && Math.random() < 0.3) {
          return false; // Staff quits
        }
        return true;
      });
      
      // Update team morale
      const avgMorale = stayingStaff.length > 0 ? stayingStaff.reduce((sum, s) => sum + s.morale, 0) / stayingStaff.length : 50;
      
      // Profit streak
      const newProfitStreak = weekProfit > 0 ? g.profitStreak + 1 : 0;
      
      // Update achievements
      const newAchievements = [...g.achievements];
      const weekNum = g.week + 1;
      if (weekNum >= 4 && !newAchievements.includes('first_month')) newAchievements.push('first_month');
      if (weekNum >= 13 && !newAchievements.includes('three_months')) newAchievements.push('three_months');
      if (weekNum >= 26 && !newAchievements.includes('six_months')) newAchievements.push('six_months');
      if (weekNum >= 52 && !newAchievements.includes('survivor')) newAchievements.push('survivor');
      if (weekNum >= 104 && !newAchievements.includes('two_years')) newAchievements.push('two_years');
      if (weekProfit > 0 && !newAchievements.includes('first_profit')) newAchievements.push('first_profit');
      if (newProfitStreak >= 10 && !newAchievements.includes('profit_streak')) newAchievements.push('profit_streak');
      if (g.cash + weekProfit >= 50000 && !newAchievements.includes('fifty_k')) newAchievements.push('fifty_k');
      if (g.cash + weekProfit >= 100000 && !newAchievements.includes('hundred_k')) newAchievements.push('hundred_k');
      if (g.cash + weekProfit >= 250000 && !newAchievements.includes('quarter_mil')) newAchievements.push('quarter_mil');
      if (stayingStaff.length >= 10 && !newAchievements.includes('full_team')) newAchievements.push('full_team');
      if (g.menu.length >= 15 && !newAchievements.includes('menu_master')) newAchievements.push('menu_master');
      if (g.equipment.length >= 5 && !newAchievements.includes('fully_equipped')) newAchievements.push('fully_equipped');
      if (g.customersServed.total + weekCovers >= 1000 && !newAchievements.includes('thousand_served')) newAchievements.push('thousand_served');
      if (g.customersServed.total + weekCovers >= 10000 && !newAchievements.includes('ten_thousand')) newAchievements.push('ten_thousand');
      if (g.virtualBrands.length >= 3 && !newAchievements.includes('virtual_mogul')) newAchievements.push('virtual_mogul');
      
      // Check for scenarios
      const availableScenarios = SCENARIOS.filter(s => {
        if (g.scenariosSeen.includes(s.id)) return false;
        if (s.minWeek && weekNum < s.minWeek) return false;
        if (s.minCash && g.cash < s.minCash) return false;
        if (s.maxCash && g.cash > s.maxCash) return false;
        if (s.triggerWeek && !s.triggerWeek.includes(weekNum % 52)) return false;
        return true;
      });
      
      if (Math.random() < 0.18 && availableScenarios.length > 0 && weekNum > 1) {
        const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
        setTimeout(() => setScenario(randomScenario), 500);
      }
      
      // Update history
      const newHistory = [...g.weeklyHistory, { 
        week: weekNum, 
        revenue: totalRevenue, 
        profit: weekProfit, 
        covers: weekCovers,
        costs: totalCosts,
        reputation: g.reputation,
      }].slice(-52);
      
      // New cash total
      const newCash = g.cash + weekProfit;
      
      // Check game end conditions
      if (newCash < -20000) {
        setTimeout(() => setScreen('gameover'), 100);
      }
      
      // Check win conditions
      const goal = GOALS.find(gl => gl.id === setup.goal);
      if (goal && goal.id !== 'sandbox') {
        if (goal.target.weeks && weekNum >= goal.target.weeks) setTimeout(() => setScreen('win'), 100);
        if (goal.target.cash && newCash >= goal.target.cash) setTimeout(() => setScreen('win'), 100);
        if (goal.target.reputation && g.reputation >= goal.target.reputation) setTimeout(() => setScreen('win'), 100);
      }
      
      return {
        ...g,
        week: weekNum,
        cash: newCash,
        totalRevenue: g.totalRevenue + totalRevenue,
        totalProfit: g.totalProfit + weekProfit,
        lastWeekRevenue: totalRevenue,
        lastWeekProfit: weekProfit,
        lastWeekCosts: { food: foodCost, labor: laborCost, rent, utilities, marketing: marketingCost, equipment: equipmentMaint, loans: loanPayments, ccFees },
        lastWeekCovers: weekCovers,
        customersServed: {
          total: g.customersServed.total + weekCovers,
          byType: Object.entries(customersByType).reduce((acc, [k, v]) => ({ ...acc, [k]: (g.customersServed.byType[k] || 0) + v }), g.customersServed.byType),
        },
        staff: stayingStaff,
        morale: Math.round(avgMorale),
        delivery: { ...g.delivery, orders: g.delivery.orders + deliveryOrders },
        weeklyHistory: newHistory,
        achievements: newAchievements,
        profitStreak: newProfitStreak,
        burnout: Math.min(100, Math.max(0, g.burnout + (g.ownerHours > 50 ? 5 : -3) + (weekProfit < 0 ? 3 : 0))),
        reputation: Math.min(100, Math.max(0, g.reputation + (weekProfit > 0 ? 1 : -1) + (avgMorale > 70 ? 1 : avgMorale < 40 ? -2 : 0))),
      };
    });
    
    // Get AI commentary
    setTimeout(async () => {
      if (game) {
        setAiLoading(true);
        const context = game.lastWeekProfit > 0 
          ? 'Weekly summary - profitable week. Acknowledge the win and give one tip for improvement.'
          : 'Weekly summary - lost money this week. Be direct about the problem without being harsh.';
        const response = await getAIMentorResponse(context, game, setup);
        setAiMessage(response);
        setAiLoading(false);
      }
    }, 800);
  }, [game, setup]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
  
  const hireStaff = (template) => {
    if (!game || game.cash < template.wage * 40) return;
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
    };
    setGame(g => ({
      ...g,
      cash: g.cash - template.wage * 40,
      staff: [...g.staff, newStaff],
      achievements: g.achievements.includes('first_hire') ? g.achievements : [...g.achievements, 'first_hire'],
    }));
    setStaffModal(false);
  };

  const fireStaff = (id) => {
    setGame(g => ({
      ...g,
      staff: g.staff.filter(s => s.id !== id),
      morale: Math.max(30, g.morale - 10),
    }));
  };

  const giveRaise = (id, amount) => {
    setGame(g => ({
      ...g,
      staff: g.staff.map(s => s.id === id ? { ...s, wage: s.wage + amount, morale: Math.min(100, s.morale + 15) } : s),
    }));
  };

  const startTraining = (program) => {
    if (!selectedStaff || !game || game.cash < program.cost) return;
    setGame(g => ({
      ...g,
      cash: g.cash - program.cost,
      staff: g.staff.map(s => s.id === selectedStaff.id ? {
        ...s,
        training: [...s.training, program.id],
        skill: Math.min(10, s.skill + program.skillBoost),
        morale: Math.min(100, s.morale + program.morale),
      } : s),
      achievements: g.staff.filter(st => st.training.length > 0).length >= 4 && !g.achievements.includes('trainer') 
        ? [...g.achievements, 'trainer'] : g.achievements,
    }));
    setTrainingModal(false);
    setSelectedStaff(null);
  };

  const addMenuItem = () => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    if (!cuisine || !game) return;
    const priceVariance = 0.7 + Math.random() * 0.6;
    setGame(g => ({
      ...g,
      menu: [...g.menu, {
        id: Date.now(),
        name: generateMenuItem(setup.cuisine),
        price: Math.round(cuisine.avgTicket * priceVariance * 100) / 100,
        cost: cuisine.avgTicket * cuisine.foodCost * priceVariance,
        popular: Math.random() > 0.7,
        is86d: false,
      }],
    }));
  };

  const toggle86 = (id) => {
    setGame(g => ({
      ...g,
      menu: g.menu.map(m => m.id === id ? { ...m, is86d: !m.is86d } : m),
    }));
  };

  const updatePrice = (id, newPrice) => {
    setGame(g => ({
      ...g,
      menu: g.menu.map(m => m.id === id ? { ...m, price: parseFloat(newPrice) || m.price } : m),
    }));
  };

  const buyEquipment = (eq) => {
    if (!game || game.cash < eq.cost || game.equipment.includes(eq.id)) return;
    setGame(g => ({ ...g, cash: g.cash - eq.cost, equipment: [...g.equipment, eq.id] }));
  };

  const buyUpgrade = (up) => {
    if (!game || game.cash < up.cost || game.upgrades.includes(up.id)) return;
    setGame(g => ({
      ...g,
      cash: g.cash - up.cost,
      upgrades: [...g.upgrades, up.id],
      reputation: g.reputation + (up.effect.reputation || 0),
    }));
  };

  const toggleMarketingChannel = (channelId) => {
    setGame(g => {
      const isActive = g.marketing.channels.includes(channelId);
      return {
        ...g,
        marketing: {
          ...g.marketing,
          channels: isActive
            ? g.marketing.channels.filter(c => c !== channelId)
            : [...g.marketing.channels, channelId],
        },
      };
    });
  };

  const toggleDeliveryPlatform = (platformId) => {
    const platform = DELIVERY_PLATFORMS.find(p => p.id === platformId);
    if (!platform || !game) return;
    setGame(g => {
      const isActive = g.delivery.platforms.includes(platformId);
      if (isActive) {
        return { ...g, delivery: { ...g.delivery, platforms: g.delivery.platforms.filter(p => p !== platformId) } };
      } else if (g.cash >= platform.setup) {
        return {
          ...g,
          cash: g.cash - platform.setup,
          delivery: { ...g.delivery, platforms: [...g.delivery.platforms, platformId] },
        };
      }
      return g;
    });
  };

  const launchVirtualBrand = (brandId) => {
    const brand = VIRTUAL_BRANDS.find(b => b.id === brandId);
    if (!game || !brand || game.virtualBrands.includes(brandId) || game.cash < brand.setupCost) return;
    setGame(g => ({
      ...g,
      cash: g.cash - brand.setupCost,
      virtualBrands: [...g.virtualBrands, brandId],
    }));
  };

  const takeLoan = (loanId) => {
    const loan = LOANS.find(l => l.id === loanId);
    if (!loan || !game) return;
    setGame(g => ({
      ...g,
      cash: g.cash + loan.amount,
      loans: [...g.loans, { type: loanId, remaining: loan.term, principal: loan.amount }],
      equity: g.equity - (loan.equity || 0),
    }));
    setLoanModal(false);
  };

  const handleScenarioChoice = async (option) => {
    const success = Math.random() <= option.successChance;
    const outcome = success ? option.success : option.fail;
    setScenarioResult({ success, outcome });
    
    setGame(g => {
      let updated = { ...g, scenariosSeen: [...g.scenariosSeen, scenario.id] };
      
      if (outcome.cash) updated.cash += outcome.cash;
      if (outcome.reputation) updated.reputation = Math.min(100, Math.max(0, updated.reputation + outcome.reputation));
      if (outcome.foodWaste) updated.cash -= outcome.foodWaste;
      if (outcome.morale) updated.morale = Math.min(100, Math.max(0, updated.morale + outcome.morale));
      if (outcome.burnout) updated.burnout = Math.min(100, Math.max(0, updated.burnout + outcome.burnout));
      if (outcome.staff) {
        const toRemove = Math.abs(outcome.staff);
        updated.staff = updated.staff.slice(0, Math.max(1, updated.staff.length - toRemove));
      }
      if (outcome.laborCostMod) updated.laborCostPct += outcome.laborCostMod;
      if (outcome.foodCostMod) updated.foodCostPct += outcome.foodCostMod;
      if (outcome.avgTicketMod) updated.avgTicket *= (1 + outcome.avgTicketMod);
      if (outcome.rentMod) updated.rent *= (1 + outcome.rentMod);
      if (outcome.customers) updated.covers += outcome.customers;
      if (outcome.followers) updated.marketing.socialFollowers += outcome.followers;
      if (outcome.deliveryEnabled) {
        if (!updated.delivery.platforms.includes(outcome.deliveryEnabled)) {
          updated.delivery.platforms.push(outcome.deliveryEnabled);
        }
      }
      if (outcome.virtualBrand && !updated.virtualBrands.includes(outcome.virtualBrand)) {
        updated.virtualBrands.push(outcome.virtualBrand);
      }
      if (outcome.achievement && !updated.achievements.includes(outcome.achievement)) {
        updated.achievements.push(outcome.achievement);
      }
      
      return updated;
    });
    
    // AI commentary on scenario
    setAiLoading(true);
    const context = `Player just faced scenario "${scenario.title}". They chose "${option.text}" and ${success ? 'succeeded' : 'failed'}. Give brief commentary.`;
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
    setScreen('dashboard');
    setSaveModal(false);
  };

  const restart = () => {
    setScreen('welcome');
    setOnboardingStep(0);
    setSetup({ cuisine: null, capital: 75000, name: '', location: 'urban', city: '', goal: 'survive', experience: 'none' });
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
          <Text style={styles.welcomeSubtext}>Build your restaurant empire.{'\n'}Learn from an AI mentor with 30 years experience.{'\n'}Try not to get 86'd.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setScreen('onboarding')}>
            <Text style={styles.startButtonText}>START YOUR JOURNEY</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v4.0.0 • Phase 2 • AI Powered</Text>
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
      { title: 'Location', key: 'location' },
      { title: 'Your Background', key: 'experience' },
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
                {step.key === 'cuisine' && "What type of food will you serve? This affects everything - your food costs, average ticket, and how hard it'll be to execute."}
                {step.key === 'capital' && "How much are you putting in? More capital means more runway, but also higher stakes. There's no magic number - I've seen $30K concepts crush $300K buildouts."}
                {step.key === 'name' && "What are you calling this place? Make it memorable. Make it yours."}
                {step.key === 'location' && "Where are you setting up? Urban means more foot traffic but higher rent. Suburban is balanced. Rural is cheaper but you'll work harder for every customer."}
                {step.key === 'experience' && "What's your background? Be honest - this helps me calibrate my advice. No shame in being new, just different challenges."}
                {step.key === 'goal' && "What does winning look like to you? Everyone's definition of success is different."}
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
                      <Text style={styles.selectedStats}>Food Cost: {formatPct(CUISINES.find(c => c.id === setup.cuisine)?.foodCost)} • Avg Ticket: {formatCurrency(CUISINES.find(c => c.id === setup.cuisine)?.avgTicket)} • {CUISINES.find(c => c.id === setup.cuisine)?.difficulty}</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {step.key === 'capital' && (
              <>
                <View style={styles.capitalDisplay}>
                  <Text style={[styles.capitalAmount, { color: setup.capital < 50000 ? colors.accent : setup.capital < 100000 ? colors.warning : colors.success }]}>{formatCurrency(setup.capital)}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: setup.capital < 50000 ? colors.accent : setup.capital < 100000 ? colors.warning : colors.success }]}>
                    <Text style={styles.tierText}>{setup.capital < 50000 ? 'BOOTSTRAP' : setup.capital < 100000 ? 'STANDARD' : setup.capital < 200000 ? 'WELL-FUNDED' : 'PREMIUM'}</Text>
                  </View>
                  <Text style={styles.tierDesc}>
                    {setup.capital < 50000 && "You'll be doing everything yourself. No room for mistakes."}
                    {setup.capital >= 50000 && setup.capital < 100000 && "Tight but doable. You can hire a small team."}
                    {setup.capital >= 100000 && setup.capital < 200000 && "Solid runway. Focus on execution."}
                    {setup.capital >= 200000 && "Good cushion. Don't let it make you sloppy."}
                  </Text>
                </View>
                <Slider style={styles.slider} minimumValue={25000} maximumValue={500000} step={5000} value={setup.capital} onValueChange={(v) => setSetup(s => ({ ...s, capital: v }))} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.surfaceLight} thumbTintColor={colors.primary} />
                <View style={styles.sliderLabels}><Text style={styles.sliderLabel}>$25K</Text><Text style={styles.sliderLabel}>$500K</Text></View>
              </>
            )}

            {step.key === 'name' && (
              <TextInput style={styles.textInput} placeholder="e.g., The Golden Fork" placeholderTextColor={colors.textMuted} value={setup.name} onChangeText={(t) => setSetup(s => ({ ...s, name: t }))} />
            )}

            {step.key === 'location' && (
              <View style={styles.optionRow}>
                {[
                  { id: 'urban', name: 'Urban', desc: '+20% traffic, +20% rent' },
                  { id: 'suburban', name: 'Suburban', desc: 'Balanced traffic & costs' },
                  { id: 'rural', name: 'Rural', desc: '-20% traffic, -20% rent' }
                ].map(loc => (
                  <TouchableOpacity key={loc.id} style={[styles.optionButton, setup.location === loc.id && styles.optionButtonActive]} onPress={() => setSetup(s => ({ ...s, location: loc.id }))}>
                    <Text style={[styles.optionText, setup.location === loc.id && styles.optionTextActive]}>{loc.name}</Text>
                    <Text style={styles.optionDesc}>{loc.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step.key === 'experience' && (
              <View style={styles.goalOptions}>
                {[
                  { id: 'none', name: 'Complete Newbie', desc: "Never worked in a restaurant" },
                  { id: 'some', name: 'Some Experience', desc: "Worked FOH or BOH before" },
                  { id: 'manager', name: 'Management', desc: "Managed a restaurant" },
                  { id: 'owner', name: 'Previous Owner', desc: "Owned a restaurant before" },
                ].map(exp => (
                  <TouchableOpacity key={exp.id} style={[styles.goalButton, setup.experience === exp.id && styles.goalButtonActive]} onPress={() => setSetup(s => ({ ...s, experience: exp.id }))}>
                    <Text style={[styles.goalText, setup.experience === exp.id && styles.goalTextActive]}>{exp.name}</Text>
                    <Text style={styles.goalDesc}>{exp.desc}</Text>
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
  // RENDER - SCENARIO SCREEN
  // ============================================
  if (scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.scenarioContainer}>
          <View style={styles.scenarioContent}>
            <View style={styles.scenarioHeader}>
              <View style={[styles.scenarioTypeBadge, { backgroundColor: scenario.type === 'crisis' ? colors.accent : scenario.type === 'opportunity' ? colors.success : colors.info }]}>
                <Text style={styles.scenarioTypeText}>{scenario.type.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioSubtitle}>Week {game?.week}</Text>
            <View style={styles.scenarioMessageBox}>
              <Text style={styles.scenarioMessage}>{scenario.message}</Text>
            </View>
            
            {!scenarioResult ? (
              scenario.options.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.scenarioOption} onPress={() => handleScenarioChoice(opt)}>
                  <Text style={styles.scenarioOptionText}>{opt.text}</Text>
                  <Text style={styles.scenarioChance}>{Math.round(opt.successChance * 100)}% success</Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <View style={styles.scenarioResult}>
                  <Text style={[styles.scenarioResultText, { color: scenarioResult.success ? colors.success : colors.accent }]}>
                    {scenarioResult.success ? '✓ SUCCESS' : '✗ FAILED'}
                  </Text>
                  {scenarioResult.outcome.cash && (
                    <Text style={{ color: scenarioResult.outcome.cash > 0 ? colors.success : colors.accent, fontSize: 16 }}>
                      {scenarioResult.outcome.cash > 0 ? '+' : ''}{formatCurrency(scenarioResult.outcome.cash)}
                    </Text>
                  )}
                  {scenarioResult.outcome.reputation && (
                    <Text style={{ color: scenarioResult.outcome.reputation > 0 ? colors.success : colors.accent }}>
                      Reputation {scenarioResult.outcome.reputation > 0 ? '+' : ''}{scenarioResult.outcome.reputation}
                    </Text>
                  )}
                  {scenarioResult.outcome.morale && (
                    <Text style={{ color: scenarioResult.outcome.morale > 0 ? colors.success : colors.accent }}>
                      Morale {scenarioResult.outcome.morale > 0 ? '+' : ''}{scenarioResult.outcome.morale}
                    </Text>
                  )}
                </View>
                
                {/* AI Commentary */}
                <View style={styles.aiCommentBox}>
                  <Text style={styles.aiCommentLabel}>👨‍🍳 Chef Marcus</Text>
                  {aiLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.aiCommentText}>{aiMessage}</Text>
                  )}
                </View>
                
                <View style={styles.lessonBox}>
                  <Text style={styles.lessonLabel}>💡 LESSON LEARNED</Text>
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
  // RENDER - GAME OVER
  // ============================================
  if (screen === 'gameover') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.endContainer}>
          <Text style={{ fontSize: 64 }}>💀</Text>
          <Text style={styles.endTitle}>86'd</Text>
          <Text style={styles.endSubtitle}>Your restaurant has closed</Text>
          <View style={[styles.endDivider, { backgroundColor: colors.accent }]} />
          <Text style={styles.endMessage}>You made it {game?.week} weeks</Text>
          <View style={styles.endStats}>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game?.totalRevenue || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Profit/Loss</Text><Text style={[styles.endStatValue, { color: game?.totalProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game?.totalProfit || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Customers Served</Text><Text style={styles.endStatValue}>{(game?.customersServed?.total || 0).toLocaleString()}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Peak Staff</Text><Text style={styles.endStatValue}>{game?.staff?.length || 0}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game?.achievements?.length || 0}/{Object.keys(ACHIEVEMENTS).length}</Text></View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={restart}>
            <Text style={styles.restartButtonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - WIN SCREEN
  // ============================================
  if (screen === 'win') {
    const goal = GOALS.find(g => g.id === setup.goal);
    const valuation = game ? calculateValuation(game, setup) : 0;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.endContainer}>
          <Text style={{ fontSize: 64 }}>🏆</Text>
          <Text style={[styles.endTitle, { color: colors.success }]}>SUCCESS!</Text>
          <Text style={styles.endSubtitle}>You achieved your goal</Text>
          <View style={[styles.endDivider, { backgroundColor: colors.success }]} />
          <Text style={styles.winCondition}>{goal?.name}: {goal?.desc}</Text>
          <View style={styles.endStats}>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Weeks Survived</Text><Text style={styles.endStatValue}>{game?.week}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Final Cash</Text><Text style={styles.endStatValue}>{formatCurrency(game?.cash || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Restaurant Valuation</Text><Text style={[styles.endStatValue, { color: colors.success }]}>{formatCurrency(valuation)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game?.totalRevenue || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Customers Served</Text><Text style={styles.endStatValue}>{(game?.customersServed?.total || 0).toLocaleString()}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game?.achievements?.length || 0}/{Object.keys(ACHIEVEMENTS).length}</Text></View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={restart}>
            <Text style={styles.restartButtonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - DASHBOARD
  // ============================================
  if (screen === 'dashboard' && game) {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const isLowCash = game.cash < setup.capital * 0.1;
    const isHighBurnout = game.burnout > 70;
    const isLowMorale = game.morale < 40;
    const valuation = calculateValuation(game, setup);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.dashHeader}>
          <View>
            <Text style={styles.dashTitle}>{setup.name || cuisine?.name}</Text>
            <Text style={styles.dashSubtitle}>Week {game.week} • {cuisine?.icon} {cuisine?.name}</Text>
          </View>
          <TouchableOpacity style={styles.nextWeekButton} onPress={processWeek}>
            <Text style={styles.nextWeekText}>Next Week →</Text>
          </TouchableOpacity>
        </View>

        {/* Warnings */}
        {(isLowCash || isHighBurnout || isLowMorale) && (
          <View style={styles.warningBanner}>
            {isLowCash && <Text style={styles.warningText}>⚠️ Low Cash</Text>}
            {isHighBurnout && <Text style={styles.warningText}>⚠️ Burnout</Text>}
            {isLowMorale && <Text style={styles.warningText}>⚠️ Low Morale</Text>}
          </View>
        )}

        {/* AI Message Bar */}
        {aiMessage && (
          <TouchableOpacity style={styles.aiMessageBar} onPress={() => setAiChatModal(true)}>
            <Text style={styles.aiMessageIcon}>👨‍🍳</Text>
            <Text style={styles.aiMessageText} numberOfLines={2}>{aiLoading ? 'Thinking...' : aiMessage}</Text>
            <Text style={styles.aiMessageExpand}>💬</Text>
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['overview', 'menu', 'staff', 'ops', 'finance', 'achieve'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'overview' ? '📊' : tab === 'menu' ? '🍽️' : tab === 'staff' ? '👥' : tab === 'ops' ? '⚙️' : tab === 'finance' ? '💰' : '🏆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.dashContent}>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <View style={styles.cashDisplay}>
                <Text style={styles.cashLabel}>CASH ON HAND</Text>
                <Text style={[styles.cashAmount, { color: game.cash < 0 ? colors.accent : colors.textPrimary }]}>{formatCurrency(game.cash)}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}><Text style={styles.statLabel}>LAST WEEK</Text><Text style={[styles.statValue, { color: game.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.lastWeekProfit)}</Text></View>
                  <View style={styles.statItem}><Text style={styles.statLabel}>REPUTATION</Text><Text style={styles.statValue}>{game.reputation}%</Text></View>
                  <View style={styles.statItem}><Text style={styles.statLabel}>COVERS/WK</Text><Text style={styles.statValue}>{game.lastWeekCovers || game.covers}</Text></View>
                </View>
                {game.weeklyHistory.length > 1 && <MiniChart data={game.weeklyHistory.map(w => w.profit)} color={colors.success} />}
              </View>

              {/* Health Meters */}
              <View style={styles.metersRow}>
                <View style={styles.meterCard}>
                  <Text style={styles.meterLabel}>Burnout</Text>
                  <View style={styles.meterBarBg}><View style={[styles.meterBar, { width: `${game.burnout}%`, backgroundColor: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]} /></View>
                  <Text style={styles.meterValue}>{game.burnout}%</Text>
                </View>
                <View style={styles.meterCard}>
                  <Text style={styles.meterLabel}>Team Morale</Text>
                  <View style={styles.meterBarBg}><View style={[styles.meterBar, { width: `${game.morale}%`, backgroundColor: game.morale < 40 ? colors.accent : game.morale < 60 ? colors.warning : colors.success }]} /></View>
                  <Text style={styles.meterValue}>{game.morale}%</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setMarketingModal(true)}>
                  <Text style={styles.quickActionIcon}>📣</Text><Text style={styles.quickActionLabel}>Marketing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setDeliveryModal(true)}>
                  <Text style={styles.quickActionIcon}>🛵</Text><Text style={styles.quickActionLabel}>Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setLoanModal(true)}>
                  <Text style={styles.quickActionIcon}>🏦</Text><Text style={styles.quickActionLabel}>Financing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setPnlModal(true)}>
                  <Text style={styles.quickActionIcon}>📈</Text><Text style={styles.quickActionLabel}>P&L</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setAnalyticsModal(true)}>
                  <Text style={styles.quickActionIcon}>📊</Text><Text style={styles.quickActionLabel}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={() => setSaveModal(true)}>
                  <Text style={styles.quickActionIcon}>💾</Text><Text style={styles.quickActionLabel}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* Active Systems */}
              <View style={styles.activeSystems}>
                {game.marketing.channels.length > 1 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>📣 {game.marketing.channels.length} channels</Text></View>}
                {game.delivery.platforms.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>🛵 {game.delivery.platforms.length} platforms</Text></View>}
                {game.virtualBrands.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>👻 {game.virtualBrands.length} brands</Text></View>}
                {game.equipment.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>⚙️ {game.equipment.length} equipment</Text></View>}
                {game.loans.length > 0 && <View style={[styles.activeBadge, { backgroundColor: colors.accent + '30' }]}><Text style={styles.activeBadgeText}>💳 {game.loans.length} loans</Text></View>}
              </View>
            </>
          )}

          {/* MENU TAB */}
          {activeTab === 'menu' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>MENU ({game.menu.length} items)</Text>
                <TouchableOpacity style={styles.addButton} onPress={addMenuItem}><Text style={styles.addButtonText}>+ Add Item</Text></TouchableOpacity>
              </View>
              {game.menu.map(item => (
                <View key={item.id} style={[styles.menuItem, item.is86d && styles.menuItem86d]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemName}>{item.name} {item.popular && '⭐'}</Text>
                    <Text style={styles.menuItemStats}>{formatCurrency(item.price)} • Cost: {formatPct(item.cost / item.price)} • Margin: {formatPct(1 - item.cost / item.price)}</Text>
                  </View>
                  {item.is86d && <Text style={styles.tag86d}>86'd</Text>}
                  <TouchableOpacity style={styles.menuAction} onPress={() => toggle86(item.id)}>
                    <Text style={styles.menuActionText}>{item.is86d ? '✓' : '✗'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.menuSummary}>
                <Text style={styles.menuSummaryText}>Avg Ticket: {formatCurrency(game.avgTicket)} • Food Cost: {formatPct(game.foodCostPct)}</Text>
              </View>
            </>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TEAM ({game.staff.length})</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setStaffModal(true)}><Text style={styles.addButtonText}>+ Hire</Text></TouchableOpacity>
              </View>
              {game.staff.map(s => (
                <View key={s.id} style={styles.staffCard}>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffIcon}>{s.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.staffName}>{s.name}</Text>
                      <Text style={styles.staffRole}>{s.role} • Skill {s.skill}/10 • ${s.wage}/hr • {s.weeks}wks</Text>
                      <View style={styles.staffMoraleBar}><View style={[styles.staffMoraleFill, { width: `${s.morale}%`, backgroundColor: s.morale < 40 ? colors.accent : s.morale < 60 ? colors.warning : colors.success }]} /></View>
                      {s.training.length > 0 && <Text style={styles.certBadge}>{s.training.map(t => TRAINING_PROGRAMS.find(p => p.id === t)?.cert).join(', ')}</Text>}
                    </View>
                  </View>
                  <View style={styles.staffActions}>
                    <TouchableOpacity onPress={() => { setSelectedStaff(s); setTrainingModal(true); }}><Text style={{ color: colors.info, fontSize: 18 }}>📚</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => giveRaise(s.id, 2)}><Text style={{ color: colors.success, fontSize: 18 }}>💵</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.fireButton} onPress={() => fireStaff(s.id)}><Text style={styles.fireButtonText}>Fire</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.laborSummary}>
                <Text style={styles.laborSummaryText}>Weekly Labor: {formatCurrency(game.staff.reduce((sum, s) => sum + s.wage * 40, 0))} • Avg Morale: {game.morale}%</Text>
              </View>
            </>
          )}

          {/* OPS TAB */}
          {activeTab === 'ops' && (
            <>
              <Text style={styles.sectionTitle}>EQUIPMENT</Text>
              <View style={styles.equipmentGrid}>
                {EQUIPMENT.map(eq => {
                  const owned = game.equipment.includes(eq.id);
                  return (
                    <TouchableOpacity key={eq.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => buyEquipment(eq)} disabled={owned || game.cash < eq.cost}>
                      <Text style={{ fontSize: 24 }}>{eq.icon}</Text>
                      <Text style={styles.equipName}>{eq.name}</Text>
                      <Text style={styles.equipCost}>{owned ? '✓ Owned' : formatCurrency(eq.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>UPGRADES</Text>
              <View style={styles.equipmentGrid}>
                {UPGRADES.map(up => {
                  const owned = game.upgrades.includes(up.id);
                  return (
                    <TouchableOpacity key={up.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => buyUpgrade(up)} disabled={owned || game.cash < up.cost}>
                      <Text style={{ fontSize: 24 }}>{up.icon}</Text>
                      <Text style={styles.equipName}>{up.name}</Text>
                      <Text style={styles.equipCost}>{owned ? '✓ Done' : formatCurrency(up.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>VIRTUAL BRANDS</Text>
              <View style={styles.equipmentGrid}>
                {VIRTUAL_BRANDS.map(vb => {
                  const active = game.virtualBrands.includes(vb.id);
                  return (
                    <TouchableOpacity key={vb.id} style={[styles.equipCard, active && styles.equipCardOwned]} onPress={() => launchVirtualBrand(vb.id)} disabled={active || game.cash < vb.setupCost}>
                      <Text style={{ fontSize: 24 }}>{vb.icon}</Text>
                      <Text style={styles.equipName}>{vb.name}</Text>
                      <Text style={styles.equipCost}>{active ? '✓ Active' : formatCurrency(vb.setupCost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <>
              <View style={styles.financeCard}>
                <Text style={styles.financeTitle}>Business Valuation</Text>
                <Text style={styles.financeValue}>{formatCurrency(valuation)}</Text>
                <Text style={styles.financeDesc}>Based on revenue, reputation & assets</Text>
              </View>

              <View style={styles.financeCard}>
                <Text style={styles.financeTitle}>Weekly P&L Summary</Text>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Revenue</Text><Text style={[styles.pnlValue, { color: colors.success }]}>{formatCurrency(game.lastWeekRevenue)}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Food Cost</Text><Text style={styles.pnlValue}>-{formatCurrency(game.lastWeekCosts.food || 0)}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Labor</Text><Text style={styles.pnlValue}>-{formatCurrency(game.lastWeekCosts.labor || 0)}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Rent</Text><Text style={styles.pnlValue}>-{formatCurrency(game.lastWeekCosts.rent || 0)}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Other</Text><Text style={styles.pnlValue}>-{formatCurrency((game.lastWeekCosts.utilities || 0) + (game.lastWeekCosts.marketing || 0) + (game.lastWeekCosts.ccFees || 0))}</Text></View>
                <View style={[styles.pnlRow, styles.pnlTotalRow]}><Text style={styles.pnlTotalLabel}>Net Profit</Text><Text style={[styles.pnlTotalValue, { color: game.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.lastWeekProfit)}</Text></View>
              </View>

              {game.loans.length > 0 && (
                <View style={styles.financeCard}>
                  <Text style={styles.financeTitle}>Active Loans</Text>
                  {game.loans.map((loan, i) => {
                    const loanData = LOANS.find(l => l.id === loan.type);
                    return (
                      <View key={i} style={styles.loanItem}>
                        <Text style={styles.loanName}>{loanData?.name}</Text>
                        <Text style={styles.loanDetails}>{formatCurrency(loanData?.weeklyPayment || 0)}/wk • {loan.remaining} weeks left</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.financeCard}>
                <Text style={styles.financeTitle}>Key Ratios</Text>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Food Cost %</Text><Text style={styles.pnlValue}>{formatPct(game.foodCostPct)}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Labor Cost %</Text><Text style={styles.pnlValue}>{formatPct(game.staff.reduce((sum, s) => sum + s.wage * 40, 0) / Math.max(1, game.lastWeekRevenue))}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Prime Cost</Text><Text style={styles.pnlValue}>{formatPct(game.foodCostPct + game.staff.reduce((sum, s) => sum + s.wage * 40, 0) / Math.max(1, game.lastWeekRevenue))}</Text></View>
                <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Profit Margin</Text><Text style={[styles.pnlValue, { color: game.lastWeekProfit / game.lastWeekRevenue > 0.1 ? colors.success : colors.warning }]}>{formatPct(game.lastWeekProfit / Math.max(1, game.lastWeekRevenue))}</Text></View>
              </View>
            </>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achieve' && (
            <>
              <View style={styles.achieveHeader}>
                <Text style={styles.achieveScore}>{game.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</Text>
                <Text style={styles.achieveLabel}>Achievements Unlocked</Text>
              </View>
              {Object.entries(
                Object.entries(ACHIEVEMENTS).reduce((acc, [id, ach]) => {
                  const cat = ach.category || 'other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push({ id, ...ach });
                  return acc;
                }, {})
              ).map(([cat, achs]) => (
                <View key={cat} style={{ marginBottom: 16 }}>
                  <Text style={styles.achieveCategory}>{cat.toUpperCase()}</Text>
                  <View style={styles.achieveGrid}>
                    {achs.map(ach => {
                      const unlocked = game.achievements.includes(ach.id);
                      return (
                        <View key={ach.id} style={[styles.achieveBadge, unlocked && styles.achieveBadgeUnlocked]}>
                          <Text style={{ fontSize: 24, opacity: unlocked ? 1 : 0.3 }}>{ach.icon}</Text>
                          <Text style={[styles.achieveName, { opacity: unlocked ? 1 : 0.5 }]}>{ach.name}</Text>
                          <Text style={styles.achieveDesc}>{ach.desc}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* MODALS */}
        
        {/* Staff Hire Modal */}
        <Modal visible={staffModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>Hire Staff</Text><TouchableOpacity onPress={() => setStaffModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                {STAFF_TEMPLATES.map(t => (
                  <TouchableOpacity key={t.role} style={styles.hireOption} onPress={() => hireStaff(t)} disabled={game.cash < t.wage * 40}>
                    <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.hireName}>{t.role}</Text>
                      <Text style={styles.hireDetails}>${t.wage}/hr • {t.department} • Max skill: {t.skillCap}</Text>
                    </View>
                    <Text style={{ color: game.cash >= t.wage * 40 ? colors.success : colors.accent }}>{formatCurrency(t.wage * 40)}</Text>
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
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>Train {selectedStaff?.name}</Text><TouchableOpacity onPress={() => { setTrainingModal(false); setSelectedStaff(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                {TRAINING_PROGRAMS.map(p => {
                  const alreadyHas = selectedStaff?.training?.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={styles.hireOption} onPress={() => startTraining(p)} disabled={alreadyHas || game.cash < p.cost}>
                      <Text style={{ fontSize: 24 }}>{p.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.hireName}>{p.name}</Text>
                        <Text style={styles.hireDetails}>{formatCurrency(p.cost)} • {p.weeks} wk • +{p.skillBoost} skill • +{p.morale} morale</Text>
                        {p.cert && <Text style={{ color: colors.info, fontSize: 11 }}>Earns: {p.cert}</Text>}
                      </View>
                      <Text style={{ color: alreadyHas ? colors.success : colors.textMuted }}>{alreadyHas ? '✓' : '→'}</Text>
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
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>📣 Marketing</Text><TouchableOpacity onPress={() => setMarketingModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                {MARKETING_CHANNELS.map(c => {
                  const active = game.marketing.channels.includes(c.id);
                  return (
                    <TouchableOpacity key={c.id} style={[styles.channelItem, active && styles.channelItemActive]} onPress={() => toggleMarketingChannel(c.id)}>
                      <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.channelName}>{c.name}</Text>
                        <Text style={styles.channelCost}>{c.costPerWeek > 0 ? `${formatCurrency(c.costPerWeek)}/week` : 'Free'}</Text>
                      </View>
                      <Text style={{ color: active ? colors.success : colors.textMuted }}>{active ? '✓ Active' : 'Enable'}</Text>
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
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>🛵 Delivery</Text><TouchableOpacity onPress={() => setDeliveryModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                {DELIVERY_PLATFORMS.map(p => {
                  const active = game.delivery.platforms.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.channelItem, active && styles.channelItemActive]} onPress={() => toggleDeliveryPlatform(p.id)} disabled={!active && game.cash < p.setup}>
                      <Text style={{ fontSize: 20 }}>{p.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.channelName}>{p.name}</Text>
                        <Text style={styles.channelCost}>{Math.round(p.commission * 100)}% commission • {p.setup > 0 ? `${formatCurrency(p.setup)} setup` : 'No setup'}</Text>
                      </View>
                      <Text style={{ color: active ? colors.success : game.cash < p.setup ? colors.accent : colors.textMuted }}>{active ? '✓ Active' : game.cash < p.setup ? "Can't afford" : 'Enable'}</Text>
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
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>🏦 Financing</Text><TouchableOpacity onPress={() => setLoanModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                <Text style={styles.loanWarning}>⚠️ Debt is a tool. Use wisely. Weekly payments come out automatically.</Text>
                {LOANS.map(l => (
                  <TouchableOpacity key={l.id} style={[styles.channelItem, l.id === 'predatory' && { borderColor: colors.accent, borderWidth: 1 }]} onPress={() => takeLoan(l.id)}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.channelName, l.id === 'predatory' && { color: colors.accent }]}>{l.name}</Text>
                      <Text style={styles.channelCost}>{formatCurrency(l.amount)} • {Math.round(l.rate * 100)}% APR • {formatCurrency(l.weeklyPayment)}/wk for {l.term} wks</Text>
                      {l.equity && <Text style={{ color: colors.warning, fontSize: 11 }}>Gives up {l.equity * 100}% equity</Text>}
                    </View>
                    <Text style={{ color: colors.success }}>Get Funds</Text>
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
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>📊 Analytics</Text><TouchableOpacity onPress={() => setAnalyticsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <ScrollView style={{ padding: 16 }}>
                <View style={styles.analyticsCard}><Text style={styles.analyticsTitle}>Revenue Trend</Text><MiniChart data={game.weeklyHistory.map(w => w.revenue)} color={colors.primary} height={60} /></View>
                <View style={styles.analyticsCard}><Text style={styles.analyticsTitle}>Profit Trend</Text><MiniChart data={game.weeklyHistory.map(w => w.profit)} color={colors.success} height={60} /></View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Key Metrics</Text>
                  <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Total Revenue</Text><Text style={styles.pnlValue}>{formatCurrency(game.totalRevenue)}</Text></View>
                  <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Total Profit</Text><Text style={[styles.pnlValue, { color: game.totalProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.totalProfit)}</Text></View>
                  <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Customers Served</Text><Text style={styles.pnlValue}>{game.customersServed.total.toLocaleString()}</Text></View>
                  <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Delivery Orders</Text><Text style={styles.pnlValue}>{game.delivery.orders}</Text></View>
                  <View style={styles.pnlRow}><Text style={styles.pnlLabel}>Profit Streak</Text><Text style={styles.pnlValue}>{game.profitStreak} weeks</Text></View>
                </View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Customer Mix</Text>
                  {Object.entries(game.customersServed.byType || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => {
                    const ct = CUSTOMER_TYPES.find(c => c.id === type);
                    const pct = game.customersServed.total > 0 ? (count / game.customersServed.total * 100).toFixed(1) : 0;
                    return ct ? <View key={type} style={styles.pnlRow}><Text style={styles.pnlLabel}>{ct.icon} {ct.name}</Text><Text style={styles.pnlValue}>{count} ({pct}%)</Text></View> : null;
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AI Chat Modal */}
        <Modal visible={aiChatModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>👨‍🍳 Chef Marcus</Text><TouchableOpacity onPress={() => setAiChatModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <View style={{ padding: 16 }}>
                <View style={styles.aiChatBubble}>
                  {aiLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.aiChatText}>{aiMessage || "What's on your mind? Ask me anything about running your restaurant."}</Text>}
                </View>
                <View style={styles.aiInputRow}>
                  <TextInput style={styles.aiInput} placeholder="Ask Chef Marcus..." placeholderTextColor={colors.textMuted} value={aiChatInput} onChangeText={setAiChatInput} onSubmitEditing={askAI} />
                  <TouchableOpacity style={styles.aiSendButton} onPress={askAI}><Text style={styles.aiSendText}>Ask</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Save Modal */}
        <Modal visible={saveModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>💾 Save/Load</Text><TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
              <View style={{ padding: 16 }}>
                {[1, 2, 3].map(slot => {
                  const save = savedGames.find(s => s.slot === slot);
                  return (
                    <View key={slot} style={styles.saveSlot}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                        {save ? <Text style={styles.saveSlotInfo}>{save.setup.name} • Week {save.game.week} • {formatCurrency(save.game.cash)}</Text> : <Text style={styles.saveSlotInfo}>Empty</Text>}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => saveGame(slot)} style={[styles.saveButton, { backgroundColor: colors.primary }]}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
                        {save && <TouchableOpacity onPress={() => loadGame(save)} style={[styles.saveButton, { backgroundColor: colors.surface }]}><Text style={[styles.saveButtonText, { color: colors.textPrimary }]}>Load</Text></TouchableOpacity>}
                      </View>
                    </View>
                  );
                })}
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
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeTitle: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -4 },
  welcomeDivider: { width: 60, height: 3, backgroundColor: colors.primary, marginVertical: 16 },
  welcomeQuote: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', marginBottom: 8 },
  welcomeSubtext: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  startButton: { backgroundColor: colors.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: 8 },
  startButtonText: { color: colors.background, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  versionText: { position: 'absolute', bottom: 24, fontSize: 11, color: colors.textMuted },
  
  // Onboarding
  onboardingContainer: { flex: 1 },
  onboardingContent: { padding: 24, paddingTop: 16 },
  progressBarContainer: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  stepText: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  messageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24 },
  messageText: { fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  dropdownButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 16, color: colors.textPrimary },
  dropdownPlaceholder: { fontSize: 16, color: colors.textMuted },
  dropdownArrow: { color: colors.textMuted },
  selectedCuisine: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '20', padding: 16, borderRadius: 8, marginTop: 16 },
  selectedIcon: { fontSize: 36, marginRight: 12 },
  selectedName: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  selectedStats: { fontSize: 12, color: colors.textSecondary },
  capitalDisplay: { alignItems: 'center', marginBottom: 16 },
  capitalAmount: { fontSize: 48, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
  tierText: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: colors.background },
  tierDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, color: colors.textMuted },
  textInput: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, fontSize: 16, color: colors.textPrimary },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 8, alignItems: 'center' },
  optionButtonActive: { backgroundColor: colors.primary + '30', borderWidth: 2, borderColor: colors.primary },
  optionText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  optionTextActive: { color: colors.primary },
  optionDesc: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  goalOptions: { gap: 12 },
  goalButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8 },
  goalButtonActive: { backgroundColor: colors.primary + '20', borderWidth: 2, borderColor: colors.primary },
  goalText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  goalTextActive: { color: colors.primary },
  goalDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  continueButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  continueButtonDisabled: { backgroundColor: colors.surfaceLight },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  continueButtonTextDisabled: { color: colors.textMuted },
  backButton: { padding: 12, alignItems: 'center', marginTop: 8 },
  backButtonText: { color: colors.textMuted, fontSize: 14 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  modalClose: { fontSize: 24, color: colors.textMuted, padding: 4 },
  searchInput: { backgroundColor: colors.surfaceLight, margin: 16, marginTop: 8, padding: 12, borderRadius: 8, color: colors.textPrimary },
  cuisineList: { maxHeight: 400 },
  cuisineOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  cuisineOptionSelected: { backgroundColor: colors.primary + '20' },
  cuisineIcon: { fontSize: 28, marginRight: 12 },
  cuisineInfo: { flex: 1 },
  cuisineName: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  cuisineNameSelected: { color: colors.primary },
  cuisineStats: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  
  // Dashboard
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dashTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  dashSubtitle: { fontSize: 12, color: colors.textMuted },
  nextWeekButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  nextWeekText: { fontSize: 13, fontWeight: '600', color: colors.background },
  dashContent: { flex: 1, padding: 16 },
  warningBanner: { backgroundColor: colors.accent + '20', padding: 8, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  warningText: { color: colors.accent, fontSize: 12, fontWeight: '500' },
  
  // AI Message Bar
  aiMessageBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  aiMessageIcon: { fontSize: 20, marginRight: 8 },
  aiMessageText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  aiMessageExpand: { fontSize: 16 },
  
  // Tabs
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 16 },
  tabTextActive: { },
  
  // Cash Display
  cashDisplay: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 16 },
  cashLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  cashAmount: { fontSize: 36, fontWeight: '700', marginVertical: 4 },
  statsRow: { flexDirection: 'row', marginTop: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  
  // Meters
  metersRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  meterCard: { flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
  meterLabel: { fontSize: 12, color: colors.textSecondary },
  meterBarBg: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, marginTop: 6 },
  meterBar: { height: '100%', borderRadius: 3 },
  meterValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 4 },
  
  // Quick Actions
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickActionCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, width: (width - 48) / 3, alignItems: 'center' },
  quickActionIcon: { fontSize: 20 },
  quickActionLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4 },
  
  // Active Systems
  activeSystems: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  activeBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  activeBadgeText: { fontSize: 10, color: colors.textSecondary },
  
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: colors.background },
  
  // Menu
  menuItem: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  menuItem86d: { opacity: 0.5 },
  menuItemName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  menuItemStats: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  menuAction: { backgroundColor: colors.surfaceLight, width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  menuActionText: { fontSize: 12 },
  tag86d: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, color: colors.textPrimary, marginRight: 8 },
  menuSummary: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginTop: 8 },
  menuSummaryText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  
  // Staff
  staffCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  staffInfo: { flexDirection: 'row', alignItems: 'flex-start' },
  staffIcon: { fontSize: 24, marginRight: 10 },
  staffName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  staffRole: { fontSize: 11, color: colors.textMuted },
  staffMoraleBar: { height: 3, backgroundColor: colors.surfaceLight, borderRadius: 2, marginTop: 4, width: '60%' },
  staffMoraleFill: { height: '100%', borderRadius: 2 },
  certBadge: { backgroundColor: colors.info + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 9, color: colors.info, marginTop: 4, alignSelf: 'flex-start' },
  staffActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  fireButton: { backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  fireButtonText: { fontSize: 11, fontWeight: '500', color: colors.textPrimary },
  laborSummary: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginTop: 8 },
  laborSummaryText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  
  // Equipment
  equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  equipCard: { backgroundColor: colors.surface, padding: 10, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  equipCardOwned: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  equipName: { fontSize: 9, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  equipCost: { fontSize: 9, color: colors.textMuted },
  
  // Finance
  financeCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12 },
  financeTitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  financeValue: { fontSize: 28, fontWeight: '700', color: colors.success },
  financeDesc: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  pnlRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  pnlLabel: { fontSize: 13, color: colors.textSecondary },
  pnlValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  pnlTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 },
  pnlTotalLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  pnlTotalValue: { fontSize: 17, fontWeight: '700' },
  loanItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  loanName: { fontSize: 14, color: colors.textPrimary },
  loanDetails: { fontSize: 11, color: colors.textMuted },
  
  // Achievements
  achieveHeader: { alignItems: 'center', marginBottom: 20 },
  achieveScore: { fontSize: 48, fontWeight: '700', color: colors.primary },
  achieveLabel: { fontSize: 14, color: colors.textSecondary },
  achieveCategory: { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveBadge: { backgroundColor: colors.surface, padding: 8, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  achieveBadgeUnlocked: { backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary },
  achieveName: { fontSize: 10, color: colors.textPrimary, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  achieveDesc: { fontSize: 8, color: colors.textMuted, textAlign: 'center' },
  
  // Scenario
  scenarioContainer: { flex: 1 },
  scenarioContent: { padding: 24 },
  scenarioHeader: { alignItems: 'center', marginBottom: 8 },
  scenarioTypeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  scenarioTypeText: { fontSize: 10, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 },
  scenarioTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  scenarioSubtitle: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  scenarioMessageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 20 },
  scenarioMessage: { fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  scenarioOption: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scenarioOptionText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  scenarioChance: { fontSize: 12, color: colors.textMuted },
  scenarioResult: { alignItems: 'center', marginVertical: 20 },
  scenarioResultText: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  aiCommentBox: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, marginVertical: 16 },
  aiCommentLabel: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 8 },
  aiCommentText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  lessonBox: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, marginTop: 20 },
  lessonLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  lessonText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  
  // End Screens
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  endTitle: { fontSize: 28, fontWeight: '700', color: colors.accent },
  endSubtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  endDivider: { width: 60, height: 3, marginVertical: 24 },
  endMessage: { fontSize: 16, color: colors.textMuted, marginBottom: 24 },
  endStats: { width: '100%', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24 },
  endStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  endStatLabel: { fontSize: 14, color: colors.textSecondary },
  endStatValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  winCondition: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16, color: colors.textPrimary },
  restartButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  restartButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  
  // Modals
  hireOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  hireName: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  hireDetails: { fontSize: 11, color: colors.textMuted },
  channelItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  channelItemActive: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  channelName: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  channelCost: { fontSize: 11, color: colors.textMuted },
  loanWarning: { backgroundColor: colors.warning + '20', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: colors.warning },
  analyticsCard: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 12 },
  analyticsTitle: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  aiChatBubble: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, marginBottom: 16, minHeight: 80 },
  aiChatText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
  aiInputRow: { flexDirection: 'row', gap: 8 },
  aiInput: { flex: 1, backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, color: colors.textPrimary },
  aiSendButton: { backgroundColor: colors.primary, paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  aiSendText: { color: colors.background, fontWeight: '600' },
  saveSlot: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  saveSlotTitle: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  saveSlotInfo: { fontSize: 12, color: colors.textMuted },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  saveButtonText: { fontSize: 12, fontWeight: '500', color: colors.background },
});
