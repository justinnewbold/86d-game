// ============================================
// CUSTOMER SEGMENTATION & LOYALTY SYSTEM
// ============================================
// Different customer types behave differently
// Understanding your customer mix is key to strategy

import type { Location } from '../types/game';

/**
 * Customer segment types
 */
export type CustomerSegment =
  | 'regulars'
  | 'tourists'
  | 'business'
  | 'families'
  | 'date_night'
  | 'solo_diners';

/**
 * Detailed segment profile
 */
export interface SegmentProfile {
  id: CustomerSegment;
  name: string;
  description: string;
  // Behavioral characteristics
  avgTicketMultiplier: number;
  visitFrequency: 'daily' | 'weekly' | 'monthly' | 'occasionally' | 'once';
  priceElasticity: number; // 0-1, higher = more price sensitive
  reviewPropensity: number; // 0-1, likelihood to leave review
  // When they visit
  preferredDays: ('weekday' | 'weekend')[];
  preferredMeals: ('breakfast' | 'lunch' | 'dinner' | 'late_night')[];
  // What matters to them
  priorities: SegmentPriority[];
  // Loyalty characteristics
  loyaltyPotential: number; // 0-1, likelihood to become regular
  churnSensitivity: number; // 0-1, how easily they leave
}

export interface SegmentPriority {
  factor: 'price' | 'quality' | 'speed' | 'ambiance' | 'convenience' | 'consistency' | 'novelty';
  importance: number; // 1-10
}

/**
 * Customer mix for a location
 */
export interface CustomerMix {
  regulars: number; // percentage (0-100)
  tourists: number;
  business: number;
  families: number;
  date_night: number;
  solo_diners: number;
}

/**
 * Individual customer (for loyalty tracking)
 */
export interface Customer {
  id: string;
  segment: CustomerSegment;
  firstVisit: number; // week number
  totalVisits: number;
  totalSpend: number;
  lastVisit: number;
  avgTicket: number;
  loyaltyScore: number; // 0-100
  churnRisk: number; // 0-100
  hasReviewed: boolean;
  reviewRating?: number;
  notes?: string;
}

/**
 * Loyalty program tier
 */
export interface LoyaltyTier {
  name: string;
  minVisits: number;
  minSpend: number;
  benefits: string[];
  discountPct: number;
  specialPerks: string[];
}

/**
 * Customer state for a location
 */
export interface CustomerState {
  customerMix: CustomerMix;
  totalCustomers: number;
  activeRegulars: Customer[];
  customerLifetimeValue: number;
  avgVisitsPerCustomer: number;
  churnRate: number; // weekly
  acquisitionRate: number; // new customers per week
  loyaltyProgram?: LoyaltyProgram;
}

export interface LoyaltyProgram {
  name: string;
  isActive: boolean;
  tiers: LoyaltyTier[];
  enrolledCustomers: number;
  redemptionRate: number;
  costPerWeek: number;
}

// ============================================
// SEGMENT PROFILES
// ============================================

