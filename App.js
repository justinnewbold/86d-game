import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Dimensions, Alert, Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

// ============================================
// CONSTANTS & DATA
// ============================================

const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
  info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

const formatCurrency = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
const formatPct = (v) => `${(v * 100).toFixed(1)}%`;

// 44 Cuisines
const CUISINES = [
  { id: 'burgers', name: 'Burgers & American', icon: '🍔', foodCost: 0.28, avgTicket: 14 },
  { id: 'mexican', name: 'Mexican', icon: '🌮', foodCost: 0.26, avgTicket: 12 },
  { id: 'pizza', name: 'Pizza & Italian-American', icon: '🍕', foodCost: 0.24, avgTicket: 18 },
  { id: 'chinese', name: 'Chinese', icon: '🥡', foodCost: 0.27, avgTicket: 13 },
  { id: 'japanese', name: 'Japanese', icon: '🍣', foodCost: 0.32, avgTicket: 22 },
  { id: 'thai', name: 'Thai', icon: '🍜', foodCost: 0.28, avgTicket: 15 },
  { id: 'indian', name: 'Indian', icon: '🍛', foodCost: 0.26, avgTicket: 16 },
  { id: 'korean', name: 'Korean', icon: '🥘', foodCost: 0.29, avgTicket: 18 },
  { id: 'vietnamese', name: 'Vietnamese', icon: '🍲', foodCost: 0.27, avgTicket: 14 },
  { id: 'mediterranean', name: 'Mediterranean', icon: '🥙', foodCost: 0.30, avgTicket: 15 },
  { id: 'greek', name: 'Greek', icon: '🫓', foodCost: 0.29, avgTicket: 16 },
  { id: 'french', name: 'French Fine Dining', icon: '🥐', foodCost: 0.32, avgTicket: 85 },
  { id: 'italian', name: 'Italian Fine Dining', icon: '🍝', foodCost: 0.28, avgTicket: 65 },
  { id: 'seafood', name: 'Seafood', icon: '🦞', foodCost: 0.35, avgTicket: 45 },
  { id: 'steakhouse', name: 'Steakhouse', icon: '🥩', foodCost: 0.38, avgTicket: 95 },
  { id: 'bbq', name: 'BBQ & Smokehouse', icon: '🍖', foodCost: 0.30, avgTicket: 18 },
  { id: 'wings', name: 'Wings', icon: '🍗', foodCost: 0.32, avgTicket: 16 },
  { id: 'southern', name: 'Southern & Soul Food', icon: '🧇', foodCost: 0.26, avgTicket: 14 },
  { id: 'cajun', name: 'Cajun & Creole', icon: '🦐', foodCost: 0.31, avgTicket: 17 },
  { id: 'caribbean', name: 'Caribbean', icon: '🥥', foodCost: 0.28, avgTicket: 15 },
  { id: 'brazilian', name: 'Brazilian Steakhouse', icon: '🥘', foodCost: 0.33, avgTicket: 75 },
  { id: 'peruvian', name: 'Peruvian', icon: '🐟', foodCost: 0.30, avgTicket: 18 },
  { id: 'cafe', name: 'Café & Coffee Shop', icon: '☕', foodCost: 0.22, avgTicket: 9 },
  { id: 'bakery', name: 'Bakery', icon: '🥯', foodCost: 0.25, avgTicket: 8 },
  { id: 'desserts', name: 'Desserts & Sweets', icon: '🧁', foodCost: 0.28, avgTicket: 10 },
  { id: 'icecream', name: 'Ice Cream & Frozen', icon: '🍦', foodCost: 0.24, avgTicket: 7 },
  { id: 'juice', name: 'Juice & Smoothie Bar', icon: '🥤', foodCost: 0.30, avgTicket: 11 },
  { id: 'vegan', name: 'Vegan & Plant-Based', icon: '🥗', foodCost: 0.32, avgTicket: 16 },
  { id: 'healthfood', name: 'Health Food & Bowls', icon: '🥬', foodCost: 0.34, avgTicket: 15 },
  { id: 'deli', name: 'Deli & Sandwiches', icon: '🥪', foodCost: 0.28, avgTicket: 12 },
  { id: 'hotdogs', name: 'Hot Dogs & Sausages', icon: '🌭', foodCost: 0.22, avgTicket: 9 },
  { id: 'ramen', name: 'Ramen', icon: '🍜', foodCost: 0.26, avgTicket: 15 },
  { id: 'pho', name: 'Pho & Noodles', icon: '🍲', foodCost: 0.25, avgTicket: 13 },
  { id: 'dimsum', name: 'Dim Sum', icon: '🥟', foodCost: 0.28, avgTicket: 20 },
  { id: 'sushi', name: 'Sushi Bar', icon: '🍱', foodCost: 0.34, avgTicket: 55 },
  { id: 'omakase', name: 'Omakase', icon: '🍣', foodCost: 0.38, avgTicket: 250 },
  { id: 'hibachi', name: 'Hibachi & Teppanyaki', icon: '🔥', foodCost: 0.30, avgTicket: 45 },
  { id: 'tapas', name: 'Tapas & Small Plates', icon: '🫒', foodCost: 0.29, avgTicket: 24 },
  { id: 'pub', name: 'Gastropub', icon: '🍺', foodCost: 0.28, avgTicket: 22 },
  { id: 'brunch', name: 'Brunch Spot', icon: '🥞', foodCost: 0.26, avgTicket: 18 },
  { id: 'foodtruck', name: 'Food Truck', icon: '🚚', foodCost: 0.26, avgTicket: 12 },
  { id: 'finedining', name: 'Modern Fine Dining', icon: '✨', foodCost: 0.30, avgTicket: 175 },
  { id: 'rooftop', name: 'Rooftop Bar & Grill', icon: '🌃', foodCost: 0.28, avgTicket: 55 },
  { id: 'hotel', name: 'Hotel Restaurant', icon: '🏨', foodCost: 0.32, avgTicket: 65 },
];

// Staff Templates with expanded training data
const STAFF_TEMPLATES = [
  { role: 'Line Cook', wage: 16, icon: '👨‍🍳', skills: ['grill', 'saute', 'fry'], maxSkill: 10 },
  { role: 'Prep Cook', wage: 14, icon: '🔪', skills: ['knife', 'prep', 'organization'], maxSkill: 8 },
  { role: 'Server', wage: 8, icon: '🍽️', skills: ['service', 'upselling', 'wine'], maxSkill: 10 },
  { role: 'Host', wage: 12, icon: '📋', skills: ['hospitality', 'reservation', 'multitask'], maxSkill: 7 },
  { role: 'Dishwasher', wage: 13, icon: '🧽', skills: ['speed', 'sanitation'], maxSkill: 5 },
  { role: 'Bartender', wage: 10, icon: '🍸', skills: ['mixology', 'speed', 'personality'], maxSkill: 10 },
  { role: 'Sous Chef', wage: 24, icon: '👨‍🍳', skills: ['leadership', 'allStations', 'plating'], maxSkill: 10 },
  { role: 'Executive Chef', wage: 35, icon: '👨‍🍳', skills: ['creativity', 'management', 'menuDev'], maxSkill: 10 },
  { role: 'GM', wage: 30, icon: '👔', skills: ['leadership', 'finance', 'operations'], maxSkill: 10 },
  { role: 'Sommelier', wage: 22, icon: '🍷', skills: ['wine', 'pairing', 'salesmanship'], maxSkill: 10 },
  { role: 'Manager', wage: 22, icon: '👔', skills: ['scheduling', 'training', 'problemSolving'], maxSkill: 9 },
  { role: 'Shift Lead', wage: 18, icon: '📊', skills: ['leadership', 'multitask', 'communication'], maxSkill: 8 },
];

// Training Programs
const TRAINING_PROGRAMS = [
  { id: 'food_safety', name: 'Food Safety Cert', icon: '🛡️', cost: 200, weeks: 1, skillBoost: 1, cert: 'ServSafe' },
  { id: 'wine_101', name: 'Wine Fundamentals', icon: '🍷', cost: 350, weeks: 2, skillBoost: 2, cert: 'Wine 101' },
  { id: 'leadership', name: 'Leadership Training', icon: '⭐', cost: 500, weeks: 3, skillBoost: 2, cert: 'Team Lead' },
  { id: 'advanced_cooking', name: 'Advanced Techniques', icon: '🔥', cost: 800, weeks: 4, skillBoost: 3, cert: 'Advanced Culinary' },
  { id: 'mixology', name: 'Mixology Mastery', icon: '🍹', cost: 400, weeks: 2, skillBoost: 2, cert: 'Certified Mixologist' },
  { id: 'customer_service', name: 'Service Excellence', icon: '💎', cost: 300, weeks: 2, skillBoost: 2, cert: 'Service Pro' },
  { id: 'management', name: 'Restaurant Management', icon: '📈', cost: 1200, weeks: 6, skillBoost: 3, cert: 'Certified Manager' },
  { id: 'cross_train', name: 'Cross-Training', icon: '🔄', cost: 150, weeks: 1, skillBoost: 1, cert: null },
];

// Customer Types
const CUSTOMER_TYPES = [
  { id: 'regular', name: 'Regular', icon: '😊', spendMod: 1.0, tipMod: 1.2, satisfactionImpact: 0.02, frequency: 0.4 },
  { id: 'first_timer', name: 'First Timer', icon: '🆕', spendMod: 0.9, tipMod: 1.0, satisfactionImpact: 0.05, frequency: 0.25 },
  { id: 'critic', name: 'Food Critic', icon: '📝', spendMod: 1.3, tipMod: 1.0, satisfactionImpact: 0.15, frequency: 0.02 },
  { id: 'influencer', name: 'Influencer', icon: '📱', spendMod: 0.8, tipMod: 0.9, satisfactionImpact: 0.1, frequency: 0.05 },
  { id: 'difficult', name: 'Difficult Guest', icon: '😤', spendMod: 1.1, tipMod: 0.7, satisfactionImpact: -0.05, frequency: 0.08 },
  { id: 'big_spender', name: 'Big Spender', icon: '💰', spendMod: 1.8, tipMod: 1.5, satisfactionImpact: 0.03, frequency: 0.05 },
  { id: 'date_night', name: 'Date Night', icon: '💕', spendMod: 1.4, tipMod: 1.3, satisfactionImpact: 0.02, frequency: 0.1 },
  { id: 'business', name: 'Business Lunch', icon: '💼', spendMod: 1.5, tipMod: 1.1, satisfactionImpact: 0.01, frequency: 0.08 },
  { id: 'family', name: 'Family Group', icon: '👨‍👩‍👧‍👦', spendMod: 1.2, tipMod: 1.0, satisfactionImpact: 0.01, frequency: 0.12 },
  { id: 'tourist', name: 'Tourist', icon: '🗺️', spendMod: 1.1, tipMod: 1.2, satisfactionImpact: 0.02, frequency: 0.1 },
];

