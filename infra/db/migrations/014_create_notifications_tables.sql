-- =====================================================
-- Migration: 014 - Create Notifications Tables
-- Description: Multi-channel notification system with templates
-- Date: 2024-11-11
-- =====================================================

-- =====================================================
-- NOTIFICATION TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,

    -- Template Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app', 'webhook'
    category VARCHAR(100), -- 'compliance', 'security', 'general', 'urgent'

    -- Template Content
    subject VARCHAR(500), -- For email/push notifications
    body TEXT NOT NULL,
    html_body TEXT, -- For email notifications

    -- Template Variables
    variables JSONB DEFAULT '{}', -- Available variables for the template

    -- Configuration
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

    -- Delivery Settings
    delivery_settings JSONB DEFAULT '{}', -- Channel-specific settings

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,

    CONSTRAINT notification_templates_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    template_id INTEGER,

    -- Recipient Information
    recipient_id INTEGER, -- User ID (can be NULL for global notifications)
    recipient_type VARCHAR(50) DEFAULT 'user', -- 'user', 'role', 'organization'
    recipient_email VARCHAR(255),

    -- Message Content
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    html_content TEXT,

    -- Classification
    type VARCHAR(50) NOT NULL, -- 'reminder', 'alert', 'info', 'warning', 'error'
    category VARCHAR(100), -- 'assessment', 'compliance', 'security', 'partnership'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

    -- Delivery Configuration
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app', 'webhook'

    -- Status and Tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'

    -- Delivery Information
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,

    -- Retry Information
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional context data
    tags TEXT[], -- For categorization and filtering

    -- External References
    external_id VARCHAR(255), -- Reference to external system
    webhook_url TEXT, -- For webhook notifications
    webhook_response JSONB, -- Store webhook response

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT notifications_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT notifications_template_fk
        FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
);

-- =====================================================
-- NOTIFICATION CHANNELS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_channels (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,

    -- Channel Information
    channel_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'webhook', 'slack'
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    config JSONB NOT NULL DEFAULT '{}', -- Channel-specific configuration

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_verified_at TIMESTAMP WITH TIME ZONE,

    -- Rate Limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT notification_channels_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT unique_channel_per_org
        UNIQUE (organization_id, channel_type, name)
);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    -- Notification Settings
    notification_type VARCHAR(100) NOT NULL,

-- =====================================================
-- INDEXES FOR NOTIFICATIONS
-- =====================================================

-- Performance indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
    ON notifications (recipient_id, recipient_type);

CREATE INDEX IF NOT EXISTS idx_notifications_status
    ON notifications (status);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_organization
    ON notifications (organization_id);

CREATE INDEX IF NOT EXISTS idx_notifications_channel
    ON notifications (channel);

CREATE INDEX IF NOT EXISTS idx_notifications_priority
    ON notifications (priority);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_org_status_created
    ON notifications (organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status
    ON notifications (recipient_id, recipient_type, status);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_organization
    ON notification_templates (organization_id);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type
    ON notification_templates (type);

-- Channel indexes
CREATE INDEX IF NOT EXISTS idx_notification_channels_organization
    ON notification_channels (organization_id);

CREATE INDEX IF NOT EXISTS idx_notification_channels_type
    ON notification_channels (channel_type);

-- Preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user
    ON notification_preferences (user_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_organization
    ON notification_preferences (organization_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_notification_channels_updated_at
    BEFORE UPDATE ON notification_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE notification_templates IS 'Templates for different types of notifications';
COMMENT ON TABLE notifications IS 'Individual notification records with delivery tracking';
COMMENT ON TABLE notification_channels IS 'Available notification delivery channels per organization';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';

COMMENT ON COLUMN notifications.metadata IS 'JSON field for storing additional notification context';
COMMENT ON COLUMN notifications.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN notification_channels.config IS 'Channel-specific configuration (API keys, endpoints, etc.)';
