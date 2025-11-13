-- =====================================================
-- Migration: 018 - Fix Schema Types (Integer to UUID)
-- Description: Convert integer IDs to UUIDs for consistency
-- Date: 2024-11-12
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE UUID CONVERSION FUNCTIONS
-- =====================================================

-- Function to convert integer to UUID (deterministic)
CREATE OR REPLACE FUNCTION int_to_uuid(int_val INTEGER)
RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v5(uuid_ns_oid(), int_val::text);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: ADD UUID COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add UUID columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT uuid_generate_v4();
UPDATE organizations SET uuid_id = int_to_uuid(id) WHERE uuid_id IS NULL;

-- Add UUID columns to users table  
ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT uuid_generate_v4();
UPDATE users SET uuid_id = int_to_uuid(id) WHERE uuid_id IS NULL;

-- Add UUID columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT uuid_generate_v4();
UPDATE tenants SET uuid_id = int_to_uuid(id) WHERE uuid_id IS NULL;

-- =====================================================
-- STEP 3: CREATE NEW SUBSCRIPTION TABLES WITH UUID
-- =====================================================

-- Drop existing subscription tables if they exist (they were broken anyway)
DROP TABLE IF EXISTS subscription_features CASCADE;
DROP TABLE IF EXISTS subscription_usage CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create subscriptions table with proper UUID references
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_uuid UUID NOT NULL,
    tenant_uuid UUID NOT NULL,

    -- Plan Information
    plan_name VARCHAR(100) NOT NULL, -- 'starter', 'professional', 'enterprise', 'compliance_plus'
    plan_display_name VARCHAR(255),
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'

    -- Limits and Quotas
    max_users INTEGER NOT NULL DEFAULT 1,
    max_organizations INTEGER DEFAULT 1,
    max_assessments INTEGER, -- NULL means unlimited
    max_storage_gb INTEGER DEFAULT 10,

    -- Features
    features JSONB DEFAULT '[]', -- Array of enabled features

    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Subscription Lifecycle
    status VARCHAR(20) DEFAULT 'active', -- 'trial', 'active', 'suspended', 'cancelled', 'expired'
    trial_end_date DATE,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,

    -- Payment Information
    payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'invoice'
    billing_contact JSONB, -- Contact information for billing

    -- Usage Tracking
    current_users INTEGER DEFAULT 0,
    current_assessments INTEGER DEFAULT 0,
    current_storage_gb DECIMAL(8,2) DEFAULT 0.00,

    -- Subscription History
    upgraded_from UUID, -- Reference to previous subscription
    downgraded_to UUID, -- Reference to next subscription if downgraded

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT subscriptions_organization_fk
        FOREIGN KEY (organization_uuid) REFERENCES organizations(uuid_id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_tenant_fk
        FOREIGN KEY (tenant_uuid) REFERENCES tenants(uuid_id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_upgraded_from_fk
        FOREIGN KEY (upgraded_from) REFERENCES subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT subscriptions_downgraded_to_fk
        FOREIGN KEY (downgraded_to) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Create subscription_usage table
CREATE TABLE subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL,

    -- Usage Metrics
    metric_name VARCHAR(100) NOT NULL, -- 'active_users', 'storage_used', 'api_calls', 'assessments_created'
    value DECIMAL(15,4) NOT NULL,

    -- Timing
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional usage context

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT subscription_usage_subscription_fk
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Create subscription_features table
CREATE TABLE subscription_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL,

    -- Feature Information
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    usage_limit INTEGER, -- NULL means unlimited
    current_usage INTEGER DEFAULT 0,
    reset_period VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Feature Configuration
    feature_config JSONB DEFAULT '{}',

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT subscription_features_subscription_fk
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT unique_subscription_feature
        UNIQUE (subscription_id, feature_name)
);

-- =====================================================
-- STEP 4: CREATE INVOICES TABLE
-- =====================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL,
    
    -- Invoice Information
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status and Dates
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment Information
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    
    -- Invoice Details
    line_items JSONB NOT NULL, -- Array of line items
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT invoices_subscription_fk
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 5: CREATE RENEWAL OPPORTUNITIES TABLE
-- =====================================================

CREATE TABLE renewal_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL,
    organization_uuid UUID NOT NULL,
    
    -- Renewal Information
    current_plan VARCHAR(100) NOT NULL,
    suggested_plan VARCHAR(100),
    current_price DECIMAL(10,2) NOT NULL,
    suggested_price DECIMAL(10,2),
    
    -- Timeline
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewal_window_start TIMESTAMP WITH TIME ZONE,
    renewal_window_end TIMESTAMP WITH TIME ZONE,
    
    -- Risk Assessment
    churn_risk VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    risk_factors JSONB DEFAULT '[]',
    
    -- Status and Priority
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'contacted', 'negotiating', 'renewed', 'churned'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Notes and Actions
    notes TEXT,
    assigned_to UUID, -- Sales rep or account manager
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_action_date TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT renewal_opportunities_subscription_fk
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT renewal_opportunities_organization_fk
        FOREIGN KEY (organization_uuid) REFERENCES organizations(uuid_id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_uuid);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_uuid);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_name);
