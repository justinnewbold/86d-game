// ============================================
// COMPETITIVE ANALYSIS & MARKET EVENTS SYSTEM
// ============================================
// Simulates real market dynamics with competitors and events
// Educational: Teaches market positioning and competitive strategy

import type { Location, GameState } from '../types/game';

/**
 * Competitor restaurant in the market
 */
export interface Competitor {
  id: string;
  name: string;
  type: 'chain' | 'independent' | 'fast_casual' | 'fine_dining';
  cuisine: string;
  avgPrice: number;
  rating: number; // 1-5 stars
  distance: number; // miles from player
  marketShare: number; // 0-1, portion of local market
  strengths: string[];
  weaknesses: string[];
  recentNews?: string;
}

/**
 * Market event that affects all restaurants in the area
 */
export interface MarketEvent {
  id: string;
  type: 'competitor_open' | 'competitor_close' | 'economic' | 'seasonal' | 'local' | 'trend';
  title: string;
  description: string;
  duration: number; // weeks
  weeksRemaining: number;
  effects: {
    revenueModifier?: number; // Multiplier (e.g., 0.9 = 10% decrease)
    costModifier?: number;
    reputationChange?: number;
    specificCuisineBonus?: { cuisine: string; modifier: number };
  };
  educationalNote: string;
  requiredResponse?: string; // Suggested action
}

/**
 * Market analysis for a location
 */
export interface MarketAnalysis {
  competitors: Competitor[];
  saturationLevel: 'undersaturated' | 'balanced' | 'saturated' | 'oversaturated';
  avgMarketPrice: number;
  playerPricePosition: 'budget' | 'value' | 'premium' | 'luxury';
  marketTrends: string[];
  opportunities: string[];
  threats: string[];
  activeEvents: MarketEvent[];
}

// Competitor name generators
const CHAIN_NAMES = [
  'Golden Corral', 'Applebee\'s', 'Chili\'s', 'Olive Garden', 'Red Lobster',
  'TGI Friday\'s', 'Buffalo Wild Wings', 'Outback Steakhouse', 'Cracker Barrel'
];

const INDEPENDENT_PREFIXES = [
  'The', 'Old Town', 'Downtown', 'Corner', 'Village', 'Main Street', 'Harbor'
];

const INDEPENDENT_SUFFIXES = [
  'Grill', 'Kitchen', 'Bistro', 'Eatery', 'Tavern', 'Cafe', 'House', 'Table'
];

/**
 * Generate competitors for a market
 */
export function generateCompetitors(
  location: Location,
  playerCuisine: string,
  marketType: string
): Competitor[] {
  const competitors: Competitor[] = [];

  // Number of competitors based on market type
  const competitorCount = {
    'urban_downtown': 8,
    'urban_neighborhood': 5,
    'suburban_strip': 4,
    'suburban_standalone': 3,
    'rural': 2,
  }[marketType] || 4;

  // Always add at least one chain competitor
  const chainIndex = Math.floor(Math.random() * CHAIN_NAMES.length);
  competitors.push({
    id: 'chain-1',
    name: CHAIN_NAMES[chainIndex],
    type: 'chain',
    cuisine: 'american',
    avgPrice: 15 + Math.random() * 10,
    rating: 3.2 + Math.random() * 0.8,
    distance: 0.5 + Math.random() * 2,
    marketShare: 0.15 + Math.random() * 0.1,
    strengths: ['Brand recognition', 'Consistent quality', 'Marketing budget'],
    weaknesses: ['Generic food', 'No local character', 'Staff turnover'],
  });

  // Add independent competitors
  for (let i = 1; i < competitorCount; i++) {
    const prefix = INDEPENDENT_PREFIXES[Math.floor(Math.random() * INDEPENDENT_PREFIXES.length)];
    const suffix = INDEPENDENT_SUFFIXES[Math.floor(Math.random() * INDEPENDENT_SUFFIXES.length)];

    const cuisines = ['american', 'italian', 'mexican', 'asian', 'mediterranean', playerCuisine];
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

    const isDirectCompetitor = cuisine === playerCuisine;

    competitors.push({
      id: `indie-${i}`,
      name: `${prefix} ${suffix}`,
      type: Math.random() > 0.7 ? 'fast_casual' : 'independent',
      cuisine,
      avgPrice: 12 + Math.random() * 25,
      rating: 3.5 + Math.random() * 1.5,
      distance: 0.3 + Math.random() * 3,
      marketShare: 0.05 + Math.random() * 0.1,
      strengths: isDirectCompetitor
        ? ['Similar cuisine', 'Established customer base']
        : ['Unique menu', 'Local following'],
      weaknesses: ['Limited marketing', 'Inconsistent hours'],
    });
  }

  return competitors;
}

/**
 * Generate random market events
 */
