import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, Eye, Plus, CheckCircle, AlertTriangle, BarChart3, Download } from 'lucide-react';
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
  ResponsiveContainer 
} from 'recharts';

// Mock data types
type QualityStatus = 'APPROVED' | 'CONDITIONAL' | 'REJECTED' | 'PENDING';
type QualityIncidentSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';

interface SupplierQualityRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  status: QualityStatus;
  qualityScore: number;
  defectRate: number;
  firstPassYield: number;
  onTimeDelivery: number;
  lastAuditDate: string;
  nextAuditDate: string;
  certifications: string[];
  qualitySystem: string;
  incidents: {
    id: string;
    date: string;
    type: string;
    severity: QualityIncidentSeverity;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    resolutionDate?: string;
    rootCause?: string;
    correctiveAction?: string;
  }[];
  correctiveActions: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    assignedTo: string;
    completedDate?: string;
    effectiveness?: number;
  }[];
  auditResults: {
    id: string;
    date: string;
    score: number;
    findings: number;
    majorNonConformities: number;
    minorNonConformities: number;
    observations: number;
    auditor: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<SupplierQualityRecord>();

const statusColors: Record<QualityStatus, string> = {
  'APPROVED': 'success',
  'CONDITIONAL': 'warning',
  'REJECTED': 'destructive',
  'PENDING': 'secondary',
};

// Mock data
const MOCK_QUALITY_DATA: SupplierQualityRecord[] = Array.from({ length: 10 }, (_, i) => {
  const statuses: QualityStatus[] = ['APPROVED', 'CONDITIONAL', 'REJECTED', 'PENDING'];
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  
  return {
    id: `qual-${i + 1}`,
    supplierId: `supplier-${i % 5 + 1}`,
    supplierName: `Supplier ${i % 5 + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    qualityScore,
    defectRate: Math.random() * 5,
    firstPassYield: 80 + Math.random() * 20,
    onTimeDelivery: 85 + Math.random() * 15,
    lastAuditDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
    nextAuditDate: new Date(Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
    certifications: [
      'ISO 9001',
      'IATF 16949',
      'AS9100',
      'ISO 13485',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    qualitySystem: ['Six Sigma', 'TQM', 'Lean Manufacturing', 'APQP'][Math.floor(Math.random() * 4)],
    incidents: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      const severities: QualityIncidentSeverity[] = ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'];
      const incidentDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      const isResolved = Math.random() > 0.3;
      
      return {
        id: `inc-${i}-${j}`,
        date: incidentDate.toISOString(),
        type: ['Product Defect', 'Documentation Error', 'Process Deviation', 'Packaging Issue'][Math.floor(Math.random() * 4)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: 'Quality incident description',
        status: isResolved ? 'CLOSED' : ['OPEN', 'IN_PROGRESS'][Math.floor(Math.random() * 2)],
        resolutionDate: isResolved ? new Date(incidentDate.getTime() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        rootCause: isResolved ? 'Root cause analysis result' : undefined,
        correctiveAction: isResolved ? 'Corrective action taken' : undefined,
      };
    }),
    correctiveActions: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      const dueDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const isCompleted = Math.random() > 0.5;
      
      return {
        id: `capa-${i}-${j}`,
        title: 'Improve Quality Control Process',
        description: 'Implement additional quality checks in the manufacturing process',
        dueDate: dueDate.toISOString(),
        status: isCompleted ? 'COMPLETED' : dueDate < new Date() ? 'OVERDUE' : ['OPEN', 'IN_PROGRESS'][Math.floor(Math.random() * 2)],
        assignedTo: 'John Doe',
        completedDate: isCompleted ? new Date(dueDate.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        effectiveness: isCompleted ? Math.floor(Math.random() * 40) + 60 : undefined, // 60-100%
      };
    }),
    auditResults: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      return {
        id: `audit-${i}-${j}`,
        date: new Date(Date.now() - (j + 1) * 180 * 24 * 60 * 60 * 1000).toISOString(),
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        findings: Math.floor(Math.random() * 10) + 1,
        majorNonConformities: Math.floor(Math.random() * 3),
        minorNonConformities: Math.floor(Math.random() * 5) + 1,
        observations: Math.floor(Math.random() * 5) + 1,
        auditor: 'Quality Auditor',
      };
    }),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

export function SupplierQualityManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    supplier: '',
    status: '',
    certification: '',
    qualitySystem: '',
  });

  const columns = [
    columnHelper.accessor('supplierName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Supplier</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <span className="font-medium text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Status</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('qualityScore', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Quality Score</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Progress value={info.getValue()} className="h-2 w-24" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('defectRate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Defect Rate</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className={info.getValue() > 3 ? 'text-red-600 font-medium' : ''}>
          {info.getValue().toFixed(2)}%
        </div>
      ),
    }),
    columnHelper.accessor('firstPassYield', {
      header: 'First Pass Yield',
      cell: (info) => (
        <div>
          {info.getValue().toFixed(1)}%
        </div>
      ),
    }),
    columnHelper.accessor('certifications', {
      header: 'Certifications',
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((cert, index) => (
            <Badge key={index} variant="outline" className="whitespace-nowrap">
              {cert}
            </Badge>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('lastAuditDate', {
      header: 'Last Audit',
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/suppliers/quality-management/${info.getValue()}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate quality statistics
  const qualityStats = React.useMemo(() => {
    const total = MOCK_QUALITY_DATA.length;
    const approved = MOCK_QUALITY_DATA.filter(item => item.status === 'APPROVED').length;
    const conditional = MOCK_QUALITY_DATA.filter(item => item.status === 'CONDITIONAL').length;
    const rejected = MOCK_QUALITY_DATA.filter(item => item.status === 'REJECTED').length;
    const pending = MOCK_QUALITY_DATA.filter(item => item.status === 'PENDING').length;
    
    const avgQualityScore = MOCK_QUALITY_DATA.reduce((sum, item) => sum + item.qualityScore, 0) / total;
    const avgDefectRate = MOCK_QUALITY_DATA.reduce((sum, item) => sum + item.defectRate, 0) / total;
    const avgFirstPassYield = MOCK_QUALITY_DATA.reduce((sum, item) => sum + item.firstPassYield, 0) / total;
    
    return { 
      total, 
      approved, 
      conditional, 
      rejected, 
      pending,
      avgQualityScore,
      avgDefectRate,
      avgFirstPassYield
    };
  }, []);

  // Generate chart data
  const qualityScoreTrend = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        month: format(date, 'MMM yyyy'),
        score: 75 + (i * 0.5) + Math.floor(Math.random() * 5),
      };
    });
  }, []);

  const defectRateTrend = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        month: format(date, 'MMM yyyy'),
        rate: 5 - (i * 0.2) + Math.random(),
      };
    });
  }, []);

  const incidentsBySeverity = React.useMemo(() => {
    const incidents = MOCK_QUALITY_DATA.flatMap(item => item.incidents);
    const distribution: Record<QualityIncidentSeverity, number> = {
      'CRITICAL': 0,
      'MAJOR': 0,
      'MINOR': 0,
      'OBSERVATION': 0,
    };
    
    incidents.forEach(incident => {
      distribution[incident.severity]++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

  const table = useReactTable({
    data: MOCK_QUALITY_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    manualPagination: false,
    manualSorting: false,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Supplier Quality Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Quality Assessment
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Suppliers</p>
                <p className="text-3xl font-bold">{qualityStats.approved}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((qualityStats.approved / qualityStats.total) * 100)}% of total
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Quality Score</p>
                <p className="text-3xl font-bold">{Math.round(qualityStats.avgQualityScore)}</p>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Defect Rate</p>
                <p className="text-3xl font-bold">{qualityStats.avgDefectRate.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">across all suppliers</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Pass Yield</p>
                <p className="text-3xl font-bold">{Math.round(qualityStats.avgFirstPassYield)}%</p>
                <p className="text-sm text-muted-foreground">average across suppliers</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quality Score Trend</CardTitle>
            <CardDescription>
              Average quality score over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={qualityScoreTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Defect Rate Trend</CardTitle>
            <CardDescription>
              Average defect rate over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={defectRateTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
            <CardDescription>
              Distribution of quality incidents by severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentsBySeverity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incidentsBySeverity.map((entry, index) => (
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

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Search by supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="CONDITIONAL">Conditional</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certification">Certification</Label>
            <Select
              id="certification"
              value={filters.certification}
              onChange={(e) => setFilters(prev => ({ ...prev, certification: e.target.value }))}
            >
              <option value="">All Certifications</option>
              <option value="ISO 9001">ISO 9001</option>
              <option value="IATF 16949">IATF 16949</option>
              <option value="AS9100">AS9100</option>
              <option value="ISO 13485">ISO 13485</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualitySystem">Quality System</Label>
            <Select
              id="qualitySystem"
              value={filters.qualitySystem}
              onChange={(e) => setFilters(prev => ({ ...prev, qualitySystem: e.target.value }))}
            >
              <option value="">All Systems</option>
              <option value="Six Sigma">Six Sigma</option>
              <option value="TQM">TQM</option>
              <option value="Lean Manufacturing">Lean Manufacturing</option>
              <option value="APQP">APQP</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        table={table}
        isLoading={false}
        onRowClick={(row) => navigate(`/suppliers/quality-management/${row.id}`)}
      />
    </div>
  );
}

export default SupplierQualityManagement;