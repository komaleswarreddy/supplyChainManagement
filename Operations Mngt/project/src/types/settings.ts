import type { User } from './user';

export type GeneralSettings = {
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  fiscalYearStart: string;
};

export type NotificationSettings = {
  emailNotifications: boolean;
  stockAlerts: boolean;
  approvalReminders: boolean;
  systemUpdates: boolean;
  dailyReports: boolean;
};

export type SecuritySettings = {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionTimeout: number;
  mfaEnabled: boolean;
  ipWhitelist: string[];
};

export type WorkflowSettings = {
  approvalLevels: {
    procurement: number;
    inventory: number;
  };
  autoApprovalThresholds: {
    amount: number;
    currency: string;
  };
  delegations: {
    enabled: boolean;
    maxDays: number;
  };
};

export type IntegrationSettings = {
  erp: {
    enabled: boolean;
    provider: string;
    syncFrequency: string;
    lastSync?: string;
  };
  accounting: {
    enabled: boolean;
    provider: string;
    syncFrequency: string;
    lastSync?: string;
  };
};

export type AuditSettings = {
  retentionPeriod: number;
  detailedLogging: boolean;
  loggedActions: string[];
};

export type Settings = {
  id: string;
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  workflow: WorkflowSettings;
  integrations: IntegrationSettings;
  audit: AuditSettings;
  updatedBy: User;
  updatedAt: string;
};