// ============================================
// MULTIPLAYER & SOCIAL SYSTEMS
// ============================================

// LEADERBOARD CATEGORIES
export const LEADERBOARD_CATEGORIES = [
  { id: 'weekly_revenue', name: 'Weekly Revenue', icon: '💰', stat: 'peakWeeklyRevenue', format: (v) => `$${v.toLocaleString()}` },
  { id: 'empire_value', name: 'Empire Value', icon: '🏛️', stat: 'empireValuation', format: (v) => `$${(v/1000000).toFixed(2)}M` },
  { id: 'survival_weeks', name: 'Longest Survival', icon: '📅', stat: 'week', format: (v) => `${v} weeks` },
  { id: 'total_locations', name: 'Most Locations', icon: '🏪', stat: 'totalLocations', format: (v) => `${v} locations` },
  { id: 'franchise_empire', name: 'Franchise Empire', icon: '🤝', stat: 'franchises', format: (v) => `${v} franchises` },
  { id: 'reputation_master', name: 'Reputation Master', icon: '⭐', stat: 'avgReputation', format: (v) => `${v.toFixed(1)}%` },
  { id: 'speedrun_millionaire', name: 'Fastest to $1M', icon: '⚡', stat: 'weeksTo1M', format: (v) => v ? `${v} weeks` : 'N/A', lowerBetter: true },
  { id: 'nightmare_king', name: 'Nightmare Mode', icon: '💀', stat: 'nightmareWeeks', format: (v) => `${v} weeks survived` },
];

// SEASONAL CHALLENGES
export const SEASONAL_CHALLENGES = [
  {
    id: 'winter_2025', season: 'Winter 2025', icon: '❄️', name: 'Frostbite Challenge',
    description: 'Survive the winter rush while managing heating costs and holiday staff',
    startDate: '2025-12-01', endDate: '2025-02-28',
    objectives: [
      { id: 'holiday_rush', name: 'Holiday Rush', description: 'Process 5,000+ covers in December', target: 5000, stat: 'decemberCovers', reward: 25000 },
      { id: 'staff_retention', name: 'Holiday Spirit', description: 'Keep morale above 70% all season', target: 70, stat: 'minMorale', reward: 15000 },
      { id: 'profit_margins', name: 'Winter Profits', description: 'Maintain 15%+ profit margins', target: 15, stat: 'profitMargin', reward: 20000 },
    ],
    globalReward: { title: 'Frostbite Survivor', badge: '❄️', cash: 50000 },
  },
  {
    id: 'spring_2026', season: 'Spring 2026', icon: '🌸', name: 'Spring Awakening',
    description: 'Capitalize on outdoor dining season and lighter menu trends',
    startDate: '2026-03-01', endDate: '2026-05-31',
    objectives: [
      { id: 'patio_profit', name: 'Patio Paradise', description: 'Generate $50K from outdoor seating', target: 50000, stat: 'patioRevenue', reward: 20000 },
      { id: 'new_menu', name: 'Fresh Start', description: 'Launch 5 new menu items', target: 5, stat: 'newItems', reward: 10000 },
      { id: 'expansion', name: 'Growth Season', description: 'Open 2 new locations', target: 2, stat: 'newLocations', reward: 35000 },
    ],
    globalReward: { title: 'Spring Champion', badge: '🌸', cash: 50000 },
  },
  {
    id: 'summer_2026', season: 'Summer 2026', icon: '☀️', name: 'Summer Sizzle',
    description: 'Master the tourist season and outdoor events',
    startDate: '2026-06-01', endDate: '2026-08-31',
    objectives: [
      { id: 'food_truck', name: 'Festival Circuit', description: 'Earn $100K from food truck events', target: 100000, stat: 'truckRevenue', reward: 30000 },
      { id: 'catering', name: 'Summer Parties', description: 'Complete 10 catering events', target: 10, stat: 'cateringEvents', reward: 25000 },
      { id: 'peak_week', name: 'Peak Performance', description: 'Hit $100K in a single week', target: 100000, stat: 'peakWeeklyRevenue', reward: 40000 },
    ],
    globalReward: { title: 'Summer King/Queen', badge: '☀️', cash: 75000 },
  },
  {
    id: 'fall_2026', season: 'Fall 2026', icon: '🍂', name: 'Harvest Hustle',
    description: 'Prepare for the holiday season while maximizing fall flavors',
    startDate: '2026-09-01', endDate: '2026-11-30',
    objectives: [
      { id: 'virtual_brand', name: 'Ghost Kitchen Master', description: 'Launch 3 virtual brands', target: 3, stat: 'virtualBrands', reward: 20000 },
      { id: 'investor', name: 'Fundraising Season', description: 'Secure $500K in investment', target: 500000, stat: 'investmentRaised', reward: 35000 },
      { id: 'training', name: 'Team Building', description: 'Train 10 staff members', target: 10, stat: 'staffTrained', reward: 15000 },
    ],
    globalReward: { title: 'Harvest Hero', badge: '🍂', cash: 60000 },
  },
];

