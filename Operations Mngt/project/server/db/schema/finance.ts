import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { tenants } from './tenants';

// Cost Centers
export const costCenters = pgTable('cost_centers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // DEPARTMENT, PROJECT, LOCATION, PRODUCT, SERVICE
  parentId: uuid('parent_id').references(() => costCenters.id),
  managerId: uuid('manager_id').references(() => users.id),
  locationId: text('location_id'),
  budget: jsonb('budget').notNull(), // { annual, monthly, spent, remaining }
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, SUSPENDED
  effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  costCenterCodeIdx: index('cost_center_code_idx').on(table.code),
  tenantCostCenterIdx: index('tenant_cost_center_idx').on(table.tenantId, table.code),
}));

// Budgets
export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // OPERATIONAL, CAPITAL, PROJECT, DEPARTMENT, COST_CENTER
  category: text('category').notNull(),
  fiscalYear: text('fiscal_year').notNull(),
  period: text('period').notNull(), // MONTHLY, QUARTERLY, ANNUAL
  totalBudget: numeric('total_budget', { precision: 15, scale: 2 }).notNull(),
  allocatedBudget: numeric('allocated_budget', { precision: 15, scale: 2 }).notNull(),
  actualSpent: numeric('actual_spent', { precision: 15, scale: 2 }).notNull(),
  committedAmount: numeric('committed_amount', { precision: 15, scale: 2 }).notNull(),
  remainingBudget: numeric('remaining_budget', { precision: 15, scale: 2 }).notNull(),
  variance: numeric('variance', { precision: 15, scale: 2 }).notNull(),
  variancePercentage: numeric('variance_percentage', { precision: 5, scale: 2 }).notNull(),
  status: text('status').notNull().default('DRAFT'), // DRAFT, APPROVED, ACTIVE, CLOSED, OVER_BUDGET
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  approverId: uuid('approver_id').references(() => users.id),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  budgetNameIdx: index('budget_name_idx').on(table.name),
  tenantBudgetIdx: index('tenant_budget_idx').on(table.tenantId, table.fiscalYear),
}));

// Budget Periods
export const budgetPeriods = pgTable('budget_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  budgetId: uuid('budget_id').notNull().references(() => budgets.id),
  period: text('period').notNull(), // Month/Quarter name
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  budgetedAmount: numeric('budgeted_amount', { precision: 15, scale: 2 }).notNull(),
  actualAmount: numeric('actual_amount', { precision: 15, scale: 2 }).notNull(),
  variance: numeric('variance', { precision: 15, scale: 2 }).notNull(),
  variancePercentage: numeric('variance_percentage', { precision: 5, scale: 2 }).notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, CLOSED, OVER_BUDGET
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  budgetPeriodIdx: index('budget_period_idx').on(table.budgetId, table.period),
}));

// General Ledger Accounts
export const glAccounts = pgTable('gl_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(), // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  category: text('category').notNull(),
  parentAccountId: uuid('parent_account_id').references(() => glAccounts.id),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  allowPosting: boolean('allow_posting').notNull().default(true),
  defaultCostCenterId: uuid('default_cost_center_id').references(() => costCenters.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  accountNumberIdx: index('account_number_idx').on(table.accountNumber),
  tenantAccountIdx: index('tenant_account_idx').on(table.tenantId, table.accountNumber),
}));

// General Ledger Transactions
export const glTransactions = pgTable('gl_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  transactionNumber: text('transaction_number').notNull(),
  transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(),
  postingDate: timestamp('posting_date', { withTimezone: true }).notNull(),
  reference: text('reference'),
  description: text('description').notNull(),
  sourceModule: text('source_module').notNull(), // PROCUREMENT, INVENTORY, ORDERS, etc.
  sourceRecordId: text('source_record_id'),
  status: text('status').notNull().default('POSTED'), // DRAFT, POSTED, VOIDED
  totalDebit: numeric('total_debit', { precision: 15, scale: 2 }).notNull(),
  totalCredit: numeric('total_credit', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }).default('1'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  transactionNumberIdx: index('transaction_number_idx').on(table.transactionNumber),
  tenantTransactionIdx: index('tenant_transaction_idx').on(table.tenantId, table.transactionDate),
}));

// General Ledger Transaction Lines
export const glTransactionLines = pgTable('gl_transaction_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  transactionId: uuid('transaction_id').notNull().references(() => glTransactions.id),
  lineNumber: integer('line_number').notNull(),
  accountId: uuid('account_id').notNull().references(() => glAccounts.id),
  costCenterId: uuid('cost_center_id').references(() => costCenters.id),
  debitAmount: numeric('debit_amount', { precision: 15, scale: 2 }).notNull(),
  creditAmount: numeric('credit_amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  reference: text('reference'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  transactionLineIdx: index('transaction_line_idx').on(table.transactionId, table.lineNumber),
}));

// Financial Reports
export const financialReports = pgTable('financial_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // PROFIT_LOSS, BALANCE_SHEET, CASH_FLOW, BUDGET_VARIANCE, CUSTOM
  period: text('period').notNull(), // MONTHLY, QUARTERLY, ANNUAL
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('DRAFT'), // DRAFT, REVIEW, APPROVED, PUBLISHED
  data: jsonb('data').notNull(), // Report data structure
  filters: jsonb('filters'), // Applied filters
  createdBy: uuid('created_by').notNull().references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  reportNameIdx: index('report_name_idx').on(table.name),
  tenantReportIdx: index('tenant_report_idx').on(table.tenantId, table.type),
}));

// Financial Report Templates
export const financialReportTemplates = pgTable('financial_report_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PROFIT_LOSS, BALANCE_SHEET, CASH_FLOW, BUDGET_VARIANCE, CUSTOM
  template: jsonb('template').notNull(), // Template structure
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  financialTemplateNameIdx: index('financial_template_name_idx').on(table.name),
  tenantFinancialTemplateIdx: index('tenant_financial_template_idx').on(table.tenantId, table.type),
})); 