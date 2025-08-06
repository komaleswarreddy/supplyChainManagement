import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContractManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground">
            Manage contracts and legal agreements
          </p>
        </div>
        <Button asChild>
          <Link to="/contracts/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            Contract management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will contain contract management features including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Contract creation and tracking</li>
            <li>Contract lifecycle management</li>
            <li>Obligation tracking</li>
            <li>Compliance monitoring</li>
            <li>Contract analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractManagementPage; 