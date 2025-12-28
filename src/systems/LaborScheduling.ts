// ============================================
// LABOR SCHEDULING SYSTEM
// ============================================
// Real-time labor cost management and shift optimization
// Educational: Teaches labor as % of revenue and scheduling efficiency

import type { Location } from '../types/game';

/**
 * Shift definition for a single time slot
 */
export interface Shift {
  id: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startHour: number; // 0-23
  endHour: number; // 0-23
  role: 'cook' | 'prep' | 'dishwasher' | 'server' | 'host' | 'bartender' | 'manager';
  staffId?: number;
  staffName?: string;
  hourlyWage: number;
}

/**
 * Daily staffing requirements based on expected covers
 */
export interface StaffingRequirement {
  day: string;
  hour: number;
  expectedCovers: number;
  requiredStaff: {
    kitchen: number;
    foh: number;
    bar: number;
  };
  scheduledStaff: {
    kitchen: number;
    foh: number;
    bar: number;
  };
  status: 'understaffed' | 'optimal' | 'overstaffed';
}

/**
 * Weekly schedule summary
 */
export interface WeeklySchedule {
  shifts: Shift[];
  totalHours: number;
  totalLaborCost: number;
  laborCostByDay: Record<string, number>;
  laborCostByRole: Record<string, number>;
  projectedLaborPct: number; // As % of expected revenue
  coverageGaps: { day: string; hour: number; department: string }[];
  overstaffedPeriods: { day: string; hour: number; excessStaff: number }[];
}

// Typical covers by hour for different restaurant types
const HOURLY_COVER_PATTERNS = {
  breakfast: {
    7: 0.3, 8: 0.6, 9: 0.8, 10: 0.5, 11: 0.2,
  },
  lunch: {
    11: 0.4, 12: 1.0, 13: 0.9, 14: 0.5, 15: 0.2,
  },
  dinner: {
    17: 0.3, 18: 0.7, 19: 1.0, 20: 0.9, 21: 0.6, 22: 0.3,
  },
  allDay: {
    11: 0.3, 12: 0.8, 13: 0.7, 14: 0.4, 15: 0.2, 16: 0.2,
    17: 0.4, 18: 0.8, 19: 1.0, 20: 0.9, 21: 0.6, 22: 0.3,
  },
};

// Day-of-week multipliers
const DAY_MULTIPLIERS: Record<string, number> = {
  mon: 0.7,
  tue: 0.75,
  wed: 0.8,
  thu: 0.85,
  fri: 1.2,
  sat: 1.3,
  sun: 0.9,
};

/**
 * Calculate expected covers for each hour of each day
 */
export function calculateExpectedCovers(
  avgWeeklyCovers: number,
  serviceType: 'breakfast' | 'lunch' | 'dinner' | 'allDay' = 'allDay'
): Record<string, Record<number, number>> {
  const pattern = HOURLY_COVER_PATTERNS[serviceType];
  const totalPatternWeight = Object.values(pattern).reduce((sum, v) => sum + v, 0);
  const daysOpen = 7;

  const result: Record<string, Record<number, number>> = {};

  for (const [day, dayMult] of Object.entries(DAY_MULTIPLIERS)) {
    result[day] = {};
    for (const [hour, hourWeight] of Object.entries(pattern)) {
      const hourNum = parseInt(hour, 10);
      // Distribute weekly covers across hours based on pattern
      const coversThisHour = (avgWeeklyCovers / daysOpen) * dayMult *
        (hourWeight / totalPatternWeight) * Object.keys(pattern).length;
      result[day][hourNum] = Math.round(coversThisHour);
    }
  }

  return result;
}

/**
 * Calculate required staff for expected covers
 */
export function calculateRequiredStaff(
  covers: number,
  isKitchen: boolean = false
): number {
  if (isKitchen) {
    // Kitchen: 1 cook per 15-20 covers/hour
    if (covers <= 10) return 1;
    if (covers <= 25) return 2;
    if (covers <= 40) return 3;
    return Math.ceil(covers / 15);
  } else {
    // FOH: 1 server per 15-20 covers at a time (tables)
    if (covers <= 15) return 1;
    if (covers <= 30) return 2;
    if (covers <= 50) return 3;
    return Math.ceil(covers / 15);
  }
}

/**
 * Generate staffing requirements for the week
 */
