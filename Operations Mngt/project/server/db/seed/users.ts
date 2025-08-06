import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users, roles, userGroups, userGroupMembers } from '../schema/users';
import { logger } from '../../utils/logger';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function seedUsers(db: PostgresJsDatabase) {
  try {
    logger.info('Seeding users data');
    
    // Create roles
    const createdRoles = await db.insert(roles).values([
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'Administrator',
        description: 'System administrator with full access',
        permissions: ['manage_users', 'manage_roles', 'manage_settings', 'create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports', 'manage_inventory'],
        isSystem: true,
      },
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'Procurement Manager',
        description: 'Manages procurement processes',
        permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports'],
        isSystem: false,
      },
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'Inventory Manager',
        description: 'Manages inventory operations',
        permissions: ['manage_inventory', 'view_reports'],
        isSystem: false,
      },
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'User',
        description: 'Regular user with basic permissions',
        permissions: ['create_requisition', 'view_reports'],
        isSystem: true,
      },
    ]).returning();
    
    // Hash passwords for users
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    const userPasswordHash = await bcrypt.hash('user123', saltRounds);
    
    // Create users
    const createdUsers = await db.insert(users).values([
      {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        title: 'System Administrator',
        department: 'IT',
        employeeId: 'EMP00001',
        phoneNumber: '+1234567890',
        roles: ['admin'],
        permissions: ['manage_users', 'manage_roles', 'manage_settings', 'create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports', 'manage_inventory'],
        status: 'active',
        mfaEnabled: false,
        preferences: {
          language: 'en-US',
          timezone: 'America/New_York',
          theme: 'system',
          notifications: {
            email: true,
            inApp: true,
            desktop: false,
          },
        },
        metadata: {
          costCenter: 'CC001',
          location: 'New York',
          division: 'North America',
        },
        passwordHash: adminPasswordHash,
      },
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        title: 'Procurement Manager',
        department: 'Procurement',
        employeeId: 'EMP00002',
        phoneNumber: '+1234567891',
        roles: ['manager'],
        permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports'],
        status: 'active',
        mfaEnabled: false,
        preferences: {
          language: 'en-US',
          timezone: 'America/New_York',
          theme: 'light',
          notifications: {
            email: true,
            inApp: true,
            desktop: true,
          },
        },
        passwordHash: userPasswordHash,
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        title: 'Inventory Specialist',
        department: 'Warehouse',
        employeeId: 'EMP00003',
        phoneNumber: '+1234567892',
        roles: ['user'],
        permissions: ['manage_inventory', 'view_reports'],
        status: 'active',
        mfaEnabled: false,
        passwordHash: userPasswordHash,
      },
    ]).returning();
    
    // Create user groups
    const createdGroups = await db.insert(userGroups).values([
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'Procurement Team',
        description: 'All procurement staff',
        roles: ['manager'],
        permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports'],
      },
      {
        tenantId: '00000000-0000-0000-0000-000000000000', // This will be updated later
        name: 'Warehouse Team',
        description: 'All warehouse staff',
        roles: ['user'],
        permissions: ['manage_inventory', 'view_reports'],
      },
    ]).returning();
    
    // Assign users to groups
    await db.insert(userGroupMembers).values([
      {
        userId: createdUsers[1].id, // John Doe
        groupId: createdGroups[0].id, // Procurement Team
      },
      {
        userId: createdUsers[2].id, // Jane Smith
        groupId: createdGroups[1].id, // Warehouse Team
      },
    ]);
    
    logger.info('Users data seeded successfully');
    return createdUsers;
  } catch (error) {
    logger.error('Error seeding users data', { error });
    throw error;
  }
}