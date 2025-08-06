/*
  # Core Foundation Tables Migration

  This migration creates the core foundation tables required for the system:
  - Basic system configuration
  - Application metadata
  - Core reference data

  Features:
  - System configuration management
  - Reference data for dropdowns and lookups
  - Application metadata tracking
  - Core enumerations and constants

  Security:
  - Row Level Security where applicable
  - System-level access controls
*/

-- System Configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Currency Reference table
CREATE TABLE IF NOT EXISTS currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  exchange_rate NUMERIC(10, 6) DEFAULT 1.0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Countries Reference table
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  alpha3_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
  name TEXT NOT NULL,
  phone_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time Zones Reference table
CREATE TABLE IF NOT EXISTS time_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  offset_hours NUMERIC(3, 1) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Units of Measure Reference table
CREATE TABLE IF NOT EXISTS units_of_measure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- WEIGHT, LENGTH, VOLUME, AREA, etc.
  base_unit TEXT,
  conversion_factor NUMERIC(15, 6),
  symbol TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tax Jurisdictions Reference table
CREATE TABLE IF NOT EXISTS tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  type TEXT NOT NULL, -- COUNTRY, STATE, CITY, DISTRICT
  parent_id UUID REFERENCES tax_jurisdictions(id),
  tax_authority TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Industry Classifications Reference table
CREATE TABLE IF NOT EXISTS industry_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES industry_classifications(id),
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application Modules table
CREATE TABLE IF NOT EXISTS application_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  is_enabled BOOLEAN DEFAULT true,
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Health Checks table
CREATE TABLE IF NOT EXISTS system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL', 'UNKNOWN')),
  message TEXT,
  response_time_ms INTEGER,
  details JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_active);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_time_zones_name ON time_zones(name);
CREATE INDEX IF NOT EXISTS idx_units_category ON units_of_measure(category);
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_country ON tax_jurisdictions(country_code);
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_type ON tax_jurisdictions(type);
CREATE INDEX IF NOT EXISTS idx_industry_classifications_parent ON industry_classifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_application_modules_enabled ON application_modules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON system_health_checks(checked_at);

-- Insert default data
INSERT INTO currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$')
ON CONFLICT (code) DO NOTHING;

INSERT INTO units_of_measure (code, name, category, symbol) VALUES
  ('KG', 'Kilogram', 'WEIGHT', 'kg'),
  ('LB', 'Pound', 'WEIGHT', 'lb'),
  ('M', 'Meter', 'LENGTH', 'm'),
  ('FT', 'Feet', 'LENGTH', 'ft'),
  ('L', 'Liter', 'VOLUME', 'L'),
  ('GAL', 'Gallon', 'VOLUME', 'gal'),
  ('PC', 'Piece', 'COUNT', 'pc'),
  ('EA', 'Each', 'COUNT', 'ea')
ON CONFLICT (code) DO NOTHING;

INSERT INTO application_modules (module_name, display_name, description) VALUES
  ('inventory', 'Inventory Management', 'Core inventory management functionality'),
  ('procurement', 'Procurement', 'Purchase orders, requisitions, and supplier management'),
  ('suppliers', 'Supplier Management', 'Supplier onboarding, qualification, and performance'),
  ('quality', 'Quality Management', 'Quality control, inspections, and compliance'),
  ('orders', 'Order Management', 'Sales orders, fulfillment, and customer management'),
  ('transportation', 'Transportation', 'Shipping, carriers, and logistics'),
  ('analytics', 'Analytics & Reporting', 'Business intelligence and reporting'),
  ('invoices', 'Invoice Management', 'Invoice processing and accounts payable')
ON CONFLICT (module_name) DO NOTHING;
