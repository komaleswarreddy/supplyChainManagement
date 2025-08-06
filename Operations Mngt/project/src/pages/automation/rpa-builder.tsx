import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Save,
  Play,
  Pause,
  Stop,
  Settings,
  Eye,
  Download,
  Upload,
  Zap,
  Bot,
  Workflow,
  FileText,
  Database,
  Webhook,
  Mail,
  Calendar,
  Calculator,
  Search,
  Filter,
  Sort,
  Copy,
  Move,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  RotateCcw,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Hash as HashIcon,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderPlus,
  FolderMinus,
  FileText as FileTextIcon,
  FilePlus,
  FileMinus,
  MousePointer,
  FileX,
  FileCheck,
  FileEdit,
  FileSearch,
  FileHeart,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileDatabase,
  FilePresentation,
  FileBookmark,
  FileBarChart,
  FilePieChart,
  FileActivity,
  FileClock,
  FileKey,
  FileLock,
  FileUnlock,
  FileShield,
  FileAlert,
  FileWarning,
  FileInfo,
  FileHelp,
  FileQuestion,
  FileCheckCircle,
  FileXCircle,
  FileMinusCircle,
  FilePlusCircle,
  FileDownload,
  FileUpload,
  FileShare,
  FileCopy,
  FileMove,
  FileTrash,
  FileSettings,
  FileCog,
  FileWrench,
  FileTool,
  FileHammer,
  FileWrench2,
  FileScrewdriver,
  FileDrill,
  FileSaw,
  FileAxe,
  FileKnife,
  FileScissors,
  FileRazor,
  FileShave,
  FileCut,
  FileSlice,
  FileChop,
  FileDice,
  FileCube,
  FileBox,
  FilePackage,
  FileGift,
  FileHeart as FileHeartIcon,
  FileStar,
  FileAward,
  FileTrophy,
  FileMedal,
  FileRibbon,
  FileBadge,
  FileTag,
  FileLabel,
  FileBookmark as FileBookmarkIcon,
  FileBook,
  FileBookOpen,
  FileBookmark2,
  FileBookmark3,
  FileBookmark4,
  FileBookmark5,
  FileBookmark6,
  FileBookmark7,
  FileBookmark8,
  FileBookmark9,
  FileBookmark10,
  FileBookmark11,
  FileBookmark12,
  FileBookmark13,
  FileBookmark14,
  FileBookmark15,
  FileBookmark16,
  FileBookmark17,
  FileBookmark18,
  FileBookmark19,
  FileBookmark20,
  FileBookmark21,
  FileBookmark22,
  FileBookmark23,
  FileBookmark24,
  FileBookmark25,
  FileBookmark26,
  FileBookmark27,
  FileBookmark28,
  FileBookmark29,
  FileBookmark30,
  FileBookmark31,
  FileBookmark32,
  FileBookmark33,
  FileBookmark34,
  FileBookmark35,
  FileBookmark36,
  FileBookmark37,
  FileBookmark38,
  FileBookmark39,
  FileBookmark40,
  FileBookmark41,
  FileBookmark42,
  FileBookmark43,
  FileBookmark44,
  FileBookmark45,
  FileBookmark46,
  FileBookmark47,
  FileBookmark48,
  FileBookmark49,
  FileBookmark50,
  FileBookmark51,
  FileBookmark52,
  FileBookmark53,
  FileBookmark54,
  FileBookmark55,
  FileBookmark56,
  FileBookmark57,
  FileBookmark58,
  FileBookmark59,
  FileBookmark60,
  FileBookmark61,
  FileBookmark62,
  FileBookmark63,
  FileBookmark64,
  FileBookmark65,
  FileBookmark66,
  FileBookmark67,
  FileBookmark68,
  FileBookmark69,
  FileBookmark70,
  FileBookmark71,
  FileBookmark72,
  FileBookmark73,
  FileBookmark74,
  FileBookmark75,
  FileBookmark76,
  FileBookmark77,
  FileBookmark78,
  FileBookmark79,
  FileBookmark80,
  FileBookmark81,
  FileBookmark82,
  FileBookmark83,
  FileBookmark84,
  FileBookmark85,
  FileBookmark86,
  FileBookmark87,
  FileBookmark88,
  FileBookmark89,
  FileBookmark90,
  FileBookmark91,
  FileBookmark92,
  FileBookmark93,
  FileBookmark94,
  FileBookmark95,
  FileBookmark96,
  FileBookmark97,
  FileBookmark98,
  FileBookmark99,
  FileBookmark100,
} from 'lucide-react';

