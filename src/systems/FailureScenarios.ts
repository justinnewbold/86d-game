// ============================================
// REALISTIC FAILURE SCENARIOS
// ============================================
// Based on actual reasons restaurants fail
// Source: Restaurant industry post-mortems, SBA data

/**
 * THE REAL REASONS RESTAURANTS FAIL
 * (Not the dramatic stuff - the boring, preventable stuff)
 */
export const FAILURE_STATISTICS = {
  // Industry failure rates
  year1FailureRate: 0.17, // 17% fail in year 1
  year3FailureRate: 0.50, // 50% fail by year 3
  year5FailureRate: 0.60, // 60% fail by year 5

  // Root causes (from SBA and industry studies)
  rootCauses: {
    undercapitalization: 0.29, // #1 - Ran out of money
    poorLocation: 0.23, // #2 - Wrong location
    poorManagement: 0.18, // #3 - Lack of experience
    competitiveMarket: 0.14, // #4 - Too much competition
    poorMarketing: 0.08, // #5 - No one knows you exist
    economicFactors: 0.05, // #6 - Recession, pandemic
    other: 0.03,
  },
};

export interface FailureScenario {
  id: string;
  name: string;
  category: 'cash_flow' | 'operations' | 'market' | 'legal' | 'personnel' | 'external';
  severity: 'warning' | 'critical' | 'fatal';
  probability: number; // Base probability per week
  triggers: ScenarioTrigger[];
  consequences: ScenarioConsequence[];
  prevention: string[];
  realWorldExample?: string;
  educationalLesson: string;
}

export interface ScenarioTrigger {
  condition: string;
  threshold: number | string | boolean;
  operator: 'lt' | 'gt' | 'eq' | 'between';
}

export interface ScenarioConsequence {
  type: 'cash' | 'reputation' | 'staff' | 'operations' | 'legal';
  impact: number | string;
  duration?: number; // Weeks
}

/**
 * CASH FLOW CRISIS SCENARIOS
 * The #1 killer of restaurants
 */
export const CASH_FLOW_SCENARIOS: FailureScenario[] = [
  {
    id: 'cash_crunch_payroll',
    name: "Can't Make Payroll",
    category: 'cash_flow',
    severity: 'critical',
    probability: 0.08,
    triggers: [
      { condition: 'cashOnHand', threshold: 'weeklyPayroll', operator: 'lt' },
      { condition: 'weeksOfRunway', threshold: 2, operator: 'lt' },
    ],
    consequences: [
      { type: 'staff', impact: 'massQuit', duration: 1 },
      { type: 'reputation', impact: -15 },
      { type: 'legal', impact: 'wageClaimRisk' },
    ],
    prevention: [
      'Maintain 4-6 weeks of payroll in reserve',
      'Have a line of credit for emergencies',
      'Track cash flow weekly, not monthly',
    ],
    realWorldExample: "In 2019, a Chicago restaurant closed overnight when they couldn't make payroll after a slow holiday week.",
    educationalLesson: 'Payroll is sacred. If you miss it once, your best employees leave first - they have options.',
  },
  {
    id: 'profitable_but_broke',
    name: 'Profitable But Out of Cash',
    category: 'cash_flow',
    severity: 'critical',
    probability: 0.05,
    triggers: [
      { condition: 'netProfitMargin', threshold: 0.05, operator: 'gt' },
      { condition: 'cashOnHand', threshold: 'monthlyBills', operator: 'lt' },
    ],
    consequences: [
      { type: 'operations', impact: 'cannotPaySuppliers' },
      { type: 'cash', impact: -5000 }, // Emergency financing costs
    ],
    prevention: [
      'Understand the difference between profit and cash',
      'Collect receivables faster',
      'Negotiate longer payment terms with suppliers',
    ],
    educationalLesson: "This is the #1 surprise for new owners. Your P&L says you're making money, but your bank account is empty.",
  },
  {
    id: 'supplier_cutoff',
    name: 'Supplier Cuts You Off',
    category: 'cash_flow',
    severity: 'warning',
    probability: 0.06,
    triggers: [
      { condition: 'supplierPaymentDays', threshold: 45, operator: 'gt' },
    ],
    consequences: [
      { type: 'operations', impact: 'limitedMenu', duration: 2 },
      { type: 'cash', impact: 'CODRequired' },
      { type: 'reputation', impact: -5 },
    ],
    prevention: [
      'Pay suppliers within terms',
      'Communicate early if you need more time',
      'Have backup suppliers',
    ],
    educationalLesson: 'Your suppliers talk to each other. Get a reputation for late payment and the word spreads.',
  },
];

