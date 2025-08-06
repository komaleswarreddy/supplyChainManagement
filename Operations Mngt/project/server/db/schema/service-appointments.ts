import { pgTable, uuid, varchar, timestamp, text, boolean, integer, jsonb, index, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { tenants } from './tenants';
import { suppliers } from './suppliers';
import { orders } from './orders';
import { products } from './catalog';

// Service Types
export const serviceTypes = pgTable('service_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // installation, delivery, consultation, maintenance, training
  duration_minutes: integer('duration_minutes').notNull().default(60),
  buffer_time_minutes: integer('buffer_time_minutes').default(15),
  requires_order: boolean('requires_order').default(true),
  applicable_product_types: jsonb('applicable_product_types'), // Array of product types
  skill_requirements: jsonb('skill_requirements'), // Required skills/certifications
  equipment_requirements: jsonb('equipment_requirements'), // Required tools/equipment
  preparation_checklist: jsonb('preparation_checklist'), // Pre-appointment requirements
  completion_checklist: jsonb('completion_checklist'), // Post-appointment tasks
  is_active: boolean('is_active').default(true),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenant_service_type_idx: index('tenant_service_type_idx').on(table.tenant_id, table.category),
}));

// Service Providers (Technicians, Consultants, etc.)
export const serviceProviders = pgTable('service_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  employee_id: varchar('employee_id', { length: 50 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  type: varchar('type', { length: 50 }).notNull(), // internal, external, contractor
  skills: jsonb('skills'), // Array of skills/certifications
  service_areas: jsonb('service_areas'), // Geographic areas served
  max_concurrent_appointments: integer('max_concurrent_appointments').default(1),
  travel_time_minutes: integer('travel_time_minutes').default(30),
  hourly_rate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  total_appointments: integer('total_appointments').default(0),
  completed_appointments: integer('completed_appointments').default(0),
  is_active: boolean('is_active').default(true),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenant_provider_idx: index('tenant_provider_idx').on(table.tenant_id, table.type),
  user_provider_idx: index('user_provider_idx').on(table.user_id),
}));

// Service Provider Availability
export const serviceProviderAvailability = pgTable('service_provider_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider_id: uuid('provider_id').references(() => serviceProviders.id, { onDelete: 'cascade' }),
  day_of_week: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  start_time: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  end_time: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  is_available: boolean('is_available').default(true),
  max_appointments: integer('max_appointments').default(8),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  provider_day_idx: index('provider_day_idx').on(table.provider_id, table.day_of_week),
}));

// Service Appointments
export const serviceAppointments = pgTable('service_appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointment_number: varchar('appointment_number', { length: 50 }).notNull().unique(),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  service_type_id: uuid('service_type_id').references(() => serviceTypes.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  
  // Scheduling
  scheduled_start: timestamp('scheduled_start').notNull(),
  scheduled_end: timestamp('scheduled_end').notNull(),
  actual_start: timestamp('actual_start'),
  actual_end: timestamp('actual_end'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  
  // Location & Contact
  service_address: jsonb('service_address'), // Full address object
  contact_person: varchar('contact_person', { length: 100 }),
  contact_phone: varchar('contact_phone', { length: 20 }),
  contact_email: varchar('contact_email', { length: 255 }),
  special_instructions: text('special_instructions'),
  
  // Status & Priority
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, confirmed, in_progress, completed, cancelled, rescheduled
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  cancellation_reason: text('cancellation_reason'),
  
  // Service Details
  estimated_duration: integer('estimated_duration'), // minutes
  actual_duration: integer('actual_duration'), // minutes
  service_items: jsonb('service_items'), // Items/products being serviced
  required_skills: jsonb('required_skills'),
  required_equipment: jsonb('required_equipment'),
  
  // Completion & Feedback
  completion_notes: text('completion_notes'),
  customer_signature: text('customer_signature'), // Base64 signature
  photos: jsonb('photos'), // Array of photo URLs
  customer_rating: integer('customer_rating'), // 1-5 stars
  customer_feedback: text('customer_feedback'),
  
  // Billing
  service_cost: decimal('service_cost', { precision: 10, scale: 2 }),
  travel_cost: decimal('travel_cost', { precision: 10, scale: 2 }),
  material_cost: decimal('material_cost', { precision: 10, scale: 2 }),
  total_cost: decimal('total_cost', { precision: 10, scale: 2 }),
  billing_status: varchar('billing_status', { length: 20 }).default('pending'), // pending, billed, paid
  
  // Metadata
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenant_appointment_idx: index('tenant_appointment_idx').on(table.tenant_id, table.scheduled_start),
  order_appointment_idx: index('order_appointment_idx').on(table.order_id),
  status_appointment_idx: index('status_appointment_idx').on(table.status),
  provider_appointment_idx: index('provider_appointment_idx').on(table.scheduled_start),
}));

