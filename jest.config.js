module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],

  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/database.ts',  // Exclude database config
    '!src/types/**'              // Exclude type definitions
  ],
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'html',           // HTML report in coverage/
    'lcov',           // For CI/CD integration
    'json-summary'    // JSON summary
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  globalSetup: '<rootDir>/tests/setup/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.ts'],
  testTimeout: 10000,
  verbose: true
};
