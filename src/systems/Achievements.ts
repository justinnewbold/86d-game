// ============================================
// ACHIEVEMENT & MILESTONE SYSTEM
// ============================================
// Gamification to celebrate learning milestones
// Makes educational moments memorable and shareable

import type { Location, GameState } from '../types/game';

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  // Unlock conditions
  condition: AchievementCondition;
  // Educational value
  lesson: string;
  realWorldContext: string;
  // Tracking
  isHidden: boolean; // Hidden until unlocked
  isRepeatable: boolean;
}

export type AchievementCategory =
  | 'financial'
  | 'operations'
  | 'staff'
  | 'customers'
  | 'survival'
  | 'excellence'
  | 'recovery';

export interface AchievementCondition {
  type: 'threshold' | 'streak' | 'cumulative' | 'event' | 'combo';
  metric?: string;
  value?: number;
  duration?: number; // weeks
  customCheck?: (location: Location, game: GameState) => boolean;
}

export interface UnlockedAchievement {
  achievement: Achievement;
  unlockedWeek: number;
  unlockedDate: number;
  value?: number; // The actual value when unlocked
}

export interface AchievementState {
  unlocked: UnlockedAchievement[];
  progress: Record<string, AchievementProgress>;
  totalPoints: number;
  rank: AchievementRank;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  streakWeeks: number;
  percentComplete: number;
}

