// ============================================
// ACHIEVEMENTS & MILESTONES
// ============================================

export const MILESTONES = [
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

export const ACHIEVEMENTS = {
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

export const PHASE5_ACHIEVEMENTS = [
  { id: 'nightmare_survivor', name: 'Nightmare Survivor', description: 'Survive 52 weeks on Nightmare', icon: '💀', reward: 50000 },
  { id: 'speedrunner', name: 'Speedrunner', description: 'Reach $1M valuation in under 52 weeks', icon: '⚡', reward: 25000 },
  { id: 'staff_loyalty', name: 'Staff Loyalty', description: 'Keep same employee for 52+ weeks', icon: '💪', reward: 10000 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'All metrics positive for a week', icon: '✨', reward: 5000 },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Recover from negative cash to $100K+', icon: '🔥', reward: 20000 },
  { id: 'no_loans', name: 'Bootstrap King', description: 'Reach $500K valuation without loans', icon: '💎', reward: 30000 },
  { id: 'franchise_empire', name: 'Franchise Empire', description: 'Have 10 active franchises', icon: '🌐', reward: 75000 },
  { id: 'theme_collector', name: 'Theme Collector', description: 'Try all 5 color themes', icon: '🎨', reward: 2500 },
];

export const PHASE6_ACHIEVEMENTS = [
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

export const PHASE7_ACHIEVEMENTS = [
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Share 10 milestones to social media', icon: '🦋', reward: 5000 },
  { id: 'tournament_champion', name: 'Tournament Champion', description: 'Win your first weekly tournament', icon: '🏆', reward: 25000 },
  { id: 'seasonal_master', name: 'Seasonal Master', description: 'Complete all objectives in a seasonal challenge', icon: '🌟', reward: 50000 },
  { id: 'leaderboard_climber', name: 'Leaderboard Climber', description: 'Reach top 100 in any leaderboard', icon: '📊', reward: 15000 },
  { id: 'recipe_creator', name: 'Recipe Creator', description: 'List a recipe on the marketplace', icon: '📝', reward: 10000 },
  { id: 'staff_trader', name: 'Staff Trader', description: 'Buy or sell staff on the marketplace', icon: '🤝', reward: 10000 },
  { id: 'partnership_pioneer', name: 'Partnership Pioneer', description: 'Join your first co-op partnership', icon: '🤜🤛', reward: 20000 },
  { id: 'dynasty_founder', name: 'Dynasty Founder', description: 'Pass your restaurant to the next generation', icon: '👴', reward: 75000 },
  { id: 'badge_collector', name: 'Badge Collector', description: 'Collect 20 profile badges', icon: '🎖️', reward: 30000 },
  { id: 'title_upgrade', name: 'Title Upgrade', description: 'Earn a new profile title', icon: '📛', reward: 15000 },
  { id: 'marketplace_mogul', name: 'Marketplace Mogul', description: 'Complete 50 marketplace transactions', icon: '💼', reward: 40000 },
  { id: 'global_top_10', name: 'Global Elite', description: 'Reach top 10 globally in any category', icon: '🌍', reward: 100000 },
];

export const PHASE_8_ACHIEVEMENTS = [
  { id: 'career_builder', name: 'Career Builder', desc: 'Promote a staff member to max level', icon: '📈', reward: 3000 },
  { id: 'competition_winner', name: 'Competition Winner', desc: 'Win your first food competition', icon: '🏆', reward: 7500 },
  { id: 'iron_chef', name: 'Iron Chef', desc: 'Win the Iron Chef Challenge', icon: '⚔️', reward: 25000 },
  { id: 'michelin_star', name: 'Michelin Contender', desc: 'Complete the Michelin Contender competition', icon: '⭐', reward: 100000 },
  { id: 'recipe_innovator', name: 'Recipe Innovator', desc: 'Develop 10 custom recipes', icon: '📝', reward: 10000 },
  { id: 'event_specialist', name: 'Event Specialist', desc: 'Host 25 special events', icon: '🎪', reward: 15000 },
  { id: 'market_researcher', name: 'Market Researcher', desc: 'Complete all research topics', icon: '🔍', reward: 20000 },
  { id: 'prestige_master', name: 'Prestige Master', desc: 'Unlock all prestige upgrades', icon: '👑', reward: 50000 },
];

export const PHASE_9_ACHIEVEMENTS = [
  { id: 'perfect_inspection', name: 'Perfect Score', desc: 'Get an A grade on health inspection', icon: '🅰️', reward: 5000 },
  { id: 'five_stars', name: 'Five Star Fame', desc: 'Reach 4.8+ rating on all platforms', icon: '⭐', reward: 15000 },
  { id: 'viral_sensation', name: 'Viral Sensation', desc: 'Have a social media post go viral', icon: '📱', reward: 10000 },
  { id: 'weather_warrior', name: 'Weather Warrior', desc: 'Profit during 10 bad weather weeks', icon: '⛈️', reward: 8000 },
  { id: 'benefits_king', name: 'Best Employer', desc: 'Offer all employee benefits', icon: '👑', reward: 20000 },
  { id: 'zero_breakdowns', name: 'Well Oiled Machine', desc: 'Go 52 weeks without equipment breakdown', icon: '🔧', reward: 12000 },
  { id: 'regular_army', name: 'Regular Army', desc: 'Have 100+ regular customers', icon: '🏠', reward: 7500 },
  { id: 'analytics_master', name: 'Data Driven', desc: 'Beat all KPI targets for 4 weeks', icon: '📊', reward: 10000 },
];

export const ULTIMATE_ACHIEVEMENTS = [
  { id: 'true_empire', name: 'True Empire', desc: '$50M+ valuation across 50+ locations', icon: '👑', reward: 500000, legendary: true },
  { id: 'global_brand', name: 'Global Brand', desc: 'Operate in 5+ countries', icon: '🌍', reward: 250000, legendary: true },
  { id: 'industry_titan', name: 'Industry Titan', desc: 'Complete all industry influence actions', icon: '🏛️', reward: 300000, legendary: true },
  { id: 'mentor_legend', name: 'Mentor Legend', desc: 'Train 10+ successful protégés', icon: '👨‍🏫', reward: 150000, legendary: true },
  { id: 'legacy_master', name: 'Legacy Master', desc: 'Max out all legacy perks', icon: '📜', reward: 200000, legendary: true },
  { id: 'acquisition_king', name: 'Acquisition King', desc: 'Complete 5 M&A deals', icon: '🦈', reward: 400000, legendary: true },
  { id: 'perfect_run', name: 'Perfect Run', desc: 'Reach $10M without any crisis', icon: '✨', reward: 1000000, legendary: true },
  { id: 'speedrun_legend', name: 'Speedrun Legend', desc: 'Reach $1M in under 20 weeks', icon: '⚡', reward: 100000, legendary: true },
];

export const HALL_OF_FAME_CATEGORIES = [
  { id: 'longest_run', name: 'Longest Run', icon: '📅', stat: 'weeksSurvived', format: (v) => `${v} weeks` },
  { id: 'highest_revenue', name: 'Highest Revenue', icon: '💰', stat: 'peakWeeklyRevenue', format: (v) => `$${v.toLocaleString()}` },
  { id: 'biggest_empire', name: 'Biggest Empire', icon: '🏛️', stat: 'maxLocations', format: (v) => `${v} locations` },
  { id: 'highest_valuation', name: 'Highest Valuation', icon: '🏆', stat: 'peakValuation', format: (v) => `$${(v/1000000).toFixed(2)}M` },
  { id: 'most_staff', name: 'Most Staff', icon: '👥', stat: 'maxStaff', format: (v) => `${v} employees` },
];
