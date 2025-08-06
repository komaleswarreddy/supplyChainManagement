import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Copy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download as DownloadIcon,
  Share,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Financial Report Types
interface FinancialReport {
  id: string;
  name: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'budget_variance' | 'custom';
  period: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  data: any;
}

// Profit & Loss Data
interface ProfitLossData {
  revenue: {
    total: number;
    breakdown: {
      sales: number;
      services: number;
      other: number;
    };
  };
  costOfGoodsSold: {
    total: number;
    breakdown: {
      materials: number;
      labor: number;
      overhead: number;
    };
  };
  grossProfit: number;
  operatingExpenses: {
    total: number;
    breakdown: {
      salaries: number;
      rent: number;
      utilities: number;
      marketing: number;
      admin: number;
    };
  };
  operatingIncome: number;
  otherIncome: number;
  otherExpenses: number;
  netIncome: number;
}

// Balance Sheet Data
interface BalanceSheetData {
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    fixed: {
      property: number;
      equipment: number;
      vehicles: number;
      total: number;
    };
    total: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      total: number;
    };
    longTerm: {
      longTermDebt: number;
      deferredTax: number;
      total: number;
    };
    total: number;
  };
  equity: {
    commonStock: number;
    retainedEarnings: number;
    total: number;
  };
}

