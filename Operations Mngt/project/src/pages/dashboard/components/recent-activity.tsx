import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText, 
  Users, 
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'requisition' | 'purchase_order' | 'inventory' | 'shipment' | 'supplier' | 'user';
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  entityId: string;
  entityName: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'requisition':
        return <FileText className="h-4 w-4" />;
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'shipment':
        return <Truck className="h-4 w-4" />;
      case 'supplier':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: Activity['action']) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'created':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'updated':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getEntityUrl = (type: Activity['type'], id: string) => {
    switch (type) {
      case 'requisition':
        return `/procurement/requisitions/${id}`;
      case 'purchase_order':
        return `/procurement/purchase-orders/${id}`;
      case 'inventory':
        return `/inventory/stock/${id}`;
      case 'shipment':
        return `/transportation/shipments/${id}`;
      case 'supplier':
        return `/suppliers/${id}`;
      case 'user':
        return `/users/${id}`;
      default:
        return '#';
    }
  };

  const getActionText = (action: Activity['action'], type: Activity['type']) => {
    const typeText = type.replace('_', ' ');
    switch (action) {
      case 'created':
        return `created a new ${typeText}`;
      case 'updated':
        return `updated a ${typeText}`;
      case 'approved':
        return `approved a ${typeText}`;
      case 'rejected':
        return `rejected a ${typeText}`;
      case 'completed':
        return `completed a ${typeText}`;
      case 'cancelled':
        return `cancelled a ${typeText}`;
      default:
        return `${action} a ${typeText}`;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className={cn(
            "rounded-full p-2 flex-shrink-0",
            activity.action === 'approved' || activity.action === 'completed' ? "bg-green-100" :
            activity.action === 'rejected' || activity.action === 'cancelled' ? "bg-red-100" :
            activity.action === 'created' ? "bg-blue-100" :
            "bg-amber-100"
          )}>
            {getActionIcon(activity.action)}
          </div>
          
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              <span className="font-semibold">{activity.user.name}</span>{' '}
              {getActionText(activity.action, activity.type)}
            </p>
            <a 
              href={getEntityUrl(activity.type, activity.entityId)}
              className="text-sm text-primary hover:underline flex items-center"
            >
              {getIcon(activity.type)}
              <span className="ml-1">{activity.entityName}</span>
            </a>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}