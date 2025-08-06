import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const costingData = [
  {
    method: 'FIFO (First In, First Out)',
    totalValue: 1680000,
    averageCost: 203.64,
    description: 'Assumes that the first items purchased are the first ones sold.',
    pros: 'Closely matches the actual flow of goods, especially for perishable items.',
    cons: 'Can lead to higher taxable income in periods of inflation.',
  },
  {
    method: 'LIFO (Last In, First Out)',
    totalValue: 1710000,
    averageCost: 207.27,
    description: 'Assumes that the most recently purchased items are sold first.',
    pros: 'Can reduce taxable income during inflation, matching current costs with current revenue.',
    cons: 'May not reflect the actual physical flow of inventory, not allowed in some jurisdictions.',
  },
  {
    method: 'Weighted Average',
    totalValue: 1695000,
    averageCost: 205.45,
    description: 'Uses the weighted average of all units available for sale during the period.',
    pros: 'Smooths out price fluctuations and is simpler to calculate.',
    cons: 'May not accurately reflect either current market value or actual flow of goods.',
  },
  {
    method: 'Standard Cost',
    totalValue: 1650000,
    averageCost: 200.00,
    description: 'Uses predetermined estimates for the cost of materials, labor, and overhead.',
    pros: 'Simplifies accounting and provides consistent valuation.',
    cons: 'Requires periodic adjustments to account for variances from actual costs.',
  },
];

export function CostingMethodsTable() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Costing Methods Comparison</CardTitle>
        <CardDescription>Impact of different inventory valuation methods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Method</th>
                <th className="text-right py-3 px-4 font-medium">Total Value</th>
                <th className="text-right py-3 px-4 font-medium">Avg. Cost</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {costingData.map((method, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{method.method}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(method.totalValue)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(method.averageCost)}</td>
                  <td className="py-3 px-4">
                    <p>{method.description}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium text-green-600">Pros:</span> {method.pros}
                      </div>
                      <div>
                        <span className="font-medium text-red-600">Cons:</span> {method.cons}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Note: The current active costing method is <span className="font-medium">FIFO</span>. Changing the costing method requires approval and may have accounting implications.</p>
        </div>
      </CardContent>
    </Card>
  );
}