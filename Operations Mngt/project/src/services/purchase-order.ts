import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  PurchaseOrder, 
  PurchaseOrderFormData, 
  PurchaseOrderFilters 
} from '@/types/purchase-order';

// Mock data for development
const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = Array.from({ length: 10 }, (_, i) => ({
  id: `po-${i + 1}`,
  poNumber: `PO-2024-${String(i + 1).padStart(4, '0')}`,
  type: 'STANDARD',
  status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'][Math.floor(Math.random() * 4)],
  supplier: {
    id: 'sup-1',
    name: 'Acme Corporation',
    code: 'ACME001',
    type: 'MANUFACTURER',
    status: 'ACTIVE',
    taxId: '123-45-6789',
    registrationNumber: 'REG123456',
    website: 'https://acme.example.com',
    industry: 'Manufacturing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  orderDate: new Date().toISOString(),
  requiredByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      id: `item-${i}-1`,
      lineNumber: 1,
      itemCode: 'ITEM-001',
      description: 'Office Chair',
      quantity: 10,
      unitOfMeasure: 'EA',
      unitPrice: 199.99,
      currency: 'USD',
      taxRate: 0.1,
      taxAmount: 199.99,
      totalAmount: 2199.89,
      requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      receivedQuantity: 0,
      remainingQuantity: 10,
    },
  ],
  currency: 'USD',
  subtotal: 1999.90,
  taxTotal: 199.99,
  shippingCost: 50,
  otherCharges: 0,
  totalAmount: 2249.89,
  paymentTerms: 'Net 30',
  deliveryTerms: 'FOB Destination',
  shippingMethod: 'Ground',
  deliveryAddress: {
    name: 'Main Warehouse',
    address: '123 Warehouse St',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
    contactPerson: 'John Smith',
    contactNumber: '+1-555-0123',
  },
  billingAddress: {
    name: 'Finance Department',
    address: '456 Corporate Blvd',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
    contactPerson: 'Jane Doe',
    contactNumber: '+1-555-0124',
  },
  deliveryStatus: 'PENDING',
  paymentStatus: 'UNPAID',
  approvalWorkflow: {
    currentLevel: 1,
    maxLevels: 2,
    levels: [
      {
        level: 1,
        approver: {
          id: 'user-2',
          name: 'Jane Smith',
          position: 'Procurement Manager',
          department: 'Procurement',
        },
        status: 'PENDING',
      },
      {
        level: 2,
        approver: {
          id: 'user-3',
          name: 'Mike Johnson',
          position: 'Finance Director',
          department: 'Finance',
        },
        status: 'PENDING',
      },
    ],
  },
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['user'],
    permissions: ['create_requisition'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    department: 'IT',
    costCenter: 'IT-001',
    projectCode: 'PRJ-2024-001',
    budgetCode: 'BUDGET-2024-IT',
  },
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

export const purchaseOrderService = {
  getPurchaseOrders: async (
    params: PaginationParams & PurchaseOrderFilters
  ): Promise<PaginatedResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_PURCHASE_ORDERS];

    if (params.status) {
      filteredData = filteredData.filter(po => po.status === params.status);
    }
    if (params.type) {
      filteredData = filteredData.filter(po => po.type === params.type);
    }
    if (params.supplier) {
      filteredData = filteredData.filter(po => 
        po.supplier.name.toLowerCase().includes(params.supplier!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(po => {
        const orderDate = new Date(po.orderDate);
        return orderDate >= start && orderDate <= end;
      });
    }
    if (params.minAmount !== undefined) {
      filteredData = filteredData.filter(po => po.totalAmount >= params.minAmount!);
    }
    if (params.maxAmount !== undefined) {
      filteredData = filteredData.filter(po => po.totalAmount <= params.maxAmount!);
    }
    if (params.deliveryStatus) {
      filteredData = filteredData.filter(po => po.deliveryStatus === params.deliveryStatus);
    }
    if (params.paymentStatus) {
      filteredData = filteredData.filter(po => po.paymentStatus === params.paymentStatus);
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

  getPurchaseOrderById: async (id: string): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const po = MOCK_PURCHASE_ORDERS.find(po => po.id === id);

    if (!po) {
      throw new Error('Purchase order not found');
    }

    return {
      data: po,
      status: 200,
    };
  },

  createPurchaseOrder: async (po: PurchaseOrderFormData): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPO: PurchaseOrder = {
      id: `po-${MOCK_PURCHASE_ORDERS.length + 1}`,
      poNumber: `PO-2024-${String(MOCK_PURCHASE_ORDERS.length + 1).padStart(4, '0')}`,
      status: 'DRAFT',
      ...po,
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['user'],
        permissions: ['create_requisition'],
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

    MOCK_PURCHASE_ORDERS.push(newPO);

    return {
      data: newPO,
      status: 201,
    };
  },

  updatePurchaseOrder: async (
    id: string,
    po: Partial<PurchaseOrderFormData>
  ): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      ...po,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },

  submitPurchaseOrder: async (id: string): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    const now = new Date().toISOString();
    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      status: 'PENDING_APPROVAL',
      submittedAt: now,
      submittedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['user'],
        permissions: ['create_requisition'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: now,
      audit: {
        ...MOCK_PURCHASE_ORDERS[index].audit,
        statusHistory: [
          ...MOCK_PURCHASE_ORDERS[index].audit.statusHistory,
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
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },

  approvePurchaseOrder: async (
    id: string,
    comment?: string
  ): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    const now = new Date().toISOString();
    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      status: 'APPROVED',
      approvedAt: now,
      approvedBy: {
        id: 'user-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        roles: ['approver'],
        permissions: ['approve_requisition'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: now,
      audit: {
        ...MOCK_PURCHASE_ORDERS[index].audit,
        statusHistory: [
          ...MOCK_PURCHASE_ORDERS[index].audit.statusHistory,
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
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },

  rejectPurchaseOrder: async (
    id: string,
    comment: string
  ): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    const now = new Date().toISOString();
    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      status: 'REJECTED',
      updatedAt: now,
      audit: {
        ...MOCK_PURCHASE_ORDERS[index].audit,
        statusHistory: [
          ...MOCK_PURCHASE_ORDERS[index].audit.statusHistory,
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
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },

  sendPurchaseOrder: async (id: string): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    const now = new Date().toISOString();
    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      status: 'SENT',
      sentAt: now,
      updatedAt: now,
      audit: {
        ...MOCK_PURCHASE_ORDERS[index].audit,
        statusHistory: [
          ...MOCK_PURCHASE_ORDERS[index].audit.statusHistory,
          {
            status: 'SENT',
            timestamp: now,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            comment: 'Sent to supplier',
          },
        ],
      },
    };

    return {
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },

  cancelPurchaseOrder: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<PurchaseOrder>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase order not found');
    }

    const now = new Date().toISOString();
    MOCK_PURCHASE_ORDERS[index] = {
      ...MOCK_PURCHASE_ORDERS[index],
      status: 'CANCELLED',
      cancelledAt: now,
      cancelledBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['user'],
        permissions: ['create_requisition'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cancellationReason: reason,
      updatedAt: now,
      audit: {
        ...MOCK_PURCHASE_ORDERS[index].audit,
        statusHistory: [
          ...MOCK_PURCHASE_ORDERS[index].audit.statusHistory,
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
    };

    return {
      data: MOCK_PURCHASE_ORDERS[index],
      status: 200,
    };
  },
};