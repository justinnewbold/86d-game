// ============================================
// MENU ENGINEERING SYSTEM
// ============================================
// The most overlooked skill for new restaurant owners:
// Understanding that 70% of profit comes from 20% of menu items

export interface MenuItem {
  id: string;
  name: string;
  category: 'appetizer' | 'entree' | 'side' | 'dessert' | 'beverage' | 'alcohol';
  price: number;

  // Cost breakdown (educational!)
  recipe: RecipeIngredient[];
  totalFoodCost: number;
  foodCostPercentage: number;

  // Sales data
  weeklyUnitsSold: number;
  popularityRank: number; // 1 = best seller

  // Calculated metrics
  contributionMargin: number; // price - food cost
  menuMix: number; // % of total items sold
  profitability: 'star' | 'puzzle' | 'plow_horse' | 'dog';

  // Flags
  isSignatureDish: boolean;
  is86d: boolean; // Currently unavailable
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: 'oz' | 'lb' | 'each' | 'cup' | 'tbsp';
  costPerUnit: number;
  totalCost: number;
  commodity?: string; // Links to commodity prices for dynamic updates
}

/**
 * Menu Engineering Matrix (Boston Consulting Group style)
 *
 *                  HIGH POPULARITY
 *                        |
 *    PLOW HORSES         |        STARS
 *    (high sales,        |   (high sales,
 *     low margin)        |    high margin)
 *                        |
 * -------- LOW MARGIN ---+--- HIGH MARGIN --------
 *                        |
 *    DOGS                |       PUZZLES
 *    (low sales,         |   (low sales,
 *     low margin)        |    high margin)
 *                        |
 *                  LOW POPULARITY
 */

export type MenuItemCategory = 'star' | 'puzzle' | 'plow_horse' | 'dog';

/**
 * Classify menu items into the engineering matrix
 */
export function classifyMenuItem(
  item: MenuItem,
  avgContributionMargin: number,
  avgMenuMix: number
): MenuItemCategory {
  const isHighMargin = item.contributionMargin >= avgContributionMargin;
  const isPopular = item.menuMix >= avgMenuMix;

  if (isHighMargin && isPopular) return 'star';
  if (isHighMargin && !isPopular) return 'puzzle';
  if (!isHighMargin && isPopular) return 'plow_horse';
  return 'dog';
}

/**
 * Analyze entire menu and provide recommendations
 */
