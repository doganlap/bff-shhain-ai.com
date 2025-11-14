#!/usr/bin/env node
/**
 * Quick Schema Builder - Creates all missing tables
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'shahin_ksa_compliance'
});

const tables = [
  {
    name: 'tenants',
    sql: `CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      sector VARCHAR(100),
      industry VARCHAR(100),
      contact_email VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'grc_frameworks',
    sql: `CREATE TABLE IF NOT EXISTS grc_frameworks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      version VARCHAR(50),
      description TEXT,
      sector_applicability TEXT[],
      complexity_level INTEGER DEFAULT 3,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, version)
    )`
  },
  {
    name: 'grc_controls',
    sql: `CREATE TABLE IF NOT EXISTS grc_controls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      framework_id UUID REFERENCES grc_frameworks(id) ON DELETE CASCADE,
      control_id VARCHAR(100) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      control_type VARCHAR(100) DEFAULT 'policy',
      priority_level VARCHAR(50) DEFAULT 'medium',
      implementation_guidance TEXT,
      testing_procedures TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(framework_id, control_id)
    )`
  },
  {
    name: 'sector_controls',
    sql: `CREATE TABLE IF NOT EXISTS sector_controls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      control_id UUID REFERENCES grc_controls(id) ON DELETE CASCADE,
      sector VARCHAR(100) NOT NULL,
      applicability_score INTEGER DEFAULT 50,
      implementation_complexity VARCHAR(50) DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(control_id, sector)
    )`
  },
  {
    name: 'workflows',
    sql: `CREATE TABLE IF NOT EXISTS workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      trigger_type VARCHAR(50) DEFAULT 'manual',
      trigger_config JSONB,
      status VARCHAR(50) DEFAULT 'active',
      created_by UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'workflow_steps',
    sql: `CREATE TABLE IF NOT EXISTS workflow_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
      step_name VARCHAR(255) NOT NULL,
      step_type VARCHAR(50) NOT NULL,
      step_config JSONB,
      step_order INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(workflow_id, step_order)
    )`
  },
  {
    name: 'workflow_triggers',
    sql: `CREATE TABLE IF NOT EXISTS workflow_triggers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      trigger_name VARCHAR(255) NOT NULL,
      trigger_type VARCHAR(50) NOT NULL,
      trigger_event VARCHAR(100) NOT NULL,
      trigger_conditions JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'assessment_workflow',
    sql: `CREATE TABLE IF NOT EXISTS assessment_workflow (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assessment_id UUID,
      workflow_type VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      priority VARCHAR(50) DEFAULT 'medium',
      assigned_to UUID,
      assigned_by UUID,
      delegated_from UUID,
      due_date TIMESTAMP,
      approved_at TIMESTAMP,
      approved_by UUID,
      rejected_at TIMESTAMP,
      rejected_by UUID,
      rejection_reason TEXT,
      comments TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'workflow_history',
    sql: `CREATE TABLE IF NOT EXISTS workflow_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID,
      action VARCHAR(100) NOT NULL,
      performed_by UUID,
      status_from VARCHAR(50),
      status_to VARCHAR(50),
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'workflow_executions',
    sql: `CREATE TABLE IF NOT EXISTS workflow_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID,
      assessment_id UUID,
      status VARCHAR(50) DEFAULT 'running',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    )`
  },
  {
    name: 'workflow_trigger_executions',
    sql: `CREATE TABLE IF NOT EXISTS workflow_trigger_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trigger_id UUID,
      assessment_id UUID,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      result JSONB,
      execution_time_ms INTEGER
    )`
  }
];

async function buildSchema() {
  try {
    await client.connect();
    console.log('\n🔧 Building Test Schema...\n');
    
    let created = 0;
    let skipped = 0;
    
    for (const table of tables) {
      try {
        await client.query(table.sql);
        console.log(`✅ ${table.name}`);
        created++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  ${table.name} (already exists)`);
          skipped++;
        } else {
          console.log(`❌ ${table.name}: ${error.message}`);
        }
      }
    }
    
    // Add sample data
    console.log('\n📊 Adding sample frameworks...');
    await client.query(`
      INSERT INTO grc_frameworks (name, version, description, sector_applicability, complexity_level) VALUES
      ('ISO 27001', '2022', 'Information Security Management', ARRAY['finance', 'healthcare'], 4),
      ('NIST CSF', '1.1', 'NIST Cybersecurity Framework', ARRAY['finance', 'energy'], 3),
      ('SAMA Cybersecurity', '1.0', 'SAMA Framework for KSA', ARRAY['finance', 'banking'], 5),
      ('SOC 2', 'Type II', 'Service Organization Control', ARRAY['technology'], 3)
      ON CONFLICT (name, version) DO NOTHING
    `);
    console.log('✅ Sample frameworks added');
    
    await client.end();
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Schema Build Complete!`);
    console.log(`   Tables created/verified: ${created + skipped}`);
    console.log('='.repeat(60));
    
    console.log('\n🚀 Ready to run tests:');
    console.log('   $env:DB_PASSWORD="postgres"');
    console.log('   npm run test:features\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

buildSchema();
