import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { FormContainer, FormInput, FormSelect, FormSection } from '@/components/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Building2, Settings, Users, CreditCard } from 'lucide-react';
import { useTenantStore, Tenant } from '@/stores/tenant-store';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  domain: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']).default('BASIC'),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    currency: z.string().min(1, 'Currency is required'),
    dateFormat: z.string().min(1, 'Date format is required'),
    timezone: z.string().min(1, 'Timezone is required'),
  }).optional(),
});

export default function TenantSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userTenants, currentTenant } = useTenantStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setIsLoading(true);
        // First check if it's in the user tenants
        const foundTenant = userTenants.find(t => t.id === id);
        if (foundTenant) {
          setTenant(foundTenant);
        } else {
          // If not, fetch from API
          const response = await api.get(`/tenants/${id}`);
          setTenant(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [id, userTenants]);

  const handleSubmit = async (data: z.infer<typeof tenantSchema>) => {
    try {
      setIsSaving(true);
      await api.put(`/tenants/${id}`, data);
      // Refresh tenant data
      const response = await api.get(`/tenants/${id}`);
      setTenant(response.data);
    } catch (error) {
      console.error('Failed to update tenant:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold">Organization not found</h2>
          <p className="mt-2 text-muted-foreground">
            The organization you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/tenants')}
          >
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="mr-2 h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">
              {tenant.domain || `${tenant.slug}.example.com`}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {tenant.plan || 'Basic'} Plan
        </Badge>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <FormContainer
            schema={tenantSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              name: tenant.name,
              slug: tenant.slug,
              domain: tenant.domain || '',
              plan: (tenant.plan as any) || 'BASIC',
              settings: tenant.settings || {
                theme: 'system',
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                timezone: 'America/New_York',
              },
            }}
            submitText={isSaving ? 'Saving...' : 'Save Changes'}
          >
            <FormSection title="Organization Details">
              <FormInput
                name="name"
                label="Organization Name"
                placeholder="Enter organization name"
              />
              
              <FormInput
                name="slug"
                label="Slug"
                placeholder="organization-slug"
                description="Used in URLs and API calls"
                disabled={tenant.id === currentTenant?.id}
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
                disabled={!tenant.isOwner}
              />
            </FormSection>

            <FormSection title="Organization Settings">
              <FormSelect
                name="settings.theme"
                label="Default Theme"
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'System', value: 'system' },
                ]}
              />
              
              <FormSelect
                name="settings.currency"
                label="Default Currency"
                options={[
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'GBP (£)', value: 'GBP' },
                  { label: 'CAD ($)', value: 'CAD' },
                  { label: 'AUD ($)', value: 'AUD' },
                ]}
              />
              
              <FormSelect
                name="settings.dateFormat"
                label="Date Format"
                options={[
                  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                ]}
              />
              
              <FormSelect
                name="settings.timezone"
                label="Timezone"
                options={[
                  { label: 'Eastern Time (ET)', value: 'America/New_York' },
                  { label: 'Central Time (CT)', value: 'America/Chicago' },
                  { label: 'Mountain Time (MT)', value: 'America/Denver' },
                  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
                  { label: 'UTC', value: 'UTC' },
                  { label: 'London (GMT)', value: 'Europe/London' },
                  { label: 'Paris (CET)', value: 'Europe/Paris' },
                  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
                ]}
              />
            </FormSection>
          </FormContainer>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-muted-foreground">
              Manage users in your organization
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate(`/tenants/${id}/users`)}>
                Manage Users
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Billing</h2>
            <p className="text-muted-foreground">
              Manage your subscription and billing information
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate(`/tenants/${id}/billing`)}>
                Manage Billing
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}