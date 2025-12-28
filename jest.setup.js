// Jest setup file
// This file is run after the test framework is installed but before tests run

// Mock React Native's NativeModules if they're causing issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Ensure NativeModules exists
  if (!RN.NativeModules) {
    RN.NativeModules = {};
  }

  return RN;
}, { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules that might cause issues
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'test-app',
      slug: 'test-app',
    },
  },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Silence console warnings during tests (optional)
// const originalWarn = console.warn;
// beforeAll(() => {
//   console.warn = (...args) => {
//     if (args[0]?.includes('deprecated')) return;
//     originalWarn.apply(console, args);
//   };
// });
// afterAll(() => {
//   console.warn = originalWarn;
// });

// Global test utilities
global.testUtils = {
  // Helper to create a mock location for testing
  createMockLocation: (overrides = {}) => ({
    id: 1,
    name: 'Test Restaurant',
    locationType: 'downtown',
    market: 'test-city',
    isGhostKitchen: false,
    cash: 50000,
    totalRevenue: 0,
    totalProfit: 0,
    weeklyHistory: [],
    staff: [],
    menu: [],
    equipment: [],
    upgrades: [],
    marketing: { channels: [], socialFollowers: 0 },
    delivery: { platforms: [], orders: 0 },
    virtualBrands: [],
    reputation: 70,
    morale: 75,
    covers: 350,
    weeksOpen: 0,
    manager: null,
    managerAutonomy: 0,
    rent: 4000,
    avgTicket: 28,
    foodCostPct: 0.30,
    lastWeekRevenue: 0,
    lastWeekProfit: 0,
    lastWeekCovers: 0,
    ...overrides,
  }),

  // Helper to create a mock game state
  createMockGame: (overrides = {}) => ({
    week: 1,
    balance: 100000,
    locations: [],
    weeklyReports: [],
    achievements: [],
    ...overrides,
  }),
};
