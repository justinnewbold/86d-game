// ============================================
// DIFFICULTY MODES & GAME SPEED
// ============================================

export const DIFFICULTY_MODES = [
  {
    id: 'easy', name: 'Easy', icon: '😊', description: 'Learning the ropes',
    revenueMultiplier: 1.3, costMultiplier: 0.8, scenarioChance: 0.15, negativeScenarioChance: 0.3,
    startingBonus: 25000, staffLoyaltyBonus: 10, reputationDecayRate: 0.5,
  },
  {
    id: 'normal', name: 'Normal', icon: '😐', description: 'The real deal',
    revenueMultiplier: 1.0, costMultiplier: 1.0, scenarioChance: 0.25, negativeScenarioChance: 0.5,
    startingBonus: 0, staffLoyaltyBonus: 0, reputationDecayRate: 1.0,
  },
  {
    id: 'hard', name: 'Hard', icon: '😤', description: 'For experienced operators',
    revenueMultiplier: 0.85, costMultiplier: 1.15, scenarioChance: 0.35, negativeScenarioChance: 0.65,
    startingBonus: -10000, staffLoyaltyBonus: -5, reputationDecayRate: 1.5,
  },
  {
    id: 'nightmare', name: 'Nightmare', icon: '💀', description: 'Pure chaos - good luck',
    revenueMultiplier: 0.7, costMultiplier: 1.3, scenarioChance: 0.5, negativeScenarioChance: 0.8,
    startingBonus: -20000, staffLoyaltyBonus: -10, reputationDecayRate: 2.0, noLoans: true,
  },
];

export const SPEED_OPTIONS = [
  { id: 'pause', name: 'Paused', icon: '⏸️', interval: null },
  { id: '1x', name: '1x', icon: '▶️', interval: 3000 },
  { id: '2x', name: '2x', icon: '⏩', interval: 1500 },
  { id: '4x', name: '4x', icon: '⏭️', interval: 750 },
  { id: '10x', name: '10x', icon: '🚀', interval: 300 },
];

export const GOALS = [
  { id: 'survive', name: 'Survival', desc: 'Keep the doors open for 1 year', target: { weeks: 52 }, difficulty: 'Normal' },
  { id: 'profit', name: 'Profitability', desc: 'Build $100K in cash reserves', target: { cash: 100000 }, difficulty: 'Hard' },
  { id: 'empire', name: 'Empire Builder', desc: 'Own 5 locations', target: { locations: 5 }, difficulty: 'Expert' },
  { id: 'franchise', name: 'Franchise King', desc: 'Have 10 total units (owned + franchised)', target: { totalUnits: 10 }, difficulty: 'Expert' },
  { id: 'valuation', name: 'Exit Ready', desc: 'Build a $5M empire valuation', target: { valuation: 5000000 }, difficulty: 'Master' },
  { id: 'legacy', name: 'Legacy', desc: 'Build a $10M empire with 20+ units', target: { valuation: 10000000, totalUnits: 20 }, difficulty: 'Legendary' },
  { id: 'sandbox', name: 'Sandbox', desc: 'No win condition - just play', target: {}, difficulty: 'Zen' },
];
