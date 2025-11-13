/**
 * Simple Database Integration Test
 * Tests basic database connectivity and API endpoints
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_TIMEOUT = 10000;

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// Test runner
const runTest = async (testName, testFn) => {
  testResults.total++;
  try {
    log(`\n🧪 Testing: ${testName}`, 'blue');
    await testFn();
    log(`✅ PASSED: ${testName}`, 'green');
    testResults.passed++;
  } catch (error) {
    log(`❌ FAILED: ${testName}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
};

// Database integration tests
const testDatabaseIntegration = async () => {
  logSection('Database Integration Tests');

  // Test 1: Health check
  await runTest('API Health Check', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    log(`   Status: ${response.status}`, 'yellow');
    log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
  });

  // Test 2: Organizations endpoint
  await runTest('Organizations API', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/organizations`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Organizations count: ${data.data?.length || 0}`, 'yellow');
    
    if (data.data && Array.isArray(data.data)) {
      log(`   ✓ Response format is correct`, 'green');
    } else {
      throw new Error('Invalid response format');
    }
  });

  // Test 3: Regulators endpoint
  await runTest('Regulators API', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/regulators`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Regulators count: ${data.data?.length || 0}`, 'yellow');
    
    if (data.data && Array.isArray(data.data)) {
      log(`   ✓ Response format is correct`, 'green');
    } else {
      throw new Error('Invalid response format');
    }
  });

  // Test 4: Frameworks endpoint
  await runTest('Frameworks API', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/grc-frameworks`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Frameworks count: ${data.data?.length || 0}`, 'yellow');
    
    if (data.data && Array.isArray(data.data)) {
      log(`   ✓ Response format is correct`, 'green');
    } else {
      throw new Error('Invalid response format');
    }
  });

  // Test 5: Controls endpoint with pagination
  await runTest('Controls API with Pagination', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/grc-controls?page=1&limit=10`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Controls count: ${data.data?.length || 0}`, 'yellow');
    log(`   Total controls: ${data.pagination?.total || 0}`, 'yellow');
    
    if (data.data && Array.isArray(data.data) && data.pagination) {
      log(`   ✓ Response format with pagination is correct`, 'green');
    } else {
      throw new Error('Invalid response format or missing pagination');
    }
  });

  // Test 6: Assessments endpoint
  await runTest('Assessments API', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/assessments`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Assessments count: ${data.data?.length || 0}`, 'yellow');
    
    if (data.data && Array.isArray(data.data)) {
      log(`   ✓ Response format is correct`, 'green');
    } else {
      throw new Error('Invalid response format');
    }
  });

  // Test 7: Dashboard stats endpoint
  await runTest('Dashboard Stats API', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    log(`   Stats keys: ${Object.keys(data).join(', ')}`, 'yellow');
    
    // Check for expected stats
    const expectedKeys = ['regulators', 'frameworks', 'controls', 'assessments', 'organizations'];
    const hasExpectedKeys = expectedKeys.some(key => key in data);
    
    if (hasExpectedKeys) {
      log(`   ✓ Dashboard stats format is correct`, 'green');
    } else {
      throw new Error('Missing expected dashboard stats');
    }
  });

  // Test 8: Error handling
  await runTest('Error Handling (404 endpoint)', async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/nonexistent-endpoint`, {
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected 404 error but request succeeded');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log(`   ✓ 404 error handled correctly`, 'green');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to API server');
      } else {
        throw error;
      }
    }
  });
};

// UI Component simulation tests
const testUIComponentIntegration = async () => {
  logSection('UI Component Integration Simulation');

  // Test 9: Simulate Organizations page data loading
  await runTest('Organizations Page Data Loading', async () => {
    // Simulate what the Organizations page does
    const response = await axios.get(`${API_BASE_URL}/api/organizations`, {
      timeout: TEST_TIMEOUT
    });
    
    const organizations = response.data.data || [];
    
    // Simulate component processing
    const processedOrganizations = organizations.map(org => ({
      id: org.id,
      name: org.name,
      sector: org.sector || 'Not specified',
      country: org.country || 'Not specified',
      isActive: org.is_active !== false,
      assessmentCount: org.assessment_count || 0,
      complianceScore: org.compliance_score || 0,
    }));
    
    log(`   Processed ${processedOrganizations.length} organizations`, 'yellow');
    log(`   ✓ UI component data processing simulation successful`, 'green');
  });

  // Test 10: Simulate Controls page with filters
  await runTest('Controls Page with Filters', async () => {
    // Simulate filtering by framework
    const frameworksResponse = await axios.get(`${API_BASE_URL}/api/grc-frameworks`, {
      timeout: TEST_TIMEOUT
    });
    
    const frameworks = frameworksResponse.data.data || [];
    
    if (frameworks.length > 0) {
      const firstFramework = frameworks[0];
      
      // Simulate filtering controls by framework
      const controlsResponse = await axios.get(
        `${API_BASE_URL}/api/grc-controls?framework_id=${firstFramework.id}&page=1&limit=5`,
        { timeout: TEST_TIMEOUT }
      );
      
      const controls = controlsResponse.data.data || [];
      log(`   Found ${controls.length} controls for framework: ${firstFramework.name}`, 'yellow');
      log(`   ✓ Controls filtering simulation successful`, 'green');
    } else {
      log(`   No frameworks available for filtering test`, 'yellow');
      log(`   ✓ Controls filtering simulation completed (no data)`, 'green');
    }
  });

  // Test 11: Simulate Dashboard data aggregation
  await runTest('Dashboard Data Aggregation', async () => {
    // Simulate what the dashboard does - fetch multiple endpoints
    const [statsResponse, regulatorsResponse, frameworksResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/dashboard/stats`, { timeout: TEST_TIMEOUT }),
      axios.get(`${API_BASE_URL}/api/regulators`, { timeout: TEST_TIMEOUT }),
      axios.get(`${API_BASE_URL}/api/grc-frameworks`, { timeout: TEST_TIMEOUT }),
    ]);
    
    const stats = statsResponse.data;
    const regulators = regulatorsResponse.data.data || [];
    const frameworks = frameworksResponse.data.data || [];
    
    // Simulate dashboard data aggregation
    const dashboardData = {
      regulatorsCount: regulators.length,
      frameworksCount: frameworks.length,
      controlsCount: stats.controls || 0,
      assessmentsCount: stats.assessments || 0,
      organizationsCount: stats.organizations || 0,
      complianceScore: stats.compliance_score || 0,
    };
    
    log(`   Dashboard aggregated data:`, 'yellow');
    log(`     Regulators: ${dashboardData.regulatorsCount}`, 'yellow');
    log(`     Frameworks: ${dashboardData.frameworksCount}`, 'yellow');
    log(`     Controls: ${dashboardData.controlsCount}`, 'yellow');
    log(`     Assessments: ${dashboardData.assessmentsCount}`, 'yellow');
    log(`     Organizations: ${dashboardData.organizationsCount}`, 'yellow');
    log(`     Compliance Score: ${dashboardData.complianceScore}%`, 'yellow');
    log(`   ✓ Dashboard data aggregation simulation successful`, 'green');
  });
};

// Performance tests
const testPerformance = async () => {
  logSection('Performance Tests');

  // Test 12: Response time test
  await runTest('API Response Time', async () => {
    const startTime = Date.now();
    
    await axios.get(`${API_BASE_URL}/api/grc-controls?page=1&limit=20`, {
      timeout: TEST_TIMEOUT
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    log(`   Response time: ${responseTime}ms`, 'yellow');
    
    if (responseTime > 5000) {
      throw new Error(`Response time too slow: ${responseTime}ms`);
    }
    
    log(`   ✓ Response time acceptable`, 'green');
  });

  // Test 13: Concurrent requests
  await runTest('Concurrent Requests', async () => {
    const startTime = Date.now();
    
    const requests = [
      axios.get(`${API_BASE_URL}/api/organizations`, { timeout: TEST_TIMEOUT }),
      axios.get(`${API_BASE_URL}/api/regulators`, { timeout: TEST_TIMEOUT }),
      axios.get(`${API_BASE_URL}/api/grc-frameworks`, { timeout: TEST_TIMEOUT }),
      axios.get(`${API_BASE_URL}/api/dashboard/stats`, { timeout: TEST_TIMEOUT }),
    ];
    
    const responses = await Promise.all(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    log(`   Concurrent requests completed in: ${totalTime}ms`, 'yellow');
    log(`   All ${responses.length} requests successful`, 'yellow');
    
    if (totalTime > 10000) {
      throw new Error(`Concurrent requests too slow: ${totalTime}ms`);
    }
    
    log(`   ✓ Concurrent requests performance acceptable`, 'green');
  });
};

// Main test runner
const runAllTests = async () => {
  log('🚀 Starting UI Database Integration Tests', 'cyan');
  log(`API Base URL: ${API_BASE_URL}`, 'blue');
  
  try {
    await testDatabaseIntegration();
    await testUIComponentIntegration();
    await testPerformance();
  } catch (error) {
    log(`\n💥 Test suite error: ${error.message}`, 'red');
  }
  
  // Print summary
  logSection('Test Results Summary');
  log(`Total Tests: ${testResults.total}`, 'blue');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'cyan');
  
  if (testResults.errors.length > 0) {
    log('\nFailed Tests:', 'red');
    testResults.errors.forEach(({ test, error }) => {
      log(`  • ${test}: ${error}`, 'red');
    });
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Some tests failed!', 'red');
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

// Run tests
runAllTests();