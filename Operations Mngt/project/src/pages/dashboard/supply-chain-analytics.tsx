import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Package, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  BarChart2, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

// Mock data for the dashboard
const inventoryTurnoverData = [
  { month: 'Jan', turnover: 4.2 },
  { month: 'Feb', turnover: 4.5 },
  { month: 'Mar', turnover: 4.1 },
  { month: 'Apr', turnover: 4.7 },
  { month: 'May', turnover: 5.0 },
  { month: 'Jun', turnover: 4.8 },
  { month: 'Jul', turnover: 5.2 },
  { month: 'Aug', turnover: 5.5 },
  { month: 'Sep', turnover: 5.3 },
  { month: 'Oct', turnover: 5.7 },
  { month: 'Nov', turnover: 5.9 },
  { month: 'Dec', turnover: 6.1 },
];

const forecastAccuracyData = [
  { month: 'Jan', actual: 1200, forecast: 1250, accuracy: 96 },
  { month: 'Feb', actual: 1350, forecast: 1300, accuracy: 96.3 },
  { month: 'Mar', actual: 1100, forecast: 1200, accuracy: 91.7 },
  { month: 'Apr', actual: 1450, forecast: 1400, accuracy: 96.6 },
  { month: 'May', actual: 1500, forecast: 1550, accuracy: 96.8 },
  { month: 'Jun', actual: 1650, forecast: 1600, accuracy: 96.9 },
  { month: 'Jul', actual: 1800, forecast: 1750, accuracy: 97.2 },
  { month: 'Aug', actual: 1700, forecast: 1650, accuracy: 97.1 },
  { month: 'Sep', actual: 1550, forecast: 1600, accuracy: 96.9 },
  { month: 'Oct', actual: 1650, forecast: 1700, accuracy: 97.1 },
  { month: 'Nov', actual: 1800, forecast: 1750, accuracy: 97.2 },
  { month: 'Dec', actual: 1900, forecast: 1850, accuracy: 97.4 },
];

const supplierPerformanceData = [
  { name: 'Acme Corp', deliveryPerformance: 95, qualityScore: 92, costCompetitiveness: 88, responsiveness: 90, sustainability: 85 },
  { name: 'TechSupply Inc', deliveryPerformance: 92, qualityScore: 96, costCompetitiveness: 85, responsiveness: 88, sustainability: 90 },
  { name: 'Global Parts', deliveryPerformance: 88, qualityScore: 90, costCompetitiveness: 94, responsiveness: 85, sustainability: 82 },
  { name: 'Reliable Distributors', deliveryPerformance: 94, qualityScore: 89, costCompetitiveness: 90, responsiveness: 92, sustainability: 88 },
  { name: 'Quality Manufacturers', deliveryPerformance: 90, qualityScore: 95, costCompetitiveness: 87, responsiveness: 89, sustainability: 92 },
];

const inventoryBreakdownData = [
  { name: 'Raw Materials', value: 35, color: '#0088FE' },
  { name: 'Work in Progress', value: 25, color: '#00C49F' },
  { name: 'Finished Goods', value: 40, color: '#FFBB28' },
];

const abcAnalysisData = [
  { name: 'A Items (20%)', value: 80, color: '#FF8042' },
  { name: 'B Items (30%)', value: 15, color: '#FFBB28' },
  { name: 'C Items (50%)', value: 5, color: '#00C49F' },
];

const stockoutRiskData = [
  { name: 'Item A', category: 'Electronics', daysOfSupply: 5, reorderPoint: 10, currentStock: 8, risk: 'High' },
  { name: 'Item B', category: 'Mechanical', daysOfSupply: 15, reorderPoint: 20, currentStock: 25, risk: 'Low' },
  { name: 'Item C', category: 'Electrical', daysOfSupply: 8, reorderPoint: 15, currentStock: 12, risk: 'Medium' },
  { name: 'Item D', category: 'Packaging', daysOfSupply: 3, reorderPoint: 25, currentStock: 10, risk: 'High' },
  { name: 'Item E', category: 'Raw Materials', daysOfSupply: 20, reorderPoint: 30, currentStock: 45, risk: 'Low' },
];

