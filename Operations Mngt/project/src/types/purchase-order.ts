import type { User } from './user';
import type { Supplier } from './supplier';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  requisitionId?: string;
  currency: string;
  paymentTerms: number;
  deliveryTerms: string;
  shippingMethod: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  sentAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
}

export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'sent' | 'acknowledged' | 'received' | 'closed' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  receivedQuantity?: number;
  description?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  currency: string;
  paymentTerms: number;
  deliveryTerms: string;
  shippingMethod: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    deliveryDate: string;
    description?: string;
  }>;
  requisitionId?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: string;
  currency?: string;
  paymentTerms?: number;
  deliveryTerms?: string;
  shippingMethod?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    deliveryDate: string;
    description?: string;
  }>;
  notes?: string;
}

export interface PurchaseOrderHistory {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: any;
}

export interface PurchaseOrderAnalytics {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  ordersByStatus: Record<PurchaseOrderStatus, number>;
  ordersByMonth: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    orderCount: number;
    totalValue: number;
  }>;
}

export interface PurchaseOrderChange {
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
}

export interface PurchaseOrderAcknowledgment {
  id: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
  confirmedDeliveryDate?: string;
  priceConfirmation?: boolean;
  quantityConfirmation?: boolean;
  notes?: string;
}

export type PurchaseOrderType = 
  | 'STANDARD'
  | 'BLANKET'
  | 'CONTRACT'
  | 'DIRECT';

export type DeliveryStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'COMPLETE'
  | 'OVERDUE';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE';

export type PurchaseOrderFilters = {
  status?: PurchaseOrderStatus;
  type?: PurchaseOrderType;
  supplier?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  minAmount?: number;
  maxAmount?: number;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
};

export type PurchaseOrderFormData = Omit<
  PurchaseOrder,
  | 'id'
  | 'poNumber'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'submittedAt'
  | 'submittedBy'
  | 'approvedAt'
  | 'approvedBy'
  | 'sentAt'
  | 'completedAt'
  | 'cancelledAt'
  | 'cancelledBy'
  | 'audit'
>;