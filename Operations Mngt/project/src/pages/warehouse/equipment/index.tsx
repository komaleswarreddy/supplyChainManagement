import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WarehouseEquipmentPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Equipment</h1>
          <p className="text-muted-foreground">
            Manage warehouse equipment and assets
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouse/equipment/new">
            <Plus className="mr-2 h-4 w-4" />
            New Equipment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Equipment</CardTitle>
          <CardDescription>
            Equipment management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain warehouse equipment management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Equipment tracking</li>
            <li>Maintenance scheduling</li>
            <li>Equipment utilization</li>
            <li>Asset lifecycle management</li>
            <li>Performance monitoring</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseEquipmentPage; 