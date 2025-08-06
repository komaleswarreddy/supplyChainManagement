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
import type { Shipment } from '@/types/transportation';
import { ArrowUpDown, Eye, Plus, Truck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<Shipment>();

const statusColors = {
  PLANNED: 'default',
  BOOKED: 'secondary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  EXCEPTION: 'destructive',
  CANCELLED: 'destructive',
} as const;

export function ShipmentList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    carrier: '',
    status: '',
    origin: '',
    destination: '',
    referenceNumber: '',
    serviceLevel: '',
  });

  const columns = [
    columnHelper.accessor('shipmentNumber', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Shipment #</span>
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
    columnHelper.accessor('referenceNumber', {
      header: 'Reference #',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('carrier.name', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Carrier</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
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
    columnHelper.accessor('origin.city', {
      header: 'Origin',
      cell: (info) => `${info.getValue()}, ${info.row.original.origin.state}`,
    }),
    columnHelper.accessor('destination.city', {
      header: 'Destination',
      cell: (info) => `${info.getValue()}, ${info.row.original.destination.state}`,
    }),
    columnHelper.accessor('serviceLevel', {
      header: 'Service',
      cell: (info) => (
        <Badge variant="outline">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('pickupDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Pickup Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('estimatedDeliveryDate', {
      header: 'Est. Delivery',
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
            navigate(`/transportation/shipments/${info.getValue()}`);
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

  const { useShipments } = useTransportation();
  const { data, isLoading } = useShipments({
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
          <Truck className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Shipments</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/transportation/carrier-selection')}
          >
            Carrier Selection
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              value={filters.carrier}
              onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
              placeholder="Search by carrier"
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
              <option value="PLANNED">Planned</option>
              <option value="BOOKED">Booked</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="EXCEPTION">Exception</option>
              <option value="CANCELLED">Cancelled</option>
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
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={filters.origin}
              onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
              placeholder="Search by origin city/state"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={filters.destination}
              onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="Search by destination city/state"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference #</Label>
            <Input
              id="referenceNumber"
              value={filters.referenceNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder="Search by reference number"
            />
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/transportation/shipments/${row.id}`)}
      />
    </div>
  );
}

export default ShipmentList;