// 50+ Achievements
const ACHIEVEMENTS = {
  // Survival
  first_week: { name: 'First Week', desc: 'Survive your first week', icon: '📅', category: 'survival' },
  first_month: { name: 'First Month', desc: 'Make it 4 weeks', icon: '🗓️', category: 'survival' },
  quarter: { name: 'Quarter In', desc: 'Survive 13 weeks', icon: '📊', category: 'survival' },
  half_year: { name: 'Halfway There', desc: 'Make it 26 weeks', icon: '⏳', category: 'survival' },
  survivor: { name: 'Survivor', desc: 'Complete year one (52 weeks)', icon: '🏆', category: 'survival' },
  two_years: { name: 'Established', desc: 'Run for 2 years', icon: '🎖️', category: 'survival' },
  
  // Financial
  first_profit: { name: 'In The Black', desc: 'First profitable week', icon: '💚', category: 'financial' },
  ten_k: { name: 'Five Figures', desc: 'Reach $10K cash', icon: '💵', category: 'financial' },
  fifty_k: { name: 'Cushion', desc: 'Reach $50K cash', icon: '💰', category: 'financial' },
  hundred_k: { name: 'Six Figures', desc: 'Reach $100K cash', icon: '🤑', category: 'financial' },
  quarter_mil: { name: 'Quarter Million', desc: 'Reach $250K cash', icon: '💎', category: 'financial' },
  half_mil: { name: 'Half Million', desc: 'Reach $500K cash', icon: '👑', category: 'financial' },
  millionaire: { name: 'Millionaire', desc: 'Reach $1M cash', icon: '🏰', category: 'financial' },
  debt_free: { name: 'Debt Free', desc: 'Pay off all loans', icon: '🆓', category: 'financial' },
  
  // Staff
  first_hire: { name: 'First Hire', desc: 'Hire your first employee', icon: '🤝', category: 'staff' },
  full_team: { name: 'Full House', desc: 'Have 10+ employees', icon: '👥', category: 'staff' },
  big_team: { name: 'Army', desc: 'Have 20+ employees', icon: '🏟️', category: 'staff' },
  loyal_employee: { name: 'Loyalty', desc: 'Keep someone 26+ weeks', icon: '💜', category: 'staff' },
  trainer: { name: 'Trainer', desc: 'Complete 5 training programs', icon: '🎓', category: 'staff' },
  certifier: { name: 'Certified Team', desc: 'Get 3 staff certified', icon: '📜', category: 'staff' },
  zero_turnover: { name: 'Zero Turnover', desc: 'No quits for 8 weeks', icon: '🔒', category: 'staff' },
  cross_trained: { name: 'Versatile', desc: 'Cross-train 3 employees', icon: '🔄', category: 'staff' },
  
  // Operations
  health_ace: { name: 'Health Ace', desc: 'Pass health inspection perfectly', icon: '✅', category: 'operations' },
  menu_master: { name: 'Menu Master', desc: 'Create 10 menu items', icon: '📋', category: 'operations' },
  eighty_sixed: { name: "86'd", desc: 'Run out of an item', icon: '🚫', category: 'operations' },
  bestseller: { name: 'Hit Dish', desc: 'Have a dish sell 100+ times', icon: '🌟', category: 'operations' },
  delivery_enabled: { name: 'Delivery Era', desc: 'Enable delivery apps', icon: '🛵', category: 'operations' },
  virtual_brand: { name: 'Ghost Kitchen', desc: 'Launch a virtual brand', icon: '👻', category: 'operations' },
  
  // Customer
  five_star: { name: 'Five Stars', desc: 'Reach 4.8+ rating', icon: '⭐', category: 'customer' },
  regular_crowd: { name: 'Regulars', desc: 'Serve 50 regular customers', icon: '😊', category: 'customer' },
  critic_approved: { name: 'Critic Approved', desc: 'Impress a food critic', icon: '📰', category: 'customer' },
  influencer_hit: { name: 'Viral', desc: 'Get featured by influencer', icon: '📱', category: 'customer' },
  difficult_handled: { name: 'Cool Head', desc: 'Handle 10 difficult guests', icon: '😤', category: 'customer' },
  big_spender_magnet: { name: 'Whale Watch', desc: 'Serve 20 big spenders', icon: '🐋', category: 'customer' },
  
  // Growth
  second_location: { name: 'Expansion', desc: 'Open second location', icon: '🏪', category: 'growth' },
  three_locations: { name: 'Chain', desc: 'Have 3 locations', icon: '🔗', category: 'growth' },
  five_locations: { name: 'Empire', desc: 'Build 5 locations', icon: '🏛️', category: 'growth' },
  investor_deal: { name: 'Funded', desc: 'Accept investor money', icon: '💼', category: 'growth' },
  
  // Resilience
  burnout_recovery: { name: 'Bounced Back', desc: 'Recover from 80%+ burnout', icon: '🔋', category: 'resilience' },
  bad_review_survivor: { name: 'Thick Skin', desc: 'Survive 5 bad reviews', icon: '🛡️', category: 'resilience' },
  equipment_survivor: { name: 'MacGyver', desc: 'Handle 3 equipment failures', icon: '🔧', category: 'resilience' },
  staff_drama_handler: { name: 'Mediator', desc: 'Resolve 5 staff conflicts', icon: '🕊️', category: 'resilience' },
  seasonal_survivor: { name: 'All Seasons', desc: 'Survive 2 seasonal slumps', icon: '🍂', category: 'resilience' },
  
  // Special
  no_debt_start: { name: 'Cash Only', desc: 'Start without taking loans', icon: '💪', category: 'special' },
  speed_profit: { name: 'Quick Start', desc: 'Profit in week 1', icon: '⚡', category: 'special' },
  low_burnout: { name: 'Zen Master', desc: 'Keep burnout under 30% for 10 weeks', icon: '🧘', category: 'special' },
  high_morale: { name: 'Happy Team', desc: 'Keep morale above 85% for 10 weeks', icon: '🎉', category: 'special' },
  perfect_week: { name: 'Perfect Week', desc: 'No incidents, profit, happy staff', icon: '✨', category: 'special' },
};

// Default menu items by cuisine
const getDefaultMenu = (cuisineId) => {
  const menus = {
    burgers: [
      { id: 1, name: 'Classic Burger', price: 12, cost: 3.20, category: 'entree', sold: 0, is86d: false },
      { id: 2, name: 'Bacon Cheeseburger', price: 15, cost: 4.50, category: 'entree', sold: 0, is86d: false },
      { id: 3, name: 'Veggie Burger', price: 13, cost: 3.80, category: 'entree', sold: 0, is86d: false },
      { id: 4, name: 'French Fries', price: 5, cost: 0.80, category: 'side', sold: 0, is86d: false },
      { id: 5, name: 'Onion Rings', price: 6, cost: 1.20, category: 'side', sold: 0, is86d: false },
      { id: 6, name: 'Milkshake', price: 7, cost: 1.50, category: 'drink', sold: 0, is86d: false },
    ],
    mexican: [
      { id: 1, name: 'Street Tacos (3)', price: 10, cost: 2.50, category: 'entree', sold: 0, is86d: false },
      { id: 2, name: 'Burrito', price: 12, cost: 3.00, category: 'entree', sold: 0, is86d: false },
      { id: 3, name: 'Quesadilla', price: 11, cost: 2.80, category: 'entree', sold: 0, is86d: false },
      { id: 4, name: 'Chips & Guac', price: 8, cost: 2.00, category: 'app', sold: 0, is86d: false },
      { id: 5, name: 'Churros', price: 6, cost: 1.00, category: 'dessert', sold: 0, is86d: false },
    ],
    pizza: [
      { id: 1, name: 'Margherita', price: 16, cost: 4.00, category: 'entree', sold: 0, is86d: false },
      { id: 2, name: 'Pepperoni', price: 18, cost: 4.50, category: 'entree', sold: 0, is86d: false },
      { id: 3, name: 'Supreme', price: 22, cost: 6.00, category: 'entree', sold: 0, is86d: false },
      { id: 4, name: 'Garlic Bread', price: 6, cost: 1.20, category: 'app', sold: 0, is86d: false },
      { id: 5, name: 'Caesar Salad', price: 9, cost: 2.00, category: 'app', sold: 0, is86d: false },
    ],
    steakhouse: [
      { id: 1, name: 'Ribeye 12oz', price: 48, cost: 18.00, category: 'entree', sold: 0, is86d: false },
      { id: 2, name: 'Filet Mignon', price: 55, cost: 22.00, category: 'entree', sold: 0, is86d: false },
      { id: 3, name: 'NY Strip', price: 45, cost: 16.00, category: 'entree', sold: 0, is86d: false },
      { id: 4, name: 'Lobster Tail', price: 38, cost: 15.00, category: 'add-on', sold: 0, is86d: false },
      { id: 5, name: 'Loaded Baked Potato', price: 12, cost: 2.50, category: 'side', sold: 0, is86d: false },
      { id: 6, name: 'Creamed Spinach', price: 10, cost: 2.00, category: 'side', sold: 0, is86d: false },
    ],
  };
  return menus[cuisineId] || [
    { id: 1, name: 'Signature Dish', price: 18, cost: 5.00, category: 'entree', sold: 0, is86d: false },
    { id: 2, name: 'House Special', price: 16, cost: 4.50, category: 'entree', sold: 0, is86d: false },
    { id: 3, name: 'Appetizer Platter', price: 12, cost: 3.00, category: 'app', sold: 0, is86d: false },
    { id: 4, name: 'Side Dish', price: 6, cost: 1.50, category: 'side', sold: 0, is86d: false },
    { id: 5, name: 'Dessert', price: 9, cost: 2.00, category: 'dessert', sold: 0, is86d: false },
  ];
};

