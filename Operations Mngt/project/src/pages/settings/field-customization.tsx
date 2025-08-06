import React, { useState, useEffect } from 'react';
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
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpDown, 
  Check, 
  Clock, 
  Code, 
  Download, 
  ExternalLink, 
  Filter, 
  Lock, 
  RefreshCw, 
  Save, 
  Search, 
  Settings, 
  Shield, 
  Sliders, 
  Webhook, 
  Zap,
  Plus,
  Trash2,
  Edit,
  Play,
  TestTube,
  Database,
  FileText,
  Users,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Globe,
  Mail,
  Bell,
  Key,
  Eye,
  EyeOff,
  Copy,
  Download as DownloadIcon,
  Upload,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Laptop,
  Camera,
  MapPin,
  Fingerprint,
  Battery,
  Signal,
  Cloud,
  CloudOff,
  Sync,
  CheckCircle2,
  XCircle2,
  AlertCircle2,
  Pause,
  Play as PlayIcon,
  Stop,
  RotateCcw,
  Settings as SettingsIcon,
  Info,
  HelpCircle,
  User,
  LogOut,
  Menu,
  Home,
  Search as SearchIcon,
  Notifications,
  MoreVertical,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  Image,
  File,
  Link,
  Map,
  Phone,
  Mail as MailIcon,
  Building,
  CreditCard,
  Tag,
  Star,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock,
  Copy as CopyIcon,
  CheckSquare,
  Square,
  Minus,
  GripVertical,
  Move,
  Layers,
  Palette,
  Layout,
  Grid,
  Columns,
  Rows,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Target,
  Zap as ZapIcon,
  Cpu,
  HardDrive,
  Network,
  Server,
  Database as DatabaseIcon,
  Folder,
  FileText as FileTextIcon,
  FilePlus,
  FileEdit,
  FileX,
  FileCheck,
  FileSearch,
  FileArchive,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FilePresentation,
  FilePdf,
  FileWord,
  FilePowerpoint,
  FileExcel,
  FileAccess,
  FileProject,
  FileVisio,
  FileOutlook,
  FileOneNote,
  FilePublisher,
  FileInfo,
  FileWarning,
  FileMinus,
  FilePlus2,
  FileX2,
  FileCheck2,
  FileSearch2,
  FileArchive2,
  FileImage2,
  FileVideo2,
  FileAudio2,
  FileCode2,
  FileSpreadsheet2,
  FilePresentation2,
  FilePdf2,
  FileWord2,
  FilePowerpoint2,
  FileExcel2,
  FileAccess2,
  FileProject2,
  FileVisio2,
  FileOutlook2,
  FileOneNote2,
  FilePublisher2,
  FileInfo2,
  FileWarning2,
  FileMinus2
} from 'lucide-react';

// Mock data for Field Customization
const mockEntities = [
  { value: 'suppliers', label: 'Suppliers', icon: Users, fields: 25 },
  { value: 'inventory', label: 'Inventory', icon: Package, fields: 18 },
  { value: 'orders', label: 'Orders', icon: ShoppingCart, fields: 22 },
  { value: 'customers', label: 'Customers', icon: User, fields: 15 },
  { value: 'contracts', label: 'Contracts', icon: FileText, fields: 20 },
  { value: 'procurement', label: 'Procurement', icon: FileText, fields: 16 },
  { value: 'quality', label: 'Quality', icon: TestTube, fields: 12 },
  { value: 'logistics', label: 'Logistics', icon: Truck, fields: 14 },
];

