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
import { Progress } from '@/components/ui/progress';
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
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Budget Type
interface Budget {
  id: string;
  name: string;
  description: string;
  type: 'operational' | 'capital' | 'project' | 'department' | 'cost_center';
  category: string;
  fiscalYear: string;
  period: 'monthly' | 'quarterly' | 'annual';
  totalBudget: number;
  allocatedBudget: number;
  actualSpent: number;
  committedAmount: number;
  remainingBudget: number;
  variance: number;
  variancePercentage: number;
  status: 'draft' | 'approved' | 'active' | 'closed' | 'over_budget';
  owner: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Budget Period Data
interface BudgetPeriod {
  period: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

// Sample data
const budgets: Budget[] = [
  {
    id: '1',
    name: 'Procurement Operations Budget 2024',
    description: 'Annual budget for procurement operations and strategic sourcing',
    type: 'operational',
    category: 'Procurement',
    fiscalYear: '2024',
    period: 'annual',
    totalBudget: 2500000,
    allocatedBudget: 2500000,
    actualSpent: 1850000,
    committedAmount: 200000,
    remainingBudget: 450000,
    variance: -150000,
    variancePercentage: -6.0,
    status: 'active',
    owner: {
      id: 'u1',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    approver: {
      id: 'u2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    notes: 'Includes all procurement operations and strategic sourcing activities',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'IT Infrastructure Capital Budget',
    description: 'Capital budget for IT infrastructure upgrades and new systems',
    type: 'capital',
    category: 'Information Technology',
    fiscalYear: '2024',
    period: 'annual',
    totalBudget: 1800000,
    allocatedBudget: 1800000,
    actualSpent: 1200000,
    committedAmount: 300000,
    remainingBudget: 300000,
    variance: -300000,
    variancePercentage: -16.7,
    status: 'active',
    owner: {
      id: 'u3',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com'
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    notes: 'Major infrastructure upgrade project',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    name: 'Manufacturing Plant Expansion',
    description: 'Project budget for manufacturing plant expansion',
    type: 'project',
    category: 'Manufacturing',
    fiscalYear: '2024',
    period: 'annual',
    totalBudget: 5000000,
    allocatedBudget: 5000000,
    actualSpent: 4200000,
    committedAmount: 500000,
    remainingBudget: 300000,
    variance: -500000,
    variancePercentage: -10.0,
    status: 'over_budget',
    owner: {
      id: 'u4',
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@company.com'
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    notes: 'Plant expansion project with scope changes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
];

// Sample period data
const budgetPeriods: BudgetPeriod[] = [
  { period: 'Jan', planned: 208333, actual: 195000, variance: -13333, variancePercentage: -6.4 },
  { period: 'Feb', planned: 208333, actual: 210000, variance: 1667, variancePercentage: 0.8 },
  { period: 'Mar', planned: 208333, actual: 220000, variance: 11667, variancePercentage: 5.6 },
  { period: 'Apr', planned: 208333, actual: 205000, variance: -3333, variancePercentage: -1.6 },
  { period: 'May', planned: 208333, actual: 215000, variance: 6667, variancePercentage: 3.2 },
  { period: 'Jun', planned: 208333, actual: 200000, variance: -8333, variancePercentage: -4.0 },
  { period: 'Jul', planned: 208333, actual: 195000, variance: -13333, variancePercentage: -6.4 },
  { period: 'Aug', planned: 208333, actual: 210000, variance: 1667, variancePercentage: 0.8 },
];

// Budget Form Component
const BudgetForm = ({ 
  budget, 
  onSave, 
  onCancel 
}: { 
  budget?: Partial<Budget>; 
  onSave: (data: Partial<Budget>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    description: budget?.description || '',
    type: budget?.type || 'operational',
    category: budget?.category || '',
    fiscalYear: budget?.fiscalYear || '2024',
    period: budget?.period || 'annual',
    totalBudget: budget?.totalBudget || 0,
    ownerName: budget?.owner?.name || '',
    ownerEmail: budget?.owner?.email || '',
    approverName: budget?.approver?.name || '',
    approverEmail: budget?.approver?.email || '',
    startDate: budget?.startDate || '',
    endDate: budget?.endDate || '',
    notes: budget?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Budget Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter budget name"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Budget Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="capital">Capital</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="cost_center">Cost Center</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the budget purpose and scope"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Procurement, IT, Manufacturing"
          />
        </div>
        <div>
          <Label htmlFor="fiscalYear">Fiscal Year *</Label>
          <Select value={formData.fiscalYear} onValueChange={(value) => setFormData({ ...formData, fiscalYear: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="period">Period *</Label>
          <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="totalBudget">Total Budget Amount *</Label>
        <Input
          id="totalBudget"
          type="number"
          value={formData.totalBudget}
          onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ownerName">Budget Owner Name</Label>
          <Input
            id="ownerName"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            placeholder="Budget owner's name"
          />
        </div>
        <div>
          <Label htmlFor="ownerEmail">Budget Owner Email</Label>
          <Input
            id="ownerEmail"
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
            placeholder="owner@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="approverName">Approver Name</Label>
          <Input
            id="approverName"
            value={formData.approverName}
            onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
            placeholder="Approver's name"
          />
        </div>
        <div>
          <Label htmlFor="approverEmail">Approver Email</Label>
          <Input
            id="approverEmail"
            type="email"
            value={formData.approverEmail}
            onChange={(e) => setFormData({ ...formData, approverEmail: e.target.value })}
            placeholder="approver@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or comments"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {budget ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
};

// Budget Card Component
const BudgetCard = ({ budget }: { budget: Budget }) => {
  const getStatusColor = () => {
    switch (budget.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      case 'over_budget': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = () => {
    if (budget.variancePercentage > 5) return 'text-red-600';
    if (budget.variancePercentage < -5) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getVarianceIcon = () => {
    if (budget.variancePercentage > 5) return <TrendingUp className="h-4 w-4" />;
    if (budget.variancePercentage < -5) return <TrendingDown className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{budget.name}</CardTitle>
          <Badge className={getStatusColor()}>
            {budget.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription>{budget.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-lg font-semibold">${budget.totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Actual Spent</p>
            <p className="text-lg font-semibold">${budget.actualSpent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="text-lg font-semibold">${budget.remainingBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Variance</p>
            <div className="flex items-center gap-1">
              {getVarianceIcon()}
              <span className={`text-lg font-semibold ${getVarianceColor()}`}>
                {budget.variancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Utilization</span>
            <span>{((budget.actualSpent / budget.totalBudget) * 100).toFixed(1)}%</span>
          </div>
          <Progress value={(budget.actualSpent / budget.totalBudget) * 100} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Owner: {budget.owner.name}</span>
          <span>{budget.fiscalYear}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function BudgetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || budget.type === selectedType;
    const matchesStatus = !selectedStatus || budget.status === selectedStatus;
    const matchesYear = !selectedYear || budget.fiscalYear === selectedYear;
    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  const handleCreateBudget = (data: Partial<Budget>) => {
    // Create budget logic here
    toast.success('Budget created successfully');
    setShowCreateDialog(false);
  };

  const handleUpdateBudget = (data: Partial<Budget>) => {
    // Update budget logic here
    toast.success('Budget updated successfully');
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id: string) => {
    // Delete budget logic here
    toast.success('Budget deleted successfully');
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.actualSpent, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remainingBudget, 0);
  const totalVariance = budgets.reduce((sum, budget) => sum + budget.variance, 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">
            Plan, track, and analyze organizational budgets and spending
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Create a new budget for planning and tracking expenses
                </DialogDescription>
              </DialogHeader>
              <BudgetForm
                onSave={handleCreateBudget}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Allocated budget across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available for allocation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(totalVariance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariance > 0 ? 'Over budget' : 'Under budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Operational', value: budgets.filter(b => b.type === 'operational').reduce((sum, b) => sum + b.totalBudget, 0) },
                        { name: 'Capital', value: budgets.filter(b => b.type === 'capital').reduce((sum, b) => sum + b.totalBudget, 0) },
                        { name: 'Project', value: budgets.filter(b => b.type === 'project').reduce((sum, b) => sum + b.totalBudget, 0) },
                        { name: 'Department', value: budgets.filter(b => b.type === 'department').reduce((sum, b) => sum + b.totalBudget, 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {budgets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="totalBudget" fill="#8884d8" name="Budget" />
                    <Bar dataKey="actualSpent" fill="#82ca9d" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={budgetPeriods}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#8884d8" name="Planned" />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Variance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgets} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value?.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="variancePercentage" fill="#ffc658" name="Variance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
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
                      placeholder="Search budgets..."
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
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="capital">Capital</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="cost_center">Cost Center</SelectItem>
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="over_budget">Over Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year-filter">Fiscal Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All years</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="totalBudget" fill="#8884d8" name="Budget" />
                    <Bar dataKey="actualSpent" fill="#82ca9d" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Budget Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgets} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value?.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="variancePercentage" fill="#ffc658" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of budget variances and their causes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{budget.name}</h3>
                      <Badge className={budget.variancePercentage > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {budget.variancePercentage > 0 ? 'Over Budget' : 'Under Budget'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <span className="ml-2 font-medium">${budget.totalBudget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <span className="ml-2 font-medium">${budget.actualSpent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Variance:</span>
                        <span className={`ml-2 font-medium ${budget.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(budget.variance).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Percentage:</span>
                        <span className={`ml-2 font-medium ${budget.variancePercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {budget.variancePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {budget.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {budget.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingBudget && (
        <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Update budget information and allocations
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              budget={editingBudget}
              onSave={handleUpdateBudget}
              onCancel={() => setEditingBudget(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 