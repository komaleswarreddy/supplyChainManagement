import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { tenants } from './tenants';

// Product Categories
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parent_id: uuid('parent_id').references(() => productCategories.id),
  code: varchar('code', { length: 50 }).notNull().unique(),
  level: integer('level').notNull().default(1),
  sort_order: integer('sort_order').default(0),
  is_active: boolean('is_active').notNull().default(true),
  image_url: varchar('image_url', { length: 500 }),
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_categories_tenant_idx').on(table.tenant_id),
  parentIdx: index('product_categories_parent_idx').on(table.parent_id),
  codeIdx: index('product_categories_code_idx').on(table.code),
}));

// Product Attributes
export const productAttributes = pgTable('product_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // text, number, boolean, date, select, multiselect
  description: text('description'),
  is_required: boolean('is_required').notNull().default(false),
  is_searchable: boolean('is_searchable').notNull().default(true),
  is_filterable: boolean('is_filterable').notNull().default(true),
  is_comparable: boolean('is_comparable').notNull().default(false),
  default_value: text('default_value'),
  validation_rules: jsonb('validation_rules'),
  options: jsonb('options'), // For select/multiselect types
  sort_order: integer('sort_order').default(0),
  is_active: boolean('is_active').notNull().default(true),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_attributes_tenant_idx').on(table.tenant_id),
  codeIdx: index('product_attributes_code_idx').on(table.code),
}));

// Products
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  short_description: varchar('short_description', { length: 500 }),
  category_id: uuid('category_id').references(() => productCategories.id),
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  manufacturer: varchar('manufacturer', { length: 100 }),
  part_number: varchar('part_number', { length: 100 }),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  weight_unit: varchar('weight_unit', { length: 20 }),
  dimensions: jsonb('dimensions'), // {length, width, height, unit}
  color: varchar('color', { length: 50 }),
  material: varchar('material', { length: 100 }),
  country_of_origin: varchar('country_of_origin', { length: 100 }),
  hs_code: varchar('hs_code', { length: 20 }),
  barcode: varchar('barcode', { length: 100 }),
  is_active: boolean('is_active').notNull().default(true),
  is_featured: boolean('is_featured').notNull().default(false),
  is_virtual: boolean('is_virtual').notNull().default(false),
  is_downloadable: boolean('is_downloadable').notNull().default(false),
  requires_shipping: boolean('requires_shipping').notNull().default(true),
  track_inventory: boolean('track_inventory').notNull().default(true),
  min_order_quantity: integer('min_order_quantity').default(1),
  max_order_quantity: integer('max_order_quantity'),
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: varchar('meta_description', { length: 500 }),
  meta_keywords: varchar('meta_keywords', { length: 500 }),
  url_key: varchar('url_key', { length: 255 }),
  sort_order: integer('sort_order').default(0),
  tags: jsonb('tags'),
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('products_tenant_idx').on(table.tenant_id),
  categoryIdx: index('products_category_idx').on(table.category_id),
  skuIdx: index('products_sku_idx').on(table.sku),
  barcodeIdx: index('products_barcode_idx').on(table.barcode),
}));

// Product Variants
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  barcode: varchar('barcode', { length: 100 }),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  weight_unit: varchar('weight_unit', { length: 20 }),
  dimensions: jsonb('dimensions'),
  color: varchar('color', { length: 50 }),
  size: varchar('size', { length: 50 }),
  material: varchar('material', { length: 100 }),
  is_active: boolean('is_active').notNull().default(true),
  sort_order: integer('sort_order').default(0),
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_variants_tenant_idx').on(table.tenant_id),
  productIdx: index('product_variants_product_idx').on(table.product_id),
  skuIdx: index('product_variants_sku_idx').on(table.sku),
}));

// Product Attribute Values
export const productAttributeValues = pgTable('product_attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  variant_id: uuid('variant_id').references(() => productVariants.id),
  attribute_id: uuid('attribute_id').notNull().references(() => productAttributes.id),
  value: text('value').notNull(),
  sort_order: integer('sort_order').default(0),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_attribute_values_tenant_idx').on(table.tenant_id),
  productIdx: index('product_attribute_values_product_idx').on(table.product_id),
  variantIdx: index('product_attribute_values_variant_idx').on(table.variant_id),
  attributeIdx: index('product_attribute_values_attribute_idx').on(table.attribute_id),
}));

// Product Images
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  variant_id: uuid('variant_id').references(() => productVariants.id),
  url: varchar('url', { length: 500 }).notNull(),
  alt_text: varchar('alt_text', { length: 255 }),
  title: varchar('title', { length: 255 }),
  is_primary: boolean('is_primary').notNull().default(false),
  sort_order: integer('sort_order').default(0),
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_images_tenant_idx').on(table.tenant_id),
  productIdx: index('product_images_product_idx').on(table.product_id),
  variantIdx: index('product_images_variant_idx').on(table.variant_id),
}));

// Product Documents
export const productDocuments = pgTable('product_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // manual, datasheet, certificate, etc.
  url: varchar('url', { length: 500 }).notNull(),
  file_size: integer('file_size'),
  mime_type: varchar('mime_type', { length: 100 }),
  description: text('description'),
  is_public: boolean('is_public').notNull().default(true),
  sort_order: integer('sort_order').default(0),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_documents_tenant_idx').on(table.tenant_id),
  productIdx: index('product_documents_product_idx').on(table.product_id),
}));

// Product Reviews
export const productReviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  reviewer_name: varchar('reviewer_name', { length: 255 }).notNull(),
  reviewer_email: varchar('reviewer_email', { length: 255 }),
  rating: integer('rating').notNull(), // 1-5 stars
  title: varchar('title', { length: 255 }),
  review: text('review'),
  is_approved: boolean('is_approved').notNull().default(false),
  is_verified_purchase: boolean('is_verified_purchase').notNull().default(false),
  helpful_votes: integer('helpful_votes').default(0),
  not_helpful_votes: integer('not_helpful_votes').default(0),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_reviews_tenant_idx').on(table.tenant_id),
  productIdx: index('product_reviews_product_idx').on(table.product_id),
}));

// Product Collections
export const productCollections = pgTable('product_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  code: varchar('code', { length: 50 }).notNull().unique(),
  image_url: varchar('image_url', { length: 500 }),
  is_active: boolean('is_active').notNull().default(true),
  sort_order: integer('sort_order').default(0),
  metadata: jsonb('metadata'),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_collections_tenant_idx').on(table.tenant_id),
  codeIdx: index('product_collections_code_idx').on(table.code),
}));

// Product Collection Items
export const productCollectionItems = pgTable('product_collection_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  collection_id: uuid('collection_id').notNull().references(() => productCollections.id),
  product_id: uuid('product_id').notNull().references(() => products.id),
  sort_order: integer('sort_order').default(0),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  created_by: uuid('created_by').notNull().references(() => users.id),
  updated_by: uuid('updated_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('product_collection_items_tenant_idx').on(table.tenant_id),
  collectionIdx: index('product_collection_items_collection_idx').on(table.collection_id),
  productIdx: index('product_collection_items_product_idx').on(table.product_id),
})); 