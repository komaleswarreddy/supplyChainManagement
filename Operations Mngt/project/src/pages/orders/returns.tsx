import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReturns, useUpdateReturnStatus, useCreateReturn } from '@/services/order';
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
  RotateCcw, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
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
  DollarSign,
  FileText,
  Image,
  Truck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ReturnStatus, ReturnReason } from '@/types/order';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_COLORS: Record<ReturnStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-indigo-100 text-indigo-800',
  INSPECTED: 'bg-purple-100 text-purple-800',
  PROCESSED: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-green-200 text-green-900',
};

const STATUS_ICONS: Record<ReturnStatus, React.ReactNode> = {
  REQUESTED: <Clock className="h-3 w-3" />,
  APPROVED: <CheckCircle className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
  RECEIVED: <Package className="h-3 w-3" />,
  INSPECTED: <Eye className="h-3 w-3" />,
  PROCESSED: <CheckCircle className="h-3 w-3" />,
  REFUNDED: <DollarSign className="h-3 w-3" />,
};

const REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: 'Defective Product',
  WRONG_ITEM: 'Wrong Item Received',
  NOT_AS_DESCRIBED: 'Not as Described',
  DAMAGED: 'Damaged in Shipping',
  CHANGED_MIND: 'Changed Mind',
  SIZE_ISSUE: 'Size Issue',
  OTHER: 'Other',
};

