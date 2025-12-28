// ============================================
// REALISTIC FINANCIAL MODEL
// ============================================
// Based on actual restaurant industry benchmarks
// Sources: National Restaurant Association, Toast POS data, BLS

/**
 * INDUSTRY BENCHMARKS (Real Data)
 * These are the targets new owners should learn
 */
export const INDUSTRY_BENCHMARKS = {
  // Prime Cost = Food + Labor (THE most important metric)
  primeCost: {
    target: 0.60, // 60% of revenue
    acceptable: 0.65, // 65% is okay
    danger: 0.70, // 70%+ means you're losing money
    // Real lesson: Every point over 60% comes directly from profit
  },

  // Food Cost (COGS)
  foodCost: {
    fastCasual: { min: 0.25, target: 0.30, max: 0.35 },
    casualDining: { min: 0.28, target: 0.32, max: 0.38 },
    fineDining: { min: 0.30, target: 0.35, max: 0.40 },
    // Real lesson: Fine dining has higher food cost but higher margins on drinks
  },

  // Labor Cost
  laborCost: {
    fastCasual: { min: 0.22, target: 0.25, max: 0.30 },
    casualDining: { min: 0.28, target: 0.32, max: 0.38 },
    fineDining: { min: 0.30, target: 0.35, max: 0.42 },
    // Real lesson: Labor is often higher than food cost
  },

  // Occupancy (Rent + CAM + Property Tax + Insurance)
  occupancy: {
    target: 0.08, // 8% of revenue
    max: 0.10, // 10% is high
    danger: 0.12, // 12%+ is crushing
    // Real lesson: A $5K/month rent needs $50K/month revenue just to hit 10%
  },

  // Net Profit Margin (REALISTIC - not the 20%+ the game currently gives)
  netProfit: {
    excellent: 0.15, // 15% - very rare, well-run operation
    good: 0.10, // 10% - solid performance
    acceptable: 0.05, // 5% - surviving
    breakEven: 0.02, // 2% - barely making it
    // Real lesson: Most restaurants make 3-5%, not 20%
  },

  // Breakeven timeline
  breakeven: {
    typical: 18, // months (not weeks!)
    fast: 12, // months - very successful
    slow: 24, // months - common
    // Real lesson: You need 18-24 months of runway, not 4 weeks
  },
};

/**
 * Full P&L structure (what new owners need to understand)
 */
export interface RestaurantPL {
  // Revenue
  revenue: {
    food: number;
    beverage: number; // Often 20-30% margin
    delivery: number; // Lower margin due to fees
    catering: number;
    merchandise: number;
    total: number;
  };

  // Cost of Goods Sold (COGS)
  cogs: {
    foodCost: number;
    beverageCost: number;
    paperGoods: number; // To-go containers, etc.
    total: number;
    percentage: number; // Should be 28-35%
  };

  // Gross Profit
  grossProfit: number;
  grossMargin: number; // Should be 65-72%

  // Labor
  labor: {
    wages: number;
    salaries: number; // Managers
    benefits: number;
    payrollTax: number; // ~8% of wages
    workerComp: number; // ~3-5% of wages
    total: number;
    percentage: number; // Should be 28-35%
  };

  // PRIME COST
  primeCost: number; // COGS + Labor
  primeCostPercentage: number; // THE KEY METRIC - should be < 60%

  // Operating Expenses
  operatingExpenses: {
    rent: number;
    cam: number; // Common Area Maintenance
    utilities: number;
    insurance: number;
    marketing: number;
    repairs: number;
    supplies: number; // Cleaning, smallwares
    technology: number; // POS, software
    credit_card_fees: number; // 2.5-3.5% of CC sales
    delivery_commissions: number; // 25-30% of delivery revenue
    professional_fees: number; // Accounting, legal
    licenses: number;
    miscellaneous: number;
    total: number;
    percentage: number; // Should be 20-25%
  };

  // EBITDA
  ebitda: number;
  ebitdaMargin: number; // Should be 10-15%

  // Below the line
  depreciation: number;
  interest: number;
  taxes: number;

  // NET PROFIT
  netProfit: number;
  netProfitMargin: number; // REALISTIC: 3-10%, not 20%+
}

/**
 * Calculate realistic weekly P&L
 */
