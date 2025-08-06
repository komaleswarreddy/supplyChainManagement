import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInvoice } from '@/hooks/useInvoice';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, MessageSquare, DollarSign, Paperclip, Clock, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  DRAFT: 'default',
  PENDING_MATCHING: 'secondary',
  MATCHED: 'success',
  EXCEPTION: 'warning',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  DISPUTED: 'destructive',
  SCHEDULED: 'primary',
  PAID: 'success',
  CANCELLED: 'default',
} as const;

const matchStatusColors = {
  NOT_MATCHED: 'default',
  FULLY_MATCHED: 'success',
  PARTIALLY_MATCHED: 'warning',
  EXCEPTION: 'destructive',
} as const;

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const [exceptionResolution, setExceptionResolution] = useState('');
  const [disputeMessage, setDisputeMessage] = useState('');
  
  const { 
    useInvoice, 
    useSubmitForMatching, 
    usePerformMatching, 
    useResolveException,
    useSubmitForApproval,
    useApproveInvoice,
    useRejectInvoice,
    useAddDisputeCommunication,
    useResolveDispute,
    useProcessPayment
  } = useInvoice;
  
  const { data: invoice, isLoading } = useInvoice(id!);
  const { mutate: submitForMatching, isLoading: isSubmittingForMatching } = useSubmitForMatching();
  const { mutate: performMatching, isLoading: isPerformingMatching } = usePerformMatching();
  const { mutate: resolveException, isLoading: isResolvingException } = useResolveException();
  const { mutate: submitForApproval, isLoading: isSubmittingForApproval } = useSubmitForApproval();
  const { mutate: approveInvoice, isLoading: isApproving } = useApproveInvoice();
  const { mutate: rejectInvoice, isLoading: isRejecting } = useRejectInvoice();
  const { mutate: addDisputeCommunication, isLoading: isAddingCommunication } = useAddDisputeCommunication();
  const { mutate: resolveDispute, isLoading: isResolvingDispute } = useResolveDispute();
  const { mutate: processPayment, isLoading: isProcessingPayment } = useProcessPayment();

  const handleSubmitForMatching = () => {
    submitForMatching(id!);
  };

  const handlePerformMatching = () => {
    performMatching(id!);
  };

  const handleResolveException = (exceptionIndex: number) => {
    confirm(() => {
      resolveException({
        id: id!,
        exceptionIndex,
        resolution: exceptionResolution || 'Exception resolved and approved',
      });
      setExceptionResolution('');
    });
  };

  const handleSubmitForApproval = () => {
    submitForApproval(id!);
  };

  const handleApprove = () => {
    confirm(() => {
      approveInvoice({
        id: id!,
        level: invoice?.approvalWorkflow?.currentLevel || 1,
      });
    });
  };

  const handleReject = () => {
    confirm(() => {
      rejectInvoice({
        id: id!,
        level: invoice?.approvalWorkflow?.currentLevel || 1,
        reason: 'Invoice rejected by approver',
      });
    });
  };

  const handleAddDisputeCommunication = () => {
    if (disputeMessage.trim()) {
      addDisputeCommunication({
        id: id!,
        message: disputeMessage,
        senderType: 'INTERNAL',
      });
      setDisputeMessage('');
    }
  };

  const handleResolveDispute = () => {
    confirm(() => {
      resolveDispute({
        id: id!,
        resolution: 'Dispute resolved by agreement',
      });
    });
  };

  const handleProcessPayment = () => {
    confirm(() => {
      processPayment(id!);
    });
  };

  if (isLoading || !invoice) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/invoices')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {invoice.supplier.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[invoice.status]} className="h-6 px-3 text-sm">
              {invoice.status.replace('_', ' ')}
            </Badge>
            {invoice.status === 'APPROVED' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/invoices/payment-schedule', { state: { invoiceId: id } })}
              >
                Schedule Payment
              </Button>
            )}
            {invoice.status !== 'DISPUTED' && invoice.status !== 'DRAFT' && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/invoices/dispute/${id}`)}
              >
                Dispute
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="line-items">Line Items</TabsTrigger>
            <TabsTrigger value="matching">3-Way Matching</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            {invoice.dispute && <TabsTrigger value="dispute">Dispute</TabsTrigger>}
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Invoice Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                      <p className="mt-1 font-medium">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                      <p className="mt-1">{invoice.supplier.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Invoice Date</h3>
                      <p className="mt-1">{format(new Date(invoice.invoiceDate), 'PP')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                      <p className="mt-1">{format(new Date(invoice.dueDate), 'PP')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Payment Terms</h3>
                      <p className="mt-1">{invoice.paymentTerms}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                      <p className="mt-1">{invoice.source}</p>
                    </div>
                    {invoice.poNumbers && invoice.poNumbers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">PO Numbers</h3>
                        <p className="mt-1">{invoice.poNumbers.join(', ')}</p>
                      </div>
                    )}
                    {invoice.grnNumbers && invoice.grnNumbers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">GRN Numbers</h3>
                        <p className="mt-1">{invoice.grnNumbers.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Amount Information</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{invoice.currency} {invoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{invoice.currency} {invoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {invoice.payment && (
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="font-medium mb-2">Payment Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={
                            invoice.payment.status === 'COMPLETED' ? 'success' :
                            invoice.payment.status === 'FAILED' ? 'destructive' :
                            'secondary'
                          }>
                            {invoice.payment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span>{invoice.payment.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheduled Date:</span>
                          <span>{format(new Date(invoice.payment.scheduledDate), 'PP')}</span>
                        </div>
                        {invoice.payment.earlyPaymentDiscount?.applied && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount Applied:</span>
                            <span className="text-green-600">
                              {invoice.currency} {invoice.payment.earlyPaymentDiscount.discountAmount.toLocaleString()} ({invoice.payment.earlyPaymentDiscount.discountPercent}%)
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span>Payment Amount:</span>
                          <span>{invoice.currency} {invoice.payment.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {invoice.description && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p>{invoice.description}</p>
              </div>
            )}

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="flex flex-wrap gap-2">
                  {invoice.status === 'DRAFT' && (
                    <Button 
                      onClick={handleSubmitForMatching}
                      disabled={isSubmittingForMatching}
                    >
                      {isSubmittingForMatching ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Matching'
                      )}
                    </Button>
                  )}
                  
                  {invoice.status === 'PENDING_MATCHING' && (
                    <Button 
                      onClick={handlePerformMatching}
                      disabled={isPerformingMatching}
                    >
                      {isPerformingMatching ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Matching...
                        </>
                      ) : (
                        'Perform Matching'
                      )}
                    </Button>
                  )}
                  
                  {invoice.status === 'MATCHED' && (
                    <Button 
                      onClick={handleSubmitForApproval}
                      disabled={isSubmittingForApproval}
                    >
                      {isSubmittingForApproval ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>
                  )}
                  
                  {invoice.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button 
                        onClick={handleApprove}
                        disabled={isApproving}
                      >
                        {isApproving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isRejecting}
                      >
                        {isRejecting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Rejecting...
                          </>
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </>
                  )}
                  
                  {invoice.status === 'APPROVED' && (
                    <Button 
                      onClick={() => navigate('/invoices/payment-schedule', { state: { invoiceId: id } })}
                    >
                      Schedule Payment
                    </Button>
                  )}
                  
                  {invoice.status === 'SCHEDULED' && (
                    <Button 
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Process Payment'
                      )}
                    </Button>
                  )}
                  
                  {invoice.status !== 'DISPUTED' && invoice.status !== 'DRAFT' && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/invoices/dispute/${id}`)}
                    >
                      Dispute Invoice
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="line-items" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Line Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Line #</th>
                        <th className="text-left py-2 px-4">Description</th>
                        <th className="text-right py-2 px-4">Quantity</th>
                        <th className="text-right py-2 px-4">Unit Price</th>
                        <th className="text-right py-2 px-4">Amount</th>
                        <th className="text-right py-2 px-4">Tax</th>
                        <th className="text-right py-2 px-4">Total</th>
                        <th className="text-center py-2 px-4">Match Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-4">{item.lineNumber}</td>
                          <td className="py-2 px-4">{item.description}</td>
                          <td className="py-2 px-4 text-right">{item.quantity} {item.unitOfMeasure}</td>
                          <td className="py-2 px-4 text-right">{invoice.currency} {item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{invoice.currency} {item.amount.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{invoice.currency} {item.taxAmount.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-medium">{invoice.currency} {item.totalAmount.toLocaleString()}</td>
                          <td className="py-2 px-4 text-center">
                            <Badge variant={matchStatusColors[item.matchStatus]}>
                              {item.matchStatus.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan={4} className="py-2 px-4 font-medium">Totals</td>
                        <td className="py-2 px-4 text-right font-medium">{invoice.currency} {invoice.amount.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right font-medium">{invoice.currency} {invoice.taxAmount.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right font-bold">{invoice.currency} {invoice.totalAmount.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {invoice.lineItems.some(item => item.poLineItem) && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">PO Line Item Details</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Line #</th>
                          <th className="text-left py-2 px-4">PO Number</th>
                          <th className="text-left py-2 px-4">PO Line #</th>
                          <th className="text-left py-2 px-4">Item Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.lineItems.filter(item => item.poLineItem).map((item) => (
                          <tr key={`po-${item.id}`} className="border-b">
                            <td className="py-2 px-4">{item.lineNumber}</td>
                            <td className="py-2 px-4">{item.poLineItem?.poNumber}</td>
                            <td className="py-2 px-4">{item.poLineItem?.lineNumber}</td>
                            <td className="py-2 px-4">{item.poLineItem?.itemCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {invoice.lineItems.some(item => item.grnLineItem) && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">GRN Line Item Details</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Line #</th>
                          <th className="text-left py-2 px-4">GRN Number</th>
                          <th className="text-left py-2 px-4">GRN Line #</th>
                          <th className="text-right py-2 px-4">Received Quantity</th>
                          <th className="text-left py-2 px-4">Received Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.lineItems.filter(item => item.grnLineItem).map((item) => (
                          <tr key={`grn-${item.id}`} className="border-b">
                            <td className="py-2 px-4">{item.lineNumber}</td>
                            <td className="py-2 px-4">{item.grnLineItem?.grnNumber}</td>
                            <td className="py-2 px-4">{item.grnLineItem?.lineNumber}</td>
                            <td className="py-2 px-4 text-right">{item.grnLineItem?.receivedQuantity}</td>
                            <td className="py-2 px-4">{format(new Date(item.grnLineItem!.receivedDate), 'PP')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="matching" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">3-Way Matching</h2>
                  <Badge variant={matchStatusColors[invoice.matchStatus]} className="h-6 px-3 text-sm">
                    {invoice.matchStatus.replace('_', ' ')}
                  </Badge>
                </div>
                
                {invoice.matchDetails ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">PO Match</h3>
                        <div className="flex items-center gap-2">
                          {invoice.matchDetails.poMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <span>{invoice.matchDetails.poMatch ? 'Matched' : 'Not Matched'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">GRN Match</h3>
                        <div className="flex items-center gap-2">
                          {invoice.matchDetails.grnMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <span>{invoice.matchDetails.grnMatch ? 'Matched' : 'Not Matched'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Price Match</h3>
                        <div className="flex items-center gap-2">
                          {invoice.matchDetails.priceMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <span>{invoice.matchDetails.priceMatch ? 'Matched' : 'Not Matched'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Quantity Match</h3>
                        <div className="flex items-center gap-2">
                          {invoice.matchDetails.quantityMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <span>{invoice.matchDetails.quantityMatch ? 'Matched' : 'Not Matched'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {invoice.matchDetails.exceptions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Exceptions</h3>
                        {invoice.matchDetails.exceptions.map((exception, index) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <h4 className="font-medium">{exception.type.replace('_', ' ')}</h4>
                              </div>
                              <Badge variant={exception.resolved ? 'success' : 'warning'}>
                                {exception.resolved ? 'Resolved' : 'Unresolved'}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{exception.description}</p>
                            {exception.amount && (
                              <p className="text-sm mb-2">
                                <span className="text-muted-foreground">Amount:</span>{' '}
                                <span className="font-medium">{invoice.currency} {exception.amount.toLocaleString()}</span>
                              </p>
                            )}
                            
                            {exception.resolved ? (
                              <div className="mt-4 text-sm">
                                <p>
                                  <span className="text-muted-foreground">Resolved by:</span>{' '}
                                  <span>{exception.resolvedBy?.name}</span>
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Resolved at:</span>{' '}
                                  <span>{format(new Date(exception.resolvedAt!), 'PPp')}</span>
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Resolution:</span>{' '}
                                  <span>{exception.resolution}</span>
                                </p>
                              </div>
                            ) : (
                              <div className="mt-4 space-y-2">
                                <Textarea
                                  placeholder="Enter resolution details"
                                  value={exceptionResolution}
                                  onChange={(e) => setExceptionResolution(e.target.value)}
                                  rows={2}
                                />
                                <Button 
                                  onClick={() => handleResolveException(index)}
                                  disabled={isResolvingException || !exceptionResolution.trim()}
                                  className="w-full"
                                >
                                  {isResolvingException ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Resolving...
                                    </>
                                  ) : (
                                    'Resolve Exception'
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {invoice.status === 'MATCHED' && (
                      <Button 
                        onClick={handleSubmitForApproval}
                        disabled={isSubmittingForApproval}
                      >
                        {isSubmittingForApproval ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit for Approval'
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                    <p className="text-muted-foreground mb-4">This invoice has not been matched yet.</p>
                    {invoice.status === 'DRAFT' && (
                      <Button 
                        onClick={handleSubmitForMatching}
                        disabled={isSubmittingForMatching}
                      >
                        {isSubmittingForMatching ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit for Matching'
                        )}
                      </Button>
                    )}
                    {invoice.status === 'PENDING_MATCHING' && (
                      <Button 
                        onClick={handlePerformMatching}
                        disabled={isPerformingMatching}
                      >
                        {isPerformingMatching ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Matching...
                          </>
                        ) : (
                          'Perform Matching'
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Approval Workflow</h2>
                
                {invoice.approvalWorkflow ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                        <p className="font-medium">{invoice.approvalWorkflow.currentLevel} of {invoice.approvalWorkflow.maxLevels}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">{format(new Date(invoice.approvalWorkflow.dueDate!), 'PP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={invoice.approvalWorkflow.overdue ? 'destructive' : 'secondary'}>
                          {invoice.approvalWorkflow.overdue ? 'Overdue' : 'On Time'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {invoice.approvalWorkflow.levels.map((level) => (
                        <div key={level.level} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                {level.level}
                              </div>
                              <div>
                                <p className="font-medium">{level.approver.name}</p>
                                <p className="text-sm text-muted-foreground">{level.approver.position}, {level.approver.department}</p>
                              </div>
                            </div>
                            <Badge variant={
                              level.status === 'APPROVED' ? 'success' :
                              level.status === 'REJECTED' ? 'destructive' :
                              level.status === 'DELEGATED' ? 'secondary' :
                              'default'
                            }>
                              {level.status}
                            </Badge>
                          </div>
                          
                          {level.comment && (
                            <p className="text-sm mt-2">
                              <span className="text-muted-foreground">Comment:</span>{' '}
                              <span>{level.comment}</span>
                            </p>
                          )}
                          
                          {level.timestamp && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Date:</span>{' '}
                              <span>{format(new Date(level.timestamp), 'PPp')}</span>
                            </p>
                          )}
                          
                          {level.level === invoice.approvalWorkflow.currentLevel && level.status === 'PENDING' && (
                            <div className="mt-4 flex gap-2">
                              <Button 
                                onClick={handleApprove}
                                disabled={isApproving}
                                className="flex-1"
                              >
                                {isApproving ? (
                                  <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Approving...
                                  </>
                                ) : (
                                  'Approve'
                                )}
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isRejecting}
                                className="flex-1"
                              >
                                {isRejecting ? (
                                  <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Rejecting...
                                  </>
                                ) : (
                                  'Reject'
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">This invoice has not been submitted for approval yet.</p>
                    {invoice.status === 'MATCHED' && (
                      <Button 
                        onClick={handleSubmitForApproval}
                        disabled={isSubmittingForApproval}
                        className="mt-4"
                      >
                        {isSubmittingForApproval ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit for Approval'
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {invoice.dispute && (
            <TabsContent value="dispute" className="space-y-4">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Dispute Information</h2>
                    <Badge variant={
                      invoice.dispute.status === 'RESOLVED' ? 'success' :
                      invoice.dispute.status === 'CANCELLED' ? 'default' :
                      invoice.dispute.status === 'IN_PROGRESS' ? 'warning' :
                      'destructive'
                    }>
                      {invoice.dispute.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                        <p className="mt-1">{invoice.dispute.reason.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                        <p className="mt-1">{invoice.currency} {invoice.dispute.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                        <p className="mt-1">{invoice.dispute.createdBy.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                        <p className="mt-1">{format(new Date(invoice.dispute.createdAt), 'PPp')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="mt-1">{invoice.dispute.description}</p>
                    </div>
                    
                    {invoice.dispute.resolution && (
                      <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                        <h3 className="text-sm font-medium text-green-800">Resolution</h3>
                        <p className="mt-1 text-green-700">{invoice.dispute.resolution}</p>
                        <div className="mt-2 text-sm text-green-600">
                          <p>Resolved by {invoice.dispute.resolvedBy?.name} on {format(new Date(invoice.dispute.resolvedAt!), 'PPp')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Communication</h2>
                  
                  <div className="space-y-4 mb-6">
                    {invoice.dispute.communications.map((comm) => (
                      <div 
                        key={comm.id} 
                        className={`rounded-lg p-4 ${
                          comm.sender.type === 'INTERNAL' ? 'bg-blue-50 border border-blue-200 ml-8' : 'bg-gray-50 border border-gray-200 mr-8'
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{comm.sender.name}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(comm.timestamp), 'PPp')}</p>
                        </div>
                        <p className="text-sm">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  {invoice.dispute.status !== 'RESOLVED' && invoice.dispute.status !== 'CANCELLED' && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your message here..."
                        value={disputeMessage}
                        onChange={(e) => setDisputeMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-between">
                        <Button 
                          variant="outline"
                          onClick={handleResolveDispute}
                          disabled={isResolvingDispute}
                        >
                          {isResolvingDispute ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Resolving...
                            </>
                          ) : (
                            'Resolve Dispute'
                          )}
                        </Button>
                        <Button 
                          onClick={handleAddDisputeCommunication}
                          disabled={isAddingCommunication || !disputeMessage.trim()}
                        >
                          {isAddingCommunication ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Sending...
                            </>
                          ) : (
                            'Send Message'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="attachments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Attachments</h2>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Add Attachment
                  </Button>
                </div>
                
                {invoice.attachments.length > 0 ? (
                  <div className="space-y-4">
                    {invoice.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{attachment.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded by {attachment.uploadedBy.name} on {format(new Date(attachment.uploadedAt), 'PP')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No attachments found for this invoice.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Status History</h2>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-muted"></div>
                  
                  <div className="space-y-6 ml-9">
                    {invoice.audit.statusHistory.map((history, index) => (
                      <div key={index} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-9 top-1 h-4 w-4 rounded-full border-2 ${
                          index === 0 ? 'bg-primary border-primary' : 'bg-background border-muted'
                        }`}></div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusColors[history.status]}>
                              {history.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(history.timestamp), 'PPp')}
                            </span>
                          </div>
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">By:</span> {history.user.name}
                          </p>
                          {history.comment && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Comment:</span> {history.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Continue"
        onConfirm={onConfirm}
      />
    </div>
  );
}