import React from 'react';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import type { RequisitionStatus } from '@/types/procurement';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const filterSchema = z.object({
  status: z.string().optional(),
  department: z.string().optional(),
  requestor: z.string().optional(),
  costCenter: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

const statusOptions: { label: string; value: RequisitionStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function RequisitionFilters() {
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const { register, handleSubmit, reset } = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: '',
      department: '',
      requestor: '',
      costCenter: '',
      minAmount: undefined,
      maxAmount: undefined,
    },
  });

  const onSubmit = (data: FilterValues) => {
    console.log('Filter values:', {
      ...data,
      dateRange: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      },
    });
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select {...register('status')}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="relative">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                placeholderText="Select date range"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Enter department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestor">Requestor</Label>
            <Input
              id="requestor"
              {...register('requestor')}
              placeholder="Enter requestor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costCenter">Cost Center</Label>
            <Input
              id="costCenter"
              {...register('costCenter')}
              placeholder="Enter cost center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount</Label>
            <Input
              id="minAmount"
              type="number"
              {...register('minAmount', { valueAsNumber: true })}
              placeholder="Enter minimum amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount</Label>
            <Input
              id="maxAmount"
              type="number"
              {...register('maxAmount', { valueAsNumber: true })}
              placeholder="Enter maximum amount"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit">Apply Filters</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              reset();
              setDateRange([null, null]);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}