import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFulfillmentDetail, useUpdateFulfillmentStatus } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Package, 
  RefreshCw, 
  Edit, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Warehouse,
  User,
  Calendar,
  MapPin,
  FileText,
  History,
  Copy,
  ExternalLink,
  Download,
  Printer
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FulfillmentStatus } from '@/types/order';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PICKED: 'bg-indigo-100 text-indigo-800',
  PACKED: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-200 text-green-900',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<FulfillmentStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PROCESSING: <Package className="h-4 w-4" />,
  PICKED: <CheckCircle className="h-4 w-4" />,
  PACKED: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
};

const STATUS_PROGRESSION: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PICKED', 'CANCELLED'],
  PICKED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function FulfillmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<FulfillmentStatus>('PROCESSING');
  const [statusNote, setStatusNote] = useState('');

  // Fetch fulfillment data
  const { 
    data: fulfillment, 
    isLoading, 
    error, 
    refetch 
  } = useFulfillmentDetail(id!);

  // Mutations
  const updateStatusMutation = useUpdateFulfillmentStatus();

  if (!id) {
    return <div>Invalid fulfillment ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading fulfillment details...</span>
        </div>
      </div>
    );
  }

  if (error || !fulfillment) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load fulfillment details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      await updateStatusMutation.mutateAsync({ id: fulfillment.id, status: newStatus });
      setShowStatusDialog(false);
      setStatusNote('');
    } catch (error) {
      console.error('Failed to update fulfillment status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  const availableStatuses = STATUS_PROGRESSION[fulfillment.status] || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/fulfillments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fulfillments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Fulfillment {fulfillment.fulfillmentNumber}</h1>
            <p className="text-muted-foreground">
              Created on {format(parseISO(fulfillment.createdAt), 'MMMM dd, yyyy')} at {format(parseISO(fulfillment.createdAt), 'h:mm a')}
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
          {availableStatuses.length > 0 && (
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Fulfillment Status</DialogTitle>
                  <DialogDescription>
                    Change the status of fulfillment {fulfillment.fulfillmentNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={(value: FulfillmentStatus) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              {STATUS_ICONS[status]}
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Note (Optional)</Label>
                    <Textarea
                      placeholder="Add a note about this status change..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowStatusDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status and Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${STATUS_COLORS[fulfillment.status]} text-lg px-3 py-1`}>
              <span className="flex items-center gap-2">
                {STATUS_ICONS[fulfillment.status]}
                {fulfillment.status}
              </span>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="link"
              className="p-0 h-auto text-base font-medium"
              onClick={() => navigate(`/orders/${fulfillment.orderId}`)}
            >
              {fulfillment.orderId.slice(-8)}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fulfillment.items.length}</div>
            <div className="text-sm text-muted-foreground">products</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            {fulfillment.warehouseName ? (
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{fulfillment.warehouseName}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fulfillment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Fulfillment Number</div>
                <div className="font-medium flex items-center gap-2">
                  {fulfillment.fulfillmentNumber}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(fulfillment.fulfillmentNumber)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Order ID</div>
                <div className="font-medium">
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/orders/${fulfillment.orderId}`)}
                  >
                    {fulfillment.orderId.slice(-8)}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {fulfillment.assignedTo && (
                <div>
                  <div className="text-sm text-muted-foreground">Assigned To</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{fulfillment.assignedTo}</span>
                  </div>
                </div>
              )}
              
              {fulfillment.shippingMethod && (
                <div>
                  <div className="text-sm text-muted-foreground">Shipping Method</div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{fulfillment.shippingMethod}</span>
                  </div>
                </div>
              )}
            </div>

            {fulfillment.trackingNumber && (
              <div>
                <div className="text-sm text-muted-foreground">Tracking Number</div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{fulfillment.trackingNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(fulfillment.trackingNumber!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {fulfillment.shippingCost > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Shipping Cost</div>
                <div className="font-medium">${fulfillment.shippingCost.toLocaleString()}</div>
              </div>
            )}

            {fulfillment.notes && (
              <div>
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="text-sm bg-muted p-3 rounded-lg">
                  {fulfillment.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Fulfillment Created</div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(fulfillment.createdAt), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </div>

              {fulfillment.pickedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Items Picked</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(fulfillment.pickedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              )}

              {fulfillment.packedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Items Packed</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(fulfillment.packedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              )}

              {fulfillment.shippedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Shipped</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(fulfillment.shippedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              )}

              {fulfillment.deliveredAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Delivered</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(fulfillment.deliveredAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Fulfillment Items ({fulfillment.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3">Product</th>
                  <th className="text-left py-3">SKU</th>
                  <th className="text-right py-3">Quantity</th>
                  <th className="text-left py-3">Serial Numbers</th>
                  <th className="text-left py-3">Lot Numbers</th>
                  <th className="text-left py-3">Expiration</th>
                </tr>
              </thead>
              <tbody>
                {fulfillment.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.productName}</div>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {item.productSku}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {item.quantityFulfilled}
                    </td>
                    <td className="py-3">
                      {item.serialNumbers && item.serialNumbers.length > 0 ? (
                        <div className="space-y-1">
                          {item.serialNumbers.map((serial, index) => (
                            <div key={index} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {serial}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.lotNumbers && item.lotNumbers.length > 0 ? (
                        <div className="space-y-1">
                          {item.lotNumbers.map((lot, index) => (
                            <div key={index} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {lot}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.expirationDates && item.expirationDates.length > 0 ? (
                        <div className="space-y-1">
                          {item.expirationDates.map((date, index) => (
                            <div key={index} className="text-sm">
                              {format(parseISO(date), 'MMM dd, yyyy')}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate(`/orders/${fulfillment.orderId}`)}
            >
              <FileText className="h-5 w-5" />
              View Order
            </Button>
            
            {fulfillment.trackingNumber && (
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  // Open tracking URL in new tab
                  window.open(`https://www.ups.com/track?tracknum=${fulfillment.trackingNumber}`, '_blank');
                }}
              >
                <Truck className="h-5 w-5" />
                Track Package
              </Button>
            )}
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}/edit`)}
            >
              <Edit className="h-5 w-5" />
              Edit Details
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                // Generate picking list or packing slip
                window.print();
              }}
            >
              <Download className="h-5 w-5" />
              Print Labels
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 