module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],
  testMatch: ['**/__tests__/**/*.test.{js,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,ts,tsx}',
    '!src/**/index.{js,ts}',
  ],
  // Setup file to properly mock React Native modules
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ignore e2e tests by default (run separately)
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  // Use node environment for pure logic tests
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};
