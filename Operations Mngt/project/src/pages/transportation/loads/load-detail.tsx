import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { ArrowLeft, Package, Calendar, Truck, Box, Maximize, ArrowRight, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  PLANNING: 'default',
  PLANNED: 'secondary',
  READY: 'warning',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
} as const;

export function LoadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useLoad, useUpdateLoad } = useTransportation();
  const { data: load, isLoading } = useLoad(id!);
  const { mutate: updateLoad, isLoading: isUpdating } = useUpdateLoad();

  const handleStatusChange = (newStatus: 'PLANNING' | 'PLANNED' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    confirm(() => {
      updateLoad({
        id: id!,
        data: { status: newStatus }
      });
    });
  };

  if (isLoading || !load) {
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
              onClick={() => navigate('/transportation/loads')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Load {load.loadNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {load.shipments.length} shipment{load.shipments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[load.status]} className="h-6 px-3 text-sm">
              {load.status}
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/transportation/loads/${id}/edit`)}>
              Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="visualization">Load Visualization</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Load Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Load #</h3>
                        <p className="mt-1 font-medium">{load.loadNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="mt-1">
                          <Badge variant={statusColors[load.status]}>
                            {load.status}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Carrier</h3>
                        <p className="mt-1">{load.carrier?.name || 'Not Assigned'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Scheduled Date</h3>
                        <p className="mt-1">{format(new Date(load.scheduledDate), 'PP')}</p>
                      </div>
                      {load.completedDate && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Completed Date</h3>
                          <p className="mt-1">{format(new Date(load.completedDate), 'PP')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p className="mt-1">{load.notes || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Equipment</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                        <p className="mt-1 font-medium">{load.equipment.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Dimensions</h3>
                        <p className="mt-1">
                          {load.equipment.length}' x {load.equipment.width}' x {load.equipment.height}'
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Max Weight</h3>
                        <p className="mt-1">{load.equipment.maxWeight.toLocaleString()} {load.equipment.weightUnit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Load Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Weight</h3>
                    <p className="mt-1 font-medium">
                      {load.loadPlan.totalWeight.toLocaleString()} {load.loadPlan.weightUnit}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
                    <p className="mt-1 font-medium">
                      {load.loadPlan.totalVolume.toLocaleString()} {load.loadPlan.volumeUnit}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Utilization</h3>
                    <div className="mt-1">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${load.loadPlan.utilizationPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm mt-1">{load.loadPlan.utilizationPercentage}%</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
                    <p className="mt-1 font-medium">{load.loadPlan.items.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Status Management</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={load.status === 'PLANNING' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('PLANNING')}
                    disabled={load.status === 'PLANNING' || isUpdating}
                  >
                    Planning
                  </Button>
                  <Button 
                    variant={load.status === 'PLANNED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('PLANNED')}
                    disabled={load.status === 'PLANNED' || isUpdating}
                  >
                    Planned
                  </Button>
                  <Button 
                    variant={load.status === 'READY' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('READY')}
                    disabled={load.status === 'READY' || isUpdating}
                  >
                    Ready
                  </Button>
                  <Button 
                    variant={load.status === 'SHIPPED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('SHIPPED')}
                    disabled={load.status === 'SHIPPED' || isUpdating}
                  >
                    Shipped
                  </Button>
                  <Button 
                    variant={load.status === 'DELIVERED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('DELIVERED')}
                    disabled={load.status === 'DELIVERED' || isUpdating}
                  >
                    Delivered
                  </Button>
                  <Button 
                    variant={load.status === 'CANCELLED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={load.status === 'CANCELLED' || isUpdating}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Load Visualization</h2>
                  {load.loadPlan.visualizationUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(load.loadPlan.visualizationUrl, '_blank')}>
                      <Maximize className="h-4 w-4 mr-2" />
                      Full Screen
                    </Button>
                  )}
                </div>
                
                <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-lg p-4 relative">
                    {/* This would be a 3D visualization in a real app */}
                    <div className="absolute top-2 left-2 text-xs text-muted-foreground">
                      Front
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      Rear
                    </div>
                    
                    {/* Simple 2D representation of items */}
                    <div className="w-full h-full flex flex-wrap gap-2 overflow-auto">
                      {load.loadPlan.items.map((item, index) => (
                        <div 
                          key={index}
                          className="bg-primary/20 border border-primary rounded p-2 text-xs"
                          style={{
                            width: `${Math.min(100, (item.dimensions.width / load.equipment.width) * 100)}%`,
                            height: `${Math.min(100, (item.dimensions.height / load.equipment.height) * 100)}%`,
                          }}
                        >
                          <div className="font-medium truncate">{item.description}</div>
                          <div>{item.quantity}x</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Weight Utilization</h3>
                    <div className="mt-1">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, (load.loadPlan.totalWeight / load.equipment.maxWeight) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm mt-1">
                        {Math.round((load.loadPlan.totalWeight / load.equipment.maxWeight) * 100)}%
                        <span className="text-xs text-muted-foreground ml-1">
                          ({load.loadPlan.totalWeight.toLocaleString()} / {load.equipment.maxWeight.toLocaleString()} {load.loadPlan.weightUnit})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Volume Utilization</h3>
                    <div className="mt-1">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${load.loadPlan.utilizationPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm mt-1">
                        {load.loadPlan.utilizationPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Load Items</h2>
                <div className="space-y-4">
                  {load.loadPlan.items.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{item.description}</h3>
                        <Badge variant="outline">{item.itemCode}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>{' '}
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>{' '}
                          <span className="font-medium">{item.weight} {item.weightUnit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dimensions:</span>{' '}
                          <span className="font-medium">
                            {item.dimensions.length}x{item.dimensions.width}x{item.dimensions.height} {item.dimensions.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Position:</span>{' '}
                          <span className="font-medium">
                            ({item.position.x}, {item.position.y}, {item.position.z})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stackable:</span>{' '}
                          <span>{item.stackable ? 'Yes' : 'No'}</span>
                        </div>
                        {item.stackingLimit && (
                          <div>
                            <span className="text-muted-foreground">Stacking Limit:</span>{' '}
                            <span>{item.stackingLimit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Status Change"
        description="Are you sure you want to change the load status? This may affect related shipments and operations."
        confirmText="Change Status"
        onConfirm={onConfirm}
      />
    </div>
  );
}