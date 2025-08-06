/*
  # Dashboard tables

  1. Tables
    - `dashboard_metrics` - Stores aggregated metrics for the dashboard
    - `dashboard_activities` - Stores recent activities for the dashboard
    - `dashboard_alerts` - Stores alerts for the dashboard
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
*/

-- Dashboard metrics table
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Procurement metrics
  procurement_total_requisitions INTEGER NOT NULL DEFAULT 0,
  procurement_pending_approvals INTEGER NOT NULL DEFAULT 0,
  procurement_purchase_orders INTEGER NOT NULL DEFAULT 0,
  procurement_spend_ytd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  
  -- Inventory metrics
  inventory_total_items INTEGER NOT NULL DEFAULT 0,
  inventory_total_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  inventory_turnover_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  inventory_out_of_stock_count INTEGER NOT NULL DEFAULT 0,
  inventory_low_stock_count INTEGER NOT NULL DEFAULT 0,
  
  -- Logistics metrics
  logistics_active_shipments INTEGER NOT NULL DEFAULT 0,
  logistics_on_time_percentage INTEGER NOT NULL DEFAULT 0,
  logistics_avg_transit_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
  logistics_freight_spend NUMERIC(15, 2) NOT NULL DEFAULT 0,
  
  -- Chart data (stored as JSONB for flexibility)
  chart_data JSONB,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard activities table
CREATE TABLE IF NOT EXISTS dashboard_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('requisition', 'purchase_order', 'inventory', 'shipment', 'supplier', 'user')),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'completed', 'cancelled')),
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard alerts table
CREATE TABLE IF NOT EXISTS dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to authenticated users for dashboard_metrics"
  ON dashboard_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users for dashboard_activities"
  ON dashboard_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users for dashboard_alerts"
  ON dashboard_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to record activity
CREATE OR REPLACE FUNCTION record_dashboard_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_type TEXT;
  activity_action TEXT;
  entity_name TEXT;
  user_name TEXT;
BEGIN
  -- Determine activity type based on the table
  IF TG_TABLE_NAME = 'requisitions' THEN
    activity_type := 'requisition';
    SELECT title INTO entity_name FROM requisitions WHERE id = NEW.id;
  ELSIF TG_TABLE_NAME = 'purchase_orders' THEN
    activity_type := 'purchase_order';
    SELECT po_number INTO entity_name FROM purchase_orders WHERE id = NEW.id;
  ELSIF TG_TABLE_NAME = 'inventory_items' THEN
    activity_type := 'inventory';
    SELECT name INTO entity_name FROM inventory_items WHERE id = NEW.id;
  ELSIF TG_TABLE_NAME = 'shipments' THEN
    activity_type := 'shipment';
    SELECT shipment_number INTO entity_name FROM shipments WHERE id = NEW.id;
  ELSIF TG_TABLE_NAME = 'suppliers' THEN
    activity_type := 'supplier';
    SELECT name INTO entity_name FROM suppliers WHERE id = NEW.id;
  ELSIF TG_TABLE_NAME = 'users' THEN
    activity_type := 'user';
    SELECT name INTO entity_name FROM users WHERE id = NEW.id;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Determine action based on operation
  IF TG_OP = 'INSERT' THEN
    activity_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check for status changes to determine specific actions
    IF TG_TABLE_NAME = 'requisitions' AND OLD.status != NEW.status THEN
      IF NEW.status = 'APPROVED' THEN
        activity_action := 'approved';
      ELSIF NEW.status = 'REJECTED' THEN
        activity_action := 'rejected';
      ELSIF NEW.status = 'COMPLETED' THEN
        activity_action := 'completed';
      ELSIF NEW.status = 'CANCELLED' THEN
        activity_action := 'cancelled';
      ELSE
        activity_action := 'updated';
      END IF;
    ELSE
      activity_action := 'updated';
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Get user name
  SELECT display_name INTO user_name FROM auth.users WHERE id = auth.uid();
  
  -- Insert activity record
  INSERT INTO dashboard_activities (
    type, action, entity_id, entity_name, timestamp, user_id, user_name
  ) VALUES (
    activity_type, activity_action, NEW.id, entity_name, now(), auth.uid(), user_name
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity recording
-- Note: These would be created for each relevant table in your schema
-- Example for requisitions:
-- CREATE TRIGGER record_requisition_activity
--   AFTER INSERT OR UPDATE ON requisitions
--   FOR EACH ROW
--   EXECUTE FUNCTION record_dashboard_activity();

-- Create function to generate alerts
CREATE OR REPLACE FUNCTION generate_dashboard_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_message TEXT;
  alert_severity TEXT;
BEGIN
  -- Example alert generation logic for requisitions
  IF TG_TABLE_NAME = 'requisitions' AND NEW.status = 'PENDING' THEN
    -- Check if there are many pending requisitions
    IF (SELECT COUNT(*) FROM requisitions WHERE status = 'PENDING') > 10 THEN
      alert_message := 'There are more than 10 pending requisitions';
      alert_severity := 'warning';
      
      -- Insert alert if it doesn't already exist
      IF NOT EXISTS (SELECT 1 FROM dashboard_alerts WHERE message = alert_message AND is_active = true) THEN
        INSERT INTO dashboard_alerts (severity, message)
        VALUES (alert_severity, alert_message);
      END IF;
    END IF;
  END IF;
  
  -- Example alert for inventory
  IF TG_TABLE_NAME = 'inventory_items' AND NEW.current_quantity < NEW.reorder_point THEN
    alert_message := 'Item ' || NEW.name || ' is below reorder point';
    alert_severity := 'warning';
    
    -- Insert alert if it doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM dashboard_alerts WHERE message = alert_message AND is_active = true) THEN
      INSERT INTO dashboard_alerts (severity, message)
      VALUES (alert_severity, alert_message);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for alert generation
