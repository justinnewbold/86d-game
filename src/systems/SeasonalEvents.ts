// ============================================
// SEASONAL EVENTS & CALENDAR SYSTEM
// ============================================
// Restaurant business is highly seasonal
// This system teaches planning for revenue peaks and valleys

import type { Location } from '../types/game';

/**
 * A calendar event that affects restaurant performance
 */
export interface CalendarEvent {
  id: string;
  name: string;
  type: EventType;
  description: string;
  impactDescription: string;
  // When the event occurs
  timing: EventTiming;
  // Effects on business
  effects: EventEffects;
  // Educational content
  lesson: string;
}

export type EventType =
  | 'holiday'
  | 'local_event'
  | 'weather'
  | 'school_calendar'
  | 'industry';

export interface EventTiming {
  // For fixed holidays
  month?: number; // 1-12
  weekOfMonth?: number; // 1-4
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  // For recurring patterns
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  // Duration
  durationWeeks: number;
  // Probability of occurring (for weather, etc.)
  probability?: number;
}

export interface EventEffects {
  coversMultiplier: number; // 1.0 = normal, 1.5 = 50% increase
  avgTicketMultiplier: number;
  laborNeedMultiplier: number;
  foodCostMultiplier: number; // Seasonal ingredients
  reputationMultiplier: number; // Some events are reputation-sensitive
  customerMixShift?: CustomerMixShift;
}

export interface CustomerMixShift {
  regulars: number; // Change in % (e.g., -10 means 10% fewer regulars)
  tourists: number;
  business: number;
  families: number;
  dateNight: number;
}

export interface ActiveEvent {
  event: CalendarEvent;
  startWeek: number;
  endWeek: number;
  intensity: number; // 0.5-1.5, varies each occurrence
}

export interface SeasonalState {
  currentWeek: number;
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter';
  activeEvents: ActiveEvent[];
  upcomingEvents: { event: CalendarEvent; weeksUntil: number }[];
  historicalEvents: { event: CalendarEvent; week: number; actualImpact: number }[];
}

// ============================================
// HOLIDAY EVENTS
// ============================================

export const HOLIDAY_EVENTS: CalendarEvent[] = [
  {
    id: 'valentines-day',
    name: "Valentine's Day",
    type: 'holiday',
    description: 'The biggest date night of the year',
    impactDescription: '+80% covers, +40% ticket (prix fixe menus)',
    timing: {
      month: 2,
      weekOfMonth: 2,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 1.8,
      avgTicketMultiplier: 1.4,
      laborNeedMultiplier: 1.3,
      foodCostMultiplier: 1.15, // Premium ingredients
      reputationMultiplier: 1.5, // Reviews matter more
      customerMixShift: {
        regulars: -20,
        tourists: 0,
        business: -30,
        families: -50,
        dateNight: 100,
      },
    },
    lesson: "Valentine's Day can make or break your February. Smart operators create special menus that command premium prices while controlling costs.",
  },
  {
    id: 'mothers-day',
    name: "Mother's Day",
    type: 'holiday',
    description: 'Busiest brunch day of the year',
    impactDescription: '+100% brunch covers, families dominate',
    timing: {
      month: 5,
      weekOfMonth: 2,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 2.0,
      avgTicketMultiplier: 1.2,
      laborNeedMultiplier: 1.5,
      foodCostMultiplier: 1.1,
      reputationMultiplier: 1.3,
      customerMixShift: {
        regulars: 20,
        tourists: 0,
        business: -80,
        families: 150,
        dateNight: -50,
      },
    },
    lesson: "Mother's Day requires all hands on deck. Reservations book weeks in advance. This is a test of your operational limits.",
  },
  {
    id: 'new-years-eve',
    name: "New Year's Eve",
    type: 'holiday',
    description: 'Premium prix fixe night',
    impactDescription: '+50% covers, +100% ticket with special menu',
    timing: {
      month: 12,
      weekOfMonth: 4,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 1.5,
      avgTicketMultiplier: 2.0,
      laborNeedMultiplier: 1.4,
      foodCostMultiplier: 1.25,
      reputationMultiplier: 1.4,
      customerMixShift: {
        regulars: 10,
        tourists: 50,
        business: -50,
        families: -30,
        dateNight: 80,
      },
    },
    lesson: "NYE is high-risk, high-reward. The premium pricing only works if execution is flawless. One bad NYE review can haunt you all year.",
  },
  {
    id: 'super-bowl-sunday',
    name: 'Super Bowl Sunday',
    type: 'holiday',
    description: 'Sports bars boom, fine dining busts',
    impactDescription: 'Varies wildly by concept',
    timing: {
      month: 2,
      weekOfMonth: 1,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 0.7, // Down for non-sports venues
      avgTicketMultiplier: 0.9,
      laborNeedMultiplier: 0.8,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 0.8,
    },
    lesson: 'Know your concept. Super Bowl is great for bars, terrible for fine dining. Schedule light if it does not fit your brand.',
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving Week',
    type: 'holiday',
    description: 'Wednesday busy, Thursday closed (usually), weekend slow',
    impactDescription: 'Mixed week - plan staffing carefully',
    timing: {
      month: 11,
      weekOfMonth: 4,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 0.6,
      avgTicketMultiplier: 1.1,
      laborNeedMultiplier: 0.7,
      foodCostMultiplier: 1.05,
      reputationMultiplier: 0.9,
    },
    lesson: 'Thanksgiving week is complex. Wednesday is huge, Thursday most close, Friday-Sunday are dead. Schedule accordingly.',
  },
  {
    id: 'christmas-week',
    name: 'Christmas Week',
    type: 'holiday',
    description: 'Dead zone for restaurants',
    impactDescription: '-40% covers as people stay home',
    timing: {
      month: 12,
      weekOfMonth: 4,
      durationWeeks: 1,
    },
    effects: {
      coversMultiplier: 0.6,
      avgTicketMultiplier: 1.0,
      laborNeedMultiplier: 0.6,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 0.8,
    },
    lesson: 'Christmas week is historically slow. Use it for deep cleaning, menu planning, and giving staff well-deserved time off.',
  },
];

