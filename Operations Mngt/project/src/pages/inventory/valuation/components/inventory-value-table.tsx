import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const inventoryData = [
  {
    id: 'cat-1',
    category: 'Electronics',
    itemCount: 42,
    totalQuantity: 1250,
    averageCost: 350,
    totalValue: 437500,
    percentOfTotal: 26.04,
    trend: 'up',
  },
  {
    id: 'cat-2',
    category: 'Office Supplies',
    itemCount: 78,
    totalQuantity: 5680,
    averageCost: 45,
    totalValue: 255600,
    percentOfTotal: 15.21,
    trend: 'down',
  },
  {
    id: 'cat-3',
    category: 'Furniture',
    itemCount: 25,
    totalQuantity: 320,
    averageCost: 850,
    totalValue: 272000,
    percentOfTotal: 16.19,
    trend: 'up',
  },
  {
    id: 'cat-4',
    category: 'IT Equipment',
    itemCount: 36,
    totalQuantity: 580,
    averageCost: 1200,
    totalValue: 696000,
    percentOfTotal: 41.43,
    trend: 'stable',
  },
  {
    id: 'cat-5',
    category: 'Maintenance',
    itemCount: 18,
    totalQuantity: 420,
    averageCost: 28,
    totalValue: 11760,
    percentOfTotal: 0.70,
    trend: 'down',
  },
];

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  stable: 'text-blue-600',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export function InventoryValueTable() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Value by Category</CardTitle>
            <CardDescription>Breakdown of inventory value across categories</CardDescription>
          </div>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    Items
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    Avg. Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    Total Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    % of Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Trend</th>
                <th className="text-center py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((category) => (
                <tr key={category.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{category.category}</td>
                  <td className="py-3 px-4 text-right">{category.itemCount}</td>
                  <td className="py-3 px-4 text-right">{category.totalQuantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(category.averageCost)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(category.totalValue)}</td>
                  <td className="py-3 px-4 text-right">{category.percentOfTotal.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={trendColors[category.trend]}>
                      {trendIcons[category.trend]} {category.trend === 'up' ? '+5.2%' : category.trend === 'down' ? '-3.8%' : '0.0%'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-medium">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">199</td>
                <td className="py-3 px-4 text-right">8,250</td>
                <td className="py-3 px-4 text-right"></td>
                <td className="py-3 px-4 text-right">{formatCurrency(1680000)}</td>
                <td className="py-3 px-4 text-right">100.00%</td>
                <td className="py-3 px-4 text-center"></td>
                <td className="py-3 px-4 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}