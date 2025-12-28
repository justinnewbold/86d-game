// ============================================
// SCENARIO MODE SYSTEM
// ============================================
// Pre-configured learning scenarios for focused education
// Each scenario teaches specific restaurant management concepts

import type { Location, GameState } from '../types/game';

/**
 * A learning scenario with pre-configured state
 */
export interface LearningScenario {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'finance' | 'operations' | 'staff' | 'marketing' | 'crisis';
  description: string;
  learningObjectives: string[];
  successCriteria: SuccessCriterion[];
  failureCriteria: FailureCriterion[];
  timeLimit: number; // weeks
  initialState: ScenarioInitialState;
  hints: ScenarioHint[];
  debriefing: ScenarioDebriefing;
}

export interface SuccessCriterion {
  id: string;
  description: string;
  check: (location: Location, game: GameState) => boolean;
  points: number;
}

export interface FailureCriterion {
  id: string;
  description: string;
  check: (location: Location, game: GameState) => boolean;
  message: string;
}

export interface ScenarioInitialState {
  cash: number;
  reputation: number;
  morale: number;
  rent: number;
  weeksOpen: number;
  avgTicket: number;
  covers: number;
  staffSetup: 'minimal' | 'adequate' | 'overstaffed' | 'custom';
  menuSetup: 'basic' | 'diverse' | 'complex' | 'custom';
  specialConditions?: string[];
}

export interface ScenarioHint {
  triggerWeek: number;
  condition?: (location: Location, game: GameState) => boolean;
  hint: string;
  isOptional: boolean;
}

export interface ScenarioDebriefing {
  successMessage: string;
  failureMessage: string;
  keyLessons: string[];
  realWorldExample: string;
}

export interface ScenarioProgress {
  scenarioId: string;
  currentWeek: number;
  criteriaProgress: Record<string, boolean>;
  hintsShown: string[];
  isComplete: boolean;
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | null;
}

// ============================================
// PRE-BUILT LEARNING SCENARIOS
// ============================================

