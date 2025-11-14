-- Migration: 014_add_tenant_settings.sql
-- Description: Add feature_flags and settings columns to tenants table for settings API
-- Date: 2025-01-10

BEGIN;

-- ==========================================
-- ADD SETTINGS COLUMNS TO TENANTS TABLE
-- ==========================================

-- Add feature_flags column (JSONB for flexible feature flag management)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{}';

-- Add settings column (JSONB for flexible tenant settings)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Index for feature_flags JSONB queries
CREATE INDEX IF NOT EXISTS idx_tenants_feature_flags ON tenants USING GIN(feature_flags);

-- Index for settings JSONB queries
CREATE INDEX IF NOT EXISTS idx_tenants_settings ON tenants USING GIN(settings);

-- ==========================================
-- ADD COMMENTS
-- ==========================================

COMMENT ON COLUMN tenants.feature_flags IS 'JSONB object containing tenant-specific feature flags (e.g., {"ai.agents": true, "billing": false})';
COMMENT ON COLUMN tenants.settings IS 'JSONB object containing tenant-specific settings (e.g., {"theme": "dark", "language": "ar", "notifications": {...}})';

-- ==========================================
-- INITIALIZE DEFAULT VALUES FOR EXISTING TENANTS
-- ==========================================

-- Set default feature flags for existing tenants (if any)
UPDATE tenants 
SET feature_flags = '{
    "risk.matrix": true,
    "evidence.ocr": true,
    "workflow.builder": true,
    "ai.agents": false,
    "billing": false,
    "notifications.realtime": true,
    "hijri.calendar": true,
    "export.excel": true,
    "multi.tenant": true,
    "partner.collaboration": true,
    "document.processing": true,
    "compliance.reporting": true,
    "assessment.templates": true,
    "framework.import": true,
    "sector.intelligence": true,
    "advanced.analytics": false,
    "api.access": true,
    "mobile.app": false
}'::jsonb
WHERE feature_flags = '{}' OR feature_flags IS NULL;

-- Set default settings for existing tenants (if any)
UPDATE tenants 
SET settings = '{
    "theme": "light",
    "language": "en",
    "timezone": "Asia/Riyadh",
    "date_format": "YYYY-MM-DD",
    "currency": "SAR",
    "notifications": {
        "email": true,
        "sms": false,
        "push": true,
        "assessment_reminders": true,
        "compliance_alerts": true,
        "system_updates": false
    },
    "security": {
        "session_timeout": 30,
        "password_expiry": 90,
        "two_factor_required": false,
        "ip_whitelist_enabled": false
    },
    "compliance": {
        "auto_archive_completed": true,
        "evidence_retention_days": 2555,
        "assessment_reminder_days": 7,
        "framework_auto_update": true
    }
}'::jsonb
WHERE settings = '{}' OR settings IS NULL;

COMMIT;

-- ==========================================
-- VERIFICATION
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 014: Tenant settings columns added successfully';
    RAISE NOTICE 'Added columns: feature_flags (JSONB), settings (JSONB)';
    RAISE NOTICE 'Indexes created for JSONB queries';
    RAISE NOTICE 'Default values initialized for existing tenants';
END $$;
