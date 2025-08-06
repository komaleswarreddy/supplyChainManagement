import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SupplierDashboard: React.FC = () => {
  const supplierMetrics = {
    totalSuppliers: 156,
    activeSuppliers: 142,
    pendingApproval: 8,
    atRisk: 6,
    totalSpend: 2847500,
    averageRating: 4.2,
    contractsExpiring: 12,
    performanceScore: 87
  };

  const recentActivities = [
    {
      id: 1,
      type: 'approval',
      action: 'New supplier approved',
      supplier: 'TechCorp Solutions',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'risk',
      action: 'Risk assessment updated',
      supplier: 'Global Materials Inc',
      timestamp: '4 hours ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'contract',
      action: 'Contract renewal due',
      supplier: 'Quality Parts Co',
      timestamp: '1 day ago',
      status: 'pending'
    },
    {
      id: 4,
      type: 'performance',
      action: 'Performance review completed',
      supplier: 'Reliable Logistics',
      timestamp: '2 days ago',
      status: 'completed'
    }
  ];

  const topSuppliers = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      category: 'Electronics',
      spend: 450000,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 2,
      name: 'Global Materials Inc',
      category: 'Raw Materials',
      spend: 380000,
      rating: 4.5,
      status: 'active'
    },
    {
      id: 3,
      name: 'Quality Parts Co',
      category: 'Components',
      spend: 320000,
      rating: 4.2,
      status: 'active'
    },
    {
      id: 4,
      name: 'Reliable Logistics',
      category: 'Transportation',
      spend: 280000,
      rating: 4.6,
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage suppliers, monitor performance, and optimize relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Score: {supplierMetrics.performanceScore}%
          </Badge>
          <Link to="create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierMetrics.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {supplierMetrics.activeSuppliers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(supplierMetrics.totalSpend / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierMetrics.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierMetrics.atRisk}</div>
            <p className="text-xs text-muted-foreground">
              suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common supplier management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="list">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    View All Suppliers
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="create">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Supplier
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="risk-assessment">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Risk Assessment
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="financial-health">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Financial Health
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest supplier management activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.supplier}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Suppliers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers by Spend</CardTitle>
              <CardDescription>
                Highest spending suppliers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSuppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(supplier.spend / 1000).toFixed(0)}K</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-muted-foreground">{supplier.rating}</span>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Manage your supplier relationships and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Suppliers section for detailed management
                </p>
                <Link to="list">
                  <Button className="mt-4">
                    View Suppliers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Management</CardTitle>
              <CardDescription>
                Monitor and evaluate supplier performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Performance section for detailed metrics
                </p>
                <Link to="performance-dashboard">
                  <Button className="mt-4">
                    View Performance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>
                Assess and manage supplier risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Risk Assessment section for detailed analysis
                </p>
                <Link to="risk-assessment">
                  <Button className="mt-4">
                    View Risk Assessment
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDashboard; 