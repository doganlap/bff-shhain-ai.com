-- ============================================================
-- GRC MASTER DATABASE SEED SCRIPT
-- Populating shahin_ksa_compliance with comprehensive data
-- ============================================================

\c shahin_ksa_compliance

-- ============================================================
-- 1. USERS
-- ============================================================
INSERT INTO users (username, email, password_hash, role, full_name, department, phone, is_active) VALUES
('admin', 'admin@grc-master.com', '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK', 'admin', 'System Administrator', 'IT', '+966501234567', true),
('jsmith', 'jsmith@company.com', '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK', 'manager', 'John Smith', 'Compliance', '+966502345678', true),
('mjones', 'mjones@company.com', '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK', 'auditor', 'Mary Jones', 'Internal Audit', '+966503456789', true),
('rbrown', 'rbrown@company.com', '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK', 'analyst', 'Robert Brown', 'Risk Management', '+966504567890', true),
('sdavis', 'sdavis@company.com', '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK', 'analyst', 'Sarah Davis', 'Compliance', '+966505678901', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 2. ORGANIZATIONS
-- ============================================================
INSERT INTO organizations (name, sector, industry, country, city, contact_email, contact_phone, status) VALUES
('Saudi Banking Corp', 'Financial Services', 'Banking', 'Saudi Arabia', 'Riyadh', 'info@sabc.sa', '+966112345678', 'active'),
('Gulf Oil & Gas Ltd', 'Energy', 'Oil & Gas', 'Saudi Arabia', 'Dhahran', 'contact@gulfog.sa', '+966133456789', 'active'),
('Kingdom Healthcare', 'Healthcare', 'Hospital', 'Saudi Arabia', 'Jeddah', 'info@khealth.sa', '+966122345678', 'active'),
('Arabian Telecom', 'Technology', 'Telecommunications', 'Saudi Arabia', 'Riyadh', 'support@atelecom.sa', '+966114567890', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. TENANTS
-- ============================================================
INSERT INTO tenants (id, name, sector, industry, contact_email, contact_phone, status, subscription_tier) VALUES
(gen_random_uuid(), 'Saudi Banking Corp', 'Financial Services', 'Banking', 'admin@sabc.sa', '+966112345678', 'active', 'enterprise'),
(gen_random_uuid(), 'Gulf Oil & Gas Ltd', 'Energy', 'Oil & Gas', 'admin@gulfog.sa', '+966133456789', 'active', 'professional'),
(gen_random_uuid(), 'Kingdom Healthcare', 'Healthcare', 'Hospital', 'admin@khealth.sa', '+966122345678', 'active', 'professional')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. FRAMEWORKS (Already exists, adding more)
-- ============================================================
INSERT INTO frameworks (name, version, description, category, applicability, status) VALUES
('ISO 27001:2022', '2022', 'Information Security Management System', 'Security', 'All Organizations', 'active'),
('SOX', '2002', 'Sarbanes-Oxley Act - Financial Controls', 'Financial', 'Public Companies', 'active'),
('GDPR', '2018', 'General Data Protection Regulation', 'Privacy', 'EU Data Processing', 'active'),
('NIST CSF', 'v1.1', 'Cybersecurity Framework', 'Security', 'All Organizations', 'active'),
('PCI DSS', 'v4.0', 'Payment Card Industry Data Security Standard', 'Financial', 'Payment Processing', 'active'),
('SAMA Cybersecurity Framework', '2021', 'Saudi Arabian Monetary Authority Framework', 'Financial', 'Saudi Financial Institutions', 'active'),
('NCA ECC', '2022', 'National Cybersecurity Authority Essential Controls', 'Security', 'Saudi Organizations', 'active'),
('HIPAA', '1996', 'Health Insurance Portability and Accountability Act', 'Healthcare', 'Healthcare Providers', 'active')
ON CONFLICT (name, version) DO NOTHING;

-- ============================================================
-- 5. GRC CONTROLS (More comprehensive)
-- ============================================================
INSERT INTO grc_controls (control_id, control_name, control_description, control_category, risk_level, implementation_status) VALUES
('AC-001', 'Access Control Policy', 'Establish and maintain access control policies', 'Access Control', 'high', 'implemented'),
('AC-002', 'Account Management', 'Manage information system accounts', 'Access Control', 'high', 'implemented'),
('AC-003', 'Least Privilege', 'Enforce principle of least privilege', 'Access Control', 'high', 'in_progress'),
('IA-001', 'Identification and Authentication', 'Uniquely identify and authenticate users', 'Identity Management', 'critical', 'implemented'),
('IA-002', 'Multi-Factor Authentication', 'Implement MFA for privileged accounts', 'Identity Management', 'critical', 'implemented'),
('SC-001', 'Network Security', 'Protect network communications', 'System Security', 'high', 'implemented'),
('SC-002', 'Encryption', 'Encrypt data at rest and in transit', 'System Security', 'critical', 'implemented'),
('AU-001', 'Audit Logging', 'Enable comprehensive audit logging', 'Audit & Accountability', 'high', 'implemented'),
('AU-002', 'Audit Review', 'Regularly review audit logs', 'Audit & Accountability', 'medium', 'in_progress'),
('IR-001', 'Incident Response Plan', 'Establish incident response procedures', 'Incident Response', 'high', 'implemented'),
('IR-002', 'Incident Reporting', 'Report security incidents promptly', 'Incident Response', 'high', 'implemented'),
('BC-001', 'Business Continuity Plan', 'Maintain business continuity planning', 'Business Continuity', 'critical', 'implemented'),
('DR-001', 'Disaster Recovery', 'Establish disaster recovery procedures', 'Disaster Recovery', 'critical', 'in_progress'),
('RA-001', 'Risk Assessment', 'Conduct regular risk assessments', 'Risk Management', 'high', 'implemented'),
('RA-002', 'Vulnerability Management', 'Identify and remediate vulnerabilities', 'Risk Management', 'high', 'in_progress')
ON CONFLICT (control_id) DO NOTHING;

-- ============================================================
-- 6. ASSESSMENTS
-- ============================================================
INSERT INTO assessments (name, description, framework_id, assessment_type, status, scheduled_date, due_date, completion_date, assigned_to, progress)
SELECT 
    'Q1 2025 ISO 27001 Assessment',
    'Quarterly compliance assessment for ISO 27001',
    f.id,
    'compliance',
    'in_progress',
    '2025-01-15',
    '2025-03-31',
    NULL,
    u.id,
    45
FROM frameworks f
CROSS JOIN users u
WHERE f.name = 'ISO 27001:2022' AND u.username = 'jsmith'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO assessments (name, description, framework_id, assessment_type, status, scheduled_date, due_date, completion_date, assigned_to, progress)
SELECT 
    'SAMA Cybersecurity Compliance Review',
    'Annual SAMA framework compliance review',
    f.id,
    'compliance',
    'scheduled',
    '2025-02-01',
    '2025-04-30',
    NULL,
    u.id,
    0
FROM frameworks f
CROSS JOIN users u
WHERE f.name = 'SAMA Cybersecurity Framework' AND u.username = 'mjones'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO assessments (name, description, framework_id, assessment_type, status, scheduled_date, due_date, completion_date, assigned_to, progress)
SELECT 
    'PCI DSS v4.0 Audit',
    'Payment card security audit',
    f.id,
    'audit',
    'completed',
    '2024-10-01',
    '2024-12-31',
    '2024-12-15',
    u.id,
    100
FROM frameworks f
CROSS JOIN users u
WHERE f.name = 'PCI DSS' AND u.username = 'mjones'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. TASKS
-- ============================================================
INSERT INTO tasks (title, description, status, priority, assigned_to, due_date, tags, created_by)
SELECT 
    'Review Access Control Policies',
    'Review and update access control policies per ISO 27001',
    'in_progress',
    'high',
    u1.id,
    CURRENT_DATE + INTERVAL '7 days',
    '["iso27001", "access-control", "policy"]'::jsonb,
    u2.id
FROM users u1
CROSS JOIN users u2
WHERE u1.username = 'sdavis' AND u2.username = 'jsmith'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, priority, assigned_to, due_date, tags, created_by)
SELECT 
    'Conduct Vulnerability Scan',
    'Quarterly vulnerability assessment of all systems',
    'pending',
    'critical',
    u1.id,
    CURRENT_DATE + INTERVAL '3 days',
    '["security", "vulnerability", "scan"]'::jsonb,
    u2.id
FROM users u1
CROSS JOIN users u2
WHERE u1.username = 'rbrown' AND u2.username = 'jsmith'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, priority, assigned_to, due_date, tags, created_by)
SELECT 
    'Update Incident Response Plan',
    'Update IRP based on latest threats',
    'in_progress',
    'high',
    u1.id,
    CURRENT_DATE + INTERVAL '14 days',
    '["incident-response", "security", "planning"]'::jsonb,
    u2.id
