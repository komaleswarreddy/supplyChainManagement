export const APP_NAME = 'PLS-SCM';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'pls-scm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'pls-scm-client',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROCUREMENT: {
    ROOT: '/procurement',
    REQUISITIONS: '/procurement/requisitions',
    PURCHASE_ORDERS: '/procurement/purchase-orders',
    CONTRACTS: '/procurement/contracts',
    SUPPLIERS: '/procurement/suppliers',
  },
  INVENTORY: {
    ROOT: '/inventory',
    STOCK: '/inventory/stock',
    MOVEMENTS: '/inventory/movements',
    ADJUSTMENTS: '/inventory/adjustments',
  },
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: '/users',
  PROCUREMENT: {
    REQUISITIONS: '/procurement/requisitions',
    PURCHASE_ORDERS: '/procurement/purchase-orders',
    CONTRACTS: '/procurement/contracts',
    SUPPLIERS: '/procurement/suppliers',
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';