/*
  # Create supplier extension tables

  1. New Tables
    - `supplier_performance` - Stores supplier performance data
    - `supplier_risk_assessments` - Stores supplier risk assessment data
    - `supplier_sustainability` - Stores supplier sustainability data
    - `supplier_quality_records` - Stores supplier quality management data
    - `supplier_financial_health` - Stores supplier financial health data
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Supplier Performance table
CREATE TABLE IF NOT EXISTS supplier_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  quality_score NUMERIC(5, 2) NOT NULL,
  delivery_score NUMERIC(5, 2) NOT NULL,
  cost_score NUMERIC(5, 2) NOT NULL,
  overall_score NUMERIC(5, 2) NOT NULL,
  metrics JSONB NOT NULL,
  history JSONB NOT NULL,
  issues JSONB,
  last_updated TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier Risk Assessments table
CREATE TABLE IF NOT EXISTS supplier_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  assessment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  overall_risk_level TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  categories JSONB NOT NULL,
  mitigation_plans JSONB,
  next_assessment_date TIMESTAMPTZ NOT NULL,
  assessed_by_id UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier Sustainability table
CREATE TABLE IF NOT EXISTS supplier_sustainability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  overall_rating TEXT NOT NULL,
  carbon_footprint NUMERIC(10, 2) NOT NULL,
  carbon_unit TEXT NOT NULL,
  water_usage NUMERIC(15, 2) NOT NULL,
  water_unit TEXT NOT NULL,
  waste_generation NUMERIC(10, 2) NOT NULL,
  waste_unit TEXT NOT NULL,
  renewable_energy INTEGER NOT NULL,
  certifications TEXT[] NOT NULL,
  compliance_status TEXT NOT NULL,
  last_assessment_date TIMESTAMPTZ NOT NULL,
  next_assessment_date TIMESTAMPTZ NOT NULL,
  goals JSONB NOT NULL,
  initiatives JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier Quality Records table
CREATE TABLE IF NOT EXISTS supplier_quality_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  status TEXT NOT NULL,
  quality_score INTEGER NOT NULL,
  defect_rate NUMERIC(5, 2) NOT NULL,
  first_pass_yield NUMERIC(5, 2) NOT NULL,
  on_time_delivery NUMERIC(5, 2) NOT NULL,
  last_audit_date TIMESTAMPTZ NOT NULL,
  next_audit_date TIMESTAMPTZ NOT NULL,
  certifications TEXT[] NOT NULL,
  quality_system TEXT NOT NULL,
  incidents JSONB NOT NULL,
  corrective_actions JSONB NOT NULL,
  audit_results JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier Financial Health table
CREATE TABLE IF NOT EXISTS supplier_financial_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  status TEXT NOT NULL,
  credit_rating TEXT NOT NULL,
  credit_score INTEGER NOT NULL,
  financial_stability INTEGER NOT NULL,
  liquidity_ratio NUMERIC(5, 2) NOT NULL,
  debt_to_equity_ratio NUMERIC(5, 2) NOT NULL,
  profit_margin NUMERIC(5, 2) NOT NULL,
  revenue_growth NUMERIC(5, 2) NOT NULL,
  payment_history INTEGER NOT NULL,
  days_payable_outstanding INTEGER NOT NULL,
  bankruptcy_risk INTEGER NOT NULL,
  trend TEXT NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL,
  next_review_date TIMESTAMPTZ NOT NULL,
  financial_data JSONB NOT NULL,
  alerts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE supplier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_sustainability ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_financial_health ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_supplier_performance_supplier_id ON supplier_performance(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_tenant_id ON supplier_performance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_risk_assessments_supplier_id ON supplier_risk_assessments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_risk_assessments_tenant_id ON supplier_risk_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_risk_assessments_risk_level ON supplier_risk_assessments(overall_risk_level);
CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_supplier_id ON supplier_sustainability(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_tenant_id ON supplier_sustainability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_rating ON supplier_sustainability(overall_rating);
CREATE INDEX IF NOT EXISTS idx_supplier_sustainability_status ON supplier_sustainability(compliance_status);
CREATE INDEX IF NOT EXISTS idx_supplier_quality_records_supplier_id ON supplier_quality_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quality_records_tenant_id ON supplier_quality_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quality_records_status ON supplier_quality_records(status);
CREATE INDEX IF NOT EXISTS idx_supplier_financial_health_supplier_id ON supplier_financial_health(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_financial_health_tenant_id ON supplier_financial_health(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_financial_health_status ON supplier_financial_health(status);
CREATE INDEX IF NOT EXISTS idx_supplier_financial_health_trend ON supplier_financial_health(trend);

-- Create tenant isolation policies
CREATE POLICY "Tenant isolation for supplier_performance"
  ON supplier_performance
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for supplier_risk_assessments"
  ON supplier_risk_assessments
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for supplier_sustainability"
  ON supplier_sustainability
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for supplier_quality_records"
  ON supplier_quality_records
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for supplier_financial_health"
  ON supplier_financial_health
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Create functions to update supplier data when related records are updated
CREATE OR REPLACE FUNCTION update_supplier_risk_assessment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the risk assessment data in the suppliers table
  UPDATE suppliers
  SET 
    risk_assessment = jsonb_build_object(
      'overallRiskLevel', NEW.overall_risk_level,
      'lastAssessmentDate', NEW.assessment_date,
      'nextAssessmentDate', NEW.next_assessment_date,
      'categories', NEW.categories
    ),
    updated_at = NOW()
  WHERE id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_supplier_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the performance data in the suppliers table
  UPDATE suppliers
  SET 
    performance = jsonb_build_object(
      'qualityScore', NEW.quality_score,
      'deliveryScore', NEW.delivery_score,
      'costScore', NEW.cost_score,
      'overallScore', NEW.overall_score,
      'lastUpdated', NEW.last_updated
    ),
    updated_at = NOW()
  WHERE id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_supplier_after_risk_assessment
  AFTER INSERT OR UPDATE ON supplier_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_risk_assessment();

CREATE TRIGGER update_supplier_after_performance_update
  AFTER INSERT OR UPDATE ON supplier_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_performance();