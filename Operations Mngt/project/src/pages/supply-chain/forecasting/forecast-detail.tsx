import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useForecast, useSubmitForecast, useApproveForecast, useRejectForecast } from '@/hooks/useSupplyChain';
import { ArrowLeft, Edit, TrendingUp, Send, X, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  FINALIZED: 'primary',
} as const;

export function ForecastDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  
  const { data: forecast, isLoading } = useForecast(id!);
  const { mutate: submitForecast, isLoading: isSubmitting } = useSubmitForecast();
  const { mutate: approveForecast, isLoading: isApproving } = useApproveForecast();
  const { mutate: rejectForecast, isLoading: isRejecting } = useRejectForecast();

  if (isLoading || !forecast) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleEdit = () => {
    confirm(() => navigate(`/supply-chain/forecasting/${forecast.id}/edit`));
  };

  const handleSubmit = () => {
    submitForecast(forecast.id);
  };

  const handleApprove = () => {
    approveForecast(forecast.id);
  };

  const handleReject = () => {
    confirm(() => {
      rejectForecast({ id: forecast.id, reason: 'Rejected by approver' });
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
              onClick={() => navigate('/supply-chain/forecasting')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{forecast.itemName}</h1>
                <p className="text-sm text-muted-foreground">
                  {forecast.itemCode} - {forecast.locationName}
                </p>
              </div>
            </div>
          </div>
          <Badge variant={statusColors[forecast.status]} className="h-6 px-3 text-sm">
            {forecast.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="consensus">Consensus</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Period</h3>
                  <p className="mt-1">{forecast.period}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Algorithm</h3>
                  <p className="mt-1">{forecast.algorithm.replace('_', ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                  <p className="mt-1">{format(new Date(forecast.startDate), 'PP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                  <p className="mt-1">{format(new Date(forecast.endDate), 'PP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">MAPE</h3>
                  <p className="mt-1">{forecast.mape.toFixed(2)}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="mt-1">{forecast.createdBy.name}</p>
                </div>
              </div>

              <div className="border-t p-6">
                <h3 className="mb-4 font-semibold">Forecast Values</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Baseline</h4>
                    <p className="mt-1 font-medium">{forecast.baselineQuantity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Adjusted</h4>
                    <p className="mt-1">{forecast.adjustedQuantity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Final</h4>
                    <p className="mt-1 font-medium">{forecast.finalQuantity}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Confidence Interval</h4>
                  <p className="mt-1">
                    {forecast.confidenceInterval.lower} - {forecast.confidenceInterval.upper}
                  </p>
                </div>
              </div>

              {forecast.metadata && (
                <div className="border-t p-6">
                  <h3 className="mb-4 font-semibold">Additional Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <p className="mt-1">{forecast.metadata.category || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Product Group</h4>
                      <p className="mt-1">{forecast.metadata.productGroup || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Sales Channel</h4>
                      <p className="mt-1">{forecast.metadata.salesChannel || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Region</h4>
                      <p className="mt-1">{forecast.metadata.region || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="historical" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Historical Data</h3>
                <div className="space-y-4">
                  {forecast.historicalData.map((data, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{format(new Date(data.date), 'PP')}</p>
                      </div>
                      <p className="font-medium">{data.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adjustments" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Adjustments</h3>
                {forecast.adjustments.length > 0 ? (
                  <div className="space-y-4">
                    {forecast.adjustments.map((adjustment) => (
                      <div
                        key={adjustment.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {adjustment.type === 'ABSOLUTE' ? 'Absolute' : 'Percentage'} Adjustment
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {adjustment.value} {adjustment.type === 'PERCENTAGE' && '%'}
                            </p>
                          </div>
                          <Badge>{adjustment.reasonCode}</Badge>
                        </div>
                        {adjustment.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {adjustment.description}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            From: {format(new Date(adjustment.startDate), 'PP')} to{' '}
                            {format(new Date(adjustment.endDate), 'PP')}
                          </p>
                          <p>By: {adjustment.createdBy.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No adjustments made yet.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Promotions</h3>
                {forecast.promotions.length > 0 ? (
                  <div className="space-y-4">
                    {forecast.promotions.map((promotion) => (
                      <div
                        key={promotion.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{promotion.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {promotion.type}
                            </p>
                          </div>
                          <Badge variant={
                            promotion.status === 'COMPLETED'
                              ? 'success'
                              : promotion.status === 'CANCELLED'
                              ? 'destructive'
                              : 'default'
                          }>
                            {promotion.status}
                          </Badge>
                        </div>
                        {promotion.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {promotion.description}
                          </p>
                        )}
                        <div className="mt-2 grid gap-2 text-sm">
                          <p>
                            Expected Lift: {promotion.expectedLift}%
                            {promotion.actualLift !== undefined && (
                              <span className="ml-2">
                                (Actual: {promotion.actualLift}%)
                              </span>
                            )}
                          </p>
                          <p>
                            Period: {format(new Date(promotion.startDate), 'PP')} to{' '}
                            {format(new Date(promotion.endDate), 'PP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No promotions planned.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consensus" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Consensus Inputs</h3>
                {forecast.consensusInputs.length > 0 ? (
                  <div className="space-y-4">
                    {forecast.consensusInputs.map((input, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{input.department}</p>
                            <p className="text-sm text-muted-foreground">
                              By {input.submittedBy.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{input.quantity}</p>
                            <p className="text-sm text-muted-foreground">
                              Weight: {input.weight}%
                            </p>
                          </div>
                        </div>
                        {input.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {input.notes}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                          Submitted on: {format(new Date(input.submittedAt), 'PPp')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No consensus inputs yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          {forecast.status === 'DRAFT' && (
            <>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Approval
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          )}
          {forecast.status === 'PENDING_APPROVAL' && (
            <>
              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </>
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
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
            </>
          )}
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