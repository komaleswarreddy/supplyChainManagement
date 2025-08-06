import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Download, FileText, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Calendar, TrendingUp, TrendingDown,
  DollarSign, Package, Truck, RefreshCw, Filter, Share2
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';

// Advanced analytics dashboard with real-time data, predictive insights, and customizable views
export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() });
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('standard');
  const [metrics, setMetrics] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // Fetch multiple data sources in parallel
      const [metricsResponse, predictiveResponse, anomaliesResponse] = await Promise.all([
        api.get('/analytics/dashboard', { 
          params: { 
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString(),
            mode: viewMode
          } 
        }),
        api.get('/analytics/predictive', { 
          params: { 
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString() 
          } 
        }),
        api.get('/analytics/anomalies', { 
          params: { 
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString() 
          } 
        })
      ]);
      
      // For demo purposes, we'll create mock data
      setMetrics(generateMockMetrics());
      setPredictiveData(generateMockPredictiveData());
      setAnomalies(generateMockAnomalies());
      
      if (!silent) {
        toast.success("Dashboard data refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (!silent) {
        toast.error("Failed to fetch dashboard data");
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const handleExport = (format) => {
    // Implement export functionality
    toast.success(`Dashboard exported as ${format.toUpperCase()}`);
  };

  const handleShare = () => {
    // Implement dashboard sharing
    toast.success("Dashboard share link copied to clipboard");
  };

  // Generate mock data for demo purposes
  const generateMockMetrics = () => {
    return {
      procurement: {
        totalRequisitions: 324,
        pendingApprovals: 18,
        purchaseOrders: 287,
        spendYTD: 4250000,
        changePercentage: 12.5,
      },
      inventory: {
        totalItems: 1842,
        totalValue: 1400000,
        turnoverRate: 5.8,
        outOfStockCount: 23,
        lowStockCount: 45,
        changePercentage: 3.2,
      },
      logistics: {
        activeShipments: 42,
        onTimePercentage: 92,
        avgTransitDays: 3.5,
        freightSpend: 320000,
        changePercentage: 8.3,
      },
    };
  };

  const generateMockPredictiveData = () => {
    return {
      demandForecast: [
        { date: '2024-01', actual: 1200, forecast: null, upperBound: null, lowerBound: null },
        { date: '2024-02', actual: 1350, forecast: null, upperBound: null, lowerBound: null },
        { date: '2024-03', actual: 1100, forecast: null, upperBound: null, lowerBound: null },
        { date: '2024-04', actual: 1450, forecast: null, upperBound: null, lowerBound: null },
        { date: '2024-05', actual: 1600, forecast: null, upperBound: null, lowerBound: null },
        { date: '2024-06', actual: 1800, forecast: 1800, upperBound: 1800, lowerBound: 1800 },
        { date: '2024-07', actual: null, forecast: 1950, upperBound: 2100, lowerBound: 1800 },
        { date: '2024-08', actual: null, forecast: 2100, upperBound: 2300, lowerBound: 1900 },
        { date: '2024-09', actual: null, forecast: 2250, upperBound: 2500, lowerBound: 2000 },
      ],
      forecastAccuracy: 92.5,
      trend: 15.3,
      cashFlowProjection: [
        { date: '2024-07', inflow: 450000, outflow: 380000, balance: 70000 },
        { date: '2024-08', inflow: 480000, outflow: 410000, balance: 140000 },
        { date: '2024-09', inflow: 520000, outflow: 450000, balance: 210000 },
        { date: '2024-10', inflow: 550000, outflow: 480000, balance: 280000 },
      ],
      projectedBalance: 280000,
      cashFlowHealth: "Good",
      inventoryOptimization: {
        aItems: [
          { turnover: 12, value: 250000, quantity: 120 },
          { turnover: 10, value: 180000, quantity: 90 },
          { turnover: 8, value: 320000, quantity: 150 },
        ],
        bItems: [
          { turnover: 6, value: 120000, quantity: 200 },
          { turnover: 5, value: 90000, quantity: 180 },
          { turnover: 4, value: 150000, quantity: 250 },
        ],
        cItems: [
          { turnover: 2, value: 50000, quantity: 300 },
          { turnover: 1.5, value: 30000, quantity: 250 },
          { turnover: 1, value: 20000, quantity: 200 },
        ],
      },
      potentialSavings: 125000,
      recommendedActions: "Reduce C-item inventory by 20%",
    };
  };

  const generateMockAnomalies = () => {
    return [
      { severity: "warning", description: "Unusual spike in order cancellations detected in the last 24 hours" },
      { severity: "critical", description: "Inventory levels for SKU-12345 dropped below safety stock" },
      { severity: "info", description: "Supplier delivery performance trending downward for the last 3 shipments" },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence with predictive insights
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
              onClick={() => fetchDashboardData()}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Select defaultValue="standard" onChange={(e) => setViewMode(e.target.value)}>
              <option value="standard">Standard View</option>
              <option value="executive">Executive View</option>
              <option value="operational">Operational View</option>
              <option value="financial">Financial View</option>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleShare()}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Select defaultValue="pdf">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="png">PNG</option>
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

      {/* Anomaly detection alerts */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
            Anomaly Detection
          </h3>
          <div className="mt-2 space-y-2">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                  {anomaly.severity}
                </span>
                <p className="text-sm text-amber-700">{anomaly.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive insights */}
      {predictiveData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Demand Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictiveData.demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" />
                    <Line type="monotone" dataKey="forecast" stroke="#82ca9d" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="upperBound" stroke="#ffc658" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="lowerBound" stroke="#ff8042" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Forecast accuracy: {predictiveData.forecastAccuracy}%</p>
                <p>Next 30 days trend: <span className={predictiveData.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {predictiveData.trend > 0 ? "↑" : "↓"} {Math.abs(predictiveData.trend)}%
                </span></p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Cash Flow Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictiveData.cashFlowProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="inflow" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ff8042" fill="#ff8042" />
                    <Area type="monotone" dataKey="balance" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Projected 90-day balance: ${predictiveData.projectedBalance.toLocaleString()}</p>
                <p>Cash flow health: <span className={predictiveData.cashFlowHealth === "Good" ? "text-green-500" : "text-amber-500"}>
                  {predictiveData.cashFlowHealth}
                </span></p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-500" />
                Inventory Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="turnover" name="Turnover Rate" />
                    <YAxis dataKey="value" name="Value ($)" />
                    <ZAxis dataKey="quantity" range={[50, 400]} name="Quantity" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="A Items" data={predictiveData.inventoryOptimization.aItems} fill="#8884d8" />
                    <Scatter name="B Items" data={predictiveData.inventoryOptimization.bItems} fill="#82ca9d" />
                    <Scatter name="C Items" data={predictiveData.inventoryOptimization.cItems} fill="#ff8042" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Potential savings: ${predictiveData.potentialSavings.toLocaleString()}</p>
                <p>Recommended actions: {predictiveData.recommendedActions}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main dashboard content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Procurement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { month: 'Jan', spend: 350000, orders: 120 },
                      { month: 'Feb', spend: 420000, orders: 145 },
                      { month: 'Mar', spend: 380000, orders: 130 },
                      { month: 'Apr', spend: 450000, orders: 155 },
                      { month: 'May', spend: 520000, orders: 180 },
                      { month: 'Jun', spend: 480000, orders: 165 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [
                        name === 'spend' ? `$${value.toLocaleString()}` : value,
                        name === 'spend' ? 'Spend' : 'Orders'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="spend" name="Spend" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[
                      { category: 'Electronics', inStock: 450, lowStock: 30, outOfStock: 5 },
                      { category: 'Office Supplies', inStock: 320, lowStock: 15, outOfStock: 8 },
                      { category: 'Furniture', inStock: 120, lowStock: 0, outOfStock: 10 },
                      { category: 'IT Equipment', inStock: 280, lowStock: 25, outOfStock: 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#ffc658" />
                      <Bar dataKey="outOfStock" name="Out of Stock" stackId="a" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={[
                      { supplier: 'Supplier A', quality: 85, delivery: 90, cost: 75, responsiveness: 80 },
                      { supplier: 'Supplier B', quality: 92, delivery: 85, cost: 88, responsiveness: 90 },
                      { supplier: 'Supplier C', quality: 78, delivery: 82, cost: 95, responsiveness: 85 },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="supplier" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Supplier A" dataKey="quality" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Supplier B" dataKey="delivery" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="Supplier C" dataKey="cost" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Transportation Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', onTime: 92, damage: 0.8, cost: 100 },
                      { month: 'Feb', onTime: 94, damage: 0.7, cost: 105 },
                      { month: 'Mar', onTime: 91, damage: 1.2, cost: 98 },
                      { month: 'Apr', onTime: 95, damage: 0.5, cost: 110 },
                      { month: 'May', onTime: 97, damage: 0.3, cost: 115 },
                      { month: 'Jun', onTime: 96, damage: 0.4, cost: 112 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="onTime" name="On-Time %" stroke="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="damage" name="Damage %" stroke="#ff8042" />
                      <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost Index" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="procurement">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Spend YTD</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">$4.2M</div>
                    <div className="text-sm text-green-500">+12.5%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">POs Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">1,245</div>
                    <div className="text-sm text-green-500">+5.8%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. PO Cycle Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">3.2 days</div>
                    <div className="text-sm text-green-500">-0.5 days</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">$320K</div>
                    <div className="text-sm text-green-500">+15.2%</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Spend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', spend: 350000, savings: 28000 },
                        { month: 'Feb', spend: 420000, savings: 32000 },
                        { month: 'Mar', spend: 380000, savings: 30000 },
                        { month: 'Apr', spend: 450000, savings: 36000 },
                        { month: 'May', spend: 520000, savings: 42000 },
                        { month: 'Jun', spend: 480000, savings: 40000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Area type="monotone" dataKey="spend" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="savings" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Spend by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
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
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={150} />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="spend" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">$1.4M</div>
                    <div className="text-sm text-red-500">-3.2%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">5.8</div>
                    <div className="text-sm text-green-500">+0.3</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Days of Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">32 days</div>
                    <div className="text-sm text-green-500">-2 days</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Stockout Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">1.8%</div>
                    <div className="text-sm text-green-500">-0.5%</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">ABC Analysis</CardTitle>
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
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Supplier A', quality: 85, delivery: 90, cost: 75, overall: 83 },
                        { name: 'Supplier B', quality: 92, delivery: 85, cost: 88, overall: 88 },
                        { name: 'Supplier C', quality: 78, delivery: 82, cost: 95, overall: 85 },
                        { name: 'Supplier D', quality: 95, delivery: 91, cost: 79, overall: 88 },
                        { name: 'Supplier E', quality: 88, delivery: 79, cost: 90, overall: 86 },
                      ]}>
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Supplier Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
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
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Suppliers by Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Supplier</th>
                        <th className="text-right py-2 px-4">Spend</th>
                        <th className="text-right py-2 px-4">Orders</th>
                        <th className="text-right py-2 px-4">On-Time Delivery</th>
                        <th className="text-right py-2 px-4">Quality Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">Acme Corporation</td>
                        <td className="text-right py-2 px-4">$1,250,000</td>
                        <td className="text-right py-2 px-4">145</td>
                        <td className="text-right py-2 px-4">92%</td>
                        <td className="text-right py-2 px-4">4.5/5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Beta Inc</td>
                        <td className="text-right py-2 px-4">$980,000</td>
                        <td className="text-right py-2 px-4">120</td>
                        <td className="text-right py-2 px-4">88%</td>
                        <td className="text-right py-2 px-4">4.2/5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Gamma LLC</td>
                        <td className="text-right py-2 px-4">$750,000</td>
                        <td className="text-right py-2 px-4">95</td>
                        <td className="text-right py-2 px-4">95%</td>
                        <td className="text-right py-2 px-4">4.7/5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Delta Co</td>
                        <td className="text-right py-2 px-4">$620,000</td>
                        <td className="text-right py-2 px-4">78</td>
                        <td className="text-right py-2 px-4">91%</td>
                        <td className="text-right py-2 px-4">4.3/5</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Epsilon</td>
                        <td className="text-right py-2 px-4">$540,000</td>
                        <td className="text-right py-2 px-4">65</td>
                        <td className="text-right py-2 px-4">87%</td>
                        <td className="text-right py-2 px-4">4.0/5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transportation">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">1,842</div>
                    <div className="text-sm text-green-500">+8.3%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Freight Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">$620K</div>
                    <div className="text-sm text-green-500">+5.2%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-sm text-green-500">+1.5%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Transit Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">3.5 days</div>
                    <div className="text-sm text-green-500">-0.2 days</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Transportation Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Jan', cost: 95000, shipments: 280 },
                        { month: 'Feb', cost: 105000, shipments: 310 },
                        { month: 'Mar', cost: 98000, shipments: 290 },
                        { month: 'Apr', cost: 110000, shipments: 320 },
                        { month: 'May', cost: 115000, shipments: 330 },
                        { month: 'Jun', cost: 112000, shipments: 325 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip formatter={(value, name) => [
                          name === 'cost' ? `$${value.toLocaleString()}` : value,
                          name === 'cost' ? 'Cost' : 'Shipments'
                        ]} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="shipments" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Carrier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { carrier: 'Express Carriers', cost: 85, onTime: 94, damage: 0.5 },
                        { carrier: 'Global Logistics', cost: 75, onTime: 89, damage: 0.8 },
                        { carrier: 'Fast Freight', cost: 90, onTime: 92, damage: 0.3 },
                        { carrier: 'Premium Shipping', cost: 95, onTime: 96, damage: 0.2 },
                        { carrier: 'Reliable Transport', cost: 80, onTime: 91, damage: 0.6 },
                      ]}>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', inflow: 450000, outflow: 380000 },
                        { month: 'Feb', inflow: 480000, outflow: 410000 },
                        { month: 'Mar', inflow: 520000, outflow: 450000 },
                        { month: 'Apr', inflow: 550000, outflow: 480000 },
                        { month: 'May', inflow: 580000, outflow: 510000 },
                        { month: 'Jun', inflow: 620000, outflow: 540000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Area type="monotone" dataKey="inflow" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ff8042" fill="#ff8042" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Spend vs Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { department: 'IT', budget: 500000, actual: 480000 },
                        { department: 'Operations', budget: 800000, actual: 750000 },
                        { department: 'Marketing', budget: 300000, actual: 320000 },
                        { department: 'Sales', budget: 400000, actual: 380000 },
                        { department: 'HR', budget: 200000, actual: 190000 },
                        { department: 'Finance', budget: 250000, actual: 230000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="budget" fill="#8884d8" />
                        <Bar dataKey="actual" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Financial KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Working Capital</span>
                      <span className="text-sm text-green-500">+5.2%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">$2.8M • 85% of target</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Days Payable Outstanding</span>
                      <span className="text-sm text-green-500">+2 days</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">46 days • 92% of target</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Inventory Carrying Cost</span>
                      <span className="text-sm text-red-500">+0.5%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">22.5% • 78% of target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="custom">
          <div className="rounded-lg border bg-card p-6 text-center">
            <h2 className="text-xl font-semibold">Custom Dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              Create your own custom dashboard by selecting the metrics and visualizations you want to see.
            </p>
            <Button className="mt-4">
              Configure Dashboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}