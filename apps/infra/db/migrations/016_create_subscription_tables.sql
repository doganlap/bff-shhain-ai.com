-- =====================================================
-- Migration: 016 - Create Subscription Tables
-- Description: Subscription and licensing management system
-- Date: 2024-11-11
-- =====================================================

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,

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
    upgraded_from INTEGER, -- Reference to previous subscription
    downgraded_to INTEGER, -- Reference to next subscription if downgraded

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT subscriptions_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_upgraded_from_fk
        FOREIGN KEY (upgraded_from) REFERENCES subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT subscriptions_downgraded_to_fk
        FOREIGN KEY (downgraded_to) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- =====================================================
-- SUBSCRIPTION USAGE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_usage (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL,

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

-- =====================================================
-- SUBSCRIPTION FEATURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_features (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL,

    -- Feature Information
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,

    -- Usage Limits
    usage_limit INTEGER, -- NULL means unlimited
    current_usage INTEGER DEFAULT 0,
    reset_period VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    last_reset_at TIMESTAMP WITH TIME ZONE,

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
-- SUBSCRIPTION BILLING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_billing (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL,

    -- Billing Information
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    billing_date DATE NOT NULL,

    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Payment Status
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),

    -- Invoice Information
    invoice_number VARCHAR(100),
    invoice_url TEXT,

    -- Usage Summary for this billing period
    usage_summary JSONB DEFAULT '{}',

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT subscription_billing_subscription_fk
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- =====================================================
-- SUBSCRIPTION PLAN DEFINITIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,

    -- Plan Information
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Plan Configuration
    max_users INTEGER NOT NULL,
    max_organizations INTEGER DEFAULT 1,
    max_assessments INTEGER, -- NULL means unlimited
    max_storage_gb INTEGER DEFAULT 10,

    -- Features
    features JSONB DEFAULT '[]', -- Array of available features

    -- Pricing
    monthly_price DECIMAL(10,2) NOT NULL,
    yearly_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Plan Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Can be subscribed to by customers

    -- Trial Configuration
    trial_days INTEGER DEFAULT 0,
    is_trial_available BOOLEAN DEFAULT false,

    -- Plan Ordering
    sort_order INTEGER DEFAULT 100,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_events (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL,

    -- Event Information
    event_type VARCHAR(100) NOT NULL, -- 'created', 'upgraded', 'downgraded', 'cancelled', 'renewed', 'suspended'
    event_description TEXT,

    -- Event Data
    event_data JSONB DEFAULT '{}', -- Additional event-specific data

    -- Context
    triggered_by INTEGER, -- User who triggered the event

-- =====================================================
-- INDEXES FOR SUBSCRIPTIONS
-- =====================================================

-- Performance indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization
    ON subscriptions (organization_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
    ON subscriptions (status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
    ON subscriptions (plan_name);

CREATE INDEX IF NOT EXISTS idx_subscriptions_ends_at
    ON subscriptions (ends_at) WHERE ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial
    ON subscriptions (trial_end_date) WHERE trial_end_date IS NOT NULL;

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription
    ON subscription_usage (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_metric
    ON subscription_usage (metric_name);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_recorded_at
    ON subscription_usage (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_metric
    ON subscription_usage (subscription_id, metric_name, recorded_at DESC);

-- Features indexes
CREATE INDEX IF NOT EXISTS idx_subscription_features_subscription
    ON subscription_features (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_features_enabled
    ON subscription_features (subscription_id, is_enabled);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_subscription_billing_subscription
    ON subscription_billing (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_billing_date
    ON subscription_billing (billing_date DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_billing_status
    ON subscription_billing (payment_status);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription
    ON subscription_events (subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_type
    ON subscription_events (event_type);

CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at
    ON subscription_events (created_at DESC);

-- Plan definitions indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active
    ON subscription_plans (is_active, sort_order);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER trigger_subscription_features_updated_at
    BEFORE UPDATE ON subscription_features
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER trigger_subscription_billing_updated_at
    BEFORE UPDATE ON subscription_billing
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER trigger_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Function to log subscription events
CREATE OR REPLACE FUNCTION log_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log creation events
    IF TG_OP = 'INSERT' THEN
        INSERT INTO subscription_events (subscription_id, event_type, event_description, event_data)
        VALUES (NEW.id, 'created', 'Subscription created',
                json_build_object('plan_name', NEW.plan_name, 'billing_cycle', NEW.billing_cycle));
        RETURN NEW;
    END IF;

    -- Log update events
    IF TG_OP = 'UPDATE' THEN
        -- Plan changes
        IF OLD.plan_name != NEW.plan_name THEN
            INSERT INTO subscription_events (subscription_id, event_type, event_description, event_data)
            VALUES (NEW.id, 'plan_changed', 'Subscription plan changed',
                    json_build_object('old_plan', OLD.plan_name, 'new_plan', NEW.plan_name));
        END IF;

        -- Status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO subscription_events (subscription_id, event_type, event_description, event_data)
            VALUES (NEW.id, 'status_changed', 'Subscription status changed',
                    json_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log subscription events
CREATE TRIGGER trigger_log_subscription_events
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_event();

-- =====================================================
-- SEED DATA - BASIC SUBSCRIPTION PLANS
-- =====================================================

INSERT INTO subscription_plans (plan_name, display_name, description, max_users, max_assessments, max_storage_gb,
                               features, monthly_price, yearly_price, trial_days, is_trial_available, sort_order)
VALUES
    ('starter', 'Starter Plan', 'Basic GRC functionality for small teams', 5, 10, 5,
     '["basic_assessments", "basic_reports", "email_support"]', 99.00, 990.00, 14, true, 1),

    ('professional', 'Professional Plan', 'Advanced features for growing organizations', 25, 100, 25,
     '["advanced_assessments", "custom_frameworks", "advanced_reports", "workflow_automation", "api_access", "priority_support"]',
     299.00, 2990.00, 14, true, 2),

    ('enterprise', 'Enterprise Plan', 'Complete GRC solution with advanced AI features', 100, NULL, 100,
     '["all_professional_features", "ai_insights", "predictive_analytics", "custom_integrations", "sso", "dedicated_support", "compliance_automation"]',
     799.00, 7990.00, 30, true, 3),

    ('compliance_plus', 'Compliance Plus', 'Specialized compliance management with regulatory intelligence', 50, 500, 50,
     '["regulatory_intelligence", "compliance_automation", "audit_management", "risk_monitoring", "regulatory_updates", "compliance_dashboard"]',
     599.00, 5990.00, 0, false, 4)
ON CONFLICT (plan_name) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE subscriptions IS 'Customer subscription records with plans and billing';
COMMENT ON TABLE subscription_usage IS 'Usage metrics tracking for billing and limits';
COMMENT ON TABLE subscription_features IS 'Feature access control per subscription';
COMMENT ON TABLE subscription_billing IS 'Billing records and payment tracking';
COMMENT ON TABLE subscription_plans IS 'Available subscription plan definitions';
COMMENT ON TABLE subscription_events IS 'Audit log of subscription lifecycle events';

COMMENT ON COLUMN subscriptions.features IS 'JSON array of enabled features for this subscription';
COMMENT ON COLUMN subscription_usage.metadata IS 'Additional context for usage tracking';
COMMENT ON COLUMN subscription_plans.features IS 'JSON array of features available in this plan';