export type AchievementRank =
  | 'Novice'
  | 'Apprentice'
  | 'Journeyman'
  | 'Expert'
  | 'Master'
  | 'Legend';

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // FINANCIAL ACHIEVEMENTS
  {
    id: 'prime-cost-pro',
    name: 'Prime Cost Pro',
    description: 'Maintain prime cost under 60% for 12 consecutive weeks',
    category: 'financial',
    difficulty: 'gold',
    icon: '📊',
    condition: {
      type: 'streak',
      metric: 'primeCost',
      value: 60,
      duration: 12,
    },
    lesson: 'Prime cost control is the foundation of restaurant profitability.',
    realWorldContext: 'Danny Meyer targets 55% prime cost. Chains like Chipotle run even lower.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'cash-flow-master',
    name: 'Cash Flow Master',
    description: 'Never drop below 4 weeks of runway for 26 weeks',
    category: 'financial',
    difficulty: 'platinum',
    icon: '💰',
    condition: {
      type: 'streak',
      metric: 'runway',
      value: 4,
      duration: 26,
    },
    lesson: 'Cash flow kills more restaurants than bad food.',
    realWorldContext: 'The SBA recommends 6 months of expenses in reserve before opening.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'first-profit',
    name: 'In The Black',
    description: 'Achieve your first profitable week',
    category: 'financial',
    difficulty: 'bronze',
    icon: '✅',
    condition: {
      type: 'threshold',
      metric: 'weeklyProfit',
      value: 1,
    },
    lesson: 'Profitability is the first milestone, but consistency is what matters.',
    realWorldContext: 'Most restaurants take 1-2 years to become consistently profitable.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'break-even-boss',
    name: 'Break-Even Boss',
    description: 'Cover all fixed costs in a single week',
    category: 'financial',
    difficulty: 'silver',
    icon: '⚖️',
    condition: {
      type: 'event',
      customCheck: (loc) => {
        const weekly = loc.weeklyHistory?.[loc.weeklyHistory.length - 1];
        return weekly ? weekly.profit >= 0 : false;
      },
    },
    lesson: 'Know your break-even point - it determines your minimum viable business.',
    realWorldContext: 'Average restaurant break-even is 3-5% of revenue.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'lean-operator',
    name: 'Lean Operator',
    description: 'Run profitably with margins under 10%',
    category: 'financial',
    difficulty: 'gold',
    icon: '🎯',
    condition: {
      type: 'combo',
      customCheck: (loc) => {
        const weekly = loc.weeklyHistory?.[loc.weeklyHistory.length - 1];
        if (!weekly || weekly.profit <= 0 || weekly.revenue <= 0) return false;
        const margin = weekly.profit / weekly.revenue;
        return margin > 0 && margin < 0.10;
      },
    },
    lesson: 'Thin margins require operational excellence. Every dollar matters.',
    realWorldContext: 'Full-service restaurants average 3-9% profit margins.',
    isHidden: false,
    isRepeatable: true,
  },

  // OPERATIONS ACHIEVEMENTS
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Maintain reputation above 70 for 20 consecutive weeks',
    category: 'operations',
    difficulty: 'gold',
    icon: '👑',
    condition: {
      type: 'streak',
      metric: 'reputation',
      value: 70,
      duration: 20,
    },
    lesson: 'Consistency is more valuable than occasional excellence.',
    realWorldContext: 'McDonalds built an empire on consistency, not cuisine.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'menu-engineer',
    name: 'Menu Engineer',
    description: 'Have 50% or more "Star" items on your menu',
    category: 'operations',
    difficulty: 'silver',
    icon: '⭐',
    condition: {
      type: 'threshold',
      customCheck: (loc) => {
        const stars = loc.menu?.filter(m => m.popular && (m.price - m.cost) > 8).length || 0;
        const total = loc.menu?.length || 1;
        return stars / total >= 0.5;
      },
    },
    lesson: 'Menu engineering turns good menus into profitable ones.',
    realWorldContext: 'Menu psychology can increase check averages 10-15%.',
    isHidden: false,
    isRepeatable: true,
  },
  {
    id: 'no-86',
    name: 'Fully Stocked',
    description: 'Complete 8 weeks without 86\'ing any item',
    category: 'operations',
    difficulty: 'silver',
    icon: '📦',
    condition: {
      type: 'streak',
      metric: 'no86',
      value: 1,
      duration: 8,
    },
    lesson: 'Running out of items damages reputation and revenue.',
    realWorldContext: '86\'ing a signature item can cost 10% of that day\'s covers.',
    isHidden: false,
    isRepeatable: true,
  },

  // STAFF ACHIEVEMENTS
  {
    id: 'zero-turnover',
    name: 'Loyal Team',
    description: 'Keep the same staff for 26 weeks',
    category: 'staff',
    difficulty: 'platinum',
    icon: '🤝',
    condition: {
      type: 'streak',
      metric: 'staffRetention',
      value: 100,
      duration: 26,
    },
    lesson: 'Staff retention saves money and builds culture.',
    realWorldContext: 'Restaurant turnover averages 75% annually. Zero turnover is exceptional.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'morale-master',
    name: 'Great Place to Work',
    description: 'Maintain staff morale above 80 for 12 weeks',
    category: 'staff',
    difficulty: 'gold',
    icon: '😊',
    condition: {
      type: 'streak',
      metric: 'morale',
      value: 80,
      duration: 12,
    },
    lesson: 'Happy staff create happy customers.',
    realWorldContext: 'High morale correlates with lower turnover and better reviews.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'trainer',
    name: 'Developer of Talent',
    description: 'Train 5 staff members to senior level',
    category: 'staff',
    difficulty: 'silver',
    icon: '🎓',
    condition: {
      type: 'cumulative',
      metric: 'staffTrained',
      value: 5,
    },
    lesson: 'Investing in staff development pays dividends in quality and retention.',
    realWorldContext: 'Cross-trained staff provide flexibility and reduce labor costs.',
    isHidden: false,
    isRepeatable: false,
  },

  // CUSTOMER ACHIEVEMENTS
  {
    id: 'regular-army',
    name: 'Regular Army',
    description: 'Build a customer base of 40%+ regulars',
    category: 'customers',
    difficulty: 'gold',
    icon: '🏆',
    condition: {
      type: 'threshold',
      metric: 'regularPercentage',
      value: 40,
    },
    lesson: 'Regulars are the backbone of sustainable restaurant success.',
    realWorldContext: 'A regular customer is worth 10x a one-time visitor.',
    isHidden: false,
    isRepeatable: true,
  },
  {
    id: 'review-warrior',
    name: 'Review Warrior',
    description: 'Recover reputation after dropping below 50',
    category: 'customers',
    difficulty: 'silver',
    icon: '⚔️',
    condition: {
      type: 'event',
      customCheck: (loc, game) => {
        // Check if reputation was ever below 50 and is now above 65
        const wasLow = loc.weeklyHistory?.some(w => (w as any).reputation < 50);
        return wasLow === true && loc.reputation > 65;
      },
    },
    lesson: 'Reputation recovery is possible but requires consistent excellence.',
    realWorldContext: 'Bad reviews stay online forever. Recovery requires overwhelming good experiences.',
    isHidden: true,
    isRepeatable: false,
  },
  {
    id: 'word-of-mouth',
    name: 'Word of Mouth',
    description: 'Grow covers 20% without marketing spend',
    category: 'customers',
    difficulty: 'gold',
    icon: '📣',
    condition: {
      type: 'event',
      customCheck: (loc) => {
        const history = loc.weeklyHistory || [];
        if (history.length < 8) return false;
        const recent = history.slice(-4);
        const earlier = history.slice(-8, -4);
        const recentAvg = recent.reduce((s, w) => s + w.covers, 0) / 4;
        const earlierAvg = earlier.reduce((s, w) => s + w.covers, 0) / 4;
        return recentAvg > earlierAvg * 1.2;
      },
    },
    lesson: 'The best marketing is a great experience that people want to share.',
    realWorldContext: 'Word of mouth drives 50%+ of new restaurant visits.',
    isHidden: false,
    isRepeatable: true,
  },

  // SURVIVAL ACHIEVEMENTS
  {
    id: 'year-one',
    name: 'Year One Survivor',
    description: 'Stay open for 52 weeks',
    category: 'survival',
    difficulty: 'gold',
    icon: '🎂',
    condition: {
      type: 'threshold',
      metric: 'weeksOpen',
      value: 52,
    },
    lesson: 'Most restaurants fail in year one. You beat the odds.',
    realWorldContext: '60% of restaurants fail within the first year.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'year-three',
    name: 'Three Year Veteran',
    description: 'Stay open for 156 weeks (3 years)',
    category: 'survival',
    difficulty: 'platinum',
    icon: '🏅',
    condition: {
      type: 'threshold',
      metric: 'weeksOpen',
      value: 156,
    },
    lesson: 'Three years means you\'ve built something sustainable.',
    realWorldContext: '80% of restaurants that survive 3 years stay open 5+.',
    isHidden: false,
    isRepeatable: false,
  },
  {
    id: 'crisis-survivor',
    name: 'Crisis Survivor',
    description: 'Survive a major crisis event',
    category: 'survival',
    difficulty: 'silver',
    icon: '🛡️',
    condition: {
      type: 'event',
      metric: 'crisisResolved',
      value: 1,
    },
    lesson: 'Crises test your resilience. Surviving one makes you stronger.',
    realWorldContext: 'Every successful restaurant has survived at least one existential threat.',
    isHidden: true,
    isRepeatable: true,
  },
  {
    id: 'phoenix',
    name: 'Phoenix Rising',
    description: 'Go from negative profit to $5K+ profit in 8 weeks',
    category: 'recovery',
    difficulty: 'gold',
    icon: '🔥',
    condition: {
      type: 'event',
      customCheck: (loc) => {
        const history = loc.weeklyHistory || [];
        if (history.length < 8) return false;
        const wasNegative = history.slice(-8, -4).some(w => w.profit < 0);
        const recent = history.slice(-4);
        const recentProfit = recent.reduce((s, w) => s + w.profit, 0);
        return wasNegative && recentProfit >= 5000;
      },
    },
    lesson: 'Turnarounds are possible with the right changes and persistence.',
    realWorldContext: 'Many famous restaurants had rocky starts before finding success.',
    isHidden: true,
    isRepeatable: false,
  },

  // EXCELLENCE ACHIEVEMENTS
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'High profit, no incidents, morale above 80, reputation above 75',
    category: 'excellence',
    difficulty: 'platinum',
    icon: '💎',
    condition: {
      type: 'combo',
      customCheck: (loc) => {
        const weekly = loc.weeklyHistory?.[loc.weeklyHistory.length - 1];
        return (
          weekly !== undefined &&
          weekly.profit > 3000 &&
          loc.morale > 80 &&
          loc.reputation > 75
        );
      },
    },
    lesson: 'When everything clicks, the restaurant runs itself.',
    realWorldContext: 'Aiming for perfect weeks creates the habits for consistent success.',
    isHidden: false,
    isRepeatable: true,
  },
  {
    id: 'industry-leader',
    name: 'Industry Leader',
    description: 'Reputation above 85 for 12 consecutive weeks',
    category: 'excellence',
    difficulty: 'platinum',
    icon: '🌟',
    condition: {
      type: 'streak',
      metric: 'reputation',
      value: 85,
      duration: 12,
    },
    lesson: 'Excellence is not an act but a habit.',
    realWorldContext: 'Only 10% of restaurants maintain top-tier ratings consistently.',
    isHidden: false,
    isRepeatable: false,
  },
];

