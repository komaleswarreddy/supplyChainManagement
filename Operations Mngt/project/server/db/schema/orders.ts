import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { inventoryItems } from './inventory';
import { suppliers } from './suppliers';

// Customers
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  customerNumber: text('customer_number').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // INDIVIDUAL, BUSINESS, DISTRIBUTOR, WHOLESALE
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  industry: text('industry'),
  description: text('description'),
  taxId: text('tax_id'),
  creditLimit: numeric('credit_limit', { precision: 15, scale: 2 }),
  currentBalance: numeric('current_balance', { precision: 15, scale: 2 }).default('0'),
  paymentTerms: text('payment_terms'), // NET_30, NET_60, IMMEDIATE, etc.
  preferredCurrency: text('preferred_currency').default('USD'),
  preferredLanguage: text('preferred_language').default('EN'),
  timezone: text('timezone').default('UTC'),
  customerSegment: text('customer_segment'), // PREMIUM, STANDARD, ECONOMY
  acquisitionSource: text('acquisition_source'), // WEBSITE, REFERRAL, MARKETING, etc.
  lifetimeValue: numeric('lifetime_value', { precision: 15, scale: 2 }).default('0'),
  lastOrderDate: timestamp('last_order_date', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  customerNumberIdx: index('customer_number_idx').on(table.customerNumber),
  emailIdx: index('customer_email_idx').on(table.email),
  tenantCustomerIdx: index('tenant_customer_idx').on(table.tenantId, table.customerNumber),
}));

// Customer Addresses
export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  type: text('type').notNull(), // BILLING, SHIPPING, BOTH
  addressName: text('address_name'), // Home, Office, Warehouse, etc.
  street: text('street').notNull(),
  street2: text('street2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  isDefaultBilling: boolean('is_default_billing').notNull().default(false),
  isDefaultShipping: boolean('is_default_shipping').notNull().default(false),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Customer Contacts
export const customerContacts = pgTable('customer_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  mobile: text('mobile'),
  isPrimary: boolean('is_primary').notNull().default(false),
  department: text('department'),
  role: text('role'), // Decision Maker, Influencer, User, etc.
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Customer Credit History
export const customerCreditHistory = pgTable('customer_credit_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  type: text('type').notNull(), // PAYMENT, ADJUSTMENT, CHARGE, REFUND
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull(),
  reference: text('reference'), // Invoice number, order number, etc.
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidDate: timestamp('paid_date', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
});

// Promotions and Discounts
export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  promotionCode: text('promotion_code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  minimumOrderAmount: numeric('minimum_order_amount', { precision: 15, scale: 2 }),
  maximumDiscountAmount: numeric('maximum_discount_amount', { precision: 15, scale: 2 }),
  applicableItems: uuid('applicable_items').array(),
  excludedItems: uuid('excluded_items').array(),
  applicableCategories: text('applicable_categories').array(),
  excludedCategories: text('excluded_categories').array(),
  applicableCustomers: uuid('applicable_customers').array(),
  excludedCustomers: uuid('excluded_customers').array(),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  perCustomerLimit: integer('per_customer_limit'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, EXPIRED
  priority: integer('priority').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  promotionCodeIdx: index('promotion_code_idx').on(table.promotionCode),
  tenantPromotionIdx: index('tenant_promotion_idx').on(table.tenantId, table.promotionCode),
}));

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  orderNumber: text('order_number').notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  channel: text('channel').notNull(), // WEBSITE, MARKETPLACE, PHONE, EMAIL, B2B_PORTAL, MOBILE_APP
  channelReference: text('channel_reference'), // External order ID
  orderType: text('order_type').notNull(), // SALES_ORDER, PURCHASE_ORDER, TRANSFER_ORDER, RETURN_ORDER
  status: text('status').notNull().default('DRAFT'), // DRAFT, PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  currency: text('currency').notNull().default('USD'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }).default('1'),
  
  // Pricing
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
  shippingAmount: numeric('shipping_amount', { precision: 15, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  
  // Payment
  paymentStatus: text('payment_status').notNull().default('PENDING'), // PENDING, PARTIAL, PAID, FAILED, REFUNDED
  paymentMethod: text('payment_method'), // CREDIT_CARD, BANK_TRANSFER, CASH, CHECK, etc.
  paymentReference: text('payment_reference'),
  paymentGateway: text('payment_gateway'), // STRIPE, PAYPAL, SQUARE, etc.
  paymentTransactionId: text('payment_transaction_id'),
  
  // Shipping
  shippingMethod: text('shipping_method'),
  shippingCarrier: text('shipping_carrier'),
  shippingService: text('shipping_service'),
  shippingAddress: jsonb('shipping_address').notNull(),
  billingAddress: jsonb('billing_address').notNull(),
  
  // Dates
  requestedDeliveryDate: timestamp('requested_delivery_date', { withTimezone: true }),
  promisedDeliveryDate: timestamp('promised_delivery_date', { withTimezone: true }),
  actualDeliveryDate: timestamp('actual_delivery_date', { withTimezone: true }),
  
  // Promotions
  appliedPromotions: jsonb('applied_promotions'), // Array of applied promotion codes
  promotionDiscounts: jsonb('promotion_discounts'), // Breakdown of promotion discounts
  
  // Notes and Metadata
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  customerNotes: text('customer_notes'),
  metadata: jsonb('metadata'),
  
  // Workflow
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  submittedById: uuid('submitted_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedById: uuid('approved_by_id').references(() => users.id),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledById: uuid('cancelled_by_id').references(() => users.id),
  cancellationReason: text('cancellation_reason'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  orderNumberIdx: index('order_number_idx').on(table.orderNumber),
  customerOrderIdx: index('customer_order_idx').on(table.customerId, table.orderNumber),
  tenantOrderIdx: index('tenant_order_idx').on(table.tenantId, table.orderNumber),
  statusIdx: index('order_status_idx').on(table.status),
  channelIdx: index('order_channel_idx').on(table.channel),
}));

// Order Items
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  lineNumber: integer('line_number').notNull(),
  itemId: uuid('item_id').notNull().references(() => inventoryItems.id),
  itemCode: text('item_code').notNull(),
  description: text('description').notNull(),
  sku: text('sku'),
  barcode: text('barcode'),
  
  // Quantities
  quantity: integer('quantity').notNull(),
  unitOfMeasure: text('unit_of_measure').notNull(),
  allocatedQuantity: integer('allocated_quantity').notNull().default(0),
  shippedQuantity: integer('shipped_quantity').notNull().default(0),
  deliveredQuantity: integer('delivered_quantity').notNull().default(0),
  returnedQuantity: integer('returned_quantity').notNull().default(0),
  
  // Pricing
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }),
  discountRate: numeric('discount_rate', { precision: 5, scale: 2 }),
  discountAmount: numeric('discount_amount', { precision: 15, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  
  // Status and Dates
  status: text('status').notNull().default('PENDING'), // PENDING, ALLOCATED, SHIPPED, DELIVERED, CANCELLED
  requestedDeliveryDate: timestamp('requested_delivery_date', { withTimezone: true }),
  actualDeliveryDate: timestamp('actual_delivery_date', { withTimezone: true }),
  
  // Product Information
  weight: numeric('weight', { precision: 10, scale: 2 }),
  dimensions: jsonb('dimensions'), // {length, width, height}
  productOptions: jsonb('product_options'), // Color, size, etc.
  
  // Notes and Metadata
  notes: text('notes'),
  metadata: jsonb('metadata'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderItemIdx: index('order_item_idx').on(table.orderId, table.lineNumber),
  itemOrderIdx: index('item_order_idx').on(table.itemId, table.orderId),
}));

