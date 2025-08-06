import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const BudgetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage budgets and track financial performance
          </p>
        </div>
        <Button asChild>
          <Link to="/finance/budgets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>
            Budget management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain budget management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Budget creation and planning</li>
            <li>Budget tracking and monitoring</li>
            <li>Variance analysis</li>
            <li>Budget approval workflows</li>
            <li>Financial reporting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetsPage; 