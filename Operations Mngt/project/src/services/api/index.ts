// Core API Services
export { purchaseOrderApi } from './purchase-order';
export { userApi } from './user';
export { contractApi } from './contract';
export { supplyChainApi } from './supply-chain';
export { inventoryApi } from './inventory';
export { supplierApi } from './supplier';
export { procurementApi } from './procurement';
export { inventoryOptimizationApi } from './inventory-optimization';

// Existing API Services
export { serviceAppointmentAPI } from './service-appointments';
export { mobileAPI, mobileAnalyticsAPI } from './mobile';
export { integrationAPI, integrationAnalyticsAPI } from './integrations';
export { automationAPI, automationAnalyticsAPI } from './automation';
export { logisticsAPI, logisticsAnalyticsAPI } from './logistics';
export { invoiceAPI, invoiceAnalyticsAPI } from './invoices';
export { contractAPI, contractPartyAPI, contractTermAPI, contractAmendmentAPI, contractObligationAPI, contractMilestoneAPI, contractComplianceAPI, contractTemplateAPI, contractAnalyticsAPI } from './contracts';
export { warehouseAPI, warehouseZoneAPI, warehouseTaskAPI, cycleCountAPI, pickPathAPI, warehouseAnalyticsAPI } from './warehouse';
export { costCenterApi, budgetAPI, glAccountAPI, glTransactionAPI, financialReportAPI, financeAnalyticsAPI } from './finance';

// API Client Configuration
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
axios.defaults.timeout = 30000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Error Handler
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return `Bad Request: ${data.message || 'Invalid request data'}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return 'Forbidden: You do not have permission to perform this action';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 422:
        return `Validation Error: ${data.message || 'Invalid data provided'}`;
      case 500:
        return 'Internal Server Error: Please try again later';
      default:
        return `Error ${status}: ${data.message || 'An unexpected error occurred'}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network Error: Please check your internet connection';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

// API Response Handler
export const handleApiResponse = <T>(response: any): T => {
  return response.data;
};

// API Pagination Helper
export const createPaginationParams = (page: number = 1, limit: number = 10, filters?: Record<string, any>) => {
  return {
    page,
    limit,
    ...filters,
  };
};

// API Search Helper
export const createSearchParams = (search: string, filters?: Record<string, any>) => {
  return {
    search,
    ...filters,
  };
};

// API Date Range Helper
export const createDateRangeParams = (startDate: string, endDate: string, filters?: Record<string, any>) => {
  return {
    startDate,
    endDate,
    ...filters,
  };
};

// Export axios instance for direct use if needed
export { axios as apiClient };

