-- =====================================================
-- Migration: 013 - Create Partner Tables
-- Description: Partner relationship management and collaboration
-- Date: 2024-11-10
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PARTNERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    partner_tenant_id UUID, -- Reference to the partner's tenant
    
    -- Partner Information
    partner_type VARCHAR(50) NOT NULL DEFAULT 'vendor', -- 'vendor', 'client', 'auditor', 'regulator', 'strategic'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'rejected', 'terminated'
    partnership_level VARCHAR(20) DEFAULT 'basic', -- 'basic', 'standard', 'premium', 'strategic'
    
    -- Contact Information
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Business Information
    industry VARCHAR(100),
    business_registration VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Partnership Details
    partnership_start_date DATE,
    partnership_end_date DATE,
    contract_reference VARCHAR(255),
    
    -- Permissions and Access
    access_level VARCHAR(20) DEFAULT 'read', -- 'read', 'write', 'admin'
    allowed_frameworks TEXT[], -- Array of framework codes they can access
    allowed_organizations TEXT[], -- Array of organization IDs they can access
    
    -- Metadata
    description TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT fk_partners_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_partners_partner_tenant FOREIGN KEY (partner_tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_partners_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_partners_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_partners_type CHECK (partner_type IN ('vendor', 'client', 'auditor', 'regulator', 'strategic', 'consultant')),
    CONSTRAINT chk_partners_status CHECK (status IN ('pending', 'active', 'suspended', 'rejected', 'terminated')),
    CONSTRAINT chk_partners_level CHECK (partnership_level IN ('basic', 'standard', 'premium', 'strategic')),
    CONSTRAINT chk_partners_access CHECK (access_level IN ('read', 'write', 'admin')),
    CONSTRAINT chk_partners_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- PARTNER COLLABORATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    partner_id UUID NOT NULL,
    
    -- Collaboration Details
    collaboration_type VARCHAR(50) NOT NULL, -- 'assessment', 'audit', 'consultation', 'framework_sharing', 'resource_sharing'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Shared Resources
    shared_resources JSONB DEFAULT '{}', -- { "assessments": ["id1", "id2"], "frameworks": ["id1"], "documents": ["id1"] }
    access_permissions JSONB DEFAULT '{}', -- { "read": true, "write": false, "delete": false, "share": false }
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0,
    milestones JSONB DEFAULT '[]', -- [{ "name": "Milestone 1", "date": "2024-01-01", "completed": true }]
    
    -- Communication
    communication_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'as_needed'
    primary_contact_partner UUID, -- Reference to partner's user
    primary_contact_internal UUID, -- Reference to internal user
    
    -- Compliance and Security
    confidentiality_level VARCHAR(20) DEFAULT 'standard', -- 'public', 'internal', 'confidential', 'restricted'
    data_sharing_agreement BOOLEAN DEFAULT FALSE,
    nda_signed BOOLEAN DEFAULT FALSE,
    security_clearance_required BOOLEAN DEFAULT FALSE,
    
    -- Financial (if applicable)
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    billing_frequency VARCHAR(20), -- 'one_time', 'monthly', 'quarterly', 'annually'
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT fk_collaborations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_collaborations_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_collaborations_contact_partner FOREIGN KEY (primary_contact_partner) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_collaborations_contact_internal FOREIGN KEY (primary_contact_internal) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_collaborations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_collaborations_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_collaborations_type CHECK (collaboration_type IN ('assessment', 'audit', 'consultation', 'framework_sharing', 'resource_sharing', 'compliance_review')),
    CONSTRAINT chk_collaborations_status CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    CONSTRAINT chk_collaborations_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_collaborations_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_collaborations_frequency CHECK (communication_frequency IN ('daily', 'weekly', 'monthly', 'as_needed')),
    CONSTRAINT chk_collaborations_confidentiality CHECK (confidentiality_level IN ('public', 'internal', 'confidential', 'restricted')),
    CONSTRAINT chk_collaborations_currency CHECK (LENGTH(currency) = 3)
);

