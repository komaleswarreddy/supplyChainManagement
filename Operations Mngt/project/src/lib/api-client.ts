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
    // Add auth token if available
    if (keycloak.token) {
      const hasTokenExpired = keycloak.isTokenExpired();
      if (hasTokenExpired) {
        try {
          await keycloak.updateToken(5);
        } catch (error) {
          await keycloak.login();
        }
      }
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }

    // Add tenant header if available
    const tenantStore = useTenantStore.getState();
    if (tenantStore.currentTenant) {
      config.headers['X-Tenant-ID'] = tenantStore.currentTenant.id;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await keycloak.updateToken(5);
        // Retry the original request
        const originalRequest = error.config as AxiosRequestConfig;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await keycloak.login();
      }
    }

    // Handle 403 Forbidden related to tenant access
    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes('tenant')) {
      // Notify user about tenant access issue
      console.error('Tenant access error:', error.response.data.message);
      // Could redirect to tenant selection page or show a modal
    }

    return Promise.reject(error);
  }
);

// API client wrapper
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },
};

// Export the raw axios instance for advanced use cases
export { apiClient };