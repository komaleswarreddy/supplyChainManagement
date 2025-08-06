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
import { BarChart3, Edit, Eye } from 'lucide-react';
import { useABCClassifications } from '@/hooks/useInventoryOptimization';

export function ABCClassificationTable() {
  const { data: abcData, isLoading } = useABCClassifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading ABC classifications...</p>
        </div>
      </div>
    );
  }

  if (!abcData?.data || abcData.data.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No ABC Classifications</h3>
        <p className="text-muted-foreground mb-4">
          Perform ABC analysis to classify your inventory items.
        </p>
        <Link to="/supply-chain/inventory-optimization/abc-analysis">
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Perform ABC Analysis
          </Button>
        </Link>
      </div>
    );
  }

  const getABCColor = (abcClass: string) => {
    switch (abcClass) {
      case 'A':
        return 'bg-red-100 text-red-800';
      case 'B':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getXYZColor = (xyzClass: string) => {
    switch (xyzClass) {
      case 'X':
        return 'bg-blue-100 text-blue-800';
      case 'Y':
        return 'bg-orange-100 text-orange-800';
      case 'Z':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Annual Value</TableHead>
            <TableHead>Volatility</TableHead>
            <TableHead>ABC Class</TableHead>
            <TableHead>XYZ Class</TableHead>
            <TableHead>Combined</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {abcData.data.map((classification) => (
            <TableRow key={classification.id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/supply-chain/inventory-optimization/abc-classification/${classification.id}`}
                  className="text-primary hover:underline"
                >
                  {classification.itemName}
                </Link>
              </TableCell>
              <TableCell>{classification.locationName}</TableCell>
              <TableCell>
                ${classification.annualConsumptionValue.toLocaleString()}
              </TableCell>
              <TableCell>
                {(classification.consumptionVolatility * 100).toFixed(1)}%
              </TableCell>
              <TableCell>
                <Badge className={getABCColor(classification.abcClass)}>
                  {classification.abcClass}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getXYZColor(classification.xyzClass)}>
                  {classification.xyzClass}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {classification.combinedClassification}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(classification.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/abc-classification/${classification.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/supply-chain/inventory-optimization/abc-classification/${classification.id}/edit`}>
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