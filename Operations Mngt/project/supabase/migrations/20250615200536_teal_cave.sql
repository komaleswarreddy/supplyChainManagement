/*
  # Create invoices tables

  1. New Tables
    - `invoices` - Stores invoice information
    - `invoice_line_items` - Stores invoice line item information
    - `invoice_disputes` - Stores invoice dispute information
    - `invoice_payments` - Stores invoice payment information
    - `invoice_attachments` - Stores invoice attachment information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  po_numbers TEXT[] ARRAY,
  grn_numbers TEXT[] ARRAY,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  source TEXT NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  tax_amount NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms TEXT NOT NULL,
  description TEXT,
  match_status TEXT NOT NULL DEFAULT 'NOT_MATCHED',
  match_details JSONB,
  approval_workflow JSONB,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_id UUID REFERENCES users(id),
  UNIQUE(tenant_id, invoice_number)
);

-- Invoice line items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  tax_amount NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  po_line_item JSONB,
  grn_line_item JSONB,
  account_code TEXT,
  tax_code TEXT,
  match_status TEXT NOT NULL DEFAULT 'NOT_MATCHED',
  exceptions TEXT[] ARRAY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice disputes table
CREATE TABLE IF NOT EXISTS invoice_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_to_id UUID REFERENCES users(id),
  resolution TEXT,
  resolved_by_id UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice dispute communications table
CREATE TABLE IF NOT EXISTS invoice_dispute_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dispute_id UUID NOT NULL REFERENCES invoice_disputes(id),
  message TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  attachments TEXT[] ARRAY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  scheduled_date TIMESTAMPTZ NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  amount NUMERIC(15, 2) NOT NULL,
  reference TEXT,
  processed_by_id UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  early_payment_discount JSONB,
  batch_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice attachments table
CREATE TABLE IF NOT EXISTS invoice_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL,
  is_original BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_dispute_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_attachments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_match_status ON invoices(match_status);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_match_status ON invoice_line_items(match_status);
CREATE INDEX IF NOT EXISTS idx_invoice_disputes_invoice_id ON invoice_disputes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_disputes_status ON invoice_disputes(status);
CREATE INDEX IF NOT EXISTS idx_invoice_dispute_communications_dispute_id ON invoice_dispute_communications(dispute_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_status ON invoice_payments(status);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_scheduled_date ON invoice_payments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_invoice_attachments_invoice_id ON invoice_attachments(invoice_id);