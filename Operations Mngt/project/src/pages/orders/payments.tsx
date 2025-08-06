import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayments, useProcessPayment, useRefundPayment } from '@/services/order';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
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
  User,
  Calendar,
  DollarSign,
  FileText,
  RotateCcw,
  Building,
  Banknote,
  Smartphone
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PaymentStatus, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  PROCESSING: <RefreshCw className="h-3 w-3" />,
  COMPLETED: <CheckCircle className="h-3 w-3" />,
  FAILED: <XCircle className="h-3 w-3" />,
  CANCELLED: <AlertCircle className="h-3 w-3" />,
  REFUNDED: <RotateCcw className="h-3 w-3" />,
  PARTIALLY_REFUNDED: <RotateCcw className="h-3 w-3" />,
};

const METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  CREDIT_CARD: <CreditCard className="h-4 w-4" />,
  DEBIT_CARD: <CreditCard className="h-4 w-4" />,
  BANK_TRANSFER: <Building className="h-4 w-4" />,
  PAYPAL: <Smartphone className="h-4 w-4" />,
  CASH: <Banknote className="h-4 w-4" />,
  CHECK: <FileText className="h-4 w-4" />,
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  BANK_TRANSFER: 'Bank Transfer',
  PAYPAL: 'PayPal',
  CASH: 'Cash',
  CHECK: 'Check',
};

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
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

  // Fetch payments
  const { 
    data: payments, 
    isLoading, 
    error, 
    refetch 
  } = usePayments(orderId || undefined);

  // Mutations
  const refundPaymentMutation = useRefundPayment();

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    if (!payments) return [];

    let filtered = payments.filter(payment => {
      const matchesSearch = !debouncedSearchTerm || 
        payment.paymentNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        payment.cardLast4?.includes(debouncedSearchTerm);

      const matchesStatus = !statusFilter || payment.status === statusFilter;
      const matchesMethod = !methodFilter || payment.method === methodFilter;
      
      const matchesDateRange = !dateRange || (
        new Date(payment.createdAt) >= new Date(dateRange.start) &&
        new Date(payment.createdAt) <= new Date(dateRange.end)
      );

      return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
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
  }, [payments, debouncedSearchTerm, statusFilter, methodFilter, dateRange, sortConfig]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedPayments.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedPayments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedPayments.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedPayments.size === paginatedPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(paginatedPayments.map(p => p.id)));
    }
  };

  const handleSelectPayment = (paymentId: string) => {
    const newSelected = new Set(selectedPayments);
    if (newSelected.has(paymentId)) {
      newSelected.delete(paymentId);
    } else {
      newSelected.add(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  // Handle refund
  const handleRefund = async () => {
    if (!refundPaymentId || !refundAmount || !refundReason) return;

    try {
      await refundPaymentMutation.mutateAsync({
        id: refundPaymentId,
        amount: parseFloat(refundAmount),
        reason: refundReason,
      });
      setShowRefundDialog(false);
      setRefundPaymentId('');
      setRefundAmount('');
      setRefundReason('');
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  // Open refund dialog
  const openRefundDialog = (paymentId: string, maxAmount: number) => {
    setRefundPaymentId(paymentId);
    setRefundAmount(maxAmount.toString());
    setShowRefundDialog(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setMethodFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredAndSortedPayments.length) return { totalAmount: 0, totalRefunded: 0, netAmount: 0 };
    
    const totalAmount = filteredAndSortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRefunded = filteredAndSortedPayments.reduce((sum, payment) => sum + payment.refundAmount, 0);
    const netAmount = totalAmount - totalRefunded;

    return { totalAmount, totalRefunded, netAmount };
  }, [filteredAndSortedPayments]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load payments. Please try again.
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
            {orderId ? `Order Payments` : 'All Payments'}
          </h1>
          <p className="text-muted-foreground">
            {orderId ? `Payments for order ${orderId}` : 'Manage and track order payments'}
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
            onClick={() => navigate('/orders/payments/process')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedPayments.length} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totals.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedPayments.filter(p => p.refundAmount > 0).length} refunds
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">
              After refunds
            </div>
          </CardContent>
        </Card>
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
              placeholder="Search by payment number, transaction ID, or card number..."
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
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={methodFilter || 'all'}
                  onValueChange={v => setMethodFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {Object.entries(METHOD_LABELS).map(([value, label]) => (
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
          {(statusFilter || methodFilter || dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary">
                  Status: {statusFilter.replace('_', ' ')}
                </Badge>
              )}
              {methodFilter && (
                <Badge variant="secondary">
                  Method: {METHOD_LABELS[methodFilter]}
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                {filteredAndSortedPayments.length} of {payments?.length || 0} payments
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
              <span className="ml-2">Loading payments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedPayments.size === paginatedPayments.length && paginatedPayments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('paymentNumber')}
                      >
                        Payment #
                        {sortConfig.field === 'paymentNumber' && (
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
                    
                    <th className="text-left p-4">Method</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortConfig.field === 'amount' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4">Refunded</th>
                    <th className="text-left p-4">Transaction ID</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('processedAt')}
                      >
                        Processed
                        {sortConfig.field === 'processedAt' && (
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
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedPayments.has(payment.id)}
                          onCheckedChange={() => handleSelectPayment(payment.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => navigate(`/orders/payments/${payment.id}`)}
                        >
                          {payment.paymentNumber}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/orders/${payment.orderId}`)}
                        >
                          {payment.orderId.slice(-8)}
                        </Button>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[payment.status]}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[payment.status]}
                            {payment.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {METHOD_ICONS[payment.method]}
                          <div>
                            <div className="font-medium">{METHOD_LABELS[payment.method]}</div>
                            {payment.cardLast4 && (
                              <div className="text-sm text-muted-foreground">
                                **** {payment.cardLast4}
                                {payment.cardBrand && ` (${payment.cardBrand})`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {payment.currency}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {payment.refundAmount > 0 ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <RotateCcw className="h-4 w-4" />
                            <span className="font-medium">
                              {payment.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {payment.transactionId ? (
                          <span className="font-mono text-sm">{payment.transactionId}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {payment.processedAt ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(payment.processedAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => navigate(`/orders/payments/${payment.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.status === 'COMPLETED' && payment.refundAmount < payment.amount && (
                              <DropdownMenuItem 
                                onClick={() => openRefundDialog(payment.id, payment.amount - payment.refundAmount)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                            {payment.refunds.length > 0 && (
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Refunds ({payment.refunds.length})
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedPayments.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No payments found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || statusFilter || methodFilter || dateRange
                      ? 'Try adjusting your search or filters'
                      : 'No payments have been processed yet'
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedPayments.length)} of {filteredAndSortedPayments.length} payments
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

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Refund Reason</Label>
              <Textarea
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRefundDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                disabled={!refundAmount || !refundReason || refundPaymentMutation.isPending}
              >
                {refundPaymentMutation.isPending ? 'Processing...' : 'Process Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 