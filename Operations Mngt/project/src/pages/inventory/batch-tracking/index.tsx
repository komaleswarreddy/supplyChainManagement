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
import { Layers, Plus, Search, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for batch/lot tracking
const batches = [
  {
    id: 'batch-1',
    number: 'LOT-2023-001',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    quantity: 120,
    manufacturingDate: '2023-01-15',
    expiryDate: '2024-01-15',
    supplier: 'Tech Supplies Inc.',
    status: 'ACTIVE',
    location: 'Main Warehouse',
    qualityStatus: 'PASSED',
  },
  {
    id: 'batch-2',
    number: 'LOT-2023-002',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    quantity: 50,
    manufacturingDate: '2023-02-10',
    expiryDate: null,
    supplier: 'Electronics Wholesale',
    status: 'ACTIVE',
    location: 'Main Warehouse',
    qualityStatus: 'PASSED',
  },
  {
    id: 'batch-3',
    number: 'LOT-2023-003',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    quantity: 500,
    manufacturingDate: '2023-03-05',
    expiryDate: null,
    supplier: 'Cable Solutions',
    status: 'ACTIVE',
    location: 'East Coast DC',
    qualityStatus: 'PASSED',
  },
  {
    id: 'batch-4',
    number: 'LOT-2023-004',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    quantity: 25,
    manufacturingDate: '2023-04-20',
    expiryDate: null,
    supplier: 'Office Furniture Co.',
    status: 'ACTIVE',
    location: 'West Coast DC',
    qualityStatus: 'PASSED',
  },
  {
    id: 'batch-5',
    number: 'LOT-2023-005',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    quantity: 75,
    manufacturingDate: '2023-05-12',
    expiryDate: null,
    supplier: 'Tech Supplies Inc.',
    status: 'QUARANTINE',
    location: 'Main Warehouse',
    qualityStatus: 'PENDING',
  },
  {
    id: 'batch-6',
    number: 'LOT-2022-045',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    quantity: 5,
    manufacturingDate: '2022-06-10',
    expiryDate: '2023-06-10',
    supplier: 'Tech Supplies Inc.',
    status: 'EXPIRED',
    location: 'Main Warehouse',
    qualityStatus: 'PASSED',
  },
];

const columnHelper = createColumnHelper<typeof batches[0]>();

const statusColors = {
  ACTIVE: 'success',
  QUARANTINE: 'warning',
  EXPIRED: 'destructive',
};

const qualityColors = {
  PASSED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
};

export function BatchTrackingPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    supplier: '',
  });

  const columns = [
    columnHelper.accessor('number', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Batch/Lot #</span>
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
    columnHelper.accessor('manufacturingDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Mfg. Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PP'),
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
      cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'PP') : 'N/A',
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
    columnHelper.accessor('qualityStatus', {
      header: 'Quality',
      cell: (info) => (
        <Badge variant={qualityColors[info.getValue()] as any}>
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
            navigate(`/inventory/batch-tracking/${info.getValue()}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const filteredData = batches.filter(batch => {
    const matchesSearch = filters.search === '' || 
      batch.number.toLowerCase().includes(filters.search.toLowerCase()) ||
      batch.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
      batch.itemCode.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === '' || batch.status === filters.status;
    const matchesLocation = filters.location === '' || batch.location === filters.location;
    const matchesSupplier = filters.supplier === '' || batch.supplier === filters.supplier;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesSupplier;
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
          <Layers className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Batch/Lot Tracking</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Batch
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
                  placeholder="Search by batch # or item"
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
                <option value="QUARANTINE">Quarantine</option>
                <option value="EXPIRED">Expired</option>
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
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                id="supplier"
                value={filters.supplier}
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              >
                <option value="">All Suppliers</option>
                <option value="Tech Supplies Inc.">Tech Supplies Inc.</option>
                <option value="Electronics Wholesale">Electronics Wholesale</option>
                <option value="Cable Solutions">Cable Solutions</option>
                <option value="Office Furniture Co.">Office Furniture Co.</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
        onRowClick={(row) => navigate(`/inventory/batch-tracking/${row.id}`)}
      />
    </div>
  );
}

export default BatchTrackingPage;