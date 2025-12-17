// ============================================
// OPERATIONS & REALISM SYSTEMS
// ============================================

// WEATHER SYSTEM
export const WEATHER_CONDITIONS = [
  { id: 'sunny', name: 'Sunny', icon: '☀️', revenueModifier: 1.05, customerMod: 1.08, description: 'Perfect dining weather' },
  { id: 'partly_cloudy', name: 'Partly Cloudy', icon: '⛅', revenueModifier: 1.0, customerMod: 1.0, description: 'Normal conditions' },
  { id: 'cloudy', name: 'Cloudy', icon: '☁️', revenueModifier: 0.97, customerMod: 0.95, description: 'Slightly fewer walk-ins' },
  { id: 'rainy', name: 'Rainy', icon: '🌧️', revenueModifier: 0.85, customerMod: 0.75, description: 'Delivery orders up, dine-in down' },
  { id: 'stormy', name: 'Storm', icon: '⛈️', revenueModifier: 0.65, customerMod: 0.50, description: 'Major sales impact' },
  { id: 'snow', name: 'Snow', icon: '❄️', revenueModifier: 0.70, customerMod: 0.55, description: 'Staff may call out' },
  { id: 'heatwave', name: 'Heat Wave', icon: '🔥', revenueModifier: 0.90, customerMod: 0.85, description: 'AC costs up, patio closed' },
  { id: 'perfect', name: 'Perfect Day', icon: '🌈', revenueModifier: 1.15, customerMod: 1.20, description: 'Ideal conditions boost sales' },
];

// CUSTOMER SEGMENTS
export const CUSTOMER_SEGMENTS = [
  { id: 'regulars', name: 'Regulars', icon: '🏠', percentage: 35, avgSpend: 28, visitFreq: 'weekly', loyalty: 0.9, priceS: 0.7 },
  { id: 'families', name: 'Families', icon: '👨‍👩‍👧‍👦', percentage: 20, avgSpend: 65, visitFreq: 'bi-weekly', loyalty: 0.6, priceS: 0.8 },
  { id: 'business', name: 'Business Diners', icon: '💼', percentage: 15, avgSpend: 85, visitFreq: 'weekly', loyalty: 0.5, priceS: 0.3 },
  { id: 'date_night', name: 'Date Night', icon: '💑', percentage: 10, avgSpend: 95, visitFreq: 'monthly', loyalty: 0.4, priceS: 0.5 },
  { id: 'foodies', name: 'Foodies', icon: '📸', percentage: 8, avgSpend: 55, visitFreq: 'monthly', loyalty: 0.3, priceS: 0.4 },
  { id: 'tourists', name: 'Tourists', icon: '🧳', percentage: 7, avgSpend: 48, visitFreq: 'once', loyalty: 0.1, priceS: 0.6 },
  { id: 'delivery_only', name: 'Delivery Only', icon: '📦', percentage: 5, avgSpend: 32, visitFreq: 'weekly', loyalty: 0.7, priceS: 0.9 },
];

// REVIEW PLATFORMS
export const REVIEW_PLATFORMS = [
  { id: 'yelp', name: 'Yelp', icon: '🔴', weight: 0.35, minReviews: 10, description: 'Critical for new customers' },
  { id: 'google', name: 'Google', icon: '🟢', weight: 0.35, minReviews: 20, description: 'Affects search visibility' },
  { id: 'tripadvisor', name: 'TripAdvisor', icon: '🟡', weight: 0.15, minReviews: 5, description: 'Tourist traffic driver' },
  { id: 'opentable', name: 'OpenTable', icon: '🔵', weight: 0.10, minReviews: 15, description: 'Reservation quality' },
  { id: 'facebook', name: 'Facebook', icon: '🔷', weight: 0.05, minReviews: 8, description: 'Local community' },
];

