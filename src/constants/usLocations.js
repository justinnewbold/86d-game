// ============================================
// US LOCATION DATA - CITIES & STATES
// ============================================
// Base economic modifiers for US cities
// These serve as initial estimates that get refined by AI research

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];

// Major US cities with base economic modifiers
// All modifiers are relative to a national baseline of 1.0
// These will be refined by AI research for accurate gameplay
export const US_CITIES = [
  // High Cost Markets (Tier 1 - Major metros with premium pricing)
  { city: 'New York City', state: 'NY', tier: 1, population: 8300000, costOfLiving: 1.87, wageMultiplier: 1.45, rentMultiplier: 2.50, ticketMultiplier: 1.60, trafficMultiplier: 1.50, competitionLevel: 1.80, foodCostMultiplier: 1.25, icon: '🗽' },
  { city: 'San Francisco', state: 'CA', tier: 1, population: 870000, costOfLiving: 1.82, wageMultiplier: 1.50, rentMultiplier: 2.40, ticketMultiplier: 1.55, trafficMultiplier: 1.40, competitionLevel: 1.60, foodCostMultiplier: 1.30, icon: '🌉' },
  { city: 'Los Angeles', state: 'CA', tier: 1, population: 3900000, costOfLiving: 1.66, wageMultiplier: 1.35, rentMultiplier: 2.00, ticketMultiplier: 1.45, trafficMultiplier: 1.45, competitionLevel: 1.70, foodCostMultiplier: 1.20, icon: '🎬' },
  { city: 'Seattle', state: 'WA', tier: 1, population: 750000, costOfLiving: 1.58, wageMultiplier: 1.40, rentMultiplier: 1.90, ticketMultiplier: 1.40, trafficMultiplier: 1.30, competitionLevel: 1.40, foodCostMultiplier: 1.15, icon: '☕' },
  { city: 'Boston', state: 'MA', tier: 1, population: 680000, costOfLiving: 1.55, wageMultiplier: 1.35, rentMultiplier: 1.85, ticketMultiplier: 1.45, trafficMultiplier: 1.35, competitionLevel: 1.50, foodCostMultiplier: 1.15, icon: '🦞' },
  { city: 'Washington D.C.', state: 'DC', tier: 1, population: 700000, costOfLiving: 1.53, wageMultiplier: 1.40, rentMultiplier: 1.80, ticketMultiplier: 1.45, trafficMultiplier: 1.40, competitionLevel: 1.45, foodCostMultiplier: 1.12, icon: '🏛️' },
  { city: 'San Diego', state: 'CA', tier: 1, population: 1400000, costOfLiving: 1.50, wageMultiplier: 1.30, rentMultiplier: 1.75, ticketMultiplier: 1.35, trafficMultiplier: 1.25, competitionLevel: 1.35, foodCostMultiplier: 1.15, icon: '🏖️' },
  { city: 'Miami', state: 'FL', tier: 1, population: 450000, costOfLiving: 1.48, wageMultiplier: 1.20, rentMultiplier: 1.70, ticketMultiplier: 1.40, trafficMultiplier: 1.45, competitionLevel: 1.55, foodCostMultiplier: 1.10, icon: '🌴' },
  { city: 'Honolulu', state: 'HI', tier: 1, population: 350000, costOfLiving: 1.70, wageMultiplier: 1.25, rentMultiplier: 1.60, ticketMultiplier: 1.50, trafficMultiplier: 1.30, competitionLevel: 1.20, foodCostMultiplier: 1.40, icon: '🌺' },

  // Upper-Mid Cost Markets (Tier 2 - Growing metros)
  { city: 'Chicago', state: 'IL', tier: 2, population: 2700000, costOfLiving: 1.35, wageMultiplier: 1.25, rentMultiplier: 1.50, ticketMultiplier: 1.30, trafficMultiplier: 1.40, competitionLevel: 1.55, foodCostMultiplier: 1.08, icon: '🌆' },
  { city: 'Denver', state: 'CO', tier: 2, population: 720000, costOfLiving: 1.38, wageMultiplier: 1.25, rentMultiplier: 1.55, ticketMultiplier: 1.30, trafficMultiplier: 1.25, competitionLevel: 1.35, foodCostMultiplier: 1.10, icon: '🏔️' },
  { city: 'Austin', state: 'TX', tier: 2, population: 1000000, costOfLiving: 1.32, wageMultiplier: 1.20, rentMultiplier: 1.45, ticketMultiplier: 1.25, trafficMultiplier: 1.35, competitionLevel: 1.45, foodCostMultiplier: 1.05, icon: '🎸' },
  { city: 'Portland', state: 'OR', tier: 2, population: 650000, costOfLiving: 1.40, wageMultiplier: 1.25, rentMultiplier: 1.50, ticketMultiplier: 1.30, trafficMultiplier: 1.20, competitionLevel: 1.40, foodCostMultiplier: 1.12, icon: '🌲' },
  { city: 'Nashville', state: 'TN', tier: 2, population: 690000, costOfLiving: 1.25, wageMultiplier: 1.15, rentMultiplier: 1.35, ticketMultiplier: 1.20, trafficMultiplier: 1.35, competitionLevel: 1.40, foodCostMultiplier: 1.02, icon: '🎶' },
  { city: 'Minneapolis', state: 'MN', tier: 2, population: 430000, costOfLiving: 1.28, wageMultiplier: 1.20, rentMultiplier: 1.30, ticketMultiplier: 1.20, trafficMultiplier: 1.15, competitionLevel: 1.25, foodCostMultiplier: 1.05, icon: '❄️' },
  { city: 'Philadelphia', state: 'PA', tier: 2, population: 1580000, costOfLiving: 1.30, wageMultiplier: 1.20, rentMultiplier: 1.40, ticketMultiplier: 1.25, trafficMultiplier: 1.30, competitionLevel: 1.40, foodCostMultiplier: 1.05, icon: '🔔' },
  { city: 'Atlanta', state: 'GA', tier: 2, population: 500000, costOfLiving: 1.22, wageMultiplier: 1.15, rentMultiplier: 1.30, ticketMultiplier: 1.20, trafficMultiplier: 1.35, competitionLevel: 1.45, foodCostMultiplier: 1.02, icon: '🍑' },
  { city: 'Salt Lake City', state: 'UT', tier: 2, population: 200000, costOfLiving: 1.25, wageMultiplier: 1.15, rentMultiplier: 1.25, ticketMultiplier: 1.15, trafficMultiplier: 1.15, competitionLevel: 1.20, foodCostMultiplier: 1.05, icon: '🏔️' },
  { city: 'Raleigh', state: 'NC', tier: 2, population: 470000, costOfLiving: 1.18, wageMultiplier: 1.12, rentMultiplier: 1.20, ticketMultiplier: 1.15, trafficMultiplier: 1.20, competitionLevel: 1.25, foodCostMultiplier: 1.00, icon: '🌳' },

  // Mid-Cost Markets (Tier 3 - Established cities)
  { city: 'Dallas', state: 'TX', tier: 3, population: 1300000, costOfLiving: 1.15, wageMultiplier: 1.10, rentMultiplier: 1.20, ticketMultiplier: 1.15, trafficMultiplier: 1.30, competitionLevel: 1.35, foodCostMultiplier: 0.98, icon: '🤠' },
  { city: 'Houston', state: 'TX', tier: 3, population: 2300000, costOfLiving: 1.10, wageMultiplier: 1.08, rentMultiplier: 1.15, ticketMultiplier: 1.12, trafficMultiplier: 1.35, competitionLevel: 1.40, foodCostMultiplier: 0.95, icon: '🚀' },
  { city: 'San Antonio', state: 'TX', tier: 3, population: 1500000, costOfLiving: 1.02, wageMultiplier: 1.02, rentMultiplier: 1.05, ticketMultiplier: 1.05, trafficMultiplier: 1.20, competitionLevel: 1.20, foodCostMultiplier: 0.95, icon: '🏰' },
  { city: 'Phoenix', state: 'AZ', tier: 3, population: 1600000, costOfLiving: 1.12, wageMultiplier: 1.08, rentMultiplier: 1.15, ticketMultiplier: 1.10, trafficMultiplier: 1.25, competitionLevel: 1.30, foodCostMultiplier: 0.98, icon: '🌵' },
  { city: 'Charlotte', state: 'NC', tier: 3, population: 880000, costOfLiving: 1.08, wageMultiplier: 1.08, rentMultiplier: 1.15, ticketMultiplier: 1.10, trafficMultiplier: 1.20, competitionLevel: 1.25, foodCostMultiplier: 0.98, icon: '🏦' },
  { city: 'Tampa', state: 'FL', tier: 3, population: 400000, costOfLiving: 1.10, wageMultiplier: 1.05, rentMultiplier: 1.15, ticketMultiplier: 1.10, trafficMultiplier: 1.20, competitionLevel: 1.25, foodCostMultiplier: 0.98, icon: '⚡' },
  { city: 'Orlando', state: 'FL', tier: 3, population: 310000, costOfLiving: 1.12, wageMultiplier: 1.05, rentMultiplier: 1.18, ticketMultiplier: 1.15, trafficMultiplier: 1.40, competitionLevel: 1.35, foodCostMultiplier: 1.00, icon: '🎢' },
  { city: 'Las Vegas', state: 'NV', tier: 3, population: 650000, costOfLiving: 1.15, wageMultiplier: 1.12, rentMultiplier: 1.20, ticketMultiplier: 1.20, trafficMultiplier: 1.50, competitionLevel: 1.45, foodCostMultiplier: 1.02, icon: '🎰' },
  { city: 'Pittsburgh', state: 'PA', tier: 3, population: 300000, costOfLiving: 1.05, wageMultiplier: 1.08, rentMultiplier: 1.10, ticketMultiplier: 1.10, trafficMultiplier: 1.10, competitionLevel: 1.15, foodCostMultiplier: 0.98, icon: '🌉' },
  { city: 'Cincinnati', state: 'OH', tier: 3, population: 310000, costOfLiving: 1.02, wageMultiplier: 1.05, rentMultiplier: 1.05, ticketMultiplier: 1.05, trafficMultiplier: 1.10, competitionLevel: 1.15, foodCostMultiplier: 0.95, icon: '🏈' },
  { city: 'Kansas City', state: 'MO', tier: 3, population: 510000, costOfLiving: 1.00, wageMultiplier: 1.02, rentMultiplier: 1.00, ticketMultiplier: 1.05, trafficMultiplier: 1.15, competitionLevel: 1.20, foodCostMultiplier: 0.95, icon: '🥩' },
  { city: 'New Orleans', state: 'LA', tier: 3, population: 390000, costOfLiving: 1.05, wageMultiplier: 1.00, rentMultiplier: 1.10, ticketMultiplier: 1.20, trafficMultiplier: 1.35, competitionLevel: 1.40, foodCostMultiplier: 0.98, icon: '🎺' },
  { city: 'Milwaukee', state: 'WI', tier: 3, population: 580000, costOfLiving: 1.02, wageMultiplier: 1.05, rentMultiplier: 1.05, ticketMultiplier: 1.05, trafficMultiplier: 1.10, competitionLevel: 1.15, foodCostMultiplier: 0.95, icon: '🍺' },

  // Lower Cost Markets (Tier 4 - Emerging/smaller metros)
  { city: 'Indianapolis', state: 'IN', tier: 4, population: 880000, costOfLiving: 0.95, wageMultiplier: 1.00, rentMultiplier: 0.95, ticketMultiplier: 1.00, trafficMultiplier: 1.10, competitionLevel: 1.10, foodCostMultiplier: 0.92, icon: '🏎️' },
  { city: 'Columbus', state: 'OH', tier: 4, population: 900000, costOfLiving: 0.98, wageMultiplier: 1.02, rentMultiplier: 1.00, ticketMultiplier: 1.02, trafficMultiplier: 1.12, competitionLevel: 1.15, foodCostMultiplier: 0.95, icon: '🏟️' },
  { city: 'Detroit', state: 'MI', tier: 4, population: 640000, costOfLiving: 0.92, wageMultiplier: 1.05, rentMultiplier: 0.85, ticketMultiplier: 1.00, trafficMultiplier: 1.05, competitionLevel: 1.10, foodCostMultiplier: 0.92, icon: '🚗' },
  { city: 'Cleveland', state: 'OH', tier: 4, population: 370000, costOfLiving: 0.90, wageMultiplier: 1.00, rentMultiplier: 0.85, ticketMultiplier: 0.98, trafficMultiplier: 1.05, competitionLevel: 1.05, foodCostMultiplier: 0.90, icon: '🎸' },
  { city: 'St. Louis', state: 'MO', tier: 4, population: 300000, costOfLiving: 0.92, wageMultiplier: 1.00, rentMultiplier: 0.90, ticketMultiplier: 1.00, trafficMultiplier: 1.08, competitionLevel: 1.10, foodCostMultiplier: 0.92, icon: '⚾' },
  { city: 'Memphis', state: 'TN', tier: 4, population: 630000, costOfLiving: 0.88, wageMultiplier: 0.95, rentMultiplier: 0.85, ticketMultiplier: 0.95, trafficMultiplier: 1.05, competitionLevel: 1.05, foodCostMultiplier: 0.90, icon: '🎵' },
  { city: 'Louisville', state: 'KY', tier: 4, population: 620000, costOfLiving: 0.92, wageMultiplier: 0.98, rentMultiplier: 0.90, ticketMultiplier: 0.98, trafficMultiplier: 1.08, competitionLevel: 1.08, foodCostMultiplier: 0.92, icon: '🐎' },
  { city: 'Buffalo', state: 'NY', tier: 4, population: 280000, costOfLiving: 0.95, wageMultiplier: 1.02, rentMultiplier: 0.90, ticketMultiplier: 1.00, trafficMultiplier: 1.02, competitionLevel: 1.05, foodCostMultiplier: 0.95, icon: '🦬' },
  { city: 'Richmond', state: 'VA', tier: 4, population: 230000, costOfLiving: 1.02, wageMultiplier: 1.05, rentMultiplier: 1.00, ticketMultiplier: 1.05, trafficMultiplier: 1.10, competitionLevel: 1.15, foodCostMultiplier: 0.98, icon: '🏛️' },
  { city: 'Tucson', state: 'AZ', tier: 4, population: 550000, costOfLiving: 0.95, wageMultiplier: 0.95, rentMultiplier: 0.90, ticketMultiplier: 0.98, trafficMultiplier: 1.05, competitionLevel: 1.05, foodCostMultiplier: 0.95, icon: '🌵' },
  { city: 'Albuquerque', state: 'NM', tier: 4, population: 560000, costOfLiving: 0.95, wageMultiplier: 0.95, rentMultiplier: 0.88, ticketMultiplier: 0.98, trafficMultiplier: 1.02, competitionLevel: 1.00, foodCostMultiplier: 0.95, icon: '🎈' },

  // Budget Markets (Tier 5 - Lower cost areas, good for bootstrapping)
  { city: 'Oklahoma City', state: 'OK', tier: 5, population: 680000, costOfLiving: 0.88, wageMultiplier: 0.92, rentMultiplier: 0.80, ticketMultiplier: 0.92, trafficMultiplier: 1.00, competitionLevel: 0.95, foodCostMultiplier: 0.88, icon: '🤠' },
  { city: 'Tulsa', state: 'OK', tier: 5, population: 400000, costOfLiving: 0.85, wageMultiplier: 0.90, rentMultiplier: 0.78, ticketMultiplier: 0.90, trafficMultiplier: 0.98, competitionLevel: 0.92, foodCostMultiplier: 0.88, icon: '🛢️' },
  { city: 'Wichita', state: 'KS', tier: 5, population: 390000, costOfLiving: 0.85, wageMultiplier: 0.90, rentMultiplier: 0.75, ticketMultiplier: 0.90, trafficMultiplier: 0.95, competitionLevel: 0.90, foodCostMultiplier: 0.88, icon: '✈️' },
  { city: 'Little Rock', state: 'AR', tier: 5, population: 200000, costOfLiving: 0.85, wageMultiplier: 0.88, rentMultiplier: 0.75, ticketMultiplier: 0.88, trafficMultiplier: 0.95, competitionLevel: 0.88, foodCostMultiplier: 0.85, icon: '🏛️' },
  { city: 'Birmingham', state: 'AL', tier: 5, population: 200000, costOfLiving: 0.88, wageMultiplier: 0.92, rentMultiplier: 0.80, ticketMultiplier: 0.92, trafficMultiplier: 1.00, competitionLevel: 0.95, foodCostMultiplier: 0.88, icon: '🔨' },
  { city: 'Jackson', state: 'MS', tier: 5, population: 150000, costOfLiving: 0.82, wageMultiplier: 0.85, rentMultiplier: 0.70, ticketMultiplier: 0.85, trafficMultiplier: 0.90, competitionLevel: 0.82, foodCostMultiplier: 0.85, icon: '🌳' },
  { city: 'El Paso', state: 'TX', tier: 5, population: 680000, costOfLiving: 0.88, wageMultiplier: 0.88, rentMultiplier: 0.75, ticketMultiplier: 0.88, trafficMultiplier: 0.95, competitionLevel: 0.90, foodCostMultiplier: 0.88, icon: '🌅' },
  { city: 'Boise', state: 'ID', tier: 5, population: 235000, costOfLiving: 1.00, wageMultiplier: 0.98, rentMultiplier: 1.05, ticketMultiplier: 1.00, trafficMultiplier: 1.05, competitionLevel: 1.00, foodCostMultiplier: 0.98, icon: '🥔' },
  { city: 'Des Moines', state: 'IA', tier: 5, population: 215000, costOfLiving: 0.90, wageMultiplier: 0.95, rentMultiplier: 0.85, ticketMultiplier: 0.95, trafficMultiplier: 1.00, competitionLevel: 0.95, foodCostMultiplier: 0.90, icon: '🌽' },
  { city: 'Omaha', state: 'NE', tier: 5, population: 490000, costOfLiving: 0.92, wageMultiplier: 0.98, rentMultiplier: 0.88, ticketMultiplier: 0.98, trafficMultiplier: 1.02, competitionLevel: 0.98, foodCostMultiplier: 0.92, icon: '🥩' },
  { city: 'Anchorage', state: 'AK', tier: 5, population: 290000, costOfLiving: 1.25, wageMultiplier: 1.15, rentMultiplier: 1.10, ticketMultiplier: 1.20, trafficMultiplier: 0.85, competitionLevel: 0.75, foodCostMultiplier: 1.35, icon: '🐻' },
];

