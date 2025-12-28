// ============================================
// SUPPLIER RELATIONSHIP SYSTEM
// ============================================
// Manages vendor relationships, pricing, and payment terms
// Educational: Teaches that payment terms affect cash flow as much as price

/**
 * Supplier/vendor in the supply chain
 */
export interface Supplier {
  id: string;
  name: string;
  type: 'broadline' | 'specialty' | 'local' | 'direct';
  category: 'produce' | 'protein' | 'dairy' | 'dry_goods' | 'beverages' | 'equipment' | 'supplies';

  // Pricing
  priceMultiplier: number; // vs market average (1.0 = average)
  minimumOrder: number;
  deliveryFee: number;

  // Payment terms
  paymentTerms: 'COD' | 'Net15' | 'Net30' | 'Net45';
  creditLimit: number;

  // Relationship
  relationshipScore: number; // 0-100
  weeksAsCustomer: number;
  onTimePayments: number;
  latePayments: number;

  // Reliability
  reliability: number; // 0-100, affects out-of-stock risk
  qualityRating: number; // 0-100
  deliveryDays: string[]; // e.g., ['mon', 'wed', 'fri']

  // Current status
  currentBalance: number;
  lastOrderWeek: number;
  isPreferred: boolean;
}

/**
 * Order placed with a supplier
 */
export interface SupplierOrder {
  id: string;
  supplierId: string;
  orderWeek: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  dueWeek: number; // When payment is due
  isPaid: boolean;
  isDelivered: boolean;
}

export interface OrderItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

/**
 * Commodity with current market price
 */
export interface Commodity {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  priceChange30d: number; // percentage
  volatility: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'falling';
}

// Sample suppliers
export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sysco',
    name: 'Sysco Foods',
    type: 'broadline',
    category: 'dry_goods',
    priceMultiplier: 1.0,
    minimumOrder: 500,
    deliveryFee: 0,
    paymentTerms: 'Net30',
    creditLimit: 25000,
    relationshipScore: 50,
    weeksAsCustomer: 0,
    onTimePayments: 0,
    latePayments: 0,
    reliability: 95,
    qualityRating: 75,
    deliveryDays: ['tue', 'fri'],
    currentBalance: 0,
    lastOrderWeek: 0,
    isPreferred: false,
  },
  {
    id: 'usfoods',
    name: 'US Foods',
    type: 'broadline',
    category: 'protein',
    priceMultiplier: 0.98,
    minimumOrder: 400,
    deliveryFee: 0,
    paymentTerms: 'Net30',
    creditLimit: 20000,
    relationshipScore: 50,
    weeksAsCustomer: 0,
    onTimePayments: 0,
    latePayments: 0,
    reliability: 93,
    qualityRating: 78,
    deliveryDays: ['mon', 'wed', 'fri'],
    currentBalance: 0,
    lastOrderWeek: 0,
    isPreferred: false,
  },
  {
    id: 'localfarms',
    name: 'Local Farms Co-op',
    type: 'local',
    category: 'produce',
    priceMultiplier: 1.15, // Premium for local
    minimumOrder: 100,
    deliveryFee: 25,
    paymentTerms: 'COD',
    creditLimit: 0,
    relationshipScore: 50,
    weeksAsCustomer: 0,
    onTimePayments: 0,
    latePayments: 0,
    reliability: 80,
    qualityRating: 95,
    deliveryDays: ['wed', 'sat'],
    currentBalance: 0,
    lastOrderWeek: 0,
    isPreferred: false,
  },
  {
    id: 'premiummeats',
    name: 'Premium Meats Direct',
    type: 'specialty',
    category: 'protein',
    priceMultiplier: 1.25,
    minimumOrder: 200,
    deliveryFee: 35,
    paymentTerms: 'Net15',
    creditLimit: 10000,
    relationshipScore: 50,
    weeksAsCustomer: 0,
    onTimePayments: 0,
    latePayments: 0,
    reliability: 90,
    qualityRating: 98,
    deliveryDays: ['tue', 'thu'],
    currentBalance: 0,
    lastOrderWeek: 0,
    isPreferred: false,
  },
  {
    id: 'discountfoods',
    name: 'Discount Food Supply',
    type: 'broadline',
    category: 'dry_goods',
    priceMultiplier: 0.85,
    minimumOrder: 750,
    deliveryFee: 50,
    paymentTerms: 'COD',
    creditLimit: 0,
    relationshipScore: 50,
    weeksAsCustomer: 0,
    onTimePayments: 0,
    latePayments: 0,
    reliability: 70,
    qualityRating: 60,
    deliveryDays: ['thu'],
    currentBalance: 0,
    lastOrderWeek: 0,
    isPreferred: false,
  },
];

