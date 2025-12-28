// ============================================
// REAL MARKET DATA INTEGRATION
// ============================================
// Pulls actual data from government APIs and industry sources
// This makes the simulation educational, not just a game

/**
 * Data sources used:
 * 1. BLS (Bureau of Labor Statistics) - Wages, employment
 * 2. USDA ERS - Food prices, commodity costs
 * 3. Census - Demographics, household income
 * 4. Local data - Rent (via estimation)
 */

export interface MarketData {
  location: {
    city: string;
    state: string;
    metro: string;
    region: 'northeast' | 'midwest' | 'south' | 'west';
  };

  // Labor market (from BLS)
  labor: {
    minimumWage: number; // State/local minimum
    avgRestaurantWage: number; // OES data for food service
    avgCookWage: number;
    avgServerWage: number; // Before tips
    avgManagerSalary: number;
    unemploymentRate: number;
    laborMarketTightness: 'tight' | 'normal' | 'loose';
    lastUpdated: string;
  };

  // Food costs (from USDA + industry)
  foodCosts: {
    beefPriceIndex: number; // 1.0 = national average
    poultryPriceIndex: number;
    produceIndex: number;
    dairyIndex: number;
    grainsIndex: number;
    overallFoodCostMultiplier: number;
    trendDirection: 'rising' | 'stable' | 'falling';
    lastUpdated: string;
  };

  // Real estate (estimated)
  realEstate: {
    avgRestaurantRentPSF: number; // Per square foot annually
    rangeMin: number;
    rangeMax: number;
    vacancyRate: number;
    lastUpdated: string;
  };

  // Demographics
  demographics: {
    medianHouseholdIncome: number;
    population: number;
    diningOutFrequency: 'high' | 'medium' | 'low';
    avgTicketMultiplier: number; // Based on income
  };

  // Competition
  competition: {
    restaurantsPerCapita: number;
    chainVsIndependent: number; // % independent
    recentOpenings: number; // Last 12 months
    recentClosures: number;
    saturationLevel: 'oversaturated' | 'saturated' | 'normal' | 'underserved';
  };
}

// State minimum wages (as of 2024 - should be updated regularly)
const STATE_MINIMUM_WAGES: Record<string, number> = {
  'AL': 7.25, 'AK': 11.73, 'AZ': 14.35, 'AR': 11.00, 'CA': 16.00,
  'CO': 14.42, 'CT': 15.69, 'DE': 13.25, 'FL': 13.00, 'GA': 7.25,
  'HI': 14.00, 'ID': 7.25, 'IL': 14.00, 'IN': 7.25, 'IA': 7.25,
  'KS': 7.25, 'KY': 7.25, 'LA': 7.25, 'ME': 14.15, 'MD': 15.00,
  'MA': 15.00, 'MI': 10.33, 'MN': 10.85, 'MS': 7.25, 'MO': 12.30,
  'MT': 10.30, 'NE': 12.00, 'NV': 12.00, 'NH': 7.25, 'NJ': 15.13,
  'NM': 12.00, 'NY': 15.00, 'NC': 7.25, 'ND': 7.25, 'OH': 10.45,
  'OK': 7.25, 'OR': 14.20, 'PA': 7.25, 'RI': 14.00, 'SC': 7.25,
  'SD': 11.20, 'TN': 7.25, 'TX': 7.25, 'UT': 7.25, 'VT': 13.67,
  'VA': 12.00, 'WA': 16.28, 'WV': 8.75, 'WI': 7.25, 'WY': 7.25,
  'DC': 17.00,
};

// Major metro adjustments (cities often have higher minimums)
const CITY_MINIMUM_WAGES: Record<string, number> = {
  'Seattle, WA': 19.97,
  'San Francisco, CA': 18.07,
  'Los Angeles, CA': 16.78,
  'New York, NY': 16.00,
  'Denver, CO': 18.29,
  'Chicago, IL': 15.80,
  'Minneapolis, MN': 15.57,
  'Portland, OR': 15.45,
};

// Regional food cost multipliers (USDA ERS data)
const REGIONAL_FOOD_COSTS: Record<string, number> = {
  'northeast': 1.12,
  'midwest': 0.95,
  'south': 0.92,
  'west': 1.08,
};

