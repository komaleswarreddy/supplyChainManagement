import React, { useEffect, useState } from 'react';
import { useTenantStore, Tenant } from '@/stores/tenant-store';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building2, ChevronDown, Plus, Settings } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';

export function TenantSelector() {
  const { currentTenant, userTenants, isLoading, fetchUserTenants, switchTenant } = useTenantStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserTenants();
  }, [fetchUserTenants]);

  const handleTenantChange = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      setOpen(false);
      // Reload the page to refresh data with new tenant context
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    }
  };

  const handleCreateTenant = () => {
    navigate('/tenants/new');
    setOpen(false);
  };

  const handleManageTenants = () => {
    navigate('/tenants');
    setOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!currentTenant) {
    return (
      <Button variant="outline" onClick={handleCreateTenant} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Create Organization</span>
        <span className="sm:hidden">New Org</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[100px] sm:max-w-[150px] truncate">{currentTenant.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Switch organization</p>
            {userTenants.length > 0 ? (
              <Select
                value={currentTenant.id}
                onChange={(e) => handleTenantChange(e.target.value)}
              >
                {userTenants.map((tenant: Tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">No organizations found</p>
            )}
          </div>
          
          <div className="flex flex-col space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCreateTenant}
              className="justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManageTenants}
              className="justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage organizations
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}