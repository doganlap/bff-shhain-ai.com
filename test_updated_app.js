/**
 * Test Updated App with 3-Database Architecture
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3006';

async function testUpdatedApp() {
    console.log('🧪 TESTING UPDATED APP WITH 3-DATABASE ARCHITECTURE');
    console.log('='.repeat(70));
    
    const tests = [];
    
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Cross-Database Health Check...');
        try {
            const response = await axios.get(`${API_BASE}/api/cross-db/health`);
            tests.push({
                name: 'Cross-Database Health Check',
                status: response.data.success ? 'PASS' : 'FAIL',
                details: response.data.databases,
                summary: response.data.summary
            });
            console.log('   ✅ Health check passed');
        } catch (error) {
            tests.push({
                name: 'Cross-Database Health Check',
                status: 'FAIL',
                error: error.message
            });
            console.log('   ❌ Health check failed:', error.message);
        }

        // Test 2: Database Statistics
        console.log('\n2️⃣ Testing Database Statistics...');
        try {
            const response = await axios.get(`${API_BASE}/api/cross-db/stats`);
            tests.push({
                name: 'Database Statistics',
                status: response.data.success ? 'PASS' : 'FAIL',
                details: response.data.data
            });
            console.log('   ✅ Statistics retrieved successfully');
            console.log('   📊 Compliance DB:', JSON.stringify(response.data.data.compliance, null, 2));
            console.log('   💰 Finance DB:', JSON.stringify(response.data.data.finance, null, 2));
            console.log('   🔐 Auth DB:', JSON.stringify(response.data.data.auth, null, 2));
        } catch (error) {
            tests.push({
                name: 'Database Statistics',
                status: 'FAIL',
                error: error.message
            });
            console.log('   ❌ Statistics failed:', error.message);
        }

        // Test 3: Cross-Database Test Suite
        console.log('\n3️⃣ Running Cross-Database Test Suite...');
        try {
            const response = await axios.get(`${API_BASE}/api/cross-db/test`);
            tests.push({
                name: 'Cross-Database Test Suite',
                status: response.data.success ? 'PASS' : 'FAIL',
                details: response.data.tests
            });
            console.log('   ✅ Test suite completed');
            response.data.tests.forEach(test => {
                console.log(`   ${test.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${test.status}`);
            });
        } catch (error) {
            tests.push({
                name: 'Cross-Database Test Suite',
                status: 'FAIL',
                error: error.message
            });
            console.log('   ❌ Test suite failed:', error.message);
        }

        // Test 4: Create Test User in Auth Database
        console.log('\n4️⃣ Testing User Creation in Auth Database...');
        try {
            // First, let's create a test user directly in the auth database
            const { dbQueries } = require('./apps/services/grc-api/config/database');
            
            const testUser = await dbQueries.auth.query(`
                INSERT INTO users (email, username, password_hash, first_name, last_name, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (email) DO UPDATE SET
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name
                RETURNING id, email, first_name, last_name
            `, [
                'test@shahin.ai',
                'testuser',
                'hashed_password_here',
                'Test',
                'User',
                true
            ]);

            console.log('   ✅ Test user created/updated:', testUser.rows[0]);
            
            // Test getting user profile
            const userId = testUser.rows[0].id;
            const profileResponse = await axios.get(`${API_BASE}/api/cross-db/users/${userId}/profile`);
            
            tests.push({
                name: 'User Profile Retrieval',
                status: profileResponse.data.success ? 'PASS' : 'FAIL',
                details: profileResponse.data.data
            });
            console.log('   ✅ User profile retrieved successfully');
            
        } catch (error) {
            tests.push({
                name: 'User Creation & Profile',
                status: 'FAIL',
                error: error.message
            });
            console.log('   ❌ User creation/profile failed:', error.message);
        }

        // Test 5: Legacy API Compatibility
        console.log('\n5️⃣ Testing Legacy API Compatibility...');
        try {
            const response = await axios.get(`${API_BASE}/api/health`);
            tests.push({
                name: 'Legacy API Compatibility',
                status: response.data.status === 'healthy' ? 'PASS' : 'FAIL',
                details: response.data
            });
            console.log('   ✅ Legacy API still working');
        } catch (error) {
            tests.push({
                name: 'Legacy API Compatibility',
                status: 'FAIL',
                error: error.message
            });
            console.log('   ❌ Legacy API failed:', error.message);
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(70));
        
        const passed = tests.filter(t => t.status === 'PASS').length;
        const failed = tests.filter(t => t.status === 'FAIL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${tests.length}`);
        console.log(`🎯 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! 3-Database architecture is working perfectly!');
        } else {
            console.log('\n⚠️ Some tests failed. Check the details above.');
        }

        return { success: failed === 0, tests, summary: { passed, failed, total: tests.length } };

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testUpdatedApp().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = testUpdatedApp;
