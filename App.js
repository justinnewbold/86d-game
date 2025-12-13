import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Dimensions, Alert, Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
  info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

const formatCurrency = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
const formatPct = (v) => `${(v * 100).toFixed(1)}%`;

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
  { id: 'seafood', name: 'Seafood', icon: '🦞', foodCost: 0.35, avgTicket: 45 },
  { id: 'steakhouse', name: 'Steakhouse', icon: '🥩', foodCost: 0.38, avgTicket: 95 },
  { id: 'bbq', name: 'BBQ & Smokehouse', icon: '🍖', foodCost: 0.30, avgTicket: 18 },
  { id: 'cafe', name: 'Café & Coffee Shop', icon: '☕', foodCost: 0.22, avgTicket: 9 },
  { id: 'vegan', name: 'Vegan & Plant-Based', icon: '🥗', foodCost: 0.32, avgTicket: 16 },
  { id: 'ramen', name: 'Ramen', icon: '🍜', foodCost: 0.26, avgTicket: 15 },
  { id: 'sushi', name: 'Sushi Bar', icon: '🍱', foodCost: 0.34, avgTicket: 55 },
  { id: 'tapas', name: 'Tapas & Small Plates', icon: '🫒', foodCost: 0.29, avgTicket: 24 },
  { id: 'pub', name: 'Gastropub', icon: '🍺', foodCost: 0.28, avgTicket: 22 },
  { id: 'brunch', name: 'Brunch Spot', icon: '🥞', foodCost: 0.26, avgTicket: 18 },
  { id: 'foodtruck', name: 'Food Truck', icon: '🚚', foodCost: 0.26, avgTicket: 12 },
  { id: 'finedining', name: 'Modern Fine Dining', icon: '✨', foodCost: 0.30, avgTicket: 175 },
];

const STAFF_TEMPLATES = [
  { role: 'Line Cook', wage: 16, icon: '👨‍🍳' },
  { role: 'Prep Cook', wage: 14, icon: '🔪' },
  { role: 'Server', wage: 8, icon: '🍽️' },
  { role: 'Host', wage: 12, icon: '📋' },
  { role: 'Dishwasher', wage: 13, icon: '🧽' },
  { role: 'Bartender', wage: 10, icon: '🍸' },
  { role: 'Sous Chef', wage: 24, icon: '👨‍🍳' },
  { role: 'Executive Chef', wage: 35, icon: '👨‍🍳' },
  { role: 'Manager', wage: 22, icon: '👔' },
];

const TRAINING_PROGRAMS = [
  { id: 'food_safety', name: 'Food Safety', icon: '🛡️', cost: 200, weeks: 1, skillBoost: 1, cert: 'ServSafe' },
  { id: 'wine_101', name: 'Wine Basics', icon: '🍷', cost: 350, weeks: 2, skillBoost: 2, cert: 'Wine 101' },
  { id: 'leadership', name: 'Leadership', icon: '⭐', cost: 500, weeks: 3, skillBoost: 2, cert: 'Team Lead' },
  { id: 'mixology', name: 'Mixology', icon: '🍹', cost: 400, weeks: 2, skillBoost: 2, cert: 'Mixologist' },
];

const CUSTOMER_TYPES = [
  { id: 'regular', name: 'Regular', icon: '😊', spendMod: 1.0, frequency: 0.4 },
  { id: 'first_timer', name: 'First Timer', icon: '🆕', spendMod: 0.9, frequency: 0.25 },
  { id: 'critic', name: 'Food Critic', icon: '📝', spendMod: 1.3, frequency: 0.02 },
  { id: 'influencer', name: 'Influencer', icon: '📱', spendMod: 0.8, frequency: 0.05 },
  { id: 'difficult', name: 'Difficult Guest', icon: '😤', spendMod: 1.1, frequency: 0.08 },
  { id: 'big_spender', name: 'Big Spender', icon: '💰', spendMod: 1.8, frequency: 0.05 },
  { id: 'date_night', name: 'Date Night', icon: '💕', spendMod: 1.4, frequency: 0.1 },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', spendMod: 1.2, frequency: 0.12 },
];

const EQUIPMENT = [
  { id: 'fryer', name: 'Commercial Fryer', icon: '🍟', cost: 3500, effect: { capacity: 0.05 } },
  { id: 'oven', name: 'Convection Oven', icon: '🔥', cost: 8000, effect: { capacity: 0.08 } },
  { id: 'walkin', name: 'Walk-In Cooler', icon: '❄️', cost: 12000, effect: { spoilage: -0.5 } },
  { id: 'pos', name: 'Modern POS', icon: '💻', cost: 5000, effect: { speed: 0.15 } },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🧽', cost: 6000, effect: { labor: -0.05 } },
  { id: 'espresso', name: 'Espresso Machine', icon: '☕', cost: 8000, effect: { revenue: 0.05 } },
];

const UPGRADES = [
  { id: 'patio', name: 'Outdoor Patio', icon: '☀️', cost: 25000, effect: { capacity: 0.25 } },
  { id: 'bar', name: 'Full Bar', icon: '🍸', cost: 40000, effect: { revenue: 0.15 } },
  { id: 'renovation', name: 'Renovation', icon: '🎨', cost: 50000, effect: { satisfaction: 0.2 } },
  { id: 'kitchen_expand', name: 'Kitchen Expand', icon: '👨‍🍳', cost: 75000, effect: { capacity: 0.3 } },
];

const MARKETING_CHANNELS = [
  { id: 'social_organic', name: 'Social Media (Free)', icon: '📱', costPerWeek: 0, effect: { reach: 0.02 } },
  { id: 'social_paid', name: 'Social Ads', icon: '📣', costPerWeek: 500, effect: { reach: 0.08 } },
  { id: 'google_ads', name: 'Google Ads', icon: '🔍', costPerWeek: 750, effect: { reach: 0.1 } },
  { id: 'email', name: 'Email Marketing', icon: '📧', costPerWeek: 100, effect: { retention: 0.1 } },
  { id: 'loyalty', name: 'Loyalty Program', icon: '💳', costPerWeek: 200, effect: { retention: 0.2 } },
];

const DELIVERY_PLATFORMS = [
  { id: 'doordash', name: 'DoorDash', icon: '🚪', commission: 0.25, setup: 500 },
  { id: 'ubereats', name: 'Uber Eats', icon: '🚗', commission: 0.30, setup: 0 },
  { id: 'grubhub', name: 'Grubhub', icon: '🍽️', commission: 0.28, setup: 250 },
];