// ============================================
// SEASONAL PATTERNS
// ============================================

export const SEASONAL_EVENTS: CalendarEvent[] = [
  {
    id: 'january-slump',
    name: 'January Slump',
    type: 'industry',
    description: 'Post-holiday crash + New Year resolutions',
    impactDescription: '-25% covers as customers recover financially and diet',
    timing: {
      month: 1,
      durationWeeks: 4,
    },
    effects: {
      coversMultiplier: 0.75,
      avgTicketMultiplier: 0.9,
      laborNeedMultiplier: 0.8,
      foodCostMultiplier: 0.95,
      reputationMultiplier: 1.0,
    },
    lesson: 'January is historically the slowest month. Smart operators use it for training, maintenance, and building cash reserves.',
  },
  {
    id: 'summer-patio-season',
    name: 'Summer Patio Season',
    type: 'industry',
    description: 'Outdoor seating expands capacity',
    impactDescription: '+30% covers if you have outdoor seating',
    timing: {
      season: 'summer',
      durationWeeks: 12,
    },
    effects: {
      coversMultiplier: 1.3,
      avgTicketMultiplier: 1.05,
      laborNeedMultiplier: 1.2,
      foodCostMultiplier: 0.95, // Seasonal produce cheaper
      reputationMultiplier: 1.1,
    },
    lesson: 'Summer can be your best season if you maximize outdoor seating. But weather dependency adds risk.',
  },
  {
    id: 'back-to-school',
    name: 'Back to School',
    type: 'school_calendar',
    description: 'Families settle into routines',
    impactDescription: 'Family traffic drops, lunch business returns',
    timing: {
      month: 9,
      weekOfMonth: 1,
      durationWeeks: 2,
    },
    effects: {
      coversMultiplier: 0.9,
      avgTicketMultiplier: 0.95,
      laborNeedMultiplier: 0.9,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.0,
      customerMixShift: {
        regulars: 10,
        tourists: -30,
        business: 20,
        families: -20,
        dateNight: 10,
      },
    },
    lesson: 'Back to school shifts your customer mix. Weekend family crowds drop, but weekday lunch business picks up.',
  },
  {
    id: 'spring-break',
    name: 'Spring Break',
    type: 'school_calendar',
    description: 'Tourist season in some markets',
    impactDescription: 'Varies by location - tourist areas boom',
    timing: {
      month: 3,
      weekOfMonth: 3,
      durationWeeks: 2,
    },
    effects: {
      coversMultiplier: 1.15,
      avgTicketMultiplier: 1.05,
      laborNeedMultiplier: 1.1,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.1,
      customerMixShift: {
        regulars: -10,
        tourists: 50,
        business: -20,
        families: 30,
        dateNight: 0,
      },
    },
    lesson: 'Spring break can bring tourist crowds, but they may not know your restaurant. Marketing matters more during tourist-heavy periods.',
  },
];

