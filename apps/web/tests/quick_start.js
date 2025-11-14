#!/usr/bin/env node

/**
 * Quick Start Script for GRC Feature Testing
 * Validates environment and runs tests with proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('\n🔍 Checking environment...', 'cyan');
  
  const required = {
    'API_BASE_URL': process.env.API_BASE_URL || 'http://localhost:3006',
    'DATABASE_URL': process.env.DATABASE_URL
  };
  
  let allGood = true;
  
  for (const [key, value] of Object.entries(required)) {
    if (value) {
      log(`✅ ${key}: ${value.replace(/:[^:]*@/, ':***@')}`, 'green');
    } else {
      log(`❌ ${key}: NOT SET`, 'red');
      allGood = false;
    }
  }
  
  return allGood;
}

function checkFiles() {
  log('\n📁 Checking test files...', 'cyan');
  
  const testFiles = [
    'tests/test_auto_assessment_generator.js',
    'tests/test_workflow_engine.js',
    'tests/run_all_tests.js'
  ];
  
  let allExist = true;
  
  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} NOT FOUND`, 'red');
      allExist = false;
    }
  }
  
  return allExist;
}

function checkDatabase() {
  log('\n🗄️  Checking database connection...', 'cyan');
  
  const { query } = require('./apps/services/grc-api/config/database');
  
  return query('SELECT NOW() as current_time')
    .then(result => {
      log(`✅ Database connected: ${result.rows[0].current_time}`, 'green');
      return true;
    })
    .catch(error => {
      log(`❌ Database connection failed: ${error.message}`, 'red');
      return false;
    });
}

function runTest(testFile, testName) {
  return new Promise((resolve, reject) => {
    log(`\n▶️  Running ${testName}...`, 'cyan');
    
    const testProcess = spawn('node', [testFile], {
      stdio: 'inherit',
      env: {
        ...process.env,
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3006'
      }
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${testName} completed successfully`, 'green');
        resolve(true);
      } else {
        log(`❌ ${testName} failed with code ${code}`, 'red');
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      log(`❌ ${testName} error: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function main() {
  log('='.repeat(70), 'bright');
  log('🧪 GRC FEATURE TESTING - QUICK START', 'bright');
  log('='.repeat(70), 'bright');
  
  // Check environment
  const envOk = checkEnvironment();
  if (!envOk) {
    log('\n❌ Environment check failed. Please set required environment variables:', 'red');
    log('   export DATABASE_URL=postgresql://user:pass@localhost:5432/grc_db', 'yellow');
    log('   export API_BASE_URL=http://localhost:3006 (optional)', 'yellow');
    process.exit(1);
  }
  
  // Check files
  const filesOk = checkFiles();
  if (!filesOk) {
    log('\n❌ Test files not found. Please ensure test files are in the tests/ directory.', 'red');
    process.exit(1);
  }
  
  // Check database
  const dbOk = await checkDatabase();
  if (!dbOk) {
    log('\n❌ Database connection failed. Please check DATABASE_URL and ensure PostgreSQL is running.', 'red');
    process.exit(1);
  }
  
  log('\n✅ All pre-flight checks passed!', 'green');
  
  // Ask user what to run
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('\nUsage:', 'cyan');
    log('  node tests/quick_start.js [options]', 'bright');
    log('\nOptions:', 'cyan');
    log('  --all              Run all tests', 'yellow');
    log('  --auto-assessment  Run auto-assessment tests only', 'yellow');
    log('  --workflow         Run workflow engine tests only', 'yellow');
    log('  --help, -h         Show this help message', 'yellow');
    log('\nExamples:', 'cyan');
    log('  node tests/quick_start.js --all', 'bright');
    log('  node tests/quick_start.js --auto-assessment', 'bright');
    process.exit(0);
  }
  
  let results = [];
  
  if (args.includes('--all') || args.length === 0) {
    log('\n🚀 Running all tests...', 'cyan');
    const result = await runTest('tests/run_all_tests.js', 'All Tests');
    results.push(result);
  } else {
    if (args.includes('--auto-assessment')) {
      const result = await runTest('tests/test_auto_assessment_generator.js', 'Auto-Assessment Generator');
      results.push(result);
    }
    
    if (args.includes('--workflow')) {
      const result = await runTest('tests/test_workflow_engine.js', 'Workflow Engine');
      results.push(result);
    }
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'bright');
  log('📊 QUICK START SUMMARY', 'bright');
  log('='.repeat(70), 'bright');
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  log(`Total Test Suites: ${results.length}`, 'bright');
  log(`✅ Passed: ${passed}`, passed === results.length ? 'green' : 'yellow');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 ALL TEST SUITES PASSED!', 'green');
  } else {
    log(`\n❌ ${failed} TEST SUITE(S) FAILED`, 'red');
  }
  
  log('='.repeat(70), 'bright');
  log('', 'reset');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