-- =====================================================
-- PARTNER INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL,
    message TEXT,
    
    -- Invitation Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    token VARCHAR(255) UNIQUE NOT NULL, -- Unique invitation token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Response Details
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Resulting Partner (if accepted)
    partner_id UUID,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT fk_invitations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_invitations_type CHECK (partner_type IN ('vendor', 'client', 'auditor', 'regulator', 'strategic', 'consultant')),
    CONSTRAINT chk_invitations_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    CONSTRAINT chk_invitations_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- PARTNER ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    partner_id UUID,
    collaboration_id UUID,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'access_resource', 'share_resource', 'update_collaboration', 'message_sent'
    activity_description TEXT NOT NULL,
    entity_type VARCHAR(50), -- 'assessment', 'framework', 'document', 'organization'
    entity_id UUID,
    
    -- Context
    user_id UUID, -- Who performed the activity
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_activity_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_collaboration FOREIGN KEY (collaboration_id) REFERENCES partner_collaborations(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Partners table indexes
CREATE INDEX IF NOT EXISTS idx_partners_tenant_id ON partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partners_partner_tenant_id ON partners(partner_tenant_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_company_name ON partners(company_name);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

-- Partner collaborations table indexes
CREATE INDEX IF NOT EXISTS idx_collaborations_tenant_id ON partner_collaborations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_partner_id ON partner_collaborations(partner_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_type ON partner_collaborations(collaboration_type);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON partner_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_start_date ON partner_collaborations(start_date);
CREATE INDEX IF NOT EXISTS idx_collaborations_end_date ON partner_collaborations(end_date);
CREATE INDEX IF NOT EXISTS idx_collaborations_created_at ON partner_collaborations(created_at);

-- Partner invitations table indexes
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON partner_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON partner_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON partner_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON partner_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON partner_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON partner_invitations(created_at);

-- Partner activity log table indexes
CREATE INDEX IF NOT EXISTS idx_activity_tenant_id ON partner_activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_partner_id ON partner_activity_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_activity_collaboration_id ON partner_activity_log(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON partner_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON partner_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON partner_activity_log(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_partners_tenant_status ON partners(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_collaborations_partner_status ON partner_collaborations(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_status_expires ON partner_invitations(status, expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all partner tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partners table
CREATE POLICY partners_tenant_isolation ON partners
    FOR ALL
    TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- RLS Policies for partner_collaborations table
CREATE POLICY collaborations_tenant_isolation ON partner_collaborations
    FOR ALL
    TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- RLS Policies for partner_invitations table
CREATE POLICY invitations_tenant_isolation ON partner_invitations
    FOR ALL
    TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- RLS Policies for partner_activity_log table
CREATE POLICY activity_tenant_isolation ON partner_activity_log
    FOR ALL
    TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at 
    BEFORE UPDATE ON partner_collaborations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at 
    BEFORE UPDATE ON partner_invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get partner statistics
CREATE OR REPLACE FUNCTION get_partner_statistics(p_tenant_id UUID)
RETURNS TABLE (
    total_partners INTEGER,
    active_partners INTEGER,
    pending_partners INTEGER,
    total_collaborations INTEGER,
    active_collaborations INTEGER,
    partner_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM partners WHERE tenant_id = p_tenant_id),
        (SELECT COUNT(*)::INTEGER FROM partners WHERE tenant_id = p_tenant_id AND status = 'active'),
        (SELECT COUNT(*)::INTEGER FROM partners WHERE tenant_id = p_tenant_id AND status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM partner_collaborations WHERE tenant_id = p_tenant_id),
        (SELECT COUNT(*)::INTEGER FROM partner_collaborations WHERE tenant_id = p_tenant_id AND status = 'active'),
        (SELECT jsonb_object_agg(partner_type, count) 
         FROM (
             SELECT partner_type, COUNT(*) as count 
             FROM partners 
             WHERE tenant_id = p_tenant_id 
             GROUP BY partner_type
         ) t);
END;
$$ LANGUAGE plpgsql;

-- Function to log partner activity
CREATE OR REPLACE FUNCTION log_partner_activity(
    p_tenant_id UUID,
    p_partner_id UUID,
    p_collaboration_id UUID,
    p_activity_type VARCHAR(50),
    p_activity_description TEXT,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO partner_activity_log (
        tenant_id, partner_id, collaboration_id, activity_type, 
        activity_description, entity_type, entity_id, user_id, metadata
    ) VALUES (
        p_tenant_id, p_partner_id, p_collaboration_id, p_activity_type,
        p_activity_description, p_entity_type, p_entity_id, p_user_id, p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert sample partner types reference data
INSERT INTO partners (
    id, tenant_id, partner_type, status, company_name, email, 
    contact_person, description, created_by
) VALUES 
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1),
    'auditor',
    'active',
    'KSA Audit Partners',
    'contact@ksaaudit.com',
    'Ahmed Al-Rashid',
    'Leading audit firm specializing in compliance and risk management',
    (SELECT id FROM users WHERE email = 'admin@grc-system.com' LIMIT 1)
),
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE tenant_code = 'DEFAULT' LIMIT 1),
    'consultant',
    'active',
    'GRC Consulting Solutions',
    'info@grcconsulting.com',
    'Sarah Johnson',
    'Expert GRC consulting services for financial institutions',
    (SELECT id FROM users WHERE email = 'admin@grc-system.com' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant permissions to application roles
GRANT SELECT, INSERT, UPDATE, DELETE ON partners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON partner_collaborations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON partner_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON partner_activity_log TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE partners IS 'Partner organizations and their relationship details';
COMMENT ON TABLE partner_collaborations IS 'Active collaborations and shared projects with partners';
COMMENT ON TABLE partner_invitations IS 'Partner invitation management and tracking';
COMMENT ON TABLE partner_activity_log IS 'Audit log for all partner-related activities';

COMMENT ON COLUMN partners.partner_type IS 'Type of partnership: vendor, client, auditor, regulator, strategic, consultant';
COMMENT ON COLUMN partners.status IS 'Current status: pending, active, suspended, rejected, terminated';
COMMENT ON COLUMN partners.access_level IS 'Access permissions: read, write, admin';
COMMENT ON COLUMN partner_collaborations.shared_resources IS 'JSON object containing shared resource IDs by type';
COMMENT ON COLUMN partner_collaborations.access_permissions IS 'JSON object defining specific access permissions';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 013: Partner tables created successfully';
    RAISE NOTICE 'Tables created: partners, partner_collaborations, partner_invitations, partner_activity_log';
    RAISE NOTICE 'RLS policies enabled for multi-tenant isolation';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Helper functions created for partner management';
END $$;