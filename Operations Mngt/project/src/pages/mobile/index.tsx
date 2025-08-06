import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Smartphone, Tablet, Wifi, WifiOff, Settings, BarChart3, Download, Users } from 'lucide-react';
import { useMobileDevices } from '@/hooks/useMobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Progress } from '@/components/ui/progress';

export default function MobileManagementDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  const { data: devices, isLoading, error } = useMobileDevices();
  const { mutate: deleteDevice } = useMobileDevices();
  const { showConfirm } = useConfirmDialog();

  const filteredDevices = devices?.filter(device => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || device.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Device',
      message: 'Are you sure you want to delete this mobile device? This action cannot be undone.',
      onConfirm: () => deleteDevice(id)
    });
  };

  if (isLoading) return <div>Loading mobile devices...</div>;
  if (error) return <div>Error loading mobile devices: {error.message}</div>;

  const activeDevices = devices?.filter(d => d.status === 'active').length || 0;
  const iosDevices = devices?.filter(d => d.platform === 'ios').length || 0;
  const androidDevices = devices?.filter(d => d.platform === 'android').length || 0;
  const onlineDevices = devices?.filter(d => d.last_active && 
    new Date(d.last_active) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mobile Management</h1>
          <p className="text-muted-foreground">Manage mobile devices, app deployments, and mobile operations</p>
        </div>
        <Button onClick={() => navigate('/mobile/devices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Register Device
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeDevices} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineDevices}</div>
            <p className="text-xs text-muted-foreground">
              connected in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
            <Tablet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{iosDevices + androidDevices}</div>
            <p className="text-xs text-muted-foreground">
              {iosDevices} iOS, {androidDevices} Android
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              total downloads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search devices..."
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
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>OS Version</TableHead>
                <TableHead>App Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices?.map((device) => {
                const isOnline = device.last_active && 
                  new Date(device.last_active) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                return (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.device_name}</TableCell>
                    <TableCell>{device.user_name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.platform}</Badge>
                    </TableCell>
                    <TableCell>{device.os_version}</TableCell>
                    <TableCell>{device.app_version}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant={
                            device.status === 'active' ? 'default' : 
                            device.status === 'inactive' ? 'secondary' : 'outline'
                          }
                        >
                          {isOnline ? 'Online' : device.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {device.last_active ? 
                        new Date(device.last_active).toLocaleDateString() : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/mobile/devices/${device.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/mobile/devices/${device.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/mobile/devices/${device.id}/analytics`)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(device.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/mobile/app-versions')}>
              <Download className="w-4 h-4 mr-2" />
              App Versions
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/mobile/notifications')}>
              <Smartphone className="w-4 h-4 mr-2" />
              Push Notifications
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/mobile/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Usage Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Daily Active Users</div>
                <div className="text-2xl font-bold text-blue-600">847</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Session Duration</div>
                <div className="text-2xl font-bold text-green-600">12.5 min</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Crash Rate</div>
                <div className="text-2xl font-bold text-red-600">0.2%</div>
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
                <div className="font-medium">App updated</div>
                <div className="text-muted-foreground">Version 1.2.0 deployed - 2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">New device registered</div>
                <div className="text-muted-foreground">iPhone 15 Pro - 4 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Push notification sent</div>
                <div className="text-muted-foreground">Order update - 6 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 