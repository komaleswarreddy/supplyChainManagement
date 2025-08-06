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
import { useTransportation } from '@/hooks/useTransportation';
import type { Carrier } from '@/types/transportation';
import { ArrowUpDown, Eye, Plus, Ship } from 'lucide-react';

const columnHelper = createColumnHelper<Carrier>();

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  SUSPENDED: 'destructive',
} as const;

export function CarrierList() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    carrier: '',
    status: '',
    type: '',
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
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Type</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant="secondary">
          {info.getValue()}
        </Badge>
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
    columnHelper.accessor('contactInfo.email', {
      header: 'Contact Email',
    }),
    columnHelper.accessor('contactInfo.phone', {
      header: 'Contact Phone',
    }),
    columnHelper.accessor('performanceMetrics.onTimeDelivery', {
      header: 'On-Time %',
      cell: (info) => `${info.getValue().toFixed(1)}%`,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/transportation/carriers/${info.getValue()}`);
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

  const { useCarriers } = useTransportation();
  const { data, isLoading } = useCarriers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    ...filters,
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ship className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Carriers</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Carrier
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="carrier">Search</Label>
            <Input
              id="carrier"
              value={filters.carrier}
              onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
              placeholder="Search by name or code"
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
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
              <option value="LTL">LTL</option>
              <option value="FTL">FTL</option>
              <option value="PARCEL">Parcel</option>
              <option value="AIR">Air</option>
              <option value="OCEAN">Ocean</option>
              <option value="RAIL">Rail</option>
              <option value="INTERMODAL">Intermodal</option>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/transportation/carriers/${row.id}`)}
      />
    </div>
  );
}

export default CarrierList;