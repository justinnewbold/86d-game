// ============================================
// EVENTS CALENDAR & SEASONAL EFFECTS
// ============================================

export const CALENDAR_EVENTS = [
  { id: 'valentines', name: "Valentine's Day", icon: '💕', week: 7, revenueBoost: 0.4, type: 'romantic', tip: 'Offer special prix fixe menus' },
  { id: 'mothers_day', name: "Mother's Day", icon: '💐', week: 19, revenueBoost: 0.5, type: 'family', tip: 'Book reservations early, add brunch' },
  { id: 'fathers_day', name: "Father's Day", icon: '👔', week: 24, revenueBoost: 0.3, type: 'family', tip: 'Steak specials work well' },
  { id: 'july_4th', name: 'Independence Day', icon: '🎆', week: 27, revenueBoost: 0.2, type: 'holiday', tip: 'BBQ themes, outdoor seating premium' },
  { id: 'labor_day', name: 'Labor Day', icon: '⚒️', week: 36, revenueBoost: 0.1, type: 'holiday', tip: 'Last summer hurrah - end of season specials' },
  { id: 'halloween', name: 'Halloween', icon: '🎃', week: 44, revenueBoost: 0.15, type: 'theme', tip: 'Themed cocktails and decor' },
  { id: 'thanksgiving', name: 'Thanksgiving', icon: '🦃', week: 47, revenueBoost: -0.3, type: 'holiday', tip: 'Most dine at home - consider catering' },
  { id: 'christmas_eve', name: 'Christmas Eve', icon: '🎄', week: 51, revenueBoost: 0.2, type: 'holiday', tip: 'Special hours, limited menu' },
  { id: 'new_years', name: "New Year's Eve", icon: '🥂', week: 52, revenueBoost: 0.6, type: 'celebration', tip: 'Premium pricing accepted, require deposits' },
  { id: 'super_bowl', name: 'Super Bowl', icon: '🏈', week: 6, revenueBoost: 0.35, type: 'sports', tip: 'Wings, nachos, delivery surge' },
  { id: 'march_madness', name: 'March Madness Start', icon: '🏀', week: 11, revenueBoost: 0.15, type: 'sports', tip: 'Bar traffic up, add screens' },
  { id: 'cinco_de_mayo', name: 'Cinco de Mayo', icon: '🇲🇽', week: 18, revenueBoost: 0.25, type: 'theme', tip: 'Margarita specials (if applicable)' },
  { id: 'restaurant_week', name: 'Restaurant Week', icon: '🍽️', week: 30, revenueBoost: 0.2, type: 'industry', tip: 'Lower margins but great exposure' },
];

export const SEASONAL_EFFECTS = {
  winter: { weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51, 52], modifier: -0.1, heating: 500 },
  spring: { weeks: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], modifier: 0.05, patioBoost: 0.15 },
  summer: { weeks: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], modifier: -0.05, acCost: 400 },
  fall: { weeks: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], modifier: 0.1, peakSeason: true },
};
