import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { KpiCard } from './components/kpi-card';
import { DataTable } from './components/data-table';
import { DateRangePicker } from './components/date-range-picker';
import { FilterPanel } from './components/filter-panel';
import { ReportsList } from './components/reports-list';
import { useToast } from '@/hooks/useToast';

// Sample data for charts
const inventoryData = [
  { name: 'Jan', stock: 4000, demand: 2400, forecast: 2600 },
  { name: 'Feb', stock: 3000, demand: 1398, forecast: 2210 },
  { name: 'Mar', stock: 2000, demand: 9800, forecast: 2290 },
  { name: 'Apr', stock: 2780, demand: 3908, forecast: 2000 },
  { name: 'May', stock: 1890, demand: 4800, forecast: 2181 },
  { name: 'Jun', stock: 2390, demand: 3800, forecast: 2500 },
  { name: 'Jul', stock: 3490, demand: 4300, forecast: 2100 },
];

const supplierPerformanceData = [
  { name: 'Acme Corp', quality: 85, delivery: 90, cost: 75, overall: 83 },
  { name: 'Beta Inc', quality: 92, delivery: 85, cost: 88, overall: 88 },
  { name: 'Gamma LLC', quality: 78, delivery: 82, cost: 95, overall: 85 },
  { name: 'Delta Co', quality: 95, delivery: 91, cost: 79, overall: 88 },
  { name: 'Epsilon', quality: 88, delivery: 79, cost: 90, overall: 86 },
];

