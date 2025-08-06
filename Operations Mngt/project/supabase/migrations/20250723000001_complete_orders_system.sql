/*
  # Complete Orders Management System Migration

  This migration creates the comprehensive orders management system with all related tables:
  - customers, customer_addresses, customer_contacts, customer_credit_history
  - promotions
  - orders, order_items, order_fulfillments, fulfillment_items
  - shipments, returns, return_items, payments
  - order_history, customer_order_preferences, order_templates

  Features:
  - Full multi-tenant isolation
  - Enterprise-grade audit trails
  - Complete order lifecycle management
  - Customer relationship management
  - Returns and refunds processing
  - Payment processing integration
  - Fulfillment and shipping tracking
  - Promotions and discount management

  Security:
  - Row Level Security on all tables
  - Tenant isolation policies
  - Comprehensive indexing for performance
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_number TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INDIVIDUAL', 'BUSINESS', 'DISTRIBUTOR', 'WHOLESALE')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLACKLISTED')),
  email TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  tax_id TEXT,
  credit_limit NUMERIC(15, 2),
  current_balance NUMERIC(15, 2) DEFAULT 0,
  payment_terms TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'EN',
  timezone TEXT DEFAULT 'UTC',
  customer_segment TEXT,
  acquisition_source TEXT,
  lifetime_value NUMERIC(15, 2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, customer_number)
);

-- Customer Addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('BILLING', 'SHIPPING', 'BOTH')),
  address_name TEXT,
  street TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Contacts table
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  mobile TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  department TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Credit History table
CREATE TABLE IF NOT EXISTS customer_credit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PAYMENT', 'ADJUSTMENT', 'CHARGE', 'REFUND')),
  amount NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL,
  reference TEXT,
  description TEXT,
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  promotion_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y')),
  value NUMERIC(10, 2) NOT NULL,
  minimum_order_amount NUMERIC(15, 2),
  maximum_discount_amount NUMERIC(15, 2),
  applicable_items UUID[],
  excluded_items UUID[],
  applicable_categories TEXT[],
  excluded_categories TEXT[],
  applicable_customers UUID[],
  excluded_customers UUID[],
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED')),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, promotion_code)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  channel TEXT NOT NULL CHECK (channel IN ('WEBSITE', 'MARKETPLACE', 'PHONE', 'EMAIL', 'B2B_PORTAL', 'MOBILE_APP')),
  channel_reference TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('SALES_ORDER', 'PURCHASE_ORDER', 'TRANSFER_ORDER', 'RETURN_ORDER')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC(10, 6) DEFAULT 1,
  
  -- Pricing
  subtotal NUMERIC(15, 2) NOT NULL,
  tax_amount NUMERIC(15, 2) NOT NULL,
  shipping_amount NUMERIC(15, 2) NOT NULL,
  discount_amount NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method TEXT,
  payment_reference TEXT,
  payment_gateway TEXT,
  payment_transaction_id TEXT,
  
  -- Shipping
  shipping_method TEXT,
  shipping_carrier TEXT,
  shipping_service TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  
  -- Dates
  requested_delivery_date TIMESTAMPTZ,
  promised_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  
  -- Promotions
  applied_promotions JSONB,
  promotion_discounts JSONB,
  
  -- Notes and Metadata
  notes TEXT,
  internal_notes TEXT,
  customer_notes TEXT,
  metadata JSONB,
  
  -- Workflow
  submitted_at TIMESTAMPTZ,
  submitted_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by_id UUID REFERENCES users(id),
  cancellation_reason TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, order_number)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  
  -- Quantities
  quantity INTEGER NOT NULL,
  unit_of_measure TEXT NOT NULL,
  allocated_quantity INTEGER NOT NULL DEFAULT 0,
  shipped_quantity INTEGER NOT NULL DEFAULT 0,
  delivered_quantity INTEGER NOT NULL DEFAULT 0,
  returned_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Pricing
  unit_price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5, 2),
  tax_amount NUMERIC(15, 2),
  discount_rate NUMERIC(5, 2),
  discount_amount NUMERIC(15, 2),
  total_amount NUMERIC(15, 2) NOT NULL,
  
  -- Status and Dates
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ALLOCATED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  requested_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  
  -- Product Information
  weight NUMERIC(10, 2),
  dimensions JSONB,
  product_options JSONB,
  
  -- Notes and Metadata
  notes TEXT,
  metadata JSONB,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(order_id, line_number)
);

-- Order Fulfillments table
CREATE TABLE IF NOT EXISTS order_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  fulfillment_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PICK', 'PACK', 'SHIP', 'DELIVER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  warehouse_id TEXT,
  assigned_to UUID REFERENCES users(id),
  
  -- Scheduling
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Performance
  estimated_duration INTEGER,
  actual_duration INTEGER,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, fulfillment_number)
);

-- Fulfillment Items table
CREATE TABLE IF NOT EXISTS fulfillment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  quantity INTEGER NOT NULL,
  location TEXT,
  
  -- Pick/Pack/Ship Tracking
  picked_at TIMESTAMPTZ,
  picked_by UUID REFERENCES users(id),
  packed_at TIMESTAMPTZ,
  packed_by UUID REFERENCES users(id),
  shipped_at TIMESTAMPTZ,
  shipped_by UUID REFERENCES users(id),
  
  -- Quality Control
  inspected_at TIMESTAMPTZ,
  inspected_by UUID REFERENCES users(id),
  inspection_result TEXT CHECK (inspection_result IN ('PASS', 'FAIL', 'CONDITIONAL')),
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  shipment_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  fulfillment_id UUID REFERENCES order_fulfillments(id),
  carrier_id UUID REFERENCES suppliers(id),
  
  -- Service Details
  service_level TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION')),
  
  -- Addresses
  origin_address JSONB NOT NULL,
  destination_address JSONB NOT NULL,
  
  -- Package Details
  weight NUMERIC(10, 2),
  dimensions JSONB,
  package_count INTEGER DEFAULT 1,
  
  -- Costs
  shipping_cost NUMERIC(15, 2),
  insurance_amount NUMERIC(15, 2),
  
  -- Dates
  shipped_at TIMESTAMPTZ,
  shipped_by UUID REFERENCES users(id),
  delivered_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES users(id),
  estimated_delivery_date TIMESTAMPTZ,
  
  -- Delivery Details
  delivery_signature TEXT,
  delivery_notes TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, shipment_number)
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  return_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  
  -- Return Details
  type TEXT NOT NULL CHECK (type IN ('RETURN', 'EXCHANGE', 'WARRANTY', 'DAMAGED')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'PROCESSED', 'COMPLETED')),
  
  -- Authorization
  authorized_at TIMESTAMPTZ,
  authorized_by UUID REFERENCES users(id),
  authorization_notes TEXT,
  
  -- Processing
  received_at TIMESTAMPTZ,
  received_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id),
  
  -- Refund/Exchange
  refund_amount NUMERIC(15, 2),
  refund_method TEXT,
  exchange_order_id UUID REFERENCES orders(id),
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, return_number)
);

-- Return Items table
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  quantity INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  payment_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  
  -- Payment Details
  type TEXT NOT NULL CHECK (type IN ('PAYMENT', 'REFUND', 'CREDIT', 'ADJUSTMENT')),
  method TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Gateway Information
  gateway TEXT,
  transaction_id TEXT,
  authorization_code TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
  
  -- Dates
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, payment_number)
);

-- Order History table
CREATE TABLE IF NOT EXISTS order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Customer Order Preferences table
CREATE TABLE IF NOT EXISTS customer_order_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Templates table
CREATE TABLE IF NOT EXISTS order_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES customers(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  template_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "orders_tenant_isolation" ON customers FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "customer_addresses_tenant_isolation" ON customer_addresses FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "customer_contacts_tenant_isolation" ON customer_contacts FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "customer_credit_history_tenant_isolation" ON customer_credit_history FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "promotions_tenant_isolation" ON promotions FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "orders_tenant_isolation" ON orders FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "order_items_tenant_isolation" ON order_items FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "order_fulfillments_tenant_isolation" ON order_fulfillments FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "fulfillment_items_tenant_isolation" ON fulfillment_items FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "shipments_tenant_isolation" ON shipments FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "returns_tenant_isolation" ON returns FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "return_items_tenant_isolation" ON return_items FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "payments_tenant_isolation" ON payments FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "order_history_tenant_isolation" ON order_history FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "customer_order_preferences_tenant_isolation" ON customer_order_preferences FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "order_templates_tenant_isolation" ON order_templates FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_credit_history_customer_id ON customer_credit_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_promotions_tenant_id ON promotions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(promotion_code);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON order_items(item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_fulfillments_order_id ON order_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillments_status ON order_fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_fulfillment_id ON fulfillment_items(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_order_item_id ON fulfillment_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_preferences_customer_id ON customer_order_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_templates_customer_id ON order_templates(customer_id); 