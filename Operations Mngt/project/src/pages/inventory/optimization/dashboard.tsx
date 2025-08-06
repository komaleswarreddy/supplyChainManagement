import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Package, 
  AlertTriangle,
  Settings,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function InventoryOptimizationDashboard() {
  const optimizationMetrics = {
    overallScore: 87,
    costSavings: 125000,
    stockoutReduction: 45,
    turnoverImprovement: 23,
    deadStockReduction: 67,
    policyCompliance: 92
  };

  const performanceData = [
    { month: 'Jan', score: 75, savings: 85000 },
    { month: 'Feb', score: 78, savings: 92000 },
    { month: 'Mar', score: 82, savings: 105000 },
    { month: 'Apr', score: 85, savings: 118000 },
    { month: 'May', score: 87, savings: 125000 },
    { month: 'Jun', score: 89, savings: 132000 }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: '15 items below safety stock levels',
      priority: 'high',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      message: 'ABC classification update due',
      priority: 'medium',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'success',
      message: 'Reorder points optimized for 23 items',
      priority: 'low',
      timestamp: '3 days ago'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optimization Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and track inventory optimization performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Score: {optimizationMetrics.overallScore}%
          </Badge>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.overallScore}%</div>
            <Progress value={optimizationMetrics.overallScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(optimizationMetrics.costSavings / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              +{((optimizationMetrics.costSavings / 100000) * 100).toFixed(1)}% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Reduction</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.stockoutReduction}%</div>
            <p className="text-xs text-muted-foreground">
              {optimizationMetrics.stockoutReduction}% fewer stockouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Improvement</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.turnoverImprovement}%</div>
            <p className="text-xs text-muted-foreground">
              Faster inventory turnover
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Performance</CardTitle>
            <CardDescription>
              Monthly optimization score and cost savings trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{data.month}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{data.score}%</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${(data.savings / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Alerts</CardTitle>
            <CardDescription>
              Recent optimization notifications and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getPriorityColor(alert.priority)} size="sm">
                        {alert.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Dead Stock Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.deadStockReduction}%</div>
            <p className="text-xs text-muted-foreground">
              Reduction in obsolete inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Policy Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.policyCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              Adherence to optimization policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 days</div>
            <p className="text-xs text-muted-foreground">
              Average response to stockout alerts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InventoryOptimizationDashboard;

