import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  title: text('title'),
  department: text('department'),
  employeeId: text('employee_id'),
  phoneNumber: text('phone_number'),
  roles: text('roles').array().notNull().default(['user']),
  permissions: text('permissions').array().notNull().default(['create_requisition']),
  status: text('status').notNull().default('active'),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  passwordLastChanged: timestamp('password_last_changed', { withTimezone: true }),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  preferences: jsonb('preferences'),
  metadata: jsonb('metadata'),
  supervisorId: uuid('supervisor_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  currentTenantId: uuid('current_tenant_id'),
});

export const userGroups = pgTable('user_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  roles: text('roles').array().notNull(),
  permissions: text('permissions').array().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userGroupMembers = pgTable('user_group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  groupId: uuid('group_id').notNull().references(() => userGroups.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  permissions: text('permissions').array().notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userDelegations = pgTable('user_delegations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  delegateId: uuid('delegate_id').notNull().references(() => users.id),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  permissions: text('permissions').array().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
});