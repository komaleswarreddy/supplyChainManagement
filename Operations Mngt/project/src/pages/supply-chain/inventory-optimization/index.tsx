import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Settings, Calculator, Download, RefreshCw, Eye, Edit, Plus
} from 'lucide-react';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafetyStockTable } from '@/components/supply-chain/safety-stock-table';
import { ReorderPointTable } from '@/components/supply-chain/reorder-point-table';
import { ABCClassificationTable } from '@/components/supply-chain/abc-classification-table';
import { InventoryPolicyTable } from '@/components/supply-chain/inventory-policy-table';
import { OptimizationRecommendations } from '@/components/supply-chain/optimization-recommendations';
import { OptimizationChart } from '@/components/supply-chain/optimization-chart';

export default function InventoryOptimizationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: optimizationData, isLoading, error } = useInventoryOptimization();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Optimization Data</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Optimization</h1>
          <p className="text-muted-foreground">
            Optimize inventory levels, safety stock, and reorder points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimizationData?.overallPerformance?.serviceLevel?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 95%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimizationData?.overallPerformance?.inventoryTurnover?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual turns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Rate</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(optimizationData?.overallPerformance?.stockoutRate * 100)?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excess Inventory</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(optimizationData?.overallPerformance?.excessInventoryValue / 1000000)?.toFixed(1) || 0}M
            </div>
            <p className="text-xs text-muted-foreground">
              Value in excess
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <OptimizationChart 
            data={optimizationData?.performanceTrends || []}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety-stock">Safety Stock</TabsTrigger>
          <TabsTrigger value="reorder-points">Reorder Points</TabsTrigger>
          <TabsTrigger value="abc-analysis">ABC Analysis</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimizationData?.performanceByItem?.slice(0, 5).map((item) => (
                    <div key={item.itemId} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Service Level: {item.serviceLevel.toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant="outline">
                        {item.inventoryTurnover.toFixed(1)} turns
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Needing Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimizationData?.performanceByItem
                    ?.filter(item => item.serviceLevel < 90 || item.stockoutRate > 0.05)
                    ?.slice(0, 5)
                    ?.map((item) => (
                    <div key={item.itemId} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Service Level: {item.serviceLevel.toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant="destructive">
                        Needs Review
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety-stock" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Safety Stock Calculations</h3>
            <Link to="/supply-chain/inventory-optimization/safety-stock/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Calculate Safety Stock
              </Button>
            </Link>
          </div>
          <SafetyStockTable />
        </TabsContent>

        <TabsContent value="reorder-points" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reorder Point Calculations</h3>
            <Link to="/supply-chain/inventory-optimization/reorder-points/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Calculate Reorder Point
              </Button>
            </Link>
          </div>
          <ReorderPointTable />
        </TabsContent>

        <TabsContent value="abc-analysis" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ABC Classification</h3>
            <Link to="/supply-chain/inventory-optimization/abc-analysis">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Perform ABC Analysis
              </Button>
            </Link>
          </div>
          <ABCClassificationTable />
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Inventory Policies</h3>
            <Link to="/supply-chain/inventory-optimization/policies/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </Link>
          </div>
          <InventoryPolicyTable />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </div>
          <OptimizationRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
} 