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
import { Target, Edit, Eye } from 'lucide-react';
import { useReorderPointCalculations } from '@/hooks/useInventoryOptimization';

export function ReorderPointTable() {
  const { data: reorderPointData, isLoading } = useReorderPointCalculations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading reorder point calculations...</p>
        </div>
      </div>
    );
  }

  if (!reorderPointData?.data || reorderPointData.data.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reorder Point Calculations</h3>
        <p className="text-muted-foreground mb-4">
          Create reorder point calculations to optimize your replenishment timing.
        </p>
        <Link to="/supply-chain/inventory-optimization/reorder-points/create">
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Calculate Reorder Point
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Daily Demand</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Safety Stock</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reorderPointData.data.map((calculation) => (
            <TableRow key={calculation.id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/supply-chain/inventory-optimization/reorder-points/${calculation.id}`}
                  className="text-primary hover:underline"
                >
                  {calculation.itemName}
                </Link>
              </TableCell>
              <TableCell>{calculation.locationName}</TableCell>
              <TableCell>
                {calculation.averageDailyDemand.toFixed(1)}
              </TableCell>
              <TableCell>{calculation.leadTime} days</TableCell>
              <TableCell>
                {calculation.safetyStock.toLocaleString()}
              </TableCell>
              <TableCell className="font-medium">
                <Badge variant="default">
                  {calculation.reorderPoint.toLocaleString()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {calculation.calculationMethod}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(calculation.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/reorder-points/${calculation.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/reorder-points/${calculation.id}/edit`}>
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