export function analyzeMenu(items: MenuItem[]): MenuAnalysis {
  // Calculate averages
  const totalSold = items.reduce((sum, i) => sum + i.weeklyUnitsSold, 0);
  items.forEach(item => {
    item.menuMix = item.weeklyUnitsSold / totalSold;
    item.contributionMargin = item.price - item.totalFoodCost;
  });

  const avgContributionMargin = items.reduce((sum, i) => sum + i.contributionMargin, 0) / items.length;
  const avgMenuMix = 1 / items.length; // Equal share

  // Classify each item
  const classified = items.map(item => ({
    ...item,
    profitability: classifyMenuItem(item, avgContributionMargin, avgMenuMix),
  }));

  // Group by category
  const stars = classified.filter(i => i.profitability === 'star');
  const puzzles = classified.filter(i => i.profitability === 'puzzle');
  const plowHorses = classified.filter(i => i.profitability === 'plow_horse');
  const dogs = classified.filter(i => i.profitability === 'dog');

  // Calculate financial impact
  const totalContribution = classified.reduce(
    (sum, i) => sum + (i.contributionMargin * i.weeklyUnitsSold), 0
  );

  const starsContribution = stars.reduce(
    (sum, i) => sum + (i.contributionMargin * i.weeklyUnitsSold), 0
  );

  // Generate recommendations
  const recommendations: MenuRecommendation[] = [];

  // Star recommendations
  stars.forEach(item => {
    recommendations.push({
      item: item.name,
      category: 'star',
      action: 'maintain',
      reason: `${item.name} is a star - high margin (${((item.contributionMargin / item.price) * 100).toFixed(0)}%) and popular (${(item.menuMix * 100).toFixed(1)}% of sales)`,
      potentialImpact: 0,
      priority: 'low',
    });
  });

  // Puzzle recommendations (high margin, low sales - need promotion)
  puzzles.forEach(item => {
    const potentialUplift = item.contributionMargin * (avgMenuMix * totalSold - item.weeklyUnitsSold);
    recommendations.push({
      item: item.name,
      category: 'puzzle',
      action: 'promote',
      reason: `${item.name} has great margins (${((item.contributionMargin / item.price) * 100).toFixed(0)}%) but low sales. Promote it, train servers to upsell, or reposition on menu.`,
      potentialImpact: potentialUplift,
      priority: 'high',
    });
  });

  // Plow horse recommendations (popular but low margin - raise price or cut cost)
  plowHorses.forEach(item => {
    const priceIncrease = item.price * 0.10; // 10% increase
    const potentialUplift = priceIncrease * item.weeklyUnitsSold * 0.85; // Assume 15% sales drop
    recommendations.push({
      item: item.name,
      category: 'plow_horse',
      action: 'reprice',
      reason: `${item.name} sells well but margin is thin (${((item.contributionMargin / item.price) * 100).toFixed(0)}%). Consider a 10% price increase or reduce portion/cost.`,
      potentialImpact: potentialUplift,
      priority: 'medium',
    });
  });

  // Dog recommendations (remove or reimagine)
  dogs.forEach(item => {
    const costToKeep = item.totalFoodCost * item.weeklyUnitsSold * 0.1; // Waste estimate
    recommendations.push({
      item: item.name,
      category: 'dog',
      action: 'remove',
      reason: `${item.name} has low margin AND low sales. Consider removing to reduce complexity and waste.`,
      potentialImpact: costToKeep,
      priority: 'high',
    });
  });

  // Sort by priority and potential impact
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.potentialImpact - a.potentialImpact;
  });

  return {
    items: classified,
    summary: {
      totalItems: items.length,
      stars: stars.length,
      puzzles: puzzles.length,
      plowHorses: plowHorses.length,
      dogs: dogs.length,
      avgFoodCostPct: items.reduce((s, i) => s + i.foodCostPercentage, 0) / items.length,
      avgContributionMargin,
      totalWeeklyContribution: totalContribution,
      starsContributionPct: starsContribution / totalContribution,
    },
    recommendations,
    educationalInsights: generateInsights(classified, totalContribution, starsContribution),
  };
}

export interface MenuAnalysis {
  items: (MenuItem & { profitability: MenuItemCategory })[];
  summary: {
    totalItems: number;
    stars: number;
    puzzles: number;
    plowHorses: number;
    dogs: number;
    avgFoodCostPct: number;
    avgContributionMargin: number;
    totalWeeklyContribution: number;
    starsContributionPct: number;
  };
  recommendations: MenuRecommendation[];
  educationalInsights: string[];
}

export interface MenuRecommendation {
  item: string;
  category: MenuItemCategory;
  action: 'maintain' | 'promote' | 'reprice' | 'reduce_cost' | 'remove' | 'reimagine';
  reason: string;
  potentialImpact: number; // Weekly $ impact
  priority: 'high' | 'medium' | 'low';
}

function generateInsights(
  items: MenuItem[],
  totalContribution: number,
  starsContribution: number
): string[] {
  const insights: string[] = [];

  // Pareto principle check
  const topItems = [...items].sort((a, b) =>
    (b.contributionMargin * b.weeklyUnitsSold) - (a.contributionMargin * a.weeklyUnitsSold)
  );
  const top20Pct = Math.ceil(items.length * 0.2);
  const top20Contribution = topItems.slice(0, top20Pct).reduce(
    (sum, i) => sum + (i.contributionMargin * i.weeklyUnitsSold), 0
  );
  const top20PctOfProfit = top20Contribution / totalContribution;

  insights.push(
    `📊 Pareto Check: Your top ${top20Pct} items generate ${(top20PctOfProfit * 100).toFixed(0)}% of your contribution margin. ` +
    (top20PctOfProfit > 0.6 ? 'This concentration is normal.' : 'Consider focusing more on your best performers.')
  );

  // Food cost analysis
  const highCostItems = items.filter(i => i.foodCostPercentage > 0.35);
  if (highCostItems.length > 0) {
    insights.push(
      `⚠️ ${highCostItems.length} items have food cost above 35%: ${highCostItems.map(i => i.name).join(', ')}. ` +
      `Review recipes or increase prices.`
    );
  }

  // Stars vs Dogs ratio
  const stars = items.filter(i => i.profitability === 'star').length;
  const dogs = items.filter(i => i.profitability === 'dog').length;
  if (dogs > stars) {
    insights.push(
      `🐕 You have more Dogs (${dogs}) than Stars (${stars}). ` +
      `Consider trimming your menu - fewer items done well beats many items done poorly.`
    );
  }

  // Pricing opportunity
  const plowHorses = items.filter(i => i.profitability === 'plow_horse');
  if (plowHorses.length > 0) {
    const plowHorseRevenue = plowHorses.reduce((s, i) => s + (i.price * i.weeklyUnitsSold), 0);
    const potentialIncrease = plowHorseRevenue * 0.08; // 8% price increase
    insights.push(
      `💰 Your Plow Horses (popular but low-margin) represent $${plowHorseRevenue.toLocaleString()}/week in sales. ` +
      `A modest 8% price increase could add $${potentialIncrease.toLocaleString()}/week to your bottom line.`
    );
  }

  return insights;
}

