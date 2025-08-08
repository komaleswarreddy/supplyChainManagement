
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Calendar, Building, DollarSign, CheckCircle, XCircle, Clock, MoreHorizontal, Edit, Trash2, Eye, Send
} from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { PurchaseOrderStatusBadge } from '@/components/procurement/purchase-order-status-badge';
import { PurchaseOrderFilters } from '@/components/procurement/purchase-order-filters';
import { PurchaseOrderActions } from '@/components/procurement/purchase-order-actions';

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    supplierId: '',
    startDate: '',
    endDate: '',
  });

  const { data: purchaseOrdersData, isLoading, error } = usePurchaseOrders({
    page,
    limit,
    search,
    ...filters,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const displayData = purchaseOrdersData?.data || [];
  const totalCount = purchaseOrdersData?.total || 0;

  if (error && !displayData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Purchase Orders</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and track their status
          </p>
        </div>
        <Link to="/procurement/purchase-orders/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search purchase orders..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          <PurchaseOrderFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(po => po.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent to Suppliers</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(po => po.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${displayData.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading purchase orders...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((purchaseOrder) => (
                    <TableRow key={purchaseOrder.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/procurement/purchase-orders/${purchaseOrder.id}`}
                          className="text-primary hover:underline"
                        >
                          {purchaseOrder.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {purchaseOrder.supplierName}
                        </div>
                      </TableCell>
                      <TableCell>${purchaseOrder.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <PurchaseOrderActions purchaseOrder={purchaseOrder} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalCount > limit && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} results
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalCount / limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
