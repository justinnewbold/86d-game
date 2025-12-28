// ============================================
// SCENARIO CONSEQUENCES & RECOVERY SYSTEM
// ============================================
// Applies real consequences from failure scenarios
// Provides meaningful recovery options that teach business decisions

import type { GameState, Location } from '../types/game';
import type { FailureScenario, ScenarioConsequence } from './FailureScenarios';

/**
 * Recovery options players can take when scenarios trigger
 */
export interface RecoveryOption {
  id: string;
  name: string;
  description: string;
  cost: number; // Cash cost
  timeCost?: number; // Weeks of reduced operations
  successChance: number; // 0-1
  outcomes: {
    success: RecoveryOutcome;
    failure: RecoveryOutcome;
  };
  requirements?: {
    minCash?: number;
    minReputation?: number;
    hasCreditLine?: boolean;
  };
  educationalNote: string;
}

export interface RecoveryOutcome {
  description: string;
  effects: {
    cash?: number;
    reputation?: number;
    morale?: number;
    weeklyRevenueMod?: number; // Multiplier for X weeks
    weeklyRevenueDuration?: number;
  };
}

/**
 * Apply consequences from a triggered scenario to the game state
 */
export function applyScenarioConsequences(
  location: Location,
  game: GameState,
  scenario: FailureScenario
): {
  updatedLocation: Location;
  updatedGame: GameState;
  appliedEffects: string[];
  recoveryOptions: RecoveryOption[];
} {
  const appliedEffects: string[] = [];
  let updatedLocation = { ...location };
  let updatedGame = { ...game };

  for (const consequence of scenario.consequences) {
    switch (consequence.type) {
      case 'cash':
        if (typeof consequence.impact === 'number') {
          if (consequence.impact < 0 && consequence.impact > -1) {
            // Percentage-based reduction
            const reduction = Math.floor(updatedLocation.cash * Math.abs(consequence.impact));
            updatedLocation.cash = Math.max(0, updatedLocation.cash - reduction);
            appliedEffects.push(`Lost $${reduction.toLocaleString()} (${Math.abs(consequence.impact) * 100}% of cash)`);
          } else {
            // Direct cash impact
            updatedLocation.cash = Math.max(0, updatedLocation.cash + consequence.impact);
            appliedEffects.push(`Cash ${consequence.impact >= 0 ? '+' : ''}$${consequence.impact.toLocaleString()}`);
          }
        }
        break;

      case 'reputation':
        if (typeof consequence.impact === 'number') {
          updatedLocation.reputation = Math.max(0, Math.min(100,
            updatedLocation.reputation + consequence.impact
          ));
          appliedEffects.push(`Reputation ${consequence.impact >= 0 ? '+' : ''}${consequence.impact}`);
        }
        break;

      case 'staff':
        if (consequence.impact === 'massQuit') {
          // 30-50% of staff quit
          const quitRate = 0.3 + Math.random() * 0.2;
          const staffToRemove = Math.floor((updatedLocation.staff?.length || 0) * quitRate);
          if (staffToRemove > 0) {
            // Remove lowest morale staff first
            const sortedStaff = [...(updatedLocation.staff || [])].sort((a, b) => a.morale - b.morale);
            updatedLocation.staff = sortedStaff.slice(staffToRemove);
            appliedEffects.push(`${staffToRemove} staff members quit!`);
          }
        } else if (consequence.impact === 'poachingRisk') {
          // Reduce morale, some may leave
          updatedLocation.staff = (updatedLocation.staff || []).map(s => ({
            ...s,
            morale: Math.max(20, s.morale - 10),
          })).filter(s => {
            if (s.morale < 35 && Math.random() < 0.2) {
              appliedEffects.push(`${s.name} was poached by a competitor`);
              return false;
            }
            return true;
          });
        } else if (consequence.impact === 'layoffsNeeded') {
          appliedEffects.push('You may need to reduce staff to cut costs');
        }
        break;

      case 'operations':
        if (consequence.impact === 'closedForDays' || consequence.impact === 'closedForReinspection') {
          // Mark location as temporarily closed
          const closedWeeks = consequence.duration || 1;
          appliedEffects.push(`Operations suspended for ${closedWeeks} week(s)`);
          // Revenue reduction handled in game loop
        } else if (consequence.impact === 'limitedMenu') {
          appliedEffects.push(`Limited menu for ${consequence.duration || 2} weeks`);
        } else if (consequence.impact === 'cannotPaySuppliers') {
          appliedEffects.push('Suppliers require cash on delivery');
        } else if (consequence.impact === 'takeoutOnly') {
          appliedEffects.push('Dine-in suspended, takeout/delivery only');
        }
        break;

      case 'legal':
        if (consequence.impact === 'DOLInvestigation') {
          appliedEffects.push('Department of Labor investigation pending');
        } else if (consequence.impact === 'evictionNotice') {
          appliedEffects.push('Eviction notice received - find solution or close');
        } else if (consequence.impact === 'finesAndPublicRecord') {
          updatedLocation.cash = Math.max(0, updatedLocation.cash - 2500);
          updatedLocation.reputation = Math.max(0, updatedLocation.reputation - 10);
          appliedEffects.push('$2,500 fine and public health record posted');
        }
        break;
    }
  }

  // Generate appropriate recovery options
  const recoveryOptions = generateRecoveryOptions(scenario, updatedLocation, updatedGame);

  return {
    updatedLocation,
    updatedGame,
    appliedEffects,
    recoveryOptions,
  };
}

