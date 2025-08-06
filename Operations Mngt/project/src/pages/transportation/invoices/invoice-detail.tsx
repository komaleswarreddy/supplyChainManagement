import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { ArrowLeft, DollarSign, Check, X, AlertTriangle, FileCheck, Printer, ExternalLink } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  PENDING: 'default',
  VERIFIED: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  PAID: 'primary',
} as const;

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const [auditNotes, setAuditNotes] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  
  const { 
    useInvoice, 
    useAuditInvoice, 
    useApproveInvoice, 
    useRejectInvoice 
  } = useTransportation();
  
  const { data: invoice, isLoading } = useInvoice(id!);
  const { mutate: auditInvoice, isLoading: isAuditing } = useAuditInvoice();
  const { mutate: approveInvoice, isLoading: isApproving } = useApproveInvoice();
  const { mutate: rejectInvoice, isLoading: isRejecting } = useRejectInvoice();

  const handleAudit = () => {
    // In a real app, this would be a more complex process with line item validation
    const hasVariance = Math.random() > 0.7;
    
    const auditResults = {
      status: hasVariance ? 'VARIANCE' : 'MATCH',
      variances: hasVariance ? [
        {
          chargeType: 'Fuel Surcharge',
          expected: invoice!.charges.find(c => c.description === 'Fuel Surcharge')?.amount || 0,
          actual: (invoice!.charges.find(c => c.description === 'Fuel Surcharge')?.amount || 0) + 50,
          difference: 50,
          approved: false,
          notes: auditNotes || 'Rate increase not in contract',
        },
      ] : [],
      auditedBy: {
        id: 'user-3',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        name: 'Mike Johnson',
        roles: ['accounts_payable'],
        permissions: ['audit_invoices'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    auditInvoice({ id: id!, auditResults });
  };

  const handleApprove = () => {
    confirm(() => {
      approveInvoice(id!);
    });
  };

  const handleReject = () => {
    confirm(() => {
      rejectInvoice({ id: id!, reason: rejectReason || 'Invoice rejected' });
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
              onClick={() => navigate('/transportation/invoices')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {invoice.carrierName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[invoice.status]} className="h-6 px-3 text-sm">
              {invoice.status}
            </Badge>
            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Invoice #</h3>
                    <p className="mt-1 font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Carrier</h3>
                    <p className="mt-1">{invoice.carrierName}</p>
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
                    <h3 className="text-sm font-medium text-muted-foreground">Shipments</h3>
                    <div className="mt-1">
                      {invoice.shipmentIds.map((shipmentId, index) => (
                        <div key={index} className="text-sm">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary"
                            onClick={() => navigate(`/transportation/shipments/${shipmentId}`)}
                          >
                            {shipmentId}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Charges</h2>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Description</th>
                          <th className="text-left py-2 px-4">Category</th>
                          <th className="text-left py-2 px-4">Shipment</th>
                          <th className="text-right py-2 px-4">Amount</th>
                          {invoice.auditResults && (
                            <>
                              <th className="text-right py-2 px-4">Expected</th>
                              <th className="text-right py-2 px-4">Variance</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.charges.map((charge, index) => {
                          const variance = invoice.auditResults?.variances.find(v => 
                            v.chargeType === charge.description
                          );
                          
                          return (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-4">{charge.description}</td>
                              <td className="py-2 px-4">{charge.category}</td>
                              <td className="py-2 px-4">{charge.shipmentId || '-'}</td>
                              <td className="py-2 px-4 text-right tabular-nums">
                                {invoice.currency} {charge.amount.toLocaleString()}
                              </td>
                              {invoice.auditResults && (
                                <>
                                  <td className="py-2 px-4 text-right tabular-nums">
                                    {variance ? 
                                      `${invoice.currency} ${variance.expected.toLocaleString()}` : 
                                      '-'
                                    }
                                  </td>
                                  <td className="py-2 px-4 text-right tabular-nums">
                                    {variance ? (
                                      <span className={variance.difference !== 0 ? 'text-red-500' : ''}>
                                        {variance.difference > 0 ? '+' : ''}
                                        {invoice.currency} {variance.difference.toLocaleString()}
                                      </span>
                                    ) : '-'}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={3} className="py-2 px-4 font-medium">Subtotal</td>
                          <td className="py-2 px-4 text-right font-medium tabular-nums">
                            {invoice.currency} {invoice.subtotal.toLocaleString()}
                          </td>
                          {invoice.auditResults && <td colSpan={2}></td>}
                        </tr>
                        <tr>
                          <td colSpan={3} className="py-2 px-4">Taxes</td>
                          <td className="py-2 px-4 text-right tabular-nums">
                            {invoice.currency} {invoice.taxes.toLocaleString()}
                          </td>
                          {invoice.auditResults && <td colSpan={2}></td>}
                        </tr>
                        <tr className="font-bold">
                          <td colSpan={3} className="py-2 px-4">Total</td>
                          <td className="py-2 px-4 text-right tabular-nums">
                            {invoice.currency} {invoice.total.toLocaleString()}
                          </td>
                          {invoice.auditResults && <td colSpan={2}></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {invoice.auditResults && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Audit Results</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-medium">Status:</h3>
                    <Badge variant={
                      invoice.auditResults.status === 'MATCH' ? 'success' : 
                      invoice.auditResults.status === 'VARIANCE' ? 'warning' : 
                      'default'
                    }>
                      {invoice.auditResults.status}
                    </Badge>
                  </div>
                  
                  {invoice.auditResults.variances.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Variances:</h3>
                      {invoice.auditResults.variances.map((variance, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">{variance.chargeType}</h4>
                            <Badge variant={variance.approved ? 'success' : 'warning'}>
                              {variance.approved ? 'Approved' : 'Pending Approval'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Expected:</span>{' '}
                              <span className="font-medium">{invoice.currency} {variance.expected.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Actual:</span>{' '}
                              <span className="font-medium">{invoice.currency} {variance.actual.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Difference:</span>{' '}
                              <span className={`font-medium ${variance.difference !== 0 ? 'text-red-500' : ''}`}>
                                {variance.difference > 0 ? '+' : ''}
                                {invoice.currency} {variance.difference.toLocaleString()}
                              </span>
                            </div>
                            {variance.notes && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Notes:</span>{' '}
                                <span>{variance.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">Audited By:</span>{' '}
                      <span>{invoice.auditResults.auditedBy?.name}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Audited At:</span>{' '}
                      <span>{format(new Date(invoice.auditResults.auditedAt!), 'PPp')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.paymentInfo && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
                      <p className="mt-1">{format(new Date(invoice.paymentInfo.paymentDate), 'PP')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                      <p className="mt-1">{invoice.paymentInfo.paymentMethod}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
                      <p className="mt-1">{invoice.paymentInfo.paymentReference}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Paid By</h3>
                      <p className="mt-1">{invoice.paymentInfo.paidBy.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice Actions</h2>
                
                {invoice.status === 'PENDING' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="auditNotes">Audit Notes</Label>
                      <Textarea
                        id="auditNotes"
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        placeholder="Enter notes for the audit"
                        rows={3}
                      />
                    </div>
                    <Button 
                      className="w-full flex items-center gap-2" 
                      onClick={handleAudit}
                      disabled={isAuditing}
                    >
                      {isAuditing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Auditing...
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-4 w-4" />
                          Audit Invoice
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {invoice.status === 'VERIFIED' && (
                  <div className="space-y-4">
                    <Button 
                      className="w-full flex items-center gap-2" 
                      onClick={handleApprove}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Approve Invoice
                        </>
                      )}
                    </Button>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rejectReason">Rejection Reason</Label>
                      <Textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection"
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center gap-2"
                      onClick={handleReject}
                      disabled={isRejecting || !rejectReason}
                    >
                      {isRejecting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Reject Invoice
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {invoice.status === 'APPROVED' && (
                  <div className="text-center text-muted-foreground">
                    <p>This invoice has been approved and is ready for payment.</p>
                  </div>
                )}
                
                {invoice.status === 'REJECTED' && (
                  <div className="text-center text-destructive">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>This invoice has been rejected.</p>
                    {invoice.notes && (
                      <p className="mt-2 text-sm">Reason: {invoice.notes}</p>
                    )}
                  </div>
                )}
                
                {invoice.status === 'PAID' && (
                  <div className="text-center text-green-600">
                    <Check className="h-8 w-8 mx-auto mb-2" />
                    <p>This invoice has been paid.</p>
                    {invoice.paymentInfo && (
                      <p className="mt-2 text-sm">
                        Paid on {format(new Date(invoice.paymentInfo.paymentDate), 'PP')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{invoice.currency} {invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes:</span>
                    <span>{invoice.currency} {invoice.taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{invoice.currency} {invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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