import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { 
  createColumnHelper, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { BookMarked, Plus, Search, Filter, ArrowUpDown, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for reservations
const reservations = [
  {
    id: 'res-1',
    referenceNumber: 'RES-2023-001',
    referenceType: 'SALES_ORDER',
    referenceId: 'SO-2023-0187',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    quantity: 10,
    status: 'ACTIVE',
    location: 'Main Warehouse',
    createdDate: '2023-06-15',
    expiryDate: '2023-07-15',
    createdBy: 'John Doe',
    priority: 'HIGH',
  },
  {
    id: 'res-2',
    referenceNumber: 'RES-2023-002',
    referenceType: 'PRODUCTION_ORDER',
    referenceId: 'PO-2023-0056',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    quantity: 50,
    status: 'ACTIVE',
    location: 'Main Warehouse',
    createdDate: '2023-06-16',
    expiryDate: '2023-07-16',
    createdBy: 'Jane Smith',
    priority: 'MEDIUM',
  },
  {
    id: 'res-3',
    referenceNumber: 'RES-2023-003',
    referenceType: 'SALES_ORDER',
    referenceId: 'SO-2023-0192',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    quantity: 5,
    status: 'FULFILLED',
    location: 'East Coast DC',
    createdDate: '2023-06-10',
    expiryDate: '2023-07-10',
    fulfilledDate: '2023-06-18',
    createdBy: 'Sarah Johnson',
    priority: 'MEDIUM',
  },
  {
    id: 'res-4',
    referenceNumber: 'RES-2023-004',
    referenceType: 'TRANSFER_ORDER',
    referenceId: 'TO-2023-0028',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    quantity: 3,
    status: 'ACTIVE',
    location: 'Main Warehouse',
    createdDate: '2023-06-18',
    expiryDate: '2023-07-18',
    createdBy: 'Mike Wilson',
    priority: 'LOW',
  },
  {
    id: 'res-5',
    referenceNumber: 'RES-2023-005',
    referenceType: 'SALES_ORDER',
    referenceId: 'SO-2023-0201',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    quantity: 8,
    status: 'CANCELLED',
    location: 'West Coast DC',
    createdDate: '2023-06-12',
    expiryDate: '2023-07-12',
    cancelledDate: '2023-06-14',
    cancelledBy: 'John Doe',
    cancellationReason: 'Customer cancelled order',
    createdBy: 'Jane Smith',
    priority: 'HIGH',
  },
];

const columnHelper = createColumnHelper<typeof reservations[0]>();

const statusColors = {
  ACTIVE: 'success',
  FULFILLED: 'secondary',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
};

const priorityColors = {
  HIGH: 'destructive',
  MEDIUM: 'warning',
  LOW: 'secondary',
};

export function InventoryReservationPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    referenceType: '',
    location: '',
  });

  const columns = [
    columnHelper.accessor('referenceNumber', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Reservation #</span>
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
    columnHelper.accessor('itemName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Item</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.itemCode}</div>
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
        <span className="font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('referenceType', {
      header: 'Reference Type',
      cell: (info) => (
        <Badge variant="outline">
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('referenceId', {
      header: 'Reference ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()] as any}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: (info) => (
        <Badge variant={priorityColors[info.getValue()] as any}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('expiryDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Expiry Date</span>
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
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inventory/reservation/${info.getValue()}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {info.row.original.status === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                // Handle cancellation
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    }),
  ];

  const filteredData = reservations.filter(reservation => {
    const matchesSearch = filters.search === '' || 
      reservation.referenceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      reservation.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
      reservation.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      reservation.referenceId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === '' || reservation.status === filters.status;
    const matchesReferenceType = filters.referenceType === '' || reservation.referenceType === filters.referenceType;
    const matchesLocation = filters.location === '' || reservation.location === filters.location;
    
    return matchesSearch && matchesStatus && matchesReferenceType && matchesLocation;
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookMarked className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Inventory Reservations</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Reservation
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reservation # or item"
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="referenceType">Reference Type</Label>
              <Select
                id="referenceType"
                value={filters.referenceType}
                onChange={(e) => setFilters({ ...filters, referenceType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="SALES_ORDER">Sales Order</option>
                <option value="PRODUCTION_ORDER">Production Order</option>
                <option value="TRANSFER_ORDER">Transfer Order</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                id="location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="East Coast DC">East Coast DC</option>
                <option value="West Coast DC">West Coast DC</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
        onRowClick={(row) => navigate(`/inventory/reservation/${row.id}`)}
      />
    </div>
  );
}

export default InventoryReservationPage;