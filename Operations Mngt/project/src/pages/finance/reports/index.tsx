import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinancialReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage financial reports
          </p>
        </div>
        <Button asChild>
          <Link to="/finance/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>
            Financial reporting functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain financial reporting features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Profit & Loss statements</li>
            <li>Balance sheets</li>
            <li>Cash flow statements</li>
            <li>Budget variance reports</li>
            <li>Custom financial reports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsPage; 