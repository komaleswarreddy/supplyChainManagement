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
import { Calculator, Plus, Search, Filter, ArrowUpDown, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for reorder points
const reorderPoints = [
  {
    id: 'rop-1',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    location: 'Main Warehouse',
    averageDailyDemand: 25,
    leadTime: 7,
    safetyStock: 85,
    reorderPoint: 260,
    manualOverride: false,
    lastCalculated: '2023-06-15',
    nextReview: '2023-07-15',
  },
  {
    id: 'rop-2',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    location: 'Main Warehouse',
    averageDailyDemand: 5,
    leadTime: 14,
    safetyStock: 32,
    reorderPoint: 102,
    manualOverride: true,
    manualValue: 120,
    lastCalculated: '2023-06-10',
    nextReview: '2023-07-10',
  },
  {
    id: 'rop-3',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    location: 'East Coast DC',
    averageDailyDemand: 50,
    leadTime: 5,
    safetyStock: 120,
    reorderPoint: 370,
    manualOverride: false,
    lastCalculated: '2023-06-12',
    nextReview: '2023-07-12',
  },
  {
    id: 'rop-4',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    location: 'West Coast DC',
    averageDailyDemand: 2,
    leadTime: 21,
    safetyStock: 15,
    reorderPoint: 57,
    manualOverride: false,
    lastCalculated: '2023-06-08',
    nextReview: '2023-07-08',
  },
  {
    id: 'rop-5',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    location: 'Main Warehouse',
    averageDailyDemand: 15,
    leadTime: 10,
    safetyStock: 60,
    reorderPoint: 210,
    manualOverride: false,
    lastCalculated: '2023-06-14',
    nextReview: '2023-07-14',
  },
];

const columnHelper = createColumnHelper<typeof reorderPoints[0]>();

export function ReorderPointList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    manualOverride: '',
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
    columnHelper.accessor('averageDailyDemand', {
      header: 'Avg. Demand',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('leadTime', {
      header: 'Lead Time',
      cell: (info) => `${info.getValue()} days`,
    }),
    columnHelper.accessor('safetyStock', {
      header: 'Safety Stock',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('reorderPoint', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Reorder Point</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium">
          {info.row.original.manualOverride ? (
            <div className="flex items-center">
              <span>{info.getValue()}</span>
              <Badge variant="outline" className="ml-2 text-xs">Manual</Badge>
            </div>
          ) : (
            info.getValue()
          )}
        </div>
      ),
    }),
    columnHelper.accessor('lastCalculated', {
      header: 'Last Calculated',
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
              navigate(`/inventory/optimization/reorder-points/${info.getValue()}`);
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

  const filteredData = reorderPoints.filter(item => {
    const matchesSearch = filters.search === '' || 
      item.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.itemName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = filters.location === '' || item.location === filters.location;
    const matchesManualOverride = filters.manualOverride === '' || 
      (filters.manualOverride === 'true' && item.manualOverride) ||
      (filters.manualOverride === 'false' && !item.manualOverride);
    
    return matchesSearch && matchesLocation && matchesManualOverride;
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
          <Calculator className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Reorder Points</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => console.log('Bulk calculate')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Bulk Calculate
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Calculation
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="manualOverride">Manual Override</Label>
              <Select
                id="manualOverride"
                value={filters.manualOverride}
                onChange={(e) => setFilters({ ...filters, manualOverride: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Manual Override</option>
                <option value="false">Automatic</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
        onRowClick={(row) => navigate(`/inventory/optimization/reorder-points/${row.id}`)}
      />
    </div>
  );
}