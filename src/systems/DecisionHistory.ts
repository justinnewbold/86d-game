// ============================================
// DECISION HISTORY & REPLAY SYSTEM
// ============================================
// Tracks key decisions and allows branching/comparison
// Educational: Shows how different choices lead to different outcomes

import type { Location, GameState } from '../types/game';

/**
 * A decision point in the game
 */
export interface Decision {
  id: string;
  week: number;
  timestamp: number;
  category: DecisionCategory;
  title: string;
  description: string;
  chosenOption: DecisionOption;
  alternativeOptions: DecisionOption[];
  impact: DecisionImpact;
  stateSnapshot: StateSnapshot;
}

export type DecisionCategory =
  | 'hiring'
  | 'firing'
  | 'menu'
  | 'pricing'
  | 'marketing'
  | 'supplier'
  | 'investment'
  | 'cost_cutting'
  | 'crisis_response';

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  projectedImpact?: {
    cash?: number;
    morale?: number;
    reputation?: number;
    covers?: number;
  };
}

export interface DecisionImpact {
  cashChange: number;
  moraleChange: number;
  reputationChange: number;
  coversChange: number;
  wasPositive: boolean;
  explanation: string;
}

export interface StateSnapshot {
  cash: number;
  reputation: number;
  morale: number;
  covers: number;
  weeklyRevenue: number;
  weeklyProfit: number;
  staffCount: number;
  menuItemCount: number;
}

/**
 * Branch point for "what if" analysis
 */
export interface DecisionBranch {
  id: string;
  parentDecisionId: string;
  alternativeOptionId: string;
  createdAt: number;
  name: string;
  description: string;
  simulatedOutcome?: SimulatedOutcome;
}

export interface SimulatedOutcome {
  weeksSimulated: number;
  endingCash: number;
  endingReputation: number;
  endingMorale: number;
  totalProfit: number;
  significantEvents: string[];
  comparison: {
    cashDifference: number;
    reputationDifference: number;
    moraleDifference: number;
    verdict: 'better' | 'worse' | 'similar';
    explanation: string;
  };
}

/**
 * Decision history manager
 */
export interface DecisionHistoryState {
  decisions: Decision[];
  branches: DecisionBranch[];
  currentBranchId: string | null;
  undoStack: Decision[];
  redoStack: Decision[];
}

// ============================================
// DECISION TRACKING
// ============================================

/**
 * Create initial decision history state
 */
export function createDecisionHistory(): DecisionHistoryState {
  return {
    decisions: [],
    branches: [],
    currentBranchId: null,
    undoStack: [],
    redoStack: [],
  };
}

/**
 * Record a new decision
 */
export function recordDecision(
  state: DecisionHistoryState,
  location: Location,
  game: GameState,
  category: DecisionCategory,
  title: string,
  description: string,
  chosenOption: DecisionOption,
  alternatives: DecisionOption[],
  impact: DecisionImpact
): DecisionHistoryState {
  const snapshot: StateSnapshot = {
    cash: location.cash,
    reputation: location.reputation,
    morale: location.morale,
    covers: location.covers,
    weeklyRevenue: location.weeklyHistory?.[location.weeklyHistory.length - 1]?.revenue ?? 0,
    weeklyProfit: location.weeklyHistory?.[location.weeklyHistory.length - 1]?.profit ?? 0,
    staffCount: location.staff?.length ?? 0,
    menuItemCount: location.menu?.length ?? 0,
  };

  const decision: Decision = {
    id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    week: game.week,
    timestamp: Date.now(),
    category,
    title,
    description,
    chosenOption,
    alternativeOptions: alternatives,
    impact,
    stateSnapshot: snapshot,
  };

  return {
    ...state,
    decisions: [...state.decisions, decision],
    undoStack: [...state.undoStack, decision],
    redoStack: [], // Clear redo stack on new decision
  };
}

/**
 * Undo the last decision (if possible)
 */
export function undoDecision(
  state: DecisionHistoryState
): { newState: DecisionHistoryState; undoneDecision: Decision | null; canUndo: boolean } {
  if (state.undoStack.length === 0) {
    return { newState: state, undoneDecision: null, canUndo: false };
  }

  const undoneDecision = state.undoStack[state.undoStack.length - 1];

  return {
    newState: {
      ...state,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, undoneDecision],
    },
    undoneDecision,
    canUndo: true,
  };
}

/**
 * Redo a previously undone decision
 */
