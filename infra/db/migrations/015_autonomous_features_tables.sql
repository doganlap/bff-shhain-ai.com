-- ==========================================
-- 🤖 AUTONOMOUS FEATURES DATABASE SCHEMA
-- ==========================================
-- Migration 015: Add tables for AI-powered autonomous features
-- Created: 2024-01-10
-- Purpose: Support AI scheduler, RAG system, predictive analytics, and smart notifications

-- ==========================================
-- AI SCHEDULER SERVICE TABLES
-- ==========================================

-- AI optimization log for tracking autonomous decisions
CREATE TABLE IF NOT EXISTS ai_optimization_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID,
    user_id UUID,
    optimization_type VARCHAR(50) NOT NULL, -- 'auto_assignment', 'priority_adjustment', 'workload_balancing'
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    reasoning TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_ai_optimization_log_task_id (task_id),
    INDEX idx_ai_optimization_log_user_id (user_id),
    INDEX idx_ai_optimization_log_type (optimization_type),
    INDEX idx_ai_optimization_log_created_at (created_at)
);

-- AI optimization reports for daily insights
CREATE TABLE IF NOT EXISTS ai_optimization_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(report_date),
    
    -- Indexes
    INDEX idx_ai_optimization_reports_date (report_date)
);

-- Enhanced assessment_workflow table with AI fields
ALTER TABLE assessment_workflow 
ADD COLUMN IF NOT EXISTS estimated_completion_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_assignment_confidence DECIMAL(3,2) CHECK (ai_assignment_confidence >= 0 AND ai_assignment_confidence <= 1),
ADD COLUMN IF NOT EXISTS ai_assignment_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_predicted_score INTEGER CHECK (ai_predicted_score >= 0 AND ai_predicted_score <= 100);

-- ==========================================
-- RAG SYSTEM TABLES
-- ==========================================

-- Document chunks for RAG processing
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_size INTEGER NOT NULL,
    page_start INTEGER,
    page_end INTEGER,
    metadata JSONB DEFAULT '{}',
    search_vector tsvector,
    embedding_vector DECIMAL[] DEFAULT NULL, -- For vector embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(document_id, chunk_index),
    
    -- Indexes
    INDEX idx_document_chunks_document_id (document_id),
    INDEX idx_document_chunks_search_vector USING gin(search_vector),
    INDEX idx_document_chunks_page_range (page_start, page_end)
);

-- RAG query log for analytics and improvement
CREATE TABLE IF NOT EXISTS rag_query_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    question TEXT NOT NULL,
    response_preview TEXT, -- First 500 chars of response
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    source_count INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_rag_query_log_tenant_id (tenant_id),
    INDEX idx_rag_query_log_created_at (created_at),
    INDEX idx_rag_query_log_confidence (confidence)
);

-- Vector embeddings metadata
CREATE TABLE IF NOT EXISTS embedding_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    dimension_size INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(model_name, model_version)
);

-- ==========================================
-- PREDICTIVE ANALYTICS TABLES
-- ==========================================

-- Predictive forecasts storage
CREATE TABLE IF NOT EXISTS predictive_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    forecast_type VARCHAR(50) NOT NULL, -- 'risk_forecast', 'completion_prediction', 'resource_forecast'
    forecast_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    forecast_period INTEGER, -- days
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_predictive_forecasts_org_id (organization_id),
    INDEX idx_predictive_forecasts_type (forecast_type),
    INDEX idx_predictive_forecasts_generated_at (generated_at)
);

-- Anomaly detection results
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL, -- 'score_outlier', 'pattern_anomaly', 'temporal_anomaly'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    affected_entity_type VARCHAR(50), -- 'assessment', 'control', 'user'
    affected_entity_id UUID,
    anomaly_data JSONB DEFAULT '{}',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Indexes
    INDEX idx_anomaly_detections_org_id (organization_id),
    INDEX idx_anomaly_detections_type (anomaly_type),
    INDEX idx_anomaly_detections_severity (severity),
    INDEX idx_anomaly_detections_detected_at (detected_at)
);

-- ==========================================
-- SMART NOTIFICATIONS ENHANCEMENTS
-- ==========================================

