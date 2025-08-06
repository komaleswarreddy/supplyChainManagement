import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Printer,
  Mail,
  Phone,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
  MessageSquare,
  CreditCard,
  RefreshCw,
  Archive,
  Flag,
  Share2,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { useUpdateOrder, useCancelOrder } from '@/services/order';

interface OrderActionsProps {
  order: Order;
  variant?: 'dropdown' | 'buttons' | 'compact';
  showLabels?: boolean;
  onRefresh?: () => void;
}

interface ActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  action: (order: Order) => void | Promise<void>;
  visible?: (order: Order) => boolean;
  disabled?: (order: Order) => boolean;
}

export function OrderActions({ 
  order, 
  variant = 'dropdown', 
  showLabels = true, 
  onRefresh 
}: OrderActionsProps) {
  const { toast } = useToast();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [statusUpdateReason, setStatusUpdateReason] = useState('');

  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast({
      title: 'Copied',
      description: 'Order ID copied to clipboard',
    });
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast({
      title: 'Copied',
      description: 'Order number copied to clipboard',
    });
  };

  const handlePrintOrder = () => {
    // Mock print functionality
    window.print();
  };

  const handleEmailCustomer = () => {
    const subject = encodeURIComponent(`Regarding Order #${order.orderNumber}`);
    const body = encodeURIComponent(`Hello ${order.customer?.firstName || 'Customer'},\n\nI hope this email finds you well. I'm writing regarding your recent order #${order.orderNumber}.\n\nBest regards`);
    window.open(`mailto:${order.customer?.email}?subject=${subject}&body=${body}`);
  };

  const handleCallCustomer = () => {
    if (order.customer?.phone) {
      window.open(`tel:${order.customer.phone}`);
    } else {
      toast({
        title: 'No Phone Number',
        description: 'Customer phone number is not available.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      setStatusUpdateDialog(false);
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({
        orderId: order.id,
        data: { 
          status: selectedStatus,
          statusReason: statusUpdateReason || undefined,
        },
      });

      toast({
        title: 'Order Updated',
        description: `Order status has been updated to ${selectedStatus}.`,
      });

      setStatusUpdateDialog(false);
      setStatusUpdateReason('');
      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync({
        orderId: order.id,
        reason: 'Cancelled by admin',
      });

      toast({
        title: 'Order Cancelled',
        description: 'The order has been cancelled successfully.',
      });

      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveOrder = async () => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId: order.id,
        data: { archived: true },
      });

      toast({
        title: 'Order Archived',
        description: 'The order has been archived successfully.',
      });

      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateReturn = () => {
    // This would navigate to create return page
    toast({
      title: 'Create Return',
      description: 'Redirecting to create return page...',
    });
  };

  const handleExportOrder = () => {
    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Order data is being exported...',
    });
  };

  const handleShareOrder = () => {
    const shareUrl = `${window.location.origin}/orders/${order.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link Copied',
      description: 'Order link copied to clipboard',
    });
  };

  const confirmAction = (action: () => void, title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      action,
      variant,
    });
  };

  const actions: ActionConfig[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: Eye,
      action: () => {},
      visible: () => true,
    },
    {
      key: 'edit',
      label: 'Edit Order',
      icon: Edit,
      action: () => {},
      visible: () => ['pending', 'confirmed'].includes(order.status),
    },
    {
      key: 'update-status',
      label: 'Update Status',
      icon: RefreshCw,
      action: () => setStatusUpdateDialog(true),
      visible: () => !['cancelled', 'returned'].includes(order.status),
    },
    {
      key: 'copy-id',
      label: 'Copy Order ID',
      icon: Copy,
      action: handleCopyOrderId,
      visible: () => true,
    },
    {
      key: 'copy-number',
      label: 'Copy Order Number',
      icon: Copy,
      action: handleCopyOrderNumber,
      visible: () => true,
    },
    {
      key: 'print',
      label: 'Print Order',
      icon: Printer,
      action: handlePrintOrder,
      visible: () => true,
    },
    {
      key: 'email-customer',
      label: 'Email Customer',
      icon: Mail,
      action: handleEmailCustomer,
      visible: () => !!order.customer?.email,
    },
    {
      key: 'call-customer',
      label: 'Call Customer',
      icon: Phone,
      action: handleCallCustomer,
      visible: () => !!order.customer?.phone,
    },
    {
      key: 'fulfillments',
      label: 'View Fulfillments',
      icon: Package,
      action: () => {},
      visible: () => (order.fulfillments?.length || 0) > 0,
    },
    {
      key: 'shipments',
      label: 'View Shipments',
      icon: Truck,
      action: () => {},
      visible: () => (order.shipments?.length || 0) > 0,
    },
    {
      key: 'create-return',
      label: 'Create Return',
      icon: RotateCcw,
      action: handleCreateReturn,
      visible: () => ['delivered'].includes(order.status),
    },
    {
      key: 'payments',
      label: 'View Payments',
      icon: CreditCard,
      action: () => {},
      visible: () => true,
    },
    {
      key: 'export',
      label: 'Export Order',
      icon: Download,
      action: handleExportOrder,
      visible: () => true,
    },
    {
      key: 'share',
      label: 'Share Order',
      icon: Share2,
      action: handleShareOrder,
      visible: () => true,
    },
    {
      key: 'cancel',
      label: 'Cancel Order',
      icon: XCircle,
      variant: 'destructive' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Cancel Order',
      confirmationDescription: 'Are you sure you want to cancel this order? This action cannot be undone.',
      action: handleCancelOrder,
      visible: () => ['pending', 'confirmed', 'processing'].includes(order.status),
    },
    {
      key: 'archive',
      label: 'Archive Order',
      icon: Archive,
      requiresConfirmation: true,
      confirmationTitle: 'Archive Order',
      confirmationDescription: 'Are you sure you want to archive this order? It will be moved to archived orders.',
      action: handleArchiveOrder,
      visible: () => ['delivered', 'cancelled', 'returned'].includes(order.status),
    },
  ];

  const visibleActions = actions.filter(action => action.visible?.(order) ?? true);

  if (variant === 'buttons') {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {visibleActions.slice(0, 4).map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={() => {
                if (action.requiresConfirmation) {
                  confirmAction(
                    action.action as () => void,
                    action.confirmationTitle!,
                    action.confirmationDescription!,
                    action.variant === 'destructive' ? 'destructive' : 'default'
                  );
                } else {
                  action.action(order);
                }
              }}
              disabled={action.disabled?.(order)}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {showLabels && action.label}
            </Button>
          ))}
          {visibleActions.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {visibleActions.slice(4).map((action) => (
                  <DropdownMenuItem
                    key={action.key}
                    onClick={() => {
                      if (action.requiresConfirmation) {
                        confirmAction(
                          action.action as () => void,
                          action.confirmationTitle!,
                          action.confirmationDescription!,
                          action.variant === 'destructive' ? 'destructive' : 'default'
                        );
                      } else {
                        action.action(order);
                      }
                    }}
                    disabled={action.disabled?.(order)}
                    className={action.variant === 'destructive' ? 'text-red-600' : ''}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Dialogs */}
        <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmationDialog.title}</DialogTitle>
              <DialogDescription>
                {confirmationDialog.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button
                variant={confirmationDialog.variant}
                onClick={() => {
                  confirmationDialog.action();
                  setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status of order #{order.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={statusUpdateReason}
                  onChange={(e) => setStatusUpdateReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateOrderMutation.isPending}
              >
                {updateOrderMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/orders/${order.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleActions.slice(2).map((action, index) => (
              <React.Fragment key={action.key}>
                {index > 0 && index % 5 === 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => {
                    if (action.requiresConfirmation) {
                      confirmAction(
                        action.action as () => void,
                        action.confirmationTitle!,
                        action.confirmationDescription!,
                        action.variant === 'destructive' ? 'destructive' : 'default'
                      );
                    } else {
                      action.action(order);
                    }
                  }}
                  disabled={action.disabled?.(order)}
                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {visibleActions.map((action, index) => (
            <React.Fragment key={action.key}>
              {index > 0 && index % 6 === 0 && <DropdownMenuSeparator />}
              {action.key === 'view' ? (
                <DropdownMenuItem asChild>
                  <Link to={`/orders/${order.id}`}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : action.key === 'edit' ? (
                <DropdownMenuItem asChild>
                  <Link to={`/orders/${order.id}/edit`}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : action.key === 'fulfillments' ? (
                <DropdownMenuItem asChild>
                  <Link to={`/orders/fulfillments?orderId=${order.id}`}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : action.key === 'shipments' ? (
                <DropdownMenuItem asChild>
                  <Link to={`/orders/shipments?orderId=${order.id}`}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : action.key === 'payments' ? (
                <DropdownMenuItem asChild>
                  <Link to={`/orders/payments?orderId=${order.id}`}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    if (action.requiresConfirmation) {
                      confirmAction(
                        action.action as () => void,
                        action.confirmationTitle!,
                        action.confirmationDescription!,
                        action.variant === 'destructive' ? 'destructive' : 'default'
                      );
                    } else {
                      action.action(order);
                    }
                  }}
                  disabled={action.disabled?.(order)}
                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmationDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmationDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={confirmationDialog.variant}
              onClick={() => {
                confirmationDialog.action();
                setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{order.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={statusUpdateReason}
                onChange={(e) => setStatusUpdateReason(e.target.value)}
                placeholder="Enter reason for status change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrderActions; 