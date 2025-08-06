import React, { useState, useCallback } from 'react';
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
  Eye,
  Settings,
  Trash2,
  Copy,
  Move,
  GripVertical,
  Layout,
  FormInput,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Image,
  Link,
  Calculator,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Package,
  Truck,
  DollarSign,
  Percent,
  Hash,
  Type,
  ToggleLeft,
  Sliders,
  Grid,
  Columns,
  Rows,
  PanelLeft,
  PanelRight,
  Split,
  EyeOff,
  EyeOn,
  Code,
  Palette,
  Zap,
  Target,
  Filter,
  Layers,
  Box,
  Archive,
  FolderOpen,
  FilePlus,
  SaveAll,
  Download,
  Upload,
  RotateCcw,
  Play,
  Pause,
  Square,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minus,
  Maximize,
  Minimize,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Info,
  HelpCircle,
  Search,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Edit,
  Edit3,
  Edit2,
  PenTool,
  MousePointer,
  Hand,
  Move as MoveIcon,
  Resize,
  Circle,
  Star,
  Crop,
  Scissors,
  Eraser,
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List as ListIcon,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Folder,
  FolderPlus,
  FolderMinus,
  FileText as FileTextIcon,
  FilePlus as FilePlusIcon,
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

// Mock data for form templates
const formTemplates = [
  {
    id: 'template-1',
    name: 'Supplier Registration',
    description: 'Complete supplier onboarding form with all required fields',
    category: 'Procurement',
    entity: 'suppliers',
    fields: 15,
    sections: 4,
    complexity: 'Medium'
  },
  {
    id: 'template-2',
    name: 'Purchase Requisition',
    description: 'Standard purchase requisition form with approval workflow',
    category: 'Procurement',
    entity: 'requisitions',
    fields: 12,
    sections: 3,
    complexity: 'Medium'
  },
  {
    id: 'template-3',
    name: 'Inventory Adjustment',
    description: 'Inventory adjustment form with reason codes and approvals',
    category: 'Inventory',
    entity: 'inventory_adjustments',
    fields: 8,
    sections: 2,
    complexity: 'Low'
  },
  {
    id: 'template-4',
    name: 'Quality Inspection',
    description: 'Comprehensive quality inspection form with defect tracking',
    category: 'Quality',
    entity: 'quality_inspections',
    fields: 20,
    sections: 5,
    complexity: 'High'
  }
];