-- Enhanced notifications table with AI fields
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority_score INTEGER CHECK (priority_score >= 0 AND priority_score <= 100),
ADD COLUMN IF NOT EXISTS delivery_channels JSONB DEFAULT '["in_app"]',
ADD COLUMN IF NOT EXISTS context_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_results JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_digest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS digest_notifications UUID[];

-- User notification preferences for AI personalization
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    channel_preferences JSONB DEFAULT '{}', -- {'email': true, 'sms': false, 'in_app': true}
    frequency_preference VARCHAR(20) DEFAULT 'normal', -- 'immediate', 'batched', 'daily_digest'
    quiet_hours JSONB DEFAULT '{}', -- {'start': 22, 'end': 7}
    priority_threshold VARCHAR(20) DEFAULT 'medium', -- minimum priority to receive
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, notification_type),
    
    -- Indexes
    INDEX idx_user_notification_prefs_user_id (user_id),
    INDEX idx_user_notification_prefs_type (notification_type)
);

-- ==========================================
-- AUTONOMOUS ASSESSMENT GENERATION
-- ==========================================

-- Enhanced assessment_responses with AI predictions
ALTER TABLE assessment_responses 
ADD COLUMN IF NOT EXISTS ai_generated_question BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_predicted_score INTEGER CHECK (ai_predicted_score >= 0 AND ai_predicted_score <= 100),
ADD COLUMN IF NOT EXISTS ai_prediction_confidence DECIMAL(3,2) CHECK (ai_prediction_confidence >= 0 AND ai_prediction_confidence <= 1),
ADD COLUMN IF NOT EXISTS ai_prediction_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_completion_minutes INTEGER;

-- Enhanced assessments with AI generation metadata
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_generation_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(20) CHECK (complexity_level IN ('low', 'medium', 'high'));

-- AI-generated control recommendations
CREATE TABLE IF NOT EXISTS ai_control_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id UUID REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    control_id UUID REFERENCES grc_controls(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'priority_adjustment', 'implementation_guidance', 'evidence_suggestion'
    recommendation_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    
    -- Indexes
    INDEX idx_ai_control_recommendations_org_id (organization_id),
    INDEX idx_ai_control_recommendations_framework_id (framework_id),
    INDEX idx_ai_control_recommendations_control_id (control_id),
    INDEX idx_ai_control_recommendations_type (recommendation_type),
    INDEX idx_ai_control_recommendations_status (status)
);

-- ==========================================
-- AUTOMATED REMEDIATION TRACKING
-- ==========================================

-- Remediation suggestions and tracking
CREATE TABLE IF NOT EXISTS automated_remediations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID REFERENCES grc_controls(id) ON DELETE CASCADE,
    remediation_type VARCHAR(50) NOT NULL, -- 'policy_update', 'process_improvement', 'technical_fix', 'training'
    issue_description TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    estimated_effort_hours INTEGER,
    estimated_cost DECIMAL(10,2),
    required_skills TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'in_progress', 'completed', 'rejected')),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    
    -- Indexes
    INDEX idx_automated_remediations_org_id (organization_id),
    INDEX idx_automated_remediations_assessment_id (assessment_id),
    INDEX idx_automated_remediations_control_id (control_id),
    INDEX idx_automated_remediations_status (status),
    INDEX idx_automated_remediations_priority (priority_level)
);

-- ==========================================
-- CHATBOT AND AI ASSISTANT
-- ==========================================

-- Chatbot conversations and learning
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    conversation_type VARCHAR(50) NOT NULL, -- 'grc_guidance', 'assessment_help', 'compliance_question'
    messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
    context_data JSONB DEFAULT '{}',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_ai_chat_conversations_user_id (user_id),
    INDEX idx_ai_chat_conversations_tenant_id (tenant_id),
    INDEX idx_ai_chat_conversations_type (conversation_type),
    INDEX idx_ai_chat_conversations_started_at (started_at)
);

-- ==========================================
-- PERFORMANCE AND ANALYTICS
-- ==========================================

-- AI system performance metrics
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL, -- 'ai_scheduler', 'rag_engine', 'predictive_analytics', 'smart_notifications'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit VARCHAR(20),
    measurement_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    
    -- Indexes
    INDEX idx_ai_performance_metrics_service (service_name),
    INDEX idx_ai_performance_metrics_name (metric_name),
    INDEX idx_ai_performance_metrics_time (measurement_time)
);

