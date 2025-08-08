export interface CostCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  budget: number;
  spent: number;
  remaining: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCostCenterRequest {
  name: string;
  code: string;
  description?: string;
  budget: number;
}

export interface UpdateCostCenterRequest {
  name?: string;
  code?: string;
  description?: string;
  budget?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CostCenterAnalytics {
  costCenterId: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationRate: number;
  monthlySpending: Array<{
    month: string;
    spent: number;
  }>;
  topExpenses: Array<{
    category: string;
    amount: number;
  }>;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  type: 'OPERATIONAL' | 'CAPITAL' | 'PROJECT' | 'DEPARTMENT' | 'COST_CENTER';
  category: string;
  fiscalYear: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  totalBudget: number;
  allocatedBudget: number;
  actualSpent: number;
  committedAmount: number;
  remainingBudget: number;
  variance: number;
  variancePercentage: number;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'OVER_BUDGET';
  ownerId: string;
  approverId?: string;
  approvedAt?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface GLAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  allowPosting: boolean;
  defaultCostCenterId?: string;
}

export interface GLTransaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  postingDate: string;
  reference?: string;
  description: string;
  sourceModule: string;
  sourceRecordId?: string;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  totalDebit: number;
  totalCredit: number;
  currency: string;
  exchangeRate: number;
  notes?: string;
  lines: Array<{
    accountId: string;
    costCenterId?: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
    reference?: string;
  }>;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'PROFIT_LOSS' | 'BALANCE_SHEET' | 'CASH_FLOW' | 'BUDGET_VARIANCE' | 'CUSTOM';
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  data: Record<string, any>;
  filters?: Record<string, any>;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}
