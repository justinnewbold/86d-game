// ============================================
// EQUIPMENT LIFECYCLE MANAGEMENT SYSTEM
// ============================================
// Track equipment depreciation, maintenance, and failures
// Teaches capital planning and asset management

import type { Location } from '../types/game';

/**
 * Equipment item with lifecycle tracking
 */
export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  // Purchase info
  purchasePrice: number;
  purchaseWeek: number;
  purchaseType: 'bought' | 'leased' | 'used';
  // Current state
  currentValue: number;
  condition: number; // 0-100
  hoursUsed: number;
  // Lifecycle
  expectedLifespan: number; // weeks
  maintenanceSchedule: number; // weeks between maintenance
  lastMaintenance: number; // week
  // Risk
  breakdownRisk: number; // 0-100
  criticalToOperations: boolean;
  // If leased
  leaseDetails?: LeaseDetails;
}

export type EquipmentCategory =
  | 'cooking'      // Ovens, ranges, fryers
  | 'refrigeration' // Walk-ins, reach-ins, freezers
  | 'prep'         // Mixers, slicers, processors
  | 'dishwashing'  // Dishwashers, sinks
  | 'pos'          // Registers, tablets, printers
  | 'hvac'         // AC, ventilation, hoods
  | 'furniture'    // Tables, chairs, booths
  | 'smallwares';  // Pots, pans, utensils

export interface LeaseDetails {
  monthlyPayment: number;
  totalMonths: number;
  monthsRemaining: number;
  buyoutOption: number;
  includesMaintenance: boolean;
}

export interface MaintenanceRecord {
  equipmentId: string;
  week: number;
  type: 'scheduled' | 'emergency' | 'repair';
  cost: number;
  description: string;
  downtimeHours: number;
}

export interface EquipmentBreakdown {
  equipmentId: string;
  equipment: Equipment;
  week: number;
  severity: 'minor' | 'major' | 'critical';
  estimatedRepairCost: number;
  estimatedDowntime: number; // hours
  revenueImpact: number;
  options: RepairOption[];
}

export interface RepairOption {
  id: string;
  description: string;
  cost: number;
  timeToFix: number; // hours
  qualityAfterRepair: number; // 0-100
  warranty?: number; // weeks
}

export interface EquipmentState {
  inventory: Equipment[];
  maintenanceHistory: MaintenanceRecord[];
  totalAssetValue: number;
  totalWeeklyDepreciation: number;
  totalWeeklyMaintenance: number;
  scheduledMaintenance: { equipment: Equipment; weeksUntil: number }[];
  atRiskEquipment: Equipment[];
}

// ============================================
// EQUIPMENT CATALOG
// ============================================

export interface EquipmentSpec {
  name: string;
  category: EquipmentCategory;
  newPrice: number;
  usedPrice: number;
  leaseMonthly: number;
  lifespanWeeks: number;
  maintenanceIntervalWeeks: number;
  avgMaintenanceCost: number;
  critical: boolean;
  description: string;
}

