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
import { useInventory } from '@/hooks/useInventory';
import type { StockAdjustment } from '@/types/inventory';
import { ArrowUpDown, Eye, Plus, Scale } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<StockAdjustment>();

const statusColors = {
  PENDING: 'default',
  APPROVED: 'success',
  REJECTED: 'destructive',
  COMPLETED: 'success',
} as const;

export function AdjustmentList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    type: '',
    item: '',
    status: '',
  });

  const columns = [
    columnHelper.accessor('adjustmentNumber', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Adjustment #</span>
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
        <Badge variant={info.getValue() === 'INCREASE' ? 'success' : 'destructive'}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('item', {
      header: 'Item',
      cell: (info) => (
        <div className="text-sm">
          <div>{info.getValue().name}</div>
          <div className="text-muted-foreground">{info.getValue().itemCode}</div>
        </div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Quantity</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium tabular-nums">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('reason', {
      header: 'Reason',
      cell: (info) => (
        <div className="max-w-xs truncate">{info.getValue()}</div>
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
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Created Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
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
            navigate(`/inventory/adjustments/${info.getValue()}`);
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

  const { useStockAdjustments } = useInventory();
  const { data, isLoading } = useStockAdjustments({
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Stock Adjustments</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Adjustment
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="INCREASE">Increase</option>
              <option value="DECREASE">Decrease</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
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

          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Input
              id="item"
              value={filters.item}
              onChange={(e) => setFilters(prev => ({ ...prev, item: e.target.value }))}
              placeholder="Search by item code or name"
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/inventory/adjustments/${row.id}`)}
      />
    </div>
  );
}

export default AdjustmentList;