import { newDb, IMemoryDb } from 'pg-mem';
import { Pool } from 'pg';

let testDb: IMemoryDb;
let testPool: Pool;

/**
 * Initialize the in-memory test database with schema
 */
export async function setupTestDb(): Promise<Pool> {
  // Create a new in-memory database instance
  testDb = newDb();

  // Create the schema
  testDb.public.none(`
    -- Country Lookup
    CREATE TABLE Country (
      iso_code_2 CHAR(2) PRIMARY KEY,
      country_name VARCHAR(100) NOT NULL
    );

    -- Insert test countries
    INSERT INTO Country (iso_code_2, country_name) VALUES
    ('US', 'United States of America'),
    ('CA', 'Canada'),
    ('GB', 'United Kingdom of Great Britain and Northern Ireland');

    -- Region Table
    CREATE TABLE Region (
      country_iso_code CHAR(2) NOT NULL,
      region_code VARCHAR(10) NOT NULL,
      name VARCHAR(150) NOT NULL,
      type VARCHAR(50),
      PRIMARY KEY (country_iso_code, region_code),
      CONSTRAINT fk_region_country FOREIGN KEY (country_iso_code)
        REFERENCES Country(iso_code_2)
    );

    -- Insert test regions
    INSERT INTO Region (country_iso_code, region_code, name, type) VALUES
    ('US', 'CA', 'California', 'State'),
    ('US', 'NY', 'New York', 'State'),
    ('US', 'TX', 'Texas', 'State'),
    ('CA', 'ON', 'Ontario', 'Province'),
    ('CA', 'BC', 'British Columbia', 'Province');

    -- Address Table
    CREATE TABLE Address (
      address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      address_line_1 VARCHAR(255) NOT NULL,
      address_line_2 VARCHAR(255),
      address_line_3 VARCHAR(255),
      city_locality VARCHAR(100) NOT NULL,
      region_code VARCHAR(10),
      postal_code VARCHAR(20),
      country_iso_code CHAR(2) NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT fk_address_region_composite
      FOREIGN KEY (country_iso_code, region_code)
      REFERENCES Region(country_iso_code, region_code)
    );

    -- Household Table
    CREATE TABLE Household (
      household_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      household_name VARCHAR(100) NOT NULL,
      primary_address_id INT,
      CONSTRAINT fk_primary_address FOREIGN KEY (primary_address_id) REFERENCES Address(address_id)
    );

    -- Person Table
    CREATE TABLE Person (
      person_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      birth_year SMALLINT,
      birth_month SMALLINT,
      birth_day SMALLINT,
      preferred_language VARCHAR(5),
      household_id INT,
      CONSTRAINT fk_household FOREIGN KEY (household_id) REFERENCES Household(household_id)
    );

    -- Organization Table
    CREATE TABLE Organization (
      organization_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(200) UNIQUE NOT NULL,
      website VARCHAR(255),
      parent_organization_id INT,
      CONSTRAINT fk_parent_org FOREIGN KEY (parent_organization_id) REFERENCES Organization(organization_id)
    );

    -- Email Type ENUM
    CREATE TYPE email_type_enum AS ENUM ('WORK', 'PERSONAL', 'BILLING', 'OTHER');

    -- Phone Type ENUM
    CREATE TYPE phone_type_enum AS ENUM ('MOBILE', 'OFFICE', 'HOME', 'FAX', 'OTHER');

    -- Email Table
    CREATE TABLE Email (
      email_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email_address VARCHAR(255) UNIQUE NOT NULL,
      email_type email_type_enum NOT NULL
    );

    -- Phone Table
    CREATE TABLE Phone (
      phone_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      country_code VARCHAR(10),
      area_code VARCHAR(10),
      local_number VARCHAR(20) NOT NULL,
      phone_type phone_type_enum NOT NULL,
      extension VARCHAR(10)
    );

    -- ContactEmail Table
    CREATE TABLE ContactEmail (
      contact_email_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      contact_id INT NOT NULL,
      email_id INT NOT NULL,
      contact_entity_type VARCHAR(20) NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT fk_ce_email FOREIGN KEY (email_id) REFERENCES Email(email_id),
      CONSTRAINT uq_contact_email UNIQUE (contact_id, contact_entity_type, email_id)
    );

    -- ContactPhone Table
    CREATE TABLE ContactPhone (
      contact_phone_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      contact_id INT NOT NULL,
      phone_id INT NOT NULL,
      contact_entity_type VARCHAR(20) NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT fk_cp_phone FOREIGN KEY (phone_id) REFERENCES Phone(phone_id),
      CONSTRAINT uq_contact_phone UNIQUE (contact_id, contact_entity_type, phone_id)
    );

    -- ContactAddress Table
    CREATE TABLE ContactAddress (
      contact_address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      contact_id INT NOT NULL,
      address_id INT NOT NULL,
      address_type VARCHAR(20) NOT NULL,
      contact_entity_type VARCHAR(20) NOT NULL,
      CONSTRAINT fk_ca_address FOREIGN KEY (address_id) REFERENCES Address(address_id),
      CONSTRAINT uq_contact_address UNIQUE (contact_id, contact_entity_type, address_id)
    );

    -- Role Table
    CREATE TABLE Role (
      role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      role_name VARCHAR(100) UNIQUE NOT NULL
    );

    INSERT INTO Role (role_name) VALUES
    ('CEO'),
    ('Manager'),
    ('Employee'),
    ('Primary Contact');
  `);

  // Get a pg-compatible pool adapter
  const { Pool: PgMemPool } = testDb.adapters.createPg();
  testPool = new PgMemPool() as any;

  return testPool;
}

/**
 * Clean up test database - resets all data
 */
export async function cleanupTestDb(): Promise<void> {
  if (!testDb) return;

  // Clear all tables in reverse order of dependencies
  // For Organization, we need to handle the self-referencing foreign key
  await testDb.public.none(`
    DELETE FROM ContactAddress;
    DELETE FROM ContactPhone;
    DELETE FROM ContactEmail;
    DELETE FROM Phone;
    DELETE FROM Email;
    DELETE FROM Person;
    DELETE FROM Household;
    DELETE FROM Address;
  `);

  // Delete organizations with parent relationships first, then orphans
  await testDb.public.none(`
    -- First, remove all parent relationships
    UPDATE Organization SET parent_organization_id = NULL WHERE parent_organization_id IS NOT NULL;
    -- Then delete all organizations
    DELETE FROM Organization;
  `);
}

/**
 * Get the test pool instance
 */
export function getTestPool(): Pool {
  if (!testPool) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }
  return testPool;
}

/**
 * Get the test database instance
 */
export function getTestDb(): IMemoryDb {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }
  return testDb;
}
