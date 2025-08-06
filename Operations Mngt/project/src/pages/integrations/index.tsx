import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Wifi, WifiOff, Settings, BarChart3, Shield, Activity } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Progress } from '@/components/ui/progress';

export default function IntegrationsDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: integrations, isLoading, error } = useIntegrations();
  const { mutate: deleteIntegration } = useIntegrations();
  const { showConfirm } = useConfirmDialog();

  const filteredIntegrations = integrations?.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    const matchesType = typeFilter === 'all' || integration.integration_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Integration',
      message: 'Are you sure you want to delete this integration? This action cannot be undone.',
      onConfirm: () => deleteIntegration(id)
    });
  };

  if (isLoading) return <div>Loading integrations...</div>;
  if (error) return <div>Error loading integrations: {error.message}</div>;

  const activeIntegrations = integrations?.filter(i => i.status === 'active').length || 0;
  const totalEndpoints = integrations?.reduce((sum, i) => sum + (i.endpoints?.length || 0), 0) || 0;
  const healthyIntegrations = integrations?.filter(i => i.health_status === 'healthy').length || 0;
  const totalWebhooks = integrations?.reduce((sum, i) => sum + (i.webhooks?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Management</h1>
          <p className="text-muted-foreground">Manage external system integrations, APIs, and data connections</p>
        </div>
        <Button onClick={() => navigate('/integrations/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Integration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              configured endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              healthy connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebhooks}</div>
            <p className="text-xs text-muted-foreground">
              active webhooks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration List */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search integrations..."
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
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="erp">ERP</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Endpoints</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntegrations?.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">{integration.name}</TableCell>
                  <TableCell>{integration.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{integration.integration_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        integration.status === 'active' ? 'default' : 
                        integration.status === 'error' ? 'destructive' : 'secondary'
                      }
                    >
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {integration.health_status === 'healthy' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{integration.health_status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{integration.endpoints?.length || 0}</TableCell>
                  <TableCell>
                    {integration.last_sync ? 
                      new Date(integration.last_sync).toLocaleDateString() : 'Never'
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
                        <DropdownMenuItem onClick={() => navigate(`/integrations/${integration.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/integrations/${integration.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/integrations/${integration.id}/logs`)}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(integration.id)}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/integrations/templates')}>
              <Settings className="w-4 h-4 mr-2" />
              Integration Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/integrations/health')}>
              <Wifi className="w-4 h-4 mr-2" />
              Health Monitor
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/integrations/webhooks')}>
              <Shield className="w-4 h-4 mr-2" />
              Webhook Manager
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Average Response Time</div>
                <div className="text-2xl font-bold text-blue-600">245ms</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">99.2%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Data Sync Volume</div>
                <div className="text-2xl font-bold text-purple-600">2.5GB/day</div>
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
                <div className="font-medium">Integration connected</div>
                <div className="text-muted-foreground">Salesforce CRM - 1 hour ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Sync completed</div>
                <div className="text-muted-foreground">ERP data sync - 3 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Webhook received</div>
                <div className="text-muted-foreground">Payment notification - 5 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 