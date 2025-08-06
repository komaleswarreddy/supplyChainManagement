import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useTenantStore } from '@/stores/tenant-store';
import { FormContainer, FormInput, FormSelect } from '@/components/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2 } from 'lucide-react';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  domain: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']).default('BASIC'),
});

export default function NewTenantPage() {
  const { createTenant, isLoading } = useTenantStore();
  const navigate = useNavigate();

  const handleSubmit = async (data: z.infer<typeof tenantSchema>) => {
    try {
      await createTenant(data);
      navigate('/tenants');
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center">
        <Building2 className="mr-2 h-6 w-6" />
        <h1 className="text-3xl font-bold">Create New Organization</h1>
      </div>

      <FormContainer
        schema={tenantSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          name: '',
          slug: '',
          domain: '',
          plan: 'BASIC',
        }}
        submitText={isLoading ? 'Creating...' : 'Create Organization'}
        cancelText="Cancel"
        onCancel={() => navigate('/tenants')}
      >
        <div className="space-y-6">
          <FormInput
            name="name"
            label="Organization Name"
            placeholder="Enter organization name"
            description="The display name of your organization"
          />
          
          <FormInput
            name="slug"
            label="Slug"
            placeholder="organization-slug"
            description="Used in URLs and API calls. Only lowercase letters, numbers, and hyphens."
          />
          
          <FormInput
            name="domain"
            label="Domain (Optional)"
            placeholder="https://example.com"
            description="Custom domain for your organization"
          />
          
          <FormSelect
            name="plan"
            label="Plan"
            options={[
              { label: 'Basic', value: 'BASIC' },
              { label: 'Professional', value: 'PROFESSIONAL' },
              { label: 'Enterprise', value: 'ENTERPRISE' },
            ]}
            description="Select the plan for your organization"
          />
        </div>
      </FormContainer>
    </div>
  );
}