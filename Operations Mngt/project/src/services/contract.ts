import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Contract, 
  ContractFormData, 
  ContractFilters 
} from '@/types/contract';

// Mock data for development
const MOCK_CONTRACTS: Contract[] = Array.from({ length: 10 }, (_, i) => ({
  id: `contract-${i + 1}`,
  contractNumber: `CON-2024-${String(i + 1).padStart(4, '0')}`,
  title: `Service Agreement ${i + 1}`,
  description: 'Annual service agreement for equipment maintenance and support.',
  type: 'SERVICE',
  status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'][Math.floor(Math.random() * 4)],
  priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
  supplier: {
    id: 'sup-1',
    name: 'Acme Corporation',
    code: 'ACME001',
    type: 'SERVICE_PROVIDER',
    status: 'ACTIVE',
    taxId: '123-45-6789',
    registrationNumber: 'REG123456',
    website: 'https://acme.example.com',
    industry: 'Technology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  value: 50000,
  currency: 'USD',
  renewalType: 'AUTOMATIC',
  autoRenew: true,
  renewalNotificationDays: 60,
  noticePeriodDays: 30,
  items: [
    {
      id: `item-${i}-1`,
      itemCode: 'SVC-001',
      description: 'Equipment Maintenance',
      unitPrice: 2000,
      currency: 'USD',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      specifications: 'Monthly preventive maintenance and repairs',
    },
  ],
  milestones: [
    {
      id: `milestone-${i}-1`,
      title: 'Contract Start',
      description: 'Official start of service agreement',
      dueDate: new Date().toISOString(),
      status: 'COMPLETED',
      completedDate: new Date().toISOString(),
      completedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['contract_manager'],
        permissions: ['manage_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],
  documents: [
    {
      id: `doc-${i}-1`,
      title: 'Service Agreement',
      type: 'CONTRACT',
      version: '1.0',
      url: 'https://example.com/contracts/service-agreement.pdf',
      uploadedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['contract_manager'],
        permissions: ['manage_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      uploadedAt: new Date().toISOString(),
    },
  ],
  terms: 'Standard terms and conditions apply.',
  terminationConditions: '30 days written notice required for early termination.',
  approvalWorkflow: {
    currentLevel: 1,
    maxLevels: 2,
    levels: [
      {
        level: 1,
        approver: {
          id: 'user-2',
          name: 'Jane Smith',
          position: 'Contract Manager',
          department: 'Legal',
        },
        status: 'PENDING',
      },
      {
        level: 2,
        approver: {
          id: 'user-3',
          name: 'Mike Johnson',
          position: 'Legal Director',
          department: 'Legal',
        },
        status: 'PENDING',
      },
    ],
  },
  metadata: {
    department: 'Operations',
    costCenter: 'OPS-001',
    projectCode: 'PRJ-2024-001',
    budgetCode: 'BUDGET-2024-OPS',
  },
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['contract_manager'],
    permissions: ['manage_contracts'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  audit: {
    statusHistory: [
      {
        status: 'DRAFT',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
    ],
  },
}));

export const contractService = {
  getContracts: async (
    params: PaginationParams & ContractFilters
  ): Promise<PaginatedResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_CONTRACTS];

    if (params.status) {
      filteredData = filteredData.filter(contract => contract.status === params.status);
    }
    if (params.type) {
      filteredData = filteredData.filter(contract => contract.type === params.type);
    }
    if (params.supplier) {
      filteredData = filteredData.filter(contract => 
        contract.supplier.name.toLowerCase().includes(params.supplier!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(contract => {
        const startDate = new Date(contract.startDate);
        return startDate >= start && startDate <= end;
      });
    }
    if (params.minValue !== undefined) {
      filteredData = filteredData.filter(contract => contract.value >= params.minValue!);
    }
    if (params.maxValue !== undefined) {
      filteredData = filteredData.filter(contract => contract.value <= params.maxValue!);
    }
    if (params.priority) {
      filteredData = filteredData.filter(contract => contract.priority === params.priority);
    }
    if (params.renewalType) {
      filteredData = filteredData.filter(contract => contract.renewalType === params.renewalType);
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

  getContractById: async (id: string): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const contract = MOCK_CONTRACTS.find(contract => contract.id === id);

    if (!contract) {
      throw new Error('Contract not found');
    }

    return {
      data: contract,
      status: 200,
    };
  },

  createContract: async (contract: ContractFormData): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newContract: Contract = {
      id: `contract-${MOCK_CONTRACTS.length + 1}`,
      contractNumber: `CON-2024-${String(MOCK_CONTRACTS.length + 1).padStart(4, '0')}`,
      status: 'DRAFT',
      ...contract,
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['contract_manager'],
        permissions: ['manage_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audit: {
        statusHistory: [
          {
            status: 'DRAFT',
            timestamp: new Date().toISOString(),
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
          },
        ],
      },
    };

    MOCK_CONTRACTS.push(newContract);

    return {
      data: newContract,
      status: 201,
    };
  },

  updateContract: async (
    id: string,
    contract: Partial<ContractFormData>
  ): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      ...contract,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  submitContract: async (id: string): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    const now = new Date().toISOString();
    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: 'PENDING_APPROVAL',
      updatedAt: now,
      audit: {
        ...MOCK_CONTRACTS[index].audit,
        statusHistory: [
          ...MOCK_CONTRACTS[index].audit.statusHistory,
          {
            status: 'PENDING_APPROVAL',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: 'Submitted for approval',
          },
        ],
      },
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  approveContract: async (
    id: string,
    comment?: string
  ): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    const now = new Date().toISOString();
    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: 'APPROVED',
      approvedAt: now,
      approvedBy: {
        id: 'user-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        roles: ['contract_approver'],
        permissions: ['approve_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: now,
      audit: {
        ...MOCK_CONTRACTS[index].audit,
        statusHistory: [
          ...MOCK_CONTRACTS[index].audit.statusHistory,
          {
            status: 'APPROVED',
            timestamp: now,
            user: {
              id: 'user-2',
              name: 'Jane Smith',
            },
            comment,
          },
        ],
      },
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  rejectContract: async (
    id: string,
    comment: string
  ): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    const now = new Date().toISOString();
    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: 'REJECTED',
      updatedAt: now,
      audit: {
        ...MOCK_CONTRACTS[index].audit,
        statusHistory: [
          ...MOCK_CONTRACTS[index].audit.statusHistory,
          {
            status: 'REJECTED',
            timestamp: now,
            user: {
              id: 'user-2',
              name: 'Jane Smith',
            },
            comment,
          },
        ],
      },
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  activateContract: async (id: string): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    const now = new Date().toISOString();
    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: 'ACTIVE',
      updatedAt: now,
      audit: {
        ...MOCK_CONTRACTS[index].audit,
        statusHistory: [
          ...MOCK_CONTRACTS[index].audit.statusHistory,
          {
            status: 'ACTIVE',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: 'Contract activated',
          },
        ],
      },
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  terminateContract: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<Contract>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }

    const now = new Date().toISOString();
    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: 'TERMINATED',
      terminatedAt: now,
      terminatedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['contract_manager'],
        permissions: ['manage_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      terminationReason: reason,
      updatedAt: now,
      audit: {
        ...MOCK_CONTRACTS[index].audit,
        statusHistory: [
          ...MOCK_CONTRACTS[index].audit.statusHistory,
          {
            status: 'TERMINATED',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: reason,
          },
        ],
      },
    };

    return {
      data: MOCK_CONTRACTS[index],
      status: 200,
    };
  },

  uploadDocument: async (
    id: string,
    document: {
      title: string;
      type: 'CONTRACT' | 'AMENDMENT' | 'ATTACHMENT' | 'CERTIFICATE';
      file: File;
      description?: string;
      expiryDate?: string;
    }
  ): Promise<ApiResponse<ContractDocument>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newDocument: ContractDocument = {
      id: `doc-${Date.now()}`,
      title: document.title,
      type: document.type,
      version: '1.0',
      url: `https://example.com/contracts/${document.file.name}`,
      uploadedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['contract_manager'],
        permissions: ['manage_contracts'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      uploadedAt: new Date().toISOString(),
      description: document.description,
      expiryDate: document.expiryDate,
    };

    const index = MOCK_CONTRACTS.findIndex(contract => contract.id === id);
    if (index !== -1) {
      MOCK_CONTRACTS[index].documents.push(newDocument);
    }

    return {
      data: newDocument,
      status: 201,
    };
  },
};