export function calculateWeeklyPL(
  weeklyCovers: number,
  avgTicket: number,
  deliveryOrders: number,
  deliveryAvgTicket: number,
  menuFoodCostPct: number, // Based on actual menu engineering
  staffCosts: {
    hourlyWages: number; // Total weekly hourly wages
    salaries: number; // Manager salaries (weekly portion)
  },
  fixedCosts: {
    weeklyRent: number;
    weeklyUtilities: number;
    weeklyInsurance: number;
  },
  deliveryPlatformCommission: number = 0.27, // Average 27%
  creditCardRate: number = 0.028, // 2.8%
): RestaurantPL {
  // Revenue calculations
  const foodRevenue = weeklyCovers * avgTicket * 0.75; // 75% food
  const beverageRevenue = weeklyCovers * avgTicket * 0.25; // 25% bev
  const deliveryRevenueGross = deliveryOrders * deliveryAvgTicket;
  const deliveryRevenuNet = deliveryRevenueGross * (1 - deliveryPlatformCommission);

  const totalRevenue = foodRevenue + beverageRevenue + deliveryRevenuNet;

  // COGS
  const foodCost = foodRevenue * menuFoodCostPct;
  const beverageCost = beverageRevenue * 0.22; // Drinks have ~22% COGS
  const deliveryFoodCost = deliveryOrders * deliveryAvgTicket * menuFoodCostPct;
  const paperGoods = deliveryOrders * 0.75; // ~$0.75 per delivery in packaging

  const totalCogs = foodCost + beverageCost + deliveryFoodCost + paperGoods;
  const cogsPercentage = totalRevenue > 0 ? totalCogs / totalRevenue : 0;

  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

  // Labor (the silent killer)
  const wages = staffCosts.hourlyWages;
  const salaries = staffCosts.salaries;
  const payrollTax = (wages + salaries) * 0.0765; // Employer portion of FICA
  const workerComp = (wages + salaries) * 0.04; // ~4% for restaurants
  const benefits = salaries * 0.15; // Benefits typically for managers only

  const totalLabor = wages + salaries + payrollTax + workerComp + benefits;
  const laborPercentage = totalRevenue > 0 ? totalLabor / totalRevenue : 0;

  // PRIME COST (the most important number!)
  const primeCost = totalCogs + totalLabor;
  const primeCostPercentage = totalRevenue > 0 ? primeCost / totalRevenue : 0;

  // Operating Expenses
  const rent = fixedCosts.weeklyRent;
  const utilities = fixedCosts.weeklyUtilities;
  const insurance = fixedCosts.weeklyInsurance;
  const marketing = totalRevenue * 0.02; // 2% marketing
  const repairs = totalRevenue * 0.015; // 1.5% R&M
  const supplies = totalRevenue * 0.01; // 1% supplies
  const technology = 50; // ~$200/month for POS/software
  const creditCardFees = (foodRevenue + beverageRevenue) * 0.85 * creditCardRate; // 85% CC
  const deliveryCommissions = deliveryRevenueGross * deliveryPlatformCommission;
  const professionalFees = 75; // ~$300/month accounting
  const licenses = 25; // ~$100/month amortized
  const miscellaneous = totalRevenue * 0.01;

  const cam = rent * 0.15; // CAM typically 15% of rent

  const totalOpex = rent + cam + utilities + insurance + marketing + repairs +
                    supplies + technology + creditCardFees + deliveryCommissions +
                    professionalFees + licenses + miscellaneous;
  const opexPercentage = totalRevenue > 0 ? totalOpex / totalRevenue : 0;

  // EBITDA
  const ebitda = grossProfit - totalLabor - totalOpex + deliveryCommissions; // Add back delivery (already netted)
  const ebitdaMargin = totalRevenue > 0 ? ebitda / totalRevenue : 0;

  // Below the line
  const depreciation = 100; // ~$5K/year equipment depreciation
  const interest = 0; // Added if loans exist
  const taxes = Math.max(0, ebitda - depreciation - interest) * 0.25; // ~25% effective rate

  // NET PROFIT (the real number)
  const netProfit = ebitda - depreciation - interest - taxes;
  const netProfitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

  return {
    revenue: {
      food: foodRevenue,
      beverage: beverageRevenue,
      delivery: deliveryRevenuNet,
      catering: 0,
      merchandise: 0,
      total: totalRevenue,
    },
    cogs: {
      foodCost,
      beverageCost,
      paperGoods,
      total: totalCogs,
      percentage: cogsPercentage,
    },
    grossProfit,
    grossMargin,
    labor: {
      wages,
      salaries,
      benefits,
      payrollTax,
      workerComp,
      total: totalLabor,
      percentage: laborPercentage,
    },
    primeCost,
    primeCostPercentage,
    operatingExpenses: {
      rent,
      cam,
      utilities,
      insurance,
      marketing,
      repairs,
      supplies,
      technology,
      credit_card_fees: creditCardFees,
      delivery_commissions: deliveryCommissions,
      professional_fees: professionalFees,
      licenses,
      miscellaneous,
      total: totalOpex,
      percentage: opexPercentage,
    },
    ebitda,
    ebitdaMargin,
    depreciation,
    interest,
    taxes,
    netProfit,
    netProfitMargin,
  };
}

/**
 * Analyze P&L and provide educational feedback
 */