const inventoryValueData = [
  { name: 'Raw Materials', value: 400000 },
  { name: 'Work in Progress', value: 300000 },
  { name: 'Finished Goods', value: 500000 },
  { name: 'MRO Supplies', value: 200000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const procurementTrendsData = [
  { month: 'Jan', spend: 4000, orders: 240, savings: 400 },
  { month: 'Feb', spend: 3000, orders: 198, savings: 210 },
  { month: 'Mar', spend: 9800, orders: 980, savings: 290 },
  { month: 'Apr', spend: 3908, orders: 308, savings: 200 },
  { month: 'May', spend: 4800, orders: 400, savings: 218 },
  { month: 'Jun', spend: 3800, orders: 380, savings: 250 },
  { month: 'Jul', spend: 4300, orders: 430, savings: 210 },
];

const transportationData = [
  { month: 'Jan', cost: 4000, shipments: 240, onTime: 92 },
  { month: 'Feb', cost: 3000, shipments: 198, onTime: 85 },
  { month: 'Mar', cost: 9800, shipments: 980, onTime: 88 },
  { month: 'Apr', cost: 3908, shipments: 308, onTime: 91 },
  { month: 'May', cost: 4800, shipments: 400, onTime: 87 },
  { month: 'Jun', cost: 3800, shipments: 380, onTime: 95 },
  { month: 'Jul', cost: 4300, shipments: 430, onTime: 89 },
];

const topSuppliersData = [
  { id: 1, name: 'Acme Corp', spend: 1250000, orders: 145, onTimeDelivery: 92 },
  { id: 2, name: 'Beta Inc', spend: 980000, orders: 120, onTimeDelivery: 88 },
  { id: 3, name: 'Gamma LLC', spend: 750000, orders: 95, onTimeDelivery: 95 },
  { id: 4, name: 'Delta Co', spend: 620000, orders: 78, onTimeDelivery: 91 },
  { id: 5, name: 'Epsilon', spend: 540000, orders: 65, onTimeDelivery: 87 },
];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ from: new Date(2023, 0, 1), to: new Date() });
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Dashboard data refreshed successfully");
    }, 1500);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Dashboard exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your supply chain operations
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
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Select defaultValue="pdf">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </Select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Spend" 
          value="$4.2M" 
          change={+12.5}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        />
        <KpiCard 
          title="Inventory Value" 
          value="$1.4M" 
          change={-3.2}
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
        />
        <KpiCard 
          title="On-Time Delivery" 
          value="92%" 
          change={+2.1}
          icon={<Truck className="h-5 w-5 text-muted-foreground" />}
        />
        <KpiCard 
          title="Stockout Rate" 
          value="1.8%" 
          change={-0.5}
          icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Overview</CardTitle>
                <CardDescription>Stock levels vs. demand and forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stock" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="demand" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="forecast" stroke="#ffc658" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Procurement Trends</CardTitle>
                <CardDescription>Monthly spend, orders, and savings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={procurementTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="spend" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="orders" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="savings" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Value Distribution</CardTitle>
                <CardDescription>By inventory type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={inventoryValueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryValueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
                <CardDescription>Quality, delivery, and cost metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={supplierPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quality" fill="#8884d8" />
                    <Bar dataKey="delivery" fill="#82ca9d" />
                    <Bar dataKey="cost" fill="#ffc658" />
                    <Bar dataKey="overall" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Top Suppliers by Spend</CardTitle>
              <CardDescription>Year-to-date performance</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={topSuppliersData}
                columns={[
                  { header: 'Supplier', accessorKey: 'name' },
                  { 
                    header: 'Spend', 
                    accessorKey: 'spend',
                    cell: (info) => `$${info.getValue<number>().toLocaleString()}`
                  },
                  { header: 'Orders', accessorKey: 'orders' },
                  { 
                    header: 'On-Time Delivery', 
                    accessorKey: 'onTimeDelivery',
                    cell: (info) => `${info.getValue<number>()}%`
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Spend YTD" 
              value="$4.2M" 
              change={+12.5}
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="POs Created" 
              value="1,245" 
              change={+5.8}
              icon={<Package className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Avg. PO Cycle Time" 
              value="3.2 days" 
              change={-0.5}
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Cost Savings" 
              value="$320K" 
              change={+15.2}
              icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Spend Analysis</CardTitle>
                <CardDescription>Monthly spend by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={procurementTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="spend" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="savings" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Purchase Order Status</CardTitle>
                <CardDescription>Current PO distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Draft', value: 15 },
                        { name: 'Pending Approval', value: 25 },
                        { name: 'Approved', value: 30 },
                        { name: 'Sent', value: 20 },
                        { name: 'Completed', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryValueData.map((entry, index) => (
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
              <CardTitle className="text-lg font-medium">Spend by Category</CardTitle>
              <CardDescription>Year-to-date breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={[
                    { category: 'Raw Materials', spend: 1500000 },
                    { category: 'Packaging', spend: 800000 },
                    { category: 'MRO', spend: 600000 },
                    { category: 'IT Equipment', spend: 450000 },
                    { category: 'Professional Services', spend: 350000 },
                    { category: 'Office Supplies', spend: 250000 },
                    { category: 'Travel', spend: 150000 },
                    { category: 'Other', spend: 100000 },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={150} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="spend" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Inventory Value" 
              value="$1.4M" 
              change={-3.2}
              icon={<Package className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Inventory Turnover" 
              value="5.8" 
              change={+0.3}
              icon={<RefreshCw className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Days of Supply" 
              value="32 days" 
              change={-2}
              icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Stockout Rate" 
              value="1.8%" 
              change={-0.5}
              icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Levels</CardTitle>
                <CardDescription>Stock levels vs. demand and forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stock" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="demand" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="forecast" stroke="#ffc658" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Value Distribution</CardTitle>
                <CardDescription>By inventory type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryValueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryValueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">ABC Analysis</CardTitle>
              <CardDescription>Inventory classification by value and volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Class A (70% of value)</span>
                    <span className="text-sm text-muted-foreground">10% of items</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">$980,000 value • 120 items</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Class B (20% of value)</span>
                    <span className="text-sm text-muted-foreground">20% of items</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">$280,000 value • 240 items</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Class C (10% of value)</span>
                    <span className="text-sm text-muted-foreground">70% of items</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">$140,000 value • 840 items</p>
                </div>
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { category: 'Class A', items: 120, value: 980000 },
                      { category: 'Class B', items: 240, value: 280000 },
                      { category: 'Class C', items: 840, value: 140000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => [
                      name === 'value' ? `$${value.toLocaleString()}` : value,
                      name === 'value' ? 'Value' : 'Items'
                    ]} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" name="Value" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="items" name="Items" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Active Suppliers" 
              value="128" 
              change={+5}
              icon={<Package className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Avg. Lead Time" 
              value="18 days" 
              change={-2.5}
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="On-Time Delivery" 
              value="92%" 
              change={+2.1}
              icon={<Truck className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Quality Rating" 
              value="4.2/5" 
              change={+0.3}
              icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
                <CardDescription>Quality, delivery, and cost metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={supplierPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quality" fill="#8884d8" />
                    <Bar dataKey="delivery" fill="#82ca9d" />
                    <Bar dataKey="cost" fill="#ffc658" />
                    <Bar dataKey="overall" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Risk Distribution</CardTitle>
                <CardDescription>By risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Low Risk', value: 65 },
                        { name: 'Medium Risk', value: 25 },
                        { name: 'High Risk', value: 8 },
                        { name: 'Critical Risk', value: 2 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#facc15" />
                      <Cell fill="#f97316" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Top Suppliers by Spend</CardTitle>
              <CardDescription>Year-to-date performance</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={topSuppliersData}
                columns={[
                  { header: 'Supplier', accessorKey: 'name' },
                  { 
                    header: 'Spend', 
                    accessorKey: 'spend',
                    cell: (info) => `$${info.getValue<number>().toLocaleString()}`
                  },
                  { header: 'Orders', accessorKey: 'orders' },
                  { 
                    header: 'On-Time Delivery', 
                    accessorKey: 'onTimeDelivery',
                    cell: (info) => `${info.getValue<number>()}%`
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Shipments" 
              value="1,842" 
              change={+8.3}
              icon={<Truck className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Freight Spend" 
              value="$620K" 
              change={+5.2}
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="On-Time Delivery" 
              value="89%" 
              change={+1.5}
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Avg. Transit Time" 
              value="3.5 days" 
              change={-0.2}
              icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Transportation Costs</CardTitle>
                <CardDescription>Monthly costs and shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transportationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="shipments" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">On-Time Performance</CardTitle>
                <CardDescription>Monthly on-time delivery percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transportationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="onTime" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Carrier Performance Comparison</CardTitle>
              <CardDescription>Key metrics by carrier</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={[
                    { carrier: 'Express Carriers', cost: 85, onTime: 94, damage: 0.5 },
                    { carrier: 'Global Logistics', cost: 75, onTime: 89, damage: 0.8 },
                    { carrier: 'Fast Freight', cost: 90, onTime: 92, damage: 0.3 },
                    { carrier: 'Premium Shipping', cost: 95, onTime: 96, damage: 0.2 },
                    { carrier: 'Reliable Transport', cost: 80, onTime: 91, damage: 0.6 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrier" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" name="Cost Efficiency" fill="#8884d8" />
                  <Bar dataKey="onTime" name="On-Time %" fill="#82ca9d" />
                  <Bar dataKey="damage" name="Damage Rate %" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Available Reports</CardTitle>
                <CardDescription>Select a report to view or export</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsList />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-medium">Report Preview</CardTitle>
                  <CardDescription>Procurement Spend Analysis</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Spend by Category</h3>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <PieChartIcon className="h-4 w-4" />
                      <LineChartIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { category: 'Raw Materials', spend: 1500000 },
                        { category: 'Packaging', spend: 800000 },
                        { category: 'MRO', spend: 600000 },
                        { category: 'IT Equipment', spend: 450000 },
                        { category: 'Professional Services', spend: 350000 },
                        { category: 'Office Supplies', spend: 250000 },
                        { category: 'Travel', spend: 150000 },
                        { category: 'Other', spend: 100000 },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="spend" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Total spend for the selected period is $4.2M across 8 categories. 
                      Raw Materials represent the largest spend category at 36% of total spend, 
                      followed by Packaging at 19% and MRO at 14%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="hidden md:block">
        <FilterPanel />
      </div>
    </div>
  );
}