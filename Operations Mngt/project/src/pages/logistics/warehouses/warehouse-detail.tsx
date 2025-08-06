import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLogistics } from '@/hooks/useLogistics';
import { ArrowLeft, Edit, Warehouse as WarehouseIcon, Plus, MapPin, Phone, Mail, Clock, ClipboardList, Map, Package, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  MAINTENANCE: 'warning',
} as const;

const zoneTypeColors = {
  RECEIVING: 'primary',
  STORAGE: 'secondary',
  PICKING: 'success',
  PACKING: 'warning',
  SHIPPING: 'info',
  RETURNS: 'destructive',
  QUARANTINE: 'destructive',
  BULK: 'default',
  HAZARDOUS: 'destructive',
  REFRIGERATED: 'info',
  FROZEN: 'info',
} as const;

export function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useWarehouse, useWarehouseTasks, useUpdateWarehouse } = useLogistics();
  const { data: warehouse, isLoading } = useWarehouse(id!);
  const { data: tasksData, isLoading: isTasksLoading } = useWarehouseTasks({
    page: 1,
    pageSize: 5,
    warehouse: id,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const { mutate: updateWarehouse, isLoading: isUpdating } = useUpdateWarehouse();

  const handleStatusChange = (newStatus: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') => {
    confirm(() => {
      updateWarehouse({
        id: id!,
        data: { status: newStatus }
      });
    });
  };

  if (isLoading || !warehouse) {
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
              onClick={() => navigate('/logistics/warehouses')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <WarehouseIcon className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{warehouse.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Code: {warehouse.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[warehouse.status]} className="h-6 px-3 text-sm">
              {warehouse.status}
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/logistics/warehouses/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p>{warehouse.address.street}</p>
                      <p>{warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}</p>
                      <p>{warehouse.address.country}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Manager</h3>
                  <p className="mt-1 font-medium">{warehouse.manager.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{warehouse.manager.email}</p>
                  </div>
                  {warehouse.manager.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{warehouse.manager.phone}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                  <p className="mt-1 font-medium">{warehouse.totalArea.toLocaleString()} {warehouse.areaUnit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Zones</h3>
                  <p className="mt-1 font-medium">{warehouse.zones.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="mt-1">{format(new Date(warehouse.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">{format(new Date(warehouse.updatedAt), 'PPp')}</p>
                </div>
              </div>

              <div className="border-t p-6">
                <h3 className="mb-4 font-semibold">Operating Hours</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(warehouse.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium capitalize">{day}: </span>
                        <span>{hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t p-6">
                <h3 className="mb-4 font-semibold">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {warehouse.features.map((feature) => (
                    <Badge key={feature} variant="outline">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t p-6">
                <h3 className="mb-4 font-semibold">Status Management</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={warehouse.status === 'ACTIVE' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={warehouse.status === 'ACTIVE' || isUpdating}
                  >
                    Set Active
                  </Button>
                  <Button 
                    variant={warehouse.status === 'INACTIVE' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('INACTIVE')}
                    disabled={warehouse.status === 'INACTIVE' || isUpdating}
                  >
                    Set Inactive
                  </Button>
                  <Button 
                    variant={warehouse.status === 'MAINTENANCE' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('MAINTENANCE')}
                    disabled={warehouse.status === 'MAINTENANCE' || isUpdating}
                  >
                    Set Maintenance
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Warehouse Zones</h2>
              <Button onClick={() => navigate(`/logistics/warehouses/${id}/zones/new`)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </div>
            
            {warehouse.zones.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouse.zones.map((zone) => (
                  <div 
                    key={zone.id} 
                    className="rounded-lg border bg-card p-6 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => navigate(`/logistics/warehouses/${id}/zones/${zone.id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={zoneTypeColors[zone.type] || 'default'} className="capitalize">
                          {zone.type.toLowerCase().replace('_', ' ')}
                        </Badge>
                        <Badge variant={zone.status === 'ACTIVE' ? 'success' : 'default'}>
                          {zone.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span>{zone.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Area:</span>
                        <span>{zone.area.toLocaleString()} {zone.areaUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aisles:</span>
                        <span>{zone.aisles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Bins:</span>
                        <span>
                          {zone.aisles.reduce(
                            (total, aisle) => 
                              total + aisle.racks.reduce(
                                (rackTotal, rack) => rackTotal + rack.bins.length, 
                                0
                              ), 
                            0
                          )}
                        </span>
                      </div>
                    </div>
                    {zone.restrictions.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm text-muted-foreground">Restrictions:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {zone.restrictions.map((restriction) => (
                            <Badge key={restriction} variant="outline" className="text-xs">
                              {restriction.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No zones defined for this warehouse yet.</p>
                <Button onClick={() => navigate(`/logistics/warehouses/${id}/zones/new`)} className="mt-4">
                  Add First Zone
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Warehouse Layout</h2>
              <Button variant="outline">Edit Layout</Button>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-6">
                <div className="grid grid-cols-3 gap-4 w-full h-full">
                  {warehouse.zones.map((zone, index) => (
                    <div 
                      key={zone.id}
                      className={`
                        border-2 rounded-lg p-4 flex flex-col
                        ${zone.type === 'RECEIVING' ? 'border-blue-500 bg-blue-50' : ''}
                        ${zone.type === 'STORAGE' ? 'border-green-500 bg-green-50' : ''}
                        ${zone.type === 'PICKING' ? 'border-amber-500 bg-amber-50' : ''}
                        ${zone.type === 'PACKING' ? 'border-purple-500 bg-purple-50' : ''}
                        ${zone.type === 'SHIPPING' ? 'border-red-500 bg-red-50' : ''}
                      `}
                    >
                      <h4 className="font-medium text-sm">{zone.name}</h4>
                      <p className="text-xs text-muted-foreground">{zone.type}</p>
                      <div className="mt-2 text-xs">
                        <p>{zone.aisles.length} Aisles</p>
                        <p>
                          {zone.aisles.reduce(
                            (total, aisle) => 
                              total + aisle.racks.reduce(
                                (rackTotal, rack) => rackTotal + rack.bins.length, 
                                0
                              ), 
                            0
                          )} Bins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-sm">Receiving</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <span className="text-sm">Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
                  <span className="text-sm">Picking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                  <span className="text-sm">Packing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                  <span className="text-sm">Shipping</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Tasks</h2>
              <Button onClick={() => navigate('/logistics/tasks/new', { state: { warehouseId: id } })} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
            
            {isTasksLoading ? (
              <div className="flex justify-center p-6">
                <LoadingSpinner size="lg" />
              </div>
            ) : tasksData?.items && tasksData.items.length > 0 ? (
              <div className="space-y-4">
                {tasksData.items.map((task) => (
                  <div 
                    key={task.id} 
                    className="rounded-lg border bg-card p-4 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => navigate(`/logistics/tasks/${task.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">{task.type} Task</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          task.status === 'COMPLETED' ? 'success' : 
                          task.status === 'IN_PROGRESS' ? 'warning' : 
                          task.status === 'ASSIGNED' ? 'secondary' : 
                          'default'
                        }>
                          {task.status}
                        </Badge>
                        <Badge variant={
                          task.priority === 'URGENT' ? 'destructive' : 
                          task.priority === 'HIGH' ? 'warning' : 
                          task.priority === 'MEDIUM' ? 'secondary' : 
                          'default'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Items:</span>{' '}
                        <span>{task.items.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due:</span>{' '}
                        <span>{format(new Date(task.dueBy), 'PP')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>{' '}
                        <span>{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>{' '}
                        <span>{format(new Date(task.createdAt), 'PP')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => navigate('/logistics/tasks', { state: { warehouseId: id } })}>
                    View All Tasks
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No tasks found for this warehouse.</p>
                <Button onClick={() => navigate('/logistics/tasks/new', { state: { warehouseId: id } })} className="mt-4">
                  Create First Task
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Inventory Summary</h2>
              <Button variant="outline" onClick={() => navigate('/inventory/stock', { state: { warehouseId: id } })}>
                View All Inventory
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Total SKUs</h3>
                </div>
                <p className="text-2xl font-bold">
                  {warehouse.zones.reduce(
                    (total, zone) => 
                      total + zone.aisles.reduce(
                        (aisleTotal, aisle) => 
                          aisleTotal + aisle.racks.reduce(
                            (rackTotal, rack) => 
                              rackTotal + rack.bins.reduce(
                                (binTotal, bin) => binTotal + bin.currentItems.length,
                                0
                              ),
                            0
                          ),
                        0
                      ),
                    0
                  )}
                </p>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Storage Locations</h3>
                </div>
                <p className="text-2xl font-bold">
                  {warehouse.zones.reduce(
                    (total, zone) => 
                      total + zone.aisles.reduce(
                        (aisleTotal, aisle) => 
                          aisleTotal + aisle.racks.reduce(
                            (rackTotal, rack) => rackTotal + rack.bins.length,
                            0
                          ),
                        0
                      ),
                    0
                  )}
                </p>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Pending Cycle Counts</h3>
                </div>
                <p className="text-2xl font-bold">3</p>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Open Tasks</h3>
                </div>
                <p className="text-2xl font-bold">
                  {tasksData?.items.filter(task => task.status !== 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Inventory by Zone</h3>
              <div className="space-y-4">
                {warehouse.zones.map((zone) => {
                  const totalItems = zone.aisles.reduce(
                    (total, aisle) => 
                      total + aisle.racks.reduce(
                        (rackTotal, rack) => 
                          rackTotal + rack.bins.reduce(
                            (binTotal, bin) => binTotal + bin.currentItems.reduce(
                              (itemTotal, item) => itemTotal + item.quantity,
                              0
                            ),
                            0
                          ),
                        0
                      ),
                    0
                  );
                  
                  return (
                    <div key={zone.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={zoneTypeColors[zone.type] || 'default'} className="capitalize">
                          {zone.type.toLowerCase().replace('_', ' ')}
                        </Badge>
                        <span>{zone.name}</span>
                      </div>
                      <div className="font-medium">{totalItems.toLocaleString()} units</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Status Change"
        description="Are you sure you want to change the warehouse status? This may affect ongoing operations."
        confirmText="Change Status"
        onConfirm={onConfirm}
      />
    </div>
  );
}