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
import { Calculator, Edit, Eye } from 'lucide-react';
import { useSafetyStockCalculations } from '@/hooks/useInventoryOptimization';

export function SafetyStockTable() {
  const { data: safetyStockData, isLoading } = useSafetyStockCalculations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading safety stock calculations...</p>
        </div>
      </div>
    );
  }

  if (!safetyStockData?.data || safetyStockData.data.length === 0) {
    return (
      <div className="text-center py-8">
        <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Safety Stock Calculations</h3>
        <p className="text-muted-foreground mb-4">
          Create safety stock calculations to optimize your inventory levels.
        </p>
        <Link to="/supply-chain/inventory-optimization/safety-stock/create">
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Safety Stock
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
            <TableHead>Service Level</TableHead>
            <TableHead>Safety Stock</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safetyStockData.data.map((calculation) => (
            <TableRow key={calculation.id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/supply-chain/inventory-optimization/safety-stock/${calculation.id}`}
                  className="text-primary hover:underline"
                >
                  {calculation.itemName}
                </Link>
              </TableCell>
              <TableCell>{calculation.locationName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {(calculation.serviceLevel * 100).toFixed(0)}%
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {calculation.safetyStockQuantity.toLocaleString()}
              </TableCell>
              <TableCell>{calculation.leadTime} days</TableCell>
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
                    <Link to={`/supply-chain/inventory-optimization/safety-stock/${calculation.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/safety-stock/${calculation.id}/edit`}>
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