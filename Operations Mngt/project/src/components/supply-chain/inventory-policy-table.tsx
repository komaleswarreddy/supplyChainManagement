import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Settings, Edit, Eye } from 'lucide-react';
import { useInventoryPolicies } from '@/hooks/useInventoryOptimization';

export function InventoryPolicyTable() {
  const { data: policyData, isLoading } = useInventoryPolicies();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading inventory policies...</p>
        </div>
      </div>
    );
  }

  if (!policyData?.data || policyData.data.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Inventory Policies</h3>
        <p className="text-muted-foreground mb-4">
          Create inventory policies to manage your stock levels effectively.
        </p>
        <Link to="/supply-chain/inventory-optimization/policies/create">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </Link>
      </div>
    );
  }

  const getPolicyTypeColor = (policyType: string) => {
    switch (policyType) {
      case 'min-max':
        return 'bg-blue-100 text-blue-800';
      case 'reorder-point':
        return 'bg-green-100 text-green-800';
      case 'periodic-review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPolicyParameters = (policy: any) => {
    switch (policy.policyType) {
      case 'min-max':
        return `Min: ${policy.minQuantity}, Max: ${policy.maxQuantity}`;
      case 'reorder-point':
        return `Reorder Point: ${policy.reorderPoint}, Order Qty: ${policy.orderQuantity}`;
      case 'periodic-review':
        return `Review Period: ${policy.reviewPeriod} days, Order Qty: ${policy.orderQuantity}`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Policy Type</TableHead>
            <TableHead>Parameters</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policyData.data.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/supply-chain/inventory-optimization/policies/${policy.id}`}
                  className="text-primary hover:underline"
                >
                  {policy.itemName}
                </Link>
              </TableCell>
              <TableCell>{policy.locationName}</TableCell>
              <TableCell>
                <Badge className={getPolicyTypeColor(policy.policyType)}>
                  {policy.policyType.replace('-', ' ').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatPolicyParameters(policy)}
              </TableCell>
              <TableCell>
                {new Date(policy.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/policies/${policy.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/policies/${policy.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 