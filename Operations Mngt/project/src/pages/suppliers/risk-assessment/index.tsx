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
import { useSuppliers } from '@/hooks/useSuppliers';
import type { SupplierRiskAssessment, RiskLevel } from '@/types/supplier';
import { ArrowUpDown, Eye, Plus, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<SupplierRiskAssessment>();

const riskLevelColors: Record<RiskLevel, string> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'destructive',
  CRITICAL: 'destructive',
};

export function RiskAssessmentList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    supplier: '',
    riskLevel: '',
    status: '',
    category: '',
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
    columnHelper.accessor('overallRiskLevel', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Risk Level</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={riskLevelColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('overallScore', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Score</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('assessmentDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Assessment Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('nextAssessmentDate', {
      header: 'Next Assessment',
      cell: (info) => {
        const nextDate = new Date(info.getValue());
        const isOverdue = nextDate < new Date();
        const isUpcoming = !isOverdue && nextDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        return (
          <div className={`${isOverdue ? 'text-red-600 font-medium' : isUpcoming ? 'text-amber-600 font-medium' : ''}`}>
            {format(nextDate, 'PP')}
            {isOverdue && ' (Overdue)'}
            {isUpcoming && ' (Upcoming)'}
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={info.getValue() === 'COMPLETED' ? 'success' : 'warning'}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/suppliers/risk-assessment/${info.getValue()}`);
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

  const { useRiskAssessments } = useSuppliers();
  const { data, isLoading } = useRiskAssessments({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    ...filters,
    dateRange: startDate && endDate ? {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    } : undefined,
  });

  const table = useReactTable({
    data: data?.items ?? [],
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
    pageCount: data?.totalPages ?? -1,
    manualPagination: true,
    manualSorting: true,
  });

  // Calculate risk statistics
  const riskStats = React.useMemo(() => {
    if (!data?.items) return { total: 0, low: 0, medium: 0, high: 0, critical: 0, overdue: 0 };
    
    const total = data.items.length;
    const low = data.items.filter(item => item.overallRiskLevel === 'LOW').length;
    const medium = data.items.filter(item => item.overallRiskLevel === 'MEDIUM').length;
    const high = data.items.filter(item => item.overallRiskLevel === 'HIGH').length;
    const critical = data.items.filter(item => item.overallRiskLevel === 'CRITICAL').length;
    const overdue = data.items.filter(item => new Date(item.nextAssessmentDate) < new Date()).length;
    
    return { total, low, medium, high, critical, overdue };
  }, [data?.items]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Supplier Risk Assessments</h1>
        </div>
        <Button onClick={() => navigate('create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{riskStats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Low Risk</div>
          <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Medium Risk</div>
          <div className="text-2xl font-bold text-amber-600">{riskStats.medium}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">High Risk</div>
          <div className="text-2xl font-bold text-red-600">{riskStats.high}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Critical Risk</div>
          <div className="text-2xl font-bold text-red-800">{riskStats.critical}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold text-red-600">{riskStats.overdue}</div>
        </div>
      </div>

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
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              id="riskLevel"
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Risk Category</Label>
            <Select
              id="category"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="FINANCIAL">Financial</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="REPUTATIONAL">Reputational</option>
              <option value="GEOPOLITICAL">Geopolitical</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assessment Date Range</Label>
            <div className="relative">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholderText="Select date range"
              />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/suppliers/risk-assessment/${row.id}`)}
      />
    </div>
  );
}

export default RiskAssessmentList;