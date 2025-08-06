import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText, Send } from 'lucide-react';

interface RequisitionStatusBadgeProps {
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';
}

export function RequisitionStatusBadge({ status }: RequisitionStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          variant: 'secondary' as const,
          icon: FileText,
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800',
        };
      case 'submitted':
        return {
          variant: 'default' as const,
          icon: Send,
          label: 'Submitted',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'approved':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Approved',
          className: 'bg-green-100 text-green-800',
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Rejected',
          className: 'bg-red-100 text-red-800',
        };
      case 'converted':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Converted to PO',
          className: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: status,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
} 