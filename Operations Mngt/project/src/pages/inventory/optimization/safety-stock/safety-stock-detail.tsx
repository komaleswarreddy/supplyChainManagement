import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Calculator, Edit, RefreshCw, LineChart, History } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for a safety stock calculation
const safetyStockData = {
  id: 'ss-1',
  itemId: 'item-1',
  itemCode: 'ITEM-0187',
  itemName: 'Printer Toner',
  locationId: 'loc-1',
  locationName: 'Main Warehouse',
  serviceLevel: 0.95,
  leadTime: 7, // days
  leadTimeVariability: 1.5, // days (standard deviation)
  demandAverage: 25, // units per day
  demandVariability: 8, // units (standard deviation)
  safetyStock: 85,
  calculationMethod: 'NORMAL_APPROXIMATION',
  reviewPeriod: 7, // days
  lastCalculated: '2023-06-15T10:30:00Z',
  nextReview: '2023-07-15T10:30:00Z',
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2023-06-15T10:30:00Z',
  notes: 'Critical item with high demand variability',
  historicalCalculations: [
    { date: '2023-01-15', safetyStock: 75 },
    { date: '2023-02-15', safetyStock: 78 },
    { date: '2023-03-15', safetyStock: 80 },
    { date: '2023-04-15', safetyStock: 82 },
    { date: '2023-05-15', safetyStock: 83 },
    { date: '2023-06-15', safetyStock: 85 },
  ],
  demandHistory: [
    { date: '2023-01-01', demand: 22 },
    { date: '2023-01-08', demand: 24 },
    { date: '2023-01-15', demand: 20 },
    { date: '2023-01-22', demand: 28 },
    { date: '2023-01-29', demand: 26 },
    { date: '2023-02-05', demand: 23 },
    { date: '2023-02-12', demand: 25 },
    { date: '2023-02-19', demand: 30 },
    { date: '2023-02-26', demand: 27 },
    { date: '2023-03-05', demand: 24 },
    { date: '2023-03-12', demand: 26 },
    { date: '2023-03-19', demand: 25 },
    { date: '2023-03-26', demand: 28 },
  ],
  leadTimeHistory: [
    { date: '2023-01-05', leadTime: 6 },
    { date: '2023-01-20', leadTime: 8 },
    { date: '2023-02-10', leadTime: 7 },
    { date: '2023-02-25', leadTime: 9 },
    { date: '2023-03-15', leadTime: 6 },
    { date: '2023-03-30', leadTime: 7 },
    { date: '2023-04-15', leadTime: 8 },
    { date: '2023-05-01', leadTime: 7 },
    { date: '2023-05-20', leadTime: 6 },
    { date: '2023-06-05', leadTime: 7 },
  ],
};