// Mock data for RPA bots and processes
const rpaBots = [
  {
    id: 'bot-1',
    name: 'Invoice Processing Bot',
    description: 'Automated invoice data extraction and processing',
    status: 'ACTIVE',
    type: 'DOCUMENT_PROCESSING',
    lastRun: '2023-06-14T10:30:00Z',
    successRate: 94.5,
    totalRuns: 1247,
    avgExecutionTime: '2.3 minutes',
    createdBy: 'John Smith',
    createdAt: '2023-05-15T09:00:00Z'
  },
  {
    id: 'bot-2',
    name: 'Supplier Data Sync Bot',
    description: 'Synchronize supplier data across systems',
    status: 'ACTIVE',
    type: 'DATA_SYNC',
    lastRun: '2023-06-14T08:15:00Z',
    successRate: 98.2,
    totalRuns: 2156,
    avgExecutionTime: '1.8 minutes',
    createdBy: 'Sarah Johnson',
    createdAt: '2023-04-20T14:30:00Z'
  },
  {
    id: 'bot-3',
    name: 'Inventory Reorder Bot',
    description: 'Automated inventory reorder point monitoring',
    status: 'INACTIVE',
    type: 'MONITORING',
    lastRun: '2023-06-13T16:45:00Z',
    successRate: 96.8,
    totalRuns: 892,
    avgExecutionTime: '45 seconds',
    createdBy: 'Mike Wilson',
    createdAt: '2023-03-10T11:20:00Z'
  }
];

// Process templates
const processTemplates = [
  {
    id: 'template-1',
    name: 'Email Processing',
    description: 'Process incoming emails and extract data',
    category: 'COMMUNICATION',
    complexity: 'Medium',
    steps: 8,
    estimatedTime: '5 minutes'
  },
  {
    id: 'template-2',
    name: 'Data Validation',
    description: 'Validate and clean data from multiple sources',
    category: 'DATA_PROCESSING',
    complexity: 'High',
    steps: 12,
    estimatedTime: '8 minutes'
  },
  {
    id: 'template-3',
    name: 'Report Generation',
    description: 'Generate and distribute automated reports',
    category: 'REPORTING',
    complexity: 'Low',
    steps: 5,
    estimatedTime: '3 minutes'
  }
];

// Action types for RPA
const actionTypes = [
  { id: 'click', name: 'Click Element', icon: MousePointer, description: 'Click on UI elements' },
  { id: 'type', name: 'Type Text', icon: Type, description: 'Enter text into fields' },
  { id: 'select', name: 'Select Option', icon: List, description: 'Select from dropdowns' },
  { id: 'wait', name: 'Wait', icon: Clock, description: 'Wait for conditions' },
  { id: 'extract', name: 'Extract Data', icon: Database, description: 'Extract data from pages' },
  { id: 'validate', name: 'Validate', icon: CheckCircle, description: 'Validate data or conditions' },
  { id: 'loop', name: 'Loop', icon: RotateCcw, description: 'Repeat actions' },
  { id: 'condition', name: 'Condition', icon: AlertTriangle, description: 'Conditional logic' },
  { id: 'api_call', name: 'API Call', icon: Webhook, description: 'Make API requests' },
  { id: 'file_operation', name: 'File Operation', icon: FileText, description: 'File operations' },
  { id: 'email', name: 'Send Email', icon: Mail, description: 'Send email notifications' },
  { id: 'calculation', name: 'Calculation', icon: Calculator, description: 'Perform calculations' }
];

