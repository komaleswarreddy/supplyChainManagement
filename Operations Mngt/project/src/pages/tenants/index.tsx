import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore, Tenant } from '@/stores/tenant-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, Settings, ExternalLink } from 'lucide-react';

export default function TenantsPage() {
  const { userTenants, currentTenant, isLoading, fetchUserTenants, switchTenant } = useTenantStore();
  const navigate = useNavigate();
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTenants();
  }, [fetchUserTenants]);

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      setSwitchingTenant(tenantId);
      await switchTenant(tenantId);
      navigate('/');
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    } finally {
      setSwitchingTenant(null);
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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage your organizations and switch between them</p>
        </div>
        <Button onClick={() => navigate('/tenants/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userTenants.map((tenant: Tenant) => (
          <Card key={tenant.id} className={tenant.id === currentTenant?.id ? 'border-primary' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {tenant.name}
                </CardTitle>
                {tenant.id === currentTenant?.id && (
                  <Badge variant="outline" className="bg-primary/10">Current</Badge>
                )}
              </div>
              <CardDescription>
                {tenant.domain || `${tenant.slug}.example.com`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <Badge variant="secondary">{tenant.plan || 'Basic'}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your role:</span>
                  <Badge>{tenant.userRole || 'User'}</Badge>
                </div>
                {tenant.isOwner && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <Badge variant="outline">Yes</Badge>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {tenant.id === currentTenant?.id ? (
                <Button variant="outline" onClick={() => navigate(`/tenants/${tenant.id}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => handleSwitchTenant(tenant.id)}
                  disabled={switchingTenant === tenant.id}
                >
                  {switchingTenant === tenant.id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Switch to
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate(`/tenants/${tenant.id}/users`)}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {userTenants.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No organizations yet</h3>
          <p className="mb-4 text-muted-foreground">
            Create your first organization to get started
          </p>
          <Button onClick={() => navigate('/tenants/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      )}
    </div>
  );
}