export function generateMarketEvent(
  week: number,
  location: Location,
  competitors: Competitor[],
  playerCuisine: string
): MarketEvent | null {
  // 15% chance of event each week
  if (Math.random() > 0.15) return null;

  const eventTypes: MarketEvent[] = [
    // New competitor opens
    {
      id: `event-${week}-newcomp`,
      type: 'competitor_open',
      title: '🏪 New Restaurant Opens Nearby',
      description: `A new ${['fast casual', 'trendy', 'upscale'][Math.floor(Math.random() * 3)]} restaurant just opened 0.5 miles away. Expect increased competition for the next few weeks.`,
      duration: 8,
      weeksRemaining: 8,
      effects: {
        revenueModifier: 0.92,
      },
      educationalNote: 'New competitors often cause a temporary dip as customers try them. Focus on your strengths and loyal customers.',
      requiredResponse: 'Consider a marketing push or special promotions to retain customers.',
    },
    // Competitor closes
    {
      id: `event-${week}-compclose`,
      type: 'competitor_close',
      title: '📉 Competitor Closes',
      description: `${competitors[Math.floor(Math.random() * competitors.length)]?.name || 'A nearby restaurant'} has closed permanently. Their customers are looking for alternatives.`,
      duration: 6,
      weeksRemaining: 6,
      effects: {
        revenueModifier: 1.12,
      },
      educationalNote: 'When competitors close, their customers become available. This is a great time to acquire new regulars.',
    },
    // Local event
    {
      id: `event-${week}-local`,
      type: 'local',
      title: '🎉 Local Festival This Weekend',
      description: 'A popular local festival is bringing extra foot traffic to the area.',
      duration: 1,
      weeksRemaining: 1,
      effects: {
        revenueModifier: 1.25,
        costModifier: 1.05, // Need more supplies
      },
      educationalNote: 'Local events are opportunities, but you need extra staff and inventory to capitalize.',
    },
    // Food trend
    {
      id: `event-${week}-trend`,
      type: 'trend',
      title: '📱 Food Trend Going Viral',
      description: `${['Plant-based options', 'Spicy foods', 'Comfort classics', 'Fusion cuisine'][Math.floor(Math.random() * 4)]} are trending on social media.`,
      duration: 4,
      weeksRemaining: 4,
      effects: {
        specificCuisineBonus: {
          cuisine: playerCuisine,
          modifier: Math.random() > 0.5 ? 1.1 : 0.95,
        },
      },
      educationalNote: 'Trends come and go. Chase them if it fits your brand, but don\'t abandon your identity.',
    },
    // Economic downturn
    {
      id: `event-${week}-econ`,
      type: 'economic',
      title: '💼 Local Layoffs Announced',
      description: 'A major employer in the area is laying off workers. Expect reduced discretionary spending.',
      duration: 12,
      weeksRemaining: 12,
      effects: {
        revenueModifier: 0.88,
      },
      educationalNote: 'Economic downturns hit restaurants hard. Consider value promotions and focus on retention.',
      requiredResponse: 'Consider adding lunch specials or value menu options.',
    },
    // Seasonal boost
    {
      id: `event-${week}-season`,
      type: 'seasonal',
      title: '☀️ Perfect Weather Week',
      description: 'Beautiful weather is driving people out to eat.',
      duration: 1,
      weeksRemaining: 1,
      effects: {
        revenueModifier: 1.15,
      },
      educationalNote: 'Weather affects restaurant traffic significantly. Outdoor seating pays for itself in good weather.',
    },
    // Negative review
    {
      id: `event-${week}-review`,
      type: 'local',
      title: '📰 Food Critic Review Published',
      description: `The local paper published a ${Math.random() > 0.5 ? 'positive' : 'mixed'} review of your restaurant.`,
      duration: 4,
      weeksRemaining: 4,
      effects: {
        reputationChange: Math.random() > 0.5 ? 10 : -5,
        revenueModifier: Math.random() > 0.5 ? 1.08 : 0.95,
      },
      educationalNote: 'Press coverage can make or break a restaurant. Always treat every customer like a critic.',
    },
  ];

  return eventTypes[Math.floor(Math.random() * eventTypes.length)];
}

/**
 * Analyze the competitive landscape
 */
