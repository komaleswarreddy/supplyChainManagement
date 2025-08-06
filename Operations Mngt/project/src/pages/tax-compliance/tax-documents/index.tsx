import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import type { TaxDocument, TaxDocumentStatus } from '@/types/tax-compliance';
import { ArrowUpDown, Eye, Plus, FileCheck, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<TaxDocument>();

const statusColors: Record<TaxDocumentStatus, string> = {
  VALID: 'success',
  EXPIRED: 'destructive',
  PENDING_VERIFICATION: 'warning',
  REJECTED: 'destructive',
  REVOKED: 'destructive',
};

export function TaxDocumentList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    supplier: '',
    documentType: '',
    documentStatus: '',
  });

  const columns = [
    columnHelper.accessor('documentNumber', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Document #</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <span className="font-medium text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('supplierName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Supplier</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    }),
    columnHelper.accessor('documentType', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Document Type</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant="secondary">
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Status</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('issuedDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Issued Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('expirationDate', {
      header: 'Expiration Date',
      cell: (info) => info.getValue() ? format(new Date(info.getValue()!), 'PP') : 'N/A',
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.open(info.row.original.documentUrl, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tax-compliance/tax-documents/${info.getValue()}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { useTaxDocuments } = useTaxCompliance();
  const { data, isLoading } = useTaxDocuments({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    ...filters,
    dateRange: startDate && endDate ? {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    } : undefined,
  });

  // Calculate documents expiring soon
  const expiringDocuments = React.useMemo(() => {
    if (!data?.items) return 0;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return data.items.filter(doc => {
      if (!doc.expirationDate || doc.status !== 'VALID') return false;
      const expiryDate = new Date(doc.expirationDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
  }, [data?.items]);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    pageCount: data?.totalPages ?? -1,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCheck className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Supplier Tax Documents</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      {expiringDocuments > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Documents Expiring Soon</h3>
              <p className="text-sm text-amber-700">
                {expiringDocuments} document{expiringDocuments !== 1 ? 's' : ''} will expire within the next 30 days. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-800"
                  onClick={() => setFilters(prev => ({ ...prev, documentStatus: 'VALID' }))}
                >
                  Review now
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Search by supplier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              id="documentType"
              value={filters.documentType}
              onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="EXEMPTION_CERTIFICATE">Exemption Certificate</option>
              <option value="RESALE_CERTIFICATE">Resale Certificate</option>
              <option value="VAT_REGISTRATION">VAT Registration</option>
              <option value="W9">W9</option>
              <option value="W8BEN">W8BEN</option>
              <option value="W8BENE">W8BEN-E</option>
              <option value="TAX_ID_VERIFICATION">Tax ID Verification</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentStatus">Status</Label>
            <Select
              id="documentStatus"
              value={filters.documentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, documentStatus: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="VALID">Valid</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVOKED">Revoked</option>
            </Select>
          </div>

          <div className="space-y-2">
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
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Documents</p>
              <p className="text-2xl font-bold">
                {data?.items.filter(doc => doc.status === 'VALID').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired Documents</p>
              <p className="text-2xl font-bold">
                {data?.items.filter(doc => doc.status === 'EXPIRED').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-bold">
                {data?.items.filter(doc => doc.status === 'PENDING_VERIFICATION').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold">{expiringDocuments}</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/tax-compliance/tax-documents/${row.id}`)}
      />
    </div>
  );
}