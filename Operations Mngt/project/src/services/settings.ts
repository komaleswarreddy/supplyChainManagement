import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/common';
import type { Settings } from '@/types/settings';

// Mock data for development
const MOCK_SETTINGS: Settings = {
  id: 'settings-1',
  general: {
    companyName: 'Acme Corporation',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en-US',
    fiscalYearStart: '01-01',
  },
  notifications: {
    emailNotifications: true,
    stockAlerts: true,
    approvalReminders: true,
    systemUpdates: true,
    dailyReports: false,
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    sessionTimeout: 30,
    mfaEnabled: false,
    ipWhitelist: [],
  },
  workflow: {
    approvalLevels: {
      procurement: 2,
      inventory: 1,
    },
    autoApprovalThresholds: {
      amount: 1000,
      currency: 'USD',
    },
    delegations: {
      enabled: true,
      maxDays: 30,
    },
  },
  integrations: {
    erp: {
      enabled: false,
      provider: '',
      syncFrequency: 'daily',
    },
    accounting: {
      enabled: false,
      provider: '',
      syncFrequency: 'daily',
    },
  },
  audit: {
    retentionPeriod: 365,
    detailedLogging: true,
    loggedActions: [
      'login',
      'logout',
      'create',
      'update',
      'delete',
      'approve',
      'reject',
    ],
  },
  updatedBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['admin'],
    permissions: ['manage_settings'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  updatedAt: new Date().toISOString(),
};

export const settingsService = {
  getSettings: async (): Promise<ApiResponse<Settings>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: MOCK_SETTINGS,
      status: 200,
    };
  },

  updateSettings: async (settings: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedSettings: Settings = {
      ...MOCK_SETTINGS,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: updatedSettings,
      status: 200,
    };
  },
};