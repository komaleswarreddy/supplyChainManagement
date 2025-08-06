import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Requisition, 
  RequisitionFormData, 
  RequisitionFilters,
  RequisitionCategory,
  BudgetStatus 
} from '@/types/procurement';

// Configuration
const API_ENDPOINTS = {
  REQUISITIONS: '/api/procurement/requisitions',
  REQUISITION_SUBMIT: (id: string) => `/api/procurement/requisitions/${id}/submit`,
  REQUISITION_APPROVE: (id: string) => `/api/procurement/requisitions/${id}/approve`,
  REQUISITION_REJECT: (id: string) => `/api/procurement/requisitions/${id}/reject`,
  REQUISITION_CANCEL: (id: string) => `/api/procurement/requisitions/${id}/cancel`,
  REQUISITION_COMMENTS: (id: string) => `/api/procurement/requisitions/${id}/comments`,
  REQUISITION_ATTACHMENTS: (id: string) => `/api/procurement/requisitions/${id}/attachments`,
  PROCUREMENT_ANALYTICS: '/api/procurement/analytics',
} as const;

// Enhanced mock data for development/fallback
const MOCK_REQUISITIONS: Requisition[] = Array.from({ length: 50 }, (_, i) => {
  const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const requiredDate = new Date(createdDate.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);
  const totalAmount = Math.floor(Math.random() * 50000) + 1000;
  
  return {
    id: `req-${i + 1}`,
    requisitionNumber: `REQ-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    title: `${['Office Supplies', 'IT Equipment', 'Software Licenses', 'Professional Services', 'Maintenance Services', 'Marketing Materials', 'Training Resources'][i % 7]} Request ${i + 1}`,
    description: `${['Various office supplies for the department', 'IT equipment for new employees', 'Software licenses for development team', 'Professional consulting services', 'Equipment maintenance and support', 'Marketing campaign materials', 'Employee training and development'][i % 7]}`,
    requestor: {
      id: `user-${(i % 10) + 1}`,
      name: `${['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Tom Anderson', 'Emily Taylor', 'Chris Martinez', 'Amanda Garcia'][i % 10]}`,
      email: `${['john.doe', 'jane.smith', 'mike.johnson', 'sarah.wilson', 'david.brown', 'lisa.davis', 'tom.anderson', 'emily.taylor', 'chris.martinez', 'amanda.garcia'][i % 10]}@example.com`,
      department: ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Legal'][i % 7],
      position: ['Manager', 'Senior Developer', 'Analyst', 'Coordinator', 'Specialist', 'Director'][i % 6],
      contactNumber: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    },
    status: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'][i % 5] as Requisition['status'],
    priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
    category: ['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE', 'TRAVEL', 'TRAINING', 'MARKETING', 'OTHER'][i % 9] as RequisitionCategory,
    department: ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Legal'][i % 7],
    costCenter: `CC-${String((i % 20) + 1).padStart(3, '0')}`,
    projectCode: Math.random() > 0.5 ? `PRJ-${String((i % 15) + 1).padStart(3, '0')}` : undefined,
    budgetCode: `BUD-${String((i % 25) + 1).padStart(3, '0')}`,
    budgetYear: 2024,
    currency: 'USD',
    businessPurpose: `${['Operational efficiency improvement', 'Technology upgrade initiative', 'Compliance requirements', 'Business expansion support', 'Cost reduction program', 'Quality enhancement project'][i % 6]}`,
    justification: `${['Required for daily operations', 'Critical for project delivery', 'Regulatory compliance mandate', 'Strategic business initiative', 'Cost optimization effort', 'Performance improvement'][i % 6]}`,
    procurementType: ['GOODS', 'SERVICES', 'WORKS'][i % 3],
    procurementMethod: ['RFQ', 'TENDER', 'DIRECT', 'FRAMEWORK'][i % 4],
    contractReference: Math.random() > 0.7 ? `CON-${String((i % 10) + 1).padStart(4, '0')}` : undefined,
    paymentTerms: ['NET_30', 'NET_60', 'NET_90', 'COD', 'ADVANCE'][i % 5],
    requiredByDate: requiredDate.toISOString(),
    deliveryLocation: {
      name: `${['Main Office', 'Warehouse A', 'Branch Office', 'Remote Site', 'Distribution Center'][i % 5]}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Blvd', 'Elm Way'][i % 5]}`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
      country: 'United States',
      postalCode: String(Math.floor(Math.random() * 90000) + 10000),
      contactPerson: `${['John Smith', 'Jane Doe', 'Mike Wilson', 'Sarah Johnson', 'David Brown'][i % 5]}`,
      contactNumber: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    },
    items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `item-${i}-${j}`,
      itemCode: `ITEM-${String((i * 10 + j) % 1000).padStart(4, '0')}`,
      description: `${['Office Chair', 'Laptop Computer', 'Software License', 'Consulting Hours', 'Printer Supplies', 'Training Course', 'Marketing Banner'][j % 7]}`,
      quantity: Math.floor(Math.random() * 20) + 1,
      unitOfMeasure: ['EA', 'BOX', 'HR', 'SET', 'PKG'][j % 5],
      unitPrice: Math.floor(Math.random() * 1000) + 50,
      currency: 'USD',
      requestedDeliveryDate: new Date(requiredDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: ['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE'][j % 5] as RequisitionCategory,
      manufacturer: Math.random() > 0.5 ? `${['Dell', 'HP', 'Microsoft', 'Adobe', 'Oracle'][j % 5]}` : undefined,
      partNumber: Math.random() > 0.5 ? `PN-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}` : undefined,
      preferredSupplier: Math.random() > 0.6 ? `${['Supplier A', 'Supplier B', 'Supplier C'][j % 3]}` : undefined,
      alternativeSuppliers: Math.random() > 0.7 ? [`Alt Supplier ${j + 1}`, `Alt Supplier ${j + 2}`] : undefined,
      warrantyRequired: Math.random() > 0.5,
      warrantyDuration: Math.random() > 0.5 ? `${Math.floor(Math.random() * 3) + 1} years` : undefined,
      technicalSpecifications: Math.random() > 0.6 ? `Technical specs for item ${j + 1}` : undefined,
      qualityRequirements: Math.random() > 0.7 ? `Quality requirements for item ${j + 1}` : undefined,
      hsCode: Math.random() > 0.8 ? `${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}` : undefined,
      budgetCode: `BUD-${String((i % 25) + 1).padStart(3, '0')}`,
      notes: Math.random() > 0.7 ? `Additional notes for item ${j + 1}` : undefined,
    })),
    totalAmount,
    budgetStatus: ['WITHIN_BUDGET', 'OVER_BUDGET', 'BUDGET_PENDING', 'NO_BUDGET'][i % 4] as BudgetStatus,
    approvalWorkflow: {
      currentStep: Math.floor(Math.random() * 3) + 1,
      totalSteps: 3,
      approvers: [
        {
          id: `approver-${i}-1`,
          name: 'Department Manager',
          email: 'dept.manager@example.com',
          role: 'DEPARTMENT_MANAGER',
          status: ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)],
          approvedAt: Math.random() > 0.5 ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
          comments: Math.random() > 0.7 ? 'Approved for business necessity' : undefined,
        },
        {
          id: `approver-${i}-2`,
          name: 'Finance Manager',
          email: 'finance.manager@example.com',
          role: 'FINANCE_MANAGER',
          status: totalAmount > 10000 ? ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)] : 'NOT_REQUIRED',
          approvedAt: Math.random() > 0.5 && totalAmount > 10000 ? new Date(createdDate.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : undefined,
          comments: Math.random() > 0.7 ? 'Budget allocation confirmed' : undefined,
        },
      ],
    },
    attachments: Math.random() > 0.6 ? [
      {
        id: `att-${i}-1`,
        name: `Specification_${i + 1}.pdf`,
        type: 'SPECIFICATION',
        size: Math.floor(Math.random() * 5000000) + 100000,
        uploadedAt: createdDate.toISOString(),
        uploadedBy: {
          id: `user-${(i % 10) + 1}`,
          name: `User ${(i % 10) + 1}`,
        },
      },
    ] : [],
    comments: Math.random() > 0.5 ? [
      {
        id: `comment-${i}-1`,
        content: `${['Please expedite this request', 'Budget approval pending', 'Additional specifications attached', 'Vendor quotes requested', 'Delivery date confirmed'][i % 5]}`,
        createdAt: new Date(createdDate.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: `user-${(i % 10) + 1}`,
          name: `User ${(i % 10) + 1}`,
          email: `user${(i % 10) + 1}@example.com`,
        },
      },
    ] : [],
    audit: {
      createdBy: {
        id: `user-${(i % 10) + 1}`,
        name: `User ${(i % 10) + 1}`,
        timestamp: createdDate.toISOString(),
      },
      lastModifiedBy: {
        id: `user-${(i % 10) + 1}`,
        name: `User ${(i % 10) + 1}`,
        timestamp: new Date(createdDate.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString(),
      },
      statusHistory: [
        {
          status: 'DRAFT',
          timestamp: createdDate.toISOString(),
          user: {
            id: `user-${(i % 10) + 1}`,
            name: `User ${(i % 10) + 1}`,
          },
        },
        ...(Math.random() > 0.5 ? [
          {
            status: 'PENDING',
            timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            user: {
              id: `user-${(i % 10) + 1}`,
              name: `User ${(i % 10) + 1}`,
            },
          },
        ] : []),
      ],
    },
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString(),
  };
});