export default function ReturnsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');
  const [reasonFilter, setReasonFilter] = useState<ReturnReason | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedReturns, setSelectedReturns] = useState<Set<string>>(new Set());
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

  // Fetch returns
  const { 
    data: returns, 
    isLoading, 
    error, 
    refetch 
  } = useReturns(orderId || undefined);

  // Mutations
  const updateStatusMutation = useUpdateReturnStatus();

  // Filter and sort returns
  const filteredAndSortedReturns = useMemo(() => {
    if (!returns) return [];

    let filtered = returns.filter(returnItem => {
      const matchesSearch = !debouncedSearchTerm || 
        returnItem.returnNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        returnItem.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        returnItem.reasonDescription?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = !statusFilter || returnItem.status === statusFilter;
      const matchesReason = !reasonFilter || returnItem.reason === reasonFilter;
      
      const matchesDateRange = !dateRange || (
        new Date(returnItem.createdAt) >= new Date(dateRange.start) &&
        new Date(returnItem.createdAt) <= new Date(dateRange.end)
      );

      return matchesSearch && matchesStatus && matchesReason && matchesDateRange;
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
  }, [returns, debouncedSearchTerm, statusFilter, reasonFilter, dateRange, sortConfig]);

  // Pagination
  const paginatedReturns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedReturns.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedReturns, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedReturns.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedReturns.size === paginatedReturns.length) {
      setSelectedReturns(new Set());
    } else {
      setSelectedReturns(new Set(paginatedReturns.map(r => r.id)));
    }
  };

  const handleSelectReturn = (returnId: string) => {
    const newSelected = new Set(selectedReturns);
    if (newSelected.has(returnId)) {
      newSelected.delete(returnId);
    } else {
      newSelected.add(returnId);
    }
    setSelectedReturns(newSelected);
  };

  // Handle status update
  const handleStatusUpdate = async (returnId: string, newStatus: ReturnStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: returnId, status: newStatus });
    } catch (error) {
      console.error('Failed to update return status:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: ReturnStatus) => {
    try {
      const promises = Array.from(selectedReturns).map(id =>
        updateStatusMutation.mutateAsync({ id, status: newStatus })
      );
      await Promise.all(promises);
      setSelectedReturns(new Set());
    } catch (error) {
      console.error('Failed to update return statuses:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setReasonFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load returns. Please try again.
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
            {orderId ? `Order Returns` : 'All Returns'}
          </h1>
          <p className="text-muted-foreground">
            {orderId ? `Returns for order ${orderId}` : 'Manage and process order returns'}
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
            onClick={() => navigate('/orders/returns/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Return
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
              placeholder="Search by return number, order ID, or reason..."
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
                    <SelectItem value="REQUESTED">Requested</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="INSPECTED">Inspected</SelectItem>
                    <SelectItem value="PROCESSED">Processed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Select
                  value={reasonFilter || 'all'}
                  onValueChange={v => setReasonFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    {Object.entries(REASON_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
          {(statusFilter || reasonFilter || dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary">
                  Status: {statusFilter}
                </Badge>
              )}
              {reasonFilter && (
                <Badge variant="secondary">
                  Reason: {REASON_LABELS[reasonFilter as ReturnReason]}
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
      {selectedReturns.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedReturns.size} return{selectedReturns.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReturns(new Set())}
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
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('APPROVED')}>
                      Approve Returns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('REJECTED')}>
                      Reject Returns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('RECEIVED')}>
                      Mark as Received
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('INSPECTED')}>
                      Mark as Inspected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('PROCESSED')}>
                      Mark as Processed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Returns</CardTitle>
              <CardDescription>
                {filteredAndSortedReturns.length} of {returns?.length || 0} returns
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
              <span className="ml-2">Loading returns...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedReturns.size === paginatedReturns.length && paginatedReturns.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('returnNumber')}
                      >
                        Return #
                        {sortConfig.field === 'returnNumber' && (
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
                    
                    <th className="text-left p-4">Reason</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('totalRefund')}
                      >
                        Refund Amount
                        {sortConfig.field === 'totalRefund' && (
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
                  {paginatedReturns.map((returnItem) => (
                    <tr key={returnItem.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedReturns.has(returnItem.id)}
                          onCheckedChange={() => handleSelectReturn(returnItem.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/orders/returns/${returnItem.id}`)}
                        >
                          {returnItem.returnNumber}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/orders/${returnItem.orderId}`)}
                        >
                          {returnItem.orderId.slice(-8)}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[returnItem.status]}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[returnItem.status]}
                            {returnItem.status}
                          </span>
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{REASON_LABELS[returnItem.reason as ReturnReason]}</div>
                          {returnItem.reasonDescription && (
                            <div className="text-sm text-muted-foreground truncate max-w-32">
                              {returnItem.reasonDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{returnItem.items.length} items</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            ${returnItem.totalRefund.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(returnItem.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => navigate(`/orders/returns/${returnItem.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/returns/${returnItem.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Return
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {returnItem.status === 'REQUESTED' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'APPROVED')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Return
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'REJECTED')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject Return
                                </DropdownMenuItem>
                              </>
                            )}
                            {returnItem.status === 'APPROVED' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'RECEIVED')}>
                                <Package className="mr-2 h-4 w-4" />
                                Mark Received
                              </DropdownMenuItem>
                            )}
                            {returnItem.status === 'RECEIVED' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'INSPECTED')}>
                                <Eye className="mr-2 h-4 w-4" />
                                Mark Inspected
                              </DropdownMenuItem>
                            )}
                            {returnItem.status === 'INSPECTED' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'PROCESSED')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Processed
                              </DropdownMenuItem>
                            )}
                            {returnItem.status === 'PROCESSED' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(returnItem.id, 'REFUNDED')}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {returnItem.images && returnItem.images.length > 0 && (
                              <DropdownMenuItem>
                                <Image className="mr-2 h-4 w-4" />
                                View Images ({returnItem.images.length})
                              </DropdownMenuItem>
                            )}
                            {returnItem.trackingNumber && (
                              <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Track Return
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedReturns.length === 0 && (
                <div className="text-center py-8">
                  <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No returns found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || statusFilter || reasonFilter || dateRange
                      ? 'Try adjusting your search or filters'
                      : 'No returns have been created yet'
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedReturns.length)} of {filteredAndSortedReturns.length} returns
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