/**
 * Generate recovery options based on the scenario
 */
function generateRecoveryOptions(
  scenario: FailureScenario,
  location: Location,
  game: GameState
): RecoveryOption[] {
  const options: RecoveryOption[] = [];

  switch (scenario.category) {
    case 'cash_flow':
      // Emergency financing options
      options.push({
        id: 'emergency_loan',
        name: 'Emergency Business Loan',
        description: 'Get quick cash but at high interest rates (15% APR)',
        cost: 500, // Origination fee
        successChance: 0.85,
        outcomes: {
          success: {
            description: 'Loan approved! You receive $25,000 but will pay $1,000/month',
            effects: { cash: 25000 },
          },
          failure: {
            description: 'Loan denied due to cash flow concerns',
            effects: { reputation: -5 },
          },
        },
        requirements: { minReputation: 30 },
        educationalNote: 'Emergency loans can save your business but the interest adds up fast. Many restaurants go deeper into debt this way.',
      });

      options.push({
        id: 'credit_line',
        name: 'Use Credit Line',
        description: 'Draw from your available credit line',
        cost: 0,
        successChance: 1.0,
        outcomes: {
          success: {
            description: 'Credit line accessed successfully',
            effects: { cash: 15000 },
          },
          failure: {
            description: '',
            effects: {},
          },
        },
        requirements: { hasCreditLine: true },
        educationalNote: 'Having a credit line setup BEFORE you need it is crucial. Getting one during a crisis is nearly impossible.',
      });

      options.push({
        id: 'negotiate_suppliers',
        name: 'Negotiate with Suppliers',
        description: 'Ask for extended payment terms (Net 45 instead of Net 30)',
        cost: 0,
        successChance: 0.60,
        outcomes: {
          success: {
            description: 'Suppliers agree to extended terms',
            effects: { cash: 5000 }, // Effective cash by delaying payments
          },
          failure: {
            description: 'Suppliers require cash on delivery going forward',
            effects: { reputation: -3 },
          },
        },
        educationalNote: 'Building good relationships with suppliers BEFORE a crisis makes them more likely to work with you.',
      });
      break;

    case 'personnel':
      options.push({
        id: 'emergency_hiring',
        name: 'Emergency Hiring',
        description: 'Pay premium wages to quickly fill positions',
        cost: 3000,
        successChance: 0.90,
        outcomes: {
          success: {
            description: 'New staff hired at 20% above market rate',
            effects: { morale: 10 },
          },
          failure: {
            description: 'Unable to find qualified staff quickly',
            effects: { weeklyRevenueMod: 0.7, weeklyRevenueDuration: 2 },
          },
        },
        educationalNote: 'Hiring during a crisis is expensive. Prevention (good pay, reasonable hours) is cheaper than emergency hiring.',
      });

      options.push({
        id: 'staff_bonuses',
        name: 'Retention Bonuses',
        description: 'Offer bonuses to remaining staff to prevent more departures',
        cost: 2000,
        successChance: 0.85,
        outcomes: {
          success: {
            description: 'Staff morale stabilized, no further departures',
            effects: { morale: 25 },
          },
          failure: {
            description: 'Money spent but some staff still leave',
            effects: { morale: 10 },
          },
        },
        educationalNote: 'Retention bonuses work best as prevention. Once morale crashes, some damage is already done.',
      });
      break;

    case 'operations':
      options.push({
        id: 'deep_clean',
        name: 'Professional Deep Clean',
        description: 'Hire professional cleaning to pass reinspection',
        cost: 2500,
        successChance: 0.95,
        outcomes: {
          success: {
            description: 'Passed reinspection with improved score',
            effects: { reputation: 5 },
          },
          failure: {
            description: 'Minor issues found, need another day',
            effects: {},
          },
        },
        educationalNote: 'Daily cleaning checklists prevent this situation. The $2,500 emergency clean costs 10x what prevention would.',
      });

      options.push({
        id: 'equipment_repair',
        name: 'Emergency Equipment Repair',
        description: 'Rush repair service (2x normal cost)',
        cost: 8000,
        successChance: 0.90,
        outcomes: {
          success: {
            description: 'Equipment repaired, full operations resumed',
            effects: {},
          },
          failure: {
            description: 'Need replacement, not repair. More time needed.',
            effects: { weeklyRevenueMod: 0.5, weeklyRevenueDuration: 1 },
          },
        },
        educationalNote: 'Budget 1-2% of revenue for repairs and maintenance. Preventive maintenance is cheaper than emergency repairs.',
      });
      break;

    case 'market':
      options.push({
        id: 'marketing_blitz',
        name: 'Marketing Campaign',
        description: 'Aggressive marketing to counter competition',
        cost: 5000,
        successChance: 0.70,
        outcomes: {
          success: {
            description: 'Campaign successful, traffic recovering',
            effects: { reputation: 15, weeklyRevenueMod: 1.1, weeklyRevenueDuration: 4 },
          },
          failure: {
            description: 'Campaign had minimal impact',
            effects: {},
          },
        },
        educationalNote: 'Marketing works best when you have something unique to offer. Competing on awareness alone is expensive.',
      });

      options.push({
        id: 'differentiate_menu',
        name: 'Menu Differentiation',
        description: 'Develop unique dishes that chains can\'t replicate',
        cost: 3000,
        successChance: 0.75,
        outcomes: {
          success: {
            description: 'New signature dishes driving traffic',
            effects: { reputation: 10, weeklyRevenueMod: 1.05, weeklyRevenueDuration: 8 },
          },
          failure: {
            description: 'New dishes not resonating with customers',
            effects: {},
          },
        },
        educationalNote: 'You can\'t out-spend chains on marketing. Out-cook them with quality and uniqueness instead.',
      });

      options.push({
        id: 'respond_reviews',
        name: 'Reputation Management',
        description: 'Hire PR help to respond to negative reviews and rebuild image',
        cost: 2000,
        successChance: 0.65,
        outcomes: {
          success: {
            description: 'Narrative shifting, reputation recovering',
            effects: { reputation: 20 },
          },
          failure: {
            description: 'Responses seen as insincere, backlash continues',
            effects: { reputation: -5 },
          },
        },
        educationalNote: 'The best response to negative reviews is fixing the actual problem, then communicating the fix.',
      });
      break;

    case 'legal':
      options.push({
        id: 'hire_lawyer',
        name: 'Hire Employment Attorney',
        description: 'Get legal help to navigate the situation',
        cost: 5000,
        successChance: 0.80,
        outcomes: {
          success: {
            description: 'Settled for less than worst case',
            effects: { cash: -10000 }, // Settlement cost
          },
          failure: {
            description: 'Case goes to trial, more expensive',
            effects: { cash: -25000 },
          },
        },
        educationalNote: 'Legal costs can bankrupt a restaurant. Compliance is cheaper than lawsuits.',
      });

      options.push({
        id: 'negotiate_landlord',
        name: 'Negotiate with Landlord',
        description: 'Request rent deferral or reduction',
        cost: 0,
        successChance: 0.50,
        outcomes: {
          success: {
            description: 'Landlord agrees to defer 2 months rent',
            effects: { cash: location.rent * 8 }, // 2 months = 8 weeks
          },
          failure: {
            description: 'Landlord refuses, threatens legal action',
            effects: { reputation: -5 },
          },
        },
        educationalNote: 'Good landlord relationships matter. Communicate early if you anticipate payment issues.',
      });
      break;

    case 'external':
      options.push({
        id: 'pivot_delivery',
        name: 'Pivot to Delivery/Takeout',
        description: 'Restructure operations for off-premise dining',
        cost: 5000,
        successChance: 0.75,
        outcomes: {
          success: {
            description: 'Successfully pivoted, capturing 40% of normal revenue',
            effects: { weeklyRevenueMod: 0.4, weeklyRevenueDuration: 8 },
          },
          failure: {
            description: 'Pivot struggles, only 20% of normal revenue',
            effects: { weeklyRevenueMod: 0.2, weeklyRevenueDuration: 8 },
          },
        },
        educationalNote: 'Restaurants with delivery infrastructure pre-crisis survived COVID better. Diversification matters.',
      });

      options.push({
        id: 'apply_relief',
        name: 'Apply for Relief Programs',
        description: 'Seek government assistance programs',
        cost: 0,
        timeCost: 2,
        successChance: 0.60,
        outcomes: {
          success: {
            description: 'Relief approved, receiving assistance',
            effects: { cash: 20000 },
          },
          failure: {
            description: 'Application denied or delayed',
            effects: {},
          },
        },
        educationalNote: 'Relief programs have limited funds and complex requirements. Apply early and have documentation ready.',
      });
      break;
  }

  // Filter options by requirements
  return options.filter(option => {
    if (option.requirements?.minCash && location.cash < option.requirements.minCash) {
      return false;
    }
    if (option.requirements?.minReputation && location.reputation < option.requirements.minReputation) {
      return false;
    }
    if (option.requirements?.hasCreditLine) {
      const creditAvailable = (location.cashFlow?.creditLineAvailable || 0) - (location.cashFlow?.creditLineUsed || 0);
      if (creditAvailable <= 0) return false;
    }
    return true;
  });
}

