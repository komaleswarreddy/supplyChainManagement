import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ArrowLeft, TrendingUp, TrendingDown, Package, Clock, Truck, AlertTriangle } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function SupplierPerformanceDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useSupplier, useSupplierAnalytics } = useSuppliers();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date()
  });

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplier(id!);
  const { data: analytics, isLoading: isLoadingAnalytics } = useSupplierAnalytics();

  if (isLoadingSupplier || !supplier || isLoadingAnalytics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Generate performance history data (mock data for demonstration)
  const performanceHistory = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    return {
      month: format(date, 'MMM yyyy'),
      quality: 75 + Math.floor(Math.random() * 20),
      delivery: 70 + Math.floor(Math.random() * 25),
      cost: 65 + Math.floor(Math.random() * 30),
      overall: 70 + Math.floor(Math.random() * 25),
    };
  });

  // Generate delivery performance data
  const deliveryPerformance = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    return {
      month: format(date, 'MMM yyyy'),
      onTime: 75 + Math.floor(Math.random() * 20),
      early: 5 + Math.floor(Math.random() * 10),
      late: 5 + Math.floor(Math.random() * 15),
    };
  });

  // Generate quality issues data
  const qualityIssues = [
    { name: 'Defects', value: 35 },
    { name: 'Packaging', value: 25 },
    { name: 'Documentation', value: 20 },
    { name: 'Other', value: 20 },
  ];

  // Generate cost variance data
  const costVariance = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    return {
      month: format(date, 'MMM yyyy'),
      target: 100,
      actual: 85 + Math.floor(Math.random() * 30),
    };
  });

  // Generate recent issues data
  const recentIssues = [
    {
      id: 'issue-1',
      type: 'Quality',
      description: 'Product defect rate exceeded threshold',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Open',
      severity: 'High',
    },
    {
      id: 'issue-2',
      type: 'Delivery',
      description: 'Late delivery on PO-2024-0042',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Resolved',
      severity: 'Medium',
    },
    {
      id: 'issue-3',
      type: 'Cost',
      description: 'Price increase without notification',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'In Progress',
      severity: 'Medium',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/suppliers/${supplier.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{supplier.name} - Performance Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {supplier.code} • {supplier.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            align="end"
          />
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold">{supplier.performance?.overallScore || 'N/A'}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  (supplier.performance?.overallScore || 0) > 85 ? 'bg-green-100' : 
                  (supplier.performance?.overallScore || 0) > 70 ? 'bg-amber-100' : 
                  'bg-red-100'
                }`}>
                  {(supplier.performance?.overallScore || 0) > 85 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (supplier.performance?.overallScore || 0) > 70 ? (
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Last updated: {supplier.performance?.lastUpdated ? format(new Date(supplier.performance.lastUpdated), 'PP') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                  <p className="text-3xl font-bold">{supplier.performance?.qualityScore || 'N/A'}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  (supplier.performance?.qualityScore || 0) > 85 ? 'bg-green-100' : 
                  (supplier.performance?.qualityScore || 0) > 70 ? 'bg-amber-100' : 
                  'bg-red-100'
                }`}>
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div 
                    className={`h-2 rounded-full ${
                      (supplier.performance?.qualityScore || 0) > 85 ? 'bg-green-500' : 
                      (supplier.performance?.qualityScore || 0) > 70 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${supplier.performance?.qualityScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Score</p>
                  <p className="text-3xl font-bold">{supplier.performance?.deliveryScore || 'N/A'}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  (supplier.performance?.deliveryScore || 0) > 85 ? 'bg-green-100' : 
                  (supplier.performance?.deliveryScore || 0) > 70 ? 'bg-amber-100' : 
                  'bg-red-100'
                }`}>
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div 
                    className={`h-2 rounded-full ${
                      (supplier.performance?.deliveryScore || 0) > 85 ? 'bg-green-500' : 
                      (supplier.performance?.deliveryScore || 0) > 70 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${supplier.performance?.deliveryScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost Score</p>
                  <p className="text-3xl font-bold">{supplier.performance?.costScore || 'N/A'}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  (supplier.performance?.costScore || 0) > 85 ? 'bg-green-100' : 
                  (supplier.performance?.costScore || 0) > 70 ? 'bg-amber-100' : 
                  'bg-red-100'
                }`}>
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div 
                    className={`h-2 rounded-full ${
                      (supplier.performance?.costScore || 0) > 85 ? 'bg-green-500' : 
                      (supplier.performance?.costScore || 0) > 70 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${supplier.performance?.costScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>
              Historical performance metrics over the past 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quality" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="delivery" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="cost" stroke="#ffc658" />
                  <Line type="monotone" dataKey="overall" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Delivery Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>
                On-time, early, and late deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" stackId="a" fill="#82ca9d" name="On Time" />
                    <Bar dataKey="early" stackId="a" fill="#8884d8" name="Early" />
                    <Bar dataKey="late" stackId="a" fill="#ff8042" name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quality Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues Breakdown</CardTitle>
              <CardDescription>
                Distribution of quality issues by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityIssues}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {qualityIssues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Performance</CardTitle>
              <CardDescription>
                Actual vs target cost performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={costVariance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="target" stroke="#8884d8" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>
                Latest quality, delivery, and cost issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <div className={`rounded-full p-2 ${
                      issue.type === 'Quality' ? 'bg-blue-100' : 
                      issue.type === 'Delivery' ? 'bg-purple-100' : 
                      'bg-green-100'
                    }`}>
                      {issue.type === 'Quality' ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : issue.type === 'Delivery' ? (
                        <Truck className="h-4 w-4 text-purple-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{issue.description}</p>
                        <Badge variant={
                          issue.status === 'Open' ? 'destructive' : 
                          issue.status === 'In Progress' ? 'warning' : 
                          'success'
                        }>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(issue.date), 'PP')} • {issue.type} • {issue.severity} Severity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
            Back to Supplier
          </Button>
          <Button onClick={() => window.print()}>
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SupplierPerformanceDashboard;