export function generateStaffingRequirements(
  avgWeeklyCovers: number,
  schedule: WeeklySchedule
): StaffingRequirement[] {
  const expectedCovers = calculateExpectedCovers(avgWeeklyCovers);
  const requirements: StaffingRequirement[] = [];

  for (const [day, hours] of Object.entries(expectedCovers)) {
    for (const [hourStr, covers] of Object.entries(hours)) {
      const hour = parseInt(hourStr, 10);

      const requiredKitchen = calculateRequiredStaff(covers, true);
      const requiredFOH = calculateRequiredStaff(covers, false);
      const requiredBar = covers > 20 ? 1 : 0;

      // Count scheduled staff for this hour
      const scheduledShifts = schedule.shifts.filter(s =>
        s.day === day && s.startHour <= hour && s.endHour > hour
      );

      const scheduledKitchen = scheduledShifts.filter(s =>
        ['cook', 'prep', 'dishwasher'].includes(s.role)
      ).length;
      const scheduledFOH = scheduledShifts.filter(s =>
        ['server', 'host'].includes(s.role)
      ).length;
      const scheduledBar = scheduledShifts.filter(s =>
        s.role === 'bartender'
      ).length;

      const totalRequired = requiredKitchen + requiredFOH + requiredBar;
      const totalScheduled = scheduledKitchen + scheduledFOH + scheduledBar;

      let status: 'understaffed' | 'optimal' | 'overstaffed';
      if (totalScheduled < totalRequired * 0.8) {
        status = 'understaffed';
      } else if (totalScheduled > totalRequired * 1.3) {
        status = 'overstaffed';
      } else {
        status = 'optimal';
      }

      requirements.push({
        day,
        hour,
        expectedCovers: covers,
        requiredStaff: { kitchen: requiredKitchen, foh: requiredFOH, bar: requiredBar },
        scheduledStaff: { kitchen: scheduledKitchen, foh: scheduledFOH, bar: scheduledBar },
        status,
      });
    }
  }

  return requirements;
}

/**
 * Calculate weekly schedule summary
 */
export function calculateScheduleSummary(
  shifts: Shift[],
  expectedWeeklyRevenue: number
): WeeklySchedule {
  let totalHours = 0;
  let totalLaborCost = 0;
  const laborCostByDay: Record<string, number> = {};
  const laborCostByRole: Record<string, number> = {};
  const coverageGaps: { day: string; hour: number; department: string }[] = [];
  const overstaffedPeriods: { day: string; hour: number; excessStaff: number }[] = [];

  for (const shift of shifts) {
    const hours = shift.endHour - shift.startHour;
    const cost = hours * shift.hourlyWage;

    totalHours += hours;
    totalLaborCost += cost;

    laborCostByDay[shift.day] = (laborCostByDay[shift.day] || 0) + cost;
    laborCostByRole[shift.role] = (laborCostByRole[shift.role] || 0) + cost;
  }

  const projectedLaborPct = expectedWeeklyRevenue > 0
    ? totalLaborCost / expectedWeeklyRevenue
    : 0;

  return {
    shifts,
    totalHours,
    totalLaborCost,
    laborCostByDay,
    laborCostByRole,
    projectedLaborPct,
    coverageGaps,
    overstaffedPeriods,
  };
}

/**
 * Auto-generate an optimized schedule
 */
export function generateOptimizedSchedule(
  location: Location,
  avgWeeklyCovers: number,
  wages: Record<string, number>
): WeeklySchedule {
  const shifts: Shift[] = [];
  const expectedCovers = calculateExpectedCovers(avgWeeklyCovers);
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  let shiftId = 1;

  for (const day of days) {
    const dayCovers = expectedCovers[day] || {};
    const hours = Object.keys(dayCovers).map(Number).sort((a, b) => a - b);

    if (hours.length === 0) continue;

    const openHour = Math.min(...hours);
    const closeHour = Math.max(...hours) + 1;
    const peakCovers = Math.max(...Object.values(dayCovers));

    // Kitchen staff
    const kitchenStaffNeeded = calculateRequiredStaff(peakCovers, true);
    for (let i = 0; i < kitchenStaffNeeded; i++) {
      shifts.push({
        id: `shift-${shiftId++}`,
        day,
        startHour: openHour - 1, // Prep time
        endHour: closeHour,
        role: i === 0 ? 'cook' : i === 1 ? 'prep' : 'dishwasher',
        hourlyWage: wages[i === 0 ? 'cook' : i === 1 ? 'prep' : 'dishwasher'] || 15,
      });
    }

    // FOH staff
    const fohStaffNeeded = calculateRequiredStaff(peakCovers, false);
    for (let i = 0; i < fohStaffNeeded; i++) {
      shifts.push({
        id: `shift-${shiftId++}`,
        day,
        startHour: openHour,
        endHour: closeHour,
        role: i === 0 ? 'server' : 'host',
        hourlyWage: wages[i === 0 ? 'server' : 'host'] || 12,
      });
    }

    // Bartender on busy days
    if (['fri', 'sat'].includes(day) || peakCovers > 30) {
      shifts.push({
        id: `shift-${shiftId++}`,
        day,
        startHour: 16,
        endHour: closeHour,
        role: 'bartender',
        hourlyWage: wages.bartender || 14,
      });
    }
  }

  const expectedRevenue = avgWeeklyCovers * (location.avgTicket || 25);
  return calculateScheduleSummary(shifts, expectedRevenue);
}

