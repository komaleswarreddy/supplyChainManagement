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
import { useLogistics } from '@/hooks/useLogistics';
import type { Warehouse } from '@/types/logistics';
import { ArrowUpDown, Eye, Plus, Warehouse as WarehouseIcon } from 'lucide-react';

const columnHelper = createColumnHelper<Warehouse>();

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  MAINTENANCE: 'warning',
} as const;

export function WarehouseList() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    warehouse: '',
    status: '',
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
    columnHelper.accessor('address', {
      header: 'Location',
      cell: (info) => (
        <div>
          <div>{info.getValue().city}, {info.getValue().state}</div>
          <div className="text-sm text-muted-foreground">{info.getValue().country}</div>
        </div>
      ),
    }),
    columnHelper.accessor('totalArea', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Total Area</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium tabular-nums">
          {info.getValue().toLocaleString()} {info.row.original.areaUnit}
        </div>
      ),
    }),
    columnHelper.accessor('zones', {
      header: 'Zones',
      cell: (info) => info.getValue().length,
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
    columnHelper.accessor('manager.name', {
      header: 'Manager',
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
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
            navigate(`/logistics/warehouses/${info.getValue()}`);
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

  const { useWarehouses } = useLogistics();
  const { data, isLoading } = useWarehouses({
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
          <WarehouseIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Warehouses</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warehouse">Search</Label>
            <Input
              id="warehouse"
              value={filters.warehouse}
              onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
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
              <option value="MAINTENANCE">Maintenance</option>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/logistics/warehouses/${row.id}`)}
      />
    </div>
  );
}