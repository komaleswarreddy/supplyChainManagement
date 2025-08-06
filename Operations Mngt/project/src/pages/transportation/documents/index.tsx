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
import { useTransportation } from '@/hooks/useTransportation';
import type { ShippingDocument } from '@/types/transportation';
import { ArrowUpDown, Eye, Plus, FileCheck, ExternalLink } from 'lucide-react';

const columnHelper = createColumnHelper<ShippingDocument>();

export function DocumentList() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    shipmentId: '',
    documentType: '',
  });

  // Since we don't have a global document list in our mock service,
  // we'll use a placeholder for the UI demonstration
  const mockDocuments: ShippingDocument[] = Array.from({ length: 10 }, (_, i) => ({
    id: `doc-${i + 1}`,
    shipmentId: `shipment-${i % 5 + 1}`,
    type: ['BOL', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CUSTOMS_DECLARATION', 'CERTIFICATE_OF_ORIGIN'][i % 5] as any,
    documentNumber: `${['BOL', 'INV', 'PL', 'CD', 'CO'][i % 5]}-${String(i + 1).padStart(6, '0')}`,
    issuedDate: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    issuedBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['logistics_coordinator'],
      permissions: ['manage_shipments'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    signedBy: i % 3 === 0 ? 'Jane Smith' : undefined,
    signatureDate: i % 3 === 0 ? new Date().toISOString() : undefined,
    url: `https://example.com/documents/doc-${i + 1}.pdf`,
    data: {},
    createdAt: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

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
    columnHelper.accessor('type', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Type</span>
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
    columnHelper.accessor('shipmentId', {
      header: 'Shipment ID',
      cell: (info) => info.getValue(),
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
    columnHelper.accessor('issuedBy.name', {
      header: 'Issued By',
    }),
    columnHelper.accessor('signedBy', {
      header: 'Signed By',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('url', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.open(info.getValue(), '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/transportation/documents/${info.row.original.id}`);
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

  // Filter the mock documents based on the filters
  const filteredDocuments = React.useMemo(() => {
    return mockDocuments.filter(doc => {
      if (filters.shipmentId && !doc.shipmentId.includes(filters.shipmentId)) {
        return false;
      }
      if (filters.documentType && doc.type !== filters.documentType) {
        return false;
      }
      return true;
    });
  }, [mockDocuments, filters]);

  const table = useReactTable({
    data: filteredDocuments,
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
    manualPagination: false,
    manualSorting: false,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCheck className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Shipping Documents</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Document
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shipmentId">Shipment ID</Label>
            <Input
              id="shipmentId"
              value={filters.shipmentId}
              onChange={(e) => setFilters(prev => ({ ...prev, shipmentId: e.target.value }))}
              placeholder="Filter by shipment ID"
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
              <option value="BOL">Bill of Lading</option>
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
              <option value="PACKING_LIST">Packing List</option>
              <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
              <option value="DANGEROUS_GOODS">Dangerous Goods</option>
              <option value="DELIVERY_NOTE">Delivery Note</option>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={false}
        onRowClick={(row) => navigate(`/transportation/documents/${row.id}`)}
      />
    </div>
  );
}

export default DocumentList;