import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventory } from '@/hooks/useInventory';
import { ArrowLeft, Scale, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const statusColors = {
  PENDING: 'default',
  APPROVED: 'success',
  REJECTED: 'destructive',
  COMPLETED: 'success',
} as const;

export function AdjustmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useStockAdjustment } = useInventory();
  const { data: adjustment, isLoading } = useStockAdjustment(id!);

  if (isLoading || !adjustment) {
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
              onClick={() => navigate('/inventory/adjustments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment</h1>
                <p className="text-sm text-muted-foreground">
                  Adjustment #{adjustment.adjustmentNumber}
                </p>
              </div>
            </div>
          </div>
          <Badge variant={statusColors[adjustment.status]} className="h-6 px-3 text-sm">
            {adjustment.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="mt-1">
                    <Badge variant={adjustment.type === 'INCREASE' ? 'success' : 'destructive'}>
                      {adjustment.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                  <div className="mt-1">
                    <p>{adjustment.item.name}</p>
                    <p className="text-sm text-muted-foreground">{adjustment.item.itemCode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                  <p className="mt-1 font-medium">{adjustment.quantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="mt-1">{adjustment.createdBy.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{format(new Date(adjustment.createdAt), 'PPp')}</p>
                </div>
                {adjustment.approver && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Approved By</h3>
                      <p className="mt-1">{adjustment.approver.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Approved At</h3>
                      <p className="mt-1">{format(new Date(adjustment.approvedAt!), 'PPp')}</p>
                    </div>
                  </>
                )}
              </div>
              {(adjustment.reason || adjustment.notes) && (
                <div className="border-t p-6">
                  {adjustment.reason && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                      <p className="mt-1">{adjustment.reason}</p>
                    </div>
                  )}
                  {adjustment.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p className="mt-1">{adjustment.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Attachments</h3>
                {adjustment.attachments && adjustment.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {adjustment.attachments.map((attachment, index) => (
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
        </Tabs>
      </div>
    </div>
  );
}