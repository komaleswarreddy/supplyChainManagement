import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ArrowLeft, AlertTriangle, CheckCircle, FileText, Calendar, User, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const riskLevelColors = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'destructive',
  CRITICAL: 'destructive',
};

export function RiskAssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useRiskAssessment } = useSuppliers();
  const { data: assessment, isLoading } = useRiskAssessment(id!);

  if (isLoading || !assessment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isOverdue = new Date(assessment.nextAssessmentDate) < new Date();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/suppliers/risk-assessment')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Risk Assessment</h1>
              <p className="text-sm text-muted-foreground">
                {assessment.supplierName} • {format(new Date(assessment.assessmentDate), 'PP')}
              </p>
            </div>
          </div>
          <Badge variant={riskLevelColors[assessment.overallRiskLevel]} className="h-6 px-3 text-sm">
            {assessment.overallRiskLevel} RISK
          </Badge>
        </div>

        {isOverdue && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Assessment Overdue</h3>
                <p className="text-sm text-red-700">
                  The next assessment was due on {format(new Date(assessment.nextAssessmentDate), 'PP')}. 
                  Please schedule a new assessment as soon as possible.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-white"
                  onClick={() => navigate(`/suppliers/risk-assessment/new?supplierId=${assessment.supplierId}`)}
                >
                  Schedule New Assessment
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="categories">Risk Categories</TabsTrigger>
            <TabsTrigger value="mitigation">Mitigation Plans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Summary</CardTitle>
                <CardDescription>
                  Overall risk assessment details and scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                    <p className="mt-1 font-medium">{assessment.supplierName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assessment Date</h3>
                    <p className="mt-1">{format(new Date(assessment.assessmentDate), 'PP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Next Assessment</h3>
                    <p className={`mt-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {format(new Date(assessment.nextAssessmentDate), 'PP')}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Overall Risk Level</h3>
                    <p className="mt-1">
                      <Badge variant={riskLevelColors[assessment.overallRiskLevel]}>
                        {assessment.overallRiskLevel}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Overall Score</h3>
                    <p className="mt-1 font-medium">{assessment.overallScore}/100</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="mt-1">
                      <Badge variant={assessment.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {assessment.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assessed By</h3>
                    <p className="mt-1">{assessment.assessedBy.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Risk Score</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Risk Score</span>
                      <span className="text-sm font-medium">{assessment.overallScore}/100</span>
                    </div>
                    <Progress value={assessment.overallScore} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>High Risk</span>
                      <span>Low Risk</span>
                    </div>
                  </div>
                </div>

                {assessment.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-1">{assessment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Category Summary</CardTitle>
                <CardDescription>
                  Summary of risk scores by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessment.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={riskLevelColors[category.riskLevel]} className="h-6 px-3">
                            {category.riskLevel}
                          </Badge>
                          <span className="font-medium">{category.category.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-medium">{category.score}/100</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {assessment.categories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.category.replace('_', ' ')}</CardTitle>
                    <Badge variant={riskLevelColors[category.riskLevel]}>
                      {category.riskLevel} RISK
                    </Badge>
                  </div>
                  <CardDescription>
                    Score: {category.score}/100 • Weight: {(category.weight * 100).toFixed(0)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Risk Score</h3>
                    <Progress value={category.score} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Risk Factors</h3>
                    <div className="space-y-4">
                      {category.factors.map((factor, factorIndex) => (
                        <div key={factorIndex} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{factor.name}</h4>
                            <span className="text-sm font-medium">{factor.score}/100</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{factor.description || 'No description provided'}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                              {factor.dataSource && <span>Source: {factor.dataSource}</span>}
                            </div>
                            <Progress value={factor.score} className="h-1.5" />
                          </div>
                          {factor.notes && (
                            <p className="mt-2 text-xs text-muted-foreground">{factor.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {category.mitigationPlan && (
                    <div>
                      <h3 className="text-sm font-medium">Mitigation Plan</h3>
                      <p className="mt-1 text-sm">{category.mitigationPlan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mitigation" className="space-y-4">
            {assessment.mitigationPlans && assessment.mitigationPlans.length > 0 ? (
              assessment.mitigationPlans.map((plan, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.riskCategory.replace('_', ' ')} Risk Mitigation</CardTitle>
                      <Badge variant={plan.status === 'ACTIVE' ? 'warning' : plan.status === 'COMPLETED' ? 'success' : 'default'}>
                        {plan.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created: {format(new Date(plan.createdAt), 'PP')} • Last Updated: {format(new Date(plan.updatedAt), 'PP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Description</h3>
                      <p className="mt-1">{plan.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Actions</h3>
                      <div className="space-y-4">
                        {plan.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{action.description}</h4>
                              <Badge variant={
                                action.status === 'COMPLETED' ? 'success' : 
                                action.status === 'OVERDUE' ? 'destructive' : 
                                'warning'
                              }>
                                {action.status}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span>Assigned to: {action.assignedTo.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {format(new Date(action.dueDate), 'PP')}</span>
                              </div>
                            </div>
                            {action.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">{action.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Mitigation Plans</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There are no active mitigation plans for this risk assessment.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate(`/suppliers/risk-assessment/${id}/mitigation/new`)}
                  >
                    Create Mitigation Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>
                  Previous risk assessments for this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-muted">
                    <div className="absolute left-0 top-1 h-2 w-2 -translate-x-[3px] rounded-full bg-primary"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={riskLevelColors[assessment.overallRiskLevel]}>
                          {assessment.overallRiskLevel}
                        </Badge>
                        <h3 className="font-medium">Current Assessment</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(assessment.assessmentDate), 'PPP')} • Score: {assessment.overallScore}/100
                      </p>
                      <p className="text-sm">
                        Conducted by {assessment.assessedBy.name}
                      </p>
                    </div>
                  </div>

                  {/* Previous assessments would be mapped here */}
                  <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-muted">
                    <div className="absolute left-0 top-1 h-2 w-2 -translate-x-[3px] rounded-full bg-muted-foreground"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">MEDIUM</Badge>
                        <h3 className="font-medium">Previous Assessment</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(new Date().setMonth(new Date().getMonth() - 6)), 'PPP')} • Score: 72/100
                      </p>
                      <p className="text-sm">
                        Conducted by Jane Smith
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-muted">
                    <div className="absolute left-0 top-1 h-2 w-2 -translate-x-[3px] rounded-full bg-muted-foreground"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">LOW</Badge>
                        <h3 className="font-medium">Initial Assessment</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), 'PPP')} • Score: 85/100
                      </p>
                      <p className="text-sm">
                        Conducted by John Doe
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Related documents and attachments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Risk Assessment Report</p>
                        <p className="text-sm text-muted-foreground">
                          PDF • {format(new Date(assessment.assessmentDate), 'PP')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Financial Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          XLSX • {format(new Date(assessment.assessmentDate), 'PP')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Mitigation Plan</p>
                        <p className="text-sm text-muted-foreground">
                          DOCX • {format(new Date(assessment.assessmentDate), 'PP')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/suppliers/risk-assessment')}>
            Back to List
          </Button>
          <Button variant="outline" onClick={() => navigate(`/suppliers/${assessment.supplierId}`)}>
            View Supplier
          </Button>
          <Button onClick={() => navigate(`/suppliers/risk-assessment/${id}/edit`)}>
            Edit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RiskAssessmentDetail;