// Order Fulfillments
export const orderFulfillments = pgTable('order_fulfillments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  fulfillmentNumber: text('fulfillment_number').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  type: text('type').notNull(), // PICK, PACK, SHIP, DELIVER
  status: text('status').notNull().default('PENDING'), // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  warehouseId: text('warehouse_id'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  
  // Scheduling
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id),
  
  // Performance
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  
  // Notes
  notes: text('notes'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  fulfillmentNumberIdx: index('fulfillment_number_idx').on(table.fulfillmentNumber),
  orderFulfillmentIdx: index('order_fulfillment_idx').on(table.orderId, table.fulfillmentNumber),
}));

// Fulfillment Items
export const fulfillmentItems = pgTable('fulfillment_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  fulfillmentId: uuid('fulfillment_id').notNull().references(() => orderFulfillments.id),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id),
  quantity: integer('quantity').notNull(),
  location: text('location'),
  
  // Pick/Pack/Ship Tracking
  pickedAt: timestamp('picked_at', { withTimezone: true }),
  pickedBy: uuid('picked_by').references(() => users.id),
  packedAt: timestamp('packed_at', { withTimezone: true }),
  packedBy: uuid('packed_by').references(() => users.id),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  shippedBy: uuid('shipped_by').references(() => users.id),
  
  // Quality Control
  inspectedAt: timestamp('inspected_at', { withTimezone: true }),
  inspectedBy: uuid('inspected_by').references(() => users.id),
  inspectionResult: text('inspection_result'), // PASS, FAIL, CONDITIONAL
  
  // Notes
  notes: text('notes'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Shipments
export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  shipmentNumber: text('shipment_number').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  fulfillmentId: uuid('fulfillment_id').references(() => orderFulfillments.id),
  carrierId: uuid('carrier_id').references(() => suppliers.id),
  
  // Service Details
  serviceLevel: text('service_level'), // STANDARD, EXPRESS, OVERNIGHT, etc.
  trackingNumber: text('tracking_number'),
  trackingUrl: text('tracking_url'),
  
  // Status
  status: text('status').notNull().default('PENDING'), // PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, EXCEPTION
  
  // Addresses
  originAddress: jsonb('origin_address').notNull(),
  destinationAddress: jsonb('destination_address').notNull(),
  
  // Package Details
  weight: numeric('weight', { precision: 10, scale: 2 }),
  dimensions: jsonb('dimensions'), // {length, width, height}
  packageCount: integer('package_count').default(1),
  
  // Costs
  shippingCost: numeric('shipping_cost', { precision: 15, scale: 2 }),
  insuranceAmount: numeric('insurance_amount', { precision: 15, scale: 2 }),
  
  // Dates
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  shippedBy: uuid('shipped_by').references(() => users.id),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  deliveredBy: uuid('delivered_by').references(() => users.id),
  estimatedDeliveryDate: timestamp('estimated_delivery_date', { withTimezone: true }),
  
  // Delivery Details
  deliverySignature: text('delivery_signature'),
  deliveryNotes: text('delivery_notes'),
  
  // Notes
  notes: text('notes'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  shipmentNumberIdx: index('shipment_number_idx').on(table.shipmentNumber),
  trackingNumberIdx: index('tracking_number_idx').on(table.trackingNumber),
  orderShipmentIdx: index('order_shipment_idx').on(table.orderId, table.shipmentNumber),
}));

