import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PickPathsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pick Paths</h1>
          <p className="text-muted-foreground">
            Optimize warehouse picking operations
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouse/pick-paths/new">
            <Plus className="mr-2 h-4 w-4" />
            New Pick Path
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pick Paths</CardTitle>
          <CardDescription>
            Pick path optimization functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain pick path optimization features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Route optimization</li>
            <li>Batch picking</li>
            <li>Zone picking</li>
            <li>Wave planning</li>
            <li>Performance analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickPathsPage; 