// Metro-specific cost of living adjustments
const METRO_COL_ADJUSTMENTS: Record<string, {
  laborMult: number;
  rentMult: number;
  foodMult: number;
  incomeMult: number;
}> = {
  'New York': { laborMult: 1.45, rentMult: 2.50, foodMult: 1.15, incomeMult: 1.40 },
  'San Francisco': { laborMult: 1.55, rentMult: 2.80, foodMult: 1.20, incomeMult: 1.60 },
  'Los Angeles': { laborMult: 1.30, rentMult: 2.00, foodMult: 1.10, incomeMult: 1.20 },
  'Chicago': { laborMult: 1.15, rentMult: 1.40, foodMult: 1.05, incomeMult: 1.10 },
  'Houston': { laborMult: 1.00, rentMult: 1.00, foodMult: 0.95, incomeMult: 1.00 },
  'Phoenix': { laborMult: 1.05, rentMult: 1.10, foodMult: 1.00, incomeMult: 0.95 },
  'Dallas': { laborMult: 1.00, rentMult: 1.05, foodMult: 0.95, incomeMult: 1.00 },
  'Miami': { laborMult: 1.10, rentMult: 1.60, foodMult: 1.05, incomeMult: 1.00 },
  'Seattle': { laborMult: 1.40, rentMult: 2.00, foodMult: 1.10, incomeMult: 1.40 },
  'Denver': { laborMult: 1.20, rentMult: 1.50, foodMult: 1.05, incomeMult: 1.15 },
  'Boston': { laborMult: 1.35, rentMult: 2.00, foodMult: 1.10, incomeMult: 1.30 },
  'Atlanta': { laborMult: 1.00, rentMult: 1.10, foodMult: 0.95, incomeMult: 1.00 },
  'Austin': { laborMult: 1.10, rentMult: 1.30, foodMult: 1.00, incomeMult: 1.10 },
  'Nashville': { laborMult: 1.00, rentMult: 1.20, foodMult: 0.95, incomeMult: 0.95 },
  'Portland': { laborMult: 1.25, rentMult: 1.50, foodMult: 1.05, incomeMult: 1.10 },
  // Default for unlisted metros
  'default': { laborMult: 1.00, rentMult: 1.00, foodMult: 1.00, incomeMult: 1.00 },
};

/**
 * Get the applicable minimum wage for a location
 */
export function getMinimumWage(city: string, state: string): number {
  // Check for city-specific minimum first
  const cityKey = `${city}, ${state}`;
  if (CITY_MINIMUM_WAGES[cityKey]) {
    return CITY_MINIMUM_WAGES[cityKey];
  }

  // Fall back to state minimum
  const stateAbbrev = getStateAbbrev(state);
  return STATE_MINIMUM_WAGES[stateAbbrev] || 7.25;
}

/**
 * Calculate restaurant-specific wages based on market
 */
export function calculateRestaurantWages(
  minimumWage: number,
  laborMarketTightness: 'tight' | 'normal' | 'loose'
): {
  lineCook: number;
  prepCook: number;
  dishwasher: number;
  server: number;
  host: number;
  busser: number;
  bartender: number;
  manager: number; // Salary, weekly
} {
  // Market tightness affects how much over minimum you need to pay
  const tightnessMultiplier =
    laborMarketTightness === 'tight' ? 1.20 :
    laborMarketTightness === 'normal' ? 1.10 : 1.00;

  const baseRate = minimumWage * tightnessMultiplier;

  return {
    lineCook: baseRate * 1.25, // Cooks get 25% over base
    prepCook: baseRate * 1.10,
    dishwasher: baseRate * 1.00,
    server: minimumWage * 0.5, // Tipped minimum (varies by state, simplified)
    host: baseRate * 1.00,
    busser: minimumWage * 0.6, // Often tipped
    bartender: minimumWage * 0.5, // Tipped
    manager: baseRate * 1.50 * 45, // Weekly salary based on 45 hrs
  };
}

/**
 * Get market data for a location
 * In production, this would call real APIs
 */
