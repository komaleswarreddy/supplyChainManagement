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
import { Layers, Plus, Search, Filter, ArrowUpDown, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// Mock data for ABC/XYZ classification
const classifications = [
  {
    id: 'cls-1',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    location: 'Main Warehouse',
    annualConsumptionValue: 125000,
    annualConsumptionQuantity: 500,
    consumptionVariability: 0.3,
    abcClass: 'A',
    xyzClass: 'X',
    combinedClass: 'AX',
    manualOverride: false,
    lastCalculated: '2023-06-15',
    nextReview: '2023-09-15',
  },
  {
    id: 'cls-2',
    itemCode: 'ITEM-0042',
    itemName: 'Laptop Docking Station',
    location: 'Main Warehouse',
    annualConsumptionValue: 75000,
    annualConsumptionQuantity: 150,
    consumptionVariability: 0.8,
    abcClass: 'A',
    xyzClass: 'Y',
    combinedClass: 'AY',
    manualOverride: false,
    lastCalculated: '2023-06-10',
    nextReview: '2023-09-10',
  },
  {
    id: 'cls-3',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    location: 'East Coast DC',
    annualConsumptionValue: 25000,
    annualConsumptionQuantity: 2500,
    consumptionVariability: 0.4,
    abcClass: 'B',
    xyzClass: 'X',
    combinedClass: 'BX',
    manualOverride: true,
    manualClass: 'BX',
    lastCalculated: '2023-06-12',
    nextReview: '2023-09-12',
  },
  {
    id: 'cls-4',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    location: 'West Coast DC',
    annualConsumptionValue: 45000,
    annualConsumptionQuantity: 90,
    consumptionVariability: 1.2,
    abcClass: 'B',
    xyzClass: 'Z',
    combinedClass: 'BZ',
    manualOverride: false,
    lastCalculated: '2023-06-08',
    nextReview: '2023-09-08',
  },
  {
    id: 'cls-5',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    location: 'Main Warehouse',
    annualConsumptionValue: 18000,
    annualConsumptionQuantity: 300,
    consumptionVariability: 0.6,
    abcClass: 'C',
    xyzClass: 'Y',
    combinedClass: 'CY',
    manualOverride: false,
    lastCalculated: '2023-06-14',
    nextReview: '2023-09-14',
  },
];

const columnHelper = createColumnHelper<typeof classifications[0]>();

const abcClassColors = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-purple-100 text-purple-800',
};

const xyzClassColors = {
  X: 'bg-green-100 text-green-800',
  Y: 'bg-amber-100 text-amber-800',
  Z: 'bg-red-100 text-red-800',
};

export function ClassificationList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    abcClass: '',
    xyzClass: '',
    combinedClass: '',
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
    columnHelper.accessor('annualConsumptionValue', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Annual Value</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('annualConsumptionQuantity', {
      header: 'Annual Qty',
      cell: (info) => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor('consumptionVariability', {
      header: 'Variability',
      cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('abcClass', {
      header: 'ABC',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${abcClassColors[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('xyzClass', {
      header: 'XYZ',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${xyzClassColors[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('combinedClass', {
      header: 'Combined',
      cell: (info) => (
        <div>
          <span className="font-medium">{info.getValue()}</span>
          {info.row.original.manualOverride && (
            <Badge variant="outline" className="ml-2 text-xs">Manual</Badge>
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
              navigate(`/inventory/optimization/classification/${info.getValue()}`);
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

  const filteredData = classifications.filter(item => {
    const matchesSearch = filters.search === '' || 
      item.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.itemName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = filters.location === '' || item.location === filters.location;
    const matchesAbcClass = filters.abcClass === '' || item.abcClass === filters.abcClass;
    const matchesXyzClass = filters.xyzClass === '' || item.xyzClass === filters.xyzClass;
    const matchesCombinedClass = filters.combinedClass === '' || item.combinedClass === filters.combinedClass;
    
    return matchesSearch && matchesLocation && matchesAbcClass && matchesXyzClass && matchesCombinedClass;
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
          <h1 className="text-3xl font-bold">ABC/XYZ Classification</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => console.log('Bulk classify')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Bulk Classify
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Classification
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Label htmlFor="abcClass">ABC Class</Label>
              <Select
                id="abcClass"
                value={filters.abcClass}
                onChange={(e) => setFilters({ ...filters, abcClass: e.target.value })}
              >
                <option value="">All Classes</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="xyzClass">XYZ Class</Label>
              <Select
                id="xyzClass"
                value={filters.xyzClass}
                onChange={(e) => setFilters({ ...filters, xyzClass: e.target.value })}
              >
                <option value="">All Classes</option>
                <option value="X">X</option>
                <option value="Y">Y</option>
                <option value="Z">Z</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="combinedClass">Combined Class</Label>
              <Select
                id="combinedClass"
                value={filters.combinedClass}
                onChange={(e) => setFilters({ ...filters, combinedClass: e.target.value })}
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
        onRowClick={(row) => navigate(`/inventory/optimization/classification/${row.id}`)}
      />
    </div>
  );
}