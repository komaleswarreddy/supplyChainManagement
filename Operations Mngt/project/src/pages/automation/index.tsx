import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Play, Pause, Settings, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useAutomationWorkflows } from '@/hooks/useAutomation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Progress } from '@/components/ui/progress';

export default function AutomationDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: workflows, isLoading, error } = useAutomationWorkflows();
  const { mutate: deleteWorkflow } = useAutomationWorkflows();
  const { showConfirm } = useConfirmDialog();

  const filteredWorkflows = workflows?.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Workflow',
      message: 'Are you sure you want to delete this automation workflow? This action cannot be undone.',
      onConfirm: () => deleteWorkflow(id)
    });
  };

  if (isLoading) return <div>Loading automation workflows...</div>;
  if (error) return <div>Error loading automation workflows: {error.message}</div>;

  const activeWorkflows = workflows?.filter(w => w.status === 'active').length || 0;
  const totalExecutions = workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;
  const successRate = workflows?.length ? 
    Math.round((workflows.filter(w => w.success_rate).reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length)) : 0;
  const runningWorkflows = workflows?.filter(w => w.status === 'running').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Management</h1>
          <p className="text-muted-foreground">Manage automated workflows, RPA processes, and business process automation</p>
        </div>
        <Button onClick={() => navigate('/automation/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorkflows} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              automated processes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              successful executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Running</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              active processes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow List */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search workflows..."
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
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="data_processing">Data Processing</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows?.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{workflow.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        workflow.status === 'active' ? 'default' : 
                        workflow.status === 'running' ? 'secondary' :
                        workflow.status === 'error' ? 'destructive' : 'outline'
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow.execution_count?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${workflow.success_rate || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">{(workflow.success_rate || 0).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {workflow.last_execution ? 
                      new Date(workflow.last_execution).toLocaleDateString() : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    {workflow.next_execution ? 
                      new Date(workflow.next_execution).toLocaleDateString() : 'Not scheduled'
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
                        <DropdownMenuItem onClick={() => navigate(`/automation/${workflow.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/automation/${workflow.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/automation/${workflow.id}/logs`)}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(workflow.id)}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/automation/templates')}>
              <Settings className="w-4 h-4 mr-2" />
              Workflow Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/automation/logs')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Execution Logs
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/automation/scheduler')}>
              <Clock className="w-4 h-4 mr-2" />
              Schedule Manager
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
                <div className="text-sm text-muted-foreground">Average Execution Time</div>
                <div className="text-2xl font-bold text-blue-600">2.3 min</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time Saved Today</div>
                <div className="text-2xl font-bold text-green-600">45 hours</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Error Rate</div>
                <div className="text-2xl font-bold text-red-600">2.1%</div>
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
                <div className="font-medium">Workflow completed</div>
                <div className="text-muted-foreground">Data sync automation - 5 min ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">New workflow created</div>
                <div className="text-muted-foreground">Invoice processing - 2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Error detected</div>
                <div className="text-muted-foreground">Email notification workflow - 1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 