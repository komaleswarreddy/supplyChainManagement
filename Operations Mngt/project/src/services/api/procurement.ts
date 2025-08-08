import type { 
  Requisition, 
  CreateRequisitionRequest, 
  UpdateRequisitionRequest,
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  RFX,
  CreateRFXRequest,
  UpdateRFXRequest
} from '@/types/procurement';

// Mock data for when API is not available
const mockRequisitions: Requisition[] = [
  {
    id: '1',
    requisitionNumber: 'REQ-2024-001',
    requestorId: 'user-1',
    requestorName: 'John Doe',
    department: 'procurement',
    costCenter: 'CC-001',
    justification: 'Office supplies needed for daily operations',
    status: 'approved',
    totalValue: 2500,
    attachments: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    approvedAt: '2024-01-16T14:30:00Z',
    approvedBy: 'Jane Smith',
    items: [
      {
        id: 'item-1',
        itemId: 'prod-1',
        itemName: 'Printer Paper',
        quantity: 50,
        unitOfMeasure: 'Reams',
        estimatedUnitPrice: 25,
        description: 'A4 printer paper, 80gsm',
      },
      {
        id: 'item-2',
        itemId: 'prod-2',
        itemName: 'Pens',
        quantity: 100,
        unitOfMeasure: 'Pieces',
        estimatedUnitPrice: 12.5,
        description: 'Blue ballpoint pens',
      },
    ],
  },
  {
    id: '2',
    requisitionNumber: 'REQ-2024-002',
    requestorId: 'user-2',
    requestorName: 'Jane Smith',
    department: 'it',
    costCenter: 'CC-002',
    justification: 'IT equipment needed for new employees',
    status: 'submitted',
    totalValue: 5000,
    attachments: [],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    submittedAt: '2024-01-15T09:00:00Z',
    items: [
      {
        id: 'item-3',
        itemId: 'prod-3',
        itemName: 'Laptop',
        quantity: 2,
        unitOfMeasure: 'Units',
        estimatedUnitPrice: 2500,
        description: 'Dell Latitude laptops',
      },
    ],
  },
  {
    id: '3',
    requisitionNumber: 'REQ-2024-003',
    requestorId: 'user-3',
    requestorName: 'Bob Johnson',
    department: 'operations',
    costCenter: 'CC-003',
    justification: 'Furniture needed for office expansion',
    status: 'draft',
    totalValue: 3000,
    attachments: [],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    items: [
      {
        id: 'item-4',
        itemId: 'prod-4',
        itemName: 'Office Chair',
        quantity: 5,
        unitOfMeasure: 'Units',
        estimatedUnitPrice: 600,
        description: 'Ergonomic office chairs',
      },
    ],
  },
];

