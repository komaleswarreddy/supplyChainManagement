import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Contracts
export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // SUPPLIER, CUSTOMER, SERVICE, LEASE, EMPLOYMENT, PARTNERSHIP
  category: text('category').notNull(), // PROCUREMENT, SALES, LOGISTICS, IT, LEGAL, etc.
  status: text('status').notNull().default('DRAFT'), // DRAFT, NEGOTIATION, PENDING_APPROVAL, ACTIVE, EXPIRED, TERMINATED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  value: numeric('value', { precision: 15, scale: 2 }),
  currency: text('currency').notNull().default('USD'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  renewalDate: timestamp('renewal_date', { withTimezone: true }),
  autoRenewal: boolean('auto_renewal').notNull().default(false),
  renewalTerms: jsonb('renewal_terms'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  approverId: uuid('approver_id').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  counterparty: jsonb('counterparty').notNull(), // { name, type, contact, address }
  terms: jsonb('terms').notNull(), // Contract terms and conditions
  attachments: jsonb('attachments'), // Document attachments
  riskLevel: text('risk_level').notNull().default('LOW'), // LOW, MEDIUM, HIGH, CRITICAL
  complianceStatus: text('compliance_status').notNull().default('COMPLIANT'), // COMPLIANT, NON_COMPLIANT, PENDING_REVIEW
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  contractNumberIdx: index('contract_number_idx').on(table.contractNumber),
  tenantContractIdx: index('tenant_contract_idx').on(table.tenantId, table.status),
}));

// Contract Parties
export const contractParties = pgTable('contract_parties', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  partyType: text('party_type').notNull(), // PRIMARY, COUNTERPARTY, THIRD_PARTY, GUARANTOR
  name: text('name').notNull(),
  type: text('type').notNull(), // INDIVIDUAL, COMPANY, GOVERNMENT
  contactInfo: jsonb('contact_info').notNull(),
  address: jsonb('address'),
  taxId: text('tax_id'),
  registrationNumber: text('registration_number'),
  role: text('role').notNull(), // BUYER, SELLER, SERVICE_PROVIDER, GUARANTOR
  signature: jsonb('signature'), // Digital signature details
  signedAt: timestamp('signed_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  contractPartyIdx: index('contract_party_idx').on(table.contractId, table.partyType),
}));

// Contract Terms
export const contractTerms = pgTable('contract_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  section: text('section').notNull(),
  subsection: text('subsection'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // GENERAL, PAYMENT, DELIVERY, WARRANTY, TERMINATION, COMPLIANCE
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  isRequired: boolean('is_required').notNull().default(true),
  isCompliant: boolean('is_compliant').notNull().default(true),
  complianceNotes: text('compliance_notes'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  contractTermIdx: index('contract_term_idx').on(table.contractId, table.section),
}));

// Contract Amendments
export const contractAmendments = pgTable('contract_amendments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  amendmentNumber: text('amendment_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // EXTENSION, MODIFICATION, TERMINATION, RENEWAL
  status: text('status').notNull().default('DRAFT'), // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
  effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
  changes: jsonb('changes').notNull(), // Detailed changes
  reason: text('reason').notNull(),
  impact: text('impact').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  approverId: uuid('approver_id').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  attachments: jsonb('attachments'), // Amendment documents
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  amendmentNumberIdx: index('amendment_number_idx').on(table.amendmentNumber),
  contractAmendmentIdx: index('contract_amendment_idx').on(table.contractId, table.status),
}));

// Contract Obligations
export const contractObligations = pgTable('contract_obligations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  obligationNumber: text('obligation_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // DELIVERY, PAYMENT, REPORTING, COMPLIANCE, PERFORMANCE
  status: text('status').notNull().default('PENDING'), // PENDING, IN_PROGRESS, COMPLETED, OVERDUE, CANCELLED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  completedDate: timestamp('completed_date', { withTimezone: true }),
  assignedTo: uuid('assigned_to').references(() => users.id),
  responsibleParty: text('responsible_party').notNull(), // US, COUNTERPARTY, BOTH
  value: numeric('value', { precision: 15, scale: 2 }),
  currency: text('currency').notNull().default('USD'),
  completionCriteria: jsonb('completion_criteria').notNull(),
  attachments: jsonb('attachments'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  obligationNumberIdx: index('obligation_number_idx').on(table.obligationNumber),
  contractObligationIdx: index('contract_obligation_idx').on(table.contractId, table.status),
}));

// Contract Milestones
export const contractMilestones = pgTable('contract_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  milestoneNumber: text('milestone_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // DELIVERY, PAYMENT, REVIEW, APPROVAL, COMPLETION
  status: text('status').notNull().default('PENDING'), // PENDING, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  completedDate: timestamp('completed_date', { withTimezone: true }),
  assignedTo: uuid('assigned_to').references(() => users.id),
  completionCriteria: jsonb('completion_criteria').notNull(),
  deliverables: jsonb('deliverables'),
  attachments: jsonb('attachments'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  milestoneNumberIdx: index('milestone_number_idx').on(table.milestoneNumber),
  contractMilestoneIdx: index('contract_milestone_idx').on(table.contractId, table.status),
}));

// Contract Compliance
export const contractCompliance = pgTable('contract_compliance', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  complianceNumber: text('compliance_number').notNull(),
  requirement: text('requirement').notNull(),
  description: text('description'),
  type: text('type').notNull(), // REGULATORY, CONTRACTUAL, INTERNAL, INDUSTRY
  category: text('category').notNull(), // LEGAL, FINANCIAL, OPERATIONAL, TECHNICAL
  status: text('status').notNull().default('PENDING'), // PENDING, COMPLIANT, NON_COMPLIANT, EXEMPT
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  reviewDate: timestamp('review_date', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  complianceEvidence: jsonb('compliance_evidence'),
  riskAssessment: text('risk_assessment'), // LOW, MEDIUM, HIGH, CRITICAL
  correctiveActions: jsonb('corrective_actions'),
  attachments: jsonb('attachments'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  complianceNumberIdx: index('compliance_number_idx').on(table.complianceNumber),
  contractComplianceIdx: index('contract_compliance_idx').on(table.contractId, table.status),
}));

// Contract Templates
export const contractTemplates = pgTable('contract_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // SUPPLIER, CUSTOMER, SERVICE, LEASE, EMPLOYMENT
  category: text('category').notNull(),
  template: jsonb('template').notNull(), // Template structure
  terms: jsonb('terms').notNull(), // Standard terms
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  version: text('version').notNull().default('1.0'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  templateNameIdx: index('template_name_idx').on(table.name),
  tenantTemplateIdx: index('tenant_contract_template_idx').on(table.tenantId, table.type),
}));

// Contract History
export const contractHistory = pgTable('contract_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  contractId: uuid('contract_id').notNull().references(() => contracts.id),
  action: text('action').notNull(), // CREATED, UPDATED, APPROVED, AMENDED, TERMINATED
  description: text('description').notNull(),
  changes: jsonb('changes'), // What changed
  performedBy: uuid('performed_by').notNull().references(() => users.id),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata'),
}, (table) => ({
  contractHistoryIdx: index('contract_history_idx').on(table.contractId, table.performedAt),
})); 