import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isAfter } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ArrowLeft, Edit, Building2, FileText, AlertTriangle, CheckCircle, XCircle, BarChart4, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'destructive',
  DISQUALIFIED: 'destructive',
} as const;

const riskLevelColors = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'destructive',
  CRITICAL: 'destructive',
} as const;

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useSupplier, useUpdateSupplier } = useSuppliers();

  const { data: supplier, isLoading } = useSupplier(id!);
  const { mutate: updateSupplier, isLoading: isUpdating } = useUpdateSupplier();

  if (isLoading || !supplier) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/suppliers/${supplier.id}/edit`);
  };

  const handleStatusChange = (newStatus: typeof supplier.status) => {
    confirm(() => {
      updateSupplier({
        id: supplier.id,
        data: { status: newStatus }
      });
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/suppliers')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {supplier.code} • {supplier.type.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[supplier.status]} className="h-6 px-3 text-sm">
              {supplier.status.replace('_', ' ')}
            </Badge>
            {supplier.riskAssessment && (
              <Badge variant={riskLevelColors[supplier.riskAssessment.overallRiskLevel]} className="h-6 px-3 text-sm">
                {supplier.riskAssessment.overallRiskLevel} RISK
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="qualification">Qualification</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tax ID</h3>
                  <p className="mt-1">{supplier.taxId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                  <p className="mt-1">{supplier.registrationNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Industry</h3>
                  <p className="mt-1">{supplier.industry || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Year Established</h3>
                  <p className="mt-1">{supplier.yearEstablished || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Annual Revenue</h3>
                  <p className="mt-1">{supplier.annualRevenue ? `$${supplier.annualRevenue.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Employee Count</h3>
                  <p className="mt-1">{supplier.employeeCount?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                  <p className="mt-1">
                    {supplier.website ? (
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                        {supplier.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Onboarding Date</h3>
                  <p className="mt-1">{supplier.onboardingDate ? format(new Date(supplier.onboardingDate), 'PP') : format(new Date(supplier.createdAt), 'PP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Terms</h3>
                  <p className="mt-1">{supplier.paymentTerms || '-'}</p>
                </div>
              </div>

              {supplier.description && (
                <div className="border-t p-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{supplier.description}</p>
                </div>
              )}

              <div className="border-t p-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {supplier.businessClassifications && (
                <div className="border-t p-6">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Business Classifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.businessClassifications.map((classification, index) => (
                      <Badge key={index} variant="outline">
                        {classification.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h3 className="mb-4 font-semibold">Addresses</h3>
                  <div className="space-y-4">
                    {supplier.addresses.map((address, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{address.type.replace('_', ' ')}</h4>
                          {address.isPrimary && <Badge>Primary</Badge>}
                        </div>
                        <p className="text-sm">
                          {address.street}<br />
                          {address.city}, {address.state} {address.postalCode}<br />
                          {address.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {supplier.bankInformation && (
                <div className="rounded-lg border bg-card">
                  <div className="p-6">
                    <h3 className="mb-4 font-semibold">Banking Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Bank Name:</span>
                        <span className="ml-2">{supplier.bankInformation.bankName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Account Name:</span>
                        <span className="ml-2">{supplier.bankInformation.accountName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Account Number:</span>
                        <span className="ml-2">••••{supplier.bankInformation.accountNumber.slice(-4)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Routing Number:</span>
                        <span className="ml-2">••••{supplier.bankInformation.routingNumber.slice(-4)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Currency:</span>
                        <span className="ml-2">{supplier.bankInformation.currency}</span>
                      </div>
                      {supplier.bankInformation.swiftCode && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">SWIFT Code:</span>
                          <span className="ml-2">{supplier.bankInformation.swiftCode}</span>
                        </div>
                      )}
                      {supplier.bankInformation.iban && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">IBAN:</span>
                          <span className="ml-2">{supplier.bankInformation.iban}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="mb-4 font-semibold">Contacts</h3>
                <div className="space-y-4">
                  {supplier.contacts.map((contact) => (
                    <div key={contact.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{contact.firstName} {contact.lastName}</h4>
                        {contact.isPrimary && <Badge>Primary Contact</Badge>}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Title:</span>
                          <span className="ml-2">{contact.title}</span>
                        </div>
                        {contact.department && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Department:</span>
                            <span className="ml-2">{contact.department}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Email:</span>
                          <span className="ml-2">
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                              {contact.email}
                            </a>
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                          <span className="ml-2">
                            <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                              {contact.phone}
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Documents</h3>
                  <Button size="sm" onClick={() => navigate(`/suppliers/${supplier.id}/documents/upload`)}>
                    Upload Document
                  </Button>
                </div>
                <div className="space-y-4">
                  {supplier.documents.length > 0 ? (
                    supplier.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{document.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {document.type.replace('_', ' ')} • Uploaded {format(new Date(document.uploadedAt), 'PP')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.expiryDate && (
                            <Badge variant={
                              new Date(document.expiryDate) < new Date() ? 'destructive' : 
                              new Date(document.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'warning' : 
                              'outline'
                            }>
                              {new Date(document.expiryDate) < new Date() ? 'Expired' : 
                               new Date(document.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' : 
                               `Expires ${format(new Date(document.expiryDate), 'PP')}`}
                            </Badge>
                          )}
                          <Button variant="outline" size="sm" onClick={() => window.open(document.url, '_blank')}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {supplier.certifications && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h3 className="mb-4 font-semibold">Certifications</h3>
                  <div className="space-y-4">
                    {supplier.certifications.map((certification, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{certification.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Issued by {certification.issuer} • Valid from {format(new Date(certification.validFrom), 'PP')} to {format(new Date(certification.validTo), 'PP')}
                          </p>
                        </div>
                        {certification.documentUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(certification.documentUrl, '_blank')}>
                            View Certificate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qualification" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Qualification Status</h3>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/suppliers/${supplier.id}/qualification/new`)}
                    disabled={supplier.qualificationStatus === 'IN_PROGRESS' || supplier.qualificationStatus === 'QUALIFIED'}
                  >
                    {!supplier.qualificationStatus || supplier.qualificationStatus === 'NOT_STARTED' ? 'Start Qualification' : 'View Qualification'}
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`rounded-full p-3 ${
                    supplier.qualificationStatus === 'QUALIFIED' ? 'bg-green-100' : 
                    supplier.qualificationStatus === 'IN_PROGRESS' ? 'bg-amber-100' : 
                    supplier.qualificationStatus === 'DISQUALIFIED' ? 'bg-red-100' : 
                    'bg-gray-100'
                  }`}>
                    {supplier.qualificationStatus === 'QUALIFIED' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : supplier.qualificationStatus === 'IN_PROGRESS' ? (
                      <BarChart4 className="h-6 w-6 text-amber-600" />
                    ) : supplier.qualificationStatus === 'DISQUALIFIED' ? (
                      <XCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {supplier.qualificationStatus === 'QUALIFIED' ? 'Qualified Supplier' : 
                       supplier.qualificationStatus === 'IN_PROGRESS' ? 'Qualification In Progress' : 
                       supplier.qualificationStatus === 'DISQUALIFIED' ? 'Disqualified Supplier' : 
                       'Qualification Not Started'}
                    </p>
                    {supplier.qualificationScore && (
                      <p className="text-sm text-muted-foreground">
                        Qualification Score: {supplier.qualificationScore}/100
                      </p>
                    )}
                    {supplier.qualificationDate && (
                      <p className="text-sm text-muted-foreground">
                        Qualified on {format(new Date(supplier.qualificationDate), 'PP')}
                      </p>
                    )}
                  </div>
                </div>

                {!supplier.qualificationStatus || supplier.qualificationStatus === 'NOT_STARTED' ? (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-muted-foreground">Qualification process has not been started for this supplier.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate(`/suppliers/${supplier.id}/qualification/new`)}
                    >
                      Start Qualification
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Risk Assessment</h3>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/suppliers/${supplier.id}/risk-assessment/new`)}
                    disabled={supplier.riskAssessment && new Date(supplier.riskAssessment.nextAssessmentDate) > new Date()}
                  >
                    {supplier.riskAssessment ? 'New Assessment' : 'Assess Risk'}
                  </Button>
                </div>
                
                {supplier.riskAssessment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-3 ${
                        supplier.riskAssessment.overallRiskLevel === 'LOW' ? 'bg-green-100' : 
                        supplier.riskAssessment.overallRiskLevel === 'MEDIUM' ? 'bg-amber-100' : 
                        supplier.riskAssessment.overallRiskLevel === 'HIGH' ? 'bg-red-100' : 
                        'bg-red-100'
                      }`}>
                        {supplier.riskAssessment.overallRiskLevel === 'LOW' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : supplier.riskAssessment.overallRiskLevel === 'MEDIUM' ? (
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {supplier.riskAssessment.overallRiskLevel} Risk Supplier
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last assessed on {format(new Date(supplier.riskAssessment.lastAssessmentDate), 'PP')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Next assessment due on {format(new Date(supplier.riskAssessment.nextAssessmentDate), 'PP')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Risk Categories</h4>
                      {supplier.riskAssessment.categories.map((category, index) => (
                        <div key={index} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{category.category.replace('_', ' ')}</p>
                            <Badge variant={
                              category.riskLevel === 'LOW' ? 'success' : 
                              category.riskLevel === 'MEDIUM' ? 'warning' : 
                              'destructive'
                            }>
                              {category.riskLevel}
                            </Badge>
                          </div>
                          {category.mitigationPlan && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Mitigation: </span>
                              {category.mitigationPlan}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/suppliers/${supplier.id}/risk-assessment`)}
                    >
                      View Full Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-muted-foreground">No risk assessment has been performed for this supplier.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate(`/suppliers/${supplier.id}/risk-assessment/new`)}
                    >
                      Perform Risk Assessment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="development" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Development Plans</h3>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/suppliers/${supplier.id}/development/new`)}
                  >
                    Create Development Plan
                  </Button>
                </div>
                
                {supplier.developmentPlans && supplier.developmentPlans.length > 0 ? (
                  <div className="space-y-4">
                    {supplier.developmentPlans.map((plan) => (
                      <div key={plan.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{plan.title}</h4>
                          <Badge variant={
                            plan.status === 'COMPLETED' ? 'success' : 
                            plan.status === 'IN_PROGRESS' ? 'warning' : 
                            'default'
                          }>
                            {plan.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{plan.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Area: </span>
                            <span className="text-sm">{plan.area.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Progress: </span>
                            <span className="text-sm">{plan.progress}%</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Start: </span>
                            <span className="text-sm">{format(new Date(plan.startDate), 'PP')}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Target: </span>
                            <span className="text-sm">{format(new Date(plan.targetDate), 'PP')}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/suppliers/${supplier.id}/development/${plan.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-muted-foreground">No development plans have been created for this supplier.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate(`/suppliers/${supplier.id}/development/new`)}
                    >
                      Create Development Plan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Performance Metrics</h3>
                
                {supplier.performance ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Quality</p>
                        <p className="text-2xl font-bold">{supplier.performance.qualityScore}</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="text-2xl font-bold">{supplier.performance.deliveryScore}</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-2xl font-bold">{supplier.performance.costScore}</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Overall</p>
                        <p className="text-2xl font-bold">{supplier.performance.overallScore}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-right">
                      Last updated: {format(new Date(supplier.performance.lastUpdated), 'PP')}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/suppliers/${supplier.id}/performance`)}
                    >
                      View Detailed Performance
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-muted-foreground">No performance data available for this supplier.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate(`/suppliers/${supplier.id}/performance/new`)}
                    >
                      Add Performance Data
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          {supplier.status === 'DRAFT' && (
            <Button onClick={() => handleStatusChange('PENDING_APPROVAL')}>
              Submit for Approval
            </Button>
          )}
          
          {supplier.status === 'PENDING_APPROVAL' && (
            <>
              <Button onClick={() => handleStatusChange('APPROVED')}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => handleStatusChange('DISQUALIFIED')}>
                Reject
              </Button>
            </>
          )}
          
          {supplier.status === 'APPROVED' && (
            <Button onClick={() => handleStatusChange('ACTIVE')}>
              Activate
            </Button>
          )}
          
          {supplier.status === 'ACTIVE' && (
            <Button variant="destructive" onClick={() => handleStatusChange('INACTIVE')}>
              Deactivate
            </Button>
          )}
          
          {supplier.status === 'INACTIVE' && (
            <Button onClick={() => handleStatusChange('ACTIVE')}>
              Reactivate
            </Button>
          )}
          
          {supplier.status === 'SUSPENDED' && (
            <Button onClick={() => handleStatusChange('ACTIVE')}>
              Unsuspend
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Continue"
        onConfirm={onConfirm}
      />
    </div>
  );
}

export default SupplierDetail;