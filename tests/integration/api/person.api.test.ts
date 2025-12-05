import request from 'supertest';
import { Application } from 'express';
import { cleanupTestDb, setupTestDb } from '../../setup/testDb';
import { createTestPerson, createTestEmail, linkEmailToContact } from '../../setup/testHelpers';

// Mock the database module before importing anything that uses it
// Use a getter to ensure it's initialized
jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    get default() {
      const { getTestPool } = require('../../setup/testDb');
      return getTestPool();
    }
  };
});

// Import app after mocking
import { createTestApp } from '../../setup/testApp';

describe('Person API Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await setupTestDb();
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  describe('POST /api/persons - Create Person', () => {
    it('should create a person with basic information', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({
          first_name: 'John',
          last_name: 'Doe'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
        person_id: expect.any(Number)
      });
    });

    it('should create a person with full details', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({
          first_name: 'Jane',
          middle_name: 'Marie',
          last_name: 'Smith',
          birth_year: 1990,
          birth_month: 5,
          birth_day: 15,
          preferred_language: 'en'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        first_name: 'Jane',
        middle_name: 'Marie',
        last_name: 'Smith',
        birth_year: 1990,
        birth_month: 5,
        birth_day: 15,
        preferred_language: 'en'
      });
    });

    it('should create a person with nested contacts (email, phone, address)', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({
          first_name: 'Bob',
          last_name: 'Johnson',
          emails: [
            {
              email_address: 'bob@example.com',
              email_type: 'WORK',
              is_primary: true
            },
            {
              email_address: 'bob.personal@example.com',
              email_type: 'PERSONAL',
              is_primary: false
            }
          ],
          phones: [
            {
              country_code: '+1',
              area_code: '555',
              local_number: '1234567',
              phone_type: 'MOBILE',
              is_primary: true
            }
          ],
          addresses: [
            {
              address_line_1: '123 Main St',
              city_locality: 'San Francisco',
              region_code: 'CA',
              postal_code: '94102',
              country_iso_code: 'US',
              address_type: 'HOME'
            }
          ]
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('Bob');
      expect(response.body.data.emails).toHaveLength(2);
      expect(response.body.data.phones).toHaveLength(1);
      expect(response.body.data.addresses).toHaveLength(1);
    });

    it('should fail validation when missing required fields', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({
          first_name: 'John'
          // missing last_name
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid email type', async () => {
      const response = await request(app)
        .post('/api/persons')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          emails: [
            {
              email_address: 'john@example.com',
              email_type: 'INVALID_TYPE'
            }
          ]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/persons/:id - Get Person by ID', () => {
    it('should get a person by ID', async () => {
      // Create test person
      const testPerson = await createTestPerson({
        first_name: 'Alice',
        last_name: 'Williams'
      });

      const response = await request(app)
        .get(`/api/persons/${testPerson.person_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person_id: testPerson.person_id,
        first_name: 'Alice',
        last_name: 'Williams'
      });
    });

    it('should return 404 for non-existent person', async () => {
      const response = await request(app)
        .get('/api/persons/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Person not found');
    });

    it('should include nested contacts in response', async () => {
      // Create test person with email
      const testPerson = await createTestPerson({
        first_name: 'Charlie',
        last_name: 'Brown'
      });

      const testEmail = await createTestEmail({
        email_address: 'charlie@example.com',
        email_type: 'WORK'
      });

      await linkEmailToContact(testPerson.person_id, testEmail.email_id, 'PERSON', true);

      const response = await request(app)
        .get(`/api/persons/${testPerson.person_id}`)
        .expect(200);

      expect(response.body.data.emails).toBeDefined();
      expect(response.body.data.emails).toHaveLength(1);
      expect(response.body.data.emails[0].email_address).toBe('charlie@example.com');
    });
  });

  describe('GET /api/persons - Get All Persons', () => {
    it('should get all persons with default pagination', async () => {
      // Create multiple test persons
      await createTestPerson({ first_name: 'Person', last_name: 'One' });
      await createTestPerson({ first_name: 'Person', last_name: 'Two' });
      await createTestPerson({ first_name: 'Person', last_name: 'Three' });

      const response = await request(app)
        .get('/api/persons')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    it('should support custom pagination', async () => {
      // Create 5 test persons
      for (let i = 1; i <= 5; i++) {
        await createTestPerson({ first_name: `Person${i}`, last_name: 'Test' });
      }

      const response = await request(app)
        .get('/api/persons?page=2&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(5);
    });

    it('should return empty array when no persons exist', async () => {
      const response = await request(app)
        .get('/api/persons')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/persons/search - Search Persons', () => {
    beforeEach(async () => {
      // Create test persons for searching
      await createTestPerson({ first_name: 'John', last_name: 'Smith' });
      await createTestPerson({ first_name: 'Jane', last_name: 'Smith' });
      await createTestPerson({ first_name: 'Bob', last_name: 'Johnson' });
    });

    it('should search by last name', async () => {
      const response = await request(app)
        .get('/api/persons/search?last_name=Smith')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((p: any) => p.last_name === 'Smith')).toBe(true);
    });

    it('should search by first name', async () => {
      const response = await request(app)
        .get('/api/persons/search?first_name=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].first_name).toBe('John');
    });

    it('should support partial name matching', async () => {
      const response = await request(app)
        .get('/api/persons/search?last_name=Smi')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/persons/search?last_name=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('PUT /api/persons/:id - Update Person', () => {
    it('should update person basic fields', async () => {
      const testPerson = await createTestPerson({
        first_name: 'Original',
        last_name: 'Name'
      });

      const response = await request(app)
        .put(`/api/persons/${testPerson.person_id}`)
        .send({
          first_name: 'Updated',
          middle_name: 'Middle'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('Updated');
      expect(response.body.data.middle_name).toBe('Middle');
      expect(response.body.data.last_name).toBe('Name'); // Should remain unchanged
    });

    it('should update preferred language', async () => {
      const testPerson = await createTestPerson({
        first_name: 'Test',
        last_name: 'User'
      });

      const response = await request(app)
        .put(`/api/persons/${testPerson.person_id}`)
        .send({
          preferred_language: 'es'
        })
        .expect(200);

      expect(response.body.data.preferred_language).toBe('es');
    });

    it('should return 404 when updating non-existent person', async () => {
      const response = await request(app)
        .put('/api/persons/99999')
        .send({
          first_name: 'Updated'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/persons/:id - Delete Person', () => {
    it('should delete a person', async () => {
      const testPerson = await createTestPerson({
        first_name: 'ToDelete',
        last_name: 'Person'
      });

      const response = await request(app)
        .delete(`/api/persons/${testPerson.person_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Person deleted successfully');

      // Verify person is deleted
      await request(app)
        .get(`/api/persons/${testPerson.person_id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent person', async () => {
      const response = await request(app)
        .delete('/api/persons/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
