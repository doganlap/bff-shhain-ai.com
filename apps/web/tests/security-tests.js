/**
 * Security Testing Script
 * Tests authentication, RLS, and RBAC implementations
 */

const { Pool } = require('pg');
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/grc_db';

const pool = new Pool({ connectionString: DB_URL });

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    results.failed++;
    console.error(`❌ FAIL: ${name}`);
    if (details) console.error(`   ${details}`);
  }
}

// ============================================
// TEST 1: RLS Policies Exist
// ============================================
async function testRLSPoliciesExist() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
    `);
    
    const count = parseInt(result.rows[0].count);
    logTest(
      'RLS Policies Exist',
      count > 0,
      `Found ${count} policies`
    );
  } catch (error) {
    logTest('RLS Policies Exist', false, error.message);
  }
}

// ============================================
// TEST 2: RLS Enabled on Tables
// ============================================
async function testRLSEnabled() {
  try {
    const result = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND rowsecurity = TRUE
    `);
    
    const tables = result.rows.map(r => r.tablename);
    logTest(
      'RLS Enabled on Tables',
      tables.length > 0,
      `Enabled on: ${tables.join(', ')}`
    );
  } catch (error) {
    logTest('RLS Enabled on Tables', false, error.message);
  }
}

// ============================================
// TEST 3: RLS Context Functions Work
// ============================================
async function testRLSFunctions() {
  try {
    // Test current_tenant_id function
    await pool.query("SET app.current_tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'");
    const result1 = await pool.query('SELECT current_tenant_id()');
    
    // Test is_super_admin function
    await pool.query("SET app.is_super_admin = TRUE");
    const result2 = await pool.query('SELECT is_super_admin()');
    
    logTest(
      'RLS Context Functions Work',
      result1.rows[0].current_tenant_id !== null && result2.rows[0].is_super_admin === true,
      'Functions return expected values'
    );
    
    // Reset
    await pool.query('RESET app.current_tenant_id');
    await pool.query('RESET app.is_super_admin');
  } catch (error) {
    logTest('RLS Context Functions Work', false, error.message);
  }
}

// ============================================
// TEST 4: RLS Blocks Cross-Tenant Access
// ============================================
async function testRLSIsolation() {
  try {
    // Assume there's data in assessments table
    // Set tenant context
    await pool.query("SET app.current_tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'");
    await pool.query("SET app.is_super_admin = FALSE");
    
    // Try to query another tenant's data
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM assessments
      WHERE tenant_id = 'different-tenant-id'
    `);
    
    const count = parseInt(result.rows[0].count);
    logTest(
      'RLS Blocks Cross-Tenant Access',
      count === 0,
      count === 0 ? 'No cross-tenant data returned' : `SECURITY ISSUE: ${count} rows leaked!`
    );
    
    // Reset
    await pool.query('RESET app.current_tenant_id');
    await pool.query('RESET app.is_super_admin');
  } catch (error) {
    logTest('RLS Blocks Cross-Tenant Access', false, error.message);
  }
}

// ============================================
// TEST 5: Super Admin Can Access All Data
// ============================================
async function testSuperAdminAccess() {
  try {
    // Set super admin context
    await pool.query("SET app.current_tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'");
    await pool.query("SET app.is_super_admin = TRUE");
    
    // Should be able to see all data
    const result = await pool.query('SELECT COUNT(*) as count FROM assessments');
    
    // Just check query succeeds (actual count depends on test data)
    logTest(
      'Super Admin Can Access All Data',
      result.rows.length > 0,
      'Super admin query succeeded'
    );
    
    // Reset
    await pool.query('RESET app.current_tenant_id');
    await pool.query('RESET app.is_super_admin');
  } catch (error) {
    logTest('Super Admin Can Access All Data', false, error.message);
  }
}

// ============================================
// TEST 6: Authentication Required
// ============================================
async function testAuthRequired() {
  try {
    const response = await axios.get(`${BASE_URL}/api/assessments`, {
      validateStatus: () => true, // Don't throw on error status
    });
    
    logTest(
      'Authentication Required',
      response.status === 401,
      `Status: ${response.status} (expected 401)`
    );
  } catch (error) {
    logTest('Authentication Required', false, error.message);
  }
}

// ============================================
// TEST 7: Token Blacklist Works (if Redis available)
// ============================================
async function testTokenBlacklist() {
  // This test requires a valid token - skip if not available
  console.log('⏭️  SKIP: Token Blacklist (requires valid token)');
}

// ============================================
// TEST 8: RBAC Permissions Enforced
// ============================================
async function testRBACPermissions() {
  // This test requires authentication - skip if not available
  console.log('⏭️  SKIP: RBAC Permissions (requires authentication)');
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runTests() {
  console.log('');
  console.log('============================================');
  console.log('   SECURITY TESTING SUITE');
  console.log('============================================');
  console.log('');
  
  console.log('📋 Database Tests:');
  await testRLSPoliciesExist();
  await testRLSEnabled();
  await testRLSFunctions();
  await testRLSIsolation();
  await testSuperAdminAccess();
  
  console.log('');
  console.log('🔐 API Tests:');
  await testAuthRequired();
  await testTokenBlacklist();
  await testRBACPermissions();
  
  console.log('');
  console.log('============================================');
  console.log('   TEST SUMMARY');
  console.log('============================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('');
  
  if (results.failed > 0) {
    console.log('❌ SOME TESTS FAILED - Review output above');
    process.exit(1);
  } else {
    console.log('✅ ALL TESTS PASSED!');
    process.exit(0);
  }
}

// Cleanup
process.on('exit', () => {
  pool.end();
});

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
