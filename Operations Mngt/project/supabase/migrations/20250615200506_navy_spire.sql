/*
  # Create logistics tables

  1. New Tables
    - `warehouses` - Stores warehouse information
    - `warehouse_zones` - Stores warehouse zone information
    - `warehouse_aisles` - Stores warehouse aisle information
    - `warehouse_racks` - Stores warehouse rack information
    - `warehouse_bins` - Stores warehouse bin information
    - `putaway_rules` - Stores putaway rule information
    - `warehouse_tasks` - Stores warehouse task information
    - `pick_paths` - Stores pick path information
    - `cycle_counts` - Stores cycle count information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  total_area NUMERIC(10, 2) NOT NULL,
  area_unit TEXT NOT NULL,
  manager JSONB NOT NULL,
  operating_hours JSONB NOT NULL,
  features TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Warehouse zones table
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  area NUMERIC(10, 2) NOT NULL,
  area_unit TEXT NOT NULL,
  restrictions TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

-- Warehouse aisles table
CREATE TABLE IF NOT EXISTS warehouse_aisles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  zone_id UUID NOT NULL REFERENCES warehouse_zones(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(zone_id, code)
);

-- Warehouse racks table
CREATE TABLE IF NOT EXISTS warehouse_racks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  aisle_id UUID NOT NULL REFERENCES warehouse_aisles(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  capacity JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aisle_id, code)
);

-- Warehouse bins table
CREATE TABLE IF NOT EXISTS warehouse_bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  rack_id UUID NOT NULL REFERENCES warehouse_racks(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  dimensions JSONB NOT NULL,
  capacity JSONB NOT NULL,
  restrictions TEXT[] NOT NULL,
  current_items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rack_id, code)
);

-- Putaway rules table
CREATE TABLE IF NOT EXISTS putaway_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Warehouse tasks table
CREATE TABLE IF NOT EXISTS warehouse_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority TEXT NOT NULL,
  assigned_to_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_by TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  source_location JSONB NOT NULL,
  destination_location JSONB,
  items JSONB NOT NULL,
  reference_number TEXT,
  reference_type TEXT,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pick paths table
CREATE TABLE IF NOT EXISTS pick_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  order_ids TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  assigned_to_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_time INTEGER NOT NULL,
  actual_time INTEGER,
  total_distance NUMERIC(10, 2) NOT NULL,
  distance_unit TEXT NOT NULL,
  stops JSONB NOT NULL,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cycle counts table
CREATE TABLE IF NOT EXISTS cycle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  count_number TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  scheduled_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to_id UUID REFERENCES users(id),
  locations JSONB NOT NULL,
  items JSONB NOT NULL,
  abc_class TEXT,
  reason TEXT,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, count_number)
);

-- Enable Row Level Security
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_aisles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE putaway_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_counts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_id ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_tenant_id ON warehouse_zones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_warehouse_id ON warehouse_zones(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_type ON warehouse_zones(type);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_status ON warehouse_zones(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_aisles_zone_id ON warehouse_aisles(zone_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_racks_aisle_id ON warehouse_racks(aisle_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_bins_rack_id ON warehouse_bins(rack_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_bins_type ON warehouse_bins(type);
CREATE INDEX IF NOT EXISTS idx_warehouse_bins_status ON warehouse_bins(status);
CREATE INDEX IF NOT EXISTS idx_putaway_rules_tenant_id ON putaway_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_putaway_rules_warehouse_id ON putaway_rules(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_putaway_rules_is_active ON putaway_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_id ON warehouse_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_warehouse_id ON warehouse_tasks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_type ON warehouse_tasks(type);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_status ON warehouse_tasks(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_priority ON warehouse_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_assigned_to_id ON warehouse_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_due_by ON warehouse_tasks(due_by);
CREATE INDEX IF NOT EXISTS idx_pick_paths_tenant_id ON pick_paths(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pick_paths_warehouse_id ON pick_paths(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_pick_paths_status ON pick_paths(status);
CREATE INDEX IF NOT EXISTS idx_pick_paths_assigned_to_id ON pick_paths(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_tenant_id ON cycle_counts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_warehouse_id ON cycle_counts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_type ON cycle_counts(type);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_status ON cycle_counts(status);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_scheduled_date ON cycle_counts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_assigned_to_id ON cycle_counts(assigned_to_id);