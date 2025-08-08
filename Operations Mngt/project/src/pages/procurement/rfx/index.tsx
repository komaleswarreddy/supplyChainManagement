import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Calendar, Building, DollarSign, CheckCircle, XCircle, Clock, MoreHorizontal, Edit, Trash2, Eye, FileText
} from 'lucide-react';
import { useRfx } from '@/hooks/useRfx';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RFXPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    category: '',
  });

  const { useRfxList } = useRfx();
  const { data: rfxData, isLoading, error } = useRfxList({
    page,
    pageSize: limit,
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

  // Mock data for demonstration when API is not available
  const mockRFX = [
    {
      id: '1',
      rfxNumber: 'RFX-2024-001',
      title: 'IT Equipment Procurement',
      type: 'rfp',
      status: 'published',
      category: 'IT Equipment',
      deadline: '2024-02-15T17:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      rfxNumber: 'RFX-2024-002',
      title: 'Office Supplies Tender',
      type: 'rfq',
      status: 'draft',
      category: 'Office Supplies',
      deadline: '2024-02-20T17:00:00Z',
      createdAt: '2024-01-14T14:30:00Z',
    },
    {
      id: '3',
      rfxNumber: 'RFX-2024-003',
      title: 'Software License Inquiry',
      type: 'rfi',
      status: 'closed',
      category: 'Software',
      deadline: '2024-01-30T17:00:00Z',
      createdAt: '2024-01-13T09:15:00Z',
    },
  ];

  const displayData = rfxData?.items || mockRFX;
  const totalCount = rfxData?.total || mockRFX.length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      published: { variant: 'default' as const, label: 'Published' },
      closed: { variant: 'destructive' as const, label: 'Closed' },
      evaluated: { variant: 'default' as const, label: 'Evaluated' },
      awarded: { variant: 'default' as const, label: 'Awarded' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      rfi: { variant: 'secondary' as const, label: 'RFI' },
      rfp: { variant: 'default' as const, label: 'RFP' },
      rfq: { variant: 'outline' as const, label: 'RFQ' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'secondary' as const, label: type.toUpperCase() };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (error && !displayData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading RFX</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">RFx Management</h1>
          <p className="text-muted-foreground">
            Manage Requests for Information, Proposals, and Quotes
          </p>
        </div>
        <Link to="/procurement/rfx/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create RFx
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
                placeholder="Search RFx..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Types</option>
                <option value="rfi">RFI</option>
                <option value="rfp">RFP</option>
                <option value="rfq">RFQ</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="evaluated">Evaluated</option>
                <option value="awarded">Awarded</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFiltersChange({ ...filters, category: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Categories</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Software">Software</option>
                <option value="Services">Services</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFx</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(rfx => rfx.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(rfx => rfx.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(rfx => rfx.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFx Table */}
      <Card>
        <CardHeader>
          <CardTitle>RFx List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading RFx...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFx Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((rfx) => (
                    <TableRow key={rfx.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/procurement/rfx/${rfx.id}`}
                          className="text-primary hover:underline"
                        >
                          {rfx.rfxNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{rfx.title}</TableCell>
                      <TableCell>{getTypeBadge(rfx.type)}</TableCell>
                      <TableCell>{rfx.category}</TableCell>
                      <TableCell>{getStatusBadge(rfx.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(rfx.deadline).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/procurement/rfx/${rfx.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/procurement/rfx/${rfx.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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