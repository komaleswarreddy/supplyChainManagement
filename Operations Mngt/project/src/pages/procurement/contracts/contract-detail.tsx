import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts } from '@/hooks/useContracts';
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
  Shield,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/useToast';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-red-100 text-red-800',
  RENEWED: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
};

const STATUS_ICONS = {
  DRAFT: FileText,
  ACTIVE: CheckCircle,
  PENDING_APPROVAL: Clock,
  EXPIRED: AlertTriangle,
  TERMINATED: AlertCircle,
  RENEWED: Zap,
  SUSPENDED: AlertTriangle,
};

const CONTRACT_TYPE_LABELS = {
  PURCHASE: 'Purchase Agreement',
  SERVICE: 'Service Contract',
  FRAMEWORK: 'Framework Agreement',
  LEASE: 'Lease Agreement',
  MAINTENANCE: 'Maintenance Contract',
  LICENSE: 'License Agreement',
};

export default function ContractDetail() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  // Fetch contract data
  const { 
    useContractDetail,
    useUpdateContractStatus,
    useAddContractNote,
    useRenewContract
  } = useContracts();
  
  const { 
    data: contract, 
    isLoading, 
    error, 
    refetch 
  } = useContractDetail(contractId!);
  
  const updateStatusMutation = useUpdateContractStatus();
  const addNoteMutation = useAddContractNote();
  const renewContractMutation = useRenewContract();

  if (!contractId) {
    return <div>Invalid contract ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading contract details...</span>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contract details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[contract.status];
  const daysUntilExpiry = differenceInDays(new Date(contract.endDate), new Date());
  const contractProgress = Math.max(0, Math.min(100, 
    ((new Date().getTime() - new Date(contract.startDate).getTime()) / 
     (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime())) * 100
  ));

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await addNoteMutation.mutateAsync({
        id: contract.id,
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
        id: contract.id,
        status: newStatus,
      });
      toast.success(`Contract status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRenewContract = async () => {
    try {
      await renewContractMutation.mutateAsync({
        id: contract.id,
        newEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });
      toast.success('Contract renewed successfully');
    } catch (error) {
      console.error('Failed to renew contract:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/procurement/contracts')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contracts
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contract.title}</h1>
            <p className="text-muted-foreground">
              {CONTRACT_TYPE_LABELS[contract.type]} • {contract.contractNumber}
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
            onClick={() => navigate(`/procurement/contracts/${contract.id}/edit`)}
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
            Download
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`border-l-4 ${
        contract.status === 'ACTIVE' ? 'border-l-green-500 bg-green-50' :
        contract.status === 'EXPIRED' || contract.status === 'TERMINATED' ? 'border-l-red-500 bg-red-50' :
        contract.status === 'PENDING_APPROVAL' ? 'border-l-yellow-500 bg-yellow-50' :
        daysUntilExpiry <= 30 && contract.status === 'ACTIVE' ? 'border-l-orange-500 bg-orange-50' :
        'border-l-blue-500 bg-blue-50'
      }`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription>
          This contract is currently <strong>{contract.status.toLowerCase().replace('_', ' ')}</strong>
          {daysUntilExpiry > 0 && contract.status === 'ACTIVE' && (
            <span> • Expires in {daysUntilExpiry} days</span>
          )}
          {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && contract.status === 'ACTIVE' && (
            <span className="text-orange-600 font-semibold"> • Renewal required soon</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
                    Contract Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Contract Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contract.contractNumber}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(contract.contractNumber)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={STATUS_COLORS[contract.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {contract.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="secondary">{contract.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <Badge variant={contract.priority === 'HIGH' || contract.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                        {contract.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(parseISO(contract.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(parseISO(contract.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{Math.ceil(differenceInDays(new Date(contract.endDate), new Date(contract.startDate)) / 30)} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className={`font-medium ${daysUntilExpiry < 30 ? 'text-red-600' : 'text-green-600'}`}>
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contract Progress</p>
                    <div className="flex items-center gap-3">
                      <Progress value={contractProgress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{contractProgress.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  {contract.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="mt-1">{contract.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Contract Value:</span>
                      <span className="font-semibold">{contract.currency} {contract.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent to Date:</span>
                      <span>{contract.currency} {contract.spentAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-medium">
                        {contract.currency} {(contract.value - (contract.spentAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Utilization:</span>
                      <span className="font-semibold">
                        {contract.spentAmount ? ((contract.spentAmount / contract.value) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contract.status === 'DRAFT' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('PENDING_APPROVAL')}
                    >
                      Submit for Approval
                    </Button>
                  )}
                  {contract.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('ACTIVE')}
                      >
                        Activate Contract
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('DRAFT')}
                      >
                        Return to Draft
                      </Button>
                    </>
                  )}
                  {contract.status === 'ACTIVE' && daysUntilExpiry <= 90 && (
                    <Button 
                      className="w-full" 
                      onClick={handleRenewContract}
                    >
                      Renew Contract
                    </Button>
                  )}
                  {contract.status === 'ACTIVE' && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('SUSPENDED')}
                    >
                      Suspend Contract
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
                          Add a note to this contract
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

              {/* Supplier Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{contract.supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{contract.supplier.code}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>{contract.supplier.contactPerson || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{contract.supplier.email || 'N/A'}</span>
                    </div>
                    {contract.supplier.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>{contract.supplier.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Type</span>
                      <Badge variant="secondary">{contract.supplier.type}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <Badge variant={contract.supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {contract.supplier.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View Supplier Details
                  </Button>
                </CardContent>
              </Card>

              {/* Renewal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Renewal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto Renewal</span>
                    <Badge variant={contract.autoRenew ? 'default' : 'secondary'}>
                      {contract.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Renewal Type</span>
                    <Badge variant="outline">{contract.renewalType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notification</p>
                    <p className="text-sm font-medium">{contract.renewalNotificationDays} days before expiry</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period</p>
                    <p className="text-sm font-medium">{contract.noticePeriodDays} days</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">{contract.paymentTerms || 'Net 30'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Terms</p>
                    <p className="font-medium">{contract.deliveryTerms || 'FOB Destination'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty Period</p>
                    <p className="font-medium">{contract.warrantyPeriod || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Level</p>
                    <p className="font-medium">{contract.serviceLevel || 'Standard'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Penalty Clauses</p>
                    <p className="font-medium">{contract.penaltyClauses ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Termination Clause</p>
                    <p className="font-medium">{contract.terminationClause ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Force Majeure</p>
                    <p className="font-medium">{contract.forceMajeureClause ? 'Included' : 'Not Included'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidentiality</p>
                    <p className="font-medium">{contract.confidentialityClause ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
              </div>
              
              {contract.terms && contract.terms.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Specific Terms</h4>
                    <div className="space-y-3">
                      {contract.terms.map((term, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <p className="font-medium">{term.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{term.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Tab */}
        <TabsContent value="supplier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{contract.supplier.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier Code</p>
                    <p className="font-medium">{contract.supplier.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary">{contract.supplier.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={contract.supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {contract.supplier.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium">{contract.supplier.taxId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{contract.supplier.registrationNumber}</p>
                  </div>
                  {contract.supplier.website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a 
                        href={contract.supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {contract.supplier.website}
                      </a>
                    </div>
                  )}
                  {contract.supplier.industry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{contract.supplier.industry}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Contract Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.performance ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{contract.performance.onTimeDelivery}%</p>
                      <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{contract.performance.qualityScore}%</p>
                      <p className="text-sm text-muted-foreground">Quality Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{contract.performance.complianceScore}%</p>
                      <p className="text-sm text-muted-foreground">Compliance Score</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Performance Indicators</h4>
                    <div className="space-y-3">
                      {contract.performance.kpis?.map((kpi, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{kpi.name}</p>
                            <p className="text-sm text-muted-foreground">{kpi.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{kpi.value}</p>
                            <p className="text-sm text-muted-foreground">Target: {kpi.target}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.documents && contract.documents.length > 0 ? (
                <div className="space-y-4">
                  {contract.documents.map((document, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.type} • {document.size} • Uploaded {format(parseISO(document.uploadedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">No documents attached</p>
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
                {contract.history && contract.history.length > 0 ? (
                  contract.history.map((activity, index) => (
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