export const SEGMENT_PROFILES: Record<CustomerSegment, SegmentProfile> = {
  regulars: {
    id: 'regulars',
    name: 'Regulars',
    description: 'Your bread and butter - reliable, forgiving, and valuable',
    avgTicketMultiplier: 0.95, // Know the menu, order efficiently
    visitFrequency: 'weekly',
    priceElasticity: 0.3, // Less price sensitive
    reviewPropensity: 0.6, // Likely to review (positive usually)
    preferredDays: ['weekday', 'weekend'],
    preferredMeals: ['lunch', 'dinner'],
    priorities: [
      { factor: 'consistency', importance: 10 },
      { factor: 'convenience', importance: 8 },
      { factor: 'quality', importance: 7 },
      { factor: 'price', importance: 4 },
    ],
    loyaltyPotential: 1.0, // Already loyal
    churnSensitivity: 0.4, // Forgiving but not unlimited
  },
  tourists: {
    id: 'tourists',
    name: 'Tourists',
    description: 'One-shot visitors - high ticket, high expectations',
    avgTicketMultiplier: 1.25, // Splurge on vacation
    visitFrequency: 'once',
    priceElasticity: 0.2, // Money is set aside
    reviewPropensity: 0.8, // Love to review new places
    preferredDays: ['weekend'],
    preferredMeals: ['dinner'],
    priorities: [
      { factor: 'novelty', importance: 9 },
      { factor: 'quality', importance: 8 },
      { factor: 'ambiance', importance: 8 },
      { factor: 'price', importance: 3 },
    ],
    loyaltyPotential: 0.1, // Unlikely to return
    churnSensitivity: 0.9, // One bad experience = bad review
  },
  business: {
    id: 'business',
    name: 'Business Diners',
    description: 'Expense account warriors - weekday lunch, quick dinner',
    avgTicketMultiplier: 1.35, // Expensing it
    visitFrequency: 'weekly',
    priceElasticity: 0.1, // Not their money
    reviewPropensity: 0.3, // Too busy for reviews
    preferredDays: ['weekday'],
    preferredMeals: ['lunch', 'dinner'],
    priorities: [
      { factor: 'speed', importance: 9 },
      { factor: 'quality', importance: 7 },
      { factor: 'ambiance', importance: 6 },
      { factor: 'convenience', importance: 8 },
    ],
    loyaltyPotential: 0.6, // If you're reliable
    churnSensitivity: 0.5, // Will switch if slow
  },
  families: {
    id: 'families',
    name: 'Families',
    description: 'Weekend warriors - high volume, moderate ticket, patience required',
    avgTicketMultiplier: 0.85, // Kids meals, splitting
    visitFrequency: 'monthly',
    priceElasticity: 0.7, // Very price sensitive
    reviewPropensity: 0.5, // Review if kids were happy
    preferredDays: ['weekend'],
    preferredMeals: ['breakfast', 'lunch', 'dinner'],
    priorities: [
      { factor: 'price', importance: 8 },
      { factor: 'speed', importance: 7 },
      { factor: 'convenience', importance: 8 },
      { factor: 'consistency', importance: 6 },
    ],
    loyaltyPotential: 0.7, // If kids like it, they'll return
    churnSensitivity: 0.6,
  },
  date_night: {
    id: 'date_night',
    name: 'Date Night',
    description: 'Special occasion seekers - ambiance matters, willing to splurge',
    avgTicketMultiplier: 1.4, // Wine, dessert, the works
    visitFrequency: 'monthly',
    priceElasticity: 0.4, // Planned splurge
    reviewPropensity: 0.7, // Love sharing discoveries
    preferredDays: ['weekend'],
    preferredMeals: ['dinner'],
    priorities: [
      { factor: 'ambiance', importance: 10 },
      { factor: 'quality', importance: 9 },
      { factor: 'novelty', importance: 6 },
      { factor: 'price', importance: 4 },
    ],
    loyaltyPotential: 0.5, // May seek variety
    churnSensitivity: 0.7,
  },
  solo_diners: {
    id: 'solo_diners',
    name: 'Solo Diners',
    description: 'Bar seaters and counter fans - quick, efficient, appreciative',
    avgTicketMultiplier: 0.75, // One person
    visitFrequency: 'weekly',
    priceElasticity: 0.5,
    reviewPropensity: 0.4,
    preferredDays: ['weekday'],
    preferredMeals: ['lunch', 'dinner'],
    priorities: [
      { factor: 'convenience', importance: 9 },
      { factor: 'speed', importance: 7 },
      { factor: 'quality', importance: 6 },
      { factor: 'price', importance: 5 },
    ],
    loyaltyPotential: 0.8, // Love a reliable spot
    churnSensitivity: 0.3, // Patient and understanding
  },
};

// ============================================
// LOYALTY TIERS
// ============================================

