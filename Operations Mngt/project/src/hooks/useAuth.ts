import { useState, useCallback, useEffect } from 'react';
import { keycloak, initKeycloak } from '@/lib/keycloak';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use a mock user for development instead of Keycloak
        // This bypasses the Keycloak initialization completely
        const mockUser = {
          id: 'user-1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          roles: ['admin', 'user'],
          permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports', 'manage_inventory'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setUser(mockUser);
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setError(error);
        setUser(null);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeKeycloak();
  }, []);

  const login = useCallback(async () => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      // For development, just set the mock user
      const mockUser = {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['admin', 'user'],
        permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports', 'manage_inventory'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const logout = useCallback(async () => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      // For development, just clear the user
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const getToken = useCallback(() => {
    // Return a mock token for development
    return 'mock-token';
  }, []);

  const updateToken = useCallback(async (minValidity = 30) => {
    // Always return true for development
    return true;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isInitialized,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
    getToken,
    updateToken,
  };
}