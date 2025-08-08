import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { keycloak } from './keycloak';
import { useTenantStore } from '@/stores/tenant-store';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get tenant ID from store
      const tenantStore = useTenantStore.getState();
      if (tenantStore.currentTenant?.id) {
        config.headers['X-Tenant-ID'] = tenantStore.currentTenant.id;
      }

      // Add authentication token if available
      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        
        // Refresh token if needed
        if (keycloak.isTokenExpired(30)) {
          await keycloak.updateToken(70);
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      try {
        await keycloak.logout();
      } catch (logoutError) {
        console.error('Logout error:', logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API client wrapper
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete(url, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch(url, data, config);
  },
};

// Export the raw axios instance for advanced use cases
export { apiClient };