export const DEFAULT_LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'First Timer',
    minVisits: 1,
    minSpend: 0,
    benefits: ['Welcome drink on second visit'],
    discountPct: 0,
    specialPerks: [],
  },
  {
    name: 'Regular',
    minVisits: 5,
    minSpend: 200,
    benefits: ['Free appetizer monthly', 'Priority reservations'],
    discountPct: 5,
    specialPerks: ['Early menu previews'],
  },
  {
    name: 'VIP',
    minVisits: 20,
    minSpend: 1000,
    benefits: ['Free dessert each visit', 'Guaranteed table'],
    discountPct: 10,
    specialPerks: ['Kitchen tour', 'Chef\'s special items'],
  },
  {
    name: 'Inner Circle',
    minVisits: 50,
    minSpend: 5000,
    benefits: ['Complimentary bottle of wine quarterly', 'Private events'],
    discountPct: 15,
    specialPerks: ['Off-menu items', 'Holiday reservations', 'Bring guests to VIP events'],
  },
];

// ============================================
// SYSTEM FUNCTIONS
// ============================================

/**
 * Initialize customer state with default mix based on location
 */
export function initializeCustomerState(
  locationType: string,
  market: string
): CustomerState {
  let mix: CustomerMix;

  // Default mixes based on location type
  if (locationType === 'downtown') {
    mix = {
      regulars: 20,
      tourists: 15,
      business: 35,
      families: 5,
      date_night: 15,
      solo_diners: 10,
    };
  } else if (locationType === 'suburban') {
    mix = {
      regulars: 30,
      tourists: 5,
      business: 15,
      families: 30,
      date_night: 12,
      solo_diners: 8,
    };
  } else if (locationType === 'tourist_area') {
    mix = {
      regulars: 10,
      tourists: 50,
      business: 10,
      families: 15,
      date_night: 10,
      solo_diners: 5,
    };
  } else {
    // Neighborhood default
    mix = {
      regulars: 35,
      tourists: 5,
      business: 15,
      families: 20,
      date_night: 15,
      solo_diners: 10,
    };
  }

  return {
    customerMix: mix,
    totalCustomers: 0,
    activeRegulars: [],
    customerLifetimeValue: 0,
    avgVisitsPerCustomer: 1,
    churnRate: 0.05,
    acquisitionRate: 10,
  };
}

/**
 * Calculate weighted average ticket based on customer mix
 */
export function calculateMixedTicket(
  baseTicket: number,
  mix: CustomerMix
): number {
  let weightedMultiplier = 0;
  let totalWeight = 0;

  for (const [segment, percentage] of Object.entries(mix)) {
    if (percentage > 0) {
      const profile = SEGMENT_PROFILES[segment as CustomerSegment];
      weightedMultiplier += profile.avgTicketMultiplier * percentage;
      totalWeight += percentage;
    }
  }

  return baseTicket * (weightedMultiplier / Math.max(1, totalWeight));
}

/**
 * Calculate price sensitivity of current mix
 */
export function calculatePriceSensitivity(mix: CustomerMix): number {
  let weightedSensitivity = 0;
  let totalWeight = 0;

  for (const [segment, percentage] of Object.entries(mix)) {
    if (percentage > 0) {
      const profile = SEGMENT_PROFILES[segment as CustomerSegment];
      weightedSensitivity += profile.priceElasticity * percentage;
      totalWeight += percentage;
    }
  }

  return weightedSensitivity / Math.max(1, totalWeight);
}

/**
 * Predict impact of price change on covers
 */
export function predictPriceChangeImpact(
  priceChangePercent: number,
  mix: CustomerMix
): { expectedCoverChange: number; segmentImpacts: Record<CustomerSegment, number> } {
  const sensitivity = calculatePriceSensitivity(mix);
  const overallChange = -priceChangePercent * sensitivity;

  const segmentImpacts: Record<CustomerSegment, number> = {} as Record<CustomerSegment, number>;

  for (const [segment, percentage] of Object.entries(mix)) {
    if (percentage > 0) {
      const profile = SEGMENT_PROFILES[segment as CustomerSegment];
      segmentImpacts[segment as CustomerSegment] = -priceChangePercent * profile.priceElasticity;
    }
  }

  return {
    expectedCoverChange: overallChange,
    segmentImpacts,
  };
}

/**
 * Simulate review likelihood and sentiment
 */
