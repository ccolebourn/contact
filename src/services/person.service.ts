import pool from '../config/database';
import { PoolClient } from 'pg';
import {
  Person,
  Email,
  Phone,
  Address,
  CreatePersonRequest,
  ContactEntityType,
  AddressType
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class PersonService {
  // Get person by ID with all nested contacts
  async getById(personId: number): Promise<Person | null> {
    const client = await pool.connect();
    try {
      const person = await this.getPersonWithContacts(client, personId);
      return person;
    } finally {
      client.release();
    }
  }

  // Get all persons with pagination
  async getAll(page: number = 1, limit: number = 20): Promise<{ data: Person[]; total: number; page: number; limit: number }> {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await client.query('SELECT COUNT(*) FROM Person');
      const total = parseInt(countResult.rows[0].count);

      // Get persons with pagination
      const personsResult = await client.query(
        'SELECT * FROM Person ORDER BY last_name, first_name LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      // Fetch contacts for each person
      const persons = await Promise.all(
        personsResult.rows.map(row => this.getPersonWithContacts(client, row.person_id))
      );

      return {
        data: persons.filter((p): p is Person => p !== null),
        total,
        page,
        limit
      };
    } finally {
      client.release();
    }
  }

  // Search persons
  async search(filters: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    household_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Person[]; total: number; page: number; limit: number }> {
    const client = await pool.connect();
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let query = 'SELECT DISTINCT p.* FROM Person p';
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (filters.first_name) {
        paramCount++;
        whereClauses.push(`p.first_name ILIKE $${paramCount}`);
        values.push(`%${filters.first_name}%`);
      }

      if (filters.last_name) {
        paramCount++;
        whereClauses.push(`p.last_name ILIKE $${paramCount}`);
        values.push(`%${filters.last_name}%`);
      }

      if (filters.household_id) {
        paramCount++;
        whereClauses.push(`p.household_id = $${paramCount}`);
        values.push(filters.household_id);
      }

      if (filters.email) {
        query += ` JOIN ContactEmail ce ON ce.contact_id = p.person_id AND ce.contact_entity_type = 'PERSON'
                   JOIN Email e ON e.email_id = ce.email_id`;
        paramCount++;
        whereClauses.push(`e.email_address ILIKE $${paramCount}`);
        values.push(`%${filters.email}%`);
      }

      if (filters.phone) {
        query += ` JOIN ContactPhone cp ON cp.contact_id = p.person_id AND cp.contact_entity_type = 'PERSON'
                   JOIN Phone ph ON ph.phone_id = cp.phone_id`;
        paramCount++;
        whereClauses.push(`ph.local_number ILIKE $${paramCount}`);
        values.push(`%${filters.phone}%`);
      }

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      // Get total count
      const countQuery = `SELECT COUNT(DISTINCT p.person_id) ${query.substring(query.indexOf('FROM'))}`;
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add ordering and pagination
      query += ' ORDER BY p.last_name, p.first_name LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
      values.push(limit, offset);

      const personsResult = await client.query(query, values);

      // Fetch contacts for each person
      const persons = await Promise.all(
        personsResult.rows.map(row => this.getPersonWithContacts(client, row.person_id))
      );

      return {
        data: persons.filter((p): p is Person => p !== null),
        total,
        page,
        limit
      };
    } finally {
      client.release();
    }
  }

  // Create person with nested contacts
  async create(data: CreatePersonRequest): Promise<Person> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert person
      const personResult = await client.query(
        `INSERT INTO Person (first_name, middle_name, last_name, birth_year, birth_month, birth_day, preferred_language, household_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.first_name,
          data.middle_name || null,
          data.last_name,
          data.birth_year || null,
          data.birth_month || null,
          data.birth_day || null,
          data.preferred_language || null,
          data.household_id || null
        ]
      );

      const person = personResult.rows[0];
      const personId = person.person_id;

      // Insert emails
      if (data.emails && data.emails.length > 0) {
        await this.addEmails(client, personId, data.emails);
      }

      // Insert phones
      if (data.phones && data.phones.length > 0) {
        await this.addPhones(client, personId, data.phones);
      }

      // Insert addresses
      if (data.addresses && data.addresses.length > 0) {
        await this.addAddresses(client, personId, data.addresses);
      }

      await client.query('COMMIT');

      // Fetch complete person with contacts
      const completePerson = await this.getPersonWithContacts(client, personId);
      if (!completePerson) {
        throw new AppError('Failed to retrieve created person', 500);
      }

      return completePerson;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update person
  async update(personId: number, data: Partial<CreatePersonRequest>): Promise<Person> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if person exists
      const existingPerson = await client.query('SELECT * FROM Person WHERE person_id = $1', [personId]);
      if (existingPerson.rows.length === 0) {
        throw new AppError('Person not found', 404);
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      const fields = ['first_name', 'middle_name', 'last_name', 'birth_year', 'birth_month', 'birth_day', 'preferred_language', 'household_id'];

      fields.forEach(field => {
        if (field in data) {
          paramCount++;
          updates.push(`${field} = $${paramCount}`);
          values.push((data as any)[field] || null);
        }
      });

      if (updates.length > 0) {
        paramCount++;
        values.push(personId);
        const updateQuery = `UPDATE Person SET ${updates.join(', ')} WHERE person_id = $${paramCount} RETURNING *`;
        await client.query(updateQuery, values);
      }

      await client.query('COMMIT');

      const updatedPerson = await this.getPersonWithContacts(client, personId);
      if (!updatedPerson) {
        throw new AppError('Failed to retrieve updated person', 500);
      }

      return updatedPerson;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete person
  async delete(personId: number): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM Person WHERE person_id = $1', [personId]);
      if (result.rowCount === 0) {
        throw new AppError('Person not found', 404);
      }
    } finally {
      client.release();
    }
  }

  // Helper: Get person with all contacts
  private async getPersonWithContacts(client: PoolClient, personId: number): Promise<Person | null> {
    console.log('Fetching person with ID:', personId);
    const personResult = await client.query('SELECT * FROM Person WHERE person_id = $1', [personId]);
    if (personResult.rows.length === 0) {
      return null;
    }

    const person = personResult.rows[0];

    // Fetch emails
    const emails = await this.getEmails(client, personId);

    // Fetch phones
    const phones = await this.getPhones(client, personId);

    // Fetch addresses
    const addresses = await this.getAddresses(client, personId);

    return {
      ...person,
      emails,
      phones,
      addresses
    };
  }

  // Helper: Get emails for a person
  private async getEmails(client: PoolClient, personId: number): Promise<Email[]> {
    const result = await client.query(
      `SELECT e.*, ce.is_primary
       FROM Email e
       JOIN ContactEmail ce ON ce.email_id = e.email_id
       WHERE ce.contact_id = $1 AND ce.contact_entity_type = $2
       ORDER BY ce.is_primary DESC, e.email_id`,
      [personId, ContactEntityType.PERSON]
    );
    return result.rows;
  }

  // Helper: Get phones for a person
  private async getPhones(client: PoolClient, personId: number): Promise<Phone[]> {
    const result = await client.query(
      `SELECT p.*, cp.is_primary
       FROM Phone p
       JOIN ContactPhone cp ON cp.phone_id = p.phone_id
       WHERE cp.contact_id = $1 AND cp.contact_entity_type = $2
       ORDER BY cp.is_primary DESC, p.phone_id`,
      [personId, ContactEntityType.PERSON]
    );
    return result.rows;
  }

  // Helper: Get addresses for a person
  private async getAddresses(client: PoolClient, personId: number): Promise<Address[]> {
    const result = await client.query(
      `SELECT a.*, ca.address_type,
              CASE WHEN a.address_id = (SELECT primary_address_id FROM Household h WHERE h.household_id =
                (SELECT household_id FROM Person WHERE person_id = $1)) THEN true ELSE false END as is_primary
       FROM Address a
       JOIN ContactAddress ca ON ca.address_id = a.address_id
       WHERE ca.contact_id = $1 AND ca.contact_entity_type = $2
       ORDER BY a.is_primary DESC, a.address_id`,
      [personId, ContactEntityType.PERSON]
    );
    return result.rows;
  }

  // Helper: Add emails
  private async addEmails(client: PoolClient, personId: number, emails: CreatePersonRequest['emails']): Promise<void> {
    if (!emails || emails.length === 0) return;

    for (const emailData of emails) {
      // Insert email
      const emailResult = await client.query(
        'INSERT INTO Email (email_address, email_type) VALUES ($1, $2) ON CONFLICT (email_address) DO UPDATE SET email_address = EXCLUDED.email_address RETURNING email_id',
        [emailData.email_address, emailData.email_type]
      );
      const emailId = emailResult.rows[0].email_id;

      // Link to person
      await client.query(
        'INSERT INTO ContactEmail (contact_id, email_id, contact_entity_type, is_primary) VALUES ($1, $2, $3, $4)',
        [personId, emailId, ContactEntityType.PERSON, emailData.is_primary || false]
      );
    }
  }

  // Helper: Add phones
  private async addPhones(client: PoolClient, personId: number, phones: CreatePersonRequest['phones']): Promise<void> {
    if (!phones || phones.length === 0) return;

    for (const phoneData of phones) {
      // Insert phone
      const phoneResult = await client.query(
        'INSERT INTO Phone (country_code, area_code, local_number, phone_type, extension) VALUES ($1, $2, $3, $4, $5) RETURNING phone_id',
        [phoneData.country_code || null, phoneData.area_code || null, phoneData.local_number, phoneData.phone_type, phoneData.extension || null]
      );
      const phoneId = phoneResult.rows[0].phone_id;

      // Link to person
      await client.query(
        'INSERT INTO ContactPhone (contact_id, phone_id, contact_entity_type, is_primary) VALUES ($1, $2, $3, $4)',
        [personId, phoneId, ContactEntityType.PERSON, phoneData.is_primary || false]
      );
    }
  }

  // Helper: Add addresses
  private async addAddresses(client: PoolClient, personId: number, addresses: CreatePersonRequest['addresses']): Promise<void> {
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

      // Link to person
      await client.query(
        'INSERT INTO ContactAddress (contact_id, address_id, address_type, contact_entity_type) VALUES ($1, $2, $3, $4)',
        [personId, addressId, addressData.address_type || AddressType.HOME, ContactEntityType.PERSON]
      );
    }
  }
}
