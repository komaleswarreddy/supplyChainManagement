import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useContract } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading, error } = useContract(id!);

  if (isLoading) return <div>Loading contract...</div>;
  if (error) return <div>Error loading contract: {error.message}</div>;
  if (!contract) return <div>Contract not found</div>;

  const daysUntilExpiry = contract.end_date ? 
    Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  const contractProgress = contract.start_date && contract.end_date ? 
    Math.min(100, Math.max(0, ((new Date().getTime() - new Date(contract.start_date).getTime()) / 
    (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime())) * 100)) : 
    0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contracts
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{contract.title}</h1>
          <p className="text-muted-foreground">Contract #: {contract.contract_number}</p>
        </div>
        <Button onClick={() => navigate(`/contracts/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{contract.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        contract.status === 'active' ? 'default' : 
                        contract.status === 'expired' ? 'destructive' : 'secondary'
                      }
                    >
                      {contract.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                  <div className="mt-1 font-medium">{formatCurrency(contract.total_value || 0)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <div className="mt-1">{contract.currency || 'USD'}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-1 text-sm">{contract.description || 'No description provided'}</div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <div className="mt-1 text-sm">
                    {contract.start_date ? formatDate(contract.start_date) : 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <div className="mt-1 text-sm">
                    {contract.end_date ? formatDate(contract.end_date) : 'Not set'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Contract Timeline</span>
                    <span>{contractProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={contractProgress} className="h-2" />
                </div>
                
                {daysUntilExpiry !== null && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    {daysUntilExpiry <= 30 ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {daysUntilExpiry <= 0 ? 'Contract Expired' : 
                         daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Active Contract'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {daysUntilExpiry <= 0 ? 'Contract ended' : 
                         `${daysUntilExpiry} days remaining`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="parties" className="w-full">
            <TabsList>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="obligations">Obligations</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            <TabsContent value="parties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Parties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contract.parties?.map((party, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{party.name}</h4>
                          <Badge variant="outline">{party.role}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Email: {party.email}</div>
                          <div>Phone: {party.phone}</div>
                          <div>Address: {party.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="terms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contract.terms?.map((term, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{term.title}</h4>
                          <Badge variant="outline">{term.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{term.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Effective: {term.effective_date ? formatDate(term.effective_date) : 'Immediate'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="obligations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Obligations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contract.obligations?.map((obligation, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{obligation.title}</h4>
                          <Badge 
                            variant={obligation.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {obligation.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{obligation.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {obligation.due_date ? formatDate(obligation.due_date) : 'Not specified'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="font-medium">Compliant</div>
                        <div className="text-sm text-muted-foreground">All requirements met</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <div className="font-medium">Pending Review</div>
                        <div className="text-sm text-muted-foreground">2 items need attention</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Financial Reporting</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Performance Metrics</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Insurance Requirements</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Quality Standards</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View Documents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Financial Summary
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Contract Value</div>
                <div className="text-lg font-semibold">{formatCurrency(contract.total_value || 0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Parties Involved</div>
                <div className="text-lg font-semibold">{contract.parties?.length || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Obligations</div>
                <div className="text-lg font-semibold">{contract.obligations?.length || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Compliance Rate</div>
                <div className="text-lg font-semibold text-green-600">85%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Contract Start</div>
                <div className="font-medium">
                  {contract.start_date ? formatDate(contract.start_date) : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contract End</div>
                <div className="font-medium">
                  {contract.end_date ? formatDate(contract.end_date) : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Next Review</div>
                <div className="font-medium">2024-03-15</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Renewal Date</div>
                <div className="font-medium">2024-11-30</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 