// ============================================
// WEATHER EVENTS
// ============================================

export const WEATHER_EVENTS: CalendarEvent[] = [
  {
    id: 'heat-wave',
    name: 'Heat Wave',
    type: 'weather',
    description: 'Extreme heat keeps people home',
    impactDescription: '-20% covers, delivery spikes',
    timing: {
      season: 'summer',
      durationWeeks: 1,
      probability: 0.15,
    },
    effects: {
      coversMultiplier: 0.8,
      avgTicketMultiplier: 0.95,
      laborNeedMultiplier: 0.85,
      foodCostMultiplier: 1.05, // Spoilage risk
      reputationMultiplier: 0.9,
    },
    lesson: 'Extreme weather affects dine-in but can boost delivery. Be ready to pivot operations based on conditions.',
  },
  {
    id: 'snow-storm',
    name: 'Snow Storm',
    type: 'weather',
    description: 'Major winter storm',
    impactDescription: 'Potentially closed, staff call-outs',
    timing: {
      season: 'winter',
      durationWeeks: 1,
      probability: 0.2,
    },
    effects: {
      coversMultiplier: 0.3,
      avgTicketMultiplier: 1.0,
      laborNeedMultiplier: 0.4,
      foodCostMultiplier: 1.1, // Delivery disruptions
      reputationMultiplier: 0.7,
    },
    lesson: 'Snow days mean lost revenue with no way to recover it. Having snow day policies and emergency protocols is essential.',
  },
  {
    id: 'perfect-weather-weekend',
    name: 'Perfect Weather Weekend',
    type: 'weather',
    description: 'Ideal conditions bring people out',
    impactDescription: '+25% covers, especially outdoor',
    timing: {
      season: 'spring',
      durationWeeks: 1,
      probability: 0.25,
    },
    effects: {
      coversMultiplier: 1.25,
      avgTicketMultiplier: 1.05,
      laborNeedMultiplier: 1.2,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.1,
    },
    lesson: 'Perfect weather is a gift. Make sure you are staffed to capture it - these days can make your month.',
  },
  {
    id: 'rainy-week',
    name: 'Rainy Week',
    type: 'weather',
    description: 'Persistent rain dampens traffic',
    impactDescription: '-15% covers, comfort food demand up',
    timing: {
      season: 'spring',
      durationWeeks: 1,
      probability: 0.3,
    },
    effects: {
      coversMultiplier: 0.85,
      avgTicketMultiplier: 1.02,
      laborNeedMultiplier: 0.9,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.0,
    },
    lesson: 'Rainy days favor comfort food and delivery. Know your weather-dependent items and promote accordingly.',
  },
];

// ============================================
// LOCAL EVENTS
// ============================================

