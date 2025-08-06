import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DB_CONFIG } from '../config';
import { logger } from '../utils/logger';

// Create a PostgreSQL connection
const connectionString = DB_CONFIG.connectionString || 
  `postgres://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`;

// Connection options
const options = {
  max: 10, // Max number of connections
  ssl: DB_CONFIG.ssl,
  idle_timeout: 30,
  connect_timeout: 10,
};

// Create a connection pool
const sql = postgres(connectionString, options);

// Initialize Drizzle ORM
export const db = drizzle(sql);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await sql.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error });
  }
};