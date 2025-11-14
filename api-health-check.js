/**
 * COMPREHENSIVE API HEALTH CHECK TOOL
 * Scans all BFF routes and tests connectivity and responses
 *
 * Usage: node api-health-check.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const BFF_BASE_URL = process.env.BFF_URL || 'http://localhost:3005';
const TEST_TENANT_ID = 'default';
const TIMEOUT = 5000; // 5 seconds

// Route files to scan
const ROUTE_FILES = [
  'apps/bff/routes/adminRoutes.js',
  'apps/bff/routes/vercel.js',
  'apps/bff/routes/command_center.js',
  'apps/bff/routes/frameworks.js',
  'apps/bff/routes/risks.js',
  'apps/bff/routes/assessments.js',
  'apps/bff/routes/compliance.js',
  'apps/bff/routes/controls.js',
  'apps/bff/routes/organizations.js',
  'apps/bff/routes/regulators.js',
  'apps/bff/routes/documents.js',
  'apps/bff/routes/evidence.js',
  'apps/bff/routes/workflows.js',
  'apps/bff/routes/vendors.js',
  'apps/bff/routes/notifications.js',
  'apps/bff/routes/reports.js',
  'apps/bff/routes/scheduler.js',
  'apps/bff/routes/rag.js',
  'apps/bff/routes/health.js',
  'apps/bff/routes/publicAccess.js',
  'apps/bff/src/routes/onboarding.routes.js',
  'apps/bff/src/routes/tasks.routes.js'
];

// Known endpoints registry (extracted from routes)
const API_ENDPOINTS = {
  // Health endpoints
  health: [
    { method: 'GET', path: '/health', auth: false },
    { method: 'GET', path: '/health/detailed', auth: false }
  ],

  // Task Management APIs
  tasks: [
    { method: 'GET', path: '/api/tasks', auth: false },
    { method: 'GET', path: '/api/tasks/stats', auth: false },
    { method: 'GET', path: '/api/tasks/my-tasks', auth: false },
    { method: 'POST', path: '/api/tasks', auth: true },
    { method: 'GET', path: '/api/tasks/:id', auth: false },
    { method: 'PUT', path: '/api/tasks/:id', auth: true },
    { method: 'DELETE', path: '/api/tasks/:id', auth: true },
    { method: 'POST', path: '/api/tasks/:id/assign', auth: true },
    { method: 'POST', path: '/api/tasks/:id/claim', auth: true },
    { method: 'PATCH', path: '/api/tasks/:id/status', auth: true }
  ],

  // Evidence Management APIs
  evidence: [
    { method: 'GET', path: '/api/tasks/evidence-stats', auth: false },
    { method: 'POST', path: '/api/tasks/evidence/upload', auth: true },
    { method: 'POST', path: '/api/tasks/evidence/upload-multiple', auth: true },
    { method: 'GET', path: '/api/tasks/evidence/:filename', auth: false },
    { method: 'GET', path: '/api/tasks/:id/evidence', auth: false },
    { method: 'DELETE', path: '/api/tasks/:id/evidence/:index', auth: true }
  ],

  // Framework APIs
  frameworks: [
    { method: 'GET', path: '/api/frameworks', auth: false },
    { method: 'GET', path: '/api/frameworks/:id', auth: false },
    { method: 'POST', path: '/api/frameworks', auth: true },
    { method: 'PUT', path: '/api/frameworks/:id', auth: true },
    { method: 'DELETE', path: '/api/frameworks/:id', auth: true }
  ],

  // Risk Management APIs
  risks: [
    { method: 'GET', path: '/api/risks', auth: false },
    { method: 'GET', path: '/api/risks/:id', auth: false },
    { method: 'POST', path: '/api/risks', auth: true },
    { method: 'PUT', path: '/api/risks/:id', auth: true },
    { method: 'DELETE', path: '/api/risks/:id', auth: true }
  ],

  // Assessment APIs
  assessments: [
    { method: 'GET', path: '/api/assessments', auth: false },
    { method: 'GET', path: '/api/assessments/:id', auth: false },
    { method: 'POST', path: '/api/assessments', auth: true },
    { method: 'PUT', path: '/api/assessments/:id', auth: true },
    { method: 'DELETE', path: '/api/assessments/:id', auth: true }
  ],

  // Compliance APIs
  compliance: [
    { method: 'GET', path: '/api/compliance', auth: false },
    { method: 'GET', path: '/api/compliance/:id', auth: false },
    { method: 'POST', path: '/api/compliance', auth: true }
  ],

  // Controls APIs
  controls: [
    { method: 'GET', path: '/api/controls', auth: false },
    { method: 'GET', path: '/api/controls/:id', auth: false },
    { method: 'POST', path: '/api/controls', auth: true },
    { method: 'PUT', path: '/api/controls/:id', auth: true },
    { method: 'DELETE', path: '/api/controls/:id', auth: true }
  ],

  // Organization APIs
  organizations: [
    { method: 'GET', path: '/api/organizations', auth: false },
    { method: 'GET', path: '/api/organizations/:id', auth: false },
    { method: 'POST', path: '/api/organizations', auth: true },
    { method: 'PUT', path: '/api/organizations/:id', auth: true },
    { method: 'DELETE', path: '/api/organizations/:id', auth: true }
  ],

  // Vercel APIs
  vercel: [
    { method: 'GET', path: '/api/vercel/deployments', auth: false },
    { method: 'GET', path: '/api/vercel/status', auth: false }
  ],

  // Command Center APIs
  commandCenter: [
    { method: 'GET', path: '/api/command_center/stats', auth: false },
    { method: 'GET', path: '/api/command_center/dashboard', auth: false }
  ],

  // Admin APIs
  admin: [
    { method: 'GET', path: '/api/admin/organization/users', auth: true },
    { method: 'GET', path: '/api/admin/organization/settings', auth: true },
    { method: 'GET', path: '/api/admin/organization/departments', auth: true }
  ],

  // Public Access APIs
  publicAccess: [
    { method: 'GET', path: '/api/demo/status', auth: false },
    { method: 'GET', path: '/api/partner/status', auth: false },
    { method: 'GET', path: '/api/poc/status', auth: false }
  ]
};

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

/**
 * Test a single endpoint
 */
