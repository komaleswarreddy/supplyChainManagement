import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenantStore } from '@/stores/tenant-store';

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { fetchUserTenants } = useTenantStore();

  useEffect(() => {
    // Only fetch tenants when user is authenticated and auth is initialized
    if (auth.isAuthenticated && auth.isInitialized && !auth.isLoading) {
      fetchUserTenants().catch(err => {
        console.error("Error fetching user tenants:", err);
      });
    }
  }, [auth.isAuthenticated, auth.isInitialized, auth.isLoading, fetchUserTenants]);

  // Show loading while auth is initializing or during auth operations
  if (auth.isLoading || !auth.isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}