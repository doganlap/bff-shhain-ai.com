#!/usr/bin/env node

/**
 * Diagnostic Script - Identify Problems Before Testing
 * This will check all prerequisites and show exactly what's wrong
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔍 GRC TEST DIAGNOSTIC - PROBLEM IDENTIFIER');
console.log('='.repeat(80) + '\n');

// Results object
const diagnostics = {
  environment: {},
  database: {},
  files: {},
  services: {},
  problems: [],
  warnings: [],
  recommendations: []
};

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  diagnostics.problems.push(message);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  diagnostics.warnings.push(message);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Check 1: Environment Variables
console.log('📋 CHECKING ENVIRONMENT VARIABLES\n');

const envVars = {
  'DB_HOST': process.env.DB_HOST || 'localhost',
  'DB_PORT': process.env.DB_PORT || '5432',
  'DB_USER': process.env.DB_USER || 'postgres',
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'COMPLIANCE_DB': process.env.COMPLIANCE_DB || 'shahin_ksa_compliance',
  'FINANCE_DB': process.env.FINANCE_DB || 'grc_master',
  'AUTH_DB': process.env.AUTH_DB || 'shahin_access_control',
  'DATABASE_URL': process.env.DATABASE_URL,
  'API_BASE_URL': process.env.API_BASE_URL || 'http://localhost:3006',
  'NODE_ENV': process.env.NODE_ENV || 'development'
};

let envIssues = 0;

for (const [key, value] of Object.entries(envVars)) {
  diagnostics.environment[key] = value;
  
  if (value) {
    if (key.includes('PASSWORD') || key.includes('URL')) {
      const masked = value.includes('@') 
        ? value.replace(/:[^:]*@/, ':***@')
        : '***';
      logSuccess(`${key}: ${masked}`);
    } else {
      logSuccess(`${key}: ${value}`);
    }
  } else {
    if (key === 'DB_PASSWORD' || key === 'DATABASE_URL') {
      logError(`${key} is not set (REQUIRED)`);
      envIssues++;
    } else {
      logWarning(`${key} is not set (using default)`);
    }
  }
}

console.log('');

if (envIssues > 0) {
  diagnostics.recommendations.push(
    'Set required environment variables:\n' +
    '  Windows PowerShell:\n' +
    '    $env:DB_PASSWORD="your_password"\n' +
    '  Linux/Mac:\n' +
    '    export DB_PASSWORD=your_password'
  );
}

// Check 2: Database Connections
console.log('🗄️  CHECKING DATABASE CONNECTIONS\n');

const databases = [
  {
    name: 'Compliance DB',
    key: 'compliance',
    config: {
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      database: envVars.COMPLIANCE_DB,
      user: envVars.DB_USER,
      password: envVars.DB_PASSWORD
    }
  },
  {
    name: 'Finance DB',
    key: 'finance',
    config: {
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      database: envVars.FINANCE_DB,
      user: envVars.DB_USER,
      password: envVars.DB_PASSWORD
    }
  },
  {
    name: 'Auth DB',
    key: 'auth',
    config: {
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      database: envVars.AUTH_DB,
      user: envVars.DB_USER,
      password: envVars.DB_PASSWORD
    }
  }
];

async function checkDatabase(db) {
  try {
    logInfo(`Testing ${db.name} (${db.config.database})...`);
    
    const pool = new Pool(db.config);
    const client = await pool.connect();
    
    // Test connection
    const timeResult = await client.query('SELECT NOW() as time');
    logSuccess(`${db.name} connected - ${timeResult.rows[0].time}`);
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    diagnostics.database[db.key] = {
      status: 'connected',
      database: db.config.database,
      tables: tables,
      tableCount: tables.length
    };
    
    logInfo(`  Found ${tables.length} tables`);
    
    // Check for required tables
    const requiredTables = [
      'tenants', 'organizations', 'users', 'assessments',
      'workflows', 'assessment_workflow', 'grc_frameworks', 'grc_controls'
    ];
    
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      logWarning(`  Missing tables: ${missingTables.join(', ')}`);
      diagnostics.recommendations.push(
        `Run migrations for ${db.name}:\n` +
        `  psql -U ${db.config.user} -d ${db.config.database} -f database/schema.sql`
      );
    } else {
      logSuccess(`  All required tables present`);
    }
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    logError(`${db.name} connection failed: ${error.message}`);
    diagnostics.database[db.key] = {
      status: 'error',
      error: error.message,
      code: error.code
    };
    
    if (error.code === 'ECONNREFUSED') {
      diagnostics.recommendations.push(
        'PostgreSQL is not running. Start it with:\n' +
        '  Windows: Check Services app for PostgreSQL\n' +
        '  Linux: sudo systemctl start postgresql\n' +
        '  Mac: brew services start postgresql'
      );
    } else if (error.code === '28P01') {
      diagnostics.recommendations.push(
        'Authentication failed. Check your DB_PASSWORD:\n' +
        `  Current user: ${db.config.user}\n` +
        '  Set password: $env:DB_PASSWORD="your_password"'
      );
    } else if (error.code === '3D000') {
      diagnostics.recommendations.push(
        `Database "${db.config.database}" does not exist. Create it:\n` +
        `  createdb -U ${db.config.user} ${db.config.database}`
      );
    }
    
    return false;
  }
}

// Check 3: Test Files
console.log('\n📁 CHECKING TEST FILES\n');

const testFiles = [
  'tests/test_auto_assessment_generator.js',
  'tests/test_workflow_engine.js',
  'tests/run_all_tests.js',
  'tests/quick_start.js',
  'tests/test_db_connection.js',
  'tests/test_guide.js'
];

let fileIssues = 0;

for (const file of testFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    diagnostics.files[file] = {
      exists: true,
      size: stats.size,
      readable: true
    };
    logSuccess(`${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    diagnostics.files[file] = { exists: false };
    logError(`${file} not found`);
    fileIssues++;
  }
}

console.log('');

// Check 4: Node Modules
console.log('📦 CHECKING DEPENDENCIES\n');

const requiredModules = ['pg', 'axios', 'lodash', 'uuid', 'joi'];
let moduleIssues = 0;

for (const mod of requiredModules) {
  try {
    require.resolve(mod);
    logSuccess(`${mod} installed`);
    diagnostics.files[`node_modules/${mod}`] = { installed: true };
  } catch (error) {
    logError(`${mod} not installed`);
    moduleIssues++;
    diagnostics.files[`node_modules/${mod}`] = { installed: false };
  }
}

console.log('');

if (moduleIssues > 0) {
  diagnostics.recommendations.push(
    'Install missing dependencies:\n' +
    '  npm install'
  );
}

// Check 5: Services (Optional)
console.log('🌐 CHECKING SERVICES (OPTIONAL)\n');

const http = require('http');
const https = require('https');

async function checkService(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        logSuccess(`${name} is running at ${url}`);
        diagnostics.services[name] = { status: 'running', url };
        resolve(true);
      } else {
        logWarning(`${name} returned status ${res.statusCode}`);
        diagnostics.services[name] = { status: 'error', statusCode: res.statusCode };
        resolve(false);
      }
    });
    req.on('error', () => {
      logWarning(`${name} not reachable at ${url} (optional)`);
      diagnostics.services[name] = { status: 'not_reachable' };
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      logWarning(`${name} timeout at ${url} (optional)`);
      resolve(false);
    });
  });
}

// Main execution
async function runDiagnostics() {
  // Check databases
  let dbConnected = 0;
  for (const db of databases) {
    const result = await checkDatabase(db);
    if (result) dbConnected++;
    console.log('');
  }
  
  // Check services (non-blocking)
  await checkService(envVars.API_BASE_URL + '/health', 'BFF Service');
  await checkService('http://localhost:3000/health', 'GRC API');
  
  console.log('');
  console.log('='.repeat(80));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  const totalProblems = diagnostics.problems.length;
  const totalWarnings = diagnostics.warnings.length;
  
  console.log(`${colors.red}❌ Problems: ${totalProblems}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${totalWarnings}${colors.reset}`);
  console.log(`${colors.green}✅ Databases Connected: ${dbConnected}/3${colors.reset}`);
  console.log('');
  
  if (totalProblems > 0) {
    console.log(`${colors.red}CRITICAL ISSUES:${colors.reset}`);
    diagnostics.problems.forEach((problem, i) => {
      console.log(`  ${i + 1}. ${problem}`);
    });
    console.log('');
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log(`${colors.blue}💡 RECOMMENDATIONS:${colors.reset}\n`);
    diagnostics.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
      console.log('');
    });
  }
  
  // Can we run tests?
  const canRunTests = totalProblems === 0 && dbConnected >= 1 && fileIssues === 0;
  
  console.log('='.repeat(80));
  if (canRunTests) {
    console.log(`${colors.green}✅ READY TO RUN TESTS!${colors.reset}\n`);
    console.log('Run tests with:');
    console.log('  npm run test:features');
    console.log('  npm run test:auto-assessment');
    console.log('  npm run test:workflow');
  } else {
    console.log(`${colors.red}❌ NOT READY - FIX ISSUES ABOVE FIRST${colors.reset}\n`);
    console.log('After fixing issues, run this diagnostic again:');
    console.log('  node tests/diagnostic.js');
  }
  console.log('='.repeat(80) + '\n');
  
  // Save diagnostic report
  const reportPath = path.join(__dirname, 'diagnostic_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(diagnostics, null, 2));
  console.log(`📄 Full diagnostic report saved to: ${reportPath}\n`);
  
  process.exit(canRunTests ? 0 : 1);
}

runDiagnostics().catch(error => {
  console.error('\n❌ Diagnostic failed:', error);
  process.exit(1);
});