const mockFieldTypes = [
  { value: 'TEXT', label: 'Text', icon: Type, description: 'Single line text input' },
  { value: 'TEXTAREA', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
  { value: 'NUMBER', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
  { value: 'DECIMAL', label: 'Decimal', icon: Hash, description: 'Decimal number input' },
  { value: 'DATE', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'DATETIME', label: 'Date & Time', icon: Clock, description: 'Date and time picker' },
  { value: 'BOOLEAN', label: 'Boolean', icon: ToggleLeft, description: 'Yes/No checkbox' },
  { value: 'SELECT', label: 'Select', icon: List, description: 'Dropdown selection' },
  { value: 'MULTISELECT', label: 'Multi-Select', icon: List, description: 'Multiple choice selection' },
  { value: 'EMAIL', label: 'Email', icon: Mail, description: 'Email address input' },
  { value: 'PHONE', label: 'Phone', icon: Phone, description: 'Phone number input' },
  { value: 'URL', label: 'URL', icon: Link, description: 'Website URL input' },
  { value: 'FILE', label: 'File Upload', icon: File, description: 'File attachment' },
  { value: 'IMAGE', label: 'Image', icon: Image, description: 'Image upload' },
  { value: 'LOCATION', label: 'Location', icon: MapPin, description: 'Geographic location' },
  { value: 'CURRENCY', label: 'Currency', icon: DollarSign, description: 'Monetary amount' },
  { value: 'PERCENTAGE', label: 'Percentage', icon: Percent, description: 'Percentage value' },
  { value: 'RATING', label: 'Rating', icon: Star, description: 'Star rating' },
  { value: 'COLOR', label: 'Color', icon: Palette, description: 'Color picker' },
  { value: 'JSON', label: 'JSON', icon: Code, description: 'JSON data structure' },
  { value: 'REFERENCE', label: 'Reference', icon: Link, description: 'Reference to another entity' },
];

const mockCustomFields = [
  {
    id: 'cf-1',
    entity: 'suppliers',
    name: 'certification_level',
    label: 'Certification Level',
    type: 'SELECT',
    required: true,
    defaultValue: 'BASIC',
    options: ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    validation: {
      required: true,
      minLength: null,
      maxLength: null,
      pattern: null,
      min: null,
      max: null,
    },
    uiLocation: 'GENERAL_INFO',
    security: {
      visible: true,
      editable: true,
      roles: ['admin', 'procurement_manager'],
    },
    reporting: {
      includeInReports: true,
      sortable: true,
      filterable: true,
      aggregatable: false,
    },
    status: 'ACTIVE',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-14T15:30:00Z',
  },
  {
    id: 'cf-2',
    entity: 'inventory',
    name: 'shelf_life_days',
    label: 'Shelf Life (Days)',
    type: 'NUMBER',
    required: false,
    defaultValue: 365,
    options: null,
    validation: {
      required: false,
      minLength: null,
      maxLength: null,
      pattern: null,
      min: 1,
      max: 3650,
    },
    uiLocation: 'PRODUCT_DETAILS',
    security: {
      visible: true,
      editable: true,
      roles: ['admin', 'inventory_manager'],
    },
    reporting: {
      includeInReports: true,
      sortable: true,
      filterable: true,
      aggregatable: true,
    },
    status: 'ACTIVE',
    createdAt: '2023-06-05T14:20:00Z',
    updatedAt: '2023-06-12T09:15:00Z',
  },
  {
    id: 'cf-3',
    entity: 'orders',
    name: 'priority_level',
    label: 'Priority Level',
    type: 'SELECT',
    required: true,
    defaultValue: 'NORMAL',
    options: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    validation: {
      required: true,
      minLength: null,
      maxLength: null,
      pattern: null,
      min: null,
      max: null,
    },
    uiLocation: 'ORDER_DETAILS',
    security: {
      visible: true,
      editable: true,
      roles: ['admin', 'order_manager', 'customer_service'],
    },
    reporting: {
      includeInReports: true,
      sortable: true,
      filterable: true,
      aggregatable: false,
    },
    status: 'ACTIVE',
    createdAt: '2023-06-10T11:45:00Z',
    updatedAt: '2023-06-14T16:20:00Z',
  },
];

const mockUILocations = [
  { value: 'GENERAL_INFO', label: 'General Information' },
  { value: 'DETAILS', label: 'Details Section' },
  { value: 'ADDRESSES', label: 'Addresses Section' },
  { value: 'CONTACTS', label: 'Contacts Section' },
  { value: 'FINANCIAL', label: 'Financial Information' },
  { value: 'QUALITY', label: 'Quality Information' },
  { value: 'COMPLIANCE', label: 'Compliance Information' },
  { value: 'CUSTOM', label: 'Custom Section' },
];

const mockValidationRules = [
  { value: 'required', label: 'Required Field' },
  { value: 'email', label: 'Valid Email' },
  { value: 'url', label: 'Valid URL' },
  { value: 'phone', label: 'Valid Phone Number' },
  { value: 'min_length', label: 'Minimum Length' },
  { value: 'max_length', label: 'Maximum Length' },
  { value: 'min_value', label: 'Minimum Value' },
  { value: 'max_value', label: 'Maximum Value' },
  { value: 'pattern', label: 'Custom Pattern' },
  { value: 'unique', label: 'Unique Value' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF0000'];

export default function FieldCustomizationPage() {
  const [activeTab, setActiveTab] = useState('fields');
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  
  // New field form state
  const [newField, setNewField] = useState({
    entity: '',
    name: '',
    label: '',
    type: '',
    required: false,
    defaultValue: '',
    options: [] as string[],
    validation: {
      required: false,
      minLength: null,
      maxLength: null,
      pattern: null,
      min: null,
      max: null,
    },
    uiLocation: 'GENERAL_INFO',
    security: {
      visible: true,
      editable: true,
      roles: ['admin'],
    },
    reporting: {
      includeInReports: true,
      sortable: true,
      filterable: true,
      aggregatable: false,
    },
  });

  // Filter custom fields based on search and filters
  const filteredFields = mockCustomFields.filter(field => {
    const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         field.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || field.entity === entityFilter;
    const matchesType = typeFilter === 'all' || field.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || field.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesEntity && matchesType && matchesStatus;
  });

  // Add option to select field
  const addOption = () => {
    setNewField({
      ...newField,
      options: [...newField.options, '']
    });
  };

  // Remove option from select field
  const removeOption = (index: number) => {
    setNewField({
      ...newField,
      options: newField.options.filter((_, i) => i !== index)
    });
  };

  // Update option value
  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newField.options];
    updatedOptions[index] = value;
    setNewField({
      ...newField,
      options: updatedOptions
    });
  };

  // Save new field
  const saveField = () => {
    // Validation
    if (!newField.entity || !newField.name || !newField.label || !newField.type) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if field name is valid
    if (!/^[a-z_][a-z0-9_]*$/.test(newField.name)) {
      alert('Field name must be lowercase with underscores only');
      return;
    }

    // Check if field name already exists
    const existingField = mockCustomFields.find(f => f.entity === newField.entity && f.name === newField.name);
    if (existingField) {
      alert('A field with this name already exists for this entity');
      return;
    }

    // Save field logic here
    console.log('Saving field:', newField);
    
    // Reset form
    setNewField({
      entity: '',
      name: '',
      label: '',
      type: '',
      required: false,
      defaultValue: '',
      options: [],
      validation: {
        required: false,
        minLength: null,
        maxLength: null,
        pattern: null,
        min: null,
        max: null,
      },
      uiLocation: 'GENERAL_INFO',
      security: {
        visible: true,
        editable: true,
        roles: ['admin'],
      },
      reporting: {
        includeInReports: true,
        sortable: true,
        filterable: true,
        aggregatable: false,
      },
    });
    
    setShowNewFieldDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Customization</h1>
          <p className="text-muted-foreground">
            Add custom fields to standard entities to capture organization-specific data
          </p>
        </div>
        <Button onClick={() => setShowNewFieldDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Custom Field
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="entities" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Custom Fields Tab */}
        <TabsContent value="fields" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search custom fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {mockEntities.map(entity => (
                  <SelectItem key={entity.value} value={entity.value}>
                    {entity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mockFieldTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFields.map(field => (
              <Card key={field.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{field.label}</CardTitle>
                      <CardDescription className="text-sm">
                        {field.entity} • {field.name} • {field.type}
                      </CardDescription>
                    </div>
                    <Badge variant={field.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {field.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Required:</span>
                      <div className="font-medium">{field.required ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">UI Location:</span>
                      <div className="font-medium">{field.uiLocation}</div>
                    </div>
                  </div>
                  {field.options && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Options:</span>
                      <div className="font-medium">{field.options.join(', ')}</div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEntities.map(entity => (
              <Card key={entity.value} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <entity.icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{entity.label}</CardTitle>
                      <CardDescription>{entity.fields} fields</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Standard Fields:</span>
                      <span>{entity.fields - 3}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Custom Fields:</span>
                      <span>3</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Supplier Certification</CardTitle>
                <CardDescription>Standard supplier certification fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Certification Level (Select)</div>
                  <div>• Certification Date (Date)</div>
                  <div>• Expiry Date (Date)</div>
                  <div>• Certifying Body (Text)</div>
                </div>
                <Button className="w-full mt-4">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>Product specification fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Weight (Number)</div>
                  <div>• Dimensions (Text)</div>
                  <div>• Material (Select)</div>
                  <div>• Color (Color)</div>
                </div>
                <Button className="w-full mt-4">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Quality control fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Quality Score (Number)</div>
                  <div>• Inspection Date (Date)</div>
                  <div>• Inspector (Reference)</div>
                  <div>• Notes (Text Area)</div>
                </div>
                <Button className="w-full mt-4">Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields by Entity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockEntities.map(entity => ({
                        name: entity.label,
                        value: entity.fields,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {mockEntities.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Field Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFieldTypes.slice(0, 8).map(type => ({
                    type: type.label,
                    count: Math.floor(Math.random() * 20) + 1,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Field Dialog */}
      <Dialog open={showNewFieldDialog} onOpenChange={setShowNewFieldDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Field</DialogTitle>
            <DialogDescription>
              Add a new custom field to capture organization-specific data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entity">Entity *</Label>
                  <Select value={newField.entity} onValueChange={(value) => setNewField({ ...newField, entity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEntities.map(entity => (
                        <SelectItem key={entity.value} value={entity.value}>
                          {entity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Field Type *</Label>
                  <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFieldTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Field Name *</Label>
                  <Input
                    id="name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., certification_level"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use lowercase with underscores only
                  </p>
                </div>
                <div>
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., Certification Level"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                />
                <Label htmlFor="required">Required Field</Label>
              </div>
            </div>

            {/* Field Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Field Configuration</h3>
              <div>
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  value={newField.defaultValue}
                  onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                  placeholder="Default value for this field"
                />
              </div>
              
              {/* Options for Select/Multi-Select fields */}
              {(newField.type === 'SELECT' || newField.type === 'MULTISELECT') && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {newField.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}
            </div>

            {/* UI Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">UI Configuration</h3>
              <div>
                <Label htmlFor="uiLocation">UI Location</Label>
                <Select value={newField.uiLocation} onValueChange={(value) => setNewField({ ...newField, uiLocation: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUILocations.map(location => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={newField.security.visible}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      security: { ...newField.security, visible: checked }
                    })}
                  />
                  <Label htmlFor="visible">Visible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editable"
                    checked={newField.security.editable}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      security: { ...newField.security, editable: checked }
                    })}
                  />
                  <Label htmlFor="editable">Editable</Label>
                </div>
              </div>
            </div>

            {/* Reporting Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Reporting Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeInReports"
                    checked={newField.reporting.includeInReports}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      reporting: { ...newField.reporting, includeInReports: checked }
                    })}
                  />
                  <Label htmlFor="includeInReports">Include in Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sortable"
                    checked={newField.reporting.sortable}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      reporting: { ...newField.reporting, sortable: checked }
                    })}
                  />
                  <Label htmlFor="sortable">Sortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="filterable"
                    checked={newField.reporting.filterable}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      reporting: { ...newField.reporting, filterable: checked }
                    })}
                  />
                  <Label htmlFor="filterable">Filterable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aggregatable"
                    checked={newField.reporting.aggregatable}
                    onCheckedChange={(checked) => setNewField({
                      ...newField,
                      reporting: { ...newField.reporting, aggregatable: checked }
                    })}
                  />
                  <Label htmlFor="aggregatable">Aggregatable</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => setShowNewFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveField}>
              <Save className="h-4 w-4 mr-2" />
              Save Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 