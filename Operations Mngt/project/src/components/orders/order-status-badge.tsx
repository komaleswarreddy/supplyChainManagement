import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  RotateCcw,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  processing: {
    label: 'Processing',
    icon: PlayCircle,
    className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  delivered: {
    label: 'Delivered',
    icon: Package,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
  on_hold: {
    label: 'On Hold',
    icon: PauseCircle,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
};

export function OrderStatusBadge({ 
  status, 
  size = 'default', 
  showIcon = true, 
  variant = 'default' 
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge variant="secondary">
        Unknown Status
      </Badge>
    );
  }

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Badge 
      variant={variant}
      className={variant === 'default' ? config.className : undefined}
    >
      {showIcon && <Icon className={`${iconSize} mr-1`} />}
      {config.label}
    </Badge>
  );
}

export default OrderStatusBadge; 