import { z } from 'zod';
import type { 
  CostCenter, 
  CreateCostCenterRequest, 
  UpdateCostCenterRequest, 
  CostCenterAnalytics,
  Budget,
  GLAccount,
  GLTransaction,
  FinancialReport
} from '@/types/finance';

// Zod schemas for validation
export const CostCenterSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DEPARTMENT', 'PROJECT', 'LOCATION', 'PRODUCT', 'SERVICE']),
  parentId: z.string().optional(),
  managerId: z.string().optional(),
  locationId: z.string().optional(),
  budget: z.object({
    annual: z.number().min(0),
    monthly: z.number().min(0),
    spent: z.number().min(0),
    remaining: z.number().min(0)
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  effectiveDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional()
});

export const BudgetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['OPERATIONAL', 'CAPITAL', 'PROJECT', 'DEPARTMENT', 'COST_CENTER']),
  category: z.string().min(1, 'Category is required'),
  fiscalYear: z.string().min(1, 'Fiscal year is required'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  totalBudget: z.number().min(0),
  allocatedBudget: z.number().min(0),
  actualSpent: z.number().min(0),
  committedAmount: z.number().min(0),
  remainingBudget: z.number().min(0),
  variance: z.number(),
  variancePercentage: z.number(),
  status: z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVER_BUDGET']),
  ownerId: z.string().min(1, 'Owner is required'),
  approverId: z.string().optional(),
  approvedAt: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional()
});

export const GLAccountSchema = z.object({
  id: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  parentAccountId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  allowPosting: z.boolean(),
  defaultCostCenterId: z.string().optional()
});

export const GLTransactionSchema = z.object({
  id: z.string().optional(),
  transactionNumber: z.string().min(1, 'Transaction number is required'),
  transactionDate: z.string(),
  postingDate: z.string(),
  reference: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  sourceModule: z.string().min(1, 'Source module is required'),
  sourceRecordId: z.string().optional(),
  status: z.enum(['DRAFT', 'POSTED', 'VOIDED']),
  totalDebit: z.number().min(0),
  totalCredit: z.number().min(0),
  currency: z.string().default('USD'),
  exchangeRate: z.number().default(1),
  notes: z.string().optional(),
  lines: z.array(z.object({
    accountId: z.string().min(1, 'Account is required'),
    costCenterId: z.string().optional(),
    debitAmount: z.number().min(0),
    creditAmount: z.number().min(0),
    description: z.string().optional(),
    reference: z.string().optional()
  }))
});

export const FinancialReportSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VARIANCE', 'CUSTOM']),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']),
  data: z.record(z.any()),
  filters: z.record(z.any()).optional(),
  createdBy: z.string().min(1, 'Creator is required'),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  notes: z.string().optional()
});

