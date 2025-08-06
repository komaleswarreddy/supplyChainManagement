import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  costCenters, 
  budgets, 
  budgetPeriods, 
  glAccounts, 
  glTransactions, 
  glTransactionLines,
  financialReports,
  financialReportTemplates
} from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { authenticate, hasPermissions } from '../middleware/auth';
import { AppError } from '../utils/app-error';

// Validation schemas
const CostCenterSchema = z.object({
  code: z.string().min(1, 'Cost center code is required'),
  name: z.string().min(1, 'Cost center name is required'),
  description: z.string().optional(),
  type: z.enum(['DEPARTMENT', 'PROJECT', 'LOCATION', 'PRODUCT', 'SERVICE']),
  parentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  locationId: z.string().optional(),
  budget: z.object({
    annual: z.number().positive(),
    monthly: z.number().positive(),
    spent: z.number().default(0),
    remaining: z.number().default(0)
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  effectiveDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

const BudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  type: z.enum(['OPERATIONAL', 'CAPITAL', 'PROJECT', 'DEPARTMENT', 'COST_CENTER']),
  category: z.string().min(1, 'Budget category is required'),
  fiscalYear: z.string().min(1, 'Fiscal year is required'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  totalBudget: z.number().positive(),
  allocatedBudget: z.number().default(0),
  actualSpent: z.number().default(0),
  committedAmount: z.number().default(0),
  remainingBudget: z.number().default(0),
  variance: z.number().default(0),
  variancePercentage: z.number().default(0),
  status: z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVER_BUDGET']).default('DRAFT'),
  ownerId: z.string().uuid(),
  approverId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  notes: z.string().optional()
});

const GLAccountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  category: z.string().min(1, 'Account category is required'),
  parentAccountId: z.string().uuid().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  allowPosting: z.boolean().default(true),
  defaultCostCenterId: z.string().uuid().optional()
});

const GLTransactionSchema = z.object({
  transactionDate: z.string().datetime(),
  postingDate: z.string().datetime(),
  reference: z.string().optional(),
  description: z.string().min(1, 'Transaction description is required'),
  sourceModule: z.string().min(1, 'Source module is required'),
  sourceRecordId: z.string().optional(),
  status: z.enum(['DRAFT', 'POSTED', 'VOIDED']).default('POSTED'),
  totalDebit: z.number().positive(),
  totalCredit: z.number().positive(),
  currency: z.string().default('USD'),
  exchangeRate: z.number().default(1),
  notes: z.string().optional(),
  lines: z.array(z.object({
    lineNumber: z.number().int().positive(),
    accountId: z.string().uuid(),
    costCenterId: z.string().uuid().optional(),
    debitAmount: z.number().default(0),
    creditAmount: z.number().default(0),
    description: z.string().optional(),
    reference: z.string().optional()
  })).min(1, 'At least one transaction line is required')
});

const FinancialReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  type: z.enum(['PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VARIANCE', 'CUSTOM']),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']).default('DRAFT'),
  data: z.record(z.any()),
  filters: z.record(z.any()).optional(),
  approvedBy: z.string().uuid().optional(),
  notes: z.string().optional()
});

