import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { keycloak } from './keycloak';
import { useTenantStore } from '@/stores/tenant-store';

// Create axios instance - DISABLED FOR DEVELOPMENT
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - COMPLETELY DISABLED FOR DEVELOPMENT
apiClient.interceptors.request.use(
  async (config) => {
    // For development, completely block all API calls
    console.warn('API calls completely disabled for development - using mock data only');
    throw new Error('API calls disabled for development - using mock data');
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - COMPLETELY DISABLED FOR DEVELOPMENT
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // For development, always return mock data instead of making API calls
    console.warn('API call blocked for development - using mock data');
    return Promise.reject(new Error('API calls disabled for development - using mock data'));
  }
);

// API client wrapper - COMPLETELY DISABLED FOR DEVELOPMENT
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    console.warn(`API GET call to ${url} completely disabled for development`);
    return Promise.reject(new Error('API calls completely disabled for development'));
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    console.warn(`API POST call to ${url} completely disabled for development`);
    return Promise.reject(new Error('API calls completely disabled for development'));
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    console.warn(`API PUT call to ${url} completely disabled for development`);
    return Promise.reject(new Error('API calls completely disabled for development'));
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    console.warn(`API DELETE call to ${url} completely disabled for development`);
    return Promise.reject(new Error('API calls completely disabled for development'));
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    console.warn(`API PATCH call to ${url} completely disabled for development`);
    return Promise.reject(new Error('API calls completely disabled for development'));
  },
};

// Export the raw axios instance for advanced use cases - DISABLED
export { apiClient };