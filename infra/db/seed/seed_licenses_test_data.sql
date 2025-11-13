-- ============================================================================
-- LICENSE & RENEWAL MODULE - TEST SEED DATA
-- For development and testing purposes
-- ============================================================================

-- ============================================================================
-- 1. SAMPLE TENANTS (for testing)
-- ============================================================================
INSERT INTO tenants (id, name, domain, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'acme.com', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'techstart.io', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions Ltd', 'globalsolutions.com', 'trial', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', 'Enterprise Corp', 'enterprise.com', 'active', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. ASSIGN LICENSES TO TENANTS
-- ============================================================================

-- Acme Corp - Professional Plan (expiring in 45 days)
INSERT INTO tenant_licenses (
    tenant_id, license_id, status, start_date, end_date, 
    price_paid, user_limit, storage_gb_limit, api_calls_limit, auto_renew
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    id,
    'active',
    CURRENT_DATE - INTERVAL '330 days',
    CURRENT_DATE + INTERVAL '45 days',
    499.00,
    50,
    50,
    100000,
    true
FROM licenses WHERE sku = 'PROFESSIONAL_MONTHLY'
ON CONFLICT DO NOTHING;

-- TechStart - Starter Plan (expiring in 15 days - CRITICAL)
INSERT INTO tenant_licenses (
    tenant_id, license_id, status, start_date, end_date, 
    price_paid, user_limit, storage_gb_limit, api_calls_limit, auto_renew
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    id,
    'active',
    CURRENT_DATE - INTERVAL '350 days',
    CURRENT_DATE + INTERVAL '15 days',
    99.00,
    10,
    5,
    10000,
    false
FROM licenses WHERE sku = 'STARTER_MONTHLY'
ON CONFLICT DO NOTHING;

-- Global Solutions - Trial (expiring in 3 days - URGENT)
INSERT INTO tenant_licenses (
    tenant_id, license_id, status, start_date, end_date, 
    price_paid, user_limit, storage_gb_limit, api_calls_limit, auto_renew
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    id,
    'trial',
    CURRENT_DATE - INTERVAL '11 days',
    CURRENT_DATE + INTERVAL '3 days',
    0.00,
    10,
    5,
    10000,
    false
FROM licenses WHERE sku = 'STARTER_MONTHLY'
ON CONFLICT DO NOTHING;

-- Enterprise Corp - Enterprise Plan (expiring in 90 days)
INSERT INTO tenant_licenses (
    tenant_id, license_id, status, start_date, end_date, 
    price_paid, user_limit, storage_gb_limit, api_calls_limit, auto_renew
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    id,
    'active',
    CURRENT_DATE - INTERVAL '275 days',
    CURRENT_DATE + INTERVAL '90 days',
    15000.00,
    NULL,
    500,
    1000000,
    true
FROM licenses WHERE sku = 'ENTERPRISE_ANNUAL'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. USAGE DATA (Simulate real usage)
-- ============================================================================

-- Acme Corp Usage (80% of users limit - approaching limit)
INSERT INTO tenant_license_usage (
    tenant_license_id, feature_id, period_start, period_end,
    usage_type, used_value, limit_value
)
SELECT 
    tl.id,
    lf.id,
    DATE_TRUNC('month', CURRENT_DATE),
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date,
    'USERS',
    40,
    50
FROM tenant_licenses tl
JOIN licenses l ON tl.license_id = l.id
JOIN license_features lf ON lf.feature_code = 'USERS'
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;

-- TechStart Usage (95% of storage - CRITICAL)
INSERT INTO tenant_license_usage (
    tenant_license_id, feature_id, period_start, period_end,
    usage_type, used_value, limit_value
)
SELECT 
    tl.id,
    lf.id,
    DATE_TRUNC('month', CURRENT_DATE),
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date,
    'STORAGE',
    4.8,
    5
FROM tenant_licenses tl
JOIN licenses l ON tl.license_id = l.id
JOIN license_features lf ON lf.feature_code = 'STORAGE'
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440002'
ON CONFLICT DO NOTHING;

-- Global Solutions API Usage (50% - normal)
INSERT INTO tenant_license_usage (
    tenant_license_id, feature_id, period_start, period_end,
    usage_type, used_value, limit_value
)
SELECT 
    tl.id,
    lf.id,
    DATE_TRUNC('month', CURRENT_DATE),
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date,
    'API_CALLS',
    5000,
    10000
FROM tenant_licenses tl
JOIN licenses l ON tl.license_id = l.id
JOIN license_features lf ON lf.feature_code = 'API_CALLS'
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440003'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. RENEWAL OPPORTUNITIES
-- ============================================================================

-- Acme Corp - Renewal opportunity (45 days out)
INSERT INTO renewal_opportunities (
    tenant_license_id, status, renewal_type, current_arr, proposed_arr,
    value_change, license_end_date, renewal_target_date,
    churn_risk, health_score, price_increase_pct
)
SELECT 
    tl.id,
    'open',
    'renewal',
    tl.price_paid,
    tl.price_paid * 1.05,
    tl.price_paid * 0.05,
    tl.end_date,
    tl.end_date - INTERVAL '30 days',
    'low',
    85,
    5.0
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;

-- TechStart - CRITICAL renewal (15 days out, no auto-renew)
INSERT INTO renewal_opportunities (
    tenant_license_id, status, renewal_type, current_arr, proposed_arr,
    value_change, license_end_date, renewal_target_date,
    churn_risk, health_score, price_increase_pct
)
SELECT 
    tl.id,
    'open',
    'renewal',
    tl.price_paid,
    tl.price_paid * 1.05,
    tl.price_paid * 0.05,
    tl.end_date,
    tl.end_date - INTERVAL '30 days',
    'critical',
    35,
    5.0
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440002'
ON CONFLICT DO NOTHING;

-- Global Solutions - Upgrade opportunity (trial to paid)
INSERT INTO renewal_opportunities (
    tenant_license_id, status, renewal_type, current_arr, proposed_arr,
    value_change, license_end_date, renewal_target_date,
    churn_risk, health_score, price_increase_pct
)
SELECT 
    tl.id,
    'open',
    'upgrade',
    0,
    499.00,
    499.00,
    tl.end_date,
    tl.end_date,
    'high',
    60,
    0
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440003'
ON CONFLICT DO NOTHING;

-- Enterprise Corp - Early renewal (90 days out)
INSERT INTO renewal_opportunities (
    tenant_license_id, status, renewal_type, current_arr, proposed_arr,
    value_change, license_end_date, renewal_target_date,
    churn_risk, health_score, price_increase_pct
)
SELECT 
    tl.id,
    'open',
    'renewal',
    tl.price_paid,
    tl.price_paid * 1.03,
    tl.price_paid * 0.03,
    tl.end_date,
    tl.end_date - INTERVAL '30 days',
    'low',
    95,
    3.0
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440004'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. LICENSE EVENTS (Audit Trail)
-- ============================================================================

-- Sample events for Acme Corp
INSERT INTO license_events (tenant_license_id, event_type, event_status, triggered_by, metadata)
SELECT 
    tl.id,
    'created',
    'success',
    'system',
    '{"initial_setup": true}'::jsonb
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;

INSERT INTO license_events (tenant_license_id, event_type, event_status, triggered_by, metadata)
SELECT 
    tl.id,
    'renewal_action_create_renewal_opportunity',
    'success',
    'system',
    '{"days_before_expiry": 45}'::jsonb
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;

-- Sample events for TechStart (critical)
INSERT INTO license_events (tenant_license_id, event_type, event_status, triggered_by, metadata)
SELECT 
    tl.id,
    'created',
    'success',
    'system',
    '{"initial_setup": true}'::jsonb
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440002'
ON CONFLICT DO NOTHING;

INSERT INTO license_events (tenant_license_id, event_type, event_status, triggered_by, metadata)
SELECT 
    tl.id,
    'renewal_action_send_email',
    'success',
    'system',
    '{"template": "renewal_30d_final", "days_before_expiry": 15}'::jsonb
FROM tenant_licenses tl
WHERE tl.tenant_id = '550e8400-e29b-41d4-a716-446655440002'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- View all tenant licenses
SELECT 
    t.name as tenant_name,
    l.name as license_name,
    tl.status,
    tl.end_date,
    (tl.end_date - CURRENT_DATE) as days_until_expiry,
    tl.auto_renew
FROM tenant_licenses tl
JOIN tenants t ON tl.tenant_id = t.id
JOIN licenses l ON tl.license_id = l.id
ORDER BY tl.end_date ASC;

-- View usage summary
SELECT 
    t.name as tenant_name,
    lf.feature_name,
    tlu.used_value,
    tlu.limit_value,
    tlu.percentage_used,
    tlu.is_over_limit
FROM tenant_license_usage tlu
JOIN tenant_licenses tl ON tlu.tenant_license_id = tl.id
JOIN tenants t ON tl.tenant_id = t.id
JOIN license_features lf ON tlu.feature_id = lf.id
ORDER BY tlu.percentage_used DESC;

-- View renewal pipeline
SELECT * FROM v_renewals_120d ORDER BY days_until_expiry ASC;

COMMIT;
