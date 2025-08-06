// Order Management Comprehensive Types
export type OrderStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED'
  | 'ON_HOLD'
  | 'PARTIALLY_SHIPPED'
  | 'RETURNED';

export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type OrderType = 'STANDARD' | 'EXPRESS' | 'BULK' | 'SUBSCRIPTION' | 'CUSTOM';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'CASH' | 'CHECK';

export type FulfillmentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'PICKED' 
  | 'PACKED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type ShipmentStatus = 
  | 'CREATED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'EXCEPTION' 
  | 'RETURNED';

export type ReturnStatus = 
  | 'REQUESTED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RECEIVED' 
  | 'INSPECTED' 
  | 'PROCESSED' 
  | 'REFUNDED';

export type ReturnReason = 
  | 'DEFECTIVE' 
  | 'WRONG_ITEM' 
  | 'NOT_AS_DESCRIBED' 
  | 'DAMAGED' 
  | 'CHANGED_MIND' 
  | 'SIZE_ISSUE' 
  | 'OTHER';

// Address Interface
export interface Address {
  id: string;
  type: 'BILLING' | 'SHIPPING';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Customer Interface
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  addresses: Address[];
  contacts: CustomerContact[];
  preferences: CustomerOrderPreferences;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  notes?: string;
}

export interface CustomerContact {
  id: string;
  customerId: string;
  type: 'PRIMARY' | 'SECONDARY' | 'EMERGENCY';
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface CustomerOrderPreferences {
  id: string;
  customerId: string;
  preferredPaymentMethod?: PaymentMethod;
  preferredShippingMethod?: string;
  allowBackorders: boolean;
  allowPartialShipments: boolean;
  communicationPreferences: {
    orderConfirmation: boolean;
    shippingNotifications: boolean;
    deliveryNotifications: boolean;
    promotionalEmails: boolean;
  };
  specialInstructions?: string;
}

// Order Item Interface
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  taxAmount: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  customizations?: Record<string, any>;
  notes?: string;
}

// Promotion Interface
export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// Order Interface
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  status: OrderStatus;
  priority: OrderPriority;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  billingAddress: Address;
  shippingAddress: Address;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  promotions: Promotion[];
  paymentStatus: PaymentStatus;
  payments: Payment[];
  fulfillments: OrderFulfillment[];
  shipments: Shipment[];
  returns: OrderReturn[];
  notes: OrderNote[];
  history: OrderHistory[];
  tags: string[];
  source: 'WEB' | 'MOBILE' | 'PHONE' | 'EMAIL' | 'ADMIN';
  referenceNumber?: string;
  poNumber?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Order Fulfillment Interface
