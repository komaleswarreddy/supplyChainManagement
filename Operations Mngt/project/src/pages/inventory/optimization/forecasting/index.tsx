import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Area,
  ComposedChart
} from 'recharts';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Copy,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  RefreshCw,
  Zap,
  Clock,
  Package,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Forecasting Model Types
interface ForecastingModel {
  id: string;
  name: string;
  type: 'moving_average' | 'exponential_smoothing' | 'linear_regression' | 'neural_network' | 'arima' | 'prophet';
  description: string;
  accuracy: number;
  mape: number;
  rmse: number;
  status: 'active' | 'training' | 'error' | 'inactive';
  lastTrained: string;
  nextTraining: string;
  parameters: any;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

// Demand Forecast Data
interface DemandForecast {
  id: string;
  productId: string;
  productName: string;
  category: string;
  modelId: string;
  forecastPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  confidenceLevel: number;
  data: {
    date: string;
    actual?: number;
    forecast: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }[];
  metrics: {
    mape: number;
    rmse: number;
    mae: number;
    bias: number;
  };
  factors: {
    seasonality: number;
    trend: number;
    cyclical: number;
    random: number;
  };
}

// Sample data
const forecastingModels: ForecastingModel[] = [
  {
    id: '1',
    name: 'Neural Network - Product A',
    type: 'neural_network',
    description: 'Deep learning model for Product A demand forecasting',
    accuracy: 94.2,
    mape: 5.8,
    rmse: 12.3,
    status: 'active',
    lastTrained: '2024-01-15T10:30:00Z',
    nextTraining: '2024-01-22T10:30:00Z',
    parameters: {
      layers: [64, 32, 16],
      epochs: 100,
      learningRate: 0.001,
      batchSize: 32
    },
    performance: {
      precision: 0.92,
      recall: 0.89,
      f1Score: 0.90
    }
  },
  {
    id: '2',
    name: 'ARIMA - Seasonal Products',
    type: 'arima',
    description: 'ARIMA model for seasonal product demand',
    accuracy: 87.5,
    mape: 12.5,
    rmse: 18.7,
    status: 'active',
    lastTrained: '2024-01-14T14:20:00Z',
    nextTraining: '2024-01-21T14:20:00Z',
    parameters: {
      p: 1,
      d: 1,
      q: 1,
      seasonal: true
    },
    performance: {
      precision: 0.85,
      recall: 0.82,
      f1Score: 0.83
    }
  },
  {
    id: '3',
    name: 'Exponential Smoothing - Fast Moving',
    type: 'exponential_smoothing',
    description: 'Holt-Winters model for fast-moving items',
    accuracy: 91.8,
    mape: 8.2,
    rmse: 15.1,
    status: 'training',
    lastTrained: '2024-01-13T09:15:00Z',
    nextTraining: '2024-01-20T09:15:00Z',
    parameters: {
      alpha: 0.3,
      beta: 0.1,
      gamma: 0.2
    },
    performance: {
      precision: 0.89,
      recall: 0.87,
      f1Score: 0.88
    }
  }
];

const demandForecasts: DemandForecast[] = [
  {
    id: '1',
    productId: 'P001',
    productName: 'Product A',
    category: 'Electronics',
    modelId: '1',
    forecastPeriod: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    confidenceLevel: 0.95,
    data: [
      { date: '2024-01', actual: 1200, forecast: 1180, lowerBound: 1120, upperBound: 1240, confidence: 0.92 },
      { date: '2024-02', actual: 1350, forecast: 1320, lowerBound: 1250, upperBound: 1390, confidence: 0.94 },
      { date: '2024-03', actual: 1100, forecast: 1150, lowerBound: 1090, upperBound: 1210, confidence: 0.89 },
      { date: '2024-04', actual: 1400, forecast: 1380, lowerBound: 1310, upperBound: 1450, confidence: 0.91 },
      { date: '2024-05', actual: 1600, forecast: 1550, lowerBound: 1470, upperBound: 1630, confidence: 0.93 },
      { date: '2024-06', actual: 1800, forecast: 1750, lowerBound: 1660, upperBound: 1840, confidence: 0.90 },
      { date: '2024-07', forecast: 1950, lowerBound: 1850, upperBound: 2050, confidence: 0.88 },
      { date: '2024-08', forecast: 2150, lowerBound: 2040, upperBound: 2260, confidence: 0.87 },
      { date: '2024-09', forecast: 2350, lowerBound: 2230, upperBound: 2470, confidence: 0.86 },
      { date: '2024-10', forecast: 2550, lowerBound: 2420, upperBound: 2680, confidence: 0.85 },
      { date: '2024-11', forecast: 2750, lowerBound: 2610, upperBound: 2890, confidence: 0.84 },
      { date: '2024-12', forecast: 2950, lowerBound: 2800, upperBound: 3100, confidence: 0.83 }
    ],
    metrics: {
      mape: 5.8,
      rmse: 12.3,
      mae: 9.7,
      bias: -2.1
    },
    factors: {
      seasonality: 0.15,
      trend: 0.08,
      cyclical: 0.03,
      random: 0.02
    }
  }
];

// Model Performance Card Component
const ModelPerformanceCard = ({ model }: { model: ForecastingModel }) => {
  const getStatusColor = () => {
    switch (model.status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (model.status) {
      case 'active': return 'Active';
      case 'training': return 'Training';
      case 'error': return 'Error';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-xs text-muted-foreground">{getStatusText()}</span>
          </div>
        </div>
        <CardDescription className="text-xs">{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Accuracy</p>
            <p className="text-sm font-medium">{model.accuracy}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">MAPE</p>
            <p className="text-sm font-medium">{model.mape}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Precision</span>
            <span>{(model.performance.precision * 100).toFixed(1)}%</span>
          </div>
          <Progress value={model.performance.precision * 100} className="h-1" />
          
          <div className="flex justify-between text-xs">
            <span>Recall</span>
            <span>{(model.performance.recall * 100).toFixed(1)}%</span>
          </div>
          <Progress value={model.performance.recall * 100} className="h-1" />
          
          <div className="flex justify-between text-xs">
            <span>F1 Score</span>
            <span>{(model.performance.f1Score * 100).toFixed(1)}%</span>
          </div>
          <Progress value={model.performance.f1Score * 100} className="h-1" />
        </div>
        
        <div className="text-xs text-gray-500">
          Last trained: {new Date(model.lastTrained).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Forecast Chart Component
const ForecastChart = ({ forecast }: { forecast: DemandForecast }) => {
  const historicalData = forecast.data.filter(d => d.actual !== undefined);
  const forecastData = forecast.data.filter(d => d.actual === undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Forecast - {forecast.productName}</CardTitle>
        <CardDescription>
          Historical data vs forecast with confidence intervals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={forecast.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Units']} />
            <Legend />
            
            {/* Historical Data */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            
            {/* Forecast */}
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#82ca9d" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
              name="Forecast"
            />
            
            {/* Confidence Interval */}
            <Area 
              dataKey="upperBound" 
              stackId="confidence" 
              stroke="none" 
              fill="#82ca9d" 
              fillOpacity={0.1}
              name="Upper Bound"
            />
            <Area 
              dataKey="lowerBound" 
              stackId="confidence" 
              stroke="none" 
              fill="#82ca9d" 
              fillOpacity={0.1}
              name="Lower Bound"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Model Configuration Form
const ModelConfigurationForm = ({ 
  model, 
  onSave, 
  onCancel 
}: { 
  model?: Partial<ForecastingModel>; 
  onSave: (data: Partial<ForecastingModel>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    description: model?.description || '',
    type: model?.type || 'neural_network',
    parameters: model?.parameters || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Model Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter model name"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Model Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moving_average">Moving Average</SelectItem>
              <SelectItem value="exponential_smoothing">Exponential Smoothing</SelectItem>
              <SelectItem value="linear_regression">Linear Regression</SelectItem>
              <SelectItem value="neural_network">Neural Network</SelectItem>
              <SelectItem value="arima">ARIMA</SelectItem>
              <SelectItem value="prophet">Prophet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the model and its purpose"
          rows={3}
        />
      </div>

      <div>
        <Label>Model Parameters</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {formData.type === 'neural_network' && (
            <>
              <div>
                <Label htmlFor="layers">Layers</Label>
                <Input
                  id="layers"
                  value={formData.parameters.layers?.join(',') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, layers: e.target.value.split(',').map(Number) }
                  })}
                  placeholder="64,32,16"
                />
              </div>
              <div>
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={formData.parameters.epochs || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, epochs: parseInt(e.target.value) }
                  })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="learningRate">Learning Rate</Label>
                <Input
                  id="learningRate"
                  type="number"
                  step="0.001"
                  value={formData.parameters.learningRate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, learningRate: parseFloat(e.target.value) }
                  })}
                  placeholder="0.001"
                />
              </div>
            </>
          )}
          
          {formData.type === 'arima' && (
            <>
              <div>
                <Label htmlFor="p">P (AR)</Label>
                <Input
                  id="p"
                  type="number"
                  value={formData.parameters.p || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, p: parseInt(e.target.value) }
                  })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="d">D (Differencing)</Label>
                <Input
                  id="d"
                  type="number"
                  value={formData.parameters.d || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, d: parseInt(e.target.value) }
                  })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="q">Q (MA)</Label>
                <Input
                  id="q"
                  type="number"
                  value={formData.parameters.q || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, q: parseInt(e.target.value) }
                  })}
                  placeholder="1"
                />
              </div>
            </>
          )}
          
          {formData.type === 'exponential_smoothing' && (
            <>
              <div>
                <Label htmlFor="alpha">Alpha</Label>
                <Input
                  id="alpha"
                  type="number"
                  step="0.1"
                  value={formData.parameters.alpha || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, alpha: parseFloat(e.target.value) }
                  })}
                  placeholder="0.3"
                />
              </div>
              <div>
                <Label htmlFor="beta">Beta</Label>
                <Input
                  id="beta"
                  type="number"
                  step="0.1"
                  value={formData.parameters.beta || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, beta: parseFloat(e.target.value) }
                  })}
                  placeholder="0.1"
                />
              </div>
              <div>
                <Label htmlFor="gamma">Gamma</Label>
                <Input
                  id="gamma"
                  type="number"
                  step="0.1"
                  value={formData.parameters.gamma || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, gamma: parseFloat(e.target.value) }
                  })}
                  placeholder="0.2"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {model ? 'Update' : 'Create'} Model
        </Button>
      </div>
    </form>
  );
};