export const LEARNING_SCENARIOS: LearningScenario[] = [
  // BEGINNER: Cash Flow Basics
  {
    id: 'cash-flow-101',
    name: 'Cash Flow 101',
    difficulty: 'beginner',
    category: 'finance',
    description: 'Learn the difference between profit on paper and cash in the bank. Your restaurant is profitable but running low on cash.',
    learningObjectives: [
      'Understand that profit ≠ cash',
      'Learn how payment timing affects cash position',
      'Practice managing accounts payable',
    ],
    successCriteria: [
      {
        id: 'survive-4-weeks',
        description: 'Keep the restaurant open for 4 weeks',
        check: (_loc, game) => game.week >= 4,
        points: 50,
      },
      {
        id: 'maintain-cash',
        description: 'End with at least $5,000 cash',
        check: (loc) => loc.cash >= 5000,
        points: 30,
      },
      {
        id: 'no-missed-payments',
        description: 'Never miss a vendor payment',
        check: (loc) => loc.cash >= 0, // Simplified: if cash never went negative, payments were made
        points: 20,
      },
    ],
    failureCriteria: [
      {
        id: 'bankrupt',
        description: 'Run out of cash',
        check: (loc) => loc.cash < 0,
        message: 'You ran out of cash! Even profitable restaurants can fail if they can\'t pay their bills.',
      },
    ],
    timeLimit: 4,
    initialState: {
      cash: 8000,
      reputation: 65,
      morale: 70,
      rent: 4000, // Due this week!
      weeksOpen: 8,
      avgTicket: 28,
      covers: 350,
      staffSetup: 'adequate',
      menuSetup: 'basic',
      specialConditions: ['large_invoice_due'],
    },
    hints: [
      {
        triggerWeek: 1,
        hint: 'Check when your rent and vendor payments are due. Timing matters!',
        isOptional: false,
      },
      {
        triggerWeek: 2,
        condition: (loc) => loc.cash < 4000,
        hint: 'Consider negotiating payment terms with vendors or pushing back non-essential purchases.',
        isOptional: true,
      },
    ],
    debriefing: {
      successMessage: 'You navigated the cash crunch! Many new restaurant owners confuse profitability with having money in the bank.',
      failureMessage: 'Cash flow killed your restaurant. This is the #1 reason restaurants fail - not lack of customers, but timing of payments.',
      keyLessons: [
        'Profit is an opinion, cash is a fact',
        'Always know your cash position 4 weeks out',
        'Negotiate payment terms - Net30 is better than COD',
      ],
      realWorldExample: 'In 2019, a popular NYC restaurant closed despite lines out the door. Their rent doubled and they couldn\'t cover the timing gap. Profit on paper, but no cash to survive.',
    },
  },

  // INTERMEDIATE: Prime Cost Control
  {
    id: 'prime-cost-challenge',
    name: 'The 60% Challenge',
    difficulty: 'intermediate',
    category: 'finance',
    description: 'Your prime cost (food + labor) is at 68%. Get it under 60% without killing morale or quality.',
    learningObjectives: [
      'Understand prime cost as the key profitability metric',
      'Balance labor efficiency with staff morale',
      'Optimize food costs without sacrificing quality',
    ],
    successCriteria: [
      {
        id: 'prime-under-60',
        description: 'Achieve prime cost under 60%',
        check: (loc) => {
          const foodCost = (loc.totalRevenue || 1) * 0.28;
          const laborCost = loc.staff?.reduce((sum, s) => sum + s.wage * 40, 0) || 0;
          const weeklyRevenue = (loc.totalRevenue || 1) / Math.max(1, loc.weeksOpen);
          return (foodCost + laborCost) / weeklyRevenue < 0.60;
        },
        points: 40,
      },
      {
        id: 'maintain-morale',
        description: 'Keep staff morale above 60',
        check: (loc) => loc.morale >= 60,
        points: 30,
      },
      {
        id: 'maintain-reputation',
        description: 'Keep reputation above 55',
        check: (loc) => loc.reputation >= 55,
        points: 30,
      },
    ],
    failureCriteria: [
      {
        id: 'morale-crash',
        description: 'Staff morale crashed',
        check: (loc) => loc.morale < 40,
        message: 'You cut too deep! Your best staff quit and service quality tanked.',
      },
      {
        id: 'quality-crash',
        description: 'Quality dropped too much',
        check: (loc) => loc.reputation < 45,
        message: 'Customers noticed the quality drop. Cutting costs is pointless if you lose customers.',
      },
    ],
    timeLimit: 6,
    initialState: {
      cash: 25000,
      reputation: 62,
      morale: 72,
      rent: 3500,
      weeksOpen: 16,
      avgTicket: 26,
      covers: 380,
      staffSetup: 'overstaffed',
      menuSetup: 'complex',
    },
    hints: [
      {
        triggerWeek: 1,
        hint: 'Menu engineering can reduce food costs. Look for "dog" items - low popularity, low margin.',
        isOptional: false,
      },
      {
        triggerWeek: 3,
        hint: 'Cross-training staff lets you run leaner without making cuts.',
        isOptional: true,
      },
    ],
    debriefing: {
      successMessage: 'You hit the industry benchmark! Professional operators obsess over prime cost.',
      failureMessage: 'Cost-cutting is an art. Cut too fast or in the wrong places and you destroy value.',
      keyLessons: [
        'Prime cost = food + labor, should be under 60%',
        'Cutting labor saves money but risks service quality',
        'Menu engineering can reduce food cost 2-4%',
        'Cross-training adds flexibility without cutting staff',
      ],
      realWorldExample: 'Danny Meyer\'s restaurants aim for 55% prime cost. They achieve it through training, menu design, and efficiency - not by underpaying staff.',
    },
  },

  // ADVANCED: Turnaround Challenge
  {
    id: 'turnaround-challenge',
    name: 'The Turnaround',
    difficulty: 'advanced',
    category: 'crisis',
    description: 'You just bought a failing restaurant for cheap. Low reputation, demoralized staff, bleeding cash. Can you turn it around?',
    learningObjectives: [
      'Prioritize fixes when everything is broken',
      'Balance quick wins with long-term changes',
      'Manage staff through uncertainty',
    ],
    successCriteria: [
      {
        id: 'profitability',
        description: 'Achieve 3 consecutive profitable weeks',
        check: (loc) => {
          const history = loc.weeklyHistory || [];
          const last3 = history.slice(-3);
          return last3.length >= 3 && last3.every(w => (w.profit ?? 0) > 0);
        },
        points: 40,
      },
      {
        id: 'reputation-50',
        description: 'Raise reputation to 50+',
        check: (loc) => loc.reputation >= 50,
        points: 30,
      },
      {
        id: 'morale-60',
        description: 'Raise staff morale to 60+',
        check: (loc) => loc.morale >= 60,
        points: 30,
      },
    ],
    failureCriteria: [
      {
        id: 'bankrupt',
        description: 'Ran out of money',
        check: (loc) => loc.cash < 0,
        message: 'Turnarounds need capital. You ran out before the fixes could work.',
      },
      {
        id: 'staff-exodus',
        description: 'Staff all quit',
        check: (loc) => loc.morale < 25,
        message: 'Your remaining staff all quit. Turnarounds require bringing people along, not just making changes.',
      },
    ],
    timeLimit: 12,
    initialState: {
      cash: 15000,
      reputation: 35,
      morale: 40,
      rent: 3800,
      weeksOpen: 52,
      avgTicket: 22,
      covers: 180,
      staffSetup: 'minimal',
      menuSetup: 'basic',
      specialConditions: ['negative_reviews', 'equipment_issues'],
    },
    hints: [
      {
        triggerWeek: 1,
        hint: 'Quick wins matter. What can you fix this week that customers will notice?',
        isOptional: false,
      },
      {
        triggerWeek: 4,
        hint: 'Staff see-saw between hope and fear in turnarounds. Communicate your plan clearly.',
        isOptional: true,
      },
      {
        triggerWeek: 8,
        condition: (loc) => loc.reputation < 45,
        hint: 'Reputation is still low. Are you addressing the root causes of bad reviews?',
        isOptional: true,
      },
    ],
    debriefing: {
      successMessage: 'You turned it around! Most turnarounds fail - you beat the odds.',
      failureMessage: 'Turnarounds are the hardest challenge in restaurants. The odds were against you.',
      keyLessons: [
        'Turnarounds require capital reserves - 3-6 months',
        'Quick wins build momentum and staff confidence',
        'Fix what matters to customers first',
        'Don\'t cut so deep you can\'t recover',
      ],
      realWorldExample: 'Gordon Ramsay\'s Kitchen Nightmares shows real turnarounds. Most fail after the cameras leave because the owner reverts to old habits.',
    },
  },

  // EXPERT: Opening Week
  {
    id: 'opening-week',
    name: 'Grand Opening',
    difficulty: 'expert',
    category: 'operations',
    description: 'It\'s opening week. Everything that can go wrong will. Survive the chaos and build momentum.',
    learningObjectives: [
      'Manage operational chaos under pressure',
      'Make critical decisions with incomplete information',
      'Balance hype with sustainable operations',
    ],
    successCriteria: [
      {
        id: 'survive-opening',
        description: 'Stay open all 4 weeks',
        check: (_loc, game) => game.week >= 4,
        points: 30,
      },
      {
        id: 'build-reputation',
        description: 'Build reputation to 55+',
        check: (loc) => loc.reputation >= 55,
        points: 35,
      },
      {
        id: 'stay-solvent',
        description: 'Maintain positive cash',
        check: (loc) => loc.cash > 0,
        points: 35,
      },
    ],
    failureCriteria: [
      {
        id: 'reputation-tank',
        description: 'Opening reputation disaster',
        check: (loc) => loc.reputation < 30,
        message: 'Bad reviews went viral. In the social media age, a terrible opening can be fatal.',
      },
      {
        id: 'cash-out',
        description: 'Ran out of startup capital',
        check: (loc) => loc.cash < -5000,
        message: 'You burned through your reserves too fast. Openings always cost more than planned.',
      },
    ],
    timeLimit: 4,
    initialState: {
      cash: 30000,
      reputation: 45, // Starting from unknown
      morale: 80, // New staff are excited
      rent: 4500,
      weeksOpen: 0,
      avgTicket: 30,
      covers: 100, // Starting slow
      staffSetup: 'custom',
      menuSetup: 'diverse',
      specialConditions: ['soft_opening', 'equipment_learning_curve'],
    },
    hints: [
      {
        triggerWeek: 1,
        hint: 'Opening week tip: Better to underserve and overdeliver than the reverse. Start slow.',
        isOptional: false,
      },
      {
        triggerWeek: 2,
        hint: 'Watch for staff burnout. The adrenaline of opening fades fast.',
        isOptional: true,
      },
    ],
    debriefing: {
      successMessage: 'You launched successfully! Most new restaurants stumble in the first month.',
      failureMessage: 'Opening failures are common. The restaurant industry has a steep learning curve.',
      keyLessons: [
        'Soft openings let you work out kinks before critics arrive',
        'Underpromise and overdeliver in week 1',
        'Reserve 20% more capital than you think you need',
        'Your team\'s morale sets the tone for months',
      ],
      realWorldExample: 'Thomas Keller did 5 weeks of practice dinners before officially opening The French Laundry. No critics, no press, just practice.',
    },
  },

  // INTERMEDIATE: Staff Crisis
  {
    id: 'staff-crisis',
    name: 'The Mass Exodus',
    difficulty: 'intermediate',
    category: 'staff',
    description: 'Your head chef and 2 key servers just quit to open their own place. Rebuild your team without missing a beat.',
    learningObjectives: [
      'Manage sudden staff departures',
      'Maintain operations while rebuilding',
      'Prevent future key-person dependencies',
    ],
    successCriteria: [
      {
        id: 'maintain-ops',
        description: 'Never close for service',
        check: (loc) => (loc.weeklyHistory?.length ?? 0) >= 8, // Simplified: operated all 8 weeks
        points: 40,
      },
      {
        id: 'rebuild-morale',
        description: 'Rebuild morale to 65+',
        check: (loc) => loc.morale >= 65,
        points: 30,
      },
      {
        id: 'reputation-stable',
        description: 'Keep reputation within 10 points',
        check: (loc) => loc.reputation >= 50,
        points: 30,
      },
    ],
    failureCriteria: [
      {
        id: 'cascade-quit',
        description: 'Remaining staff also quit',
        check: (loc) => loc.morale < 35,
        message: 'The remaining staff saw the chaos and jumped ship too. Turnover is contagious.',
      },
    ],
    timeLimit: 8,
    initialState: {
      cash: 22000,
      reputation: 60,
      morale: 45, // Shaken by departures
      rent: 3600,
      weeksOpen: 24,
      avgTicket: 27,
      covers: 320,
      staffSetup: 'minimal', // Just lost key people
      menuSetup: 'diverse',
      specialConditions: ['key_staff_departed'],
    },
    hints: [
      {
        triggerWeek: 1,
        hint: 'Remaining staff are watching how you handle this. Communicate transparently.',
        isOptional: false,
      },
      {
        triggerWeek: 3,
        hint: 'Consider cross-training to reduce key-person risk in the future.',
        isOptional: true,
      },
    ],
    debriefing: {
      successMessage: 'You survived the crisis and built a more resilient team.',
      failureMessage: 'Staff crises cascade if not handled well. The remaining team\'s morale is critical.',
      keyLessons: [
        'Cross-train to prevent key-person dependencies',
        'Exit interviews can prevent future departures',
        'Communicate honestly with remaining staff',
        'Sometimes losing difficult people is a blessing',
      ],
      realWorldExample: 'When René Redzepi\'s sous chefs left Noma to open their own restaurants, he used it as an opportunity to reimagine his team structure.',
    },
  },
];