// ============================================
// ACHIEVEMENT FUNCTIONS
// ============================================

/**
 * Initialize achievement state
 */
export function initializeAchievementState(): AchievementState {
  const progress: Record<string, AchievementProgress> = {};

  for (const achievement of ACHIEVEMENTS) {
    progress[achievement.id] = {
      achievementId: achievement.id,
      currentValue: 0,
      targetValue: achievement.condition.value || 1,
      streakWeeks: 0,
      percentComplete: 0,
    };
  }

  return {
    unlocked: [],
    progress,
    totalPoints: 0,
    rank: 'Novice',
  };
}

/**
 * Calculate points for an achievement
 */
function getAchievementPoints(difficulty: Achievement['difficulty']): number {
  switch (difficulty) {
    case 'bronze': return 10;
    case 'silver': return 25;
    case 'gold': return 50;
    case 'platinum': return 100;
    default: return 10;
  }
}

/**
 * Calculate rank based on total points
 */
function calculateRank(points: number): AchievementRank {
  if (points >= 500) return 'Legend';
  if (points >= 300) return 'Master';
  if (points >= 200) return 'Expert';
  if (points >= 100) return 'Journeyman';
  if (points >= 50) return 'Apprentice';
  return 'Novice';
}

/**
 * Check achievements for a given game state
 */