/**
 * OPERATIONAL FAILURE SCENARIOS
 */
export const OPERATIONAL_SCENARIOS: FailureScenario[] = [
  {
    id: 'kitchen_walkout',
    name: 'Kitchen Staff Walkout',
    category: 'personnel',
    severity: 'critical',
    probability: 0.03,
    triggers: [
      { condition: 'kitchenMorale', threshold: 40, operator: 'lt' },
      { condition: 'weeklyHoursPerCook', threshold: 55, operator: 'gt' },
    ],
    consequences: [
      { type: 'operations', impact: 'closedForDays', duration: 3 },
      { type: 'cash', impact: -10000 }, // Lost revenue
      { type: 'reputation', impact: -10 },
    ],
    prevention: [
      'Monitor staff morale weekly',
      'Keep hours reasonable (under 50/week)',
      'Pay competitively for your market',
      'Treat staff with respect',
    ],
    realWorldExample: "A NYC restaurant closed mid-service when the entire kitchen walked out after the chef berated a line cook.",
    educationalLesson: "Your restaurant is only as strong as your worst day in the kitchen. Burned-out staff eventually snap.",
  },
  {
    id: 'health_inspection_fail',
    name: 'Failed Health Inspection',
    category: 'operations',
    severity: 'critical',
    probability: 0.02,
    triggers: [
      { condition: 'kitchenCleanliness', threshold: 60, operator: 'lt' },
      { condition: 'staffTraining', threshold: 'foodSafety', operator: 'eq' },
    ],
    consequences: [
      { type: 'operations', impact: 'closedForReinspection', duration: 1 },
      { type: 'reputation', impact: -20 },
      { type: 'legal', impact: 'finesAndPublicRecord' },
    ],
    prevention: [
      'Daily cleaning checklists',
      'Regular self-inspections',
      'ServSafe certification for all staff',
      'Proper food storage and temperature logs',
    ],
    educationalLesson: 'Health grades are public. A "B" or "C" in the window costs you 10-20% of walk-in traffic.',
  },
  {
    id: 'equipment_catastrophe',
    name: 'Major Equipment Failure',
    category: 'operations',
    severity: 'warning',
    probability: 0.04,
    triggers: [
      { condition: 'equipmentAge', threshold: 7, operator: 'gt' },
      { condition: 'maintenanceBudget', threshold: 0, operator: 'eq' },
    ],
    consequences: [
      { type: 'operations', impact: 'limitedMenu', duration: 1 },
      { type: 'cash', impact: -8000 }, // Emergency repair
    ],
    prevention: [
      'Budget 1-2% of revenue for R&M',
      'Preventive maintenance schedule',
      'Know your equipment warranties',
    ],
    educationalLesson: 'A dead walk-in cooler on Friday night is $5,000 in spoiled food plus emergency repair costs.',
  },
];

/**
 * MARKET & COMPETITION SCENARIOS
 */
