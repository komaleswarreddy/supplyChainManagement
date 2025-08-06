import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Layers,
  Calendar
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/useToast';

// Dashboard Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  loading = false 
}: { 
  title: string; 
  value: string | number; 
  change?: number; 
  icon: React.ReactNode;
  loading?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{loading ? '—' : value}</p>
              {change !== undefined && (
                <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
          <div className="rounded-full bg-muted p-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Status Card Component
const StatusCard = ({ 
  title, 
  healthy, 
  warnings, 
  critical 
}: { 
  title: string; 
  healthy: number; 
  warnings: number; 
  critical: number;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Healthy: {healthy}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="text-sm">Warnings: {warnings}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Critical: {critical}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Alert Component
const AlertItem = ({ 
  severity, 
  message 
}: { 
  severity: 'info' | 'warning' | 'critical'; 
  message: string;
}) => {
  const bgColor = 
    severity === 'critical' ? 'bg-red-100 border-red-300' : 
    severity === 'warning' ? 'bg-amber-100 border-amber-300' : 
    'bg-blue-100 border-blue-300';
  
  const textColor = 
    severity === 'critical' ? 'text-red-800' : 
    severity === 'warning' ? 'text-amber-800' : 
    'text-blue-800';
  
  const icon = 
    severity === 'critical' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : 
    severity === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : 
    <AlertTriangle className="h-5 w-5 text-blue-500" />;
  
  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 ${bgColor}`}>
      {icon}
      <p className={`text-sm ${textColor}`}>{message}</p>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ 
  type, 
  action, 
  entityName, 
  timestamp, 
  userName 
}: { 
  type: string; 
  action: string; 
  entityName: string; 
  timestamp: string; 
  userName: string;
}) => {
  const getIcon = () => {
    switch (type) {
      case 'requisition':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'shipment':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'supplier':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'created':
        return 'created';
      case 'updated':
        return 'updated';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return action;
    }
  };

  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{userName}</span>{' '}
          {getActionText()}{' '}
          <span className="font-medium">{entityName}</span>
        </p>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Format dates for API call
  const startDate = dateRange.from ? dateRange.from.toISOString() : 
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
  const endDate = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();

  // Fetch dashboard data
  const { data, isLoading, refetch } = useDashboardData({ startDate, endDate });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Dashboard data refreshed successfully");
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Dashboard exported as ${format.toUpperCase()}`);
  };

  // Sample data for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your supply chain management dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleExport('pdf')}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard 
          title="System Status" 
          healthy={data?.statusOverview.healthy || 0} 
          warnings={data?.statusOverview.warnings || 0} 
          critical={data?.statusOverview.critical || 0} 
        />
        
        {data?.alerts && data.alerts.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.alerts.map((alert) => (
                <AlertItem 
                  key={alert.id} 
                  severity={alert.severity} 
                  message={alert.message} 
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Requisitions" 
          value={data?.procurement.totalRequisitions || 0} 
          change={data?.procurement.changePercentage} 
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard 
          title="Pending Approvals" 
          value={data?.procurement.pendingApprovals || 0} 
          change={data?.procurement.pendingApprovalsChange} 
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard 
          title="Inventory Value" 
          value={`$${(data?.inventory.totalValue || 0).toLocaleString()}`} 
          change={data?.inventory.valueChangePercentage} 
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard 
          title="Active Shipments" 
          value={data?.logistics.activeShipments || 0} 
          change={data?.logistics.changePercentage} 
          icon={<Truck className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Procurement Activity</CardTitle>
                <CardDescription>Requisitions and purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.charts.procurementActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="requisitions" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="purchaseOrders" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
                <CardDescription>Stock levels by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.charts.inventoryStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inStock" fill="#8884d8" />
                    <Bar dataKey="lowStock" fill="#ffc658" />
                    <Bar dataKey="outOfStock" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Requisition Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.charts.requisitionStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.requisitionStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Distribution</CardTitle>
                <CardDescription>By supplier type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.charts.supplierDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.supplierDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Shipment Status</CardTitle>
                <CardDescription>Current shipment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.charts.shipmentStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.shipmentStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                {data?.recentActivity.map((activity) => (
                  <ActivityItem 
                    key={activity.id}
                    type={activity.type}
                    action={activity.action}
                    entityName={activity.entityName}
                    timestamp={activity.timestamp}
                    userName={activity.user.name}
                  />
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Suppliers</CardTitle>
                <CardDescription>By spend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.topSuppliers.map((supplier, index) => (
                    <div key={supplier.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${supplier.spend.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{supplier.onTimeDelivery}% on-time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Requisitions" 
              value={data?.procurement.totalRequisitions || 0} 
              change={data?.procurement.changePercentage} 
              icon={<FileText className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Pending Approvals" 
              value={data?.procurement.pendingApprovals || 0} 
              change={data?.procurement.pendingApprovalsChange} 
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Purchase Orders" 
              value={data?.procurement.purchaseOrders || 0} 
              change={data?.procurement.purchaseOrdersChange} 
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Spend YTD" 
              value={`$${(data?.procurement.spendYTD || 0).toLocaleString()}`} 
              change={data?.procurement.spendYTDChange} 
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Requisition Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.charts.requisitionStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.requisitionStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Spend Analysis</CardTitle>
                <CardDescription>Monthly spend and savings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.charts.spendAnalysis || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="spend" fill="#8884d8" name="Spend" />
                    <Bar dataKey="savings" fill="#82ca9d" name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Procurement Activity</CardTitle>
              <CardDescription>Requisitions and purchase orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data?.charts.procurementActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="requisitions" stroke="#8884d8" fill="#8884d8" name="Requisitions" />
                  <Area type="monotone" dataKey="purchaseOrders" stroke="#82ca9d" fill="#82ca9d" name="Purchase Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Items" 
              value={data?.inventory.totalItems || 0} 
              change={data?.inventory.changePercentage} 
              icon={<Package className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Inventory Value" 
              value={`$${(data?.inventory.totalValue || 0).toLocaleString()}`} 
              change={data?.inventory.valueChangePercentage} 
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Turnover Rate" 
              value={data?.inventory.turnoverRate || 0} 
              change={data?.inventory.turnoverChangePercentage} 
              icon={<RefreshCw className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Out of Stock" 
              value={data?.inventory.outOfStockCount || 0} 
              change={data?.inventory.outOfStockChangePercentage} 
              icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Levels</CardTitle>
                <CardDescription>Stock levels vs. reorder points</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.charts.inventoryLevels || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stock" stroke="#8884d8" activeDot={{ r: 8 }} name="Current Stock" />
                    <Line type="monotone" dataKey="reorderPoint" stroke="#ff8042" strokeDasharray="5 5" name="Reorder Point" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory by Category</CardTitle>
                <CardDescription>Distribution by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.charts.inventoryByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.inventoryByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Inventory Movements</CardTitle>
              <CardDescription>Receipts, issues, and adjustments over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts.inventoryMovements || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receipts" fill="#8884d8" name="Receipts" />
                  <Bar dataKey="issues" fill="#82ca9d" name="Issues" />
                  <Bar dataKey="adjustments" fill="#ffc658" name="Adjustments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Active Shipments" 
              value={data?.logistics.activeShipments || 0} 
              change={data?.logistics.changePercentage} 
              icon={<Truck className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="On-Time Delivery" 
              value={`${data?.logistics.onTimePercentage || 0}%`} 
              change={data?.logistics.onTimeChangePercentage} 
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Avg. Transit Days" 
              value={data?.logistics.avgTransitDays || 0} 
              change={data?.logistics.transitDaysChangePercentage} 
              icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Freight Spend" 
              value={`$${(data?.logistics.freightSpend || 0).toLocaleString()}`} 
              change={data?.logistics.freightSpendChangePercentage} 
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Shipment Status</CardTitle>
                <CardDescription>Current shipment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.charts.shipmentStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.shipmentStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Carrier Performance</CardTitle>
                <CardDescription>On-time delivery percentage by carrier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.charts.carrierPerformance || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="onTimePercentage" fill="#8884d8" name="On-Time %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Shipment Trends</CardTitle>
              <CardDescription>Shipment volume and cost over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.charts.shipmentTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="shipments" stroke="#8884d8" name="Shipments" />
                  <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#82ca9d" name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Suppliers" 
              value={data?.topSuppliers.length || 0} 
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Avg. On-Time Delivery" 
              value={`${data?.topSuppliers.reduce((acc, s) => acc + s.onTimeDelivery, 0) / (data?.topSuppliers.length || 1)}%`} 
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Avg. Quality Score" 
              value={(data?.topSuppliers.reduce((acc, s) => acc + s.qualityScore, 0) / (data?.topSuppliers.length || 1)).toFixed(1)} 
              icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
            <MetricCard 
              title="Total Spend" 
              value={`$${data?.topSuppliers.reduce((acc, s) => acc + s.spend, 0).toLocaleString() || 0}`} 
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Distribution</CardTitle>
                <CardDescription>By supplier type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.charts.supplierDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.charts.supplierDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
                <CardDescription>Quality, delivery, and cost metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.charts.supplierPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quality" fill="#8884d8" name="Quality" />
                    <Bar dataKey="delivery" fill="#82ca9d" name="Delivery" />
                    <Bar dataKey="cost" fill="#ffc658" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Top Suppliers</CardTitle>
              <CardDescription>By spend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Supplier</th>
                      <th className="text-right py-3 px-4">Spend</th>
                      <th className="text-right py-3 px-4">Orders</th>
                      <th className="text-right py-3 px-4">On-Time Delivery</th>
                      <th className="text-right py-3 px-4">Quality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.topSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{supplier.name}</td>
                        <td className="py-3 px-4 text-right">${supplier.spend.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{supplier.orders}</td>
                        <td className="py-3 px-4 text-right">{supplier.onTimeDelivery}%</td>
                        <td className="py-3 px-4 text-right">{supplier.qualityScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}