// ============================================
// SCENARIO MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get scenarios by difficulty level
 */
export function getScenariosByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): LearningScenario[] {
  return LEARNING_SCENARIOS.filter(s => s.difficulty === difficulty);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(
  category: 'finance' | 'operations' | 'staff' | 'marketing' | 'crisis'
): LearningScenario[] {
  return LEARNING_SCENARIOS.filter(s => s.category === category);
}

/**
 * Initialize a scenario
 */
export function initializeScenario(
  scenario: LearningScenario
): { location: Partial<Location>; progress: ScenarioProgress } {
  const location: Partial<Location> = {
    cash: scenario.initialState.cash,
    reputation: scenario.initialState.reputation,
    morale: scenario.initialState.morale,
    rent: scenario.initialState.rent,
    weeksOpen: scenario.initialState.weeksOpen,
    avgTicket: scenario.initialState.avgTicket,
    covers: scenario.initialState.covers,
    weeklyHistory: [],
  };

  const progress: ScenarioProgress = {
    scenarioId: scenario.id,
    currentWeek: 0,
    criteriaProgress: {},
    hintsShown: [],
    isComplete: false,
    finalScore: 0,
    grade: null,
  };

  // Initialize criteria tracking
  for (const criterion of scenario.successCriteria) {
    progress.criteriaProgress[criterion.id] = false;
  }

  return { location, progress };
}

/**
 * Process a scenario week and check progress
 */
export function processScenarioWeek(
  scenario: LearningScenario,
  location: Location,
  game: GameState,
  progress: ScenarioProgress
): {
  newProgress: ScenarioProgress;
  hintsToShow: ScenarioHint[];
  isComplete: boolean;
  result: 'ongoing' | 'success' | 'failure';
  failureReason?: string;
} {
  const newProgress = { ...progress };
  newProgress.currentWeek++;

  // Check failure criteria
  for (const criterion of scenario.failureCriteria) {
    if (criterion.check(location, game)) {
      newProgress.isComplete = true;
      newProgress.grade = 'F';
      return {
        newProgress,
        hintsToShow: [],
        isComplete: true,
        result: 'failure',
        failureReason: criterion.message,
      };
    }
  }

  // Check success criteria
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const criterion of scenario.successCriteria) {
    totalPoints += criterion.points;
    if (criterion.check(location, game)) {
      newProgress.criteriaProgress[criterion.id] = true;
      earnedPoints += criterion.points;
    }
  }

  // Determine hints to show
  const hintsToShow = scenario.hints.filter(hint => {
    if (progress.hintsShown.includes(`${hint.triggerWeek}-${hint.hint.substring(0, 20)}`)) {
      return false;
    }
    if (hint.triggerWeek !== newProgress.currentWeek) {
      return false;
    }
    if (hint.condition && !hint.condition(location, game)) {
      return false;
    }
    return true;
  });

  // Mark hints as shown
  for (const hint of hintsToShow) {
    newProgress.hintsShown.push(`${hint.triggerWeek}-${hint.hint.substring(0, 20)}`);
  }

  // Check if time limit reached
  if (newProgress.currentWeek >= scenario.timeLimit) {
    newProgress.isComplete = true;
    newProgress.finalScore = Math.round((earnedPoints / totalPoints) * 100);

    // Calculate grade
    if (newProgress.finalScore >= 90) newProgress.grade = 'A';
    else if (newProgress.finalScore >= 80) newProgress.grade = 'B';
    else if (newProgress.finalScore >= 70) newProgress.grade = 'C';
    else if (newProgress.finalScore >= 60) newProgress.grade = 'D';
    else newProgress.grade = 'F';

    return {
      newProgress,
      hintsToShow,
      isComplete: true,
      result: newProgress.finalScore >= 60 ? 'success' : 'failure',
    };
  }

  return {
    newProgress,
    hintsToShow,
    isComplete: false,
    result: 'ongoing',
  };
}

