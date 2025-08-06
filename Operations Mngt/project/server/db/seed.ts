import { db } from './index';
import { users } from './schema/users';
import { tenants } from './schema/tenants';
import { logger } from '../utils/logger';
import { seedUsers } from './seed/users';
import { seedTenants } from './seed/tenants';
import { seedSuppliers } from './seed/suppliers';
import { seedInventory } from './seed/inventory';
import { seedProcurement } from './seed/procurement';
import { seedCatalog } from './seed/catalog';
import { seedInvoices } from './seed/invoices';
import { seedAutomation } from './seed/automation';
import { seedLogistics } from './seed/logistics';
import { seedIntegrations } from './seed/integrations';
import { seedMobile } from './seed/mobile';
import { eq } from 'drizzle-orm';

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding');
    
    // Check if database already has data
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      logger.info('Database already has data, skipping seed');
      return;
    }
    
    // Seed users first
    logger.info('Seeding users');
    const createdUsers = await seedUsers(db);
    
    // Seed tenants
    logger.info('Seeding tenants');
    const createdTenants = await seedTenants(db, createdUsers[0].id);
    
    // For each tenant, seed data
    for (const tenant of createdTenants) {
      logger.info(`Seeding data for tenant: ${tenant.name}`);
      
      // Seed suppliers
      logger.info('Seeding suppliers');
      const createdSuppliers = await seedSuppliers(db, createdUsers[0].id, tenant.id);
      
      // Seed inventory
      logger.info('Seeding inventory');
      await seedInventory(db, createdUsers[0].id, createdSuppliers, tenant.id);
      
      // Seed procurement
      logger.info('Seeding procurement');
      await seedProcurement(db, createdUsers, createdSuppliers, tenant.id);
      
      // Seed catalog
      logger.info('Seeding catalog');
      await seedCatalog();
      
      // Seed invoices
      logger.info('Seeding invoices');
      await seedInvoices();
      
      // Seed automation
      logger.info('Seeding automation');
      await seedAutomation(db, createdUsers[0].id, tenant.id);
      
      // Seed logistics
      logger.info('Seeding logistics');
      await seedLogistics(db, createdUsers[0].id, tenant.id);
      
      // Seed integrations
      logger.info('Seeding integrations');
      await seedIntegrations(db, createdUsers[0].id, tenant.id);
      
      // Seed mobile
      logger.info('Seeding mobile');
      await seedMobile(db, createdUsers[0].id, tenant.id);
    }
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database', { error });
    throw error;
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Seeding script failed', { error });
      process.exit(1);
    });
}

export default seedDatabase;