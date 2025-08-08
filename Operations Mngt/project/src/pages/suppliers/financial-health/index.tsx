import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, Eye, Plus, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data types
type FinancialHealthStatus = 'STRONG' | 'STABLE' | 'MODERATE' | 'WEAK' | 'CRITICAL';
type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';
type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING';

interface SupplierFinancialHealth {
  id: string;
  supplierId: string;
  supplierName: string;
  status: FinancialHealthStatus;
  creditRating: CreditRating;
  creditScore: number;
  financialStability: number;
  liquidityRatio: number;
  debtToEquityRatio: number;
  profitMargin: number;
  revenueGrowth: number;
  paymentHistory: number; // 0-100 score
  daysPayableOutstanding: number;
  bankruptcyRisk: number; // 0-100 score
  trend: TrendDirection;
  lastUpdated: string;
  nextReviewDate: string;
  financialData: {
    year: number;
    revenue: number;
    profit: number;
    assets: number;
    liabilities: number;
    cashFlow: number;
  }[];
  alerts: {
    id: string;
    type: 'PAYMENT_DELAY' | 'CREDIT_DOWNGRADE' | 'BANKRUPTCY_FILING' | 'ACQUISITION' | 'RESTRUCTURING';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    date: string;
    description: string;
    status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
  }[];
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<SupplierFinancialHealth>();

const statusColors: Record<FinancialHealthStatus, string> = {
  'STRONG': 'success',
  'STABLE': 'success',
  'MODERATE': 'warning',
  'WEAK': 'destructive',
  'CRITICAL': 'destructive',
};

const trendColors: Record<TrendDirection, string> = {
  'IMPROVING': 'success',
  'STABLE': 'secondary',
  'DECLINING': 'destructive',
};

// Mock data
const MOCK_FINANCIAL_DATA: SupplierFinancialHealth[] = Array.from({ length: 10 }, (_, i) => {
  const statuses: FinancialHealthStatus[] = ['STRONG', 'STABLE', 'MODERATE', 'WEAK', 'CRITICAL'];
  const ratings: CreditRating[] = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D'];
  const trends: TrendDirection[] = ['IMPROVING', 'STABLE', 'DECLINING'];
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const creditRating = ratings[Math.min(Math.floor(Math.random() * ratings.length), status === 'STRONG' ? 2 : status === 'STABLE' ? 4 : status === 'MODERATE' ? 6 : 9)];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  
  return {
    id: `fin-${i + 1}`,
    supplierId: `supplier-${i % 5 + 1}`,
    supplierName: `Supplier ${i % 5 + 1}`,
    status,
    creditRating,
    creditScore: Math.floor(Math.random() * 300) + 500, // 500-800
    financialStability: Math.floor(Math.random() * 40) + 60, // 60-100
    liquidityRatio: (Math.random() * 2) + 0.5, // 0.5-2.5
    debtToEquityRatio: (Math.random() * 2) + 0.2, // 0.2-2.2
    profitMargin: (Math.random() * 20) - 5, // -5% to 15%
    revenueGrowth: (Math.random() * 30) - 10, // -10% to 20%
    paymentHistory: Math.floor(Math.random() * 40) + 60, // 60-100
    daysPayableOutstanding: Math.floor(Math.random() * 60) + 30, // 30-90 days
    bankruptcyRisk: status === 'CRITICAL' ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30), // 0-30 or 60-100
    trend,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    financialData: Array.from({ length: 3 }, (_, j) => {
      const year = new Date().getFullYear() - j;
      const baseRevenue = 10000000 + Math.random() * 90000000;
      const growthFactor = trend === 'IMPROVING' ? 1.1 - (j * 0.05) : trend === 'DECLINING' ? 0.9 + (j * 0.05) : 1;
      const revenue = baseRevenue * growthFactor;
      const profitMargin = (Math.random() * 20) - 5; // -5% to 15%
      
      return {
        year,
        revenue,
        profit: revenue * (profitMargin / 100),
        assets: revenue * (0.8 + Math.random() * 0.4), // 80-120% of revenue
        liabilities: revenue * (0.4 + Math.random() * 0.4), // 40-80% of revenue
        cashFlow: revenue * (0.05 + Math.random() * 0.1), // 5-15% of revenue
      };
    }),
    alerts: status === 'WEAK' || status === 'CRITICAL' ? [
      {
        id: `alert-${i}-1`,
        type: ['PAYMENT_DELAY', 'CREDIT_DOWNGRADE', 'BANKRUPTCY_FILING', 'ACQUISITION', 'RESTRUCTURING'][Math.floor(Math.random() * 5)],
        severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Financial alert description',
        status: ['ACTIVE', 'RESOLVED', 'MONITORING'][Math.floor(Math.random() * 3)],
      }
    ] : [],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

export function SupplierFinancialHealthList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    supplier: '',
    status: '',
    trend: '',
    creditRating: '',
  });