// Service class for Procurement operations
export class ProcurementService {
  /**
   * Get all requisitions with pagination and filters
   */
  static async getRequisitions(params: PaginationParams & RequisitionFilters): Promise<PaginatedResponse<Requisition>> {
    try {
      const response = await api.get<PaginatedResponse<Requisition>>(API_ENDPOINTS.REQUISITIONS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_REQUISITIONS];
      
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
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(req => 
          req.title.toLowerCase().includes(searchLower) ||
          req.requisitionNumber.toLowerCase().includes(searchLower) ||
          req.description.toLowerCase().includes(searchLower) ||
          req.requestor.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Get requisition by ID
   */
  static async getRequisitionById(id: string): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.get<ApiResponse<Requisition>>(`${API_ENDPOINTS.REQUISITIONS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const requisition = MOCK_REQUISITIONS.find(r => r.id === id);
      if (!requisition) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      return {
        data: requisition,
        status: 200,
      };
    }
  }

  /**
   * Create new requisition
   */
  static async createRequisition(data: RequisitionFormData): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.post<ApiResponse<Requisition>>(API_ENDPOINTS.REQUISITIONS, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newRequisition: Requisition = {
        id: `req-${Date.now()}`,
        requisitionNumber: `REQ-${new Date().getFullYear()}-${String(MOCK_REQUISITIONS.length + 1).padStart(4, '0')}`,
        status: 'DRAFT',
        totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        budgetStatus: 'WITHIN_BUDGET',
        approvalWorkflow: {
          currentStep: 1,
          totalSteps: 3,
          approvers: [
            {
              id: 'approver-1',
              name: 'Department Manager',
              email: 'dept.manager@example.com',
              role: 'DEPARTMENT_MANAGER',
              status: 'PENDING',
            },
            {
              id: 'approver-2',
              name: 'Finance Manager',
              email: 'finance.manager@example.com',
              role: 'FINANCE_MANAGER',
              status: 'PENDING',
            },
          ],
        },
        attachments: [],
        comments: [],
        audit: {
          createdBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          statusHistory: [
            {
              status: 'DRAFT',
              timestamp: new Date().toISOString(),
              user: {
                id: 'current-user',
                name: 'Current User',
              },
            },
          ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      
      MOCK_REQUISITIONS.unshift(newRequisition);
      
      return {
        data: newRequisition,
        status: 201,
      };
    }
  }

  /**
   * Update requisition
   */
  static async updateRequisition(id: string, data: Partial<RequisitionFormData>): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.put<ApiResponse<Requisition>>(`${API_ENDPOINTS.REQUISITIONS}/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      MOCK_REQUISITIONS[index] = {
        ...MOCK_REQUISITIONS[index],
        ...data,
        updatedAt: new Date().toISOString(),
        audit: {
          ...MOCK_REQUISITIONS[index].audit,
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
        },
      };
      
      return {
        data: MOCK_REQUISITIONS[index],
        status: 200,
      };
    }
  }

  /**
   * Submit requisition for approval
   */
  static async submitRequisition(id: string): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.post<ApiResponse<Requisition>>(API_ENDPOINTS.REQUISITION_SUBMIT(id));
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock submission:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      MOCK_REQUISITIONS[index] = {
        ...MOCK_REQUISITIONS[index],
        status: 'PENDING',
        updatedAt: new Date().toISOString(),
        audit: {
          ...MOCK_REQUISITIONS[index].audit,
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          statusHistory: [
            ...MOCK_REQUISITIONS[index].audit.statusHistory,
            {
              status: 'PENDING',
              timestamp: new Date().toISOString(),
              user: {
                id: 'current-user',
                name: 'Current User',
              },
            },
          ],
        },
      };
      
      return {
        data: MOCK_REQUISITIONS[index],
        status: 200,
      };
    }
  }

