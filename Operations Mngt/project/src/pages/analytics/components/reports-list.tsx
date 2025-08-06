import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'inventory' | 'procurement' | 'supplier' | 'transportation' | 'financial';
  status: 'draft' | 'scheduled' | 'completed' | 'failed';
  format: 'pdf' | 'excel' | 'csv';
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
  createdAt: Date;
  fileSize?: string;
}

interface ReportsListProps {
  className?: string;
  onReportAction?: (action: string, report: Report) => void;
}

const sampleReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Inventory Report',
    description: 'Comprehensive inventory levels and movements for the current month',
    type: 'inventory',
    status: 'completed',
    format: 'pdf',
    lastRun: new Date('2024-01-15'),
    nextRun: new Date('2024-02-15'),
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-01'),
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Supplier Performance Analysis',
    description: 'Quarterly supplier performance metrics and rankings',
    type: 'supplier',
    status: 'scheduled',
    format: 'excel',
    lastRun: new Date('2024-01-10'),
    nextRun: new Date('2024-04-10'),
    createdBy: 'Jane Smith',
    createdAt: new Date('2024-01-05'),
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'Procurement Spend Analysis',
    description: 'Detailed analysis of procurement spend by category and supplier',
    type: 'procurement',
    status: 'draft',
    format: 'csv',
    createdBy: 'Mike Johnson',
    createdAt: new Date('2024-01-12')
  },
  {
    id: '4',
    name: 'Transportation Cost Report',
    description: 'Monthly transportation costs and efficiency metrics',
    type: 'transportation',
    status: 'completed',
    format: 'pdf',
    lastRun: new Date('2024-01-20'),
    nextRun: new Date('2024-02-20'),
    createdBy: 'Sarah Wilson',
    createdAt: new Date('2024-01-08'),
    fileSize: '3.1 MB'
  },
  {
    id: '5',
    name: 'Financial Performance Summary',
    description: 'Monthly financial performance and budget variance analysis',
    type: 'financial',
    status: 'failed',
    format: 'excel',
    lastRun: new Date('2024-01-18'),
    nextRun: new Date('2024-02-18'),
    createdBy: 'David Brown',
    createdAt: new Date('2024-01-10'),
    fileSize: '4.2 MB'
  }
];

const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: Report['type']) => {
  switch (type) {
    case 'inventory':
      return 'bg-purple-100 text-purple-800';
    case 'procurement':
      return 'bg-orange-100 text-orange-800';
    case 'supplier':
      return 'bg-green-100 text-green-800';
    case 'transportation':
      return 'bg-blue-100 text-blue-800';
    case 'financial':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function ReportsList({ className, onReportAction }: ReportsListProps) {
  const [reports] = useState<Report[]>(sampleReports);

  const handleAction = (action: string, report: Report) => {
    onReportAction?.(action, report);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reports Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">{report.name}</h3>
                  <Badge variant="outline" className={cn("text-xs", getTypeColor(report.type))}>
                    {report.type}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(report.status))}>
                    {report.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {report.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.createdBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(report.createdAt)}
                  </div>
                  {report.lastRun && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last run: {formatDate(report.lastRun)}
                    </div>
                  )}
                  {report.fileSize && (
                    <span>{report.fileSize}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {report.status === 'completed' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction('view', report)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction('download', report)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {report.status === 'draft' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('edit', report)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('delete', report)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports found</p>
            <p className="text-sm">Create your first report to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

