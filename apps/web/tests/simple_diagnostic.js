// Simple diagnostic - check what's available
const { Pool } = require('pg');
const fs = require('fs');

const report = [];

function log(msg) {
  console.log(msg);
  report.push(msg);
}

async function main() {
  log('='.repeat(60));
  log('DIAGNOSTIC REPORT - ' + new Date().toISOString());
  log('='.repeat(60));
  log('');
  
  // Check environment
  log('ENVIRONMENT VARIABLES:');
  log(`  DB_HOST: ${process.env.DB_HOST || 'localhost (default)'}`);
  log(`  DB_PORT: ${process.env.DB_PORT || '5432 (default)'}`);
  log(`  DB_USER: ${process.env.DB_USER || 'postgres (default)'}`);
  log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET'}`);
  log(`  COMPLIANCE_DB: ${process.env.COMPLIANCE_DB || 'shahin_ksa_compliance (default)'}`);
  log('');
  
  // Try to connect
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres'
  };
  
  log('ATTEMPTING CONNECTION:');
  log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
  log(`  User: ${dbConfig.user}`);
  log('');
  
  try {
    const pool = new Pool(dbConfig);
    const client = await pool.connect();
    
    log('✅ PostgreSQL CONNECTION: SUCCESS');
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    log(`  Version: ${versionResult.rows[0].version.split(',')[0]}`);
    
    // List databases
    const dbResult = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `);
    
    log('');
    log('AVAILABLE DATABASES:');
    dbResult.rows.forEach(row => {
      log(`  - ${row.datname}`);
    });
    
    // Check for our databases
    const ourDbs = ['shahin_ksa_compliance', 'grc_master', 'shahin_access_control'];
    const existingDbs = dbResult.rows.map(r => r.datname);
    
    log('');
    log('GRC DATABASES CHECK:');
    ourDbs.forEach(db => {
      if (existingDbs.includes(db)) {
        log(`  ✅ ${db} - EXISTS`);
      } else {
        log(`  ❌ ${db} - NOT FOUND`);
      }
    });
    
    client.release();
    await pool.end();
    
    log('');
    log('='.repeat(60));
    log('CONCLUSION:');
    
    const foundAny = ourDbs.some(db => existingDbs.includes(db));
    if (foundAny) {
      log('✅ PostgreSQL is accessible and at least one GRC database exists');
      log('');
      log('NEXT STEPS:');
      log('  1. Set environment variable: $env:DB_PASSWORD="postgres"');
      log('  2. Run tests: npm run test:features');
    } else {
      log('⚠️  PostgreSQL is accessible but GRC databases not found');
      log('');
      log('NEXT STEPS:');
      log('  1. Create databases or check database names');
      log('  2. Run: createdb shahin_ksa_compliance');
      log('  3. Apply schema: psql -d shahin_ksa_compliance -f database/schema.sql');
    }
    
  } catch (error) {
    log('❌ CONNECTION FAILED');
    log(`  Error: ${error.message}`);
    log(`  Code: ${error.code}`);
    log('');
    log('POSSIBLE CAUSES:');
    
    if (error.code === 'ECONNREFUSED') {
      log('  - PostgreSQL is not running');
      log('  - Start it: Services app (Windows) or systemctl (Linux)');
    } else if (error.code === '28P01') {
      log('  - Wrong password');
      log('  - Set: $env:DB_PASSWORD="your_actual_password"');
    } else {
      log('  - Check PostgreSQL installation');
      log('  - Verify host and port settings');
    }
  }
  
  log('');
  log('='.repeat(60));
  
  // Write to file
  fs.writeFileSync('tests/diagnostic_output.txt', report.join('\n'));
  log('');
  log('Report saved to: tests/diagnostic_output.txt');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
