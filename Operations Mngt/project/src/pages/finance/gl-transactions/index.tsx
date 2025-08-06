import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const GLTransactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">General Ledger Transactions</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>GL Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            General Ledger Transactions management page. This feature is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GLTransactions; 