export function analyzePL(pl: RestaurantPL): PLAnalysis {
  const issues: PLIssue[] = [];
  const wins: string[] = [];

  // Prime Cost Analysis (THE MOST IMPORTANT)
  if (pl.primeCostPercentage > INDUSTRY_BENCHMARKS.primeCost.danger) {
    issues.push({
      category: 'prime_cost',
      severity: 'critical',
      metric: `${(pl.primeCostPercentage * 100).toFixed(1)}%`,
      target: '60%',
      message: 'Prime cost is critically high. You are likely losing money.',
      fix: 'Reduce portion sizes, renegotiate with suppliers, or cut labor hours.',
    });
  } else if (pl.primeCostPercentage > INDUSTRY_BENCHMARKS.primeCost.acceptable) {
    issues.push({
      category: 'prime_cost',
      severity: 'warning',
      metric: `${(pl.primeCostPercentage * 100).toFixed(1)}%`,
      target: '60%',
      message: 'Prime cost is high. Margins are thin.',
      fix: 'Look for waste in kitchen, optimize scheduling.',
    });
  } else if (pl.primeCostPercentage <= INDUSTRY_BENCHMARKS.primeCost.target) {
    wins.push(`Prime cost of ${(pl.primeCostPercentage * 100).toFixed(1)}% is excellent!`);
  }

  // Labor Analysis
  if (pl.labor.percentage > 0.38) {
    issues.push({
      category: 'labor',
      severity: 'warning',
      metric: `${(pl.labor.percentage * 100).toFixed(1)}%`,
      target: '28-35%',
      message: 'Labor cost is high for your revenue level.',
      fix: 'Review scheduling. Are you overstaffed during slow periods?',
    });
  }

  // Occupancy Analysis
  const occupancyPct = pl.revenue.total > 0
    ? (pl.operatingExpenses.rent + pl.operatingExpenses.cam +
       pl.operatingExpenses.insurance) / pl.revenue.total
    : 0;
  if (occupancyPct > INDUSTRY_BENCHMARKS.occupancy.danger) {
    issues.push({
      category: 'occupancy',
      severity: 'critical',
      metric: `${(occupancyPct * 100).toFixed(1)}%`,
      target: '8-10%',
      message: 'Rent is crushing your profitability.',
      fix: 'You need more revenue or a cheaper location. Renegotiate lease if possible.',
    });
  }

  // Net Profit Analysis
  if (pl.netProfitMargin < 0) {
    issues.push({
      category: 'net_profit',
      severity: 'critical',
      metric: `${(pl.netProfitMargin * 100).toFixed(1)}%`,
      target: '5-10%',
      message: 'You are losing money.',
      fix: 'Immediate action required: cut costs or increase prices.',
    });
  } else if (pl.netProfitMargin < INDUSTRY_BENCHMARKS.netProfit.breakEven) {
    issues.push({
      category: 'net_profit',
      severity: 'warning',
      metric: `${(pl.netProfitMargin * 100).toFixed(1)}%`,
      target: '5-10%',
      message: 'Profit margin is very thin. One bad month could put you under.',
      fix: 'Build cash reserves immediately. Look for easy efficiency gains.',
    });
  } else if (pl.netProfitMargin >= INDUSTRY_BENCHMARKS.netProfit.good) {
    wins.push(`Net profit margin of ${(pl.netProfitMargin * 100).toFixed(1)}% is strong!`);
  }

  // Overall grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (pl.netProfitMargin >= 0.12 && pl.primeCostPercentage <= 0.58) {
    grade = 'A';
  } else if (pl.netProfitMargin >= 0.08 && pl.primeCostPercentage <= 0.62) {
    grade = 'B';
  } else if (pl.netProfitMargin >= 0.04 && pl.primeCostPercentage <= 0.68) {
    grade = 'C';
  } else if (pl.netProfitMargin >= 0) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  return { issues, wins, grade };
}

export interface PLIssue {
  category: 'prime_cost' | 'food_cost' | 'labor' | 'occupancy' | 'net_profit';
  severity: 'info' | 'warning' | 'critical';
  metric: string;
  target: string;
  message: string;
  fix: string;
}

export interface PLAnalysis {
  issues: PLIssue[];
  wins: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Educational: Calculate break-even point
 */
export function calculateBreakEven(
  fixedCostsMonthly: number,
  avgTicket: number,
  foodCostPct: number,
  laborCostPct: number // Variable labor only
): { coversPerMonth: number; revenuePerMonth: number; coversPerWeek: number } {
  // Break-even formula:
  // Revenue needed = Fixed Costs / (1 - Variable Cost %)
  // Variable costs = Food Cost + Variable Labor

  const variableCostPct = foodCostPct + (laborCostPct * 0.5); // Only half of labor is truly variable
  const contributionMargin = 1 - variableCostPct;

  const revenuePerMonth = fixedCostsMonthly / contributionMargin;
  const coversPerMonth = revenuePerMonth / avgTicket;
  const coversPerWeek = coversPerMonth / 4;

  return { coversPerMonth, revenuePerMonth, coversPerWeek };
}