  const columns = [
    columnHelper.accessor('supplierName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Supplier</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <span className="font-medium text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Status</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('creditRating', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Credit Rating</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('financialStability', {
      header: 'Financial Stability',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Progress value={info.getValue()} className="h-2 w-24" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('profitMargin', {
      header: 'Profit Margin',
      cell: (info) => (
        <div className={info.getValue() < 0 ? 'text-red-600 font-medium' : ''}>
          {info.getValue().toFixed(1)}%
        </div>
      ),
    }),
    columnHelper.accessor('trend', {
      header: 'Trend',
      cell: (info) => (
        <div className="flex items-center gap-1">
          {info.getValue() === 'IMPROVING' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : info.getValue() === 'DECLINING' ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : (
            <span className="h-4 w-4 inline-block">→</span>
          )}
          <Badge variant={trendColors[info.getValue()]}>
            {info.getValue()}
          </Badge>
        </div>
      ),
    }),
    columnHelper.accessor('bankruptcyRisk', {
      header: 'Bankruptcy Risk',
      cell: (info) => {
        const value = info.getValue();
        let color = 'text-green-600';
        if (value > 30) color = 'text-amber-600';
        if (value > 60) color = 'text-red-600';
        
        return (
          <div className={`font-medium ${color}`}>
            {value < 30 ? 'Low' : value < 60 ? 'Medium' : 'High'}
          </div>
        );
      },
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/suppliers/financial-health/${info.getValue()}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate financial statistics
  const financialStats = React.useMemo(() => {
    const total = MOCK_FINANCIAL_DATA.length;
    const strong = MOCK_FINANCIAL_DATA.filter(item => item.status === 'STRONG').length;
    const stable = MOCK_FINANCIAL_DATA.filter(item => item.status === 'STABLE').length;
    const moderate = MOCK_FINANCIAL_DATA.filter(item => item.status === 'MODERATE').length;
    const weak = MOCK_FINANCIAL_DATA.filter(item => item.status === 'WEAK').length;
    const critical = MOCK_FINANCIAL_DATA.filter(item => item.status === 'CRITICAL').length;
    
    const avgFinancialStability = MOCK_FINANCIAL_DATA.reduce((sum, item) => sum + item.financialStability, 0) / total;
    const avgProfitMargin = MOCK_FINANCIAL_DATA.reduce((sum, item) => sum + item.profitMargin, 0) / total;
    
    return { 
      total, 
      strong, 
      stable, 
      moderate, 
      weak, 
      critical,
      avgFinancialStability,
      avgProfitMargin
    };
  }, []);

  // Generate chart data
  const statusDistribution = React.useMemo(() => {
    const distribution: Record<FinancialHealthStatus, number> = {
      'STRONG': 0,
      'STABLE': 0,
      'MODERATE': 0,
      'WEAK': 0,
      'CRITICAL': 0,
    };
    
    MOCK_FINANCIAL_DATA.forEach(item => {
      distribution[item.status]++;
    });
    
    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
    }));
  }, []);

  const profitMarginTrend = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        month: format(date, 'MMM yyyy'),
        margin: (Math.random() * 15) - 5 + (i * 0.2),
      };
    });
  }, []);

  const creditRatingDistribution = React.useMemo(() => {
    const distribution: Record<string, number> = {};
    
    MOCK_FINANCIAL_DATA.forEach(item => {
      distribution[item.creditRating] = (distribution[item.creditRating] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const table = useReactTable({
    data: MOCK_FINANCIAL_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    manualPagination: false,
    manualSorting: false,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Supplier Financial Health</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => navigate('create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Financial Assessment
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strong/Stable Suppliers</p>
                <p className="text-3xl font-bold">{financialStats.strong + financialStats.stable}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(((financialStats.strong + financialStats.stable) / financialStats.total) * 100)}% of total
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At-Risk Suppliers</p>
                <p className="text-3xl font-bold">{financialStats.weak + financialStats.critical}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(((financialStats.weak + financialStats.critical) / financialStats.total) * 100)}% of total
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Financial Stability</p>
                <p className="text-3xl font-bold">{Math.round(financialStats.avgFinancialStability)}</p>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Profit Margin</p>
                <p className="text-3xl font-bold">{financialStats.avgProfitMargin.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">across all suppliers</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Health Distribution</CardTitle>
            <CardDescription>
              Distribution of suppliers by financial health status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profit Margin Trend</CardTitle>
            <CardDescription>
              Average profit margin over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profitMarginTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="margin" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Credit Rating Distribution</CardTitle>
            <CardDescription>
              Distribution of suppliers by credit rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditRatingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {creditRatingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Search by supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Financial Status</Label>
            <Select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="STRONG">Strong</option>
              <option value="STABLE">Stable</option>
              <option value="MODERATE">Moderate</option>
              <option value="WEAK">Weak</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trend">Trend</Label>
            <Select
              id="trend"
              value={filters.trend}
              onChange={(e) => setFilters(prev => ({ ...prev, trend: e.target.value }))}
            >
              <option value="">All Trends</option>
              <option value="IMPROVING">Improving</option>
              <option value="STABLE">Stable</option>
              <option value="DECLINING">Declining</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditRating">Credit Rating</Label>
            <Select
              id="creditRating"
              value={filters.creditRating}
              onChange={(e) => setFilters(prev => ({ ...prev, creditRating: e.target.value }))}
            >
              <option value="">All Ratings</option>
              <option value="AAA">AAA</option>
              <option value="AA">AA</option>
              <option value="A">A</option>
              <option value="BBB">BBB</option>
              <option value="BB">BB</option>
              <option value="B">B</option>
              <option value="CCC">CCC</option>
              <option value="CC">CC</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        table={table}
        isLoading={false}
        onRowClick={(row) => navigate(`/suppliers/financial-health/${row.id}`)}
      />
    </div>
  );
}

export default SupplierFinancialHealthList;