import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Truck, Users, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { useWarehouse } from '@/hooks/useWarehouses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: warehouse, isLoading, error } = useWarehouse(id!);

  if (isLoading) return <div>Loading warehouse...</div>;
  if (error) return <div>Error loading warehouse: {error.message}</div>;
  if (!warehouse) return <div>Warehouse not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/warehouse')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Warehouses
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{warehouse.name}</h1>
          <p className="text-muted-foreground">Warehouse Code: {warehouse.code}</p>
        </div>
        <Button onClick={() => navigate(`/warehouse/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{warehouse.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                      {warehouse.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manager</label>
                  <div className="mt-1">{warehouse.manager_name || 'Not assigned'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact</label>
                  <div className="mt-1">{warehouse.contact_phone || 'Not available'}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-1 text-sm">{warehouse.description || 'No description provided'}</div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="mt-1 text-sm">{warehouse.address}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <div className="mt-1 text-sm">{warehouse.city}, {warehouse.state} {warehouse.postal_code}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capacity & Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {warehouse.capacity?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {warehouse.utilization || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Current Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {warehouse.capacity ? Math.round(warehouse.capacity * (1 - (warehouse.utilization || 0) / 100)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Space</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Utilization</span>
                    <span>{warehouse.utilization || 0}%</span>
                  </div>
                  <Progress 
                    value={warehouse.utilization || 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Operating Hours:</span>
                    <div className="font-medium">{warehouse.operating_hours || '24/7'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature Range:</span>
                    <div className="font-medium">{warehouse.temperature_range || 'Ambient'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="zones" className="w-full">
            <TabsList>
              <TabsTrigger value="zones">Zones</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="zones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouse Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4" />
                          <h4 className="font-medium">Receiving Zone</h4>
                        </div>
                        <div className="text-sm text-muted-foreground">Capacity: 500 pallets</div>
                        <div className="text-sm text-muted-foreground">Utilization: 75%</div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4" />
                          <h4 className="font-medium">Shipping Zone</h4>
                        </div>
                        <div className="text-sm text-muted-foreground">Capacity: 300 pallets</div>
                        <div className="text-sm text-muted-foreground">Utilization: 60%</div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          <h4 className="font-medium">Storage Zone</h4>
                        </div>
                        <div className="text-sm text-muted-foreground">Capacity: 2000 pallets</div>
                        <div className="text-sm text-muted-foreground">Utilization: 85%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Forklifts</h4>
                          <Badge variant="outline">5 Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">2 in maintenance</div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Conveyors</h4>
                          <Badge variant="outline">3 Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">All operational</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Morning Receiving</div>
                        <div className="text-sm text-muted-foreground">Completed 2 hours ago</div>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Inventory Count</div>
                        <div className="text-sm text-muted-foreground">In progress</div>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Afternoon Shipping</div>
                        <div className="text-sm text-muted-foreground">Scheduled for 2:00 PM</div>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Order Fulfillment Rate</div>
                      <div className="text-2xl font-bold text-green-600">98.5%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Pick Time</div>
                      <div className="text-2xl font-bold text-blue-600">2.3 min</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Inventory Accuracy</div>
                      <div className="text-2xl font-bold text-purple-600">99.2%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Safety Incidents</div>
                      <div className="text-2xl font-bold text-orange-600">0</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                View Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Manage Tasks
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Staff Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Daily Throughput</div>
                <div className="text-lg font-semibold">1,250 orders</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Staff Count</div>
                <div className="text-lg font-semibold">24 employees</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Operating Cost</div>
                <div className="text-lg font-semibold">$12,500/day</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Manager</div>
                <div className="font-medium">{warehouse.manager_name || 'Not assigned'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{warehouse.contact_phone || 'Not available'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{warehouse.contact_email || 'Not available'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 