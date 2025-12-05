import { OrganizationService } from '../../../src/services/organization.service';
import { cleanupTestDb, setupTestDb } from '../../setup/testDb';
import { createTestOrganization, createTestEmail, linkEmailToContact } from '../../setup/testHelpers';

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

describe('OrganizationService Unit Tests - Edge Cases', () => {
  let organizationService: OrganizationService;

  beforeAll(async () => {
    await setupTestDb();
    organizationService = new OrganizationService();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  describe('getById - Edge Cases', () => {
    it('should return null for non-existent organization ID', async () => {
      const result = await organizationService.getById(99999);
      expect(result).toBeNull();
    });

    it('should return null for negative organization ID', async () => {
      const result = await organizationService.getById(-1);
      expect(result).toBeNull();
    });

    it('should return null for zero organization ID', async () => {
      const result = await organizationService.getById(0);
      expect(result).toBeNull();
    });

    it('should handle organization with no contacts gracefully', async () => {
      const org = await createTestOrganization({
        name: 'NoContacts Corp'
      });

      const result = await organizationService.getById(org.organization_id);

      expect(result).not.toBeNull();
      expect(result!.emails).toEqual([]);
      expect(result!.phones).toEqual([]);
      expect(result!.addresses).toEqual([]);
    });

    it('should handle organization with parent reference', async () => {
      const parent = await createTestOrganization({ name: 'Parent Corp' });
      const child = await createTestOrganization({
        name: 'Child Corp',
        parent_organization_id: parent.organization_id
      });

      const result = await organizationService.getById(child.organization_id);

      expect(result).not.toBeNull();
      expect(result!.parent_organization_id).toBe(parent.organization_id);
    });
  });

  describe('getAll - Pagination Edge Cases', () => {
    it('should handle empty database', async () => {
      const result = await organizationService.getAll(1, 20);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle page beyond available data', async () => {
      await createTestOrganization({ name: 'Only Org' });

      const result = await organizationService.getAll(999, 20);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(999);
    });

    it('should handle limit of 1', async () => {
      await createTestOrganization({ name: 'Org One' });
      await createTestOrganization({ name: 'Org Two' });

      const result = await organizationService.getAll(1, 1);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(1);
    });

    it('should return organizations sorted by name', async () => {
      await createTestOrganization({ name: 'Zebra Corp' });
      await createTestOrganization({ name: 'Alpha Corp' });
      await createTestOrganization({ name: 'Beta Corp' });

      const result = await organizationService.getAll(1, 10);

      expect(result.data[0].name).toBe('Alpha Corp');
      expect(result.data[1].name).toBe('Beta Corp');
      expect(result.data[2].name).toBe('Zebra Corp');
    });

    it('should handle very large limit', async () => {
      await createTestOrganization({ name: 'Test Org' });

      const result = await organizationService.getAll(1, 1000);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(1000);
    });
  });

  describe('search - Edge Cases', () => {
    beforeEach(async () => {
      await createTestOrganization({ name: 'Acme Corporation', website: 'https://acme.com' });
      await createTestOrganization({ name: 'Beta Industries', website: 'https://beta.com' });
      await createTestOrganization({ name: 'Global Corp', website: 'https://global.com' });
    });

    it('should return empty array when no filters match', async () => {
      const result = await organizationService.search({
        name: 'NonExistent',
        page: 1,
        limit: 20
      });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle search with empty string', async () => {
      const result = await organizationService.search({
        name: '',
        page: 1,
        limit: 20
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('should handle case-insensitive name search', async () => {
      const result = await organizationService.search({
        name: 'acme',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].name.toLowerCase()).toContain('acme');
    });

    it('should handle partial name matching', async () => {
      const result = await organizationService.search({
        name: 'Corp',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle website search', async () => {
      const result = await organizationService.search({
        website: 'beta',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].website).toContain('beta');
    });

    it('should handle multiple search criteria', async () => {
      const result = await organizationService.search({
        name: 'Acme',
        website: 'acme.com',
        page: 1,
        limit: 20
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Acme Corporation');
    });

    it('should handle pagination in search results', async () => {
      await createTestOrganization({ name: 'TestCorp A' });
      await createTestOrganization({ name: 'TestCorp B' });
      await createTestOrganization({ name: 'TestCorp C' });

      const page1 = await organizationService.search({
        name: 'TestCorp',
        page: 1,
        limit: 2
      });

      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page1.page).toBe(1);
    });
  });

  describe('create - Edge Cases', () => {
    it('should create organization with minimal required fields', async () => {
      const org = await organizationService.create({
        name: 'Minimal Corp'
      });

      expect(org.name).toBe('Minimal Corp');
      expect(org.organization_id).toBeDefined();
      expect(org.website).toBeNull();
      expect(org.parent_organization_id).toBeNull();
    });

    it('should handle organization with maximum name length', async () => {
      const longName = 'A'.repeat(200);

      const org = await organizationService.create({
        name: longName
      });

      expect(org.name).toBe(longName);
    });

    it('should handle organization with parent', async () => {
      const parent = await createTestOrganization({ name: 'Parent' });

      const child = await organizationService.create({
        name: 'Child',
        parent_organization_id: parent.organization_id
      });

      expect(child.parent_organization_id).toBe(parent.organization_id);
    });

    it('should handle organization with website', async () => {
      const org = await organizationService.create({
        name: 'Web Corp',
        website: 'https://example.com'
      });

      expect(org.website).toBe('https://example.com');
    });

    it('should throw error for duplicate organization name', async () => {
      await createTestOrganization({ name: 'Unique Name' });

      await expect(
        organizationService.create({ name: 'Unique Name' })
      ).rejects.toThrow();
    });
  });

  describe('update - Edge Cases', () => {
    it('should update only specified fields', async () => {
      const org = await createTestOrganization({
        name: 'Original Name',
        website: 'https://original.com'
      });

      const updated = await organizationService.update(org.organization_id, {
        name: 'Updated Name'
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.website).toBe('https://original.com');
    });

    it('should handle updating with empty object', async () => {
      const org = await createTestOrganization({
        name: 'NoChange Corp'
      });

      const updated = await organizationService.update(org.organization_id, {});

      expect(updated.name).toBe('NoChange Corp');
    });

    it('should throw error when updating non-existent organization', async () => {
      await expect(
        organizationService.update(99999, { name: 'Updated' })
      ).rejects.toThrow();
    });

    it('should handle updating parent organization', async () => {
      const parent1 = await createTestOrganization({ name: 'Parent 1' });
      const parent2 = await createTestOrganization({ name: 'Parent 2' });
      const child = await createTestOrganization({
        name: 'Child',
        parent_organization_id: parent1.organization_id
      });

      const updated = await organizationService.update(child.organization_id, {
        parent_organization_id: parent2.organization_id
      });

      expect(updated.parent_organization_id).toBe(parent2.organization_id);
    });

    it('should handle removing parent organization', async () => {
      const parent = await createTestOrganization({ name: 'Parent' });
      const child = await createTestOrganization({
        name: 'Child',
        parent_organization_id: parent.organization_id
      });

      const updated = await organizationService.update(child.organization_id, {
        parent_organization_id: null as any
      });

      expect(updated.parent_organization_id).toBeNull();
    });

    it('should handle updating all fields at once', async () => {
      const parent = await createTestOrganization({ name: 'New Parent' });
      const org = await createTestOrganization({
        name: 'Old Name'
      });

      const updated = await organizationService.update(org.organization_id, {
        name: 'New Name',
        website: 'https://new.com',
        parent_organization_id: parent.organization_id
      });

      expect(updated.name).toBe('New Name');
      expect(updated.website).toBe('https://new.com');
      expect(updated.parent_organization_id).toBe(parent.organization_id);
    });
  });

  describe('delete - Edge Cases', () => {
    it('should throw error when deleting non-existent organization', async () => {
      await expect(organizationService.delete(99999)).rejects.toThrow();
    });

    it('should throw error when deleting negative organization ID', async () => {
      await expect(organizationService.delete(-1)).rejects.toThrow();
    });

    it('should successfully delete organization with contacts', async () => {
      const org = await createTestOrganization({
        name: 'ToDelete Corp'
      });

      const email = await createTestEmail({
        email_address: 'delete@org.com',
        email_type: 'WORK'
      });

      await linkEmailToContact(org.organization_id, email.email_id, 'ORGANIZATION', true);

      await organizationService.delete(org.organization_id);

      const result = await organizationService.getById(org.organization_id);
      expect(result).toBeNull();
    });

    it('should handle deleting same organization twice', async () => {
      const org = await createTestOrganization({
        name: 'Once Deleted'
      });

      await organizationService.delete(org.organization_id);

      await expect(organizationService.delete(org.organization_id)).rejects.toThrow();
    });

    it('should handle deleting parent organization', async () => {
      const parent = await createTestOrganization({ name: 'Parent to Delete' });

      // This should succeed if there are no children, or fail if there are
      // Depends on FK constraints
      await organizationService.delete(parent.organization_id);

      const result = await organizationService.getById(parent.organization_id);
      expect(result).toBeNull();
    });
  });

  describe('Organization Hierarchy', () => {
    it('should support multi-level hierarchy', async () => {
      const grandparent = await createTestOrganization({ name: 'Grandparent' });
      const parent = await createTestOrganization({
        name: 'Parent',
        parent_organization_id: grandparent.organization_id
      });
      const child = await createTestOrganization({
        name: 'Child',
        parent_organization_id: parent.organization_id
      });

      expect(child.parent_organization_id).toBe(parent.organization_id);

      const retrievedParent = await organizationService.getById(parent.organization_id);
      expect(retrievedParent!.parent_organization_id).toBe(grandparent.organization_id);
    });

    it('should handle orphan organizations (no parent)', async () => {
      const orphan = await createTestOrganization({ name: 'Orphan Corp' });

      expect(orphan.parent_organization_id).toBeNull();

      const retrieved = await organizationService.getById(orphan.organization_id);
      expect(retrieved!.parent_organization_id).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      // Create
      const org = await organizationService.create({
        name: 'Consistency Corp'
      });

      const orgId = org.organization_id;

      // Read
      const retrieved = await organizationService.getById(orgId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe('Consistency Corp');

      // Update
      await organizationService.update(orgId, { name: 'Updated Corp' });
      const updated = await organizationService.getById(orgId);
      expect(updated!.name).toBe('Updated Corp');

      // Delete
      await organizationService.delete(orgId);
      const deleted = await organizationService.getById(orgId);
      expect(deleted).toBeNull();
    });

    it('should maintain accurate counts during operations', async () => {
      const initial = await organizationService.getAll(1, 100);
      const initialCount = initial.total;

      await createTestOrganization({ name: 'O1' });
      await createTestOrganization({ name: 'O2' });
      await createTestOrganization({ name: 'O3' });

      const afterAdd = await organizationService.getAll(1, 100);
      expect(afterAdd.total).toBe(initialCount + 3);
    });

    it('should handle concurrent operations safely', async () => {
      // Create multiple organizations concurrently
      const promises = [
        organizationService.create({ name: 'Concurrent 1' }),
        organizationService.create({ name: 'Concurrent 2' }),
        organizationService.create({ name: 'Concurrent 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(new Set(results.map(r => r.organization_id)).size).toBe(3);
    });
  });
});