// Sample data
const financialReports: FinancialReport[] = [
  {
    id: '1',
    name: 'Q4 2024 Profit & Loss Statement',
    type: 'profit_loss',
    period: 'quarterly',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'published',
    createdBy: {
      id: 'u1',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    approvedBy: {
      id: 'u2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    createdAt: '2024-12-31T00:00:00Z',
    updatedAt: '2024-12-31T00:00:00Z',
    data: {
      revenue: {
        total: 2500000,
        breakdown: {
          sales: 2000000,
          services: 400000,
          other: 100000
        }
      },
      costOfGoodsSold: {
        total: 1500000,
        breakdown: {
          materials: 900000,
          labor: 400000,
          overhead: 200000
        }
      },
      grossProfit: 1000000,
      operatingExpenses: {
        total: 600000,
        breakdown: {
          salaries: 300000,
          rent: 80000,
          utilities: 40000,
          marketing: 120000,
          admin: 60000
        }
      },
      operatingIncome: 400000,
      otherIncome: 20000,
      otherExpenses: 30000,
      netIncome: 390000
    }
  },
  {
    id: '2',
    name: 'December 2024 Balance Sheet',
    type: 'balance_sheet',
    period: 'monthly',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'published',
    createdBy: {
      id: 'u1',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    createdAt: '2024-12-31T00:00:00Z',
    updatedAt: '2024-12-31T00:00:00Z',
    data: {
      assets: {
        current: {
          cash: 500000,
          accountsReceivable: 300000,
          inventory: 400000,
          prepaidExpenses: 50000,
          total: 1250000
        },
        fixed: {
          property: 2000000,
          equipment: 800000,
          vehicles: 200000,
          total: 3000000
        },
        total: 4250000
      },
      liabilities: {
        current: {
          accountsPayable: 250000,
          shortTermDebt: 300000,
          accruedExpenses: 100000,
          total: 650000
        },
        longTerm: {
          longTermDebt: 1500000,
          deferredTax: 100000,
          total: 1600000
        },
        total: 2250000
      },
      equity: {
        commonStock: 1000000,
        retainedEarnings: 1000000,
        total: 2000000
      }
    }
  }
];

// Report Template Component
const ReportTemplate = ({ 
  name, 
  description, 
  type, 
  onUse 
}: { 
  name: string; 
  description: string; 
  type: string; 
  onUse: () => void;
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'profit_loss': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'balance_sheet': return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'cash_flow': return <DollarSign className="h-5 w-5 text-purple-500" />;
      case 'budget_variance': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onUse}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <div>
            <CardTitle className="text-sm font-medium">{name}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button size="sm" className="w-full">
          <Plus className="h-3 w-3 mr-1" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

// Profit & Loss Statement Component
const ProfitLossStatement = ({ data }: { data: ProfitLossData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Sales', value: data.revenue.breakdown.sales },
                    { name: 'Services', value: data.revenue.breakdown.services },
                    { name: 'Other', value: data.revenue.breakdown.other }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                </Pie>
                <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Salaries', value: data.operatingExpenses.breakdown.salaries },
                { name: 'Rent', value: data.operatingExpenses.breakdown.rent },
                { name: 'Utilities', value: data.operatingExpenses.breakdown.utilities },
                { name: 'Marketing', value: data.operatingExpenses.breakdown.marketing },
                { name: 'Admin', value: data.operatingExpenses.breakdown.admin }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-green-600">Revenue</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Sales</span>
                    <span>${data.revenue.breakdown.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span>${data.revenue.breakdown.services.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>${data.revenue.breakdown.other.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Revenue</span>
                    <span>${data.revenue.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-red-600">Cost of Goods Sold</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Materials</span>
                    <span>${data.costOfGoodsSold.breakdown.materials.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor</span>
                    <span>${data.costOfGoodsSold.breakdown.labor.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overhead</span>
                    <span>${data.costOfGoodsSold.breakdown.overhead.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total COGS</span>
                    <span>${data.costOfGoodsSold.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Gross Profit</span>
                  <span>${data.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Expenses</span>
                  <span>-${data.operatingExpenses.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Operating Income</span>
                  <span>${data.operatingIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Income</span>
                  <span>+${data.otherIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Expenses</span>
                  <span>-${data.otherExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Net Income</span>
                  <span className={data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${data.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Balance Sheet Component
const BalanceSheet = ({ data }: { data: BalanceSheetData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Assets</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Cash</span>
                    <span>${data.assets.current.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounts Receivable</span>
                    <span>${data.assets.current.accountsReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory</span>
                    <span>${data.assets.current.inventory.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prepaid Expenses</span>
                    <span>${data.assets.current.prepaidExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Current Assets</span>
                    <span>${data.assets.current.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Fixed Assets</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Property</span>
                    <span>${data.assets.fixed.property.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment</span>
                    <span>${data.assets.fixed.equipment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicles</span>
                    <span>${data.assets.fixed.vehicles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Fixed Assets</span>
                    <span>${data.assets.fixed.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Assets</span>
                <span>${data.assets.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Liabilities</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Accounts Payable</span>
                    <span>${data.liabilities.current.accountsPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Short-term Debt</span>
                    <span>${data.liabilities.current.shortTermDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accrued Expenses</span>
                    <span>${data.liabilities.current.accruedExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Current Liabilities</span>
                    <span>${data.liabilities.current.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Long-term Liabilities</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Long-term Debt</span>
                    <span>${data.liabilities.longTerm.longTermDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deferred Tax</span>
                    <span>${data.liabilities.longTerm.deferredTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Long-term Liabilities</span>
                    <span>${data.liabilities.longTerm.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Equity</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Common Stock</span>
                    <span>${data.equity.commonStock.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retained Earnings</span>
                    <span>${data.equity.retainedEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Equity</span>
                    <span>${data.equity.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Liabilities & Equity</span>
                <span>${(data.liabilities.total + data.equity.total).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function FinancialReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const { toast } = useToast();

  const filteredReports = financialReports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || report.type === selectedType;
    const matchesPeriod = !selectedPeriod || report.period === selectedPeriod;
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesPeriod && matchesStatus;
  });

  const handleCreateReport = (data: any) => {
    // Create report logic here
    toast.success('Financial report created successfully');
    setShowCreateDialog(false);
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const reportTemplates = [
    {
      name: 'Profit & Loss Statement',
      description: 'Standard profit and loss statement with revenue and expense breakdown',
      type: 'profit_loss'
    },
    {
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity statement',
      type: 'balance_sheet'
    },
    {
      name: 'Cash Flow Statement',
      description: 'Operating, investing, and financing cash flows',
      type: 'cash_flow'
    },
    {
      name: 'Budget Variance Report',
      description: 'Comparison of budgeted vs actual amounts',
      type: 'budget_variance'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and analyze comprehensive financial reports and statements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Financial Report</DialogTitle>
                <DialogDescription>
                  Generate a new financial report using templates or custom configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <ReportTemplate
                      key={template.type}
                      name={template.name}
                      description={template.description}
                      type={template.type}
                      onUse={() => {
                        // Handle template selection
                        toast.success(`Template "${template.name}" selected`);
                      }}
                    />
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                      <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                      <SelectItem value="cash_flow">Cash Flow</SelectItem>
                      <SelectItem value="budget_variance">Budget Variance</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period-filter">Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="All periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All periods</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport(report)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{report.name}</CardTitle>
                    <Badge className={
                      report.status === 'published' ? 'bg-green-100 text-green-800' :
                      report.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {report.startDate} to {report.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{report.type.replace('_', ' ')}</span>
                    <span className="capitalize">{report.period}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Created by {report.createdBy.name}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <ReportTemplate
                key={template.type}
                name={template.name}
                description={template.description}
                type={template.type}
                onUse={() => {
                  toast.success(`Template "${template.name}" selected`);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', reports: 5 },
                    { month: 'Feb', reports: 8 },
                    { month: 'Mar', reports: 12 },
                    { month: 'Apr', reports: 10 },
                    { month: 'May', reports: 15 },
                    { month: 'Jun', reports: 18 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reports" stroke="#8884d8" name="Reports Generated" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Report Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Profit & Loss', value: 8 },
                        { name: 'Balance Sheet', value: 6 },
                        { name: 'Cash Flow', value: 4 },
                        { name: 'Budget Variance', value: 3 },
                        { name: 'Custom', value: 2 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedReport.name}</DialogTitle>
                  <DialogDescription>
                    {selectedReport.startDate} to {selectedReport.endDate} • {selectedReport.period}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedReport.type === 'profit_loss' && (
                <ProfitLossStatement data={selectedReport.data} />
              )}
              {selectedReport.type === 'balance_sheet' && (
                <BalanceSheet data={selectedReport.data} />
              )}
              {selectedReport.type === 'cash_flow' && (
                <div>Cash Flow Statement Component</div>
              )}
              {selectedReport.type === 'budget_variance' && (
                <div>Budget Variance Report Component</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 