  /**
   * Approve requisition
   */
  static async approveRequisition(id: string, comment?: string): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.post<ApiResponse<Requisition>>(API_ENDPOINTS.REQUISITION_APPROVE(id), { comment });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock approval:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      MOCK_REQUISITIONS[index] = {
        ...MOCK_REQUISITIONS[index],
        status: 'APPROVED',
        updatedAt: new Date().toISOString(),
        audit: {
          ...MOCK_REQUISITIONS[index].audit,
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          statusHistory: [
            ...MOCK_REQUISITIONS[index].audit.statusHistory,
            {
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
              user: {
                id: 'current-user',
                name: 'Current User',
              },
              comment,
            },
          ],
        },
      };
      
      return {
        data: MOCK_REQUISITIONS[index],
        status: 200,
      };
    }
  }

  /**
   * Reject requisition
   */
  static async rejectRequisition(id: string, comment: string): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.post<ApiResponse<Requisition>>(API_ENDPOINTS.REQUISITION_REJECT(id), { comment });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock rejection:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      MOCK_REQUISITIONS[index] = {
        ...MOCK_REQUISITIONS[index],
        status: 'REJECTED',
        updatedAt: new Date().toISOString(),
        audit: {
          ...MOCK_REQUISITIONS[index].audit,
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          statusHistory: [
            ...MOCK_REQUISITIONS[index].audit.statusHistory,
            {
              status: 'REJECTED',
              timestamp: new Date().toISOString(),
              user: {
                id: 'current-user',
                name: 'Current User',
              },
              comment,
            },
          ],
        },
      };
      
      return {
        data: MOCK_REQUISITIONS[index],
        status: 200,
      };
    }
  }

  /**
   * Cancel requisition
   */
  static async cancelRequisition(id: string, reason: string): Promise<ApiResponse<Requisition>> {
    try {
      const response = await api.post<ApiResponse<Requisition>>(API_ENDPOINTS.REQUISITION_CANCEL(id), { reason });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock cancellation:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      MOCK_REQUISITIONS[index] = {
        ...MOCK_REQUISITIONS[index],
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
        audit: {
          ...MOCK_REQUISITIONS[index].audit,
          lastModifiedBy: {
            id: 'current-user',
            name: 'Current User',
            timestamp: new Date().toISOString(),
          },
          statusHistory: [
            ...MOCK_REQUISITIONS[index].audit.statusHistory,
            {
              status: 'CANCELLED',
              timestamp: new Date().toISOString(),
              user: {
                id: 'current-user',
                name: 'Current User',
              },
              comment: reason,
            },
          ],
        },
      };
      
      return {
        data: MOCK_REQUISITIONS[index],
        status: 200,
      };
    }
  }

  /**
   * Add comment to requisition
   */
  static async addComment(id: string, comment: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.REQUISITION_COMMENTS(id), { comment });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock comment addition:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      const newComment = {
        id: `comment-${Date.now()}`,
        content: comment,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'current.user@example.com',
        },
      };
      
      if (!MOCK_REQUISITIONS[index].comments) {
        MOCK_REQUISITIONS[index].comments = [];
      }
      MOCK_REQUISITIONS[index].comments!.push(newComment);
      
      return {
        data: { message: 'Comment added successfully' },
        status: 201,
      };
    }
  }

  /**
   * Upload attachment to requisition
   */
  static async uploadAttachment(id: string, file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.REQUISITION_ATTACHMENTS(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock file upload:', error);
      
      const index = MOCK_REQUISITIONS.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Requisition with ID ${id} not found`);
      }
      
      const newAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: 'DOCUMENT',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: {
          id: 'current-user',
          name: 'Current User',
        },
      };
      
      if (!MOCK_REQUISITIONS[index].attachments) {
        MOCK_REQUISITIONS[index].attachments = [];
      }
      MOCK_REQUISITIONS[index].attachments!.push(newAttachment);
      
      return {
        data: { message: 'File uploaded successfully', attachment: newAttachment },
        status: 201,
      };
    }
  }

  /**
   * Get procurement analytics
   */
  static async getProcurementAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    category?: string;
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.PROCUREMENT_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalRequisitions: MOCK_REQUISITIONS.length,
          pendingRequisitions: MOCK_REQUISITIONS.filter(r => r.status === 'PENDING').length,
          approvedRequisitions: MOCK_REQUISITIONS.filter(r => r.status === 'APPROVED').length,
          rejectedRequisitions: MOCK_REQUISITIONS.filter(r => r.status === 'REJECTED').length,
          totalValue: MOCK_REQUISITIONS.reduce((sum, r) => sum + r.totalAmount, 0),
          averageProcessingTime: 3.5,
          approvalRate: 85.2,
        },
        byStatus: [
          { status: 'DRAFT', count: MOCK_REQUISITIONS.filter(r => r.status === 'DRAFT').length },
          { status: 'PENDING', count: MOCK_REQUISITIONS.filter(r => r.status === 'PENDING').length },
          { status: 'APPROVED', count: MOCK_REQUISITIONS.filter(r => r.status === 'APPROVED').length },
          { status: 'REJECTED', count: MOCK_REQUISITIONS.filter(r => r.status === 'REJECTED').length },
          { status: 'CANCELLED', count: MOCK_REQUISITIONS.filter(r => r.status === 'CANCELLED').length },
        ],
        byCategory: [
          { category: 'OFFICE_SUPPLIES', count: MOCK_REQUISITIONS.filter(r => r.category === 'OFFICE_SUPPLIES').length },
          { category: 'IT_EQUIPMENT', count: MOCK_REQUISITIONS.filter(r => r.category === 'IT_EQUIPMENT').length },
          { category: 'SOFTWARE_LICENSES', count: MOCK_REQUISITIONS.filter(r => r.category === 'SOFTWARE_LICENSES').length },
          { category: 'PROFESSIONAL_SERVICES', count: MOCK_REQUISITIONS.filter(r => r.category === 'PROFESSIONAL_SERVICES').length },
          { category: 'MAINTENANCE', count: MOCK_REQUISITIONS.filter(r => r.category === 'MAINTENANCE').length },
        ],
        byDepartment: [
          { department: 'IT', count: MOCK_REQUISITIONS.filter(r => r.department === 'IT').length },
          { department: 'HR', count: MOCK_REQUISITIONS.filter(r => r.department === 'HR').length },
          { department: 'Finance', count: MOCK_REQUISITIONS.filter(r => r.department === 'Finance').length },
          { department: 'Operations', count: MOCK_REQUISITIONS.filter(r => r.department === 'Operations').length },
          { department: 'Marketing', count: MOCK_REQUISITIONS.filter(r => r.department === 'Marketing').length },
        ],
        timeline: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            count: Math.floor(Math.random() * 15) + 5,
            value: Math.floor(Math.random() * 100000) + 20000,
          };
        }),
      };
    }
  }
}

// Export service instance
export const procurementService = {
  getRequisitions: ProcurementService.getRequisitions,
  getRequisitionById: ProcurementService.getRequisitionById,
  createRequisition: ProcurementService.createRequisition,
  updateRequisition: ProcurementService.updateRequisition,
  submitRequisition: ProcurementService.submitRequisition,
  approveRequisition: ProcurementService.approveRequisition,
  rejectRequisition: ProcurementService.rejectRequisition,
  cancelRequisition: ProcurementService.cancelRequisition,
  addComment: ProcurementService.addComment,
  uploadAttachment: ProcurementService.uploadAttachment,
  getProcurementAnalytics: ProcurementService.getProcurementAnalytics,
}; 