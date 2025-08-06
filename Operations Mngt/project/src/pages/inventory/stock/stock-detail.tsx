import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventory } from '@/hooks/useInventory';
import { ArrowLeft, Package, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const statusColors = {
  IN_STOCK: 'success',
  LOW_STOCK: 'default',
  OUT_OF_STOCK: 'destructive',
  DISCONTINUED: 'destructive',
} as const;

export function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useStockItem } = useInventory();
  const { data: item, isLoading } = useStockItem(id!);

  if (isLoading || !item) {
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
              onClick={() => navigate('/inventory/stock')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Item Code: {item.itemCode}
                </p>
              </div>
            </div>
          </div>
          <Badge variant={statusColors[item.status]} className="h-6 px-3 text-sm">
            {item.status.replace('_', ' ')}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="supplier">Supplier</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="mt-1">{item.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Unit</h3>
                  <p className="mt-1">{item.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Quantity</h3>
                  <p className="mt-1 font-medium">{item.currentQuantity} {item.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Minimum Quantity</h3>
                  <p className="mt-1">{item.minQuantity} {item.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Maximum Quantity</h3>
                  <p className="mt-1">{item.maxQuantity} {item.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reorder Point</h3>
                  <p className="mt-1">{item.reorderPoint} {item.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Unit Cost</h3>
                  <p className="mt-1 font-medium">
                    {item.cost.currency} {item.cost.unitCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Purchase Date</h3>
                  <p className="mt-1">{format(new Date(item.cost.lastPurchaseDate), 'PP')}</p>
                </div>
              </div>
              {item.description && (
                <div className="border-t p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{item.description}</p>
                </div>
              )}
            </div>

            {item.currentQuantity <= item.reorderPoint && (
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <p>Stock level is below reorder point. Consider creating a purchase requisition.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Warehouse</h3>
                    <p className="mt-1">{item.location.warehouse}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Zone</h3>
                    <p className="mt-1">{item.location.zone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Bin</h3>
                    <p className="mt-1">{item.location.bin}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate('/inventory/movements/new')} className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Create Movement
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="supplier" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier Name</h3>
                    <p className="mt-1">{item.supplier.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Lead Time</h3>
                    <p className="mt-1">{item.supplier.leadTime} days</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {item.quality.batchNumber && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Batch Number</h3>
                      <p className="mt-1">{item.quality.batchNumber}</p>
                    </div>
                  )}
                  {item.quality.expiryDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                      <p className="mt-1">{format(new Date(item.quality.expiryDate), 'PP')}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Inspection Required</h3>
                    <p className="mt-1">{item.quality.inspectionRequired ? 'Yes' : 'No'}</p>
                  </div>
                  {item.quality.inspectionStatus && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Inspection Status</h3>
                      <Badge
                        variant={
                          item.quality.inspectionStatus === 'PASSED'
                            ? 'success'
                            : item.quality.inspectionStatus === 'FAILED'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {item.quality.inspectionStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}