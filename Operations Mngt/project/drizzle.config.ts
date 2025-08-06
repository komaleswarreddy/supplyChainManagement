import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  schema: './server/db/schema/*',
  out: './server/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pls_scm',
  },
  verbose: true,
  strict: true,
} satisfies Config;