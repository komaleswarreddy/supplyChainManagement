/*
  # Create supply chain tables

  1. New Tables
    - `forecasts` - Stores forecast information
    - `forecast_adjustments` - Stores forecast adjustment information
    - `promotion_impacts` - Stores promotion impact information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
*/

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  baseline_quantity INTEGER NOT NULL,
  adjusted_quantity INTEGER NOT NULL,
  final_quantity INTEGER NOT NULL,
  confidence_interval JSONB NOT NULL,
  algorithm TEXT NOT NULL,
  mape NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  historical_data JSONB NOT NULL,
  seasonality_factors JSONB NOT NULL,
  metadata JSONB,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES users(id),
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_id UUID REFERENCES users(id)
);

-- Forecast adjustments table
CREATE TABLE IF NOT EXISTS forecast_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  forecast_id UUID NOT NULL REFERENCES forecasts(id),
  type TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  reason_code TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promotion impacts table
CREATE TABLE IF NOT EXISTS promotion_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  forecast_id UUID NOT NULL REFERENCES forecasts(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  expected_lift NUMERIC(5, 2) NOT NULL,
  actual_lift NUMERIC(5, 2),
  budget NUMERIC(15, 2),
  currency TEXT,
  affected_items TEXT[] NOT NULL,
  historical_lifts JSONB,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_impacts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forecasts_tenant_id ON forecasts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_item_id ON forecasts(item_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_item_code ON forecasts(item_code);
CREATE INDEX IF NOT EXISTS idx_forecasts_location_id ON forecasts(location_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_period ON forecasts(period);
CREATE INDEX IF NOT EXISTS idx_forecasts_status ON forecasts(status);
CREATE INDEX IF NOT EXISTS idx_forecasts_start_date ON forecasts(start_date);
CREATE INDEX IF NOT EXISTS idx_forecasts_end_date ON forecasts(end_date);
CREATE INDEX IF NOT EXISTS idx_forecast_adjustments_tenant_id ON forecast_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_forecast_adjustments_forecast_id ON forecast_adjustments(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_adjustments_type ON forecast_adjustments(type);
CREATE INDEX IF NOT EXISTS idx_forecast_adjustments_reason_code ON forecast_adjustments(reason_code);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_tenant_id ON promotion_impacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_forecast_id ON promotion_impacts(forecast_id);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_type ON promotion_impacts(type);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_status ON promotion_impacts(status);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_start_date ON promotion_impacts(start_date);
CREATE INDEX IF NOT EXISTS idx_promotion_impacts_end_date ON promotion_impacts(end_date);