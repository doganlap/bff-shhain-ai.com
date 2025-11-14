-- Migration: Fix Schema Mismatches Between APIs and Database Tables
-- Version: 006
-- Date: 2024-12-19
-- Purpose: Align database column names and types with API expectations

-- Fix scheduled_tasks table column naming
ALTER TABLE scheduled_tasks
  RENAME COLUMN next_execution TO next_run_at;

ALTER TABLE scheduled_tasks
  RENAME COLUMN last_execution TO last_run_at;

-- Add any missing columns for scheduled_tasks if needed
DO $$
BEGIN
  -- Add timeout_minutes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'timeout_minutes'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN timeout_minutes INTEGER DEFAULT 30;
  END IF;

  -- Add max_retries if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'max_retries'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN max_retries INTEGER DEFAULT 3;
  END IF;

  -- Add conditions if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'conditions'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN conditions JSONB DEFAULT '{}';
  END IF;

  -- Add retry_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN retry_count INTEGER DEFAULT 0;
  END IF;

  -- Add execution_time if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'execution_time'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN execution_time INTEGER; -- Duration in milliseconds
  END IF;

  -- Add error_message if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_tasks'
    AND column_name = 'error_message'
  ) THEN
    ALTER TABLE scheduled_tasks
    ADD COLUMN error_message TEXT;
  END IF;
END $$;

-- Ensure notifications table has all required columns
DO $$
BEGIN
  -- Check if notifications table exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'notifications'
  ) THEN
    CREATE TABLE notifications (
      id SERIAL PRIMARY KEY,
      recipient_id INTEGER NOT NULL,
      recipient_type VARCHAR(50) NOT NULL DEFAULT 'user',
      type VARCHAR(100) NOT NULL,
      priority VARCHAR(20) DEFAULT 'medium',
      title VARCHAR(255) NOT NULL,
      message TEXT,
      action_url VARCHAR(500),
      action_text VARCHAR(100),
      scheduled_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      channels JSONB DEFAULT '["email"]',
      status VARCHAR(50) DEFAULT 'unread',
      read_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
    CREATE INDEX idx_notifications_status ON notifications(status);
    CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
  END IF;

  -- Check if notification_templates table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'notification_templates'
  ) THEN
    CREATE TABLE notification_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      type VARCHAR(100) NOT NULL,
      priority VARCHAR(20) DEFAULT 'medium',
      title_template VARCHAR(500) NOT NULL,
      message_template TEXT NOT NULL,
      action_url_template VARCHAR(500),
      action_text_template VARCHAR(100),
      default_channels JSONB DEFAULT '["email"]',
      variables JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Ensure subscriptions table has all required columns
DO $$
BEGIN
  -- Check if subscriptions table exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'subscriptions'
  ) THEN
    CREATE TABLE subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      plan_id VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      billing_cycle VARCHAR(20) DEFAULT 'monthly',
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      end_date TIMESTAMP WITH TIME ZONE,
      trial_end TIMESTAMP WITH TIME ZONE,
      next_billing_date TIMESTAMP WITH TIME ZONE,
      auto_renew BOOLEAN DEFAULT true,
      metadata JSONB DEFAULT '{}',
      payment_method_id VARCHAR(255),
      discount_code VARCHAR(100),
      discount_amount DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
  END IF;

  -- Check if billing_plans table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'billing_plans'
  ) THEN
    CREATE TABLE billing_plans (
      id SERIAL PRIMARY KEY,
      plan_id VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      billing_cycle VARCHAR(20) DEFAULT 'monthly',
      features JSONB DEFAULT '[]',
      limits JSONB DEFAULT '{}',
      trial_days INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Add indexes for better performance
DO $$
BEGIN
  -- Add index for scheduled_tasks next_run_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_scheduled_tasks_next_run_at'
  ) THEN
    CREATE INDEX idx_scheduled_tasks_next_run_at ON scheduled_tasks(next_run_at);
  END IF;

  -- Add index for scheduled_tasks status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_scheduled_tasks_status'
  ) THEN
    CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status);
  END IF;

  -- Add index for scheduled_tasks is_active if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_scheduled_tasks_is_active'
  ) THEN
    CREATE INDEX idx_scheduled_tasks_is_active ON scheduled_tasks(is_active);
  END IF;
END $$;

-- Update any existing data to ensure consistency
UPDATE scheduled_tasks
SET status = 'pending'
WHERE status IS NULL;

UPDATE scheduled_tasks
SET is_active = true
WHERE is_active IS NULL;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key from notifications to users if users table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_notifications_recipient'
    ) THEN
      ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_recipient
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Add foreign key from subscriptions to users if users table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_subscriptions_user'
    ) THEN
      ALTER TABLE subscriptions
      ADD CONSTRAINT fk_subscriptions_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Insert some default notification templates
INSERT INTO notification_templates (
  name, type, priority, title_template, message_template,
  action_url_template, action_text_template, variables
) VALUES
(
  'welcome_user', 'system', 'high',
  'Welcome to GRC Assessment Platform!',
  'Hello {{user_name}}, welcome to our GRC Assessment platform. Your account has been successfully created.',
  '/dashboard', 'Go to Dashboard',
  '["user_name"]'
),
(
  'assessment_due', 'reminder', 'medium',
  'Assessment Due: {{assessment_name}}',
  'Your assessment "{{assessment_name}}" is due on {{due_date}}. Please complete it at your earliest convenience.',
  '/assessments/{{assessment_id}}', 'Complete Assessment',
  '["assessment_name", "due_date", "assessment_id"]'
),
(
  'compliance_alert', 'alert', 'high',
  'Compliance Alert: {{regulation_name}}',
  'A compliance issue has been detected for {{regulation_name}}. Immediate attention required.',
  '/compliance/{{regulation_id}}', 'View Details',
  '["regulation_name", "regulation_id"]'
)
ON CONFLICT (name) DO NOTHING;

-- Insert some default billing plans
INSERT INTO billing_plans (
  plan_id, name, description, price, billing_cycle,
  features, limits, trial_days
) VALUES
(
  'basic', 'Basic Plan', 'Essential GRC features for small teams', 29.99, 'monthly',
  '["Basic Assessments", "Up to 5 Users", "Email Support"]',
  '{"users": 5, "assessments": 10, "storage_gb": 1}',
  14
),
(
  'professional', 'Professional Plan', 'Advanced GRC features for growing organizations', 99.99, 'monthly',
  '["Advanced Assessments", "Up to 25 Users", "Phone Support", "API Access"]',
  '{"users": 25, "assessments": 100, "storage_gb": 10}',
  14
),
(
  'enterprise', 'Enterprise Plan', 'Complete GRC solution for large organizations', 299.99, 'monthly',
  '["Unlimited Assessments", "Unlimited Users", "24/7 Support", "Advanced Analytics"]',
  '{"users": -1, "assessments": -1, "storage_gb": 100}',
  30
)
ON CONFLICT (plan_id) DO NOTHING;

-- Migration completion message
DO $$
BEGIN
  RAISE NOTICE 'Migration 006 completed successfully';
  RAISE NOTICE 'Fixed column names: next_execution -> next_run_at, last_execution -> last_run_at';
  RAISE NOTICE 'Added missing columns for scheduled_tasks, notifications, and subscriptions';
  RAISE NOTICE 'Created default notification templates and billing plans';
END $$;