export const EQUIPMENT_CATALOG: Record<string, EquipmentSpec> = {
  // Cooking
  commercial_range: {
    name: 'Commercial Range (6-burner)',
    category: 'cooking',
    newPrice: 8000,
    usedPrice: 4000,
    leaseMonthly: 250,
    lifespanWeeks: 520, // 10 years
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 300,
    critical: true,
    description: 'Heart of the kitchen. Failure shuts down service.',
  },
  commercial_oven: {
    name: 'Commercial Convection Oven',
    category: 'cooking',
    newPrice: 12000,
    usedPrice: 6000,
    leaseMonthly: 350,
    lifespanWeeks: 520,
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 400,
    critical: true,
    description: 'Essential for most menu items.',
  },
  deep_fryer: {
    name: 'Commercial Deep Fryer',
    category: 'cooking',
    newPrice: 3500,
    usedPrice: 1500,
    leaseMonthly: 100,
    lifespanWeeks: 312, // 6 years
    maintenanceIntervalWeeks: 13,
    avgMaintenanceCost: 150,
    critical: false,
    description: 'Needed for fried items. Can survive brief outage.',
  },
  flat_top_grill: {
    name: 'Flat Top Grill',
    category: 'cooking',
    newPrice: 5000,
    usedPrice: 2500,
    leaseMonthly: 150,
    lifespanWeeks: 416, // 8 years
    maintenanceIntervalWeeks: 13,
    avgMaintenanceCost: 200,
    critical: true,
    description: 'Critical for breakfast and burger concepts.',
  },

  // Refrigeration
  walk_in_cooler: {
    name: 'Walk-in Cooler',
    category: 'refrigeration',
    newPrice: 15000,
    usedPrice: 7000,
    leaseMonthly: 450,
    lifespanWeeks: 780, // 15 years
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 500,
    critical: true,
    description: 'Failure means massive food loss. Must have backup plan.',
  },
  walk_in_freezer: {
    name: 'Walk-in Freezer',
    category: 'refrigeration',
    newPrice: 18000,
    usedPrice: 8000,
    leaseMonthly: 550,
    lifespanWeeks: 780,
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 600,
    critical: true,
    description: 'Frozen inventory at risk if this fails.',
  },
  reach_in_refrigerator: {
    name: 'Reach-in Refrigerator',
    category: 'refrigeration',
    newPrice: 4000,
    usedPrice: 2000,
    leaseMonthly: 120,
    lifespanWeeks: 520,
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 250,
    critical: false,
    description: 'Line-level cold storage.',
  },

  // Prep
  commercial_mixer: {
    name: 'Commercial Stand Mixer',
    category: 'prep',
    newPrice: 3000,
    usedPrice: 1500,
    leaseMonthly: 90,
    lifespanWeeks: 520,
    maintenanceIntervalWeeks: 52,
    avgMaintenanceCost: 150,
    critical: false,
    description: 'Essential for bakery, useful for others.',
  },
  food_processor: {
    name: 'Commercial Food Processor',
    category: 'prep',
    newPrice: 1500,
    usedPrice: 700,
    leaseMonthly: 45,
    lifespanWeeks: 260,
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 100,
    critical: false,
    description: 'Speeds up prep significantly.',
  },
  meat_slicer: {
    name: 'Commercial Meat Slicer',
    category: 'prep',
    newPrice: 2000,
    usedPrice: 900,
    leaseMonthly: 60,
    lifespanWeeks: 416,
    maintenanceIntervalWeeks: 13,
    avgMaintenanceCost: 120,
    critical: false,
    description: 'Required for deli operations.',
  },

  // Dishwashing
  commercial_dishwasher: {
    name: 'Commercial Dishwasher',
    category: 'dishwashing',
    newPrice: 8000,
    usedPrice: 4000,
    leaseMonthly: 250,
    lifespanWeeks: 416,
    maintenanceIntervalWeeks: 13,
    avgMaintenanceCost: 300,
    critical: true,
    description: 'Failure means hand-washing or shutting down.',
  },
  three_compartment_sink: {
    name: '3-Compartment Sink',
    category: 'dishwashing',
    newPrice: 2500,
    usedPrice: 1200,
    leaseMonthly: 0, // Usually bought
    lifespanWeeks: 1040, // 20 years
    maintenanceIntervalWeeks: 52,
    avgMaintenanceCost: 100,
    critical: true,
    description: 'Health code requirement. Backup for dishwasher.',
  },

  // POS
  pos_system: {
    name: 'POS System (Complete)',
    category: 'pos',
    newPrice: 5000,
    usedPrice: 2000,
    leaseMonthly: 150,
    lifespanWeeks: 260, // 5 years
    maintenanceIntervalWeeks: 52,
    avgMaintenanceCost: 200,
    critical: true,
    description: 'Can take orders manually but hurts efficiency badly.',
  },
  kitchen_display: {
    name: 'Kitchen Display System',
    category: 'pos',
    newPrice: 2000,
    usedPrice: 800,
    leaseMonthly: 60,
    lifespanWeeks: 260,
    maintenanceIntervalWeeks: 52,
    avgMaintenanceCost: 100,
    critical: false,
    description: 'Can use paper tickets as backup.',
  },

  // HVAC
  hood_system: {
    name: 'Exhaust Hood System',
    category: 'hvac',
    newPrice: 20000,
    usedPrice: 10000,
    leaseMonthly: 600,
    lifespanWeeks: 780,
    maintenanceIntervalWeeks: 13,
    avgMaintenanceCost: 400,
    critical: true,
    description: 'Fire code requirement. No hood = no cooking.',
  },
  hvac_unit: {
    name: 'HVAC System',
    category: 'hvac',
    newPrice: 15000,
    usedPrice: 7000,
    leaseMonthly: 450,
    lifespanWeeks: 780,
    maintenanceIntervalWeeks: 26,
    avgMaintenanceCost: 500,
    critical: false,
    description: 'Customer comfort. Can survive briefly in mild weather.',
  },
};

