import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProcurement } from '@/hooks/useProcurement';
import { ArrowLeft, Edit, FileText, MessageSquare, Paperclip, Send } from 'lucide-react';
import { DATE_FORMAT } from '@/config/constants';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

const statusColors = {
  DRAFT: 'default',
  PENDING: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'default',
} as const;

export function RequisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const {
    useRequisition,
    useAddComment,
    useSubmitRequisition,
    useApproveRequisition,
    useRejectRequisition,
    useCancelRequisition,
  } = useProcurement();

  const { data: requisition, isLoading } = useRequisition(id!);
  const { mutate: addComment, isLoading: isAddingComment } = useAddComment();
  const { mutate: submitRequisition, isLoading: isSubmitting } = useSubmitRequisition();
  const { mutate: approveRequisition, isLoading: isApproving } = useApproveRequisition();
  const { mutate: rejectRequisition, isLoading: isRejecting } = useRejectRequisition();
  const { mutate: cancelRequisition, isLoading: isCancelling } = useCancelRequisition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  if (isLoading || !requisition) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const onSubmitComment = (data: CommentFormValues) => {
    addComment(
      { id: requisition.id, comment: data.comment },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const handleSubmitRequisition = () => {
    submitRequisition(requisition.id);
  };

  const handleApproveRequisition = () => {
    approveRequisition({ id: requisition.id });
  };

  const handleRejectRequisition = () => {
    rejectRequisition({ id: requisition.id, comment: 'Rejected by approver' });
  };

  const handleCancelRequisition = () => {
    cancelRequisition({ id: requisition.id, reason: 'Cancelled by requestor' });
  };

  const handleEdit = () => {
    confirm(() => navigate(`/procurement/requisitions/${requisition.id}/edit`));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/procurement/requisitions')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{requisition.title}</h1>
              <p className="text-sm text-muted-foreground">
                Requisition #{requisition.requisitionNumber}
              </p>
            </div>
          </div>
          <Badge variant={statusColors[requisition.status]} className="h-6 px-3 text-sm">
            {requisition.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p className="mt-1">{requisition.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cost Center</h3>
                  <p className="mt-1">{requisition.costCenter}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <p className="mt-1">{requisition.priority}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                  <p className="mt-1 font-medium">
                    {requisition.currency} {requisition.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Project Code</h3>
                  <p className="mt-1">{requisition.projectCode || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Budget Code</h3>
                  <p className="mt-1">{requisition.budgetCode || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Required By</h3>
                  <p className="mt-1">{format(new Date(requisition.requiredByDate), DATE_FORMAT)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Terms</h3>
                  <p className="mt-1">{requisition.paymentTerms || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contract Reference</h3>
                  <p className="mt-1">{requisition.contractReference || '-'}</p>
                </div>
              </div>
              {(requisition.description || requisition.justification) && (
                <div className="border-t p-6">
                  {requisition.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="mt-1">{requisition.description}</p>
                    </div>
                  )}
                  {requisition.justification && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Justification</h3>
                      <p className="mt-1">{requisition.justification}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Delivery Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Location Name</h4>
                    <p className="mt-1">{requisition.deliveryLocation.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Person</h4>
                    <p className="mt-1">{requisition.deliveryLocation.contactPerson}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Number</h4>
                    <p className="mt-1">{requisition.deliveryLocation.contactNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                    <p className="mt-1">
                      {requisition.deliveryLocation.address}, {requisition.deliveryLocation.city}
                      {requisition.deliveryLocation.state && `, ${requisition.deliveryLocation.state}`}
                      , {requisition.deliveryLocation.country} {requisition.deliveryLocation.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            {requisition.items.map((item, index) => (
              <div key={item.id} className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  <p className="text-sm text-muted-foreground">Code: {item.itemCode}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="mt-1">{item.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                    <p className="mt-1">
                      {item.quantity} {item.unitOfMeasure}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Unit Price</h4>
                    <p className="mt-1">
                      {item.currency} {item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total</h4>
                    <p className="mt-1 font-medium">
                      {item.currency} {(item.quantity * item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                    <p className="mt-1">{item.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Manufacturer</h4>
                    <p className="mt-1">{item.manufacturer || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Part Number</h4>
                    <p className="mt-1">{item.partNumber || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Delivery Date</h4>
                    <p className="mt-1">
                      {format(new Date(item.requestedDeliveryDate), DATE_FORMAT)}
                    </p>
                  </div>
                </div>
                {(item.specifications || item.technicalSpecifications || item.qualityRequirements) && (
                  <div className="mt-4 grid gap-4">
                    {item.specifications && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Specifications</h4>
                        <p className="mt-1">{item.specifications}</p>
                      </div>
                    )}
                    {item.technicalSpecifications && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Technical Specifications
                        </h4>
                        <p className="mt-1">{item.technicalSpecifications}</p>
                      </div>
                    )}
                    {item.qualityRequirements && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Quality Requirements
                        </h4>
                        <p className="mt-1">{item.qualityRequirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Approval Workflow</h3>
                <div className="space-y-4">
                  {requisition.approvalWorkflow.levels.map((level) => (
                    <div
                      key={level.level}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">Level {level.level}</p>
                        <p className="text-sm text-muted-foreground">
                          {level.approver.name} - {level.approver.position}
                        </p>
                      </div>
                      <Badge
                        variant={
                          level.status === 'APPROVED'
                            ? 'success'
                            : level.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {level.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Attachments</h3>
                {requisition.attachments && requisition.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {requisition.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No attachments</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Comments</h3>
                <div className="space-y-4">
                  {requisition.comments?.map((comment) => (
                    <div key={comment.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="font-medium">{comment.createdBy.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {' '}
                            - {comment.createdBy.position}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comment.createdAt), DATE_FORMAT)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit(onSubmitComment)} className="mt-4 space-y-2">
                  <Label htmlFor="comment">Add Comment</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="comment"
                      {...register('comment')}
                      error={errors.comment?.message}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isAddingComment}
                      className="h-auto"
                    >
                      {isAddingComment ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Status History</h3>
                <div className="space-y-4">
                  {requisition.audit.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{history.status}</p>
                        <p className="text-sm text-muted-foreground">
                          By {history.user.name}
                          {history.comment && ` - ${history.comment}`}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(history.timestamp), DATE_FORMAT)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          {requisition.status === 'DRAFT' && (
            <>
              <Button onClick={handleSubmitRequisition} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Approval'
                )}
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          )}
          {requisition.status === 'PENDING' && (
            <>
              <Button onClick={handleApproveRequisition} disabled={isApproving}>
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
                onClick={handleRejectRequisition}
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
          {requisition.status === 'REJECTED' && (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {['DRAFT', 'PENDING'].includes(requisition.status) && (
            <Button
              variant="outline"
              onClick={handleCancelRequisition}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cancelling...
                </>
              ) : (
                'Cancel'
              )}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Edit Requisition"
        description="Are you sure you want to edit this requisition? Any unsaved changes will be lost."
        confirmText="Edit"
        onConfirm={onConfirm}
      />
    </div>
  );
}