import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import { ArrowLeft, Edit, BarChart4, RefreshCw } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ReorderPointDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useReorderPoint, useUpdateReorderPoint } = useInventoryOptimization();
  const { data: reorderPoint, isLoading } = useReorderPoint(id!);
  const { mutate: updateReorderPoint, isLoading: isUpdating } = useUpdateReorderPoint();

  if (isLoading || !reorderPoint) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleRecalculate = () => {
    confirm(() => {
      updateReorderPoint({
        id: reorderPoint.id,
        data: {
          // Trigger recalculation by updating a parameter
          averageDailyDemand: reorderPoint.averageDailyDemand,
        },
      });
    });
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
              onClick={() => navigate('/inventory/optimization/reorder-points')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <BarChart4 className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Reorder Point</h1>
                <p className="text-sm text-muted-foreground">
                  {reorderPoint.item.name} ({reorderPoint.item.itemCode})
                </p>
              </div>
            </div>
          </div>
          <Badge variant={reorderPoint.manualOverride ? 'secondary' : 'outline'} className="h-6 px-3 text-sm">
            {reorderPoint.manualOverride ? 'Manual Override' : 'Auto-calculated'}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                <p className="mt-1">{reorderPoint.item.name}</p>
                <p className="text-sm text-muted-foreground">{reorderPoint.item.itemCode}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="mt-1">{reorderPoint.location.name}</p>
                <p className="text-sm text-muted-foreground">{reorderPoint.location.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Average Daily Demand</h3>
                <p className="mt-1">{reorderPoint.averageDailyDemand.toFixed(2)} units</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lead Time</h3>
                <p className="mt-1">{reorderPoint.leadTime} days</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Safety Stock</h3>
                <p className="mt-1">{reorderPoint.safetyStock.toLocaleString()} units</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Manual Override</h3>
                <p className="mt-1">{reorderPoint.manualOverride ? 'Yes' : 'No'}</p>
                {reorderPoint.manualOverride && reorderPoint.manualValue && (
                  <p className="text-sm text-muted-foreground">Manual Value: {reorderPoint.manualValue.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reorder Point</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Reorder Point</h4>
                  <p className="mt-1 text-2xl font-bold">{reorderPoint.reorderPoint.toLocaleString()} units</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Calculated</h4>
                  <p className="mt-1">{format(new Date(reorderPoint.lastCalculated), 'PPp')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Next Review</h4>
                  <p className="mt-1">{format(new Date(reorderPoint.nextReview), 'PP')}</p>
                </div>
              </div>
            </div>
          </div>

          {reorderPoint.notes && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="mt-1">{reorderPoint.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleRecalculate} 
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Recalculate
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/inventory/optimization/reorder-points/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Parameters
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Recalculate Reorder Point"
        description="This will recalculate the reorder point based on the current parameters. Do you want to continue?"
        confirmText="Recalculate"
        onConfirm={onConfirm}
      />
    </div>
  );
}