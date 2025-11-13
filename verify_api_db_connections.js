/**
 * Simple API and Database Connection Verification
 * Shows current status of all connections
 */

const axios = require('axios');

async function verifyConnections() {
    console.log('🔍 VERIFYING API & DATABASE CONNECTIONS');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    try {
        // Test API Health
        console.log('1️⃣ API HEALTH CHECK');
        console.log('-'.repeat(30));
        const healthResponse = await axios.get('http://localhost:3006/api/health');
        console.log('✅ GRC API: RUNNING');
        console.log(`   Status: ${healthResponse.data.status}`);
        console.log(`   Environment: ${healthResponse.data.environment}`);
        console.log(`   Database: ${healthResponse.data.database}`);
        console.log(`   Port: 3006\n`);

        // Test Database Connections via API
        console.log('2️⃣ DATABASE CONNECTIONS VIA API');
        console.log('-'.repeat(30));

        // Test Auth Database
        const usersResponse = await axios.get('http://localhost:3006/api/users-simple');
        console.log(`✅ AUTH Database: ${usersResponse.data.count} users found`);

        // Test Finance Database  
        const tenantsResponse = await axios.get('http://localhost:3006/api/tenants-simple');
        console.log(`✅ FINANCE Database: ${tenantsResponse.data.count} tenants found`);

        // Test Compliance Database
        const frameworksResponse = await axios.get('http://localhost:3006/api/frameworks-simple');
        console.log(`✅ COMPLIANCE Database: ${frameworksResponse.data.count} frameworks found`);

        // Test Cross-Database Operations
        console.log('\n3️⃣ CROSS-DATABASE OPERATIONS');
        console.log('-'.repeat(30));
        const activityResponse = await axios.get('http://localhost:3006/api/dashboard/activity-simple?limit=3');
        console.log(`✅ Multi-DB Query: ${activityResponse.data.data.length} activities from ${activityResponse.data.databases_queried} databases`);
        
        console.log('\n📊 CONNECTION SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ GRC API Service: RUNNING on port 3006');
        console.log('✅ AUTH Database: CONNECTED (shahin_access_control)');
        console.log('✅ FINANCE Database: CONNECTED (grc_master)');
        console.log('✅ COMPLIANCE Database: CONNECTED (shahin_ksa_compliance)');
        console.log('✅ Cross-Database Operations: WORKING');
        
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('='.repeat(60));
        
        return {
            api: 'running',
            databases: {
                auth: 'connected',
                finance: 'connected', 
                compliance: 'connected'
            },
            crossDb: 'working'
        };

    } catch (error) {
        console.error('❌ Connection verification failed:', error.message);
        return { error: error.message };
    }
}

// Run verification
verifyConnections().then(result => {
    if (result.error) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
