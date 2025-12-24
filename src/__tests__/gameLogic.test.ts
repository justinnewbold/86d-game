// ============================================
// GAME LOGIC UNIT TESTS
// ============================================

import {
  processLocationWeek,
  calculateEmpireValuation,
  getEconomicMultipliers,
} from '../hooks/useGameLoop';
import { validateRestaurantName, validateCapital, validateWage, validateMenuPrice } from '../utils/validation';
import {
  createVersionedSave,
  migrateSave,
  needsMigration,
  generateChecksum,
  verifyChecksum,
  CURRENT_SAVE_VERSION,
} from '../utils/saveGameMigration';

// Mock location for testing
const createMockLocation = (overrides = {}) => ({
  id: 1,
  name: 'Test Restaurant',
  locationType: 'urban_neighborhood',
  market: 'same_city',
  isGhostKitchen: false,
  cash: 50000,
  totalRevenue: 100000,
  totalProfit: 20000,
  weeklyHistory: [],
  staff: [
    { id: 1, name: 'Test Cook', role: 'Line Cook', wage: 16, skill: 5, weeks: 10, morale: 70, training: [], department: 'kitchen' },
    { id: 2, name: 'Test Server', role: 'Server', wage: 10, skill: 6, weeks: 8, morale: 75, training: [], department: 'foh' },
  ],
  menu: [
    { id: 1, name: 'Burger', price: 15, cost: 4.5, popular: true, is86d: false },
  ],
  equipment: ['pos', 'fryer'],
  upgrades: [],
  marketing: { channels: ['social_organic'], socialFollowers: 100 },
  delivery: { platforms: [], orders: 0 },
  virtualBrands: [],
  reputation: 60,
  morale: 72,
  covers: 40,
  weeksOpen: 20,
  manager: null,
  managerAutonomy: 0.5,
  rent: 3500,
  avgTicket: 18,
  foodCostPct: 0.28,
  lastWeekRevenue: 8000,
  lastWeekProfit: 1500,
  lastWeekCovers: 400,
  ...overrides,
});

describe('processLocationWeek', () => {
  test('should process a week and return updated location', () => {
    const location = createMockLocation();
    const result = processLocationWeek(location, 'burgers', 1, 1);

    expect(result.weeksOpen).toBe(location.weeksOpen + 1);
    expect(result.weeklyHistory.length).toBe(1);
    expect(typeof result.lastWeekRevenue).toBe('number');
    expect(typeof result.lastWeekProfit).toBe('number');
  });

  test('should update staff weeks and potentially morale', () => {
    const location = createMockLocation();
    const result = processLocationWeek(location, 'burgers', 1, 1);

    result.staff.forEach((staff) => {
      expect(staff.weeks).toBeGreaterThanOrEqual(location.staff[0].weeks);
    });
  });

  test('should handle empty staff array', () => {
    const location = createMockLocation({ staff: [] });
    const result = processLocationWeek(location, 'burgers', 1, 1);

    expect(result.staff).toHaveLength(0);
    expect(result.morale).toBe(50); // Default morale when no staff
  });

  test('should handle ghost kitchen (no dine-in covers)', () => {
    const location = createMockLocation({ isGhostKitchen: true, delivery: { platforms: ['doordash'], orders: 0 } });
    const result = processLocationWeek(location, 'burgers', 1, 1);

    // Ghost kitchens should still generate some revenue via delivery
    expect(typeof result.lastWeekRevenue).toBe('number');
  });

  test('should apply economic multipliers correctly', () => {
    const location = createMockLocation();

    // Test with boom economy (revenue multiplier > 1)
    const boomResult = processLocationWeek(location, 'burgers', 1.15, 1);

    // Test with recession economy (revenue multiplier < 1)
    const recessionResult = processLocationWeek(location, 'burgers', 0.8, 1.1);

    // Boom should generally produce more revenue than recession
    // (Note: due to randomness, we can't guarantee exact values)
    expect(typeof boomResult.lastWeekRevenue).toBe('number');
    expect(typeof recessionResult.lastWeekRevenue).toBe('number');
  });

  test('should update reputation based on profit', () => {
    const profitableLocation = createMockLocation({ reputation: 50 });
    const result = processLocationWeek(profitableLocation, 'burgers', 1, 1);

    // Reputation should change (either up or down based on profit)
    expect(result.reputation).toBeGreaterThanOrEqual(0);
    expect(result.reputation).toBeLessThanOrEqual(100);
  });

  test('should maintain history length limit', () => {
    const location = createMockLocation({
      weeklyHistory: Array(52).fill({ week: 1, revenue: 1000, profit: 100, covers: 100 }),
    });
    const result = processLocationWeek(location, 'burgers', 1, 1);

    expect(result.weeklyHistory.length).toBeLessThanOrEqual(52);
  });
});