// Service Appointment Assignments (Provider assignments)
export const serviceAppointmentAssignments = pgTable('service_appointment_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointment_id: uuid('appointment_id').references(() => serviceAppointments.id, { onDelete: 'cascade' }),
  provider_id: uuid('provider_id').references(() => serviceProviders.id),
  role: varchar('role', { length: 50 }).default('primary'), // primary, secondary, backup
  assigned_at: timestamp('assigned_at').defaultNow(),
  confirmed_at: timestamp('confirmed_at'),
  status: varchar('status', { length: 20 }).default('assigned'), // assigned, confirmed, declined, completed
  notes: text('notes'),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  appointment_assignment_idx: index('appointment_assignment_idx').on(table.appointment_id),
  provider_assignment_idx: index('provider_assignment_idx').on(table.provider_id),
}));

// Service Appointment History (Status changes, updates)
export const serviceAppointmentHistory = pgTable('service_appointment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointment_id: uuid('appointment_id').references(() => serviceAppointments.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(), // created, scheduled, confirmed, started, completed, cancelled, rescheduled
  previous_status: varchar('previous_status', { length: 20 }),
  new_status: varchar('new_status', { length: 20 }),
  previous_data: jsonb('previous_data'), // Previous appointment data
  new_data: jsonb('new_data'), // New appointment data
  reason: text('reason'),
  performed_by: uuid('performed_by').references(() => users.id),
  performed_at: timestamp('performed_at').defaultNow(),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
}, (table) => ({
  appointment_history_idx: index('appointment_history_idx').on(table.appointment_id, table.performed_at),
}));

// Service Appointment Reminders
export const serviceAppointmentReminders = pgTable('service_appointment_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointment_id: uuid('appointment_id').references(() => serviceAppointments.id, { onDelete: 'cascade' }),
  recipient_type: varchar('recipient_type', { length: 20 }).notNull(), // customer, provider, manager
  recipient_id: uuid('recipient_id'), // User ID or contact ID
  reminder_type: varchar('reminder_type', { length: 20 }).notNull(), // email, sms, push, call
  scheduled_for: timestamp('scheduled_for').notNull(),
  sent_at: timestamp('sent_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, sent, failed
  message_template: varchar('message_template', { length: 100 }),
  custom_message: text('custom_message'),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  appointment_reminder_idx: index('appointment_reminder_idx').on(table.appointment_id),
  scheduled_reminder_idx: index('scheduled_reminder_idx').on(table.scheduled_for, table.status),
}));

// Service Appointment Templates
export const serviceAppointmentTemplates = pgTable('service_appointment_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  service_type_id: uuid('service_type_id').references(() => serviceTypes.id),
  template_data: jsonb('template_data'), // Default appointment configuration
  reminder_schedule: jsonb('reminder_schedule'), // When to send reminders
  required_fields: jsonb('required_fields'), // Fields required for this template
  custom_fields: jsonb('custom_fields'), // Additional custom fields
  is_active: boolean('is_active').default(true),
  tenant_id: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenant_template_idx: index('tenant_template_idx').on(table.tenant_id, table.name),
}));

// Relations
export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  appointments: many(serviceAppointments),
  templates: many(serviceAppointmentTemplates),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.user_id],
    references: [users.id],
  }),
  availability: many(serviceProviderAvailability),
  assignments: many(serviceAppointmentAssignments),
}));

export const serviceAppointmentsRelations = relations(serviceAppointments, ({ one, many }) => ({
  order: one(orders, {
    fields: [serviceAppointments.order_id],
    references: [orders.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [serviceAppointments.service_type_id],
    references: [serviceTypes.id],
  }),
  assignments: many(serviceAppointmentAssignments),
  history: many(serviceAppointmentHistory),
  reminders: many(serviceAppointmentReminders),
}));

export const serviceAppointmentAssignmentsRelations = relations(serviceAppointmentAssignments, ({ one }) => ({
  appointment: one(serviceAppointments, {
    fields: [serviceAppointmentAssignments.appointment_id],
    references: [serviceAppointments.id],
  }),
  provider: one(serviceProviders, {
    fields: [serviceAppointmentAssignments.provider_id],
    references: [serviceProviders.id],
  }),
})); 