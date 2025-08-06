import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye } from 'lucide-react';

const stockItems = [
  {
    id: 'item-1',
    code: 'ITEM-0042',
    name: 'Laptop Docking Station',
    category: 'Electronics',
    currentStock: 0,
    reorderPoint: 15,
    status: 'OUT_OF_STOCK',
    location: 'Main Warehouse',
  },
  {
    id: 'item-2',
    code: 'ITEM-0078',
    name: 'Wireless Keyboard',
    category: 'Electronics',
    currentStock: 12,
    reorderPoint: 20,
    status: 'LOW_STOCK',
    location: 'East Coast DC',
  },
  {
    id: 'item-3',
    code: 'ITEM-0103',
    name: 'USB Cables',
    category: 'Electronics',
    currentStock: 145,
    reorderPoint: 50,
    status: 'IN_STOCK',
    location: 'Main Warehouse',
  },
  {
    id: 'item-4',
    code: 'ITEM-0215',
    name: 'Office Chair',
    category: 'Furniture',
    currentStock: 8,
    reorderPoint: 5,
    status: 'IN_STOCK',
    location: 'West Coast DC',
  },
  {
    id: 'item-5',
    code: 'ITEM-0187',
    name: 'Printer Toner',
    category: 'Office Supplies',
    currentStock: 23,
    reorderPoint: 25,
    status: 'LOW_STOCK',
    location: 'Main Warehouse',
  },
];

const statusColors = {
  IN_STOCK: 'success',
  LOW_STOCK: 'warning',
  OUT_OF_STOCK: 'destructive',
};

export function StockLevelTable() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Critical Stock Levels</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center">
                    Item Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Location</th>
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end">
                    Current Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{item.code}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.location}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={item.status === 'OUT_OF_STOCK' ? 'text-destructive font-medium' : ''}>
                      {item.currentStock}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">/ {item.reorderPoint}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={statusColors[item.status] as any}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}