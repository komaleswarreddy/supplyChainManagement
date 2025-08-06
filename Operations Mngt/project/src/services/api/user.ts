import axios from 'axios';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, UserStatus } from '@/types/user';

const API_BASE_URL = '/api/users';

export const userApi = {
  // Get all users with filtering and pagination
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    tenantId?: string;
    search?: string;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  // Get a single user by ID
  async getUser(id: string): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/me`);
    return response.data;
  },

  // Create a new user
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  // Update an existing user
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Update current user profile
  async updateCurrentUser(data: Partial<UpdateUserRequest>): Promise<User> {
    const response = await axios.put(`${API_BASE_URL}/me`, data);
    return response.data;
  },

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Activate a user
  async activateUser(id: string): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/${id}/activate`);
    return response.data;
  },

  // Deactivate a user
  async deactivateUser(id: string, reason?: string): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/${id}/deactivate`, { reason });
    return response.data;
  },

  // Reset user password
  async resetPassword(id: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/${id}/reset-password`);
    return response.data;
  },

  // Change user password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/change-password`, data);
    return response.data;
  },

  // Assign roles to user
  async assignRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/${id}/roles`, { roles });
    return response.data;
  },

  // Remove roles from user
  async removeRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await axios.delete(`${API_BASE_URL}/${id}/roles`, { data: { roles } });
    return response.data;
  },

  // Get user permissions
  async getUserPermissions(id: string): Promise<Array<{
    resource: string;
    actions: string[];
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/permissions`);
    return response.data;
  },

  // Get user activity log
  async getUserActivity(id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: Array<{
      id: string;
      action: string;
      resource: string;
      resourceId?: string;
      details: any;
      ipAddress: string;
      userAgent: string;
      timestamp: string;
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/activity`, { params });
    return response.data;
  },

  // Get user sessions
  async getUserSessions(id: string): Promise<Array<{
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    location: string;
    lastActive: string;
    isActive: boolean;
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/sessions`);
    return response.data;
  },

  // Revoke user session
  async revokeSession(id: string, sessionId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}/sessions/${sessionId}`);
  },

  // Revoke all user sessions
  async revokeAllSessions(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}/sessions`);
  },

  // Get user preferences
  async getUserPreferences(id: string): Promise<Record<string, any>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/preferences`);
    return response.data;
  },

  // Update user preferences
  async updateUserPreferences(id: string, preferences: Record<string, any>): Promise<Record<string, any>> {
    const response = await axios.put(`${API_BASE_URL}/${id}/preferences`, preferences);
    return response.data;
  },

  // Get user dashboard data
  async getUserDashboard(id: string): Promise<{
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
  }> {
    const response = await axios.get(`${API_BASE_URL}/${id}/dashboard`);
    return response.data;
  },

  // Bulk operations
  async bulkActivate(ids: string[]): Promise<User[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/activate`, { ids });
    return response.data;
  },

  async bulkDeactivate(ids: string[], reason?: string): Promise<User[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/deactivate`, { ids, reason });
    return response.data;
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await axios.delete(`${API_BASE_URL}/bulk`, { data: { ids } });
  },

  // Export users
  async exportUsers(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    role?: UserRole;
    status?: UserStatus;
    tenantId?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