export const procurementApi = {
  // Requisition Management
  async getRequisitions(params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';
    requestorId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ data: Requisition[]; total: number; page: number; limit: number }> {
    console.warn('Using mock data for requisitions');
    return {
      data: mockRequisitions,
      total: mockRequisitions.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  async getRequisition(id: string): Promise<Requisition> {
    console.warn('Using mock data for requisition');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      return mockRequisition;
    }
    throw new Error('Requisition not found');
  },

  async createRequisition(data: CreateRequisitionRequest): Promise<Requisition> {
    console.warn('Using mock data for create requisition');
    const mockRequisition: Requisition = {
      id: `req-${Date.now()}`,
      requisitionNumber: `REQ-${new Date().getFullYear()}-${String(mockRequisitions.length + 1).padStart(3, '0')}`,
      requestorId: 'user-1',
      requestorName: 'John Doe',
      department: data.department || 'procurement',
      costCenter: data.costCenter || 'CC-001',
      justification: data.justification || 'New requisition',
      status: 'draft',
      totalValue: data.items?.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitPrice), 0) || 0,
      attachments: data.attachments || [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: data.items?.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        itemId: item.itemId,
        itemName: `Item ${index + 1}`,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        estimatedUnitPrice: item.estimatedUnitPrice,
        description: item.description,
      })) || [],
    };
    return mockRequisition;
  },

  async updateRequisition(id: string, data: UpdateRequisitionRequest): Promise<Requisition> {
    console.warn('Using mock data for update requisition');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      return { ...mockRequisition, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Requisition not found');
  },

  async deleteRequisition(id: string): Promise<void> {
    console.warn('Using mock data for delete requisition');
    // Mock successful deletion
  },

  async submitRequisition(id: string): Promise<Requisition> {
    console.warn('Using mock data for submit requisition');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      return { ...mockRequisition, status: 'submitted', updatedAt: new Date().toISOString() };
    }
    throw new Error('Requisition not found');
  },

  async approveRequisition(id: string, approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<Requisition> {
    console.warn('Using mock data for approve requisition');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      return { ...mockRequisition, status: 'approved', updatedAt: new Date().toISOString() };
    }
    throw new Error('Requisition not found');
  },

  async rejectRequisition(id: string, rejectionData: {
    rejectedBy: string;
    reason: string;
  }): Promise<Requisition> {
    console.warn('Using mock data for reject requisition');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      return { ...mockRequisition, status: 'rejected', updatedAt: new Date().toISOString() };
    }
    throw new Error('Requisition not found');
  },

  async convertToPurchaseOrder(id: string, conversionData: {
    supplierId: string;
    convertedBy: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for convert to purchase order');
    const mockRequisition = mockRequisitions.find(req => req.id === id);
    if (mockRequisition) {
      const mockPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        supplierId: conversionData.supplierId,
        supplierName: 'Mock Supplier',
        currency: 'USD',
        paymentTerms: 30,
        deliveryTerms: 'FOB Destination',
        shippingMethod: 'Standard Shipping',
        totalAmount: mockRequisition.totalValue,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: mockRequisition.items.map(item => ({
          id: `po-item-${Date.now()}`,
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.estimatedUnitPrice,
          totalPrice: item.quantity * item.estimatedUnitPrice,
          deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      };
      return mockPO;
    }
    throw new Error('Requisition not found');
  },

  // Requisition Templates
  async getRequisitionTemplates(params?: {
    page?: number;
    limit?: number;
    ownerId?: string;
    shared?: boolean;
  }): Promise<{
    data: Array<{
      id: string;
      name: string;
      description: string;
      ownerId: string;
      shared: boolean;
      items: Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        unitOfMeasure: string;
      }>;
      createdAt: string;
    }>;
    total: number;
  }> {
    console.warn('Using mock data for requisition templates');
    return {
      data: [
        {
          id: 'template-1',
          name: 'Standard Office Supplies',
          description: 'Template for common office supplies',
          ownerId: 'user-1',
          shared: false,
          items: [
            { itemId: 'prod-1', itemName: 'Printer Paper', quantity: 100, unitOfMeasure: 'Reams' },
            { itemId: 'prod-2', itemName: 'Pens', quantity: 200, unitOfMeasure: 'Pieces' },
          ],
          createdAt: '2024-01-01T10:00:00Z',
        },
      ],
      total: 1,
    };
  },

  async createRequisitionTemplate(data: {
    name: string;
    description: string;
    shared: boolean;
    items: Array<{
      itemId: string;
      quantity: number;
      unitOfMeasure: string;
    }>;
  }): Promise<any> {
    console.warn('Using mock data for create requisition template');
    return {
      id: `template-${Date.now()}`,
      name: data.name,
      description: data.description,
      shared: data.shared,
      items: data.items,
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
    };
  },

  async applyTemplate(templateId: string, requisitionData: {
    department: string;
    costCenter: string;
    justification: string;
  }): Promise<Requisition> {
    console.warn('Using mock data for apply template');
    const template = await this.getRequisitionTemplates({ id: templateId });
    if (!template.data.length) {
      throw new Error('Template not found');
    }
    const templateItems = template.data[0].items;
    const mockRequisition: Requisition = {
      id: `req-${Date.now()}`,
      requisitionNumber: `REQ-${new Date().getFullYear()}-${String(mockRequisitions.length + 1).padStart(3, '0')}`,
      requestorId: 'user-1',
      requestorName: 'John Doe',
      department: requisitionData.department || 'procurement',
      costCenter: requisitionData.costCenter || 'CC-001',
      justification: requisitionData.justification || 'New requisition from template',
      status: 'draft',
      totalValue: templateItems.reduce((sum, item) => sum + (item.quantity * 10), 0), // Mock price
      attachments: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: templateItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        estimatedUnitPrice: 10, // Mock price
        description: '',
      })),
    };
    return mockRequisition;
  },

  // Purchase Order Management
  async getPurchaseOrders(params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ data: PurchaseOrder[]; total: number; page: number; limit: number }> {
    console.warn('Using mock data for purchase orders');
    return {
      data: [
        {
          id: 'po-1',
          poNumber: 'PO-2024-001',
          supplierId: 'supplier-1',
          supplierName: 'Mock Supplier 1',
          currency: 'USD',
          paymentTerms: 30,
          deliveryTerms: 'FOB Destination',
          shippingMethod: 'Standard Shipping',
          totalAmount: 1000,
          status: 'draft',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          items: [
            {
              id: 'po-item-1',
              itemId: 'prod-1',
              itemName: 'Printer Paper',
              quantity: 10,
              unitPrice: 10,
              totalPrice: 100,
              deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          id: 'po-2',
          poNumber: 'PO-2024-002',
          supplierId: 'supplier-2',
          supplierName: 'Mock Supplier 2',
          currency: 'USD',
          paymentTerms: 60,
          deliveryTerms: 'CIF Port',
          shippingMethod: 'Express Shipping',
          totalAmount: 2000,
          status: 'pending',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-05T09:00:00Z',
          items: [
            {
              id: 'po-item-2',
              itemId: 'prod-2',
              itemName: 'Pens',
              quantity: 20,
              unitPrice: 12.5,
              totalPrice: 250,
              deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    console.warn('Using mock data for purchase order');
    const purchaseOrders = await this.getPurchaseOrders();
    const mockPO = purchaseOrders.data.find(po => po.id === id);
    if (mockPO) {
      return mockPO;
    }
    throw new Error('Purchase Order not found');
  },

  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    console.warn('Using mock data for create purchase order');
    const mockPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      currency: data.currency || 'USD',
      paymentTerms: data.paymentTerms || 30,
      deliveryTerms: data.deliveryTerms || 'FOB Destination',
      shippingMethod: data.shippingMethod || 'Standard Shipping',
      totalAmount: data.totalAmount || 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: data.items?.map((item, index) => ({
        id: `po-item-${Date.now()}-${index}`,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        deliveryDate: item.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    };
    return mockPO;
  },

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    console.warn('Using mock data for update purchase order');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return { ...mockPO, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase Order not found');
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    console.warn('Using mock data for delete purchase order');
    // Mock successful deletion
  },

  async approvePurchaseOrder(id: string, approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for approve purchase order');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return { ...mockPO, status: 'approved', updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase Order not found');
  },

  async rejectPurchaseOrder(id: string, rejectionData: {
    rejectedBy: string;
    reason: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for reject purchase order');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return { ...mockPO, status: 'rejected', updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase Order not found');
  },

  async sendToSupplier(id: string, sendData: {
    method: 'email' | 'edi' | 'portal';
    recipientEmail?: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for send to supplier');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return { ...mockPO, status: 'sent', updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase Order not found');
  },

  async acknowledgeFromSupplier(id: string, acknowledgmentData: {
    acknowledgedBy: string;
    confirmedDeliveryDate?: string;
    priceConfirmation?: boolean;
    quantityConfirmation?: boolean;
    notes?: string;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for acknowledge from supplier');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return { ...mockPO, status: 'acknowledged', updatedAt: new Date().toISOString() };
    }
    throw new Error('Purchase Order not found');
  },

  // Purchase Order Changes
  async createChangeOrder(id: string, changeData: {
    changeReason: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  }): Promise<PurchaseOrder> {
    console.warn('Using mock data for create change order');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return {
        ...mockPO,
        updatedAt: new Date().toISOString(),
        changes: [...(mockPO.changes || []), {
          id: `change-${Date.now()}`,
          changeReason: changeData.changeReason,
          changes: changeData.changes,
          createdBy: 'user-1',
          createdAt: new Date().toISOString(),
          status: 'pending',
        }],
      };
    }
    throw new Error('Purchase Order not found');
  },

  async getChangeHistory(id: string): Promise<Array<{
    id: string;
    changeReason: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    createdBy: string;
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>> {
    console.warn('Using mock data for change history');
    const mockPO = await this.getPurchaseOrder(id);
    if (mockPO) {
      return mockPO.changes || [];
    }
    throw new Error('Purchase Order not found');
  },

  // RFX Management
  async getRFXs(params?: {
    page?: number;
    limit?: number;
    type?: 'rfi' | 'rfp' | 'rfq';
    status?: 'draft' | 'published' | 'closed' | 'evaluated' | 'awarded';
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: RFX[]; total: number; page: number; limit: number }> {
    console.warn('Using mock data for RFXs');
    return {
      data: [
        {
          id: 'rfi-1',
          rfxNumber: 'RFI-2024-001',
          type: 'rfi',
          status: 'published',
          category: 'IT Equipment',
          title: 'Request for IT Equipment',
          description: 'Request for new IT equipment for the IT department.',
          createdBy: 'user-1',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          publicationDate: '2024-01-10T10:00:00Z',
          deadline: '2024-02-10T10:00:00Z',
          qaPeriod: {
            startDate: '2024-01-15T10:00:00Z',
            endDate: '2024-01-20T10:00:00Z',
          },
          responses: [
            {
              id: 'rfi-response-1',
              supplierId: 'supplier-1',
              supplierName: 'Mock Supplier 1',
              submittedAt: '2024-01-11T10:00:00Z',
              status: 'shortlisted',
              score: 95,
              totalValue: 1000,
            },
          ],
        },
        {
          id: 'rfp-1',
          rfxNumber: 'RFP-2024-001',
          type: 'rfp',
          status: 'closed',
          category: 'Office Supplies',
          title: 'Request for Proposal for Office Supplies',
          description: 'Request for proposals for office supplies.',
          createdBy: 'user-2',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-05T09:00:00Z',
          publicationDate: '2024-01-05T09:00:00Z',
          deadline: '2024-02-05T09:00:00Z',
          qaPeriod: {
            startDate: '2024-01-10T09:00:00Z',
            endDate: '2024-01-15T09:00:00Z',
          },
          responses: [
            {
              id: 'rfp-response-1',
              supplierId: 'supplier-1',
              supplierName: 'Mock Supplier 1',
              submittedAt: '2024-01-06T09:00:00Z',
              status: 'awarded',
              score: 100,
              totalValue: 2000,
            },
          ],
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };
  },

  async getRFX(id: string): Promise<RFX> {
    console.warn('Using mock data for RFX');
    const rfxs = await this.getRFXs();
    const mockRFX = rfxs.data.find(r => r.id === id);
    if (mockRFX) {
      return mockRFX;
    }
    throw new Error('RFX not found');
  },

  async createRFX(data: CreateRFXRequest): Promise<RFX> {
    console.warn('Using mock data for create RFX');
    return {
      id: `rfx-${Date.now()}`,
      rfxNumber: `RFX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      type: data.type || 'rfi',
      status: 'draft',
      category: data.category || 'General',
      title: data.title || 'New RFX',
      description: data.description || 'Description for new RFX',
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicationDate: null,
      deadline: null,
      qaPeriod: null,
      responses: [],
    };
  },

  async updateRFX(id: string, data: UpdateRFXRequest): Promise<RFX> {
    console.warn('Using mock data for update RFX');
    const mockRFX = await this.getRFX(id);
    if (mockRFX) {
      return { ...mockRFX, ...data, updatedAt: new Date().toISOString() };
    }
    throw new Error('RFX not found');
  },

  async deleteRFX(id: string): Promise<void> {
    console.warn('Using mock data for delete RFX');
    // Mock successful deletion
  },

  async publishRFX(id: string, publishData: {
    publicationDate: string;
    deadline: string;
    qaPeriod?: {
      startDate: string;
      endDate: string;
    };
  }): Promise<RFX> {
    console.warn('Using mock data for publish RFX');
    const mockRFX = await this.getRFX(id);
    if (mockRFX) {
      return { ...mockRFX, publicationDate: publishData.publicationDate, deadline: publishData.deadline, qaPeriod: publishData.qaPeriod, updatedAt: new Date().toISOString() };
    }
    throw new Error('RFX not found');
  },

  async closeRFX(id: string): Promise<RFX> {
    console.warn('Using mock data for close RFX');
    const mockRFX = await this.getRFX(id);
    if (mockRFX) {
      return { ...mockRFX, status: 'closed', updatedAt: new Date().toISOString() };
    }
    throw new Error('RFX not found');
  },

  // RFX Responses
  async getRFXResponses(rfxId: string, params?: {
    page?: number;
    limit?: number;
    supplierId?: string;
  }): Promise<{
    data: Array<{
      id: string;
      supplierId: string;
      supplierName: string;
      submittedAt: string;
      status: 'draft' | 'submitted' | 'under-review' | 'shortlisted' | 'rejected';
      score?: number;
      totalValue?: number;
    }>;
    total: number;
  }> {
    console.warn('Using mock data for RFX responses');
    const mockRFX = await this.getRFXs({ id: rfxId });
    if (mockRFX.data.length) {
      return {
        data: mockRFX.data[0].responses || [],
        total: mockRFX.data[0].responses?.length || 0,
      };
    }
    throw new Error('RFX not found');
  },

  async evaluateRFXResponse(rfxId: string, responseId: string, evaluationData: {
    scores: Array<{
      criteria: string;
      score: number;
      comments?: string;
    }>;
    overallScore: number;
    evaluator: string;
    comments?: string;
  }): Promise<any> {
    console.warn('Using mock data for evaluate RFX response');
    const mockRFX = await this.getRFXs({ id: rfxId });
    if (mockRFX.data.length) {
      const mockResponses = mockRFX.data[0].responses || [];
      const responseIndex = mockResponses.findIndex(r => r.id === responseId);
      if (responseIndex !== -1) {
        mockResponses[responseIndex] = {
          ...mockResponses[responseIndex],
          status: 'evaluated',
          evaluator: evaluationData.evaluator,
          comments: evaluationData.comments,
          scores: evaluationData.scores,
          overallScore: evaluationData.overallScore,
          updatedAt: new Date().toISOString(),
        };
        return mockResponses[responseIndex];
      }
    }
    throw new Error('RFX response not found');
  },

  async awardRFX(rfxId: string, awardData: {
    winningSupplierId: string;
    awardedBy: string;
    awardValue: number;
    comments?: string;
  }): Promise<RFX> {
    console.warn('Using mock data for award RFX');
    const mockRFX = await this.getRFX(rfxId);
    if (mockRFX) {
      return { ...mockRFX, status: 'awarded', updatedAt: new Date().toISOString() };
    }
    throw new Error('RFX not found');
  },

  // Budget Management
  async validateBudget(requisitionData: {
    department: string;
    costCenter: string;
    items: Array<{
      itemId: string;
      quantity: number;
      estimatedUnitPrice: number;
    }>;
  }): Promise<{
    isValid: boolean;
    availableBudget: number;
    requiredAmount: number;
    remainingBudget: number;
    warnings: string[];
  }> {
    console.warn('Using mock data for budget validation');
    const requiredAmount = requisitionData.items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitPrice), 0);
    return {
      isValid: true,
      availableBudget: 10000, // Mock budget
      requiredAmount: requiredAmount,
      remainingBudget: 10000 - requiredAmount,
      warnings: [],
    };
  },

  // Procurement Analytics
  async getProcurementAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    category?: string;
  }): Promise<{
    totalRequisitions: number;
    totalPurchaseOrders: number;
    totalSpend: number;
    averageProcessingTime: number;
    requisitionsByStatus: Record<string, number>;
    purchaseOrdersByStatus: Record<string, number>;
    spendByCategory: Array<{
      category: string;
      spend: number;
      percentage: number;
    }>;
    spendBySupplier: Array<{
      supplierId: string;
      supplierName: string;
      spend: number;
      orderCount: number;
    }>;
    processingTimeTrends: Array<{
      month: string;
      averageDays: number;
      requisitionCount: number;
    }>;
  }> {
    console.warn('Using mock data for procurement analytics');
    return {
      totalRequisitions: 10,
      totalPurchaseOrders: 5,
      totalSpend: 15000,
      averageProcessingTime: 10,
      requisitionsByStatus: {
        draft: 2,
        submitted: 3,
        approved: 2,
        rejected: 1,
        converted: 2,
      },
      purchaseOrdersByStatus: {
        draft: 1,
        pending: 2,
        approved: 1,
        sent: 1,
      },
      spendByCategory: [
        { category: 'IT Equipment', spend: 5000, percentage: 33.3 },
        { category: 'Office Supplies', spend: 10000, percentage: 66.7 },
      ],
      spendBySupplier: [
        { supplierId: 'supplier-1', supplierName: 'Mock Supplier 1', spend: 5000, orderCount: 2 },
        { supplierId: 'supplier-2', supplierName: 'Mock Supplier 2', spend: 10000, orderCount: 3 },
      ],
      processingTimeTrends: [
        { month: 'Jan 2024', averageDays: 8, requisitionCount: 2 },
        { month: 'Feb 2024', averageDays: 12, requisitionCount: 3 },
      ],
    };
  },

  // Bulk Operations
  async bulkApproveRequisitions(ids: string[], approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<Requisition[]> {
    console.warn('Using mock data for bulk approve requisitions');
    return mockRequisitions.filter(req => ids.includes(req.id));
  },

  async bulkApprovePurchaseOrders(ids: string[], approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<PurchaseOrder[]> {
    console.warn('Using mock data for bulk approve purchase orders');
    const purchaseOrders = await this.getPurchaseOrders();
    return purchaseOrders.data.filter(po => ids.includes(po.id));
  },

  async bulkSendPurchaseOrders(ids: string[], sendData: {
    method: 'email' | 'edi' | 'portal';
  }): Promise<PurchaseOrder[]> {
    console.warn('Using mock data for bulk send purchase orders');
    const purchaseOrders = await this.getPurchaseOrders();
    return purchaseOrders.data.filter(po => ids.includes(po.id));
  },

  // Export functionality
  async exportRequisitions(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    console.warn('Using mock data for export requisitions');
    const requisitions = await this.getRequisitions(params);
    const csvContent = `requisitionNumber,requestorName,department,costCenter,status,totalValue,createdAt\n${requisitions.data.map(req => `${req.requisitionNumber},${req.requestorName},${req.department},${req.costCenter},${req.status},${req.totalValue},${req.createdAt}`).join('\n')}`;
    return new Blob([csvContent], { type: 'text/csv' });
  },

  async exportPurchaseOrders(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    console.warn('Using mock data for export purchase orders');
    const purchaseOrders = await this.getPurchaseOrders(params);
    const csvContent = `poNumber,supplierName,totalAmount,status,createdAt\n${purchaseOrders.data.map(po => `${po.poNumber},${po.supplierName},${po.totalAmount},${po.status},${po.createdAt}`).join('\n')}`;
    return new Blob([csvContent], { type: 'text/csv' });
  },

  async exportRFXs(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    type?: 'rfi' | 'rfp' | 'rfq';
    status?: 'draft' | 'published' | 'closed' | 'evaluated' | 'awarded';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    console.warn('Using mock data for export RFXs');
    const rfxs = await this.getRFXs(params);
    const csvContent = `rfxNumber,type,status,category,title,createdAt\n${rfxs.data.map(r => `${r.rfxNumber},${r.type},${r.status},${r.category},${r.title},${r.createdAt}`).join('\n')}`;
    return new Blob([csvContent], { type: 'text/csv' });
  },
};



