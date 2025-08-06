import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  BarChart3,
  Plus,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProcurement } from '@/hooks/useProcurement';

const ProcurementDashboard: React.FC = () => {
  // --- Mock Data ---
  const mockMetrics = {
    totalRequisitions: 45,
    pendingRequisitions: 12,
    approvedRequisitions: 28,
    totalPurchaseOrders: 38,
    pendingPOs: 8,
    completedPOs: 30,
    totalSpend: 1250000,
    savings: 85000,
    averageLeadTime: 14,
    performanceScore: 92
  };
  const mockRecentActivities = [
    { id: 1, type: 'requisition', action: 'New requisition submitted', item: 'Office Supplies', amount: 2500, timestamp: '2 hours ago', status: 'pending' },
    { id: 2, type: 'purchase-order', action: 'Purchase order approved', item: 'IT Equipment', amount: 15000, timestamp: '4 hours ago', status: 'completed' },
    { id: 3, type: 'contract', action: 'Contract renewal due', item: 'Software Licenses', amount: 50000, timestamp: '1 day ago', status: 'warning' },
    { id: 4, type: 'rfx', action: 'RFX response received', item: 'Raw Materials', amount: 75000, timestamp: '2 days ago', status: 'completed' }
  ];
  const mockTopCategories = [
    { id: 1, name: 'IT Equipment', spend: 450000, percentage: 36, trend: 'up' },
    { id: 2, name: 'Raw Materials', spend: 320000, percentage: 26, trend: 'up' },
    { id: 3, name: 'Office Supplies', spend: 180000, percentage: 14, trend: 'down' },
    { id: 4, name: 'Software Licenses', spend: 150000, percentage: 12, trend: 'stable' }
  ];

  // --- Real API Integration ---
  const { useRequisitions } = useProcurement();
  const { data: reqData, isLoading: isReqLoading } = useRequisitions({ page: 1, pageSize: 100 });

  // Compute metrics from real data if available
  const metrics = useMemo(() => {
    if (!reqData || !reqData.items) return mockMetrics;
    const totalRequisitions = reqData.items.length;
    const pendingRequisitions = reqData.items.filter(r => r.status === 'PENDING').length;
    const approvedRequisitions = reqData.items.filter(r => r.status === 'APPROVED').length;
    // For demo, use mock for POs, spend, savings, etc.
    return {
      ...mockMetrics,
      totalRequisitions,
      pendingRequisitions,
      approvedRequisitions,
    };
  }, [reqData]);

  // Recent activities from real data if available
  const recentActivities = useMemo(() => {
    if (!reqData || !reqData.items) return mockRecentActivities;
    return reqData.items.slice(0, 4).map((r, i) => ({
      id: i + 1,
      type: 'requisition',
      action: `Requisition ${r.status === 'APPROVED' ? 'approved' : r.status === 'PENDING' ? 'submitted' : r.status.toLowerCase()}`,
      item: r.title,
      amount: r.totalAmount,
      timestamp: new Date(r.createdAt).toLocaleDateString(),
      status: r.status.toLowerCase(),
    }));
  }, [reqData]);

  // Top categories from real data if available
  const topCategories = useMemo(() => {
    if (!reqData || !reqData.items) return mockTopCategories;
    const categoryMap: Record<string, { spend: number; count: number }> = {};
    reqData.items.forEach(r => {
      if (!categoryMap[r.category]) categoryMap[r.category] = { spend: 0, count: 0 };
      categoryMap[r.category].spend += r.totalAmount;
      categoryMap[r.category].count += 1;
    });
    return Object.entries(categoryMap)
      .map(([name, { spend, count }], i) => ({
        id: i + 1,
        name,
        spend,
        percentage: Math.round((spend / (metrics.totalSpend || 1)) * 100),
        trend: 'up',
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 4);
  }, [reqData, metrics.totalSpend]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Management</h1>
          <p className="text-muted-foreground">
            Manage requisitions, purchase orders, and supplier contracts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Score: {metrics.performanceScore}%
          </Badge>
          <Link to="requisitions">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Requisition
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics.totalSpend / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisitions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequisitions}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingRequisitions} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPurchaseOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingPOs} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics.savings / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common procurement tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="requisitions">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Requisition
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="purchase-orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Purchase Orders
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="rfx">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Manage RFX
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="contracts">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Contracts
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
                  Latest procurement activities
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
                          <p className="text-xs text-muted-foreground">
                            {activity.item} - ${activity.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spend by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
              <CardDescription>
                Procurement spend breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(category.spend / 1000).toFixed(0)}K</p>
                      <div className="flex items-center space-x-1">
                        {category.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {category.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                        {category.trend === 'stable' && <div className="w-3 h-3 text-gray-500">—</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisition Management</CardTitle>
              <CardDescription>
                Create and manage purchase requisitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Requisitions section for detailed management
                </p>
                <Link to="requisitions">
                  <Button className="mt-4">
                    View Requisitions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Management</CardTitle>
              <CardDescription>
                Manage purchase orders and track deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Purchase Orders section for detailed management
                </p>
                <Link to="purchase-orders">
                  <Button className="mt-4">
                    View Purchase Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
              <CardDescription>
                Manage supplier contracts and agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  Navigate to the Contracts section for detailed management
                </p>
                <Link to="contracts">
                  <Button className="mt-4">
                    View Contracts
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

export default ProcurementDashboard; 