import axios from 'axios';
import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderStatus } from '@/types/purchase-order';

const API_BASE_URL = '/api/procurement/purchase-orders';

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
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  // Get a single purchase order by ID
  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new purchase order
  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  // Update an existing purchase order
  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a purchase order
  async deletePurchaseOrder(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Approve a purchase order
  async approvePurchaseOrder(id: string, approvalData: { approvedBy: string; comments?: string }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/${id}/approve`, approvalData);
    return response.data;
  },

  // Reject a purchase order
  async rejectPurchaseOrder(id: string, rejectionData: { rejectedBy: string; reason: string }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/${id}/reject`, rejectionData);
    return response.data;
  },

  // Send purchase order to supplier
  async sendToSupplier(id: string, sendData: { method: 'email' | 'edi' | 'portal'; recipientEmail?: string }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/${id}/send`, sendData);
    return response.data;
  },

  // Acknowledge purchase order from supplier
  async acknowledgeFromSupplier(id: string, acknowledgmentData: {
    acknowledgedBy: string;
    confirmedDeliveryDate?: string;
    priceConfirmation?: boolean;
    quantityConfirmation?: boolean;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const response = await axios.post(`${API_BASE_URL}/${id}/acknowledge`, acknowledgmentData);
    return response.data;
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
    const response = await axios.post(`${API_BASE_URL}/${id}/changes`, changeData);
    return response.data;
  },

  // Get purchase order history
  async getPurchaseOrderHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    performedBy: string;
    performedAt: string;
    details: any;
  }>> {
    const response = await axios.get(`${API_BASE_URL}/${id}/history`);
    return response.data;
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
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Bulk operations
  async bulkApprove(ids: string[], approvalData: { approvedBy: string; comments?: string }): Promise<PurchaseOrder[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/approve`, { ids, ...approvalData });
    return response.data;
  },

  async bulkSend(ids: string[], sendData: { method: 'email' | 'edi' | 'portal' }): Promise<PurchaseOrder[]> {
    const response = await axios.post(`${API_BASE_URL}/bulk/send`, { ids, ...sendData });
    return response.data;
  },

  // Export purchase orders
  async exportPurchaseOrders(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: PurchaseOrderStatus;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



