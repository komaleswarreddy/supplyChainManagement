/*
  # Complete Quality Management System Migration

  This migration creates the comprehensive quality management system with all related tables:
  - quality_control_plans, inspections, inspection_results
  - non_conformances, corrective_actions
  - quality_standards, quality_metrics, quality_audits

  Features:
  - Enterprise-grade quality control planning
  - Comprehensive inspection management
  - Non-conformance tracking and corrective actions
  - Quality standards compliance
  - Quality metrics and KPI tracking
  - Internal and external audit management
  - Full integration with inventory and supplier modules

  Security:
  - Row Level Security on all tables
  - Tenant isolation policies
  - Comprehensive indexing for performance
*/

-- Quality Control Plans table
CREATE TABLE IF NOT EXISTS quality_control_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('INCOMING', 'IN_PROCESS', 'FINAL')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
  inspection_criteria JSONB NOT NULL,
  sampling_plan JSONB NOT NULL,
  acceptance_criteria JSONB NOT NULL,
  applicable_items TEXT[],
  applicable_suppliers UUID[],
  quality_standards TEXT[],
  regulatory_requirements TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  inspection_number TEXT NOT NULL,
  plan_id UUID REFERENCES quality_control_plans(id),
  item_id UUID REFERENCES inventory_items(id),
  supplier_id UUID REFERENCES suppliers(id),
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('INCOMING', 'IN_PROCESS', 'FINAL', 'ROUTINE', 'SPECIAL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  inspector_id UUID NOT NULL REFERENCES users(id),
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result TEXT CHECK (result IN ('PASS', 'FAIL', 'CONDITIONAL')),
  sample_size INTEGER,
  defects_found INTEGER DEFAULT 0,
  defect_rate NUMERIC(5, 4),
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, inspection_number)
);

-- Inspection Results table
CREATE TABLE IF NOT EXISTS inspection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL,
  criterion_name TEXT NOT NULL,
  criterion_type TEXT NOT NULL CHECK (criterion_type IN ('VISUAL', 'MEASUREMENT', 'FUNCTIONAL', 'DOCUMENTATION')),
  expected_value TEXT,
  actual_value TEXT,
  tolerance TEXT,
  result TEXT NOT NULL CHECK (result IN ('PASS', 'FAIL', 'N/A')),
  severity TEXT CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Non-Conformances table
CREATE TABLE IF NOT EXISTS non_conformances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  nc_number TEXT NOT NULL,
  inspection_id UUID REFERENCES inspections(id),
  item_id UUID REFERENCES inventory_items(id),
  supplier_id UUID REFERENCES suppliers(id),
  type TEXT NOT NULL CHECK (type IN ('SUPPLIER', 'INTERNAL', 'CUSTOMER')),
  category TEXT NOT NULL CHECK (category IN ('QUALITY', 'SAFETY', 'REGULATORY', 'DOCUMENTATION')),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED')),
  description TEXT NOT NULL,
  root_cause TEXT,
  impact TEXT,
  quantity_affected INTEGER,
  cost_impact NUMERIC(15, 2),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id),
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, nc_number)
);

-- Corrective Actions table
CREATE TABLE IF NOT EXISTS corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  action_number TEXT NOT NULL,
  non_conformance_id UUID NOT NULL REFERENCES non_conformances(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CORRECTIVE', 'PREVENTIVE')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  description TEXT NOT NULL,
  action_plan TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id),
  due_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  effectiveness TEXT CHECK (effectiveness IN ('EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE')),
  verification_method TEXT,
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, action_number)
);

-- Quality Standards table
CREATE TABLE IF NOT EXISTS quality_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  standard_code TEXT NOT NULL,
  standard_name TEXT NOT NULL,
  version TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ISO', 'FDA', 'ASTM', 'CUSTOM')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OBSOLETE')),
  description TEXT,
  requirements JSONB NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  applicable_items TEXT[],
  applicable_suppliers UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, standard_code, version)
);

-- Quality Metrics table
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('DEFECT_RATE', 'FIRST_PASS_YIELD', 'CUSTOMER_COMPLAINTS', 'SUPPLIER_PERFORMANCE', 'COST_OF_QUALITY')),
  period TEXT NOT NULL CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  target NUMERIC(10, 4),
  actual NUMERIC(10, 4) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('PERCENTAGE', 'PPM', 'COUNT', 'CURRENCY')),
  item_id UUID REFERENCES inventory_items(id),
  supplier_id UUID REFERENCES suppliers(id),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Quality Audits table
CREATE TABLE IF NOT EXISTS quality_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  audit_number TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('INTERNAL', 'EXTERNAL', 'SUPPLIER', 'CERTIFICATION')),
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  auditor_id UUID NOT NULL REFERENCES users(id),
  auditee_id UUID REFERENCES users(id),
  supplier_id UUID REFERENCES suppliers(id),
  planned_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result TEXT CHECK (result IN ('PASS', 'FAIL', 'CONDITIONAL')),
  findings JSONB,
  recommendations JSONB,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMPTZ,
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, audit_number)
);

