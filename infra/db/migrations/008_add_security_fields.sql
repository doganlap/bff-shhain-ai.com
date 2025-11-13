-- Migration 009: Add Security Fields for AV Scanning and Secure Storage
-- Adds security-related columns to support AV scanning and controlled storage

-- Add security fields to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS security_scan_result JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS secure_storage_path TEXT,
ADD COLUMN IF NOT EXISTS security_scan_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS access_control_policy JSONB DEFAULT '{}';

-- Create index for security queries
CREATE INDEX IF NOT EXISTS idx_documents_security_scan ON documents(security_scan_date);
CREATE INDEX IF NOT EXISTS idx_documents_secure_storage ON documents(secure_storage_path);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Event information
    event_type VARCHAR(50) NOT NULL, -- av_scan, file_access, quarantine, storage_move
    event_status VARCHAR(20) NOT NULL, -- success, failure, blocked
    event_details JSONB DEFAULT '{}',
    
    -- Security context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    threat_indicators JSONB DEFAULT '[]',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_tenant_id ON security_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_risk_level ON security_audit_log(risk_level);

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_tenant_id UUID,
    p_document_id UUID,
    p_user_id UUID,
    p_event_type VARCHAR(50),
    p_event_status VARCHAR(20),
    p_event_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL,
    p_risk_level VARCHAR(20) DEFAULT 'low',
    p_threat_indicators JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO security_audit_log (
        tenant_id, document_id, user_id, event_type, event_status,
        event_details, ip_address, user_agent, session_id,
        risk_level, threat_indicators
    ) VALUES (
        p_tenant_id, p_document_id, p_user_id, p_event_type, p_event_status,
        p_event_details, p_ip_address, p_user_agent, p_session_id,
        p_risk_level, p_threat_indicators
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get security statistics
CREATE OR REPLACE FUNCTION get_security_stats(p_tenant_id UUID)
RETURNS TABLE(
    total_scans BIGINT,
    clean_files BIGINT,
    threats_detected BIGINT,
    quarantined_files BIGINT,
    secure_storage_files BIGINT,
    last_scan_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN d.security_scan_result IS NOT NULL THEN 1 END) as total_scans,
        COUNT(CASE WHEN d.security_scan_result->>'clean' = 'true' THEN 1 END) as clean_files,
        COUNT(CASE WHEN d.security_scan_result->>'clean' = 'false' THEN 1 END) as threats_detected,
        COUNT(CASE WHEN sal.event_type = 'quarantine' AND sal.event_status = 'success' THEN 1 END) as quarantined_files,
        COUNT(CASE WHEN d.secure_storage_path IS NOT NULL THEN 1 END) as secure_storage_files,
        MAX(d.security_scan_date) as last_scan_date
    FROM documents d
    LEFT JOIN security_audit_log sal ON d.id = sal.document_id
    WHERE d.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    d.tenant_id,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN d.security_scan_result->>'clean' = 'true' THEN 1 END) as clean_documents,
    COUNT(CASE WHEN d.security_scan_result->>'clean' = 'false' THEN 1 END) as threat_documents,
    COUNT(CASE WHEN d.secure_storage_path IS NOT NULL THEN 1 END) as secure_storage_documents,
    AVG(CASE WHEN d.security_scan_result->>'clean' = 'true' THEN 1.0 ELSE 0.0 END) * 100 as clean_percentage,
    MAX(d.security_scan_date) as last_scan_date,
    COUNT(CASE WHEN d.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as documents_last_week
FROM documents d
WHERE d.security_scan_result IS NOT NULL
GROUP BY d.tenant_id;

-- Add comment for documentation
COMMENT ON TABLE security_audit_log IS 'Comprehensive security audit log for document processing and access events';
COMMENT ON FUNCTION log_security_event IS 'Function to log security events with risk assessment';
COMMENT ON FUNCTION get_security_stats IS 'Function to retrieve security statistics for a tenant';
COMMENT ON VIEW security_dashboard IS 'Security dashboard view for monitoring document security status';