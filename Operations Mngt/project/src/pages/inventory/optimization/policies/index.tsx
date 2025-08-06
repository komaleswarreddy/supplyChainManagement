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
import { Settings, Plus, Search, Filter, ArrowUpDown, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for inventory policies
const policies = [
  {
    id: 'pol-1',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    location: 'Main Warehouse',
    policyType: 'MIN_MAX',
    minQuantity: 85,
    maxQuantity: 250,
    reorderPoint: 100,
    targetStockLevel: 200,
    orderQuantity: 150,
    orderFrequency: 30,
    leadTime: 7,
    serviceLevel: 0.95,
    reviewPeriod: 7,
    abcxyzClass: 'AX',
    lastReviewed: '2023-06-15',
    nextReview: '2023-09-15',
  },
  {
    id: 'pol-2',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    location: 'Main Warehouse',
    policyType: 'REORDER_POINT',
    minQuantity: 32,
    maxQuantity: 100,
    reorderPoint: 50,
    targetStockLevel: null,
    orderQuantity: 50,
    orderFrequency: null,
    leadTime: 14,
    serviceLevel: 0.99,
    reviewPeriod: 7,
    abcxyzClass: 'AY',
    lastReviewed: '2023-06-10',
    nextReview: '2023-09-10',
  },
  {
    id: 'pol-3',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    location: 'East Coast DC',
    policyType: 'PERIODIC_REVIEW',
    minQuantity: 120,
    maxQuantity: 500,
    reorderPoint: null,
    targetStockLevel: 400,
    orderQuantity: null,
    orderFrequency: 14,
    leadTime: 5,
    serviceLevel: 0.9,
    reviewPeriod: 14,
    abcxyzClass: 'BX',
    lastReviewed: '2023-06-12',
    nextReview: '2023-09-12',
  },
  {
    id: 'pol-4',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    location: 'West Coast DC',
    policyType: 'KANBAN',
    minQuantity: 15,
    maxQuantity: 45,
    reorderPoint: 15,
    targetStockLevel: 30,
    orderQuantity: 15,
    orderFrequency: null,
    leadTime: 21,
    serviceLevel: 0.95,
    reviewPeriod: 7,
    abcxyzClass: 'BZ',
    lastReviewed: '2023-06-08',
    nextReview: '2023-09-08',
  },
  {
    id: 'pol-5',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    location: 'Main Warehouse',
    policyType: 'MIN_MAX',
    minQuantity: 60,
    maxQuantity: 200,
    reorderPoint: 75,
    targetStockLevel: 150,
    orderQuantity: 90,
    orderFrequency: 30,
    leadTime: 10,
    serviceLevel: 0.9,
    reviewPeriod: 7,
    abcxyzClass: 'CY',
    lastReviewed: '2023-06-14',
    nextReview: '2023-09-14',
  },
];

const columnHelper = createColumnHelper<typeof policies[0]>();

const policyTypeColors = {
  MIN_MAX: 'bg-blue-100 text-blue-800',
  REORDER_POINT: 'bg-green-100 text-green-800',
  PERIODIC_REVIEW: 'bg-purple-100 text-purple-800',
  KANBAN: 'bg-amber-100 text-amber-800',
};

const abcxyzClassColors = {
  AX: 'bg-green-100 text-green-800',
  AY: 'bg-green-100 text-green-800',
  AZ: 'bg-amber-100 text-amber-800',
  BX: 'bg-blue-100 text-blue-800',
  BY: 'bg-blue-100 text-blue-800',
  BZ: 'bg-amber-100 text-amber-800',
  CX: 'bg-purple-100 text-purple-800',
  CY: 'bg-purple-100 text-purple-800',
  CZ: 'bg-red-100 text-red-800',
};

export function InventoryPolicyList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    policyType: '',
    abcxyzClass: '',
  });

  const columns = [
    columnHelper.accessor('itemCode', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Item Code</span>
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
          <span>Item Name</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('policyType', {
      header: 'Policy Type',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${policyTypeColors[info.getValue()]}`}>
          {info.getValue().replace('_', ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('reorderPoint', {
      header: 'Reorder Point',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('minQuantity', {
      header: 'Min Qty',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('maxQuantity', {
      header: 'Max Qty',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('serviceLevel', {
      header: 'Service Level',
      cell: (info) => `${info.getValue() * 100}%`,
    }),
    columnHelper.accessor('abcxyzClass', {
      header: 'Class',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${abcxyzClassColors[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('lastReviewed', {
      header: 'Last Reviewed',
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
              navigate(`/inventory/optimization/policies/${info.getValue()}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              // Handle recalculation
              console.log('Recalculate:', info.getValue());
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const filteredData = policies.filter(item => {
    const matchesSearch = filters.search === '' || 
      item.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.itemName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = filters.location === '' || item.location === filters.location;
    const matchesPolicyType = filters.policyType === '' || item.policyType === filters.policyType;
    const matchesAbcxyzClass = filters.abcxyzClass === '' || item.abcxyzClass === filters.abcxyzClass;
    
    return matchesSearch && matchesLocation && matchesPolicyType && matchesAbcxyzClass;
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
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Inventory Policies</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('bulk-assign')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Bulk Assign Policies
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Policy
          </Button>
        </div>
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
                  placeholder="Search by item code or name"
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
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
              <Label htmlFor="policyType">Policy Type</Label>
              <Select
                id="policyType"
                value={filters.policyType}
                onChange={(e) => setFilters({ ...filters, policyType: e.target.value })}
              >
                <option value="">All Policy Types</option>
                <option value="MIN_MAX">Min-Max</option>
                <option value="REORDER_POINT">Reorder Point</option>
                <option value="PERIODIC_REVIEW">Periodic Review</option>
                <option value="KANBAN">Kanban</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="abcxyzClass">ABC/XYZ Class</Label>
              <Select
                id="abcxyzClass"
                value={filters.abcxyzClass}
                onChange={(e) => setFilters({ ...filters, abcxyzClass: e.target.value })}
              >
                <option value="">All Classes</option>
                <option value="AX">AX</option>
                <option value="AY">AY</option>
                <option value="AZ">AZ</option>
                <option value="BX">BX</option>
                <option value="BY">BY</option>
                <option value="BZ">BZ</option>
                <option value="CX">CX</option>
                <option value="CY">CY</option>
                <option value="CZ">CZ</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
        onRowClick={(row) => navigate(`/inventory/optimization/policies/${row.id}`)}
      />
    </div>
  );
}

export default InventoryPolicyList;