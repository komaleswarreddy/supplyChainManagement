import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isAfter } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { ArrowLeft, FileCheck, ExternalLink, Clock, AlertTriangle, CheckCircle, XCircle, Send } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  VALID: 'success',
  EXPIRED: 'destructive',
  PENDING_VERIFICATION: 'warning',
  REJECTED: 'destructive',
  REVOKED: 'destructive',
};

export function TaxDocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const [rejectionReason, setRejectionReason] = React.useState('');
  
  const { 
    useTaxDocument, 
    useValidateTaxDocument, 
    useSendDocumentReminder 
  } = useTaxCompliance();
  
  const { data: document, isLoading } = useTaxDocument(id!);
  const { mutate: validateDocument, isLoading: isValidating } = useValidateTaxDocument();
  const { mutate: sendReminder, isLoading: isSendingReminder } = useSendDocumentReminder();

  const handleValidate = () => {
    validateDocument({ id: id!, isValid: true });
  };

  const handleReject = () => {
    confirm(() => {
      validateDocument({ 
        id: id!, 
        isValid: false, 
        rejectionReason: rejectionReason || 'Document does not meet requirements' 
      });
      setRejectionReason('');
    });
  };

  const handleSendReminder = () => {
    sendReminder(id!);
  };

  if (isLoading || !document) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isExpired = document.expirationDate && isAfter(new Date(), new Date(document.expirationDate));
  const isExpiringSoon = document.expirationDate && !isExpired && isAfter(
    new Date(document.expirationDate),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/tax-compliance/tax-documents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <FileCheck className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{document.documentType.replace('_', ' ')}</h1>
                <p className="text-sm text-muted-foreground">
                  {document.documentNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[document.status]} className="h-6 px-3 text-sm">
              {document.status.replace('_', ' ')}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => window.open(document.documentUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Document
            </Button>
          </div>
        </div>

        {(isExpired || isExpiringSoon) && (
          <div className={`rounded-lg border p-4 ${
            isExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                isExpired ? 'text-red-500' : 'text-amber-500'
              }`} />
              <div>
                <h3 className={`font-medium ${
                  isExpired ? 'text-red-800' : 'text-amber-800'
                }`}>
                  {isExpired ? 'Document Expired' : 'Document Expiring Soon'}
                </h3>
                <p className={`text-sm ${
                  isExpired ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {isExpired 
                    ? `This document expired on ${format(new Date(document.expirationDate!), 'PP')}.` 
                    : `This document will expire on ${format(new Date(document.expirationDate!), 'PP')}.`
                  }
                  {document.status !== 'EXPIRED' && isExpired && ' The status should be updated.'}
                </p>
                {isExpired && document.status !== 'EXPIRED' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate(`/tax-compliance/tax-documents/${id}/renew`)}
                  >
                    Request Renewal
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            {document.followUpActions && <TabsTrigger value="follow-up">Follow-up Actions</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Information</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                    <p className="mt-1 font-medium">{document.documentType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Number</h3>
                    <p className="mt-1">{document.documentNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="mt-1">
                      <Badge variant={statusColors[document.status]}>
                        {document.status.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                    <p className="mt-1">{document.supplierName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Issued By</h3>
                    <p className="mt-1">{document.issuedBy}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Issued Date</h3>
                    <p className="mt-1">{format(new Date(document.issuedDate), 'PP')}</p>
                  </div>
                  {document.expirationDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expiration Date</h3>
                      <p className={`mt-1 ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                        {format(new Date(document.expirationDate), 'PP')}
                        {isExpired && ' (Expired)'}
                        {isExpiringSoon && ' (Expiring Soon)'}
                      </p>
                    </div>
                  )}
                  {document.validatedBy && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Validated By</h3>
                      <p className="mt-1">{document.validatedBy.name}</p>
                    </div>
                  )}
                  {document.validatedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Validated At</h3>
                      <p className="mt-1">{format(new Date(document.validatedAt), 'PPp')}</p>
                    </div>
                  )}
                  {document.lastReminderSent && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Reminder Sent</h3>
                      <p className="mt-1">{format(new Date(document.lastReminderSent), 'PPp')}</p>
                    </div>
                  )}
                </div>
                
                {document.notes && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-1">{document.notes}</p>
                  </div>
                )}
                
                {document.rejectionReason && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground">Rejection Reason</h3>
                    <p className="mt-1 text-red-600">{document.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Actions</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(document.documentUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Document
                  </Button>
                  
                  {document.status === 'PENDING_VERIFICATION' && (
                    <>
                      <Button 
                        onClick={handleValidate}
                        disabled={isValidating}
                        className="flex items-center gap-2"
                      >
                        {isValidating ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Validate Document
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isValidating}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Document
                      </Button>
                    </>
                  )}
                  
                  {(document.status === 'EXPIRED' || isExpired) && (
                    <Button 
                      onClick={handleSendReminder}
                      disabled={isSendingReminder}
                      className="flex items-center gap-2"
                    >
                      {isSendingReminder ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Renewal Reminder
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Validation Status</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    {document.status === 'VALID' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : document.status === 'PENDING_VERIFICATION' ? (
                      <Clock className="h-6 w-6 text-amber-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {document.status === 'VALID' 
                          ? 'Document is valid' 
                          : document.status === 'PENDING_VERIFICATION'
                          ? 'Document is pending verification'
                          : 'Document is not valid'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {document.status === 'VALID' 
                          ? `Validated on ${format(new Date(document.validatedAt!), 'PP')} by ${document.validatedBy?.name}`
                          : document.status === 'PENDING_VERIFICATION'
                          ? 'This document needs to be reviewed and validated'
                          : document.rejectionReason || 'Document was rejected or has expired'}
                      </p>
                    </div>
                  </div>
                  
                  {document.status === 'PENDING_VERIFICATION' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Validation Checklist</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="check1" className="rounded" />
                            <label htmlFor="check1" className="text-sm">Document is legible and complete</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="check2" className="rounded" />
                            <label htmlFor="check2" className="text-sm">Document is signed by authorized person</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="check3" className="rounded" />
                            <label htmlFor="check3" className="text-sm">Document has not expired</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="check4" className="rounded" />
                            <label htmlFor="check4" className="text-sm">Document contains all required information</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="check5" className="rounded" />
                            <label htmlFor="check5" className="text-sm">Document is issued by appropriate authority</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Rejection Reason (if applicable)</h3>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleValidate}
                          disabled={isValidating}
                          className="flex items-center gap-2"
                        >
                          {isValidating ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Validate Document
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isValidating}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Document
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Validation Guidelines</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Exemption Certificate Requirements</h3>
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      <li>Must be issued by the appropriate tax authority</li>
                      <li>Must be current and not expired</li>
                      <li>Must clearly state the exempt items or services</li>
                      <li>Must include the supplier's tax identification number</li>
                      <li>Must be signed by an authorized representative</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">W-9 Requirements</h3>
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      <li>Must use the current IRS form version</li>
                      <li>Must include the supplier's legal name and tax identification number</li>
                      <li>Must be signed and dated</li>
                      <li>Must include the appropriate business type classification</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">VAT Registration Requirements</h3>
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      <li>Must include the VAT registration number</li>
                      <li>Must be issued by the appropriate tax authority</li>
                      <li>Must be current and valid</li>
                      <li>Must include the supplier's legal name and address</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {document.followUpActions && (
            <TabsContent value="follow-up" className="space-y-4">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Follow-up Actions</h2>
                  <div className="space-y-4">
                    {document.followUpActions.map((action, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{action.action}</h3>
                          <Badge variant={
                            action.status === 'COMPLETED' ? 'success' :
                            action.status === 'OVERDUE' ? 'destructive' :
                            'warning'
                          }>
                            {action.status}
                          </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <p className="font-medium">{format(new Date(action.dueDate), 'PP')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Assigned To</p>
                            <p>{action.assignedTo.name}</p>
                          </div>
                          {action.completedAt && (
                            <div>
                              <p className="text-sm text-muted-foreground">Completed At</p>
                              <p>{format(new Date(action.completedAt), 'PPp')}</p>
                            </div>
                          )}
                          {action.notes && (
                            <div className="sm:col-span-2">
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p>{action.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        {action.status !== 'COMPLETED' && (
                          <div className="mt-4">
                            <Button 
                              onClick={handleSendReminder}
                              disabled={isSendingReminder}
                              className="flex items-center gap-2"
                            >
                              {isSendingReminder ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  Send Reminder
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Rejection"
        description="Are you sure you want to reject this document? This action cannot be undone."
        confirmText="Reject Document"
        onConfirm={onConfirm}
      />
    </div>
  );
}