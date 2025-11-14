/**
 * ENHANCED API HEALTH CHECK TOOL
 * Tests endpoints with real data including parameterized routes
 *
 * Usage: node api-health-check-enhanced.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BFF_BASE_URL = process.env.BFF_URL || 'http://localhost:3005';
const TEST_TENANT_ID = 'default';
const TIMEOUT = 10000; // 10 seconds for slower queries

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Test data cache
let testData = {
  taskId: null,
  evidenceFilename: null
};

/**
 * Fetch a real task ID from the database
 */
async function fetchRealTaskId() {
  try {
    const response = await axios.get(`${BFF_BASE_URL}/api/tasks/stats`, {
      params: { tenant_id: TEST_TENANT_ID },
      timeout: TIMEOUT
    });

    if (response.data?.success && response.data.stats?.total > 0) {
      // Try to get first task
      const tasksResponse = await axios.get(`${BFF_BASE_URL}/api/tasks`, {
        params: {
          tenant_id: TEST_TENANT_ID,
          limit: 1,
          page: 1
        },
        timeout: TIMEOUT
      });

      if (tasksResponse.data?.data?.length > 0) {
        testData.taskId = tasksResponse.data.data[0].id;
        console.log(`✅ Found test task ID: ${testData.taskId}`);
        return true;
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not fetch real task ID: ${error.message}`);
  }
  return false;
}

/**
 * Test endpoint with real data
 */
async function testEndpoint(category, endpoint, method, path, options = {}) {
  testResults.total++;
  const startTime = Date.now();

  try {
    // Replace path parameters with real IDs
    let resolvedPath = path;
    if (path.includes(':id') && testData.taskId) {
      resolvedPath = path.replace(':id', testData.taskId);
    }
    if (path.includes(':filename') && testData.evidenceFilename) {
      resolvedPath = path.replace(':filename', testData.evidenceFilename);
    }
    if (path.includes(':index')) {
      resolvedPath = path.replace(':index', '0');
    }

    const url = `${BFF_BASE_URL}${resolvedPath}`;

    const config = {
      method: method.toLowerCase(),
      url,
      timeout: TIMEOUT,
      validateStatus: () => true
    };

    // Add query params
    if (method === 'GET' && resolvedPath.includes('/api/')) {
      config.params = { tenant_id: TEST_TENANT_ID, ...options.params };
    }

    // Add request body
    if (options.data) {
      config.data = options.data;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    // Determine success
    const isSuccess = response.status >= 200 && response.status < 300;
    const hasValidStructure = response.data && typeof response.data === 'object';

    if (isSuccess && hasValidStructure) {
      testResults.passed++;
      testResults.details.push({
        status: 'PASSED',
        category,
        method,
        path: resolvedPath,
        httpStatus: response.status,
        responseTime: `${responseTime}ms`,
        responseKeys: Object.keys(response.data).join(', ')
      });
    } else {
      testResults.failed++;
      testResults.details.push({
        status: 'FAILED',
        category,
        method,
        path: resolvedPath,
        httpStatus: response.status,
        responseTime: `${responseTime}ms`,
        error: !isSuccess ? 'HTTP error' : 'Invalid response structure',
        responsePreview: JSON.stringify(response.data).substring(0, 150)
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    testResults.failed++;
    testResults.details.push({
      status: 'FAILED',
      category,
      method,
      path,
      httpStatus: error.response?.status || 'NETWORK_ERROR',
      responseTime: `${responseTime}ms`,
      error: error.code || error.message,
      details: error.message
    });
  }
}

/**
 * Run enhanced health checks
 */
async function runEnhancedHealthChecks() {
  console.log('🔍 ENHANCED API HEALTH CHECK WITH REAL DATA');
  console.log('=============================================');
  console.log(`Base URL: ${BFF_BASE_URL}`);
  console.log(`Tenant ID: ${TEST_TENANT_ID}`);
  console.log(`Timeout: ${TIMEOUT}ms\n`);

  // Step 1: Fetch test data
  console.log('📊 Step 1: Fetching test data...\n');
  await fetchRealTaskId();

  // Step 2: Test health endpoints
  console.log('\n📦 Step 2: Testing Health Endpoints...');
  await testEndpoint('health', 'basic', 'GET', '/health');
  await testEndpoint('health', 'detailed', 'GET', '/health/detailed');

  // Step 3: Test task endpoints
  console.log('\n📦 Step 3: Testing Task Management APIs...');
  await testEndpoint('tasks', 'stats', 'GET', '/api/tasks/stats');
  await testEndpoint('tasks', 'list', 'GET', '/api/tasks', { params: { limit: 10 } });

  if (testData.taskId) {
    await testEndpoint('tasks', 'get-by-id', 'GET', `/api/tasks/:id`);
    await testEndpoint('tasks', 'update-status', 'PATCH', `/api/tasks/:id/status`, {
      data: { status: 'in_progress' }
    });
  }

  // Step 4: Test evidence endpoints
  console.log('\n📦 Step 4: Testing Evidence APIs...');
  await testEndpoint('evidence', 'stats', 'GET', '/api/tasks/evidence-stats');

  if (testData.taskId) {
    await testEndpoint('evidence', 'get-task-evidence', 'GET', `/api/tasks/:id/evidence`);
  }

  // Step 5: Test framework endpoints
  console.log('\n📦 Step 5: Testing Framework APIs...');
  await testEndpoint('frameworks', 'list', 'GET', '/api/frameworks');

  // Step 6: Test other core endpoints
  console.log('\n📦 Step 6: Testing Other Core APIs...');
  await testEndpoint('risks', 'list', 'GET', '/api/risks');
  await testEndpoint('assessments', 'list', 'GET', '/api/assessments');
  await testEndpoint('compliance', 'list', 'GET', '/api/compliance');
  await testEndpoint('controls', 'list', 'GET', '/api/controls');
  await testEndpoint('organizations', 'list', 'GET', '/api/organizations');

  // Generate report
  generateReport();
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 ENHANCED TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Endpoints Tested: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${testResults.failed} (${((testResults.failed / testResults.total) * 100).toFixed(1)}%)`);
  console.log('');

  // Show results
  const passed = testResults.details.filter(r => r.status === 'PASSED');
  const failed = testResults.details.filter(r => r.status === 'FAILED');

  if (passed.length > 0) {
    console.log('\n✅ PASSED ENDPOINTS:');
    console.log('─────────────────────────────────────────────────────────');
    passed.forEach(result => {
      console.log(`  ${result.method.padEnd(6)} ${result.path.padEnd(50)} [${result.httpStatus}] ${result.responseTime}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    console.log('─────────────────────────────────────────────────────────');
    failed.forEach(result => {
      console.log(`  ${result.method.padEnd(6)} ${result.path.padEnd(50)} [${result.httpStatus}]`);
      console.log(`    Error: ${result.error}`);
      if (result.responsePreview) {
        console.log(`    Response: ${result.responsePreview}`);
      }
    });
  }

  // Test data summary
  console.log('\n\n📊 TEST DATA USED:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`  Task ID: ${testData.taskId || 'Not found'}`);
  console.log(`  Evidence File: ${testData.evidenceFilename || 'Not found'}`);

  // Performance summary
  const avgResponseTime = testResults.details
    .filter(r => r.responseTime)
    .map(r => parseInt(r.responseTime))
    .reduce((sum, time) => sum + time, 0) / testResults.total;

  console.log('\n\n⚡ PERFORMANCE SUMMARY:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`  Fastest: ${Math.min(...testResults.details.map(r => parseInt(r.responseTime) || 9999))}ms`);
  console.log(`  Slowest: ${Math.max(...testResults.details.map(r => parseInt(r.responseTime) || 0))}ms`);

  // Save report
  const reportPath = path.join(__dirname, 'API_HEALTH_REPORT_ENHANCED.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BFF_BASE_URL,
    tenantId: TEST_TENANT_ID,
    testData,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / testResults.total) * 100).toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(0) + 'ms'
    },
    details: testResults.details
  }, null, 2));

  console.log(`\n\n💾 Enhanced report saved to: ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(failed.length > 0 ? 1 : 0);
}

// Run the enhanced health checks
if (require.main === module) {
  runEnhancedHealthChecks().catch(error => {
    console.error('❌ Fatal error running enhanced health checks:', error);
    process.exit(1);
  });
}

module.exports = { runEnhancedHealthChecks, testEndpoint };
