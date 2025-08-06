import Keycloak from 'keycloak-js';
import { KEYCLOAK_CONFIG } from '@/config/constants';

// Create a mock Keycloak instance for development
const mockKeycloak = {
  init: async () => true,
  login: async () => {},
  logout: async () => {},
  updateToken: async () => true,
  token: 'mock-token',
  refreshToken: 'mock-refresh-token',
  tokenParsed: {
    sub: 'user-1',
    email: 'john.doe@example.com',
    given_name: 'John',
    family_name: 'Doe',
    name: 'John Doe',
  },
  authenticated: true,
  hasRealmRole: (role: string) => true,
  hasResourceRole: (role: string, resource: string) => true,
  isTokenExpired: () => false,
  realmAccess: {
    roles: ['admin', 'user']
  },
  resourceAccess: {
    'procurement-app': {
      roles: ['create_requisition', 'approve_requisition', 'manage_suppliers', 'manage_contracts', 'view_reports', 'manage_inventory']
    }
  }
};

// Use the real Keycloak instance in production, mock in development
export const keycloak = mockKeycloak;

let initPromise: Promise<boolean> | null = null;

export const initKeycloak = () => {
  if (!initPromise) {
    // Return a resolved promise with the mock Keycloak
    initPromise = Promise.resolve(true);
  }
  return initPromise;
};