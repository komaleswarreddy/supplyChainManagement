import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Target, 
  Package, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const InventoryOptimization: React.FC = () => {
  const optimizationMetrics = {
    totalPolicies: 12,
    activePolicies: 8,
    safetyStockItems: 45,
    reorderPoints: 23,
    classifications: 15,
    optimizationScore: 87
  };

  const recentActivities = [
    {
      id: 1,
      type: 'policy',
      action: 'Safety stock policy updated',
      item: 'Electronics Category',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'reorder',
      action: 'Reorder point calculated',
      item: 'Raw Materials',
      timestamp: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'classification',
      action: 'ABC classification updated',
      item: 'Finished Goods',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Optimization</h1>
          <p className="text-muted-foreground">
            Optimize inventory levels, reduce costs, and improve efficiency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Score: {optimizationMetrics.optimizationScore}%
          </Badge>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">
              {optimizationMetrics.activePolicies} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.safetyStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Monitored items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.reorderPoints}</div>
            <p className="text-xs text-muted-foreground">
              Configured items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classifications</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.classifications}</div>
            <p className="text-xs text-muted-foreground">
              ABC categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="safety-stock">Safety Stock</TabsTrigger>
          <TabsTrigger value="reorder-points">Reorder Points</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common optimization tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="policies">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Policies
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="safety-stock">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Safety Stock Settings
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="reorder-points">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Reorder Points
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="classification">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    ABC Classification
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
                  Latest optimization changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.item}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Performance</CardTitle>
              <CardDescription>
                Monthly optimization metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Optimization performance chart will be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Policies</CardTitle>
              <CardDescription>
                Configure and manage inventory optimization policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Policies section for detailed management
                </p>
                <Link to="policies">
                  <Button className="mt-4">
                    View Policies
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Stock Management</CardTitle>
              <CardDescription>
                Configure safety stock levels and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Safety Stock section for detailed management
                </p>
                <Link to="safety-stock">
                  <Button className="mt-4">
                    View Safety Stock
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder-points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Points</CardTitle>
              <CardDescription>
                Manage reorder point calculations and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Reorder Points section for detailed management
                </p>
                <Link to="reorder-points">
                  <Button className="mt-4">
                    View Reorder Points
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ABC Classification</CardTitle>
              <CardDescription>
                Manage inventory classification and categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Classification section for detailed management
                </p>
                <Link to="classification">
                  <Button className="mt-4">
                    View Classification
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

export default InventoryOptimization; 