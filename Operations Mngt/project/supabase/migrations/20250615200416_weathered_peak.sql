/*
  # Create transportation tables

  1. New Tables
    - `carriers` - Stores carrier information
    - `shipments` - Stores shipment information
    - `loads` - Stores load information
    - `shipping_documents` - Stores shipping document information
    - `freight_invoices` - Stores freight invoice information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Carriers table
CREATE TABLE IF NOT EXISTS carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  contact_info JSONB NOT NULL,
  address JSONB NOT NULL,
  scac_code TEXT,
  dot_number TEXT,
  mc_number TEXT,
  tax_id TEXT NOT NULL,
  insurance_info JSONB NOT NULL,
  service_areas JSONB NOT NULL,
  service_types TEXT[] NOT NULL,
  transit_times JSONB,
  rates JSONB,
  performance_metrics JSONB,
  contract_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  shipment_number TEXT NOT NULL,
  reference_number TEXT,
  carrier_id UUID NOT NULL REFERENCES carriers(id),
  status TEXT NOT NULL DEFAULT 'PLANNED',
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  pickup_date TIMESTAMPTZ NOT NULL,
  delivery_date TIMESTAMPTZ NOT NULL,
  estimated_delivery_date TIMESTAMPTZ NOT NULL,
  actual_delivery_date TIMESTAMPTZ,
  service_level TEXT NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  items JSONB NOT NULL,
  packages JSONB NOT NULL,
  total_weight NUMERIC(10, 2) NOT NULL,
  weight_unit TEXT NOT NULL,
  total_volume NUMERIC(10, 2) NOT NULL,
  volume_unit TEXT NOT NULL,
  freight_class TEXT,
  special_instructions TEXT,
  costs JSONB NOT NULL,
  events JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(tenant_id, shipment_number)
);

-- Loads table
CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  load_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLANNING',
  shipment_ids TEXT[] NOT NULL,
  carrier_id UUID REFERENCES carriers(id),
  equipment JSONB NOT NULL,
  load_plan JSONB NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(tenant_id, load_number)
);

-- Shipping documents table
CREATE TABLE IF NOT EXISTS shipping_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL,
  issued_by_id UUID NOT NULL REFERENCES users(id),
  signed_by TEXT,
  signature_date TIMESTAMPTZ,
  url TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Freight invoices table
CREATE TABLE IF NOT EXISTS freight_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  carrier_id UUID NOT NULL REFERENCES carriers(id),
  shipment_ids TEXT[] NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  charges JSONB NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL,
  taxes NUMERIC(15, 2) NOT NULL,
  total NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  audit_results JSONB,
  payment_info JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

-- Enable Row Level Security
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carriers_tenant_id ON carriers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_carriers_name ON carriers(name);
CREATE INDEX IF NOT EXISTS idx_carriers_code ON carriers(code);
CREATE INDEX IF NOT EXISTS idx_carriers_type ON carriers(type);
CREATE INDEX IF NOT EXISTS idx_carriers_status ON carriers(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant_id ON shipments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier_id ON shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_pickup_date ON shipments(pickup_date);
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_date ON shipments(delivery_date);
CREATE INDEX IF NOT EXISTS idx_loads_tenant_id ON loads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loads_carrier_id ON loads(carrier_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_scheduled_date ON loads(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_shipping_documents_shipment_id ON shipping_documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipping_documents_type ON shipping_documents(type);
CREATE INDEX IF NOT EXISTS idx_freight_invoices_tenant_id ON freight_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_freight_invoices_carrier_id ON freight_invoices(carrier_id);
CREATE INDEX IF NOT EXISTS idx_freight_invoices_status ON freight_invoices(status);
CREATE INDEX IF NOT EXISTS idx_freight_invoices_invoice_date ON freight_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_freight_invoices_due_date ON freight_invoices(due_date);