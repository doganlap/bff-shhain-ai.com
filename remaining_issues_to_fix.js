/**
 * Remaining Issues Analysis & Fix Plan
 * Identifies what still needs to be fixed or tested
 */

const axios = require('axios');

async function analyzeRemainingIssues() {
  console.log('🔍 ANALYZING REMAINING ISSUES TO FIX');
  console.log('='.repeat(80));

  const issues = {
    critical: [],
    moderate: [],
    minor: [],
    testing_needed: []
  };

  const API_BASE = 'http://localhost:3006';

  // Test 1: Check Advanced Analytics Endpoints (404 errors from previous test)
  console.log('1️⃣ TESTING ADVANCED ANALYTICS ENDPOINTS');
  console.log('-'.repeat(50));

  const analyticsEndpoints = [
    '/api/analytics/multi-dimensional',
    '/api/analytics/compliance-trends', 
    '/api/analytics/risk-heatmap',
    '/api/analytics/user-activity-patterns',
    '/api/analytics/financial-performance',
    '/api/analytics/system-performance'
  ];

  for (const endpoint of analyticsEndpoints) {
    try {
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' },
        params: { range: '30d' },
        timeout: 5000
      });
      console.log(`   ✅ ${endpoint}: Working`);
    } catch (error) {
      const issue = {
        endpoint,
        status: error.response?.status || 'TIMEOUT',
        error: error.message
      };
      
      if (error.response?.status === 404) {
        issues.critical.push({
          type: 'MISSING_ENDPOINT',
          description: `Analytics endpoint ${endpoint} not found`,
          fix: 'Route not registered in server.js or endpoint not implemented',
          ...issue
        });
      } else if (error.response?.status === 500) {
        issues.moderate.push({
          type: 'SERVER_ERROR',
          description: `Server error in ${endpoint}`,
          fix: 'Check database queries and error handling',
          ...issue
        });
      }
      console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }

  // Test 2: Check Individual Database Endpoints (500 errors from previous test)
  console.log('\n2️⃣ TESTING INDIVIDUAL DATABASE ENDPOINTS');
  console.log('-'.repeat(50));

  const dbEndpoints = [
    { name: 'Tenants', url: '/api/tenants', db: 'finance' },
    { name: 'Frameworks', url: '/api/frameworks', db: 'compliance' },
    { name: 'Organizations', url: '/api/organizations', db: 'finance' },
    { name: 'Users', url: '/api/users', db: 'auth' },
    { name: 'Controls', url: '/api/controls', db: 'compliance' }
  ];

  for (const endpoint of dbEndpoints) {
    try {
      const response = await axios.get(`${API_BASE}${endpoint.url}`, {
        headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' },
        timeout: 5000
      });
      console.log(`   ✅ ${endpoint.name} (${endpoint.db}): ${response.data?.data?.length || 0} records`);
    } catch (error) {
      const issue = {
        endpoint: endpoint.url,
        database: endpoint.db,
        status: error.response?.status || 'TIMEOUT',
        error: error.message
      };

      if (error.response?.status === 500) {
        issues.moderate.push({
          type: 'DATABASE_ERROR',
          description: `Database error in ${endpoint.name} endpoint`,
          fix: 'Check database connection and table structure',
          ...issue
        });
      }
      console.log(`   ❌ ${endpoint.name} (${endpoint.db}): ${error.response?.status || error.message}`);
    }
  }

  // Test 3: Check Real-time Features
  console.log('\n3️⃣ TESTING REAL-TIME FEATURES');
  console.log('-'.repeat(50));

  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/activity`, {
      headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' },
      timeout: 5000
    });
    console.log(`   ✅ Real-time Activity: ${response.data?.data?.length || 0} activities`);
  } catch (error) {
    issues.moderate.push({
      type: 'REALTIME_ERROR',
      description: 'Real-time activity feed not working',
      fix: 'Check dashboard activity endpoint and database queries',
      endpoint: '/api/dashboard/activity',
      status: error.response?.status || 'TIMEOUT',
      error: error.message
    });
    console.log(`   ❌ Real-time Activity: ${error.response?.status || error.message}`);
  }

  // Test 4: Check Cross-Database Relations Data
  console.log('\n4️⃣ CHECKING CROSS-DATABASE RELATIONS DATA');
  console.log('-'.repeat(50));

  try {
    const response = await axios.get(`${API_BASE}/api/cross-db/stats`);
    const data = response.data.data;
    
    // Check if we have meaningful data
    const complianceData = data.compliance;
    const financeData = data.finance;
    const authData = data.auth;

    if (parseInt(authData.total_users) === 0) {
      issues.minor.push({
        type: 'NO_TEST_DATA',
        description: 'No users in auth database for testing',
        fix: 'Create test users with proper roles and permissions'
      });
    }

    if (parseInt(complianceData.total_assessments) < 5) {
      issues.minor.push({
        type: 'LIMITED_TEST_DATA',
        description: 'Limited assessment data for testing',
        fix: 'Create more test assessments for comprehensive testing'
      });
    }

    console.log(`   📊 Auth Users: ${authData.total_users}`);
    console.log(`   📊 Assessments: ${complianceData.total_assessments}`);
    console.log(`   📊 Tenants: ${financeData.total_tenants}`);

  } catch (error) {
    issues.critical.push({
      type: 'CROSS_DB_STATS_ERROR',
      description: 'Cross-database statistics not working',
      fix: 'Check cross-database routes and queries'
    });
    console.log(`   ❌ Cross-DB Stats: ${error.message}`);
  }

  // Test 5: Frontend Connection Test
  console.log('\n5️⃣ TESTING FRONTEND CONNECTION');
  console.log('-'.repeat(50));

  try {
    // Test if frontend can reach the API
    const response = await axios.get('http://localhost:5175', { timeout: 3000 });
    console.log(`   ✅ Frontend: Reachable`);
  } catch (error) {
    issues.testing_needed.push({
      type: 'FRONTEND_NOT_RUNNING',
      description: 'Frontend server not running or not reachable',
      fix: 'Start frontend with: npm run dev in apps/web directory'
    });
    console.log(`   ⚠️ Frontend: Not reachable (${error.code})`);
  }

  // Test 6: Check Missing Database Schema Elements
  console.log('\n6️⃣ CHECKING DATABASE SCHEMA COMPLETENESS');
  console.log('-'.repeat(50));

  const { Client } = require('pg');
  
  try {
    // Check if all expected tables exist
    const databases = {
      auth: { database: 'shahin_access_control', expectedTables: ['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'user_sessions'] },
      finance: { database: 'grc_master', expectedTables: ['tenants', 'organizations', 'tenant_licenses', 'licenses', 'subscriptions'] },
      compliance: { database: 'shahin_ksa_compliance', expectedTables: ['assessments', 'frameworks', 'framework_controls'] }
    };

    for (const [dbName, config] of Object.entries(databases)) {
      const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: config.database,
        password: 'postgres',
        port: 5432,
      });

      try {
        await client.connect();
        
        const result = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        const existingTables = result.rows.map(row => row.table_name);
        const missingTables = config.expectedTables.filter(table => !existingTables.includes(table));
        
        if (missingTables.length > 0) {
          issues.moderate.push({
            type: 'MISSING_TABLES',
            description: `Missing tables in ${dbName} database`,
            fix: `Create missing tables: ${missingTables.join(', ')}`,
            database: dbName,
            missingTables
          });
          console.log(`   ❌ ${dbName.toUpperCase()}: Missing tables - ${missingTables.join(', ')}`);
        } else {
          console.log(`   ✅ ${dbName.toUpperCase()}: All expected tables present`);
        }
        
        await client.end();
      } catch (error) {
        console.log(`   ❌ ${dbName.toUpperCase()}: Connection failed - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Schema check failed: ${error.message}`);
  }

  // Summary and Fix Plan
  console.log('\n' + '='.repeat(80));
  console.log('📋 REMAINING ISSUES ANALYSIS');
  console.log('='.repeat(80));

  console.log(`🔴 Critical Issues: ${issues.critical.length}`);
  issues.critical.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      Fix: ${issue.fix}`);
  });

  console.log(`🟡 Moderate Issues: ${issues.moderate.length}`);
  issues.moderate.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      Fix: ${issue.fix}`);
  });

  console.log(`🟢 Minor Issues: ${issues.minor.length}`);
  issues.minor.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      Fix: ${issue.fix}`);
  });

  console.log(`🔵 Testing Needed: ${issues.testing_needed.length}`);
  issues.testing_needed.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.description}`);
    console.log(`      Fix: ${issue.fix}`);
  });

  // Priority Fix List
  console.log('\n🎯 PRIORITY FIX LIST:');
  console.log('-'.repeat(80));
  
  const totalIssues = issues.critical.length + issues.moderate.length + issues.minor.length + issues.testing_needed.length;
  
  if (totalIssues === 0) {
    console.log('🎉 NO ISSUES FOUND! System is fully operational!');
  } else {
    console.log('📝 IMMEDIATE FIXES NEEDED:');
    
    if (issues.critical.length > 0) {
      console.log('\n🔴 CRITICAL (Fix First):');
      issues.critical.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }
    
    if (issues.moderate.length > 0) {
      console.log('\n🟡 MODERATE (Fix Next):');
      issues.moderate.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }
    
    if (issues.minor.length > 0) {
      console.log('\n🟢 MINOR (Fix When Possible):');
      issues.minor.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }
  }

  console.log('\n📊 OVERALL STATUS:');
  const criticalCount = issues.critical.length;
  const moderateCount = issues.moderate.length;
  
  if (criticalCount === 0 && moderateCount === 0) {
    console.log('🎉 SYSTEM STATUS: FULLY OPERATIONAL');
  } else if (criticalCount === 0) {
    console.log('✅ SYSTEM STATUS: MOSTLY OPERATIONAL (Minor fixes needed)');
  } else {
    console.log('⚠️ SYSTEM STATUS: NEEDS ATTENTION (Critical fixes required)');
  }

  return {
    totalIssues,
    critical: issues.critical,
    moderate: issues.moderate,
    minor: issues.minor,
    testing_needed: issues.testing_needed,
    status: criticalCount === 0 && moderateCount === 0 ? 'OPERATIONAL' : 'NEEDS_FIXES'
  };
}

// Run analysis if executed directly
if (require.main === module) {
  analyzeRemainingIssues().then(result => {
    console.log(`\n🎯 Analysis complete. Status: ${result.status}`);
    process.exit(result.status === 'OPERATIONAL' ? 0 : 1);
  });
}

module.exports = analyzeRemainingIssues;
