import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { User, UserGroup, Role, UserFilters } from '@/types/user';

// Mock data for development
const MOCK_USERS: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  firstName: `First${i + 1}`,
  lastName: `Last${i + 1}`,
  name: `First${i + 1} Last${i + 1}`,
  title: 'Software Engineer',
  department: 'Engineering',
  employeeId: `EMP${String(i + 1).padStart(5, '0')}`,
  phoneNumber: '+1234567890',
  roles: ['user'],
  permissions: ['create_requisition'],
  status: 'active',
  lastLogin: new Date().toISOString(),
  passwordLastChanged: new Date().toISOString(),
  mfaEnabled: false,
  preferences: {
    language: 'en-US',
    timezone: 'America/New_York',
    theme: 'system',
    notifications: {
      email: true,
      inApp: true,
      desktop: false,
    },
  },
  metadata: {
    costCenter: 'CC001',
    location: 'New York',
    division: 'North America',
  },
  supervisor: {
    id: 'user-sup-1',
    name: 'John Manager',
    email: 'john.manager@example.com',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_GROUPS: UserGroup[] = [
  {
    id: 'group-1',
    name: 'Engineering Team',
    description: 'All engineering staff',
    members: ['user-1', 'user-2', 'user-3'],
    roles: ['user'],
    permissions: ['create_requisition'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'group-2',
    name: 'Procurement Team',
    description: 'Procurement staff',
    members: ['user-4', 'user-5'],
    roles: ['user', 'approver'],
    permissions: ['create_requisition', 'approve_requisition'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'Administrator',
    description: 'System administrator with full access',
    permissions: ['manage_users', 'manage_roles', 'manage_settings'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-2',
    name: 'Procurement Manager',
    description: 'Manages procurement processes',
    permissions: ['create_requisition', 'approve_requisition', 'manage_suppliers'],
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const userService = {
  // Users
  getUsers: async (
    params: PaginationParams & UserFilters
  ): Promise<PaginatedResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_USERS];

    if (params.status) {
      filteredData = filteredData.filter(user => user.status === params.status);
    }
    if (params.role) {
      filteredData = filteredData.filter(user => user.roles.includes(params.role!));
    }
    if (params.department) {
      filteredData = filteredData.filter(user => 
        user.department?.toLowerCase().includes(params.department!.toLowerCase())
      );
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(user => 
        user.name?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.employeeId?.toLowerCase().includes(search)
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= start && createdAt <= end;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_USERS.find(user => user.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      data: user,
      status: 200,
    };
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user-${MOCK_USERS.length + 1}`,
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);

    return {
      data: newUser,
      status: 201,
    };
  },

  updateUser: async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS[index] = {
      ...MOCK_USERS[index],
      ...user,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_USERS[index],
      status: 200,
    };
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS.splice(index, 1);

    return {
      status: 204,
    };
  },

  // Groups
  getGroups: async (): Promise<ApiResponse<UserGroup[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: MOCK_GROUPS,
      status: 200,
    };
  },

  getGroupById: async (id: string): Promise<ApiResponse<UserGroup>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const group = MOCK_GROUPS.find(group => group.id === id);

    if (!group) {
      throw new Error('Group not found');
    }

    return {
      data: group,
      status: 200,
    };
  },

  createGroup: async (group: Omit<UserGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserGroup>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newGroup: UserGroup = {
      id: `group-${MOCK_GROUPS.length + 1}`,
      ...group,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_GROUPS.push(newGroup);

    return {
      data: newGroup,
      status: 201,
    };
  },

  updateGroup: async (id: string, group: Partial<UserGroup>): Promise<ApiResponse<UserGroup>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_GROUPS.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Group not found');
    }

    MOCK_GROUPS[index] = {
      ...MOCK_GROUPS[index],
      ...group,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_GROUPS[index],
      status: 200,
    };
  },

  deleteGroup: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_GROUPS.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Group not found');
    }

    MOCK_GROUPS.splice(index, 1);

    return {
      status: 204,
    };
  },

  // Roles
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: MOCK_ROLES,
      status: 200,
    };
  },

  getRoleById: async (id: string): Promise<ApiResponse<Role>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const role = MOCK_ROLES.find(role => role.id === id);

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      data: role,
      status: 200,
    };
  },

  createRole: async (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Role>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRole: Role = {
      id: `role-${MOCK_ROLES.length + 1}`,
      ...role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_ROLES.push(newRole);

    return {
      data: newRole,
      status: 201,
    };
  },

  updateRole: async (id: string, role: Partial<Role>): Promise<ApiResponse<Role>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_ROLES.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Role not found');
    }

    MOCK_ROLES[index] = {
      ...MOCK_ROLES[index],
      ...role,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_ROLES[index],
      status: 200,
    };
  },

  deleteRole: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_ROLES.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Role not found');
    }

    if (MOCK_ROLES[index].isSystem) {
      throw new Error('Cannot delete system role');
    }

    MOCK_ROLES.splice(index, 1);

    return {
      status: 204,
    };
  },
};