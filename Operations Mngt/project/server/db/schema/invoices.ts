import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { suppliers } from './suppliers';
import { customers } from './orders';
import { purchaseOrders } from './procurement';
import { contracts } from './contracts';
import { inventoryItems } from './inventory';

// Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  type: text('type').notNull(), // PURCHASE, SALES, CREDIT_NOTE, DEBIT_NOTE
  status: text('status').notNull().default('DRAFT'), // DRAFT, PENDING, APPROVED, PAID, OVERDUE, CANCELLED, DISPUTED
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  customerId: uuid('customer_id').references(() => customers.id),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id),
  contractId: uuid('contract_id').references(() => contracts.id),
  invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  paymentTerms: text('payment_terms'),
  currency: text('currency').notNull().default('USD'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }).default('1'),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: numeric('discount_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  shippingAmount: numeric('shipping_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  balanceAmount: numeric('balance_amount', { precision: 15, scale: 2 }).notNull(),
  billingAddress: jsonb('billing_address').notNull(),
  shippingAddress: jsonb('shipping_address'),
  notes: text('notes'),
  attachments: jsonb('attachments'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  invoiceNumberIdx: index('invoice_number_idx').on(table.invoiceNumber),
  tenantInvoiceIdx: index('tenant_invoice_idx').on(table.tenantId, table.invoiceDate),
}));

// Invoice Items
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  lineNumber: integer('line_number').notNull(),
  itemId: uuid('item_id').references(() => inventoryItems.id),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 15, scale: 2 }).notNull().default('0'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  lineTotal: numeric('line_total', { precision: 15, scale: 2 }).notNull(),
  accountCode: text('account_code'),
  costCenter: text('cost_center'),
  projectCode: text('project_code'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  invoiceLineIdx: index('invoice_line_idx').on(table.invoiceId, table.lineNumber),
}));

// Invoice Payments
export const invoicePayments = pgTable('invoice_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  paymentNumber: text('payment_number').notNull(),
  paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }).default('1'),
  paymentMethod: text('payment_method').notNull(), // BANK_TRANSFER, CHECK, CREDIT_CARD, CASH, ACH, WIRE, OTHER
  referenceNumber: text('reference_number'),
  bankAccount: text('bank_account'),
  notes: text('notes'),
  attachments: jsonb('attachments'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  paymentNumberIdx: index('invoice_payment_number_idx').on(table.paymentNumber),
  tenantPaymentIdx: index('tenant_payment_idx').on(table.tenantId, table.paymentDate),
}));

// Invoice Disputes
export const invoiceDisputes = pgTable('invoice_disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  disputeNumber: text('dispute_number').notNull(),
  type: text('type').notNull(), // PRICING, QUANTITY, QUALITY, DELIVERY, BILLING_ERROR, OTHER
  status: text('status').notNull().default('OPEN'), // OPEN, UNDER_REVIEW, RESOLVED, ESCALATED, CLOSED
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  description: text('description').notNull(),
  disputedAmount: numeric('disputed_amount', { precision: 15, scale: 2 }),
  resolution: text('resolution'),
  resolutionDate: timestamp('resolution_date', { withTimezone: true }),
  attachments: jsonb('attachments'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
}, (table) => ({
  disputeNumberIdx: index('dispute_number_idx').on(table.disputeNumber),
  tenantDisputeIdx: index('tenant_dispute_idx').on(table.tenantId, table.status),
}));

// Invoice Templates
export const invoiceTemplates = pgTable('invoice_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PURCHASE, SALES, CREDIT_NOTE, DEBIT_NOTE
  template: jsonb('template').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  templateNameIdx: index('invoice_template_name_idx').on(table.name),
  tenantTemplateIdx: index('tenant_invoice_template_idx').on(table.tenantId, table.type),
}));

// Invoice Tax Details
export const invoiceTaxDetails = pgTable('invoice_tax_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  taxType: text('tax_type').notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull(),
  taxableAmount: numeric('taxable_amount', { precision: 15, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  invoiceTaxIdx: index('invoice_tax_idx').on(table.invoiceId, table.taxType),
}));

// Invoice Attachments
export const invoiceAttachments = pgTable('invoice_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
}, (table) => ({
  invoiceAttachmentIdx: index('invoice_attachment_idx').on(table.invoiceId, table.type),
})); 