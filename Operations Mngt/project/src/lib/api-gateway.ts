import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { keycloak } from './keycloak';
import { useTenantStore } from '@/stores/tenant-store';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // Maximum requests per window
  windowMs: 60000, // Window size in milliseconds (1 minute)
  tokens: new Map<string, { count: number; resetTime: number }>(),
};

// API metrics tracking
const API_METRICS = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimeTotal: 0,
  endpoints: new Map<string, { 
    calls: number, 
    errors: number, 
    totalResponseTime: number 
  }>(),
};

// Create axios instance with enhanced features
const apiGateway = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor with advanced features
apiGateway.interceptors.request.use(
  async (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };

    // Add request ID for tracing
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    config.headers['X-Request-ID'] = requestId;

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

    // Apply rate limiting
    const endpoint = `${config.method}:${config.url}`;
    const key = `${endpoint}:${keycloak.subject || 'anonymous'}`;
    
    const now = Date.now();
    const tokenBucket = RATE_LIMIT.tokens.get(key) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };
    
    // Reset bucket if window has passed
    if (now > tokenBucket.resetTime) {
      tokenBucket.count = 0;
      tokenBucket.resetTime = now + RATE_LIMIT.windowMs;
    }
    
    // Check if rate limit exceeded
    if (tokenBucket.count >= RATE_LIMIT.maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Increment request count
    tokenBucket.count += 1;
    RATE_LIMIT.tokens.set(key, tokenBucket);

    // Track API metrics
    API_METRICS.totalRequests += 1;
    const endpointMetrics = API_METRICS.endpoints.get(endpoint) || { calls: 0, errors: 0, totalResponseTime: 0 };
    endpointMetrics.calls += 1;
    API_METRICS.endpoints.set(endpoint, endpointMetrics);

    return config;
  },
  (error) => {
    API_METRICS.failedRequests += 1;
    return Promise.reject(error);
  }
);

// Response interceptor with advanced features
apiGateway.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate response time
    const endTime = Date.now();
    const startTime = response.config.metadata?.startTime || endTime;
    const responseTime = endTime - startTime;
    
    // Update metrics
    API_METRICS.successfulRequests += 1;
    API_METRICS.responseTimeTotal += responseTime;
    
    const endpoint = `${response.config.method}:${response.config.url}`;
    const endpointMetrics = API_METRICS.endpoints.get(endpoint) || { calls: 0, errors: 0, totalResponseTime: 0 };
    endpointMetrics.totalResponseTime += responseTime;
    API_METRICS.endpoints.set(endpoint, endpointMetrics);
    
    // Add response time to response headers for client-side monitoring
    response.headers['X-Response-Time'] = `${responseTime}ms`;
    
    return response;
  },
  async (error: AxiosError) => {
    // Update error metrics
    API_METRICS.failedRequests += 1;
    
    if (error.config) {
      const endpoint = `${error.config.method}:${error.config.url}`;
      const endpointMetrics = API_METRICS.endpoints.get(endpoint) || { calls: 0, errors: 0, totalResponseTime: 0 };
      endpointMetrics.errors += 1;
      API_METRICS.endpoints.set(endpoint, endpointMetrics);
    }
    
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
        return apiGateway(originalRequest);
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

    // Handle 429 Too Many Requests (Rate Limiting)
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
      console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      
      // Could implement automatic retry with exponential backoff
      // For now, just reject with a clear message
      return Promise.reject({
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        status: 429,
        retryAfter,
      });
    }

    return Promise.reject(error);
  }
);

// API Gateway wrapper with enhanced features
export const apiGateway = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiGateway.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiGateway.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiGateway.put<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiGateway.delete<T>(url, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiGateway.patch<T>(url, data, config);
  },
  
  // Advanced features
  metrics: {
    get: () => ({ ...API_METRICS }),
    reset: () => {
      API_METRICS.totalRequests = 0;
      API_METRICS.successfulRequests = 0;
      API_METRICS.failedRequests = 0;
      API_METRICS.responseTimeTotal = 0;
      API_METRICS.endpoints.clear();
    },
    getEndpointMetrics: (endpoint: string) => API_METRICS.endpoints.get(endpoint),
  },
  
  rateLimit: {
    get: (key: string) => RATE_LIMIT.tokens.get(key),
    reset: (key?: string) => {
      if (key) {
        RATE_LIMIT.tokens.delete(key);
      } else {
        RATE_LIMIT.tokens.clear();
      }
    },
    configure: (config: { maxRequests?: number; windowMs?: number }) => {
      if (config.maxRequests) RATE_LIMIT.maxRequests = config.maxRequests;
      if (config.windowMs) RATE_LIMIT.windowMs = config.windowMs;
    },
  },
  
  // Webhook registration and management
  webhooks: {
    register: async (event: string, url: string, secret: string) => {
      return apiGateway.post('/webhooks/register', { event, url, secret });
    },
    unregister: async (id: string) => {
      return apiGateway.delete(`/webhooks/${id}`);
    },
    list: async () => {
      return apiGateway.get('/webhooks');
    },
    testWebhook: async (id: string) => {
      return apiGateway.post(`/webhooks/${id}/test`);
    },
  },
  
  // Batch request processing
  batch: async <T = any>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: any;
    config?: AxiosRequestConfig;
  }>) => {
    return apiGateway.post<T[]>('/batch', { requests });
  },
};

// Export the raw axios instance for advanced use cases
export { apiGateway as apiGatewayInstance };