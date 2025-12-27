// ============================================
// EDUCATIONAL GAME LOOP
// ============================================
// Replaces the original processWeek with realistic financials
// and cash flow tracking that teaches real business lessons

import { useCallback } from 'react';
import type {
  GameState,
  Location,
  LocationCashFlow,
  CashFlowAlert,
} from '../types/game';
import {
  processWeeklyCashFlow,
  generateUpcomingBills,
  calculateRunway,
  explainCashFlowGap,
  type WeeklyCashFlow,
} from '../systems/CashFlowEngine';
import {
  calculateWeeklyPL,
  analyzePL,
  INDUSTRY_BENCHMARKS,
  type RestaurantPL,
} from '../systems/RealisticFinancials';
import {
  analyzeMenu,
  classifyMenuItem,
  type MenuAnalysis,
} from '../systems/MenuEngineering';
import {
  checkForFailureScenarios,
  generatePostMortem,
  FAILURE_STATISTICS,
} from '../systems/FailureScenarios';
import { getMarketData } from '../systems/RealMarketData';

/**
 * Process a single location's week with realistic financials
 */
export function processLocationWeekRealistic(
  location: Location,
  cuisineId: string,
  gameWeek: number,
  economicMultiplier: number = 1.0
): {
  updatedLocation: Location;
  weeklyPL: RestaurantPL;
  cashFlowResult: {
    newState: LocationCashFlow;
    weekFlow: WeeklyCashFlow;
    alerts: CashFlowAlert[];
  };
  educationalInsights: string[];
} {
  const insights: string[] = [];

  // Calculate covers based on location factors
  const baseCovers = location.covers || 50;
  const reputationMod = 1 + (location.reputation - 50) / 200;
  const moraleMod = 1 + (location.morale - 50) / 200;
  const randomVariance = 0.85 + Math.random() * 0.30;

  const weeklyCovers = Math.floor(
    baseCovers * reputationMod * moraleMod * economicMultiplier * randomVariance
  );

  // Calculate delivery orders
  const deliveryPlatforms = location.delivery?.platforms || [];
  const deliveryOrders = location.isGhostKitchen
    ? Math.floor(80 * deliveryPlatforms.length / 2)
    : Math.floor(weeklyCovers * 0.25 * deliveryPlatforms.length / 2);

  // Calculate labor costs
  const hourlyWages = (location.staff || []).reduce(
    (sum, s) => sum + s.wage * 40, // 40 hours/week assumed
    0
  );
  const managerSalary = location.manager ? location.manager.wage * 45 : 0;

  // Weekly rent (monthly / 4)
  const weeklyRent = location.rent;
  const weeklyUtilities = Math.floor(location.rent * 0.15);
  const weeklyInsurance = Math.floor(location.rent * 0.08);

  // Calculate P&L using realistic model
  const weeklyPL = calculateWeeklyPL(
    weeklyCovers,
    location.avgTicket,
    deliveryOrders,
    location.avgTicket * 0.9, // Delivery tickets slightly lower
    location.foodCostPct,
    { hourlyWages, salaries: managerSalary },
    {
      weeklyRent,
      weeklyUtilities,
      weeklyInsurance,
    },
    0.27, // Average delivery commission
    0.028 // Credit card rate
  );

  // Analyze the P&L and generate educational feedback
  const plAnalysis = analyzePL(weeklyPL);

  // Add educational insights based on P&L analysis
  if (plAnalysis.issues.length > 0) {
    plAnalysis.issues.forEach(issue => {
      insights.push(`⚠️ ${issue.message} (Target: ${issue.target})`);
    });
  }
  plAnalysis.wins.forEach(win => {
    insights.push(`✅ ${win}`);
  });

  // Prime cost check - THE most important metric
  if (weeklyPL.primeCostPercentage > INDUSTRY_BENCHMARKS.primeCost.danger) {
    insights.push(
      `🚨 CRITICAL: Prime cost is ${(weeklyPL.primeCostPercentage * 100).toFixed(1)}%. ` +
      `Industry standard is under 60%. You are likely losing money on every sale.`
    );
  }

  // === CASH FLOW PROCESSING ===
  // Initialize cash flow state if not present
  const currentCashFlow: LocationCashFlow = location.cashFlow || {
    cashOnHand: location.cash,
    pendingBills: [],
    accountsReceivable: [],
    cashFlowHistory: [],
    weeksOfRunway: 12,
    cashCrunchWarning: false,
    creditLineAvailable: 25000,
    creditLineUsed: 0,
    creditLineInterestRate: 0.005, // 0.5% weekly = ~26% APR
  };

  // Generate upcoming bills
  const upcomingBills = generateUpcomingBills(
    gameWeek,
    location.rent * 4, // Monthly rent
    hourlyWages,
    weeklyUtilities * 4, // Monthly utilities
    (location.loans || []).map(l => ({
      amount: l.weeklyPayment,
      weekDue: gameWeek + 1,
    })),
    [] // Supplier invoices would come from inventory system
  );

  // Merge with existing pending bills
  const allPendingBills = [
    ...currentCashFlow.pendingBills.filter(b => !b.isPaid),
    ...upcomingBills.filter(
      ub => !currentCashFlow.pendingBills.some(pb => pb.id === ub.id)
    ),
  ];

  // Process cash flow for this week
  const cashFlowResult = processWeeklyCashFlow(
    gameWeek,
    {
      ...currentCashFlow,
      pendingBills: allPendingBills,
    },
    {
      dineIn: weeklyPL.revenue.food + weeklyPL.revenue.beverage,
      delivery: weeklyPL.revenue.delivery,
      cateringCollected: 0, // Would come from catering system
      other: 0,
    },
    weeklyPL.netProfit
  );

  // Add cash flow insights
  if (cashFlowResult.alerts.length > 0) {
    cashFlowResult.alerts.forEach(alert => {
      if (alert.type === 'profitable_but_negative_cash') {
        insights.push(
          `💡 LESSON: ${explainCashFlowGap(cashFlowResult.weekFlow)}`
        );
      } else {
        insights.push(`${alert.severity === 'critical' ? '🚨' : '⚠️'} ${alert.message}`);
      }
    });
  }

  // Update staff morale and weeks
  const updatedStaff = (location.staff || []).map(s => {
    let newMorale = s.morale;
    // Profit affects morale
    if (weeklyPL.netProfit > 0) {
      newMorale += 2;
    } else if (weeklyPL.netProfit < -1000) {
      newMorale -= 5;
      insights.push(`😟 Staff morale dropping due to losses`);
    }
    // Random drift
    newMorale = Math.max(20, Math.min(100, newMorale + (Math.random() - 0.5) * 5));

    return {
      ...s,
      weeks: s.weeks + 1,
      morale: Math.round(newMorale),
    };
  });

  // Check for staff quitting (morale < 30 has 30% chance)
  const remainingStaff = updatedStaff.filter(s => {
    if (s.morale < 30 && Math.random() < 0.3) {
      insights.push(`👋 ${s.name} quit due to low morale (${s.morale}%)`);
      return false;
    }
    return true;
  });

  // Calculate average morale
  const avgMorale = remainingStaff.length > 0
    ? remainingStaff.reduce((sum, s) => sum + s.morale, 0) / remainingStaff.length
    : 50;

  // Update reputation based on performance
  let reputationChange = 0;
  if (weeklyPL.netProfit > 0) reputationChange += 1;
  if (weeklyPL.netProfit < 0) reputationChange -= 2;
  if (avgMorale > 70) reputationChange += 0.5;
  if (avgMorale < 40) reputationChange -= 1;

  const newReputation = Math.min(100, Math.max(0,
    location.reputation + reputationChange
  ));

  // Update weekly history
  const newHistory = [
    ...(location.weeklyHistory || []),
    {
      week: location.weeksOpen + 1,
      revenue: weeklyPL.revenue.total,
      profit: weeklyPL.netProfit,
      covers: weeklyCovers + deliveryOrders,
    },
  ].slice(-52);

  // Build updated location
  const updatedLocation: Location = {
    ...location,
    // Traditional fields (for backward compatibility)
    cash: cashFlowResult.newState.cashOnHand,
    totalRevenue: location.totalRevenue + weeklyPL.revenue.total,
    totalProfit: location.totalProfit + weeklyPL.netProfit,
    lastWeekRevenue: weeklyPL.revenue.total,
    lastWeekProfit: weeklyPL.netProfit,
    lastWeekCovers: weeklyCovers + deliveryOrders,
    lastWeekFoodCost: weeklyPL.cogs.total,
    lastWeekLaborCost: weeklyPL.labor.total,
    staff: remainingStaff,
    morale: Math.round(avgMorale),
    weeksOpen: location.weeksOpen + 1,
    weeklyHistory: newHistory,
    reputation: newReputation,
    delivery: {
      ...location.delivery,
      orders: (location.delivery?.orders || 0) + deliveryOrders,
    },
    // Educational systems
    cashFlow: cashFlowResult.newState,
    lastWeekPL: weeklyPL,
    plAnalysis,
  };

  return {
    updatedLocation,
    weeklyPL,
    cashFlowResult,
    educationalInsights: insights,
  };
}

