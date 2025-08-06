import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Target,
  Users,
  Building,
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  BarChart3,
  TrendingUp,
  Map,
  Globe,
  Link,
  Unlink,
  Plus,
  Minus,
  Maximize,
  Minimize,
  RefreshCw,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  RotateCcw as RotateCcwIcon,
  Save,
  Edit,
  Trash2,
  Copy,
  Move,
  GripVertical,
  Lock,
  Unlock,
  Shield,
  Key,
  Bell,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
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
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderPlus,
  FolderMinus,
  FileText,
  FilePlus,
  FileMinus,
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

// Mock data for knowledge graph entities and relationships
const mockEntities = [
  {
    id: 'supplier-1',
    name: 'ABC Manufacturing',
    type: 'supplier',
    category: 'Electronics',
    riskScore: 0.15,
    performance: 92,
    location: 'China',
    connections: 8,
    status: 'active'
  },
  {
    id: 'supplier-2',
    name: 'XYZ Components',
    type: 'supplier',
    category: 'Raw Materials',
    riskScore: 0.25,
    performance: 87,
    location: 'India',
    connections: 12,
    status: 'active'
  },
  {
    id: 'customer-1',
    name: 'Global Retail Corp',
    type: 'customer',
    category: 'Retail',
    riskScore: 0.08,
    performance: 95,
    location: 'USA',
    connections: 15,
    status: 'active'
  },
  {
    id: 'product-1',
    name: 'Smartphone Model X',
    type: 'product',
    category: 'Electronics',
    riskScore: 0.12,
    performance: 89,
    location: 'Global',
    connections: 6,
    status: 'active'
  },
  {
    id: 'warehouse-1',
    name: 'Central Distribution',
    type: 'warehouse',
    category: 'Logistics',
    riskScore: 0.05,
    performance: 98,
    location: 'Netherlands',
    connections: 20,
    status: 'active'
  }
];

const mockRelationships = [
  {
    id: 'rel-1',
    source: 'supplier-1',
    target: 'product-1',
    type: 'supplies',
    strength: 0.9,
    volume: 50000,
    frequency: 'weekly'
  },
  {
    id: 'rel-2',
    source: 'supplier-2',
    target: 'product-1',
    type: 'supplies',
    strength: 0.7,
    volume: 25000,
    frequency: 'bi-weekly'
  },
  {
    id: 'rel-3',
    source: 'product-1',
    target: 'customer-1',
    type: 'sold_to',
    strength: 0.8,
    volume: 30000,
    frequency: 'monthly'
  },
  {
    id: 'rel-4',
    source: 'warehouse-1',
    target: 'product-1',
    type: 'stores',
    strength: 0.95,
    volume: 100000,
    frequency: 'daily'
  },
  {
    id: 'rel-5',
    source: 'warehouse-1',
    target: 'customer-1',
    type: 'ships_to',
    strength: 0.85,
    volume: 30000,
    frequency: 'weekly'
  }
];

// Network analysis metrics
const networkMetrics = {
  totalEntities: 156,
  totalRelationships: 342,
  averageConnections: 4.4,
  networkDensity: 0.28,
  centralEntities: 12,
  isolatedEntities: 8,
  riskClusters: 3,
  performanceClusters: 5
};

