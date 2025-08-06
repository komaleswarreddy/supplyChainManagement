import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CycleCountsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cycle Counts</h1>
          <p className="text-muted-foreground">
            Manage inventory cycle counting operations
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouse/cycle-counts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Cycle Count
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Counts</CardTitle>
          <CardDescription>
            Cycle counting functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain cycle counting features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Cycle count planning</li>
            <li>ABC analysis</li>
            <li>Variance tracking</li>
            <li>Accuracy reporting</li>
            <li>Automated scheduling</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleCountsPage; 