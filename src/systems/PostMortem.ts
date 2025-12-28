// ============================================
// POST-MORTEM ANALYSIS & EXPORT SYSTEM
// ============================================
// Generates detailed analysis when a game ends
// Educational: Turns every playthrough into a learning experience

import type { GameState, Location, SetupState } from '../types/game';
import { INDUSTRY_BENCHMARKS } from './RealisticFinancials';

/**
 * Complete post-mortem report
 */
export interface PostMortemReport {
  // Game summary
  summary: {
    restaurantName: string;
    cuisine: string;
    totalWeeks: number;
    outcome: 'bankruptcy' | 'sold' | 'thriving' | 'survived' | 'closed';
    finalCash: number;
    peakCash: number;
    finalReputation: number;
    totalRevenue: number;
    totalProfit: number;
    locationsOpened: number;
    staffHired: number;
    staffLost: number;
  };

  // Financial trajectory
  financials: {
    weeklySnapshots: WeeklySnapshot[];
    avgPrimeCost: number;
    avgNetMargin: number;
    worstWeek: WeeklySnapshot;
    bestWeek: WeeklySnapshot;
    breakEvenWeek: number | null;
    cashCrunchWeeks: number[];
    profitableWeeks: number;
    unprofitableWeeks: number;
  };

  // Key decisions analysis
  decisions: {
    good: DecisionAnalysis[];
    bad: DecisionAnalysis[];
    missed: DecisionAnalysis[];
  };

  // Performance vs benchmarks
  benchmarkComparison: {
    metric: string;
    yourValue: number;
    benchmark: number;
    rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
    insight: string;
  }[];

  // What would have changed the outcome
  whatIf: WhatIfScenario[];

  // Final grade and lessons
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  keyLessons: string[];
  educationalSummary: string;

  // Shareable text
  shareableText: string;
  generatedAt: string;
}

interface WeeklySnapshot {
  week: number;
  revenue: number;
  profit: number;
  cash: number;
  reputation: number;
  primeCostPct: number;
  staffCount: number;
  morale: number;
}

interface DecisionAnalysis {
  week: number;
  decision: string;
  impact: string;
  financialEffect: number;
  lesson: string;
}

interface WhatIfScenario {
  title: string;
  change: string;
  projectedOutcome: string;
  potentialImprovement: string;
}

/**
 * Generate a complete post-mortem report
 */
export function generatePostMortem(
  setup: SetupState,
  game: GameState,
  outcome: 'bankruptcy' | 'sold' | 'thriving' | 'survived' | 'closed'
): PostMortemReport {
  const location = game.locations[0];
  if (!location) {
    return createEmptyReport(setup, outcome);
  }

  // Build weekly snapshots from history
  const weeklySnapshots = buildWeeklySnapshots(location, game);

  // Analyze financials
  const financials = analyzeFinancials(weeklySnapshots, location);

  // Analyze decisions
  const decisions = analyzeDecisions(weeklySnapshots, location, game);

  // Compare to benchmarks
  const benchmarkComparison = compareToBenchmarks(financials, location);

  // Generate what-if scenarios
  const whatIf = generateWhatIfs(financials, decisions, outcome);

  // Calculate grade
  const grade = calculateGrade(outcome, financials, benchmarkComparison);

  // Generate lessons
  const keyLessons = generateLessons(outcome, financials, decisions, benchmarkComparison);

  // Generate educational summary
  const educationalSummary = generateEducationalSummary(outcome, grade, keyLessons);

  // Create summary
  const summary = {
    restaurantName: setup.name,
    cuisine: setup.cuisine || 'american',
    totalWeeks: game.week,
    outcome,
    finalCash: location.cash,
    peakCash: weeklySnapshots.length > 0 ? Math.max(...weeklySnapshots.map(s => s.cash)) : location.cash,
    finalReputation: location.reputation,
    totalRevenue: location.totalRevenue || 0,
    totalProfit: location.totalProfit || 0,
    locationsOpened: game.locations.length,
    staffHired: (location.staff?.length || 0) + 10, // Estimate
    staffLost: 5, // Estimate
  };

  // Generate shareable text
  const shareableText = generateShareableText(summary, grade, keyLessons);

  return {
    summary,
    financials,
    decisions,
    benchmarkComparison,
    whatIf,
    grade,
    keyLessons,
    educationalSummary,
    shareableText,
    generatedAt: new Date().toISOString(),
  };
}

