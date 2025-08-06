CREATE TABLE IF NOT EXISTS "service_appointment_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid,
	"provider_id" uuid,
	"role" varchar(50) DEFAULT 'primary',
	"assigned_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	"status" varchar(20) DEFAULT 'assigned',
	"notes" text,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_appointment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid,
	"action" varchar(50) NOT NULL,
	"previous_status" varchar(20),
	"new_status" varchar(20),
	"previous_data" jsonb,
	"new_data" jsonb,
	"reason" text,
	"performed_by" uuid,
	"performed_at" timestamp DEFAULT now(),
	"tenant_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_appointment_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid,
	"recipient_type" varchar(20) NOT NULL,
	"recipient_id" uuid,
	"reminder_type" varchar(20) NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" varchar(20) DEFAULT 'pending',
	"message_template" varchar(100),
	"custom_message" text,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_appointment_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"service_type_id" uuid,
	"template_data" jsonb,
	"reminder_schedule" jsonb,
	"required_fields" jsonb,
	"custom_fields" jsonb,
	"is_active" boolean DEFAULT true,
	"tenant_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_number" varchar(50) NOT NULL,
	"order_id" uuid,
	"service_type_id" uuid,
	"title" varchar(200) NOT NULL,
	"description" text,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"timezone" varchar(50) DEFAULT 'UTC',
	"service_address" jsonb,
	"contact_person" varchar(100),
	"contact_phone" varchar(20),
	"contact_email" varchar(255),
	"special_instructions" text,
	"status" varchar(20) DEFAULT 'scheduled',
	"priority" varchar(20) DEFAULT 'normal',
	"cancellation_reason" text,
	"estimated_duration" integer,
	"actual_duration" integer,
	"service_items" jsonb,
	"required_skills" jsonb,
	"required_equipment" jsonb,
	"completion_notes" text,
	"customer_signature" text,
	"photos" jsonb,
	"customer_rating" integer,
	"customer_feedback" text,
	"service_cost" numeric(10, 2),
	"travel_cost" numeric(10, 2),
	"material_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"billing_status" varchar(20) DEFAULT 'pending',
	"metadata" jsonb,
	"tenant_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "service_appointments_appointment_number_unique" UNIQUE("appointment_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_provider_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_available" boolean DEFAULT true,
	"max_appointments" integer DEFAULT 8,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(100) NOT NULL,
	"employee_id" varchar(50),
	"email" varchar(255),
	"phone" varchar(20),
	"type" varchar(50) NOT NULL,
	"skills" jsonb,
	"service_areas" jsonb,
	"max_concurrent_appointments" integer DEFAULT 1,
	"travel_time_minutes" integer DEFAULT 30,
	"hourly_rate" numeric(10, 2),
	"rating" numeric(3, 2),
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"tenant_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"buffer_time_minutes" integer DEFAULT 15,
	"requires_order" boolean DEFAULT true,
	"applicable_product_types" jsonb,
	"skill_requirements" jsonb,
	"equipment_requirements" jsonb,
	"preparation_checklist" jsonb,
	"completion_checklist" jsonb,
	"is_active" boolean DEFAULT true,
	"tenant_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_assignment_idx" ON "service_appointment_assignments" ("appointment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_assignment_idx" ON "service_appointment_assignments" ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_history_idx" ON "service_appointment_history" ("appointment_id","performed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_reminder_idx" ON "service_appointment_reminders" ("appointment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scheduled_reminder_idx" ON "service_appointment_reminders" ("scheduled_for","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_template_idx" ON "service_appointment_templates" ("tenant_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_appointment_idx" ON "service_appointments" ("tenant_id","scheduled_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_appointment_idx" ON "service_appointments" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_appointment_idx" ON "service_appointments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_appointment_idx" ON "service_appointments" ("scheduled_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_day_idx" ON "service_provider_availability" ("provider_id","day_of_week");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_provider_idx" ON "service_providers" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_provider_idx" ON "service_providers" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_service_type_idx" ON "service_types" ("tenant_id","category");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_assignments" ADD CONSTRAINT "service_appointment_assignments_appointment_id_service_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "service_appointments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_assignments" ADD CONSTRAINT "service_appointment_assignments_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_assignments" ADD CONSTRAINT "service_appointment_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_history" ADD CONSTRAINT "service_appointment_history_appointment_id_service_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "service_appointments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_history" ADD CONSTRAINT "service_appointment_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_history" ADD CONSTRAINT "service_appointment_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_reminders" ADD CONSTRAINT "service_appointment_reminders_appointment_id_service_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "service_appointments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_reminders" ADD CONSTRAINT "service_appointment_reminders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_templates" ADD CONSTRAINT "service_appointment_templates_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_templates" ADD CONSTRAINT "service_appointment_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointment_templates" ADD CONSTRAINT "service_appointment_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointments" ADD CONSTRAINT "service_appointments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointments" ADD CONSTRAINT "service_appointments_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointments" ADD CONSTRAINT "service_appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_appointments" ADD CONSTRAINT "service_appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_provider_availability" ADD CONSTRAINT "service_provider_availability_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_provider_availability" ADD CONSTRAINT "service_provider_availability_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_types" ADD CONSTRAINT "service_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_types" ADD CONSTRAINT "service_types_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
