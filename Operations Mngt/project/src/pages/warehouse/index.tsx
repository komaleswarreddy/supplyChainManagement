import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Package, Truck, Users, MapPin } from 'lucide-react';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: warehouses, isLoading, error } = useWarehouses();
  const { mutate: deleteWarehouse } = useWarehouses();
  const { showConfirm } = useConfirmDialog();

  const filteredWarehouses = warehouses?.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Warehouse',
      message: 'Are you sure you want to delete this warehouse? This action cannot be undone.',
      onConfirm: () => deleteWarehouse(id)
    });
  };

  if (isLoading) return <div>Loading warehouses...</div>;
  if (error) return <div>Error loading warehouses: {error.message}</div>;

  const totalCapacity = warehouses?.reduce((sum, w) => sum + (w.capacity || 0), 0) || 0;
  const totalUtilization = warehouses?.reduce((sum, w) => sum + (w.utilization || 0), 0) || 0;
  const activeWarehouses = warehouses?.filter(w => w.status === 'active').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-muted-foreground">Manage warehouse operations, capacity, and performance</p>
        </div>
        <Button onClick={() => navigate('/warehouse/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Warehouse
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeWarehouses} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              sq ft / pallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses?.length ? Math.round(totalUtilization / warehouses.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              across all warehouses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWarehouses}</div>
            <p className="text-xs text-muted-foreground">
              operational warehouses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse List */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
                <SelectItem value="fulfillment">Fulfillment</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="cross-dock">Cross-Dock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses?.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-mono">{warehouse.code}</TableCell>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{warehouse.type}</Badge>
                  </TableCell>
                  <TableCell>{warehouse.location}</TableCell>
                  <TableCell>{warehouse.capacity?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (warehouse.utilization || 0) > 90 ? 'bg-red-500' : 
                            (warehouse.utilization || 0) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(warehouse.utilization || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{(warehouse.utilization || 0).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={warehouse.status === 'active' ? 'default' : 'secondary'}
                    >
                      {warehouse.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/warehouse/${warehouse.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/warehouse/${warehouse.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/warehouse/${warehouse.id}/tasks`)}>
                          <Package className="w-4 h-4 mr-2" />
                          View Tasks
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/warehouse/tasks')}>
              <Package className="w-4 h-4 mr-2" />
              View All Tasks
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/warehouse/cycle-counts')}>
              <Truck className="w-4 h-4 mr-2" />
              Cycle Counts
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/warehouse/pick-paths')}>
              <MapPin className="w-4 h-4 mr-2" />
              Pick Paths
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">New shipment received</div>
                <div className="text-muted-foreground">Warehouse A - 2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Cycle count completed</div>
                <div className="text-muted-foreground">Warehouse B - 4 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Pick path optimized</div>
                <div className="text-muted-foreground">Warehouse C - 6 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 