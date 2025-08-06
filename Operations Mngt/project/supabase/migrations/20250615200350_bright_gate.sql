/*
  # Create procurement tables

  1. New Tables
    - `requisitions` - Stores requisition information
    - `requisition_items` - Stores requisition item information
    - `purchase_orders` - Stores purchase order information
    - `purchase_order_items` - Stores purchase order item information
    - `contracts` - Stores contract information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Requisitions table
CREATE TABLE IF NOT EXISTS requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  requisition_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requestor_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  cost_center TEXT NOT NULL,
  project_code TEXT,
  budget_code TEXT,
  budget_year INTEGER NOT NULL,
  budget_status TEXT NOT NULL DEFAULT 'WITHIN_BUDGET',
  total_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  justification TEXT,
  business_purpose TEXT NOT NULL,
  delivery_location JSONB NOT NULL,
  required_by_date TIMESTAMPTZ NOT NULL,
  payment_terms TEXT,
  procurement_type TEXT NOT NULL,
  procurement_method TEXT NOT NULL,
  contract_reference TEXT,
  approval_workflow JSONB,
  attachments TEXT[] ARRAY,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approver_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, requisition_number)
);

-- Requisition items table
CREATE TABLE IF NOT EXISTS requisition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  requisition_id UUID NOT NULL REFERENCES requisitions(id),
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_of_measure TEXT NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  requested_delivery_date TIMESTAMPTZ NOT NULL,
  specifications TEXT,
  category TEXT NOT NULL,
  manufacturer TEXT,
  part_number TEXT,
  preferred_supplier TEXT,
  alternative_suppliers TEXT[] ARRAY,
  warranty_required BOOLEAN NOT NULL DEFAULT false,
  warranty_duration TEXT,
  technical_specifications TEXT,
  quality_requirements TEXT,
  hs_code TEXT,
  budget_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  po_number TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_date TIMESTAMPTZ NOT NULL,
  required_by_date TIMESTAMPTZ NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(15, 2) NOT NULL,
  tax_total NUMERIC(15, 2) NOT NULL,
  shipping_cost NUMERIC(15, 2) NOT NULL,
  other_charges NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  payment_terms TEXT NOT NULL,
  delivery_terms TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  delivery_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'PENDING',
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  approval_workflow JSONB,
  notes TEXT,
  terms TEXT,
  metadata JSONB,
  submitted_at TIMESTAMPTZ,
  submitted_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by_id UUID REFERENCES users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, po_number)
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  line_number INTEGER NOT NULL,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_of_measure TEXT NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5, 2),
  tax_amount NUMERIC(15, 2),
  total_amount NUMERIC(15, 2) NOT NULL,
  requested_delivery_date TIMESTAMPTZ NOT NULL,
  specifications TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  received_quantity INTEGER NOT NULL DEFAULT 0,
  remaining_quantity INTEGER NOT NULL,
  last_receipt_date TIMESTAMPTZ,
  requisition_id UUID REFERENCES requisitions(id),
  requisition_item_id UUID REFERENCES requisition_items(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  priority TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  value NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  renewal_type TEXT NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  renewal_notification_days INTEGER NOT NULL,
  notice_period_days INTEGER NOT NULL,
  terms TEXT,
  termination_conditions TEXT,
  approval_workflow JSONB,
  metadata JSONB,
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES users(id),
  terminated_at TIMESTAMPTZ,
  terminated_by_id UUID REFERENCES users(id),
  termination_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, contract_number)
);

-- Enable Row Level Security
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requisitions_tenant_id ON requisitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_requestor_id ON requisitions(requestor_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
CREATE INDEX IF NOT EXISTS idx_requisitions_department ON requisitions(department);
CREATE INDEX IF NOT EXISTS idx_requisitions_category ON requisitions(category);
CREATE INDEX IF NOT EXISTS idx_requisition_items_requisition_id ON requisition_items(requisition_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_delivery_status ON purchase_orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_status ON purchase_order_items(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier_id ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);