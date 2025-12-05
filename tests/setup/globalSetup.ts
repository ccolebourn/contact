import { setupTestDb } from './testDb';

export default async function globalSetup() {
  // Initialize test database before any tests run
  await setupTestDb();
}
