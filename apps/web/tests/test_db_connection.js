#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Checks if the database is accessible before running full tests
 */

const { Pool } = require('pg');

// Default database configuration from the project
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.COMPLIANCE_DB || 'shahin_ksa_compliance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

console.log('\n🔍 Testing Database Connection...\n');
console.log('Configuration:');
console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  User: ${dbConfig.user}`);
console.log('');

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    
    console.log('✅ Database connection successful!');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(',')[0]}`);
    console.log('');
    
    // Check if required tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'organizations', 'users', 'assessments', 'workflows')
      ORDER BY table_name
    `);
    
    console.log('📋 Tables found:');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  No required tables found');
      console.log('   You may need to run migrations');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database is ready for testing!');
    console.log('\nTo run tests, use:');
    console.log('  npm run test:auto-assessment');
    console.log('  npm run test:workflow');
    console.log('  npm run test:features');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check if PostgreSQL is running:');
    console.log('      sudo systemctl status postgresql  (Linux)');
    console.log('      brew services list               (Mac)');
    console.log('      Check Services app              (Windows)');
    console.log('');
    console.log('   2. Verify your database exists:');
    console.log(`      psql -U ${dbConfig.user} -l | grep ${dbConfig.database}`);
    console.log('');
    console.log('   3. Set environment variables:');
    console.log('      $env:DB_PASSWORD="postgres"     (PowerShell)');
    console.log('      export DB_PASSWORD=postgres     (Bash)');
    console.log('');
    console.log('   4. Create database if needed:');
    console.log(`      createdb -U ${dbConfig.user} ${dbConfig.database}`);
    
    await pool.end();
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
