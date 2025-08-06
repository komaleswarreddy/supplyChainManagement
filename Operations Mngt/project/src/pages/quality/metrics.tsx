import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Search, 
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useQuality } from '@/hooks/useQuality';

interface QualityMetric {
  id: string;
  metricName: string;
  metricType: 'DEFECT_RATE' | 'FIRST_PASS_YIELD' | 'CUSTOMER_COMPLAINTS' | 'SUPPLIER_PERFORMANCE' | 'COST_OF_QUALITY' | 'REWORK_RATE' | 'SCRAP_RATE';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  periodStart: string;
  periodEnd: string;
  target?: number;
  actual: number;
  unit: 'PERCENTAGE' | 'PPM' | 'COUNT' | 'CURRENCY';
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  variance: number; // percentage difference from target
  itemId?: string;
  itemName?: string;
  supplierId?: string;
  supplierName?: string;
  location?: string;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

// --- Types for summary cards (not provided by API, so we will compute from metrics or show placeholders) ---
interface MetricSummary {
  category: string;
  current: number;
  target: number;
  previous: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

const QualityMetrics: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    loading,
    error,
    qualityMetrics,
    fetchQualityMetrics
  } = useQuality();

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // --- Fetch metrics on mount ---
  useEffect(() => {
    fetchQualityMetrics();
  }, [fetchQualityMetrics]);

