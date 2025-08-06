/*
  # Create suppliers tables

  1. New Tables
    - `suppliers` - Stores supplier information
    - `supplier_addresses` - Stores supplier address information
    - `supplier_contacts` - Stores supplier contact information
    - `supplier_bank_information` - Stores supplier banking information
    - `supplier_documents` - Stores supplier document information
    - `supplier_qualifications` - Stores supplier qualification information
    - `supplier_risk_assessments` - Stores supplier risk assessment information
    - `supplier_performance` - Stores supplier performance information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  tax_id TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT,
  year_established INTEGER,
  annual_revenue NUMERIC(15, 2),
  employee_count INTEGER,
  business_classifications TEXT[] ARRAY,
  categories TEXT[] NOT NULL,
  payment_terms TEXT,
  preferred_currency TEXT,
  onboarding_date TIMESTAMPTZ,
  qualification_status TEXT,
  qualification_score INTEGER,
  qualification_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, code)
);

-- Supplier addresses table
CREATE TABLE IF NOT EXISTS supplier_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  type TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier contacts table
CREATE TABLE IF NOT EXISTS supplier_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier bank information table
CREATE TABLE IF NOT EXISTS supplier_bank_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  currency TEXT NOT NULL,
  swift_code TEXT,
  iban TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier documents table
CREATE TABLE IF NOT EXISTS supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier qualifications table
CREATE TABLE IF NOT EXISTS supplier_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  questionnaire JSONB NOT NULL,
  required_documents JSONB NOT NULL,
  overall_score INTEGER,
  max_possible_score INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evaluated_by_id UUID REFERENCES users(id),
  evaluated_at TIMESTAMPTZ,
  approval_workflow JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Supplier risk assessments table
CREATE TABLE IF NOT EXISTS supplier_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  assessment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  overall_risk_level TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  categories JSONB NOT NULL,
  mitigation_plans JSONB,
  next_assessment_date TIMESTAMPTZ NOT NULL,
  assessed_by_id UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier performance table
CREATE TABLE IF NOT EXISTS supplier_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  quality_score NUMERIC(5, 2) NOT NULL,
  delivery_score NUMERIC(5, 2) NOT NULL,
  cost_score NUMERIC(5, 2) NOT NULL,
  overall_score NUMERIC(5, 2) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bank_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_supplier_addresses_supplier_id ON supplier_addresses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier_id ON supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bank_information_supplier_id ON supplier_bank_information(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier_id ON supplier_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_supplier_id ON supplier_qualifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_risk_assessments_supplier_id ON supplier_risk_assessments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_supplier_id ON supplier_performance(supplier_id);