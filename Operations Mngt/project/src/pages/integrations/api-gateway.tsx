import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiGateway } from '@/lib/api-gateway';
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
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpDown, 
  Check, 
  Clock, 
  Code, 
  Download, 
  ExternalLink, 
  Filter, 
  Lock, 
  RefreshCw, 
  Save, 
  Search, 
  Settings, 
  Shield, 
  Sliders, 
  Webhook, 
  Zap
} from 'lucide-react';

// Mock data for the API Gateway dashboard
const mockEndpoints = [
  { name: '/api/v1/users', requests: 1245, errors: 23, avgResponseTime: 120, successRate: 98.2 },
  { name: '/api/v1/inventory', requests: 987, errors: 15, avgResponseTime: 85, successRate: 98.5 },
  { name: '/api/v1/procurement', requests: 756, errors: 12, avgResponseTime: 150, successRate: 98.4 },
  { name: '/api/v1/suppliers', requests: 543, errors: 8, avgResponseTime: 95, successRate: 98.5 },
  { name: '/api/v1/analytics', requests: 432, errors: 7, avgResponseTime: 210, successRate: 98.4 },
];

const mockRateLimits = [
  { endpoint: '/api/v1/users', limit: 100, remaining: 78, resetTime: '12:45:30' },
  { endpoint: '/api/v1/inventory', limit: 100, remaining: 65, resetTime: '12:42:15' },
  { endpoint: '/api/v1/procurement', limit: 100, remaining: 82, resetTime: '12:48:45' },
  { endpoint: '/api/v1/suppliers', limit: 100, remaining: 91, resetTime: '12:51:20' },
  { endpoint: '/api/v1/analytics', limit: 50, remaining: 32, resetTime: '12:40:10' },
];

const mockWebhooks = [
  { id: 'wh-1', name: 'Inventory Update', event: 'inventory.updated', url: 'https://example.com/webhook1', status: 'ACTIVE', lastTriggered: '2023-06-14T10:30:00Z', deliveryRate: 99.8 },
  { id: 'wh-2', name: 'Order Created', event: 'order.created', url: 'https://example.com/webhook2', status: 'ACTIVE', lastTriggered: '2023-06-14T09:15:00Z', deliveryRate: 100 },
  { id: 'wh-3', name: 'Supplier Update', event: 'supplier.updated', url: 'https://example.com/webhook3', status: 'INACTIVE', lastTriggered: '2023-06-13T14:45:00Z', deliveryRate: 95.5 },
];

const mockIntegrations = [
  { id: 'int-1', name: 'SAP ERP', type: 'ERP', status: 'ACTIVE', lastSync: '2023-06-14T10:00:00Z', nextSync: '2023-06-14T14:00:00Z' },
  { id: 'int-2', name: 'Salesforce', type: 'CRM', status: 'ACTIVE', lastSync: '2023-06-14T08:30:00Z', nextSync: '2023-06-14T12:30:00Z' },
  { id: 'int-3', name: 'QuickBooks', type: 'ACCOUNTING', status: 'ERROR', lastSync: '2023-06-13T22:00:00Z', nextSync: 'N/A' },
  { id: 'int-4', name: 'Shopify', type: 'ECOMMERCE', status: 'ACTIVE', lastSync: '2023-06-14T09:45:00Z', nextSync: '2023-06-14T13:45:00Z' },
];

const mockTrafficData = [
  { time: '00:00', requests: 120, errors: 2 },
  { time: '02:00', requests: 80, errors: 1 },
  { time: '04:00', requests: 60, errors: 0 },
  { time: '06:00', requests: 100, errors: 1 },
  { time: '08:00', requests: 250, errors: 3 },
  { time: '10:00', requests: 380, errors: 5 },
  { time: '12:00', requests: 420, errors: 6 },
  { time: '14:00', requests: 380, errors: 4 },
  { time: '16:00', requests: 340, errors: 3 },
  { time: '18:00', requests: 280, errors: 2 },
  { time: '20:00', requests: 220, errors: 2 },
  { time: '22:00', requests: 170, errors: 1 },
];

