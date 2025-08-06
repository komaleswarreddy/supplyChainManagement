/*
  # Complete Tenant Management System Migration

  This migration creates the comprehensive tenant management system with all related tables:
  - tenants, tenant_users, tenant_invitations
  - tenant_settings, tenant_subscriptions, tenant_features
  - tenant_audit_logs, tenant_billing

  Features:
  - Multi-tenant architecture with complete isolation
  - User management per tenant
  - Invitation and onboarding system
  - Subscription and billing management
  - Feature toggles per tenant
  - Comprehensive audit logging
  - Enterprise-grade security and compliance

  Security:
  - Row Level Security on all tables
  - Tenant isolation policies
  - Comprehensive indexing for performance
*/

-- Create tenant isolation function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
  plan TEXT NOT NULL DEFAULT 'BASIC' CHECK (plan IN ('BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM')),
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 10,
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'TRIAL' CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
  billing_email TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  
  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Address Information
  address JSONB,
  
  -- Compliance and Security
  data_retention_days INTEGER DEFAULT 2555, -- 7 years
  encryption_enabled BOOLEAN DEFAULT true,
  audit_logging_enabled BOOLEAN DEFAULT true,
  sso_enabled BOOLEAN DEFAULT false,
  sso_config JSONB,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  custom_css TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Tenant Users table (maps users to tenants with roles)
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'USER', 'VIEWER')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_owner BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  -- Department and Cost Center
  department TEXT,
  cost_center TEXT,
  manager_id UUID REFERENCES users(id),
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, user_id)
);

-- Tenant Invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'MANAGER', 'USER', 'VIEWER')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  message TEXT,
  
  -- Invitation details
  invited_by_id UUID NOT NULL REFERENCES users(id),
  accepted_by_id UUID REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant Features table (feature toggles per tenant)
CREATE TABLE IF NOT EXISTS tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  configuration JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, feature_name)
);

-- Tenant Subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL, -- External billing system ID
  plan_name TEXT NOT NULL,
  plan_price NUMERIC(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Subscription details
  status TEXT NOT NULL CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Billing
  next_billing_date TIMESTAMPTZ,
  last_billing_date TIMESTAMPTZ,
  billing_amount NUMERIC(10, 2),
  payment_method JSONB,
  
  -- Usage limits
  max_users INTEGER,
  max_storage_gb INTEGER,
  max_api_calls INTEGER,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, subscription_id)
);

-- Tenant Usage table (track usage metrics)
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(15, 2) NOT NULL,
  metric_unit TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Billing related
  billable BOOLEAN DEFAULT true,
  rate NUMERIC(10, 4),
  amount NUMERIC(10, 2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, metric_name, period_start)
);

-- Tenant Audit Logs table
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Request details
  request_method TEXT,
  request_url TEXT,
  request_headers JSONB,
  response_status INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant Settings table
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  is_encrypted BOOLEAN DEFAULT false,
  is_sensitive BOOLEAN DEFAULT false,
  
  -- Metadata
  description TEXT,
  validation_rules JSONB,
  default_value JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, category, setting_key)
);

-- Tenant API Keys table
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed version of API key
  key_prefix TEXT NOT NULL, -- First few characters for identification
  
  -- Permissions and scope
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  ip_whitelist INET[],
  
  -- Status and expiry
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
  expires_at TIMESTAMPTZ,
  
  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  
  UNIQUE(tenant_id, key_name)
);

-- Tenant Domains table (for custom domains)
CREATE TABLE IF NOT EXISTS tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_method TEXT CHECK (verification_method IN ('DNS', 'FILE', 'EMAIL')),
  
  -- SSL/TLS
  ssl_enabled BOOLEAN DEFAULT false,
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED')),
  
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tenants_self_access" ON tenants 
  FOR ALL USING (id = get_current_tenant_id() OR auth.uid() IN (SELECT user_id FROM tenant_users WHERE tenant_id = tenants.id AND role IN ('OWNER', 'ADMIN')));

CREATE POLICY "tenant_users_tenant_isolation" ON tenant_users 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_invitations_tenant_isolation" ON tenant_invitations 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_features_tenant_isolation" ON tenant_features 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_subscriptions_tenant_isolation" ON tenant_subscriptions 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_usage_tenant_isolation" ON tenant_usage 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_audit_logs_tenant_isolation" ON tenant_audit_logs 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_settings_tenant_isolation" ON tenant_settings 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_api_keys_tenant_isolation" ON tenant_api_keys 
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_domains_tenant_isolation" ON tenant_domains 
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant_id ON tenant_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON tenant_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON tenant_invitations(token);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_status ON tenant_invitations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expires_at ON tenant_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_feature_name ON tenant_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_tenant_features_is_enabled ON tenant_features(is_enabled);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_subscription_id ON tenant_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_billing_date ON tenant_subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metric_name ON tenant_usage(metric_name);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_period ON tenant_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_tenant_id ON tenant_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_user_id ON tenant_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_action ON tenant_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_resource_type ON tenant_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_created_at ON tenant_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_category ON tenant_settings(category);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_hash ON tenant_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_status ON tenant_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_id ON tenant_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_status ON tenant_domains(status);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION log_tenant_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO tenant_audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      COALESCE(NEW.tenant_id, get_current_tenant_id()),
      auth.uid(),
      'CREATE',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO tenant_audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      COALESCE(NEW.tenant_id, get_current_tenant_id()),
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO tenant_audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      COALESCE(OLD.tenant_id, get_current_tenant_id()),
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default features
INSERT INTO tenant_features (tenant_id, feature_name, is_enabled, configuration) 
SELECT 
  t.id,
  feature,
  CASE 
    WHEN t.plan = 'ENTERPRISE' THEN true
    WHEN t.plan = 'PROFESSIONAL' AND feature NOT IN ('advanced_analytics', 'custom_integrations') THEN true
    WHEN t.plan = 'BASIC' AND feature IN ('basic_inventory', 'basic_procurement') THEN true
    ELSE false
  END,
  '{}'::jsonb
FROM tenants t
CROSS JOIN (
  VALUES 
    ('basic_inventory'),
    ('basic_procurement'),
    ('supplier_management'),
    ('quality_control'),
    ('advanced_analytics'),
    ('custom_integrations'),
    ('api_access'),
    ('audit_logging'),
    ('sso_integration'),
    ('custom_branding')
) AS features(feature)
ON CONFLICT (tenant_id, feature_name) DO NOTHING; 