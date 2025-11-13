#!/usr/bin/env node

/**
 * End-to-End Assessment Process Test
 * Tests the complete assessment workflow for a subscribed tenant
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3006';
const TEST_TENANT = {
  tenant_code: 'acme-corp',
  email: 'admin@acmecorp.com',
  password: 'test123',
  sector: 'finance',
  industry: 'banking'
};

// Test state
let authToken = null;
let tenantId = null;
let organizationId = null;
let assessmentId = null;
let responseId = null;

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  steps: []
};

/**
 * Utility function to make API requests
 */
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Log test step result
 */
function logStep(stepName, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${stepName}`);
  if (details) console.log(`   ${details}`);
  
  testResults.steps.push({ stepName, success, details });
  if (success) testResults.passed++;
  else testResults.failed++;
}

/**
 * STEP 1: Test API Health Check
 */
async function testHealthCheck() {
  console.log('\n🏥 STEP 1: Testing API Health Check...');
  
  const result = await apiRequest('GET', '/api/health');
  
  if (result.success && result.data.status === 'healthy') {
    logStep('API Health Check', true, 'API is running and healthy');
    return true;
  } else {
    logStep('API Health Check', false, `API not healthy: ${result.error}`);
    return false;
  }
}

/**
 * STEP 2: Test Tenant Authentication
 */
async function testAuthentication() {
  console.log('\n🔐 STEP 2: Testing Tenant Authentication...');
  
  const loginData = {
    email: TEST_TENANT.email,
    password: TEST_TENANT.password,
    tenant_code: TEST_TENANT.tenant_code
  };
  
  const result = await apiRequest('POST', '/api/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    tenantId = result.data.user?.tenant_id;
    logStep('Tenant Authentication', true, `Authenticated successfully, tenant_id: ${tenantId}`);
    return true;
  } else {
    logStep('Tenant Authentication', false, `Login failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 3: Test Auto Assessment Preview
 */
async function testAutoAssessmentPreview() {
  console.log('\n🤖 STEP 3: Testing Auto Assessment Preview...');
  
  const result = await apiRequest('GET', `/api/auto-assessment/regulators/${TEST_TENANT.sector}`);
  
  if (result.success && result.data.regulators) {
    const regulatorCount = result.data.regulators.length;
    logStep('Auto Assessment Preview', true, `Found ${regulatorCount} regulators for ${TEST_TENANT.sector} sector`);
    return true;
  } else {
    logStep('Auto Assessment Preview', false, `Preview failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 4: Test Assessment Creation
 */
async function testAssessmentCreation() {
  console.log('\n📝 STEP 4: Testing Assessment Creation...');
  
  // First get organization ID
  const orgResult = await apiRequest('GET', '/api/organizations');
  if (!orgResult.success || !orgResult.data.data || orgResult.data.data.length === 0) {
    logStep('Get Organization', false, 'No organizations found');
    return false;
  }
  
  organizationId = orgResult.data.data[0].id;
  logStep('Get Organization', true, `Organization ID: ${organizationId}`);
  
  // Create assessment
  const assessmentData = {
    name: 'E2E Test - SAMA Cybersecurity Assessment',
    description: 'End-to-end test assessment for SAMA compliance',
    assessment_type: 'compliance',
    priority: 'high',
    tenant_id: tenantId,
    organization_id: organizationId,
    ai_generated: true
  };
  
  const result = await apiRequest('POST', '/api/assessments', assessmentData);
  
  if (result.success && result.data.data?.id) {
    assessmentId = result.data.data.id;
    logStep('Assessment Creation', true, `Assessment created with ID: ${assessmentId}`);
    return true;
  } else {
    logStep('Assessment Creation', false, `Creation failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 5: Test Auto Assessment Generation
 */
async function testAutoAssessmentGeneration() {
  console.log('\n🔍 STEP 5: Testing Auto Assessment Generation...');
  
  const generationData = {
    tenant_id: tenantId,
    assessment_id: assessmentId,
    sector: TEST_TENANT.sector,
    regulators: ['SAMA', 'NCA'],
    assessment_type: 'comprehensive'
  };
  
  const result = await apiRequest('POST', '/api/auto-assessment/generate', generationData);
  
  if (result.success) {
    const questionCount = result.data.questions?.length || 0;
    logStep('Auto Assessment Generation', true, `Generated ${questionCount} questions`);
    return true;
  } else {
    logStep('Auto Assessment Generation', false, `Generation failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 6: Test Assessment Response Submission
 */
async function testResponseSubmission() {
  console.log('\n✍️ STEP 6: Testing Assessment Response Submission...');
  
  const responseData = {
    assessment_id: assessmentId,
    control_id: null, // Will be set by the API
    question_text: 'Do you have documented access control policies?',
    response_type: 'text',
    response_value: 'Yes, we have comprehensive access control policies documented and implemented across all systems.',
    compliance_score: 85.5,
    is_required: true,
    ai_generated_question: true,
    ai_predicted_score: 85.0,
    ai_prediction_confidence: 0.92
  };
  
  const result = await apiRequest('POST', '/api/assessment-responses', responseData);
  
  if (result.success && result.data.data?.id) {
    responseId = result.data.data.id;
    logStep('Response Submission', true, `Response submitted with ID: ${responseId}`);
    return true;
  } else {
    logStep('Response Submission', false, `Submission failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 7: Test Assessment Completion
 */
async function testAssessmentCompletion() {
  console.log('\n✅ STEP 7: Testing Assessment Completion...');
  
  const result = await apiRequest('PUT', `/api/assessments/${assessmentId}`, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });
  
  if (result.success) {
    logStep('Assessment Completion', true, 'Assessment marked as completed');
    return true;
  } else {
    logStep('Assessment Completion', false, `Completion failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 8: Test Assessment Retrieval
 */
async function testAssessmentRetrieval() {
  console.log('\n📊 STEP 8: Testing Assessment Retrieval...');
  
  const result = await apiRequest('GET', `/api/assessments/${assessmentId}`);
  
  if (result.success && result.data.data) {
    const assessment = result.data.data;
    logStep('Assessment Retrieval', true, `Retrieved assessment: ${assessment.name} (Status: ${assessment.status})`);
    return true;
  } else {
    logStep('Assessment Retrieval', false, `Retrieval failed: ${result.error}`);
    return false;
  }
}

/**
 * STEP 9: Test Assessment List for Tenant
 */
async function testAssessmentList() {
  console.log('\n📋 STEP 9: Testing Assessment List for Tenant...');
  
  const result = await apiRequest('GET', `/api/assessments?tenant_id=${tenantId}`);
  
  if (result.success && result.data.data) {
    const assessmentCount = result.data.data.length;
    logStep('Assessment List', true, `Found ${assessmentCount} assessments for tenant`);
    return true;
  } else {
    logStep('Assessment List', false, `List retrieval failed: ${result.error}`);
    return false;
  }
}

/**
 * Main test execution
 */
async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End Assessment Process Test');
  console.log('=' .repeat(60));
  
  const testSteps = [
    testHealthCheck,
    testAuthentication,
    testAutoAssessmentPreview,
    testAssessmentCreation,
    testAutoAssessmentGeneration,
    testResponseSubmission,
    testAssessmentCompletion,
    testAssessmentRetrieval,
    testAssessmentList
  ];
  
  let allPassed = true;
  
  for (const testStep of testSteps) {
    try {
      const passed = await testStep();
      if (!passed) {
        allPassed = false;
        // Continue with other tests even if one fails
      }
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Test step failed with error: ${error.message}`);
      allPassed = false;
    }
  }
  
  // Print final results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  console.log(`🎯 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Assessment process is working end-to-end.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the details above.');
  }
  
  // Save detailed results to file
  const resultsFile = path.join(__dirname, 'test_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)
    },
    steps: testResults.steps,
    testData: {
      tenantId,
      organizationId,
      assessmentId,
      responseId
    }
  }, null, 2));
  
  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  
  return allPassed;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runEndToEndTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runEndToEndTest };