// ============================================
// EQUIPMENT FUNCTIONS
// ============================================

/**
 * Initialize equipment state
 */
export function initializeEquipmentState(): EquipmentState {
  return {
    inventory: [],
    maintenanceHistory: [],
    totalAssetValue: 0,
    totalWeeklyDepreciation: 0,
    totalWeeklyMaintenance: 0,
    scheduledMaintenance: [],
    atRiskEquipment: [],
  };
}

/**
 * Purchase new equipment
 */
export function purchaseEquipment(
  state: EquipmentState,
  specKey: string,
  purchaseType: 'bought' | 'leased' | 'used',
  currentWeek: number
): { newState: EquipmentState; equipment: Equipment; cost: number } {
  const spec = EQUIPMENT_CATALOG[specKey];
  if (!spec) throw new Error(`Unknown equipment: ${specKey}`);

  let cost = 0;
  let value = 0;
  let leaseDetails: LeaseDetails | undefined;

  if (purchaseType === 'bought') {
    cost = spec.newPrice;
    value = spec.newPrice;
  } else if (purchaseType === 'used') {
    cost = spec.usedPrice;
    value = spec.usedPrice;
  } else if (purchaseType === 'leased') {
    cost = spec.leaseMonthly; // First month
    value = 0; // Leased equipment isn't an asset
    leaseDetails = {
      monthlyPayment: spec.leaseMonthly,
      totalMonths: 48,
      monthsRemaining: 48,
      buyoutOption: spec.newPrice * 0.1,
      includesMaintenance: false,
    };
  }

  const equipment: Equipment = {
    id: `${specKey}-${Date.now()}`,
    name: spec.name,
    category: spec.category,
    purchasePrice: purchaseType === 'leased' ? 0 : cost,
    purchaseWeek: currentWeek,
    purchaseType,
    currentValue: value,
    condition: purchaseType === 'used' ? 70 : 100,
    hoursUsed: purchaseType === 'used' ? 2000 : 0,
    expectedLifespan: spec.lifespanWeeks,
    maintenanceSchedule: spec.maintenanceIntervalWeeks,
    lastMaintenance: currentWeek,
    breakdownRisk: purchaseType === 'used' ? 10 : 2,
    criticalToOperations: spec.critical,
    leaseDetails,
  };

  const newInventory = [...state.inventory, equipment];

  return {
    newState: {
      ...state,
      inventory: newInventory,
      totalAssetValue: state.totalAssetValue + value,
    },
    equipment,
    cost,
  };
}

/**
 * Calculate weekly depreciation
 */
export function calculateDepreciation(equipment: Equipment): number {
  if (equipment.purchaseType === 'leased') return 0;

  // Straight-line depreciation
  const weeklyDepreciation = equipment.purchasePrice / equipment.expectedLifespan;
  return weeklyDepreciation;
}

/**
 * Process a week of equipment wear
 */
