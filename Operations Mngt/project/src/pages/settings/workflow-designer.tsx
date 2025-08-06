import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Save, 
  Play,
  Pause,
  Trash2, 
  Copy,
  Settings,
  Eye,
  Download,
  Upload, 
  Zap,
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Workflow,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useToast } from '@/hooks/useToast';

// Custom Node Types
const WorkflowNode = ({ data }: { data: any }) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'trigger': return <Zap className="h-4 w-4" />;
      case 'action': return <Settings className="h-4 w-4" />;
      case 'condition': return <AlertTriangle className="h-4 w-4" />;
      case 'approval': return <Users className="h-4 w-4" />;
      case 'notification': return <FileText className="h-4 w-4" />;
      case 'integration': return <Package className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'trigger': return 'bg-blue-500';
      case 'action': return 'bg-green-500';
      case 'condition': return 'bg-yellow-500';
      case 'approval': return 'bg-purple-500';
      case 'notification': return 'bg-orange-500';
      case 'integration': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 border-white bg-white ${data.selected ? 'border-blue-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${getNodeColor()}`}>
          {getNodeIcon()}
        </div>
        <div>
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.description}</div>
      </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

// Workflow Template Component
const WorkflowTemplate = ({ 
  name, 
  description, 
  category, 
  onUse 
}: { 
  name: string; 
  description: string; 
  category: string; 
  onUse: () => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onUse}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          <Badge variant="outline" className="text-xs">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button size="sm" className="w-full">
          <Plus className="h-3 w-3 mr-1" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

// Workflow History Component
const WorkflowHistory = ({ 
  workflow, 
  status, 
  startedAt, 
  completedAt, 
  duration 
}: { 
  workflow: string; 
  status: 'running' | 'completed' | 'failed' | 'paused'; 
  startedAt: string; 
  completedAt?: string; 
  duration?: string;
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <p className="text-sm font-medium">{workflow}</p>
          <p className="text-xs text-muted-foreground">Started: {startedAt}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${getStatusColor()}`}>{status}</p>
        {duration && <p className="text-xs text-muted-foreground">{duration}</p>}
      </div>
    </div>
  );
};

export default function WorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { toast } = useToast();

  // Sample workflow templates
  const workflowTemplates = [
    {
      name: 'Purchase Requisition Approval',
      description: 'Automated approval workflow for purchase requisitions based on amount and category',
      category: 'Procurement',
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 100, y: 100 }, data: { label: 'Requisition Created', type: 'trigger', description: 'New requisition submitted' } },
        { id: '2', type: 'workflowNode', position: { x: 300, y: 100 }, data: { label: 'Amount Check', type: 'condition', description: 'Check if amount > $1000' } },
        { id: '3', type: 'workflowNode', position: { x: 500, y: 50 }, data: { label: 'Manager Approval', type: 'approval', description: 'Manager approval required' } },
        { id: '4', type: 'workflowNode', position: { x: 500, y: 150 }, data: { label: 'Auto Approve', type: 'action', description: 'Automatic approval' } },
        { id: '5', type: 'workflowNode', position: { x: 700, y: 100 }, data: { label: 'Create PO', type: 'action', description: 'Generate purchase order' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Amount > $1000' },
        { id: 'e2-4', source: '2', target: '4', label: 'Amount <= $1000' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-5', source: '4', target: '5' },
      ]
    },
    {
      name: 'Inventory Reorder Process',
      description: 'Automated reorder process when inventory levels fall below threshold',
      category: 'Inventory',
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 100, y: 100 }, data: { label: 'Low Stock Alert', type: 'trigger', description: 'Stock level below threshold' } },
        { id: '2', type: 'workflowNode', position: { x: 300, y: 100 }, data: { label: 'Check Supplier', type: 'condition', description: 'Check preferred supplier availability' } },
        { id: '3', type: 'workflowNode', position: { x: 500, y: 50 }, data: { label: 'Create PO', type: 'action', description: 'Generate purchase order' } },
        { id: '4', type: 'workflowNode', position: { x: 500, y: 150 }, data: { label: 'Notify Manager', type: 'notification', description: 'Send notification to manager' } },
        { id: '5', type: 'workflowNode', position: { x: 700, y: 100 }, data: { label: 'Send to Supplier', type: 'integration', description: 'Send PO to supplier system' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Supplier Available' },
        { id: 'e2-4', source: '2', target: '4', label: 'Supplier Unavailable' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-5', source: '4', target: '5' },
      ]
    },
    {
      name: 'Quality Inspection Workflow',
      description: 'Automated quality inspection process for incoming materials',
      category: 'Quality',
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 100, y: 100 }, data: { label: 'Material Received', type: 'trigger', description: 'Incoming material received' } },
        { id: '2', type: 'workflowNode', position: { x: 300, y: 100 }, data: { label: 'Inspection Required', type: 'condition', description: 'Check if inspection needed' } },
        { id: '3', type: 'workflowNode', position: { x: 500, y: 50 }, data: { label: 'Schedule Inspection', type: 'action', description: 'Schedule quality inspection' } },
        { id: '4', type: 'workflowNode', position: { x: 500, y: 150 }, data: { label: 'Auto Accept', type: 'action', description: 'Accept without inspection' } },
        { id: '5', type: 'workflowNode', position: { x: 700, y: 100 }, data: { label: 'Update Inventory', type: 'action', description: 'Update inventory status' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Inspection Required' },
        { id: 'e2-4', source: '2', target: '4', label: 'No Inspection' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-5', source: '4', target: '5' },
      ]
    }
  ];

  // Sample workflow history
  const workflowHistory = [
    {
      workflow: 'Purchase Requisition Approval',
      status: 'completed' as const,
      startedAt: '2024-01-15 10:30 AM',
      completedAt: '2024-01-15 11:15 AM',
      duration: '45 minutes'
    },
    {
      workflow: 'Inventory Reorder Process',
      status: 'running' as const,
      startedAt: '2024-01-15 09:45 AM'
    },
    {
      workflow: 'Quality Inspection Workflow',
      status: 'failed' as const,
      startedAt: '2024-01-15 08:20 AM',
      completedAt: '2024-01-15 08:25 AM',
      duration: '5 minutes'
    }
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleUseTemplate = (template: any) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    toast.success(`Template "${template.name}" loaded successfully`);
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    
    // Save workflow logic here
    toast.success('Workflow saved successfully');
  };

  const handleActivateWorkflow = () => {
    setIsActive(!isActive);
    toast.success(`Workflow ${isActive ? 'deactivated' : 'activated'} successfully`);
  };

  const handleAddNode = (nodeType: string) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: 'workflowNode',
      position: { x: 100, y: 100 },
      data: {
        label: `New ${nodeType}`,
        type: nodeType,
        description: `Add description for ${nodeType}`
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeDialog(false);
  };

  const handleNodeClick = (event: any, node: Node) => {
    setSelectedNode(node);
    setShowNodeDialog(true);
  };

  const handleUpdateNode = (updates: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
    setShowNodeDialog(false);
    setSelectedNode(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Designer</h1>
          <p className="text-muted-foreground">
            Design and automate business processes with visual workflow builder
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          <Button 
            onClick={handleSaveWorkflow}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Workflow
          </Button>
          <Button 
            onClick={handleActivateWorkflow}
            variant={isActive ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="designer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Workflow Designer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Workflow Properties */}
            <div className="lg:col-span-1 space-y-4">
          <Card>
                    <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Workflow Properties</CardTitle>
                    </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="name">Name</Label>
                            <Input 
                      id="name"
                      value={workflowName} 
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={workflowDescription} 
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Enter workflow description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procurement">Procurement</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                      </Select>
              </div>
            </CardContent>
          </Card>

              {/* Node Library */}
          <Card>
            <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Node Library</CardTitle>
            </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('trigger')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger
                      </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('action')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Action
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('condition')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Condition
                      </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('approval')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Approval
                      </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('notification')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Notification
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddNode('integration')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Integration
                    </Button>
            </CardContent>
          </Card>

              {/* Workflow Stats */}
          <Card>
            <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Workflow Stats</CardTitle>
            </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Nodes</span>
                    <span className="text-sm font-medium">{nodes.length}</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="text-sm font-medium">{edges.length}</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Workflow Canvas */}
            <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Workflow Canvas</CardTitle>
                  <CardDescription>Drag and drop nodes to create your workflow</CardDescription>
            </CardHeader>
            <CardContent>
                  <div style={{ height: '600px' }}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={handleNodeClick}
                      nodeTypes={nodeTypes}
                      fitView
                    >
                      <Controls />
                      <Background />
                      <MiniMap />
                    </ReactFlow>
                  </div>
                </CardContent>
              </Card>
                  </div>
                  </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template, index) => (
              <WorkflowTemplate
                key={index}
                name={template.name}
                description={template.description}
                category={template.category}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
                    </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Execution History</CardTitle>
              <CardDescription>Track the execution of your workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflowHistory.map((history, index) => (
                <WorkflowHistory
                  key={index}
                  workflow={history.workflow}
                  status={history.status}
                  startedAt={history.startedAt}
                  completedAt={history.completedAt}
                  duration={history.duration}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save workflows</Label>
                  <Switch id="auto-save" defaultChecked />
                          </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Email notifications</Label>
                  <Switch id="notifications" defaultChecked />
                          </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-mode">Debug mode</Label>
                  <Switch id="debug-mode" />
              </div>
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeout">Execution timeout (minutes)</Label>
                  <Input id="timeout" type="number" defaultValue={30} />
                </div>
                <div>
                  <Label htmlFor="retry-attempts">Max retry attempts</Label>
                  <Input id="retry-attempts" type="number" defaultValue={3} />
                </div>
                <div>
                  <Label htmlFor="concurrent-executions">Max concurrent executions</Label>
                  <Input id="concurrent-executions" type="number" defaultValue={10} />
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Node Configuration Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Node</DialogTitle>
            <DialogDescription>
              Configure the properties for this workflow node
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={selectedNode?.data?.label || ''}
                onChange={(e) => handleUpdateNode({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="node-description">Description</Label>
              <Textarea
                id="node-description"
                value={selectedNode?.data?.description || ''}
                onChange={(e) => handleUpdateNode({ description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="node-type">Type</Label>
              <Select
                value={selectedNode?.data?.type || ''}
                onValueChange={(value) => handleUpdateNode({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trigger">Trigger</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}