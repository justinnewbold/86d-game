// ============================================
// VENDOR SYSTEM
// ============================================

export const VENDORS = [
  { id: 'sysco', name: 'Sysco', icon: '🚛', type: 'broadline', priceLevel: 1.0, quality: 0.7, reliability: 0.9, minOrder: 500 },
  { id: 'usfoods', name: 'US Foods', icon: '🚚', type: 'broadline', priceLevel: 0.98, quality: 0.72, reliability: 0.88, minOrder: 400 },
  { id: 'pfg', name: 'Performance Food', icon: '📦', type: 'broadline', priceLevel: 0.95, quality: 0.68, reliability: 0.85, minOrder: 300 },
  { id: 'local_farms', name: 'Local Farms Co-op', icon: '🌾', type: 'specialty', priceLevel: 1.15, quality: 0.95, reliability: 0.7, minOrder: 200, seasonal: true },
  { id: 'premium_meats', name: 'Premium Meats Inc', icon: '🥩', type: 'protein', priceLevel: 1.25, quality: 0.92, reliability: 0.85, minOrder: 300 },
  { id: 'ocean_fresh', name: 'Ocean Fresh Seafood', icon: '🦐', type: 'seafood', priceLevel: 1.3, quality: 0.9, reliability: 0.75, minOrder: 250 },
  { id: 'bakery_direct', name: 'Artisan Bakery Direct', icon: '🥖', type: 'bakery', priceLevel: 1.1, quality: 0.88, reliability: 0.82, minOrder: 100 },
  { id: 'beverage_kings', name: 'Beverage Kings', icon: '🥤', type: 'beverage', priceLevel: 0.9, quality: 0.75, reliability: 0.95, minOrder: 200 },
];

export const VENDOR_DEALS = [
  { id: 'volume_discount', name: 'Volume Discount', description: '10% off orders over $2K/week', discount: 0.1, minWeeklyOrder: 2000 },
  { id: 'loyalty_program', name: 'Loyalty Program', description: '5% rebate after 6 months', discount: 0.05, minWeeks: 24 },
  { id: 'exclusive_contract', name: 'Exclusive Contract', description: '15% off for 1-year commitment', discount: 0.15, commitment: 52, penalty: 10000 },
  { id: 'early_pay', name: 'Early Payment', description: '2% off for payment within 10 days', discount: 0.02, requiresCash: true },
];

export const SUPPLY_DISRUPTIONS = [
  { id: 'protein_shortage', name: 'Protein Shortage', icon: '🥩', chance: 0.03, foodCostIncrease: 0.15, duration: 2 },
  { id: 'produce_recall', name: 'Produce Recall', icon: '🥬', chance: 0.02, foodCostIncrease: 0.10, duration: 1 },
  { id: 'shipping_delay', name: 'Shipping Delays', icon: '🚚', chance: 0.05, foodCostIncrease: 0.08, duration: 2 },
  { id: 'supplier_closure', name: 'Supplier Closed', icon: '🏭', chance: 0.01, foodCostIncrease: 0.25, duration: 4 },
];
