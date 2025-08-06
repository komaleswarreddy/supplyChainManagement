/*
  # Enhanced Catalog System Migration

  This migration extends the existing inventory system with comprehensive
  product catalog management, SKU/variant support, and attribute management.

  1. Enhanced Tables
    - Extended inventory_items with catalog fields
    - product_categories for hierarchical category management
    - product_attributes for flexible attribute definitions
    - product_attribute_values for item-specific attributes
    - product_images for visual catalog management
    - product_relationships for cross-selling and bundling

  2. Security
    - Enable RLS on all new tables
    - Add policies for tenant isolation
    - Maintain existing security patterns
*/

-- Extend existing inventory_items table with catalog fields
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'SIMPLE' CHECK (product_type IN ('SIMPLE', 'CONFIGURABLE', 'BUNDLE', 'VIRTUAL')),
ADD COLUMN IF NOT EXISTS parent_item_id UUID REFERENCES inventory_items(id),
ADD COLUMN IF NOT EXISTS attributes JSONB,
ADD COLUMN IF NOT EXISTS catalog_status TEXT DEFAULT 'ACTIVE' CHECK (catalog_status IN ('ACTIVE', 'INACTIVE', 'DRAFT', 'DISCONTINUED')),
ADD COLUMN IF NOT EXISTS catalog_category_id UUID,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS seo_data JSONB,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS url_key TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(tenant_id, barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_catalog_status ON inventory_items(tenant_id, catalog_status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_type ON inventory_items(tenant_id, product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_parent_item_id ON inventory_items(parent_item_id);

-- Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  url_key TEXT,
  display_mode TEXT DEFAULT 'PRODUCTS' CHECK (display_mode IN ('PRODUCTS', 'PAGE', 'BOTH')),
  page_layout TEXT DEFAULT 'DEFAULT',
  custom_design JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, url_key)
);

-- Product Attributes table
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'DATE', 'FILE')),
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT false,
  is_filterable BOOLEAN DEFAULT false,
  is_comparable BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  options JSONB, -- For select/multiselect types
  validation_rules JSONB,
  default_value TEXT,
  input_type TEXT DEFAULT 'TEXT' CHECK (input_type IN ('TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'DATE', 'FILE')),
  frontend_label TEXT,
  frontend_input TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, code)
);

-- Product Attribute Values table
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, attribute_id)
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  is_gallery BOOLEAN DEFAULT true,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  dimensions JSONB, -- {width, height}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Product Relationships table
CREATE TABLE IF NOT EXISTS product_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  parent_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  related_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('RELATED', 'CROSS_SELL', 'UP_SELL', 'SUBSTITUTE', 'COMPLEMENTARY', 'BUNDLE')),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(parent_item_id, related_item_id, relationship_type)
);

-- Product Bundles table
CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bundle_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  component_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_optional BOOLEAN DEFAULT false,
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(bundle_item_id, component_item_id)
);

-- Product Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id)
);

-- Product Price History table
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  old_price NUMERIC(10, 2),
  new_price NUMERIC(10, 2) NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('INCREASE', 'DECREASE', 'SET')),
  reason TEXT,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_url_key ON product_categories(tenant_id, url_key);
CREATE INDEX IF NOT EXISTS idx_product_attributes_code ON product_attributes(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_item_id ON product_attribute_values(item_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_attribute_id ON product_attribute_values(attribute_id);
CREATE INDEX IF NOT EXISTS idx_product_images_item_id ON product_images(item_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_parent_id ON product_relationships(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_related_id ON product_relationships(related_item_id);
CREATE INDEX IF NOT EXISTS idx_product_bundles_bundle_id ON product_bundles(bundle_item_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_item_id ON product_reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_item_id ON product_price_history(item_id);

-- Enable Row Level Security
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "product_categories_tenant_isolation" ON product_categories
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_attributes_tenant_isolation" ON product_attributes
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_attribute_values_tenant_isolation" ON product_attribute_values
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_images_tenant_isolation" ON product_images
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_relationships_tenant_isolation" ON product_relationships
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_bundles_tenant_isolation" ON product_bundles
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_reviews_tenant_isolation" ON product_reviews
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "product_price_history_tenant_isolation" ON product_price_history
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Insert default system attributes
INSERT INTO product_attributes (tenant_id, name, code, type, is_system, is_searchable, is_filterable, frontend_label, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Color', 'color', 'SELECT', true, true, true, 'Color', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Size', 'size', 'SELECT', true, true, true, 'Size', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Material', 'material', 'SELECT', true, true, true, 'Material', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Brand', 'brand', 'TEXT', true, true, true, 'Brand', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Model', 'model', 'TEXT', true, true, true, 'Model', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Weight', 'weight', 'NUMBER', false, true, true, 'Weight', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Dimensions', 'dimensions', 'TEXT', false, false, false, 'Dimensions', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Warranty', 'warranty', 'TEXT', false, false, false, 'Warranty', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO product_categories (tenant_id, name, description, url_key, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Electronics', 'Electronic devices and accessories', 'electronics', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Office Supplies', 'Office equipment and supplies', 'office-supplies', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Furniture', 'Office and home furniture', 'furniture', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Software', 'Software licenses and digital products', 'software', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000000', 'Services', 'Professional services and consulting', 'services', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING; 