export const LOCAL_EVENTS: CalendarEvent[] = [
  {
    id: 'major-sports-game',
    name: 'Major Sports Game',
    type: 'local_event',
    description: 'Big game brings crowds downtown',
    impactDescription: '+40% for sports-friendly venues',
    timing: {
      durationWeeks: 1,
      probability: 0.1,
    },
    effects: {
      coversMultiplier: 1.4,
      avgTicketMultiplier: 0.95,
      laborNeedMultiplier: 1.3,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 0.9, // Rushed service
    },
    lesson: 'Sports events bring volume but can strain operations. Speed and volume matter more than finesse.',
  },
  {
    id: 'convention-in-town',
    name: 'Convention in Town',
    type: 'local_event',
    description: 'Major convention brings business travelers',
    impactDescription: '+35% covers, business expense dining',
    timing: {
      durationWeeks: 1,
      probability: 0.08,
    },
    effects: {
      coversMultiplier: 1.35,
      avgTicketMultiplier: 1.25,
      laborNeedMultiplier: 1.2,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.2,
      customerMixShift: {
        regulars: 0,
        tourists: 20,
        business: 80,
        families: -10,
        dateNight: 0,
      },
    },
    lesson: 'Convention crowds spend freely on expense accounts. Make sure your service matches their expectations.',
  },
  {
    id: 'street-festival',
    name: 'Street Festival',
    type: 'local_event',
    description: 'Local festival near your location',
    impactDescription: 'High foot traffic, mixed results',
    timing: {
      durationWeeks: 1,
      probability: 0.06,
    },
    effects: {
      coversMultiplier: 1.2,
      avgTicketMultiplier: 0.85, // Festival pricing pressure
      laborNeedMultiplier: 1.3,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.0,
    },
    lesson: 'Street festivals bring crowds but not always your ideal customers. Balance participation with protecting your brand.',
  },
  {
    id: 'restaurant-week',
    name: 'Restaurant Week',
    type: 'local_event',
    description: 'City-wide restaurant promotion',
    impactDescription: '+60% covers but fixed prix-fixe pricing',
    timing: {
      durationWeeks: 2,
      probability: 0.04, // Happens 1-2x per year
    },
    effects: {
      coversMultiplier: 1.6,
      avgTicketMultiplier: 0.7, // Prix fixe discounting
      laborNeedMultiplier: 1.4,
      foodCostMultiplier: 1.0,
      reputationMultiplier: 1.3,
    },
    lesson: 'Restaurant Week is marketing, not profit. You trade margin for exposure and potential new regulars. Track conversion.',
  },
];

// ============================================
// ALL EVENTS
// ============================================

export const ALL_EVENTS: CalendarEvent[] = [
  ...HOLIDAY_EVENTS,
  ...SEASONAL_EVENTS,
  ...WEATHER_EVENTS,
  ...LOCAL_EVENTS,
];

// ============================================
// SEASONAL SYSTEM FUNCTIONS
// ============================================

/**
 * Get the season for a given week number (1-52)
 */
export function getSeason(weekOfYear: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (weekOfYear >= 12 && weekOfYear < 24) return 'spring';
  if (weekOfYear >= 24 && weekOfYear < 37) return 'summer';
  if (weekOfYear >= 37 && weekOfYear < 50) return 'fall';
  return 'winter';
}

/**
 * Get month from week of year
 */
export function getMonthFromWeek(weekOfYear: number): number {
  // Cap month to 12 to prevent returning 13 for week 52
  return Math.min(12, Math.ceil(weekOfYear / 4.33));
}

/**
 * Initialize seasonal state
 */
export function initializeSeasonalState(startingWeek: number = 1): SeasonalState {
  return {
    currentWeek: startingWeek,
    currentSeason: getSeason(startingWeek),
    activeEvents: [],
    upcomingEvents: [],
    historicalEvents: [],
  };
}

/**
 * Check which events should activate this week
 */
export function checkForEvents(
  weekOfYear: number,
  existingState: SeasonalState
): { newEvents: CalendarEvent[]; probability: Record<string, number> } {
  const currentMonth = getMonthFromWeek(weekOfYear);
  const currentSeason = getSeason(weekOfYear);
  const weekOfMonth = Math.ceil((weekOfYear % 4.33) || 1);

  const newEvents: CalendarEvent[] = [];
  const probability: Record<string, number> = {};

  for (const event of ALL_EVENTS) {
    // Check if already active
    if (existingState.activeEvents.some(ae => ae.event.id === event.id)) {
      continue;
    }

    let shouldTrigger = false;

    // Check timing conditions
    if (event.timing.month && event.timing.month === currentMonth) {
      if (event.timing.weekOfMonth) {
        shouldTrigger = event.timing.weekOfMonth === weekOfMonth;
      } else {
        shouldTrigger = weekOfMonth === 1; // First week of month
      }
    } else if (event.timing.season && event.timing.season === currentSeason) {
      // Seasonal events trigger at start of season
      if (event.timing.probability) {
        probability[event.id] = event.timing.probability;
        shouldTrigger = Math.random() < event.timing.probability;
      } else {
        // Continuous seasonal effect
        shouldTrigger = true;
      }
    } else if (event.timing.probability && !event.timing.month && !event.timing.season) {
      // Random events
      probability[event.id] = event.timing.probability;
      shouldTrigger = Math.random() < event.timing.probability;
    }

    if (shouldTrigger) {
      newEvents.push(event);
    }
  }

  return { newEvents, probability };
}

