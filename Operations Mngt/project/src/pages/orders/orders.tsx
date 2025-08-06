import React, { useState, useMemo, useCallback } from 'react';
import { useOrders, useBulkOrderOperation } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreHorizontal, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Minus,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  Calendar,
  User,
  Tag,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { OrderStatus, OrderPriority, OrderType, PaymentStatus, Order, OrderFilters } from '@/types/order';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  PARTIALLY_SHIPPED: 'bg-cyan-100 text-cyan-800',
  RETURNED: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<OrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

type SortField = 'orderNumber' | 'customerName' | 'status' | 'totalAmount' | 'createdAt' | 'priority';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function OrderListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Prepare filters for API
  const apiFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: pageSize,
    sortBy: sortConfig.field,
    sortOrder: sortConfig.direction,
  }), [filters, debouncedSearchTerm, currentPage, pageSize, sortConfig]);

  // Fetch orders
  const { 
    data: ordersData, 
    isLoading, 
    error, 
    refetch 
  } = useOrders(apiFilters);

  // Bulk operations mutation
  const bulkOperationMutation = useBulkOrderOperation();

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!ordersData?.orders) return;
    
    const allSelected = ordersData.orders.every(order => selectedOrders.has(order.id));
    if (allSelected) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(ordersData.orders.map(order => order.id)));
    }
  }, [ordersData?.orders, selectedOrders]);

  const handleSelectOrder = useCallback((orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  }, [selectedOrders]);

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.size === 0) return;

    try {
      let operation: any = {
        orderIds: Array.from(selectedOrders),
        operation: bulkAction,
        parameters: {},
      };

      switch (bulkAction) {
        case 'UPDATE_STATUS':
          operation.parameters = { status: 'CONFIRMED' }; // Default status
          break;
        case 'ADD_TAGS':
          operation.parameters = { tags: ['bulk-processed'] };
          break;
        case 'CANCEL':
          operation.parameters = { reason: 'Bulk cancellation' };
          break;
      }

      await bulkOperationMutation.mutateAsync(operation);
      setSelectedOrders(new Set());
      setShowBulkDialog(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  // Handle export
  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.priority?.length) params.set('priority', filters.priority.join(','));
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    
    // Create export URL
    const exportUrl = `/api/orders/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Get selection state
  const getSelectionState = () => {
    if (!ordersData?.orders.length) return 'none';
    const selectedCount = selectedOrders.size;
    const totalCount = ordersData.orders.length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  };

  const selectionState = getSelectionState();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load orders. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => navigate('/orders/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search & Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by number, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status?.[0] || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      status: value === 'all' ? undefined : [value as OrderStatus] 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority?.[0] || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      priority: value === 'all' ? undefined : [value as OrderPriority] 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={filters.paymentStatus?.[0] || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      paymentStatus: value === 'all' ? undefined : [value as PaymentStatus] 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  value={filters.dateRange ? {
                    from: new Date(filters.dateRange.start),
                    to: new Date(filters.dateRange.end),
                  } : undefined}
                  onChange={(range) => {
                    if (range?.from && range?.to) {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: {
                          start: format(range.from, 'yyyy-MM-dd'),
                          end: format(range.to, 'yyyy-MM-dd'),
                        }
                      }));
                    } else {
                      setFilters(prev => {
                        const { dateRange, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(filters.status?.length || filters.priority?.length || filters.paymentStatus?.length || filters.dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.status?.map(status => (
                <Badge key={status} variant="secondary">
                  Status: {status}
                </Badge>
              ))}
              {filters.priority?.map(priority => (
                <Badge key={priority} variant="secondary">
                  Priority: {priority}
                </Badge>
              ))}
              {filters.paymentStatus?.map(status => (
                <Badge key={status} variant="secondary">
                  Payment: {status}
                </Badge>
              ))}
              {filters.dateRange && (
                <Badge variant="secondary">
                  Date: {format(new Date(filters.dateRange.start), 'MMM dd')} - {format(new Date(filters.dateRange.end), 'MMM dd')}
                </Badge>
              )}
              {debouncedSearchTerm && (
                <Badge variant="secondary">
                  Search: {debouncedSearchTerm}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              
              <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Actions</DialogTitle>
                    <DialogDescription>
                      Apply actions to {selectedOrders.size} selected orders
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPDATE_STATUS">Update Status</SelectItem>
                        <SelectItem value="ADD_TAGS">Add Tags</SelectItem>
                        <SelectItem value="CANCEL">Cancel Orders</SelectItem>
                        <SelectItem value="EXPORT">Export Selected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkAction}
                        disabled={!bulkAction || bulkOperationMutation.isPending}
                      >
                        {bulkOperationMutation.isPending ? 'Processing...' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {ordersData?.pagination.total || 0} total orders
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectionState === 'all'}
                        ref={(el) => {
                          if (el) el.indeterminate = selectionState === 'partial';
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('orderNumber')}
                      >
                        Order #
                        {sortConfig.field === 'orderNumber' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('customerName')}
                      >
                        Customer
                        {sortConfig.field === 'customerName' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.field === 'status' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('priority')}
                      >
                        Priority
                        {sortConfig.field === 'priority' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Amount
                        {sortConfig.field === 'totalAmount' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">Payment</th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('createdAt')}
                      >
                        Date
                        {sortConfig.field === 'createdAt' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedOrders.has(order.id)}
                          onCheckedChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          {order.orderNumber}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {order.customer.firstName} {order.customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={PRIORITY_COLORS[order.priority]}>
                          {order.priority}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.currency}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge 
                          variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}
                        >
                          {order.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(order.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/fulfillments`)}>
                              <Package className="mr-2 h-4 w-4" />
                              Fulfillments
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/shipments`)}>
                              <Truck className="mr-2 h-4 w-4" />
                              Shipments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                // Handle cancel order
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {ordersData?.orders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No orders found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters'
                      : 'Create your first order to get started'
                    }
                  </p>
                  {!debouncedSearchTerm && Object.keys(filters).length === 0 && (
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/orders/create')}
                    >
                      Create Order
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {ordersData && ordersData.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, ordersData.pagination.total)} of {ordersData.pagination.total} orders
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, ordersData.pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      ordersData.pagination.totalPages - 4,
                      currentPage - 2
                    )) + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(ordersData.pagination.totalPages, prev + 1))}
                  disabled={currentPage === ordersData.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(ordersData.pagination.totalPages)}
                  disabled={currentPage === ordersData.pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 