const FIRST_NAMES = ['Mike', 'Sarah', 'Carlos', 'Kim', 'Deshawn', 'Maria', 'Jake', 'Ashley', 'Luis', 'Tanya', 'Brandon', 'Jasmine', 'Tyler', 'Nina', 'Marcus', 'Elena', 'Chris', 'Destiny', 'Omar', 'Brittany', 'Devon', 'Aaliyah', 'Jordan', 'Priya', 'Wei', 'Fatima'];
const generateName = () => FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];

// ============================================
// SCENARIOS
// ============================================

const SCENARIOS = {
  payroll_shock: {
    title: '💸 First Payroll Reality', type: 'lesson', week: 2, oneTime: true,
    getMessage: (d) => `Payday hit.\n\nBase wages: ${formatCurrency(d.wages)}\nActual: ${formatCurrency(d.actual)}\n\nExtra ${formatCurrency(d.diff)} = payroll taxes, insurance, workers comp.\n\nYour $16/hr cook costs ~$23/hr.`,
    options: [{ id: 'ok', text: "I'll factor this in", effects: {} }],
    lesson: 'Loaded labor cost adds 40-50% to base wages.',
  },
  no_show: {
    title: '🚨 Employee No-Show', type: 'crisis', minWeek: 3,
    getMessage: (d) => `4:30 PM. Dinner rush at 5:00.\n\n${d.name} texted:\n"Can't come in. ${d.excuse}"\n\nYou're short-staffed.`,
    options: [
      { id: 'work', text: 'Work the shift yourself', effects: { burnout: 18 } },
      { id: 'call', text: 'Call everyone', effects: { burnout: 8, cash: -50 } },
      { id: 'reduce', text: '86 half the menu', effects: { satisfaction: -0.15 } },
    ],
    lesson: "Build a deep roster. You can't be the only backup.",
  },
  health_inspection: {
    title: '🔍 Health Inspector', type: 'crisis', minWeek: 4,
    getMessage: () => `Health inspector just walked in.\n\nNo warning. Clipboard ready.\n\n"Routine inspection."`,
    options: [
      { id: 'confident', text: "We're ready.", effects: { satisfaction: 0.1 }, successChance: 0.7, fail: { cash: -500, satisfaction: -0.2 }, achievement: 'health_ace' },
      { id: 'stall', text: '"Let me get the manager..."', effects: { burnout: 5 }, successChance: 0.85, fail: { cash: -300 } },
    ],
    lesson: 'Always be inspection-ready.',
  },
  critic_visit: {
    title: '📝 Food Critic Spotted', type: 'crisis', minWeek: 8,
    getMessage: (d) => `Your host just whispered:\n\n"Table 12... I think that's ${d.name} from ${d.publication}."\n\nThe food critic is here. Unannounced.`,
    options: [
      { id: 'vip', text: 'VIP treatment - chef visits table', effects: { satisfaction: 0.15 }, successChance: 0.6, fail: { satisfaction: -0.1 }, achievement: 'critic_approved' },
      { id: 'normal', text: 'Treat them like any guest', effects: { satisfaction: 0.05 }, successChance: 0.8, fail: { satisfaction: -0.05 } },
      { id: 'comp', text: 'Comp their meal', effects: { cash: -150, satisfaction: 0.1 } },
    ],
    lesson: 'Critics want authenticity. Trying too hard can backfire.',
  },
  influencer_request: {
    title: '📱 Influencer DM', type: 'opportunity', minWeek: 6,
    getMessage: (d) => `Instagram DM:\n\n"Hey! I'm @${d.handle} (${d.followers} followers). Would love to feature your restaurant! Can I get a comped meal for content?"\n\nTheir engagement rate looks decent.`,
    options: [
      { id: 'yes', text: 'Comp the meal (~$80)', effects: { cash: -80, satisfaction: 0.08, revenue: 0.05 }, achievement: 'influencer_hit' },
      { id: 'half', text: 'Offer 50% off', effects: { cash: -40, satisfaction: 0.03 } },
      { id: 'no', text: 'Politely decline', effects: {} },
    ],
    lesson: 'Influencer ROI varies wildly. Micro-influencers often convert better.',
  },
  difficult_customer: {
    title: '😤 Difficult Guest', type: 'crisis', minWeek: 4,
    getMessage: (d) => `Table 7 is causing a scene.\n\n"${d.complaint}"\n\nOther guests are watching. Your server looks shaken.`,
    options: [
      { id: 'manager', text: 'Manager handles it personally', effects: { burnout: 5, satisfaction: 0.02 }, successChance: 0.7, fail: { satisfaction: -0.1 }, achievement: 'difficult_handled' },
      { id: 'comp', text: 'Comp their meal + dessert', effects: { cash: -60, satisfaction: -0.02 } },
      { id: 'stand', text: 'Stand your ground politely', effects: {}, successChance: 0.4, fail: { satisfaction: -0.15 } },
    ],
    lesson: 'Kill them with kindness, but know when to draw the line.',
  },
  regular_request: {
    title: '😊 Regular\'s Special Request', type: 'opportunity', minWeek: 6,
    getMessage: (d) => `${d.name}, one of your best regulars, pulls you aside:\n\n"${d.request}"\n\nThey've been coming every week for ${d.weeks} weeks.`,
    options: [
      { id: 'yes', text: 'Absolutely, happy to help', effects: { satisfaction: 0.05, morale: 3 } },
      { id: 'modified', text: 'Offer a compromise', effects: { satisfaction: 0.02 } },
      { id: 'no', text: 'Explain why you can\'t', effects: { satisfaction: -0.02 } },
    ],
    lesson: 'Regulars are your foundation. Treat them like gold.',
  },
  yelp_bomb: {
    title: '💣 1-Star Review', type: 'crisis', minWeek: 5,
    getMessage: (d) => `New Yelp review (1 star):\n\n"${d.review}"\n\n- ${d.reviewer}\n\nRating dropped to ${d.newRating}`,
    options: [
      { id: 'respond', text: 'Professional response', effects: { satisfaction: 0.05 } },
      { id: 'ignore', text: "Don't feed trolls", effects: {} },
    ],
    lesson: 'Your response matters more than the review.',
  },
  viral_moment: {
    title: '📱 Going Viral', type: 'opportunity', minWeek: 8,
    getMessage: (d) => `TikToker with ${d.followers} followers posted your food.\n\n"OMG THIS IS INSANE 🔥🔥🔥"\n\nViews: ${d.views}\n\nExpect a rush.`,
    options: [
      { id: 'prep', text: 'Prep extra (+$500)', effects: { cash: -500, revenue: 2500 } },
      { id: 'wing', text: 'Wing it', effects: { burnout: 20, satisfaction: -0.2, revenue: 1200 } },
    ],
    lesson: 'Viral moments need preparation.',
  },
  equipment_failure: {
    title: '⚙️ Equipment Down', type: 'crisis', minWeek: 8,
    getMessage: (d) => `Your ${d.equipment} died.\n\nAge: ${d.age} years\n\nRepair: ${formatCurrency(d.repair)}\nReplace: ${formatCurrency(d.replace)}`,
    options: [
      { id: 'repair', text: 'Repair', effects: { cash: -800 }, achievement: 'equipment_survivor' },
      { id: 'replace', text: 'Replace', effects: { cash: -3500 } },
      { id: 'workaround', text: 'Work around it', effects: { burnout: 10, satisfaction: -0.1 } },
    ],
    lesson: 'Old equipment repair = throwing money away.',
  },
  burnout_warning: {
    title: '🔥 Burnout Critical', type: 'warning', condition: (g) => g.burnout >= 75,
    getMessage: (d) => `BURNOUT: ${d.burnout}%\n\nThis week:\n• ${d.hours}+ hours worked\n• Snapped at ${d.snappedAt}\n• Forgot to ${d.forgot}`,
    options: [
      { id: 'promote', text: 'Promote shift lead (+$3/hr)', effects: { burnout: -30, weeklyLabor: 120 } },
      { id: 'dayoff', text: 'Take tomorrow off', effects: { burnout: -15 }, achievement: 'burnout_recovery' },
      { id: 'grind', text: 'I can handle it', effects: { burnout: 12, satisfaction: -0.1 } },
    ],
    lesson: 'Burnout is a business risk. Delegation is survival.',
  },
  staff_training_opportunity: {
    title: '🎓 Training Opportunity', type: 'opportunity', minWeek: 6,
    getMessage: (d) => `${d.name} approaches you:\n\n"I'd love to get my ${d.cert} certification. The course is ${formatCurrency(d.cost)} and takes ${d.weeks} week(s)."\n\nThey've been solid.`,
    options: [
      { id: 'pay', text: 'Company pays for it', effects: { cash: -d.cost, morale: 10 }, achievement: 'trainer' },
      { id: 'split', text: 'Split the cost 50/50', effects: { cash: -d.cost/2, morale: 5 } },
      { id: 'no', text: 'Not right now', effects: { morale: -5 } },
    ],
    lesson: 'Investing in your team pays dividends.',
  },
  item_86d: {
    title: '🚫 86\'d!', type: 'crisis', minWeek: 3,
    getMessage: (d) => `Kitchen just called out:\n\n"86 the ${d.item}!"\n\nYou're out of a key ingredient. ${d.orders} tables already ordered it tonight.`,
    options: [
      { id: 'sub', text: 'Offer substitute + discount', effects: { cash: -50, satisfaction: -0.05 }, achievement: 'eighty_sixed' },
      { id: 'honest', text: 'Be honest, offer alternatives', effects: { satisfaction: -0.08 } },
      { id: 'emergency', text: 'Emergency supply run ($$$)', effects: { cash: -150, burnout: 10 } },
    ],
    lesson: 'Inventory management prevents 86\'d embarrassments.',
  },
  good_review: {
    title: '⭐ Rave Review', type: 'opportunity', minWeek: 4,
    getMessage: (d) => `Google review (5 stars):\n\n"${d.review}"\n\n- ${d.reviewer}`,
    options: [
      { id: 'share', text: 'Share on social', effects: { satisfaction: 0.05, revenue: 0.03 } },
      { id: 'respond', text: 'Send thanks', effects: { satisfaction: 0.08 } },
    ],
    lesson: 'Celebrate wins. Respond to good reviews too.',
  },
  staff_conflict: {
    title: '😤 Staff Drama', type: 'crisis', minWeek: 5,
    getMessage: (d) => `${d.emp1} and ${d.emp2} aren't speaking.\n\nCause: ${d.cause}\n\nOther staff are picking sides.`,
    options: [
      { id: 'mediate', text: 'Sit them down together', effects: { burnout: 8 }, successChance: 0.6, fail: { morale: -10 }, achievement: 'staff_drama_handler' },
      { id: 'separate', text: 'Separate their shifts', effects: { morale: -5 } },
      { id: 'ignore', text: 'Let them work it out', effects: { morale: -15, satisfaction: -0.05 } },
    ],
    lesson: 'Drama spreads. Address conflicts fast.',
  },
};