export const MARKET_SCENARIOS: FailureScenario[] = [
  {
    id: 'chain_moves_in',
    name: 'Chain Restaurant Opens Nearby',
    category: 'market',
    severity: 'warning',
    probability: 0.02,
    triggers: [
      { condition: 'locationCompetition', threshold: 'saturated', operator: 'eq' },
    ],
    consequences: [
      { type: 'cash', impact: -0.15 }, // 15% revenue drop
      { type: 'staff', impact: 'poachingRisk' },
    ],
    prevention: [
      'Differentiate on service and quality',
      'Build strong customer loyalty',
      "Don't compete on price with chains",
    ],
    educationalLesson: "Chains have deeper pockets. You can't outspend them, so don't try. Out-serve them instead.",
  },
  {
    id: 'neighborhood_change',
    name: 'Neighborhood Demographics Shift',
    category: 'market',
    severity: 'warning',
    probability: 0.01,
    triggers: [
      { condition: 'areaIncome', threshold: -0.15, operator: 'lt' },
    ],
    consequences: [
      { type: 'cash', impact: -0.20 }, // 20% revenue drop
      { type: 'operations', impact: 'menuRepriceNeeded' },
    ],
    prevention: [
      'Research neighborhood trends before signing lease',
      'Build a diverse customer base',
      'Consider delivery to expand reach',
    ],
    educationalLesson: 'Restaurants are hyper-local. A new highway exit can change everything in 6 months.',
  },
  {
    id: 'negative_viral_review',
    name: 'Viral Negative Review',
    category: 'market',
    severity: 'critical',
    probability: 0.01,
    triggers: [
      { condition: 'reputationScore', threshold: 60, operator: 'lt' },
      { condition: 'recentComplaints', threshold: 3, operator: 'gt' },
    ],
    consequences: [
      { type: 'reputation', impact: -30 },
      { type: 'cash', impact: -0.25 }, // 25% revenue drop
    ],
    prevention: [
      'Respond to every negative review',
      'Empower staff to solve problems on the spot',
      'Monitor social media daily',
    ],
    realWorldExample: "Amy's Baking Company became a meme after a Kitchen Nightmares episode. They closed within a year.",
    educationalLesson: "One angry customer with a phone can reach 10,000 people. Handle complaints like your business depends on it - because it does.",
  },
];

/**
 * LEGAL & COMPLIANCE SCENARIOS
 */
export const LEGAL_SCENARIOS: FailureScenario[] = [
  {
    id: 'wage_violation',
    name: 'Wage & Hour Violation',
    category: 'legal',
    severity: 'critical',
    probability: 0.02,
    triggers: [
      { condition: 'tipPoolingViolation', threshold: true, operator: 'eq' },
      { condition: 'overtimeUnpaid', threshold: true, operator: 'eq' },
    ],
    consequences: [
      { type: 'cash', impact: -25000 }, // Back wages + penalties
      { type: 'legal', impact: 'DOLInvestigation' },
    ],
    prevention: [
      'Understand tip credit laws in your state',
      'Pay overtime correctly (time and a half)',
      'Keep accurate time records',
      'Consult an employment attorney',
    ],
    educationalLesson: 'Wage theft lawsuits are expensive. One employee complaint can trigger an audit of all your records.',
  },
  {
    id: 'lease_default',
    name: 'Lease Default',
    category: 'legal',
    severity: 'fatal',
    probability: 0.01,
    triggers: [
      { condition: 'missedRentPayments', threshold: 3, operator: 'gt' },
    ],
    consequences: [
      { type: 'operations', impact: 'evictionNotice' },
      { type: 'legal', impact: 'personalGuaranteeEnforced' },
      { type: 'cash', impact: -50000 }, // Remaining lease obligation
    ],
    prevention: [
      'Never sign a personal guarantee if you can avoid it',
      'Negotiate early termination clauses',
      'Communicate with landlord BEFORE you miss payments',
    ],
    educationalLesson: "Most restaurant leases are 5-10 years with personal guarantees. If you close early, you still owe the rent.",
  },
];

/**
 * EXTERNAL SHOCK SCENARIOS
 */
export const EXTERNAL_SCENARIOS: FailureScenario[] = [
  {
    id: 'economic_recession',
    name: 'Economic Recession',
    category: 'external',
    severity: 'warning',
    probability: 0.005,
    triggers: [
      { condition: 'economicCondition', threshold: 'recession', operator: 'eq' },
    ],
    consequences: [
      { type: 'cash', impact: -0.30 }, // 30% revenue drop
      { type: 'staff', impact: 'layoffsNeeded' },
    ],
    prevention: [
      'Build 6 months of operating reserves',
      'Have a lean menu ready to deploy',
      'Diversify revenue streams (catering, delivery)',
    ],
    educationalLesson: "Dining out is the first discretionary expense people cut. Fine dining gets hit hardest.",
  },
  {
    id: 'pandemic_restrictions',
    name: 'Pandemic/Health Crisis',
    category: 'external',
    severity: 'fatal',
    probability: 0.001,
    triggers: [
      { condition: 'healthCrisis', threshold: true, operator: 'eq' },
    ],
    consequences: [
      { type: 'operations', impact: 'takeoutOnly', duration: 8 },
      { type: 'cash', impact: -0.70 }, // 70% revenue drop
    ],
    prevention: [
      'Have delivery/takeout infrastructure ready',
      'Maintain 6+ months cash reserves',
      'Flexible lease terms if possible',
    ],
    educationalLesson: "COVID-19 permanently closed 17% of US restaurants. Those with delivery and reserves survived.",
  },
];

