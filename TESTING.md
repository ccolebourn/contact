# Testing Guide

This project uses Jest with TypeScript for automated testing, including unit tests and API integration tests with an in-memory PostgreSQL database.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup/                      # Test configuration
│   ├── testDb.ts              # In-memory PostgreSQL setup (pg-mem)
│   ├── testSetup.ts           # Jest test environment setup
│   ├── testApp.ts             # Express app configuration for tests
│   ├── testHelpers.ts         # Helper functions for test data
│   └── globalSetup.ts         # Global test initialization
├── integration/
│   └── api/
│       └── person.api.test.ts # Person API integration tests
└── unit/                       # Unit tests (to be added)
```

## Current Test Coverage

Run `npm run test:coverage` to see the latest coverage report.

### Current Statistics
- **Person Controller**: 100% coverage ✓
- **Person Service**: 88% coverage
- **Overall**: ~56% coverage

### Coverage Thresholds
The project enforces minimum coverage thresholds:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

**Note**: Current coverage is below thresholds. Add tests for Organization and Lookup endpoints to increase coverage.

## Viewing Coverage Reports

### Console Output
Coverage summary is displayed in the console after running `npm run test:coverage`.

### HTML Report
Open the detailed HTML coverage report:
```bash
# Windows
start coverage/lcov-report/index.html

# Mac/Linux
open coverage/lcov-report/index.html
```

The HTML report shows:
- Line-by-line coverage for each file
- Untested code paths highlighted
- Branch coverage details
- Function coverage

## Writing Tests

### API Integration Tests

Example structure for API tests:

```typescript
import request from 'supertest';
import { Application } from 'express';
import { cleanupTestDb, setupTestDb } from '../../setup/testDb';
import { createTestApp } from '../../setup/testApp';

describe('API Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await setupTestDb();
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  it('should test endpoint', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

### Test Helpers

Use helper functions to create test data:

```typescript
import {
  createTestPerson,
  createTestOrganization,
  createTestEmail,
  linkEmailToContact
} from '../../setup/testHelpers';

// Create test person
const person = await createTestPerson({
  first_name: 'John',
  last_name: 'Doe'
});

// Create and link email
const email = await createTestEmail({
  email_address: 'john@example.com',
  email_type: 'WORK'
});

await linkEmailToContact(person.person_id, email.email_id, 'PERSON', true);
```

## Test Database

Tests use **pg-mem**, an in-memory PostgreSQL database that:
- Runs entirely in memory (fast)
- Resets between tests (isolated)
- Supports PostgreSQL syntax and features
- No external database required

### Database Schema
The test database includes:
- Country and Region lookup tables
- Person and Organization tables
- Email, Phone, Address tables
- All relationships and constraints

### Cleaning Up
Tests automatically clean up data between test cases using `cleanupTestDb()`.

## Person API Tests (20 tests)

### CREATE Tests
- ✓ Create person with basic information
- ✓ Create person with full details
- ✓ Create person with nested contacts (emails, phones, addresses)
- ✓ Validation failures (missing fields, invalid types)

### READ Tests
- ✓ Get person by ID
- ✓ 404 for non-existent person
- ✓ Include nested contacts in response
- ✓ Get all persons with pagination
- ✓ Custom pagination
- ✓ Empty results handling

### SEARCH Tests
- ✓ Search by last name
- ✓ Search by first name
- ✓ Partial name matching
- ✓ No matches handling

### UPDATE Tests
- ✓ Update basic fields
- ✓ Update language preference
- ✓ 404 when updating non-existent person

### DELETE Tests
- ✓ Delete person successfully
- ✓ 404 when deleting non-existent person

## Next Steps

### Priority 1: Increase Coverage
1. **Organization API tests** - Similar to Person tests
2. **Lookup API tests** - Test country/region endpoints

### Priority 2: Unit Tests
3. **Service layer tests** - Test business logic in isolation
4. **Middleware tests** - Error handler, validator

### Priority 3: Advanced Testing
5. **Error scenarios** - Database errors, transaction rollbacks
6. **Performance tests** - Large datasets, pagination
7. **Security tests** - SQL injection, XSS prevention

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Tests failing with database errors
- Ensure `setupTestDb()` is called in `beforeAll`
- Check that test database schema matches your actual schema
- Verify pg-mem supports the SQL features you're using

### Coverage not updating
- Clear coverage directory: `rm -rf coverage`
- Run tests with `--no-cache`: `npm test -- --no-cache`

### TypeScript errors in tests
- Ensure test files use `.test.ts` extension
- Check `tsconfig.json` includes test directory
- Verify all test dependencies are installed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [pg-mem Documentation](https://github.com/oguimbal/pg-mem)
- [TypeScript Jest Guide](https://jestjs.io/docs/getting-started#via-ts-jest)
