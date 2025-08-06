CREATE TABLE IF NOT EXISTS "automation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"task_id" uuid,
	"trigger_id" uuid,
	"execution_id" text NOT NULL,
	"status" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration" integer,
	"error_message" text,
	"error_details" jsonb,
	"input_data" jsonb,
	"output_data" jsonb,
	"steps" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"user_id" uuid,
	"role_id" uuid,
	"permission" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" uuid NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"schedule_number" text NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"schedule_config" jsonb NOT NULL,
	"timezone" text DEFAULT 'UTC',
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"last_run" timestamp with time zone,
	"next_run" timestamp with time zone,
	"run_count" integer DEFAULT 0,
	"max_runs" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_number" text NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"sequence" integer NOT NULL,
	"parameters" jsonb,
	"conditions" jsonb,
	"actions" jsonb,
	"error_handling" jsonb,
	"timeout" integer,
	"retry_count" integer DEFAULT 3,
	"retry_delay" integer DEFAULT 300,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"template_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"template" jsonb NOT NULL,
	"parameters" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"trigger_number" text NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"conditions" jsonb,
	"filters" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_variables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" jsonb,
	"default_value" jsonb,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_secret" boolean DEFAULT false NOT NULL,
	"validation" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"owner_id" uuid,
	"steps" jsonb NOT NULL,
	"variables" jsonb,
	"conditions" jsonb,
	"actions" jsonb,
	"error_handling" jsonb,
	"timeout" integer,
	"retry_count" integer DEFAULT 3,
	"retry_delay" integer DEFAULT 300,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"schedule" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"dispute_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"description" text NOT NULL,
	"disputed_amount" numeric(15, 2),
	"resolution" text,
	"resolution_date" timestamp with time zone,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"assigned_to" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"item_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(15, 2) NOT NULL,
	"account_code" text,
	"cost_center" text,
	"project_code" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_number" text NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"exchange_rate" numeric(10, 6) DEFAULT '1',
	"payment_method" text NOT NULL,
	"reference_number" text,
	"bank_account" text,
	"notes" text,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_tax_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"tax_type" text NOT NULL,
	"tax_rate" numeric(5, 2) NOT NULL,
	"taxable_amount" numeric(15, 2) NOT NULL,
	"tax_amount" numeric(15, 2) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"template" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"supplier_id" uuid,
	"customer_id" uuid,
	"purchase_order_id" uuid,
	"contract_id" uuid,
	"invoice_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"payment_terms" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"exchange_rate" numeric(10, 6) DEFAULT '1',
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"shipping_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(15, 2) NOT NULL,
	"billing_address" jsonb NOT NULL,
	"shipping_address" jsonb,
	"notes" text,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"equipment_number" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"model" text,
	"manufacturer" text,
	"serial_number" text,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"warehouse_id" uuid,
	"assigned_to" uuid,
	"location" jsonb,
	"specifications" jsonb,
	"maintenance_schedule" jsonb,
	"last_maintenance" timestamp with time zone,
	"next_maintenance" timestamp with time zone,
	"purchase_date" timestamp with time zone,
	"warranty_expiry" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"warehouse_id" uuid,
	"user_id" uuid,
	"metric_type" text NOT NULL,
	"metric_value" numeric(10, 2) NOT NULL,
	"target_value" numeric(10, 2),
	"unit" text NOT NULL,
	"period" text NOT NULL,
	"context" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"route_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"warehouse_id" uuid,
	"assigned_to" uuid,
	"start_location" jsonb NOT NULL,
	"end_location" jsonb NOT NULL,
	"waypoints" jsonb NOT NULL,
	"estimated_distance" numeric(10, 2),
	"actual_distance" numeric(10, 2),
	"estimated_duration" integer,
	"actual_duration" integer,
	"scheduled_start" timestamp with time zone,
	"scheduled_end" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"optimization_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"schedule_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"warehouse_id" uuid,
	"assigned_to" uuid,
	"schedule" jsonb NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"last_run" timestamp with time zone,
	"next_run" timestamp with time zone,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence_pattern" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"warehouse_id" uuid,
	"assigned_to" uuid,
	"order_id" uuid,
	"shipment_id" uuid,
	"source_location" jsonb,
	"destination_location" jsonb,
	"items" jsonb NOT NULL,
	"estimated_duration" integer,
	"actual_duration" integer,
	"scheduled_start" timestamp with time zone,
	"scheduled_end" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"steps" jsonb NOT NULL,
	"conditions" jsonb,
	"actions" jsonb,
	"triggers" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logistics_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"zone_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"warehouse_id" uuid,
	"manager_id" uuid,
	"boundaries" jsonb NOT NULL,
	"capacity" jsonb,
	"restrictions" jsonb,
	"equipment" jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"endpoint_number" text NOT NULL,
	"integration_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"path" text NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"version" text DEFAULT 'v1' NOT NULL,
	"authentication" jsonb,
	"rate_limit" jsonb,
	"timeout" integer DEFAULT 30000,
	"retry_config" jsonb,
	"request_schema" jsonb,
	"response_schema" jsonb,
	"headers" jsonb,
	"parameters" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_number" text NOT NULL,
	"integration_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"key_type" text NOT NULL,
	"key_value" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"permissions" jsonb,
	"rate_limit" jsonb,
	"expires_at" timestamp with time zone,
	"last_used" timestamp with time zone,
	"usage_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mapping_number" text NOT NULL,
	"integration_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"source_schema" jsonb NOT NULL,
	"target_schema" jsonb NOT NULL,
	"mapping_rules" jsonb NOT NULL,
	"transformations" jsonb,
	"validations" jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integration_id" uuid NOT NULL,
	"endpoint_id" uuid,
	"webhook_id" uuid,
	"request_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration" integer,
	"request_data" jsonb,
	"response_data" jsonb,
	"error_message" text,
	"error_details" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integration_id" uuid NOT NULL,
	"user_id" uuid,
	"role_id" uuid,
	"permission" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" uuid NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"template_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"template" jsonb NOT NULL,
	"parameters" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integration_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"provider" text,
	"connection_config" jsonb NOT NULL,
	"authentication" jsonb,
	"settings" jsonb,
	"health_check" jsonb,
	"last_health_check" timestamp with time zone,
	"health_status" text DEFAULT 'UNKNOWN',
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"subscription_number" text NOT NULL,
	"integration_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"authentication" jsonb,
	"headers" jsonb,
	"retry_config" jsonb,
	"timeout" integer DEFAULT 30000,
	"last_delivery" timestamp with time zone,
	"last_error" timestamp with time zone,
	"error_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"session_id" uuid,
	"properties" jsonb,
	"metrics" jsonb,
	"context" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_app_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"version_number" text NOT NULL,
	"platform" text NOT NULL,
	"build_number" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"release_date" timestamp with time zone,
	"min_supported_version" text,
	"force_update" boolean DEFAULT false NOT NULL,
	"changelog" text,
	"download_url" text,
	"file_size" integer,
	"checksum" text,
	"features" jsonb,
	"bug_fixes" jsonb,
	"known_issues" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"config_number" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"platform" text,
	"version" text DEFAULT '1.0' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"configuration" jsonb NOT NULL,
	"conditions" jsonb,
	"rollout" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"device_number" text NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"device_type" text NOT NULL,
	"device_model" text,
	"device_manufacturer" text,
	"os_version" text,
	"app_version" text,
	"push_token" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"last_seen" timestamp with time zone,
	"registration_date" timestamp with time zone DEFAULT now() NOT NULL,
	"capabilities" jsonb,
	"settings" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"notification_number" text NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"action_url" text,
	"action_data" jsonb,
	"badge" integer,
	"sound" text,
	"image_url" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"permission" text NOT NULL,
	"status" text DEFAULT 'GRANTED' NOT NULL,
	"granted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"session_number" text NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"duration" integer,
	"ip_address" text,
	"user_agent" text,
	"location" jsonb,
	"device_info" jsonb,
	"app_version" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mobile_sync_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"sync_number" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"data" jsonb,
	"conflict_resolution" jsonb,
	"sync_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sync_attempt" timestamp with time zone,
	"retry_count" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "tenant_template_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_execution_idx" ON "automation_logs" ("execution_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_log_idx" ON "automation_logs" ("workflow_id","start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_permission_idx" ON "automation_permissions" ("workflow_id","permission");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_schedule_number_idx" ON "automation_schedules" ("schedule_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_schedule_idx" ON "automation_schedules" ("workflow_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_task_number_idx" ON "automation_tasks" ("task_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_task_idx" ON "automation_tasks" ("workflow_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_template_number_idx" ON "automation_templates" ("template_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_automation_template_idx" ON "automation_templates" ("tenant_id","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_trigger_number_idx" ON "automation_triggers" ("trigger_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_trigger_idx" ON "automation_triggers" ("workflow_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_variable_idx" ON "automation_variables" ("workflow_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_workflow_number_idx" ON "automation_workflows" ("workflow_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_automation_workflow_idx" ON "automation_workflows" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_attachment_idx" ON "invoice_attachments" ("invoice_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispute_number_idx" ON "invoice_disputes" ("dispute_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_dispute_idx" ON "invoice_disputes" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_line_idx" ON "invoice_items" ("invoice_id","line_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_payment_number_idx" ON "invoice_payments" ("payment_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_payment_idx" ON "invoice_payments" ("tenant_id","payment_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_tax_idx" ON "invoice_tax_details" ("invoice_id","tax_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_template_name_idx" ON "invoice_templates" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_invoice_template_idx" ON "invoice_templates" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_number_idx" ON "invoices" ("invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_invoice_idx" ON "invoices" ("tenant_id","invoice_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_equipment_number_idx" ON "logistics_equipment" ("equipment_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_equipment_idx" ON "logistics_equipment" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_performance_date_idx" ON "logistics_performance" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_performance_idx" ON "logistics_performance" ("tenant_id","metric_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_route_number_idx" ON "logistics_routes" ("route_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_route_idx" ON "logistics_routes" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_schedule_number_idx" ON "logistics_schedules" ("schedule_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_schedule_idx" ON "logistics_schedules" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_task_number_idx" ON "logistics_tasks" ("task_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_task_idx" ON "logistics_tasks" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_workflow_number_idx" ON "logistics_workflows" ("workflow_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_workflow_idx" ON "logistics_workflows" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "logistics_zone_number_idx" ON "logistics_zones" ("zone_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_logistics_zone_idx" ON "logistics_zones" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_endpoint_number_idx" ON "api_endpoints" ("endpoint_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_endpoint_idx" ON "api_endpoints" ("integration_id","method");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_number_idx" ON "api_keys" ("key_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_key_idx" ON "api_keys" ("integration_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_mapping_number_idx" ON "data_mappings" ("mapping_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_mapping_idx" ON "data_mappings" ("integration_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_request_idx" ON "integration_logs" ("request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_log_idx" ON "integration_logs" ("integration_id","start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_permission_idx" ON "integration_permissions" ("integration_id","permission");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_template_number_idx" ON "integration_templates" ("template_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_integration_template_idx" ON "integration_templates" ("tenant_id","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_number_idx" ON "integrations" ("integration_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_integration_idx" ON "integrations" ("tenant_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_subscription_number_idx" ON "webhook_subscriptions" ("subscription_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_webhook_idx" ON "webhook_subscriptions" ("integration_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_analytics_idx" ON "mobile_analytics" ("device_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_analytics_idx" ON "mobile_analytics" ("user_id","event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_version_number_idx" ON "mobile_app_versions" ("version_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_version_idx" ON "mobile_app_versions" ("platform","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_config_number_idx" ON "mobile_configurations" ("config_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_mobile_config_idx" ON "mobile_configurations" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_device_number_idx" ON "mobile_devices" ("device_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_device_idx" ON "mobile_devices" ("user_id","device_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_notification_number_idx" ON "mobile_notifications" ("notification_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_notification_idx" ON "mobile_notifications" ("device_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_permission_idx" ON "mobile_permissions" ("device_id","permission");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_session_number_idx" ON "mobile_sessions" ("session_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_session_idx" ON "mobile_sessions" ("device_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mobile_sync_number_idx" ON "mobile_sync_data" ("sync_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_sync_idx" ON "mobile_sync_data" ("device_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_contract_template_idx" ON "contract_templates" ("tenant_id","type");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_task_id_automation_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "automation_tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_trigger_id_automation_triggers_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "automation_triggers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_permissions" ADD CONSTRAINT "automation_permissions_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_permissions" ADD CONSTRAINT "automation_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_permissions" ADD CONSTRAINT "automation_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_schedules" ADD CONSTRAINT "automation_schedules_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_tasks" ADD CONSTRAINT "automation_tasks_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_tasks" ADD CONSTRAINT "automation_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_tasks" ADD CONSTRAINT "automation_tasks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_templates" ADD CONSTRAINT "automation_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_templates" ADD CONSTRAINT "automation_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_variables" ADD CONSTRAINT "automation_variables_workflow_id_automation_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_variables" ADD CONSTRAINT "automation_variables_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_variables" ADD CONSTRAINT "automation_variables_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_attachments" ADD CONSTRAINT "invoice_attachments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_attachments" ADD CONSTRAINT "invoice_attachments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_disputes" ADD CONSTRAINT "invoice_disputes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_disputes" ADD CONSTRAINT "invoice_disputes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_disputes" ADD CONSTRAINT "invoice_disputes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_disputes" ADD CONSTRAINT "invoice_disputes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_tax_details" ADD CONSTRAINT "invoice_tax_details_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_templates" ADD CONSTRAINT "invoice_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_templates" ADD CONSTRAINT "invoice_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_equipment" ADD CONSTRAINT "logistics_equipment_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_equipment" ADD CONSTRAINT "logistics_equipment_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_equipment" ADD CONSTRAINT "logistics_equipment_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_equipment" ADD CONSTRAINT "logistics_equipment_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_performance" ADD CONSTRAINT "logistics_performance_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_performance" ADD CONSTRAINT "logistics_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_routes" ADD CONSTRAINT "logistics_routes_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_routes" ADD CONSTRAINT "logistics_routes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_routes" ADD CONSTRAINT "logistics_routes_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_routes" ADD CONSTRAINT "logistics_routes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_routes" ADD CONSTRAINT "logistics_routes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_schedules" ADD CONSTRAINT "logistics_schedules_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_schedules" ADD CONSTRAINT "logistics_schedules_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_schedules" ADD CONSTRAINT "logistics_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_schedules" ADD CONSTRAINT "logistics_schedules_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_tasks" ADD CONSTRAINT "logistics_tasks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_workflows" ADD CONSTRAINT "logistics_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_workflows" ADD CONSTRAINT "logistics_workflows_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_zones" ADD CONSTRAINT "logistics_zones_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_zones" ADD CONSTRAINT "logistics_zones_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_zones" ADD CONSTRAINT "logistics_zones_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logistics_zones" ADD CONSTRAINT "logistics_zones_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_mappings" ADD CONSTRAINT "data_mappings_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_mappings" ADD CONSTRAINT "data_mappings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_mappings" ADD CONSTRAINT "data_mappings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_endpoint_id_api_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "api_endpoints"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_webhook_id_webhook_subscriptions_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "webhook_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_permissions" ADD CONSTRAINT "integration_permissions_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_permissions" ADD CONSTRAINT "integration_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_permissions" ADD CONSTRAINT "integration_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_templates" ADD CONSTRAINT "integration_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_templates" ADD CONSTRAINT "integration_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integrations" ADD CONSTRAINT "integrations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integrations" ADD CONSTRAINT "integrations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_analytics" ADD CONSTRAINT "mobile_analytics_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "mobile_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_analytics" ADD CONSTRAINT "mobile_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_analytics" ADD CONSTRAINT "mobile_analytics_session_id_mobile_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "mobile_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_app_versions" ADD CONSTRAINT "mobile_app_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_app_versions" ADD CONSTRAINT "mobile_app_versions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_configurations" ADD CONSTRAINT "mobile_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_configurations" ADD CONSTRAINT "mobile_configurations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_notifications" ADD CONSTRAINT "mobile_notifications_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "mobile_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_notifications" ADD CONSTRAINT "mobile_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_notifications" ADD CONSTRAINT "mobile_notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_notifications" ADD CONSTRAINT "mobile_notifications_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_permissions" ADD CONSTRAINT "mobile_permissions_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "mobile_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_permissions" ADD CONSTRAINT "mobile_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_sessions" ADD CONSTRAINT "mobile_sessions_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "mobile_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_sessions" ADD CONSTRAINT "mobile_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_sync_data" ADD CONSTRAINT "mobile_sync_data_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "mobile_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mobile_sync_data" ADD CONSTRAINT "mobile_sync_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
