-- =====================================================
-- Migration: 015 - Create Scheduler Tables
-- Description: AI-powered scheduling and task automation
-- Date: 2024-11-11
-- =====================================================

-- =====================================================
-- SCHEDULED TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    created_by INTEGER,

    -- Task Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL, -- 'report_generation', 'data_sync', 'notification', 'assessment', 'backup'

    -- Scheduling Configuration
    schedule_expression VARCHAR(255), -- Cron expression or custom format
    timezone VARCHAR(100) DEFAULT 'UTC',

    -- Task Parameters
    task_parameters JSONB DEFAULT '{}', -- Task-specific configuration

    -- AI Optimization Settings
    ai_optimization_enabled BOOLEAN DEFAULT false,
    optimization_criteria JSONB DEFAULT '{}', -- Performance criteria for AI optimization

    -- Execution Control
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    max_execution_time INTEGER DEFAULT 3600, -- Maximum execution time in seconds
    retry_policy JSONB DEFAULT '{"max_retries": 3, "retry_delay": 300}',

    -- Dependencies
    depends_on_tasks JSONB DEFAULT '[]', -- Array of task IDs this task depends on

    -- Execution Window
    execution_window_start TIME,
    execution_window_end TIME,
    blackout_periods JSONB DEFAULT '[]', -- Time periods when task should not run

    -- Resource Management
    resource_requirements JSONB DEFAULT '{}', -- CPU, memory, storage requirements
    concurrent_executions_limit INTEGER DEFAULT 1,

    -- Status and Lifecycle
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'disabled', 'archived'
    next_execution TIMESTAMP WITH TIME ZONE,
    last_execution TIMESTAMP WITH TIME ZONE,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT scheduled_tasks_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT scheduled_tasks_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TASK EXECUTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_executions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,

    -- Execution Details
    execution_id VARCHAR(255) UNIQUE NOT NULL, -- Unique identifier for this execution
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'

    -- Timing
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_duration INTEGER, -- Duration in seconds

    -- Execution Context
    triggered_by INTEGER, -- User who triggered manual execution
    trigger_type VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'manual', 'dependency', 'retry'

    -- Results and Logging
    result_data JSONB DEFAULT '{}', -- Execution results and output
    logs TEXT, -- Execution logs
    error_details JSONB, -- Error information if execution failed

    -- Resource Usage
    cpu_usage_avg DECIMAL(5,2), -- Average CPU usage percentage
    memory_usage_max INTEGER, -- Peak memory usage in MB

    -- AI Performance Metrics
    performance_score DECIMAL(5,2), -- AI-calculated performance score
    optimization_suggestions JSONB DEFAULT '[]', -- AI-generated suggestions

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT task_executions_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_executions_triggered_by_fk
        FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- AUTOMATION RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS automation_rules (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    created_by INTEGER,

    -- Rule Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- 'conditional_execution', 'auto_scaling', 'failure_response', 'optimization'

    -- Rule Configuration
    conditions JSONB NOT NULL, -- Conditions that trigger this rule
    actions JSONB NOT NULL, -- Actions to execute when conditions are met

    -- Rule Settings
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,

    -- Execution Tracking
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT automation_rules_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT automation_rules_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- AI SUGGESTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    task_id INTEGER,

    -- Suggestion Details
    suggestion_type VARCHAR(100) NOT NULL, -- 'schedule_optimization', 'resource_optimization', 'dependency_optimization'
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Suggestion Data
    current_configuration JSONB, -- Current task configuration
    suggested_configuration JSONB, -- AI-suggested improvements
    expected_benefits JSONB, -- Predicted improvements (time, cost, reliability)

    -- Analysis Data
    analysis_data JSONB DEFAULT '{}', -- Data used for the suggestion
    confidence_score DECIMAL(3,2), -- AI confidence in the suggestion (0.00 to 1.00)

    -- Implementation
    implementation_effort VARCHAR(50), -- 'low', 'medium', 'high'
    implementation_instructions TEXT,

    -- Status and Review
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'implemented'
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,

    -- Impact Tracking
    implemented_at TIMESTAMP WITH TIME ZONE,
    measured_impact JSONB, -- Actual results after implementation

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT ai_suggestions_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT ai_suggestions_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT ai_suggestions_reviewed_by_fk
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TASK DEPENDENCIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    depends_on_task_id INTEGER NOT NULL,

    -- Dependency Configuration
    dependency_type VARCHAR(50) DEFAULT 'completion', -- 'completion', 'success', 'failure'
    delay_after_dependency INTEGER DEFAULT 0, -- Delay in seconds after dependency is met

    -- Condition Checking
    condition_expression VARCHAR(500), -- Additional condition logic

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT task_dependencies_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_dependencies_depends_on_fk
        FOREIGN KEY (depends_on_task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_dependencies_unique
        UNIQUE (task_id, depends_on_task_id)
);

-- =====================================================
-- INDEXES FOR SCHEDULER TABLES
-- =====================================================

-- Performance indexes for scheduled_tasks
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_organization
    ON scheduled_tasks (organization_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status
    ON scheduled_tasks (status);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_execution
    ON scheduled_tasks (next_execution) WHERE next_execution IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type
    ON scheduled_tasks (type);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active
    ON scheduled_tasks (is_active, status);

-- Execution tracking indexes
CREATE INDEX IF NOT EXISTS idx_task_executions_task
    ON task_executions (task_id);

CREATE INDEX IF NOT EXISTS idx_task_executions_status
    ON task_executions (status);

CREATE INDEX IF NOT EXISTS idx_task_executions_scheduled_for
    ON task_executions (scheduled_for DESC);

CREATE INDEX IF NOT EXISTS idx_task_executions_task_status
    ON task_executions (task_id, status, scheduled_for DESC);

CREATE INDEX IF NOT EXISTS idx_task_executions_execution_id
    ON task_executions (execution_id);

-- Automation rules indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_organization
    ON automation_rules (organization_id);

CREATE INDEX IF NOT EXISTS idx_automation_rules_type
    ON automation_rules (rule_type);

CREATE INDEX IF NOT EXISTS idx_automation_rules_active
    ON automation_rules (is_active, priority);

-- AI suggestions indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_organization
    ON ai_suggestions (organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_task
    ON ai_suggestions (task_id);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type
    ON ai_suggestions (suggestion_type);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status
    ON ai_suggestions (status);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confidence
    ON ai_suggestions (confidence_score DESC);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task
    ON task_dependencies (task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on
    ON task_dependencies (depends_on_task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_active
    ON task_dependencies (is_active);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduler_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

CREATE TRIGGER trigger_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

-- Function to calculate next execution time
CREATE OR REPLACE FUNCTION calculate_next_execution(
    task_id_param INTEGER,
    schedule_expr VARCHAR,
    timezone_param VARCHAR DEFAULT 'UTC'
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- This is a simplified calculation - in practice, you'd implement full cron parsing
    -- For now, return next hour as a placeholder
    SELECT (NOW() + INTERVAL '1 hour') INTO next_time;

    -- Update the task's next_execution time
    UPDATE scheduled_tasks
    SET next_execution = next_time, updated_at = NOW()
    WHERE id = task_id_param;

    RETURN next_time;
END;
$$ LANGUAGE plpgsql;

-- Function to check task dependencies
CREATE OR REPLACE FUNCTION check_task_dependencies(task_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    dependency_met BOOLEAN DEFAULT TRUE;
    dep_record RECORD;
BEGIN
    FOR dep_record IN
        SELECT depends_on_task_id, dependency_type
        FROM task_dependencies
        WHERE task_id = task_id_param AND is_active = true
    LOOP
        -- Check if dependency is met based on type
        IF dep_record.dependency_type = 'completion' THEN
            IF NOT EXISTS (
                SELECT 1 FROM task_executions
                WHERE task_id = dep_record.depends_on_task_id
                AND status IN ('completed', 'failed')
                AND scheduled_for >= CURRENT_DATE
            ) THEN
                dependency_met := FALSE;
                EXIT;
            END IF;
        ELSIF dep_record.dependency_type = 'success' THEN
            IF NOT EXISTS (
                SELECT 1 FROM task_executions
                WHERE task_id = dep_record.depends_on_task_id
                AND status = 'completed'
                AND scheduled_for >= CURRENT_DATE
            ) THEN
                dependency_met := FALSE;
                EXIT;
            END IF;
        END IF;
    END LOOP;

    RETURN dependency_met;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE scheduled_tasks IS 'AI-powered task scheduling and management';
COMMENT ON TABLE task_executions IS 'Execution history and performance tracking';
COMMENT ON TABLE automation_rules IS 'Conditional automation rules and responses';
COMMENT ON TABLE ai_suggestions IS 'AI-generated optimization suggestions';
COMMENT ON TABLE task_dependencies IS 'Task dependency relationships';

COMMENT ON COLUMN scheduled_tasks.task_parameters IS 'JSON configuration for task execution';
COMMENT ON COLUMN scheduled_tasks.ai_optimization_enabled IS 'Whether AI should optimize this task';
COMMENT ON COLUMN task_executions.performance_score IS 'AI-calculated execution performance score';
COMMENT ON COLUMN ai_suggestions.confidence_score IS 'AI confidence in suggestion (0.00-1.00)';

-- =====================================================
-- TASK EXECUTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,

    -- Execution Information
    execution_id VARCHAR(255), -- Unique execution identifier
    trigger_type VARCHAR(50) NOT NULL, -- 'scheduled', 'manual', 'dependency', 'api'
    triggered_by UUID, -- User who triggered manual execution

    -- Execution Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'timeout', 'cancelled'

    -- Timing Information
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds

    -- Execution Data
    input_data JSONB DEFAULT '{}', -- Input parameters for this execution
    output_data JSONB DEFAULT '{}', -- Results and output data
    error_details TEXT, -- Error message if execution failed

    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0,
    progress_details JSONB DEFAULT '{}',

    -- Resource Usage
    cpu_usage_avg DECIMAL(5,2),
    memory_usage_mb INTEGER,

    -- Logs and Debugging
    execution_logs TEXT[], -- Array of log entries
    debug_info JSONB DEFAULT '{}',

    -- AI Analysis
    ai_analysis JSONB DEFAULT '{}', -- AI insights about execution
    performance_score DECIMAL(3,2), -- AI-calculated performance score

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT task_executions_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_executions_triggered_by_fk
        FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- AUTOMATION RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    created_by UUID,

    -- Rule Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'condition', 'schedule_optimization', 'dependency', 'failure_handling'

    -- Rule Configuration
    conditions JSONB NOT NULL, -- Conditions that trigger the rule
    actions JSONB NOT NULL, -- Actions to take when conditions are met

    -- Scope
    applies_to_tasks TEXT[], -- Array of task IDs or patterns
    applies_to_types TEXT[], -- Array of task types

    -- Rule Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority

    -- AI Enhancement
    is_ai_generated BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(3,2), -- Confidence score for AI-generated rules

    -- Execution Tracking
    executions_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT automation_rules_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT automation_rules_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- AI SUGGESTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    task_id UUID,

    -- Suggestion Information
    suggestion_type VARCHAR(50) NOT NULL, -- 'optimization', 'schedule_change', 'dependency', 'config_update'
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- AI Analysis
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    potential_impact VARCHAR(20), -- 'low', 'medium', 'high'
    impact_metrics JSONB DEFAULT '{}', -- Estimated improvements

    -- Suggestion Data
    current_config JSONB, -- Current task configuration
    suggested_config JSONB, -- Suggested changes
    reasoning TEXT, -- AI explanation for the suggestion

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'implemented', 'dismissed', 'expired'

    -- User Actions
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    implementation_notes TEXT,

    -- Validation
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT ai_suggestions_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT ai_suggestions_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT ai_suggestions_reviewed_by_fk
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TASK DEPENDENCIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    depends_on_task_id UUID NOT NULL,

    -- Dependency Configuration
    dependency_type VARCHAR(50) DEFAULT 'completion', -- 'completion', 'success', 'failure', 'specific_output'
    condition_config JSONB DEFAULT '{}', -- Specific conditions for dependency

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT task_dependencies_task_fk
        FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_dependencies_depends_on_fk
        FOREIGN KEY (depends_on_task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    CONSTRAINT unique_task_dependency
        UNIQUE (task_id, depends_on_task_id)
);

-- =====================================================
-- INDEXES FOR AI SCHEDULER
-- =====================================================

-- Performance indexes for scheduled tasks
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_organization
    ON scheduled_tasks (organization_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status
    ON scheduled_tasks (status);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_execution
    ON scheduled_tasks (next_execution_at) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type
    ON scheduled_tasks (type);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_priority
    ON scheduled_tasks (priority);

-- Task executions indexes
CREATE INDEX IF NOT EXISTS idx_task_executions_task_id
    ON task_executions (task_id);

CREATE INDEX IF NOT EXISTS idx_task_executions_status
    ON task_executions (status);

CREATE INDEX IF NOT EXISTS idx_task_executions_started_at
    ON task_executions (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_executions_task_status
    ON task_executions (task_id, status);

-- Automation rules indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_organization
    ON automation_rules (organization_id);

CREATE INDEX IF NOT EXISTS idx_automation_rules_active
    ON automation_rules (is_active, priority);

-- AI suggestions indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_organization
    ON ai_suggestions (organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_task
    ON ai_suggestions (task_id);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status
    ON ai_suggestions (status);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confidence
    ON ai_suggestions (confidence_score DESC);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task
    ON task_dependencies (task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on
    ON task_dependencies (depends_on_task_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduler_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

CREATE TRIGGER trigger_task_executions_updated_at
    BEFORE UPDATE ON task_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

CREATE TRIGGER trigger_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

CREATE TRIGGER trigger_ai_suggestions_updated_at
    BEFORE UPDATE ON ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduler_updated_at();

-- Function to update task statistics after execution
CREATE OR REPLACE FUNCTION update_task_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE scheduled_tasks
    SET
        last_execution_at = NEW.completed_at,
        last_execution_status = NEW.status,
        last_execution_duration = NEW.duration,
        total_executions = total_executions + 1,
        successful_executions = CASE WHEN NEW.status = 'success'
            THEN successful_executions + 1
            ELSE successful_executions END,
        failed_executions = CASE WHEN NEW.status IN ('failed', 'timeout')
            THEN failed_executions + 1
            ELSE failed_executions END,
        updated_at = NOW()
    WHERE id = NEW.task_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task statistics when execution completes
CREATE TRIGGER trigger_update_task_statistics
    AFTER UPDATE OF status ON task_executions
    FOR EACH ROW
    WHEN (NEW.status IN ('success', 'failed', 'timeout', 'cancelled') AND OLD.status != NEW.status)
    EXECUTE FUNCTION update_task_statistics();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE scheduled_tasks IS 'AI-powered scheduled tasks with optimization and learning';
COMMENT ON TABLE task_executions IS 'Individual task execution records with performance tracking';
COMMENT ON TABLE automation_rules IS 'Rules for automated task management and optimization';
COMMENT ON TABLE ai_suggestions IS 'AI-generated suggestions for task optimization';
COMMENT ON TABLE task_dependencies IS 'Task dependency relationships and conditions';

COMMENT ON COLUMN scheduled_tasks.schedule IS 'Schedule configuration: cron, interval, or trigger-based';
COMMENT ON COLUMN scheduled_tasks.task_config IS 'Task-specific parameters and settings';
COMMENT ON COLUMN scheduled_tasks.ai_suggestions IS 'AI-generated optimization suggestions';
COMMENT ON COLUMN task_executions.ai_analysis IS 'AI insights about execution performance';
COMMENT ON COLUMN automation_rules.conditions IS 'Conditions that trigger the automation rule';
COMMENT ON COLUMN automation_rules.actions IS 'Actions to take when rule conditions are met';
