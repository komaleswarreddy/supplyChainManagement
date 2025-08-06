import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventory } from '@/hooks/useInventory';
import { ArrowLeft, ArrowRightLeft, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const statusColors = {
  PENDING: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

export function MovementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useStockMovement } = useInventory();
  const { data: movement, isLoading } = useStockMovement(id!);

  if (isLoading || !movement) {
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
              onClick={() => navigate('/inventory/movements')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Stock Movement</h1>
                <p className="text-sm text-muted-foreground">
                  Reference #{movement.referenceNumber}
                </p>
              </div>
            </div>
          </div>
          <Badge variant={statusColors[movement.status]} className="h-6 px-3 text-sm">
            {movement.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="mt-1">
                    <Badge variant="secondary">{movement.type.replace('_', ' ')}</Badge>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                  <div className="mt-1">
                    <p>{movement.item.name}</p>
                    <p className="text-sm text-muted-foreground">{movement.item.itemCode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                  <p className="mt-1 font-medium">{movement.quantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="mt-1">{movement.createdBy.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{format(new Date(movement.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processed By</h3>
                  <p className="mt-1">{movement.processedBy.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processed At</h3>
                  <p className="mt-1">{format(new Date(movement.processedAt), 'PPp')}</p>
                </div>
              </div>
              {(movement.reason || movement.notes) && (
                <div className="border-t p-6">
                  {movement.reason && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                      <p className="mt-1">{movement.reason}</p>
                    </div>
                  )}
                  {movement.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p className="mt-1">{movement.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {movement.fromLocation && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 font-semibold">From Location</h3>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Warehouse</h4>
                      <p className="mt-1">{movement.fromLocation.warehouse}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Zone</h4>
                      <p className="mt-1">{movement.fromLocation.zone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Bin</h4>
                      <p className="mt-1">{movement.fromLocation.bin}</p>
                    </div>
                  </div>
                </div>
              )}

              {movement.toLocation && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 font-semibold">To Location</h3>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Warehouse</h4>
                      <p className="mt-1">{movement.toLocation.warehouse}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Zone</h4>
                      <p className="mt-1">{movement.toLocation.zone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Bin</h4>
                      <p className="mt-1">{movement.toLocation.bin}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Attachments</h3>
                {movement.attachments && movement.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {movement.attachments.map((attachment, index) => (
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