#!/usr/bin/env node

/**
 * Apply Test Tables Schema
 * Creates all missing tables needed for tests
 */

const { Pool } = require('pg');
const fs = require('fs');

console.log('\n' + '='.repeat(70));
console.log('🔧 APPLYING TEST TABLES SCHEMA');
console.log('='.repeat(70) + '\n');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'shahin_ksa_compliance'
});

async function applySchema() {
  try {
    // Read SQL file
    const sqlFile = 'database/test_tables_schema.sql';
    console.log(`📄 Reading schema file: ${sqlFile}`);
    
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ Schema file not found!');
      console.error('   Make sure you run this from project root');
      process.exit(1);
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ Schema file loaded\n');
    
    // Execute SQL
    console.log('⚙️  Applying schema...');
    const client = await pool.connect();
    
    await client.query(sql);
    
    console.log('✅ Schema applied successfully!\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'tenants', 'grc_frameworks', 'grc_controls', 
        'sector_controls', 'workflows', 'workflow_steps',
        'workflow_triggers', 'assessment_workflow', 'workflow_history'
      )
      ORDER BY table_name
    `);
    
    console.log('   Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // Check sample data
    console.log('\n📊 Checking sample data...');
    const countResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM grc_frameworks) as frameworks,
        (SELECT COUNT(*) FROM grc_controls) as controls,
        (SELECT COUNT(*) FROM sector_controls) as sector_mappings
    `);
    
    const counts = countResult.rows[0];
    console.log(`   Frameworks: ${counts.frameworks}`);
    console.log(`   Controls: ${counts.controls}`);
    console.log(`   Sector mappings: ${counts.sector_mappings}`);
    
    client.release();
    await pool.end();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ SCHEMA APPLICATION COMPLETE!');
    console.log('='.repeat(70));
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Set password: $env:DB_PASSWORD="postgres"');
    console.log('   2. Run tests: npm run test:features');
    console.log('   3. Or verify: node tests/simple_diagnostic.js\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetails:', error);
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check PostgreSQL is running');
    console.log('   2. Verify DB_PASSWORD: $env:DB_PASSWORD="postgres"');
    console.log('   3. Ensure database exists: psql -U postgres -l\n');
    
    await pool.end();
    process.exit(1);
  }
}

applySchema();
