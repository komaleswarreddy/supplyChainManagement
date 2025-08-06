import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface ForecastFiltersProps {
  filters: {
    type: string;
    status: string;
    algorithm: string;
    startDateFrom: string;
    startDateTo: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ForecastFilters({ filters, onFiltersChange }: ForecastFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      status: '',
      algorithm: '',
      startDateFrom: '',
      startDateTo: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEMAND">Demand</SelectItem>
                <SelectItem value="SUPPLY">Supply</SelectItem>
                <SelectItem value="FINANCIAL">Financial</SelectItem>
                <SelectItem value="CAPACITY">Capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDateFrom">Start Date From</Label>
            <Input
              id="startDateFrom"
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDateTo">Start Date To</Label>
            <Input
              id="startDateTo"
              type="date"
              value={filters.startDateTo}
              onChange={(e) => handleFilterChange('startDateTo', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select value={filters.algorithm} onValueChange={(value) => handleFilterChange('algorithm', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINEAR_REGRESSION">Linear Regression</SelectItem>
                <SelectItem value="EXPONENTIAL_SMOOTHING">Exponential Smoothing</SelectItem>
                <SelectItem value="ARIMA">ARIMA</SelectItem>
                <SelectItem value="NEURAL_NETWORK">Neural Network</SelectItem>
                <SelectItem value="ENSEMBLE">Ensemble</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 