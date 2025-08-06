import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function DeadStockCard() {
  const deadStockValue = 125000;
  const totalStockValue = 1680000;
  const percentOfTotal = (deadStockValue / totalStockValue) * 100;
  const deadStockItems = 42;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          Dead Stock
        </CardTitle>
        <CardDescription>Non-moving inventory for 180+ days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold">{formatCurrency(deadStockValue)}</p>
            <p className="text-sm text-muted-foreground">
              {percentOfTotal.toFixed(1)}% of total inventory value
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{deadStockItems} Items</p>
              <p className="text-xs text-muted-foreground">Across all warehouses</p>
            </div>
            <div className="text-right">
              <button className="text-sm font-medium text-primary hover:underline">
                View Items
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  percentOfTotal > 10 ? 'bg-red-500' : 
                  percentOfTotal > 5 ? 'bg-amber-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${percentOfTotal}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
              <span>15%+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}