// Commodity prices with fluctuations
export const COMMODITIES: Commodity[] = [
  { id: 'beef', name: 'Beef (Choice)', category: 'protein', basePrice: 6.50, currentPrice: 6.50, priceChange30d: 0.05, volatility: 'high', trend: 'rising' },
  { id: 'chicken', name: 'Chicken (Whole)', category: 'protein', basePrice: 2.10, currentPrice: 2.10, priceChange30d: -0.02, volatility: 'medium', trend: 'stable' },
  { id: 'pork', name: 'Pork (Loin)', category: 'protein', basePrice: 4.20, currentPrice: 4.20, priceChange30d: 0.03, volatility: 'medium', trend: 'stable' },
  { id: 'salmon', name: 'Salmon (Atlantic)', category: 'protein', basePrice: 12.00, currentPrice: 12.00, priceChange30d: 0.08, volatility: 'high', trend: 'rising' },
  { id: 'eggs', name: 'Eggs (Dozen)', category: 'dairy', basePrice: 3.50, currentPrice: 3.50, priceChange30d: 0.15, volatility: 'high', trend: 'rising' },
  { id: 'milk', name: 'Milk (Gallon)', category: 'dairy', basePrice: 4.00, currentPrice: 4.00, priceChange30d: 0.02, volatility: 'low', trend: 'stable' },
  { id: 'butter', name: 'Butter (lb)', category: 'dairy', basePrice: 5.50, currentPrice: 5.50, priceChange30d: 0.04, volatility: 'medium', trend: 'stable' },
  { id: 'flour', name: 'Flour (50lb)', category: 'dry_goods', basePrice: 18.00, currentPrice: 18.00, priceChange30d: 0.01, volatility: 'low', trend: 'stable' },
  { id: 'oil', name: 'Cooking Oil (Gal)', category: 'dry_goods', basePrice: 28.00, currentPrice: 28.00, priceChange30d: 0.06, volatility: 'medium', trend: 'rising' },
  { id: 'tomatoes', name: 'Tomatoes (Case)', category: 'produce', basePrice: 25.00, currentPrice: 25.00, priceChange30d: -0.05, volatility: 'high', trend: 'falling' },
  { id: 'lettuce', name: 'Lettuce (Case)', category: 'produce', basePrice: 35.00, currentPrice: 35.00, priceChange30d: 0.10, volatility: 'high', trend: 'rising' },
  { id: 'onions', name: 'Onions (50lb)', category: 'produce', basePrice: 22.00, currentPrice: 22.00, priceChange30d: 0.00, volatility: 'low', trend: 'stable' },
];

/**
 * Calculate effective price including terms value
 */
export function calculateEffectivePrice(
  basePrice: number,
  supplier: Supplier,
  weeklyInterestRate: number = 0.001
): {
  listPrice: number;
  effectivePrice: number;
  termsBenefit: number;
  explanation: string;
} {
  const listPrice = basePrice * supplier.priceMultiplier;

  // Calculate the value of payment terms
  // Net30 = you keep your money 4 weeks longer = worth ~0.4% at 0.1%/week
  const weeksOfFloat = {
    'COD': 0,
    'Net15': 2,
    'Net30': 4,
    'Net45': 6,
  }[supplier.paymentTerms];

  const termsBenefit = listPrice * weeksOfFloat * weeklyInterestRate;
  const effectivePrice = listPrice - termsBenefit;

  let explanation = '';
  if (weeksOfFloat > 0) {
    explanation = `${supplier.paymentTerms} terms let you use that cash for ${weeksOfFloat} more weeks`;
  } else {
    explanation = 'COD requires immediate payment, tying up cash';
  }

  return { listPrice, effectivePrice, termsBenefit, explanation };
}

/**
 * Update commodity prices with market fluctuations
 */
export function updateCommodityPrices(
  commodities: Commodity[],
  week: number
): Commodity[] {
  return commodities.map(commodity => {
    // Random fluctuation based on volatility
    const volatilityRange = {
      'low': 0.02,
      'medium': 0.05,
      'high': 0.10,
    }[commodity.volatility];

    const trendBias = {
      'rising': 0.01,
      'stable': 0,
      'falling': -0.01,
    }[commodity.trend];

    const randomChange = (Math.random() - 0.5) * 2 * volatilityRange;
    const totalChange = randomChange + trendBias;

    const newPrice = Math.max(
      commodity.basePrice * 0.7, // Floor at 70% of base
      Math.min(
        commodity.basePrice * 1.5, // Ceiling at 150% of base
        commodity.currentPrice * (1 + totalChange)
      )
    );

    // Update trend occasionally
    let newTrend = commodity.trend;
    if (week % 4 === 0 && Math.random() < 0.2) {
      const trends: ('rising' | 'stable' | 'falling')[] = ['rising', 'stable', 'falling'];
      newTrend = trends[Math.floor(Math.random() * 3)];
    }

    return {
      ...commodity,
      currentPrice: Math.round(newPrice * 100) / 100,
      priceChange30d: (newPrice - commodity.currentPrice) / commodity.currentPrice,
      trend: newTrend,
    };
  });
}

/**
 * Build relationship with supplier over time
 */