/**
 * Process a week of seasonal effects
 */
export function processSeasonalWeek(
  weekOfYear: number,
  state: SeasonalState
): {
  newState: SeasonalState;
  newEvents: ActiveEvent[];
  endedEvents: ActiveEvent[];
  combinedEffects: EventEffects;
} {
  const newState = { ...state };
  newState.currentWeek = weekOfYear;
  newState.currentSeason = getSeason(weekOfYear);

  // Check for ending events
  const endedEvents = state.activeEvents.filter(ae => ae.endWeek < weekOfYear);
  newState.activeEvents = state.activeEvents.filter(ae => ae.endWeek >= weekOfYear);

  // Record ended events in history
  for (const ended of endedEvents) {
    newState.historicalEvents.push({
      event: ended.event,
      week: ended.startWeek,
      actualImpact: ended.intensity,
    });
  }

  // Check for new events
  const { newEvents } = checkForEvents(weekOfYear, newState);
  const newActiveEvents: ActiveEvent[] = [];

  for (const event of newEvents) {
    const activeEvent: ActiveEvent = {
      event,
      startWeek: weekOfYear,
      endWeek: weekOfYear + event.timing.durationWeeks - 1,
      intensity: 0.8 + Math.random() * 0.4, // 0.8-1.2 variation
    };
    newActiveEvents.push(activeEvent);
    newState.activeEvents.push(activeEvent);
  }

  // Calculate combined effects
  const combinedEffects = calculateCombinedEffects(newState.activeEvents);

  // Update upcoming events (next 4 weeks)
  newState.upcomingEvents = getUpcomingEvents(weekOfYear, 4);

  return {
    newState,
    newEvents: newActiveEvents,
    endedEvents,
    combinedEffects,
  };
}

/**
 * Calculate combined effects from all active events
 */
export function calculateCombinedEffects(activeEvents: ActiveEvent[]): EventEffects {
  const base: EventEffects = {
    coversMultiplier: 1.0,
    avgTicketMultiplier: 1.0,
    laborNeedMultiplier: 1.0,
    foodCostMultiplier: 1.0,
    reputationMultiplier: 1.0,
  };

  if (activeEvents.length === 0) return base;

  // Multiply effects (with diminishing returns for multiple events)
  for (const active of activeEvents) {
    const effects = active.event.effects;
    const intensity = active.intensity;

    // Apply with intensity modifier
    base.coversMultiplier *= 1 + (effects.coversMultiplier - 1) * intensity;
    base.avgTicketMultiplier *= 1 + (effects.avgTicketMultiplier - 1) * intensity;
    base.laborNeedMultiplier *= 1 + (effects.laborNeedMultiplier - 1) * intensity;
    base.foodCostMultiplier *= 1 + (effects.foodCostMultiplier - 1) * intensity;
    base.reputationMultiplier *= 1 + (effects.reputationMultiplier - 1) * intensity;
  }

  // Cap extreme values
  base.coversMultiplier = Math.max(0.2, Math.min(3.0, base.coversMultiplier));
  base.avgTicketMultiplier = Math.max(0.5, Math.min(2.5, base.avgTicketMultiplier));
  base.laborNeedMultiplier = Math.max(0.4, Math.min(2.0, base.laborNeedMultiplier));
  base.foodCostMultiplier = Math.max(0.8, Math.min(1.5, base.foodCostMultiplier));
  base.reputationMultiplier = Math.max(0.5, Math.min(2.0, base.reputationMultiplier));

  return base;
}

/**
 * Get upcoming events for planning
 */