const generateScenarioData = (id, game) => {
  const excuses = ['Car broke down', 'Family emergency', 'Food poisoning', 'Kid is sick'];
  const equipment = ['walk-in cooler', 'fryer', 'oven', 'dishwasher', 'ice machine'];
  const complaints = [
    "This is NOT what I ordered!", 
    "I've been waiting 45 minutes!",
    "There's a hair in my food!",
    "This steak is NOT medium-rare!"
  ];
  const requests = [
    "Could you make my usual but with extra ___? I know it's not on the menu.",
    "My anniversary is next week. Could you do something special?",
    "I'm bringing 20 people next Friday. Can you accommodate us?"
  ];
  const causes = ['scheduling dispute', 'someone called someone lazy', 'romantic drama', 'tip pool argument'];
  const menu = game.menu || [];
  
  switch(id) {
    case 'no_show': return { name: generateName(), excuse: excuses[Math.floor(Math.random() * excuses.length)] };
    case 'burnout_warning': return { burnout: game.burnout, hours: 65 + Math.floor(Math.random() * 15), snappedAt: 'your best server', forgot: 'place the food order' };
    case 'equipment_failure': return { equipment: equipment[Math.floor(Math.random() * equipment.length)], age: 5 + Math.floor(Math.random() * 5), repair: 600 + Math.floor(Math.random() * 400), replace: 2500 + Math.floor(Math.random() * 1500) };
    case 'yelp_bomb': return { review: 'Waited 45 minutes for cold food. Never again.', reviewer: generateName(), newRating: (game.satisfaction - 0.2).toFixed(1) };
    case 'viral_moment': return { followers: (50 + Math.floor(Math.random() * 150)) + 'K', views: (100 + Math.floor(Math.random() * 400)) + 'K' };
    case 'good_review': return { review: "Best meal I've had in years! Staff made us feel like family.", reviewer: generateName() };
    case 'payroll_shock': const wages = (game.staff?.length || 3) * 16 * 35; return { wages, actual: Math.round(wages * 1.45), diff: Math.round(wages * 0.45) };
    case 'critic_visit': return { name: ['James Beard', 'Amanda Cohen', 'Marcus Lee'][Math.floor(Math.random() * 3)], publication: ['City Paper', 'Food & Wine', 'Eater'][Math.floor(Math.random() * 3)] };
    case 'influencer_request': return { handle: 'foodie_' + generateName().toLowerCase(), followers: (5 + Math.floor(Math.random() * 45)) + 'K' };
    case 'difficult_customer': return { complaint: complaints[Math.floor(Math.random() * complaints.length)] };
    case 'regular_request': return { name: generateName(), request: requests[Math.floor(Math.random() * requests.length)], weeks: 8 + Math.floor(Math.random() * 12) };
    case 'staff_training_opportunity': const prog = TRAINING_PROGRAMS[Math.floor(Math.random() * TRAINING_PROGRAMS.length)]; return { name: generateName(), cert: prog.name, cost: prog.cost, weeks: prog.weeks };
    case 'item_86d': const item = menu.length > 0 ? menu[Math.floor(Math.random() * menu.length)] : { name: 'Signature Dish' }; return { item: item.name, orders: 2 + Math.floor(Math.random() * 4) };
    case 'staff_conflict': return { emp1: generateName(), emp2: generateName(), cause: causes[Math.floor(Math.random() * causes.length)] };
    default: return {};
  }
};

// ============================================
// COMPONENTS
// ============================================

