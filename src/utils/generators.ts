// Name and content generators

const FIRST_NAMES: readonly string[] = [
  'Alex', 'Jordan', 'Sam', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Jamie', 'Drew', 'Quinn',
  'Avery', 'Skyler', 'Reese', 'Cameron', 'Dakota', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Parker',
  'Peyton', 'Sage', 'Blake', 'Charlie', 'Devon', 'Emerson', 'Gray', 'Harper', 'Jesse', 'Kai'
];

const LAST_NAMES: readonly string[] = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

export const generateName = (): string => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

const MENU_PREFIXES: readonly string[] = [
  'Classic', 'House', "Chef's", 'Signature', 'Traditional',
  'Modern', 'Artisan', 'Premium', 'Special', 'Gourmet'
];

const MENU_SUFFIXES: Record<string, readonly string[]> = {
  burgers: ['Burger', 'Cheeseburger', 'Patty Melt', 'Slider'],
  mexican: ['Tacos', 'Burrito', 'Quesadilla', 'Enchiladas'],
  pizza: ['Pizza', 'Calzone', 'Stromboli', 'Flatbread'],
  chinese: ['Lo Mein', 'Fried Rice', 'Kung Pao', 'Orange Chicken'],
  japanese: ['Roll', 'Ramen', 'Teriyaki', 'Donburi'],
  default: ['Plate', 'Bowl', 'Combo', 'Special'],
};

export const generateMenuItem = (cuisineId: string): string => {
  const prefix = MENU_PREFIXES[Math.floor(Math.random() * MENU_PREFIXES.length)];
  const suffixes = MENU_SUFFIXES[cuisineId] || MENU_SUFFIXES.default;
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix} ${suffix}`;
};

export const generateCompetitorName = (): string => {
  const adjectives = ['Golden', 'Silver', 'Royal', 'Grand', 'Blue', 'Red', 'Green', 'Urban', 'Classic', 'Modern'];
  const nouns = ['Kitchen', 'Grill', 'Bistro', 'Cafe', 'House', 'Table', 'Plate', 'Fork', 'Spoon', 'Garden'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};
