import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Server configuration
export const SERVER_CONFIG = {
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
};

// Database configuration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pls_scm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', // Try empty password first
  ssl: process.env.DB_SSL === 'true',
  connectionString: process.env.DATABASE_URL,
};

// Auth configuration
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  keycloakRealm: process.env.KEYCLOAK_REALM || 'pls-scm',
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || 'pls-scm-client',
  keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.VITE_SUPABASE_URL || '',
  anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// API configuration
export const API_CONFIG = {
  basePath: '/api',
  version: 'v1',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
};