const CuisineDropdown = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = CUISINES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selected = CUISINES.find(c => c.id === value);
  
  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdownButton}>
        {selected ? <Text style={styles.dropdownText}>{selected.icon} {selected.name}</Text> : <Text style={styles.dropdownPlaceholder}>Select cuisine...</Text>}
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cuisine</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.searchInput} placeholder="🔍 Search..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
            <ScrollView style={styles.cuisineList}>
              {filtered.map(c => (
                <TouchableOpacity key={c.id} onPress={() => { onChange(c.id); setModalVisible(false); setSearch(''); }} style={[styles.cuisineOption, value === c.id && styles.cuisineOptionSelected]}>
                  <Text style={styles.cuisineIcon}>{c.icon}</Text>
                  <View style={styles.cuisineInfo}>
                    <Text style={[styles.cuisineName, value === c.id && styles.cuisineNameSelected]}>{c.name}</Text>
                    <Text style={styles.cuisineStats}>~{Math.round(c.foodCost * 100)}% food • ${c.avgTicket} ticket</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  // Core State
  const [screen, setScreen] = useState('welcome');
  const [tab, setTab] = useState('overview');
  const [step, setStep] = useState(0);
  
  // Setup State
  const [cuisine, setCuisine] = useState(null);
  const [capital, setCapital] = useState(250000);
  const [city, setCity] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [exp, setExp] = useState(null);
  const [self, setSelf] = useState(null);
  const [goal, setGoal] = useState(null);
  
  // Game State
  const [game, setGame] = useState({
    week: 1, cash: 100000, revenue: 0, burnout: 20, satisfaction: 4.0, morale: 75,
    locations: 1, hasDelivery: false, hasVirtualBrand: false, hasLoan: false,
    foodCostMod: 0, laborMod: 0, monthlyRent: 4000, monthlyDebt: 0,
    staff: [], menu: [], completedScenarios: [], achievements: [], weeklyHistory: [],
    totalRevenue: 0, totalProfit: 0, customersServed: { total: 0, byType: {} },
    trainingInProgress: [], lowBurnoutWeeks: 0, highMoraleWeeks: 0, noIncidentWeeks: 0,
    badReviews: 0, equipmentFailures: 0, staffConflicts: 0, seasonalSlumps: 0, difficultGuests: 0,
  });
  
  // Scenario State
  const [scenario, setScenario] = useState(null);
  const [scenarioData, setScenarioData] = useState({});
  const [scenarioResult, setScenarioResult] = useState(null);
  
  // UI State
  const [text, setText] = useState('');
  const [full, setFull] = useState('');
  const [typing, setTyping] = useState(false);
  const [menuModal, setMenuModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [trainingModal, setTrainingModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [achievementModal, setAchievementModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  // Typewriter Effect
  useEffect(() => {
    if (full && typing && text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 12);
      return () => clearTimeout(t);
    } else if (text.length >= full.length) setTyping(false);
  }, [text, full, typing]);

  const type = (t) => { setFull(t); setText(''); setTyping(true); };

  const msgs = [
    "So you want to open a restaurant.\n\nI've seen hundreds try. Most fail within a year.\n\nBut some make it. Let's see if you're one of them.\n\nWhat kind of food?",
    "Good choice. Now—what are you going to call this place?",
    "How much capital do you have?\n\nBe honest. This determines everything.\n\n$10K to $5M+.",
    "Where are you opening?",
    "Do you have restaurant industry experience?",
    "Will you be running this yourself?",
    "Last question: What does success look like?",
  ];

  useEffect(() => { if (screen === 'onboarding') type(msgs[step]); }, [step, screen]);

  // Capital Tier
  const tier = () => {
    if (capital < 30000) return { l: 'HARD MODE', c: colors.accent, d: 'Food truck or ghost kitchen', staff: 2, rent: 1500 };
    if (capital < 75000) return { l: 'BOOTSTRAP', c: colors.warning, d: 'Tiny space, used equipment', staff: 3, rent: 2500 };
    if (capital < 150000) return { l: 'SCRAPPY', c: colors.warning, d: 'Small counter-service', staff: 4, rent: 3500 };
    if (capital < 300000) return { l: 'STANDARD', c: '#EAB308', d: 'Full restaurant buildout', staff: 6, rent: 5000 };
    if (capital < 500000) return { l: 'COMFORTABLE', c: '#84CC16', d: 'Quality buildout + marketing', staff: 8, rent: 7000 };
    if (capital < 1000000) return { l: 'WELL-FUNDED', c: colors.success, d: 'Prime location, full team', staff: 12, rent: 10000 };
    if (capital < 2000000) return { l: 'SERIOUS', c: colors.success, d: 'High-end concept', staff: 18, rent: 18000 };
    if (capital < 3500000) return { l: 'FLAGSHIP', c: '#22D3EE', d: 'Destination restaurant', staff: 25, rent: 28000 };
    return { l: 'EMPIRE', c: '#A855F7', d: 'Celebrity chef level', staff: 35, rent: 40000 };
  };

  // Initialize Game
  const initializeGame = () => {
    const t = tier();
    const staff = [];
    const roles = capital < 100000 ? ['Line Cook', 'Prep Cook', 'Server', 'Dishwasher'] : capital < 500000 ? ['Line Cook', 'Line Cook', 'Prep Cook', 'Server', 'Server', 'Host', 'Dishwasher', 'Bartender'] : ['Executive Chef', 'Sous Chef', 'Line Cook', 'Line Cook', 'Prep Cook', 'Server', 'Server', 'Server', 'Host', 'Bartender', 'Dishwasher', 'Manager'];
    
    for (let i = 0; i < Math.min(t.staff, roles.length); i++) {
      const template = STAFF_TEMPLATES.find(s => s.role === roles[i]) || STAFF_TEMPLATES[0];
      staff.push({
        id: i + 1, name: generateName(), role: template.role,
        wage: template.wage + Math.floor(Math.random() * 3),
        morale: 70 + Math.floor(Math.random() * 20),
        skill: 3 + Math.floor(Math.random() * 3), // 1-10 scale now
        weeksEmployed: 0, icon: template.icon,
        certifications: [], trainingProgress: null,
      });
    }
    
    const menu = getDefaultMenu(cuisine);
    
    setGame({
      week: 1, cash: capital, revenue: 0, burnout: self === 'yes' ? 25 : 15,
      satisfaction: 4.0, morale: 75, locations: 1, hasDelivery: false,
      hasVirtualBrand: false, hasLoan: false, foodCostMod: 0, laborMod: 0,
      monthlyRent: t.rent, monthlyDebt: 0, staff, menu,
      completedScenarios: [], achievements: [], weeklyHistory: [],
      totalRevenue: 0, totalProfit: 0, cuisine,
      customersServed: { total: 0, byType: {} },
      trainingInProgress: [], lowBurnoutWeeks: 0, highMoraleWeeks: 0, noIncidentWeeks: 0,
      badReviews: 0, equipmentFailures: 0, staffConflicts: 0, seasonalSlumps: 0, difficultGuests: 0,
    });
    setScreen('dashboard');
  };

  // Generate weekly customers
  const generateCustomers = (baseCovers) => {
    const customers = [];
    for (let i = 0; i < baseCovers; i++) {
      const rand = Math.random();
      let cumulative = 0;
      for (const type of CUSTOMER_TYPES) {
        cumulative += type.frequency;
        if (rand <= cumulative) {
          customers.push(type);
          break;
        }
      }
      if (customers.length <= i) customers.push(CUSTOMER_TYPES[0]); // Default to regular
    }
    return customers;
  };

  // Calculate Week
  const calculateWeek = () => {
    const g = game;
    const cuisineData = CUISINES.find(c => c.id === cuisine) || CUISINES[0];
    
    // Base covers affected by staff skill
    const avgSkill = g.staff.length > 0 ? g.staff.reduce((sum, s) => sum + s.skill, 0) / g.staff.length : 5;
    const skillMod = 0.8 + (avgSkill / 10) * 0.4; // 0.8 to 1.2 based on skill
    
    const baseCovers = Math.min(40 + (g.staff.length * 8), 200);
    const customers = generateCustomers(baseCovers);
    
    // Calculate revenue from customers and menu
    let weeklyRevenue = 0;
    const menuSales = {};
    const customerCounts = {};
    
    customers.forEach(customer => {
      customerCounts[customer.id] = (customerCounts[customer.id] || 0) + 1;
      
      // Each customer orders ~2-3 items
      const itemCount = 2 + Math.floor(Math.random() * 2);
      const availableMenu = g.menu.filter(m => !m.is86d);
      
      for (let i = 0; i < itemCount && availableMenu.length > 0; i++) {
        const item = availableMenu[Math.floor(Math.random() * availableMenu.length)];
        menuSales[item.id] = (menuSales[item.id] || 0) + 1;
        weeklyRevenue += item.price * customer.spendMod;
      }
    });
    
    // Apply modifiers
    const mods = (g.satisfaction >= 4.5 ? 1.2 : g.satisfaction >= 4 ? 1.1 : 1) * 
                 (g.morale >= 80 ? 1.1 : 1) * 
                 (1 + g.week * 0.005) * 
                 (0.9 + Math.random() * 0.2) * 
                 skillMod *
                 (g.hasDelivery ? 1.15 : 1) * 
                 (g.hasVirtualBrand ? 1.25 : 1);
    
    weeklyRevenue = Math.round(weeklyRevenue * mods * 6); // 6 days
    
    // Costs
    const menuFoodCost = g.menu.reduce((sum, item) => {
      const sold = menuSales[item.id] || 0;
      return sum + (item.cost * sold * 6);
    }, 0);
    const foodCost = Math.round(menuFoodCost * (1 + g.foodCostMod));
    
    const laborCost = Math.round(g.staff.reduce((sum, s) => sum + s.wage * 35 * 1.45, 0) * (1 + g.laborMod));
    const fixedCosts = g.monthlyRent / 4 + g.monthlyDebt / 4 + 400 + g.staff.length * 50 + 350;
    
    return {
      revenue: weeklyRevenue, foodCost, laborCost, fixedCosts,
      profit: weeklyRevenue - foodCost - laborCost - fixedCosts,
      foodCostPercent: weeklyRevenue > 0 ? foodCost / weeklyRevenue : 0,
      laborCostPercent: weeklyRevenue > 0 ? laborCost / weeklyRevenue : 0,
      menuSales, customerCounts, customers,
    };
  };

  // Advance Week
  const advanceWeek = () => {
    const weekly = calculateWeek();
    
    setGame(g => {
      // Update menu sales
      const updatedMenu = g.menu.map(item => ({
        ...item,
        sold: item.sold + (weekly.menuSales[item.id] || 0),
      }));
      
      // Update customer counts
      const updatedCustomers = { ...g.customersServed };
      updatedCustomers.total += weekly.customers.length;
      Object.entries(weekly.customerCounts).forEach(([type, count]) => {
        updatedCustomers.byType[type] = (updatedCustomers.byType[type] || 0) + count;
      });
      
      // Burnout calculation
      let newBurnout = g.burnout + (self === 'yes' && g.staff.length < 4 ? 6 : -4) + (weekly.profit < 0 ? 3 : 0);
      newBurnout = Math.max(0, Math.min(100, newBurnout));
      
      // Morale calculation
      let newMorale = g.morale + (weekly.profit > 0 ? 2 : 0) - (newBurnout > 70 ? 3 : 0);
      newMorale = Math.max(20, Math.min(100, newMorale));
      
      // Process training
      const updatedStaff = g.staff.map(s => {
        const updated = { ...s, weeksEmployed: s.weeksEmployed + 1 };
        if (s.trainingProgress) {
          updated.trainingProgress = {
            ...s.trainingProgress,
            weeksRemaining: s.trainingProgress.weeksRemaining - 1,
          };
          if (updated.trainingProgress.weeksRemaining <= 0) {
            const program = TRAINING_PROGRAMS.find(p => p.id === s.trainingProgress.programId);
            updated.skill = Math.min(10, s.skill + program.skillBoost);
            if (program.cert) {
              updated.certifications = [...(s.certifications || []), program.cert];
            }
            updated.trainingProgress = null;
          }
        }
        return updated;
      });
      
      // Track streaks
      const lowBurnoutWeeks = newBurnout < 30 ? g.lowBurnoutWeeks + 1 : 0;
      const highMoraleWeeks = newMorale > 85 ? g.highMoraleWeeks + 1 : 0;
      
      return {
        ...g,
        week: g.week + 1,
        cash: g.cash + weekly.profit,
        revenue: weekly.revenue,
        burnout: newBurnout,
        morale: newMorale,
        staff: updatedStaff,
        menu: updatedMenu,
        customersServed: updatedCustomers,
        weeklyHistory: [...g.weeklyHistory, { week: g.week, ...weekly }].slice(-52),
        totalRevenue: g.totalRevenue + weekly.revenue,
        totalProfit: g.totalProfit + weekly.profit,
        lowBurnoutWeeks,
        highMoraleWeeks,
      };
    });
    
    // Check achievements
    checkAchievements(weekly);
    
    // Check scenarios
    setTimeout(() => checkScenarios(), 100);
    
    // Check game end
    checkGameEnd(weekly);
  };

  // Check Achievements
  const checkAchievements = (weekly) => {
    setGame(g => {
      const newAch = [...g.achievements];
      const unlock = (id) => { if (!newAch.includes(id) && ACHIEVEMENTS[id]) newAch.push(id); };
      
      // Survival
      if (g.week >= 1) unlock('first_week');
      if (g.week >= 4) unlock('first_month');
      if (g.week >= 13) unlock('quarter');
      if (g.week >= 26) unlock('half_year');
      if (g.week >= 52) unlock('survivor');
      if (g.week >= 104) unlock('two_years');
      
      // Financial
      if (weekly.profit > 0) unlock('first_profit');
      if (g.cash >= 10000) unlock('ten_k');
      if (g.cash >= 50000) unlock('fifty_k');
      if (g.cash >= 100000) unlock('hundred_k');
      if (g.cash >= 250000) unlock('quarter_mil');
      if (g.cash >= 500000) unlock('half_mil');
      if (g.cash >= 1000000) unlock('millionaire');
      if (g.hasLoan === false && g.monthlyDebt === 0 && g.week > 1) unlock('debt_free');
      
      // Staff
      if (g.staff.length >= 1) unlock('first_hire');
      if (g.staff.length >= 10) unlock('full_team');
      if (g.staff.length >= 20) unlock('big_team');
      if (g.staff.some(s => s.weeksEmployed >= 26)) unlock('loyal_employee');
      const certCount = g.staff.filter(s => s.certifications?.length > 0).length;
      if (certCount >= 3) unlock('certifier');
      
      // Customer
      if (g.satisfaction >= 4.8) unlock('five_star');
      if ((g.customersServed.byType?.regular || 0) >= 50) unlock('regular_crowd');
      if ((g.customersServed.byType?.big_spender || 0) >= 20) unlock('big_spender_magnet');
      if (g.difficultGuests >= 10) unlock('difficult_handled');
      
      // Growth
      if (g.locations >= 2) unlock('second_location');
      if (g.locations >= 3) unlock('three_locations');
      if (g.locations >= 5) unlock('five_locations');
      
      // Resilience
      if (g.badReviews >= 5) unlock('bad_review_survivor');
      if (g.equipmentFailures >= 3) unlock('equipment_survivor');
      if (g.staffConflicts >= 5) unlock('staff_drama_handler');
      if (g.seasonalSlumps >= 2) unlock('seasonal_survivor');
      
      // Special
      if (g.lowBurnoutWeeks >= 10) unlock('low_burnout');
      if (g.highMoraleWeeks >= 10) unlock('high_morale');
      if (g.week === 1 && weekly.profit > 0) unlock('speed_profit');
      
      // Menu
      if (g.menu.length >= 10) unlock('menu_master');
      if (g.menu.some(m => m.sold >= 100)) unlock('bestseller');
      
      // Operations
      if (g.hasDelivery) unlock('delivery_enabled');
      if (g.hasVirtualBrand) unlock('virtual_brand');
      
      if (newAch.length > g.achievements.length) {
        return { ...g, achievements: newAch };
      }
      return g;
    });
  };

  // Check Scenarios
  const checkScenarios = () => {
    const g = game;
    const possible = Object.entries(SCENARIOS).filter(([id, s]) => {
      if (g.completedScenarios.includes(id) && s.oneTime) return false;
      if (s.minWeek && g.week < s.minWeek) return false;
      if (s.week && g.week !== s.week) return false;
      if (s.condition && !s.condition(g)) return false;
      return true;
    });
    
    if (possible.length > 0 && Math.random() < 0.4) {
      const [id] = possible[Math.floor(Math.random() * possible.length)];
      setScenarioData(generateScenarioData(id, game));
      setScenario(id);
      setScenarioResult(null);
      setScreen('scenario');
    }
  };

  // Handle Scenario Choice
  const handleScenarioChoice = (option) => {
    let effects = { ...option.effects };
    let success = true;
    
    if (option.successChance !== undefined) {
      success = Math.random() < option.successChance;
      if (!success && option.fail) effects = { ...option.fail };
    }
    
    setGame(g => {
      const u = { ...g };
      if (effects.burnout) u.burnout = Math.max(0, Math.min(100, g.burnout + effects.burnout));
      if (effects.cash) u.cash = g.cash + effects.cash;
      if (effects.satisfaction) u.satisfaction = Math.max(1, Math.min(5, g.satisfaction + effects.satisfaction));
      if (effects.morale) u.morale = Math.max(20, Math.min(100, g.morale + effects.morale));
      if (effects.revenue) u.cash += effects.revenue;
      if (effects.foodCostMod) u.foodCostMod = g.foodCostMod + effects.foodCostMod;
      if (effects.laborMod) u.laborMod = g.laborMod + effects.laborMod;
      if (effects.weeklyLabor) u.laborMod = g.laborMod + effects.weeklyLabor / 2000;
      if (effects.hasDelivery) u.hasDelivery = true;
      if (effects.hasVirtualBrand) u.hasVirtualBrand = true;
      
      // Track scenario stats
      if (scenario === 'yelp_bomb') u.badReviews = (g.badReviews || 0) + 1;
      if (scenario === 'equipment_failure') u.equipmentFailures = (g.equipmentFailures || 0) + 1;
      if (scenario === 'staff_conflict') u.staffConflicts = (g.staffConflicts || 0) + 1;
      if (scenario === 'difficult_customer' && success) u.difficultGuests = (g.difficultGuests || 0) + 1;
      
      // Unlock achievement from option
      if (success && option.achievement && !u.achievements.includes(option.achievement)) {
        u.achievements = [...u.achievements, option.achievement];
      }
      
      u.completedScenarios = [...g.completedScenarios, scenario];
      return u;
    });
    
    setScenarioResult({ success, option, effects });
  };

  const closeScenario = () => {
    setScenario(null);
    setScenarioResult(null);
    setScreen('dashboard');
  };

  // Check Game End
  const checkGameEnd = (weekly) => {
    if (game.cash + weekly.profit <= 0) {
      setTimeout(() => setScreen('gameover'), 500);
      return;
    }
    if (game.burnout >= 100) {
      setTimeout(() => setScreen('gameover'), 500);
      return;
    }
    if (goal === 'survive' && game.week >= 52) setTimeout(() => setScreen('win'), 500);
    else if (goal === 'wealth' && game.cash >= 1000000) setTimeout(() => setScreen('win'), 500);
    else if (goal === 'empire' && game.locations >= 5) setTimeout(() => setScreen('win'), 500);
  };

  // Staff Functions
  const hireEmployee = (template) => {
    if (game.cash < 500) return;
    const newE = {
      id: Date.now(),
      name: generateName(),
      role: template.role,
      wage: template.wage + Math.floor(Math.random() * 2),
      morale: 70 + Math.floor(Math.random() * 15),
      skill: 2 + Math.floor(Math.random() * 3),
      weeksEmployed: 0,
      icon: template.icon,
      certifications: [],
      trainingProgress: null,
    };
    setGame(g => ({ ...g, staff: [...g.staff, newE], cash: g.cash - 500 }));
    checkAchievements({});
  };

  const fireEmployee = (id) => {
    setGame(g => ({ ...g, staff: g.staff.filter(s => s.id !== id), morale: Math.max(20, g.morale - 5) }));
  };

  const startTraining = (staffId, programId) => {
    const program = TRAINING_PROGRAMS.find(p => p.id === programId);
    if (!program || game.cash < program.cost) return;
    
    setGame(g => ({
      ...g,
      cash: g.cash - program.cost,
      staff: g.staff.map(s => s.id === staffId ? {
        ...s,
        trainingProgress: { programId, weeksRemaining: program.weeks }
      } : s),
    }));
    setTrainingModal(false);
  };

  // Menu Functions
  const addDish = (dish) => {
    setGame(g => ({
      ...g,
      menu: [...g.menu, { ...dish, id: Date.now(), sold: 0, is86d: false }],
    }));
    setEditingDish(null);
  };

  const updateDish = (dish) => {
    setGame(g => ({
      ...g,
      menu: g.menu.map(m => m.id === dish.id ? dish : m),
    }));
    setEditingDish(null);
  };

  const toggle86 = (dishId) => {
    setGame(g => ({
      ...g,
      menu: g.menu.map(m => m.id === dishId ? { ...m, is86d: !m.is86d } : m),
    }));
  };

  const deleteDish = (dishId) => {
    setGame(g => ({
      ...g,
      menu: g.menu.filter(m => m.id !== dishId),
    }));
  };

  // Save/Load (using state for now - would use AsyncStorage in production)
  const [savedGames, setSavedGames] = useState([]);
  
  const saveGame = (slot) => {
    const save = {
      slot,
      date: new Date().toISOString(),
      game: { ...game },
      setup: { cuisine, capital, city, restaurantName, exp, self, goal },
    };
    setSavedGames(prev => {
      const updated = prev.filter(s => s.slot !== slot);
      return [...updated, save];
    });
    Alert.alert('Saved', `Game saved to slot ${slot}`);
    setSaveModal(false);
  };

  const loadGame = (save) => {
    setGame(save.game);
    setCuisine(save.setup.cuisine);
    setCapital(save.setup.capital);
    setCity(save.setup.city);
    setRestaurantName(save.setup.restaurantName);
    setExp(save.setup.exp);
    setSelf(save.setup.self);
    setGoal(save.setup.goal);
    setScreen('dashboard');
    setSaveModal(false);
  };

  // Reset
  const reset = () => {
    setScreen('welcome');
    setStep(0);
    setCuisine(null);
    setCapital(250000);
    setCity('');
    setRestaurantName('');
    setExp(null);
    setSelf(null);
    setGoal(null);
    setTab('overview');
  };

  // Helpers
  const getCuisine = () => CUISINES.find(c => c.id === cuisine) || CUISINES[0];
  const canNext = () => {
    if (typing) return false;
    if (step === 0) return cuisine;
    if (step === 1) return restaurantName.length > 0;
    if (step === 2) return true;
    if (step === 3) return city.length > 0;
    if (step === 4) return exp !== null;
    if (step === 5) return self !== null;
    if (step === 6) return goal !== null;
    return false;
  };
  const next = () => { if (step < 6) setStep(s => s + 1); else initializeGame(); };
  const runway = game.cash / ((game.revenue * 0.4) || 3000);
  
  // Get bestsellers
  const getBestsellers = () => {
    return [...game.menu].sort((a, b) => b.sold - a.sold).slice(0, 3);
  };

  // ============================================
  // RENDER
  // ============================================

  // WELCOME
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <View style={styles.welcomeDivider} />
          <Text style={styles.welcomeQuote}>"The restaurant business doesn't care about your dreams."</Text>
          <Text style={styles.welcomeSubtext}>From food trucks to fine dining.{'\n'}$10K to $5M+ capital. Real lessons.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setScreen('onboarding')}>
            <Text style={styles.startButtonText}>NEW GAME</Text>
          </TouchableOpacity>
          {savedGames.length > 0 && (
            <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.surface, marginTop: 12 }]} onPress={() => setSaveModal(true)}>
              <Text style={[styles.startButtonText, { color: colors.primary }]}>LOAD GAME</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.versionText}>v3.0 Phase 1 • Justin Newbold</Text>
        </View>
        
        {/* Load Game Modal */}
        <Modal visible={saveModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Load Game</Text>
                <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400 }}>
                {savedGames.map(save => (
                  <TouchableOpacity key={save.slot} onPress={() => loadGame(save)} style={styles.saveSlot}>
                    <Text style={styles.saveSlotTitle}>Slot {save.slot}: {save.setup.restaurantName}</Text>
                    <Text style={styles.saveSlotInfo}>Week {save.game.week} • {formatCurrency(save.game.cash)}</Text>
                    <Text style={styles.saveSlotDate}>{new Date(save.date).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ONBOARDING
  if (screen === 'onboarding') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ScrollView style={styles.onboardingContainer} contentContainerStyle={styles.onboardingContent}>
          <View style={styles.progressBarContainer}><View style={[styles.progressBar, { width: `${((step + 1) / 7) * 100}%` }]} /></View>
          <Text style={styles.stepText}>Step {step + 1}/7</Text>
          <View style={styles.messageBox}><Text style={styles.messageText}>{text}{typing && <Text style={styles.cursor}>▊</Text>}</Text></View>

          {!typing && step === 0 && <View><CuisineDropdown value={cuisine} onChange={setCuisine} />{cuisine && <View style={styles.selectedCuisine}><Text style={styles.selectedIcon}>{getCuisine().icon}</Text><View><Text style={styles.selectedName}>{getCuisine().name}</Text><Text style={styles.selectedStats}>~{Math.round(getCuisine().foodCost * 100)}% food • ${getCuisine().avgTicket} ticket</Text></View></View>}</View>}
          {!typing && step === 1 && <TextInput style={styles.textInput} placeholder="Restaurant name..." placeholderTextColor={colors.textMuted} value={restaurantName} onChangeText={setRestaurantName} />}
          {!typing && step === 2 && <View><View style={styles.capitalDisplay}><Text style={[styles.capitalAmount, { color: tier().c }]}>{formatCurrency(capital)}</Text><View style={[styles.tierBadge, { backgroundColor: tier().c + '20' }]}><Text style={[styles.tierText, { color: tier().c }]}>{tier().l}</Text></View><Text style={styles.tierDesc}>{tier().d}</Text><View style={styles.tierStats}><Text style={styles.tierStat}>👥 ~{tier().staff} staff</Text><Text style={styles.tierStat}>🏠 ~{formatCurrency(tier().rent)}/mo</Text></View></View><Slider style={styles.slider} minimumValue={10000} maximumValue={5000000} step={10000} value={capital} onValueChange={setCapital} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.surfaceLight} thumbTintColor={colors.primary} /><View style={styles.sliderLabels}><Text style={styles.sliderLabel}>$10K</Text><Text style={styles.sliderLabel}>$5M</Text></View><View style={styles.quickButtons}>{[50000, 150000, 300000, 500000, 1000000, 2500000, 5000000].map(v => <TouchableOpacity key={v} onPress={() => setCapital(v)} style={[styles.quickButton, capital === v && styles.quickButtonActive]}><Text style={[styles.quickButtonText, capital === v && styles.quickButtonTextActive]}>{formatCurrency(v)}</Text></TouchableOpacity>)}</View></View>}
          {!typing && step === 3 && <TextInput style={styles.textInput} placeholder="City name..." placeholderTextColor={colors.textMuted} value={city} onChangeText={setCity} />}
          {!typing && step === 4 && <View style={styles.optionRow}><TouchableOpacity onPress={() => setExp('yes')} style={[styles.optionButton, exp === 'yes' && styles.optionButtonActive]}><Text style={[styles.optionText, exp === 'yes' && styles.optionTextActive]}>Yes, veteran</Text></TouchableOpacity><TouchableOpacity onPress={() => setExp('no')} style={[styles.optionButton, exp === 'no' && styles.optionButtonActive]}><Text style={[styles.optionText, exp === 'no' && styles.optionTextActive]}>No, first timer</Text></TouchableOpacity></View>}
          {!typing && step === 5 && <View style={styles.optionRow}><TouchableOpacity onPress={() => setSelf('yes')} style={[styles.optionButton, self === 'yes' && styles.optionButtonActive]}><Text style={[styles.optionText, self === 'yes' && styles.optionTextActive]}>🏃 Running it myself</Text></TouchableOpacity><TouchableOpacity onPress={() => setSelf('no')} style={[styles.optionButton, self === 'no' && styles.optionButtonActive]}><Text style={[styles.optionText, self === 'no' && styles.optionTextActive]}>👥 Hiring operators</Text></TouchableOpacity></View>}
          {!typing && step === 6 && <View style={styles.goalOptions}>{[{ id: 'survive', text: '🎯 Survive Year One', desc: '52 weeks' }, { id: 'wealth', text: '💰 Hit $1M Net Worth', desc: 'Build wealth' }, { id: 'empire', text: '🏗️ Build an Empire', desc: '5 locations' }, { id: 'sandbox', text: '♾️ Sandbox Mode', desc: 'No win condition' }].map(g => <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)} style={[styles.goalButton, goal === g.id && styles.goalButtonActive]}><Text style={[styles.goalText, goal === g.id && styles.goalTextActive]}>{g.text}</Text><Text style={styles.goalDesc}>{g.desc}</Text></TouchableOpacity>)}</View>}

          <TouchableOpacity onPress={next} disabled={!canNext()} style={[styles.continueButton, !canNext() && styles.continueButtonDisabled]}><Text style={[styles.continueButtonText, !canNext() && styles.continueButtonTextDisabled]}>{step === 6 ? "OPEN FOR BUSINESS 🚀" : 'Continue'}</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SCENARIO
  if (screen === 'scenario' && scenario) {
    const s = SCENARIOS[scenario];
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ScrollView style={styles.scenarioContainer} contentContainerStyle={styles.scenarioContent}>
          <View style={styles.scenarioHeader}><View style={[styles.scenarioTypeBadge, { backgroundColor: s.type === 'crisis' ? colors.accent : s.type === 'warning' ? colors.warning : colors.success }]}><Text style={styles.scenarioTypeText}>{s.type.toUpperCase()}</Text></View></View>
          <Text style={styles.scenarioTitle}>{s.title}</Text>
          <Text style={styles.scenarioSubtitle}>Week {game.week} • {getCuisine().icon} {restaurantName}</Text>
          <View style={styles.scenarioMessageBox}><Text style={styles.scenarioMessage}>{s.getMessage(scenarioData)}</Text></View>
          {!scenarioResult ? s.options.map(o => <TouchableOpacity key={o.id} onPress={() => handleScenarioChoice(o)} style={styles.scenarioOption}><Text style={styles.scenarioOptionText}>{o.text}</Text>{o.successChance && <Text style={styles.scenarioChance}>({Math.round(o.successChance * 100)}%)</Text>}</TouchableOpacity>) : <View style={styles.scenarioResult}><Text style={[styles.scenarioResultText, { color: scenarioResult.success ? colors.success : colors.warning }]}>{scenarioResult.success ? '✓ Success' : "✗ Didn't go as planned"}</Text><TouchableOpacity onPress={closeScenario} style={styles.continueButton}><Text style={styles.continueButtonText}>Continue</Text></TouchableOpacity></View>}
          <View style={styles.lessonBox}><Text style={styles.lessonLabel}>📚 LESSON</Text><Text style={styles.lessonText}>{s.lesson}</Text></View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // GAME OVER
  if (screen === 'gameover') {
    const reason = game.cash <= 0 ? 'money' : 'burnout';
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>{reason === 'money' ? '💀 OUT OF MONEY' : '🔥 BURNED OUT'}</Text>
          <Text style={styles.endSubtitle}>{getCuisine().icon} {restaurantName} • {city}</Text>
          <View style={[styles.endDivider, { backgroundColor: colors.accent }]} />
          <Text style={styles.endMessage}>Week {game.week}. {reason === 'money' ? 'Bank hit zero.' : 'Body quit.'}</Text>
          <View style={styles.endStats}>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Weeks</Text><Text style={styles.endStatValue}>{game.week}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game.totalRevenue)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game.achievements.length}</Text></View>
          </View>
          <TouchableOpacity onPress={reset} style={styles.restartButton}><Text style={styles.restartButtonText}>Try Again</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // WIN
  if (screen === 'win') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.endContainer}>
          <Text style={[styles.endTitle, { color: colors.success }]}>🎉 YOU MADE IT!</Text>
          <Text style={styles.endSubtitle}>{getCuisine().icon} {restaurantName}</Text>
          <View style={[styles.endDivider, { backgroundColor: colors.success }]} />
          <View style={[styles.endStats, { borderColor: colors.success }]}>
            <Text style={[styles.winCondition, { color: colors.success }]}>{goal === 'survive' ? '52 Weeks Survived!' : goal === 'wealth' ? 'Millionaire!' : `${game.locations} Locations!`}</Text>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game.totalRevenue)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Profit</Text><Text style={[styles.endStatValue, { color: colors.success }]}>{formatCurrency(game.totalProfit)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</Text></View>
          </View>
          <TouchableOpacity onPress={reset} style={styles.restartButton}><Text style={styles.restartButtonText}>Play Again</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // DASHBOARD
  const weekly = calculateWeek();
  const bestsellers = getBestsellers();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.dashTitle}>{getCuisine().icon} {restaurantName}</Text>
          <Text style={styles.dashSubtitle}>Week {game.week} • {city}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setSaveModal(true)} style={[styles.nextWeekButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.nextWeekText, { color: colors.textPrimary }]}>💾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={advanceWeek} style={styles.nextWeekButton}>
            <Text style={styles.nextWeekText}>Next Week ⏩</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['overview', 'menu', 'staff', 'achievements'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'achievements' ? '🏆' : t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Warnings */}
      {(game.burnout > 70 || runway < 3) && (
        <View style={styles.warningBanner}>
          {game.burnout > 70 && <Text style={styles.warningText}>⚠️ Burnout: {game.burnout}%</Text>}
          {runway < 3 && runway > 0 && <Text style={styles.warningText}>⚠️ Low runway: {runway.toFixed(1)}mo</Text>}
        </View>
      )}
      
      <ScrollView style={styles.dashContent}>
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <View>
            <View style={styles.cashDisplay}>
              <Text style={styles.cashLabel}>CASH</Text>
              <Text style={styles.cashAmount}>{formatCurrency(game.cash)}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}><Text style={styles.statLabel}>RUNWAY</Text><Text style={styles.statValue}>{runway > 0 ? `${runway.toFixed(1)}mo` : '—'}</Text></View>
                <View style={styles.statItem}><Text style={styles.statLabel}>RATING</Text><Text style={[styles.statValue, { color: game.satisfaction >= 4 ? colors.success : colors.warning }]}>⭐ {game.satisfaction.toFixed(1)}</Text></View>
                <View style={styles.statItem}><Text style={styles.statLabel}>STAFF</Text><Text style={styles.statValue}>{game.staff.length}</Text></View>
              </View>
            </View>
            
            <View style={styles.burnoutCard}>
              <View style={styles.burnoutHeader}><Text style={styles.burnoutLabel}>🔥 Burnout</Text><Text style={[styles.burnoutValue, { color: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]}>{game.burnout}%</Text></View>
              <View style={styles.burnoutBarBg}><View style={[styles.burnoutBar, { width: `${game.burnout}%`, backgroundColor: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]} /></View>
            </View>
            
            <View style={styles.weeklyCard}>
              <Text style={styles.weeklyTitle}>THIS WEEK</Text>
              <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Revenue</Text><Text style={styles.weeklyValue}>{formatCurrency(weekly.revenue)}</Text></View>
              <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Food ({formatPct(weekly.foodCostPercent)})</Text><Text style={styles.weeklyValue}>-{formatCurrency(weekly.foodCost)}</Text></View>
              <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Labor ({formatPct(weekly.laborCostPercent)})</Text><Text style={styles.weeklyValue}>-{formatCurrency(weekly.laborCost)}</Text></View>
              <View style={[styles.weeklyRow, styles.weeklyTotalRow]}><Text style={styles.weeklyTotalLabel}>Net</Text><Text style={[styles.weeklyTotalValue, { color: weekly.profit >= 0 ? colors.success : colors.accent }]}>{weekly.profit >= 0 ? '+' : ''}{formatCurrency(weekly.profit)}</Text></View>
            </View>
            
            {/* Bestsellers */}
            {bestsellers.length > 0 && (
              <View style={styles.weeklyCard}>
                <Text style={styles.weeklyTitle}>🌟 BESTSELLERS</Text>
                {bestsellers.map((dish, i) => (
                  <View key={dish.id} style={styles.weeklyRow}>
                    <Text style={styles.weeklyLabel}>{i + 1}. {dish.name}</Text>
                    <Text style={styles.weeklyValue}>{dish.sold} sold</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Customer Mix */}
            <View style={styles.weeklyCard}>
              <Text style={styles.weeklyTitle}>👥 CUSTOMERS SERVED</Text>
              <Text style={[styles.weeklyValue, { textAlign: 'center', fontSize: 24, marginVertical: 8 }]}>{game.customersServed.total}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {Object.entries(game.customersServed.byType || {}).slice(0, 4).map(([type, count]) => {
                  const ct = CUSTOMER_TYPES.find(c => c.id === type);
                  return ct ? (
                    <View key={type} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 16 }}>{ct.icon}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 10 }}>{count}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </View>
          </View>
        )}
        
        {/* MENU TAB */}
        {tab === 'menu' && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>MENU ({game.menu.length} items)</Text>
              <TouchableOpacity onPress={() => { setEditingDish({ name: '', price: '', cost: '', category: 'entree' }); setMenuModal(true); }} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add Dish</Text>
              </TouchableOpacity>
            </View>
            
            {game.menu.map(dish => (
              <View key={dish.id} style={[styles.menuItem, dish.is86d && styles.menuItem86d]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.menuItemName, dish.is86d && { textDecorationLine: 'line-through' }]}>{dish.name}</Text>
                    {dish.is86d && <Text style={styles.tag86d}>86'd</Text>}
                  </View>
                  <Text style={styles.menuItemStats}>${dish.price} • Cost: ${dish.cost.toFixed(2)} • {Math.round((dish.cost / dish.price) * 100)}% • {dish.sold} sold</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => toggle86(dish.id)} style={[styles.menuAction, { backgroundColor: dish.is86d ? colors.success : colors.warning }]}>
                    <Text style={styles.menuActionText}>{dish.is86d ? '✓' : '86'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditingDish(dish); setMenuModal(true); }} style={styles.menuAction}>
                    <Text style={styles.menuActionText}>✏️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {/* Menu Modal */}
            <Modal visible={menuModal} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingDish?.id ? 'Edit Dish' : 'Add Dish'}</Text>
                    <TouchableOpacity onPress={() => { setMenuModal(false); setEditingDish(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
                  </View>
                  {editingDish && (
                    <View style={{ padding: 16 }}>
                      <Text style={styles.inputLabel}>Name</Text>
                      <TextInput style={styles.textInput} value={editingDish.name} onChangeText={t => setEditingDish({ ...editingDish, name: t })} placeholder="Dish name..." placeholderTextColor={colors.textMuted} />
                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>Price ($)</Text>
                      <TextInput style={styles.textInput} value={String(editingDish.price)} onChangeText={t => setEditingDish({ ...editingDish, price: parseFloat(t) || 0 })} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>Food Cost ($)</Text>
                      <TextInput style={styles.textInput} value={String(editingDish.cost)} onChangeText={t => setEditingDish({ ...editingDish, cost: parseFloat(t) || 0 })} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
                      {editingDish.price > 0 && editingDish.cost > 0 && (
                        <Text style={{ color: colors.textMuted, marginTop: 8 }}>Food Cost: {Math.round((editingDish.cost / editingDish.price) * 100)}%</Text>
                      )}
                      <TouchableOpacity onPress={() => { editingDish.id ? updateDish(editingDish) : addDish(editingDish); setMenuModal(false); }} style={[styles.continueButton, { marginTop: 20 }]} disabled={!editingDish.name || !editingDish.price}>
                        <Text style={styles.continueButtonText}>{editingDish.id ? 'Save Changes' : 'Add to Menu'}</Text>
                      </TouchableOpacity>
                      {editingDish.id && (
                        <TouchableOpacity onPress={() => { deleteDish(editingDish.id); setMenuModal(false); setEditingDish(null); }} style={[styles.continueButton, { marginTop: 8, backgroundColor: colors.accent }]}>
                          <Text style={styles.continueButtonText}>Delete Dish</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        )}
        
        {/* STAFF TAB */}
        {tab === 'staff' && (
          <View>
            <Text style={styles.sectionTitle}>TEAM ({game.staff.length})</Text>
            {game.staff.map(s => (
              <View key={s.id} style={styles.staffCard}>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffIcon}>{s.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.staffName}>{s.name}</Text>
                      {s.certifications?.map(cert => <Text key={cert} style={styles.certBadge}>{cert}</Text>)}
                    </View>
                    <Text style={styles.staffRole}>{s.role} • ${s.wage}/hr • Skill: {s.skill}/10</Text>
                    {s.trainingProgress && (
                      <Text style={{ color: colors.info, fontSize: 10 }}>📚 Training: {s.trainingProgress.weeksRemaining}w left</Text>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {!s.trainingProgress && (
                    <TouchableOpacity onPress={() => { setSelectedStaff(s); setTrainingModal(true); }} style={[styles.fireButton, { backgroundColor: colors.info }]}>
                      <Text style={styles.fireButtonText}>Train</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => fireEmployee(s.id)} style={styles.fireButton}>
                    <Text style={styles.fireButtonText}>Fire</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>HIRE</Text>
            <View style={styles.hireGrid}>
              {STAFF_TEMPLATES.slice(0, 8).map(t => (
                <TouchableOpacity key={t.role} onPress={() => hireEmployee(t)} style={styles.hireCard}>
                  <Text style={styles.hireIcon}>{t.icon}</Text>
                  <Text style={styles.hireRole}>{t.role}</Text>
                  <Text style={styles.hireWage}>${t.wage}/hr</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Training Modal */}
            <Modal visible={trainingModal} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Train {selectedStaff?.name}</Text>
                    <TouchableOpacity onPress={() => setTrainingModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
                  </View>
                  <ScrollView style={{ maxHeight: 400 }}>
                    {TRAINING_PROGRAMS.map(prog => (
                      <TouchableOpacity key={prog.id} onPress={() => startTraining(selectedStaff?.id, prog.id)} style={styles.trainingOption} disabled={game.cash < prog.cost}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.trainingName}>{prog.icon} {prog.name}</Text>
                          <Text style={styles.trainingInfo}>{prog.weeks} week(s) • +{prog.skillBoost} skill • {formatCurrency(prog.cost)}</Text>
                          {prog.cert && <Text style={styles.trainingCert}>Earns: {prog.cert}</Text>}
                        </View>
                        {game.cash < prog.cost && <Text style={{ color: colors.accent, fontSize: 10 }}>Can't afford</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        )}
        
        {/* ACHIEVEMENTS TAB */}
        {tab === 'achievements' && (
          <View>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '700' }}>{game.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Achievements Unlocked</Text>
            </View>
            
            {['survival', 'financial', 'staff', 'operations', 'customer', 'growth', 'resilience', 'special'].map(category => {
              const categoryAch = Object.entries(ACHIEVEMENTS).filter(([_, a]) => a.category === category);
              const unlockedCount = categoryAch.filter(([id]) => game.achievements.includes(id)).length;
              
              return (
                <View key={category} style={{ marginBottom: 16 }}>
                  <Text style={styles.achievementCategory}>{category.toUpperCase()} ({unlockedCount}/{categoryAch.length})</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {categoryAch.map(([id, ach]) => {
                      const unlocked = game.achievements.includes(id);
                      return (
                        <View key={id} style={[styles.achievementBadge, unlocked && styles.achievementUnlocked]}>
                          <Text style={{ fontSize: 20 }}>{unlocked ? ach.icon : '🔒'}</Text>
                          <Text style={[styles.achievementName, !unlocked && { color: colors.textMuted }]}>{ach.name}</Text>
                          {unlocked && <Text style={styles.achievementDesc}>{ach.desc}</Text>}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {/* Save Modal */}
      <Modal visible={saveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save/Load Game</Text>
              <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={styles.sectionTitle}>SAVE SLOTS</Text>
              {[1, 2, 3].map(slot => {
                const save = savedGames.find(s => s.slot === slot);
                return (
                  <View key={slot} style={styles.saveSlot}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                      {save ? (
                        <>
                          <Text style={styles.saveSlotInfo}>{save.setup.restaurantName} • Week {save.game.week}</Text>
                          <Text style={styles.saveSlotDate}>{new Date(save.date).toLocaleDateString()}</Text>
                        </>
                      ) : (
                        <Text style={styles.saveSlotInfo}>Empty</Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => saveGame(slot)} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      {save && (
                        <TouchableOpacity onPress={() => loadGame(save)} style={[styles.saveButton, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.saveButtonText, { color: colors.textPrimary }]}>Load</Text>
                        </TouchableOpacity>
                      )}
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