export function getUpcomingEvents(
  currentWeek: number,
  weeksAhead: number
): { event: CalendarEvent; weeksUntil: number }[] {
  const upcoming: { event: CalendarEvent; weeksUntil: number }[] = [];

  for (let w = 1; w <= weeksAhead; w++) {
    const futureWeek = currentWeek + w;
    const futureMonth = getMonthFromWeek(futureWeek);
    const futureWeekOfMonth = Math.ceil((futureWeek % 4.33) || 1);

    for (const event of ALL_EVENTS) {
      if (event.timing.month === futureMonth && event.timing.weekOfMonth === futureWeekOfMonth) {
        upcoming.push({ event, weeksUntil: w });
      }
    }
  }

  return upcoming.sort((a, b) => a.weeksUntil - b.weeksUntil);
}

/**
 * Apply seasonal effects to location metrics
 */
export function applySeasonalEffects(
  location: Location,
  effects: EventEffects
): {
  adjustedCovers: number;
  adjustedAvgTicket: number;
  adjustedLaborNeed: number;
  adjustedFoodCostPct: number;
} {
  return {
    adjustedCovers: Math.round(location.covers * effects.coversMultiplier),
    adjustedAvgTicket: location.avgTicket * effects.avgTicketMultiplier,
    adjustedLaborNeed: effects.laborNeedMultiplier,
    adjustedFoodCostPct: location.foodCostPct * effects.foodCostMultiplier,
  };
}

/**
 * Get educational insight about current events
 */
export function getEventInsights(activeEvents: ActiveEvent[]): string[] {
  return activeEvents.map(ae => ae.event.lesson);
}

/**
 * Generate a seasonal calendar overview
 */
export function generateSeasonalCalendar(): {
  month: number;
  monthName: string;
  expectedEvents: string[];
  avgCoversMultiplier: number;
}[] {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return months.map((name, index) => {
    const monthNum = index + 1;
    const monthEvents = ALL_EVENTS.filter(e => e.timing.month === monthNum);

    // Calculate average expected multiplier
    let avgMultiplier = 1.0;
    if (monthEvents.length > 0) {
      avgMultiplier = monthEvents.reduce((sum, e) => sum + e.effects.coversMultiplier, 0) / monthEvents.length;
    }

    return {
      month: monthNum,
      monthName: name,
      expectedEvents: monthEvents.map(e => e.name),
      avgCoversMultiplier: avgMultiplier,
    };
  });
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export const SEASONAL_LESSONS = {
  overview: `
Restaurant revenue is NOT constant. Understanding seasonality is crucial:

- January is typically the slowest month (post-holiday crash)
- Valentine's Day and Mother's Day are massive peaks
- Summer can be great (patios) or terrible (people leave town)
- December varies: holiday parties boom, Christmas week busts
- Weather can override everything

Smart operators plan for this:
1. Build cash reserves in strong months for weak months
2. Adjust staffing levels seasonally
3. Create special menus/promotions for peak periods
4. Use slow periods for training and maintenance
5. Track your historical patterns - they tend to repeat
  `,

  planning: `
How to plan for seasonality:

STAFFING:
- Over-hire slightly before peak periods
- Cross-train so fewer staff can cover slow periods
- Consider seasonal contracts

CASH:
- Build 2-3 months of reserves before slow seasons
- Time major purchases after peak periods
- Negotiate rent abatements for predictably slow months

MARKETING:
- Invest marketing dollars before peak periods
- Create special menus/events for slow periods
- Restaurant Week can fill January seats

MENU:
- Seasonal ingredients reduce costs
- Holiday menus command premium pricing
- Comfort food sells in bad weather
  `,
};

export default {
  ALL_EVENTS,
  HOLIDAY_EVENTS,
  SEASONAL_EVENTS,
  WEATHER_EVENTS,
  LOCAL_EVENTS,
  getSeason,
  initializeSeasonalState,
  checkForEvents,
  processSeasonalWeek,
  calculateCombinedEffects,
  getUpcomingEvents,
  applySeasonalEffects,
  getEventInsights,
  generateSeasonalCalendar,
  SEASONAL_LESSONS,
};
