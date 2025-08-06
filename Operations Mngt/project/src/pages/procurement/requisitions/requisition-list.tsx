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
import { DataTable } from '@/components/ui/data-table';
import { useProcurement } from '@/hooks/useProcurement';
import type { Requisition } from '@/types/procurement';
import { DATE_FORMAT } from '@/config/constants';
import { ArrowUpDown, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const columnHelper = createColumnHelper<Requisition>();

const canModifyRequisition = (status: string) => {
  return ['DRAFT', 'REJECTED'].includes(status);
};

export function RequisitionList() {
  const navigate = useNavigate();
  const { isOpen, setIsOpen, onConfirm, confirm } = useConfirmDialog();

  const handleEdit = (id: string) => {
    confirm(() => navigate(`/procurement/requisitions/${id}/edit`));
  };

  const columns = [
    columnHelper.accessor('requisitionNumber', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Requisition #</span>
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
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Title</span>
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
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
        <Badge
          variant={
            info.getValue() === 'APPROVED'
              ? 'success'
              : info.getValue() === 'REJECTED'
              ? 'destructive'
              : info.getValue() === 'PENDING'
              ? 'secondary'
              : 'default'
          }
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('requestor.name', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Requestor</span>
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    }),
    columnHelper.accessor('department', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Department</span>
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    }),
    columnHelper.accessor('totalAmount', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Total Amount</span>
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium tabular-nums">
          {info.row.original.currency} {info.getValue().toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Created Date</span>
          <ArrowUpDown 
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => format(new Date(info.getValue()), DATE_FORMAT),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const requisition = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/procurement/requisitions/${info.getValue()}`);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canModifyRequisition(requisition.status) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(info.getValue());
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { useRequisitions } = useProcurement();
  const { data, isLoading } = useRequisitions({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  });

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
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
      />
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Edit Requisition"
        description="Are you sure you want to edit this requisition? Any unsaved changes will be lost."
        confirmText="Edit"
        onConfirm={onConfirm}
      />
    </>
  );
}