/**
 * Person Controller
 *
 * Controllers handle HTTP requests and responses. They are the "entry point"
 * for API calls. When a client makes a request to /api/persons/1, it comes here.
 *
 * Flow: HTTP Request → Controller → Service → Database → Service → Controller → HTTP Response
 *
 * Key Concepts:
 * - Request: Contains incoming data (URL params, query strings, body)
 * - Response: Used to send data back to the client
 * - asyncHandler: Wrapper that catches errors from async functions
 * - async/await: Modern way to handle asynchronous operations (like database calls)
 */

import { Request, Response } from 'express';  // Express types for requests and responses
import { PersonService } from '../services/person.service';  // Business logic for person operations
import {
  CreatePersonSchema,        // Zod schema for validating person creation data
  UpdatePersonSchema,        // Zod schema for validating person updates
  PersonSearchSchema         // Zod schema for validating search parameters
} from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';  // Wraps async functions to catch errors

/**
 * Create an instance of PersonService
 * This service contains all the business logic for working with persons
 * We use 'new' keyword because PersonService is a class
 */
const personService = new PersonService();

/**
 * GET /api/persons/:id - Get a single person by ID
 *
 * URL Parameter: id (person's unique identifier)
 * Example: GET /api/persons/1
 *
 * Returns: Person object with all emails, phones, and addresses included
 *
 * asyncHandler: Catches any errors and passes them to error handling middleware
 * async: Marks function as asynchronous (can use 'await' inside)
 * await: Pauses execution until the Promise resolves (database call completes)
 */
export const getPersonById = asyncHandler(async (req: Request, res: Response) => {
  // Extract 'id' from URL params (e.g., /api/persons/123 → id = '123')
  // parseInt converts string to number
  const personId = parseInt(req.params.id);

  // Call service to fetch person from database
  // 'await' waits for the database query to complete
  const person = await personService.getById(personId);

  // If person doesn't exist, return 404 error
  if (!person) {
    return res.status(404).json({  // 404 = Not Found HTTP status
      success: false,
      error: 'Person not found'
    });
  }

  // Person found - return it with 200 OK status (default)
  return res.json({
    success: true,
    data: person  // Includes emails[], phones[], addresses[] arrays
  });
});

/**
 * GET /api/persons - Get all persons with pagination
 *
 * Query Parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 * Example: GET /api/persons?page=2&limit=50
 *
 * Returns: Array of persons with pagination metadata
 */
export const getAllPersons = asyncHandler(async (req: Request, res: Response) => {
  // Extract query parameters (e.g., ?page=2&limit=50)
  // req.query.page is a string, so we parse it to number
  // || 1 means "use 1 if page is not provided or invalid"
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // Fetch persons from database with pagination
  const result = await personService.getAll(page, limit);
  // result contains: { data: Person[], total: number, page: number, limit: number }

  // Return result (... spreads all properties from result object)
  res.json({
    success: true,
    ...result  // Equivalent to: data: result.data, total: result.total, etc.
  });
});

/**
 * GET /api/persons/search - Search for persons
 *
 * Query Parameters:
 *   - first_name: Filter by first name (partial match)
 *   - last_name: Filter by last name (partial match)
 *   - email: Filter by email address (partial match)
 *   - phone: Filter by phone number (partial match)
 *   - household_id: Filter by household
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 *
 * Example: GET /api/persons/search?last_name=Smith&page=1
 *
 * Returns: Array of matching persons with pagination
 */
export const searchPersons = asyncHandler(async (req: Request, res: Response) => {
  // Validate and parse query parameters using Zod schema
  // .parse() will throw an error if validation fails (caught by asyncHandler)
  const filters = PersonSearchSchema.parse(req.query);

  // Search database with validated filters
  const result = await personService.search(filters);

  res.json({
    success: true,
    ...result  // data, total, page, limit
  });
});

/**
 * POST /api/persons - Create a new person
 *
 * Request Body: Person data (JSON)
 * Example:
 * {
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "emails": [{ "email_address": "john@example.com", "email_type": "WORK" }],
 *   "phones": [...],
 *   "addresses": [...]
 * }
 *
 * Returns: Created person with status 201 (Created)
 *
 * Note: Can include emails, phones, and addresses arrays in the request.
 * All will be created in a single database transaction.
 */
export const createPerson = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body against CreatePersonSchema
  // This ensures all required fields are present and valid
  const validatedData = CreatePersonSchema.parse(req.body);

  // Create person in database (includes transaction for contacts)
  // 'as any' is a TypeScript type cast to handle enum type differences
  const person = await personService.create(validatedData as any);

  // Return created person with 201 status (Created)
  res.status(201).json({
    success: true,
    data: person  // Includes auto-generated person_id
  });
});

/**
 * PUT /api/persons/:id - Update an existing person
 *
 * URL Parameter: id (person to update)
 * Request Body: Fields to update (JSON) - only include fields you want to change
 *
 * Example: PUT /api/persons/1
 * Body: { "preferred_language": "es", "middle_name": "Michael" }
 *
 * Returns: Updated person object
 */
export const updatePerson = asyncHandler(async (req: Request, res: Response) => {
  const personId = parseInt(req.params.id);

  // Validate update data (all fields are optional with UpdatePersonSchema)
  const validatedData = UpdatePersonSchema.parse(req.body);

  // Update person in database
  const person = await personService.update(personId, validatedData as any);

  res.json({
    success: true,
    data: person  // Returns complete updated person
  });
});

/**
 * DELETE /api/persons/:id - Delete a person
 *
 * URL Parameter: id (person to delete)
 * Example: DELETE /api/persons/1
 *
 * Returns: Success message
 *
 * Note: Due to foreign key constraints, you may not be able to delete
 * persons who have relationships or other dependent records.
 */
export const deletePerson = asyncHandler(async (req: Request, res: Response) => {
  const personId = parseInt(req.params.id);

  // Delete person from database
  await personService.delete(personId);

  res.json({
    success: true,
    message: 'Person deleted successfully'
  });
});