export function predictReviews(
  covers: number,
  mix: CustomerMix,
  serviceQuality: number, // 0-100
  foodQuality: number // 0-100
): {
  expectedReviews: number;
  expectedRating: number;
  positiveReviews: number;
  negativeReviews: number;
} {
  let totalReviewProbability = 0;
  let weightedSentiment = 0;

  for (const [segment, percentage] of Object.entries(mix)) {
    if (percentage > 0) {
      const profile = SEGMENT_PROFILES[segment as CustomerSegment];
      const segmentCovers = covers * (percentage / 100);

      // Base review rate
      const reviewRate = profile.reviewPropensity * 0.1; // 10% max
      totalReviewProbability += segmentCovers * reviewRate;

      // Calculate sentiment based on priorities
      let sentiment = (serviceQuality + foodQuality) / 2;
      for (const priority of profile.priorities) {
        if (priority.factor === 'quality' && foodQuality < 70) {
          sentiment -= priority.importance * 2;
        }
        if (priority.factor === 'speed' && serviceQuality < 60) {
          sentiment -= priority.importance * 2;
        }
      }

      weightedSentiment += sentiment * (percentage / 100);
    }
  }

  const expectedReviews = Math.floor(totalReviewProbability);
  const avgSentiment = weightedSentiment;

  // Convert sentiment to rating (1-5 scale)
  const expectedRating = Math.max(1, Math.min(5, 1 + (avgSentiment / 25)));

  const positiveReviews = Math.floor(expectedReviews * (avgSentiment / 100));
  const negativeReviews = expectedReviews - positiveReviews;

  return {
    expectedReviews,
    expectedRating: Math.round(expectedRating * 10) / 10,
    positiveReviews,
    negativeReviews,
  };
}

/**
 * Process weekly customer dynamics
 */
export function processCustomerWeek(
  state: CustomerState,
  location: Location,
  weeklyCovers: number
): {
  newState: CustomerState;
  newRegulars: number;
  lostRegulars: number;
  clvChange: number;
} {
  const newState = { ...state };

  // Calculate new customers vs returning
  const returningPct = state.customerMix.regulars / 100;
  const newCustomers = Math.floor(weeklyCovers * (1 - returningPct) * 0.3); // 30% are truly new

  // Regular conversion rate based on experience
  const conversionRate = Math.min(0.15, location.reputation / 1000);
  const newRegulars = Math.floor(newCustomers * conversionRate);

  // Churn calculation
  const churnRate = state.churnRate * (1 + (100 - location.reputation) / 200);
  const lostRegulars = Math.floor(state.activeRegulars.length * churnRate);

  // Update state
  newState.totalCustomers += newCustomers;
  newState.acquisitionRate = newCustomers;

  // Update regular count
  const regularsChange = newRegulars - lostRegulars;
  newState.customerMix = {
    ...state.customerMix,
    regulars: Math.max(5, Math.min(60, state.customerMix.regulars + regularsChange * 0.5)),
  };

  // Recalculate CLV
  const avgTicket = calculateMixedTicket(location.avgTicket, newState.customerMix);
  const avgVisits = 2.5; // Average visits per customer lifetime
  newState.customerLifetimeValue = avgTicket * avgVisits;

  const clvChange = newState.customerLifetimeValue - state.customerLifetimeValue;

  return {
    newState,
    newRegulars,
    lostRegulars,
    clvChange,
  };
}

/**
 * Calculate customer acquisition cost
 */
export function calculateCAC(
  marketingSpend: number,
  newCustomers: number
): number {
  if (newCustomers === 0) return 0;
  return marketingSpend / newCustomers;
}

/**
 * Analyze customer segment performance
 */
