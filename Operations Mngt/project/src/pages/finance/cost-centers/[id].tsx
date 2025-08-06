import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, DollarSign, Users, Building, FileText } from 'lucide-react';
import { useCostCenter } from '@/hooks/useCostCenters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CostCenterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: costCenter, isLoading, error } = useCostCenter(id!);

  if (isLoading) return <div>Loading cost center...</div>;
  if (error) return <div>Error loading cost center: {error.message}</div>;
  if (!costCenter) return <div>Cost center not found</div>;

  const budgetUtilization = costCenter.budget ? (costCenter.spent / costCenter.budget) * 100 : 0;
  const remainingBudget = (costCenter.budget || 0) - (costCenter.spent || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/finance/cost-centers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cost Centers
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{costCenter.name}</h1>
          <p className="text-muted-foreground">Cost Center Code: {costCenter.code}</p>
        </div>
        <Button onClick={() => navigate(`/finance/cost-centers/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Center Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{costCenter.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={costCenter.status === 'active' ? 'default' : 'secondary'}>
                      {costCenter.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manager</label>
                  <div className="mt-1">{costCenter.manager_name || 'Not assigned'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parent Cost Center</label>
                  <div className="mt-1">{costCenter.parent_name || 'None'}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-1 text-sm">{costCenter.description || 'No description provided'}</div>
              </div>

              {costCenter.location && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <div className="mt-1 text-sm">{costCenter.location}</div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Effective From</label>
                  <div className="mt-1 text-sm">
                    {costCenter.effective_from ? formatDate(costCenter.effective_from) : 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Effective To</label>
                  <div className="mt-1 text-sm">
                    {costCenter.effective_to ? formatDate(costCenter.effective_to) : 'Not set'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(costCenter.budget || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatCurrency(costCenter.spent || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(remainingBudget)}
                  </div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Utilization</span>
                  <span>{budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      budgetUtilization > 90 ? 'bg-red-500' : 
                      budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budgets">Budget History</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Transaction history will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="budgets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Budget history will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Financial reports will be displayed here
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
                <DollarSign className="w-4 h-4 mr-2" />
                View Transactions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Budget Planning
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Average</div>
                <div className="text-lg font-semibold">
                  {formatCurrency((costCenter.spent || 0) / 12)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Utilization Rate</div>
                <div className="text-lg font-semibold">{budgetUtilization.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
                <div className="text-lg font-semibold">
                  {costCenter.effective_to ? 
                    Math.ceil((new Date(costCenter.effective_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                    'N/A'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Manager</div>
                <div className="font-medium">{costCenter.manager_name || 'Not assigned'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{costCenter.manager_email || 'Not available'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{costCenter.manager_phone || 'Not available'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 