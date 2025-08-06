import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter,
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
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Truck,
  Users,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// AI Model Status Component
const ModelStatus = ({ 
  name, 
  status, 
  accuracy, 
  lastUpdated 
}: { 
  name: string; 
  status: 'active' | 'training' | 'error' | 'inactive'; 
  accuracy: number; 
  lastUpdated: string;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'training': return 'Training';
      case 'error': return 'Error';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-xs text-muted-foreground">{getStatusText()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Accuracy</span>
          <span className="text-sm font-medium">{accuracy}%</span>
        </div>
        <Progress value={accuracy} className="h-2" />
        <p className="text-xs text-muted-foreground">Updated: {lastUpdated}</p>
      </CardContent>
    </Card>
  );
};

// Prediction Card Component
const PredictionCard = ({ 
  title, 
  value, 
  confidence, 
  trend, 
  icon 
}: { 
  title: string; 
  value: string; 
  confidence: number; 
  trend: 'up' | 'down' | 'stable'; 
  icon: React.ReactNode;
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      case 'stable': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingUp className="h-4 w-4 rotate-180" />;
      case 'stable': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">{confidence}% confidence</span>
              </div>
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

// Anomaly Detection Component
const AnomalyItem = ({ 
  type, 
  severity, 
  description, 
  timestamp, 
  impact 
}: { 
  type: string; 
  severity: 'low' | 'medium' | 'high' | 'critical'; 
  description: string; 
  timestamp: string; 
  impact: string;
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 ${getSeverityColor()}`}>
      {getSeverityIcon()}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{type}</span>
          <Badge variant="outline" className="text-xs">
            {severity.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm mb-1">{description}</p>
        <div className="flex items-center justify-between text-xs">
          <span>{timestamp}</span>
          <span className="font-medium">Impact: {impact}</span>
        </div>
      </div>
    </div>
  );
};

export default function PredictiveAnalytics() {
  const [selectedModel, setSelectedModel] = useState('demand-forecast');
  const [predictionHorizon, setPredictionHorizon] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();

  // Sample data for charts
  const demandForecastData = [
    { date: '2024-01', actual: 1200, predicted: 1180, confidence: 0.85 },
    { date: '2024-02', actual: 1350, predicted: 1320, confidence: 0.88 },
    { date: '2024-03', actual: 1100, predicted: 1150, confidence: 0.82 },
    { date: '2024-04', actual: 1400, predicted: 1380, confidence: 0.90 },
    { date: '2024-05', actual: 1600, predicted: 1550, confidence: 0.87 },
    { date: '2024-06', actual: 1800, predicted: 1750, confidence: 0.85 },
    { date: '2024-07', actual: 2000, predicted: 1950, confidence: 0.83 },
    { date: '2024-08', actual: 2200, predicted: 2150, confidence: 0.80 },
  ];

  const pricePredictionData = [
    { date: '2024-01', price: 45.2, predicted: 44.8, volatility: 0.12 },
    { date: '2024-02', price: 47.8, predicted: 47.2, volatility: 0.15 },
    { date: '2024-03', price: 43.5, predicted: 44.1, volatility: 0.18 },
    { date: '2024-04', price: 49.2, predicted: 48.7, volatility: 0.14 },
    { date: '2024-05', price: 52.1, predicted: 51.5, volatility: 0.16 },
    { date: '2024-06', price: 48.9, predicted: 49.3, volatility: 0.13 },
    { date: '2024-07', price: 55.3, predicted: 54.8, volatility: 0.17 },
    { date: '2024-08', price: 58.7, predicted: 58.1, volatility: 0.19 },
  ];

  const riskAssessmentData = [
    { supplier: 'Supplier A', financialRisk: 0.15, operationalRisk: 0.22, geopoliticalRisk: 0.08, totalRisk: 0.45 },
    { supplier: 'Supplier B', financialRisk: 0.08, operationalRisk: 0.12, geopoliticalRisk: 0.25, totalRisk: 0.45 },
    { supplier: 'Supplier C', financialRisk: 0.25, operationalRisk: 0.18, geopoliticalRisk: 0.05, totalRisk: 0.48 },
    { supplier: 'Supplier D', financialRisk: 0.12, operationalRisk: 0.15, geopoliticalRisk: 0.30, totalRisk: 0.57 },
    { supplier: 'Supplier E', financialRisk: 0.05, operationalRisk: 0.08, geopoliticalRisk: 0.12, totalRisk: 0.25 },
  ];

  const anomalies = [
    {
      type: 'Demand Spike',
      severity: 'high' as const,
      description: 'Unusual 40% increase in demand for Product A',
      timestamp: '2 hours ago',
      impact: '$15K potential revenue'
    },
    {
      type: 'Supplier Delay',
      severity: 'medium' as const,
      description: 'Supplier B reported 3-day delivery delay',
      timestamp: '4 hours ago',
      impact: '5% stockout risk'
    },
    {
      type: 'Price Volatility',
      severity: 'low' as const,
      description: 'Raw material prices showing increased volatility',
      timestamp: '6 hours ago',
      impact: '2% cost variance'
    }
  ];

  const handleModelTraining = async () => {
    setIsTraining(true);
    toast.info("Starting model training...");
    
    // Simulate training process
    setTimeout(() => {
      setIsTraining(false);
      toast.success("Model training completed successfully");
    }, 3000);
  };

  const handleRefreshPredictions = () => {
    toast.success("Predictions refreshed successfully");
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Predictive analytics report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights for supply chain optimization and forecasting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label>Auto-refresh</Label>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshPredictions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportReport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* AI Model Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModelStatus 
          name="Demand Forecast" 
          status="active" 
          accuracy={87} 
          lastUpdated="2 hours ago" 
        />
        <ModelStatus 
          name="Price Prediction" 
          status="active" 
          accuracy={92} 
          lastUpdated="1 hour ago" 
        />
        <ModelStatus 
          name="Risk Assessment" 
          status="training" 
          accuracy={78} 
          lastUpdated="30 min ago" 
        />
        <ModelStatus 
          name="Anomaly Detection" 
          status="active" 
          accuracy={94} 
          lastUpdated="15 min ago" 
        />
      </div>

      {/* Key Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PredictionCard 
          title="Next Month Demand" 
          value="2,450 units" 
          confidence={87} 
          trend="up" 
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
        />
        <PredictionCard 
          title="Price Forecast" 
          value="$52.30" 
          confidence={92} 
          trend="stable" 
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        />
        <PredictionCard 
          title="Lead Time" 
          value="8.5 days" 
          confidence={85} 
          trend="down" 
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        />
        <PredictionCard 
          title="Stockout Risk" 
          value="3.2%" 
          confidence={91} 
          trend="down" 
          icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="forecasting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="pricing">Price Prediction</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecasting" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="model">Model:</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demand-forecast">Demand Forecast</SelectItem>
                    <SelectItem value="seasonal-forecast">Seasonal Forecast</SelectItem>
                    <SelectItem value="trend-forecast">Trend Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="horizon">Horizon:</Label>
                <Select value={predictionHorizon} onValueChange={setPredictionHorizon}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleModelTraining}
              disabled={isTraining}
              className="flex items-center gap-2"
            >
              {isTraining ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {isTraining ? 'Training...' : 'Train Model'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Demand Forecast</CardTitle>
                <CardDescription>Actual vs predicted demand with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={demandForecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Actual"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                      name="Predicted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Forecast Accuracy</CardTitle>
                <CardDescription>Model performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MAPE (Mean Absolute Percentage Error)</span>
                    <span className="text-sm font-medium">8.5%</span>
                  </div>
                  <Progress value={91.5} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RMSE (Root Mean Square Error)</span>
                    <span className="text-sm font-medium">156.2</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">R² Score</span>
                    <span className="text-sm font-medium">0.87</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Price Prediction</CardTitle>
                <CardDescription>Historical prices and future predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pricePredictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      name="Actual Price"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#82ca9d" 
                      strokeDasharray="5 5"
                      name="Predicted Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Price Volatility</CardTitle>
                <CardDescription>Price volatility trends and risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pricePredictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="volatility" fill="#ffc658" name="Volatility" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Supplier Risk Assessment</CardTitle>
                <CardDescription>Multi-dimensional risk analysis by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskAssessmentData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 1]} />
                    <YAxis dataKey="supplier" type="category" width={100} />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="financialRisk" fill="#8884d8" name="Financial Risk" />
                    <Bar dataKey="operationalRisk" fill="#82ca9d" name="Operational Risk" />
                    <Bar dataKey="geopoliticalRisk" fill="#ffc658" name="Geopolitical Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Risk Distribution</CardTitle>
                <CardDescription>Overall risk distribution across suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAssessmentData.map((supplier) => (
                    <div key={supplier.supplier} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{supplier.supplier}</span>
                        <span className="text-sm">{(supplier.totalRisk * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={supplier.totalRisk * 100} 
                        className="h-2"
                        style={{
                          backgroundColor: supplier.totalRisk > 0.5 ? '#fef2f2' : '#f0f9ff',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Detected Anomalies</CardTitle>
                <CardDescription>AI-detected anomalies and their impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map((anomaly, index) => (
                  <AnomalyItem 
                    key={index}
                    type={anomaly.type}
                    severity={anomaly.severity}
                    description={anomaly.description}
                    timestamp={anomaly.timestamp}
                    impact={anomaly.impact}
                  />
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Anomaly Trends</CardTitle>
                <CardDescription>Anomaly detection patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { date: 'Mon', anomalies: 3, severity: 0.6 },
                    { date: 'Tue', anomalies: 2, severity: 0.4 },
                    { date: 'Wed', anomalies: 5, severity: 0.8 },
                    { date: 'Thu', anomalies: 1, severity: 0.2 },
                    { date: 'Fri', anomalies: 4, severity: 0.7 },
                    { date: 'Sat', anomalies: 2, severity: 0.3 },
                    { date: 'Sun', anomalies: 3, severity: 0.5 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="anomalies" stroke="#8884d8" name="Anomalies" />
                    <Line yAxisId="right" type="monotone" dataKey="severity" stroke="#82ca9d" name="Severity" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Optimization Recommendations</CardTitle>
                <CardDescription>AI-generated optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-md border bg-green-50">
                    <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Inventory Optimization</h4>
                      <p className="text-sm text-green-700">Reduce safety stock for Product A by 15% to save $12K annually</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-md border bg-blue-50">
                    <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Route Optimization</h4>
                      <p className="text-sm text-blue-700">Consolidate shipments to reduce transportation costs by 8%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-md border bg-purple-50">
                    <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800">Supplier Diversification</h4>
                      <p className="text-sm text-purple-700">Add Supplier F to reduce dependency risk by 25%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Optimization Impact</CardTitle>
                <CardDescription>Potential savings and improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Reduction</span>
                    <span className="text-sm font-medium text-green-600">$45K/year</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficiency Improvement</span>
                    <span className="text-sm font-medium text-blue-600">12%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Reduction</span>
                    <span className="text-sm font-medium text-purple-600">18%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