const transportationPerformanceData = [
  { month: 'Jan', onTimeDelivery: 92, costPerMile: 2.15, fuelEfficiency: 6.8 },
  { month: 'Feb', onTimeDelivery: 93, costPerMile: 2.18, fuelEfficiency: 6.7 },
  { month: 'Mar', onTimeDelivery: 91, costPerMile: 2.25, fuelEfficiency: 6.5 },
  { month: 'Apr', onTimeDelivery: 94, costPerMile: 2.30, fuelEfficiency: 6.6 },
  { month: 'May', onTimeDelivery: 95, costPerMile: 2.35, fuelEfficiency: 6.4 },
  { month: 'Jun', onTimeDelivery: 96, costPerMile: 2.40, fuelEfficiency: 6.3 },
];

const warehouseUtilizationData = [
  { name: 'Warehouse A', utilization: 85, capacity: 10000, used: 8500 },
  { name: 'Warehouse B', utilization: 72, capacity: 15000, used: 10800 },
  { name: 'Warehouse C', utilization: 93, capacity: 8000, used: 7440 },
  { name: 'Warehouse D', utilization: 65, capacity: 12000, used: 7800 },
];

const costBreakdownData = [
  { name: 'Procurement', value: 35, color: '#0088FE' },
  { name: 'Transportation', value: 25, color: '#00C49F' },
  { name: 'Warehousing', value: 20, color: '#FFBB28' },
  { name: 'Inventory Holding', value: 15, color: '#FF8042' },
  { name: 'Administration', value: 5, color: '#8884d8' },
];

const leadTimeData = [
  { supplier: 'Acme Corp', category: 'Electronics', leadTime: 14, reliability: 92 },
  { supplier: 'TechSupply Inc', category: 'Components', leadTime: 21, reliability: 88 },
  { supplier: 'Global Parts', category: 'Mechanical', leadTime: 10, reliability: 95 },
  { supplier: 'Reliable Distributors', category: 'Electrical', leadTime: 7, reliability: 97 },
  { supplier: 'Quality Manufacturers', category: 'Raw Materials', leadTime: 30, reliability: 85 },
];

