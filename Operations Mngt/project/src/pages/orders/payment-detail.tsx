import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePaymentDetail, useRefundPayment } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Receipt,
  Download,
  Printer,
  RotateCcw,
  FileText,
  ExternalLink,
  Copy,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Shield,
  Banknote
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PaymentStatus, PaymentMethod } from '@/types/order';

const refundSchema = z.object({
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().min(1, 'Refund reason is required'),
  notes: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS: Record<PaymentStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw,
};

const METHOD_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  BANK_TRANSFER: Building,
  PAYPAL: DollarSign,
  STRIPE: CreditCard,
  CASH: Banknote,
  CHECK: Receipt,
  STORE_CREDIT: DollarSign,
  GIFT_CARD: Receipt,
  OTHER: DollarSign,
};

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // Fetch payment data
  const { 
    data: payment, 
    isLoading, 
    error, 
    refetch 
  } = usePaymentDetail(id!);

  // Refund mutation
  const refundMutation = useRefundPayment();

  // Form setup
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: payment?.amount || 0,
      reason: '',
      notes: '',
    },
  });

  if (!id) {
    return <div>Invalid payment ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load payment details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[payment.status];
  const MethodIcon = METHOD_ICONS[payment.method];

  const handleRefund = async (data: RefundFormData) => {
    try {
      await refundMutation.mutateAsync({
        id: payment.id,
        amount: data.amount,
        reason: data.reason,
      });
      setShowRefundDialog(false);
    } catch (error) {
      console.error('Failed to process refund:', error);
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

  const handleDownloadReceipt = () => {
    // Generate PDF receipt
    const receiptUrl = `/api/payments/${payment.id}/receipt`;
    window.open(receiptUrl, '_blank');
  };

  const maxRefundAmount = payment.amount - payment.refundAmount;
  const canRefund = payment.status === 'COMPLETED' && maxRefundAmount > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/payments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payment {payment.paymentNumber}</h1>
            <p className="text-muted-foreground">
              Created {format(parseISO(payment.createdAt), 'MMMM dd, yyyy')} at {format(parseISO(payment.createdAt), 'h:mm a')}
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
            onClick={handleDownloadReceipt}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Receipt
          </Button>
          {canRefund && (
            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Refund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process Refund</DialogTitle>
                  <DialogDescription>
                    Process a refund for this payment. Maximum refundable amount: ${maxRefundAmount.toFixed(2)}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleRefund)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Refund Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      max={maxRefundAmount}
                      {...register('amount', { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="Enter refund reason"
                      {...register('reason')}
                    />
                    {errors.reason && (
                      <p className="text-sm text-red-600">{errors.reason.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes"
                      {...register('notes')}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRefundDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={refundMutation.isPending}
                    >
                      {refundMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Process Refund'
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
        payment.status === 'COMPLETED' ? 'border-l-green-500 bg-green-50' :
        payment.status === 'FAILED' ? 'border-l-red-500 bg-red-50' :
        payment.status === 'PENDING' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription>
          This payment is currently <strong>{payment.status.toLowerCase()}</strong>
          {payment.status === 'FAILED' && payment.failureReason && (
            <span>: {payment.failureReason}</span>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{payment.paymentNumber}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.paymentNumber)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[payment.status]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {payment.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${payment.amount.toFixed(2)} {payment.currency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Method</p>
                  <div className="flex items-center gap-2">
                    <MethodIcon className="h-4 w-4" />
                    <span>{payment.method.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{format(parseISO(payment.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                </div>
                {payment.processedAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p>{format(parseISO(payment.processedAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                )}
                {payment.transactionId && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{payment.transactionId}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.transactionId!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {payment.gatewayResponse && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gateway</p>
                    <p>{payment.gatewayResponse.gateway || 'N/A'}</p>
                  </div>
                )}
              </div>

              {payment.notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{payment.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Refunds */}
          {payment.refunds && payment.refunds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Refunds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payment.refunds.map((refund, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">${refund.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{refund.reason}</p>
                          {refund.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{refund.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={STATUS_COLORS[refund.status]}>
                            {refund.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(refund.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <Receipt className="h-5 w-5" />
                Related Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link
                  to={`/orders/${payment.orderId}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  Order #{payment.order?.orderNumber}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  Total: ${payment.order?.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {payment.order?.status}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {payment.customer && (
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
                    to={`/orders/customers/${payment.customer.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    {payment.customer.firstName} {payment.customer.lastName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  {payment.customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {payment.customer.email}
                    </div>
                  )}
                  {payment.customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {payment.customer.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {payment.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{payment.billingAddress.firstName} {payment.billingAddress.lastName}</p>
                  {payment.billingAddress.company && (
                    <p>{payment.billingAddress.company}</p>
                  )}
                  <p>{payment.billingAddress.addressLine1}</p>
                  {payment.billingAddress.addressLine2 && (
                    <p>{payment.billingAddress.addressLine2}</p>
                  )}
                  <p>{payment.billingAddress.city}, {payment.billingAddress.state} {payment.billingAddress.postalCode}</p>
                  <p>{payment.billingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Card Info */}
          {payment.cardLast4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{payment.cardBrand} ending in {payment.cardLast4}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 