/**
 * Execute a recovery option and apply its effects
 */
export function executeRecovery(
  location: Location,
  option: RecoveryOption
): {
  updatedLocation: Location;
  success: boolean;
  message: string;
  educationalNote: string;
} {
  // Check if can afford
  if (location.cash < option.cost) {
    return {
      updatedLocation: location,
      success: false,
      message: `Cannot afford ${option.name} (need $${option.cost.toLocaleString()})`,
      educationalNote: 'Having reserves before a crisis is crucial - you need options when things go wrong.',
    };
  }

  // Pay cost
  let updatedLocation = {
    ...location,
    cash: location.cash - option.cost,
  };

  // Roll for success
  const roll = Math.random();
  const success = roll < option.successChance;

  const outcome = success ? option.outcomes.success : option.outcomes.failure;

  // Apply effects
  if (outcome.effects.cash) {
    updatedLocation.cash = Math.max(0, updatedLocation.cash + outcome.effects.cash);
  }
  if (outcome.effects.reputation) {
    updatedLocation.reputation = Math.max(0, Math.min(100,
      updatedLocation.reputation + outcome.effects.reputation
    ));
  }
  if (outcome.effects.morale) {
    updatedLocation.morale = Math.max(0, Math.min(100,
      updatedLocation.morale + outcome.effects.morale
    ));
    // Apply to staff too
    updatedLocation.staff = (updatedLocation.staff || []).map(s => ({
      ...s,
      morale: Math.max(20, Math.min(100, s.morale + (outcome.effects.morale || 0) / 2)),
    }));
  }

  return {
    updatedLocation,
    success,
    message: outcome.description,
    educationalNote: option.educationalNote,
  };
}

export default {
  applyScenarioConsequences,
  executeRecovery,
};