export function processEquipmentWeek(
  state: EquipmentState,
  currentWeek: number,
  hoursOperated: number = 60 // Default restaurant hours per week
): {
  newState: EquipmentState;
  depreciation: number;
  breakdowns: EquipmentBreakdown[];
  maintenanceDue: Equipment[];
  leasePayments: number;
} {
  const newState = { ...state };
  newState.inventory = [];

  let totalDepreciation = 0;
  let leasePayments = 0;
  const breakdowns: EquipmentBreakdown[] = [];
  const maintenanceDue: Equipment[] = [];

  for (const equipment of state.inventory) {
    const updated = { ...equipment };

    // Age the equipment
    updated.hoursUsed += hoursOperated;

    // Depreciate
    const depreciation = calculateDepreciation(updated);
    updated.currentValue = Math.max(0, updated.currentValue - depreciation);
    totalDepreciation += depreciation;

    // Condition degrades
    const ageRatio = (currentWeek - updated.purchaseWeek) / updated.expectedLifespan;
    const conditionLoss = 0.2 + (ageRatio * 0.3); // 0.2-0.5 per week
    updated.condition = Math.max(10, updated.condition - conditionLoss);

    // Update breakdown risk
    const maintenanceOverdue = (currentWeek - updated.lastMaintenance) > updated.maintenanceSchedule;
    const conditionRisk = (100 - updated.condition) / 2;
    const ageRisk = ageRatio * 20;
    const overdueRisk = maintenanceOverdue ? 15 : 0;
    updated.breakdownRisk = Math.min(80, conditionRisk + ageRisk + overdueRisk);

    // Check for breakdown
    if (Math.random() * 100 < updated.breakdownRisk / 10) {
      const breakdown = generateBreakdown(updated, currentWeek);
      breakdowns.push(breakdown);
    }

    // Check for maintenance due
    if (currentWeek - updated.lastMaintenance >= updated.maintenanceSchedule) {
      maintenanceDue.push(updated);
    }

    // Handle lease payments (monthly)
    if (updated.leaseDetails && currentWeek % 4 === 0) {
      leasePayments += updated.leaseDetails.monthlyPayment;
      updated.leaseDetails = {
        ...updated.leaseDetails,
        monthsRemaining: updated.leaseDetails.monthsRemaining - 1,
      };
    }

    newState.inventory.push(updated);
  }

  // Update state totals
  newState.totalWeeklyDepreciation = totalDepreciation;
  newState.totalAssetValue = newState.inventory.reduce((sum, e) => sum + e.currentValue, 0);
  newState.scheduledMaintenance = maintenanceDue.map(e => ({
    equipment: e,
    weeksUntil: Math.max(0, e.maintenanceSchedule - (currentWeek - e.lastMaintenance)),
  }));
  newState.atRiskEquipment = newState.inventory.filter(e => e.breakdownRisk > 30);

  return {
    newState,
    depreciation: totalDepreciation,
    breakdowns,
    maintenanceDue,
    leasePayments,
  };
}

/**
 * Generate a breakdown event
 */
function generateBreakdown(equipment: Equipment, week: number): EquipmentBreakdown {
  // Severity based on condition
  let severity: 'minor' | 'major' | 'critical';
  if (equipment.condition > 60) {
    severity = 'minor';
  } else if (equipment.condition > 30) {
    severity = 'major';
  } else {
    severity = 'critical';
  }

  const baseRepairCost = EQUIPMENT_CATALOG[equipment.id.split('-')[0]]?.avgMaintenanceCost || 500;
  const severityMultiplier = severity === 'minor' ? 1 : severity === 'major' ? 2.5 : 5;

  const estimatedRepairCost = Math.round(baseRepairCost * severityMultiplier);
  const estimatedDowntime = severity === 'minor' ? 2 : severity === 'major' ? 8 : 24;

  // Revenue impact
  const hourlyRevenue = 150; // Approximate
  let revenueImpact = 0;
  if (equipment.criticalToOperations) {
    revenueImpact = estimatedDowntime * hourlyRevenue;
  } else {
    revenueImpact = estimatedDowntime * hourlyRevenue * 0.2; // Partial impact
  }

  const options: RepairOption[] = [
    {
      id: 'quick-fix',
      description: 'Quick temporary fix',
      cost: Math.round(estimatedRepairCost * 0.3),
      timeToFix: Math.round(estimatedDowntime * 0.3),
      qualityAfterRepair: Math.min(100, equipment.condition + 10),
      warranty: 4,
    },
    {
      id: 'standard-repair',
      description: 'Standard repair by technician',
      cost: estimatedRepairCost,
      timeToFix: estimatedDowntime,
      qualityAfterRepair: Math.min(100, equipment.condition + 25),
      warranty: 13,
    },
    {
      id: 'full-refurbish',
      description: 'Complete refurbishment',
      cost: Math.round(estimatedRepairCost * 2),
      timeToFix: Math.round(estimatedDowntime * 1.5),
      qualityAfterRepair: 90,
      warranty: 52,
    },
  ];

  // Add replacement option for critical failures
  if (severity === 'critical') {
    const spec = EQUIPMENT_CATALOG[equipment.id.split('-')[0]];
    if (spec) {
      options.push({
        id: 'replace',
        description: 'Replace with new equipment',
        cost: spec.newPrice,
        timeToFix: 48, // Delivery time
        qualityAfterRepair: 100,
        warranty: 52,
      });
    }
  }

  return {
    equipmentId: equipment.id,
    equipment,
    week,
    severity,
    estimatedRepairCost,
    estimatedDowntime,
    revenueImpact,
    options,
  };
}

