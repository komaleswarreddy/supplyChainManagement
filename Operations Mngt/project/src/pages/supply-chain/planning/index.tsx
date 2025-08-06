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
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
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
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  RefreshCw,
  Zap,
  Clock,
  Package,
  DollarSign,
  Users,
  Activity,
  MapPin,
  Truck,
  Factory,
  Warehouse
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Supply Chain Plan Types
interface SupplyChainPlan {
  id: string;
  name: string;
  type: 'demand_planning' | 'capacity_planning' | 'network_optimization' | 'inventory_planning' | 'production_planning';
  description: string;
  status: 'draft' | 'in_review' | 'approved' | 'implemented' | 'archived';
  planningHorizon: 'short_term' | 'medium_term' | 'long_term';
  startDate: string;
  endDate: string;
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
  metrics: {
    costSavings: number;
    efficiencyImprovement: number;
    leadTimeReduction: number;
    serviceLevelImprovement: number;
  };
}

// Demand Plan Data
interface DemandPlan {
  id: string;
  productId: string;
  productName: string;
  category: string;
  period: string;
  forecastedDemand: number;
  actualDemand: number;
  variance: number;
  confidenceLevel: number;
  factors: {
    seasonality: number;
    trend: number;
    promotional: number;
    market: number;
  };
}

// Capacity Plan Data
interface CapacityPlan {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: 'manufacturing' | 'warehouse' | 'distribution_center';
  period: string;
  availableCapacity: number;
  requiredCapacity: number;
  utilization: number;
  bottlenecks: string[];
  recommendations: string[];
}

// Network Optimization Data
interface NetworkOptimization {
  id: string;
  scenarioName: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  costSavings: number;
  savingsPercentage: number;
  changes: {
    facilityChanges: string[];
    routeChanges: string[];
    supplierChanges: string[];
  };
  constraints: {
    budget: number;
    leadTime: number;
    serviceLevel: number;
  };
}