export function redoDecision(
  state: DecisionHistoryState
): { newState: DecisionHistoryState; redoneDecision: Decision | null; canRedo: boolean } {
  if (state.redoStack.length === 0) {
    return { newState: state, redoneDecision: null, canRedo: false };
  }

  const redoneDecision = state.redoStack[state.redoStack.length - 1];

  return {
    newState: {
      ...state,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, redoneDecision],
    },
    redoneDecision,
    canRedo: true,
  };
}

// ============================================
// BRANCHING & WHAT-IF ANALYSIS
// ============================================

/**
 * Create a branch to explore an alternative decision
 */
export function createBranch(
  state: DecisionHistoryState,
  decisionId: string,
  alternativeOptionId: string,
  name: string
): { newState: DecisionHistoryState; branch: DecisionBranch | null } {
  const decision = state.decisions.find(d => d.id === decisionId);
  if (!decision) {
    return { newState: state, branch: null };
  }

  const alternative = decision.alternativeOptions.find(o => o.id === alternativeOptionId);
  if (!alternative) {
    return { newState: state, branch: null };
  }

  const branch: DecisionBranch = {
    id: `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    parentDecisionId: decisionId,
    alternativeOptionId,
    createdAt: Date.now(),
    name,
    description: `What if we had chosen: "${alternative.label}"?`,
  };

  return {
    newState: {
      ...state,
      branches: [...state.branches, branch],
    },
    branch,
  };
}

/**
 * Simulate alternative outcome (simplified projection)
 */
export function simulateAlternativeOutcome(
  originalDecision: Decision,
  alternativeOption: DecisionOption,
  weeksToSimulate: number = 4
): SimulatedOutcome {
  const original = originalDecision.stateSnapshot;
  const altImpact = alternativeOption.projectedImpact || {};

  // Simple simulation based on projected impacts
  let cash = original.cash + (altImpact.cash || 0);
  let reputation = original.reputation + (altImpact.reputation || 0);
  let morale = original.morale + (altImpact.morale || 0);
  let totalProfit = 0;

  const events: string[] = [];

  // Simulate forward with decay/growth
  for (let w = 0; w < weeksToSimulate; w++) {
    // Revenue affected by reputation
    const reputationFactor = reputation / 60;
    const weekRevenue = original.weeklyRevenue * reputationFactor;
    const weekProfit = weekRevenue * 0.08; // Assume 8% margin

    totalProfit += weekProfit;
    cash += weekProfit;

    // Morale affects reputation over time
    if (morale < 50) {
      reputation -= 1;
      if (w === 1) events.push('Low morale starting to affect service');
    } else if (morale > 75) {
      reputation += 0.5;
    }

    // Cap values
    reputation = Math.max(10, Math.min(100, reputation));
    morale = Math.max(10, Math.min(100, morale));
  }

  // Compare to original path
  const originalCash = original.cash + originalDecision.impact.cashChange;
  const originalRep = original.reputation + originalDecision.impact.reputationChange;
  const originalMorale = original.morale + originalDecision.impact.moraleChange;

  const cashDiff = cash - originalCash;
  const repDiff = reputation - originalRep;
  const moraleDiff = morale - originalMorale;

  // Determine overall verdict
  const score = (cashDiff / 1000) + (repDiff * 50) + (moraleDiff * 30);
  let verdict: 'better' | 'worse' | 'similar';
  let explanation: string;

  if (score > 500) {
    verdict = 'better';
    explanation = 'The alternative path would likely have produced better results.';
  } else if (score < -500) {
    verdict = 'worse';
    explanation = 'Your original decision was probably the right call.';
  } else {
    verdict = 'similar';
    explanation = 'Both paths would have led to similar outcomes.';
  }

  return {
    weeksSimulated: weeksToSimulate,
    endingCash: Math.round(cash),
    endingReputation: Math.round(reputation),
    endingMorale: Math.round(morale),
    totalProfit: Math.round(totalProfit),
    significantEvents: events,
    comparison: {
      cashDifference: Math.round(cashDiff),
      reputationDifference: Math.round(repDiff),
      moraleDifference: Math.round(moraleDiff),
      verdict,
      explanation,
    },
  };
}

// ============================================
// DECISION ANALYSIS
// ============================================

/**
 * Get decisions by category
 */
export function getDecisionsByCategory(
  state: DecisionHistoryState,
  category: DecisionCategory
): Decision[] {
  return state.decisions.filter(d => d.category === category);
}

/**
 * Get decisions for a specific week
 */
export function getDecisionsForWeek(
  state: DecisionHistoryState,
  week: number
): Decision[] {
  return state.decisions.filter(d => d.week === week);
}

/**
 * Analyze decision patterns
 */
export function analyzeDecisionPatterns(
  state: DecisionHistoryState
): {
  totalDecisions: number;
  byCategory: Record<DecisionCategory, number>;
  positiveOutcomes: number;
  negativeOutcomes: number;
  patterns: string[];
  suggestions: string[];
} {
  const byCategory: Record<DecisionCategory, number> = {
    hiring: 0,
    firing: 0,
    menu: 0,
    pricing: 0,
    marketing: 0,
    supplier: 0,
    investment: 0,
    cost_cutting: 0,
    crisis_response: 0,
  };

  let positiveOutcomes = 0;
  let negativeOutcomes = 0;

  for (const decision of state.decisions) {
    byCategory[decision.category]++;
    if (decision.impact.wasPositive) {
      positiveOutcomes++;
    } else {
      negativeOutcomes++;
    }
  }

  const patterns: string[] = [];
  const suggestions: string[] = [];

  // Analyze patterns
  if (byCategory.cost_cutting > byCategory.investment * 2) {
    patterns.push('Heavy focus on cost-cutting over investment');
    suggestions.push('Consider balancing cuts with strategic investments');
  }

  if (byCategory.hiring === 0 && byCategory.firing > 2) {
    patterns.push('Multiple firings without any new hires');
    suggestions.push('Team may be understaffed - consider recruiting');
  }

  if (byCategory.menu === 0 && state.decisions.length > 10) {
    patterns.push('No menu changes despite many decisions');
    suggestions.push('Menu optimization can significantly impact margins');
  }

  if (negativeOutcomes > positiveOutcomes) {
    patterns.push('More decisions with negative outcomes than positive');
    suggestions.push('Review past decisions to identify what went wrong');
  }

  const crisisRatio = byCategory.crisis_response / Math.max(1, state.decisions.length);
  if (crisisRatio > 0.3) {
    patterns.push('Operating in constant crisis mode');
    suggestions.push('Focus on proactive planning to prevent crises');
  }

  if (patterns.length === 0) {
    patterns.push('Balanced decision-making across categories');
  }

  if (suggestions.length === 0) {
    suggestions.push('Keep monitoring outcomes and adjusting strategies');
  }

  return {
    totalDecisions: state.decisions.length,
    byCategory,
    positiveOutcomes,
    negativeOutcomes,
    patterns,
    suggestions,
  };
}

/**
 * Generate decision timeline for visualization
 */
export function generateDecisionTimeline(
  state: DecisionHistoryState
): {
  week: number;
  decisions: { title: string; category: DecisionCategory; wasPositive: boolean }[];
  netImpact: { cash: number; morale: number; reputation: number };
}[] {
  const byWeek = new Map<number, Decision[]>();

  for (const decision of state.decisions) {
    const existing = byWeek.get(decision.week) || [];
    existing.push(decision);
    byWeek.set(decision.week, existing);
  }

  const timeline: ReturnType<typeof generateDecisionTimeline> = [];

  for (const [week, decisions] of byWeek.entries()) {
    const netImpact = {
      cash: 0,
      morale: 0,
      reputation: 0,
    };

    for (const d of decisions) {
      netImpact.cash += d.impact.cashChange;
      netImpact.morale += d.impact.moraleChange;
      netImpact.reputation += d.impact.reputationChange;
    }

    timeline.push({
      week,
      decisions: decisions.map(d => ({
        title: d.title,
        category: d.category,
        wasPositive: d.impact.wasPositive,
      })),
      netImpact,
    });
  }

  return timeline.sort((a, b) => a.week - b.week);
}

/**
 * Get key pivot points (major decisions)
 */
export function identifyPivotPoints(
  state: DecisionHistoryState,
  thresholds: { cash: number; morale: number; reputation: number } = {
    cash: 5000,
    morale: 15,
    reputation: 10,
  }
): Decision[] {
  return state.decisions.filter(d => {
    const impact = d.impact;
    return (
      Math.abs(impact.cashChange) >= thresholds.cash ||
      Math.abs(impact.moraleChange) >= thresholds.morale ||
      Math.abs(impact.reputationChange) >= thresholds.reputation
    );
  });
}

/**
 * Export decision history as shareable summary
 */
export function exportDecisionSummary(
  state: DecisionHistoryState,
  gameName: string,
  finalWeek: number
): string {
  const analysis = analyzeDecisionPatterns(state);
  const pivots = identifyPivotPoints(state);
  const timeline = generateDecisionTimeline(state);

  let summary = `# Decision History: ${gameName}\n\n`;
  summary += `## Overview\n`;
  summary += `- Weeks Played: ${finalWeek}\n`;
  summary += `- Total Decisions: ${analysis.totalDecisions}\n`;
  summary += `- Positive Outcomes: ${analysis.positiveOutcomes}\n`;
  summary += `- Negative Outcomes: ${analysis.negativeOutcomes}\n\n`;

  summary += `## Key Pivot Points\n`;
  for (const pivot of pivots.slice(0, 5)) {
    summary += `- **Week ${pivot.week}**: ${pivot.title}\n`;
    summary += `  - ${pivot.impact.explanation}\n`;
  }

  summary += `\n## Patterns Identified\n`;
  for (const pattern of analysis.patterns) {
    summary += `- ${pattern}\n`;
  }

  summary += `\n## Suggestions\n`;
  for (const suggestion of analysis.suggestions) {
    summary += `- ${suggestion}\n`;
  }

  summary += `\n## Weekly Summary\n`;
  for (const week of timeline.slice(-10)) {
    summary += `### Week ${week.week}\n`;
    for (const d of week.decisions) {
      const emoji = d.wasPositive ? '✓' : '✗';
      summary += `- ${emoji} ${d.title} (${d.category})\n`;
    }
  }

  return summary;
}

// ============================================
// EDUCATIONAL INTEGRATION
// ============================================

/**
 * Get educational insight for a decision
 */
export function getDecisionInsight(decision: Decision): {
  whatHappened: string;
  whyItMattered: string;
  realWorldLesson: string;
  alternativeAnalysis: string;
} {
  const categoryInsights: Record<DecisionCategory, { lesson: string; context: string }> = {
    hiring: {
      lesson: 'Hiring costs more than salary - training, ramp-up time, and cultural fit all factor in.',
      context: 'Labor is 30% of costs. Every hire is a long-term commitment.',
    },
    firing: {
      lesson: 'Letting someone go affects team morale and requires replacement costs.',
      context: 'Turnover costs 50-200% of annual salary when you factor in recruiting and training.',
    },
    menu: {
      lesson: 'Menu changes ripple through operations - inventory, prep, training, and customer expectations.',
      context: 'Top operators change menus seasonally but keep core items stable.',
    },
    pricing: {
      lesson: 'Price changes signal value. Raise too fast and customers leave; too slow and margins suffer.',
      context: 'Menu prices should increase 3-5% annually to keep pace with costs.',
    },
    marketing: {
      lesson: 'Marketing spend should generate measurable returns within 4-6 weeks.',
      context: 'Word of mouth is free but slow. Paid marketing is fast but expensive.',
    },
    supplier: {
      lesson: 'Supplier relationships affect more than price - quality, reliability, and payment terms matter.',
      context: 'Net30 terms are worth 1-2% of order value in cash flow flexibility.',
    },
    investment: {
      lesson: 'Capital investments should have clear ROI timelines. Equipment, renovations, and systems all cost more than planned.',
      context: 'Most restaurant renovations run 20-30% over budget.',
    },
    cost_cutting: {
      lesson: 'Cutting costs is easy. Cutting without damaging quality or morale is an art.',
      context: 'The best operators cut waste, not value. They find efficiency, not shortcuts.',
    },
    crisis_response: {
      lesson: 'Crisis decisions made under pressure often have long-term consequences.',
      context: 'Having a reserve fund and contingency plans prevents crisis decision-making.',
    },
  };

  const insight = categoryInsights[decision.category];
  const alts = decision.alternativeOptions;

  return {
    whatHappened: `You chose "${decision.chosenOption.label}" - ${decision.impact.explanation}`,
    whyItMattered: insight.context,
    realWorldLesson: insight.lesson,
    alternativeAnalysis: alts.length > 0
      ? `Alternative options included: ${alts.map(a => a.label).join(', ')}`
      : 'This was the only viable option at the time.',
  };
}

export default {
  createDecisionHistory,
  recordDecision,
  undoDecision,
  redoDecision,
  createBranch,
  simulateAlternativeOutcome,
  getDecisionsByCategory,
  getDecisionsForWeek,
  analyzeDecisionPatterns,
  generateDecisionTimeline,
  identifyPivotPoints,
  exportDecisionSummary,
  getDecisionInsight,
};