export function analyzeMarket(
  location: Location,
  competitors: Competitor[],
  playerAvgPrice: number,
  playerCuisine: string
): MarketAnalysis {
  // Calculate saturation
  const totalMarketShare = competitors.reduce((sum, c) => sum + c.marketShare, 0);
  const saturationLevel =
    totalMarketShare < 0.4 ? 'undersaturated' :
    totalMarketShare < 0.6 ? 'balanced' :
    totalMarketShare < 0.8 ? 'saturated' : 'oversaturated';

  // Calculate market average price (guard against empty competitors array)
  const avgMarketPrice = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.avgPrice, 0) / competitors.length
    : playerAvgPrice; // Default to player's price if no competitors

  // Determine player price position (guard against zero avgMarketPrice)
  const priceRatio = avgMarketPrice > 0 ? playerAvgPrice / avgMarketPrice : 1;
  const playerPricePosition =
    priceRatio < 0.8 ? 'budget' :
    priceRatio < 1.0 ? 'value' :
    priceRatio < 1.3 ? 'premium' : 'luxury';

  // Identify trends
  const marketTrends: string[] = [];
  const directCompetitors = competitors.filter(c => c.cuisine === playerCuisine);
  if (directCompetitors.length > 2) {
    marketTrends.push(`High competition in ${playerCuisine} cuisine`);
  }
  if (competitors.filter(c => c.type === 'chain').length > 2) {
    marketTrends.push('Chain-dominated market');
  }
  const avgRating = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
    : 3.5; // Default average rating
  if (avgRating > 4.0) {
    marketTrends.push('High quality expectations in this market');
  }

  // Identify opportunities
  const opportunities: string[] = [];
  const underservedCuisines = ['thai', 'indian', 'mediterranean', 'korean']
    .filter(c => !competitors.some(comp => comp.cuisine === c));
  if (underservedCuisines.length > 0) {
    opportunities.push(`Underserved cuisines: ${underservedCuisines.join(', ')}`);
  }
  if (saturationLevel === 'undersaturated') {
    opportunities.push('Room for growth - market not saturated');
  }
  const lowRatedCompetitors = competitors.filter(c => c.rating < 3.5);
  if (lowRatedCompetitors.length > 0) {
    opportunities.push(`Weak competitors: ${lowRatedCompetitors.map(c => c.name).join(', ')}`);
  }

  // Identify threats
  const threats: string[] = [];
  const strongChains = competitors.filter(c => c.type === 'chain' && c.marketShare > 0.15);
  if (strongChains.length > 0) {
    threats.push(`Strong chain presence: ${strongChains.map(c => c.name).join(', ')}`);
  }
  if (directCompetitors.some(c => c.rating > 4.5)) {
    threats.push('Highly-rated direct competitor');
  }
  if (saturationLevel === 'oversaturated') {
    threats.push('Oversaturated market - fierce competition');
  }

  return {
    competitors,
    saturationLevel,
    avgMarketPrice,
    playerPricePosition,
    marketTrends,
    opportunities,
    threats,
    activeEvents: [],
  };
}

/**
 * Apply market event effects to location
 */
export function applyMarketEventEffects(
  location: Location,
  events: MarketEvent[]
): {
  revenueModifier: number;
  costModifier: number;
  reputationChange: number;
} {
  let revenueModifier = 1.0;
  let costModifier = 1.0;
  let reputationChange = 0;

  for (const event of events) {
    if (event.weeksRemaining > 0) {
      if (event.effects.revenueModifier) {
        revenueModifier *= event.effects.revenueModifier;
      }
      if (event.effects.costModifier) {
        costModifier *= event.effects.costModifier;
      }
      if (event.effects.reputationChange) {
        reputationChange += event.effects.reputationChange;
      }
    }
  }

  return { revenueModifier, costModifier, reputationChange };
}

/**
 * Process market events for a week
 */
export function processMarketWeek(
  week: number,
  location: Location,
  analysis: MarketAnalysis,
  playerCuisine: string
): {
  updatedAnalysis: MarketAnalysis;
  newEvent: MarketEvent | null;
  expiredEvents: MarketEvent[];
} {
  // Decrement remaining weeks on active events
  const activeEvents = analysis.activeEvents.map(e => ({
    ...e,
    weeksRemaining: e.weeksRemaining - 1,
  }));

  // Separate expired events
  const expiredEvents = activeEvents.filter(e => e.weeksRemaining <= 0);
  const remainingEvents = activeEvents.filter(e => e.weeksRemaining > 0);

  // Potentially generate new event
  const newEvent = generateMarketEvent(week, location, analysis.competitors, playerCuisine);
  if (newEvent) {
    remainingEvents.push(newEvent);
  }

  return {
    updatedAnalysis: {
      ...analysis,
      activeEvents: remainingEvents,
    },
    newEvent,
    expiredEvents,
  };
}

/**
 * Educational insights about the market
 */
export const MARKET_LESSONS = [
  {
    title: 'Know Your Competition',
    lesson: 'Visit competitors regularly. Know their prices, quality, and weaknesses. Differentiate on what they can\'t replicate.',
  },
  {
    title: 'Chains Are Not Invincible',
    lesson: 'Chains win on consistency and marketing, but lose on authenticity and flexibility. Be what they can\'t.',
  },
  {
    title: 'Location Saturation Matters',
    lesson: 'Too many restaurants in one area split the customer base. In oversaturated markets, only the best survive.',
  },
  {
    title: 'Pricing Is Positioning',
    lesson: 'Your price tells customers what to expect. Being cheapest rarely wins - being best value does.',
  },
  {
    title: 'Events Are Opportunities',
    lesson: 'Local events, holidays, and even competitor closures are chances to acquire new customers. Be ready.',
  },
];

export default {
  generateCompetitors,
  generateMarketEvent,
  analyzeMarket,
  applyMarketEventEffects,
  processMarketWeek,
  MARKET_LESSONS,
};