export function checkAchievements(
  state: AchievementState,
  location: Location,
  game: GameState
): {
  newState: AchievementState;
  newlyUnlocked: UnlockedAchievement[];
} {
  const newState = { ...state };
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked (unless repeatable)
    const alreadyUnlocked = state.unlocked.some(u => u.achievement.id === achievement.id);
    if (alreadyUnlocked && !achievement.isRepeatable) continue;

    const progress = state.progress[achievement.id];
    let isComplete = false;
    let currentValue = progress.currentValue;

    // Check condition based on type
    switch (achievement.condition.type) {
      case 'threshold':
        currentValue = getMetricValue(achievement.condition.metric || '', location, game);
        isComplete = currentValue >= (achievement.condition.value || 0);
        break;

      case 'streak':
        currentValue = getMetricValue(achievement.condition.metric || '', location, game);
        const meetsThreshold = currentValue >= (achievement.condition.value || 0);
        if (meetsThreshold) {
          progress.streakWeeks++;
        } else {
          progress.streakWeeks = 0;
        }
        isComplete = progress.streakWeeks >= (achievement.condition.duration || 1);
        currentValue = progress.streakWeeks;
        break;

      case 'cumulative':
        // Cumulative values are tracked elsewhere and passed in
        isComplete = currentValue >= (achievement.condition.value || 0);
        break;

      case 'event':
      case 'combo':
        if (achievement.condition.customCheck) {
          isComplete = achievement.condition.customCheck(location, game);
          currentValue = isComplete ? 1 : 0;
        }
        break;
    }

    // Update progress
    newState.progress[achievement.id] = {
      ...progress,
      currentValue,
      percentComplete: Math.min(100, (currentValue / (achievement.condition.value || 1)) * 100),
    };

    // Check for unlock
    if (isComplete && (!alreadyUnlocked || achievement.isRepeatable)) {
      const unlocked: UnlockedAchievement = {
        achievement,
        unlockedWeek: game.week,
        unlockedDate: Date.now(),
        value: currentValue,
      };

      newlyUnlocked.push(unlocked);
      newState.unlocked.push(unlocked);
      newState.totalPoints += getAchievementPoints(achievement.difficulty);
    }
  }

  // Update rank
  newState.rank = calculateRank(newState.totalPoints);

  return { newState, newlyUnlocked };
}

/**
 * Get metric value from game state
 */