/**
 * Analyze schedule efficiency
 */
export function analyzeScheduleEfficiency(
  schedule: WeeklySchedule,
  avgWeeklyCovers: number
): {
  laborPctRating: 'excellent' | 'good' | 'warning' | 'critical';
  efficiency: number; // 0-100
  issues: string[];
  recommendations: string[];
  potentialSavings: number;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let potentialSavings = 0;

  // Labor percentage analysis
  let laborPctRating: 'excellent' | 'good' | 'warning' | 'critical';
  if (schedule.projectedLaborPct <= 0.28) {
    laborPctRating = 'excellent';
  } else if (schedule.projectedLaborPct <= 0.32) {
    laborPctRating = 'good';
  } else if (schedule.projectedLaborPct <= 0.38) {
    laborPctRating = 'warning';
    issues.push(`Labor cost at ${(schedule.projectedLaborPct * 100).toFixed(1)}% - above target`);
  } else {
    laborPctRating = 'critical';
    issues.push(`Labor cost at ${(schedule.projectedLaborPct * 100).toFixed(1)}% - critical level`);
  }

  // Check for overstaffing on slow days
  const monCost = schedule.laborCostByDay['mon'] || 0;
  const satCost = schedule.laborCostByDay['sat'] || 0;
  if (monCost > satCost * 0.6) {
    issues.push('Monday staffing seems high relative to Saturday');
    recommendations.push('Consider reducing Monday staff by 1-2 people');
    potentialSavings += monCost * 0.2;
  }

  // Check coverage gaps
  if (schedule.coverageGaps.length > 0) {
    issues.push(`${schedule.coverageGaps.length} time periods understaffed`);
    recommendations.push('Fill coverage gaps to avoid service issues');
  }

  // Check overstaffed periods
  if (schedule.overstaffedPeriods.length > 3) {
    issues.push(`${schedule.overstaffedPeriods.length} periods overstaffed`);
    recommendations.push('Reduce staff during slow periods');
    potentialSavings += schedule.overstaffedPeriods.length * 50;
  }

  // Overall efficiency (inverse of waste)
  const efficiency = Math.max(0, Math.min(100,
    100 - (schedule.projectedLaborPct - 0.28) * 200 - schedule.overstaffedPeriods.length * 5
  ));

  if (recommendations.length === 0) {
    recommendations.push('Schedule looks well-optimized!');
  }

  return {
    laborPctRating,
    efficiency,
    issues,
    recommendations,
    potentialSavings,
  };
}

/**
 * Educational lessons about labor scheduling
 */
export const SCHEDULING_LESSONS = [
  {
    title: 'Labor Is Your Biggest Controllable Cost',
    lesson: 'Food cost is hard to cut without affecting quality. Labor scheduling is where smart operators save money.',
  },
  {
    title: 'The 30% Rule',
    lesson: 'Labor should be 28-32% of revenue for most restaurants. Every point over 32% comes directly from profit.',
  },
  {
    title: 'Staff to Sales, Not to Hours',
    lesson: 'Don\'t schedule the same staff every day. Schedule based on expected covers.',
  },
  {
    title: 'Slow Periods Are Expensive',
    lesson: 'Having 3 servers standing around at 3pm waiting for dinner rush costs more than you think.',
  },
  {
    title: 'Cross-Training Adds Flexibility',
    lesson: 'Staff who can work multiple positions let you run leaner without sacrificing service.',
  },
  {
    title: 'Overtime Is a Warning Sign',
    lesson: 'If you\'re paying overtime regularly, you need to hire. OT costs 1.5x and leads to burnout.',
  },
];

export default {
  calculateExpectedCovers,
  calculateRequiredStaff,
  generateStaffingRequirements,
  calculateScheduleSummary,
  generateOptimizedSchedule,
  analyzeScheduleEfficiency,
  SCHEDULING_LESSONS,
};
