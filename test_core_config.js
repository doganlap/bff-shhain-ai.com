const { healthCheck, dbQueries } = require('./core_business_config');

async function testCoreConfiguration() {
  console.log('🧪 TESTING CORE BUSINESS DATABASE CONFIGURATION');
  console.log('='.repeat(60));
  
  try {
    // Test health check
    console.log('🔍 Testing database connections...\n');
    const health = await healthCheck();
    
    Object.entries(health).forEach(([dbName, status]) => {
      if (status.status === 'healthy') {
        console.log(`✅ ${dbName.toUpperCase()}: ${status.database} - Connected`);
      } else {
        console.log(`❌ ${dbName.toUpperCase()}: ${status.error}`);
      }
    });

    // Test basic queries
    console.log('\n🔍 Testing basic queries...\n');
    
    // Test auth database
    const rolesResult = await dbQueries.auth.query('SELECT COUNT(*) as count FROM roles');
    console.log(`✅ AUTH: ${rolesResult.rows[0].count} roles found`);
    
    // Test compliance database
    const assessmentsResult = await dbQueries.compliance.query('SELECT COUNT(*) as count FROM assessments');
    console.log(`✅ COMPLIANCE: ${assessmentsResult.rows[0].count} assessments found`);
    
    // Test finance database
    const tenantsResult = await dbQueries.finance.query('SELECT COUNT(*) as count FROM tenants');
    console.log(`✅ FINANCE: ${tenantsResult.rows[0].count} tenants found`);

    console.log('\n🎉 ALL TESTS PASSED - CORE CONFIGURATION WORKING!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCoreConfiguration();
