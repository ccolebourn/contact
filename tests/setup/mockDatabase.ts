import { getTestPool } from './testDb';

/**
 * Mock the database module to use the test pool
 * This needs to be called before importing any modules that use the database
 */
export function mockDatabaseModule() {
  jest.mock('../../src/config/database', () => ({
    __esModule: true,
    default: getTestPool()
  }));
}
