import React from 'react';
import { InventoryValueChart } from './components/inventory-value-chart';
import { InventoryValueTable } from './components/inventory-value-table';
import { InventoryAgingChart } from './components/inventory-aging-chart';
import { CostingMethodsTable } from './components/costing-methods-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Filter, RefreshCw, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function InventoryValuationPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Inventory Valuation</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(1680000)}</div>
            <p className="text-xs text-muted-foreground">
              As of {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Item Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(8442.21)}</div>
            <p className="text-xs text-muted-foreground">
              Across 199 active items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Highest Value Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">IT Equipment</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(696000)} (41.4% of total)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Costing Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FIFO</div>
            <p className="text-xs text-muted-foreground">
              Last changed: 01/01/2023
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Valuation Settings</CardTitle>
              <CardDescription>Configure inventory valuation parameters</CardDescription>
            </div>
            <Button>Save Changes</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="costingMethod">Costing Method</Label>
              <Select id="costingMethod" defaultValue="fifo">
                <option value="fifo">FIFO (First In, First Out)</option>
                <option value="lifo">LIFO (Last In, First Out)</option>
                <option value="average">Weighted Average</option>
                <option value="standard">Standard Cost</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines how inventory costs are calculated
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valuationFrequency">Valuation Frequency</Label>
              <Select id="valuationFrequency" defaultValue="daily">
                <option value="realtime">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often inventory value is recalculated
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportingCurrency">Reporting Currency</Label>
              <Select id="reportingCurrency" defaultValue="usd">
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="gbp">GBP (£)</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currency used for valuation reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryValueChart />
      <InventoryValueTable />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InventoryAgingChart />
        <div className="md:col-span-2">
          <CostingMethodsTable />
        </div>
      </div>
    </div>
  );
}

export default InventoryValuationPage;