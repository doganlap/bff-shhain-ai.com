-- ============================================================
-- COMPREHENSIVE DATABASE MERGE SCRIPT
-- Target: shahin_ksa_compliance (ACTIVE DATABASE)
-- Sources: grc_master, shahin_access_control
-- Date: November 14, 2025
-- ============================================================

\c shahin_ksa_compliance

-- Enable dblink extension for cross-database queries
CREATE EXTENSION IF NOT EXISTS dblink;

-- ============================================================
-- PART 1: MERGE FROM grc_master
-- ============================================================

-- Import licensing and subscription tables (NOT in shahin_ksa_compliance)

-- 1. Import subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    billing_cycle VARCHAR(20),
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM subscription_plans')
    AS t(id integer, name varchar, description text, price numeric, billing_cycle varchar,
         features jsonb, is_active boolean, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- 2. Import subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,
    plan_id INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscriptions
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM subscriptions')
    AS t(id integer, tenant_id uuid, plan_id integer, status varchar, start_date timestamp,
         end_date timestamp, auto_renew boolean, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- 3. Import licenses
CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,
    license_key VARCHAR(255) UNIQUE,
    license_type VARCHAR(50),
    max_users INTEGER,
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO licenses
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM licenses')
    AS t(id integer, tenant_id uuid, license_key varchar, license_type varchar, max_users integer,
         expiry_date timestamp, is_active boolean, created_at timestamp, updated_at timestamp)
ON CONFLICT (license_key) DO NOTHING;

-- 4. Import invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,
    subscription_id INTEGER,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMP,
    paid_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO invoices
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM invoices')
    AS t(id integer, tenant_id uuid, subscription_id integer, amount numeric, currency varchar,
         status varchar, due_date timestamp, paid_date timestamp, created_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- 5. Import tenant_licenses
CREATE TABLE IF NOT EXISTS tenant_licenses (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,
    license_id INTEGER,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO tenant_licenses
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM tenant_licenses')
    AS t(id integer, tenant_id uuid, license_id integer, assigned_date timestamp,
         revoked_date timestamp, is_active boolean)
ON CONFLICT (id) DO NOTHING;

-- 6. Import dunning_schedules
CREATE TABLE IF NOT EXISTS dunning_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    schedule_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dunning_schedules
SELECT * FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT * FROM dunning_schedules')
    AS t(id integer, name varchar, description text, schedule_config jsonb,
         is_active boolean, created_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 2: MERGE FROM shahin_access_control
-- ============================================================

-- Import authentication and access control tables

-- 1. Import permissions
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissions
SELECT * FROM dblink('dbname=shahin_access_control user=postgres password=postgres',
    'SELECT * FROM permissions')
    AS t(id integer, name varchar, description text, resource varchar, action varchar, created_at timestamp)
ON CONFLICT (name) DO NOTHING;

-- 2. Import role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER,
    permission_id INTEGER,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

INSERT INTO role_permissions
SELECT * FROM dblink('dbname=shahin_access_control user=postgres password=postgres',
    'SELECT * FROM role_permissions')
    AS t(id integer, role_id integer, permission_id integer, granted_at timestamp)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3. Import user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_sessions
SELECT * FROM dblink('dbname=shahin_access_control user=postgres password=postgres',
    'SELECT * FROM user_sessions')
    AS t(id integer, user_id integer, session_token varchar, ip_address varchar, user_agent text,
         expires_at timestamp, created_at timestamp, last_activity timestamp)
ON CONFLICT (session_token) DO NOTHING;

-- 4. Import audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO audit_logs
SELECT * FROM dblink('dbname=shahin_access_control user=postgres password=postgres',
    'SELECT * FROM audit_logs')
    AS t(id integer, user_id integer, action varchar, entity_type varchar, entity_id varchar,
         changes jsonb, ip_address varchar, user_agent text, created_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- 5. Import api_tokens
CREATE TABLE IF NOT EXISTS api_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    token_hash VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    scopes JSONB,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO api_tokens
SELECT * FROM dblink('dbname=shahin_access_control user=postgres password=postgres',
    'SELECT * FROM api_tokens')
    AS t(id integer, user_id integer, token_hash varchar, name varchar, scopes jsonb,
         last_used_at timestamp, expires_at timestamp, is_active boolean, created_at timestamp)
ON CONFLICT (token_hash) DO NOTHING;

-- ============================================================
-- PART 3: UPDATE SEQUENCES
-- ============================================================

SELECT setval('subscription_plans_id_seq', COALESCE((SELECT MAX(id) FROM subscription_plans), 1));
SELECT setval('subscriptions_id_seq', COALESCE((SELECT MAX(id) FROM subscriptions), 1));
SELECT setval('licenses_id_seq', COALESCE((SELECT MAX(id) FROM licenses), 1));
SELECT setval('invoices_id_seq', COALESCE((SELECT MAX(id) FROM invoices), 1));
SELECT setval('tenant_licenses_id_seq', COALESCE((SELECT MAX(id) FROM tenant_licenses), 1));
SELECT setval('dunning_schedules_id_seq', COALESCE((SELECT MAX(id) FROM dunning_schedules), 1));
SELECT setval('permissions_id_seq', COALESCE((SELECT MAX(id) FROM permissions), 1));
SELECT setval('role_permissions_id_seq', COALESCE((SELECT MAX(id) FROM role_permissions), 1));
SELECT setval('user_sessions_id_seq', COALESCE((SELECT MAX(id) FROM user_sessions), 1));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1));
SELECT setval('api_tokens_id_seq', COALESCE((SELECT MAX(id) FROM api_tokens), 1));

-- ============================================================
-- PART 4: VERIFICATION
-- ============================================================

\echo '============================================================'
\echo 'MERGE VERIFICATION SUMMARY'
\echo '============================================================'

SELECT 'Subscription Plans: ' || COUNT(*) as count FROM subscription_plans;
SELECT 'Subscriptions: ' || COUNT(*) as count FROM subscriptions;
SELECT 'Licenses: ' || COUNT(*) as count FROM licenses;
SELECT 'Invoices: ' || COUNT(*) as count FROM invoices;
SELECT 'Permissions: ' || COUNT(*) as count FROM permissions;
SELECT 'Role Permissions: ' || COUNT(*) as count FROM role_permissions;
SELECT 'User Sessions: ' || COUNT(*) as count FROM user_sessions;
SELECT 'Audit Logs: ' || COUNT(*) as count FROM audit_logs;
SELECT 'API Tokens: ' || COUNT(*) as count FROM api_tokens;

\echo '============================================================'
\echo 'MERGE COMPLETE!'
\echo 'All data from grc_master and shahin_access_control has been'
\echo 'merged into shahin_ksa_compliance database.'
\echo '============================================================'
