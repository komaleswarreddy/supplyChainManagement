import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOrderAnalytics, useOrders, useCustomers } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Eye,
  Target,
  Clock,
  Truck,
  RotateCcw,
  CreditCard,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { format, subDays, subMonths, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
];

const statusColors = {
  pending: '#FFA500',
  confirmed: '#0088FE',
  processing: '#8884d8',
  shipped: '#82ca9d',
  delivered: '#00C49F',
  cancelled: '#FF8042',
  returned: '#ff7300',
};

export function OrderAnalytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedMetrics, setSelectedMetrics] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate date range based on selection
  const { startDate, endDate } = useMemo(() => {
    if (timeRange === 'custom' && dateRange?.from && dateRange?.to) {
      return {
        startDate: dateRange.from,
        endDate: dateRange.to,
      };
    }

    const now = new Date();
    let start: Date;

    switch (timeRange) {
      case '7d':
        start = subDays(now, 7);
        break;
      case '30d':
        start = subDays(now, 30);
        break;
      case '90d':
        start = subDays(now, 90);
        break;
      case '6m':
        start = subMonths(now, 6);
        break;
      case '1y':
        start = subMonths(now, 12);
        break;
      default:
        start = subDays(now, 30);
    }

    return { startDate: start, endDate: now };
  }, [timeRange, dateRange]);

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useOrderAnalytics({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: ordersData } = useOrders({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 1000,
  });

  const { data: customersData } = useCustomers({
    limit: 1000,
  });

  const orders = ordersData?.orders || [];
  const customers = customersData?.customers || [];

  // Process data for charts
  const processedData = useMemo(() => {
    if (!orders.length) return null;

    // Daily revenue and orders
    const dailyData = {};
    orders.forEach(order => {
      const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          revenue: 0,
          orders: 0,
          customers: new Set(),
        };
      }
      dailyData[date].revenue += order.totalAmount;
      dailyData[date].orders += 1;
      dailyData[date].customers.add(order.customerId);
    });

    const dailyChartData = Object.values(dailyData)
      .map((day: any) => ({
        ...day,
        customers: day.customers.size,
        avgOrderValue: day.revenue / day.orders,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Status distribution
    const statusDistribution = {};
    orders.forEach(order => {
      statusDistribution[order.status] = (statusDistribution[order.status] || 0) + 1;
    });

    const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: statusColors[status] || '#8884d8',
    }));

    // Payment method distribution
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'Unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const paymentMethodData = Object.entries(paymentMethods).map(([method, count]) => ({
      name: method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
    }));

    // Monthly trends
    const monthlyData = {};
    orders.forEach(order => {
      const month = format(new Date(order.createdAt), 'yyyy-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          revenue: 0,
          orders: 0,
          customers: new Set(),
        };
      }
      monthlyData[month].revenue += order.totalAmount;
      monthlyData[month].orders += 1;
      monthlyData[month].customers.add(order.customerId);
    });

    const monthlyChartData = Object.values(monthlyData)
      .map((month: any) => ({
        ...month,
        customers: month.customers.size,
        avgOrderValue: month.revenue / month.orders,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Top customers by revenue
    const customerRevenue = {};
    orders.forEach(order => {
      customerRevenue[order.customerId] = (customerRevenue[order.customerId] || 0) + order.totalAmount;
    });

    const topCustomers = Object.entries(customerRevenue)
      .map(([customerId, revenue]) => {
        const customer = customers.find(c => c.id === customerId);
        return {
          id: customerId,
          name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer',
          email: customer?.email || '',
          revenue: revenue as number,
          orders: orders.filter(o => o.customerId === customerId).length,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Product performance (mock data since we don't have product details in orders)
    const productPerformance = orders
      .flatMap(order => order.items || [])
      .reduce((acc, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            id: item.productId,
            name: item.productName || `Product ${item.productId}`,
            quantity: 0,
            revenue: 0,
            orders: new Set(),
          };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += item.totalPrice;
        acc[item.productId].orders.add(item.orderId);
        return acc;
      }, {});

    const topProducts = Object.values(productPerformance)
      .map((product: any) => ({
        ...product,
        orders: product.orders.size,
        avgPrice: product.revenue / product.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Geographic data (mock based on shipping addresses)
    const geographic = {};
    orders.forEach(order => {
      const state = order.shippingAddress?.state || 'Unknown';
      const country = order.shippingAddress?.country || 'Unknown';
      const location = `${state}, ${country}`;
      if (!geographic[location]) {
        geographic[location] = { location, orders: 0, revenue: 0 };
      }
      geographic[location].orders += 1;
      geographic[location].revenue += order.totalAmount;
    });

    const geographicData = Object.values(geographic)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      dailyChartData,
      monthlyChartData,
      statusChartData,
      paymentMethodData,
      topCustomers,
      topProducts,
      geographicData,
    };
  }, [orders, customers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAnalytics();
      toast.success('Latest data has been loaded successfully.');
    } catch (error) {
      toast.error('Failed to refresh analytics data.');
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    // Mock export functionality
    toast.success('Your analytics report is being generated and will be downloaded shortly.');
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your order management performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select value={timeRange || 'all'} onValueChange={v => setTimeRange(v === 'all' ? '30d' : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {timeRange === 'custom' && (
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Metrics</Label>
              <Select value={selectedMetrics || 'all'} onValueChange={v => setSelectedMetrics(v === 'all' ? 'all' : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Metrics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="revenue">Revenue Only</SelectItem>
                  <SelectItem value="orders">Orders Only</SelectItem>
                  <SelectItem value="customers">Customers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analytics.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                {analytics.revenueGrowth && analytics.revenueGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={analytics.revenueGrowth && analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(analytics.revenueGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders?.toLocaleString() || '0'}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                {analytics.orderGrowth && analytics.orderGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={analytics.orderGrowth && analytics.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(analytics.orderGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">${analytics.averageOrderValue?.toFixed(2) || '0.00'}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                {analytics.aovGrowth && analytics.aovGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={analytics.aovGrowth && analytics.aovGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(analytics.aovGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analytics.conversionRate?.toFixed(1) || '0.0'}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                {analytics.conversionGrowth && analytics.conversionGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={analytics.conversionGrowth && analytics.conversionGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(analytics.conversionGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.dailyChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={processedData.dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.statusChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={processedData.statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processedData.statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders vs Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Orders vs Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.dailyChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={processedData.dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.paymentMethodData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData.paymentMethodData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.monthlyChartData ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={processedData.monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#8884d8" fillOpacity={0.3} name="Revenue ($)" />
                      <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
                      <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#ff7300" name="New Customers" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average Order Value Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Average Order Value Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.dailyChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={processedData.dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgOrderValue" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Customers by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.topCustomers ? (
                  <div className="space-y-4">
                    {processedData.topCustomers.slice(0, 8).map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${customer.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No customer data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Customer Acquisition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData?.dailyChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData.dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="customers" fill="#82ca9d" name="New Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedData?.topProducts ? (
                <div className="space-y-4">
                  {processedData.topProducts.slice(0, 10).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} units sold • {product.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: ${product.avgPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No product data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedData?.geographicData ? (
                <div className="space-y-4">
                  {processedData.geographicData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{location.location}</p>
                          <p className="text-sm text-muted-foreground">{location.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${location.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: ${(location.revenue / location.orders).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No geographic data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <Eye className="h-4 w-4 mr-2" />
                View All Orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders/customers">
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders/create">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Create Order
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderAnalytics; 