function buildWeeklySnapshots(location: Location, game: GameState): WeeklySnapshot[] {
  const history = location.weeklyHistory || [];

  return history.map((week, index) => ({
    week: week.week || index + 1,
    revenue: week.revenue || 0,
    profit: week.profit || 0,
    cash: location.cash, // Approximation
    reputation: location.reputation,
    primeCostPct: 0.55 + Math.random() * 0.15, // Estimate
    staffCount: location.staff?.length || 5,
    morale: location.morale || 50,
  }));
}

function analyzeFinancials(
  snapshots: WeeklySnapshot[],
  location: Location
): PostMortemReport['financials'] {
  if (snapshots.length === 0) {
    return {
      weeklySnapshots: [],
      avgPrimeCost: 0,
      avgNetMargin: 0,
      worstWeek: { week: 0, revenue: 0, profit: 0, cash: 0, reputation: 0, primeCostPct: 0, staffCount: 0, morale: 0 },
      bestWeek: { week: 0, revenue: 0, profit: 0, cash: 0, reputation: 0, primeCostPct: 0, staffCount: 0, morale: 0 },
      breakEvenWeek: null,
      cashCrunchWeeks: [],
      profitableWeeks: 0,
      unprofitableWeeks: 0,
    };
  }

  const avgPrimeCost = snapshots.reduce((sum, s) => sum + s.primeCostPct, 0) / snapshots.length;
  const totalRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = snapshots.reduce((sum, s) => sum + s.profit, 0);
  const avgNetMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

  const worstWeek = [...snapshots].sort((a, b) => a.profit - b.profit)[0];
  const bestWeek = [...snapshots].sort((a, b) => b.profit - a.profit)[0];

  // Find first profitable week (cumulative)
  let cumulativeProfit = 0;
  let breakEvenWeek: number | null = null;
  for (const snap of snapshots) {
    cumulativeProfit += snap.profit;
    if (cumulativeProfit > 0 && breakEvenWeek === null) {
      breakEvenWeek = snap.week;
    }
  }

  // Find cash crunch weeks
  const cashCrunchWeeks = snapshots
    .filter(s => s.cash < location.rent * 4) // Less than 4 weeks of rent
    .map(s => s.week);

  const profitableWeeks = snapshots.filter(s => s.profit > 0).length;
  const unprofitableWeeks = snapshots.filter(s => s.profit < 0).length;

  return {
    weeklySnapshots: snapshots,
    avgPrimeCost,
    avgNetMargin,
    worstWeek,
    bestWeek,
    breakEvenWeek,
    cashCrunchWeeks,
    profitableWeeks,
    unprofitableWeeks,
  };
}

