import type { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderStatus } from '@/types/purchase-order';

// Mock data for when API is not available
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplierId: 'supplier-1',
    supplierName: 'ABC Supplies Inc.',
    currency: 'USD',
    paymentTerms: 30,
    deliveryTerms: 'FOB Destination',
    shippingMethod: 'Standard Shipping',
    totalAmount: 15000,
    status: 'approved' as PurchaseOrderStatus,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    approvedAt: '2024-01-16T14:30:00Z',
    approvedBy: 'John Doe',
    items: [
      {
        id: 'item-1',
        itemId: 'prod-1',
        itemName: 'Laptop Computer',
        quantity: 5,
        unitPrice: 1200,
        totalPrice: 6000,
        deliveryDate: '2024-02-15T00:00:00Z',
      },
      {
        id: 'item-2',
        itemId: 'prod-2',
        itemName: 'Office Chair',
        quantity: 10,
        unitPrice: 200,
        totalPrice: 2000,
        deliveryDate: '2024-02-15T00:00:00Z',
      },
    ],
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    supplierId: 'supplier-2',
    supplierName: 'XYZ Corporation',
    currency: 'USD',
    paymentTerms: 45,
    deliveryTerms: 'FOB Origin',
    shippingMethod: 'Express Shipping',
    totalAmount: 8500,
    status: 'sent' as PurchaseOrderStatus,
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    sentAt: '2024-01-17T09:00:00Z',
    items: [
      {
        id: 'item-3',
        itemId: 'prod-3',
        itemName: 'Printer',
        quantity: 2,
        unitPrice: 300,
        totalPrice: 600,
        deliveryDate: '2024-02-20T00:00:00Z',
      },
    ],
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    supplierId: 'supplier-3',
    supplierName: 'Tech Solutions Ltd.',
    currency: 'USD',
    paymentTerms: 30,
    deliveryTerms: 'FOB Destination',
    shippingMethod: 'Standard Shipping',
    totalAmount: 22000,
    status: 'draft' as PurchaseOrderStatus,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    items: [
      {
        id: 'item-4',
        itemId: 'prod-4',
        itemName: 'Server Equipment',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
        deliveryDate: '2024-03-01T00:00:00Z',
      },
    ],
  },
];