// SOCIAL MEDIA EVENTS
export const SOCIAL_EVENTS = [
  { id: 'viral_video', name: 'Viral TikTok', icon: '📱', chance: 0.02, reputationBoost: 15, revenueBoost: 0.35, duration: 3 },
  { id: 'influencer_visit', name: 'Influencer Visit', icon: '⭐', chance: 0.05, reputationBoost: 8, revenueBoost: 0.20, duration: 2 },
  { id: 'food_blogger', name: 'Food Blog Feature', icon: '📝', chance: 0.08, reputationBoost: 5, revenueBoost: 0.12, duration: 4 },
  { id: 'local_news', name: 'Local News Spot', icon: '📺', chance: 0.03, reputationBoost: 10, revenueBoost: 0.25, duration: 2 },
  { id: 'negative_review', name: 'Negative Viral Review', icon: '😡', chance: 0.01, reputationBoost: -20, revenueBoost: -0.30, duration: 4 },
  { id: 'celebrity_sighting', name: 'Celebrity Sighting', icon: '🌟', chance: 0.01, reputationBoost: 25, revenueBoost: 0.50, duration: 2 },
];

// HEALTH INSPECTION SYSTEM
export const INSPECTION_GRADES = [
  { grade: 'A', score: 90, icon: '🅰️', reputationBonus: 5, customerMod: 1.05 },
  { grade: 'B', score: 80, icon: '🅱️', reputationBonus: 0, customerMod: 1.0 },
  { grade: 'C', score: 70, icon: '©️', reputationBonus: -10, customerMod: 0.85 },
  { grade: 'Closed', score: 0, icon: '🚫', reputationBonus: -30, customerMod: 0 },
];

export const HEALTH_VIOLATIONS = [
  { id: 'temp_control', name: 'Temperature Control', severity: 'critical', points: -15, fixCost: 500 },
  { id: 'cross_contam', name: 'Cross Contamination Risk', severity: 'critical', points: -12, fixCost: 300 },
  { id: 'hand_washing', name: 'Hand Washing Station', severity: 'major', points: -8, fixCost: 200 },
  { id: 'pest_evidence', name: 'Pest Evidence', severity: 'critical', points: -20, fixCost: 1500 },
  { id: 'food_storage', name: 'Improper Food Storage', severity: 'major', points: -6, fixCost: 150 },
  { id: 'cleaning', name: 'Cleaning Deficiency', severity: 'minor', points: -3, fixCost: 100 },
  { id: 'labeling', name: 'Missing Date Labels', severity: 'minor', points: -2, fixCost: 50 },
  { id: 'employee_health', name: 'Employee Health Policy', severity: 'major', points: -5, fixCost: 0 },
];

// EMPLOYEE BENEFITS SYSTEM
export const EMPLOYEE_BENEFITS = [
  { id: 'health_basic', name: 'Basic Health', icon: '🏥', cost: 150, moralBoost: 5, retentionBoost: 0.10, desc: 'Basic health coverage' },
  { id: 'health_premium', name: 'Premium Health', icon: '💎', cost: 350, moralBoost: 12, retentionBoost: 0.20, desc: 'Full health + dental + vision' },
  { id: '401k_match', name: '401k Match', icon: '🏦', cost: 200, moralBoost: 8, retentionBoost: 0.15, desc: '3% company match' },
  { id: 'paid_vacation', name: 'Paid Vacation', icon: '🏖️', cost: 100, moralBoost: 10, retentionBoost: 0.12, desc: '2 weeks PTO' },
  { id: 'meal_plan', name: 'Free Meals', icon: '🍽️', cost: 75, moralBoost: 6, retentionBoost: 0.08, desc: 'One free meal per shift' },
  { id: 'training_stipend', name: 'Training Budget', icon: '📚', cost: 50, moralBoost: 4, retentionBoost: 0.05, desc: '$500/year for courses' },
  { id: 'bonus_program', name: 'Performance Bonus', icon: '🎯', cost: 250, moralBoost: 15, retentionBoost: 0.18, desc: 'Quarterly profit sharing' },
  { id: 'childcare', name: 'Childcare Stipend', icon: '👶', cost: 300, moralBoost: 20, retentionBoost: 0.25, desc: '$500/month childcare help' },
];