/**
 * Generate scenario completion summary
 */
export function generateScenarioSummary(
  scenario: LearningScenario,
  progress: ScenarioProgress,
  wasSuccess: boolean
): {
  title: string;
  grade: string;
  score: number;
  message: string;
  lessonsLearned: string[];
  realWorldConnection: string;
  nextRecommendedScenario?: string;
} {
  const debriefing = scenario.debriefing;

  // Find next recommended scenario
  const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentDiffIndex = difficultyOrder.indexOf(scenario.difficulty);

  let nextRecommended: string | undefined;
  if (wasSuccess && currentDiffIndex < 3) {
    const harderScenarios = LEARNING_SCENARIOS.filter(
      s => s.difficulty === difficultyOrder[currentDiffIndex + 1]
    );
    if (harderScenarios.length > 0) {
      nextRecommended = harderScenarios[0].name;
    }
  } else if (!wasSuccess) {
    // Recommend same difficulty, different category
    const sameLevel = LEARNING_SCENARIOS.filter(
      s => s.difficulty === scenario.difficulty && s.id !== scenario.id
    );
    if (sameLevel.length > 0) {
      nextRecommended = sameLevel[0].name;
    }
  }

  return {
    title: `${scenario.name} - Complete`,
    grade: progress.grade || 'F',
    score: progress.finalScore,
    message: wasSuccess ? debriefing.successMessage : debriefing.failureMessage,
    lessonsLearned: debriefing.keyLessons,
    realWorldConnection: debriefing.realWorldExample,
    nextRecommendedScenario: nextRecommended,
  };
}