export default async function financeRoutes(fastify: FastifyInstance) {
  // Cost Centers
  fastify.get('/cost-centers', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        search: z.string().optional(),
        type: z.enum(['DEPARTMENT', 'PROJECT', 'LOCATION', 'PRODUCT', 'SERVICE']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, search, type, status } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(costCenters.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (search) {
      conditions.push(
        sql`(${costCenters.name} ILIKE ${`%${search}%`} OR ${costCenters.code} ILIKE ${`%${search}%`})`
      );
    }

    if (type) {
      conditions.push(eq(costCenters.type, type));
    }

    if (status) {
      conditions.push(eq(costCenters.status, status));
    }

    const [costCentersList, total] = await Promise.all([
      db.select()
        .from(costCenters)
        .where(and(...conditions))
        .orderBy(desc(costCenters.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(costCenters)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: costCentersList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.get('/cost-centers/:id', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const costCenter = await db.select()
      .from(costCenters)
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, user.tenantId)))
      .limit(1);

    if (!costCenter.length) {
      throw new AppError('Cost center not found', 404);
    }

    return costCenter[0];
  });

  fastify.post('/cost-centers', {
    preHandler: authenticate,
    schema: {
      body: CostCenterSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const costCenterData = request.body as any;

    // Check if code already exists
    const existingCostCenter = await db.select()
      .from(costCenters)
      .where(and(eq(costCenters.code, costCenterData.code), eq(costCenters.tenantId, user.tenantId)))
      .limit(1);

    if (existingCostCenter.length) {
      throw new AppError('Cost center code already exists', 400);
    }

    const [costCenter] = await db.insert(costCenters)
      .values({
        ...costCenterData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return costCenter;
  });

  fastify.put('/cost-centers/:id', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: CostCenterSchema.partial()
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;
    const updateData = request.body as any;

    const [costCenter] = await db.update(costCenters)
      .set({
        ...updateData,
        updatedAt: new Date(),
        updatedBy: user.id
      })
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, user.tenantId)))
      .returning();

    if (!costCenter) {
      throw new AppError('Cost center not found', 404);
    }

    return costCenter;
  });

  fastify.delete('/cost-centers/:id', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const [costCenter] = await db.delete(costCenters)
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, user.tenantId)))
      .returning();

    if (!costCenter) {
      throw new AppError('Cost center not found', 404);
    }

    return { message: 'Cost center deleted successfully' };
  });

  // Budgets
  fastify.get('/budgets', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        search: z.string().optional(),
        type: z.enum(['OPERATIONAL', 'CAPITAL', 'PROJECT', 'DEPARTMENT', 'COST_CENTER']).optional(),
        status: z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVER_BUDGET']).optional(),
        fiscalYear: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, search, type, status, fiscalYear } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(budgets.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (search) {
      conditions.push(sql`${budgets.name} ILIKE ${`%${search}%`}`);
    }

    if (type) {
      conditions.push(eq(budgets.type, type));
    }

    if (status) {
      conditions.push(eq(budgets.status, status));
    }

    if (fiscalYear) {
      conditions.push(eq(budgets.fiscalYear, fiscalYear));
    }

    const [budgetsList, total] = await Promise.all([
      db.select()
        .from(budgets)
        .where(and(...conditions))
        .orderBy(desc(budgets.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(budgets)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: budgetsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/budgets', {
    preHandler: authenticate,
    schema: {
      body: BudgetSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const budgetData = request.body as any;

    const [budget] = await db.insert(budgets)
      .values({
        ...budgetData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return budget;
  });

  fastify.put('/budgets/:id/approve', {
    preHandler: authenticate,
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { id } = request.params as any;

    const [budget] = await db.update(budgets)
      .set({
        status: 'APPROVED',
        approverId: user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id
      })
      .where(and(eq(budgets.id, id), eq(budgets.tenantId, user.tenantId)))
      .returning();

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    return budget;
  });

  // General Ledger Accounts
  fastify.get('/gl-accounts', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        search: z.string().optional(),
        accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']).optional(),
        isActive: z.string().transform(val => val === 'true').optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, search, accountType, isActive } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(glAccounts.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (search) {
      conditions.push(
        sql`(${glAccounts.accountName} ILIKE ${`%${search}%`} OR ${glAccounts.accountNumber} ILIKE ${`%${search}%`})`
      );
    }

    if (accountType) {
      conditions.push(eq(glAccounts.accountType, accountType));
    }

    if (isActive !== undefined) {
      conditions.push(eq(glAccounts.isActive, isActive));
    }

    const [accounts, total] = await Promise.all([
      db.select()
        .from(glAccounts)
        .where(and(...conditions))
        .orderBy(asc(glAccounts.accountNumber))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(glAccounts)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/gl-accounts', {
    preHandler: authenticate,
    schema: {
      body: GLAccountSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const accountData = request.body as any;

    // Check if account number already exists
    const existingAccount = await db.select()
      .from(glAccounts)
      .where(and(eq(glAccounts.accountNumber, accountData.accountNumber), eq(glAccounts.tenantId, user.tenantId)))
      .limit(1);

    if (existingAccount.length) {
      throw new AppError('Account number already exists', 400);
    }

    const [account] = await db.insert(glAccounts)
      .values({
        ...accountData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    return account;
  });

  // General Ledger Transactions
  fastify.post('/gl-transactions', {
    preHandler: authenticate,
    schema: {
      body: GLTransactionSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const transactionData = request.body as any;

    // Validate debit equals credit
    const totalDebit = transactionData.lines.reduce((sum: number, line: any) => sum + line.debitAmount, 0);
    const totalCredit = transactionData.lines.reduce((sum: number, line: any) => sum + line.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new AppError('Total debit must equal total credit', 400);
    }

    // Generate transaction number
    const transactionNumber = `GL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [transaction] = await db.insert(glTransactions)
      .values({
        ...transactionData,
        transactionNumber,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id
      })
      .returning();

    // Insert transaction lines
    const transactionLines = transactionData.lines.map((line: any) => ({
      ...line,
      transactionId: transaction.id,
      tenantId: user.tenantId
    }));

    await db.insert(glTransactionLines).values(transactionLines);

    return transaction;
  });

  fastify.get('/gl-transactions', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        status: z.enum(['DRAFT', 'POSTED', 'VOIDED']).optional(),
        sourceModule: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, startDate, endDate, status, sourceModule } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(glTransactions.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (startDate) {
      conditions.push(sql`${glTransactions.transactionDate} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${glTransactions.transactionDate} <= ${endDate}`);
    }

    if (status) {
      conditions.push(eq(glTransactions.status, status));
    }

    if (sourceModule) {
      conditions.push(eq(glTransactions.sourceModule, sourceModule));
    }

    const [transactions, total] = await Promise.all([
      db.select()
        .from(glTransactions)
        .where(and(...conditions))
        .orderBy(desc(glTransactions.transactionDate))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(glTransactions)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // Financial Reports
  fastify.get('/financial-reports', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.enum(['PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VARIANCE', 'CUSTOM']).optional(),
        status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { page, limit, type, status } = request.query as any;
    const offset = (page - 1) * limit;

    let whereClause = eq(financialReports.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (type) {
      conditions.push(eq(financialReports.type, type));
    }

    if (status) {
      conditions.push(eq(financialReports.status, status));
    }

    const [reports, total] = await Promise.all([
      db.select()
        .from(financialReports)
        .where(and(...conditions))
        .orderBy(desc(financialReports.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(financialReports)
        .where(and(...conditions))
        .then(result => result[0]?.count || 0)
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.post('/financial-reports', {
    preHandler: authenticate,
    schema: {
      body: FinancialReportSchema
    }
  }, async (request, reply) => {
    const { user } = request;
    const reportData = request.body as any;

    const [report] = await db.insert(financialReports)
      .values({
        ...reportData,
        tenantId: user.tenantId,
        createdBy: user.id
      })
      .returning();

    return report;
  });

  // Financial Analytics
  fastify.get('/analytics/budget-variance', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        fiscalYear: z.string().optional(),
        type: z.enum(['OPERATIONAL', 'CAPITAL', 'PROJECT', 'DEPARTMENT', 'COST_CENTER']).optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { fiscalYear, type } = request.query as any;

    let whereClause = eq(budgets.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (fiscalYear) {
      conditions.push(eq(budgets.fiscalYear, fiscalYear));
    }

    if (type) {
      conditions.push(eq(budgets.type, type));
    }

    const budgetVariance = await db.select({
      totalBudget: sql<number>`SUM(${budgets.totalBudget})`,
      actualSpent: sql<number>`SUM(${budgets.actualSpent})`,
      variance: sql<number>`SUM(${budgets.variance})`,
      variancePercentage: sql<number>`AVG(${budgets.variancePercentage})`
    })
    .from(budgets)
    .where(and(...conditions));

    return budgetVariance[0];
  });

  fastify.get('/analytics/cost-center-performance', {
    preHandler: authenticate,
    schema: {
      querystring: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
      })
    }
  }, async (request, reply) => {
    const { user } = request;
    const { startDate, endDate } = request.query as any;

    let whereClause = eq(costCenters.tenantId, user.tenantId);
    const conditions = [whereClause];

    if (startDate) {
      conditions.push(sql`${costCenters.effectiveDate} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${costCenters.effectiveDate} <= ${endDate}`);
    }

    const performance = await db.select({
      code: costCenters.code,
      name: costCenters.name,
      type: costCenters.type,
      budget: costCenters.budget,
      status: costCenters.status
    })
    .from(costCenters)
    .where(and(...conditions))
    .orderBy(asc(costCenters.code));

    return performance;
  });
} 
