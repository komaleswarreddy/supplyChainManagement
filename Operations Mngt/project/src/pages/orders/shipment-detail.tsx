import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipmentDetail, useUpdateShipmentStatus, useTrackShipment } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Truck, 
  RefreshCw, 
  Navigation, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  User,
  Calendar,
  Package,
  FileText,
  Copy,
  ExternalLink,
  Download,
  Printer,
  DollarSign,
  Ruler,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ShipmentStatus } from '@/types/order';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  PICKED_UP: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  EXCEPTION: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS: Record<ShipmentStatus, React.ReactNode> = {
  CREATED: <Package className="h-4 w-4" />,
  PICKED_UP: <Truck className="h-4 w-4" />,
  IN_TRANSIT: <Navigation className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <MapPin className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  EXCEPTION: <AlertCircle className="h-4 w-4" />,
  RETURNED: <RefreshCw className="h-4 w-4" />,
};

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [isTracking, setIsTracking] = useState(false);

  // Fetch shipment data
  const { 
    data: shipment, 
    isLoading, 
    error, 
    refetch 
  } = useShipmentDetail(id!);

  // Mutations
  const updateStatusMutation = useUpdateShipmentStatus();
  const trackShipmentMutation = useTrackShipment();

  if (!id) {
    return <div>Invalid shipment ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading shipment details...</span>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load shipment details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleTrackingUpdate = async () => {
    setIsTracking(true);
    try {
      await trackShipmentMutation.mutateAsync(shipment.id);
    } catch (error) {
      console.error('Failed to update tracking:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  const getStatusProgress = () => {
    const statuses: ShipmentStatus[] = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statuses.indexOf(shipment.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/shipments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shipments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Shipment {shipment.shipmentNumber}</h1>
            <p className="text-muted-foreground">
              Created on {format(parseISO(shipment.createdAt), 'MMMM dd, yyyy')} at {format(parseISO(shipment.createdAt), 'h:mm a')}
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
            onClick={handleTrackingUpdate}
            disabled={isTracking}
            className="gap-2"
          >
            <Navigation className={`h-4 w-4 ${isTracking ? 'animate-spin' : ''}`} />
            Update Tracking
          </Button>
          {shipment.trackingUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(shipment.trackingUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Track Online
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Status and Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${STATUS_COLORS[shipment.status]} text-lg px-3 py-1`}>
              <span className="flex items-center gap-2">
                {STATUS_ICONS[shipment.status]}
                {shipment.status.replace('_', ' ')}
              </span>
            </Badge>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStatusProgress()}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getStatusProgress().toFixed(0)}% Complete
              </div>
            </div>
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
              onClick={() => navigate(`/orders/${shipment.orderId}`)}
            >
              {shipment.orderId.slice(-8)}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{shipment.carrierName}</div>
                <div className="text-sm text-muted-foreground">{shipment.serviceType}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shipping Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${shipment.shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tracking Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tracking Number</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{shipment.trackingNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(shipment.trackingNumber)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {shipment.estimatedDeliveryDate && (
              <div>
                <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(parseISO(shipment.estimatedDeliveryDate), 'EEEE, MMMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {shipment.actualDeliveryDate && (
            <div>
              <div className="text-sm text-muted-foreground">Actual Delivery</div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {format(parseISO(shipment.actualDeliveryDate), 'EEEE, MMMM dd, yyyy h:mm a')}
                </span>
              </div>
            </div>
          )}

          {shipment.signature && (
            <div>
              <div className="text-sm text-muted-foreground">Signed By</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{shipment.signature}</span>
              </div>
            </div>
          )}

          {shipment.deliveryInstructions && (
            <div>
              <div className="text-sm text-muted-foreground">Delivery Instructions</div>
              <div className="text-sm bg-muted p-3 rounded-lg">
                {shipment.deliveryInstructions}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Events */}
      {shipment.trackingEvents && shipment.trackingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Tracking History ({shipment.trackingEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {shipment.trackingEvents
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((event) => (
                <div key={event.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(event.timestamp), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {event.description}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Source: {event.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipment.weight && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Weight</span>
                </div>
                <span className="font-medium">{shipment.weight} lbs</span>
              </div>
            )}

            {shipment.dimensions && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                </div>
                <span className="font-medium">
                  {shipment.dimensions.length}" × {shipment.dimensions.width}" × {shipment.dimensions.height}"
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Items</span>
              </div>
              <span className="font-medium">{shipment.items.length} items</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Shipping Cost</span>
              </div>
              <span className="font-medium">${shipment.shippingCost.toLocaleString()}</span>
            </div>

            {shipment.shippedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Shipped Date</span>
                </div>
                <span className="font-medium">
                  {format(parseISO(shipment.shippedAt), 'MMM dd, yyyy h:mm a')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="font-medium">
                  {shipment.shippingAddress.firstName} {shipment.shippingAddress.lastName}
                </div>
                {shipment.shippingAddress.company && (
                  <div className="text-muted-foreground">{shipment.shippingAddress.company}</div>
                )}
              </div>
              
              <div className="text-sm">
                <div>{shipment.shippingAddress.addressLine1}</div>
                {shipment.shippingAddress.addressLine2 && (
                  <div>{shipment.shippingAddress.addressLine2}</div>
                )}
                <div>
                  {shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.postalCode}
                </div>
                <div>{shipment.shippingAddress.country}</div>
              </div>

              {shipment.shippingAddress.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{shipment.shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipment Items ({shipment.items.length})
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
                  <th className="text-left py-3">Order Item</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.productName}</div>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {item.productSku}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => navigate(`/orders/${shipment.orderId}`)}
                      >
                        View in Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {shipment.documents && shipment.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({shipment.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shipment.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{doc.name}</div>
                    <Badge variant="outline">{doc.type.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Created {format(parseISO(doc.createdAt), 'MMM dd, yyyy')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              onClick={() => navigate(`/orders/${shipment.orderId}`)}
            >
              <FileText className="h-5 w-5" />
              View Order
            </Button>
            
            {shipment.fulfillmentId && (
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate(`/orders/fulfillments/${shipment.fulfillmentId}`)}
              >
                <Package className="h-5 w-5" />
                View Fulfillment
              </Button>
            )}
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate(`/orders/shipments/${shipment.id}/edit`)}
            >
              <FileText className="h-5 w-5" />
              Edit Details
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                // Print shipping label
                window.print();
              }}
            >
              <Download className="h-5 w-5" />
              Print Label
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 