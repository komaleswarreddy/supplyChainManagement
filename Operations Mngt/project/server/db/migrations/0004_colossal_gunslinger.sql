CREATE TABLE IF NOT EXISTS "product_collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"code" varchar(50) NOT NULL,
	"image_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"metadata" jsonb,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_collections_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" varchar(500) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"barcode" varchar(100),
	"weight" numeric(10, 2),
	"weight_unit" varchar(20),
	"dimensions" jsonb,
	"color" varchar(50),
	"size" varchar(50),
	"material" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"metadata" jsonb,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"short_description" varchar(500),
	"category_id" uuid,
	"brand" varchar(100),
	"model" varchar(100),
	"manufacturer" varchar(100),
	"part_number" varchar(100),
	"weight" numeric(10, 2),
	"weight_unit" varchar(20),
	"dimensions" jsonb,
	"color" varchar(50),
	"material" varchar(100),
	"country_of_origin" varchar(100),
	"hs_code" varchar(20),
	"barcode" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_virtual" boolean DEFAULT false NOT NULL,
	"is_downloadable" boolean DEFAULT false NOT NULL,
	"requires_shipping" boolean DEFAULT true NOT NULL,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"min_order_quantity" integer DEFAULT 1,
	"max_order_quantity" integer,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"meta_keywords" varchar(500),
	"url_key" varchar(255),
	"sort_order" integer DEFAULT 0,
	"tags" jsonb,
	"metadata" jsonb,
	"tenant_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "procurement_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"priority" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"renewal_type" text NOT NULL,
	"auto_renew" boolean DEFAULT false NOT NULL,
	"renewal_notification_days" integer NOT NULL,
	"notice_period_days" integer NOT NULL,
	"terms" text,
	"termination_conditions" text,
	"approval_workflow" jsonb,
	"metadata" jsonb,
	"approved_at" timestamp with time zone,
	"approved_by_id" uuid,
	"terminated_at" timestamp with time zone,
	"terminated_by_id" uuid,
	"termination_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_supplier_id_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_approved_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_terminated_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "priority" SET DEFAULT 'NORMAL';--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "terms" SET DATA TYPE jsonb USING terms::jsonb;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "terms" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "renewal_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "auto_renewal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "renewal_terms" jsonb;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "approver_id" uuid;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "counterparty" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "attachments" jsonb;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "risk_level" text DEFAULT 'LOW' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "compliance_status" text DEFAULT 'COMPLIANT' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "notes" text;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_collection_items_tenant_idx" ON "product_collection_items" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_collection_items_collection_idx" ON "product_collection_items" ("collection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_collection_items_product_idx" ON "product_collection_items" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_collections_tenant_idx" ON "product_collections" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_collections_code_idx" ON "product_collections" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_documents_tenant_idx" ON "product_documents" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_documents_product_idx" ON "product_documents" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_tenant_idx" ON "product_variants" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_product_idx" ON "product_variants" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants" ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_tenant_idx" ON "products" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products" ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_barcode_idx" ON "products" ("barcode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_number_idx" ON "contracts" ("contract_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_contract_idx" ON "contracts" ("tenant_id","status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "supplier_id";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "renewal_type";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "auto_renew";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "renewal_notification_days";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "notice_period_days";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "termination_conditions";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "approval_workflow";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "approved_by_id";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "terminated_at";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "terminated_by_id";--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "termination_reason";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_collection_id_product_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "product_collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_terminated_by_id_users_id_fk" FOREIGN KEY ("terminated_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
