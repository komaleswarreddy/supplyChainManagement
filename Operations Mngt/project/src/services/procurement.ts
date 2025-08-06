import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Requisition, 
  RequisitionFormData, 
  RequisitionFilters,
  RequisitionCategory,
  BudgetStatus 
} from '@/types/procurement';

// Simulated data for development
const MOCK_REQUISITIONS: Requisition[] = Array.from({ length: 10 }, (_, i) => ({
  id: `req-${i + 1}`,
  requisitionNumber: `REQ-2024-${String(i + 1).padStart(3, '0')}`,
  title: `Office Supplies Request ${i + 1}`,
  description: 'Various office supplies for the department including stationery, printer supplies, and general office equipment.',
  requestor: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'IT',
    position: 'Senior Developer',
    contactNumber: '+1-555-0123',
  },
  status: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 4)] as Requisition['status'],
  priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
  category: 'OFFICE_SUPPLIES',
  items: [
    {
      id: `item-${i}-1`,
      itemCode: 'ITEM-001',
      description: 'Printer Paper A4',
      quantity: 5,
      unitOfMeasure: 'BOX',
      unitPrice: 25.99,
      currency: 'USD',
      requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      specifications: '80gsm, white, 500 sheets per ream, 5 reams per box',
      category: 'OFFICE_SUPPLIES',
      manufacturer: 'PaperCo',
      partNumber: 'PC-A4-80',
      preferredSupplier: 'Office Supplies Inc.',
      alternativeSuppliers: ['Staples', 'Office Depot'],
      warrantyRequired: false,
      technicalSpecifications: 'ISO 9001 certified paper',
      qualityRequirements: 'Acid-free, archival quality',
      budgetCode: 'OFF-2024-001',
      notes: 'Standard office paper for daily use',
    },
    {
      id: `item-${i}-2`,
      itemCode: 'ITEM-002',
      description: 'Ballpoint Pens',
      quantity: 10,
      unitOfMeasure: 'BOX',
      unitPrice: 12.99,
      currency: 'USD',
      requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      specifications: 'Blue ink, medium point, 12 pens per box',
      category: 'OFFICE_SUPPLIES',
      manufacturer: 'PenCo',
      partNumber: 'BP-BLUE-MD',
      preferredSupplier: 'Office Supplies Inc.',
      warrantyRequired: false,
      qualityRequirements: 'Smooth writing, no skipping',
      budgetCode: 'OFF-2024-001',
    },
  ],
  totalAmount: 194.85,
  currency: 'USD',
  department: 'IT',
  costCenter: 'IT-001',
  projectCode: 'PRJ-2024-001',
  budgetCode: 'IT-2024-Q1',
  budgetYear: 2024,
  budgetStatus: 'WITHIN_BUDGET',
  justification: 'Regular office supplies replenishment for the IT department. Current stock is running low.',
  businessPurpose: 'Maintain adequate office supplies for daily operations',
  deliveryLocation: {
    name: 'IT Department - Main Office',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94105',
    contactPerson: 'Jane Smith',
    contactNumber: '+1-555-0124',
  },
  requiredByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  paymentTerms: 'Net 30',
  procurementType: 'GOODS',
  procurementMethod: 'RFQ',
  contractReference: 'CON-2024-001',
  supplierQuotes: [
    {
      supplierName: 'Office Supplies Inc.',
      quoteReference: 'QT-2024-001',
      quoteDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: 194.85,
      currency: 'USD',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: ['https://example.com/quotes/qt-2024-001.pdf'],
    },
  ],
  approvalWorkflow: {
    currentLevel: 1,
    maxLevels: 3,
    levels: [
      {
        level: 1,
        approver: {
          id: 'user-2',
          name: 'Jane Smith',
          position: 'IT Manager',
          department: 'IT',
        },
        status: 'PENDING',
      },
      {
        level: 2,
        approver: {
          id: 'user-3',
          name: 'Mike Johnson',
          position: 'Procurement Manager',
          department: 'Procurement',
        },
        status: 'PENDING',
      },
      {
        level: 3,
        approver: {
          id: 'user-4',
          name: 'Sarah Williams',
          position: 'Finance Director',
          department: 'Finance',
        },
        status: 'PENDING',
      },
    ],
  },
  attachments: [
    'https://example.com/attachments/quote.pdf',
    'https://example.com/attachments/specs.pdf',
  ],
  comments: [
    {
      id: 'comment-1',
      text: 'Please review the specifications for the printer paper.',
      createdBy: {
        id: 'user-2',
        name: 'Jane Smith',
        position: 'IT Manager',
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-2',
      text: 'Specifications look good. Proceeding with the review.',
      createdBy: {
        id: 'user-3',
        name: 'Mike Johnson',
        position: 'Procurement Manager',
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  complianceChecks: {
    budgetAvailable: true,
    policyCompliant: true,
    delegationLimitCheck: true,
    supplierValidation: true,
  },
  audit: {
    createdBy: {
      id: 'user-1',
      name: 'John Doe',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    lastModifiedBy: {
      id: 'user-1',
      name: 'John Doe',
      timestamp: new Date().toISOString(),
    },
    statusHistory: [
      {
        status: 'DRAFT',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
      {
        status: 'PENDING',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
        comment: 'Submitted for approval',
      },
    ],
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
}));

export const procurementService = {
  // Requisitions
  getRequisitions: async (
    params: PaginationParams & RequisitionFilters
  ): Promise<PaginatedResponse<Requisition>> => {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_REQUISITIONS];

    // Apply filters
    if (params.status) {
      filteredData = filteredData.filter(req => req.status === params.status);
    }
    if (params.department) {
      filteredData = filteredData.filter(req => 
        req.department.toLowerCase().includes(params.department!.toLowerCase())
      );
    }
    if (params.requestor) {
      filteredData = filteredData.filter(req => 
        req.requestor.name.toLowerCase().includes(params.requestor!.toLowerCase())
      );
    }
    if (params.costCenter) {
      filteredData = filteredData.filter(req => 
        req.costCenter.toLowerCase().includes(params.costCenter!.toLowerCase())
      );
    }
    if (params.priority) {
      filteredData = filteredData.filter(req => req.priority === params.priority);
    }
    if (params.category) {
      filteredData = filteredData.filter(req => req.category === params.category);
    }
    if (params.budgetYear) {
      filteredData = filteredData.filter(req => req.budgetYear === params.budgetYear);
    }
    if (params.procurementType) {
      filteredData = filteredData.filter(req => req.procurementType === params.procurementType);
    }
    if (params.procurementMethod) {
      filteredData = filteredData.filter(req => req.procurementMethod === params.procurementMethod);
    }
    if (params.projectCode) {
      filteredData = filteredData.filter(req => req.projectCode === params.projectCode);
    }
    if (params.budgetCode) {
      filteredData = filteredData.filter(req => req.budgetCode === params.budgetCode);
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

    // Apply pagination
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

  getRequisitionById: async (id: string): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const requisition = MOCK_REQUISITIONS.find(req => req.id === id);

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    return {
      data: requisition,
      status: 200,
    };
  },

  createRequisition: async (requisition: RequisitionFormData): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRequisition: Requisition = {
      id: `req-${MOCK_REQUISITIONS.length + 1}`,
      requisitionNumber: `REQ-2024-${String(MOCK_REQUISITIONS.length + 1).padStart(3, '0')}`,
      status: 'DRAFT',
      ...requisition,
      audit: {
        createdBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: new Date().toISOString(),
        },
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: new Date().toISOString(),
        },
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_REQUISITIONS.push(newRequisition);

    return {
      data: newRequisition,
      status: 201,
    };
  },

  updateRequisition: async (
    id: string,
    requisition: Partial<RequisitionFormData>
  ): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      ...requisition,
      updatedAt: new Date().toISOString(),
      audit: {
        ...MOCK_REQUISITIONS[index].audit,
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: new Date().toISOString(),
        },
      },
    };

    return {
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  submitRequisition: async (id: string): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    const now = new Date().toISOString();
    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      status: 'PENDING',
      submittedAt: now,
      updatedAt: now,
      audit: {
        ...MOCK_REQUISITIONS[index].audit,
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: now,
        },
        statusHistory: [
          ...MOCK_REQUISITIONS[index].audit.statusHistory,
          {
            status: 'PENDING',
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
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  approveRequisition: async (
    id: string,
    comment?: string
  ): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    const now = new Date().toISOString();
    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      status: 'APPROVED',
      approvedAt: now,
      updatedAt: now,
      audit: {
        ...MOCK_REQUISITIONS[index].audit,
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: now,
        },
        statusHistory: [
          ...MOCK_REQUISITIONS[index].audit.statusHistory,
          {
            status: 'APPROVED',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: comment || 'Approved',
          },
        ],
      },
      comments: [
        ...(MOCK_REQUISITIONS[index].comments || []),
        comment ? {
          id: `comment-${Date.now()}`,
          text: comment,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
            position: 'IT Manager',
          },
          createdAt: now,
        } : null,
      ].filter(Boolean),
    };

    return {
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  rejectRequisition: async (
    id: string,
    comment: string
  ): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    const now = new Date().toISOString();
    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      status: 'REJECTED',
      updatedAt: now,
      audit: {
        ...MOCK_REQUISITIONS[index].audit,
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: now,
        },
        statusHistory: [
          ...MOCK_REQUISITIONS[index].audit.statusHistory,
          {
            status: 'REJECTED',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment,
          },
        ],
      },
      comments: [
        ...(MOCK_REQUISITIONS[index].comments || []),
        {
          id: `comment-${Date.now()}`,
          text: comment,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
            position: 'IT Manager',
          },
          createdAt: now,
        },
      ],
    };

    return {
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  cancelRequisition: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    const now = new Date().toISOString();
    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      status: 'CANCELLED',
      updatedAt: now,
      audit: {
        ...MOCK_REQUISITIONS[index].audit,
        lastModifiedBy: {
          id: 'user-1',
          name: 'John Doe',
          timestamp: now,
        },
        statusHistory: [
          ...MOCK_REQUISITIONS[index].audit.statusHistory,
          {
            status: 'CANCELLED',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: reason,
          },
        ],
      },
      comments: [
        ...(MOCK_REQUISITIONS[index].comments || []),
        {
          id: `comment-${Date.now()}`,
          text: `Requisition cancelled: ${reason}`,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
            position: 'IT Manager',
          },
          createdAt: now,
        },
      ],
    };

    return {
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  addComment: async (
    id: string,
    comment: string
  ): Promise<ApiResponse<Requisition>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_REQUISITIONS.findIndex(req => req.id === id);
    if (index === -1) {
      throw new Error('Requisition not found');
    }

    const now = new Date().toISOString();
    MOCK_REQUISITIONS[index] = {
      ...MOCK_REQUISITIONS[index],
      updatedAt: now,
      comments: [
        ...(MOCK_REQUISITIONS[index].comments || []),
        {
          id: `comment-${Date.now()}`,
          text: comment,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
            position: 'IT Manager',
          },
          createdAt: now,
        },
      ],
    };

    return {
      data: MOCK_REQUISITIONS[index],
      status: 200,
    };
  },

  uploadAttachment: async (
    id: string,
    file: File
  ): Promise<ApiResponse<{ url: string }>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      data: {
        url: `https://example.com/attachments/${file.name}`,
      },
      status: 200,
    };
  },
};