export default function RPABuilder() {
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  const handleCreateBot = () => {
    const newBot = {
      id: `bot-${Date.now()}`,
      name: botName,
      description: botDescription,
      status: 'INACTIVE',
      type: 'CUSTOM',
      lastRun: null,
      successRate: 0,
      totalRuns: 0,
      avgExecutionTime: '0 minutes',
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };
    rpaBots.push(newBot);
    setSelectedBot(newBot.id);
    setBotName('');
    setBotDescription('');
    setShowBotDialog(false);
  };

  const handleAddStep = (actionType: string) => {
    const newStep = {
      id: `step-${Date.now()}`,
      type: actionType,
      name: `New ${actionType}`,
      description: `Step description`,
      parameters: {},
      order: processSteps.length + 1
    };
    setProcessSteps([...processSteps, newStep]);
  };

  const currentBot = rpaBots.find(bot => bot.id === selectedBot);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RPA Builder</h1>
          <p className="text-muted-foreground">
            Create and manage robotic process automation bots
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowBotDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bots">My Bots</TabsTrigger>
          <TabsTrigger value="builder">Process Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rpaBots.map((bot) => (
              <Card key={bot.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <Badge variant={bot.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </div>
                  <CardDescription>{bot.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="font-medium">{bot.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Runs:</span>
                      <span>{bot.totalRuns.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg Time:</span>
                      <span>{bot.avgExecutionTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Run:</span>
                      <span>{bot.lastRun ? new Date(bot.lastRun).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedBot(bot.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Action Palette */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Actions</CardTitle>
                  <CardDescription>Drag actions to build your process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {actionTypes.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('actionType', action.id);
                        }}
                      >
                        <action.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Process Canvas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Process Canvas</CardTitle>
                  <CardDescription>Design your automation workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedBot ? (
                    <div className="text-center py-12">
                      <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Select a bot to start building</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{currentBot?.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                      
                      <div 
                        className="min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-4"
                        onDrop={(e) => {
                          e.preventDefault();
                          const actionType = e.dataTransfer.getData('actionType');
                          handleAddStep(actionType);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {processSteps.length === 0 ? (
                          <div className="text-center py-16">
                            <Workflow className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Drop actions here to build your process</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {processSteps.map((step, index) => (
                              <div
                                key={step.id}
                                className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => setSelectedStep(step)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">#{step.order}</span>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{step.name}</div>
                                  <div className="text-xs text-muted-foreground">{step.description}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Properties</CardTitle>
                  <CardDescription>Configure selected element</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStep ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stepName">Step Name</Label>
                        <Input
                          id="stepName"
                          value={selectedStep.name}
                          onChange={(e) => setSelectedStep({...selectedStep, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stepDescription">Description</Label>
                        <Textarea
                          id="stepDescription"
                          value={selectedStep.description}
                          onChange={(e) => setSelectedStep({...selectedStep, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stepType">Action Type</Label>
                        <Select value={selectedStep.type} onValueChange={(value) => setSelectedStep({...selectedStep, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enabled"
                          checked={selectedStep.enabled !== false}
                          onCheckedChange={(checked) => setSelectedStep({...selectedStep, enabled: checked})}
                        />
                        <Label htmlFor="enabled">Step enabled</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Select a step to configure</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Category:</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Steps:</span>
                      <span>{template.steps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Complexity:</span>
                      <Badge variant={template.complexity === 'High' ? 'destructive' : template.complexity === 'Medium' ? 'default' : 'secondary'}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Est. Time:</span>
                      <span>{template.estimatedTime}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.5%</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,295</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127h</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest bot execution history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rpaBots.slice(0, 5).map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{bot.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last run: {bot.lastRun ? new Date(bot.lastRun).toLocaleString() : 'Never'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={bot.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {bot.status}
                      </Badge>
                      <span className="text-sm font-medium">{bot.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RPA Settings</CardTitle>
              <CardDescription>Configure RPA system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-execution</Label>
                  <p className="text-sm text-muted-foreground">Allow bots to run automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Error notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications on bot failures</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Execution logging</Label>
                  <p className="text-sm text-muted-foreground">Log all bot executions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Performance monitoring</Label>
                  <p className="text-sm text-muted-foreground">Monitor bot performance metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Bot Dialog */}
      <Dialog open={showBotDialog} onOpenChange={setShowBotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bot</DialogTitle>
            <DialogDescription>
              Create a new RPA bot for process automation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter bot name"
              />
            </div>
            <div>
              <Label htmlFor="botDescription">Description</Label>
              <Textarea
                id="botDescription"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                placeholder="Enter bot description"
              />
            </div>
            <div>
              <Label htmlFor="botType">Bot Type</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Bot</SelectItem>
                  <SelectItem value="document_processing">Document Processing</SelectItem>
                  <SelectItem value="data_sync">Data Synchronization</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBotDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBot}>
              Create Bot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 