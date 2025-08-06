import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useCostCenters } from '@/hooks/useCostCenters';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/useToast';

const costCenterSchema = z.object({
  code: z.string().min(1, 'Cost center code is required').max(20, 'Code must be 20 characters or less'),
  name: z.string().min(1, 'Cost center name is required').max(100, 'Name must be 100 characters or less'),
  type: z.enum(['department', 'project', 'location', 'function']),
  description: z.string().optional(),
  manager_id: z.string().optional(),
  parent_id: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  effective_from: z.date().optional(),
  effective_to: z.date().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().optional(),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

interface CostCenterFormProps {
  costCenter?: any;
  mode: 'create' | 'edit';
}

export default function CostCenterForm({ costCenter, mode }: CostCenterFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createCostCenter, isPending: isCreating } = useCostCenters();
  const { mutate: updateCostCenter, isPending: isUpdating } = useCostCenters();
  
  // Fetch users and cost centers for dropdowns
  const { data: users = [] } = useUsers();
  const { data: costCenters = [] } = useCostCenters();

  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: {
      code: costCenter?.code || '',
      name: costCenter?.name || '',
      type: costCenter?.type || 'department',
      description: costCenter?.description || '',
      manager_id: costCenter?.manager_id || '',
      parent_id: costCenter?.parent_id || '',
      location: costCenter?.location || '',
      budget: costCenter?.budget || undefined,
      effective_from: costCenter?.effective_from ? new Date(costCenter.effective_from) : undefined,
      effective_to: costCenter?.effective_to ? new Date(costCenter.effective_to) : undefined,
      status: costCenter?.status || 'active',
      notes: costCenter?.notes || '',
    },
  });

  const onSubmit = (data: CostCenterFormData) => {
    const submitData = {
      ...data,
      budget: data.budget || 0,
    };

    if (mode === 'create') {
      createCostCenter(submitData, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Cost center created successfully',
          });
          navigate('/finance/cost-centers');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create cost center',
            variant: 'destructive',
          });
        },
      });
    } else {
      updateCostCenter({ id: costCenter.id, ...submitData }, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Cost center updated successfully',
          });
          navigate(`/finance/cost-centers/${costCenter.id}`);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update cost center',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/finance/cost-centers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cost Centers
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Create Cost Center' : 'Edit Cost Center'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Add a new cost center to your organization' 
              : 'Update cost center information'
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CC001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Marketing Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="department">Department</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="function">Function</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the cost center"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Management & Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Management & Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No manager assigned</SelectItem>
                          {/* User list from API */}
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Cost Center</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent cost center" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No parent</SelectItem>
                          {/* Cost center list from API */}
                          {costCenters.map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.name} ({cc.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Budget</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location & Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Effective Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Building A, Floor 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effective_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholderText="Select start date"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effective_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective To</FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholderText="Select end date"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or comments"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/finance/cost-centers')}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Cost Center' : 'Update Cost Center')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 