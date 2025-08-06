/*
  # Authentication and Authorization Migration

  This migration creates comprehensive authentication and authorization tables:
  - User sessions and tokens
  - Permission management
  - Role-based access control
  - Multi-factor authentication
  - API authentication

  Features:
  - JWT token management
  - Session tracking
  - Permission granularity
  - MFA support
  - API key management
  - Login audit trails

  Security:
  - Encrypted sensitive data
  - Session security
  - Token rotation
  - Audit logging
*/

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB, -- City, country, etc.
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  is_mobile BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Security
  login_method TEXT CHECK (login_method IN ('PASSWORD', 'SSO', 'MFA', 'API_KEY', 'TOKEN')),
  risk_score INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Multi-Factor Authentication table
CREATE TABLE IF NOT EXISTS user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('TOTP', 'SMS', 'EMAIL', 'BACKUP_CODES')),
  secret TEXT, -- Encrypted
  phone_number TEXT,
  email TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Encrypted array
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, method)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Role Permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES users(id),
  
  UNIQUE(role_id, permission_id)
);

-- User Permissions table (direct permissions assignment)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  tenant_id UUID,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, permission_id, tenant_id)
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email Verification Tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Login Attempts table (for security monitoring)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  location JSONB,
  risk_score INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- User info if successful
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES user_sessions(id)
);

-- Security Events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tenant_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'PASSWORD_CHANGE', 
    'MFA_ENABLED', 'MFA_DISABLED', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED',
    'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'ROLE_ASSIGNED', 'ROLE_REMOVED'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  
  -- Response actions
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OAuth Providers table
CREATE TABLE IF NOT EXISTS oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL, -- Encrypted
  authorization_url TEXT NOT NULL,
  token_url TEXT NOT NULL,
  user_info_url TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['openid', 'email', 'profile'],
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User OAuth Connections table
CREATE TABLE IF NOT EXISTS user_oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES oauth_providers(id),
  external_user_id TEXT NOT NULL,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  
  UNIQUE(provider_id, external_user_id),
  UNIQUE(user_id, provider_id)
);

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_oauth_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "user_sessions_own_data" ON user_sessions 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_mfa_own_data" ON user_mfa 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "permissions_read_all" ON permissions 
  FOR SELECT USING (true);

CREATE POLICY "user_permissions_own_data" ON user_permissions 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "security_events_tenant_isolation" ON security_events 
  FOR ALL USING (tenant_id = get_current_tenant_id() OR user_id = auth.uid());

CREATE POLICY "user_oauth_connections_own_data" ON user_oauth_connections 
  FOR ALL USING (user_id = auth.uid());

-- Create comprehensive indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_method ON user_mfa(method);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_name ON oauth_providers(name);
CREATE INDEX IF NOT EXISTS idx_user_oauth_connections_user_id ON user_oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_oauth_connections_provider_id ON user_oauth_connections(provider_id);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('create_requisition', 'Create requisitions', 'requisitions', 'create'),
  ('view_requisitions', 'View requisitions', 'requisitions', 'read'),
  ('approve_requisitions', 'Approve requisitions', 'requisitions', 'approve'),
  ('manage_inventory', 'Manage inventory items', 'inventory', 'manage'),
  ('view_inventory', 'View inventory items', 'inventory', 'read'),
  ('manage_suppliers', 'Manage suppliers', 'suppliers', 'manage'),
  ('view_suppliers', 'View suppliers', 'suppliers', 'read'),
  ('manage_users', 'Manage users', 'users', 'manage'),
  ('view_analytics', 'View analytics', 'analytics', 'read'),
  ('system_admin', 'System administration', 'system', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Function to clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Clean expired sessions
  DELETE FROM user_sessions WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean expired password reset tokens
  DELETE FROM password_reset_tokens WHERE expires_at < now() OR used_at IS NOT NULL;
  
  -- Clean expired email verification tokens
  DELETE FROM email_verification_tokens WHERE expires_at < now() OR verified_at IS NOT NULL;
  
  -- Clean old login attempts (keep last 30 days)
  DELETE FROM login_attempts WHERE attempted_at < (now() - interval '30 days');
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