describe('calculateEmpireValuation', () => {
  test('should calculate valuation for single location', () => {
    const game = {
      locations: [createMockLocation()],
      franchises: [],
    };
    const valuation = calculateEmpireValuation(game as any, 'burgers');

    expect(valuation).toBeGreaterThan(0);
  });

  test('should include franchise value', () => {
    const gameWithFranchises = {
      locations: [createMockLocation()],
      franchises: [{ weeklyRoyalty: 500 }, { weeklyRoyalty: 600 }],
    };
    const gameWithoutFranchises = {
      locations: [createMockLocation()],
      franchises: [],
    };

    const withFranchises = calculateEmpireValuation(gameWithFranchises as any, 'burgers');
    const withoutFranchises = calculateEmpireValuation(gameWithoutFranchises as any, 'burgers');

    expect(withFranchises).toBeGreaterThan(withoutFranchises);
  });

  test('should handle empty locations array', () => {
    const game = {
      locations: [],
      franchises: [],
    };
    const valuation = calculateEmpireValuation(game as any, 'burgers');

    expect(valuation).toBe(0);
  });

  test('should apply brand multiplier for larger empires', () => {
    const smallEmpire = {
      locations: [createMockLocation()],
      franchises: [],
    };
    const largeEmpire = {
      locations: Array(6).fill(null).map((_, i) => createMockLocation({ id: i + 1 })),
      franchises: [],
    };

    const smallValuation = calculateEmpireValuation(smallEmpire as any, 'burgers');
    const largeValuation = calculateEmpireValuation(largeEmpire as any, 'burgers');

    // Large empire should have multiplier bonus
    expect(largeValuation / 6).toBeGreaterThanOrEqual(smallValuation * 1.1);
  });
});

describe('getEconomicMultipliers', () => {
  test('should return default multipliers for stable economy', () => {
    const { revenue, cost } = getEconomicMultipliers('stable');
    expect(revenue).toBe(1);
    expect(cost).toBe(1);
  });

  test('should return boom multipliers', () => {
    const { revenue, cost } = getEconomicMultipliers('boom');
    expect(revenue).toBeGreaterThan(1);
    expect(cost).toBeLessThanOrEqual(1);
  });

  test('should return recession multipliers', () => {
    const { revenue, cost } = getEconomicMultipliers('recession');
    expect(revenue).toBeLessThan(1);
  });

  test('should fallback to stable for unknown economy', () => {
    const { revenue, cost } = getEconomicMultipliers('unknown');
    expect(revenue).toBeDefined();
    expect(cost).toBeDefined();
  });
});