export default function InventoryForecasting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModelType, setSelectedModelType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<DemandForecast | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();

  const filteredModels = forecastingModels.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedModelType || model.type === selectedModelType;
    const matchesStatus = !selectedStatus || model.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateModel = (data: Partial<ForecastingModel>) => {
    // Create model logic here
    toast.success('Forecasting model created successfully');
    setShowCreateDialog(false);
  };

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(true);
    toast.info('Training model...');
    
    // Simulate training process
    setTimeout(() => {
      setIsTraining(false);
      toast.success('Model training completed successfully');
    }, 3000);
  };

  const handleGenerateForecast = async (modelId: string) => {
    toast.info('Generating forecast...');
    
    // Simulate forecast generation
    setTimeout(() => {
      toast.success('Forecast generated successfully');
    }, 2000);
  };

  const totalModels = forecastingModels.length;
  const activeModels = forecastingModels.filter(m => m.status === 'active').length;
  const avgAccuracy = forecastingModels.reduce((sum, m) => sum + m.accuracy, 0) / totalModels;
  const avgMape = forecastingModels.reduce((sum, m) => sum + m.mape, 0) / totalModels;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Forecasting</h1>
          <p className="text-muted-foreground">
            Advanced demand forecasting with machine learning and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Forecasting Model</DialogTitle>
                <DialogDescription>
                  Configure a new machine learning model for demand forecasting
                </DialogDescription>
              </DialogHeader>
              <ModelConfigurationForm
                onSave={handleCreateModel}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {activeModels} active models
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average MAPE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMape.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Mean absolute percentage error
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Forecasts Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandForecasts.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Model Type</Label>
                  <Select value={selectedModelType} onValueChange={setSelectedModelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="moving_average">Moving Average</SelectItem>
                      <SelectItem value="exponential_smoothing">Exponential Smoothing</SelectItem>
                      <SelectItem value="linear_regression">Linear Regression</SelectItem>
                      <SelectItem value="neural_network">Neural Network</SelectItem>
                      <SelectItem value="arima">ARIMA</SelectItem>
                      <SelectItem value="prophet">Prophet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelPerformanceCard key={model.id} model={model} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {demandForecasts.map((forecast) => (
              <div key={forecast.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{forecast.productName}</h3>
                    <p className="text-sm text-gray-500">{forecast.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateForecast(forecast.modelId)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedForecast(forecast)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{forecast.metrics.mape.toFixed(1)}%</div>
                      <p className="text-xs text-gray-500">MAPE</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{forecast.metrics.rmse.toFixed(1)}</div>
                      <p className="text-xs text-gray-500">RMSE</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{(forecast.confidenceLevel * 100).toFixed(0)}%</div>
                      <p className="text-xs text-gray-500">Confidence Level</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{forecast.factors.seasonality.toFixed(2)}</div>
                      <p className="text-xs text-gray-500">Seasonality</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastingModels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                    <Bar dataKey="mape" fill="#82ca9d" name="MAPE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Model Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Neural Network', value: forecastingModels.filter(m => m.type === 'neural_network').length },
                        { name: 'ARIMA', value: forecastingModels.filter(m => m.type === 'arima').length },
                        { name: 'Exponential Smoothing', value: forecastingModels.filter(m => m.type === 'exponential_smoothing').length },
                        { name: 'Linear Regression', value: forecastingModels.filter(m => m.type === 'linear_regression').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Forecast Detail Dialog */}
      {selectedForecast && (
        <Dialog open={!!selectedForecast} onOpenChange={() => setSelectedForecast(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Forecast Details - {selectedForecast.productName}</DialogTitle>
              <DialogDescription>
                Detailed forecast analysis and visualization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <ForecastChart forecast={selectedForecast} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>MAPE</span>
                        <span>{selectedForecast.metrics.mape.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RMSE</span>
                        <span>{selectedForecast.metrics.rmse.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MAE</span>
                        <span>{selectedForecast.metrics.mae.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bias</span>
                        <span>{selectedForecast.metrics.bias.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Decomposition Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Seasonality</span>
                        <span>{(selectedForecast.factors.seasonality * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend</span>
                        <span>{(selectedForecast.factors.trend * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cyclical</span>
                        <span>{(selectedForecast.factors.cyclical * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Random</span>
                        <span>{(selectedForecast.factors.random * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 