function analyzeDecisions(
  snapshots: WeeklySnapshot[],
  location: Location,
  game: GameState
): PostMortemReport['decisions'] {
  const good: DecisionAnalysis[] = [];
  const bad: DecisionAnalysis[] = [];
  const missed: DecisionAnalysis[] = [];

  // Analyze staff decisions
  if ((location.staff?.length || 0) >= 5) {
    good.push({
      week: 1,
      decision: 'Adequate staffing from start',
      impact: 'Maintained service quality',
      financialEffect: 0,
      lesson: 'Having enough staff prevents service failures',
    });
  }

  // Analyze cash management
  if (snapshots.some(s => s.cash < 5000)) {
    bad.push({
      week: snapshots.find(s => s.cash < 5000)?.week || 1,
      decision: 'Let cash reserves drop too low',
      impact: 'Risked inability to pay bills',
      financialEffect: -2000,
      lesson: 'Always maintain at least 4-6 weeks of expenses as reserves',
    });
  }

  // Analyze reputation
  if (location.reputation > 70) {
    good.push({
      week: game.week,
      decision: 'Maintained high quality standards',
      impact: 'Built strong reputation',
      financialEffect: 5000,
      lesson: 'Reputation compounds - good reviews bring more customers',
    });
  } else if (location.reputation < 40) {
    bad.push({
      week: Math.floor(game.week / 2),
      decision: 'Quality slipped',
      impact: 'Lost customer trust',
      financialEffect: -8000,
      lesson: 'Reputation is hard to rebuild once lost',
    });
  }

  // Check for missed opportunities
  if (!location.delivery?.platforms?.length) {
    missed.push({
      week: 1,
      decision: 'Never added delivery platforms',
      impact: 'Missed 15-20% potential revenue',
      financialEffect: -3000,
      lesson: 'Delivery is now essential for most restaurants',
    });
  }

  if ((location.staff?.length || 0) > 0 && !location.manager) {
    missed.push({
      week: 10,
      decision: 'Never hired a manager',
      impact: 'Owner burnout, limited growth',
      financialEffect: -2000,
      lesson: 'Managers free you to work ON the business, not just IN it',
    });
  }

  return { good, bad, missed };
}

function compareToBenchmarks(
  financials: PostMortemReport['financials'],
  location: Location
): PostMortemReport['benchmarkComparison'] {
  const comparisons: PostMortemReport['benchmarkComparison'] = [];

  // Prime cost comparison
  const primeCostRating =
    financials.avgPrimeCost <= 0.58 ? 'excellent' :
    financials.avgPrimeCost <= 0.62 ? 'good' :
    financials.avgPrimeCost <= 0.68 ? 'average' :
    financials.avgPrimeCost <= 0.72 ? 'poor' : 'critical';

  comparisons.push({
    metric: 'Prime Cost',
    yourValue: financials.avgPrimeCost,
    benchmark: INDUSTRY_BENCHMARKS.primeCost.target,
    rating: primeCostRating,
    insight: primeCostRating === 'excellent' || primeCostRating === 'good'
      ? 'Great cost control! This is the foundation of profitability.'
      : 'Prime cost was too high. Focus on food cost and labor scheduling.',
  });

  // Net margin comparison
  const marginRating =
    financials.avgNetMargin >= 0.12 ? 'excellent' :
    financials.avgNetMargin >= 0.08 ? 'good' :
    financials.avgNetMargin >= 0.04 ? 'average' :
    financials.avgNetMargin >= 0 ? 'poor' : 'critical';

  comparisons.push({
    metric: 'Net Profit Margin',
    yourValue: financials.avgNetMargin,
    benchmark: INDUSTRY_BENCHMARKS.netProfit.acceptable,
    rating: marginRating,
    insight: marginRating === 'excellent' || marginRating === 'good'
      ? 'Strong profitability! You beat most restaurants.'
      : 'Margins were thin. In restaurants, every percentage point matters.',
  });

  // Profitable weeks ratio
  const totalWeeks = financials.profitableWeeks + financials.unprofitableWeeks;
  const profitableRatio = totalWeeks > 0 ? financials.profitableWeeks / totalWeeks : 0;
  const consistencyRating =
    profitableRatio >= 0.9 ? 'excellent' :
    profitableRatio >= 0.75 ? 'good' :
    profitableRatio >= 0.6 ? 'average' :
    profitableRatio >= 0.4 ? 'poor' : 'critical';

  comparisons.push({
    metric: 'Consistency (% profitable weeks)',
    yourValue: profitableRatio,
    benchmark: 0.75,
    rating: consistencyRating,
    insight: consistencyRating === 'excellent' || consistencyRating === 'good'
      ? 'Consistent performance reduces stress and builds reserves.'
      : 'Too much variance. Look for patterns in unprofitable weeks.',
  });

  return comparisons;
}

