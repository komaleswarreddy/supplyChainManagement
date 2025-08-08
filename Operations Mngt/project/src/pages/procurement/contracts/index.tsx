import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Calendar, Building, DollarSign, CheckCircle, XCircle, Clock, MoreHorizontal, Edit, Trash2, Eye, FileText
} from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
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

export default function ContractsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    supplier: '',
  });

  const { useContractList } = useContracts();
  const { data: contractsData, isLoading, error } = useContractList({
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
  const mockContracts = [
    {
      id: '1',
      contractNumber: 'CON-2024-001',
      title: 'IT Equipment Supply Contract',
      supplier: { name: 'ABC Supplies Inc.' },
      type: 'SUPPLY_CONTRACT',
      value: 500000,
      status: 'ACTIVE',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      contractNumber: 'CON-2024-002',
      title: 'Software License Agreement',
      supplier: { name: 'Tech Solutions Ltd.' },
      type: 'SERVICE_CONTRACT',
      value: 250000,
      status: 'PENDING_APPROVAL',
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2025-01-31T23:59:59Z',
      createdAt: '2024-01-14T14:30:00Z',
    },
    {
      id: '3',
      contractNumber: 'CON-2024-003',
      title: 'Office Maintenance Services',
      supplier: { name: 'Maintenance Pro' },
      type: 'SERVICE_CONTRACT',
      value: 75000,
      status: 'DRAFT',
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-13T09:15:00Z',
    },
  ];

  const displayData = contractsData?.items || mockContracts;
  const totalCount = contractsData?.total || mockContracts.length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft' },
      PENDING_APPROVAL: { variant: 'warning' as const, label: 'Pending Approval' },
      APPROVED: { variant: 'default' as const, label: 'Approved' },
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      EXPIRED: { variant: 'destructive' as const, label: 'Expired' },
      TERMINATED: { variant: 'destructive' as const, label: 'Terminated' },
      ON_HOLD: { variant: 'secondary' as const, label: 'On Hold' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      SUPPLY_CONTRACT: { variant: 'default' as const, label: 'Supply Contract' },
      SERVICE_CONTRACT: { variant: 'outline' as const, label: 'Service Contract' },
      FRAMEWORK_AGREEMENT: { variant: 'secondary' as const, label: 'Framework Agreement' },
      MASTER_AGREEMENT: { variant: 'secondary' as const, label: 'Master Agreement' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'secondary' as const, label: type.replace('_', ' ') };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (error && !displayData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Contracts</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">
            Manage supplier contracts and agreements
          </p>
        </div>
        <Link to="/procurement/contracts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Contract
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
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Types</option>
                <option value="SUPPLY_CONTRACT">Supply Contract</option>
                <option value="SERVICE_CONTRACT">Service Contract</option>
                <option value="FRAMEWORK_AGREEMENT">Framework Agreement</option>
                <option value="MASTER_AGREEMENT">Master Agreement</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Input
                placeholder="Search by supplier..."
                value={filters.supplier}
                onChange={(e) => handleFiltersChange({ ...filters, supplier: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(contract => contract.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.filter(contract => contract.status === 'PENDING_APPROVAL').length}
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
              ${displayData.reduce((sum, contract) => sum + (contract.value || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading contracts...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/procurement/contracts/${contract.id}`}
                          className="text-primary hover:underline"
                        >
                          {contract.contractNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {contract.supplier.name}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(contract.type)}</TableCell>
                      <TableCell>${contract.value?.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(contract.endDate).toLocaleDateString()}
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
                              <Link to={`/procurement/contracts/${contract.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/procurement/contracts/${contract.id}/edit`}>
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