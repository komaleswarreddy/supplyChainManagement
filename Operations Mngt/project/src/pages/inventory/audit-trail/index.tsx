import React, { useState } from 'react';
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
import { History, Search, Filter, ArrowUpDown, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Mock data for audit trail
const auditEvents = [
  {
    id: 'audit-1',
    timestamp: '2023-06-20T14:30:00Z',
    action: 'ITEM_CREATED',
    user: 'John Doe',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'New item created in the system',
    ipAddress: '192.168.1.100',
    module: 'Inventory',
  },
  {
    id: 'audit-2',
    timestamp: '2023-06-20T14:35:00Z',
    action: 'STOCK_RECEIVED',
    user: 'John Doe',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Received 120 units from PO-2023-0042',
    ipAddress: '192.168.1.100',
    module: 'Inventory',
  },
  {
    id: 'audit-3',
    timestamp: '2023-06-20T15:10:00Z',
    action: 'BATCH_CREATED',
    user: 'John Doe',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Created batch LOT-2023-001 with 120 units',
    ipAddress: '192.168.1.100',
    module: 'Inventory',
  },
  {
    id: 'audit-4',
    timestamp: '2023-06-20T16:45:00Z',
    action: 'QUALITY_CHECK_COMPLETED',
    user: 'Jane Smith',
    userRole: 'Quality Inspector',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Quality check passed for batch LOT-2023-001',
    ipAddress: '192.168.1.101',
    module: 'Quality',
  },
  {
    id: 'audit-5',
    timestamp: '2023-06-21T09:15:00Z',
    action: 'STOCK_ISSUED',
    user: 'Sarah Johnson',
    userRole: 'Warehouse Operator',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Issued 10 units from batch LOT-2023-001 for order SO-2023-0187',
    ipAddress: '192.168.1.102',
    module: 'Inventory',
  },
  {
    id: 'audit-6',
    timestamp: '2023-06-21T11:30:00Z',
    action: 'RESERVATION_CREATED',
    user: 'John Doe',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Created reservation RES-2023-001 for 10 units',
    ipAddress: '192.168.1.100',
    module: 'Inventory',
  },
  {
    id: 'audit-7',
    timestamp: '2023-06-22T10:20:00Z',
    action: 'STOCK_ADJUSTED',
    user: 'Mike Wilson',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Adjusted stock by -2 units due to damage',
    ipAddress: '192.168.1.103',
    module: 'Inventory',
  },
  {
    id: 'audit-8',
    timestamp: '2023-06-23T14:15:00Z',
    action: 'ITEM_UPDATED',
    user: 'John Doe',
    userRole: 'Inventory Manager',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    details: 'Updated item description and specifications',
    ipAddress: '192.168.1.100',
    module: 'Inventory',
  },
];

const columnHelper = createColumnHelper<typeof auditEvents[0]>();

const actionColors = {
  ITEM_CREATED: 'success',
  STOCK_RECEIVED: 'success',
  BATCH_CREATED: 'success',
  QUALITY_CHECK_COMPLETED: 'success',
  STOCK_ISSUED: 'warning',
  RESERVATION_CREATED: 'secondary',
  STOCK_ADJUSTED: 'warning',
  ITEM_UPDATED: 'secondary',
};

export function InventoryAuditTrailPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    user: '',
    module: '',
  });

  const columns = [
    columnHelper.accessor('timestamp', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Timestamp</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PPp'),
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: (info) => (
        <Badge variant={actionColors[info.getValue()] as any}>
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('user', {
      header: 'User',
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.userRole}</div>
        </div>
      ),
    }),
    columnHelper.accessor('itemName', {
      header: 'Item',
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.itemCode}</div>
        </div>
      ),
    }),
    columnHelper.accessor('details', {
      header: 'Details',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('module', {
      header: 'Module',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('ipAddress', {
      header: 'IP Address',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // View audit detail
            console.log('View audit detail:', info.getValue());
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const filteredData = auditEvents.filter(event => {
    const matchesSearch = filters.search === '' || 
      event.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.itemCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.details.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.user.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesAction = filters.action === '' || event.action === filters.action;
    const matchesUser = filters.user === '' || event.user === filters.user;
    const matchesModule = filters.module === '' || event.module === filters.module;
    
    const matchesDateRange = !startDate || !endDate || 
      (new Date(event.timestamp) >= startDate && new Date(event.timestamp) <= endDate);
    
    return matchesSearch && matchesAction && matchesUser && matchesModule && matchesDateRange;
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
          <History className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Inventory Audit Trail</h1>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Audit Log
        </Button>
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
                  placeholder="Search audit trail"
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select
                id="action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option value="">All Actions</option>
                <option value="ITEM_CREATED">Item Created</option>
                <option value="STOCK_RECEIVED">Stock Received</option>
                <option value="BATCH_CREATED">Batch Created</option>
                <option value="QUALITY_CHECK_COMPLETED">Quality Check Completed</option>
                <option value="STOCK_ISSUED">Stock Issued</option>
                <option value="RESERVATION_CREATED">Reservation Created</option>
                <option value="STOCK_ADJUSTED">Stock Adjusted</option>
                <option value="ITEM_UPDATED">Item Updated</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="user">User</Label>
              <Select
                id="user"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              >
                <option value="">All Users</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Sarah Johnson">Sarah Johnson</option>
                <option value="Mike Wilson">Mike Wilson</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="module">Module</Label>
              <Select
                id="module"
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              >
                <option value="">All Modules</option>
                <option value="Inventory">Inventory</option>
                <option value="Quality">Quality</option>
                <option value="Warehouse">Warehouse</option>
              </Select>
            </div>
            <div>
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
          </div>
        </CardContent>
      </Card>

      <DataTable
        table={table}
      />
    </div>
  );
}

export default InventoryAuditTrailPage;