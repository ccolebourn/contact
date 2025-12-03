/**
 * Database Configuration
 *
 * This file sets up the PostgreSQL database connection pool.
 * A "pool" manages multiple database connections efficiently, reusing them
 * instead of creating a new connection for every request.
 *
 * Key Concepts:
 * - import: Brings in code from other modules/packages
 * - Pool: A collection of database connections that can be reused
 * - process.env: Environment variables (from .env file)
 * - dotenv: Package that loads variables from .env file
 */

import { Pool, PoolConfig } from 'pg';  // 'pg' is the PostgreSQL client for Node.js
import dotenv from 'dotenv';           // Loads environment variables from .env file

// Load environment variables from .env file into process.env
dotenv.config();

/**
 * poolConfig: Configuration object for database connection pool
 * TypeScript type: PoolConfig ensures we only use valid configuration options
 *
 * The || operator provides default values if environment variables aren't set
 * Example: process.env.DB_HOST || 'localhost' means "use DB_HOST from .env, or 'localhost' if not set"
 */
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',              // Database server address
  port: parseInt(process.env.DB_PORT || '5432'),         // Database port (5432 is PostgreSQL default)
  database: process.env.DB_NAME || 'contact',            // Database name
  user: process.env.DB_USER || 'postgres',               // Database username
  password: process.env.DB_PASSWORD,                     // Database password (no default for security)
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'), // Maximum number of connections in pool
  idleTimeoutMillis: 30000,                              // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000,                         // Timeout after 2 seconds if can't connect
};

/**
 * SSL Configuration for AWS RDS
 * AWS RDS requires SSL connections in production
 * rejectUnauthorized: false allows self-signed certificates
 */
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false  // Accept self-signed SSL certificates
  };
}

/**
 * Create the connection pool
 * This pool object is exported and used throughout the application
 * to execute database queries
 */
const pool = new Pool(poolConfig);

/**
 * Error Event Handler
 * Listens for unexpected errors on idle database clients
 * If a connection error occurs, log it and exit the application
 * (In production, you might want more graceful error handling)
 */
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);  // Exit with error code -1
});

/**
 * Test Database Connection on Startup
 * Executes a simple query (SELECT NOW()) to verify connection works
 * This runs immediately when the server starts
 *
 * Arrow function syntax: (err, res) => { ... } is like function(err, res) { ... }
 */
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    // Connection failed
    console.error('Error connecting to the database:', err);
  } else {
    // Connection successful - print current database time
    console.log('Database ' + poolConfig.host + ' connected successfully at:', res.rows[0].now);
  }
});

/**
 * Export the pool as the default export
 * Other files can import this with: import pool from './config/database'
 */
export default pool;