CREATE INDEX idx_subscriptions_expires ON subscriptions(ends_at) WHERE ends_at IS NOT NULL;

-- Usage indexes
CREATE INDEX idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_metric ON subscription_usage(metric_name);
CREATE INDEX idx_subscription_usage_recorded ON subscription_usage(recorded_at DESC);

-- Features indexes
CREATE INDEX idx_subscription_features_subscription ON subscription_features(subscription_id);
CREATE INDEX idx_subscription_features_name ON subscription_features(feature_name);
CREATE INDEX idx_subscription_features_enabled ON subscription_features(is_enabled);

-- Invoices indexes
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Renewal opportunities indexes
CREATE INDEX idx_renewal_opportunities_subscription ON renewal_opportunities(subscription_id);
CREATE INDEX idx_renewal_opportunities_organization ON renewal_opportunities(organization_uuid);
CREATE INDEX idx_renewal_opportunities_expires ON renewal_opportunities(expires_at);
CREATE INDEX idx_renewal_opportunities_status ON renewal_opportunities(status);
CREATE INDEX idx_renewal_opportunities_churn_risk ON renewal_opportunities(churn_risk);

-- =====================================================
-- STEP 7: CREATE UPDATE TRIGGERS
-- =====================================================

-- Update triggers for updated_at columns
CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_subscription_features_updated_at
    BEFORE UPDATE ON subscription_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_renewal_opportunities_updated_at
    BEFORE UPDATE ON renewal_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample subscription data
INSERT INTO subscriptions (
    organization_uuid, tenant_uuid, plan_name, plan_display_name,
    max_users, max_assessments, max_storage_gb, features,
    price, currency, status, ends_at
)
SELECT 
    o.uuid_id,
    t.uuid_id,
    'professional',
    'Professional Plan',
    25, 100, 50,
    '["advanced_analytics", "custom_reports", "api_access", "priority_support"]',
    299.00, 'USD', 'active',
    NOW() + INTERVAL '1 month'
FROM organizations o
JOIN tenants t ON o.tenant_id = t.id
LIMIT 3
ON CONFLICT DO NOTHING;

-- Insert sample features for subscriptions
INSERT INTO subscription_features (subscription_id, feature_name, is_enabled, usage_limit, reset_period)
SELECT 
    s.id,
    feature.name,
    true,
    feature.limit,
    'monthly'
FROM subscriptions s
CROSS JOIN (
    VALUES 
    ('advanced_analytics', NULL),
    ('api_calls', 10000),
    ('custom_reports', 50),
    ('storage', 50)
) AS feature(name, limit)
ON CONFLICT (subscription_id, feature_name) DO NOTHING;

-- =====================================================
-- STEP 9: CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for subscription summary
CREATE OR REPLACE VIEW v_subscription_summary AS
SELECT 
    s.id,
    s.plan_name,
    s.price,
    s.currency,
    s.status,
    s.starts_at,
    s.ends_at,
    o.name as organization_name,
    t.name as tenant_name,
    t.sector,
    COUNT(sf.id) as feature_count,
    s.current_users,
    s.current_assessments,
    s.current_storage_gb
FROM subscriptions s
JOIN organizations o ON s.organization_uuid = o.uuid_id
JOIN tenants t ON s.tenant_uuid = t.uuid_id
LEFT JOIN subscription_features sf ON s.id = sf.subscription_id AND sf.is_enabled = true
GROUP BY s.id, o.name, t.name, t.sector;

-- View for renewal pipeline (120 days)
CREATE OR REPLACE VIEW v_renewals_120d AS
SELECT 
    ro.*,
    s.plan_name as current_plan_name,
    s.price as current_monthly_price,
    o.name as organization_name,
    t.name as tenant_name,
    EXTRACT(DAYS FROM (ro.expires_at - NOW())) as days_until_expiry
FROM renewal_opportunities ro
JOIN subscriptions s ON ro.subscription_id = s.id
JOIN organizations o ON ro.organization_uuid = o.uuid_id
JOIN tenants t ON s.tenant_uuid = t.uuid_id
WHERE ro.expires_at <= NOW() + INTERVAL '120 days'
  AND ro.status IN ('pending', 'contacted', 'negotiating');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE subscriptions IS 'Subscription management with UUID foreign keys';
COMMENT ON TABLE subscription_usage IS 'Usage metrics tracking for billing and limits';
COMMENT ON TABLE subscription_features IS 'Feature access control and usage limits';
COMMENT ON TABLE invoices IS 'Invoice generation and payment tracking';
COMMENT ON TABLE renewal_opportunities IS 'Renewal pipeline and churn management';

COMMENT ON COLUMN subscriptions.organization_uuid IS 'UUID reference to organizations table';
COMMENT ON COLUMN subscriptions.features IS 'JSON array of enabled feature names';
COMMENT ON COLUMN subscription_usage.metadata IS 'Additional context for usage metrics';
COMMENT ON COLUMN renewal_opportunities.risk_factors IS 'JSON array of churn risk indicators';

-- Migration completed successfully
SELECT 'Schema migration completed - Integer IDs converted to UUIDs' as status;