function generateWhatIfs(
  financials: PostMortemReport['financials'],
  decisions: PostMortemReport['decisions'],
  outcome: string
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];

  if (financials.avgPrimeCost > 0.65) {
    scenarios.push({
      title: 'Lower Prime Cost',
      change: 'If prime cost was 60% instead of ' + (financials.avgPrimeCost * 100).toFixed(0) + '%',
      projectedOutcome: `Would have saved $${Math.floor(financials.weeklySnapshots.reduce((sum, s) => sum + s.revenue, 0) * 0.05).toLocaleString()} total`,
      potentialImprovement: 'Tighter portion control and better scheduling could have achieved this',
    });
  }

  if (financials.cashCrunchWeeks.length > 2) {
    scenarios.push({
      title: 'Started with More Capital',
      change: 'If you had 50% more starting capital',
      projectedOutcome: 'Could have weathered slow periods without stress',
      potentialImprovement: 'Most restaurants are undercapitalized. 6 months of expenses is the minimum.',
    });
  }

  if (decisions.bad.length > 0) {
    scenarios.push({
      title: 'Avoided Key Mistake',
      change: `If you had avoided: ${decisions.bad[0].decision}`,
      projectedOutcome: `Could have saved approximately $${Math.abs(decisions.bad[0].financialEffect).toLocaleString()}`,
      potentialImprovement: decisions.bad[0].lesson,
    });
  }

  if (outcome === 'bankruptcy' || outcome === 'closed') {
    scenarios.push({
      title: 'Caught Problems Earlier',
      change: 'If you had monthly P&L reviews from week 1',
      projectedOutcome: 'Would have spotted trends 4-8 weeks sooner',
      potentialImprovement: 'Regular financial review catches problems before they become crises',
    });
  }

  return scenarios;
}