export function analyzeSegments(
  state: CustomerState,
  location: Location
): {
  segment: CustomerSegment;
  contribution: number;
  avgTicket: number;
  recommendation: string;
}[] {
  const results = [];

  for (const [segment, percentage] of Object.entries(state.customerMix)) {
    if (percentage > 0) {
      const profile = SEGMENT_PROFILES[segment as CustomerSegment];
      const avgTicket = location.avgTicket * profile.avgTicketMultiplier;
      const contribution = (percentage / 100) * avgTicket;

      let recommendation = '';

      if (segment === 'regulars' && percentage < 25) {
        recommendation = 'Build loyalty programs to increase regular base';
      } else if (segment === 'tourists' && percentage > 40) {
        recommendation = 'Diversify - over-reliance on tourists is risky';
      } else if (segment === 'business' && percentage > 30 && location.reputation < 60) {
        recommendation = 'Speed matters for business diners - streamline service';
      } else if (segment === 'families' && percentage > 25) {
        recommendation = 'Consider kids menu improvements for family retention';
      } else if (segment === 'date_night' && percentage > 20) {
        recommendation = 'Invest in ambiance - date night customers pay for atmosphere';
      }

      results.push({
        segment: segment as CustomerSegment,
        contribution,
        avgTicket,
        recommendation,
      });
    }
  }

  return results.sort((a, b) => b.contribution - a.contribution);
}

/**
 * Recommend marketing focus based on customer mix
 */
export function recommendMarketingFocus(
  state: CustomerState,
  goals: 'revenue' | 'stability' | 'growth'
): {
  targetSegment: CustomerSegment;
  reason: string;
  tactics: string[];
} {
  if (goals === 'stability') {
    return {
      targetSegment: 'regulars',
      reason: 'Regulars provide stable, predictable revenue and higher forgiveness for mistakes',
      tactics: [
        'Loyalty program with meaningful rewards',
        'Personal recognition (remember names, preferences)',
        'Early access to new menu items',
        'Exclusive events for regulars',
      ],
    };
  } else if (goals === 'revenue') {
    // Find highest ticket segment
    const sortedByTicket = Object.entries(SEGMENT_PROFILES)
      .sort((a, b) => b[1].avgTicketMultiplier - a[1].avgTicketMultiplier);
    const topSegment = sortedByTicket[0][0] as CustomerSegment;

    return {
      targetSegment: topSegment,
      reason: `${SEGMENT_PROFILES[topSegment].name} have the highest average ticket`,
      tactics: [
        'Premium menu items and upsells',
        'Wine and beverage program improvements',
        'Special occasion promotions',
        'Partnership with hotels/venues',
      ],
    };
  } else {
    // Growth - focus on acquisition
    return {
      targetSegment: 'tourists',
      reason: 'Tourists bring new exposure and potential word-of-mouth',
      tactics: [
        'Social media presence and photo-worthy presentations',
        'Review site optimization',
        'Partnership with tourism boards',
        'Signature dishes that are shareable',
      ],
    };
  }
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export const CUSTOMER_LESSONS = {
  overview: `
Understanding your customers is as important as your food:

REGULARS (20-40% ideal):
- Your most valuable customers
- Lower ticket but consistent revenue
- Forgive occasional mistakes
- Source of referrals

TOURISTS (varies by location):
- High ticket, high expectations
- One-shot - must impress immediately
- Drive reviews (good and bad)
- Unpredictable volume

BUSINESS DINERS:
- Expense account = high ticket
- Speed is critical
- Weekday lunch focus
- Value consistency

FAMILIES:
- Price sensitive but frequent
- Kids menu matters
- Weekends and holidays
- Noise tolerance required

DATE NIGHT:
- Highest per-person spend
- Ambiance crucial
- Weekend evenings
- Social media potential
  `,

  clv: `
Customer Lifetime Value (CLV) is crucial:

CLV = Average Ticket × Visits per Year × Years as Customer

Example:
- Regular: $35 × 50 visits × 5 years = $8,750
- Tourist: $55 × 1 visit × 1 time = $55

A regular is worth 159x a tourist!

This is why:
- Losing regulars is devastating
- Acquisition cost must be recovered
- Retention beats acquisition
- Loyalty programs pay off
  `,
};

export default {
  SEGMENT_PROFILES,
  DEFAULT_LOYALTY_TIERS,
  initializeCustomerState,
  calculateMixedTicket,
  calculatePriceSensitivity,
  predictPriceChangeImpact,
  predictReviews,
  processCustomerWeek,
  calculateCAC,
  analyzeSegments,
  recommendMarketingFocus,
  CUSTOMER_LESSONS,
};
