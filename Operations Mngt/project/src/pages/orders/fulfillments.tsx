import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFulfillments, useUpdateFulfillmentStatus } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Warehouse,
  User,
  Calendar,
  MapPin,
  Package as Barcode
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FulfillmentStatus } from '@/types/order';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PICKED: 'bg-indigo-100 text-indigo-800',
  PACKED: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-200 text-green-900',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<FulfillmentStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  PROCESSING: <Package className="h-3 w-3" />,
  PICKED: <CheckCircle className="h-3 w-3" />,
  PACKED: <Package className="h-3 w-3" />,
  SHIPPED: <Truck className="h-3 w-3" />,
  DELIVERED: <CheckCircle className="h-3 w-3" />,
  CANCELLED: <AlertCircle className="h-3 w-3" />,
};

export default function FulfillmentListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | ''>('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedFulfillments, setSelectedFulfillments] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get orderId from URL params if present
  const orderId = searchParams.get('orderId');

  // Fetch fulfillments
  const { 
    data: fulfillments, 
    isLoading, 
    error, 
    refetch 
  } = useFulfillments(orderId || undefined);

  // Mutations
  const updateStatusMutation = useUpdateFulfillmentStatus();

  // Filter and sort fulfillments
  const filteredAndSortedFulfillments = useMemo(() => {
    if (!fulfillments) return [];

    let filtered = fulfillments.filter(fulfillment => {
      const matchesSearch = !debouncedSearchTerm || 
        fulfillment.fulfillmentNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        fulfillment.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        fulfillment.warehouseName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = !statusFilter || fulfillment.status === statusFilter;
      const matchesWarehouse = !warehouseFilter || fulfillment.warehouseId === warehouseFilter;
      
      const matchesDateRange = !dateRange || (
        new Date(fulfillment.createdAt) >= new Date(dateRange.start) &&
        new Date(fulfillment.createdAt) <= new Date(dateRange.end)
      );

      return matchesSearch && matchesStatus && matchesWarehouse && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof typeof a];
      const bValue = b[sortConfig.field as keyof typeof b];
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [fulfillments, debouncedSearchTerm, statusFilter, warehouseFilter, dateRange, sortConfig]);

  // Pagination
  const paginatedFulfillments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedFulfillments.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedFulfillments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedFulfillments.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedFulfillments.size === paginatedFulfillments.length) {
      setSelectedFulfillments(new Set());
    } else {
      setSelectedFulfillments(new Set(paginatedFulfillments.map(f => f.id)));
    }
  };

  const handleSelectFulfillment = (fulfillmentId: string) => {
    const newSelected = new Set(selectedFulfillments);
    if (newSelected.has(fulfillmentId)) {
      newSelected.delete(fulfillmentId);
    } else {
      newSelected.add(fulfillmentId);
    }
    setSelectedFulfillments(newSelected);
  };

  // Handle status update
  const handleStatusUpdate = async (fulfillmentId: string, newStatus: FulfillmentStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: fulfillmentId, status: newStatus });
    } catch (error) {
      console.error('Failed to update fulfillment status:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: FulfillmentStatus) => {
    try {
      const promises = Array.from(selectedFulfillments).map(id =>
        updateStatusMutation.mutateAsync({ id, status: newStatus })
      );
      await Promise.all(promises);
      setSelectedFulfillments(new Set());
    } catch (error) {
      console.error('Failed to update fulfillment statuses:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setWarehouseFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  // Get unique warehouses for filter
  const warehouses = useMemo(() => {
    if (!fulfillments) return [];
    const unique = Array.from(new Set(
      fulfillments
        .filter(f => f.warehouseName)
        .map(f => ({ id: f.warehouseId, name: f.warehouseName }))
    ));
    return unique;
  }, [fulfillments]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load fulfillments. Please try again.
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
          <h1 className="text-3xl font-bold">
            {orderId ? `Order Fulfillments` : 'All Fulfillments'}
          </h1>
          <p className="text-muted-foreground">
            {orderId ? `Fulfillments for order ${orderId}` : 'Manage and track order fulfillments'}
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
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => navigate('/orders/fulfillments/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Fulfillment
          </Button>
        </div>
      </div>

      {/* Filters */}
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
              placeholder="Search by fulfillment number, order ID, or warehouse..."
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
                  value={statusFilter || 'all'}
                  onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="PICKED">Picked</SelectItem>
                    <SelectItem value="PACKED">Packed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse</label>
                <Select
                  value={warehouseFilter || 'all'}
                  onValueChange={v => setWarehouseFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id || ''}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  value={dateRange ? {
                    from: new Date(dateRange.start),
                    to: new Date(dateRange.end),
                  } : undefined}
                  onChange={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({
                        start: format(range.from, 'yyyy-MM-dd'),
                        end: format(range.to, 'yyyy-MM-dd'),
                      });
                    } else {
                      setDateRange(undefined);
                    }
                  }}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(statusFilter || warehouseFilter || dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary">
                  Status: {statusFilter}
                </Badge>
              )}
              {warehouseFilter && (
                <Badge variant="secondary">
                  Warehouse: {warehouses.find(w => w.id === warehouseFilter)?.name}
                </Badge>
              )}
              {dateRange && (
                <Badge variant="secondary">
                  Date: {format(new Date(dateRange.start), 'MMM dd')} - {format(new Date(dateRange.end), 'MMM dd')}
                </Badge>
              )}
              {debouncedSearchTerm && (
                <Badge variant="secondary">
                  Search: {debouncedSearchTerm}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedFulfillments.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedFulfillments.size} fulfillment{selectedFulfillments.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFulfillments(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PROCESSING')}>
                      Mark as Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PICKED')}>
                      Mark as Picked
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PACKED')}>
                      Mark as Packed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('SHIPPED')}>
                      Mark as Shipped
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fulfillments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fulfillments</CardTitle>
              <CardDescription>
                {filteredAndSortedFulfillments.length} of {fulfillments?.length || 0} fulfillments
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
              <span className="ml-2">Loading fulfillments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedFulfillments.size === paginatedFulfillments.length && paginatedFulfillments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('fulfillmentNumber')}
                      >
                        Fulfillment #
                        {sortConfig.field === 'fulfillmentNumber' && (
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
                        onClick={() => handleSort('orderId')}
                      >
                        Order
                        {sortConfig.field === 'orderId' && (
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
                    
                    <th className="text-left p-4">Warehouse</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Tracking</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
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
                  {paginatedFulfillments.map((fulfillment) => (
                    <tr key={fulfillment.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedFulfillments.has(fulfillment.id)}
                          onCheckedChange={() => handleSelectFulfillment(fulfillment.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}`)}
                        >
                          {fulfillment.fulfillmentNumber}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/orders/${fulfillment.orderId}`)}
                        >
                          {fulfillment.orderId.slice(-8)}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[fulfillment.status]}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[fulfillment.status]}
                            {fulfillment.status}
                          </span>
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        {fulfillment.warehouseName ? (
                          <div className="flex items-center gap-1">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            <span>{fulfillment.warehouseName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{fulfillment.items.length} items</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {fulfillment.trackingNumber ? (
                          <div className="flex items-center gap-1">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{fulfillment.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(fulfillment.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Fulfillment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(fulfillment.id, 'PROCESSING')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(fulfillment.id, 'PICKED')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Picked
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(fulfillment.id, 'PACKED')}>
                              <Package className="mr-2 h-4 w-4" />
                              Mark Packed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(fulfillment.id, 'SHIPPED')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark Shipped
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedFulfillments.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No fulfillments found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || statusFilter || warehouseFilter || dateRange
                      ? 'Try adjusting your search or filters'
                      : 'No fulfillments have been created yet'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedFulfillments.length)} of {filteredAndSortedFulfillments.length} fulfillments
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      totalPages - 4,
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
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