-- Audit Findings table
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  audit_id UUID NOT NULL REFERENCES quality_audits(id) ON DELETE CASCADE,
  finding_number TEXT NOT NULL,
  requirement_reference TEXT NOT NULL,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('MAJOR', 'MINOR', 'OBSERVATION', 'POSITIVE')),
  description TEXT NOT NULL,
  evidence TEXT,
  recommendation TEXT,
  due_date TIMESTAMPTZ,
  responsible_person UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED')),
  closure_evidence TEXT,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(audit_id, finding_number)
);

-- Quality Certificates table
CREATE TABLE IF NOT EXISTS quality_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  certificate_number TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  issuing_body TEXT NOT NULL,
  item_id UUID REFERENCES inventory_items(id),
  supplier_id UUID REFERENCES suppliers(id),
  issue_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'EXPIRED', 'REVOKED', 'SUSPENDED')),
  scope TEXT,
  certificate_url TEXT,
  renewal_required BOOLEAN DEFAULT false,
  renewal_reminder_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(tenant_id, certificate_number)
);

-- Enable Row Level Security
ALTER TABLE quality_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformances ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "quality_control_plans_tenant_isolation" ON quality_control_plans FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "inspections_tenant_isolation" ON inspections FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "inspection_results_tenant_isolation" ON inspection_results FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "non_conformances_tenant_isolation" ON non_conformances FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "corrective_actions_tenant_isolation" ON corrective_actions FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "quality_standards_tenant_isolation" ON quality_standards FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "quality_metrics_tenant_isolation" ON quality_metrics FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "quality_audits_tenant_isolation" ON quality_audits FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "audit_findings_tenant_isolation" ON audit_findings FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY "quality_certificates_tenant_isolation" ON quality_certificates FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_control_plans_tenant_id ON quality_control_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_control_plans_plan_type ON quality_control_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_quality_control_plans_status ON quality_control_plans(status);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_id ON inspections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inspections_number ON inspections(inspection_number);
CREATE INDEX IF NOT EXISTS idx_inspections_plan_id ON inspections(plan_id);
CREATE INDEX IF NOT EXISTS idx_inspections_item_id ON inspections(item_id);
CREATE INDEX IF NOT EXISTS idx_inspections_supplier_id ON inspections(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_type ON inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_date ON inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_inspection_results_inspection_id ON inspection_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_results_criterion_type ON inspection_results(criterion_type);
CREATE INDEX IF NOT EXISTS idx_inspection_results_result ON inspection_results(result);
CREATE INDEX IF NOT EXISTS idx_non_conformances_tenant_id ON non_conformances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_non_conformances_nc_number ON non_conformances(nc_number);
CREATE INDEX IF NOT EXISTS idx_non_conformances_inspection_id ON non_conformances(inspection_id);
CREATE INDEX IF NOT EXISTS idx_non_conformances_item_id ON non_conformances(item_id);
CREATE INDEX IF NOT EXISTS idx_non_conformances_supplier_id ON non_conformances(supplier_id);
CREATE INDEX IF NOT EXISTS idx_non_conformances_status ON non_conformances(status);
CREATE INDEX IF NOT EXISTS idx_non_conformances_severity ON non_conformances(severity);
CREATE INDEX IF NOT EXISTS idx_non_conformances_assigned_to ON non_conformances(assigned_to);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_non_conformance_id ON corrective_actions(non_conformance_id);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_assigned_to ON corrective_actions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_due_date ON corrective_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_quality_standards_tenant_id ON quality_standards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_standards_code ON quality_standards(standard_code);
CREATE INDEX IF NOT EXISTS idx_quality_standards_type ON quality_standards(type);
CREATE INDEX IF NOT EXISTS idx_quality_standards_status ON quality_standards(status);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_tenant_id ON quality_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_type ON quality_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_period ON quality_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_item_id ON quality_metrics(item_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_supplier_id ON quality_metrics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_tenant_id ON quality_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_number ON quality_audits(audit_number);
CREATE INDEX IF NOT EXISTS idx_quality_audits_type ON quality_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_quality_audits_status ON quality_audits(status);
CREATE INDEX IF NOT EXISTS idx_quality_audits_auditor_id ON quality_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_supplier_id ON quality_audits(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quality_audits_planned_date ON quality_audits(planned_date);
CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_type ON audit_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_responsible_person ON audit_findings(responsible_person);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_tenant_id ON quality_certificates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_number ON quality_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_type ON quality_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_item_id ON quality_certificates(item_id);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_supplier_id ON quality_certificates(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_status ON quality_certificates(status);
CREATE INDEX IF NOT EXISTS idx_quality_certificates_expiry_date ON quality_certificates(expiry_date); 