// Tier descriptions for UI
export const CITY_TIERS = {
  1: { name: 'Premium Market', desc: 'High costs, high potential. NYC, LA, SF tier.', color: '#FFD700', difficulty: 'Hard' },
  2: { name: 'Growth Market', desc: 'Rising cities with strong economies.', color: '#10B981', difficulty: 'Medium-Hard' },
  3: { name: 'Established Market', desc: 'Solid metros with balanced economics.', color: '#3B82F6', difficulty: 'Medium' },
  4: { name: 'Value Market', desc: 'Lower costs, room to grow.', color: '#8B5CF6', difficulty: 'Medium-Easy' },
  5: { name: 'Budget Market', desc: 'Bootstrap-friendly, lower barriers.', color: '#EC4899', difficulty: 'Easy' },
};

// Default/baseline city for calculations (represents national average)
export const BASELINE_CITY = {
  city: 'National Average',
  state: 'US',
  tier: 3,
  costOfLiving: 1.0,
  wageMultiplier: 1.0,
  rentMultiplier: 1.0,
  ticketMultiplier: 1.0,
  trafficMultiplier: 1.0,
  competitionLevel: 1.0,
  foodCostMultiplier: 1.0,
};

// Get city by name and state
export const getCityData = (cityName, stateCode) => {
  const city = US_CITIES.find(
    c => c.city.toLowerCase() === cityName.toLowerCase() &&
         c.state.toLowerCase() === stateCode.toLowerCase()
  );
  return city || null;
};