export function SupplyChainAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('monthly');
  const [category, setCategory] = useState('all');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your supply chain performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="mechanical">Mechanical</option>
              <option value="electrical">Electrical</option>
              <option value="raw-materials">Raw Materials</option>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Turnover</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold">5.2</p>
                  <p className="text-sm text-green-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.3%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold">94.5%</p>
                  <p className="text-sm text-green-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +2.1%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forecast Accuracy</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold">96.8%</p>
                  <p className="text-sm text-green-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +1.2%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stockout Rate</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold">1.8%</p>
                  <p className="text-sm text-red-500 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    -0.5%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Inventory Analytics Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Inventory Turnover Trend</CardTitle>
                <CardDescription>Monthly inventory turnover ratio over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryTurnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3, 7]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="turnover" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      name="Turnover Ratio"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Inventory Breakdown</CardTitle>
                <CardDescription>Current inventory by category</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-md">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inventoryBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {inventoryBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>ABC Analysis</CardTitle>
                <CardDescription>Inventory value distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={abcAnalysisData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {abcAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Stockout Risk Items</CardTitle>
                <CardDescription>Items with high stockout risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockoutRiskData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Days of Supply</p>
                          <p className="font-medium">{item.daysOfSupply} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Stock</p>
                          <p className="font-medium">{item.currentStock} units</p>
                        </div>
                        <div>
                          <Badge 
                            variant={
                              item.risk === 'High' ? 'destructive' : 
                              item.risk === 'Medium' ? 'warning' : 
                              'success'
                            }
                          >
                            {item.risk} Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Supplier Performance Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Supplier Performance Radar</CardTitle>
                <CardDescription>Key performance metrics by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart outerRadius={90} data={supplierPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Delivery Performance" dataKey="deliveryPerformance" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Quality Score" dataKey="qualityScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="Cost Competitiveness" dataKey="costCompetitiveness" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Lead Time Analysis</CardTitle>
                <CardDescription>Average lead times by supplier (days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={leadTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplier" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leadTime" fill="#8884d8" name="Lead Time (Days)" />
                    <Bar dataKey="reliability" fill="#82ca9d" name="Reliability Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Details</CardTitle>
              <CardDescription>Detailed metrics for each supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {supplierPerformanceData.map((supplier, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{supplier.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Overall: {Math.round((supplier.deliveryPerformance + supplier.qualityScore + 
                            supplier.costCompetitiveness + supplier.responsiveness + 
                            supplier.sustainability) / 5)}%
                        </Badge>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Delivery Performance</span>
                            <span className="text-sm font-medium">{supplier.deliveryPerformance}%</span>
                          </div>
                          <Progress value={supplier.deliveryPerformance} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Quality Score</span>
                            <span className="text-sm font-medium">{supplier.qualityScore}%</span>
                          </div>
                          <Progress value={supplier.qualityScore} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Cost Competitiveness</span>
                            <span className="text-sm font-medium">{supplier.costCompetitiveness}%</span>
                          </div>
                          <Progress value={supplier.costCompetitiveness} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Responsiveness</span>
                            <span className="text-sm font-medium">{supplier.responsiveness}%</span>
                          </div>
                          <Progress value={supplier.responsiveness} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transportation Tab */}
        <TabsContent value="transportation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Warehouse Utilization</CardTitle>
                <CardDescription>Current space utilization by warehouse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseUtilizationData.map((warehouse, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{warehouse.name}</span>
                        <span className="text-sm">{warehouse.utilization}%</span>
                      </div>
                      <Progress value={warehouse.utilization} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()} sq ft
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Transportation Performance</CardTitle>
                <CardDescription>Key transportation metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transportationPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="onTimeDelivery" 
                      stroke="#8884d8" 
                      name="On-Time Delivery (%)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="costPerMile" 
                      stroke="#82ca9d" 
                      name="Cost Per Mile ($)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="fuelEfficiency" 
                      stroke="#ffc658" 
                      name="Fuel Efficiency (mpg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Route Optimization Impact</CardTitle>
              <CardDescription>Benefits from optimized routing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold">12.5%</h3>
                  <p className="text-sm text-muted-foreground text-center">Cost Reduction</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold">18.3%</h3>
                  <p className="text-sm text-muted-foreground text-center">Transit Time Improvement</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <Truck className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold">9.7%</h3>
                  <p className="text-sm text-muted-foreground text-center">Carbon Footprint Reduction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Supply Chain Cost Breakdown</CardTitle>
                <CardDescription>Distribution of supply chain costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Actual vs. forecast comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill="#8884d8" name="Actual Demand" />
                    <Bar dataKey="forecast" fill="#82ca9d" name="Forecasted Demand" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Saving Opportunities</CardTitle>
              <CardDescription>Identified areas for potential cost reduction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-medium">Inventory Optimization</h3>
                    </div>
                    <Badge variant="outline">High Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reducing excess inventory could save approximately $245,000 annually.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Implementation Difficulty:</span>
                      <div className="flex">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-medium">Transportation Consolidation</h3>
                    </div>
                    <Badge variant="outline">Medium Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Consolidating shipments could reduce transportation costs by 15-20%.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Implementation Difficulty:</span>
                      <div className="flex">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-medium">Supplier Contract Renegotiation</h3>
                    </div>
                    <Badge variant="outline">High Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Renegotiating top 5 supplier contracts could yield $180,000 in annual savings.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Implementation Difficulty:</span>
                      <div className="flex">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}