// Mock data for when API is not available
const mockCostCenters = [
  {
    id: 'cc-1',
    name: 'Procurement Department',
    code: 'PROC-001',
    description: 'Cost center for procurement activities',
    budget: 500000,
    spent: 125000,
    remaining: 375000,
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'cc-2',
    name: 'IT Department',
    code: 'IT-001',
    description: 'Cost center for IT infrastructure and software',
    budget: 750000,
    spent: 300000,
    remaining: 450000,
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'cc-3',
    name: 'Operations Department',
    code: 'OPS-001',
    description: 'Cost center for operational activities',
    budget: 1000000,
    spent: 450000,
    remaining: 550000,
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export const financeApi = {
  // Cost Centers
  async getCostCenters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: CostCenter[]; total: number; page: number; limit: number }> {
    console.warn('Using mock data for cost centers');
    return {
      data: mockCostCenters,
      total: mockCostCenters.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  async getCostCenter(id: string): Promise<CostCenter> {
    console.warn('Using mock data for cost center');
    const mockCostCenter = mockCostCenters.find(cc => cc.id === id);
    if (mockCostCenter) {
      return mockCostCenter;
    }
    throw new Error('Cost center not found');
  },

  async createCostCenter(data: CreateCostCenterRequest): Promise<CostCenter> {
    console.warn('Using mock data for create cost center');
    const mockCostCenter: CostCenter = {
      id: `cc-${Date.now()}`,
      name: data.name,
      code: data.code,
      description: data.description,
      budget: data.budget,
      spent: 0,
      remaining: data.budget,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockCostCenter;
  },

  async updateCostCenter(id: string, data: UpdateCostCenterRequest): Promise<CostCenter> {
    console.warn('Using mock data for update cost center');
    const mockCostCenter = mockCostCenters.find(cc => cc.id === id);
    if (mockCostCenter) {
      return { ...mockCostCenter, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Cost center not found');
  },

  async deleteCostCenter(id: string): Promise<void> {
    console.warn('Using mock data for delete cost center');
    // Mock successful deletion
  },

  async getCostCenterAnalytics(id: string): Promise<CostCenterAnalytics> {
    console.warn('Using mock data for cost center analytics');
    const mockCostCenter = mockCostCenters.find(cc => cc.id === id);
    if (mockCostCenter) {
      return {
        costCenterId: id,
        totalBudget: mockCostCenter.budget,
        totalSpent: mockCostCenter.spent,
        remainingBudget: mockCostCenter.remaining,
        utilizationRate: (mockCostCenter.spent / mockCostCenter.budget) * 100,
        monthlySpending: [
          { month: '2024-01', spent: 25000 },
          { month: '2024-02', spent: 30000 },
          { month: '2024-03', spent: 35000 },
        ],
        topExpenses: [
          { category: 'Software Licenses', amount: 50000 },
          { category: 'Hardware', amount: 40000 },
          { category: 'Services', amount: 35000 },
        ],
      };
    }
    throw new Error('Cost center not found');
  },
};

// Budgets API
export const budgetAPI = {
  // Get all budgets
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    fiscalYear?: string;
    page?: number;
    limit?: number;
  }) => {
    console.warn('Using mock data for budgets');
    return {
      data: [
        {
          id: 'b-1',
          name: 'Annual Budget 2024',
          description: 'Overall budget for the fiscal year',
          type: 'OPERATIONAL',
          category: 'General',
          fiscalYear: '2024',
          period: 'ANNUAL',
          totalBudget: 1000000,
          allocatedBudget: 800000,
          actualSpent: 600000,
          committedAmount: 500000,
          remainingBudget: 200000,
          variance: 100000,
          variancePercentage: 12.5,
          status: 'ACTIVE',
          ownerId: 'u-1',
          approverId: 'u-2',
          approvedAt: '2024-01-10T10:00:00Z',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          notes: 'Initial budget for the year',
        },
        {
          id: 'b-2',
          name: 'Quarterly Budget Q1 2024',
          description: 'Budget for the first quarter',
          type: 'PROJECT',
          category: 'Software Development',
          fiscalYear: '2024',
          period: 'QUARTERLY',
          totalBudget: 200000,
          allocatedBudget: 150000,
          actualSpent: 120000,
          committedAmount: 100000,
          remainingBudget: 30000,
          variance: 20000,
          variancePercentage: 13.3,
          status: 'APPROVED',
          ownerId: 'u-2',
          approverId: 'u-1',
          approvedAt: '2024-03-15T10:00:00Z',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z',
          notes: 'Budget for the first quarter of the year',
        },
      ],
      total: 2,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  // Get budget by ID
  getById: async (id: string) => {
    console.warn('Using mock data for budget by ID');
    const budget = [
      {
        id: 'b-1',
        name: 'Annual Budget 2024',
        description: 'Overall budget for the fiscal year',
        type: 'OPERATIONAL',
        category: 'General',
        fiscalYear: '2024',
        period: 'ANNUAL',
        totalBudget: 1000000,
        allocatedBudget: 800000,
        actualSpent: 600000,
        committedAmount: 500000,
        remainingBudget: 200000,
        variance: 100000,
        variancePercentage: 12.5,
        status: 'ACTIVE',
        ownerId: 'u-1',
        approverId: 'u-2',
        approvedAt: '2024-01-10T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        notes: 'Initial budget for the year',
      },
      {
        id: 'b-2',
        name: 'Quarterly Budget Q1 2024',
        description: 'Budget for the first quarter',
        type: 'PROJECT',
        category: 'Software Development',
        fiscalYear: '2024',
        period: 'QUARTERLY',
        totalBudget: 200000,
        allocatedBudget: 150000,
        actualSpent: 120000,
        committedAmount: 100000,
        remainingBudget: 30000,
        variance: 20000,
        variancePercentage: 13.3,
        status: 'APPROVED',
        ownerId: 'u-2',
        approverId: 'u-1',
        approvedAt: '2024-03-15T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        notes: 'Budget for the first quarter of the year',
      },
    ].find(b => b.id === id);
    if (budget) {
      return budget;
    }
    throw new Error('Budget not found');
  },

  // Create new budget
  create: async (data: Omit<Budget, 'id'>) => {
    console.warn('Using mock data for create budget');
    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      fiscalYear: data.fiscalYear,
      period: data.period,
      totalBudget: data.totalBudget,
      allocatedBudget: data.allocatedBudget,
      actualSpent: data.actualSpent,
      committedAmount: data.committedAmount,
      remainingBudget: data.remainingBudget,
      variance: data.variance,
      variancePercentage: data.variancePercentage,
      status: 'DRAFT',
      ownerId: 'u-1', // Assuming a default owner
      approverId: undefined,
      approvedAt: undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
    };
    return newBudget;
  },

  // Update budget
  update: async (id: string, data: Partial<Budget>) => {
    console.warn('Using mock data for update budget');
    const budget = [
      {
        id: 'b-1',
        name: 'Annual Budget 2024',
        description: 'Overall budget for the fiscal year',
        type: 'OPERATIONAL',
        category: 'General',
        fiscalYear: '2024',
        period: 'ANNUAL',
        totalBudget: 1000000,
        allocatedBudget: 800000,
        actualSpent: 600000,
        committedAmount: 500000,
        remainingBudget: 200000,
        variance: 100000,
        variancePercentage: 12.5,
        status: 'ACTIVE',
        ownerId: 'u-1',
        approverId: 'u-2',
        approvedAt: '2024-01-10T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        notes: 'Initial budget for the year',
      },
      {
        id: 'b-2',
        name: 'Quarterly Budget Q1 2024',
        description: 'Budget for the first quarter',
        type: 'PROJECT',
        category: 'Software Development',
        fiscalYear: '2024',
        period: 'QUARTERLY',
        totalBudget: 200000,
        allocatedBudget: 150000,
        actualSpent: 120000,
        committedAmount: 100000,
        remainingBudget: 30000,
        variance: 20000,
        variancePercentage: 13.3,
        status: 'APPROVED',
        ownerId: 'u-2',
        approverId: 'u-1',
        approvedAt: '2024-03-15T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        notes: 'Budget for the first quarter of the year',
      },
    ].find(b => b.id === id);
    if (budget) {
      return { ...budget, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Budget not found');
  },

  // Delete budget
  delete: async (id: string) => {
    console.warn('Using mock data for delete budget');
    // Mock successful deletion
  },

  // Approve budget
  approve: async (id: string) => {
    console.warn('Using mock data for approve budget');
    const budget = [
      {
        id: 'b-1',
        name: 'Annual Budget 2024',
        description: 'Overall budget for the fiscal year',
        type: 'OPERATIONAL',
        category: 'General',
        fiscalYear: '2024',
        period: 'ANNUAL',
        totalBudget: 1000000,
        allocatedBudget: 800000,
        actualSpent: 600000,
        committedAmount: 500000,
        remainingBudget: 200000,
        variance: 100000,
        variancePercentage: 12.5,
        status: 'ACTIVE',
        ownerId: 'u-1',
        approverId: 'u-2',
        approvedAt: '2024-01-10T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        notes: 'Initial budget for the year',
      },
      {
        id: 'b-2',
        name: 'Quarterly Budget Q1 2024',
        description: 'Budget for the first quarter',
        type: 'PROJECT',
        category: 'Software Development',
        fiscalYear: '2024',
        period: 'QUARTERLY',
        totalBudget: 200000,
        allocatedBudget: 150000,
        actualSpent: 120000,
        committedAmount: 100000,
        remainingBudget: 30000,
        variance: 20000,
        variancePercentage: 13.3,
        status: 'APPROVED',
        ownerId: 'u-2',
        approverId: 'u-1',
        approvedAt: '2024-03-15T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        notes: 'Budget for the first quarter of the year',
      },
    ].find(b => b.id === id);
    if (budget) {
      return { ...budget, status: 'APPROVED', updatedAt: new Date().toISOString() };
    }
    throw new Error('Budget not found');
  },

  // Get budget analytics
  getAnalytics: async (id: string) => {
    console.warn('Using mock data for budget analytics');
    const budget = [
      {
        id: 'b-1',
        name: 'Annual Budget 2024',
        description: 'Overall budget for the fiscal year',
        type: 'OPERATIONAL',
        category: 'General',
        fiscalYear: '2024',
        period: 'ANNUAL',
        totalBudget: 1000000,
        allocatedBudget: 800000,
        actualSpent: 600000,
        committedAmount: 500000,
        remainingBudget: 200000,
        variance: 100000,
        variancePercentage: 12.5,
        status: 'ACTIVE',
        ownerId: 'u-1',
        approverId: 'u-2',
        approvedAt: '2024-01-10T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        notes: 'Initial budget for the year',
      },
      {
        id: 'b-2',
        name: 'Quarterly Budget Q1 2024',
        description: 'Budget for the first quarter',
        type: 'PROJECT',
        category: 'Software Development',
        fiscalYear: '2024',
        period: 'QUARTERLY',
        totalBudget: 200000,
        allocatedBudget: 150000,
        actualSpent: 120000,
        committedAmount: 100000,
        remainingBudget: 30000,
        variance: 20000,
        variancePercentage: 13.3,
        status: 'APPROVED',
        ownerId: 'u-2',
        approverId: 'u-1',
        approvedAt: '2024-03-15T10:00:00Z',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        notes: 'Budget for the first quarter of the year',
      },
    ].find(b => b.id === id);
    if (budget) {
      return {
        budgetId: id,
        totalBudget: budget.totalBudget,
        totalSpent: budget.actualSpent,
        remainingBudget: budget.remainingBudget,
        utilizationRate: (budget.actualSpent / budget.totalBudget) * 100,
        monthlySpending: [
          { month: '2024-01', spent: 25000 },
          { month: '2024-02', spent: 30000 },
          { month: '2024-03', spent: 35000 },
        ],
        topExpenses: [
          { category: 'Software Licenses', amount: 50000 },
          { category: 'Hardware', amount: 40000 },
          { category: 'Services', amount: 35000 },
        ],
      };
    }
    throw new Error('Budget not found');
  }
};

// General Ledger Accounts API
export const glAccountAPI = {
  // Get all GL accounts
  getAll: async (params?: {
    search?: string;
    accountType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    console.warn('Using mock data for GL accounts');
    return {
      data: [
        {
          id: 'gl-a-1',
          accountNumber: '1010101',
          accountName: 'Cash',
          accountType: 'ASSET',
          category: 'Current Assets',
          parentAccountId: undefined,
          description: 'Cash on hand and in bank',
          isActive: true,
          allowPosting: true,
          defaultCostCenterId: undefined,
        },
        {
          id: 'gl-a-2',
          accountNumber: '1020202',
          accountName: 'Accounts Receivable',
          accountType: 'ASSET',
          category: 'Current Assets',
          parentAccountId: undefined,
          description: 'Money owed to the company',
          isActive: true,
          allowPosting: true,
          defaultCostCenterId: undefined,
        },
        {
          id: 'gl-a-3',
          accountNumber: '2010101',
          accountName: 'Inventory',
          accountType: 'ASSET',
          category: 'Current Assets',
          parentAccountId: undefined,
          description: 'Raw materials and finished goods',
          isActive: true,
          allowPosting: true,
          defaultCostCenterId: undefined,
        },
      ],
      total: 3,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  // Get GL account by ID
  getById: async (id: string) => {
    console.warn('Using mock data for GL account by ID');
    const account = [
      {
        id: 'gl-a-1',
        accountNumber: '1010101',
        accountName: 'Cash',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Cash on hand and in bank',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
      {
        id: 'gl-a-2',
        accountNumber: '1020202',
        accountName: 'Accounts Receivable',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Money owed to the company',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
      {
        id: 'gl-a-3',
        accountNumber: '2010101',
        accountName: 'Inventory',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Raw materials and finished goods',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
    ].find(a => a.id === id);
    if (account) {
      return account;
    }
    throw new Error('GL account not found');
  },

  // Create new GL account
  create: async (data: Omit<GLAccount, 'id'>) => {
    console.warn('Using mock data for create GL account');
    const newAccount: GLAccount = {
      id: `gl-a-${Date.now()}`,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      accountType: data.accountType,
      category: data.category,
      parentAccountId: data.parentAccountId,
      description: data.description,
      isActive: data.isActive,
      allowPosting: data.allowPosting,
      defaultCostCenterId: data.defaultCostCenterId,
    };
    return newAccount;
  },

  // Update GL account
  update: async (id: string, data: Partial<GLAccount>) => {
    console.warn('Using mock data for update GL account');
    const account = [
      {
        id: 'gl-a-1',
        accountNumber: '1010101',
        accountName: 'Cash',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Cash on hand and in bank',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
      {
        id: 'gl-a-2',
        accountNumber: '1020202',
        accountName: 'Accounts Receivable',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Money owed to the company',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
      {
        id: 'gl-a-3',
        accountNumber: '2010101',
        accountName: 'Inventory',
        accountType: 'ASSET',
        category: 'Current Assets',
        parentAccountId: undefined,
        description: 'Raw materials and finished goods',
        isActive: true,
        allowPosting: true,
        defaultCostCenterId: undefined,
      },
    ].find(a => a.id === id);
    if (account) {
      return { ...account, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('GL account not found');
  },

  // Delete GL account
  delete: async (id: string) => {
    console.warn('Using mock data for delete GL account');
    // Mock successful deletion
  }
};

// General Ledger Transactions API
export const glTransactionAPI = {
  // Get all GL transactions
  getAll: async (params?: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    console.warn('Using mock data for GL transactions');
    return {
      data: [
        {
          id: 'gl-t-1',
          transactionNumber: 'TXN-001',
          transactionDate: '2024-01-10',
          postingDate: '2024-01-10',
          reference: 'INV-001',
          description: 'Sale of goods to Customer A',
          sourceModule: 'Sales',
          sourceRecordId: 's-1',
          status: 'POSTED',
          totalDebit: 10000,
          totalCredit: 0,
          currency: 'USD',
          exchangeRate: 1,
          notes: 'Transaction for invoice 001',
          lines: [
            { accountId: 'gl-a-1', costCenterId: 'cc-1', debitAmount: 10000, creditAmount: 0, description: 'Sale of goods', reference: 'INV-001' },
          ],
        },
        {
          id: 'gl-t-2',
          transactionNumber: 'TXN-002',
          transactionDate: '2024-02-15',
          postingDate: '2024-02-15',
          reference: 'INV-002',
          description: 'Purchase of inventory from Supplier B',
          sourceModule: 'Inventory',
          sourceRecordId: 'i-1',
          status: 'POSTED',
          totalDebit: 0,
          totalCredit: 5000,
          currency: 'USD',
          exchangeRate: 1,
          notes: 'Transaction for invoice 002',
          lines: [
            { accountId: 'gl-a-3', costCenterId: 'cc-2', debitAmount: 0, creditAmount: 5000, description: 'Purchase of inventory', reference: 'INV-002' },
          ],
        },
        {
          id: 'gl-t-3',
          transactionNumber: 'TXN-003',
          transactionDate: '2024-03-20',
          postingDate: '2024-03-20',
          reference: 'INV-003',
          description: 'Payment to Supplier A',
          sourceModule: 'Payroll',
          sourceRecordId: 'p-1',
          status: 'POSTED',
          totalDebit: 0,
          totalCredit: 2000,
          currency: 'USD',
          exchangeRate: 1,
          notes: 'Transaction for payment 001',
          lines: [
            { accountId: 'gl-a-2', costCenterId: 'cc-3', debitAmount: 0, creditAmount: 2000, description: 'Payment to Supplier A', reference: 'PAY-001' },
          ],
        },
      ],
      total: 3,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  // Get GL transaction by ID
  getById: async (id: string) => {
    console.warn('Using mock data for GL transaction by ID');
    const transaction = [
      {
        id: 'gl-t-1',
        transactionNumber: 'TXN-001',
        transactionDate: '2024-01-10',
        postingDate: '2024-01-10',
        reference: 'INV-001',
        description: 'Sale of goods to Customer A',
        sourceModule: 'Sales',
        sourceRecordId: 's-1',
        status: 'POSTED',
        totalDebit: 10000,
        totalCredit: 0,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 001',
        lines: [
          { accountId: 'gl-a-1', costCenterId: 'cc-1', debitAmount: 10000, creditAmount: 0, description: 'Sale of goods', reference: 'INV-001' },
        ],
      },
      {
        id: 'gl-t-2',
        transactionNumber: 'TXN-002',
        transactionDate: '2024-02-15',
        postingDate: '2024-02-15',
        reference: 'INV-002',
        description: 'Purchase of inventory from Supplier B',
        sourceModule: 'Inventory',
        sourceRecordId: 'i-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 5000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 002',
        lines: [
          { accountId: 'gl-a-3', costCenterId: 'cc-2', debitAmount: 0, creditAmount: 5000, description: 'Purchase of inventory', reference: 'INV-002' },
        ],
      },
      {
        id: 'gl-t-3',
        transactionNumber: 'TXN-003',
        transactionDate: '2024-03-20',
        postingDate: '2024-03-20',
        reference: 'INV-003',
        description: 'Payment to Supplier A',
        sourceModule: 'Payroll',
        sourceRecordId: 'p-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 2000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for payment 001',
        lines: [
          { accountId: 'gl-a-2', costCenterId: 'cc-3', debitAmount: 0, creditAmount: 2000, description: 'Payment to Supplier A', reference: 'PAY-001' },
        ],
      },
    ].find(t => t.id === id);
    if (transaction) {
      return transaction;
    }
    throw new Error('GL transaction not found');
  },

  // Create new GL transaction
  create: async (data: Omit<GLTransaction, 'id'>) => {
    console.warn('Using mock data for create GL transaction');
    const newTransaction: GLTransaction = {
      id: `gl-t-${Date.now()}`,
      transactionNumber: data.transactionNumber,
      transactionDate: data.transactionDate,
      postingDate: data.postingDate,
      reference: data.reference,
      description: data.description,
      sourceModule: data.sourceModule,
      sourceRecordId: data.sourceRecordId,
      status: 'DRAFT',
      totalDebit: 0,
      totalCredit: 0,
      currency: 'USD',
      exchangeRate: 1,
      notes: data.notes,
      lines: data.lines,
    };
    return newTransaction;
  },

  // Update GL transaction
  update: async (id: string, data: Partial<GLTransaction>) => {
    console.warn('Using mock data for update GL transaction');
    const transaction = [
      {
        id: 'gl-t-1',
        transactionNumber: 'TXN-001',
        transactionDate: '2024-01-10',
        postingDate: '2024-01-10',
        reference: 'INV-001',
        description: 'Sale of goods to Customer A',
        sourceModule: 'Sales',
        sourceRecordId: 's-1',
        status: 'POSTED',
        totalDebit: 10000,
        totalCredit: 0,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 001',
        lines: [
          { accountId: 'gl-a-1', costCenterId: 'cc-1', debitAmount: 10000, creditAmount: 0, description: 'Sale of goods', reference: 'INV-001' },
        ],
      },
      {
        id: 'gl-t-2',
        transactionNumber: 'TXN-002',
        transactionDate: '2024-02-15',
        postingDate: '2024-02-15',
        reference: 'INV-002',
        description: 'Purchase of inventory from Supplier B',
        sourceModule: 'Inventory',
        sourceRecordId: 'i-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 5000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 002',
        lines: [
          { accountId: 'gl-a-3', costCenterId: 'cc-2', debitAmount: 0, creditAmount: 5000, description: 'Purchase of inventory', reference: 'INV-002' },
        ],
      },
      {
        id: 'gl-t-3',
        transactionNumber: 'TXN-003',
        transactionDate: '2024-03-20',
        postingDate: '2024-03-20',
        reference: 'INV-003',
        description: 'Payment to Supplier A',
        sourceModule: 'Payroll',
        sourceRecordId: 'p-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 2000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for payment 001',
        lines: [
          { accountId: 'gl-a-2', costCenterId: 'cc-3', debitAmount: 0, creditAmount: 2000, description: 'Payment to Supplier A', reference: 'PAY-001' },
        ],
      },
    ].find(t => t.id === id);
    if (transaction) {
      return { ...transaction, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('GL transaction not found');
  },

  // Delete GL transaction
  delete: async (id: string) => {
    console.warn('Using mock data for delete GL transaction');
    // Mock successful deletion
  },

  // Post transaction
  post: async (id: string) => {
    console.warn('Using mock data for post GL transaction');
    const transaction = [
      {
        id: 'gl-t-1',
        transactionNumber: 'TXN-001',
        transactionDate: '2024-01-10',
        postingDate: '2024-01-10',
        reference: 'INV-001',
        description: 'Sale of goods to Customer A',
        sourceModule: 'Sales',
        sourceRecordId: 's-1',
        status: 'POSTED',
        totalDebit: 10000,
        totalCredit: 0,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 001',
        lines: [
          { accountId: 'gl-a-1', costCenterId: 'cc-1', debitAmount: 10000, creditAmount: 0, description: 'Sale of goods', reference: 'INV-001' },
        ],
      },
      {
        id: 'gl-t-2',
        transactionNumber: 'TXN-002',
        transactionDate: '2024-02-15',
        postingDate: '2024-02-15',
        reference: 'INV-002',
        description: 'Purchase of inventory from Supplier B',
        sourceModule: 'Inventory',
        sourceRecordId: 'i-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 5000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 002',
        lines: [
          { accountId: 'gl-a-3', costCenterId: 'cc-2', debitAmount: 0, creditAmount: 5000, description: 'Purchase of inventory', reference: 'INV-002' },
        ],
      },
      {
        id: 'gl-t-3',
        transactionNumber: 'TXN-003',
        transactionDate: '2024-03-20',
        postingDate: '2024-03-20',
        reference: 'INV-003',
        description: 'Payment to Supplier A',
        sourceModule: 'Payroll',
        sourceRecordId: 'p-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 2000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for payment 001',
        lines: [
          { accountId: 'gl-a-2', costCenterId: 'cc-3', debitAmount: 0, creditAmount: 2000, description: 'Payment to Supplier A', reference: 'PAY-001' },
        ],
      },
    ].find(t => t.id === id);
    if (transaction) {
      return { ...transaction, status: 'POSTED', updatedAt: new Date().toISOString() };
    }
    throw new Error('GL transaction not found');
  },

  // Void transaction
  void: async (id: string) => {
    console.warn('Using mock data for void GL transaction');
    const transaction = [
      {
        id: 'gl-t-1',
        transactionNumber: 'TXN-001',
        transactionDate: '2024-01-10',
        postingDate: '2024-01-10',
        reference: 'INV-001',
        description: 'Sale of goods to Customer A',
        sourceModule: 'Sales',
        sourceRecordId: 's-1',
        status: 'POSTED',
        totalDebit: 10000,
        totalCredit: 0,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 001',
        lines: [
          { accountId: 'gl-a-1', costCenterId: 'cc-1', debitAmount: 10000, creditAmount: 0, description: 'Sale of goods', reference: 'INV-001' },
        ],
      },
      {
        id: 'gl-t-2',
        transactionNumber: 'TXN-002',
        transactionDate: '2024-02-15',
        postingDate: '2024-02-15',
        reference: 'INV-002',
        description: 'Purchase of inventory from Supplier B',
        sourceModule: 'Inventory',
        sourceRecordId: 'i-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 5000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for invoice 002',
        lines: [
          { accountId: 'gl-a-3', costCenterId: 'cc-2', debitAmount: 0, creditAmount: 5000, description: 'Purchase of inventory', reference: 'INV-002' },
        ],
      },
      {
        id: 'gl-t-3',
        transactionNumber: 'TXN-003',
        transactionDate: '2024-03-20',
        postingDate: '2024-03-20',
        reference: 'INV-003',
        description: 'Payment to Supplier A',
        sourceModule: 'Payroll',
        sourceRecordId: 'p-1',
        status: 'POSTED',
        totalDebit: 0,
        totalCredit: 2000,
        currency: 'USD',
        exchangeRate: 1,
        notes: 'Transaction for payment 001',
        lines: [
          { accountId: 'gl-a-2', costCenterId: 'cc-3', debitAmount: 0, creditAmount: 2000, description: 'Payment to Supplier A', reference: 'PAY-001' },
        ],
      },
    ].find(t => t.id === id);
    if (transaction) {
      return { ...transaction, status: 'VOIDED', updatedAt: new Date().toISOString() };
    }
    throw new Error('GL transaction not found');
  }
};

// Financial Reports API
export const financialReportAPI = {
  // Get all financial reports
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    console.warn('Using mock data for financial reports');
    return {
      data: [
        {
          id: 'fr-1',
          name: 'Monthly Profit & Loss Report Jan 2024',
          type: 'PROFIT_LOSS',
          period: 'MONTHLY',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          status: 'APPROVED',
          data: {
            totalRevenue: 100000,
            totalExpenses: 70000,
            netProfit: 30000,
            grossProfit: 50000,
            operatingExpenses: 20000,
            costOfGoodsSold: 20000,
            operatingIncome: 30000,
            interestExpense: 1000,
            incomeTaxExpense: 5000,
            netInterestExpense: 4000,
            netIncome: 21000,
          },
          filters: {},
          createdBy: 'u-1',
          approvedBy: 'u-2',
          approvedAt: '2024-01-31T10:00:00Z',
          notes: 'Monthly profit and loss for January 2024',
        },
        {
          id: 'fr-2',
          name: 'Quarterly Balance Sheet Q1 2024',
          type: 'BALANCE_SHEET',
          period: 'QUARTERLY',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z',
          status: 'DRAFT',
          data: {
            totalAssets: 150000,
            totalLiabilities: 50000,
            totalEquity: 100000,
            cash: 50000,
            accountsReceivable: 30000,
            inventory: 20000,
            propertyPlantEquipment: 50000,
            accountsPayable: 20000,
            shortTermLoans: 10000,
            longTermDebt: 20000,
            commonStock: 50000,
            retainedEarnings: 30000,
          },
          filters: {},
          createdBy: 'u-2',
          approvedBy: undefined,
          approvedAt: undefined,
          notes: 'Balance sheet for the first quarter of 2024',
        },
      ],
      total: 2,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  // Get financial report by ID
  getById: async (id: string) => {
    console.warn('Using mock data for financial report by ID');
    const report = [
      {
        id: 'fr-1',
        name: 'Monthly Profit & Loss Report Jan 2024',
        type: 'PROFIT_LOSS',
        period: 'MONTHLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        status: 'APPROVED',
        data: {
          totalRevenue: 100000,
          totalExpenses: 70000,
          netProfit: 30000,
          grossProfit: 50000,
          operatingExpenses: 20000,
          costOfGoodsSold: 20000,
          operatingIncome: 30000,
          interestExpense: 1000,
          incomeTaxExpense: 5000,
          netInterestExpense: 4000,
          netIncome: 21000,
        },
        filters: {},
        createdBy: 'u-1',
        approvedBy: 'u-2',
        approvedAt: '2024-01-31T10:00:00Z',
        notes: 'Monthly profit and loss for January 2024',
      },
      {
        id: 'fr-2',
        name: 'Quarterly Balance Sheet Q1 2024',
        type: 'BALANCE_SHEET',
        period: 'QUARTERLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        status: 'DRAFT',
        data: {
          totalAssets: 150000,
          totalLiabilities: 50000,
          totalEquity: 100000,
          cash: 50000,
          accountsReceivable: 30000,
          inventory: 20000,
          propertyPlantEquipment: 50000,
          accountsPayable: 20000,
          shortTermLoans: 10000,
          longTermDebt: 20000,
          commonStock: 50000,
          retainedEarnings: 30000,
        },
        filters: {},
        createdBy: 'u-2',
        approvedBy: undefined,
        approvedAt: undefined,
        notes: 'Balance sheet for the first quarter of 2024',
      },
    ].find(r => r.id === id);
    if (report) {
      return report;
    }
    throw new Error('Financial report not found');
  },

  // Create new financial report
  create: async (data: Omit<FinancialReport, 'id'>) => {
    console.warn('Using mock data for create financial report');
    const newReport: FinancialReport = {
      id: `fr-${Date.now()}`,
      name: data.name,
      type: data.type,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'DRAFT',
      data: data.data,
      filters: data.filters,
      createdBy: 'u-1', // Assuming a default creator
      approvedBy: undefined,
      approvedAt: undefined,
      notes: data.notes,
    };
    return newReport;
  },

  // Update financial report
  update: async (id: string, data: Partial<FinancialReport>) => {
    console.warn('Using mock data for update financial report');
    const report = [
      {
        id: 'fr-1',
        name: 'Monthly Profit & Loss Report Jan 2024',
        type: 'PROFIT_LOSS',
        period: 'MONTHLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        status: 'APPROVED',
        data: {
          totalRevenue: 100000,
          totalExpenses: 70000,
          netProfit: 30000,
          grossProfit: 50000,
          operatingExpenses: 20000,
          costOfGoodsSold: 20000,
          operatingIncome: 30000,
          interestExpense: 1000,
          incomeTaxExpense: 5000,
          netInterestExpense: 4000,
          netIncome: 21000,
        },
        filters: {},
        createdBy: 'u-1',
        approvedBy: 'u-2',
        approvedAt: '2024-01-31T10:00:00Z',
        notes: 'Monthly profit and loss for January 2024',
      },
      {
        id: 'fr-2',
        name: 'Quarterly Balance Sheet Q1 2024',
        type: 'BALANCE_SHEET',
        period: 'QUARTERLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        status: 'DRAFT',
        data: {
          totalAssets: 150000,
          totalLiabilities: 50000,
          totalEquity: 100000,
          cash: 50000,
          accountsReceivable: 30000,
          inventory: 20000,
          propertyPlantEquipment: 50000,
          accountsPayable: 20000,
          shortTermLoans: 10000,
          longTermDebt: 20000,
          commonStock: 50000,
          retainedEarnings: 30000,
        },
        filters: {},
        createdBy: 'u-2',
        approvedBy: undefined,
        approvedAt: undefined,
        notes: 'Balance sheet for the first quarter of 2024',
      },
    ].find(r => r.id === id);
    if (report) {
      return { ...report, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Financial report not found');
  },

  // Delete financial report
  delete: async (id: string) => {
    console.warn('Using mock data for delete financial report');
    // Mock successful deletion
  },

  // Approve financial report
  approve: async (id: string) => {
    console.warn('Using mock data for approve financial report');
    const report = [
      {
        id: 'fr-1',
        name: 'Monthly Profit & Loss Report Jan 2024',
        type: 'PROFIT_LOSS',
        period: 'MONTHLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        status: 'APPROVED',
        data: {
          totalRevenue: 100000,
          totalExpenses: 70000,
          netProfit: 30000,
          grossProfit: 50000,
          operatingExpenses: 20000,
          costOfGoodsSold: 20000,
          operatingIncome: 30000,
          interestExpense: 1000,
          incomeTaxExpense: 5000,
          netInterestExpense: 4000,
          netIncome: 21000,
        },
        filters: {},
        createdBy: 'u-1',
        approvedBy: 'u-2',
        approvedAt: '2024-01-31T10:00:00Z',
        notes: 'Monthly profit and loss for January 2024',
      },
      {
        id: 'fr-2',
        name: 'Quarterly Balance Sheet Q1 2024',
        type: 'BALANCE_SHEET',
        period: 'QUARTERLY',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        status: 'DRAFT',
        data: {
          totalAssets: 150000,
          totalLiabilities: 50000,
          totalEquity: 100000,
          cash: 50000,
          accountsReceivable: 30000,
          inventory: 20000,
          propertyPlantEquipment: 50000,
          accountsPayable: 20000,
          shortTermLoans: 10000,
          longTermDebt: 20000,
          commonStock: 50000,
          retainedEarnings: 30000,
        },
        filters: {},
        createdBy: 'u-2',
        approvedBy: undefined,
        approvedAt: undefined,
        notes: 'Balance sheet for the first quarter of 2024',
      },
    ].find(r => r.id === id);
    if (report) {
      return { ...report, status: 'APPROVED', updatedAt: new Date().toISOString() };
    }
    throw new Error('Financial report not found');
  },

  // Generate financial report
  generate: async (type: string, params: any) => {
    console.warn('Using mock data for generate financial report');
    const report: FinancialReport = {
      id: `fr-${Date.now()}`,
      name: `${type} Report ${new Date().toISOString().slice(0, 7)}`,
      type: type as FinancialReport['type'],
      period: 'MONTHLY', // Mocking a default period
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      endDate: new Date().toISOString(),
      status: 'DRAFT',
      data: {}, // Mock data structure
      filters: {},
      createdBy: 'u-1',
      approvedBy: undefined,
      approvedAt: undefined,
      notes: 'Generated report for the last month',
    };
    return report;
  }
};

// Finance Analytics API
export const financeAnalyticsAPI = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    console.warn('Using mock data for dashboard metrics');
    return {
      totalCostCenters: 10,
      totalBudgets: 5,
      totalGLAccounts: 20,
      totalGLTransactions: 100,
      totalFinancialReports: 10,
      totalUsers: 5,
      totalRevenue: 1000000,
      totalExpenses: 800000,
      netProfit: 200000,
      cashOnHand: 50000,
      accountsReceivable: 30000,
      inventory: 20000,
      totalLiabilities: 50000,
      totalEquity: 100000,
      totalAssets: 150000,
    };
  },

  // Get budget variance analysis
  getBudgetVariance: async (params?: {
    startDate?: string;
    endDate?: string;
    costCenterId?: string;
  }) => {
    console.warn('Using mock data for budget variance analysis');
    return {
      costCenterId: params?.costCenterId || 'cc-1',
      totalBudget: 100000,
      totalSpent: 80000,
      remainingBudget: 20000,
      utilizationRate: 80,
      monthlySpending: [
        { month: '2024-01', spent: 20000 },
        { month: '2024-02', spent: 20000 },
        { month: '2024-03', spent: 20000 },
      ],
      topExpenses: [
        { category: 'Salaries', amount: 30000 },
        { category: 'Rent', amount: 20000 },
        { category: 'Utilities', amount: 15000 },
      ],
    };
  },

  // Get cash flow analysis
  getCashFlow: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    console.warn('Using mock data for cash flow analysis');
    return {
      startDate: params?.startDate || '2024-01-01T00:00:00Z',
      endDate: params?.endDate || '2024-12-31T23:59:59Z',
      operatingActivities: {
        netIncome: 21000,
        depreciation: 5000,
        changesInWorkingCapital: -10000,
        cashFromOperations: 16000,
      },
      investingActivities: {
        purchasesOfPropertyPlantEquipment: -10000,
        salesOfPropertyPlantEquipment: 0,
        cashFromInvesting: -10000,
      },
      financingActivities: {
        commonStockIssued: 0,
        dividendsPaid: -5000,
        cashFromFinancing: -5000,
      },
      netChangeInCash: 1000,
      cashAtBeginningOfPeriod: 40000,
      cashAtEndOfPeriod: 41000,
    };
  },

  // Get cost center performance
  getCostCenterPerformance: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    console.warn('Using mock data for cost center performance');
    return {
      startDate: params?.startDate || '2024-01-01T00:00:00Z',
      endDate: params?.endDate || '2024-12-31T23:59:59Z',
      costCenters: [
        {
          id: 'cc-1',
          name: 'Procurement Department',
          totalBudget: 100000,
          totalSpent: 80000,
          remainingBudget: 20000,
          utilizationRate: 80,
          monthlySpending: [
            { month: '2024-01', spent: 20000 },
            { month: '2024-02', spent: 20000 },
            { month: '2024-03', spent: 20000 },
          ],
          topExpenses: [
            { category: 'Salaries', amount: 30000 },
            { category: 'Rent', amount: 20000 },
            { category: 'Utilities', amount: 15000 },
          ],
        },
        {
          id: 'cc-2',
          name: 'IT Department',
          totalBudget: 50000,
          totalSpent: 40000,
          remainingBudget: 10000,
          utilizationRate: 80,
          monthlySpending: [
            { month: '2024-01', spent: 10000 },
            { month: '2024-02', spent: 10000 },
            { month: '2024-03', spent: 10000 },
          ],
          topExpenses: [
            { category: 'Software Licenses', amount: 20000 },
            { category: 'Hardware', amount: 10000 },
            { category: 'Services', amount: 10000 },
          ],
        },
      ],
    };
  }
}; 