const mockResponseTimeData = [
  { time: '00:00', avg: 95 },
  { time: '02:00', avg: 90 },
  { time: '04:00', avg: 85 },
  { time: '06:00', avg: 95 },
  { time: '08:00', avg: 110 },
  { time: '10:00', avg: 130 },
  { time: '12:00', avg: 150 },
  { time: '14:00', avg: 140 },
  { time: '16:00', avg: 130 },
  { time: '18:00', avg: 120 },
  { time: '20:00', avg: 110 },
  { time: '22:00', avg: 100 },
];

const mockStatusCodes = [
  { name: '200 OK', value: 85 },
  { name: '201 Created', value: 5 },
  { name: '400 Bad Request', value: 4 },
  { name: '401 Unauthorized', value: 3 },
  { name: '404 Not Found', value: 2 },
  { name: '500 Server Error', value: 1 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF0000'];

export default function ApiGatewayPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  
  // Webhook form state
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    event: '',
    url: '',
    secret: '',
    description: '',
  });
  
  // Integration form state
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    provider: '',
    type: '',
    url: '',
    authType: 'API_KEY',
    apiKey: '',
    username: '',
    password: '',
  });

  // Simulate refreshing data
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Filter endpoints based on search term
  const filteredEndpoints = mockEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter webhooks based on status
  const filteredWebhooks = mockWebhooks.filter(webhook => 
    statusFilter === 'all' || webhook.status.toLowerCase() === statusFilter.toLowerCase()
  );

  // Filter integrations based on status
  const filteredIntegrations = mockIntegrations.filter(integration => 
    statusFilter === 'all' || integration.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Gateway & Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage API traffic, webhooks, and third-party integrations
          </p>
        </div>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests (24h)</p>
                    <p className="text-2xl font-bold">2,834</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↑ 12.5%</span> from yesterday
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">98.4%</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↑ 0.3%</span> from yesterday
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">118ms</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-red-500 font-medium">↑ 5.2%</span> from yesterday
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-bold">1.6%</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↓ 0.3%</span> from yesterday
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">API Traffic</CardTitle>
                <CardDescription>Requests and errors over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ff8042" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ff8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Response Time</CardTitle>
                <CardDescription>Average response time in milliseconds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockResponseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avg" fill="#8884d8" name="Avg Response Time (ms)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Endpoint</th>
                        <th className="text-right py-2 px-4">Requests</th>
                        <th className="text-right py-2 px-4">Avg Response</th>
                        <th className="text-right py-2 px-4">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEndpoints.map((endpoint, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4 font-medium">{endpoint.name}</td>
                          <td className="py-2 px-4 text-right">{endpoint.requests.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{endpoint.avgResponseTime}ms</td>
                          <td className="py-2 px-4 text-right">
                            <span className={endpoint.successRate >= 99 ? 'text-green-600' : 'text-amber-600'}>
                              {endpoint.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Status Codes</CardTitle>
                <CardDescription>Distribution of HTTP status codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockStatusCodes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockStatusCodes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-medium">API Endpoints</CardTitle>
                  <CardDescription>Manage and monitor API endpoints</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search endpoints..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Endpoint</th>
                      <th className="text-right py-3 px-4">Requests (24h)</th>
                      <th className="text-right py-3 px-4">Errors</th>
                      <th className="text-right py-3 px-4">Avg Response</th>
                      <th className="text-right py-3 px-4">Success Rate</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEndpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{endpoint.name}</td>
                        <td className="py-3 px-4 text-right">{endpoint.requests.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-red-600">{endpoint.errors}</td>
                        <td className="py-3 px-4 text-right">{endpoint.avgResponseTime}ms</td>
                        <td className="py-3 px-4 text-right">
                          <span className={endpoint.successRate >= 99 ? 'text-green-600' : 'text-amber-600'}>
                            {endpoint.successRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Rate Limits</CardTitle>
              <CardDescription>Configure and monitor API rate limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Endpoint</th>
                      <th className="text-right py-3 px-4">Limit</th>
                      <th className="text-right py-3 px-4">Remaining</th>
                      <th className="text-right py-3 px-4">Reset Time</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRateLimits.map((limit, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{limit.endpoint}</td>
                        <td className="py-3 px-4 text-right">{limit.limit}/min</td>
                        <td className="py-3 px-4 text-right">
                          <span className={limit.remaining < limit.limit * 0.2 ? 'text-red-600' : 'text-green-600'}>
                            {limit.remaining}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{limit.resetTime}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Sliders className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">API Security</CardTitle>
              <CardDescription>Configure API security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">JWT Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require JWT tokens for all API requests
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">API Key Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow API key authentication for select endpoints
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">CORS Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict cross-origin requests
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">IP Whitelisting</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict API access to specific IP addresses
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Request Validation</Label>
                      <p className="text-sm text-muted-foreground">
                        Validate request payloads against schemas
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all API requests for audit purposes
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Registered Webhooks</CardTitle>
              <CardDescription>Manage your webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Event</th>
                      <th className="text-left py-3 px-4">URL</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Last Triggered</th>
                      <th className="text-right py-3 px-4">Delivery Rate</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWebhooks.map((webhook, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{webhook.name}</td>
                        <td className="py-3 px-4">{webhook.event}</td>
                        <td className="py-3 px-4 text-sm truncate max-w-[200px]">{webhook.url}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={webhook.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {webhook.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {new Date(webhook.lastTriggered).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={webhook.deliveryRate >= 99 ? 'text-green-600' : 'text-amber-600'}>
                            {webhook.deliveryRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Create New Webhook</CardTitle>
              <CardDescription>Set up a new webhook endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Webhook Name</Label>
                    <Input 
                      id="webhook-name" 
                      placeholder="Enter webhook name" 
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-event">Event</Label>
                    <Select 
                      id="webhook-event"
                      value={newWebhook.event}
                      onChange={(e) => setNewWebhook({...newWebhook, event: e.target.value})}
                    >
                      <option value="">Select an event</option>
                      <option value="inventory.updated">Inventory Updated</option>
                      <option value="order.created">Order Created</option>
                      <option value="order.updated">Order Updated</option>
                      <option value="order.shipped">Order Shipped</option>
                      <option value="supplier.updated">Supplier Updated</option>
                      <option value="user.created">User Created</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://example.com/webhook" 
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Secret Key</Label>
                    <Input 
                      id="webhook-secret" 
                      type="password" 
                      placeholder="Enter secret key" 
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used to sign webhook payloads for verification
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-description">Description (Optional)</Label>
                    <Input 
                      id="webhook-description" 
                      placeholder="Enter description" 
                      value={newWebhook.description}
                      onChange={(e) => setNewWebhook({...newWebhook, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Webhook</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Webhook Testing</CardTitle>
              <CardDescription>Test your webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-webhook">Select Webhook</Label>
                    <Select id="test-webhook">
                      <option value="">Select a webhook</option>
                      {mockWebhooks.map((webhook, index) => (
                        <option key={index} value={webhook.id}>{webhook.name}</option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-event">Event Type</Label>
                    <Select id="test-event">
                      <option value="">Select an event</option>
                      <option value="inventory.updated">Inventory Updated</option>
                      <option value="order.created">Order Created</option>
                      <option value="order.updated">Order Updated</option>
                      <option value="order.shipped">Order Shipped</option>
                      <option value="supplier.updated">Supplier Updated</option>
                      <option value="user.created">User Created</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="test-payload">Test Payload</Label>
                    <Textarea 
                      id="test-payload" 
                      placeholder="Enter JSON payload" 
                      className="font-mono"
                      rows={8}
                      defaultValue={`{\n  "event": "inventory.updated",\n  "data": {\n    "itemId": "item-123",\n    "quantity": 50\n  },\n  "timestamp": "${new Date().toISOString()}"\n}`}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Code className="h-4 w-4 mr-2" />
                    Format JSON
                  </Button>
                  <Button>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Send Test Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="error">Error</option>
                <option value="inactive">Inactive</option>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              New Integration
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Active Integrations</CardTitle>
              <CardDescription>Manage your third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Last Sync</th>
                      <th className="text-right py-3 px-4">Next Sync</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIntegrations.map((integration, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{integration.name}</td>
                        <td className="py-3 px-4">{integration.type}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant={
                              integration.status === 'ACTIVE' ? 'success' : 
                              integration.status === 'ERROR' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {integration.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {new Date(integration.lastSync).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {integration.nextSync === 'N/A' ? 
                            'N/A' : 
                            new Date(integration.nextSync).toLocaleString()
                          }
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Add New Integration</CardTitle>
              <CardDescription>Connect to a third-party system</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration-name">Integration Name</Label>
                    <Input 
                      id="integration-name" 
                      placeholder="Enter integration name" 
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integration-provider">Provider</Label>
                    <Select 
                      id="integration-provider"
                      value={newIntegration.provider}
                      onChange={(e) => setNewIntegration({...newIntegration, provider: e.target.value})}
                    >
                      <option value="">Select a provider</option>
                      <option value="sap">SAP</option>
                      <option value="salesforce">Salesforce</option>
                      <option value="quickbooks">QuickBooks</option>
                      <option value="shopify">Shopify</option>
                      <option value="netsuite">NetSuite</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integration-type">Type</Label>
                    <Select 
                      id="integration-type"
                      value={newIntegration.type}
                      onChange={(e) => setNewIntegration({...newIntegration, type: e.target.value})}
                    >
                      <option value="">Select a type</option>
                      <option value="ERP">ERP</option>
                      <option value="CRM">CRM</option>
                      <option value="ACCOUNTING">Accounting</option>
                      <option value="ECOMMERCE">E-Commerce</option>
                      <option value="WAREHOUSE">Warehouse</option>
                      <option value="SHIPPING">Shipping</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integration-url">API URL</Label>
                    <Input 
                      id="integration-url" 
                      placeholder="https://api.example.com" 
                      value={newIntegration.url}
                      onChange={(e) => setNewIntegration({...newIntegration, url: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integration-auth-type">Authentication Type</Label>
                    <Select 
                      id="integration-auth-type"
                      value={newIntegration.authType}
                      onChange={(e) => setNewIntegration({...newIntegration, authType: e.target.value})}
                    >
                      <option value="API_KEY">API Key</option>
                      <option value="OAUTH2">OAuth 2.0</option>
                      <option value="BASIC">Basic Auth</option>
                      <option value="CUSTOM">Custom</option>
                    </Select>
                  </div>
                  
                  {newIntegration.authType === 'API_KEY' && (
                    <div className="space-y-2">
                      <Label htmlFor="integration-api-key">API Key</Label>
                      <Input 
                        id="integration-api-key" 
                        type="password" 
                        placeholder="Enter API key" 
                        value={newIntegration.apiKey}
                        onChange={(e) => setNewIntegration({...newIntegration, apiKey: e.target.value})}
                      />
                    </div>
                  )}
                  
                  {newIntegration.authType === 'BASIC' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="integration-username">Username</Label>
                        <Input 
                          id="integration-username" 
                          placeholder="Enter username" 
                          value={newIntegration.username}
                          onChange={(e) => setNewIntegration({...newIntegration, username: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="integration-password">Password</Label>
                        <Input 
                          id="integration-password" 
                          type="password" 
                          placeholder="Enter password" 
                          value={newIntegration.password}
                          onChange={(e) => setNewIntegration({...newIntegration, password: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  {newIntegration.authType === 'OAUTH2' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>OAuth 2.0 Configuration</Label>
                      <p className="text-sm text-muted-foreground">
                        OAuth 2.0 configuration will be available after selecting a provider
                      </p>
                      <Button variant="outline" className="mt-2" disabled={!newIntegration.provider}>
                        <Lock className="h-4 w-4 mr-2" />
                        Configure OAuth
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Integration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Available Integration Templates</CardTitle>
              <CardDescription>Pre-configured integration templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">SAP ERP</h3>
                      <p className="text-sm text-muted-foreground">Enterprise Resource Planning</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bi-directional integration with SAP ERP systems
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Salesforce</h3>
                      <p className="text-sm text-muted-foreground">Customer Relationship Management</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sync customers, orders, and products with Salesforce
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">QuickBooks</h3>
                      <p className="text-sm text-muted-foreground">Accounting</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sync invoices, payments, and vendors with QuickBooks
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Shopify</h3>
                      <p className="text-sm text-muted-foreground">E-Commerce</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sync products, orders, and inventory with Shopify
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">NetSuite</h3>
                      <p className="text-sm text-muted-foreground">ERP & Accounting</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive integration with NetSuite ERP
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Custom API</h3>
                      <p className="text-sm text-muted-foreground">Custom Integration</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a custom API integration from scratch
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}