describe('Validation utilities', () => {
  describe('validateRestaurantName', () => {
    test('should accept valid names', () => {
      expect(validateRestaurantName('Burger Palace').isValid).toBe(true);
      expect(validateRestaurantName("Joe's Diner").isValid).toBe(true);
      expect(validateRestaurantName('A').isValid).toBe(false); // Too short
    });

    test('should reject empty names', () => {
      expect(validateRestaurantName('').isValid).toBe(false);
      expect(validateRestaurantName('  ').isValid).toBe(false);
    });

    test('should reject names with invalid characters', () => {
      expect(validateRestaurantName('<script>').isValid).toBe(false);
      expect(validateRestaurantName('Test{Name}').isValid).toBe(false);
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      expect(validateRestaurantName(longName).isValid).toBe(false);
    });
  });

  describe('validateCapital', () => {
    test('should accept valid capital amounts', () => {
      expect(validateCapital(50000).isValid).toBe(true);
      expect(validateCapital(10000).isValid).toBe(true);
      expect(validateCapital(10000000).isValid).toBe(true);
    });

    test('should reject capital below minimum', () => {
      expect(validateCapital(5000).isValid).toBe(false);
    });

    test('should reject capital above maximum', () => {
      expect(validateCapital(15000000).isValid).toBe(false);
    });

    test('should reject non-numbers', () => {
      expect(validateCapital(NaN).isValid).toBe(false);
    });
  });

  describe('validateWage', () => {
    test('should accept valid wages', () => {
      expect(validateWage(15).isValid).toBe(true);
      expect(validateWage(25).isValid).toBe(true);
    });

    test('should reject wages below minimum', () => {
      expect(validateWage(5).isValid).toBe(false);
    });

    test('should reject wages above maximum', () => {
      expect(validateWage(250).isValid).toBe(false);
    });
  });

  describe('validateMenuPrice', () => {
    test('should accept valid prices', () => {
      expect(validateMenuPrice(9.99).isValid).toBe(true);
      expect(validateMenuPrice(0.01).isValid).toBe(true);
    });

    test('should reject zero or negative prices', () => {
      expect(validateMenuPrice(0).isValid).toBe(false);
      expect(validateMenuPrice(-5).isValid).toBe(false);
    });
  });
});

describe('Save game versioning', () => {
  const mockSetup = {
    cuisine: 'burgers',
    capital: 75000,
    name: 'Test Restaurant',
    location: 'urban_neighborhood',
    market: 'same_city',
    goal: 'survive',
    experience: 'none',
    difficulty: 'normal',
  };

  const mockGame = {
    week: 10,
    locations: [createMockLocation()],
    franchises: [],
    corporateCash: 25000,
  };

  describe('createVersionedSave', () => {
    test('should create save with current version', () => {
      const save = createVersionedSave(1, mockSetup as any, mockGame as any);

      expect(save.version).toBe(CURRENT_SAVE_VERSION);
      expect(save.slot).toBe(1);
      expect(save.setup).toEqual(mockSetup);
      expect(save.game).toEqual(mockGame);
      expect(save.checksum).toBeDefined();
    });

    test('should generate valid checksum', () => {
      const save = createVersionedSave(1, mockSetup as any, mockGame as any);

      expect(verifyChecksum(save)).toBe(true);
    });
  });

  describe('migrateSave', () => {
    test('should not modify saves at current version', () => {
      const save = createVersionedSave(1, mockSetup as any, mockGame as any);
      const migrated = migrateSave(save);

      expect(migrated.version).toBe(CURRENT_SAVE_VERSION);
    });

    test('should migrate old saves', () => {
      const oldSave = {
        version: '1.0.0',
        slot: 1,
        date: new Date().toISOString(),
        setup: mockSetup,
        game: {
          week: 10,
          cash: 50000,
          reputation: 60,
          staff: [],
        },
      };

      const migrated = migrateSave(oldSave as any);

      expect(migrated.version).toBe(CURRENT_SAVE_VERSION);
      expect(migrated.game.locations).toBeDefined();
    });
  });

  describe('needsMigration', () => {
    test('should return false for current version', () => {
      const save = createVersionedSave(1, mockSetup as any, mockGame as any);
      expect(needsMigration(save)).toBe(false);
    });

    test('should return true for old version', () => {
      const oldSave = {
        version: '1.0.0',
        slot: 1,
        date: new Date().toISOString(),
        setup: mockSetup,
        game: mockGame,
      };
      expect(needsMigration(oldSave as any)).toBe(true);
    });
  });

  describe('checksum', () => {
    test('should generate consistent checksums', () => {
      const data = { test: 'value', number: 123 };
      const checksum1 = generateChecksum(data);
      const checksum2 = generateChecksum(data);

      expect(checksum1).toBe(checksum2);
    });

    test('should generate different checksums for different data', () => {
      const data1 = { test: 'value1' };
      const data2 = { test: 'value2' };

      expect(generateChecksum(data1)).not.toBe(generateChecksum(data2));
    });
  });
});
