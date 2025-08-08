import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan?: string;
  settings?: Record<string, any>;
  userRole?: string;
  isOwner?: boolean;
}

interface TenantState {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant) => void;
  fetchUserTenants: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (tenant: Partial<Tenant>) => Promise<Tenant>;
}

// Mock tenant data for development
const MOCK_TENANTS: Tenant[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Demo Company',
    slug: 'demo-supplier-test',
    domain: 'demo-supplier-test.example.com',
    plan: 'PROFESSIONAL',
    userRole: 'ADMIN',
    isOwner: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Test Organization',
    slug: 'test',
    domain: 'test.example.com',
    plan: 'BASIC',
    userRole: 'ADMIN',
    isOwner: true,
  }
];

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: MOCK_TENANTS[0], // Set default tenant for development
      userTenants: MOCK_TENANTS,
      isLoading: false,
      error: null,
      
      setCurrentTenant: (tenant) => {
        set({ currentTenant: tenant });
      },
      
      fetchUserTenants: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Use mock data for development
          const tenants = MOCK_TENANTS;
          
          set({ userTenants: tenants });
          
          // Set current tenant if not already set
          const { currentTenant } = get();
          if (!currentTenant && tenants.length > 0) {
            set({ currentTenant: tenants[0] });
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching user tenants:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch tenants',
            userTenants: [] // Set empty array to prevent undefined errors
          });
        }
      },
      
      switchTenant: async (tenantId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Find tenant in mock data
          const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
          if (tenant) {
            set({ currentTenant: tenant });
          }
          
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('Error switching tenant:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to switch tenant' 
          });
          throw error;
        }
      },
      
      createTenant: async (tenantData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create mock tenant
          const newTenant: Tenant = {
            id: `tenant-${MOCK_TENANTS.length + 1}`,
            name: tenantData.name || 'New Tenant',
            slug: tenantData.slug || `tenant-${MOCK_TENANTS.length + 1}`,
            domain: tenantData.domain,
            plan: tenantData.plan || 'BASIC',
            userRole: 'ADMIN',
            isOwner: true,
          };
          
          // Add to mock tenants
          MOCK_TENANTS.push(newTenant);
          
          // Update state
          const { userTenants } = get();
          set({ 
            userTenants: [...userTenants, newTenant],
            currentTenant: newTenant,
            isLoading: false 
          });
          
          return newTenant;
        } catch (error) {
          console.error('Error creating tenant:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to create tenant' 
          });
          throw error;
        }
      },
    }),
    {
      name: 'tenant-store',
      partialize: (state) => ({ currentTenant: state.currentTenant }),
    }
  )
);