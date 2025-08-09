import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  roles: string[];
  permissions: string[];
  department?: string;
  title?: string;
  status: string;
  lastLogin?: string;
}



interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  title?: string;
  phoneNumber?: string;
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth`;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        if (token) {
          // Verify token and get user info
          const response = await axios.get(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      const { accessToken, refreshToken, user: userData } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set user data
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      console.error('Login failed:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, data);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration failed:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Call logout endpoint to invalidate tokens
        await axios.post(`${API_BASE_URL}/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and user state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    return localStorage.getItem('accessToken');
  }, []);

  const updateToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await axios.post(`${API_BASE_URL}/refresh`, {
        refreshToken
      });

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isInitialized,
    error,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    hasRole,
    hasPermission,
    getToken,
    updateToken,
  };
}