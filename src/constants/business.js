// ============================================
// ADVANCED BUSINESS SYSTEMS
// ============================================

// INVESTOR SYSTEM
export const INVESTOR_TYPES = [
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

export const INVESTOR_DEMANDS = [
  { id: 'growth_target', name: 'Growth Mandate', description: 'Open 3 new locations in 12 months', type: 'expansion' },
  { id: 'cost_cutting', name: 'Cost Optimization', description: 'Reduce labor to 28% of revenue', type: 'efficiency' },
  { id: 'cfo_hire', name: 'Professional Management', description: 'Hire a CFO within 6 months', type: 'hiring' },
  { id: 'franchise_push', name: 'Franchise Acceleration', description: 'Sell 5 franchises this year', type: 'franchise' },
  { id: 'tech_upgrade', name: 'Technology Investment', description: 'Implement enterprise POS system', type: 'capex' },
  { id: 'marketing_spend', name: 'Brand Building', description: 'Spend $100K on marketing', type: 'marketing' },
];

// REAL ESTATE SYSTEM
export const REAL_ESTATE_OPTIONS = [
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

// CATERING & EVENTS SYSTEM
export const CATERING_TYPES = [
  { id: 'corporate_lunch', name: 'Corporate Lunch', icon: '💼', avgOrder: 800, frequency: 'weekly', margin: 0.35, setupCost: 2000 },
  { id: 'corporate_event', name: 'Corporate Event', icon: '🎉', avgOrder: 5000, frequency: 'monthly', margin: 0.40, setupCost: 5000 },
  { id: 'wedding', name: 'Wedding Catering', icon: '💒', avgOrder: 15000, frequency: 'seasonal', margin: 0.45, setupCost: 10000 },
  { id: 'private_party', name: 'Private Parties', icon: '🎂', avgOrder: 2000, frequency: 'weekly', margin: 0.38, setupCost: 3000 },
  { id: 'food_service', name: 'Contract Food Service', icon: '🏢', avgOrder: 3000, frequency: 'daily', margin: 0.25, setupCost: 15000 },
  { id: 'meal_prep', name: 'Meal Prep Service', icon: '📦', avgOrder: 500, frequency: 'weekly', margin: 0.30, setupCost: 5000 },
];

export const CATERING_CONTRACTS = [
  { id: 'tech_campus', name: 'Tech Campus Cafeteria', icon: '💻', weeklyRevenue: 8000, term: 52, margin: 0.22, requirement: 'High volume capacity' },
  { id: 'hospital', name: 'Hospital Café', icon: '🏥', weeklyRevenue: 5000, term: 104, margin: 0.20, requirement: 'Health certifications' },
  { id: 'university', name: 'University Dining', icon: '🎓', weeklyRevenue: 12000, term: 40, margin: 0.18, requirement: 'Seasonal, volume swings' },
  { id: 'office_tower', name: 'Office Tower Exclusive', icon: '🏙️', weeklyRevenue: 6000, term: 52, margin: 0.28, requirement: 'Premium quality' },
];

// FOOD TRUCK FLEET SYSTEM
export const FOOD_TRUCKS = [
  { id: 'basic', name: 'Basic Food Truck', icon: '🚚', cost: 45000, capacity: 100, range: 'local', maintenance: 500, permits: 2000 },
  { id: 'premium', name: 'Premium Food Truck', icon: '🚛', cost: 85000, capacity: 150, range: 'regional', maintenance: 750, permits: 3000 },
  { id: 'trailer', name: 'Concession Trailer', icon: '🎪', cost: 25000, capacity: 80, range: 'events', maintenance: 300, permits: 1500 },
  { id: 'cart', name: 'Food Cart', icon: '🛒', cost: 8000, capacity: 40, range: 'downtown', maintenance: 100, permits: 500 },
];

export const TRUCK_EVENTS = [
  { id: 'farmers_market', name: 'Farmers Market', icon: '🥬', fee: 150, avgRevenue: 1200, frequency: 'weekly' },
  { id: 'food_festival', name: 'Food Festival', icon: '🎪', fee: 500, avgRevenue: 5000, frequency: 'monthly' },
  { id: 'corporate_park', name: 'Office Park Lunch', icon: '🏢', fee: 100, avgRevenue: 800, frequency: 'daily' },
  { id: 'brewery', name: 'Brewery Partnership', icon: '🍺', fee: 0, revShare: 0.15, avgRevenue: 1500, frequency: 'weekly' },
  { id: 'concert', name: 'Concert/Stadium', icon: '🎸', fee: 1000, avgRevenue: 8000, frequency: 'event' },
  { id: 'private_event', name: 'Private Event Booking', icon: '🎂', fee: 0, avgRevenue: 2500, frequency: 'booking' },
];

// MEDIA & CELEBRITY SYSTEM
export const MEDIA_OPPORTUNITIES = [
  { id: 'local_news', name: 'Local News Feature', icon: '📺', cost: 0, reputationBoost: 5, reachBoost: 0.05, duration: 4 },
  { id: 'food_magazine', name: 'Food Magazine Article', icon: '📰', cost: 500, reputationBoost: 10, reachBoost: 0.08, duration: 8 },
  { id: 'podcast_guest', name: 'Podcast Appearance', icon: '🎙️', cost: 0, reputationBoost: 3, reachBoost: 0.03, duration: 12 },
  { id: 'cooking_show', name: 'Cooking Show Guest', icon: '👨‍🍳', cost: 0, reputationBoost: 15, reachBoost: 0.15, duration: 8, minReputation: 70 },
  { id: 'reality_show', name: 'Reality TV Appearance', icon: '🎬', cost: 0, reputationBoost: 25, reachBoost: 0.30, duration: 16, minReputation: 80 },
  { id: 'own_show', name: 'Own TV Series', icon: '⭐', cost: 0, reputationBoost: 40, reachBoost: 0.50, weeklyIncome: 10000, minReputation: 90 },
];

export const BRAND_DEALS = [
  { id: 'cookbook', name: 'Cookbook Deal', icon: '📚', advance: 50000, royalty: 0.08, effort: 'high', minReputation: 75 },
  { id: 'product_line', name: 'Retail Product Line', icon: '🏪', advance: 100000, royalty: 0.05, effort: 'medium', minReputation: 80 },
  { id: 'endorsement', name: 'Brand Endorsement', icon: '📢', fee: 25000, duration: 52, effort: 'low', minReputation: 70 },
  { id: 'consulting', name: 'Restaurant Consulting', icon: '💼', fee: 5000, perEngagement: true, effort: 'high', minReputation: 85 },
  { id: 'licensing', name: 'Brand Licensing', icon: '™️', upfront: 200000, royalty: 0.03, effort: 'low', minReputation: 90 },
];

// ECONOMIC CYCLES SYSTEM
export const ECONOMIC_CONDITIONS = [
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

export const ECONOMIC_EVENTS = [
  { id: 'rate_hike', name: 'Interest Rate Hike', effect: { loanRates: 0.02, expansion: -0.2 }, duration: 26 },
  { id: 'stimulus', name: 'Government Stimulus', effect: { revenue: 0.15, tips: 0.25 }, duration: 12 },
  { id: 'supply_shock', name: 'Supply Chain Disruption', effect: { foodCost: 0.2, availability: -0.15 }, duration: 16 },
  { id: 'labor_shortage', name: 'Labor Shortage', effect: { wages: 0.15, retention: -0.1 }, duration: 20 },
  { id: 'gas_spike', name: 'Fuel Price Spike', effect: { deliveryCost: 0.3, supplyCost: 0.1 }, duration: 8 },
];

// ADVANCED EXIT STRATEGIES
export const EXIT_OPTIONS = [
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

// INDUSTRY INFLUENCE
export const INDUSTRY_ACTIONS = [
  { id: 'lobby_health', name: 'Health Code Lobbying', icon: '📋', cost: 50000, duration: 12, effect: { inspectionLeniency: 0.2 }, desc: 'Influence health inspection standards' },
  { id: 'wage_coalition', name: 'Wage Coalition', icon: '💵', cost: 75000, duration: 26, effect: { wageFreeze: true }, desc: 'Coalition to stabilize minimum wage' },
  { id: 'delivery_fee_cap', name: 'Delivery Fee Campaign', icon: '🛵', cost: 30000, duration: 8, effect: { deliveryFeeCap: 0.15 }, desc: 'Advocate for delivery fee caps' },
  { id: 'rent_control', name: 'Commercial Rent Control', icon: '🏠', cost: 100000, duration: 52, effect: { rentIncreaseCap: 0.03 }, desc: 'Support commercial rent control' },
  { id: 'tourism_boost', name: 'Tourism Campaign', icon: '✈️', cost: 40000, duration: 16, effect: { trafficBoost: 0.15 }, desc: 'Fund local tourism marketing' },
  { id: 'culinary_award', name: 'Create Local Award', icon: '🏆', cost: 200000, duration: 0, effect: { awardCreated: true, reputationBoost: 10 }, desc: 'Establish a prestigious culinary award' },
];

// M&A OPPORTUNITIES
export const MA_OPPORTUNITIES = [
  { id: 'struggling_competitor', name: 'Acquire Struggling Competitor', icon: '🏪', basePrice: 150000, valuationType: 'revenue', multiple: 0.8, desc: 'Buy out a competitor at a discount' },
  { id: 'supply_chain', name: 'Vertical Integration', icon: '🚛', basePrice: 300000, valuationType: 'fixed', desc: 'Acquire your primary supplier', benefits: { foodCostReduction: 0.10 } },
  { id: 'tech_startup', name: 'Tech Acquisition', icon: '💻', basePrice: 500000, valuationType: 'fixed', desc: 'Buy a restaurant tech startup', benefits: { operationsBoost: 0.15 } },
  { id: 'real_estate_portfolio', name: 'Real Estate Portfolio', icon: '🏢', basePrice: 2000000, valuationType: 'fixed', desc: 'Acquire commercial property portfolio', benefits: { rentEliminated: true } },
  { id: 'competitor_chain', name: 'Competitor Chain Buyout', icon: '🏛️', basePrice: 1000000, valuationType: 'locations', multiple: 200000, desc: 'Acquire a small regional chain' },
];

// DEBT RESTRUCTURING OPTIONS
export const DEBT_OPTIONS = [
  { id: 'refinance', name: 'Refinance Existing Loans', icon: '🔄', requirement: { loans: 1 }, benefit: 'Lower interest rate by 1.5%', fee: 0.02 },
  { id: 'consolidate', name: 'Debt Consolidation', icon: '📦', requirement: { loans: 2 }, benefit: 'Combine all loans into one', fee: 0.03 },
  { id: 'negotiate', name: 'Negotiate with Creditors', icon: '🤝', requirement: { cashFlowIssue: true }, benefit: 'Reduce principal by 15%', fee: 0 },
  { id: 'convert_equity', name: 'Convert to Equity', icon: '📊', requirement: { investors: true }, benefit: 'Trade debt for equity stake', equityDilution: 0.15 },
  { id: 'sale_leaseback', name: 'Sale-Leaseback', icon: '🏠', requirement: { ownsProperty: true }, benefit: 'Cash out property, lease back', rentIncrease: 0.20 },
];
