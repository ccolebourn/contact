/**
 * Express Server - Main Application Entry Point
 *
 * This file sets up and starts the Express web server.
 * Express is a web framework for Node.js that handles HTTP requests/responses.
 *
 * Application Flow:
 * 1. Configure Express app with middleware
 * 2. Set up routes (URL patterns that map to controllers)
 * 3. Start listening for HTTP requests
 *
 * Key Concepts:
 * - Middleware: Functions that run before route handlers (logging, parsing, error handling)
 * - Routes: Map URLs to controller functions (e.g., GET /api/persons → getAllPersons)
 * - app.use(): Adds middleware or routes to the Express pipeline
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';      // Cross-Origin Resource Sharing - allows API access from browsers
import dotenv from 'dotenv';  // Load environment variables
import routes from './routes';  // Import all API routes
import { errorHandler } from './middleware/errorHandler';  // Custom error handling

// Load environment variables from .env file
dotenv.config();

/**
 * Create Express application
 * 'app' is the main Express application instance
 * Type: Application (TypeScript type from Express)
 */
const app: Application = express();

/**
 * Server port - where the API will listen
 * Uses PORT from .env or defaults to 3000
 */
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE SETUP
// ============================================================
// Middleware functions run in order for every request
// Think of them as a pipeline that each request goes through

/**
 * CORS Middleware - Allows cross-origin requests
 * Without this, browsers would block requests from different domains
 * Important for when your frontend is on a different URL than your API
 */
app.use(cors());

/**
 * JSON Body Parser Middleware
 * Automatically parses JSON request bodies into JavaScript objects
 * Example: JSON string "{"name":"John"}" becomes object {name: "John"}
 * Makes req.body available in controllers
 */
app.use(express.json());

/**
 * URL-Encoded Body Parser Middleware
 * Parses form data (application/x-www-form-urlencoded)
 * extended: true allows rich objects and arrays to be encoded
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Custom Logging Middleware
 * Logs every request to the console with timestamp, method, and path
 * Example: "2025-01-15T10:30:45.123Z - GET /api/persons/1"
 *
 * Function parameters:
 * - req: Incoming request object
 * - _res: Response object (underscore means we're not using it)
 * - next: Function to call to pass control to next middleware
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();  // IMPORTANT: Must call next() to continue to next middleware/route
});

// ============================================================
// ROUTES SETUP
// ============================================================

/**
 * Mount all API routes under /api prefix
 * All routes from ./routes/index.ts will be prefixed with /api
 * Example: /persons route becomes /api/persons
 */
app.use('/api', routes);

/**
 * Root Endpoint - GET /
 * Provides basic API information and available endpoints
 * Useful for testing if the server is running
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Contact Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      persons: '/api/persons',
      organizations: '/api/organizations'
    }
  });
});

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any defined routes
 * Must be defined AFTER all other routes
 *
 * Example: GET /api/nonexistent → Returns 404 error
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * Global Error Handler Middleware
 * Catches all errors thrown by route handlers or middleware
 * MUST be defined last (after all routes and other middleware)
 *
 * Handles:
 * - Validation errors from Zod
 * - Database errors from PostgreSQL
 * - Custom AppError instances
 * - Unexpected errors
 */
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

/**
 * Start listening for HTTP requests
 *
 * app.listen(port, callback)
 * - port: Port number to listen on (3000 by default)
 * - callback: Function to run once server starts successfully
 *
 * The server will continue running until you stop it (Ctrl+C)
 */
app.listen(PORT, () => {
  // Print startup message with ASCII art box
  console.log(`
╔═══════════════════════════════════════╗
║   Contact Service API                 ║
║   Server running on port ${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════╝
  `);
});

/**
 * Export the Express app
 * Useful for testing or if you want to mount this app in another Express app
 */
export default app;
