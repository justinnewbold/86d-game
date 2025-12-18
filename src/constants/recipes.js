// ============================================
// RECIPE DEVELOPMENT SYSTEM
// ============================================

export const RECIPE_CATEGORIES = [
  { id: 'signature', name: 'Signature Dish', icon: '⭐', devTime: 4, cost: 2000, bonusMultiplier: 1.3 },
  { id: 'seasonal', name: 'Seasonal Special', icon: '🍂', devTime: 2, cost: 500, bonusMultiplier: 1.15 },
  { id: 'fusion', name: 'Fusion Creation', icon: '🔀', devTime: 3, cost: 1200, bonusMultiplier: 1.2 },
  { id: 'health', name: 'Healthy Option', icon: '🥗', devTime: 2, cost: 800, bonusMultiplier: 1.1 },
  { id: 'indulgent', name: 'Indulgent Treat', icon: '🍰', devTime: 2, cost: 1000, bonusMultiplier: 1.25 },
  { id: 'quick', name: 'Quick Bite', icon: '⚡', devTime: 1, cost: 300, bonusMultiplier: 1.05 },
];

export const RECIPE_MARKETPLACE = {
  categories: ['appetizers', 'mains', 'desserts', 'drinks', 'specials'],
  rarities: [
    { id: 'common', name: 'Common', color: '#A3A3A3', priceMultiplier: 1 },
    { id: 'uncommon', name: 'Uncommon', color: '#10B981', priceMultiplier: 2 },
    { id: 'rare', name: 'Rare', color: '#3B82F6', priceMultiplier: 5 },
    { id: 'epic', name: 'Epic', color: '#8B5CF6', priceMultiplier: 15 },
    { id: 'legendary', name: 'Legendary', color: '#F59E0B', priceMultiplier: 50 },
  ],
  sampleRecipes: [
    { id: 'truffle_fries', name: 'Truffle Parmesan Fries', category: 'appetizers', rarity: 'rare', basePrice: 5000, profit: 14, creator: 'ChefMaster99' },
    { id: 'wagyu_burger', name: 'A5 Wagyu Smash Burger', category: 'mains', rarity: 'legendary', basePrice: 25000, profit: 22, creator: 'BurgerKing2025' },
    { id: 'lavender_lemonade', name: 'Lavender Honey Lemonade', category: 'drinks', rarity: 'uncommon', basePrice: 2500, profit: 18, creator: 'DrinkWizard' },
    { id: 'molten_cake', name: 'Molten Lava Cake', category: 'desserts', rarity: 'epic', basePrice: 12000, profit: 16, creator: 'SweetTooth' },
    { id: 'korean_wings', name: 'Gochujang Glazed Wings', category: 'appetizers', rarity: 'rare', basePrice: 6000, profit: 15, creator: 'WingMaster' },
  ],
};
