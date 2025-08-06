export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  tenantName: string;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  preferences: UserPreferences;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  department?: string;
  position?: string;
  phone?: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserActivity {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isActive: boolean;
}

export interface UserDashboard {
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    timestamp: string;
  }>;
  pendingTasks: Array<{
    id: string;
    type: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  statistics: {
    totalOrders: number;
    totalInvoices: number;
    totalProcurements: number;
    pendingApprovals: number;
  };
}

export interface UserPermission {
  resource: string;
  actions: string[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  recentRegistrations: Array<{
    userId: string;
    userName: string;
    registeredAt: string;
  }>;
  loginActivity: Array<{
    date: string;
    loginCount: number;
    uniqueUsers: number;
  }>;
}