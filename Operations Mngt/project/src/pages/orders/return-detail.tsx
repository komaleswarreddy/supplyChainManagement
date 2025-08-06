import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReturnDetail, useUpdateReturnStatus } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  RotateCcw, 
  Package, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Receipt,
  Download,
  Printer,
  FileText,
  ExternalLink,
  Copy,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Truck,
  Camera,
  Paperclip,
  MessageSquare,
  History,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ReturnStatus, ReturnReason } from '@/types/order';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'PROCESSED', 'COMPLETED']),
  notes: z.string().optional(),
  refundAmount: z.number().optional(),
  restockingFee: z.number().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

const STATUS_COLORS: Record<ReturnStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-purple-100 text-purple-800',
  PROCESSED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const STATUS_ICONS: Record<ReturnStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  RECEIVED: Package,
  PROCESSED: RefreshCw,
  COMPLETED: CheckCircle,
};

const REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: 'Defective/Damaged',
  WRONG_SIZE: 'Wrong Size',
  WRONG_ITEM: 'Wrong Item',
  NOT_AS_DESCRIBED: 'Not As Described',
  CHANGED_MIND: 'Changed Mind',
  BETTER_PRICE: 'Found Better Price',
  QUALITY_ISSUES: 'Quality Issues',
  LATE_DELIVERY: 'Late Delivery',
  OTHER: 'Other',
};

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showImagesDialog, setShowImagesDialog] = useState(false);

  // Fetch return data
  const { 
    data: returnData, 
    isLoading, 
    error, 
    refetch 
  } = useReturnDetail(id!);

  // Update status mutation
  const updateStatusMutation = useUpdateReturnStatus();

  // Form setup
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: returnData?.status || 'PENDING',
      notes: '',
    },
  });

  if (!id) {
    return <div>Invalid return ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading return details...</span>
        </div>
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load return details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[returnData.status];

  const handleStatusUpdate = async (data: UpdateStatusFormData) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: returnData.id,
        status: data.status,
        notes: data.notes,
        refundAmount: data.refundAmount,
        restockingFee: data.restockingFee,
      });
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Failed to update return status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadLabel = () => {
    // Generate return shipping label
    const labelUrl = `/api/returns/${returnData.id}/label`;
    window.open(labelUrl, '_blank');
  };

  const canUpdateStatus = ['PENDING', 'APPROVED', 'RECEIVED'].includes(returnData.status);
  const canProcessRefund = returnData.status === 'PROCESSED' && !returnData.refundedAt;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/returns')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Return {returnData.returnNumber}</h1>
            <p className="text-muted-foreground">
              Created {format(parseISO(returnData.createdAt), 'MMMM dd, yyyy')} at {format(parseISO(returnData.createdAt), 'h:mm a')}
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
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadLabel}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Return Label
          </Button>
          {canUpdateStatus && (
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Return Status</DialogTitle>
                  <DialogDescription>
                    Update the status of this return request
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleStatusUpdate)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">New Status</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as ReturnStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="RECEIVED">Received</SelectItem>
                        <SelectItem value="PROCESSED">Processed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {watch('status') === 'PROCESSED' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="refundAmount">Refund Amount</Label>
                        <Input
                          id="refundAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register('refundAmount', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="restockingFee">Restocking Fee</Label>
                        <Input
                          id="restockingFee"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register('restockingFee', { valueAsNumber: true })}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this status update"
                      {...register('notes')}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStatusDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`border-l-4 ${
        returnData.status === 'COMPLETED' ? 'border-l-green-500 bg-green-50' :
        returnData.status === 'REJECTED' ? 'border-l-red-500 bg-red-50' :
        returnData.status === 'PENDING' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription>
          This return is currently <strong>{returnData.status.toLowerCase()}</strong>
          {returnData.status === 'REJECTED' && returnData.rejectionReason && (
            <span>: {returnData.rejectionReason}</span>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Return Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Return Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Return Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{returnData.returnNumber}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(returnData.returnNumber)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[returnData.status]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {returnData.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p>{returnData.type.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p>{REASON_LABELS[returnData.reason] || returnData.reason}</p>
                </div>
              </div>

              {returnData.reasonDescription && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reason Description</p>
                    <p>{returnData.reasonDescription}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="text-xl font-bold">${returnData.refundAmount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Restocking Fee</p>
                  <p className="text-xl font-bold">${returnData.restockingFee.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Shipping Cost</p>
                  <p className="text-xl font-bold">${returnData.shippingCost.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Refund</p>
                  <p className="text-2xl font-bold text-green-600">${returnData.totalRefund.toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p>{format(parseISO(returnData.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                </div>
                {returnData.receivedAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p>{format(parseISO(returnData.receivedAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                )}
                {returnData.processedAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p>{format(parseISO(returnData.processedAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                )}
                {returnData.refundedAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Refunded</p>
                    <p>{format(parseISO(returnData.refundedAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                )}
              </div>

              {returnData.trackingNumber && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono">{returnData.trackingNumber}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(returnData.trackingNumber!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Return Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Return Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Unit Price</p>
                            <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        {item.condition && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Condition: {item.condition}</p>
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Notes: {item.notes}</p>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          {returnData.images && returnData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {returnData.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setShowImagesDialog(true)}
                    >
                      <img
                        src={image}
                        alt={`Return image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {returnData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{returnData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Original Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link
                  to={`/orders/${returnData.orderId}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  Order #{returnData.order?.orderNumber}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  Total: ${returnData.order?.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {returnData.order?.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {format(parseISO(returnData.order?.createdAt!), 'MMM dd, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link
                  to={`/orders/customers/${returnData.customer.id}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  {returnData.customer.firstName} {returnData.customer.lastName}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                {returnData.customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {returnData.customer.email}
                  </div>
                )}
                {returnData.customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {returnData.customer.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Return Address */}
          {returnData.returnAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Return Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{returnData.returnAddress.firstName} {returnData.returnAddress.lastName}</p>
                  {returnData.returnAddress.company && (
                    <p>{returnData.returnAddress.company}</p>
                  )}
                  <p>{returnData.returnAddress.addressLine1}</p>
                  {returnData.returnAddress.addressLine2 && (
                    <p>{returnData.returnAddress.addressLine2}</p>
                  )}
                  <p>{returnData.returnAddress.city}, {returnData.returnAddress.state} {returnData.returnAddress.postalCode}</p>
                  <p>{returnData.returnAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Processing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Return Requested</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(returnData.createdAt), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {returnData.approvedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(returnData.approvedAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      {returnData.approvedBy && (
                        <p className="text-xs text-muted-foreground">
                          by {returnData.approvedBy.firstName} {returnData.approvedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {returnData.receivedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Items Received</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(returnData.receivedAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      {returnData.receivedBy && (
                        <p className="text-xs text-muted-foreground">
                          by {returnData.receivedBy.firstName} {returnData.receivedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {returnData.processedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Processed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(returnData.processedAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      {returnData.processedBy && (
                        <p className="text-xs text-muted-foreground">
                          by {returnData.processedBy.firstName} {returnData.processedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 