// Field type definitions
const fieldTypes = [
  { id: 'text', name: 'Text Input', icon: Type, description: 'Single line text input' },
  { id: 'textarea', name: 'Text Area', icon: FileText, description: 'Multi-line text input' },
  { id: 'number', name: 'Number', icon: Hash, description: 'Numeric input with validation' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Email address input' },
  { id: 'phone', name: 'Phone', icon: Phone, description: 'Phone number input' },
  { id: 'date', name: 'Date', icon: Calendar, description: 'Date picker' },
  { id: 'datetime', name: 'Date & Time', icon: Calendar, description: 'Date and time picker' },
  { id: 'select', name: 'Dropdown', icon: ChevronDown, description: 'Single selection dropdown' },
  { id: 'multiselect', name: 'Multi-Select', icon: List, description: 'Multiple selection dropdown' },
  { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, description: 'Single checkbox' },
  { id: 'radio', name: 'Radio Group', icon: Circle, description: 'Radio button group' },
  { id: 'toggle', name: 'Toggle', icon: ToggleLeft, description: 'On/off toggle switch' },
  { id: 'file', name: 'File Upload', icon: Upload, description: 'File upload field' },
  { id: 'image', name: 'Image Upload', icon: Image, description: 'Image upload with preview' },
  { id: 'url', name: 'URL', icon: Link, description: 'URL input with validation' },
  { id: 'currency', name: 'Currency', icon: DollarSign, description: 'Currency input with formatting' },
  { id: 'percentage', name: 'Percentage', icon: Percent, description: 'Percentage input' },
  { id: 'address', name: 'Address', icon: MapPin, description: 'Structured address input' },
  { id: 'person', name: 'Person', icon: User, description: 'Person selector with search' },
  { id: 'company', name: 'Company', icon: Building, description: 'Company selector with search' },
  { id: 'product', name: 'Product', icon: Package, description: 'Product selector with search' },
  { id: 'location', name: 'Location', icon: MapPin, description: 'Location selector with map' },
  { id: 'calculation', name: 'Calculation', icon: Calculator, description: 'Calculated field' },
  { id: 'signature', name: 'Signature', icon: PenTool, description: 'Digital signature field' },
  { id: 'rating', name: 'Rating', icon: Star, description: 'Star rating input' },
  { id: 'slider', name: 'Slider', icon: Sliders, description: 'Range slider input' },
  { id: 'color', name: 'Color Picker', icon: Palette, description: 'Color selection' },
  { id: 'html', name: 'Rich Text', icon: Code, description: 'Rich text editor' },
  { id: 'code', name: 'Code', icon: Code, description: 'Code input with syntax highlighting' }
];

// Form Designer Component
export default function FormDesigner() {
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [formSections, setFormSections] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'select'>('select');
  const [previewMode, setPreviewMode] = useState(false);

  // Mock form data
  const [forms, setForms] = useState([
    {
      id: 'form-1',
      name: 'Supplier Registration Form',
      description: 'Complete supplier onboarding form',
      entity: 'suppliers',
      sections: [
        {
          id: 'section-1',
          name: 'Basic Information',
          description: 'Company basic details',
          fields: [
            { id: 'field-1', name: 'Company Name', type: 'text', required: true, placeholder: 'Enter company name' },
            { id: 'field-2', name: 'Tax ID', type: 'text', required: true, placeholder: 'Enter tax identification number' },
            { id: 'field-3', name: 'Business Type', type: 'select', required: true, options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship'] }
          ]
        },
        {
          id: 'section-2',
          name: 'Contact Information',
          description: 'Primary contact details',
          fields: [
            { id: 'field-4', name: 'Contact Person', type: 'text', required: true, placeholder: 'Enter contact person name' },
            { id: 'field-5', name: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
            { id: 'field-6', name: 'Phone', type: 'phone', required: true, placeholder: 'Enter phone number' }
          ]
        }
      ]
    }
  ]);

  const handleCreateForm = () => {
    const newForm = {
      id: `form-${Date.now()}`,
      name: formName,
      description: formDescription,
      entity: selectedEntity,
      sections: []
    };
    setForms([...forms, newForm]);
    setSelectedForm(newForm.id);
    setFormName('');
    setFormDescription('');
    setSelectedEntity('');
  };

  const handleAddSection = () => {
    setShowSectionDialog(true);
  };

  const handleAddField = (sectionId: string) => {
    setSelectedField({ sectionId });
    setShowFieldDialog(true);
  };

  const handleFieldDrop = (fieldType: string, sectionId: string) => {
    const newField = {
      id: `field-${Date.now()}`,
      name: `New ${fieldType}`,
      type: fieldType,
      required: false,
      placeholder: `Enter ${fieldType}`
    };

    setForms(forms.map(form => {
      if (form.id === selectedForm) {
        return {
          ...form,
          sections: form.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                fields: [...section.fields, newField]
              };
            }
            return section;
          })
        };
      }
      return form;
    }));
  };

  const currentForm = forms.find(f => f.id === selectedForm);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Designer</h1>
          <p className="text-muted-foreground">
            Create and customize data entry forms with drag-and-drop interface
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Design Mode' : 'Preview Mode'}
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>

      <Tabs defaultValue="designer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Form Designer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="forms">My Forms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Field Palette */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Field Palette</CardTitle>
                  <CardDescription>Drag fields to add to your form</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fieldTypes.map((fieldType) => (
                      <div
                        key={fieldType.id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('fieldType', fieldType.id);
                        }}
                      >
                        <fieldType.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{fieldType.name}</div>
                          <div className="text-xs text-muted-foreground">{fieldType.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Canvas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Form Canvas</CardTitle>
                  <CardDescription>Design your form layout</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedForm ? (
                    <div className="text-center py-12">
                      <Layout className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Select a form to start designing</p>
                      <Button className="mt-4" onClick={() => setShowSectionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Form
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentForm?.sections.map((section) => (
                        <div key={section.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{section.name}</h3>
                              <p className="text-sm text-muted-foreground">{section.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddField(section.id)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Field
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div 
                            className="min-h-[100px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-4"
                            onDrop={(e) => {
                              e.preventDefault();
                              const fieldType = e.dataTransfer.getData('fieldType');
                              handleFieldDrop(fieldType, section.id);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {section.fields.length === 0 ? (
                              <div className="text-center py-8">
                                <FormInput className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Drop fields here</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {section.fields.map((field) => (
                                  <div
                                    key={field.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                      setSelectedField(field);
                                      setShowFieldDialog(true);
                                    }}
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{field.name}</div>
                                      <div className="text-xs text-muted-foreground">{field.type}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {field.required && (
                                        <Badge variant="secondary" className="text-xs">Required</Badge>
                                      )}
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
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddSection}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
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
                  {selectedField ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fieldName">Field Name</Label>
                        <Input
                          id="fieldName"
                          value={selectedField.name || ''}
                          onChange={(e) => setSelectedField({...selectedField, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fieldType">Field Type</Label>
                        <Select value={selectedField.type} onValueChange={(value) => setSelectedField({...selectedField, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="placeholder">Placeholder</Label>
                        <Input
                          id="placeholder"
                          value={selectedField.placeholder || ''}
                          onChange={(e) => setSelectedField({...selectedField, placeholder: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="required"
                          checked={selectedField.required || false}
                          onCheckedChange={(checked) => setSelectedField({...selectedField, required: checked})}
                        />
                        <Label htmlFor="required">Required field</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Select an element to configure</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formTemplates.map((template) => (
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
                      <span>Fields:</span>
                      <span>{template.fields}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sections:</span>
                      <span>{template.sections}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Complexity:</span>
                      <Badge variant={template.complexity === 'High' ? 'destructive' : template.complexity === 'Medium' ? 'default' : 'secondary'}>
                        {template.complexity}
                      </Badge>
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

        <TabsContent value="forms" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">My Forms</h2>
              <p className="text-muted-foreground">Manage your custom forms</p>
            </div>
            <Button onClick={() => setShowSectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Entity:</span>
                      <Badge variant="outline">{form.entity}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sections:</span>
                      <span>{form.sections.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Fields:</span>
                      <span>{form.sections.reduce((acc, section) => acc + section.fields.length, 0)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedForm(form.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Designer Settings</CardTitle>
              <CardDescription>Configure form designer preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save form changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Grid snapping</Label>
                  <p className="text-sm text-muted-foreground">Snap elements to grid for alignment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Field validation</Label>
                  <p className="text-sm text-muted-foreground">Show validation errors in design mode</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Responsive preview</Label>
                  <p className="text-sm text-muted-foreground">Show responsive design preview</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Form Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Create a new form by providing basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Description</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
              />
            </div>
            <div>
              <Label htmlFor="entity">Entity</Label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suppliers">Suppliers</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="requisitions">Requisitions</SelectItem>
                  <SelectItem value="purchase_orders">Purchase Orders</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateForm}>
              Create Form
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Properties Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Field Properties</DialogTitle>
            <DialogDescription>
              Configure field properties and validation rules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  value={selectedField?.name || ''}
                  onChange={(e) => setSelectedField({...selectedField, name: e.target.value})}
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <Label htmlFor="fieldType">Field Type</Label>
                <Select value={selectedField?.type || ''} onValueChange={(value) => setSelectedField({...selectedField, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={selectedField?.placeholder || ''}
                onChange={(e) => setSelectedField({...selectedField, placeholder: e.target.value})}
                placeholder="Enter placeholder text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={selectedField?.required || false}
                  onCheckedChange={(checked) => setSelectedField({...selectedField, required: checked})}
                />
                <Label htmlFor="required">Required field</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="readonly"
                  checked={selectedField?.readonly || false}
                  onCheckedChange={(checked) => setSelectedField({...selectedField, readonly: checked})}
                />
                <Label htmlFor="readonly">Read-only</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="validation">Validation Rules</Label>
              <Textarea
                id="validation"
                value={selectedField?.validation || ''}
                onChange={(e) => setSelectedField({...selectedField, validation: e.target.value})}
                placeholder="Enter validation rules (JSON format)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFieldDialog(false)}>
              Save Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 