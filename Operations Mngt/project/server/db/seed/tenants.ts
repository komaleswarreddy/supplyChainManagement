import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { tenants, tenantUsers } from '../schema/tenants';
import { users } from '../schema/users';
import { roles, userGroups } from '../schema/users';
import { logger } from '../../utils/logger';
import { eq } from 'drizzle-orm';

export async function seedTenants(db: PostgresJsDatabase, adminUserId: string) {
  try {
    logger.info('Seeding tenants data');
    
    // Create tenants
    const createdTenants = await db.insert(tenants).values([
      {
        name: 'Demo Company',
        slug: 'demo',
        domain: 'demo.example.com',
        status: 'ACTIVE',
        plan: 'PROFESSIONAL',
        settings: {
          theme: 'light',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timezone: 'America/New_York',
        },
        createdBy: adminUserId,
      },
      {
        name: 'Test Organization',
        slug: 'test',
        domain: 'test.example.com',
        status: 'ACTIVE',
        plan: 'BASIC',
        settings: {
          theme: 'dark',
          currency: 'EUR',
          dateFormat: 'DD/MM/YYYY',
          timezone: 'Europe/London',
        },
        createdBy: adminUserId,
      },
    ]).returning();
    
    // Add admin user to tenants
    await db.insert(tenantUsers).values([
      {
        tenantId: createdTenants[0].id,
        userId: adminUserId,
        role: 'ADMIN',
        isOwner: true,
        status: 'ACTIVE',
      },
      {
        tenantId: createdTenants[1].id,
        userId: adminUserId,
        role: 'ADMIN',
        isOwner: true,
        status: 'ACTIVE',
      },
    ]);
    
    // Update admin user's current tenant
    await db.update(users)
      .set({ currentTenantId: createdTenants[0].id })
      .where(eq(users.id, adminUserId));
    
    // Update roles and user groups with tenant IDs
    await db.update(roles)
      .set({ tenantId: createdTenants[0].id })
      .where(eq(roles.tenantId, '00000000-0000-0000-0000-000000000000'));
    
    await db.update(userGroups)
      .set({ tenantId: createdTenants[0].id })
      .where(eq(userGroups.tenantId, '00000000-0000-0000-0000-000000000000'));
    
    // Create roles for second tenant
    const firstTenantRoles = await db.select().from(roles).where(eq(roles.tenantId, createdTenants[0].id));
    
    for (const role of firstTenantRoles) {
      await db.insert(roles).values({
        ...role,
        id: undefined, // Let the database generate a new ID
        tenantId: createdTenants[1].id,
      });
    }
    
    // Create user groups for second tenant
    const firstTenantGroups = await db.select().from(userGroups).where(eq(userGroups.tenantId, createdTenants[0].id));
    
    for (const group of firstTenantGroups) {
      await db.insert(userGroups).values({
        ...group,
        id: undefined, // Let the database generate a new ID
        tenantId: createdTenants[1].id,
      });
    }
    
    logger.info('Tenants data seeded successfully');
    return createdTenants;
  } catch (error) {
    logger.error('Error seeding tenants data', { error });
    throw error;
  }
}