import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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

// Mock data for safety stock
const safetyStocks = [
  {
    id: 'ss-1',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    location: 'Main Warehouse',
    serviceLevel: 0.95,
    leadTime: 7,
    demandAverage: 25,
    safetyStock: 85,
    lastCalculated: '2023-06-15',
    nextReview: '2023-07-15',
  },
  {
    id: 'ss-2',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    location: 'Main Warehouse',
    serviceLevel: 0.99,
    leadTime: 14,
    demandAverage: 5,
    safetyStock: 32,
    lastCalculated: '2023-06-10',
    nextReview: '2023-07-10',
  },
  {
    id: 'ss-3',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    location: 'East Coast DC',
    serviceLevel: 0.9,
    leadTime: 5,
    demandAverage: 50,
    safetyStock: 120,
    lastCalculated: '2023-06-12',
    nextReview: '2023-07-12',
  },
  {
    id: 'ss-4',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    location: 'West Coast DC',
    serviceLevel: 0.95,
    leadTime: 21,
    demandAverage: 2,
    safetyStock: 15,
    lastCalculated: '2023-06-08',
    nextReview: '2023-07-08',
  },
  {
    id: 'ss-5',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    location: 'Main Warehouse',
    serviceLevel: 0.9,
    leadTime: 10,
    demandAverage: 15,
    safetyStock: 60,
    lastCalculated: '2023-06-14',
    nextReview: '2023-07-14',
  },
];

const columnHelper = createColumnHelper<typeof safetyStocks[0]>();

export function SafetyStockList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    serviceLevel: '',
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
    columnHelper.accessor('serviceLevel', {
      header: 'Service Level',
      cell: (info) => `${info.getValue() * 100}%`,
    }),
    columnHelper.accessor('leadTime', {
      header: 'Lead Time',
      cell: (info) => `${info.getValue()} days`,
    }),
    columnHelper.accessor('demandAverage', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Avg. Demand</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('safetyStock', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Safety Stock</span>
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
              navigate(`/inventory/optimization/safety-stock/${info.getValue()}`);
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

  const filteredData = safetyStocks.filter(item => {
    const matchesSearch = filters.search === '' || 
      item.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.itemName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = filters.location === '' || item.location === filters.location;
    const matchesServiceLevel = filters.serviceLevel === '' || 
      item.serviceLevel === parseFloat(filters.serviceLevel);
    
    return matchesSearch && matchesLocation && matchesServiceLevel;
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
          <h1 className="text-3xl font-bold">Safety Stock</h1>
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
              <Label htmlFor="serviceLevel">Service Level</Label>
              <Select
                id="serviceLevel"
                value={filters.serviceLevel}
                onChange={(e) => setFilters({ ...filters, serviceLevel: e.target.value })}
              >
                <option value="">All Service Levels</option>
                <option value="0.9">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
        onRowClick={(row) => navigate(`/inventory/optimization/safety-stock/${row.id}`)}
      />
    </div>
  );
}