// EQUIPMENT MAINTENANCE SYSTEM
export const EQUIPMENT_MAINTENANCE = [
  { id: 'fryer', name: 'Deep Fryer', icon: '🍟', maintenanceCost: 150, breakdownChance: 0.08, repairCost: 2500, downtime: 2 },
  { id: 'grill', name: 'Commercial Grill', icon: '🔥', maintenanceCost: 200, breakdownChance: 0.05, repairCost: 4000, downtime: 3 },
  { id: 'oven', name: 'Commercial Oven', icon: '♨️', maintenanceCost: 175, breakdownChance: 0.04, repairCost: 5000, downtime: 4 },
  { id: 'refrigeration', name: 'Walk-In Cooler', icon: '❄️', maintenanceCost: 250, breakdownChance: 0.03, repairCost: 8000, downtime: 1 },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️', maintenanceCost: 100, breakdownChance: 0.10, repairCost: 1500, downtime: 1 },
  { id: 'hvac', name: 'HVAC System', icon: '🌡️', maintenanceCost: 300, breakdownChance: 0.02, repairCost: 10000, downtime: 2 },
  { id: 'pos', name: 'POS System', icon: '💻', maintenanceCost: 50, breakdownChance: 0.06, repairCost: 800, downtime: 1 },
  { id: 'hood', name: 'Exhaust Hood', icon: '💨', maintenanceCost: 125, breakdownChance: 0.03, repairCost: 3000, downtime: 3 },
];

// ANALYTICS METRICS - Key Performance Indicators
export const KPI_METRICS = [
  { id: 'covers_per_hour', name: 'Covers/Hour', icon: '👥', target: 25, format: (v) => v.toFixed(1), category: 'operations' },
  { id: 'table_turn', name: 'Table Turn Time', icon: '⏱️', target: 45, format: (v) => `${v}min`, category: 'operations' },
  { id: 'avg_check', name: 'Avg Check Size', icon: '💵', target: 35, format: (v) => `$${v.toFixed(2)}`, category: 'revenue' },
  { id: 'food_cost_pct', name: 'Food Cost %', icon: '🥗', target: 28, format: (v) => `${v.toFixed(1)}%`, category: 'costs' },
  { id: 'labor_cost_pct', name: 'Labor Cost %', icon: '👷', target: 30, format: (v) => `${v.toFixed(1)}%`, category: 'costs' },
  { id: 'prime_cost', name: 'Prime Cost %', icon: '📊', target: 60, format: (v) => `${v.toFixed(1)}%`, category: 'costs' },
  { id: 'profit_margin', name: 'Profit Margin', icon: '📈', target: 15, format: (v) => `${v.toFixed(1)}%`, category: 'profitability' },
  { id: 'rev_per_sqft', name: 'Rev/Sq Ft', icon: '📐', target: 500, format: (v) => `$${v.toFixed(0)}`, category: 'efficiency' },
  { id: 'rev_per_seat', name: 'Rev/Seat', icon: '🪑', target: 150, format: (v) => `$${v.toFixed(0)}`, category: 'efficiency' },
  { id: 'employee_turnover', name: 'Turnover Rate', icon: '🔄', target: 75, format: (v) => `${v.toFixed(0)}%`, category: 'hr' },
  { id: 'customer_retention', name: 'Retention Rate', icon: '🔁', target: 60, format: (v) => `${v.toFixed(1)}%`, category: 'customers' },
  { id: 'online_rating', name: 'Online Rating', icon: '⭐', target: 4.5, format: (v) => v.toFixed(2), category: 'reputation' },
];