/**
 * Process entire game week with educational tracking
 */
export function processGameWeek(
  game: GameState,
  cuisineId: string
): {
  updatedGame: GameState;
  allInsights: string[];
  allAlerts: CashFlowAlert[];
  failureCheck: {
    triggered: boolean;
    scenarios: ReturnType<typeof checkForFailureScenarios>;
  };
} {
  const allInsights: string[] = [];
  const allAlerts: CashFlowAlert[] = [];

  // Get economic multiplier
  const economicMultiplier = game.economicCondition === 'boom' ? 1.15
    : game.economicCondition === 'recession' ? 0.80
    : 1.0;

  // Process each location
  const updatedLocations = game.locations.map(location => {
    const result = processLocationWeekRealistic(
      location,
      cuisineId,
      game.week,
      economicMultiplier
    );

    allInsights.push(...result.educationalInsights);
    allAlerts.push(...result.cashFlowResult.alerts);

    return result.updatedLocation;
  });

  // Calculate aggregate metrics
  const totalCashOnHand = updatedLocations.reduce(
    (sum, loc) => sum + (loc.cashFlow?.cashOnHand || loc.cash || 0),
    0
  ) + game.corporateCash;

  const avgRunway = updatedLocations.reduce(
    (sum, loc) => sum + (loc.cashFlow?.weeksOfRunway || 12),
    0
  ) / Math.max(1, updatedLocations.length);

  // Determine failure risk level
  let failureRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const failureWarnings: string[] = [];

  if (avgRunway < 2) {
    failureRiskLevel = 'critical';
    failureWarnings.push('CRITICAL: Less than 2 weeks of cash remaining!');
  } else if (avgRunway < 4) {
    failureRiskLevel = 'high';
    failureWarnings.push('Warning: Cash reserves are dangerously low');
  } else if (avgRunway < 8) {
    failureRiskLevel = 'medium';
    failureWarnings.push('Caution: Build up more cash reserves');
  }

  // Check for failure scenarios
  const failureScenarios = checkForFailureScenarios({
    cashOnHand: totalCashOnHand,
    weeklyPayroll: updatedLocations.reduce(
      (sum, loc) => sum + (loc.staff || []).reduce((s, st) => s + st.wage * 40, 0),
      0
    ),
    monthlyBills: updatedLocations.reduce((sum, loc) => sum + loc.rent * 4, 0),
    weeksOfRunway: avgRunway,
    netProfitMargin: updatedLocations[0]?.lastWeekPL?.netProfitMargin || 0.05,
    kitchenMorale: updatedLocations.reduce(
      (sum, loc) => sum + loc.morale,
      0
    ) / Math.max(1, updatedLocations.length),
    reputationScore: updatedLocations.reduce(
      (sum, loc) => sum + loc.reputation,
      0
    ) / Math.max(1, updatedLocations.length),
    missedRentPayments: 0, // Would track from cash flow
    economicCondition: game.economicCondition,
  });

  if (failureScenarios.length > 0) {
    failureScenarios.forEach(scenario => {
      failureWarnings.push(scenario.educationalLesson);
      allInsights.push(`📚 LESSON: ${scenario.educationalLesson}`);
    });
  }

  // Weekly educational insight based on game progress
  if (game.week === 4) {
    allInsights.push(
      `📊 Week 4 Check: ${(FAILURE_STATISTICS.year1FailureRate * 100).toFixed(0)}% of restaurants ` +
      `fail in year 1. Are you tracking your cash flow, not just profit?`
    );
  }
  if (game.week === 13) {
    allInsights.push(
      `📊 Quarter 1 Complete: How's your prime cost? Target is under 60% ` +
      `(food + labor as % of revenue).`
    );
  }
  if (game.week === 26) {
    allInsights.push(
      `📊 6 Month Mark: By now you should know your Stars and Dogs. ` +
      `Consider trimming low-performers from the menu.`
    );
  }
  if (game.week === 52) {
    allInsights.push(
      `🎉 Year 1 Survived! You beat the odds. Now focus on building reserves ` +
      `for the 5-year marathon ahead.`
    );
  }

  const updatedGame: GameState = {
    ...game,
    week: game.week + 1,
    locations: updatedLocations,
    totalRevenue: game.totalRevenue + updatedLocations.reduce(
      (sum, loc) => sum + (loc.lastWeekRevenue || 0), 0
    ),
    totalProfit: game.totalProfit + updatedLocations.reduce(
      (sum, loc) => sum + (loc.lastWeekProfit || 0), 0
    ),
    // Educational tracking
    cashFlowAlerts: allAlerts,
    totalCashOnHand,
    totalWeeksOfRunway: Math.floor(avgRunway),
    failureRiskLevel,
    failureWarnings,
    educationalInsights: allInsights.slice(-10), // Keep last 10
    lessonsEncountered: [
      ...(game.lessonsEncountered || []),
      ...failureScenarios.map(s => s.id),
    ].filter((v, i, a) => a.indexOf(v) === i), // Unique
  };

  return {
    updatedGame,
    allInsights,
    allAlerts,
    failureCheck: {
      triggered: failureScenarios.length > 0,
      scenarios: failureScenarios,
    },
  };
}

/**
 * Hook for using the educational game loop
 */
export function useEducationalGameLoop() {
  const processWeek = useCallback((
    game: GameState,
    cuisineId: string,
    onInsight?: (insight: string) => void,
    onAlert?: (alert: CashFlowAlert) => void
  ) => {
    const result = processGameWeek(game, cuisineId);

    // Notify about insights
    if (onInsight) {
      result.allInsights.forEach(onInsight);
    }

    // Notify about alerts
    if (onAlert) {
      result.allAlerts.forEach(onAlert);
    }

    return result;
  }, []);

  return { processWeek };
}

export default useEducationalGameLoop;