// Returns
export const returns = pgTable('returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  returnNumber: text('return_number').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  
  // Return Details
  type: text('type').notNull(), // RETURN, EXCHANGE, WARRANTY, DAMAGED
  reason: text('reason').notNull(), // WRONG_SIZE, DEFECTIVE, NOT_AS_DESCRIBED, etc.
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, RECEIVED, PROCESSED, COMPLETED
  
  // Authorization
  authorizedAt: timestamp('authorized_at', { withTimezone: true }),
  authorizedBy: uuid('authorized_by').references(() => users.id),
  authorizationNotes: text('authorization_notes'),
  
  // Processing
  receivedAt: timestamp('received_at', { withTimezone: true }),
  receivedBy: uuid('received_by').references(() => users.id),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  processedBy: uuid('processed_by').references(() => users.id),
  
  // Refund/Exchange
  refundAmount: numeric('refund_amount', { precision: 15, scale: 2 }),
  refundMethod: text('refund_method'), // ORIGINAL_PAYMENT, STORE_CREDIT, EXCHANGE
  exchangeOrderId: uuid('exchange_order_id').references(() => orders.id),
  
  // Notes
  customerNotes: text('customer_notes'),
  internalNotes: text('internal_notes'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  returnNumberIdx: index('return_number_idx').on(table.returnNumber),
  orderReturnIdx: index('order_return_idx').on(table.orderId, table.returnNumber),
}));

// Return Items
export const returnItems = pgTable('return_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  returnId: uuid('return_id').notNull().references(() => returns.id),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id),
  quantity: integer('quantity').notNull(),
  condition: text('condition').notNull(), // NEW, LIKE_NEW, GOOD, FAIR, POOR
  reason: text('reason').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  paymentNumber: text('payment_number').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  
  // Payment Details
  type: text('type').notNull(), // PAYMENT, REFUND, CREDIT, ADJUSTMENT
  method: text('method').notNull(), // CREDIT_CARD, BANK_TRANSFER, CASH, CHECK, etc.
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  
  // Gateway Information
  gateway: text('gateway'), // STRIPE, PAYPAL, SQUARE, etc.
  transactionId: text('transaction_id'),
  authorizationCode: text('authorization_code'),
  
  // Status
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
  
  // Dates
  processedAt: timestamp('processed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  
  // Notes
  notes: text('notes'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  paymentNumberIdx: index('payment_number_idx').on(table.paymentNumber),
  orderPaymentIdx: index('order_payment_idx').on(table.orderId, table.paymentNumber),
  transactionIdx: index('transaction_idx').on(table.transactionId),
}));

// Order History
export const orderHistory = pgTable('order_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  action: text('action').notNull(), // CREATED, UPDATED, STATUS_CHANGED, CANCELLED, etc.
  field: text('field'), // The field that was changed
  oldValue: text('old_value'),
  newValue: text('new_value'),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
}, (table) => ({
  orderHistoryIdx: index('order_history_idx').on(table.orderId, table.createdAt),
}));

// Customer Order Preferences
export const customerOrderPreferences = pgTable('customer_order_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  preferenceType: text('preference_type').notNull(), // SHIPPING_METHOD, PAYMENT_METHOD, DELIVERY_TIME, etc.
  preferenceValue: text('preference_value').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Order Templates
export const orderTemplates = pgTable('order_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  templateName: text('template_name').notNull(),
  description: text('description'),
  customerId: uuid('customer_id').references(() => customers.id),
  isPublic: boolean('is_public').notNull().default(false),
  templateData: jsonb('template_data').notNull(), // Order structure and default values
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
}); 