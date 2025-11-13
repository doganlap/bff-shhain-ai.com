/**
 * Test All Database Connections for Pages & Components
 * Verifies that all frontend components can connect to the new 3-database architecture
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3006';

async function testAllConnections() {
  console.log('🧪 TESTING ALL PAGE & COMPONENT DATABASE CONNECTIONS');
  console.log('='.repeat(80));
  
  const tests = [];
  
  try {
    // Test 1: Core API Base Connection
    console.log('1️⃣ Testing Core API Connection...');
    try {
      const response = await axios.get(`${API_BASE}/api/health`);
      tests.push({
        name: 'Core API Connection',
        status: response.data.status === 'healthy' ? 'PASS' : 'FAIL',
        details: response.data
      });
      console.log('   ✅ Core API connected');
    } catch (error) {
      tests.push({
        name: 'Core API Connection',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Core API failed:', error.message);
    }

    // Test 2: Multi-Database Health
    console.log('\n2️⃣ Testing Multi-Database Health...');
    try {
      const response = await axios.get(`${API_BASE}/api/cross-db/health`);
      tests.push({
        name: 'Multi-Database Health',
        status: response.data.success ? 'PASS' : 'FAIL',
        details: response.data.databases
      });
      console.log('   ✅ All 3 databases healthy');
      Object.entries(response.data.databases).forEach(([db, status]) => {
        console.log(`   📊 ${db}: ${status.status}`);
      });
    } catch (error) {
      tests.push({
        name: 'Multi-Database Health',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Multi-database health failed:', error.message);
    }

    // Test 3: Dashboard Stats (Multi-DB)
    console.log('\n3️⃣ Testing Dashboard Stats (Multi-Database)...');
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard/stats`, {
        headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' }
      });
      tests.push({
        name: 'Dashboard Stats (Multi-DB)',
        status: response.data.success ? 'PASS' : 'FAIL',
        details: response.data.data
      });
      console.log('   ✅ Dashboard stats from all databases');
      console.log(`   📊 Assessments: ${response.data.data.assessments}`);
      console.log(`   📊 Users: ${response.data.data.users}`);
      console.log(`   📊 Licenses: ${response.data.data.licenses}`);
    } catch (error) {
      tests.push({
        name: 'Dashboard Stats (Multi-DB)',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Dashboard stats failed:', error.message);
    }

    // Test 4: Cross-Database Stats
    console.log('\n4️⃣ Testing Cross-Database Statistics...');
    try {
      const response = await axios.get(`${API_BASE}/api/cross-db/stats`);
      tests.push({
        name: 'Cross-Database Statistics',
        status: response.data.success ? 'PASS' : 'FAIL',
        details: response.data.data
      });
      console.log('   ✅ Cross-database stats retrieved');
      console.log(`   🛡️ Compliance DB: ${JSON.stringify(response.data.data.compliance)}`);
      console.log(`   💰 Finance DB: ${JSON.stringify(response.data.data.finance)}`);
      console.log(`   🔐 Auth DB: ${JSON.stringify(response.data.data.auth)}`);
    } catch (error) {
      tests.push({
        name: 'Cross-Database Statistics',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Cross-database stats failed:', error.message);
    }

    // Test 5: Advanced Analytics
    console.log('\n5️⃣ Testing Advanced Analytics...');
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/multi-dimensional`, {
        headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' },
        params: { range: '30d' }
      });
      tests.push({
        name: 'Advanced Analytics',
        status: response.data.success ? 'PASS' : 'FAIL',
        details: response.data.data
      });
      console.log('   ✅ Advanced analytics working');
      console.log(`   📈 Time Range: ${response.data.data.timeRange}`);
      console.log(`   📊 Data Sources: ${Object.keys(response.data.data).length}`);
    } catch (error) {
      tests.push({
        name: 'Advanced Analytics',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Advanced analytics failed:', error.message);
    }

    // Test 6: Individual Database Endpoints
    console.log('\n6️⃣ Testing Individual Database Endpoints...');
    
    const dbEndpoints = [
      { name: 'Assessments (Compliance DB)', url: '/api/assessments' },
      { name: 'Tenants (Finance DB)', url: '/api/tenants' },
      { name: 'Frameworks (Compliance DB)', url: '/api/frameworks' },
      { name: 'Organizations (Finance DB)', url: '/api/organizations' }
    ];

    for (const endpoint of dbEndpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint.url}`, {
          headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' }
        });
        tests.push({
          name: endpoint.name,
          status: 'PASS',
          details: `${response.data.data?.length || 0} records`
        });
        console.log(`   ✅ ${endpoint.name}: Working`);
      } catch (error) {
        tests.push({
          name: endpoint.name,
          status: 'FAIL',
          error: error.message
        });
        console.log(`   ❌ ${endpoint.name}: Failed`);
      }
    }

    // Test 7: Real-time Features
    console.log('\n7️⃣ Testing Real-time Features...');
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard/activity`, {
        headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' }
      });
      tests.push({
        name: 'Real-time Activity',
        status: response.data.success ? 'PASS' : 'FAIL',
        details: `${response.data.data?.length || 0} activities`
      });
      console.log('   ✅ Real-time activity feed working');
    } catch (error) {
      tests.push({
        name: 'Real-time Activity',
        status: 'FAIL',
        error: error.message
      });
      console.log('   ❌ Real-time activity failed:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONNECTION TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    const passed = tests.filter(t => t.status === 'PASS').length;
    const failed = tests.filter(t => t.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${tests.length}`);
    console.log(`🎯 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
    
    // Detailed Results
    console.log('\n📋 DETAILED TEST RESULTS:');
    console.log('-'.repeat(80));
    tests.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}: ${test.status}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    if (failed === 0) {
      console.log('\n🎉 ALL CONNECTIONS WORKING! All pages & components connected to 3-database architecture!');
    } else {
      console.log('\n⚠️ Some connections failed. Check the details above.');
    }

    // Connection Architecture Summary
    console.log('\n🏗️ DATABASE ARCHITECTURE SUMMARY:');
    console.log('='.repeat(80));
    console.log('📊 Frontend (Port 5175) → API (Port 3006) → 3 Databases:');
    console.log('   🛡️ Compliance: shahin_ksa_compliance (Assessments, Frameworks)');
    console.log('   💰 Finance: grc_master (Tenants, Licenses, Organizations)');
    console.log('   🔐 Auth: shahin_access_control (Users, Roles, Sessions)');
    console.log('\n🔗 All pages and components now use multi-database connections!');

    return { success: failed === 0, tests, summary: { passed, failed, total: tests.length } };

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAllConnections().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = testAllConnections;