/**
 * Get educational content for a scenario
 */
export function getScenarioEducation(scenario: LearningScenario): {
  overview: string;
  objectives: string[];
  whatToWatch: string[];
  commonMistakes: string[];
} {
  const commonMistakes: Record<string, string[]> = {
    'cash-flow-101': [
      'Confusing profit with cash on hand',
      'Not tracking payment due dates',
      'Spending based on expected revenue',
    ],
    'prime-cost-challenge': [
      'Cutting labor too fast, losing best staff',
      'Reducing food quality, losing customers',
      'Not using menu engineering first',
    ],
    'turnaround-challenge': [
      'Changing everything at once',
      'Not communicating with staff',
      'Running out of capital before fixes work',
    ],
    'opening-week': [
      'Trying to do too much volume too soon',
      'Not doing soft opening practice',
      'Underestimating startup costs',
    ],
    'staff-crisis': [
      'Panicking and making rash decisions',
      'Not communicating with remaining staff',
      'Over-relying on key individuals',
    ],
  };

  return {
    overview: scenario.description,
    objectives: scenario.learningObjectives,
    whatToWatch: scenario.successCriteria.map(c => c.description),
    commonMistakes: commonMistakes[scenario.id] || [
      'Not reading the situation carefully',
      'Making decisions too quickly',
      'Ignoring warning signs',
    ],
  };
}

export default {
  LEARNING_SCENARIOS,
  getScenariosByDifficulty,
  getScenariosByCategory,
  initializeScenario,
  processScenarioWeek,
  generateScenarioSummary,
  getScenarioEducation,
};
