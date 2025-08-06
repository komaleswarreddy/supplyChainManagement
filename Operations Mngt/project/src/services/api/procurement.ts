import axios from 'axios';
import { 
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

const API_BASE_URL = '/api/procurement';

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
    const response = await axios.get(`${API_BASE_URL}/requisitions`, { params });
    return response.data;
  },

  async getRequisition(id: string): Promise<Requisition> {
    const response = await axios.get(`${API_BASE_URL}/requisitions/${id}`);
    return response.data;
  },

  async createRequisition(data: CreateRequisitionRequest): Promise<Requisition> {
    const response = await axios.post(`${API_BASE_URL}/requisitions`, data);
    return response.data;
  },

  async updateRequisition(id: string, data: UpdateRequisitionRequest): Promise<Requisition> {
    const response = await axios.put(`${API_BASE_URL}/requisitions/${id}`, data);
    return response.data;
  },

  async deleteRequisition(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/requisitions/${id}`);
  },

  async submitRequisition(id: string): Promise<Requisition> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/${id}/submit`);
    return response.data;
  },

  async approveRequisition(id: string, approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<Requisition> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/${id}/approve`, approvalData);
    return response.data;
  },

  async rejectRequisition(id: string, rejectionData: {
    rejectedBy: string;
    reason: string;
  }): Promise<Requisition> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/${id}/reject`, rejectionData);
    return response.data;
  },

  async convertToPurchaseOrder(id: string, conversionData: {
    supplierId: string;
    convertedBy: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/${id}/convert-to-po`, conversionData);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/requisitions/templates`, { params });
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/requisitions/templates`, data);
    return response.data;
  },

  async applyTemplate(templateId: string, requisitionData: {
    department: string;
    costCenter: string;
    justification: string;
  }): Promise<Requisition> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/templates/${templateId}/apply`, requisitionData);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/purchase-orders`, { params });
    return response.data;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await axios.get(`${API_BASE_URL}/purchase-orders/${id}`);
    return response.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders`, data);
    return response.data;
  },

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await axios.put(`${API_BASE_URL}/purchase-orders/${id}`, data);
    return response.data;
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/purchase-orders/${id}`);
  },

  async approvePurchaseOrder(id: string, approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/approve`, approvalData);
    return response.data;
  },

  async rejectPurchaseOrder(id: string, rejectionData: {
    rejectedBy: string;
    reason: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/reject`, rejectionData);
    return response.data;
  },

  async sendToSupplier(id: string, sendData: {
    method: 'email' | 'edi' | 'portal';
    recipientEmail?: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/send`, sendData);
    return response.data;
  },

  async acknowledgeFromSupplier(id: string, acknowledgmentData: {
    acknowledgedBy: string;
    confirmedDeliveryDate?: string;
    priceConfirmation?: boolean;
    quantityConfirmation?: boolean;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/acknowledge`, acknowledgmentData);
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/changes`, changeData);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/purchase-orders/${id}/changes`);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/rfx`, { params });
    return response.data;
  },

  async getRFX(id: string): Promise<RFX> {
    const response = await axios.get(`${API_BASE_URL}/rfx/${id}`);
    return response.data;
  },

  async createRFX(data: CreateRFXRequest): Promise<RFX> {
    const response = await axios.post(`${API_BASE_URL}/rfx`, data);
    return response.data;
  },

  async updateRFX(id: string, data: UpdateRFXRequest): Promise<RFX> {
    const response = await axios.put(`${API_BASE_URL}/rfx/${id}`, data);
    return response.data;
  },

  async deleteRFX(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/rfx/${id}`);
  },

  async publishRFX(id: string, publishData: {
    publicationDate: string;
    deadline: string;
    qaPeriod?: {
      startDate: string;
      endDate: string;
    };
  }): Promise<RFX> {
    const response = await axios.post(`${API_BASE_URL}/rfx/${id}/publish`, publishData);
    return response.data;
  },

  async closeRFX(id: string): Promise<RFX> {
    const response = await axios.post(`${API_BASE_URL}/rfx/${id}/close`);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/rfx/${rfxId}/responses`, { params });
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/rfx/${rfxId}/responses/${responseId}/evaluate`, evaluationData);
    return response.data;
  },

  async awardRFX(rfxId: string, awardData: {
    winningSupplierId: string;
    awardedBy: string;
    awardValue: number;
    comments?: string;
  }): Promise<RFX> {
    const response = await axios.post(`${API_BASE_URL}/rfx/${rfxId}/award`, awardData);
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/budget/validate`, requisitionData);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Bulk Operations
  async bulkApproveRequisitions(ids: string[], approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<Requisition[]> {
    const response = await axios.post(`${API_BASE_URL}/requisitions/bulk/approve`, { ids, ...approvalData });
    return response.data;
  },

  async bulkApprovePurchaseOrders(ids: string[], approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<PurchaseOrder[]> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/bulk/approve`, { ids, ...approvalData });
    return response.data;
  },

  async bulkSendPurchaseOrders(ids: string[], sendData: {
    method: 'email' | 'edi' | 'portal';
  }): Promise<PurchaseOrder[]> {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders/bulk/send`, { ids, ...sendData });
    return response.data;
  },

  // Export functionality
  async exportRequisitions(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/requisitions/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportPurchaseOrders(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/purchase-orders/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportRFXs(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    type?: 'rfi' | 'rfp' | 'rfq';
    status?: 'draft' | 'published' | 'closed' | 'evaluated' | 'awarded';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/rfx/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



