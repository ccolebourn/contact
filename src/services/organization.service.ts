import pool from '../config/database';
import { PoolClient } from 'pg';
import {
  Organization,
  Email,
  Phone,
  Address,
  CreateOrganizationRequest,
  ContactEntityType,
  AddressType
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrganizationService {
  // Get organization by ID with all nested contacts
  async getById(organizationId: number): Promise<Organization | null> {
    const client = await pool.connect();
    try {
      const organization = await this.getOrganizationWithContacts(client, organizationId);
      return organization;
    } finally {
      client.release();
    }
  }

  // Get all organizations with pagination
  async getAll(page: number = 1, limit: number = 20): Promise<{ data: Organization[]; total: number; page: number; limit: number }> {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await client.query('SELECT COUNT(*) FROM Organization');
      const total = parseInt(countResult.rows[0].count);

      // Get organizations with pagination
      const orgsResult = await client.query(
        'SELECT * FROM Organization ORDER BY name LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      // Fetch contacts for each organization
      const organizations = await Promise.all(
        orgsResult.rows.map(row => this.getOrganizationWithContacts(client, row.organization_id))
      );

      return {
        data: organizations.filter((o): o is Organization => o !== null),
        total,
        page,
        limit
      };
    } finally {
      client.release();
    }
  }

  // Search organizations
  async search(filters: {
    name?: string;
    website?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Organization[]; total: number; page: number; limit: number }> {
    const client = await pool.connect();
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM Organization';
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (filters.name) {
        paramCount++;
        whereClauses.push(`name ILIKE $${paramCount}`);
        values.push(`%${filters.name}%`);
      }

      if (filters.website) {
        paramCount++;
        whereClauses.push(`website ILIKE $${paramCount}`);
        values.push(`%${filters.website}%`);
      }

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) ${query.substring(query.indexOf('FROM'))}`;
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add ordering and pagination
      query += ' ORDER BY name LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
      values.push(limit, offset);

      const orgsResult = await client.query(query, values);

      // Fetch contacts for each organization
      const organizations = await Promise.all(
        orgsResult.rows.map(row => this.getOrganizationWithContacts(client, row.organization_id))
      );

      return {
        data: organizations.filter((o): o is Organization => o !== null),
        total,
        page,
        limit
      };
    } finally {
      client.release();
    }
  }

  // Create organization with nested contacts
  async create(data: CreateOrganizationRequest): Promise<Organization> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert organization
      const orgResult = await client.query(
        `INSERT INTO Organization (name, website, parent_organization_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [
          data.name,
          data.website || null,
          data.parent_organization_id || null
        ]
      );

      const organization = orgResult.rows[0];
      const organizationId = organization.organization_id;

      // Insert emails
      if (data.emails && data.emails.length > 0) {
        await this.addEmails(client, organizationId, data.emails);
      }

      // Insert phones
      if (data.phones && data.phones.length > 0) {
        await this.addPhones(client, organizationId, data.phones);
      }

      // Insert addresses
      if (data.addresses && data.addresses.length > 0) {
        await this.addAddresses(client, organizationId, data.addresses);
      }

      await client.query('COMMIT');

      // Fetch complete organization with contacts
      const completeOrg = await this.getOrganizationWithContacts(client, organizationId);
      if (!completeOrg) {
        throw new AppError('Failed to retrieve created organization', 500);
      }

      return completeOrg;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update organization
  async update(organizationId: number, data: Partial<CreateOrganizationRequest>): Promise<Organization> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if organization exists
      const existingOrg = await client.query('SELECT * FROM Organization WHERE organization_id = $1', [organizationId]);
      if (existingOrg.rows.length === 0) {
        throw new AppError('Organization not found', 404);
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      const fields = ['name', 'website', 'parent_organization_id'];

      fields.forEach(field => {
        if (field in data) {
          paramCount++;
          updates.push(`${field} = $${paramCount}`);
          values.push((data as any)[field] || null);
        }
      });

      if (updates.length > 0) {
        paramCount++;
        values.push(organizationId);
        const updateQuery = `UPDATE Organization SET ${updates.join(', ')} WHERE organization_id = $${paramCount} RETURNING *`;
        await client.query(updateQuery, values);
      }

      await client.query('COMMIT');

      const updatedOrg = await this.getOrganizationWithContacts(client, organizationId);
      if (!updatedOrg) {
        throw new AppError('Failed to retrieve updated organization', 500);
      }

      return updatedOrg;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete organization
  async delete(organizationId: number): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM Organization WHERE organization_id = $1', [organizationId]);
      if (result.rowCount === 0) {
        throw new AppError('Organization not found', 404);
      }
    } finally {
      client.release();
    }
  }

  // Helper: Get organization with all contacts
  private async getOrganizationWithContacts(client: PoolClient, organizationId: number): Promise<Organization | null> {
    const orgResult = await client.query('SELECT * FROM Organization WHERE organization_id = $1', [organizationId]);
    if (orgResult.rows.length === 0) {
      return null;
    }

    const organization = orgResult.rows[0];

    // Fetch emails
    const emails = await this.getEmails(client, organizationId);

    // Fetch phones
    const phones = await this.getPhones(client, organizationId);

    // Fetch addresses
    const addresses = await this.getAddresses(client, organizationId);

    return {
      ...organization,
      emails,
      phones,
      addresses
    };
  }

  // Helper: Get emails for an organization
  private async getEmails(client: PoolClient, organizationId: number): Promise<Email[]> {
    const result = await client.query(
      `SELECT e.*, ce.is_primary
       FROM Email e
       JOIN ContactEmail ce ON ce.email_id = e.email_id
       WHERE ce.contact_id = $1 AND ce.contact_entity_type = $2
       ORDER BY ce.is_primary DESC, e.email_id`,
      [organizationId, ContactEntityType.ORGANIZATION]
    );
    return result.rows;
  }

  // Helper: Get phones for an organization
  private async getPhones(client: PoolClient, organizationId: number): Promise<Phone[]> {
    const result = await client.query(
      `SELECT p.*, cp.is_primary
       FROM Phone p
       JOIN ContactPhone cp ON cp.phone_id = p.phone_id
       WHERE cp.contact_id = $1 AND cp.contact_entity_type = $2
       ORDER BY cp.is_primary DESC, p.phone_id`,
      [organizationId, ContactEntityType.ORGANIZATION]
    );
    return result.rows;
  }

  // Helper: Get addresses for an organization
  private async getAddresses(client: PoolClient, organizationId: number): Promise<Address[]> {
    const result = await client.query(
      `SELECT a.*, ca.address_type, false as is_primary
       FROM Address a
       JOIN ContactAddress ca ON ca.address_id = a.address_id
       WHERE ca.contact_id = $1 AND ca.contact_entity_type = $2
       ORDER BY a.address_id`,
      [organizationId, ContactEntityType.ORGANIZATION]
    );
    return result.rows;
  }

  // Helper: Add emails
  private async addEmails(client: PoolClient, organizationId: number, emails: CreateOrganizationRequest['emails']): Promise<void> {
    if (!emails || emails.length === 0) return;

    for (const emailData of emails) {
      // Insert email
      const emailResult = await client.query(
        'INSERT INTO Email (email_address, email_type) VALUES ($1, $2) ON CONFLICT (email_address) DO UPDATE SET email_address = EXCLUDED.email_address RETURNING email_id',
        [emailData.email_address, emailData.email_type]
      );
      const emailId = emailResult.rows[0].email_id;

      // Link to organization
      await client.query(
        'INSERT INTO ContactEmail (contact_id, email_id, contact_entity_type, is_primary) VALUES ($1, $2, $3, $4)',
        [organizationId, emailId, ContactEntityType.ORGANIZATION, emailData.is_primary || false]
      );
    }
  }

  // Helper: Add phones
  private async addPhones(client: PoolClient, organizationId: number, phones: CreateOrganizationRequest['phones']): Promise<void> {
    if (!phones || phones.length === 0) return;

    for (const phoneData of phones) {
      // Insert phone
      const phoneResult = await client.query(
        'INSERT INTO Phone (country_code, area_code, local_number, phone_type, extension) VALUES ($1, $2, $3, $4, $5) RETURNING phone_id',
        [phoneData.country_code || null, phoneData.area_code || null, phoneData.local_number, phoneData.phone_type, phoneData.extension || null]
      );
      const phoneId = phoneResult.rows[0].phone_id;

      // Link to organization
      await client.query(
        'INSERT INTO ContactPhone (contact_id, phone_id, contact_entity_type, is_primary) VALUES ($1, $2, $3, $4)',
        [organizationId, phoneId, ContactEntityType.ORGANIZATION, phoneData.is_primary || false]
      );
    }
  }

  // Helper: Add addresses
  private async addAddresses(client: PoolClient, organizationId: number, addresses: CreateOrganizationRequest['addresses']): Promise<void> {
    if (!addresses || addresses.length === 0) return;

    for (const addressData of addresses) {
      // Insert address
      const addressResult = await client.query(
        'INSERT INTO Address (address_line_1, address_line_2, address_line_3, city_locality, region_code, postal_code, country_iso_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING address_id',
        [
          addressData.address_line_1,
          addressData.address_line_2 || null,
          addressData.address_line_3 || null,
          addressData.city_locality,
          addressData.region_code || null,
          addressData.postal_code || null,
          addressData.country_iso_code
        ]
      );
      const addressId = addressResult.rows[0].address_id;

      // Link to organization
      await client.query(
        'INSERT INTO ContactAddress (contact_id, address_id, address_type, contact_entity_type) VALUES ($1, $2, $3, $4)',
        [organizationId, addressId, addressData.address_type || AddressType.OFFICE, ContactEntityType.ORGANIZATION]
      );
    }
  }
}