FROM users u1
CROSS JOIN users u2
WHERE u1.username = 'mjones' AND u2.username = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. PROJECTS
-- ============================================================
INSERT INTO projects (name, description, status, start_date, end_date, owner_id)
SELECT 
    'ISO 27001 Certification Program',
    'Organization-wide ISO 27001 certification initiative',
    'active',
    '2025-01-01',
    '2025-12-31',
    u.id
FROM users u
WHERE u.username = 'jsmith'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO projects (name, description, status, start_date, end_date, owner_id)
SELECT 
    'SAMA Compliance Implementation',
    'Implement SAMA cybersecurity framework controls',
    'active',
    '2025-01-15',
    '2025-06-30',
    u.id
FROM users u
WHERE u.username = 'mjones'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. TEAMS
-- ============================================================
INSERT INTO teams (name, description, created_by)
SELECT 
    'Compliance Team',
    'Responsible for regulatory compliance and assessments',
    u.id
FROM users u
WHERE u.username = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO teams (name, description, created_by)
SELECT 
    'Security Team',
    'Information security and risk management',
    u.id
FROM users u
WHERE u.username = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read)
SELECT 
    u.id,
    'New Assessment Assigned',
    'You have been assigned to Q1 2025 ISO 27001 Assessment',
    'assignment',
    'assessment',
    1,
    false
FROM users u
WHERE u.username = 'jsmith'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read)
SELECT 
    u.id,
    'Task Due Soon',
    'Conduct Vulnerability Scan is due in 3 days',
    'reminder',
    'task',
    2,
    false
FROM users u
WHERE u.username = 'rbrown'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================
\echo '============================================================'
\echo 'DATABASE SEEDING COMPLETE'
\echo '============================================================'

SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Organizations: ' || COUNT(*) FROM organizations;
SELECT 'Tenants: ' || COUNT(*) FROM tenants;
SELECT 'Frameworks: ' || COUNT(*) FROM frameworks;
SELECT 'GRC Controls: ' || COUNT(*) FROM grc_controls;
SELECT 'Assessments: ' || COUNT(*) FROM assessments;
SELECT 'Tasks: ' || COUNT(*) FROM tasks;
SELECT 'Projects: ' || COUNT(*) FROM projects;
SELECT 'Teams: ' || COUNT(*) FROM teams;
SELECT 'Notifications: ' || COUNT(*) FROM notifications;

\echo '============================================================'
