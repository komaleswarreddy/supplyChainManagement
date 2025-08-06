import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useOptimizationRecommendations } from '@/hooks/useInventoryOptimization';

export function OptimizationRecommendations() {
  const { data: recommendations, isLoading } = useOptimizationRecommendations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Optimization Recommendations</h3>
        <p className="text-muted-foreground mb-4">
          Generate recommendations to optimize your inventory management.
        </p>
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate Recommendations
        </Button>
      </div>
    );
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'safety-stock':
        return <AlertTriangle className="h-5 w-5" />;
      case 'reorder-point':
        return <TrendingUp className="h-5 w-5" />;
      case 'policy-change':
        return <TrendingDown className="h-5 w-5" />;
      case 'cost-optimization':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'safety-stock':
        return 'text-orange-600';
      case 'reorder-point':
        return 'text-blue-600';
      case 'policy-change':
        return 'text-purple-600';
      case 'cost-optimization':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'applied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={getRecommendationColor(recommendation.type)}>
                    {getRecommendationIcon(recommendation.type)}
                  </div>
                  <CardTitle className="text-base">
                    {recommendation.itemName}
                  </CardTitle>
                </div>
                <Badge className={getStatusColor(recommendation.status)}>
                  {recommendation.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {recommendation.locationName}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Recommendation Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {recommendation.type.replace('-', ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Expected Impact</p>
                <div className="space-y-1">
                  {recommendation.expectedImpact.costSavings && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Cost Savings:</span>
                      <span className="font-medium text-green-600">
                        ${recommendation.expectedImpact.costSavings.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {recommendation.expectedImpact.serviceLevelImprovement && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Service Level:</span>
                      <span className="font-medium text-blue-600">
                        +{recommendation.expectedImpact.serviceLevelImprovement.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {recommendation.expectedImpact.inventoryReduction && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Inventory Reduction:</span>
                      <span className="font-medium text-purple-600">
                        {recommendation.expectedImpact.inventoryReduction.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${recommendation.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {recommendation.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  Apply
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 