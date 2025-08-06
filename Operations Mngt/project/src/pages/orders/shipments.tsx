import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShipments, useUpdateShipmentStatus, useTrackShipment } from '@/services/order';
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
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  MapPin, 
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
  Package,
  User,
  Calendar,
  ExternalLink,
  Navigation,
  DollarSign,
  Weight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ShipmentStatus } from '@/types/order';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  PICKED_UP: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  EXCEPTION: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS: Record<ShipmentStatus, React.ReactNode> = {
  CREATED: <Package className="h-3 w-3" />,
  PICKED_UP: <Truck className="h-3 w-3" />,
  IN_TRANSIT: <Navigation className="h-3 w-3" />,
  OUT_FOR_DELIVERY: <MapPin className="h-3 w-3" />,
  DELIVERED: <CheckCircle className="h-3 w-3" />,
  EXCEPTION: <AlertCircle className="h-3 w-3" />,
  RETURNED: <RefreshCw className="h-3 w-3" />,
};

export default function ShipmentsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set());
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

  // Fetch shipments
  const { 
    data: shipments, 
    isLoading, 
    error, 
    refetch 
  } = useShipments(orderId || undefined);

  // Mutations
  const updateStatusMutation = useUpdateShipmentStatus();
  const trackShipmentMutation = useTrackShipment();

  // Filter and sort shipments
  const filteredAndSortedShipments = useMemo(() => {
    if (!shipments) return [];

    let filtered = shipments.filter(shipment => {
      const matchesSearch = !debouncedSearchTerm || 
        shipment.shipmentNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        shipment.carrierName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        shipment.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = !statusFilter || shipment.status === statusFilter;
      const matchesCarrier = !carrierFilter || shipment.carrierId === carrierFilter;
      
      const matchesDateRange = !dateRange || (
        new Date(shipment.createdAt) >= new Date(dateRange.start) &&
        new Date(shipment.createdAt) <= new Date(dateRange.end)
      );

      return matchesSearch && matchesStatus && matchesCarrier && matchesDateRange;
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
  }, [shipments, debouncedSearchTerm, statusFilter, carrierFilter, dateRange, sortConfig]);

  // Pagination
  const paginatedShipments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedShipments.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedShipments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedShipments.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedShipments.size === paginatedShipments.length) {
      setSelectedShipments(new Set());
    } else {
      setSelectedShipments(new Set(paginatedShipments.map(s => s.id)));
    }
  };

  const handleSelectShipment = (shipmentId: string) => {
    const newSelected = new Set(selectedShipments);
    if (newSelected.has(shipmentId)) {
      newSelected.delete(shipmentId);
    } else {
      newSelected.add(shipmentId);
    }
    setSelectedShipments(newSelected);
  };

  // Handle status update
  const handleStatusUpdate = async (shipmentId: string, newStatus: ShipmentStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: shipmentId, status: newStatus });
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  };

  // Handle tracking update
  const handleTrackingUpdate = async (shipmentId: string) => {
    try {
      await trackShipmentMutation.mutateAsync(shipmentId);
    } catch (error) {
      console.error('Failed to update tracking:', error);
    }
  };

  // Handle bulk tracking update
  const handleBulkTrackingUpdate = async () => {
    try {
      const promises = Array.from(selectedShipments).map(id =>
        trackShipmentMutation.mutateAsync(id)
      );
      await Promise.all(promises);
      setSelectedShipments(new Set());
    } catch (error) {
      console.error('Failed to update tracking:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCarrierFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  // Get unique carriers for filter
  const carriers = useMemo(() => {
    if (!shipments) return [];
    const unique = Array.from(new Set(
      shipments
        .filter(s => s.carrierName)
        .map(s => ({ id: s.carrierId, name: s.carrierName }))
    ));
    return unique;
  }, [shipments]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load shipments. Please try again.
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
            {orderId ? `Order Shipments` : 'All Shipments'}
          </h1>
          <p className="text-muted-foreground">
            {orderId ? `Shipments for order ${orderId}` : 'Track and manage order shipments'}
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
            onClick={handleBulkTrackingUpdate}
            disabled={selectedShipments.size === 0 || trackShipmentMutation.isPending}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            Update Tracking
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => navigate('/orders/shipments/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Shipment
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
              placeholder="Search by shipment number, tracking number, carrier, or order ID..."
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
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="EXCEPTION">Exception</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Carrier</label>
                <Select
                  value={carrierFilter || 'all'}
                  onValueChange={v => setCarrierFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Carriers</SelectItem>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id || ''}>
                        {carrier.name}
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
          {(statusFilter || carrierFilter || dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary">
                  Status: {statusFilter.replace('_', ' ')}
                </Badge>
              )}
              {carrierFilter && (
                <Badge variant="secondary">
                  Carrier: {carriers.find(c => c.id === carrierFilter)?.name}
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
      {selectedShipments.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedShipments.size} shipment{selectedShipments.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedShipments(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkTrackingUpdate}
                  disabled={trackShipmentMutation.isPending}
                  className="gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Update Tracking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipments</CardTitle>
              <CardDescription>
                {filteredAndSortedShipments.length} of {shipments?.length || 0} shipments
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
              <span className="ml-2">Loading shipments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedShipments.size === paginatedShipments.length && paginatedShipments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('shipmentNumber')}
                      >
                        Shipment #
                        {sortConfig.field === 'shipmentNumber' && (
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
                    
                    <th className="text-left p-4">Carrier</th>
                    <th className="text-left p-4">Tracking</th>
                    <th className="text-left p-4">Destination</th>
                    <th className="text-left p-4">Cost</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('estimatedDeliveryDate')}
                      >
                        Est. Delivery
                        {sortConfig.field === 'estimatedDeliveryDate' && (
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
                  {paginatedShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedShipments.has(shipment.id)}
                          onCheckedChange={() => handleSelectShipment(shipment.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/orders/shipments/${shipment.id}`)}
                        >
                          {shipment.shipmentNumber}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/orders/${shipment.orderId}`)}
                        >
                          {shipment.orderId.slice(-8)}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[shipment.status]}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[shipment.status]}
                            {shipment.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{shipment.carrierName}</div>
                            <div className="text-sm text-muted-foreground">{shipment.serviceType}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-mono text-sm">{shipment.trackingNumber}</div>
                            {shipment.trackingUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={() => window.open(shipment.trackingUrl, '_blank')}
                              >
                                Track <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{shipment.shippingAddress.city}, {shipment.shippingAddress.state}</div>
                            <div className="text-muted-foreground">{shipment.shippingAddress.country}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${shipment.shippingCost.toLocaleString()}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {shipment.estimatedDeliveryDate ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(parseISO(shipment.estimatedDeliveryDate), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/shipments/${shipment.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/shipments/${shipment.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Shipment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTrackingUpdate(shipment.id)}>
                              <Navigation className="mr-2 h-4 w-4" />
                              Update Tracking
                            </DropdownMenuItem>
                            {shipment.trackingUrl && (
                              <DropdownMenuItem onClick={() => window.open(shipment.trackingUrl, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Track Online
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'IN_TRANSIT')}>
                              <Navigation className="mr-2 h-4 w-4" />
                              Mark In Transit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'OUT_FOR_DELIVERY')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark Out for Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'DELIVERED')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedShipments.length === 0 && (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No shipments found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || statusFilter || carrierFilter || dateRange
                      ? 'Try adjusting your search or filters'
                      : 'No shipments have been created yet'
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedShipments.length)} of {filteredAndSortedShipments.length} shipments
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