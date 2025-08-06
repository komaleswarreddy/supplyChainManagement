import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/services/order';
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
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
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
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

const CUSTOMER_TYPE_COLORS = {
  INDIVIDUAL: 'bg-blue-100 text-blue-800',
  BUSINESS: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

const LOYALTY_TIER_COLORS = {
  BRONZE: 'bg-orange-100 text-orange-800',
  SILVER: 'bg-gray-100 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
};

const LOYALTY_TIER_ICONS = {
  BRONZE: <Star className="h-3 w-3" />,
  SILVER: <Star className="h-3 w-3" />,
  GOLD: <Star className="h-3 w-3" />,
  PLATINUM: <Star className="h-3 w-3" />,
};

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [loyaltyTierFilter, setLoyaltyTierFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch customers
  const { 
    data: customersData, 
    isLoading, 
    error, 
    refetch 
  } = useCustomers({
    search: debouncedSearchTerm,
    status: statusFilter ? [statusFilter] : undefined,
    customerType: customerTypeFilter ? [customerTypeFilter] : undefined,
    loyaltyTier: loyaltyTierFilter ? [loyaltyTierFilter] : undefined,
    registrationDateRange: dateRange,
  });

  // Filter and sort customers locally for additional filtering
  const filteredAndSortedCustomers = useMemo(() => {
    if (!customersData?.customers) return [];

    let filtered = [...customersData.customers];

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
  }, [customersData?.customers, sortConfig]);

  // Pagination
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedCustomers.size === paginatedCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(paginatedCustomers.map(c => c.id)));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCustomerTypeFilter('');
    setLoyaltyTierFilter('');
    setDateRange(undefined);
    setCurrentPage(1);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!customersData?.customers) return null;

    const customers = customersData.customers;
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / totalCustomers;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      avgOrderValue,
    };
  }, [customersData?.customers]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load customers. Please try again.
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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer relationships and profiles
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
            onClick={() => navigate('/orders/customers/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalCustomers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {summaryStats.activeCustomers} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((summaryStats.activeCustomers / summaryStats.totalCustomers) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Customer retention
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Customer lifetime value
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryStats.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Per customer
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              placeholder="Search by name, email, or phone..."
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Type</label>
                <Select
                  value={customerTypeFilter || 'all'}
                  onValueChange={v => setCustomerTypeFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loyalty Tier</label>
                <Select
                  value={loyaltyTierFilter || 'all'}
                  onValueChange={v => setLoyaltyTierFilter(v === 'all' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Date</label>
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
            </div>
          )}

          {/* Active Filters */}
          {(statusFilter || customerTypeFilter || loyaltyTierFilter || dateRange || debouncedSearchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {statusFilter && (
                <Badge variant="secondary">Status: {statusFilter}</Badge>
              )}
              {customerTypeFilter && (
                <Badge variant="secondary">Type: {customerTypeFilter}</Badge>
              )}
              {loyaltyTierFilter && (
                <Badge variant="secondary">Tier: {loyaltyTierFilter}</Badge>
              )}
              {dateRange && (
                <Badge variant="secondary">
                  Registered: {format(new Date(dateRange.start), 'MMM dd')} - {format(new Date(dateRange.end), 'MMM dd')}
                </Badge>
              )}
              {debouncedSearchTerm && (
                <Badge variant="secondary">Search: {debouncedSearchTerm}</Badge>
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
      {selectedCustomers.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedCustomers.size} customer{selectedCustomers.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  Update Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                {filteredAndSortedCustomers.length} of {customersData?.customers.length || 0} customers
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
              <span className="ml-2">Loading customers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedCustomers.size === paginatedCustomers.length && paginatedCustomers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('firstName')}
                      >
                        Customer
                        {sortConfig.field === 'firstName' && (
                          sortConfig.direction === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </th>
                    
                    <th className="text-left p-4">Contact</th>
                    
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
                    
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Loyalty Tier</th>
                    
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('totalOrders')}
                      >
                        Orders
                        {sortConfig.field === 'totalOrders' && (
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
                        onClick={() => handleSort('totalSpent')}
                      >
                        Total Spent
                        {sortConfig.field === 'totalSpent' && (
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
                        Registered
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
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedCustomers.has(customer.id)}
                          onCheckedChange={() => handleSelectCustomer(customer.id)}
                        />
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium"
                              onClick={() => navigate(`/orders/customers/${customer.id}`)}
                            >
                              {customer.firstName} {customer.lastName}
                            </Button>
                            <div className="text-sm text-muted-foreground">
                              ID: {customer.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={STATUS_COLORS[customer.status as keyof typeof STATUS_COLORS]}>
                          {customer.status}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={CUSTOMER_TYPE_COLORS[customer.customerType as keyof typeof CUSTOMER_TYPE_COLORS]}>
                          <span className="flex items-center gap-1">
                            {customer.customerType === 'BUSINESS' ? <Building className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            {customer.customerType}
                          </span>
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        {customer.loyaltyTier ? (
                          <Badge className={LOYALTY_TIER_COLORS[customer.loyaltyTier as keyof typeof LOYALTY_TIER_COLORS]}>
                            <span className="flex items-center gap-1">
                              {LOYALTY_TIER_ICONS[customer.loyaltyTier as keyof typeof LOYALTY_TIER_ICONS]}
                              {customer.loyaltyTier}
                            </span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.totalOrders}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(customer.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => navigate(`/orders/customers/${customer.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/customers/${customer.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/orders?customerId=${customer.id}`)}>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              View Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders/create?customerId=${customer.id}`)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedCustomers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No customers found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || statusFilter || customerTypeFilter || loyaltyTierFilter || dateRange
                      ? 'Try adjusting your search or filters'
                      : 'No customers have been registered yet'
                    }
                  </p>
                  {!debouncedSearchTerm && !statusFilter && !customerTypeFilter && !loyaltyTierFilter && !dateRange && (
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/orders/customers/create')}
                    >
                      Add First Customer
                    </Button>
                  )}
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} customers
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