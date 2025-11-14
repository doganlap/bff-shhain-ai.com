-- ============================================================
-- DATABASE MERGE SCRIPT
-- Merging: grc_master, shahin_access_control INTO shahin_ksa_compliance
-- Date: November 14, 2025
-- ============================================================

\c shahin_ksa_compliance

-- ============================================================
-- STEP 1: Import data from grc_master
-- ============================================================

-- Copy users from grc_master (if they don't exist in shahin_ksa_compliance)
INSERT INTO users (id, username, email, password_hash, role, full_name, department, phone, is_active, created_at, updated_at)
SELECT id, username, email, password_hash, role, full_name, department, phone, is_active, created_at, updated_at
FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT id, username, email, password_hash, role, full_name, department, phone, is_active, created_at, updated_at FROM users')
    AS t(id integer, username varchar, email varchar, password_hash varchar, role varchar, full_name varchar,
         department varchar, phone varchar, is_active boolean, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- Copy tasks from grc_master
INSERT INTO tasks (id, title, description, status, priority, assigned_to, project_id, due_date, completed_date, tags, created_by, created_at, updated_at)
SELECT id, title, description, status, priority, assigned_to, project_id, due_date, completed_date, tags, created_by, created_at, updated_at
FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT id, title, description, status, priority, assigned_to, project_id, due_date, completed_date, tags, created_by, created_at, updated_at FROM tasks')
    AS t(id integer, title varchar, description text, status varchar, priority varchar, assigned_to integer,
         project_id integer, due_date date, completed_date date, tags jsonb, created_by integer, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- Copy projects from grc_master
INSERT INTO projects (id, name, description, status, start_date, end_date, owner_id, team_id, created_at, updated_at)
SELECT id, name, description, status, start_date, end_date, owner_id, team_id, created_at, updated_at
FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT id, name, description, status, start_date, end_date, owner_id, team_id, created_at, updated_at FROM projects')
    AS t(id integer, name varchar, description text, status varchar, start_date date, end_date date,
         owner_id integer, team_id integer, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- Copy teams from grc_master
INSERT INTO teams (id, name, description, created_by, created_at, updated_at)
SELECT id, name, description, created_by, created_at, updated_at
FROM dblink('dbname=grc_master user=postgres password=postgres',
    'SELECT id, name, description, created_by, created_at, updated_at FROM teams')
    AS t(id integer, name varchar, description text, created_by integer, created_at timestamp, updated_at timestamp)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: Import data from shahin_access_control
-- ============================================================

-- Note: Check if tables exist in shahin_access_control before importing
-- This is a placeholder - adjust based on actual tables in shahin_access_control

-- ============================================================
-- STEP 3: Update sequences to avoid ID conflicts
-- ============================================================

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval('teams_id_seq', COALESCE((SELECT MAX(id) FROM teams), 1));

-- ============================================================
-- STEP 4: Verify the merge
-- ============================================================

SELECT 'Users Count: ' || COUNT(*) FROM users;
SELECT 'Tasks Count: ' || COUNT(*) FROM tasks;
SELECT 'Projects Count: ' || COUNT(*) FROM projects;
SELECT 'Teams Count: ' || COUNT(*) FROM teams;

-- ============================================================
-- COMPLETE
-- ============================================================
