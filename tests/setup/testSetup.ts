import { setupTestDb } from './testDb';

// Setup before all tests
beforeAll(async () => {
  await setupTestDb();
});

// Increase timeout for database operations
jest.setTimeout(10000);
