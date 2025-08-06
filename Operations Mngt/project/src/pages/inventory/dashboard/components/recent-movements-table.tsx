import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, ArrowUp, RefreshCw, Eye } from 'lucide-react';

const movements = [
  {
    id: 'mov-1',
    timestamp: '2023-06-20T14:30:00Z',
    type: 'RECEIPT',
    itemCode: 'ITEM-0078',
    itemName: 'Wireless Keyboard',
    quantity: 50,
    location: 'Main Warehouse',
    reference: 'PO-2023-0042',
  },
  {
    id: 'mov-2',
    timestamp: '2023-06-20T11:15:00Z',
    type: 'ISSUE',
    itemCode: 'ITEM-0103',
    itemName: 'USB Cables',
    quantity: 25,
    location: 'Main Warehouse',
    reference: 'ORD-2023-0187',
  },
  {
    id: 'mov-3',
    timestamp: '2023-06-19T16:45:00Z',
    type: 'TRANSFER',
    itemCode: 'ITEM-0215',
    itemName: 'Office Chair',
    quantity: 10,
    location: 'Main Warehouse → West Coast DC',
    reference: 'TRF-2023-0056',
  },
  {
    id: 'mov-4',
    timestamp: '2023-06-19T09:20:00Z',
    type: 'ADJUSTMENT',
    itemCode: 'ITEM-0187',
    itemName: 'Printer Toner',
    quantity: -2,
    location: 'East Coast DC',
    reference: 'ADJ-2023-0023',
  },
];

const typeIcons = {
  RECEIPT: <ArrowDown className="h-4 w-4 text-green-500" />,
  ISSUE: <ArrowUp className="h-4 w-4 text-red-500" />,
  TRANSFER: <ArrowRight className="h-4 w-4 text-blue-500" />,
  ADJUSTMENT: <RefreshCw className="h-4 w-4 text-amber-500" />,
};

const typeColors = {
  RECEIPT: 'bg-green-100 text-green-800',
  ISSUE: 'bg-red-100 text-red-800',
  TRANSFER: 'bg-blue-100 text-blue-800',
  ADJUSTMENT: 'bg-amber-100 text-amber-800',
};

export function RecentMovementsTable() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>Latest inventory transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Item</th>
                <th className="text-right py-3 px-4 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 font-medium">Location</th>
                <th className="text-left py-3 px-4 font-medium">Reference</th>
                <th className="text-center py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(movement.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="mr-2">{typeIcons[movement.type]}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[movement.type]}`}>
                        {movement.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{movement.itemName}</div>
                      <div className="text-xs text-muted-foreground">{movement.itemCode}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {movement.type === 'ADJUSTMENT' && movement.quantity < 0 ? movement.quantity : `+${movement.quantity}`}
                  </td>
                  <td className="py-3 px-4">{movement.location}</td>
                  <td className="py-3 px-4 text-sm">{movement.reference}</td>
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