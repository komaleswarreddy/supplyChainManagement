import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations');
    
    // Create migrations folder if it doesn't exist
    const migrationsFolder = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsFolder)) {
      fs.mkdirSync(migrationsFolder, { recursive: true });
    }
    
    console.log('Migrations folder:', migrationsFolder);
    console.log('Migrations folder exists:', fs.existsSync(migrationsFolder));
    
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder });
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    logger.error('Error running database migrations', { 
      error: error.message,
      stack: error.stack 
    });
    throw error; // Don't exit, let the caller handle it
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Migration script failed', { error });
      process.exit(1);
    });
}

export default runMigrations;