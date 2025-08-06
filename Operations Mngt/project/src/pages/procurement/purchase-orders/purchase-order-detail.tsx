import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  RefreshCw, 
  Edit, 
  FileText, 
  Download, 
  Printer, 
  Mail,
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Package,
  DollarSign,
  Calendar,
  User,
  Building,
  Truck,
  MessageSquare,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACKNOWLEDGED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  DRAFT: FileText,
  PENDING_APPROVAL: Clock,
  APPROVED: CheckCircle,
  REJECTED: AlertCircle,
  SENT: Mail,
  ACKNOWLEDGED: CheckCircle,
  IN_PROGRESS: Package,
  COMPLETED: CheckCircle,
  CANCELLED: AlertCircle,
};

export default function PurchaseOrderDetail() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  // Fetch purchase order data
  const { 
    usePurchaseOrder,
    useUpdatePurchaseOrderStatus,
    useAddPurchaseOrderNote
  } = usePurchaseOrders();
  
  const { 
    data: purchaseOrder, 
    isLoading, 
    error, 
    refetch 
  } = usePurchaseOrder(purchaseOrderId!);
  
  const updateStatusMutation = useUpdatePurchaseOrderStatus();
  const addNoteMutation = useAddPurchaseOrderNote();

  if (!purchaseOrderId) {
    return <div>Invalid purchase order ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading purchase order details...</span>
        </div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load purchase order details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[purchaseOrder.status];

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await addNoteMutation.mutateAsync({
        id: purchaseOrder.id,
        note: noteContent,
      });
      setNoteContent('');
      setShowNoteDialog(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: purchaseOrder.id,
        status: newStatus,
      });
      toast.success(`Purchase order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/procurement/purchase-orders')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">PO #{purchaseOrder.poNumber}</h1>
            <p className="text-muted-foreground">
              Created {format(parseISO(purchaseOrder.createdAt), 'MMMM dd, yyyy')} • Total: ${purchaseOrder.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/procurement/purchase-orders/${purchaseOrder.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
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
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`border-l-4 ${
        purchaseOrder.status === 'COMPLETED' ? 'border-l-green-500 bg-green-50' :
        purchaseOrder.status === 'REJECTED' || purchaseOrder.status === 'CANCELLED' ? 'border-l-red-500 bg-red-50' :
        purchaseOrder.status === 'PENDING_APPROVAL' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription>
          This purchase order is currently <strong>{purchaseOrder.status.toLowerCase().replace('_', ' ')}</strong>
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Purchase Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">PO Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{purchaseOrder.poNumber}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(purchaseOrder.poNumber)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={STATUS_COLORS[purchaseOrder.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {purchaseOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{purchaseOrder.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <Badge variant={purchaseOrder.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                        {purchaseOrder.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">{format(parseISO(purchaseOrder.orderDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Required By</p>
                      <p className="font-medium">{format(parseISO(purchaseOrder.requiredByDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Terms</p>
                      <p className="font-medium">{purchaseOrder.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{purchaseOrder.currency}</p>
                    </div>
                  </div>
                  
                  {purchaseOrder.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="mt-1">{purchaseOrder.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${purchaseOrder.subtotalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${purchaseOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${purchaseOrder.shippingAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${purchaseOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {purchaseOrder.status === 'DRAFT' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('PENDING_APPROVAL')}
                    >
                      Submit for Approval
                    </Button>
                  )}
                  {purchaseOrder.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('REJECTED')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {purchaseOrder.status === 'APPROVED' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('SENT')}
                    >
                      Send to Supplier
                    </Button>
                  )}
                  <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                          Add a note to this purchase order
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="note">Note</Label>
                          <Textarea
                            id="note"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Enter your note here..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNoteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddNote}
                            disabled={addNoteMutation.isPending || !noteContent.trim()}
                          >
                            {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Supplier Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{purchaseOrder.supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.code}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>{purchaseOrder.supplier.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{purchaseOrder.supplier.email}</span>
                    </div>
                    {purchaseOrder.supplier.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>{purchaseOrder.supplier.phone}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View Supplier Details
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <div className="text-sm">
                      <p>{purchaseOrder.deliveryAddress.name}</p>
                      <p>{purchaseOrder.deliveryAddress.street}</p>
                      <p>{purchaseOrder.deliveryAddress.city}, {purchaseOrder.deliveryAddress.state} {purchaseOrder.deliveryAddress.postalCode}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="text-sm font-medium">
                      {format(parseISO(purchaseOrder.requiredByDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Items ({purchaseOrder.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3">Item</th>
                      <th className="text-left py-3">Description</th>
                      <th className="text-right py-3">Quantity</th>
                      <th className="text-right py-3">Unit Price</th>
                      <th className="text-right py-3">Total</th>
                      <th className="text-left py-3">Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.itemCode}</p>
                            {item.partNumber && (
                              <p className="text-sm text-muted-foreground">Part: {item.partNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="text-sm">{item.description}</p>
                          {item.specifications && (
                            <p className="text-xs text-muted-foreground mt-1">{item.specifications}</p>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {item.quantity} {item.unitOfMeasure}
                        </td>
                        <td className="py-3 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-3">
                          {format(parseISO(item.requestedDeliveryDate), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Tab */}
        <TabsContent value="supplier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{purchaseOrder.supplier.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier Code</p>
                    <p className="font-medium">{purchaseOrder.supplier.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary">{purchaseOrder.supplier.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={purchaseOrder.supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {purchaseOrder.supplier.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium">{purchaseOrder.supplier.taxId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{purchaseOrder.supplier.registrationNumber}</p>
                  </div>
                  {purchaseOrder.supplier.website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a 
                        href={purchaseOrder.supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {purchaseOrder.supplier.website}
                      </a>
                    </div>
                  )}
                  {purchaseOrder.supplier.industry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{purchaseOrder.supplier.industry}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Delivery Address</h4>
                  <div className="space-y-2">
                    <p className="font-medium">{purchaseOrder.deliveryAddress.name}</p>
                    <div className="text-sm text-muted-foreground">
                      <p>{purchaseOrder.deliveryAddress.street}</p>
                      {purchaseOrder.deliveryAddress.street2 && (
                        <p>{purchaseOrder.deliveryAddress.street2}</p>
                      )}
                      <p>{purchaseOrder.deliveryAddress.city}, {purchaseOrder.deliveryAddress.state} {purchaseOrder.deliveryAddress.postalCode}</p>
                      <p>{purchaseOrder.deliveryAddress.country}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>{purchaseOrder.deliveryAddress.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{purchaseOrder.deliveryAddress.contactNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Required By Date</p>
                  <p className="font-medium">{format(parseISO(purchaseOrder.requiredByDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipping Method</p>
                  <p className="font-medium">{purchaseOrder.shippingMethod || 'Standard'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Terms</p>
                  <p className="font-medium">{purchaseOrder.deliveryTerms || 'FOB Destination'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrder.history && purchaseOrder.history.length > 0 ? (
                  purchaseOrder.history.map((activity, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {format(parseISO(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                        </p>
                        {activity.note && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mt-2">No activity history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}