// Sample data
const supplyChainPlans: SupplyChainPlan[] = [
  {
    id: '1',
    name: 'Q1 2024 Demand Planning',
    type: 'demand_planning',
    description: 'Comprehensive demand planning for Q1 2024 across all product categories',
    status: 'approved',
    planningHorizon: 'medium_term',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    data: {
      totalDemand: 250000,
      forecastedDemand: 245000,
      variance: -5000,
      confidenceLevel: 0.92
    },
    metrics: {
      costSavings: 150000,
      efficiencyImprovement: 12.5,
      leadTimeReduction: 8.3,
      serviceLevelImprovement: 5.2
    }
  },
  {
    id: '2',
    name: 'Manufacturing Capacity Optimization',
    type: 'capacity_planning',
    description: 'Optimize manufacturing capacity across all facilities',
    status: 'implemented',
    planningHorizon: 'long_term',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdBy: {
      id: 'u3',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    data: {
      totalCapacity: 500000,
      requiredCapacity: 480000,
      utilization: 96.0,
      bottlenecks: ['Assembly Line A', 'Packaging Station 3']
    },
    metrics: {
      costSavings: 250000,
      efficiencyImprovement: 18.7,
      leadTimeReduction: 12.1,
      serviceLevelImprovement: 8.9
    }
  },
  {
    id: '3',
    name: 'Distribution Network Optimization',
    type: 'network_optimization',
    description: 'Optimize distribution network for cost reduction and service improvement',
    status: 'in_review',
    planningHorizon: 'long_term',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdBy: {
      id: 'u4',
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@company.com'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    data: {
      currentCost: 2500000,
      optimizedCost: 2200000,
      costSavings: 300000,
      savingsPercentage: 12.0
    },
    metrics: {
      costSavings: 300000,
      efficiencyImprovement: 15.3,
      leadTimeReduction: 10.5,
      serviceLevelImprovement: 7.8
    }
  }
];

const demandPlans: DemandPlan[] = [
  {
    id: '1',
    productId: 'P001',
    productName: 'Product A',
    category: 'Electronics',
    period: '2024-01',
    forecastedDemand: 1200,
    actualDemand: 1180,
    variance: -20,
    confidenceLevel: 0.92,
    factors: {
      seasonality: 0.15,
      trend: 0.08,
      promotional: 0.05,
      market: 0.12
    }
  },
  {
    id: '2',
    productId: 'P002',
    productName: 'Product B',
    category: 'Clothing',
    period: '2024-01',
    forecastedDemand: 800,
    actualDemand: 820,
    variance: 20,
    confidenceLevel: 0.88,
    factors: {
      seasonality: 0.20,
      trend: 0.06,
      promotional: 0.08,
      market: 0.10
    }
  }
];

const capacityPlans: CapacityPlan[] = [
  {
    id: '1',
    facilityId: 'F001',
    facilityName: 'Manufacturing Plant A',
    facilityType: 'manufacturing',
    period: '2024-01',
    availableCapacity: 50000,
    requiredCapacity: 48000,
    utilization: 96.0,
    bottlenecks: ['Assembly Line A', 'Quality Control Station'],
    recommendations: [
      'Add second shift to Assembly Line A',
      'Implement lean manufacturing practices',
      'Upgrade quality control equipment'
    ]
  },
  {
    id: '2',
    facilityId: 'F002',
    facilityName: 'Distribution Center B',
    facilityType: 'distribution_center',
    period: '2024-01',
    availableCapacity: 30000,
    requiredCapacity: 32000,
    utilization: 106.7,
    bottlenecks: ['Loading Dock 2', 'Sorting System'],
    recommendations: [
      'Expand loading dock capacity',
      'Automate sorting system',
      'Add temporary storage space'
    ]
  }
];

// Plan Card Component
const PlanCard = ({ plan }: { plan: SupplyChainPlan }) => {
  const getStatusColor = () => {
    switch (plan.status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = () => {
    switch (plan.type) {
      case 'demand_planning': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'capacity_planning': return <Factory className="h-5 w-5 text-green-500" />;
      case 'network_optimization': return <MapPin className="h-5 w-5 text-purple-500" />;
      case 'inventory_planning': return <Package className="h-5 w-5 text-orange-500" />;
      case 'production_planning': return <Settings className="h-5 w-5 text-indigo-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon()}
            <div>
              <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {plan.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Horizon:</span>
            <span className="ml-1 font-medium">{plan.planningHorizon.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Period:</span>
            <span className="ml-1 font-medium">{plan.startDate} - {plan.endDate}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Cost Savings</span>
            <span className="font-medium">${plan.metrics.costSavings.toLocaleString()}</span>
          </div>
          <Progress value={Math.min((plan.metrics.costSavings / 500000) * 100, 100)} className="h-1" />
          
          <div className="flex justify-between text-xs">
            <span>Efficiency Improvement</span>
            <span className="font-medium">{plan.metrics.efficiencyImprovement.toFixed(1)}%</span>
          </div>
          <Progress value={plan.metrics.efficiencyImprovement} className="h-1" />
        </div>
        
        <div className="text-xs text-gray-500">
          Created by {plan.createdBy.name} • {new Date(plan.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Demand Planning Chart Component
const DemandPlanningChart = ({ plans }: { plans: DemandPlan[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Planning Overview</CardTitle>
        <CardDescription>
          Forecasted vs actual demand with variance analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={plans}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Units']} />
            <Legend />
            <Bar dataKey="forecastedDemand" fill="#8884d8" name="Forecasted" />
            <Bar dataKey="actualDemand" fill="#82ca9d" name="Actual" />
            <Line type="monotone" dataKey="confidenceLevel" stroke="#ffc658" name="Confidence" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Capacity Planning Chart Component
const CapacityPlanningChart = ({ plans }: { plans: CapacityPlan[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacity Utilization</CardTitle>
        <CardDescription>
          Available vs required capacity across facilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={plans}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="facilityName" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Units']} />
            <Legend />
            <Bar dataKey="availableCapacity" fill="#8884d8" name="Available" />
            <Bar dataKey="requiredCapacity" fill="#82ca9d" name="Required" />
            <Line type="monotone" dataKey="utilization" stroke="#ffc658" name="Utilization %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Plan Configuration Form
const PlanConfigurationForm = ({ 
  plan, 
  onSave, 
  onCancel 
}: { 
  plan?: Partial<SupplyChainPlan>; 
  onSave: (data: Partial<SupplyChainPlan>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    type: plan?.type || 'demand_planning',
    planningHorizon: plan?.planningHorizon || 'medium_term',
    startDate: plan?.startDate || '',
    endDate: plan?.endDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter plan name"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Plan Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demand_planning">Demand Planning</SelectItem>
              <SelectItem value="capacity_planning">Capacity Planning</SelectItem>
              <SelectItem value="network_optimization">Network Optimization</SelectItem>
              <SelectItem value="inventory_planning">Inventory Planning</SelectItem>
              <SelectItem value="production_planning">Production Planning</SelectItem>
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
          placeholder="Describe the supply chain planning initiative"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="horizon">Planning Horizon *</Label>
          <Select value={formData.planningHorizon} onValueChange={(value) => setFormData({ ...formData, planningHorizon: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Short Term (0-3 months)</SelectItem>
              <SelectItem value="medium_term">Medium Term (3-12 months)</SelectItem>
              <SelectItem value="long_term">Long Term (1-3 years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {plan ? 'Update' : 'Create'} Plan
        </Button>
      </div>
    </form>
  );
};

export default function SupplyChainPlanning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SupplyChainPlan | null>(null);
  const { toast } = useToast();

  const filteredPlans = supplyChainPlans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || plan.type === selectedType;
    const matchesStatus = !selectedStatus || plan.status === selectedStatus;
    const matchesHorizon = !selectedHorizon || plan.planningHorizon === selectedHorizon;
    return matchesSearch && matchesType && matchesStatus && matchesHorizon;
  });

  const handleCreatePlan = (data: Partial<SupplyChainPlan>) => {
    // Create plan logic here
    toast.success('Supply chain plan created successfully');
    setShowCreateDialog(false);
  };

  const handleOptimizeNetwork = async (planId: string) => {
    toast.info('Running network optimization...');
    
    // Simulate optimization process
    setTimeout(() => {
      toast.success('Network optimization completed successfully');
    }, 3000);
  };

  const totalPlans = supplyChainPlans.length;
  const activePlans = supplyChainPlans.filter(p => p.status === 'implemented').length;
  const totalSavings = supplyChainPlans.reduce((sum, p) => sum + p.metrics.costSavings, 0);
  const avgEfficiency = supplyChainPlans.reduce((sum, p) => sum + p.metrics.efficiencyImprovement, 0) / totalPlans;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain Planning</h1>
          <p className="text-muted-foreground">
            Strategic planning and optimization for end-to-end supply chain operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Supply Chain Plan</DialogTitle>
                <DialogDescription>
                  Create a new strategic supply chain planning initiative
                </DialogDescription>
              </DialogHeader>
              <PlanConfigurationForm
                onSave={handleCreatePlan}
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
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {activePlans} implemented plans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Cost savings achieved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplyChainPlans.filter(p => p.status === 'in_review').length}</div>
            <p className="text-xs text-muted-foreground">
              Under review
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="demand">Demand Planning</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-4">
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
                      placeholder="Search plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Plan Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="demand_planning">Demand Planning</SelectItem>
                      <SelectItem value="capacity_planning">Capacity Planning</SelectItem>
                      <SelectItem value="network_optimization">Network Optimization</SelectItem>
                      <SelectItem value="inventory_planning">Inventory Planning</SelectItem>
                      <SelectItem value="production_planning">Production Planning</SelectItem>
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
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="horizon-filter">Horizon</Label>
                  <Select value={selectedHorizon} onValueChange={setSelectedHorizon}>
                    <SelectTrigger>
                      <SelectValue placeholder="All horizons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All horizons</SelectItem>
                      <SelectItem value="short_term">Short Term</SelectItem>
                      <SelectItem value="medium_term">Medium Term</SelectItem>
                      <SelectItem value="long_term">Long Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <DemandPlanningChart plans={demandPlans} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Demand Factors Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demandPlans}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="factors.seasonality" fill="#8884d8" name="Seasonality" />
                    <Bar dataKey="factors.trend" fill="#82ca9d" name="Trend" />
                    <Bar dataKey="factors.promotional" fill="#ffc658" name="Promotional" />
                    <Bar dataKey="factors.market" fill="#ff8042" name="Market" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demandPlans.map((plan) => (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{plan.productName}</span>
                        <span>{(plan.confidenceLevel * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={plan.confidenceLevel * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <CapacityPlanningChart plans={capacityPlans} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capacityPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.facilityName}</CardTitle>
                  <CardDescription>
                    {plan.facilityType.replace('_', ' ')} • {plan.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Available Capacity</p>
                        <p className="text-lg font-semibold">{plan.availableCapacity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Required Capacity</p>
                        <p className="text-lg font-semibold">{plan.requiredCapacity.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span>{plan.utilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(plan.utilization, 100)} className="h-2" />
                    </div>
                    
                    {plan.bottlenecks.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Bottlenecks:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.bottlenecks.map((bottleneck, index) => (
                            <li key={index}>• {bottleneck}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {plan.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.recommendations.map((recommendation, index) => (
                            <li key={index}>• {recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Demand Planning', value: supplyChainPlans.filter(p => p.type === 'demand_planning').length },
                        { name: 'Capacity Planning', value: supplyChainPlans.filter(p => p.type === 'capacity_planning').length },
                        { name: 'Network Optimization', value: supplyChainPlans.filter(p => p.type === 'network_optimization').length },
                        { name: 'Inventory Planning', value: supplyChainPlans.filter(p => p.type === 'inventory_planning').length },
                        { name: 'Production Planning', value: supplyChainPlans.filter(p => p.type === 'production_planning').length }
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
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings by Plan Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={supplyChainPlans}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="metrics.costSavings" fill="#8884d8" name="Cost Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 