import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Building2,
  Calculator,
  FileText,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for charts
const budgetVarianceData = [
  { month: 'Jan', budgeted: 50000, actual: 48000, variance: 2000 },
  { month: 'Feb', budgeted: 52000, actual: 54000, variance: -2000 },
  { month: 'Mar', budgeted: 55000, actual: 52000, variance: 3000 },
  { month: 'Apr', budgeted: 58000, actual: 60000, variance: -2000 },
  { month: 'May', budgeted: 60000, actual: 58000, variance: 2000 },
  { month: 'Jun', budgeted: 62000, actual: 65000, variance: -3000 },
];

const costCenterData = [
  { name: 'Operations', value: 35, color: '#8884d8' },
  { name: 'Sales', value: 25, color: '#82ca9d' },
  { name: 'Marketing', value: 20, color: '#ffc658' },
  { name: 'IT', value: 15, color: '#ff7300' },
  { name: 'HR', value: 5, color: '#00ff00' },
];

const cashFlowData = [
  { month: 'Jan', inflow: 120000, outflow: 100000, net: 20000 },
  { month: 'Feb', inflow: 130000, outflow: 110000, net: 20000 },
  { month: 'Mar', inflow: 140000, outflow: 120000, net: 20000 },
  { month: 'Apr', inflow: 150000, outflow: 130000, net: 20000 },
  { month: 'May', inflow: 160000, outflow: 140000, net: 20000 },
  { month: 'Jun', inflow: 170000, outflow: 150000, net: 20000 },
];

const recentTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Supplier Payment - ABC Corp',
    amount: -15000,
    type: 'expense',
    status: 'posted'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Customer Payment - XYZ Inc',
    amount: 25000,
    type: 'revenue',
    status: 'posted'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Office Supplies',
    amount: -500,
    type: 'expense',
    status: 'pending'
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Service Revenue - Consulting',
    amount: 8000,
    type: 'revenue',
    status: 'posted'
  },
];

const FinancialDashboard: React.FC = () => {
  const totalBudget = 350000;
  const actualSpent = 320000;
  const variance = totalBudget - actualSpent;
  const variancePercentage = (variance / totalBudget) * 100;

  const totalRevenue = 450000;
  const totalExpenses = 320000;
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Monitor budgets, track expenses, and manage financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/finance/cost-centers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Cost Center
            </Link>
          </Button>
          <Button asChild>
            <Link to="/finance/budgets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Budget
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current fiscal year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Spent</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${actualSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((actualSpent / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
            {variance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(variance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {variancePercentage.toFixed(1)}% {variance >= 0 ? 'under' : 'over'} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue: ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>
                  Monthly budget variance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={budgetVarianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                    <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Cost Center Distribution</CardTitle>
                <CardDescription>
                  Spending by cost center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={costCenterData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costCenterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance</CardTitle>
              <CardDescription>
                Track budget performance across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Operations', budget: 120000, spent: 115000, variance: 5000 },
                  { name: 'Sales & Marketing', budget: 80000, spent: 85000, variance: -5000 },
                  { name: 'IT & Technology', budget: 60000, spent: 58000, variance: 2000 },
                  { name: 'Human Resources', budget: 40000, spent: 38000, variance: 2000 },
                  { name: 'Administration', budget: 50000, spent: 44000, variance: 6000 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Budget: ${item.budget.toLocaleString()}</span>
                        <span>Spent: ${item.spent.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(item.variance).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.variance >= 0 ? 'Under' : 'Over'} budget
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Monthly cash flow trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inflow" stroke="#8884d8" name="Cash Inflow" />
                  <Line type="monotone" dataKey="outflow" stroke="#82ca9d" name="Cash Outflow" />
                  <Line type="monotone" dataKey="net" stroke="#ffc658" name="Net Cash Flow" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{transaction.date}</span>
                        <Badge variant={transaction.status === 'posted' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {transaction.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common financial management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link to="/finance/cost-centers">
                <Building2 className="h-8 w-8 mb-2" />
                <span>Cost Centers</span>
                <span className="text-sm text-muted-foreground">Manage cost centers</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link to="/finance/budgets">
                <Calculator className="h-8 w-8 mb-2" />
                <span>Budgets</span>
                <span className="text-sm text-muted-foreground">Budget planning</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link to="/finance/gl-accounts">
                <FileText className="h-8 w-8 mb-2" />
                <span>General Ledger</span>
                <span className="text-sm text-muted-foreground">Chart of accounts</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link to="/finance/reports">
                <BarChart3 className="h-8 w-8 mb-2" />
                <span>Reports</span>
                <span className="text-sm text-muted-foreground">Financial reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Financial Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">Budget Overrun Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    Sales & Marketing budget is 6.25% over allocated amount
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Monthly Report Due</h4>
                  <p className="text-sm text-muted-foreground">
                    January financial report is ready for review
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard; 