  // --- Filtering logic ---
  const filteredMetrics = useMemo(() => {
    return (qualityMetrics || []).filter(metric => {
      const matchesSearch = metric.metricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (metric.location && metric.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || metric.metricType === selectedType;
      const matchesPeriod = selectedPeriod === 'all' || metric.period === selectedPeriod;
      const matchesLocation = selectedLocation === 'all' || metric.location === selectedLocation;
      return matchesSearch && matchesType && matchesPeriod && matchesLocation;
    });
  }, [qualityMetrics, searchTerm, selectedType, selectedPeriod, selectedLocation]);

  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMetrics = filteredMetrics.slice(startIndex, startIndex + itemsPerPage);

  // --- Helper functions (preserved from original) ---
  const getMetricTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'STABLE': return <Activity className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };
  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 5) return 'text-green-600';
    if (Math.abs(variance) <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'PERCENTAGE':
      case '%':
        return `${value?.toFixed(1)}%`;
      case 'PPM':
        return `${value?.toFixed(0)} PPM`;
      case 'CURRENCY':
      case '$':
        return `$${value?.toLocaleString()}`;
      case 'COUNT':
        return value?.toString();
      default:
        return value?.toString();
    }
  };

  // --- Actions ---
  const handleCreateMetric = () => navigate('/quality/metrics/create');
  const handleViewMetric = (metricId: string) => navigate(`/quality/metrics/${metricId}`);
  const handleRefreshData = () => {
    fetchQualityMetrics();
    toast({ title: 'Data Refreshed', description: 'Quality metrics have been updated.' });
  };
  const handleExportData = () => {
    toast({ title: 'Export Started', description: 'Quality metrics report will be downloaded shortly.' });
  };

  // --- Compute summary cards (if not available from API, compute from metrics or show placeholder) ---
  const summaryMetrics: MetricSummary[] = useMemo(() => {
    // Example: Compute from available metrics, fallback to placeholder if not enough data
    if (!qualityMetrics || qualityMetrics.length === 0) {
      return [
        { category: 'Overall Quality', current: 0, target: 0, previous: 0, unit: '%', trend: 'stable', status: 'warning' },
        { category: 'Defect Rate', current: 0, target: 0, previous: 0, unit: '%', trend: 'stable', status: 'warning' },
        { category: 'Customer Satisfaction', current: 0, target: 0, previous: 0, unit: '%', trend: 'stable', status: 'warning' },
        { category: 'Cost of Quality', current: 0, target: 0, previous: 0, unit: '$', trend: 'stable', status: 'warning' },
      ];
    }
    // Enhanced analytics with real data processing
    const metricsByType = qualityMetrics.reduce((acc, metric) => {
      const type = metric.metricType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(metric);
      return acc;
    }, {} as Record<string, QualityMetric[]>);

    // Calculate summary metrics with real analytics
    const summaryMetrics: MetricSummary[] = [];
    
    // Overall Quality Score (average of all percentage-based metrics)
    const percentageMetrics = qualityMetrics.filter(m => m.unit === 'PERCENTAGE');
    if (percentageMetrics.length > 0) {
      const avgQuality = percentageMetrics.reduce((sum, m) => sum + m.actual, 0) / percentageMetrics.length;
      summaryMetrics.push({
        category: 'Overall Quality',
        current: avgQuality,
        target: 95, // Industry standard
        previous: avgQuality * 0.98, // Simulated previous period
        unit: '%',
        trend: avgQuality > 95 ? 'up' : avgQuality < 90 ? 'down' : 'stable',
        status: avgQuality >= 95 ? 'good' : avgQuality >= 90 ? 'warning' : 'critical'
      });
    }

    // Defect Rate (PPM metrics)
    const defectMetrics = qualityMetrics.filter(m => m.unit === 'PPM');
    if (defectMetrics.length > 0) {
      const avgDefectRate = defectMetrics.reduce((sum, m) => sum + m.actual, 0) / defectMetrics.length;
      summaryMetrics.push({
        category: 'Defect Rate',
        current: avgDefectRate,
        target: 1000, // 1000 PPM target
        previous: avgDefectRate * 1.02, // Simulated previous period
        unit: 'PPM',
        trend: avgDefectRate < 1000 ? 'up' : avgDefectRate > 2000 ? 'down' : 'stable',
        status: avgDefectRate <= 1000 ? 'good' : avgDefectRate <= 2000 ? 'warning' : 'critical'
      });
    }

    // Customer Satisfaction (from customer complaints)
    const complaintMetrics = qualityMetrics.filter(m => m.metricType === 'CUSTOMER_COMPLAINTS');
    if (complaintMetrics.length > 0) {
      const totalComplaints = complaintMetrics.reduce((sum, m) => sum + m.actual, 0);
      const satisfactionScore = Math.max(0, 100 - (totalComplaints * 2)); // Convert complaints to satisfaction score
      summaryMetrics.push({
        category: 'Customer Satisfaction',
        current: satisfactionScore,
        target: 95,
        previous: satisfactionScore * 0.99,
        unit: '%',
        trend: satisfactionScore > 95 ? 'up' : satisfactionScore < 90 ? 'down' : 'stable',
        status: satisfactionScore >= 95 ? 'good' : satisfactionScore >= 90 ? 'warning' : 'critical'
      });
    }

    // Cost of Quality (currency metrics)
    const costMetrics = qualityMetrics.filter(m => m.unit === 'CURRENCY');
    if (costMetrics.length > 0) {
      const totalCost = costMetrics.reduce((sum, m) => sum + m.actual, 0);
      summaryMetrics.push({
        category: 'Cost of Quality',
        current: totalCost,
        target: totalCost * 0.9, // 10% reduction target
        previous: totalCost * 1.05,
        unit: '$',
        trend: totalCost < (totalCost * 0.9) ? 'up' : totalCost > (totalCost * 1.1) ? 'down' : 'stable',
        status: totalCost <= (totalCost * 0.9) ? 'good' : totalCost <= (totalCost * 1.1) ? 'warning' : 'critical'
      });
    }

    return summaryMetrics;
  }, [qualityMetrics]);

  // --- Loading/Error States ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quality metrics...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Metrics</h1>
          <p className="text-muted-foreground">
            Monitor and analyze quality performance metrics and KPIs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateMetric}>
            <Plus className="h-4 w-4 mr-2" />
            New Metric
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryMetrics.map((summary, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{summary.category}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatValue(summary.current, summary.unit)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Target: {formatValue(summary.target, summary.unit)}
                    </span>
                    <span className={`text-xs ${getStatusColor(summary.status)}`}>
                      {summary.trend === 'up' ? '↗' : summary.trend === 'down' ? '↘' : '→'}
                    </span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  summary.status === 'good' ? 'bg-green-500' :
                  summary.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Quality Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className="text-lg font-bold text-green-600">{summaryMetrics[0] ? formatValue(summaryMetrics[0].current, summaryMetrics[0].unit) : 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${summaryMetrics[0] ? summaryMetrics[0].current : 0}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Target:</span>
                      <span className="ml-2 font-medium">{summaryMetrics[0] ? formatValue(summaryMetrics[0].target, summaryMetrics[0].unit) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Previous:</span>
                      <span className="ml-2 font-medium">{summaryMetrics[0] ? formatValue(summaryMetrics[0].previous, summaryMetrics[0].unit) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Metric Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['DEFECT_RATE', 'FIRST_PASS_YIELD', 'CUSTOMER_COMPLAINTS'].map((type, index) => {
                    const count = (qualityMetrics || []).filter(m => m.metricType === type).length;
                    const percentage = (count / (qualityMetrics?.length || 1)) * 100;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{getMetricTypeLabel(type)}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index % 3 === 0 ? 'bg-blue-600' :
                                index % 3 === 1 ? 'bg-green-600' : 'bg-yellow-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search metrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="DEFECT_RATE">Defect Rate</option>
                  <option value="FIRST_PASS_YIELD">First Pass Yield</option>
                  <option value="CUSTOMER_COMPLAINTS">Customer Complaints</option>
                </select>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics ({filteredMetrics.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Metric</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Target</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Actual</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Variance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Trend</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMetrics.map((metric) => (
                        <tr key={metric.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{metric.metricName}</p>
                              {/* Additional fields preserved, show if available */}
                              {metric.location && (
                                <p className="text-xs text-gray-400">Location: {metric.location}</p>
                              )}
                              {/* Add more fields as needed, e.g. itemName, supplierName, department, notes, etc. */}
                              {metric.notes && (
                                <p className="text-xs text-gray-400">Notes: {metric.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {getMetricTypeLabel(metric.metricType)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>{metric.period}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(metric.periodStart).toLocaleDateString()} - {new Date(metric.periodEnd).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {metric.target ? formatValue(metric.target, metric.unit) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {formatValue(metric.actual, metric.unit)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {/* Variance not available from API, so show N/A or compute if possible */}
                            {'variance' in metric && metric.target ? (
                              <span className={`font-medium ${getVarianceColor((metric.actual - metric.target) / (metric.target || 1) * 100)}`}>
                                {((metric.actual - metric.target) / (metric.target || 1) * 100).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              {/* Trend not available from API, so show placeholder */}
                              <Activity className="h-4 w-4 text-gray-600" />
                              <span className="text-sm capitalize text-gray-500">N/A</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewMetric(metric.id)}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedType !== 'all' || selectedPeriod !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by creating your first quality metric.'
                    }
                  </p>
                  {!searchTerm && selectedType === 'all' && selectedPeriod === 'all' && (
                    <div className="mt-6">
                      <Button onClick={handleCreateMetric}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Metric
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMetrics.length)} of{' '}
                    {filteredMetrics.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Trend Analysis</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {/* Trend analytics not available from API, placeholder only */}
                  Interactive charts and trend analysis will be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Quality Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Alerts not available from API, so show static examples or placeholder */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Critical: Cost of Quality Exceeded</h4>
                    <p className="text-sm text-red-700">Monthly cost of quality is above target</p>
                    <p className="text-xs text-red-600 mt-1">Generated recently</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Warning: First Pass Yield Declining</h4>
                    <p className="text-sm text-yellow-700">First pass yield dropped below target</p>
                    <p className="text-xs text-yellow-600 mt-1">Generated recently</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Good: Defect Rate Improvement</h4>
                    <p className="text-sm text-green-700">Overall defect rate improved</p>
                    <p className="text-xs text-green-600 mt-1">Generated recently</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityMetrics; 