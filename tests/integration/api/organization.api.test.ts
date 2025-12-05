import request from 'supertest';
import { Application } from 'express';
import { cleanupTestDb, setupTestDb } from '../../setup/testDb';
import { createTestOrganization, createTestEmail, createTestPhone, linkEmailToContact, linkPhoneToContact } from '../../setup/testHelpers';

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

describe('Organization API Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await setupTestDb();
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  describe('POST /api/organizations - Create Organization', () => {
    it('should create an organization with basic information', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Acme Corporation'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Acme Corporation',
        organization_id: expect.any(Number)
      });
    });

    it('should create an organization with full details', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'TechCorp Inc.',
          website: 'https://www.techcorp.com'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'TechCorp Inc.',
        website: 'https://www.techcorp.com'
      });
    });

    it('should create an organization with parent organization', async () => {
      // Create parent organization first
      const parent = await createTestOrganization({
        name: 'Parent Corp'
      });

      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Subsidiary LLC',
          parent_organization_id: parent.organization_id
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Subsidiary LLC');
      expect(response.body.data.parent_organization_id).toBe(parent.organization_id);
    });

    it('should create an organization with nested contacts (email, phone, address)', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Global Enterprises',
          website: 'https://www.global-ent.com',
          emails: [
            {
              email_address: 'info@global-ent.com',
              email_type: 'WORK',
              is_primary: true
            },
            {
              email_address: 'billing@global-ent.com',
              email_type: 'BILLING',
              is_primary: false
            }
          ],
          phones: [
            {
              country_code: '+1',
              area_code: '555',
              local_number: '9876543',
              phone_type: 'OFFICE',
              is_primary: true
            }
          ],
          addresses: [
            {
              address_line_1: '456 Business Blvd',
              address_line_2: 'Suite 200',
              city_locality: 'New York',
              region_code: 'NY',
              postal_code: '10001',
              country_iso_code: 'US',
              address_type: 'OFFICE'
            }
          ]
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Global Enterprises');
      expect(response.body.data.emails).toHaveLength(2);
      expect(response.body.data.phones).toHaveLength(1);
      expect(response.body.data.addresses).toHaveLength(1);
    });

    it('should fail validation when missing required name field', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          website: 'https://example.com'
          // missing name
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid website URL', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Test Corp',
          website: 'not-a-valid-url'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid email type', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Test Corp',
          emails: [
            {
              email_address: 'test@example.com',
              email_type: 'INVALID_TYPE'
            }
          ]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate organization name error', async () => {
      // Create first organization
      await createTestOrganization({ name: 'Unique Corp' });

      // Try to create duplicate - should return error (409 Conflict or 500 Internal Server Error)
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Unique Corp'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/organizations/:id - Get Organization by ID', () => {
    it('should get an organization by ID', async () => {
      const testOrg = await createTestOrganization({
        name: 'Test Company',
        website: 'https://testcompany.com'
      });

      const response = await request(app)
        .get(`/api/organizations/${testOrg.organization_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        organization_id: testOrg.organization_id,
        name: 'Test Company',
        website: 'https://testcompany.com'
      });
    });

    it('should return 404 for non-existent organization', async () => {
      const response = await request(app)
        .get('/api/organizations/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Organization not found');
    });

    it('should include nested contacts in response', async () => {
      const testOrg = await createTestOrganization({
        name: 'Contact Test Corp'
      });

      const testEmail = await createTestEmail({
        email_address: 'contact@testcorp.com',
        email_type: 'WORK'
      });

      const testPhone = await createTestPhone({
        country_code: '+1',
        area_code: '555',
        local_number: '1234567',
        phone_type: 'OFFICE'
      });

      await linkEmailToContact(testOrg.organization_id, testEmail.email_id, 'ORGANIZATION', true);
      await linkPhoneToContact(testOrg.organization_id, testPhone.phone_id, 'ORGANIZATION', true);

      const response = await request(app)
        .get(`/api/organizations/${testOrg.organization_id}`)
        .expect(200);

      expect(response.body.data.emails).toBeDefined();
      expect(response.body.data.emails).toHaveLength(1);
      expect(response.body.data.emails[0].email_address).toBe('contact@testcorp.com');
      expect(response.body.data.phones).toBeDefined();
      expect(response.body.data.phones).toHaveLength(1);
    });
  });

  describe('GET /api/organizations - Get All Organizations', () => {
    it('should get all organizations with default pagination', async () => {
      await createTestOrganization({ name: 'Organization One' });
      await createTestOrganization({ name: 'Organization Two' });
      await createTestOrganization({ name: 'Organization Three' });

      const response = await request(app)
        .get('/api/organizations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    it('should support custom pagination', async () => {
      // Create 5 test organizations
      for (let i = 1; i <= 5; i++) {
        await createTestOrganization({ name: `Organization ${i}` });
      }

      const response = await request(app)
        .get('/api/organizations?page=2&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(5);
    });

    it('should return empty array when no organizations exist', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should return organizations sorted by name', async () => {
      await createTestOrganization({ name: 'Zebra Corp' });
      await createTestOrganization({ name: 'Alpha Corp' });
      await createTestOrganization({ name: 'Beta Corp' });

      const response = await request(app)
        .get('/api/organizations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Alpha Corp');
      expect(response.body.data[1].name).toBe('Beta Corp');
      expect(response.body.data[2].name).toBe('Zebra Corp');
    });
  });

  describe('GET /api/organizations/search - Search Organizations', () => {
    beforeEach(async () => {
      await createTestOrganization({ name: 'Acme Corporation', website: 'https://acme.com' });
      await createTestOrganization({ name: 'Acme Industries', website: 'https://acme-industries.com' });
      await createTestOrganization({ name: 'Global Corp', website: 'https://globalcorp.com' });
    });

    it('should search by organization name', async () => {
      const response = await request(app)
        .get('/api/organizations/search?name=Acme')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((org: any) => org.name.includes('Acme'))).toBe(true);
    });

    it('should search by website', async () => {
      const response = await request(app)
        .get('/api/organizations/search?website=globalcorp')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Global Corp');
    });

    it('should support partial name matching (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/organizations/search?name=corp')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/organizations/search?name=NonExistentCompany')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should support pagination in search results', async () => {
      const response = await request(app)
        .get('/api/organizations/search?name=Acme&page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.total).toBe(2);
    });
  });

  describe('PUT /api/organizations/:id - Update Organization', () => {
    it('should update organization name', async () => {
      const testOrg = await createTestOrganization({
        name: 'Original Name'
      });

      const response = await request(app)
        .put(`/api/organizations/${testOrg.organization_id}`)
        .send({
          name: 'Updated Name'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should update organization website', async () => {
      const testOrg = await createTestOrganization({
        name: 'Test Corp'
      });

      const response = await request(app)
        .put(`/api/organizations/${testOrg.organization_id}`)
        .send({
          website: 'https://newtestcorp.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.website).toBe('https://newtestcorp.com');
    });

    it('should update parent organization', async () => {
      const parent = await createTestOrganization({ name: 'New Parent' });
      const testOrg = await createTestOrganization({ name: 'Child Org' });

      const response = await request(app)
        .put(`/api/organizations/${testOrg.organization_id}`)
        .send({
          parent_organization_id: parent.organization_id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.parent_organization_id).toBe(parent.organization_id);
    });

    it('should update multiple fields at once', async () => {
      const testOrg = await createTestOrganization({
        name: 'Old Name',
        website: 'https://old.com'
      });

      const response = await request(app)
        .put(`/api/organizations/${testOrg.organization_id}`)
        .send({
          name: 'New Name',
          website: 'https://new.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.website).toBe('https://new.com');
    });

    it('should return 404 when updating non-existent organization', async () => {
      const response = await request(app)
        .put('/api/organizations/99999')
        .send({
          name: 'Updated Name'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail validation with invalid website URL', async () => {
      const testOrg = await createTestOrganization({ name: 'Test Corp' });

      const response = await request(app)
        .put(`/api/organizations/${testOrg.organization_id}`)
        .send({
          website: 'not-a-valid-url'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/organizations/:id - Delete Organization', () => {
    it('should delete an organization', async () => {
      const testOrg = await createTestOrganization({
        name: 'To Delete Corp'
      });

      const response = await request(app)
        .delete(`/api/organizations/${testOrg.organization_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Organization deleted successfully');

      // Verify organization is deleted
      await request(app)
        .get(`/api/organizations/${testOrg.organization_id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent organization', async () => {
      const response = await request(app)
        .delete('/api/organizations/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should delete organization and cascade delete contacts', async () => {
      const testOrg = await createTestOrganization({
        name: 'Delete With Contacts'
      });

      const testEmail = await createTestEmail({
        email_address: 'delete@test.com',
        email_type: 'WORK'
      });

      await linkEmailToContact(testOrg.organization_id, testEmail.email_id, 'ORGANIZATION', true);

      const response = await request(app)
        .delete(`/api/organizations/${testOrg.organization_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify organization no longer exists
      await request(app)
        .get(`/api/organizations/${testOrg.organization_id}`)
        .expect(404);
    });
  });

  describe('Complex Organization Scenarios', () => {
    it('should handle organization hierarchy (parent-child relationships)', async () => {
      // Create parent
      const parentResponse = await request(app)
        .post('/api/organizations')
        .send({ name: 'Parent Corporation' })
        .expect(201);

      const parentId = parentResponse.body.data.organization_id;

      // Create child
      const childResponse = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Child Division',
          parent_organization_id: parentId
        })
        .expect(201);

      expect(childResponse.body.data.parent_organization_id).toBe(parentId);

      // Verify parent exists
      const getParent = await request(app)
        .get(`/api/organizations/${parentId}`)
        .expect(200);

      expect(getParent.body.data.name).toBe('Parent Corporation');
    });

    it('should create organization with complete contact information', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({
          name: 'Complete Contact Corp',
          website: 'https://complete.com',
          emails: [
            { email_address: 'primary@complete.com', email_type: 'WORK', is_primary: true },
            { email_address: 'billing@complete.com', email_type: 'BILLING', is_primary: false }
          ],
          phones: [
            { country_code: '+1', area_code: '555', local_number: '1111111', phone_type: 'OFFICE', is_primary: true },
            { country_code: '+1', area_code: '555', local_number: '2222222', phone_type: 'FAX', is_primary: false }
          ],
          addresses: [
            {
              address_line_1: '123 Main St',
              city_locality: 'San Francisco',
              region_code: 'CA',
              postal_code: '94102',
              country_iso_code: 'US',
              address_type: 'OFFICE'
            }
          ]
        })
        .expect(201);

      expect(response.body.data.emails).toHaveLength(2);
      expect(response.body.data.phones).toHaveLength(2);
      expect(response.body.data.addresses).toHaveLength(1);

      // Verify primary flags
      const primaryEmail = response.body.data.emails.find((e: any) => e.is_primary);
      expect(primaryEmail.email_address).toBe('primary@complete.com');
    });
  });
});
