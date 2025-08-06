import React from 'react';
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
import type { Supplier } from '@/types/supplier';
import { ArrowUpDown, Eye, Plus, Building2, Edit } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<Supplier>();

const statusColors = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'destructive',
  DISQUALIFIED: 'destructive',
} as const;

export function SupplierList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    status: '',
    type: '',
    name: '',
    category: '',
    classification: '',
    riskLevel: '',
    qualificationStatus: '',
  });

  const columns = [
    columnHelper.accessor('code', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Code</span>
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
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Name</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <span className="capitalize">
          {info.getValue().replace('_', ' ').toLowerCase()}
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
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('categories', {
      header: 'Categories',
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((category, index) => (
            <Badge key={index} variant="outline" className="whitespace-nowrap">
              {category}
            </Badge>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('riskAssessment', {
      header: 'Risk Level',
      cell: (info) => {
        const riskAssessment = info.getValue();
        if (!riskAssessment) return <span className="text-muted-foreground">Not assessed</span>;
        
        return (
          <Badge variant={
            riskAssessment.overallRiskLevel === 'LOW' ? 'success' :
            riskAssessment.overallRiskLevel === 'MEDIUM' ? 'warning' :
            riskAssessment.overallRiskLevel === 'HIGH' ? 'destructive' :
            'destructive'
          }>
            {riskAssessment.overallRiskLevel}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('onboardingDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Onboarded</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'PP') : 
                                        format(new Date(info.row.original.createdAt), 'PP'),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/suppliers/${info.getValue()}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/suppliers/${info.getValue()}/edit`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { useSupplierList, useSupplierAnalytics } = useSuppliers();
  const { data, isLoading } = useSupplierList({
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

  const { data: analytics, isLoading: isLoadingAnalytics } = useSupplierAnalytics();

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Suppliers</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Analytics Cards */}
      {!isLoadingAnalytics && analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{analytics.supplierCounts.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{analytics.supplierCounts.active}</p>
              </div>
              <Badge variant="success" className="h-8 px-3 text-sm">
                ACTIVE
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{analytics.supplierCounts.pending}</p>
              </div>
              <Badge variant="warning" className="h-8 px-3 text-sm">
                PENDING
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Performance</p>
                <p className="text-2xl font-bold">{analytics.performanceAverages.overall.toFixed(1)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">{analytics.performanceAverages.overall.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DISQUALIFIED">Disqualified</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="WHOLESALER">Wholesaler</option>
              <option value="RETAILER">Retailer</option>
              <option value="SERVICE_PROVIDER">Service Provider</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Search</Label>
            <Input
              id="name"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Search by name or code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Filter by category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classification">Business Classification</Label>
            <Select
              id="classification"
              value={filters.classification}
              onChange={(e) => setFilters(prev => ({ ...prev, classification: e.target.value }))}
            >
              <option value="">All Classifications</option>
              <option value="SMALL_BUSINESS">Small Business</option>
              <option value="MINORITY_OWNED">Minority Owned</option>
              <option value="WOMEN_OWNED">Women Owned</option>
              <option value="VETERAN_OWNED">Veteran Owned</option>
              <option value="DISABLED_OWNED">Disabled Owned</option>
              <option value="LARGE_ENTERPRISE">Large Enterprise</option>
            </Select>
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
            <Label htmlFor="qualificationStatus">Qualification Status</Label>
            <Select
              id="qualificationStatus"
              value={filters.qualificationStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, qualificationStatus: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="DISQUALIFIED">Disqualified</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Onboarding Date Range</Label>
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
        onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
      />
    </div>
  );
}

export default SupplierList;