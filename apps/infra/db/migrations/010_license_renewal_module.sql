-- ============================================================================
-- License & Renewal Module - Database Schema
-- MSP Platform: License management, usage tracking, renewal automation
-- ============================================================================

-- ============================================================================
-- 1. LICENSE CATALOG (SKUs/Plans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'starter', 'professional', 'enterprise', 'custom'
    is_active BOOLEAN DEFAULT true,
    price_monthly DECIMAL(10,2),
    price_annual DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual', 'one-time'
    trial_days INTEGER DEFAULT 0,
    grace_period_days INTEGER DEFAULT 7,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_licenses_sku ON licenses(sku);
CREATE INDEX idx_licenses_category ON licenses(category);
CREATE INDEX idx_licenses_active ON licenses(is_active);

-- ============================================================================
-- 2. LICENSE FEATURES (Entitlements/Modules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS license_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_code VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    module_name VARCHAR(100), -- 'sales', 'pmo', 'delivery', 'grc', etc.
    layer_number INTEGER, -- 1-12 for 12-layer architecture
    feature_type VARCHAR(50) DEFAULT 'boolean', -- 'boolean', 'limit', 'quota'
    default_value VARCHAR(255),
    enforcement_type VARCHAR(50) DEFAULT 'soft', -- 'soft', 'hard', 'grace'
    http_status_on_unlicensed INTEGER DEFAULT 402,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_license_features_code ON license_features(feature_code);
CREATE INDEX idx_license_features_module ON license_features(module_name);
CREATE INDEX idx_license_features_layer ON license_features(layer_number);

-- ============================================================================
-- 3. LICENSE-FEATURE MAPPING (What each license includes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS license_feature_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES license_features(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    limit_type VARCHAR(50), -- 'users', 'storage_gb', 'api_calls', 'tenants', etc.
    limit_value INTEGER,
    overage_allowed BOOLEAN DEFAULT false,
    overage_price DECIMAL(10,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(license_id, feature_id)
);

CREATE INDEX idx_license_feature_map_license ON license_feature_map(license_id);
CREATE INDEX idx_license_feature_map_feature ON license_feature_map(feature_id);

-- ============================================================================
-- 4. TENANT LICENSES (Assigned licenses per tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    license_id UUID NOT NULL REFERENCES licenses(id),
    contract_id UUID, -- FK to contracts table (Layer 6)
    invoice_id UUID, -- FK to invoices table (Layer 8)
    
    -- License details
    status VARCHAR(50) DEFAULT 'active', -- 'trial', 'active', 'suspended', 'expired', 'cancelled'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    trial_end_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Pricing
    price_paid DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Usage limits
    user_limit INTEGER,
    storage_gb_limit INTEGER,
    api_calls_limit INTEGER,
    
    -- Tracking
    last_renewal_date DATE,
    next_billing_date DATE,
    suspended_at TIMESTAMP,
    suspended_reason TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tenant_license_dates_check CHECK (end_date > start_date)
);

CREATE INDEX idx_tenant_licenses_tenant ON tenant_licenses(tenant_id);
CREATE INDEX idx_tenant_licenses_license ON tenant_licenses(license_id);
CREATE INDEX idx_tenant_licenses_status ON tenant_licenses(status);
CREATE INDEX idx_tenant_licenses_end_date ON tenant_licenses(end_date);
CREATE INDEX idx_tenant_licenses_contract ON tenant_licenses(contract_id);
CREATE INDEX idx_tenant_licenses_invoice ON tenant_licenses(invoice_id);

-- ============================================================================
-- 5. TENANT LICENSE USAGE (Real-time usage tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_license_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES license_features(id),
    
    -- Usage metrics
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    usage_type VARCHAR(50), -- 'users', 'storage_gb', 'api_calls', 'tenants', etc.
    used_value NUMERIC NOT NULL DEFAULT 0,
    limit_value NUMERIC,
    percentage_used NUMERIC GENERATED ALWAYS AS (
        CASE WHEN limit_value > 0 THEN (used_value / limit_value * 100) ELSE 0 END
    ) STORED,
    is_over_limit BOOLEAN GENERATED ALWAYS AS (
        CASE WHEN limit_value > 0 THEN used_value > limit_value ELSE false END
    ) STORED,
    
    -- Upsell signals
    warning_threshold_reached BOOLEAN DEFAULT false,
    upsell_opportunity_created BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_license_id, feature_id, period_start)
);

CREATE INDEX idx_tenant_usage_license ON tenant_license_usage(tenant_license_id);
CREATE INDEX idx_tenant_usage_feature ON tenant_license_usage(feature_id);
CREATE INDEX idx_tenant_usage_period ON tenant_license_usage(period_start, period_end);
CREATE INDEX idx_tenant_usage_over_limit ON tenant_license_usage(is_over_limit) WHERE is_over_limit = true;

-- ============================================================================
-- 6. LICENSE EVENTS (Immutable audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS license_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id),
    event_type VARCHAR(100) NOT NULL, -- 'created', 'activated', 'renewed', 'suspended', 'expired', 'cancelled', 'upgraded', 'downgraded'
    event_status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'pending'
    
    -- Event details
    triggered_by VARCHAR(50), -- 'user', 'system', 'cron', 'dunning'
    user_id UUID,
    reason TEXT,
    
    -- Before/after state
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    old_end_date DATE,
    new_end_date DATE,
    
    -- Related records
    renewal_opportunity_id UUID,
    invoice_id UUID,
    payment_id UUID,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_license_events_license ON license_events(tenant_license_id);
CREATE INDEX idx_license_events_type ON license_events(event_type);
CREATE INDEX idx_license_events_created ON license_events(created_at);

-- ============================================================================
-- 7. DUNNING SCHEDULES (Renewal automation timeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dunning_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    days_before_expiry INTEGER NOT NULL, -- 120, 90, 60, 30, 7, 0, -7
    action_type VARCHAR(100) NOT NULL, -- 'send_email', 'create_quote', 'create_renewal_opportunity', 'escalate_case', 'suspend_features'
    
    -- Action configuration
    email_template_id UUID,
    notification_type VARCHAR(50),
    escalation_level INTEGER,
    
    -- Conditions
    applies_to_status VARCHAR[] DEFAULT ARRAY['active'], -- Which license statuses trigger this
    skip_if_auto_renew BOOLEAN DEFAULT false,
    
    -- Action payload
    action_config JSONB DEFAULT '{}'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    execution_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(name, days_before_expiry)
);

CREATE INDEX idx_dunning_schedules_days ON dunning_schedules(days_before_expiry);
CREATE INDEX idx_dunning_schedules_action ON dunning_schedules(action_type);
CREATE INDEX idx_dunning_schedules_active ON dunning_schedules(is_active) WHERE is_active = true;

-- ============================================================================
-- 8. DUNNING EXECUTION LOG (Track automation runs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dunning_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dunning_schedule_id UUID NOT NULL REFERENCES dunning_schedules(id),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id),
    
    -- Execution details
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    days_until_expiry INTEGER,
    action_taken VARCHAR(100),
    status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'skipped'
    error_message TEXT,
    
    -- Results
    email_sent BOOLEAN DEFAULT false,
    opportunity_created UUID,
    quote_created UUID,
    case_escalated UUID,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_dunning_execution_schedule ON dunning_execution_log(dunning_schedule_id);
CREATE INDEX idx_dunning_execution_license ON dunning_execution_log(tenant_license_id);
CREATE INDEX idx_dunning_execution_date ON dunning_execution_log(executed_at);

-- ============================================================================
-- 9. RENEWAL OPPORTUNITIES (Layer 10 integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS renewal_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id),
    opportunity_id UUID, -- FK to opportunities table (Layer 3)
    
    -- Renewal details
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'won', 'lost', 'renewed'
    renewal_type VARCHAR(50) DEFAULT 'renewal', -- 'renewal', 'upgrade', 'downgrade', 'expansion'
    current_arr DECIMAL(10,2),
    proposed_arr DECIMAL(10,2),
    value_change DECIMAL(10,2),
    
    -- Timeline
    license_end_date DATE NOT NULL,
    renewal_target_date DATE NOT NULL,
    quote_generated_at TIMESTAMP,
    proposal_sent_at TIMESTAMP,
    renewed_at TIMESTAMP,
    
    -- Owner & tracking
    assigned_to UUID,
    health_score INTEGER, -- 0-100 from Layer 9
    churn_risk VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    
    -- Negotiation
    discount_offered DECIMAL(5,2),
    price_increase_pct DECIMAL(5,2),
    terms_accepted BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_renewal_opps_license ON renewal_opportunities(tenant_license_id);
CREATE INDEX idx_renewal_opps_status ON renewal_opportunities(status);
CREATE INDEX idx_renewal_opps_end_date ON renewal_opportunities(license_end_date);
CREATE INDEX idx_renewal_opps_risk ON renewal_opportunities(churn_risk);

-- ============================================================================
-- 10. RENEWALS VIEW (120-day pipeline)
-- ============================================================================
CREATE OR REPLACE VIEW v_renewals_120d AS
SELECT 
    tl.id as tenant_license_id,
    tl.tenant_id,
    tl.license_id,
    l.sku,
    l.name as license_name,
    tl.status,
    tl.start_date,
    tl.end_date,
    tl.auto_renew,
    tl.price_paid as current_arr,
    (tl.end_date - CURRENT_DATE) as days_until_expiry,
    
    -- Renewal opportunity
    ro.id as renewal_opportunity_id,
    ro.status as renewal_status,
    ro.proposed_arr,
    ro.churn_risk,
    ro.assigned_to,
    
    -- Usage signals
    COALESCE(
        (SELECT AVG(percentage_used) 
         FROM tenant_license_usage 
         WHERE tenant_license_id = tl.id 
         AND period_end >= CURRENT_DATE - INTERVAL '30 days'), 
        0
    ) as avg_usage_percentage,
    
    -- Dunning actions taken
    (SELECT COUNT(*) 
     FROM dunning_execution_log 
     WHERE tenant_license_id = tl.id) as dunning_actions_count,
    
    -- Health from Layer 9 (placeholder)
    NULL::INTEGER as customer_health_score,
    
    tl.created_at,
    tl.updated_at
FROM tenant_licenses tl
LEFT JOIN licenses l ON tl.license_id = l.id
LEFT JOIN renewal_opportunities ro ON ro.tenant_license_id = tl.id AND ro.status IN ('open', 'in_progress')
WHERE tl.status IN ('active', 'trial')
  AND tl.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '120 days')
ORDER BY tl.end_date ASC;

-- ============================================================================
-- 11. FUNCTIONS: License entitlement check
-- ============================================================================
CREATE OR REPLACE FUNCTION check_license_entitlement(
    p_tenant_id UUID,
    p_feature_code VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_licensed BOOLEAN := false;
    v_usage_info JSONB;
BEGIN
    -- Check if tenant has an active license with this feature
    SELECT 
        jsonb_build_object(
            'licensed', COUNT(*) > 0,
            'license_id', MAX(tl.license_id),
            'license_name', MAX(l.name),
            'end_date', MAX(tl.end_date),
            'status', MAX(tl.status)
        )
    INTO v_result
    FROM tenant_licenses tl
    JOIN licenses l ON tl.license_id = l.id
    JOIN license_feature_map lfm ON lfm.license_id = l.id
    JOIN license_features lf ON lfm.feature_id = lf.id
    WHERE tl.tenant_id = p_tenant_id
      AND tl.status = 'active'
      AND lf.feature_code = p_feature_code
      AND lfm.is_included = true
      AND tl.end_date >= CURRENT_DATE;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. FUNCTIONS: Check usage limits
-- ============================================================================
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_tenant_id UUID,
    p_usage_type VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'usage_type', p_usage_type,
            'used_value', COALESCE(SUM(tlu.used_value), 0),
            'limit_value', MAX(lfm.limit_value),
            'is_over_limit', COALESCE(SUM(tlu.used_value), 0) > COALESCE(MAX(lfm.limit_value), 999999),
            'percentage_used', 
                CASE 
                    WHEN MAX(lfm.limit_value) > 0 
                    THEN (COALESCE(SUM(tlu.used_value), 0) / MAX(lfm.limit_value) * 100)
                    ELSE 0 
                END
        )
    INTO v_result
    FROM tenant_licenses tl
    LEFT JOIN license_feature_map lfm ON lfm.license_id = tl.license_id
    LEFT JOIN tenant_license_usage tlu ON tlu.tenant_license_id = tl.id
    WHERE tl.tenant_id = p_tenant_id
      AND tl.status = 'active'
      AND lfm.limit_type = p_usage_type
      AND tl.end_date >= CURRENT_DATE;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. SEED DATA: Default licenses
-- ============================================================================
INSERT INTO licenses (sku, name, description, category, price_monthly, price_annual, billing_cycle) VALUES
('STARTER_MONTHLY', 'Starter Plan', 'Basic GRC compliance for small teams', 'starter', 99.00, 990.00, 'monthly'),
('PROFESSIONAL_MONTHLY', 'Professional Plan', 'Full GRC features for growing organizations', 'professional', 499.00, 4990.00, 'monthly'),
('ENTERPRISE_ANNUAL', 'Enterprise Plan', 'Unlimited GRC with dedicated support', 'enterprise', NULL, 15000.00, 'annual')
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- 14. SEED DATA: Default features
-- ============================================================================
INSERT INTO license_features (feature_code, feature_name, module_name, layer_number, feature_type, enforcement_type) VALUES
('FRAMEWORKS', 'Frameworks Management', 'grc', 1, 'limit', 'hard'),
('ASSESSMENTS', 'Compliance Assessments', 'grc', 1, 'limit', 'hard'),
('RISKS', 'Risk Management', 'grc', 1, 'limit', 'hard'),
('USERS', 'User Accounts', 'system', 1, 'limit', 'hard'),
('STORAGE', 'File Storage (GB)', 'system', 1, 'quota', 'soft'),
('API_CALLS', 'API Calls per Month', 'system', 1, 'quota', 'soft'),
('SALES_CRM', 'Sales & CRM', 'sales', 2, 'boolean', 'hard'),
('TENDERING', 'Tendering & RFQ', 'tendering', 4, 'boolean', 'hard'),
('PMO', 'Project Management', 'pmo', 7, 'boolean', 'hard'),
('MAINTENANCE', 'Maintenance & Support', 'maintenance', 9, 'boolean', 'hard')
ON CONFLICT (feature_code) DO NOTHING;

-- ============================================================================
-- 15. SEED DATA: Default dunning schedule
-- ============================================================================
INSERT INTO dunning_schedules (name, days_before_expiry, action_type, is_active, execution_order) VALUES
('Renewal Opportunity Creation', 120, 'create_renewal_opportunity', true, 1),
('Pre-renewal Email', 90, 'send_email', true, 2),
('Generate Renewal Quote', 60, 'create_quote', true, 3),
('Final Reminder', 30, 'send_email', true, 4),
('Urgent Renewal Notice', 7, 'send_email', true, 5),
('Expiry Day Warning', 0, 'send_email', true, 6),
('Grace Period Warning', -7, 'escalate_case', true, 7),
('Suspend Features', -14, 'suspend_features', true, 8)
ON CONFLICT (name, days_before_expiry) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================