export default function KnowledgeGraph() {
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('');
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy' | 'matrix'>('network');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEntityDialog, setShowEntityDialog] = useState(false);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [highlightMode, setHighlightMode] = useState<'risk' | 'performance' | 'connections'>('risk');

  const handleEntityClick = (entityId: string) => {
    setSelectedEntity(entityId);
  };

  const handleRelationshipClick = (relationshipId: string) => {
    setSelectedRelationship(relationshipId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
  };

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    console.log(`Exporting knowledge graph as ${format}`);
  };

  const currentEntity = mockEntities.find(e => e.id === selectedEntity);
  const currentRelationship = mockRelationships.find(r => r.id === selectedRelationship);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Graph</h1>
          <p className="text-muted-foreground">
            Visualize supply chain entities and relationships for network analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label>Auto-refresh</Label>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Network Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkMetrics.totalEntities}</div>
            <p className="text-xs text-muted-foreground">Active entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkMetrics.totalRelationships}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Network Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(networkMetrics.networkDensity * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Connection density</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkMetrics.riskClusters}</div>
            <p className="text-xs text-muted-foreground">High-risk groups</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visualization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualization">Network Visualization</TabsTrigger>
          <TabsTrigger value="analysis">Network Analysis</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Visualization Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="viewMode">View Mode</Label>
                    <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="network">Network View</SelectItem>
                        <SelectItem value="hierarchy">Hierarchy View</SelectItem>
                        <SelectItem value="matrix">Matrix View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterType">Entity Filter</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        <SelectItem value="suppliers">Suppliers</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                        <SelectItem value="warehouses">Warehouses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="highlightMode">Highlight Mode</Label>
                    <Select value={highlightMode} onValueChange={(value: any) => setHighlightMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="risk">Risk Level</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="connections">Connection Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Display Options</Label>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Show Labels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Show Weights</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label className="text-sm">Animate</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Network Visualization Canvas */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Network Graph</CardTitle>
                  <CardDescription>Interactive visualization of supply chain relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Network visualization canvas</p>
                      <p className="text-sm text-muted-foreground">Interactive graph showing entities and relationships</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Centrality Analysis</CardTitle>
                <CardDescription>Most connected and influential entities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEntities.slice(0, 5).map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{entity.name}</div>
                          <div className="text-sm text-muted-foreground">{entity.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{entity.connections}</div>
                        <div className="text-sm text-muted-foreground">connections</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Clusters</CardTitle>
                <CardDescription>Entities grouped by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEntities.slice(0, 5).map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entity.riskScore > 0.2 ? 'bg-red-500' : 
                          entity.riskScore > 0.1 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{entity.name}</div>
                          <div className="text-sm text-muted-foreground">{entity.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{(entity.riskScore * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">risk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="warehouse">Warehouses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowEntityDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEntities.map((entity) => (
              <Card 
                key={entity.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedEntity === entity.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleEntityClick(entity.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entity.name}</CardTitle>
                    <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
                      {entity.status}
                    </Badge>
                  </div>
                  <CardDescription>{entity.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline">{entity.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Score:</span>
                      <span className={`font-medium ${
                        entity.riskScore > 0.2 ? 'text-red-600' : 
                        entity.riskScore > 0.1 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(entity.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance:</span>
                      <span className="font-medium">{entity.performance}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Connections:</span>
                      <span className="font-medium">{entity.connections}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Location:</span>
                      <span>{entity.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search relationships..."
                className="w-64"
              />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="sold_to">Sold To</SelectItem>
                  <SelectItem value="stores">Stores</SelectItem>
                  <SelectItem value="ships_to">Ships To</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowRelationshipDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </div>

          <div className="space-y-3">
            {mockRelationships.map((relationship) => (
              <Card 
                key={relationship.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedRelationship === relationship.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleRelationshipClick(relationship.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">
                        {mockEntities.find(e => e.id === relationship.source)?.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <Badge variant="outline">{relationship.type}</Badge>
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                      </div>
                      <div className="text-sm font-medium">
                        {mockEntities.find(e => e.id === relationship.target)?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="ml-1 font-medium">{(relationship.strength * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-1 font-medium">{relationship.volume.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="ml-1 font-medium">{relationship.frequency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Insights</CardTitle>
                <CardDescription>Key findings from network analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">High-Risk Supplier Cluster</div>
                      <div className="text-sm text-muted-foreground">
                        3 suppliers in electronics category show elevated risk scores
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Strong Performance Hub</div>
                      <div className="text-sm text-muted-foreground">
                        Central warehouse shows excellent performance and connectivity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Supply Chain Bottleneck</div>
                      <div className="text-sm text-muted-foreground">
                        Single supplier dependency identified for critical component
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions based on analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Diversify Supplier Base</div>
                    <div className="text-sm text-muted-foreground">
                      Add backup suppliers for high-risk electronics category
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Strengthen Relationships</div>
                    <div className="text-sm text-muted-foreground">
                      Invest in relationship building with top-performing suppliers
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Monitor Risk Clusters</div>
                    <div className="text-sm text-muted-foreground">
                      Implement enhanced monitoring for identified risk groups
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entity Details Dialog */}
      <Dialog open={showEntityDialog} onOpenChange={setShowEntityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Entity</DialogTitle>
            <DialogDescription>
              Add a new entity to the knowledge graph
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="entityName">Entity Name</Label>
              <Input id="entityName" placeholder="Enter entity name" />
            </div>
            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entityCategory">Category</Label>
              <Input id="entityCategory" placeholder="Enter category" />
            </div>
            <div>
              <Label htmlFor="entityLocation">Location</Label>
              <Input id="entityLocation" placeholder="Enter location" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEntityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEntityDialog(false)}>
              Add Entity
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Relationship Details Dialog */}
      <Dialog open={showRelationshipDialog} onOpenChange={setShowRelationshipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Relationship</DialogTitle>
            <DialogDescription>
              Create a new relationship between entities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sourceEntity">Source Entity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source entity" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="relationshipType">Relationship Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="sold_to">Sold To</SelectItem>
                  <SelectItem value="stores">Stores</SelectItem>
                  <SelectItem value="ships_to">Ships To</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetEntity">Target Entity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target entity" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="relationshipStrength">Relationship Strength</Label>
              <Input 
                id="relationshipStrength" 
                type="number" 
                min="0" 
                max="1" 
                step="0.1" 
                placeholder="0.0 - 1.0" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRelationshipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRelationshipDialog(false)}>
              Add Relationship
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 