const VIRTUAL_BRANDS = [
  { id: 'wings', name: 'Wing Joint', icon: '🍗', avgTicket: 22 },
  { id: 'burgers', name: 'Smash Burgers', icon: '🍔', avgTicket: 18 },
  { id: 'healthy', name: 'Green Bowls', icon: '🥗', avgTicket: 16 },
  { id: 'tacos', name: 'Taco Loco', icon: '🌮', avgTicket: 15 },
];

const ACHIEVEMENTS = {
  first_week: { name: 'First Week', desc: 'Survive week 1', icon: '📅', category: 'survival' },
  first_month: { name: 'First Month', desc: '4 weeks', icon: '🗓️', category: 'survival' },
  survivor: { name: 'Survivor', desc: '52 weeks', icon: '🏆', category: 'survival' },
  first_profit: { name: 'In The Black', desc: 'First profit', icon: '💚', category: 'financial' },
  fifty_k: { name: 'Cushion', desc: '$50K cash', icon: '💰', category: 'financial' },
  hundred_k: { name: 'Six Figures', desc: '$100K cash', icon: '🤑', category: 'financial' },
  millionaire: { name: 'Millionaire', desc: '$1M cash', icon: '🏰', category: 'financial' },
  first_hire: { name: 'First Hire', desc: 'Hire someone', icon: '🤝', category: 'staff' },
  full_team: { name: 'Full House', desc: '10+ staff', icon: '👥', category: 'staff' },
  menu_master: { name: 'Menu Master', desc: '10 items', icon: '📋', category: 'operations' },
  delivery_enabled: { name: 'Delivery Era', desc: 'Enable delivery', icon: '🛵', category: 'operations' },
  virtual_brand: { name: 'Ghost Kitchen', desc: 'Virtual brand', icon: '👻', category: 'operations' },
  five_star: { name: 'Five Stars', desc: '4.8+ rating', icon: '⭐', category: 'customer' },
  second_location: { name: 'Expansion', desc: '2nd location', icon: '🏪', category: 'growth' },
};

