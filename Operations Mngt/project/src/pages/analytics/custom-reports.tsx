import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  User,
  Clock,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'dashboard';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  dataSource: string;
  filters: string[];
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastRun?: Date;
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

const sampleReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Spend Analysis',
    description: 'Comprehensive analysis of procurement spend by category and supplier',
    type: 'chart',
    chartType: 'bar',
    dataSource: 'procurement',
    filters: ['date_range', 'supplier', 'category'],
    schedule: 'monthly',
    lastRun: new Date('2024-01-15'),
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-01'),
    isPublic: true
  },
  {
    id: '2',
    name: 'Inventory Turnover Report',
    description: 'Track inventory turnover rates and identify slow-moving items',
    type: 'table',
    dataSource: 'inventory',
    filters: ['warehouse', 'category', 'date_range'],
    schedule: 'weekly',
    lastRun: new Date('2024-01-20'),
    createdBy: 'Jane Smith',
    createdAt: new Date('2024-01-05'),
    isPublic: false
  },
  {
    id: '3',
    name: 'Supplier Performance Dashboard',
    description: 'Real-time dashboard showing supplier performance metrics',
    type: 'dashboard',
    dataSource: 'suppliers',
    filters: ['supplier', 'metric_type'],
    createdBy: 'Mike Johnson',
    createdAt: new Date('2024-01-10'),
    isPublic: true
  }
];

export function CustomReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>(sampleReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateReport = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: 'Report Deleted',
      description: 'The report has been successfully deleted.',
    });
  };

  const handleRunReport = (report: Report) => {
    toast({
      title: 'Report Generated',
      description: `${report.name} is being generated. You will receive a notification when it's ready.`,
    });
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'table':
        return <FileText className="h-4 w-4" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      case 'dashboard':
        return <LineChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getChartTypeIcon = (chartType?: string) => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'line':
        return <LineChart className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Create, manage, and schedule custom reports and dashboards
          </p>
        </div>
        <Button onClick={handleCreateReport} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="my-reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="shared-reports">Shared Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.filter(r => !r.isPublic).map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      {report.chartType && getChartTypeIcon(report.chartType)}
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <Badge variant={report.isPublic ? "default" : "secondary"}>
                      {report.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Source:</span>
                    <Badge variant="outline">{report.dataSource}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Filters:</span>
                    <span>{report.filters.length} active</span>
                  </div>
                  {report.schedule && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Schedule:</span>
                      <Badge variant="outline">{report.schedule}</Badge>
                    </div>
                  )}
                  {report.lastRun && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{report.lastRun.toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunReport(report)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReport(report)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared-reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.filter(r => r.isPublic).map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      {report.chartType && getChartTypeIcon(report.chartType)}
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <Badge variant="default">Public</Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created by:</span>
                    <span>{report.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Source:</span>
                    <Badge variant="outline">{report.dataSource}</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunReport(report)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Spend Analysis
                </CardTitle>
                <CardDescription>
                  Template for analyzing procurement spend by category and supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Inventory Dashboard
                </CardTitle>
                <CardDescription>
                  Template for inventory management and stock level monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Template for tracking supplier and operational performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomReports;

