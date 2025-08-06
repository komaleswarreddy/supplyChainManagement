import axios from 'axios';
import { 
  InventoryItem, 
  InventoryMovement, 
  InventoryAdjustment,
  InventoryReservation,
  BatchTracking,
  BarcodeInfo
} from '@/types/inventory';

const API_BASE_URL = '/api/inventory';

export const inventoryApi = {
  // Stock Management
  async getInventoryStock(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    category?: string;
    search?: string;
  }): Promise<{ data: InventoryItem[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/stock`, { params });
    return response.data;
  },

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const response = await axios.get(`${API_BASE_URL}/stock/${id}`);
    return response.data;
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await axios.put(`${API_BASE_URL}/stock/${id}`, data);
    return response.data;
  },

  // Inventory Movements
  async getInventoryMovements(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    movementType?: 'in' | 'out' | 'transfer' | 'adjustment';
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: InventoryMovement[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/movements`, { params });
    return response.data;
  },

  async getInventoryMovement(id: string): Promise<InventoryMovement> {
    const response = await axios.get(`${API_BASE_URL}/movements/${id}`);
    return response.data;
  },

  async createInventoryMovement(data: {
    itemId: string;
    locationId: string;
    movementType: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }): Promise<InventoryMovement> {
    const response = await axios.post(`${API_BASE_URL}/movements`, data);
    return response.data;
  },

  // Inventory Adjustments
  async getInventoryAdjustments(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    adjustmentType?: 'cycle-count' | 'damage' | 'expiry' | 'theft' | 'other';
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: InventoryAdjustment[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/adjustments`, { params });
    return response.data;
  },

  async getInventoryAdjustment(id: string): Promise<InventoryAdjustment> {
    const response = await axios.get(`${API_BASE_URL}/adjustments/${id}`);
    return response.data;
  },

  async createInventoryAdjustment(data: {
    itemId: string;
    locationId: string;
    adjustmentType: 'cycle-count' | 'damage' | 'expiry' | 'theft' | 'other';
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<InventoryAdjustment> {
    const response = await axios.post(`${API_BASE_URL}/adjustments`, data);
    return response.data;
  },

  async approveInventoryAdjustment(id: string, approvalData: {
    approvedBy: string;
    comments?: string;
  }): Promise<InventoryAdjustment> {
    const response = await axios.post(`${API_BASE_URL}/adjustments/${id}/approve`, approvalData);
    return response.data;
  },

  // Inventory Reservations
  async getInventoryReservations(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    status?: 'active' | 'fulfilled' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: InventoryReservation[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/reservations`, { params });
    return response.data;
  },

  async getInventoryReservation(id: string): Promise<InventoryReservation> {
    const response = await axios.get(`${API_BASE_URL}/reservations/${id}`);
    return response.data;
  },

  async createInventoryReservation(data: {
    itemId: string;
    locationId: string;
    quantity: number;
    reservedFor: string;
    reservedUntil: string;
    notes?: string;
  }): Promise<InventoryReservation> {
    const response = await axios.post(`${API_BASE_URL}/reservations`, data);
    return response.data;
  },

  async fulfillInventoryReservation(id: string): Promise<InventoryReservation> {
    const response = await axios.post(`${API_BASE_URL}/reservations/${id}/fulfill`);
    return response.data;
  },

  async cancelInventoryReservation(id: string, reason?: string): Promise<InventoryReservation> {
    const response = await axios.post(`${API_BASE_URL}/reservations/${id}/cancel`, { reason });
    return response.data;
  },

  // Batch Tracking
  async getBatchTracking(params?: {
    page?: number;
    limit?: number;
    itemId?: string;
    locationId?: string;
    batchNumber?: string;
    expiryDate?: string;
  }): Promise<{ data: BatchTracking[]; total: number; page: number; limit: number }> {
    const response = await axios.get(`${API_BASE_URL}/batch-tracking`, { params });
    return response.data;
  },

  async getBatchTrackingItem(id: string): Promise<BatchTracking> {
    const response = await axios.get(`${API_BASE_URL}/batch-tracking/${id}`);
    return response.data;
  },

  async createBatchTracking(data: {
    itemId: string;
    locationId: string;
    batchNumber: string;
    quantity: number;
    manufacturingDate: string;
    expiryDate: string;
    supplierId?: string;
    notes?: string;
  }): Promise<BatchTracking> {
    const response = await axios.post(`${API_BASE_URL}/batch-tracking`, data);
    return response.data;
  },

  async updateBatchTracking(id: string, data: Partial<BatchTracking>): Promise<BatchTracking> {
    const response = await axios.put(`${API_BASE_URL}/batch-tracking/${id}`, data);
    return response.data;
  },

  // Barcode Management
  async getBarcodeInfo(barcode: string): Promise<BarcodeInfo> {
    const response = await axios.get(`${API_BASE_URL}/barcode/${barcode}`);
    return response.data;
  },

  async generateBarcode(data: {
    itemId: string;
    barcodeType: 'code128' | 'code39' | 'ean13' | 'qr';
    format?: 'svg' | 'png' | 'pdf';
  }): Promise<{
    barcode: string;
    imageUrl: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/barcode/generate`, data);
    return response.data;
  },

  // Inventory Valuation
  async getInventoryValuation(params?: {
    locationId?: string;
    category?: string;
    valuationMethod?: 'fifo' | 'lifo' | 'average' | 'standard';
    asOfDate?: string;
  }): Promise<{
    totalValue: number;
    itemCount: number;
    valuationByItem: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      unitCost: number;
      totalValue: number;
      valuationMethod: string;
    }>;
    valuationByCategory: Array<{
      category: string;
      quantity: number;
      totalValue: number;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/valuation`, { params });
    return response.data;
  },

  // Inventory Alerts
  async getInventoryAlerts(params?: {
    page?: number;
    limit?: number;
    alertType?: 'low-stock' | 'overstock' | 'expiry' | 'slow-moving';
    severity?: 'low' | 'medium' | 'high';
  }): Promise<{
    data: Array<{
      id: string;
      alertType: 'low-stock' | 'overstock' | 'expiry' | 'slow-moving';
      severity: 'low' | 'medium' | 'high';
      itemId: string;
      itemName: string;
      locationId: string;
      locationName: string;
      message: string;
      createdAt: string;
      acknowledged: boolean;
      acknowledgedBy?: string;
      acknowledgedAt?: string;
    }>;
    total: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/alerts`, { params });
    return response.data;
  },

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/alerts/${id}/acknowledge`, { acknowledgedBy });
  },

  // Inventory Analytics
  async getInventoryAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    locationId?: string;
    category?: string;
  }): Promise<{
    totalItems: number;
    totalValue: number;
    averageTurnover: number;
    stockoutRate: number;
    excessInventoryValue: number;
    movementsByType: Array<{
      type: string;
      count: number;
      quantity: number;
    }>;
    topItems: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      value: number;
      turnover: number;
    }>;
    slowMovingItems: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      lastMovement: string;
      daysSinceLastMovement: number;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/analytics`, { params });
    return response.data;
  },

  // Bulk Operations
  async bulkUpdateStock(data: Array<{
    itemId: string;
    locationId: string;
    quantity: number;
    reason: string;
  }>): Promise<InventoryMovement[]> {
    const response = await axios.post(`${API_BASE_URL}/stock/bulk-update`, data);
    return response.data;
  },

  async bulkCreateAdjustments(data: Array<{
    itemId: string;
    locationId: string;
    adjustmentType: 'cycle-count' | 'damage' | 'expiry' | 'theft' | 'other';
    quantity: number;
    reason: string;
  }>): Promise<InventoryAdjustment[]> {
    const response = await axios.post(`${API_BASE_URL}/adjustments/bulk`, data);
    return response.data;
  },

  // Export functionality
  async exportInventoryStock(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
    category?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/stock/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportInventoryMovements(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    itemId?: string;
    locationId?: string;
    movementType?: 'in' | 'out' | 'transfer' | 'adjustment';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/movements/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};