const SCENARIOS = [
  {
    id: 'health_inspection', type: 'crisis', title: '🏥 Health Inspection',
    message: 'Health inspector just walked in. Your kitchen cleanliness will be evaluated.',
    options: [
      { text: 'Welcome them confidently', successChance: 0.7, success: { reputation: 5 }, fail: { cash: -2000, reputation: -15 } },
      { text: 'Offer a "complimentary meal"', successChance: 0.3, success: { reputation: -5 }, fail: { cash: -5000, reputation: -25 } },
    ],
    lesson: 'Keep your kitchen inspection-ready at all times.',
  },
  {
    id: 'staff_walkout', type: 'crisis', title: '🚪 Staff Walkout',
    message: 'Three staff members are threatening to quit unless you give raises.',
    options: [
      { text: 'Give 10% raises', successChance: 0.9, success: { laborCostMod: 0.1 }, fail: { staff: -1 } },
      { text: 'Call their bluff', successChance: 0.4, success: { reputation: 5 }, fail: { staff: -3, reputation: -10 } },
    ],
    lesson: 'Invest in your team before problems escalate.',
  },
  {
    id: 'viral_review', type: 'opportunity', title: '📱 Viral Review',
    message: 'A food blogger with 500K followers wants to review your restaurant.',
    options: [
      { text: 'Roll out the red carpet', successChance: 0.75, success: { reputation: 20, customers: 50 }, fail: { reputation: -10 } },
      { text: 'Treat them like anyone else', successChance: 0.5, success: { reputation: 10 }, fail: { reputation: -5 } },
    ],
    lesson: 'Every guest could be your next advocate.',
  },
  {
    id: 'equipment_failure', type: 'crisis', title: '🔧 Equipment Failure',
    message: 'Your main cooler just died. Food is at risk.',
    options: [
      { text: 'Emergency repair ($3,000)', successChance: 0.85, success: { cash: -3000 }, fail: { cash: -3000, foodWaste: 2000 } },
      { text: 'Buy bags of ice ($200)', successChance: 0.5, success: { cash: -200 }, fail: { cash: -200, foodWaste: 4000 } },
    ],
    lesson: 'Budget for equipment maintenance and emergencies.',
  },
  {
    id: 'catering_opportunity', type: 'opportunity', title: '🎉 Catering Gig',
    message: 'Local company wants you to cater their 200-person event.',
    options: [
      { text: 'Accept ($8,000 revenue)', successChance: 0.7, success: { cash: 8000, reputation: 10 }, fail: { cash: 2000, reputation: -15 } },
      { text: 'Politely decline', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Catering can boost revenue but requires flawless execution.',
  },
  {
    id: 'food_cost_spike', type: 'crisis', title: '📈 Supply Chain Issues',
    message: 'Your main protein supplier raised prices 25% effective immediately.',
    options: [
      { text: 'Absorb the cost', successChance: 1.0, success: { foodCostMod: 0.05 }, fail: {} },
      { text: 'Raise menu prices 15%', successChance: 0.6, success: { avgTicketMod: 0.15 }, fail: { customers: -20, reputation: -5 } },
      { text: 'Find new supplier', successChance: 0.5, success: {}, fail: { foodCostMod: 0.08 } },
    ],
    lesson: 'Diversify suppliers and build relationships.',
  },
  {
    id: 'positive_press', type: 'opportunity', title: '📰 Press Feature',
    message: 'Local newspaper wants to feature you in "Best New Restaurants".',
    options: [
      { text: 'Enthusiastically accept', successChance: 0.9, success: { reputation: 15, customers: 30 }, fail: { reputation: 5 } },
    ],
    lesson: 'Good press is free marketing - embrace it!',
  },
  {
    id: 'delivery_opportunity', type: 'opportunity', title: '🚗 Delivery Partnership',
    message: 'DoorDash rep is offering a featured spot with reduced commission for 3 months.',
    options: [
      { text: 'Sign up for delivery', successChance: 0.8, success: { deliveryEnabled: true, cash: 500 }, fail: { cash: -500 } },
      { text: 'Focus on dine-in only', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
    lesson: 'Delivery expands reach but watch those commission fees.',
  },
];

const GOALS = [
  { id: 'survive', name: 'Survival', desc: 'Keep doors open for 1 year', target: { weeks: 52 } },
  { id: 'profit', name: 'Profitability', desc: 'Reach $100K in cash', target: { cash: 100000 } },
  { id: 'empire', name: 'Empire Builder', desc: 'Open second location', target: { locations: 2 } },
  { id: 'legacy', name: 'Legacy', desc: 'Build a restaurant worth $1M', target: { valuation: 1000000 } },
];

const generateName = () => ['Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Jamie'][Math.floor(Math.random() * 8)];
const generateMenuItem = (cuisine) => {
  const items = {
    burgers: ['Classic Burger', 'Bacon Cheeseburger', 'Mushroom Swiss', 'BBQ Burger', 'Veggie Burger'],
    mexican: ['Street Tacos', 'Burrito Bowl', 'Quesadilla', 'Enchiladas', 'Nachos Grande'],
    pizza: ['Margherita', 'Pepperoni', 'Supreme', 'White Pizza', 'Meat Lovers'],
    chinese: ['Kung Pao Chicken', 'General Tso', 'Lo Mein', 'Fried Rice', 'Orange Chicken'],
    japanese: ['Ramen', 'Teriyaki Bowl', 'Tempura', 'Katsu Curry', 'Donburi'],
    thai: ['Pad Thai', 'Green Curry', 'Tom Yum', 'Massaman', 'Basil Chicken'],
    indian: ['Butter Chicken', 'Tikka Masala', 'Biryani', 'Samosas', 'Naan Basket'],
    korean: ['Bibimbap', 'Korean BBQ', 'Japchae', 'Kimchi Stew', 'Bulgogi'],
    vietnamese: ['Pho', 'Banh Mi', 'Spring Rolls', 'Bun Bowl', 'Com Tam'],
    mediterranean: ['Falafel Plate', 'Shawarma', 'Hummus Trio', 'Gyro', 'Kebab Platter'],
    seafood: ['Lobster Roll', 'Fish & Chips', 'Shrimp Scampi', 'Crab Cakes', 'Clam Chowder'],
    steakhouse: ['Ribeye', 'Filet Mignon', 'NY Strip', 'Porterhouse', 'Prime Rib'],
    bbq: ['Brisket Plate', 'Pulled Pork', 'Ribs', 'Smoked Wings', 'Burnt Ends'],
    cafe: ['Avocado Toast', 'Croissant', 'Breakfast Burrito', 'Acai Bowl', 'Quiche'],
    default: ['House Special', 'Chef Choice', 'Daily Feature', 'Signature Dish', 'Classic Favorite'],
  };
  const list = items[cuisine] || items.default;
  return list[Math.floor(Math.random() * list.length)];
};

const MiniChart = ({ data, color, height = 40 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(Math.abs), 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {data.slice(-12).map((v, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: v >= 0 ? color : colors.accent, height: Math.max(2, ((v - min) / range) * height), borderRadius: 2 }} />
      ))}
    </View>
  );
};

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [setup, setSetup] = useState({ cuisine: null, capital: 75000, name: '', location: 'urban', goal: 'survive' });
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [scenario, setScenario] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [cuisineModal, setCuisineModal] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [staffModal, setStaffModal] = useState(false);
  const [trainingModal, setTrainingModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [menuModal, setMenuModal] = useState(false);
  const [marketingModal, setMarketingModal] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [operationsModal, setOperationsModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [savedGames, setSavedGames] = useState([]);

  const initGame = useCallback(() => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const locationMod = { urban: 1.2, suburban: 1.0, rural: 0.8 }[setup.location] || 1;
    const baseCovers = Math.floor(50 + (setup.capital / 10000) * 10);
    setGame({
      week: 0, cash: setup.capital, totalRevenue: 0, totalProfit: 0,
      reputation: 50, burnout: 0, ownerHours: 60,
      staff: [{ id: 1, name: generateName(), role: 'Line Cook', wage: 16, skill: 5, weeks: 0, training: [], icon: '👨‍🍳' }],
      menu: [{ id: 1, name: generateMenuItem(setup.cuisine), price: cuisine.avgTicket, cost: cuisine.avgTicket * cuisine.foodCost, popular: true, is86d: false }],
      avgTicket: cuisine.avgTicket, foodCostPct: cuisine.foodCost,
      covers: baseCovers, locationMod,
      customersServed: { total: 0, byType: {} },
      equipment: [], upgrades: [],
      marketing: { channels: ['social_organic'], promotions: [], socialFollowers: 100, loyaltyMembers: 0 },
      delivery: { platforms: [], orders: 0 },
      virtualBrands: [],
      weeklyHistory: [], achievements: ['first_week'],
      scenariosSeen: [], lastWeekRevenue: 0, lastWeekProfit: 0, lastWeekCosts: {},
    });
    setScreen('dashboard');
  }, [setup]);

  const processWeek = useCallback(() => {
    if (!game) return;
    setGame(g => {
      const cuisine = CUISINES.find(c => c.id === setup.cuisine);
      
      // Calculate modifiers
      const equipCapacityMod = g.equipment.reduce((sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.effect?.capacity || 0), 0);
      const upgradeCapacityMod = g.upgrades.reduce((sum, u) => sum + (UPGRADES.find(up => up.id === u)?.effect?.capacity || 0), 0);
      const marketingReachMod = g.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.effect?.reach || 0), 0);
      
      // Base covers with modifiers
      let weekCovers = Math.floor(g.covers * g.locationMod * (1 + equipCapacityMod + upgradeCapacityMod + marketingReachMod) * (0.9 + Math.random() * 0.2));
      weekCovers = Math.floor(weekCovers * (1 + g.reputation / 200));
      
      // Customer types
      const customersByType = {};
      let totalSpend = 0;
      for (let i = 0; i < weekCovers; i++) {
        const rand = Math.random();
        let cumulative = 0;
        let type = CUSTOMER_TYPES[0];
        for (const ct of CUSTOMER_TYPES) {
          cumulative += ct.frequency;
          if (rand <= cumulative) { type = ct; break; }
        }
        customersByType[type.id] = (customersByType[type.id] || 0) + 1;
        totalSpend += g.avgTicket * type.spendMod;
      }
      
      // Revenue
      const dineInRevenue = totalSpend;
      const deliveryOrders = g.delivery.platforms.length > 0 ? Math.floor(weekCovers * 0.2) : 0;
      const avgCommission = g.delivery.platforms.length > 0 ? g.delivery.platforms.reduce((sum, p) => sum + (DELIVERY_PLATFORMS.find(dp => dp.id === p)?.commission || 0.25), 0) / g.delivery.platforms.length : 0;
      const deliveryRevenue = deliveryOrders * g.avgTicket * (1 - avgCommission);
      const virtualBrandRevenue = g.virtualBrands.reduce((sum, vb) => {
        const brand = VIRTUAL_BRANDS.find(v => v.id === vb);
        return sum + (brand ? Math.floor(20 + Math.random() * 15) * brand.avgTicket * 0.7 : 0);
      }, 0);
      const totalRevenue = dineInRevenue + deliveryRevenue + virtualBrandRevenue;
      
      // Costs
      const foodCost = totalRevenue * g.foodCostPct;
      const laborCost = g.staff.reduce((sum, s) => sum + s.wage * 40, 0);
      const rent = Math.floor(setup.capital * 0.03);
      const utilities = Math.floor(rent * 0.15);
      const marketingCost = g.marketing.channels.reduce((sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.costPerWeek || 0), 0);
      const totalCosts = foodCost + laborCost + rent + utilities + marketingCost;
      const weekProfit = totalRevenue - totalCosts;
      
      // Update achievements
      const newAchievements = [...g.achievements];
      if (g.week + 1 >= 4 && !newAchievements.includes('first_month')) newAchievements.push('first_month');
      if (g.week + 1 >= 52 && !newAchievements.includes('survivor')) newAchievements.push('survivor');
      if (weekProfit > 0 && !newAchievements.includes('first_profit')) newAchievements.push('first_profit');
      if (g.cash + weekProfit >= 50000 && !newAchievements.includes('fifty_k')) newAchievements.push('fifty_k');
      if (g.cash + weekProfit >= 100000 && !newAchievements.includes('hundred_k')) newAchievements.push('hundred_k');
      if (g.cash + weekProfit >= 1000000 && !newAchievements.includes('millionaire')) newAchievements.push('millionaire');
      if (g.staff.length >= 10 && !newAchievements.includes('full_team')) newAchievements.push('full_team');
      if (g.menu.length >= 10 && !newAchievements.includes('menu_master')) newAchievements.push('menu_master');
      if (g.delivery.platforms.length > 0 && !newAchievements.includes('delivery_enabled')) newAchievements.push('delivery_enabled');
      if (g.virtualBrands.length > 0 && !newAchievements.includes('virtual_brand')) newAchievements.push('virtual_brand');
      
      // Random scenario
      if (Math.random() < 0.15 && g.week > 1) {
        const available = SCENARIOS.filter(s => !g.scenariosSeen.includes(s.id));
        if (available.length > 0) {
          const randomScenario = available[Math.floor(Math.random() * available.length)];
          setScenario(randomScenario);
        }
      }
      
      // Update game state
      const newCash = g.cash + weekProfit;
      const newHistory = [...g.weeklyHistory, { week: g.week + 1, revenue: totalRevenue, profit: weekProfit, covers: weekCovers }].slice(-52);
      
      // Check for game over
      if (newCash < -10000) {
        setTimeout(() => setScreen('gameover'), 100);
      }
      
      // Check for win
      const goal = GOALS.find(gl => gl.id === setup.goal);
      if (goal) {
        if (goal.target.weeks && g.week + 1 >= goal.target.weeks) setTimeout(() => setScreen('win'), 100);
        if (goal.target.cash && newCash >= goal.target.cash) setTimeout(() => setScreen('win'), 100);
      }
      
      return {
        ...g,
        week: g.week + 1,
        cash: newCash,
        totalRevenue: g.totalRevenue + totalRevenue,
        totalProfit: g.totalProfit + weekProfit,
        lastWeekRevenue: totalRevenue,
        lastWeekProfit: weekProfit,
        lastWeekCosts: { food: foodCost, labor: laborCost, rent, utilities, marketing: marketingCost },
        customersServed: {
          total: g.customersServed.total + weekCovers,
          byType: Object.entries(customersByType).reduce((acc, [k, v]) => ({ ...acc, [k]: (g.customersServed.byType[k] || 0) + v }), g.customersServed.byType),
        },
        delivery: { ...g.delivery, orders: g.delivery.orders + deliveryOrders },
        weeklyHistory: newHistory,
        achievements: newAchievements,
        staff: g.staff.map(s => ({ ...s, weeks: s.weeks + 1 })),
        burnout: Math.min(100, Math.max(0, g.burnout + (g.ownerHours > 50 ? 5 : -3))),
        reputation: Math.min(100, Math.max(0, g.reputation + (weekProfit > 0 ? 1 : -2))),
      };
    });
  }, [game, setup]);

  const hireStaff = (template) => {
    if (!game || game.cash < template.wage * 40) return;
    setGame(g => ({
      ...g,
      cash: g.cash - template.wage * 40,
      staff: [...g.staff, { id: Date.now(), name: generateName(), ...template, skill: 3 + Math.floor(Math.random() * 3), weeks: 0, training: [] }],
      achievements: g.achievements.includes('first_hire') ? g.achievements : [...g.achievements, 'first_hire'],
    }));
    setStaffModal(false);
  };

  const fireStaff = (id) => {
    setGame(g => ({ ...g, staff: g.staff.filter(s => s.id !== id) }));
  };

  const startTraining = (program) => {
    if (!selectedStaff || !game || game.cash < program.cost) return;
    setGame(g => ({
      ...g,
      cash: g.cash - program.cost,
      staff: g.staff.map(s => s.id === selectedStaff.id ? { ...s, training: [...s.training, program.id], skill: Math.min(10, s.skill + program.skillBoost) } : s),
    }));
    setTrainingModal(false);
    setSelectedStaff(null);
  };

  const addMenuItem = () => {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    if (!cuisine || !game) return;
    setGame(g => ({
      ...g,
      menu: [...g.menu, { id: Date.now(), name: generateMenuItem(setup.cuisine), price: cuisine.avgTicket * (0.8 + Math.random() * 0.4), cost: cuisine.avgTicket * cuisine.foodCost, popular: Math.random() > 0.7, is86d: false }],
    }));
  };

  const toggle86 = (id) => {
    setGame(g => ({ ...g, menu: g.menu.map(m => m.id === id ? { ...m, is86d: !m.is86d } : m) }));
  };

  const buyEquipment = (eq) => {
    if (!game || game.cash < eq.cost || game.equipment.includes(eq.id)) return;
    setGame(g => ({ ...g, cash: g.cash - eq.cost, equipment: [...g.equipment, eq.id] }));
  };

  const buyUpgrade = (up) => {
    if (!game || game.cash < up.cost || game.upgrades.includes(up.id)) return;
    setGame(g => ({ ...g, cash: g.cash - up.cost, upgrades: [...g.upgrades, up.id] }));
  };

  const toggleMarketingChannel = (channelId) => {
    const channel = MARKETING_CHANNELS.find(c => c.id === channelId);
    if (!channel) return;
    setGame(g => {
      const isActive = g.marketing.channels.includes(channelId);
      if (isActive) {
        return { ...g, marketing: { ...g.marketing, channels: g.marketing.channels.filter(c => c !== channelId) } };
      } else {
        return { ...g, marketing: { ...g.marketing, channels: [...g.marketing.channels, channelId] } };
      }
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
        return { ...g, cash: g.cash - platform.setup, delivery: { ...g.delivery, platforms: [...g.delivery.platforms, platformId] } };
      }
      return g;
    });
  };

  const launchVirtualBrand = (brandId) => {
    if (!game || game.virtualBrands.includes(brandId) || game.cash < 2000) return;
    setGame(g => ({ ...g, cash: g.cash - 2000, virtualBrands: [...g.virtualBrands, brandId] }));
  };

  const handleScenarioChoice = (option) => {
    const success = Math.random() <= option.successChance;
    const outcome = success ? option.success : option.fail;
    setScenarioResult({ success, outcome });
    
    setGame(g => {
      let updated = { ...g, scenariosSeen: [...g.scenariosSeen, scenario.id] };
      if (outcome.cash) updated.cash += outcome.cash;
      if (outcome.reputation) updated.reputation = Math.min(100, Math.max(0, updated.reputation + outcome.reputation));
      if (outcome.foodWaste) updated.cash -= outcome.foodWaste;
      if (outcome.deliveryEnabled && !updated.delivery.platforms.includes('doordash')) {
        updated.delivery.platforms.push('doordash');
      }
      return updated;
    });
  };

  const closeScenario = () => {
    setScenario(null);
    setScenarioResult(null);
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
    setSetup({ cuisine: null, capital: 75000, name: '', location: 'urban', goal: 'survive' });
    setGame(null);
    setScenario(null);
    setScenarioResult(null);
  };

  // ============================================
  // RENDER SCREENS
  // ============================================

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <View style={styles.welcomeDivider} />
          <Text style={styles.welcomeQuote}>"Behind every great restaurant is a story of survival."</Text>
          <Text style={styles.welcomeSubtext}>Build your restaurant empire.{'\n'}Manage staff, menus, and chaos.{'\n'}Try not to get 86'd.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setScreen('onboarding')}>
            <Text style={styles.startButtonText}>START YOUR JOURNEY</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v3.5.0</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Onboarding
  if (screen === 'onboarding') {
    const steps = [
      { title: 'Choose Your Cuisine', key: 'cuisine' },
      { title: 'Starting Capital', key: 'capital' },
      { title: 'Name Your Restaurant', key: 'name' },
      { title: 'Choose Location', key: 'location' },
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
                {step.key === 'cuisine' && "What type of restaurant are you opening? This affects your menu, food costs, and average ticket."}
                {step.key === 'capital' && "How much are you investing? More capital = more runway, but higher expectations."}
                {step.key === 'name' && "What will you call your restaurant?"}
                {step.key === 'location' && "Where will you open? Urban = more traffic but higher costs."}
                {step.key === 'goal' && "What's your definition of success?"}
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
                  <Text style={[styles.capitalAmount, { color: setup.capital < 50000 ? colors.accent : setup.capital < 100000 ? colors.warning : colors.success }]}>{formatCurrency(setup.capital)}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: setup.capital < 50000 ? colors.accent : setup.capital < 100000 ? colors.warning : colors.success }]}>
                    <Text style={styles.tierText}>{setup.capital < 50000 ? 'BOOTSTRAP' : setup.capital < 100000 ? 'STANDARD' : setup.capital < 200000 ? 'WELL-FUNDED' : 'PREMIUM'}</Text>
                  </View>
                </View>
                <Slider style={styles.slider} minimumValue={25000} maximumValue={500000} step={5000} value={setup.capital} onValueChange={(v) => setSetup(s => ({ ...s, capital: v }))} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.surfaceLight} thumbTintColor={colors.primary} />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>$25K</Text>
                  <Text style={styles.sliderLabel}>$500K</Text>
                </View>
              </>
            )}

            {step.key === 'name' && (
              <TextInput style={styles.textInput} placeholder="e.g., The Golden Fork" placeholderTextColor={colors.textMuted} value={setup.name} onChangeText={(t) => setSetup(s => ({ ...s, name: t }))} />
            )}

            {step.key === 'location' && (
              <View style={styles.optionRow}>
                {[{ id: 'urban', name: 'Urban', desc: '+20% traffic, +20% rent' }, { id: 'suburban', name: 'Suburban', desc: 'Balanced' }, { id: 'rural', name: 'Rural', desc: '-20% traffic, -20% rent' }].map(loc => (
                  <TouchableOpacity key={loc.id} style={[styles.optionButton, setup.location === loc.id && styles.optionButtonActive]} onPress={() => setSetup(s => ({ ...s, location: loc.id }))}>
                    <Text style={[styles.optionText, setup.location === loc.id && styles.optionTextActive]}>{loc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step.key === 'goal' && (
              <View style={styles.goalOptions}>
                {GOALS.map(g => (
                  <TouchableOpacity key={g.id} style={[styles.goalButton, setup.goal === g.id && styles.goalButtonActive]} onPress={() => setSetup(s => ({ ...s, goal: g.id }))}>
                    <Text style={[styles.goalText, setup.goal === g.id && styles.goalTextActive]}>{g.name}</Text>
                    <Text style={styles.goalDesc}>{g.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]} onPress={() => onboardingStep < steps.length - 1 ? setOnboardingStep(s => s + 1) : initGame()} disabled={!canContinue}>
              <Text style={[styles.continueButtonText, !canContinue && styles.continueButtonTextDisabled]}>{onboardingStep < steps.length - 1 ? 'CONTINUE' : 'OPEN YOUR DOORS'}</Text>
            </TouchableOpacity>
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
                      <Text style={styles.cuisineStats}>Food: {formatPct(c.foodCost)} • Ticket: {formatCurrency(c.avgTicket)}</Text>
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

  // Scenario Screen
  if (scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.scenarioContainer}>
          <View style={styles.scenarioContent}>
            <View style={styles.scenarioHeader}>
              <View style={[styles.scenarioTypeBadge, { backgroundColor: scenario.type === 'crisis' ? colors.accent : colors.success }]}>
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
                  <Text style={styles.scenarioChance}>{Math.round(opt.successChance * 100)}%</Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <View style={styles.scenarioResult}>
                  <Text style={[styles.scenarioResultText, { color: scenarioResult.success ? colors.success : colors.accent }]}>{scenarioResult.success ? '✓ SUCCESS' : '✗ FAILED'}</Text>
                  {scenarioResult.outcome.cash && <Text style={{ color: scenarioResult.outcome.cash > 0 ? colors.success : colors.accent }}>{formatCurrency(scenarioResult.outcome.cash)}</Text>}
                  {scenarioResult.outcome.reputation && <Text style={{ color: scenarioResult.outcome.reputation > 0 ? colors.success : colors.accent }}>Reputation {scenarioResult.outcome.reputation > 0 ? '+' : ''}{scenarioResult.outcome.reputation}</Text>}
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

  // Game Over Screen
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
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Customers Served</Text><Text style={styles.endStatValue}>{game?.customersServed?.total || 0}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Staff Employed</Text><Text style={styles.endStatValue}>{game?.staff?.length || 0}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game?.achievements?.length || 0}</Text></View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={restart}><Text style={styles.restartButtonText}>TRY AGAIN</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Win Screen
  if (screen === 'win') {
    const goal = GOALS.find(g => g.id === setup.goal);
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
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Total Revenue</Text><Text style={styles.endStatValue}>{formatCurrency(game?.totalRevenue || 0)}</Text></View>
            <View style={styles.endStatRow}><Text style={styles.endStatLabel}>Achievements</Text><Text style={styles.endStatValue}>{game?.achievements?.length || 0}/{Object.keys(ACHIEVEMENTS).length}</Text></View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={restart}><Text style={styles.restartButtonText}>PLAY AGAIN</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Dashboard
  if (screen === 'dashboard' && game) {
    const cuisine = CUISINES.find(c => c.id === setup.cuisine);
    const isLowCash = game.cash < setup.capital * 0.1;
    const isHighBurnout = game.burnout > 70;

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
        {(isLowCash || isHighBurnout) && (
          <View style={styles.warningBanner}>
            {isLowCash && <Text style={styles.warningText}>⚠️ Low Cash</Text>}
            {isHighBurnout && <Text style={styles.warningText}>⚠️ High Burnout</Text>}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['overview', 'menu', 'staff', 'ops', 'achieve'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.dashContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <View style={styles.cashDisplay}>
                <Text style={styles.cashLabel}>CASH ON HAND</Text>
                <Text style={[styles.cashAmount, { color: game.cash < 0 ? colors.accent : colors.textPrimary }]}>{formatCurrency(game.cash)}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}><Text style={styles.statLabel}>LAST WEEK</Text><Text style={[styles.statValue, { color: game.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.lastWeekProfit)}</Text></View>
                  <View style={styles.statItem}><Text style={styles.statLabel}>REPUTATION</Text><Text style={styles.statValue}>{game.reputation}%</Text></View>
                  <View style={styles.statItem}><Text style={styles.statLabel}>COVERS</Text><Text style={styles.statValue}>{game.covers}</Text></View>
                </View>
                {game.weeklyHistory.length > 1 && <MiniChart data={game.weeklyHistory.map(w => w.profit)} color={colors.success} />}
              </View>

              <View style={styles.burnoutCard}>
                <View style={styles.burnoutHeader}>
                  <Text style={styles.burnoutLabel}>Owner Burnout</Text>
                  <Text style={[styles.burnoutValue, { color: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]}>{game.burnout}%</Text>
                </View>
                <View style={styles.burnoutBarBg}>
                  <View style={[styles.burnoutBar, { width: `${game.burnout}%`, backgroundColor: game.burnout > 70 ? colors.accent : game.burnout > 40 ? colors.warning : colors.success }]} />
                </View>
              </View>

              {game.lastWeekRevenue > 0 && (
                <View style={styles.weeklyCard}>
                  <Text style={styles.weeklyTitle}>LAST WEEK BREAKDOWN</Text>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Revenue</Text><Text style={styles.weeklyValue}>{formatCurrency(game.lastWeekRevenue)}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Food Cost</Text><Text style={[styles.weeklyValue, { color: colors.accent }]}>-{formatCurrency(game.lastWeekCosts?.food || 0)}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Labor</Text><Text style={[styles.weeklyValue, { color: colors.accent }]}>-{formatCurrency(game.lastWeekCosts?.labor || 0)}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Rent & Utils</Text><Text style={[styles.weeklyValue, { color: colors.accent }]}>-{formatCurrency((game.lastWeekCosts?.rent || 0) + (game.lastWeekCosts?.utilities || 0))}</Text></View>
                  {game.lastWeekCosts?.marketing > 0 && <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Marketing</Text><Text style={[styles.weeklyValue, { color: colors.accent }]}>-{formatCurrency(game.lastWeekCosts?.marketing || 0)}</Text></View>}
                  <View style={[styles.weeklyRow, styles.weeklyTotalRow]}><Text style={styles.weeklyTotalLabel}>Net Profit</Text><Text style={[styles.weeklyTotalValue, { color: game.lastWeekProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.lastWeekProfit)}</Text></View>
                </View>
              )}

              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <TouchableOpacity style={styles.quickAction} onPress={() => setMarketingModal(true)}><Text style={styles.quickActionText}>📣 Marketing</Text></TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => setDeliveryModal(true)}><Text style={styles.quickActionText}>🛵 Delivery</Text></TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => setAnalyticsModal(true)}><Text style={styles.quickActionText}>📊 Analytics</Text></TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => setSaveModal(true)}><Text style={styles.quickActionText}>💾 Save</Text></TouchableOpacity>
              </View>

              {/* Active Systems */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                {game.marketing.channels.length > 1 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>📣 {game.marketing.channels.length} channels</Text></View>}
                {game.delivery.platforms.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>🛵 {game.delivery.platforms.length} platforms</Text></View>}
                {game.virtualBrands.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>👻 {game.virtualBrands.length} brands</Text></View>}
                {game.equipment.length > 0 && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>⚙️ {game.equipment.length} equipment</Text></View>}
              </View>
            </>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.sectionTitle}>MENU ITEMS ({game.menu.length})</Text>
                <TouchableOpacity style={styles.addButton} onPress={addMenuItem}><Text style={styles.addButtonText}>+ Add Item</Text></TouchableOpacity>
              </View>
              {game.menu.map(item => (
                <View key={item.id} style={[styles.menuItem, item.is86d && styles.menuItem86d]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemName}>{item.name} {item.popular && '⭐'}</Text>
                    <Text style={styles.menuItemStats}>{formatCurrency(item.price)} • {formatPct(item.cost / item.price)} cost</Text>
                  </View>
                  {item.is86d && <Text style={styles.tag86d}>86'd</Text>}
                  <TouchableOpacity style={styles.menuAction} onPress={() => toggle86(item.id)}>
                    <Text style={styles.menuActionText}>{item.is86d ? '✓' : '✗'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.sectionTitle}>STAFF ({game.staff.length})</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setStaffModal(true)}><Text style={styles.addButtonText}>+ Hire</Text></TouchableOpacity>
              </View>
              {game.staff.map(s => (
                <View key={s.id} style={styles.staffCard}>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffIcon}>{s.icon}</Text>
                    <View>
                      <Text style={styles.staffName}>{s.name}</Text>
                      <Text style={styles.staffRole}>{s.role} • Skill {s.skill}/10 • ${s.wage}/hr</Text>
                      {s.training.length > 0 && <Text style={styles.certBadge}>{s.training.map(t => TRAINING_PROGRAMS.find(p => p.id === t)?.cert).join(', ')}</Text>}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => { setSelectedStaff(s); setTrainingModal(true); }}><Text style={{ color: colors.info }}>📚</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.fireButton} onPress={() => fireStaff(s.id)}><Text style={styles.fireButtonText}>Fire</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Ops Tab */}
          {activeTab === 'ops' && (
            <>
              <Text style={styles.sectionTitle}>EQUIPMENT</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {EQUIPMENT.map(eq => {
                  const owned = game.equipment.includes(eq.id);
                  return (
                    <TouchableOpacity key={eq.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => buyEquipment(eq)} disabled={owned || game.cash < eq.cost}>
                      <Text style={{ fontSize: 24 }}>{eq.icon}</Text>
                      <Text style={styles.equipName}>{eq.name}</Text>
                      <Text style={styles.equipCost}>{owned ? '✓' : formatCurrency(eq.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>UPGRADES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {UPGRADES.map(up => {
                  const owned = game.upgrades.includes(up.id);
                  return (
                    <TouchableOpacity key={up.id} style={[styles.equipCard, owned && styles.equipCardOwned]} onPress={() => buyUpgrade(up)} disabled={owned || game.cash < up.cost}>
                      <Text style={{ fontSize: 24 }}>{up.icon}</Text>
                      <Text style={styles.equipName}>{up.name}</Text>
                      <Text style={styles.equipCost}>{owned ? '✓' : formatCurrency(up.cost)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>VIRTUAL BRANDS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {VIRTUAL_BRANDS.map(vb => {
                  const active = game.virtualBrands.includes(vb.id);
                  return (
                    <TouchableOpacity key={vb.id} style={[styles.equipCard, active && styles.equipCardOwned]} onPress={() => launchVirtualBrand(vb.id)} disabled={active || game.cash < 2000}>
                      <Text style={{ fontSize: 24 }}>{vb.icon}</Text>
                      <Text style={styles.equipName}>{vb.name}</Text>
                      <Text style={styles.equipCost}>{active ? '✓ Active' : '$2,000'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achieve' && (
            <>
              {Object.entries(
                Object.entries(ACHIEVEMENTS).reduce((acc, [id, ach]) => {
                  const cat = ach.category || 'other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push({ id, ...ach });
                  return acc;
                }, {})
              ).map(([cat, achs]) => (
                <View key={cat} style={{ marginBottom: 16 }}>
                  <Text style={styles.achievementCategory}>{cat.toUpperCase()}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {achs.map(ach => {
                      const unlocked = game.achievements.includes(ach.id);
                      return (
                        <View key={ach.id} style={[styles.achievementBadge, unlocked && styles.achievementUnlocked]}>
                          <Text style={{ fontSize: 24, opacity: unlocked ? 1 : 0.3 }}>{ach.icon}</Text>
                          <Text style={[styles.achievementName, { opacity: unlocked ? 1 : 0.5 }]}>{ach.name}</Text>
                          <Text style={styles.achievementDesc}>{ach.desc}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Staff Modal */}
        <Modal visible={staffModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hire Staff</Text>
                <TouchableOpacity onPress={() => setStaffModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.hireGrid}>
                {STAFF_TEMPLATES.map(t => (
                  <TouchableOpacity key={t.role} style={styles.hireCard} onPress={() => hireStaff(t)} disabled={game.cash < t.wage * 40}>
                    <Text style={styles.hireIcon}>{t.icon}</Text>
                    <Text style={styles.hireRole}>{t.role}</Text>
                    <Text style={styles.hireWage}>${t.wage}/hr</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Training Modal */}
        <Modal visible={trainingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Train {selectedStaff?.name}</Text>
                <TouchableOpacity onPress={() => { setTrainingModal(false); setSelectedStaff(null); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              {TRAINING_PROGRAMS.map(p => {
                const alreadyHas = selectedStaff?.training?.includes(p.id);
                return (
                  <TouchableOpacity key={p.id} style={styles.trainingOption} onPress={() => startTraining(p)} disabled={alreadyHas || game.cash < p.cost}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{p.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trainingName}>{p.name}</Text>
                      <Text style={styles.trainingInfo}>{formatCurrency(p.cost)} • {p.weeks} week(s) • +{p.skillBoost} skill</Text>
                      {p.cert && <Text style={styles.trainingCert}>Earns: {p.cert}</Text>}
                    </View>
                    <Text style={{ color: alreadyHas ? colors.success : colors.textMuted }}>{alreadyHas ? '✓' : '→'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modal>

        {/* Marketing Modal */}
        <Modal visible={marketingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📣 Marketing</Text>
                <TouchableOpacity onPress={() => setMarketingModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400, padding: 16 }}>
                <Text style={styles.sectionTitle}>CHANNELS</Text>
                {MARKETING_CHANNELS.map(c => {
                  const active = game.marketing.channels.includes(c.id);
                  return (
                    <TouchableOpacity key={c.id} style={[styles.marketingItem, active && styles.marketingItemActive]} onPress={() => toggleMarketingChannel(c.id)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.marketingName}>{c.icon} {c.name}</Text>
                        <Text style={styles.marketingCost}>{c.costPerWeek > 0 ? `${formatCurrency(c.costPerWeek)}/week` : 'Free'} • {Math.round(c.effect.reach * 100 || c.effect.retention * 100)}% {c.effect.reach ? 'reach' : 'retention'}</Text>
                      </View>
                      <Text style={{ color: active ? colors.success : colors.textMuted }}>{active ? '✓' : '+'}</Text>
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
                <Text style={styles.modalTitle}>🛵 Delivery</Text>
                <TouchableOpacity onPress={() => setDeliveryModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400, padding: 16 }}>
                <Text style={styles.sectionTitle}>PLATFORMS</Text>
                {DELIVERY_PLATFORMS.map(p => {
                  const active = game.delivery.platforms.includes(p.id);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.marketingItem, active && styles.marketingItemActive]} onPress={() => toggleDeliveryPlatform(p.id)} disabled={!active && game.cash < p.setup}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.marketingName}>{p.icon} {p.name}</Text>
                        <Text style={styles.marketingCost}>{Math.round(p.commission * 100)}% commission • {p.setup > 0 ? `${formatCurrency(p.setup)} setup` : 'No setup'}</Text>
                      </View>
                      <Text style={{ color: active ? colors.success : game.cash < p.setup ? colors.accent : colors.textMuted }}>{active ? '✓ Active' : game.cash < p.setup ? "Can't afford" : 'Enable'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Analytics Modal */}
        <Modal visible={analyticsModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📊 Analytics</Text>
                <TouchableOpacity onPress={() => setAnalyticsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 500, padding: 16 }}>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Revenue Trend</Text>
                  <MiniChart data={game.weeklyHistory.map(w => w.revenue)} color={colors.primary} height={60} />
                </View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Profit Trend</Text>
                  <MiniChart data={game.weeklyHistory.map(w => w.profit)} color={colors.success} height={60} />
                </View>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Key Metrics</Text>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Total Revenue</Text><Text style={styles.weeklyValue}>{formatCurrency(game.totalRevenue)}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Total Profit</Text><Text style={[styles.weeklyValue, { color: game.totalProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.totalProfit)}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Avg Weekly</Text><Text style={styles.weeklyValue}>{formatCurrency(game.totalRevenue / Math.max(1, game.week))}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Customers</Text><Text style={styles.weeklyValue}>{game.customersServed.total}</Text></View>
                  <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Delivery Orders</Text><Text style={styles.weeklyValue}>{game.delivery.orders}</Text></View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Save Modal */}
        <Modal visible={saveModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💾 Save/Load</Text>
                <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <View style={{ padding: 16 }}>
                {[1, 2, 3].map(slot => {
                  const save = savedGames.find(s => s.slot === slot);
                  return (
                    <View key={slot} style={styles.saveSlot}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                        {save ? <Text style={styles.saveSlotInfo}>{save.setup.name} • Week {save.game.week}</Text> : <Text style={styles.saveSlotInfo}>Empty</Text>}
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
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeTitle: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -4 },
  welcomeDivider: { width: 60, height: 3, backgroundColor: colors.primary, marginVertical: 16 },
  welcomeQuote: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', marginBottom: 8 },
  welcomeSubtext: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  startButton: { backgroundColor: colors.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: 8 },
  startButtonText: { color: colors.background, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  versionText: { position: 'absolute', bottom: 24, fontSize: 11, color: colors.textMuted },
  onboardingContainer: { flex: 1 },
  onboardingContent: { padding: 24, paddingTop: 16 },
  progressBarContainer: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  stepText: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  messageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24, minHeight: 80 },
  messageText: { fontSize: 16, color: colors.textPrimary, lineHeight: 26 },
  dropdownButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 16, color: colors.textPrimary },
  dropdownPlaceholder: { fontSize: 16, color: colors.textMuted },
  dropdownArrow: { color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
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
  selectedCuisine: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '20', padding: 16, borderRadius: 8, marginTop: 16 },
  selectedIcon: { fontSize: 36, marginRight: 12 },
  selectedName: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  selectedStats: { fontSize: 12, color: colors.textSecondary },
  capitalDisplay: { alignItems: 'center', marginBottom: 16 },
  capitalAmount: { fontSize: 48, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
  tierText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, color: colors.textMuted },
  textInput: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, fontSize: 16, color: colors.textPrimary },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 8, alignItems: 'center' },
  optionButtonActive: { backgroundColor: colors.primary + '30', borderWidth: 2, borderColor: colors.primary },
  optionText: { fontSize: 14, color: colors.textSecondary },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
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
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dashTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  dashSubtitle: { fontSize: 12, color: colors.textMuted },
  nextWeekButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  nextWeekText: { fontSize: 13, fontWeight: '600', color: colors.background },
  dashContent: { flex: 1, padding: 16 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.primary },
  warningBanner: { backgroundColor: colors.accent + '20', padding: 8, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  warningText: { color: colors.accent, fontSize: 12, fontWeight: '500' },
  cashDisplay: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 16 },
  cashLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  cashAmount: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, marginVertical: 4 },
  statsRow: { flexDirection: 'row', marginTop: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  burnoutCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16 },
  burnoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  burnoutLabel: { fontSize: 14, color: colors.textSecondary },
  burnoutValue: { fontSize: 16, fontWeight: '700' },
  burnoutBarBg: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, marginTop: 8 },
  burnoutBar: { height: '100%', borderRadius: 3 },
  weeklyCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12 },
  weeklyTitle: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 12 },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  weeklyLabel: { fontSize: 14, color: colors.textSecondary },
  weeklyValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  weeklyTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 },
  weeklyTotalLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '600' },
  weeklyTotalValue: { fontSize: 18, fontWeight: '700' },
  quickAction: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  quickActionText: { fontSize: 12, color: colors.textSecondary },
  activeBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  activeBadgeText: { fontSize: 10, color: colors.textSecondary },
  sectionTitle: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 12, fontWeight: '600' },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: colors.background },
  menuItem: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  menuItem86d: { opacity: 0.6 },
  menuItemName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  menuItemStats: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  menuAction: { backgroundColor: colors.surfaceLight, width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  menuActionText: { fontSize: 12 },
  tag86d: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, color: colors.textPrimary, marginRight: 8 },
  staffCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  staffIcon: { fontSize: 24, marginRight: 10 },
  staffName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  staffRole: { fontSize: 11, color: colors.textMuted },
  certBadge: { backgroundColor: colors.info + '30', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, fontSize: 8, color: colors.info, marginTop: 2 },
  fireButton: { backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  fireButtonText: { fontSize: 11, fontWeight: '500', color: colors.textPrimary },
  hireGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  hireCard: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  hireIcon: { fontSize: 24 },
  hireRole: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  hireWage: { fontSize: 10, color: colors.textMuted },
  trainingOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  trainingName: { fontSize: 14, color: colors.textPrimary },
  trainingInfo: { fontSize: 11, color: colors.textMuted },
  trainingCert: { fontSize: 10, color: colors.info },
  equipCard: { backgroundColor: colors.surface, padding: 10, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  equipCardOwned: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  equipName: { fontSize: 9, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  equipCost: { fontSize: 9, color: colors.textMuted },
  marketingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  marketingItemActive: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  marketingName: { fontSize: 14, color: colors.textPrimary },
  marketingCost: { fontSize: 11, color: colors.textMuted },
  analyticsCard: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 12 },
  analyticsTitle: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  achievementCategory: { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  achievementBadge: { backgroundColor: colors.surface, padding: 8, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  achievementUnlocked: { backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary },
  achievementName: { fontSize: 10, color: colors.textPrimary, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  achievementDesc: { fontSize: 8, color: colors.textMuted, textAlign: 'center' },
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
  scenarioResultText: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  lessonBox: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, marginTop: 20 },
  lessonLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  lessonText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  endTitle: { fontSize: 28, fontWeight: '700', color: colors.accent },
  endSubtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  endDivider: { width: 60, height: 3, marginVertical: 24 },
  endMessage: { fontSize: 16, color: colors.textMuted, marginBottom: 24 },
  endStats: { width: '100%', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24 },
  endStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  endStatLabel: { fontSize: 14, color: colors.textSecondary },
  endStatValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  winCondition: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: colors.textPrimary },
  restartButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  restartButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  saveSlot: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  saveSlotTitle: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  saveSlotInfo: { fontSize: 12, color: colors.textMuted },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  saveButtonText: { fontSize: 12, fontWeight: '500', color: colors.background },
});