/**
 * Check if any failure scenarios should trigger
 */
export function checkForFailureScenarios(
  gameState: {
    cashOnHand: number;
    weeklyPayroll: number;
    monthlyBills: number;
    weeksOfRunway: number;
    netProfitMargin: number;
    kitchenMorale: number;
    reputationScore: number;
    missedRentPayments: number;
    economicCondition: string;
  }
): FailureScenario[] {
  const allScenarios = [
    ...CASH_FLOW_SCENARIOS,
    ...OPERATIONAL_SCENARIOS,
    ...MARKET_SCENARIOS,
    ...LEGAL_SCENARIOS,
    ...EXTERNAL_SCENARIOS,
  ];

  const triggeredScenarios: FailureScenario[] = [];

  for (const scenario of allScenarios) {
    // Check if all triggers are met
    const allTriggersMet = scenario.triggers.every(trigger => {
      const value = gameState[trigger.condition as keyof typeof gameState];
      const threshold = trigger.threshold;

      // Handle special threshold values that reference other gameState properties
      let resolvedThreshold: number | string | boolean = threshold;
      if (typeof threshold === 'string' && threshold in gameState) {
        resolvedThreshold = gameState[threshold as keyof typeof gameState];
      }

      // Only compare if both are the same type
      switch (trigger.operator) {
        case 'lt':
          return typeof value === 'number' && typeof resolvedThreshold === 'number'
            ? value < resolvedThreshold
            : false;
        case 'gt':
          return typeof value === 'number' && typeof resolvedThreshold === 'number'
            ? value > resolvedThreshold
            : false;
        case 'eq':
          return value === resolvedThreshold;
        default:
          return false;
      }
    });

    if (allTriggersMet) {
      // Roll for probability
      if (Math.random() < scenario.probability) {
        triggeredScenarios.push(scenario);
      }
    }
  }

  return triggeredScenarios;
}

/**
 * Educational post-mortem for game over
 */
export function generatePostMortem(
  failureReason: FailureScenario,
  gameHistory: {
    weeksInBusiness: number;
    peakRevenue: number;
    peakCash: number;
    finalCash: number;
    loansOutstanding: number;
    totalInvested: number;
  }
): {
  headline: string;
  whatWentWrong: string[];
  warningSignsMissed: string[];
  whatToDoNextTime: string[];
  industryContext: string;
} {
  return {
    headline: `${failureReason.name} - Week ${gameHistory.weeksInBusiness}`,
    whatWentWrong: [
      failureReason.educationalLesson,
      `You ran out of runway with $${gameHistory.finalCash.toLocaleString()} in cash`,
      gameHistory.loansOutstanding > 0
        ? `Outstanding debt of $${gameHistory.loansOutstanding.toLocaleString()} accelerated the decline`
        : 'Fortunately, you had no outstanding debt',
    ],
    warningSignsMissed: failureReason.prevention,
    whatToDoNextTime: [
      'Start with more capital (minimum 6 months of expenses)',
      'Track cash flow weekly, not just profit',
      'Build reserves before expanding',
      'Have a financial advisor or mentor',
    ],
    industryContext: `${(FAILURE_STATISTICS.year1FailureRate * 100).toFixed(0)}% of restaurants fail in year 1, ` +
                     `${(FAILURE_STATISTICS.year5FailureRate * 100).toFixed(0)}% by year 5. ` +
                     `The #1 cause is ${Object.entries(FAILURE_STATISTICS.rootCauses)[0][0].replace('_', ' ')}.`,
  };
}