export function SafetyStockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  
  // In a real app, you would fetch the safety stock data based on the ID
  // For this example, we'll just use the mock data
  const safetyStock = safetyStockData;
  
  const handleRecalculate = () => {
    confirm(() => {
      // In a real app, you would call an API to recalculate the safety stock
      console.log('Recalculating safety stock:', id);
      // Then navigate or refresh the page
    });
  };
  
  const handleEdit = () => {
    navigate(`/inventory/optimization/safety-stock/${id}/edit`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory/optimization/safety-stock')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Safety Stock Calculation</h1>
              <p className="text-sm text-muted-foreground">
                {safetyStock.itemName} ({safetyStock.itemCode}) - {safetyStock.locationName}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Parameters
          </Button>
          <Button onClick={handleRecalculate} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Recalculate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Safety Stock</CardTitle>
            <CardDescription>Current calculated value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{safetyStock.safetyStock}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Last calculated: {format(new Date(safetyStock.lastCalculated), 'PPp')}
            </p>
            <p className="text-sm text-muted-foreground">
              Next review: {format(new Date(safetyStock.nextReview), 'PP')}
            </p>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium">Calculation Method</p>
              <p className="text-sm">{safetyStock.calculationMethod.replace('_', ' ')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Level</CardTitle>
            <CardDescription>Target service level parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{safetyStock.serviceLevel * 100}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Z-score: {safetyStock.serviceLevel === 0.9 ? '1.28' : safetyStock.serviceLevel === 0.95 ? '1.65' : '2.33'}
            </p>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium">Review Period</p>
              <p className="text-sm">{safetyStock.reviewPeriod} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Parameters</CardTitle>
            <CardDescription>Input values for calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Average Daily Demand</p>
                <p className="text-xl font-bold">{safetyStock.demandAverage} units</p>
                <p className="text-sm text-muted-foreground">
                  Variability: ±{safetyStock.demandVariability} units
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Lead Time</p>
                <p className="text-xl font-bold">{safetyStock.leadTime} days</p>
                <p className="text-sm text-muted-foreground">
                  Variability: ±{safetyStock.leadTimeVariability} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historical Data
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Demand Analysis
          </TabsTrigger>
          <TabsTrigger value="leadtime" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Lead Time Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Stock History</CardTitle>
              <CardDescription>Historical safety stock calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={safetyStock.historicalCalculations}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'PP')}
                      formatter={(value) => [`${value} units`, 'Safety Stock']}
                    />
                    <defs>
                      <linearGradient id="colorSafetyStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="safetyStock" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorSafetyStock)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Safety stock has increased by {((safetyStock.safetyStock / safetyStock.historicalCalculations[0].safetyStock) - 1) * 100}% over the past 6 months due to increased demand variability.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demand" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demand Analysis</CardTitle>
              <CardDescription>Historical demand patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={safetyStock.demandHistory}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'PP')}
                      formatter={(value) => [`${value} units`, 'Demand']}
                    />
                    <defs>
                      <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="demand" 
                      stroke="#82ca9d" 
                      fillOpacity={1} 
                      fill="url(#colorDemand)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Average Demand</p>
                  <p className="text-xl font-bold">{safetyStock.demandAverage} units/day</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Standard Deviation</p>
                  <p className="text-xl font-bold">{safetyStock.demandVariability} units</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Coefficient of Variation</p>
                  <p className="text-xl font-bold">{(safetyStock.demandVariability / safetyStock.demandAverage).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leadtime" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Time Analysis</CardTitle>
              <CardDescription>Historical lead time patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={safetyStock.leadTimeHistory}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'PP')}
                      formatter={(value) => [`${value} days`, 'Lead Time']}
                    />
                    <defs>
                      <linearGradient id="colorLeadTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="leadTime" 
                      stroke="#ffc658" 
                      fillOpacity={1} 
                      fill="url(#colorLeadTime)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Average Lead Time</p>
                  <p className="text-xl font-bold">{safetyStock.leadTime} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Standard Deviation</p>
                  <p className="text-xl font-bold">{safetyStock.leadTimeVariability} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Coefficient of Variation</p>
                  <p className="text-xl font-bold">{(safetyStock.leadTimeVariability / safetyStock.leadTime).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Details</CardTitle>
          <CardDescription>How safety stock is calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Formula Used</h3>
              <p className="mt-1">
                Safety Stock = Z × √(Lead Time) × Demand Variability
              </p>
              <p className="mt-2 text-sm">
                Where:
              </p>
              <ul className="list-disc list-inside text-sm ml-4 space-y-1 mt-1">
                <li>Z = Z-score for the service level ({safetyStock.serviceLevel === 0.9 ? '1.28' : safetyStock.serviceLevel === 0.95 ? '1.65' : '2.33'})</li>
                <li>Lead Time = {safetyStock.leadTime} days</li>
                <li>Demand Variability = {safetyStock.demandVariability} units</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Calculation</h3>
              <p className="mt-1">
                {safetyStock.serviceLevel === 0.9 ? '1.28' : safetyStock.serviceLevel === 0.95 ? '1.65' : '2.33'} × 
                √{safetyStock.leadTime} × 
                {safetyStock.demandVariability} = 
                {safetyStock.safetyStock} units
              </p>
            </div>
            
            {safetyStock.notes && (
              <div>
                <h3 className="font-medium">Notes</h3>
                <p className="mt-1">{safetyStock.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Recalculation"
        description="Are you sure you want to recalculate the safety stock? This will update the current value based on the latest data."
        confirmText="Recalculate"
        onConfirm={onConfirm}
      />
    </div>
  );
}