-- ==========================================
-- TRIGGERS FOR SEARCH VECTORS
-- ==========================================

-- Update search vector for document chunks
CREATE OR REPLACE FUNCTION update_document_chunk_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.chunk_text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_chunks_search_vector_update
    BEFORE INSERT OR UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_document_chunk_search_vector();

-- ==========================================
-- FUNCTIONS FOR AI FEATURES
-- ==========================================

-- Function to log AI optimization events
CREATE OR REPLACE FUNCTION log_ai_optimization(
    p_task_id UUID,
    p_user_id UUID,
    p_optimization_type VARCHAR(50),
    p_confidence DECIMAL(3,2),
    p_reasoning TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    optimization_id UUID;
BEGIN
    INSERT INTO ai_optimization_log (
        task_id, user_id, optimization_type, confidence, reasoning, metadata
    ) VALUES (
        p_task_id, p_user_id, p_optimization_type, p_confidence, p_reasoning, p_metadata
    ) RETURNING id INTO optimization_id;
    
    RETURN optimization_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user notification engagement score
CREATE OR REPLACE FUNCTION calculate_notification_engagement_score(p_user_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    engagement_score DECIMAL(3,2);
    total_notifications INTEGER;
    read_notifications INTEGER;
    clicked_notifications INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END)
    INTO total_notifications, read_notifications, clicked_notifications
    FROM notifications
    WHERE recipient_user_id = p_user_id
      AND sent_at > NOW() - INTERVAL '3 months';
    
    IF total_notifications = 0 THEN
        RETURN 0.5; -- Default score for new users
    END IF;
    
    engagement_score := (
        (read_notifications::DECIMAL / total_notifications) * 0.7 +
        (clicked_notifications::DECIMAL / total_notifications) * 0.3
    );
    
    RETURN LEAST(1.0, GREATEST(0.0, engagement_score));
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Additional indexes for AI features
CREATE INDEX IF NOT EXISTS idx_assessments_ai_generated ON assessments(ai_generated) WHERE ai_generated = true;
CREATE INDEX IF NOT EXISTS idx_assessment_responses_ai_predicted ON assessment_responses(ai_predicted_score) WHERE ai_predicted_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_ai_processed ON notifications(ai_processed) WHERE ai_processed = true;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_optimization_log_composite ON ai_optimization_log(optimization_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_query_log_composite ON rag_query_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_forecasts_composite ON predictive_forecasts(organization_id, forecast_type, generated_at DESC);

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE ai_optimization_log IS 'Tracks all AI-powered optimization decisions and their outcomes';
COMMENT ON TABLE ai_optimization_reports IS 'Daily reports generated by AI systems with insights and recommendations';
COMMENT ON TABLE document_chunks IS 'Text chunks from documents for RAG processing and vector search';
COMMENT ON TABLE rag_query_log IS 'Logs all RAG queries for analytics and system improvement';
COMMENT ON TABLE predictive_forecasts IS 'Stores AI-generated predictions and forecasts for organizations';
COMMENT ON TABLE anomaly_detections IS 'Records detected anomalies in compliance data and their resolution';
COMMENT ON TABLE user_notification_preferences IS 'User preferences for AI-powered notification personalization';
COMMENT ON TABLE ai_control_recommendations IS 'AI-generated recommendations for GRC controls and implementations';
COMMENT ON TABLE automated_remediations IS 'Automated remediation suggestions and tracking';
COMMENT ON TABLE ai_chat_conversations IS 'Chatbot conversations for learning and improvement';
COMMENT ON TABLE ai_performance_metrics IS 'Performance metrics for all AI services';

-- ==========================================
-- GRANTS AND PERMISSIONS
-- ==========================================

-- Grant appropriate permissions (adjust based on your user roles)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO grc_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO grc_app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO grc_app_user;

-- ==========================================
-- MIGRATION COMPLETION
-- ==========================================

-- Insert migration record
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('015_autonomous_features_tables', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 015: Autonomous Features Tables - COMPLETED at %', CURRENT_TIMESTAMP;
END $$;
