import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { keycloak } from './keycloak';
import { useTenantStore } from '@/stores/tenant-store';
import type { ErrorResponse } from '@/types/common';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleRequest = async (config: InternalAxiosRequestConfig) => {
  // Add tenant header
  const tenantStore = useTenantStore.getState();
  console.log('API Request - Tenant Store State:', tenantStore);
  
  if (tenantStore.currentTenant?.id) {
    config.headers['X-Tenant-ID'] = tenantStore.currentTenant.id;
    console.log('Setting X-Tenant-ID header:', tenantStore.currentTenant.id);
  } else {
    console.log('No current tenant found in store');
  }
  
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
  
  console.log('Final request headers:', config.headers);
  return config;
};

api.interceptors.request.use(handleRequest);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorResponse: ErrorResponse = {
      message: 'An unexpected error occurred',
      status: 500,
    };

    if (error.response) {
      errorResponse.message = error.response.data.message || error.message;
      errorResponse.status = error.response.status;
      errorResponse.errors = error.response.data.errors;

      if (error.response.status === 401) {
        await keycloak.login();
      }
    }

    return Promise.reject(errorResponse);
  }
);