/**
 * Perform maintenance on equipment
 */
export function performMaintenance(
  state: EquipmentState,
  equipmentId: string,
  currentWeek: number
): { newState: EquipmentState; cost: number; conditionImproved: number } {
  const equipmentIndex = state.inventory.findIndex(e => e.id === equipmentId);
  if (equipmentIndex === -1) throw new Error('Equipment not found');

  const equipment = state.inventory[equipmentIndex];
  const spec = EQUIPMENT_CATALOG[equipment.id.split('-')[0]];
  const cost = spec?.avgMaintenanceCost || 200;

  const conditionBefore = equipment.condition;
  const conditionImproved = Math.min(100 - equipment.condition, 15);

  const updatedEquipment: Equipment = {
    ...equipment,
    lastMaintenance: currentWeek,
    condition: Math.min(100, equipment.condition + conditionImproved),
    breakdownRisk: Math.max(2, equipment.breakdownRisk - 10),
  };

  const newInventory = [...state.inventory];
  newInventory[equipmentIndex] = updatedEquipment;

  const maintenanceRecord: MaintenanceRecord = {
    equipmentId,
    week: currentWeek,
    type: 'scheduled',
    cost,
    description: `Scheduled maintenance for ${equipment.name}`,
    downtimeHours: 2,
  };

  return {
    newState: {
      ...state,
      inventory: newInventory,
      maintenanceHistory: [...state.maintenanceHistory, maintenanceRecord],
    },
    cost,
    conditionImproved,
  };
}

/**
 * Repair a breakdown
 */
export function repairBreakdown(
  state: EquipmentState,
  breakdown: EquipmentBreakdown,
  optionId: string,
  currentWeek: number
): { newState: EquipmentState; cost: number; downtimeHours: number } {
  const option = breakdown.options.find(o => o.id === optionId);
  if (!option) throw new Error('Invalid repair option');

  const equipmentIndex = state.inventory.findIndex(e => e.id === breakdown.equipmentId);
  if (equipmentIndex === -1) throw new Error('Equipment not found');

  let newInventory = [...state.inventory];

  if (optionId === 'replace') {
    // Remove old equipment
    newInventory = newInventory.filter(e => e.id !== breakdown.equipmentId);
    // Add new (handled separately via purchaseEquipment)
  } else {
    const updatedEquipment: Equipment = {
      ...state.inventory[equipmentIndex],
      condition: option.qualityAfterRepair,
      lastMaintenance: currentWeek,
      breakdownRisk: Math.max(5, state.inventory[equipmentIndex].breakdownRisk - 20),
    };
    newInventory[equipmentIndex] = updatedEquipment;
  }

  const maintenanceRecord: MaintenanceRecord = {
    equipmentId: breakdown.equipmentId,
    week: currentWeek,
    type: 'emergency',
    cost: option.cost,
    description: `Emergency repair: ${option.description}`,
    downtimeHours: option.timeToFix,
  };

  return {
    newState: {
      ...state,
      inventory: newInventory,
      maintenanceHistory: [...state.maintenanceHistory, maintenanceRecord],
    },
    cost: option.cost,
    downtimeHours: option.timeToFix,
  };
}

/**
 * Analyze lease vs buy decision
 */