async function testEndpoint(category, endpoint) {
  const testId = `${endpoint.method} ${endpoint.path}`;
  testResults.total++;

  // Skip parameterized routes for now (need real IDs)
  if (endpoint.path.includes(':')) {
    testResults.skipped++;
    testResults.details.push({
      category,
      method: endpoint.method,
      path: endpoint.path,
      status: 'SKIPPED',
      reason: 'Parameterized route - requires real ID',
      responseTime: null
    });
    return;
  }

  const url = `${BFF_BASE_URL}${endpoint.path}`;
  const startTime = Date.now();

  try {
    const config = {
      method: endpoint.method.toLowerCase(),
      url,
      timeout: TIMEOUT,
      validateStatus: () => true // Accept any status code
    };

    // Add query params for tenant isolation
    if (endpoint.method === 'GET' && endpoint.path.includes('/api/')) {
      config.params = { tenant_id: TEST_TENANT_ID };
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    // Check if response is valid
    const isSuccess = response.status >= 200 && response.status < 300;
    const hasValidStructure = response.data && typeof response.data === 'object';

    if (isSuccess && hasValidStructure) {
      testResults.passed++;
      testResults.details.push({
        category,
        method: endpoint.method,
        path: endpoint.path,
        status: 'PASSED',
        httpStatus: response.status,
        responseTime: `${responseTime}ms`,
        responseStructure: Object.keys(response.data).join(', ')
      });
    } else {
      testResults.failed++;
      testResults.details.push({
        category,
        method: endpoint.method,
        path: endpoint.path,
        status: 'FAILED',
        httpStatus: response.status,
        responseTime: `${responseTime}ms`,
        error: !isSuccess ? 'HTTP error' : 'Invalid response structure',
        responseData: JSON.stringify(response.data).substring(0, 100)
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    testResults.failed++;
    testResults.details.push({
      category,
      method: endpoint.method,
      path: endpoint.path,
      status: 'FAILED',
      httpStatus: error.response?.status || 'NETWORK_ERROR',
      responseTime: `${responseTime}ms`,
      error: error.code || error.message,
      details: error.message
    });
  }
}

/**
 * Run health checks on all endpoints
 */
async function runHealthChecks() {
  console.log('🔍 COMPREHENSIVE API HEALTH CHECK');
  console.log('=====================================');
  console.log(`Base URL: ${BFF_BASE_URL}`);
  console.log(`Tenant ID: ${TEST_TENANT_ID}`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  console.log('');

  // Test each category
  for (const [category, endpoints] of Object.entries(API_ENDPOINTS)) {
    console.log(`\n📦 Testing ${category} (${endpoints.length} endpoints)...`);

    for (const endpoint of endpoints) {
      await testEndpoint(category, endpoint);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Generate report
  generateReport();
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Endpoints Tested: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${testResults.failed} (${((testResults.failed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`⏭️  Skipped: ${testResults.skipped} (${((testResults.skipped / testResults.total) * 100).toFixed(1)}%)`);
  console.log('');

  // Group by status
  const passed = testResults.details.filter(r => r.status === 'PASSED');
  const failed = testResults.details.filter(r => r.status === 'FAILED');
  const skipped = testResults.details.filter(r => r.status === 'SKIPPED');

  // Show passed endpoints
  if (passed.length > 0) {
    console.log('\n✅ PASSED ENDPOINTS:');
    console.log('─────────────────────────────────────────────────────────');
    passed.forEach(result => {
      console.log(`  ${result.method.padEnd(6)} ${result.path.padEnd(50)} [${result.httpStatus}] ${result.responseTime}`);
    });
  }

  // Show failed endpoints
  if (failed.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    console.log('─────────────────────────────────────────────────────────');
    failed.forEach(result => {
      console.log(`  ${result.method.padEnd(6)} ${result.path.padEnd(50)} [${result.httpStatus}]`);
      console.log(`    Error: ${result.error}`);
      if (result.details) {
        console.log(`    Details: ${result.details}`);
      }
    });
  }

  // Show skipped endpoints
  if (skipped.length > 0) {
    console.log('\n⏭️  SKIPPED ENDPOINTS:');
    console.log('─────────────────────────────────────────────────────────');
    skipped.forEach(result => {
      console.log(`  ${result.method.padEnd(6)} ${result.path.padEnd(50)} - ${result.reason}`);
    });
  }

  // Category breakdown
  console.log('\n\n📊 BREAKDOWN BY CATEGORY:');
  console.log('─────────────────────────────────────────────────────────');
  const categories = {};
  testResults.details.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { passed: 0, failed: 0, skipped: 0, total: 0 };
    }
    categories[result.category].total++;
    if (result.status === 'PASSED') categories[result.category].passed++;
    if (result.status === 'FAILED') categories[result.category].failed++;
    if (result.status === 'SKIPPED') categories[result.category].skipped++;
  });

  Object.entries(categories).forEach(([category, stats]) => {
    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
    console.log(`  ${category.padEnd(20)} ${stats.passed}/${stats.total} passed (${passRate}%)`);
  });

  // Save detailed report to file
  const reportPath = path.join(__dirname, 'API_HEALTH_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BFF_BASE_URL,
    tenantId: TEST_TENANT_ID,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      passRate: ((testResults.passed / testResults.total) * 100).toFixed(2) + '%'
    },
    categories,
    details: testResults.details
  }, null, 2));

  console.log(`\n\n💾 Detailed report saved to: ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Exit code based on results
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run the health checks
if (require.main === module) {
  runHealthChecks().catch(error => {
    console.error('❌ Fatal error running health checks:', error);
    process.exit(1);
  });
}

module.exports = { runHealthChecks, testEndpoint, API_ENDPOINTS };
