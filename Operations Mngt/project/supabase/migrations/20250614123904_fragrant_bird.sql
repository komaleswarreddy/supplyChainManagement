/*
  # Add multi-tenancy support

  1. New Tables
    - `tenants` - Stores tenant information
    - `tenant_users` - Maps users to tenants
    - `tenant_invitations` - Stores pending invitations to tenants
  
  2. Schema Updates
    - Add `tenant_id` column to all existing tables
    - Update unique constraints to include tenant_id
    - Add tenant-specific row level security policies
  
  3. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  plan TEXT NOT NULL DEFAULT 'BASIC',
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create tenant_users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'USER',
  is_owner BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Create tenant_invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Add current_tenant_id to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS current_tenant_id UUID;

-- Add tenant_id to all tables
-- Users and related tables
ALTER TABLE user_groups ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE user_delegations ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Suppliers and related tables
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_addresses ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_contacts ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_bank_information ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_documents ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_qualifications ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_risk_assessments ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE supplier_performance ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Inventory and related tables
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE inventory_adjustments ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE safety_stock_calculations ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE reorder_points ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE inventory_classifications ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Procurement and related tables
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Transportation and related tables
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE shipping_documents ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE freight_invoices ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Dashboard tables
ALTER TABLE dashboard_metrics ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE dashboard_activities ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE dashboard_alerts ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Update unique constraints to include tenant_id
-- Suppliers
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_code_key;
ALTER TABLE suppliers ADD CONSTRAINT suppliers_tenant_code_key UNIQUE (tenant_id, code);

-- Inventory
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_item_code_key;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_tenant_item_code_key UNIQUE (tenant_id, item_code);

-- Procurement
ALTER TABLE requisitions DROP CONSTRAINT IF EXISTS requisitions_requisition_number_key;
ALTER TABLE requisitions ADD CONSTRAINT requisitions_tenant_requisition_number_key UNIQUE (tenant_id, requisition_number);

ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_po_number_key;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_tenant_po_number_key UNIQUE (tenant_id, po_number);

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_contract_number_key;
ALTER TABLE contracts ADD CONSTRAINT contracts_tenant_contract_number_key UNIQUE (tenant_id, contract_number);

-- Transportation
ALTER TABLE carriers DROP CONSTRAINT IF EXISTS carriers_code_key;
ALTER TABLE carriers ADD CONSTRAINT carriers_tenant_code_key UNIQUE (tenant_id, code);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_shipment_number_key;
ALTER TABLE shipments ADD CONSTRAINT shipments_tenant_shipment_number_key UNIQUE (tenant_id, shipment_number);

ALTER TABLE loads DROP CONSTRAINT IF EXISTS loads_load_number_key;
ALTER TABLE loads ADD CONSTRAINT loads_tenant_load_number_key UNIQUE (tenant_id, load_number);

ALTER TABLE freight_invoices DROP CONSTRAINT IF EXISTS freight_invoices_invoice_number_key;
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_tenant_invoice_number_key UNIQUE (tenant_id, invoice_number);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
-- Tenants
CREATE POLICY "Users can view tenants they belong to"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can update their tenants"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND (is_owner = true OR role = 'ADMIN')
    )
  );

-- Tenant Users
CREATE POLICY "Users can view tenant users for their tenants"
  ON tenant_users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage tenant users"
  ON tenant_users
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND (is_owner = true OR role = 'ADMIN')
    )
  );

-- Tenant Invitations
CREATE POLICY "Users can view invitations for their tenants"
  ON tenant_invitations
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage invitations"
  ON tenant_invitations
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND (is_owner = true OR role = 'ADMIN')
    )
  );

-- Create tenant isolation function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  current_tenant UUID;
BEGIN
  -- Get the current user's tenant ID from the auth.users table
  SELECT current_tenant_id INTO current_tenant
  FROM auth.users
  WHERE id = auth.uid();
  
  -- If no current tenant is set, get the first tenant the user belongs to
  IF current_tenant IS NULL THEN
    SELECT tenant_id INTO current_tenant
    FROM tenant_users
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;
  
  RETURN current_tenant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create tenant isolation policies for all tables
-- This is a helper function to create policies for all tables
CREATE OR REPLACE FUNCTION create_tenant_isolation_policies()
RETURNS void AS $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'tenant_id'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('CREATE POLICY "Tenant isolation for %I" ON %I FOR ALL TO authenticated USING (tenant_id = get_current_tenant_id())', table_name, table_name);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create policies
SELECT create_tenant_isolation_policies();

-- Create function to drop the helper function (cleanup)
DROP FUNCTION IF EXISTS create_tenant_isolation_policies();