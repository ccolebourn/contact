import { z } from 'zod';

// Enum schemas
export const EmailTypeSchema = z.enum(['WORK', 'PERSONAL', 'BILLING', 'OTHER']);
export const PhoneTypeSchema = z.enum(['MOBILE', 'OFFICE', 'HOME', 'FAX', 'OTHER']);
export const AddressTypeSchema = z.enum(['SHIPPING', 'BILLING', 'HOME', 'OFFICE', 'OTHER']);
export const RelationshipStatusSchema = z.enum(['CURRENT', 'SEPARATED', 'DIVORCED', 'DECEASED']);

// Nested object schemas
export const EmailInputSchema = z.object({
  email_address: z.string().email('Invalid email address'),
  email_type: EmailTypeSchema,
  is_primary: z.boolean().optional().default(false)
});

export const PhoneInputSchema = z.object({
  country_code: z.string().max(10).optional(),
  area_code: z.string().max(10).optional(),
  local_number: z.string().min(1).max(20),
  phone_type: PhoneTypeSchema,
  extension: z.string().max(10).optional(),
  is_primary: z.boolean().optional().default(false)
});

export const AddressInputSchema = z.object({
  address_line_1: z.string().min(1).max(255),
  address_line_2: z.string().max(255).optional(),
  address_line_3: z.string().max(255).optional(),
  city_locality: z.string().min(1).max(100),
  region_code: z.string().max(10).optional(),
  postal_code: z.string().max(20).optional(),
  country_iso_code: z.string().length(2),
  address_type: AddressTypeSchema.optional(),
  is_primary: z.boolean().optional().default(false)
});

// Person validation schemas
export const CreatePersonSchema = z.object({
  first_name: z.string().min(1).max(100),
  middle_name: z.string().max(100).optional(),
  last_name: z.string().min(1).max(100),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  birth_month: z.number().int().min(1).max(12).optional(),
  birth_day: z.number().int().min(1).max(31).optional(),
  preferred_language: z.string().max(5).optional(),
  household_id: z.number().int().positive().optional(),
  emails: z.array(EmailInputSchema).optional(),
  phones: z.array(PhoneInputSchema).optional(),
  addresses: z.array(AddressInputSchema).optional()
});

export const UpdatePersonSchema = CreatePersonSchema.partial();

// Organization validation schemas
export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  website: z.string().url().max(255).optional(),
  parent_organization_id: z.number().int().positive().optional(),
  emails: z.array(EmailInputSchema).optional(),
  phones: z.array(PhoneInputSchema).optional(),
  addresses: z.array(AddressInputSchema).optional()
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

// Household validation schemas
export const CreateHouseholdSchema = z.object({
  household_name: z.string().min(1).max(100),
  primary_address_id: z.number().int().positive().optional()
});

export const UpdateHouseholdSchema = CreateHouseholdSchema.partial();

// Relationship validation schemas
export const CreatePersonRelationshipSchema = z.object({
  person_id_2: z.number().int().positive(),
  relationship_type_id: z.number().int().positive(),
  status: RelationshipStatusSchema,
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});

// Person-Organization Role validation schemas
export const CreatePersonOrgRoleSchema = z.object({
  organization_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional()
});

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('20')
});

export const PersonSearchSchema = PaginationSchema.extend({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  household_id: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const OrganizationSearchSchema = PaginationSchema.extend({
  name: z.string().optional(),
  website: z.string().optional()
});
