import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WarehouseTasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Tasks</h1>
          <p className="text-muted-foreground">
            Manage warehouse tasks and operations
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouse/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Tasks</CardTitle>
          <CardDescription>
            Task management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain warehouse task management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Pick and putaway tasks</li>
            <li>Task assignment and tracking</li>
            <li>Task prioritization</li>
            <li>Performance monitoring</li>
            <li>Task completion workflows</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseTasksPage; 