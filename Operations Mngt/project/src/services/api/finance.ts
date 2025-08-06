import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

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

// Types
export type CostCenter = z.infer<typeof CostCenterSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type GLAccount = z.infer<typeof GLAccountSchema>;
export type GLTransaction = z.infer<typeof GLTransactionSchema>;
export type FinancialReport = z.infer<typeof FinancialReportSchema>;

// API endpoints
const FINANCE_API_BASE = '/api/finance';

// Cost Centers API
export const costCenterApi = {
  // Get all cost centers
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/cost-centers`, { params });
    return response.data;
  },

  // Get cost center by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/cost-centers/${id}`);
    return response.data;
  },

  // Create new cost center
  create: async (data: Omit<CostCenter, 'id'>) => {
    const validatedData = CostCenterSchema.parse(data);
    const response = await apiClient.post(`${FINANCE_API_BASE}/cost-centers`, validatedData);
    return response.data;
  },

  // Update cost center
  update: async (id: string, data: Partial<CostCenter>) => {
    const validatedData = CostCenterSchema.partial().parse(data);
    const response = await apiClient.put(`${FINANCE_API_BASE}/cost-centers/${id}`, validatedData);
    return response.data;
  },

  // Delete cost center
  delete: async (id: string) => {
    const response = await apiClient.delete(`${FINANCE_API_BASE}/cost-centers/${id}`);
    return response.data;
  },

  // Get cost center analytics
  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/cost-centers/${id}/analytics`);
    return response.data;
  }
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
    const response = await apiClient.get(`${FINANCE_API_BASE}/budgets`, { params });
    return response.data;
  },

  // Get budget by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/budgets/${id}`);
    return response.data;
  },

  // Create new budget
  create: async (data: Omit<Budget, 'id'>) => {
    const validatedData = BudgetSchema.parse(data);
    const response = await apiClient.post(`${FINANCE_API_BASE}/budgets`, validatedData);
    return response.data;
  },

  // Update budget
  update: async (id: string, data: Partial<Budget>) => {
    const validatedData = BudgetSchema.partial().parse(data);
    const response = await apiClient.put(`${FINANCE_API_BASE}/budgets/${id}`, validatedData);
    return response.data;
  },

  // Delete budget
  delete: async (id: string) => {
    const response = await apiClient.delete(`${FINANCE_API_BASE}/budgets/${id}`);
    return response.data;
  },

  // Approve budget
  approve: async (id: string) => {
    const response = await apiClient.post(`${FINANCE_API_BASE}/budgets/${id}/approve`);
    return response.data;
  },

  // Get budget analytics
  getAnalytics: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/budgets/${id}/analytics`);
    return response.data;
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
    const response = await apiClient.get(`${FINANCE_API_BASE}/gl-accounts`, { params });
    return response.data;
  },

  // Get GL account by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/gl-accounts/${id}`);
    return response.data;
  },

  // Create new GL account
  create: async (data: Omit<GLAccount, 'id'>) => {
    const validatedData = GLAccountSchema.parse(data);
    const response = await apiClient.post(`${FINANCE_API_BASE}/gl-accounts`, validatedData);
    return response.data;
  },

  // Update GL account
  update: async (id: string, data: Partial<GLAccount>) => {
    const validatedData = GLAccountSchema.partial().parse(data);
    const response = await apiClient.put(`${FINANCE_API_BASE}/gl-accounts/${id}`, validatedData);
    return response.data;
  },

  // Delete GL account
  delete: async (id: string) => {
    const response = await apiClient.delete(`${FINANCE_API_BASE}/gl-accounts/${id}`);
    return response.data;
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
    const response = await apiClient.get(`${FINANCE_API_BASE}/gl-transactions`, { params });
    return response.data;
  },

  // Get GL transaction by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/gl-transactions/${id}`);
    return response.data;
  },

  // Create new GL transaction
  create: async (data: Omit<GLTransaction, 'id'>) => {
    const validatedData = GLTransactionSchema.parse(data);
    const response = await apiClient.post(`${FINANCE_API_BASE}/gl-transactions`, validatedData);
    return response.data;
  },

  // Update GL transaction
  update: async (id: string, data: Partial<GLTransaction>) => {
    const validatedData = GLTransactionSchema.partial().parse(data);
    const response = await apiClient.put(`${FINANCE_API_BASE}/gl-transactions/${id}`, validatedData);
    return response.data;
  },

  // Delete GL transaction
  delete: async (id: string) => {
    const response = await apiClient.delete(`${FINANCE_API_BASE}/gl-transactions/${id}`);
    return response.data;
  },

  // Post transaction
  post: async (id: string) => {
    const response = await apiClient.post(`${FINANCE_API_BASE}/gl-transactions/${id}/post`);
    return response.data;
  },

  // Void transaction
  void: async (id: string) => {
    const response = await apiClient.post(`${FINANCE_API_BASE}/gl-transactions/${id}/void`);
    return response.data;
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
    const response = await apiClient.get(`${FINANCE_API_BASE}/financial-reports`, { params });
    return response.data;
  },

  // Get financial report by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/financial-reports/${id}`);
    return response.data;
  },

  // Create new financial report
  create: async (data: Omit<FinancialReport, 'id'>) => {
    const validatedData = FinancialReportSchema.parse(data);
    const response = await apiClient.post(`${FINANCE_API_BASE}/financial-reports`, validatedData);
    return response.data;
  },

  // Update financial report
  update: async (id: string, data: Partial<FinancialReport>) => {
    const validatedData = FinancialReportSchema.partial().parse(data);
    const response = await apiClient.put(`${FINANCE_API_BASE}/financial-reports/${id}`, validatedData);
    return response.data;
  },

  // Delete financial report
  delete: async (id: string) => {
    const response = await apiClient.delete(`${FINANCE_API_BASE}/financial-reports/${id}`);
    return response.data;
  },

  // Approve financial report
  approve: async (id: string) => {
    const response = await apiClient.post(`${FINANCE_API_BASE}/financial-reports/${id}/approve`);
    return response.data;
  },

  // Generate financial report
  generate: async (type: string, params: any) => {
    const response = await apiClient.post(`${FINANCE_API_BASE}/financial-reports/generate`, {
      type,
      ...params
    });
    return response.data;
  }
};

// Finance Analytics API
export const financeAnalyticsAPI = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/analytics/dashboard`);
    return response.data;
  },

  // Get budget variance analysis
  getBudgetVariance: async (params?: {
    startDate?: string;
    endDate?: string;
    costCenterId?: string;
  }) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/analytics/budget-variance`, { params });
    return response.data;
  },

  // Get cash flow analysis
  getCashFlow: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/analytics/cash-flow`, { params });
    return response.data;
  },

  // Get cost center performance
  getCostCenterPerformance: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`${FINANCE_API_BASE}/analytics/cost-center-performance`, { params });
    return response.data;
  }
}; 