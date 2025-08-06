import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRfx } from '@/hooks/useRfx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  RefreshCw, 
  Edit, 
  FileText, 
  Download, 
  Printer, 
  Mail,
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Package,
  DollarSign,
  Calendar,
  User,
  Building,
  MessageSquare,
  History,
  Copy,
  ExternalLink,
  BarChart3,
  Users,
  Award,
  Target
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-yellow-100 text-yellow-800',
  EVALUATED: 'bg-purple-100 text-purple-800',
  AWARDED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  DRAFT: FileText,
  PUBLISHED: Mail,
  OPEN: CheckCircle,
  CLOSED: Clock,
  EVALUATED: BarChart3,
  AWARDED: Award,
  CANCELLED: AlertCircle,
};

const RFX_TYPE_LABELS = {
  RFI: 'Request for Information',
  RFP: 'Request for Proposal',
  RFQ: 'Request for Quotation',
};

export default function RfxDetail() {
  const { rfxId } = useParams<{ rfxId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  // Fetch RFX data
  const { 
    useRfxDetail,
    useUpdateRfxStatus,
    useAddRfxNote
  } = useRfx();
  
  const { 
    data: rfx, 
    isLoading, 
    error, 
    refetch 
  } = useRfxDetail(rfxId!);
  
  const updateStatusMutation = useUpdateRfxStatus();
  const addNoteMutation = useAddRfxNote();

  if (!rfxId) {
    return <div>Invalid RFX ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading RFX details...</span>
        </div>
      </div>
    );
  }

  if (error || !rfx) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load RFX details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[rfx.status];

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await addNoteMutation.mutateAsync({
        id: rfx.id,
        note: noteContent,
      });
      setNoteContent('');
      setShowNoteDialog(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: rfx.id,
        status: newStatus,
      });
      toast.success(`RFX status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const daysUntilClose = Math.ceil((new Date(rfx.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const responseRate = rfx.responses ? (rfx.responses.length / rfx.selectedSuppliers.length) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/procurement/rfx')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RFX
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{rfx.title}</h1>
            <p className="text-muted-foreground">
              {RFX_TYPE_LABELS[rfx.type]} • Created {format(parseISO(rfx.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/procurement/rfx/${rfx.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`border-l-4 ${
        rfx.status === 'AWARDED' ? 'border-l-green-500 bg-green-50' :
        rfx.status === 'CANCELLED' ? 'border-l-red-500 bg-red-50' :
        rfx.status === 'OPEN' ? 'border-l-green-500 bg-green-50' :
        rfx.status === 'CLOSED' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription>
          This RFX is currently <strong>{rfx.status.toLowerCase()}</strong>
          {daysUntilClose > 0 && rfx.status === 'OPEN' && (
            <span> • Closes in {daysUntilClose} days</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    RFX Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">RFX ID</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rfx.rfxNumber}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(rfx.rfxNumber)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={STATUS_COLORS[rfx.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {rfx.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="secondary">{rfx.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{rfx.currency}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Publish Date</p>
                      <p className="font-medium">{format(parseISO(rfx.publishDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Close Date</p>
                      <p className="font-medium">{format(parseISO(rfx.closeDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className={`font-medium ${daysUntilClose < 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {daysUntilClose > 0 ? `${daysUntilClose} days` : 'Closed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={responseRate} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{responseRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {rfx.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="mt-1">{rfx.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Invited Suppliers</p>
                        <p className="text-2xl font-bold">{rfx.selectedSuppliers.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responses</p>
                        <p className="text-2xl font-bold">{rfx.responses?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sections</p>
                        <p className="text-2xl font-bold">{rfx.sections.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rfx.status === 'DRAFT' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('PUBLISHED')}
                    >
                      Publish RFX
                    </Button>
                  )}
                  {rfx.status === 'PUBLISHED' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('OPEN')}
                    >
                      Open for Responses
                    </Button>
                  )}
                  {rfx.status === 'OPEN' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('CLOSED')}
                    >
                      Close RFX
                    </Button>
                  )}
                  {rfx.status === 'CLOSED' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('EVALUATED')}
                    >
                      Mark as Evaluated
                    </Button>
                  )}
                  <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                          Add a note to this RFX
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="note">Note</Label>
                          <Textarea
                            id="note"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Enter your note here..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNoteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddNote}
                            disabled={addNoteMutation.isPending || !noteContent.trim()}
                          >
                            {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Published</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(rfx.publishDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${daysUntilClose > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium">Closes</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(rfx.closeDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  {rfx.settings.questionDeadline && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Question Deadline</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(rfx.settings.questionDeadline), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Late Submissions</span>
                    <Badge variant={rfx.settings.allowLateSubmissions ? 'default' : 'secondary'}>
                      {rfx.settings.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Supplier Questions</span>
                    <Badge variant={rfx.settings.allowSupplierQuestions ? 'default' : 'secondary'}>
                      {rfx.settings.allowSupplierQuestions ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">NDA Required</span>
                    <Badge variant={rfx.settings.requireNda ? 'destructive' : 'secondary'}>
                      {rfx.settings.requireNda ? 'Required' : 'Not Required'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Visible to All</span>
                    <Badge variant={rfx.settings.visibleToAllSuppliers ? 'default' : 'secondary'}>
                      {rfx.settings.visibleToAllSuppliers ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFX Sections ({rfx.sections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rfx.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{section.title}</h4>
                      <Badge variant="outline">Section {section.order}</Badge>
                    </div>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                    )}
                    <div className="space-y-3">
                      {section.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-gray-50 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{question.text}</p>
                              {question.description && (
                                <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-3">
                              <Badge variant="outline" className="text-xs">
                                {question.format}
                              </Badge>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Options:</p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside">
                                {question.options.map((option, oIndex) => (
                                  <li key={oIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invited Suppliers ({rfx.selectedSuppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3">Supplier</th>
                      <th className="text-left py-3">Type</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Industry</th>
                      <th className="text-center py-3">Response</th>
                      <th className="text-right py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfx.selectedSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.code}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">{supplier.type}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {supplier.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <p className="text-sm">{supplier.industry || 'N/A'}</p>
                        </td>
                        <td className="py-3 text-center">
                          {rfx.responses?.some(r => r.supplierId === supplier.id) ? (
                            <Badge variant="default">Submitted</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Responses ({rfx.responses?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {rfx.responses && rfx.responses.length > 0 ? (
                <div className="space-y-4">
                  {rfx.responses.map((response, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{response.supplierName}</p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {format(parseISO(response.submittedAt), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default">Complete</Badge>
                          {response.score && (
                            <Badge variant="secondary">Score: {response.score}/100</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-medium">{rfx.currency} {response.totalValue?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Delivery Time</p>
                          <p className="font-medium">{response.deliveryTime} days</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Compare
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">No responses received yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evaluation & Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rfx.scoringCriteria ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Technical Weight</p>
                      <p className="text-2xl font-bold">{rfx.scoringCriteria.technicalWeight}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Commercial Weight</p>
                      <p className="text-2xl font-bold">{rfx.scoringCriteria.commercialWeight}%</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-3">Scoring Criteria</h4>
                    <div className="space-y-3">
                      {rfx.scoringCriteria.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{criterion.name}</p>
                            {criterion.description && (
                              <p className="text-sm text-muted-foreground">{criterion.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{criterion.weight}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">No scoring criteria defined</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rfx.history && rfx.history.length > 0 ? (
                  rfx.history.map((activity, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {format(parseISO(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                        </p>
                        {activity.note && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mt-2">No activity history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}