#!/usr/bin/env node
const https = require('https');
const http = require('http');

/**
 * GRC Project Health Check and Verification Script
 * Tests API connectivity, CORS configuration, and deployment status
 */

const config = {
  bffUrl: 'https://bff-shahin-ai-com.vercel.app',
  webUrl: 'https://app-shahin-ai-com.vercel.app',
  timeout: 10000,
  expectedCorsOrigins: [
    'https://app-shahin-ai-com.vercel.app',
    'https://app-shahin-ai-1uwk5615e-donganksa.vercel.app',
    'https://grc-dashboard-ivory.vercel.app',
    'https://shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://dogan-ai.com'
  ]
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'GRC-Health-Check/1.0',
        ...options.headers
      },
      timeout: config.timeout
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error(`Request timeout for ${url}`)));
    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);

  try {
    const response = await makeRequest(url);

    if (response.statusCode === expectedStatus) {
      console.log(`   ✅ Status: ${response.statusCode} (Expected: ${expectedStatus})`);
      return { success: true, response };
    } else {
      console.log(`   ⚠️  Status: ${response.statusCode} (Expected: ${expectedStatus})`);
      return { success: false, response, reason: `Unexpected status code` };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error, reason: error.message };
  }
}

async function testCorsHeaders(url) {
  console.log(`\n🔒 Testing CORS headers for ${url}...`);

  try {
    const response = await makeRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://app-shahin-ai-com.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });

    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };

    console.log(`   📋 CORS Headers:`);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        console.log(`      ${key}: ${value}`);
      }
    });

    // Check if origin is allowed
    const allowedOrigin = corsHeaders['access-control-allow-origin'];
    if (allowedOrigin === 'https://app-shahin-ai-com.vercel.app' || allowedOrigin === '*') {
      console.log(`   ✅ CORS origin check passed`);
      return { success: true, corsHeaders };
    } else {
      console.log(`   ⚠️  CORS origin not properly configured`);
      return { success: false, corsHeaders, reason: 'Invalid CORS origin' };
    }

  } catch (error) {
    console.log(`   ❌ CORS test failed: ${error.message}`);
    return { success: false, error, reason: error.message };
  }
}

async function testApiEndpoints() {
  console.log(`\n🔍 Testing API endpoints...`);

  const endpoints = [
    { name: 'Health Check', path: '/api/health', expectedStatus: 200 },
    { name: 'API Status', path: '/api/status', expectedStatus: 200 },
    { name: 'Auth Check', path: '/api/auth/status', expectedStatus: [200, 401] }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    const url = `${config.bffUrl}${endpoint.path}`;
    const result = await testEndpoint(endpoint.name, url, endpoint.expectedStatus);
    results.push({ ...endpoint, ...result });

    // Test CORS for API endpoints
    if (result.success) {
      const corsResult = await testCorsHeaders(url);
      result.corsTest = corsResult;
    }
  }

  return results;
}

async function testWebApp() {
  console.log(`\n🌐 Testing Web Application...`);

  const webTests = [
    { name: 'Web App Homepage', url: config.webUrl, expectedStatus: 200 },
    { name: 'Web App Assets', url: `${config.webUrl}/assets/`, expectedStatus: [200, 404] }
  ];

  const results = [];
  for (const test of webTests) {
    const result = await testEndpoint(test.name, test.url, test.expectedStatus);
    results.push({ ...test, ...result });
  }

  return results;
}

function generateReport(apiResults, webResults) {
  console.log(`\n📊 HEALTH CHECK REPORT`);
  console.log(`====================================================`);

  const allTests = [...apiResults, ...webResults];
  const successCount = allTests.filter(test => test.success).length;
  const totalTests = allTests.length;

  console.log(`\n✅ Successful Tests: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log(`🎉 All tests passed! Your GRC application is working correctly.`);
  } else {
    console.log(`⚠️  Some tests failed. Review the results above for details.`);
  }

  console.log(`\n🔧 Configuration Summary:`);
  console.log(`   BFF URL: ${config.bffUrl}`);
  console.log(`   Web URL: ${config.webUrl}`);
  console.log(`   CORS Origins: ${config.expectedCorsOrigins.length} configured`);

  console.log(`\n🐛 Troubleshooting Tips:`);
  console.log(`   1. If BFF endpoints fail: Check Vercel deployment logs`);
  console.log(`   2. If CORS fails: Verify FRONTEND_ORIGINS environment variable`);
  console.log(`   3. If Web App fails: Check DNS propagation and deployment status`);
  console.log(`   4. Wait 2-5 minutes after deployment for changes to propagate`);

  console.log(`\n📱 Quick Test Commands:`);
  console.log(`   curl ${config.bffUrl}/api/health`);
  console.log(`   curl -H "Origin: ${config.webUrl}" ${config.bffUrl}/api/health`);

  return successCount === totalTests;
}

async function main() {
  console.log(`🚀 Starting GRC Project Health Check...`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`   BFF URL: ${config.bffUrl}`);
  console.log(`   Web URL: ${config.webUrl}`);

  try {
    // Test API endpoints
    const apiResults = await testApiEndpoints();

    // Test web application
    const webResults = await testWebApp();

    // Generate report
    const allPassed = generateReport(apiResults, webResults);

    if (allPassed) {
      console.log(`\n✨ Health check completed successfully!`);
      process.exit(0);
    } else {
      console.log(`\n⚠️  Health check completed with issues.`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Health check failed:`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testEndpoint, testCorsHeaders };
