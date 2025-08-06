import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WarehousesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage warehouse facilities and locations
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouse/warehouses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Warehouse
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
          <CardDescription>
            Warehouse management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain warehouse management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Warehouse facility management</li>
            <li>Zone and location setup</li>
            <li>Capacity planning</li>
            <li>Operating hours management</li>
            <li>Equipment tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehousesPage; 