export function updateSupplierRelationship(
  supplier: Supplier,
  payment: { onTime: boolean; amount: number } | null,
  orderPlaced: boolean
): Supplier {
  let newScore = supplier.relationshipScore;
  let newOnTime = supplier.onTimePayments;
  let newLate = supplier.latePayments;

  if (payment) {
    if (payment.onTime) {
      newScore = Math.min(100, newScore + 2);
      newOnTime++;
    } else {
      newScore = Math.max(0, newScore - 10);
      newLate++;
    }
  }

  // Consistent ordering builds relationship
  if (orderPlaced) {
    newScore = Math.min(100, newScore + 0.5);
  }

  // Unlock better terms at relationship milestones
  let newTerms = supplier.paymentTerms;
  let newCreditLimit = supplier.creditLimit;

  if (newScore >= 80 && supplier.paymentTerms === 'COD') {
    newTerms = 'Net15';
    newCreditLimit = 5000;
  } else if (newScore >= 90 && supplier.paymentTerms === 'Net15') {
    newTerms = 'Net30';
    newCreditLimit = supplier.creditLimit * 1.5;
  }

  return {
    ...supplier,
    relationshipScore: newScore,
    onTimePayments: newOnTime,
    latePayments: newLate,
    paymentTerms: newTerms,
    creditLimit: newCreditLimit,
    weeksAsCustomer: supplier.weeksAsCustomer + 1,
  };
}

/**
 * Evaluate which supplier is best for an order
 */
export function evaluateSuppliers(
  suppliers: Supplier[],
  orderAmount: number,
  needsQuickPayment: boolean = false
): {
  supplier: Supplier;
  score: number;
  reasoning: string[];
}[] {
  return suppliers.map(supplier => {
    let score = 50;
    const reasoning: string[] = [];

    // Price factor (40% weight)
    const priceScore = (1.2 - supplier.priceMultiplier) * 100;
    score += priceScore * 0.4;
    if (supplier.priceMultiplier < 0.95) {
      reasoning.push('Great prices');
    } else if (supplier.priceMultiplier > 1.1) {
      reasoning.push('Premium pricing');
    }

    // Quality factor (25% weight)
    score += (supplier.qualityRating - 50) * 0.25;
    if (supplier.qualityRating >= 90) {
      reasoning.push('Excellent quality');
    } else if (supplier.qualityRating < 70) {
      reasoning.push('Quality concerns');
    }

    // Reliability factor (20% weight)
    score += (supplier.reliability - 50) * 0.2;
    if (supplier.reliability >= 95) {
      reasoning.push('Very reliable');
    } else if (supplier.reliability < 80) {
      reasoning.push('Delivery issues possible');
    }

    // Payment terms factor (15% weight)
    if (!needsQuickPayment) {
      const termsValue = { 'COD': 0, 'Net15': 5, 'Net30': 10, 'Net45': 15 }[supplier.paymentTerms];
      score += termsValue;
      if (supplier.paymentTerms === 'Net30' || supplier.paymentTerms === 'Net45') {
        reasoning.push('Favorable payment terms');
      } else if (supplier.paymentTerms === 'COD') {
        reasoning.push('Requires immediate payment');
      }
    }

    // Minimum order penalty
    if (orderAmount < supplier.minimumOrder) {
      score -= 20;
      reasoning.push(`Below $${supplier.minimumOrder} minimum`);
    }

    // Relationship bonus
    if (supplier.relationshipScore >= 80) {
      score += 5;
      reasoning.push('Strong relationship');
    }

    return { supplier, score: Math.round(score), reasoning };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Educational lessons about supplier management
 */
export const SUPPLIER_LESSONS = [
  {
    title: 'Payment Terms Are Worth Money',
    lesson: 'Net30 terms mean you keep your cash 4 weeks longer. That\'s worth 1-2% of the order value in cash flow.',
  },
  {
    title: 'Cheap Isn\'t Always Better',
    lesson: 'A supplier who\'s 10% cheaper but unreliable will cost you more in 86\'d items and unhappy customers.',
  },
  {
    title: 'Relationships Unlock Terms',
    lesson: 'New suppliers require COD. Pay on time consistently and you\'ll earn Net30 terms - that\'s real value.',
  },
  {
    title: 'Diversify Your Suppliers',
    lesson: 'If your only protein supplier has a truck breakdown, you\'re 86\'ing entrees. Have backups.',
  },
  {
    title: 'Watch Commodity Trends',
    lesson: 'When beef prices spike, adjust your menu or margins suffer. The best operators see trends coming.',
  },
  {
    title: 'Local Often Means Flexible',
    lesson: 'Local suppliers may cost more but often work with you on emergencies. That relationship has value.',
  },
];

export default {
  DEFAULT_SUPPLIERS,
  COMMODITIES,
  calculateEffectivePrice,
  updateCommodityPrices,
  updateSupplierRelationship,
  evaluateSuppliers,
  SUPPLIER_LESSONS,
};