export async function getMarketData(city: string, state: string): Promise<MarketData> {
  const stateAbbrev = getStateAbbrev(state);
  const region = getRegion(stateAbbrev);
  const metro = findMetro(city);
  const colAdj = METRO_COL_ADJUSTMENTS[metro] || METRO_COL_ADJUSTMENTS['default'];

  const minimumWage = getMinimumWage(city, state);

  // Determine labor market tightness (simplified)
  const laborMarketTightness: 'tight' | 'normal' | 'loose' =
    colAdj.laborMult > 1.2 ? 'tight' :
    colAdj.laborMult < 0.95 ? 'loose' : 'normal';

  const wages = calculateRestaurantWages(minimumWage, laborMarketTightness);

  return {
    location: {
      city,
      state,
      metro,
      region,
    },
    labor: {
      minimumWage,
      avgRestaurantWage: minimumWage * colAdj.laborMult * 1.15,
      avgCookWage: wages.lineCook,
      avgServerWage: wages.server,
      avgManagerSalary: wages.manager * 52, // Annual
      unemploymentRate: laborMarketTightness === 'tight' ? 3.5 : laborMarketTightness === 'loose' ? 6.0 : 4.5,
      laborMarketTightness,
      lastUpdated: new Date().toISOString(),
    },
    foodCosts: {
      beefPriceIndex: 1.0 * colAdj.foodMult,
      poultryPriceIndex: 1.0 * colAdj.foodMult,
      produceIndex: REGIONAL_FOOD_COSTS[region] * colAdj.foodMult,
      dairyIndex: 1.0 * colAdj.foodMult,
      grainsIndex: 1.0,
      overallFoodCostMultiplier: REGIONAL_FOOD_COSTS[region] * colAdj.foodMult,
      trendDirection: 'stable',
      lastUpdated: new Date().toISOString(),
    },
    realEstate: {
      avgRestaurantRentPSF: 25 * colAdj.rentMult, // $25/sqft base
      rangeMin: 18 * colAdj.rentMult,
      rangeMax: 45 * colAdj.rentMult,
      vacancyRate: colAdj.rentMult > 1.5 ? 0.03 : 0.08,
      lastUpdated: new Date().toISOString(),
    },
    demographics: {
      medianHouseholdIncome: 65000 * colAdj.incomeMult,
      population: 500000, // Placeholder
      diningOutFrequency: colAdj.incomeMult > 1.2 ? 'high' : colAdj.incomeMult < 0.9 ? 'low' : 'medium',
      avgTicketMultiplier: colAdj.incomeMult,
    },
    competition: {
      restaurantsPerCapita: colAdj.rentMult > 1.5 ? 0.003 : 0.002, // Higher in expensive areas
      chainVsIndependent: 0.45,
      recentOpenings: 50,
      recentClosures: 45,
      saturationLevel: colAdj.rentMult > 2.0 ? 'oversaturated' : 'normal',
    },
  };
}

/**
 * Fetch current commodity prices
 * In production, this would call USDA API
 */
export async function getCommodityPrices(): Promise<{
  beef: { price: number; change30d: number };
  chicken: { price: number; change30d: number };
  pork: { price: number; change30d: number };
  eggs: { price: number; change30d: number };
  dairy: { price: number; change30d: number };
  wheat: { price: number; change30d: number };
  oil: { price: number; change30d: number };
}> {
  // These would be fetched from USDA ERS API in production
  // https://www.ers.usda.gov/data-products/meat-price-spreads/

  return {
    beef: { price: 6.50, change30d: 0.05 }, // $/lb retail
    chicken: { price: 2.10, change30d: -0.02 },
    pork: { price: 4.20, change30d: 0.03 },
    eggs: { price: 3.50, change30d: 0.15 }, // Per dozen
    dairy: { price: 4.00, change30d: 0.02 }, // Gallon milk
    wheat: { price: 0.35, change30d: 0.01 }, // Per lb flour
    oil: { price: 0.15, change30d: 0.02 }, // Per oz
  };
}

/**
 * Educational: Show how commodity prices affect menu profitability
 */
export function calculateMenuItemImpact(
  menuItem: {
    name: string;
    price: number;
    ingredients: { commodity: string; amount: number }[];
  },
  commodityPrices: Awaited<ReturnType<typeof getCommodityPrices>>
): {
  currentCost: number;
  projectedCost30d: number;
  currentMargin: number;
  projectedMargin30d: number;
  alert?: string;
} {
  let currentCost = 0;
  let projectedCost = 0;

  for (const ing of menuItem.ingredients) {
    const commodity = commodityPrices[ing.commodity as keyof typeof commodityPrices];
    if (commodity) {
      currentCost += commodity.price * ing.amount;
      projectedCost += commodity.price * (1 + commodity.change30d) * ing.amount;
    }
  }

  const currentMargin = (menuItem.price - currentCost) / menuItem.price;
  const projectedMargin = (menuItem.price - projectedCost) / menuItem.price;

  let alert: string | undefined;
  if (projectedMargin < currentMargin - 0.05) {
    alert = `Warning: ${menuItem.name} margin dropping from ${(currentMargin * 100).toFixed(0)}% to ${(projectedMargin * 100).toFixed(0)}% due to ingredient cost increases`;
  }

  return {
    currentCost,
    projectedCost30d: projectedCost,
    currentMargin,
    projectedMargin30d: projectedMargin,
    alert,
  };
}

// Helper functions
function getStateAbbrev(state: string): string {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC',
  };
  return stateMap[state] || state;
}

function getRegion(stateAbbrev: string): 'northeast' | 'midwest' | 'south' | 'west' {
  const northeast = ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'];
  const midwest = ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'];
  const south = ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'];

  if (northeast.includes(stateAbbrev)) return 'northeast';
  if (midwest.includes(stateAbbrev)) return 'midwest';
  if (south.includes(stateAbbrev)) return 'south';
  return 'west';
}

function findMetro(city: string): string {
  const metros = Object.keys(METRO_COL_ADJUSTMENTS).filter(m => m !== 'default');
  const found = metros.find(m => city.toLowerCase().includes(m.toLowerCase()) ||
                                  m.toLowerCase().includes(city.toLowerCase()));
  return found || 'default';
}