export interface OrderFulfillment {
  id: string;
  orderId: string;
  fulfillmentNumber: string;
  status: FulfillmentStatus;
  items: FulfillmentItem[];
  warehouseId?: string;
  warehouseName?: string;
  assignedTo?: string;
  pickedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  shippingCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentItem {
  id: string;
  fulfillmentId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityFulfilled: number;
  serialNumbers?: string[];
  lotNumbers?: string[];
  expirationDates?: string[];
}

// Shipment Interface
export interface Shipment {
  id: string;
  orderId: string;
  fulfillmentId?: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  carrierId?: string;
  carrierName?: string;
  serviceType?: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingCost: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingAddress: Address;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  signature?: string;
  deliveryInstructions?: string;
  items: ShipmentItem[];
  trackingEvents: TrackingEvent[];
  documents: ShipmentDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  source: 'CARRIER' | 'SYSTEM' | 'MANUAL';
}

export interface ShipmentDocument {
  id: string;
  shipmentId: string;
  type: 'LABEL' | 'INVOICE' | 'PACKING_SLIP' | 'CUSTOMS' | 'INSURANCE';
  name: string;
  url: string;
  createdAt: string;
}

// Return Interface
export interface OrderReturn {
  id: string;
  orderId: string;
  returnNumber: string;
  status: ReturnStatus;
  reason: ReturnReason;
  reasonDescription?: string;
  items: ReturnItem[];
  refundAmount: number;
  restockingFee: number;
  shippingCost: number;
  totalRefund: number;
  returnAddress?: Address;
  trackingNumber?: string;
  receivedAt?: string;
  processedAt?: string;
  refundedAt?: string;
  approvedBy?: string;
  processedBy?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityReturned: number;
  unitPrice: number;
  refundAmount: number;
  condition: 'NEW' | 'USED' | 'DAMAGED' | 'DEFECTIVE';
  restockable: boolean;
  notes?: string;
}

// Payment Interface
export interface Payment {
  id: string;
  orderId: string;
  paymentNumber: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  processedAt?: string;
  failureReason?: string;
  refundAmount: number;
  refunds: PaymentRefund[];
  billingAddress?: Address;
  cardLast4?: string;
  cardBrand?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  transactionId?: string;
  processedAt: string;
  processedBy: string;
  notes?: string;
}

// Order Notes and History
export interface OrderNote {
  id: string;
  orderId: string;
  type: 'INTERNAL' | 'CUSTOMER' | 'SYSTEM';
  content: string;
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  action: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

// Order Template Interface
export interface OrderTemplate {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  items: Omit<OrderItem, 'id' | 'orderId' | 'totalPrice'>[];
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Interfaces
export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: OrderStatus[];
    priority?: OrderPriority[];
    type?: OrderType[];
    dateRange?: {
      start: string;
      end: string;
    };
    customerId?: string;
    search?: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<OrderStatus, number>;
  };
}

export interface OrderDetailResponse {
  order: Order;
  relatedOrders: Pick<Order, 'id' | 'orderNumber' | 'status' | 'totalAmount' | 'createdAt'>[];
  customerHistory: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: string;
  };
  availableActions: string[];
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: string[];
    customerType?: string[];
    loyaltyTier?: string[];
    search?: string;
  };
}

// Analytics Interfaces
export interface OrderAnalytics {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    returnRate: number;
    customerSatisfaction: number;
  };
  trends: {
    orders: { date: string; count: number; revenue: number }[];
    customers: { date: string; new: number; returning: number }[];
    products: { productId: string; productName: string; quantity: number; revenue: number }[];
  };
  statusBreakdown: Record<OrderStatus, number>;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  geographicBreakdown: { region: string; orders: number; revenue: number }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }[];
  performanceMetrics: {
    averageFulfillmentTime: number;
    averageShippingTime: number;
    onTimeDeliveryRate: number;
    orderAccuracy: number;
  };
}

// Form Schemas for Validation
export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    customizations?: Record<string, any>;
  }>;
  billingAddress: Omit<Address, 'id'>;
  shippingAddress: Omit<Address, 'id'>;
  shippingMethod?: string;
  promotionCodes?: string[];
  specialInstructions?: string;
  poNumber?: string;
  tags?: string[];
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  priority?: OrderPriority;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: string;
  specialInstructions?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  addresses?: Omit<Address, 'id'>[];
  contacts?: Omit<CustomerContact, 'id' | 'customerId'>[];
  preferences?: Partial<Omit<CustomerOrderPreferences, 'id' | 'customerId'>>;
  notes?: string;
}

// Filter and Search Interfaces
export interface OrderFilters {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  type?: OrderType[];
  paymentStatus?: PaymentStatus[];
  customerId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
  tags?: string[];
  source?: string[];
}

export interface CustomerFilters {
  status?: string[];
  customerType?: string[];
  loyaltyTier?: string[];
  search?: string;
  registrationDateRange?: {
    start: string;
    end: string;
  };
  orderCountRange?: {
    min: number;
    max: number;
  };
  totalSpentRange?: {
    min: number;
    max: number;
  };
}

// Bulk Operations
export interface BulkOrderOperation {
  orderIds: string[];
  operation: 'UPDATE_STATUS' | 'ADD_TAGS' | 'REMOVE_TAGS' | 'EXPORT' | 'CANCEL';
  parameters: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    orderId: string;
    error: string;
  }>;
} 