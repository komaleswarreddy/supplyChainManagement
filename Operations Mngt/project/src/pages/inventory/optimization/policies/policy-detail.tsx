import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

const policyTypeColors = {
  MIN_MAX: 'default',
  REORDER_POINT: 'primary',
  PERIODIC_REVIEW: 'secondary',
  KANBAN: 'warning',
} as const;

export function InventoryPolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useInventoryPolicy } = useInventoryOptimization();
  const { data: policy, isLoading } = useInventoryPolicy(id!);

  if (isLoading || !policy) {
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
              onClick={() => navigate('/inventory/optimization/policies')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Inventory Policy</h1>
                <p className="text-sm text-muted-foreground">
                  {policy.item.name} ({policy.item.itemCode})
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant={policyTypeColors[policy.policyType]} className="h-6 px-3 text-sm">
              {policy.policyType.replace('_', ' ')}
            </Badge>
            <Badge className="h-6 px-3 text-sm">
              {policy.abcxyzClass}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                <p className="mt-1">{policy.item.name}</p>
                <p className="text-sm text-muted-foreground">{policy.item.itemCode}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="mt-1">{policy.location.name}</p>
                <p className="text-sm text-muted-foreground">{policy.location.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Policy Type</h3>
                <p className="mt-1">{policy.policyType.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ABC/XYZ Class</h3>
                <p className="mt-1">{policy.abcxyzClass}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Service Level</h3>
                <p className="mt-1">{(policy.serviceLevel * 100).toFixed(0)}%</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lead Time</h3>
                <p className="mt-1">{policy.leadTime} days</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Policy Parameters</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Min Quantity</h4>
                  <p className="mt-1 text-lg font-medium">{policy.minQuantity.toLocaleString()} units</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Max Quantity</h4>
                  <p className="mt-1 text-lg font-medium">{policy.maxQuantity.toLocaleString()} units</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Reorder Point</h4>
                  <p className="mt-1 text-lg font-medium">{policy.reorderPoint.toLocaleString()} units</p>
                </div>
                {policy.targetStockLevel && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Target Stock Level</h4>
                    <p className="mt-1">{policy.targetStockLevel.toLocaleString()} units</p>
                  </div>
                )}
                {policy.orderQuantity && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Order Quantity</h4>
                    <p className="mt-1">{policy.orderQuantity.toLocaleString()} units</p>
                  </div>
                )}
                {policy.orderFrequency && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Order Frequency</h4>
                    <p className="mt-1">{policy.orderFrequency} days</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Review Period</h4>
                  <p className="mt-1">{policy.reviewPeriod} days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Review Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Reviewed</h4>
                  <p className="mt-1">{format(new Date(policy.lastReviewed), 'PPp')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Next Review</h4>
                  <p className="mt-1">{format(new Date(policy.nextReview), 'PP')}</p>
                </div>
              </div>
            </div>
          </div>

          {policy.notes && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="mt-1">{policy.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/inventory/optimization/policies/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Policy
          </Button>
        </div>
      </div>
    </div>
  );
}