// Get all cities for a state
export const getCitiesByState = (stateCode) => {
  return US_CITIES.filter(c => c.state.toLowerCase() === stateCode.toLowerCase());
};

// Get cities by tier
export const getCitiesByTier = (tier) => {
  return US_CITIES.filter(c => c.tier === tier);
};

// Search cities by name (for autocomplete)
export const searchCities = (query) => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return US_CITIES.filter(c =>
    c.city.toLowerCase().includes(lowerQuery) ||
    c.state.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
};

// Get popular cities for quick selection
export const getPopularCities = () => {
  return US_CITIES.filter(c =>
    ['New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
     'San Francisco', 'Seattle', 'Miami', 'Denver', 'Austin',
     'Nashville', 'Atlanta', 'Las Vegas', 'Portland', 'Boston'].includes(c.city)
  );
};

// Calculate location impact summary for display
export const getLocationImpactSummary = (cityData) => {
  if (!cityData) return null;

  const impacts = [];

  // Wages
  if (cityData.wageMultiplier > 1.15) {
    impacts.push({ type: 'warning', text: `Wages ${Math.round((cityData.wageMultiplier - 1) * 100)}% above average` });
  } else if (cityData.wageMultiplier < 0.95) {
    impacts.push({ type: 'success', text: `Wages ${Math.round((1 - cityData.wageMultiplier) * 100)}% below average` });
  }

  // Rent
  if (cityData.rentMultiplier > 1.3) {
    impacts.push({ type: 'warning', text: `Rent ${Math.round((cityData.rentMultiplier - 1) * 100)}% higher` });
  } else if (cityData.rentMultiplier < 0.9) {
    impacts.push({ type: 'success', text: `Rent ${Math.round((1 - cityData.rentMultiplier) * 100)}% lower` });
  }

  // Ticket prices
  if (cityData.ticketMultiplier > 1.2) {
    impacts.push({ type: 'success', text: `Can charge ${Math.round((cityData.ticketMultiplier - 1) * 100)}% more` });
  } else if (cityData.ticketMultiplier < 0.95) {
    impacts.push({ type: 'warning', text: `Ticket prices ${Math.round((1 - cityData.ticketMultiplier) * 100)}% lower` });
  }

  // Traffic
  if (cityData.trafficMultiplier > 1.25) {
    impacts.push({ type: 'success', text: `High foot traffic (+${Math.round((cityData.trafficMultiplier - 1) * 100)}%)` });
  } else if (cityData.trafficMultiplier < 0.95) {
    impacts.push({ type: 'warning', text: `Lower foot traffic (${Math.round((1 - cityData.trafficMultiplier) * 100)}% below avg)` });
  }

  // Competition
  if (cityData.competitionLevel > 1.3) {
    impacts.push({ type: 'warning', text: `Very competitive market` });
  } else if (cityData.competitionLevel < 0.9) {
    impacts.push({ type: 'success', text: `Less competition` });
  }

  return impacts;
};
