import { PersonService } from '../../../src/services/person.service';
import { cleanupTestDb, setupTestDb } from '../../setup/testDb';
import { createTestPerson, createTestEmail, linkEmailToContact } from '../../setup/testHelpers';

// Mock the database module
jest.mock('../../../src/config/database', () => {
  return {
    __esModule: true,
    get default() {
      const { getTestPool } = require('../../setup/testDb');
      return getTestPool();
    }
  };
});

describe('PersonService Unit Tests - Edge Cases', () => {
  let personService: PersonService;

  beforeAll(async () => {
    await setupTestDb();
    personService = new PersonService();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  describe('getById - Edge Cases', () => {
    it('should return null for non-existent person ID', async () => {
      const result = await personService.getById(99999);
      expect(result).toBeNull();
    });

    it('should return null for negative person ID', async () => {
      const result = await personService.getById(-1);
      expect(result).toBeNull();
    });

    it('should return null for zero person ID', async () => {
      const result = await personService.getById(0);
      expect(result).toBeNull();
    });

    it('should handle person with no contacts gracefully', async () => {
      const person = await createTestPerson({
        first_name: 'NoContacts',
        last_name: 'Person'
      });

      const result = await personService.getById(person.person_id);

      expect(result).not.toBeNull();
      expect(result!.emails).toEqual([]);
      expect(result!.phones).toEqual([]);
      expect(result!.addresses).toEqual([]);
    });

    it('should include all contact types when present', async () => {
      const person = await createTestPerson({
        first_name: 'AllContacts',
        last_name: 'Person'
      });

      const email = await createTestEmail({
        email_address: 'test@example.com',
        email_type: 'WORK'
      });

      await linkEmailToContact(person.person_id, email.email_id, 'PERSON', true);

      const result = await personService.getById(person.person_id);

      expect(result).not.toBeNull();
      expect(result).toBeDefined();
      expect(result?.emails).toBeDefined();
      expect(result!.emails!.length).toBeGreaterThan(0);
    });
  });

  describe('getAll - Pagination Edge Cases', () => {
    it('should handle empty database', async () => {
      const result = await personService.getAll(1, 20);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle page beyond available data', async () => {
      await createTestPerson({ first_name: 'Only', last_name: 'Person' });

      const result = await personService.getAll(999, 20);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(999);
    });

    it('should handle limit of 1', async () => {
      await createTestPerson({ first_name: 'Person', last_name: 'One' });
      await createTestPerson({ first_name: 'Person', last_name: 'Two' });

      const result = await personService.getAll(1, 1);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(1);
    });

    it('should handle very large limit', async () => {
      await createTestPerson({ first_name: 'Person', last_name: 'One' });

      const result = await personService.getAll(1, 1000);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(1000);
    });

    it('should return correct total count across pages', async () => {
      // Create 5 persons
      for (let i = 1; i <= 5; i++) {
        await createTestPerson({ first_name: `Person${i}`, last_name: 'Test' });
      }

      const page1 = await personService.getAll(1, 2);
      const page2 = await personService.getAll(2, 2);

      expect(page1.total).toBe(5);
      expect(page2.total).toBe(5);
      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(2);
    });
  });

  describe('search - Edge Cases', () => {
    beforeEach(async () => {
      await createTestPerson({ first_name: 'John', last_name: 'Smith' });
      await createTestPerson({ first_name: 'Jane', last_name: 'Doe' });
      await createTestPerson({ first_name: 'Bob', last_name: 'Johnson' });
    });

    it('should return empty array when no filters match', async () => {
      const result = await personService.search({
        first_name: 'NonExistent',
        page: 1,
        limit: 20
      });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle search with empty string', async () => {
      const result = await personService.search({
        first_name: '',
        page: 1,
        limit: 20
      });

      // Empty string should match nothing or everything depending on implementation
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('should handle case-insensitive search', async () => {
      const result = await personService.search({
        first_name: 'john',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].first_name.toLowerCase()).toContain('john');
    });

    it('should handle partial name matching', async () => {
      const result = await personService.search({
        last_name: 'Smi',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].last_name).toContain('Smith');
    });

    it('should handle multiple search criteria', async () => {
      const result = await personService.search({
        first_name: 'John',
        last_name: 'Smith',
        page: 1,
        limit: 20
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].first_name).toBe('John');
      expect(result.data[0].last_name).toBe('Smith');
    });

    it('should handle pagination in search results', async () => {
      // Create more persons with same last name
      await createTestPerson({ first_name: 'Alice', last_name: 'TestName' });
      await createTestPerson({ first_name: 'Bob', last_name: 'TestName' });
      await createTestPerson({ first_name: 'Charlie', last_name: 'TestName' });

      const page1 = await personService.search({
        last_name: 'TestName',
        page: 1,
        limit: 2
      });

      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page1.page).toBe(1);
    });
  });

  describe('create - Edge Cases', () => {
    it('should create person with minimal required fields', async () => {
      const person = await personService.create({
        first_name: 'Min',
        last_name: 'Required'
      });

      expect(person.first_name).toBe('Min');
      expect(person.last_name).toBe('Required');
      expect(person.person_id).toBeDefined();
    });

    it('should handle person with all optional fields as null', async () => {
      const person = await personService.create({
        first_name: 'Only',
        last_name: 'Required',
        middle_name: undefined,
        birth_year: undefined,
        birth_month: undefined,
        birth_day: undefined,
        preferred_language: undefined,
        household_id: undefined
      });

      expect(person.middle_name).toBeNull();
      expect(person.birth_year).toBeNull();
    });

    it('should handle person with maximum field lengths', async () => {
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);

      const person = await personService.create({
        first_name: longFirstName,
        last_name: longLastName
      });

      expect(person.first_name).toBe(longFirstName);
      expect(person.last_name).toBe(longLastName);
    });

    it('should handle boundary birth year values', async () => {
      const person = await personService.create({
        first_name: 'Old',
        last_name: 'Person',
        birth_year: 1900
      });

      expect(person.birth_year).toBe(1900);
    });

    it('should handle current year as birth year', async () => {
      const currentYear = new Date().getFullYear();

      const person = await personService.create({
        first_name: 'New',
        last_name: 'Born',
        birth_year: currentYear
      });

      expect(person.birth_year).toBe(currentYear);
    });
  });

  describe('update - Edge Cases', () => {
    it('should update only specified fields', async () => {
      const person = await createTestPerson({
        first_name: 'Original',
        last_name: 'Name',
        middle_name: 'Middle'
      });

      const updated = await personService.update(person.person_id, {
        first_name: 'Updated'
      });

      expect(updated.first_name).toBe('Updated');
      expect(updated.last_name).toBe('Name');
      expect(updated.middle_name).toBe('Middle');
    });

    it('should handle updating with empty object', async () => {
      const person = await createTestPerson({
        first_name: 'NoChange',
        last_name: 'Person'
      });

      const updated = await personService.update(person.person_id, {});

      expect(updated.first_name).toBe('NoChange');
      expect(updated.last_name).toBe('Person');
    });

    it('should throw error when updating non-existent person', async () => {
      await expect(
        personService.update(99999, { first_name: 'Updated' })
      ).rejects.toThrow();
    });

    it('should handle updating all fields at once', async () => {
      const person = await createTestPerson({
        first_name: 'Old',
        last_name: 'Name'
      });

      const updated = await personService.update(person.person_id, {
        first_name: 'New',
        middle_name: 'Middle',
        last_name: 'Updated',
        birth_year: 1990,
        birth_month: 5,
        birth_day: 15,
        preferred_language: 'es'
      });

      expect(updated.first_name).toBe('New');
      expect(updated.middle_name).toBe('Middle');
      expect(updated.last_name).toBe('Updated');
      expect(updated.birth_year).toBe(1990);
      expect(updated.preferred_language).toBe('es');
    });

    it('should handle clearing optional fields', async () => {
      const person = await createTestPerson({
        first_name: 'Test',
        last_name: 'Person',
        middle_name: 'Middle'
      });

      const updated = await personService.update(person.person_id, {
        middle_name: null as any
      });

      expect(updated.middle_name).toBeNull();
    });
  });

  describe('delete - Edge Cases', () => {
    it('should throw error when deleting non-existent person', async () => {
      await expect(personService.delete(99999)).rejects.toThrow();
    });

    it('should throw error when deleting negative person ID', async () => {
      await expect(personService.delete(-1)).rejects.toThrow();
    });

    it('should successfully delete person with contacts', async () => {
      const person = await createTestPerson({
        first_name: 'ToDelete',
        last_name: 'Person'
      });

      const email = await createTestEmail({
        email_address: 'delete@test.com',
        email_type: 'WORK'
      });

      await linkEmailToContact(person.person_id, email.email_id, 'PERSON', true);

      // Should not throw
      await personService.delete(person.person_id);

      // Verify person is deleted
      const result = await personService.getById(person.person_id);
      expect(result).toBeNull();
    });

    it('should handle deleting same person twice', async () => {
      const person = await createTestPerson({
        first_name: 'Once',
        last_name: 'Deleted'
      });

      await personService.delete(person.person_id);

      // Second delete should throw
      await expect(personService.delete(person.person_id)).rejects.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      // Create
      const person = await personService.create({
        first_name: 'Consistency',
        last_name: 'Test'
      });

      const personId = person.person_id;

      // Read
      const retrieved = await personService.getById(personId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.first_name).toBe('Consistency');

      // Update
      await personService.update(personId, { first_name: 'Updated' });
      const updated = await personService.getById(personId);
      expect(updated!.first_name).toBe('Updated');

      // Delete
      await personService.delete(personId);
      const deleted = await personService.getById(personId);
      expect(deleted).toBeNull();
    });

    it('should maintain accurate counts during operations', async () => {
      const initial = await personService.getAll(1, 100);
      const initialCount = initial.total;

      // Add 3 persons
      await createTestPerson({ first_name: 'P1', last_name: 'Test' });
      await createTestPerson({ first_name: 'P2', last_name: 'Test' });
      await createTestPerson({ first_name: 'P3', last_name: 'Test' });

      const afterAdd = await personService.getAll(1, 100);
      expect(afterAdd.total).toBe(initialCount + 3);
    });
  });
});
