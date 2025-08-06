import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Send, CheckCircle, XCircle, FileText, Package } from 'lucide-react';
import { PurchaseOrder } from '@/types/purchase-order';

interface PurchaseOrderActionsProps {
  purchaseOrder: PurchaseOrder;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSendToSupplier?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
}

export function PurchaseOrderActions({ 
  purchaseOrder, 
  onApprove, 
  onReject, 
  onDelete, 
  onSendToSupplier,
  onAcknowledge
}: PurchaseOrderActionsProps) {
  const canEdit = purchaseOrder.status === 'draft';
  const canApprove = purchaseOrder.status === 'pending';
  const canReject = purchaseOrder.status === 'pending';
  const canSendToSupplier = purchaseOrder.status === 'approved';
  const canAcknowledge = purchaseOrder.status === 'sent';
  const canDelete = purchaseOrder.status === 'draft';
  const canReceive = purchaseOrder.status === 'acknowledged';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* View Details - Always available */}
        <DropdownMenuItem asChild>
          <Link to={`/procurement/purchase-orders/${purchaseOrder.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        {/* Edit - Only for draft */}
        {canEdit && (
          <DropdownMenuItem asChild>
            <Link to={`/procurement/purchase-orders/${purchaseOrder.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}

        {/* Approve - Only for pending */}
        {canApprove && (
          <DropdownMenuItem onClick={() => onApprove?.(purchaseOrder.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}

        {/* Reject - Only for pending */}
        {canReject && (
          <DropdownMenuItem onClick={() => onReject?.(purchaseOrder.id)}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}

        {/* Send to Supplier - Only for approved */}
        {canSendToSupplier && (
          <DropdownMenuItem onClick={() => onSendToSupplier?.(purchaseOrder.id)}>
            <Send className="mr-2 h-4 w-4" />
            Send to Supplier
          </DropdownMenuItem>
        )}

        {/* Acknowledge - Only for sent */}
        {canAcknowledge && (
          <DropdownMenuItem onClick={() => onAcknowledge?.(purchaseOrder.id)}>
            <FileText className="mr-2 h-4 w-4" />
            Acknowledge
          </DropdownMenuItem>
        )}

        {/* Receive - Only for acknowledged */}
        {canReceive && (
          <DropdownMenuItem asChild>
            <Link to={`/procurement/purchase-orders/${purchaseOrder.id}/receive`}>
              <Package className="mr-2 h-4 w-4" />
              Receive Items
            </Link>
          </DropdownMenuItem>
        )}

        {/* Separator */}
        {(canEdit || canApprove || canReject || canSendToSupplier || canAcknowledge || canReceive) && (
          <DropdownMenuSeparator />
        )}

        {/* Delete - Only for draft */}
        {canDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete?.(purchaseOrder.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 