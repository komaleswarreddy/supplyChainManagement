import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import type { WarehouseTask } from '@/types/logistics';
import { ArrowUpDown, Eye, Plus, ClipboardList } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<WarehouseTask>();

const statusColors = {
  PENDING: 'default',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'warning',
  URGENT: 'destructive',
} as const;

export function WarehouseTaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialWarehouseId = location.state?.warehouseId || '';
  
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    warehouse: initialWarehouseId,
    status: '',
    type: '',
    priority: '',
    assignedTo: '',
  });

  const columns = [
    columnHelper.accessor('id', {
      header: 'Task ID',
      cell: (info) => (
        <span className="font-medium text-primary">
          {info.getValue().substring(0, 8)}
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
        <Badge variant="secondary">
          {info.getValue().replace('_', ' ')}
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
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('priority', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Priority</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={priorityColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor('assignedTo.name', {
      header: 'Assigned To',
      cell: (info) => info.getValue() || 'Unassigned',
    }),
    columnHelper.accessor('dueBy', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Due By</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/logistics/tasks/${info.getValue()}`);
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

  const { useWarehouseTasks } = useLogistics();
  const { data, isLoading } = useWarehouseTasks({
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
          <ClipboardList className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Warehouse Tasks</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse">Warehouse</Label>
            <Input
              id="warehouse"
              value={filters.warehouse}
              onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
              placeholder="Filter by warehouse ID"
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
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
              <option value="PUTAWAY">Putaway</option>
              <option value="PICK">Pick</option>
              <option value="REPLENISHMENT">Replenishment</option>
              <option value="CYCLE_COUNT">Cycle Count</option>
              <option value="TRANSFER">Transfer</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
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
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              placeholder="Filter by assignee"
            />
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/logistics/tasks/${row.id}`)}
      />
    </div>
  );
}