import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDown, 
  Minus, 
  ArrowUp, 
  AlertTriangle,
  Flag
} from 'lucide-react';
import { OrderPriority } from '@/types/order';

interface OrderPriorityBadgeProps {
  priority: OrderPriority;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

const priorityConfig = {
  low: {
    label: 'Low',
    icon: ArrowDown,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  high: {
    label: 'High',
    icon: ArrowUp,
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  critical: {
    label: 'Critical',
    icon: Flag,
    className: 'bg-red-100 text-red-800 hover:bg-red-200 font-semibold',
  },
};

export function OrderPriorityBadge({ 
  priority, 
  size = 'default', 
  showIcon = true, 
  variant = 'outline' 
}: OrderPriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  if (!config) {
    return (
      <Badge variant="secondary">
        Unknown Priority
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

export default OrderPriorityBadge; 