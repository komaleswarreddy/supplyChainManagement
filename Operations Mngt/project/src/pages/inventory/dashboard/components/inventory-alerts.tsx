import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Clock, AlertCircle } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'stockout',
    severity: 'high',
    message: 'Item ITEM-0042 (Laptop Docking Station) is out of stock',
    location: 'Main Warehouse',
    time: '2 hours ago',
    icon: <TrendingDown className="h-4 w-4" />,
  },
  {
    id: 2,
    type: 'lowStock',
    severity: 'medium',
    message: 'Item ITEM-0078 (Wireless Keyboard) is below reorder point',
    location: 'East Coast DC',
    time: '5 hours ago',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: 3,
    type: 'expiring',
    severity: 'medium',
    message: 'Batch LOT-2023-456 (Printer Toner) expires in 30 days',
    location: 'Main Warehouse',
    time: '1 day ago',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 4,
    type: 'discrepancy',
    severity: 'low',
    message: 'Cycle count discrepancy for ITEM-0103 (USB Cables)',
    location: 'West Coast DC',
    time: '2 days ago',
    icon: <AlertCircle className="h-4 w-4" />,
  },
];

const severityColors = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
};

export function InventoryAlerts() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Inventory Alerts</CardTitle>
        <CardDescription>Recent inventory issues requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-4 p-3 rounded-md border">
              <div className={`p-2 rounded-full bg-${severityColors[alert.severity]}/20 text-${severityColors[alert.severity]}`}>
                {alert.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{alert.message}</p>
                  <Badge variant={severityColors[alert.severity] as any}>
                    {alert.severity}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{alert.location}</span>
                  <span className="mx-2">•</span>
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <button className="text-sm font-medium text-primary hover:underline">
              View All Alerts
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}