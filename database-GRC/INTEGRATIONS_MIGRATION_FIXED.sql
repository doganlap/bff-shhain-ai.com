-- Database schema additions for Microsoft Auth, Stripe, and Zakat.ie integrations
-- Fixed version - compatible with existing schema
-- Run this migration to add support for new integrations

-- ==========================================
-- Microsoft Authentication
-- ==========================================

-- Add microsoft_id column to users table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='microsoft_id') THEN
        ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='auth_provider') THEN
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create index for faster microsoft_id lookups
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- ==========================================
-- Stripe Payment Integration
-- ==========================================

-- Add stripe_customer_id to users table (tenant column)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    tenant_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, etc.
    plan_id VARCHAR(255) NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL, -- succeeded, failed, pending
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    subscription_id INTEGER REFERENCES subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL, -- paid, open, void, uncollectible
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ==========================================
-- Zakat.ie Integration
-- ==========================================

-- Create zakat_calculations table
CREATE TABLE IF NOT EXISTS zakat_calculations (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    tenant_id VARCHAR(255),
    total_wealth DECIMAL(15, 2) NOT NULL,
    nisab_threshold DECIMAL(15, 2) NOT NULL,
    zakat_amount DECIMAL(15, 2) NOT NULL,
    is_zakat_due BOOLEAN NOT NULL,
    calculation_date TIMESTAMP NOT NULL,
    fiscal_year INTEGER NOT NULL,
    breakdown JSONB, -- Store detailed breakdown of assets
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create zakat_donations table
CREATE TABLE IF NOT EXISTS zakat_donations (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    tenant_id VARCHAR(255),
    zakat_ie_donation_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- pending, completed, failed
    payment_url TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_zakat_calculations_user_id ON zakat_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_calculations_tenant_id ON zakat_calculations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zakat_calculations_fiscal_year ON zakat_calculations(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_zakat_donations_user_id ON zakat_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_donations_tenant_id ON zakat_donations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zakat_donations_status ON zakat_donations(status);

-- ==========================================
-- Audit Tables
-- ==========================================

-- Create audit_logs table for security event tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- INFO, WARNING, ERROR, CRITICAL
    user_id UUID,
    tenant_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    resource VARCHAR(255),
    action VARCHAR(100),
    details JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- ==========================================
-- Comments
-- ==========================================

COMMENT ON TABLE subscriptions IS 'Stripe subscription management for users/tenants';
COMMENT ON TABLE payments IS 'Payment transaction records from Stripe';
COMMENT ON TABLE invoices IS 'Invoice records from Stripe';
COMMENT ON TABLE zakat_calculations IS 'Islamic Zakat calculation history';
COMMENT ON TABLE zakat_donations IS 'Zakat donations made through Zakat.ie platform';
COMMENT ON TABLE audit_logs IS 'Security and access audit trail';

COMMENT ON COLUMN users.microsoft_id IS 'Microsoft Azure AD user ID for SSO';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local, microsoft, google, etc.';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Integration tables created successfully!';
    RAISE NOTICE 'Tables: subscriptions, payments, invoices, zakat_calculations, zakat_donations, audit_logs';
    RAISE NOTICE 'Users table updated with: microsoft_id, auth_provider, email_verified, stripe_customer_id';
END $$;