export function analyzeLeaseVsBuy(
  specKey: string,
  yearsToAnalyze: number = 5
): {
  buyTotal: number;
  leaseTotal: number;
  buyResidualValue: number;
  recommendation: 'buy' | 'lease' | 'used';
  reasoning: string;
} {
  const spec = EQUIPMENT_CATALOG[specKey];
  if (!spec) throw new Error('Unknown equipment');

  const weeks = yearsToAnalyze * 52;
  const months = yearsToAnalyze * 12;

  // Buy new calculation
  const maintenanceCount = Math.floor(weeks / spec.maintenanceIntervalWeeks);
  const buyTotal = spec.newPrice + (maintenanceCount * spec.avgMaintenanceCost);
  const depreciationRate = spec.newPrice / spec.lifespanWeeks;
  const buyResidualValue = Math.max(0, spec.newPrice - (weeks * depreciationRate));

  // Lease calculation
  const leaseTotal = months * spec.leaseMonthly;

  // Used calculation
  const usedTotal = spec.usedPrice + (maintenanceCount * spec.avgMaintenanceCost * 1.3); // Higher maintenance

  // Net cost comparison
  const buyNetCost = buyTotal - buyResidualValue;

  let recommendation: 'buy' | 'lease' | 'used';
  let reasoning: string;

  if (buyNetCost < leaseTotal && buyNetCost < usedTotal) {
    recommendation = 'buy';
    reasoning = `Buying new has the lowest net cost over ${yearsToAnalyze} years after accounting for residual value.`;
  } else if (leaseTotal < usedTotal) {
    recommendation = 'lease';
    reasoning = `Leasing preserves cash flow and may include maintenance. Better if uncertain about long-term needs.`;
  } else {
    recommendation = 'used';
    reasoning = `Buying used offers the best value if you can inspect thoroughly and accept higher maintenance costs.`;
  }

  return {
    buyTotal,
    leaseTotal,
    buyResidualValue,
    recommendation,
    reasoning,
  };
}

/**
 * Get equipment health report
 */
export function generateEquipmentReport(state: EquipmentState): {
  summary: string;
  totalValue: number;
  weeklyMaintenance: number;
  atRiskCount: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];

  // Check for at-risk equipment
  for (const eq of state.atRiskEquipment) {
    if (eq.criticalToOperations) {
      recommendations.push(`URGENT: ${eq.name} has ${eq.breakdownRisk.toFixed(0)}% breakdown risk. Schedule maintenance immediately.`);
    }
  }

  // Check for overdue maintenance
  for (const scheduled of state.scheduledMaintenance) {
    if (scheduled.weeksUntil <= 0) {
      recommendations.push(`${scheduled.equipment.name} is overdue for maintenance.`);
    }
  }

  // Check lease expirations
  for (const eq of state.inventory) {
    if (eq.leaseDetails && eq.leaseDetails.monthsRemaining <= 3) {
      recommendations.push(`Lease for ${eq.name} expires in ${eq.leaseDetails.monthsRemaining} months. Plan for renewal or replacement.`);
    }
  }

  // Check for aging equipment
  const agingEquipment = state.inventory.filter(eq => eq.condition < 50);
  if (agingEquipment.length > 0) {
    recommendations.push(`${agingEquipment.length} pieces of equipment are below 50% condition. Budget for replacements.`);
  }

  return {
    summary: `${state.inventory.length} pieces of equipment worth $${state.totalAssetValue.toLocaleString()}`,
    totalValue: state.totalAssetValue,
    weeklyMaintenance: state.totalWeeklyMaintenance,
    atRiskCount: state.atRiskEquipment.length,
    recommendations,
  };
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

export const EQUIPMENT_LESSONS = {
  overview: `
Equipment is a hidden cost killer for new restaurant owners:

DEPRECIATION:
- Equipment loses value every day
- A $10,000 oven becomes worthless in 10 years
- Budget for replacement BEFORE equipment dies

MAINTENANCE:
- Preventive maintenance is cheaper than emergency repairs
- A $300 scheduled service beats a $2,000 emergency call
- Downtime during service = lost revenue

LEASE VS BUY:
- Leasing preserves cash but costs more long-term
- Buying builds equity but ties up capital
- Used equipment saves money but has higher risk

CRITICAL EQUIPMENT:
- Some equipment is essential (no hood = no cooking)
- Have backup plans for critical failures
- Consider redundancy for essential items
  `,

  budgeting: `
How to budget for equipment:

RULE OF THUMB:
- Set aside 3-5% of revenue for equipment maintenance
- Budget for 1 major repair per quarter
- Plan major replacements 1-2 years ahead

CAPITAL RESERVE:
- Keep $5-10K available for emergency replacements
- The walk-in always dies on the busiest weekend

DEPRECIATION SCHEDULE:
- Track equipment age and condition
- Replace before failure when possible
- Fire sales for urgent replacements cost you money
  `,
};

export default {
  EQUIPMENT_CATALOG,
  initializeEquipmentState,
  purchaseEquipment,
  calculateDepreciation,
  processEquipmentWeek,
  performMaintenance,
  repairBreakdown,
  analyzeLeaseVsBuy,
  generateEquipmentReport,
  EQUIPMENT_LESSONS,
};