function getMetricValue(metric: string, location: Location, game: GameState): number {
  switch (metric) {
    case 'primeCost':
      // Calculate prime cost percentage
      const weeklyRevenue = location.lastWeekRevenue || 1;
      const foodCost = (location.lastWeekFoodCost || 0);
      const laborCost = (location.lastWeekLaborCost || 0);
      return ((foodCost + laborCost) / weeklyRevenue) * 100;

    case 'runway':
      // Weeks of cash runway
      const weeklyExpenses = location.rent + (location.staff?.reduce((s, st) => s + st.wage * 40, 0) || 0);
      return weeklyExpenses > 0 ? location.cash / weeklyExpenses : 0;

    case 'weeklyProfit':
      return location.lastWeekProfit || 0;

    case 'reputation':
      return location.reputation;

    case 'morale':
      return location.morale;

    case 'weeksOpen':
      return location.weeksOpen;

    case 'staffRetention':
      // Would need historical tracking
      return 100; // Placeholder

    case 'regularPercentage':
      // Would come from CustomerSegmentation
      return 25; // Placeholder

    default:
      return 0;
  }
}

/**
 * Get visible achievements (not hidden until unlocked)
 */
export function getVisibleAchievements(state: AchievementState): Achievement[] {
  return ACHIEVEMENTS.filter(a => {
    if (!a.isHidden) return true;
    return state.unlocked.some(u => u.achievement.id === a.id);
  });
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Generate achievement summary for sharing
 */
export function generateAchievementSummary(state: AchievementState): string {
  let summary = `🏆 Achievement Summary\n`;
  summary += `━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `Rank: ${state.rank} (${state.totalPoints} points)\n`;
  summary += `Achievements: ${state.unlocked.length}/${ACHIEVEMENTS.length}\n\n`;

  const byCategory: Record<string, UnlockedAchievement[]> = {};
  for (const unlocked of state.unlocked) {
    const cat = unlocked.achievement.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(unlocked);
  }

  for (const [category, achievements] of Object.entries(byCategory)) {
    summary += `\n${category.toUpperCase()}\n`;
    for (const a of achievements) {
      summary += `${a.achievement.icon} ${a.achievement.name}\n`;
    }
  }

  return summary;
}

/**
 * Get next achievements to target
 */
export function getRecommendedAchievements(
  state: AchievementState,
  location: Location
): { achievement: Achievement; reason: string; progress: number }[] {
  const recommendations = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (state.unlocked.some(u => u.achievement.id === achievement.id)) continue;

    const progress = state.progress[achievement.id];

    // Recommend achievements that are 50%+ complete
    if (progress.percentComplete >= 50) {
      recommendations.push({
        achievement,
        reason: `You're ${progress.percentComplete.toFixed(0)}% of the way there!`,
        progress: progress.percentComplete,
      });
    }

    // Recommend based on current state
    if (achievement.id === 'prime-cost-pro' && location.foodCostPct < 0.35) {
      recommendations.push({
        achievement,
        reason: 'Your food costs are well-controlled. Keep it up!',
        progress: progress.percentComplete,
      });
    }

    if (achievement.id === 'morale-master' && location.morale > 75) {
      recommendations.push({
        achievement,
        reason: 'Staff morale is high. Maintain it for the achievement!',
        progress: progress.percentComplete,
      });
    }
  }

  return recommendations.sort((a, b) => b.progress - a.progress).slice(0, 5);
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export const ACHIEVEMENT_LESSONS = {
  overview: `
Achievements mark important milestones in your restaurant journey:

FINANCIAL:
- Prime Cost Pro: Master the most important metric
- Cash Flow Master: Avoid the #1 cause of failure
- Lean Operator: Succeed with thin margins

OPERATIONS:
- Consistency King: Build reliability
- Menu Engineer: Optimize profitability
- Fully Stocked: Never disappoint customers

STAFF:
- Loyal Team: Reduce costly turnover
- Great Place to Work: Happy staff, happy customers

SURVIVAL:
- Year One Survivor: Beat the odds
- Crisis Survivor: Learn from adversity

Each achievement represents a real skill that separates
successful restaurant owners from those who fail.
  `,
};

export default {
  ACHIEVEMENTS,
  initializeAchievementState,
  checkAchievements,
  getVisibleAchievements,
  getAchievementsByCategory,
  generateAchievementSummary,
  getRecommendedAchievements,
  ACHIEVEMENT_LESSONS,
};
