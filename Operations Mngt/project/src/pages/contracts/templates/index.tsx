import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContractTemplatesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
          <p className="text-muted-foreground">
            Manage contract templates and standard terms
          </p>
        </div>
        <Button asChild>
          <Link to="/contracts/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Templates</CardTitle>
          <CardDescription>
            Template management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain contract template management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Template creation and management</li>
            <li>Standard terms and conditions</li>
            <li>Template versioning</li>
            <li>Template approval workflows</li>
            <li>Template usage analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractTemplatesPage; 