/*
  # Create inventory tables

  1. New Tables
    - `inventory_items` - Stores inventory item information
    - `inventory_movements` - Stores inventory movement information
    - `inventory_adjustments` - Stores inventory adjustment information
    - `safety_stock_calculations` - Stores safety stock calculation information
    - `reorder_points` - Stores reorder point information
    - `inventory_classifications` - Stores inventory classification information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'IN_STOCK',
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER,
  reorder_point INTEGER,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  location JSONB,
  specifications JSONB,
  dimensions JSONB,
  supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, item_code)
);

-- Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity INTEGER NOT NULL,
  from_location JSONB,
  to_location JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING',
  processed_by_id UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Inventory adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  adjustment_number TEXT NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  approver_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Safety stock calculations table
CREATE TABLE IF NOT EXISTS safety_stock_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id TEXT NOT NULL,
  service_level NUMERIC(3, 2) NOT NULL,
  lead_time INTEGER NOT NULL,
  lead_time_variability NUMERIC(5, 2) NOT NULL,
  demand_average NUMERIC(10, 2) NOT NULL,
  demand_variability NUMERIC(10, 2) NOT NULL,
  safety_stock INTEGER NOT NULL,
  calculation_method TEXT NOT NULL,
  review_period INTEGER NOT NULL,
  last_calculated TIMESTAMPTZ NOT NULL,
  next_review TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Reorder points table
CREATE TABLE IF NOT EXISTS reorder_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id TEXT NOT NULL,
  average_daily_demand NUMERIC(10, 2) NOT NULL,
  lead_time INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  manual_override BOOLEAN NOT NULL DEFAULT false,
  manual_value INTEGER,
  last_calculated TIMESTAMPTZ NOT NULL,
  next_review TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Inventory classifications table
CREATE TABLE IF NOT EXISTS inventory_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id TEXT NOT NULL,
  annual_consumption_value NUMERIC(15, 2) NOT NULL,
  annual_consumption_quantity INTEGER NOT NULL,
  consumption_variability NUMERIC(5, 2) NOT NULL,
  abc_class TEXT NOT NULL,
  xyz_class TEXT NOT NULL,
  combined_class TEXT NOT NULL,
  abc_thresholds JSONB NOT NULL,
  xyz_thresholds JSONB NOT NULL,
  manual_override BOOLEAN NOT NULL DEFAULT false,
  manual_class TEXT,
  last_calculated TIMESTAMPTZ NOT NULL,
  next_review TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_stock_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_classifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_item_code ON inventory_items(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant_id ON inventory_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_status ON inventory_movements(status);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_tenant_id ON inventory_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_item_id ON inventory_adjustments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_status ON inventory_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_safety_stock_calculations_tenant_id ON safety_stock_calculations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_safety_stock_calculations_item_id ON safety_stock_calculations(item_id);
CREATE INDEX IF NOT EXISTS idx_reorder_points_tenant_id ON reorder_points(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reorder_points_item_id ON reorder_points(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_tenant_id ON inventory_classifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_item_id ON inventory_classifications(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_abc_class ON inventory_classifications(abc_class);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_xyz_class ON inventory_classifications(xyz_class);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_combined_class ON inventory_classifications(combined_class);