// WEEKLY TOURNAMENTS
export const WEEKLY_TOURNAMENTS = [
  { id: 'revenue_rush', name: 'Revenue Rush', icon: '💵', description: 'Highest weekly revenue wins', stat: 'weeklyRevenue', duration: 7, prizes: [100000, 50000, 25000, 10000, 5000] },
  { id: 'efficiency_expert', name: 'Efficiency Expert', icon: '📊', description: 'Best profit margin wins', stat: 'profitMargin', duration: 7, prizes: [75000, 35000, 15000, 7500, 3000] },
  { id: 'expansion_expedition', name: 'Expansion Expedition', icon: '🚀', description: 'Most locations opened wins', stat: 'newLocations', duration: 14, prizes: [150000, 75000, 35000, 15000, 7500] },
  { id: 'customer_champion', name: 'Customer Champion', icon: '⭐', description: 'Highest average rating wins', stat: 'avgReputation', duration: 7, prizes: [50000, 25000, 12500, 6000, 3000] },
  { id: 'survival_sprint', name: 'Survival Sprint', icon: '🏃', description: 'Longest survival on Hard+ mode', stat: 'hardModeSurvival', duration: 30, prizes: [200000, 100000, 50000, 25000, 10000] },
];

// PLAYER PROFILE SYSTEM
export const PROFILE_BADGES = [
  { id: 'first_profit', name: 'First Blood', icon: '💵', description: 'Made your first profit', rarity: 'common' },
  { id: 'week_survivor', name: 'Week One', icon: '📅', description: 'Survived your first week', rarity: 'common' },
  { id: 'year_one', name: 'Veteran', icon: '🎖️', description: 'Survived 52 weeks', rarity: 'rare' },
  { id: 'millionaire', name: 'Millionaire', icon: '💰', description: 'Reached $1M valuation', rarity: 'epic' },
  { id: 'multi_mogul', name: 'Multi-Location Mogul', icon: '🏛️', description: 'Own 5+ locations', rarity: 'epic' },
  { id: 'franchise_king', name: 'Franchise King', icon: '👑', description: 'Have 10+ franchises', rarity: 'legendary' },
  { id: 'nightmare_survivor', name: 'Nightmare Survivor', icon: '💀', description: 'Survived 52 weeks on Nightmare', rarity: 'legendary' },
  { id: 'ipo_master', name: 'Wall Street', icon: '📈', description: 'Completed an IPO', rarity: 'mythic' },
  { id: 'exit_strategy', name: 'Exit Master', icon: '🎯', description: 'Successfully sold your empire', rarity: 'mythic' },
  { id: 'seasonal_champion', name: 'Seasonal Champion', icon: '🏆', description: 'Won a seasonal challenge', rarity: 'legendary' },
  { id: 'tournament_winner', name: 'Tournament Winner', icon: '🥇', description: 'Won a weekly tournament', rarity: 'epic' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Reached $1M in under 26 weeks', rarity: 'mythic' },
];

export const PROFILE_TITLES = [
  { id: 'rookie', name: 'Rookie Owner', requirement: { runs: 1 }, color: '#A3A3A3' },
  { id: 'experienced', name: 'Experienced Owner', requirement: { runs: 5 }, color: '#10B981' },
  { id: 'veteran', name: 'Restaurant Veteran', requirement: { runs: 10, totalWeeks: 500 }, color: '#3B82F6' },
  { id: 'expert', name: 'Industry Expert', requirement: { runs: 25, millionaire: true }, color: '#8B5CF6' },
  { id: 'master', name: 'Restaurant Master', requirement: { runs: 50, totalWeeks: 2000, nightmareWin: true }, color: '#F59E0B' },
  { id: 'legend', name: 'Culinary Legend', requirement: { runs: 100, ipoComplete: true }, color: '#EC4899' },
  { id: 'titan', name: 'Restaurant Titan', requirement: { tournamentWins: 10, seasonalWins: 4 }, color: '#DC2626' },
];

// STAFF MARKETPLACE
export const STAFF_MARKETPLACE = {
  rarities: [
    { id: 'standard', name: 'Standard', color: '#A3A3A3', skillRange: [3, 5] },
    { id: 'skilled', name: 'Skilled', color: '#10B981', skillRange: [5, 7] },
    { id: 'expert', name: 'Expert', color: '#3B82F6', skillRange: [7, 8] },
    { id: 'elite', name: 'Elite', color: '#8B5CF6', skillRange: [8, 9] },
    { id: 'legendary', name: 'Legendary', color: '#F59E0B', skillRange: [9, 10] },
  ],
  sampleStaff: [
    { id: 'chef_marco', name: 'Chef Marco', role: 'Executive Chef', skill: 9.5, specialty: 'Italian', price: 75000, wage: 45 },
    { id: 'gm_sarah', name: 'Sarah Thompson', role: 'General Manager', skill: 9, specialty: 'Operations', price: 50000, wage: 35 },
    { id: 'sous_chen', name: 'Chen Wei', role: 'Sous Chef', skill: 8.5, specialty: 'Asian Fusion', price: 35000, wage: 28 },
    { id: 'bar_james', name: 'James Miller', role: 'Bar Manager', skill: 8, specialty: 'Craft Cocktails', price: 25000, wage: 24 },
    { id: 'host_maria', name: 'Maria Garcia', role: 'Host Manager', skill: 7.5, specialty: 'Customer Service', price: 15000, wage: 18 },
  ],
};

// COOPERATIVE MODE
export const COOP_PARTNERSHIP_TYPES = [
  {
    id: 'supply_chain', name: 'Supply Chain Alliance', icon: '📦',
    description: 'Share vendor contracts for bulk discounts',
    benefits: { foodCostReduction: 0.05, sharedDelivery: true },
    requirements: { minLocations: 2, minReputation: 60 },
  },
  {
    id: 'marketing', name: 'Marketing Collective', icon: '📢',
    description: 'Joint marketing campaigns for wider reach',
    benefits: { marketingBoost: 0.3, sharedFollowers: true },
    requirements: { minWeeks: 26, minReputation: 50 },
  },
  {
    id: 'staff_sharing', name: 'Staff Exchange Program', icon: '👥',
    description: 'Borrow staff during busy periods',
    benefits: { emergencyStaff: true, trainingSharing: true },
    requirements: { minStaff: 10, minMorale: 65 },
  },
  {
    id: 'investment_group', name: 'Investment Syndicate', icon: '💰',
    description: 'Pool resources for larger investments',
    benefits: { investmentPooling: true, sharedRisk: 0.5 },
    requirements: { minValuation: 500000, minLocations: 3 },
  },
  {
    id: 'franchise_network', name: 'Franchise Network', icon: '🤝',
    description: 'Cross-promote franchise opportunities',
    benefits: { franchiseBonus: 0.2, sharedTraining: true },
    requirements: { franchiseEnabled: true, minFranchises: 2 },
  },
];

// DYNASTY MODE
export const DYNASTY_GENERATIONS = [
  {
    id: 'founder', generation: 1, title: 'Founder',
    bonuses: { startingCash: 1.0, reputation: 1.0, staffLoyalty: 1.0 },
    challenges: ['No legacy advantages', 'Must build from scratch'],
  },
  {
    id: 'heir', generation: 2, title: 'Second Generation',
    bonuses: { startingCash: 1.25, reputation: 1.1, staffLoyalty: 1.15, inheritedStaff: 2 },
    challenges: ['Live up to expectations', 'Existing reputation to maintain'],
  },
  {
    id: 'successor', generation: 3, title: 'Third Generation',
    bonuses: { startingCash: 1.5, reputation: 1.2, staffLoyalty: 1.25, inheritedStaff: 4, brandRecognition: 0.1 },
    challenges: ['Family pressure', 'Modernize or maintain tradition'],
  },
  {
    id: 'legacy', generation: 4, title: 'Legacy Heir',
    bonuses: { startingCash: 2.0, reputation: 1.3, staffLoyalty: 1.4, inheritedStaff: 6, brandRecognition: 0.2, mediaConnections: true },
    challenges: ['Dynasty expectations', 'Industry is watching'],
  },
  {
    id: 'dynasty', generation: 5, title: 'Dynasty Leader',
    bonuses: { startingCash: 3.0, reputation: 1.5, staffLoyalty: 1.5, inheritedStaff: 10, brandRecognition: 0.3, mediaConnections: true, investorInterest: true },
    challenges: ['Multi-generational legacy', 'Empire management'],
  },
];

// SOCIAL SHARING TEMPLATES
export const SOCIAL_SHARE_TEMPLATES = [
  { id: 'milestone', title: 'Milestone Reached!', template: '🎉 Just hit {milestone} in 86\'d! {restaurant} is thriving after {weeks} weeks! #86dGame #RestaurantSim' },
  { id: 'expansion', title: 'New Location!', template: '🏪 Expanded my empire! {restaurant} just opened location #{locations}! #86dGame #RestaurantEmpire' },
  { id: 'valuation', title: 'Empire Valuation', template: '📈 My restaurant empire in 86\'d is now worth {valuation}! From food truck to franchise! #86dGame' },
  { id: 'survival', title: 'Survival Streak', template: '💪 {weeks} weeks and still going strong! {restaurant} refuses to be 86\'d! #86dGame #Survivor' },
  { id: 'tournament', title: 'Tournament Win', template: '🏆 Just won the {tournament} tournament in 86\'d! {prize} prize! #86dGame #Champion' },
  { id: 'franchise', title: 'Franchise Empire', template: '🤝 Now running {franchises} franchises! The {restaurant} brand is taking over! #86dGame #Franchising' },
  { id: 'ipo', title: 'IPO Complete', template: '📈 WE\'RE PUBLIC! {restaurant} just completed its IPO! Worth {valuation}! #86dGame #WallStreet' },
];
