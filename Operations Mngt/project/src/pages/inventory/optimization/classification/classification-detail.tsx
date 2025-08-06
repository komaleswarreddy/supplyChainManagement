import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import { ArrowLeft, Edit, Layers, RefreshCw } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const abcClassColors = {
  A: 'success',
  B: 'warning',
  C: 'default',
} as const;

const xyzClassColors = {
  X: 'success',
  Y: 'warning',
  Z: 'destructive',
} as const;

export function ClassificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useClassification, useUpdateClassification } = useInventoryOptimization();
  const { data: classification, isLoading } = useClassification(id!);
  const { mutate: updateClassification, isLoading: isUpdating } = useUpdateClassification();

  if (isLoading || !classification) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleRecalculate = () => {
    confirm(() => {
      updateClassification({
        id: classification.id,
        data: {
          // Trigger recalculation by updating a parameter
          manualOverride: false,
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
              onClick={() => navigate('/inventory/optimization/classification')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">ABC/XYZ Classification</h1>
                <p className="text-sm text-muted-foreground">
                  {classification.item.name} ({classification.item.itemCode})
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant={abcClassColors[classification.abcClass]} className="h-6 px-3 text-sm">
              Class {classification.abcClass}
            </Badge>
            <Badge variant={xyzClassColors[classification.xyzClass]} className="h-6 px-3 text-sm">
              Class {classification.xyzClass}
            </Badge>
            <Badge className="h-6 px-3 text-sm">
              {classification.combinedClass}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                <p className="mt-1">{classification.item.name}</p>
                <p className="text-sm text-muted-foreground">{classification.item.itemCode}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="mt-1">{classification.location.name}</p>
                <p className="text-sm text-muted-foreground">{classification.location.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Annual Consumption Value</h3>
                <p className="mt-1">${classification.annualConsumptionValue.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Annual Consumption Quantity</h3>
                <p className="mt-1">{classification.annualConsumptionQuantity.toLocaleString()} units</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Consumption Variability (CV)</h3>
                <p className="mt-1">{classification.consumptionVariability.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Manual Override</h3>
                <p className="mt-1">{classification.manualOverride ? 'Yes' : 'No'}</p>
                {classification.manualOverride && classification.manualClass && (
                  <p className="text-sm text-muted-foreground">Manual Class: {classification.manualClass}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Classification Details</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">ABC Classification</h4>
                  <div className="mt-2">
                    <Badge variant={abcClassColors[classification.abcClass]} className="text-lg px-4 py-2">
                      Class {classification.abcClass}
                    </Badge>
                    <p className="mt-2 text-sm">
                      {classification.abcClass === 'A' && 'High value items (80% of value)'}
                      {classification.abcClass === 'B' && 'Medium value items (15% of value)'}
                      {classification.abcClass === 'C' && 'Low value items (5% of value)'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">XYZ Classification</h4>
                  <div className="mt-2">
                    <Badge variant={xyzClassColors[classification.xyzClass]} className="text-lg px-4 py-2">
                      Class {classification.xyzClass}
                    </Badge>
                    <p className="mt-2 text-sm">
                      {classification.xyzClass === 'X' && 'Stable demand (CV < 0.5)'}
                      {classification.xyzClass === 'Y' && 'Variable demand (0.5 ≤ CV < 1.0)'}
                      {classification.xyzClass === 'Z' && 'Highly variable demand (CV ≥ 1.0)'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Combined Classification</h4>
                  <div className="mt-2">
                    <Badge className="text-lg px-4 py-2">
                      Class {classification.combinedClass}
                    </Badge>
                    <p className="mt-2 text-sm">
                      {classification.combinedClass.includes('A') && 'High value, '}
                      {classification.combinedClass.includes('B') && 'Medium value, '}
                      {classification.combinedClass.includes('C') && 'Low value, '}
                      {classification.combinedClass.includes('X') && 'stable demand'}
                      {classification.combinedClass.includes('Y') && 'variable demand'}
                      {classification.combinedClass.includes('Z') && 'highly variable demand'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Classification Thresholds</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">ABC Thresholds</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Class A: Top {(classification.abcThresholds.aThreshold * 100).toFixed(0)}% of value</li>
                    <li>Class B: Next {((classification.abcThresholds.bThreshold - classification.abcThresholds.aThreshold) * 100).toFixed(0)}% of value</li>
                    <li>Class C: Remaining {((1 - classification.abcThresholds.bThreshold) * 100).toFixed(0)}% of value</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">XYZ Thresholds</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Class X: CV &le; {classification.xyzThresholds.xThreshold.toFixed(2)}</li>
                    <li>Class Y: {classification.xyzThresholds.xThreshold.toFixed(2)} &lt; CV &le; {classification.xyzThresholds.yThreshold.toFixed(2)}</li>
                    <li>Class Z: CV &gt; {classification.xyzThresholds.yThreshold.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Calculation Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Calculated</h4>
                  <p className="mt-1">{format(new Date(classification.lastCalculated), 'PPp')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Next Review</h4>
                  <p className="mt-1">{format(new Date(classification.nextReview), 'PP')}</p>
                </div>
              </div>
            </div>
          </div>
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
            onClick={() => navigate(`/inventory/optimization/classification/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Classification
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Recalculate Classification"
        description="This will recalculate the ABC/XYZ classification based on the current consumption data. Do you want to continue?"
        confirmText="Recalculate"
        onConfirm={onConfirm}
      />
    </div>
  );
}