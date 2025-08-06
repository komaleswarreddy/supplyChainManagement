import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText, Send, Package, CheckSquare } from 'lucide-react';

interface PurchaseOrderStatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';
}

export function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          variant: 'secondary' as const,
          icon: FileText,
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800',
        };
      case 'pending':
        return {
          variant: 'default' as const,
          icon: Clock,
          label: 'Pending Approval',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'approved':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Approved',
          className: 'bg-green-100 text-green-800',
        };
      case 'sent':
        return {
          variant: 'default' as const,
          icon: Send,
          label: 'Sent to Supplier',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'acknowledged':
        return {
          variant: 'default' as const,
          icon: CheckSquare,
          label: 'Acknowledged',
          className: 'bg-purple-100 text-purple-800',
        };
      case 'received':
        return {
          variant: 'default' as const,
          icon: Package,
          label: 'Received',
          className: 'bg-indigo-100 text-indigo-800',
        };
      case 'closed':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Closed',
          className: 'bg-green-100 text-green-800',
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800',
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