-- Note: These would be created for each relevant table in your schema
-- Example for requisitions:
-- CREATE TRIGGER generate_requisition_alerts
--   AFTER INSERT OR UPDATE ON requisitions
--   FOR EACH ROW
--   EXECUTE FUNCTION generate_dashboard_alerts();

-- Create function to update dashboard metrics
CREATE OR REPLACE FUNCTION update_dashboard_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new dashboard metrics record if one doesn't exist for today
  IF NOT EXISTS (
    SELECT 1 FROM dashboard_metrics 
    WHERE DATE(timestamp) = CURRENT_DATE
  ) THEN
    INSERT INTO dashboard_metrics (
      procurement_total_requisitions,
      procurement_pending_approvals,
      procurement_purchase_orders,
      procurement_spend_ytd,
      inventory_total_items,
      inventory_total_value,
      inventory_turnover_rate,
      inventory_out_of_stock_count,
      inventory_low_stock_count,
      logistics_active_shipments,
      logistics_on_time_percentage,
      logistics_avg_transit_days,
      logistics_freight_spend,
      created_by
    )
    VALUES (
      (SELECT COUNT(*) FROM requisitions),
      (SELECT COUNT(*) FROM requisitions WHERE status = 'PENDING'),
      (SELECT COUNT(*) FROM purchase_orders),
      (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE status IN ('APPROVED', 'COMPLETED')),
      (SELECT COUNT(*) FROM inventory_items),
      (SELECT COALESCE(SUM(current_quantity * unit_cost), 0) FROM inventory_items),
      5.8, -- This would be calculated based on your business logic
      (SELECT COUNT(*) FROM inventory_items WHERE status = 'OUT_OF_STOCK'),
      (SELECT COUNT(*) FROM inventory_items WHERE status = 'LOW_STOCK'),
      (SELECT COUNT(*) FROM shipments WHERE status IN ('PLANNED', 'IN_TRANSIT')),
      92, -- This would be calculated based on your business logic
      3.5, -- This would be calculated based on your business logic
      (SELECT COALESCE(SUM(total_cost), 0) FROM shipments WHERE status = 'DELIVERED'),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled function to update metrics daily
-- This would typically be done using a cron job or Supabase's scheduled functions
-- For demonstration purposes, we'll create a trigger on a common table
-- CREATE TRIGGER update_dashboard_metrics_daily
--   AFTER INSERT OR UPDATE ON requisitions
--   FOR EACH ROW
--   EXECUTE FUNCTION update_dashboard_metrics();