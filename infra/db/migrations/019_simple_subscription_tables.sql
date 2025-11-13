-- =====================================================
-- Migration: 019 - Simple Subscription Tables
-- Description: Create subscription tables with proper UUID support
-- Date: 2024-11-12
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing problematic tables
DROP TABLE IF EXISTS subscription_features CASCADE;
DROP TABLE IF EXISTS subscription_usage CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- Create simple subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID NOT NULL,

    -- Plan Information
    plan_name VARCHAR(100) NOT NULL DEFAULT 'professional',
    price DECIMAL(10,2) NOT NULL DEFAULT 299.00,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',

    -- Limits
    max_users INTEGER DEFAULT 25,
    max_assessments INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 50,

    -- Status
    status VARCHAR(20) DEFAULT 'active',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription usage table
CREATE TABLE subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription features table
CREATE TABLE subscription_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscription_id, feature_name)
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    line_items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_features_subscription ON subscription_features(subscription_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);

-- Insert sample data using existing tenant/organization data
INSERT INTO subscriptions (tenant_id, organization_id, plan_name, price)
SELECT 
    t.id::uuid,
    o.id::uuid,
    'professional',
    299.00
FROM tenants t
JOIN organizations o ON o.tenant_id = t.id
LIMIT 3;

-- Insert sample features
INSERT INTO subscription_features (subscription_id, feature_name, is_enabled, usage_limit)
SELECT 
    s.id,
    unnest(ARRAY['advanced_analytics', 'api_calls', 'custom_reports', 'storage']),
    true,
    CASE unnest(ARRAY['advanced_analytics', 'api_calls', 'custom_reports', 'storage'])
        WHEN 'api_calls' THEN 10000
        WHEN 'custom_reports' THEN 50
        WHEN 'storage' THEN 50
        ELSE NULL
    END
FROM subscriptions s;

-- Insert sample usage data
INSERT INTO subscription_usage (subscription_id, metric_name, value)
SELECT 
    s.id,
    unnest(ARRAY['active_users', 'storage_used', 'api_calls', 'assessments_created']),
    unnest(ARRAY[15, 25.5, 2500, 8])
FROM subscriptions s;

SELECT 'Simple subscription tables created successfully' as status;
