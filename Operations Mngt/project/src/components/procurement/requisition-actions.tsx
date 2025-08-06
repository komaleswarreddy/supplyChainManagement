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
import { MoreHorizontal, Eye, Edit, Trash2, Send, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Requisition } from '@/types/procurement';

interface RequisitionActionsProps {
  requisition: Requisition;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onConvertToPO?: (id: string) => void;
}

export function RequisitionActions({ 
  requisition, 
  onApprove, 
  onReject, 
  onDelete, 
  onConvertToPO 
}: RequisitionActionsProps) {
  const canEdit = requisition.status === 'draft';
  const canSubmit = requisition.status === 'draft';
  const canApprove = requisition.status === 'submitted';
  const canReject = requisition.status === 'submitted';
  const canConvertToPO = requisition.status === 'approved';
  const canDelete = requisition.status === 'draft';

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
          <Link to={`/procurement/requisitions/${requisition.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        {/* Edit - Only for draft */}
        {canEdit && (
          <DropdownMenuItem asChild>
            <Link to={`/procurement/requisitions/${requisition.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}

        {/* Submit - Only for draft */}
        {canSubmit && (
          <DropdownMenuItem onClick={() => onApprove?.(requisition.id)}>
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </DropdownMenuItem>
        )}

        {/* Approve - Only for submitted */}
        {canApprove && (
          <DropdownMenuItem onClick={() => onApprove?.(requisition.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}

        {/* Reject - Only for submitted */}
        {canReject && (
          <DropdownMenuItem onClick={() => onReject?.(requisition.id)}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}

        {/* Convert to PO - Only for approved */}
        {canConvertToPO && (
          <DropdownMenuItem onClick={() => onConvertToPO?.(requisition.id)}>
            <FileText className="mr-2 h-4 w-4" />
            Convert to Purchase Order
          </DropdownMenuItem>
        )}

        {/* Separator */}
        {(canEdit || canSubmit || canApprove || canReject || canConvertToPO) && (
          <DropdownMenuSeparator />
        )}

        {/* Delete - Only for draft */}
        {canDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete?.(requisition.id)}
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