/**
 * Calculate the true cost of a recipe
 */
export function calculateRecipeCost(ingredients: RecipeIngredient[]): {
  totalCost: number;
  breakdown: { ingredient: string; cost: number; pct: number }[];
  largestCostDriver: string;
} {
  const totalCost = ingredients.reduce((sum, i) => sum + i.totalCost, 0);

  const breakdown = ingredients.map(i => ({
    ingredient: i.name,
    cost: i.totalCost,
    pct: i.totalCost / totalCost,
  })).sort((a, b) => b.cost - a.cost);

  return {
    totalCost,
    breakdown,
    largestCostDriver: breakdown[0]?.ingredient || 'None',
  };
}

/**
 * Suggest price based on target food cost percentage
 */
export function suggestPrice(
  totalFoodCost: number,
  targetFoodCostPct: number,
  competitorPrice?: number
): {
  suggestedPrice: number;
  atTargetMargin: number;
  vsCompetitor?: string;
} {
  const suggestedPrice = totalFoodCost / targetFoodCostPct;
  const roundedPrice = Math.ceil(suggestedPrice) - 0.01; // $X.99 pricing

  let vsCompetitor: string | undefined;
  if (competitorPrice) {
    const diff = roundedPrice - competitorPrice;
    if (diff > 2) {
      vsCompetitor = `$${diff.toFixed(2)} higher than competitor - ensure quality justifies premium`;
    } else if (diff < -2) {
      vsCompetitor = `$${Math.abs(diff).toFixed(2)} lower than competitor - you have room to increase`;
    } else {
      vsCompetitor = 'Competitively priced';
    }
  }

  return {
    suggestedPrice: roundedPrice,
    atTargetMargin: (roundedPrice - totalFoodCost) / roundedPrice,
    vsCompetitor,
  };
}

/**
 * Educational: Why menu engineering matters
 */
export const MENU_ENGINEERING_LESSONS = [
  {
    title: "The 70/20 Rule",
    lesson: "In most restaurants, 70% of profit comes from just 20% of menu items. Know your stars.",
  },
  {
    title: "Dogs Are Expensive",
    lesson: "Low-selling items waste inventory, create prep complexity, and slow down the kitchen. Cut them.",
  },
  {
    title: "Plow Horses Are Hidden Opportunities",
    lesson: "Your most popular items with thin margins are often underpriced. A $1 increase on a dish you sell 100/week = $5,200/year.",
  },
  {
    title: "Puzzles Need Love",
    lesson: "High-margin items that don't sell well often just need better placement, server training, or a name change.",
  },
  {
    title: "Menu Psychology",
    lesson: "Items in boxes sell 20% more. Items at the top right of menus get 3x more attention. Use this for your Stars.",
  },
  {
    title: "The Decoy Effect",
    lesson: "A $45 steak makes a $32 steak look reasonable. Your most expensive item often sells your second-most expensive.",
  },
  {
    title: "Description Matters",
    lesson: "Descriptive menu labels increase sales 27%. 'Grandma's Slow-Braised Short Ribs' outsells 'Short Ribs'.",
  },
  {
    title: "Smaller Menus Win",
    lesson: "The Cheesecake Factory is an exception, not a rule. Most successful restaurants have 20-30 items, not 100.",
  },
];
