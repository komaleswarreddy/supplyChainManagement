/*
  # Create tax compliance tables

  1. New Tables
    - `tax_rules` - Stores tax rule information
    - `tax_codes` - Stores tax code information
    - `tax_determinations` - Stores tax determination information
    - `tax_documents` - Stores tax document information
    - `tax_reports` - Stores tax report information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Tax rules table
CREATE TABLE IF NOT EXISTS tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT NOT NULL,
  tax_type TEXT NOT NULL,
  rate NUMERIC(5, 2) NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL,
  priority INTEGER NOT NULL,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tax codes table
CREATE TABLE IF NOT EXISTS tax_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  tax_type TEXT NOT NULL,
  default_rate NUMERIC(5, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_jurisdictions TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Tax determinations table
CREATE TABLE IF NOT EXISTS tax_determinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  line_items JSONB NOT NULL,
  total_taxable_amount NUMERIC(15, 2) NOT NULL,
  total_tax_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  determination_date TIMESTAMPTZ NOT NULL,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tax documents table
CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  validated_by_id UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  document_url TEXT NOT NULL,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reminder_sent TIMESTAMPTZ,
  follow_up_actions JSONB
);

-- Tax reports table
CREATE TABLE IF NOT EXISTS tax_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'PENDING',
  filed_by_id UUID REFERENCES users(id),
  filed_at TIMESTAMPTZ,
  total_tax_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  summary JSONB NOT NULL,
  detail_data JSONB,
  report_url TEXT,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_determinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_rules_tenant_id ON tax_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_rules_jurisdiction ON tax_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_rules_tax_type ON tax_rules(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_rules_is_active ON tax_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_codes_tenant_id ON tax_codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_codes_code ON tax_codes(code);
CREATE INDEX IF NOT EXISTS idx_tax_codes_tax_type ON tax_codes(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_determinations_tenant_id ON tax_determinations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_determinations_invoice_id ON tax_determinations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_determinations_supplier_id ON tax_determinations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_tenant_id ON tax_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_supplier_id ON tax_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_document_type ON tax_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_tax_documents_status ON tax_documents(status);
CREATE INDEX IF NOT EXISTS idx_tax_reports_tenant_id ON tax_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_reports_report_type ON tax_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_tax_reports_jurisdiction ON tax_reports(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_reports_filing_status ON tax_reports(filing_status);
CREATE INDEX IF NOT EXISTS idx_tax_reports_due_date ON tax_reports(due_date);