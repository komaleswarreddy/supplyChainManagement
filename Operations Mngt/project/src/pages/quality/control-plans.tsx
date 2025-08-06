import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuality } from '@/hooks/useQuality';
import { Shield, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function QualityControlPlans() {
  const { loading, qualityPlans, fetchQualityPlans } = useQuality();

  useEffect(() => {
    fetchQualityPlans();
  }, [fetchQualityPlans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quality control plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control Plans</h1>
          <p className="text-muted-foreground">
            Manage and configure quality control plans for different processes and products.
          </p>
        </div>
        <Button asChild>
          <Link to="/quality/control-plans/new">
            <Plus className="h-4 w-4 mr-2" />
            New Control Plan
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search control plans..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Control Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {qualityPlans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Control Plans</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first quality control plan.
            </p>
            <Button asChild>
              <Link to="/quality/control-plans/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Control Plan
              </Link>
            </Button>
          </div>
        ) : (
          qualityPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.planName}</CardTitle>
                  <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{plan.planType}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Criteria:</span>
                  <span>{plan.inspectionCriteria.length} items</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/quality/control-plans/${plan.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default QualityControlPlans; 