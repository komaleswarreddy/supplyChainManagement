import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RequisitionFiltersProps {
  filters: {
    status: string;
    requestorId: string;
    department: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function RequisitionFilters({ filters, onFiltersChange }: RequisitionFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for the actual filter
    const actualValue = value === 'all' ? '' : value;
    onFiltersChange({
      ...filters,
      [key]: actualValue,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      requestorId: '',
      department: '',
      startDate: '',
      endDate: '',
    });
  };

  // Convert empty strings to "all" for display
  const displayFilters = {
    status: filters.status || 'all',
    department: filters.department || 'all',
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={displayFilters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted to PO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>
          <Select
            value={displayFilters.department}
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => handleFilterChange('startDate', date ? date.toISOString() : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => handleFilterChange('endDate', date ? date.toISOString() : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Requestor Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Requestor</label>
        <Input
          placeholder="Search by requestor name or ID..."
          value={filters.requestorId}
          onChange={(e) => handleFilterChange('requestorId', e.target.value)}
          className="max-w-md"
        />
      </div>
    </div>
  );
} 