export const purchaseOrderApi = {
  // Get all purchase orders with filtering and pagination
  async getPurchaseOrders(params?: {
    page?: number;
    limit?: number;
    status?: PurchaseOrderStatus;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ data: PurchaseOrder[]; total: number; page: number; limit: number }> {
    console.warn('Using mock data for purchase orders');
    return {
      data: mockPurchaseOrders,
      total: mockPurchaseOrders.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  // Get a single purchase order by ID
  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    console.warn('Using mock data for purchase order');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return mockOrder;
    }
    throw new Error('Purchase order not found');
  },

  // Create a new purchase order
  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    console.warn('Using mock data for create purchase order');
    const mockOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`,
      supplierId: 'mock-supplier',
      supplierName: data.supplierName || 'Mock Supplier',
      currency: 'USD',
      paymentTerms: 30,
      deliveryTerms: 'FOB Destination',
      shippingMethod: 'Standard Shipping',
      totalAmount: data.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0,
      status: 'draft' as PurchaseOrderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: data.items || [],
    };
    return mockOrder;
  },

  // Update an existing purchase order
  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    console.warn('Using mock data for update purchase order');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Delete a purchase order
  async deletePurchaseOrder(id: string): Promise<void> {
    console.warn('Using mock data for delete purchase order');
    // Mock successful deletion
  },

  // Approve a purchase order
  async approvePurchaseOrder(id: string, approvalData: { approvedBy: string; comments?: string }): Promise<PurchaseOrder> {
    console.warn('Using mock data for approve purchase order');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, status: 'approved' as PurchaseOrderStatus, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Reject a purchase order
  async rejectPurchaseOrder(id: string, rejectionData: { rejectedBy: string; reason: string }): Promise<PurchaseOrder> {
    console.warn('Using mock data for reject purchase order');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, status: 'rejected' as PurchaseOrderStatus, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Send purchase order to supplier
  async sendToSupplier(id: string, sendData: { method: 'email' | 'edi' | 'portal'; recipientEmail?: string }): Promise<PurchaseOrder> {
    console.warn('Using mock data for send to supplier');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, status: 'sent' as PurchaseOrderStatus, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Acknowledge purchase order from supplier
  async acknowledgeFromSupplier(id: string, acknowledgmentData: {
    acknowledgedBy: string;
    confirmedDeliveryDate?: string;
    priceConfirmation?: boolean;
    quantityConfirmation?: boolean;
    notes?: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for acknowledge from supplier');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, status: 'acknowledged' as PurchaseOrderStatus, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Create change order for purchase order
  async createChangeOrder(id: string, changeData: {
    changeReason: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for create change order');
    const mockOrder = mockPurchaseOrders.find(order => order.id === id);
    if (mockOrder) {
      return { ...mockOrder, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase order not found');
  },

  // Get purchase order history
  async getPurchaseOrderHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    performedBy: string;
    performedAt: string;
    details: any;
  }>> {
    console.warn('Using mock data for purchase order history');
    return [
      {
        id: 'hist-1',
        action: 'Created',
        performedBy: 'John Doe',
        performedAt: '2024-01-15T10:00:00Z',
        details: { status: 'draft' },
      },
      {
        id: 'hist-2',
        action: 'Approved',
        performedBy: 'Jane Smith',
        performedAt: '2024-01-16T14:30:00Z',
        details: { status: 'approved', comments: 'Approved for procurement' },
      },
    ];
  },

  // Get purchase order analytics
  async getPurchaseOrderAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: string;
    category?: string;
  }): Promise<{
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    ordersByStatus: Record<PurchaseOrderStatus, number>;
    ordersByMonth: Array<{ month: string; count: number; value: number }>;
    topSuppliers: Array<{ supplierId: string; supplierName: string; orderCount: number; totalValue: number }>;
  }> {
    console.warn('Using mock data for purchase order analytics');
    return {
      totalOrders: mockPurchaseOrders.length,
      totalValue: mockPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: mockPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0) / mockPurchaseOrders.length,
      ordersByStatus: {
        draft: 1,
        pending: 0,
        approved: 1,
        sent: 1,
        acknowledged: 0,
        received: 0,
        closed: 0,
        cancelled: 0,
        rejected: 0,
      },
      ordersByMonth: [
        { month: '2024-01', count: 3, value: 45500 },
      ],
      topSuppliers: [
        { supplierId: 'supplier-1', supplierName: 'ABC Supplies Inc.', orderCount: 1, totalValue: 15000 },
        { supplierId: 'supplier-2', supplierName: 'XYZ Corporation', orderCount: 1, totalValue: 8500 },
        { supplierId: 'supplier-3', supplierName: 'Tech Solutions Ltd.', orderCount: 1, totalValue: 22000 },
      ],
    };
  },

  // Bulk approve purchase orders
  async bulkApprove(ids: string[], approvalData: { approvedBy: string; comments?: string }): Promise<PurchaseOrder[]> {
    console.warn('Using mock data for bulk approve purchase orders');
    return ids.map(id => {
      const mockOrder = mockPurchaseOrders.find(order => order.id === id);
      return mockOrder ? { ...mockOrder, status: 'approved' as PurchaseOrderStatus, updatedAt: new Date().toISOString() } : null;
    }).filter(Boolean) as PurchaseOrder[];
  },

  // Bulk send purchase orders
  async bulkSend(ids: string[], sendData: { method: 'email' | 'edi' | 'portal' }): Promise<PurchaseOrder[]> {
    console.warn('Using mock data for bulk send purchase orders');
    return ids.map(id => {
      const mockOrder = mockPurchaseOrders.find(order => order.id === id);
      return mockOrder ? { ...mockOrder, status: 'sent' as PurchaseOrderStatus, updatedAt: new Date().toISOString() } : null;
    }).filter(Boolean) as PurchaseOrder[];
  },

  // Export purchase orders
  async exportPurchaseOrders(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: PurchaseOrderStatus;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    console.warn('Using mock data for export purchase orders');
    const mockData = mockPurchaseOrders.map(order => ({
      'PO Number': order.poNumber,
      'Supplier': order.supplierName,
      'Total Amount': order.totalAmount,
      'Status': order.status,
      'Created Date': order.createdAt,
    }));
    
    const csvContent = [
      Object.keys(mockData[0]).join(','),
      ...mockData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  },
};



