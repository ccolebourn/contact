import { getTestPool } from './testDb';

/**
 * Helper to create a test person in the database
 */
export async function createTestPerson(data: {
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  preferred_language?: string;
  household_id?: number;
}): Promise<any> {
  const pool = getTestPool();
  const result = await pool.query(
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
  return result.rows[0];
}

/**
 * Helper to create a test organization
 */
export async function createTestOrganization(data: {
  name: string;
  website?: string;
  parent_organization_id?: number;
}): Promise<any> {
  const pool = getTestPool();
  const result = await pool.query(
    `INSERT INTO Organization (name, website, parent_organization_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.website || null, data.parent_organization_id || null]
  );
  return result.rows[0];
}

/**
 * Helper to create a test email
 */
export async function createTestEmail(data: {
  email_address: string;
  email_type: string;
}): Promise<any> {
  const pool = getTestPool();
  const result = await pool.query(
    `INSERT INTO Email (email_address, email_type)
     VALUES ($1, $2)
     ON CONFLICT (email_address) DO UPDATE SET email_address = EXCLUDED.email_address
     RETURNING *`,
    [data.email_address, data.email_type]
  );
  return result.rows[0];
}

/**
 * Helper to create a test phone
 */
export async function createTestPhone(data: {
  country_code?: string;
  area_code?: string;
  local_number: string;
  phone_type: string;
  extension?: string;
}): Promise<any> {
  const pool = getTestPool();
  const result = await pool.query(
    `INSERT INTO Phone (country_code, area_code, local_number, phone_type, extension)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.country_code || null,
      data.area_code || null,
      data.local_number,
      data.phone_type,
      data.extension || null
    ]
  );
  return result.rows[0];
}

/**
 * Helper to create a test address
 */
export async function createTestAddress(data: {
  address_line_1: string;
  address_line_2?: string;
  address_line_3?: string;
  city_locality: string;
  region_code?: string;
  postal_code?: string;
  country_iso_code: string;
}): Promise<any> {
  const pool = getTestPool();
  const result = await pool.query(
    `INSERT INTO Address (address_line_1, address_line_2, address_line_3, city_locality, region_code, postal_code, country_iso_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.address_line_1,
      data.address_line_2 || null,
      data.address_line_3 || null,
      data.city_locality,
      data.region_code || null,
      data.postal_code || null,
      data.country_iso_code
    ]
  );
  return result.rows[0];
}

/**
 * Helper to link an email to a contact
 */
export async function linkEmailToContact(
  contactId: number,
  emailId: number,
  contactEntityType: 'PERSON' | 'ORGANIZATION',
  isPrimary: boolean = false
): Promise<void> {
  const pool = getTestPool();
  await pool.query(
    `INSERT INTO ContactEmail (contact_id, email_id, contact_entity_type, is_primary)
     VALUES ($1, $2, $3, $4)`,
    [contactId, emailId, contactEntityType, isPrimary]
  );
}

/**
 * Helper to link a phone to a contact
 */
export async function linkPhoneToContact(
  contactId: number,
  phoneId: number,
  contactEntityType: 'PERSON' | 'ORGANIZATION',
  isPrimary: boolean = false
): Promise<void> {
  const pool = getTestPool();
  await pool.query(
    `INSERT INTO ContactPhone (contact_id, phone_id, contact_entity_type, is_primary)
     VALUES ($1, $2, $3, $4)`,
    [contactId, phoneId, contactEntityType, isPrimary]
  );
}

/**
 * Helper to link an address to a contact
 */
export async function linkAddressToContact(
  contactId: number,
  addressId: number,
  contactEntityType: 'PERSON' | 'ORGANIZATION',
  addressType: string = 'HOME'
): Promise<void> {
  const pool = getTestPool();
  await pool.query(
    `INSERT INTO ContactAddress (contact_id, address_id, contact_entity_type, address_type)
     VALUES ($1, $2, $3, $4)`,
    [contactId, addressId, contactEntityType, addressType]
  );
}
