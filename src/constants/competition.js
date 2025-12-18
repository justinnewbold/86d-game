// ============================================
// COMPETITION SYSTEM
// ============================================

export const COMPETITOR_TYPES = [
  { id: 'local_indie', name: 'Local Independent', icon: '🏠', threat: 0.1, priceCompetition: 0.05, qualityFocus: 0.8 },
  { id: 'regional_chain', name: 'Regional Chain', icon: '🏪', threat: 0.2, priceCompetition: 0.15, qualityFocus: 0.6 },
  { id: 'national_chain', name: 'National Chain', icon: '🏢', threat: 0.3, priceCompetition: 0.25, qualityFocus: 0.4 },
  { id: 'ghost_kitchen', name: 'Ghost Kitchen', icon: '👻', threat: 0.15, priceCompetition: 0.2, qualityFocus: 0.5, deliveryOnly: true },
  { id: 'fast_casual', name: 'Fast Casual', icon: '🚀', threat: 0.25, priceCompetition: 0.2, qualityFocus: 0.7 },
  { id: 'fine_dining', name: 'Fine Dining', icon: '✨', threat: 0.1, priceCompetition: 0, qualityFocus: 0.95, priceUp: true },
];

export const COMPETITOR_NAMES = {
  burgers: ['Burger Barn', 'Patty Palace', 'Bun & Done', 'Stack Attack', 'Grillmasters'],
  mexican: ['Casa Grande', 'Taco Town', 'El Sabor', 'Fiesta Fresh', 'Salsa Sisters'],
  pizza: ['Slice Heaven', 'Dough Bros', 'Pie Perfect', 'Crust & Co', 'Pepperoni Pete'],
  chinese: ['Golden Dragon', 'Wok This Way', 'Lucky Panda', 'Oriental Garden', 'Jade Palace'],
  japanese: ['Sakura Sushi', 'Tokyo Table', 'Rising Sun', 'Wasabi House', 'Ninja Kitchen'],
  default: ['The Competition', 'Rival Kitchen', 'Other Place', 'Next Door', 'Down the Street'],
};

export const COMPETITIONS = [
  { id: 'local_best', name: 'Best Local Restaurant', icon: '🏆', entryFee: 500, prize: 5000, reputationBonus: 15, difficulty: 'easy', judgeCount: 3 },
  { id: 'cuisine_championship', name: 'Cuisine Championship', icon: '🥇', entryFee: 1500, prize: 15000, reputationBonus: 25, difficulty: 'medium', judgeCount: 5 },
  { id: 'iron_chef', name: 'Iron Chef Challenge', icon: '⚔️', entryFee: 3000, prize: 30000, reputationBonus: 40, difficulty: 'hard', judgeCount: 7 },
  { id: 'michelin_contender', name: 'Michelin Contender', icon: '⭐', entryFee: 10000, prize: 100000, reputationBonus: 100, difficulty: 'legendary', judgeCount: 3 },
  { id: 'peoples_choice', name: "People's Choice Award", icon: '🗳️', entryFee: 0, prize: 2500, reputationBonus: 20, difficulty: 'community', judgeCount: 1000 },
  { id: 'sustainability', name: 'Green Restaurant Award', icon: '🌿', entryFee: 750, prize: 7500, reputationBonus: 18, difficulty: 'medium', judgeCount: 5 },
];