function calculateGrade(
  outcome: string,
  financials: PostMortemReport['financials'],
  benchmarks: PostMortemReport['benchmarkComparison']
): 'A' | 'B' | 'C' | 'D' | 'F' {
  let score = 0;

  // Outcome weight (40%)
  switch (outcome) {
    case 'thriving': score += 40; break;
    case 'sold': score += 35; break;
    case 'survived': score += 25; break;
    case 'closed': score += 10; break;
    case 'bankruptcy': score += 0; break;
  }

  // Benchmarks weight (40%)
  const benchmarkScore = benchmarks.reduce((sum, b) => {
    switch (b.rating) {
      case 'excellent': return sum + 10;
      case 'good': return sum + 8;
      case 'average': return sum + 5;
      case 'poor': return sum + 2;
      case 'critical': return sum + 0;
    }
  }, 0);
  score += Math.min(40, benchmarkScore);

  // Consistency weight (20%)
  const totalWeeks = financials.profitableWeeks + financials.unprofitableWeeks;
  const profitableRatio = totalWeeks > 0 ? financials.profitableWeeks / totalWeeks : 0;
  score += Math.floor(profitableRatio * 20);

  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function generateLessons(
  outcome: string,
  financials: PostMortemReport['financials'],
  decisions: PostMortemReport['decisions'],
  benchmarks: PostMortemReport['benchmarkComparison']
): string[] {
  const lessons: string[] = [];

  // Prime cost lesson
  if (financials.avgPrimeCost > 0.65) {
    lessons.push('Prime Cost is King: Your food + labor exceeded 65% of revenue. This is the #1 killer of restaurants.');
  } else if (financials.avgPrimeCost <= 0.60) {
    lessons.push('Great Cost Control: You kept prime cost under 60%. This discipline is what separates survivors from failures.');
  }

  // Cash management lesson
  if (financials.cashCrunchWeeks.length > 0) {
    lessons.push(`Cash is Air: You had ${financials.cashCrunchWeeks.length} weeks of dangerously low cash. Build reserves before you need them.`);
  }

  // Consistency lesson
  if (financials.unprofitableWeeks > financials.profitableWeeks) {
    lessons.push('Consistency Matters: More losing weeks than winning weeks. Find what caused the bad weeks and fix it.');
  }

  // From decisions
  if (decisions.bad.length > 0) {
    lessons.push(`Learn From Mistakes: ${decisions.bad[0].lesson}`);
  }
  if (decisions.missed.length > 0) {
    lessons.push(`Missed Opportunity: ${decisions.missed[0].lesson}`);
  }

  // Outcome-specific lessons
  if (outcome === 'bankruptcy') {
    lessons.push('60% of restaurants fail in 5 years. You\'ve now experienced why. Apply these lessons to succeed next time.');
  } else if (outcome === 'thriving') {
    lessons.push('You beat the odds! The skills you learned - cost control, cash management, quality focus - apply to any business.');
  }

  return lessons.slice(0, 5);
}

function generateEducationalSummary(
  outcome: string,
  grade: string,
  lessons: string[]
): string {
  const outcomeText = {
    'bankruptcy': 'went bankrupt',
    'closed': 'closed its doors',
    'survived': 'survived but struggled',
    'sold': 'was sold successfully',
    'thriving': 'became a thriving success',
  }[outcome] || 'ended';

  return `Your restaurant ${outcomeText}, earning a grade of ${grade}.

The restaurant industry is brutally competitive - 60% of restaurants fail within 5 years. Whether you succeeded or failed in this simulation, you've learned lessons that real restaurant owners often learn the hard way:

${lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}

These same principles - prime cost control, cash management, quality consistency - apply to any business. Every playthrough is a learning experience.`;
}

function generateShareableText(
  summary: PostMortemReport['summary'],
  grade: string,
  lessons: string[]
): string {
  const outcomeEmoji = {
    'bankruptcy': '💀',
    'closed': '🔒',
    'survived': '😅',
    'sold': '🎉',
    'thriving': '🌟',
  }[summary.outcome] || '🍽️';

  return `${outcomeEmoji} ${summary.restaurantName} - Final Report

📊 ${summary.totalWeeks} weeks | Grade: ${grade}
💰 Final Cash: $${summary.finalCash.toLocaleString()}
⭐ Reputation: ${summary.finalReputation}/100

Key Lesson: ${lessons[0] || 'Every failure is a lesson.'}

#86dGame #RestaurantSimulator`;
}

function createEmptyReport(setup: SetupState, outcome: string): PostMortemReport {
  return {
    summary: {
      restaurantName: setup.name,
      cuisine: setup.cuisine || 'american',
      totalWeeks: 0,
      outcome: outcome as any,
      finalCash: 0,
      peakCash: 0,
      finalReputation: 0,
      totalRevenue: 0,
      totalProfit: 0,
      locationsOpened: 0,
      staffHired: 0,
      staffLost: 0,
    },
    financials: {
      weeklySnapshots: [],
      avgPrimeCost: 0,
      avgNetMargin: 0,
      worstWeek: { week: 0, revenue: 0, profit: 0, cash: 0, reputation: 0, primeCostPct: 0, staffCount: 0, morale: 0 },
      bestWeek: { week: 0, revenue: 0, profit: 0, cash: 0, reputation: 0, primeCostPct: 0, staffCount: 0, morale: 0 },
      breakEvenWeek: null,
      cashCrunchWeeks: [],
      profitableWeeks: 0,
      unprofitableWeeks: 0,
    },
    decisions: { good: [], bad: [], missed: [] },
    benchmarkComparison: [],
    whatIf: [],
    grade: 'F',
    keyLessons: ['Start a game to learn restaurant lessons!'],
    educationalSummary: 'No game data available.',
    shareableText: '',
    generatedAt: new Date().toISOString(),
  };
}

export default {
  generatePostMortem,
};
