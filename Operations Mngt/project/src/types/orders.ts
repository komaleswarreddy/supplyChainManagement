import type { User } from './user';
import type { InventoryItem } from './inventory';
import type { Supplier } from './supplier';

// Customer Types
export type Customer = {
  id: string;
  tenantId: string;
  customerNumber: string;
  name: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'DISTRIBUTOR' | 'WHOLESALE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  description?: string;
  taxId?: string;
  creditLimit?: number;
  currentBalance: number;
  paymentTerms?: string;
  preferredCurrency: string;
  preferredLanguage: string;
  timezone: string;
  customerSegment?: 'PREMIUM' | 'STANDARD' | 'ECONOMY';
  acquisitionSource?: string;
  lifetimeValue: number;
  lastOrderDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type CustomerAddress = {
  id: string;
  tenantId: string;
  customerId: string;
  type: 'BILLING' | 'SHIPPING' | 'BOTH';
  addressName?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerContact = {
  id: string;
  tenantId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
  role?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerCreditHistory = {
  id: string;
  tenantId: string;
  customerId: string;
  type: 'PAYMENT' | 'ADJUSTMENT' | 'CHARGE' | 'REFUND';
  amount: number;
  balance: number;
  reference?: string;
  description?: string;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  createdBy: User;
};

// Promotion Types
export type Promotion = {
  id: string;
  tenantId: string;
  promotionCode: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  applicableItems?: string[];
  excludedItems?: string[];
  applicableCategories?: string[];
  excludedCategories?: string[];
  applicableCustomers?: string[];
  excludedCustomers?: string[];
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  priority: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

// Order Types
export type Order = {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  channel: 'WEBSITE' | 'MARKETPLACE' | 'PHONE' | 'EMAIL' | 'B2B_PORTAL' | 'MOBILE_APP';
  channelReference?: string;
  orderType: 'SALES_ORDER' | 'PURCHASE_ORDER' | 'TRANSFER_ORDER' | 'RETURN_ORDER';
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  currency: string;
  exchangeRate?: number;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Payment
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  paymentReference?: string;
  paymentGateway?: string;
  paymentTransactionId?: string;
  
  // Shipping
  shippingMethod?: string;
  shippingCarrier?: string;
  shippingService?: string;
  shippingAddress: Address;
  billingAddress: Address;
  
  // Dates
  requestedDeliveryDate?: string;
  promisedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Promotions
  appliedPromotions?: AppliedPromotion[];
  promotionDiscounts?: PromotionDiscount[];
  
  // Notes and Metadata
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  metadata?: Record<string, any>;
  
  // Workflow
  submittedAt?: string;
  submittedBy?: User;
  approvedAt?: string;
  approvedBy?: User;
  cancelledAt?: string;
  cancelledBy?: User;
  cancellationReason?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
  
  // Related Data
  items?: OrderItem[];
  fulfillments?: OrderFulfillment[];
  shipments?: Shipment[];
  payments?: Payment[];
  returns?: Return[];
  history?: OrderHistory[];
};

export type Address = {
  name?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type AppliedPromotion = {
  promotionCode: string;
  promotionName: string;
  discountAmount: number;
  appliedAt: string;
};

export type PromotionDiscount = {
  promotionCode: string;
  type: string;
  value: number;
  description: string;
};

// Order Item Types
export type OrderItem = {
  id: string;
  tenantId: string;
  orderId: string;
  lineNumber: number;
  itemId: string;
  item: InventoryItem;
  itemCode: string;
  description: string;
  sku?: string;
  barcode?: string;
  
  // Quantities
  quantity: number;
  unitOfMeasure: string;
  allocatedQuantity: number;
  shippedQuantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  
  // Pricing
  unitPrice: number;
  currency: string;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  
  // Status and Dates
  status: 'PENDING' | 'ALLOCATED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  requestedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Product Information
  weight?: number;
  dimensions?: Dimensions;
  productOptions?: Record<string, any>;
  
  // Notes and Metadata
  notes?: string;
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
};

export type Dimensions = {
  length: number;
  width: number;
  height: number;
  unit: string;
};

// Fulfillment Types
export type OrderFulfillment = {
  id: string;
  tenantId: string;
  fulfillmentNumber: string;
  orderId: string;
  type: 'PICK' | 'PACK' | 'SHIP' | 'DELIVER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  warehouseId?: string;
  assignedTo?: User;
  
  // Scheduling
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  completedBy?: User;
  
  // Performance
  estimatedDuration?: number;
  actualDuration?: number;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
  
  // Related Data
  items?: FulfillmentItem[];
};

export type FulfillmentItem = {
  id: string;
  tenantId: string;
  fulfillmentId: string;
  orderItemId: string;
  quantity: number;
  location?: string;
  
  // Pick/Pack/Ship Tracking
  pickedAt?: string;
  pickedBy?: User;
  packedAt?: string;
  packedBy?: User;
  shippedAt?: string;
  shippedBy?: User;
  
  // Quality Control
  inspectedAt?: string;
  inspectedBy?: User;
  inspectionResult?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
};

// Shipment Types
export type Shipment = {
  id: string;
  tenantId: string;
  shipmentNumber: string;
  orderId: string;
  fulfillmentId?: string;
  carrierId?: string;
  carrier?: Supplier;
  
  // Service Details
  serviceLevel?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  
  // Status
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION';
  
  // Addresses
  originAddress: Address;
  destinationAddress: Address;
  
  // Package Details
  weight?: number;
  dimensions?: Dimensions;
  packageCount: number;
  
  // Costs
  shippingCost?: number;
  insuranceAmount?: number;
  
  // Dates
  shippedAt?: string;
  shippedBy?: User;
  deliveredAt?: string;
  deliveredBy?: User;
  estimatedDeliveryDate?: string;
  
  // Delivery Details
  deliverySignature?: string;
  deliveryNotes?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
};

// Return Types
export type Return = {
  id: string;
  tenantId: string;
  returnNumber: string;
  orderId: string;
  customerId: string;
  customer: Customer;
  
  // Return Details
  type: 'RETURN' | 'EXCHANGE' | 'WARRANTY' | 'DAMAGED';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'PROCESSED' | 'COMPLETED';
  
  // Authorization
  authorizedAt?: string;
  authorizedBy?: User;
  authorizationNotes?: string;
  
  // Processing
  receivedAt?: string;
  receivedBy?: User;
  processedAt?: string;
  processedBy?: User;
  
  // Refund/Exchange
  refundAmount?: number;
  refundMethod?: 'ORIGINAL_PAYMENT' | 'STORE_CREDIT' | 'EXCHANGE';
  exchangeOrderId?: string;
  exchangeOrder?: Order;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
  
  // Related Data
  items?: ReturnItem[];
};

export type ReturnItem = {
  id: string;
  tenantId: string;
  returnId: string;
  orderItemId: string;
  quantity: number;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Payment Types
export type Payment = {
  id: string;
  tenantId: string;
  paymentNumber: string;
  orderId: string;
  customerId: string;
  customer: Customer;
  
  // Payment Details
  type: 'PAYMENT' | 'REFUND' | 'CREDIT' | 'ADJUSTMENT';
  method: string;
  amount: number;
  currency: string;
  
  // Gateway Information
  gateway?: string;
  transactionId?: string;
  authorizationCode?: string;
  
  // Status
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  
  // Dates
  processedAt?: string;
  completedAt?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

// Order History Types
export type OrderHistory = {
  id: string;
  tenantId: string;
  orderId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: User;
};

// Customer Order Preferences
export type CustomerOrderPreference = {
  id: string;
  tenantId: string;
  customerId: string;
  preferenceType: string;
  preferenceValue: string;
  isDefault: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Order Templates
export type OrderTemplate = {
  id: string;
  tenantId: string;
  templateName: string;
  description?: string;
  customerId?: string;
  customer?: Customer;
  isPublic: boolean;
  templateData: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

// Filter Types
export type CustomerFilters = {
  type?: string;
  status?: string;
  industry?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type OrderFilters = {
  status?: string;
  channel?: string;
  orderType?: string;
  priority?: string;
  paymentStatus?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  createdBy?: string;
  search?: string;
};

export type PromotionFilters = {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type ReturnFilters = {
  type?: string;
  status?: string;
  reason?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type PaymentFilters = {
  type?: string;
  method?: string;
  status?: string;
  gateway?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
};

// Business Logic Types
export type OrderCalculation = {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedPromotions: AppliedPromotion[];
  promotionDiscounts: PromotionDiscount[];
};

export type OrderStatusTransition = {
  fromStatus: string;
  toStatus: string;
  allowedRoles: string[];
  requiredFields?: string[];
  autoActions?: string[];
  notifications?: string[];
};

export type FulfillmentWorkflow = {
  orderId: string;
  steps: FulfillmentStep[];
  currentStep: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};

export type FulfillmentStep = {
  stepNumber: number;
  type: 'PICK' | 'PACK' | 'SHIP' | 'DELIVER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assignedTo?: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
};

export type InventoryAllocation = {
  orderItemId: string;
  itemId: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  locations: AllocationLocation[];
};

export type AllocationLocation = {
  locationId: string;
  locationName: string;
  availableQuantity: number;
  allocatedQuantity: number;
  priority: number;
};

// API Response Types
export type CustomerResponse = {
  data: Customer;
  message?: string;
  status: number;
};

export type OrderResponse = {
  data: Order;
  message?: string;
  status: number;
};

export type PromotionResponse = {
  data: Promotion;
  message?: string;
  status: number;
};

export type ReturnResponse = {
  data: Return;
  message?: string;
  status: number;
};

export type PaymentResponse = {
  data: Payment;
  message?: string;
  status: number;
};

export type OrderCalculationResponse = {
  data: OrderCalculation;
  message?: string;
  status: number;
};

export type FulfillmentWorkflowResponse = {
  data: FulfillmentWorkflow;
  message?: string;
  status: number;
};

export type InventoryAllocationResponse = {
  data: InventoryAllocation[];
  message?: string;
  status: number;
}; 