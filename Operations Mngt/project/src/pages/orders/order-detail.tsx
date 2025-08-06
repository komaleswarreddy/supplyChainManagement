import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail, useUpdateOrder, useCancelOrder, useOrderNotes } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Truck, 
  RefreshCw, 
  RotateCcw, 
  DollarSign, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Download, 
  Printer, 
  Share, 
  MessageSquare,
  History,
  CreditCard,
  ShoppingCart,
  Tag,
  Building,
  Globe,
  TrendingUp,
  Eye,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { OrderStatus, OrderPriority, PaymentStatus, FulfillmentStatus, ShipmentStatus, ReturnStatus } from '@/types/order';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  PARTIALLY_SHIPPED: 'bg-cyan-100 text-cyan-800',
  RETURNED: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<OrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'INTERNAL' | 'CUSTOMER'>('INTERNAL');
  const [isPublicNote, setIsPublicNote] = useState(false);

  // Fetch order data
  const { 
    data: orderData, 
    isLoading, 
    error, 
    refetch 
  } = useOrderDetail(id!);

  // Mutations
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();
  const { addNote } = useOrderNotes(id!);

  if (!id) {
    return <div>Invalid order ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load order details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { order, relatedOrders, customerHistory, availableActions } = orderData;

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id);
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await addNote.mutateAsync({
        content: noteContent,
        type: noteType,
        isPublic: isPublicNote,
      });
      setNoteContent('');
      setShowNoteDialog(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Created on {format(parseISO(order.createdAt), 'MMMM dd, yyyy')} at {format(parseISO(order.createdAt), 'h:mm a')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${order.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Order
          </Button>
          {availableActions.includes('CANCEL') && (
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep Order
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelOrder}
                    disabled={cancelOrderMutation.isPending}
                  >
                    {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${STATUS_COLORS[order.status]} text-lg px-3 py-1`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${PRIORITY_COLORS[order.priority]} text-lg px-3 py-1`}>
              {order.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}
              className="text-lg px-3 py-1"
            >
              {order.paymentStatus.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-muted-foreground">
                      Customer ID: {order.customer.id}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/orders/customers/${order.customer.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(order.customer.email)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {order.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer.phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(order.customer.phone)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.customerType}</span>
                  </div>
                  
                  {order.customer.loyaltyTier && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{order.customer.loyaltyTier}</Badge>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{customerHistory.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${customerHistory.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${customerHistory.averageOrderValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Order</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Billing Address */}
                <div>
                  <div className="font-medium mb-2">Billing Address</div>
                  <div className="text-sm space-y-1">
                    <div>{order.billingAddress.firstName} {order.billingAddress.lastName}</div>
                    {order.billingAddress.company && (
                      <div>{order.billingAddress.company}</div>
                    )}
                    <div>{order.billingAddress.addressLine1}</div>
                    {order.billingAddress.addressLine2 && (
                      <div>{order.billingAddress.addressLine2}</div>
                    )}
                    <div>
                      {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                    </div>
                    <div>{order.billingAddress.country}</div>
                    {order.billingAddress.phone && (
                      <div>Phone: {order.billingAddress.phone}</div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Shipping Address */}
                <div>
                  <div className="font-medium mb-2">Shipping Address</div>
                  <div className="text-sm space-y-1">
                    <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                    {order.shippingAddress.company && (
                      <div>{order.shippingAddress.company}</div>
                    )}
                    <div>{order.shippingAddress.addressLine1}</div>
                    {order.shippingAddress.addressLine2 && (
                      <div>{order.shippingAddress.addressLine2}</div>
                    )}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                    {order.shippingAddress.phone && (
                      <div>Phone: {order.shippingAddress.phone}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-lg font-medium">
                    ${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tax</div>
                  <div className="text-lg font-medium">
                    ${order.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Shipping</div>
                  <div className="text-lg font-medium">
                    ${order.shippingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Discount</div>
                  <div className="text-lg font-medium text-green-600">
                    -${order.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">Total Amount</div>
                <div className="text-2xl font-bold">
                  ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {order.currency}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Type:</span>
                  <span>{order.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span>{order.source}</span>
                </div>
                {order.shippingMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Method:</span>
                    <span>{order.shippingMethod}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <div className="flex items-center gap-2">
                      <span>{order.trackingNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(order.trackingNumber!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {order.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Number:</span>
                    <span>{order.poNumber}</span>
                  </div>
                )}
                {order.specialInstructions && (
                  <div>
                    <div className="text-muted-foreground mb-1">Special Instructions:</div>
                    <div className="text-sm bg-muted p-2 rounded">
                      {order.specialInstructions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(parseISO(order.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(parseISO(order.updatedAt), 'MMM dd, yyyy h:mm a')}</span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <span>{format(parseISO(order.estimatedDeliveryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Delivery:</span>
                    <span>{format(parseISO(order.actualDeliveryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3">Product</th>
                      <th className="text-left py-3">SKU</th>
                      <th className="text-right py-3">Qty</th>
                      <th className="text-right py-3">Unit Price</th>
                      <th className="text-right py-3">Discount</th>
                      <th className="text-right py-3">Tax</th>
                      <th className="text-right py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            {item.notes && (
                              <div className="text-sm text-muted-foreground">{item.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {item.productSku}
                        </td>
                        <td className="py-3 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right">
                          ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          ${item.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          ${item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-medium">
                          ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fulfillment Tab */}
        <TabsContent value="fulfillment" className="space-y-6">
          {/* Fulfillments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Fulfillments ({order.fulfillments.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/fulfillments`)}
              >
                Manage Fulfillments
              </Button>
            </CardHeader>
            <CardContent>
              {order.fulfillments.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No fulfillments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {order.fulfillments.map((fulfillment) => (
                    <div key={fulfillment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{fulfillment.fulfillmentNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {fulfillment.items.length} items
                          </div>
                        </div>
                        <Badge 
                          variant={fulfillment.status === 'DELIVERED' ? 'default' : 'secondary'}
                        >
                          {fulfillment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {fulfillment.warehouseName && (
                          <div>
                            <div className="text-muted-foreground">Warehouse</div>
                            <div>{fulfillment.warehouseName}</div>
                          </div>
                        )}
                        {fulfillment.trackingNumber && (
                          <div>
                            <div className="text-muted-foreground">Tracking</div>
                            <div className="flex items-center gap-1">
                              <span>{fulfillment.trackingNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => copyToClipboard(fulfillment.trackingNumber!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {fulfillment.shippedAt && (
                          <div>
                            <div className="text-muted-foreground">Shipped</div>
                            <div>{format(parseISO(fulfillment.shippedAt), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                        {fulfillment.deliveredAt && (
                          <div>
                            <div className="text-muted-foreground">Delivered</div>
                            <div>{format(parseISO(fulfillment.deliveredAt), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipments ({order.shipments.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/shipments`)}
              >
                Manage Shipments
              </Button>
            </CardHeader>
            <CardContent>
              {order.shipments.length === 0 ? (
                <div className="text-center py-6">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No shipments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {order.shipments.map((shipment) => (
                    <div key={shipment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{shipment.shipmentNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {shipment.carrierName} - {shipment.serviceType}
                          </div>
                        </div>
                        <Badge 
                          variant={shipment.status === 'DELIVERED' ? 'default' : 'secondary'}
                        >
                          {shipment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Tracking</div>
                          <div className="flex items-center gap-1">
                            <span>{shipment.trackingNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(shipment.trackingNumber)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Cost</div>
                          <div>${shipment.shippingCost.toLocaleString()}</div>
                        </div>
                        {shipment.estimatedDeliveryDate && (
                          <div>
                            <div className="text-muted-foreground">Est. Delivery</div>
                            <div>{format(parseISO(shipment.estimatedDeliveryDate), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                        {shipment.actualDeliveryDate && (
                          <div>
                            <div className="text-muted-foreground">Delivered</div>
                            <div>{format(parseISO(shipment.actualDeliveryDate), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Returns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Returns ({order.returns.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/returns`)}
              >
                Manage Returns
              </Button>
            </CardHeader>
            <CardContent>
              {order.returns.length === 0 ? (
                <div className="text-center py-6">
                  <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No returns</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {order.returns.map((returnItem) => (
                    <div key={returnItem.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{returnItem.returnNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            Reason: {returnItem.reason.replace('_', ' ')}
                          </div>
                        </div>
                        <Badge 
                          variant={returnItem.status === 'REFUNDED' ? 'default' : 'secondary'}
                        >
                          {returnItem.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Items</div>
                          <div>{returnItem.items.length}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Refund Amount</div>
                          <div>${returnItem.totalRefund.toLocaleString()}</div>
                        </div>
                        {returnItem.receivedAt && (
                          <div>
                            <div className="text-muted-foreground">Received</div>
                            <div>{format(parseISO(returnItem.receivedAt), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                        {returnItem.refundedAt && (
                          <div>
                            <div className="text-muted-foreground">Refunded</div>
                            <div>{format(parseISO(returnItem.refundedAt), 'MMM dd, yyyy')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payments ({order.payments.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/payments`)}
              >
                Manage Payments
              </Button>
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payments recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{payment.paymentNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.method.replace('_', ' ')}
                            {payment.cardLast4 && ` ending in ${payment.cardLast4}`}
                          </div>
                        </div>
                        <Badge 
                          variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Amount</div>
                          <div className="font-medium">
                            ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Refunded</div>
                          <div>
                            ${payment.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <div className="text-muted-foreground">Transaction ID</div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs">{payment.transactionId}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => copyToClipboard(payment.transactionId!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {payment.processedAt && (
                          <div>
                            <div className="text-muted-foreground">Processed</div>
                            <div>{format(parseISO(payment.processedAt), 'MMM dd, yyyy h:mm a')}</div>
                          </div>
                        )}
                      </div>
                      
                      {payment.refunds.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Refunds:</div>
                          <div className="space-y-2">
                            {payment.refunds.map((refund) => (
                              <div key={refund.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <span>${refund.amount.toLocaleString()}</span>
                                  <span className="text-muted-foreground ml-2">
                                    - {refund.reason}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  {format(parseISO(refund.processedAt), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {order.history.map((historyItem) => (
                    <div key={historyItem.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{historyItem.action}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(historyItem.createdAt), 'MMM dd, yyyy h:mm a')}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {historyItem.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {historyItem.createdByName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Order Notes ({order.notes.length})
              </CardTitle>
              <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Order Note</DialogTitle>
                    <DialogDescription>
                      Add a note to this order for internal tracking or customer communication.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note Type</label>
                      <Select value={noteType} onValueChange={(value: 'INTERNAL' | 'CUSTOMER') => setNoteType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTERNAL">Internal Note</SelectItem>
                          <SelectItem value="CUSTOMER">Customer Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note Content</label>
                      <Textarea
                        placeholder="Enter your note here..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    {noteType === 'CUSTOMER' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublicNote}
                          onChange={(e) => setIsPublicNote(e.target.checked)}
                        />
                        <label htmlFor="isPublic" className="text-sm">
                          Make this note visible to the customer
                        </label>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowNoteDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddNote}
                        disabled={!noteContent.trim() || addNote.isPending}
                      >
                        {addNote.isPending ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {order.notes.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes yet</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {order.notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={note.type === 'INTERNAL' ? 'secondary' : 'default'}>
                              {note.type}
                            </Badge>
                            {note.isPublic && (
                              <Badge variant="outline">Public</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(note.createdAt), 'MMM dd, yyyy h:mm a')}
                          </div>
                        </div>
                        <div className="text-sm mb-2">{note.content}</div>
                        <div className="text-xs text-muted-foreground">
                          by {note.createdByName}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Orders */}
      {relatedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Orders</CardTitle>
            <CardDescription>Other orders from this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedOrders.map((relatedOrder) => (
                <div key={relatedOrder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate(`/orders/${relatedOrder.id}`)}
                    >
                      {relatedOrder.orderNumber}
                    </Button>
                    <Badge className={STATUS_COLORS[relatedOrder.status]}>
                      {relatedOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>${relatedOrder.totalAmount.toLocaleString()}</span>
                    <span>{format(parseISO(relatedOrder.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 