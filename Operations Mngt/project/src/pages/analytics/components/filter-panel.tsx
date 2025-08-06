import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterPanelProps {
  className?: string;
  onFiltersChange?: (filters: any) => void;
}

const categoryOptions: FilterOption[] = [
  { id: '1', label: 'Raw Materials', value: 'raw-materials' },
  { id: '2', label: 'Work in Progress', value: 'wip' },
  { id: '3', label: 'Finished Goods', value: 'finished-goods' },
  { id: '4', label: 'MRO Supplies', value: 'mro' },
  { id: '5', label: 'Packaging', value: 'packaging' },
];

const supplierOptions: FilterOption[] = [
  { id: '1', label: 'Acme Corp', value: 'acme-corp' },
  { id: '2', label: 'Beta Inc', value: 'beta-inc' },
  { id: '3', label: 'Gamma LLC', value: 'gamma-llc' },
  { id: '4', label: 'Delta Co', value: 'delta-co' },
  { id: '5', label: 'Epsilon', value: 'epsilon' },
];

const statusOptions: FilterOption[] = [
  { id: '1', label: 'Active', value: 'active' },
  { id: '2', label: 'Inactive', value: 'inactive' },
  { id: '3', label: 'Pending', value: 'pending' },
  { id: '4', label: 'Completed', value: 'completed' },
];

export function FilterPanel({ className, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    status: '',
    dateRange: '',
    minValue: '',
    maxValue: '',
    includeInactive: false,
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters
    const newActiveFilters = Object.entries(newFilters)
      .filter(([k, v]) => v && v !== '' && k !== 'includeInactive')
      .map(([k, v]) => `${k}: ${v}`);
    setActiveFilters(newActiveFilters);
    
    onFiltersChange?.(newFilters);
  };

  const clearFilter = (filterKey: string) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    
    const newActiveFilters = Object.entries(newFilters)
      .filter(([k, v]) => v && v !== '' && k !== 'includeInactive')
      .map(([k, v]) => `${k}: ${v}`);
    setActiveFilters(newActiveFilters);
    
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {
      search: '',
      category: '',
      supplier: '',
      status: '',
      dateRange: '',
      minValue: '',
      maxValue: '',
      includeInactive: false,
    };
    setFilters(newFilters);
    setActiveFilters([]);
    onFiltersChange?.(newFilters);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, suppliers, or categories..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {filter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    const [key] = filter.split(': ');
                    clearFilter(key);
                  }}
                />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier Filter */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={filters.supplier} onValueChange={(value) => handleFilterChange('supplier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Suppliers</SelectItem>
                  {supplierOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value Range */}
            <div className="space-y-2">
              <Label>Value Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minValue}
                  onChange={(e) => handleFilterChange('minValue', e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxValue}
                  onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                />
              </div>
            </div>

            {/* Include Inactive */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeInactive"
                checked={filters.includeInactive}
                onCheckedChange={(checked) => handleFilterChange('includeInactive', checked)}
              />
              <Label htmlFor="includeInactive">Include Inactive Items</Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

