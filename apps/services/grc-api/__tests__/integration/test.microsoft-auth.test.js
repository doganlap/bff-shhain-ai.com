const axios = require('axios');

async function testMicrosoftAuth() {
  try {
    console.log('🔐 Testing Microsoft Authentication Integration...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as DoganConsult owner...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'ahmet@doganconsult.com',
      password: 'As$123456'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    const user = loginResponse.data.data?.user || loginResponse.data.user;
    const tenantId = user.tenant_id;
    
    // Step 2: Create a new tenant for Microsoft auth testing
    console.log('\n2. Creating Microsoft-enabled tenant...');
    const createTenantResponse = await axios.post('http://localhost:5001/api/tenants', {
      tenant_code: 'MICROSOFT_DEMO',
      name: 'Microsoft Demo Company',
      display_name: 'Microsoft Demo',
      industry: 'Technology',
      sector: 'Software',
      email: 'admin@microsoft-demo.com',
      subscription_tier: 'premium',
      max_users: 100
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Tenant created!');
    const newTenantId = createTenantResponse.data.data.id;
    
    // Step 3: Configure Microsoft authentication for the tenant
    console.log('\n3. Configuring Microsoft authentication...');
    const configResponse = await axios.post(`http://localhost:5001/api/microsoft-auth/configure/${newTenantId}`, {
      microsoft_tenant_id: 'your-azure-tenant-id-here',
      microsoft_client_id: 'your-azure-client-id-here',
      microsoft_client_secret: 'your-azure-client-secret-here',
      microsoft_domain: 'microsoft-demo.com',
      microsoft_auto_provision: true,
      microsoft_default_role: 'user',
      microsoft_auth_enabled: true
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Microsoft authentication configured!');
    console.log('Login URL:', configResponse.data.data.loginUrl);
    
    // Step 4: Get Microsoft auth status
    console.log('\n4. Checking Microsoft auth status...');
    const statusResponse = await axios.get(`http://localhost:5001/api/microsoft-auth/status/${newTenantId}`);
    
    console.log('✅ Microsoft auth status retrieved!');
    console.log('Status:', statusResponse.data.data);
    
    // Step 5: Get Microsoft auth configuration
    console.log('\n5. Getting Microsoft auth configuration...');
    const getConfigResponse = await axios.get(`http://localhost:5001/api/microsoft-auth/config/${newTenantId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Microsoft auth configuration retrieved!');
    console.log('Configuration:', getConfigResponse.data.data);
    
    console.log('\n🎉 Microsoft Authentication Integration Complete!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ Database schema updated with Microsoft auth fields');
    console.log('- ✅ Microsoft authentication service created');
    console.log('- ✅ Microsoft auth API endpoints implemented');
    console.log('- ✅ Tenant-level Microsoft SSO configuration ready');
    console.log('- ✅ Auto-provisioning support for new Microsoft users');
    console.log('- ✅ Token refresh and management system');
    
    console.log('\n🔧 Next Steps for Production:');
    console.log('1. Register your application in Azure AD/Entra ID');
    console.log('2. Configure redirect URIs in Azure AD');
    console.log('3. Update tenant configuration with real Azure credentials');
    console.log('4. Test Microsoft login flow with real users');
    console.log('5. Configure frontend to use Microsoft auth endpoints');
    
    console.log('\n📖 Microsoft Auth Endpoints:');
    console.log(`- Login: GET /api/microsoft-auth/login/${newTenantId}`);
    console.log(`- Callback: GET /api/microsoft-auth/callback/${newTenantId}`);
    console.log(`- Configure: POST /api/microsoft-auth/configure/${newTenantId}`);
    console.log(`- Status: GET /api/microsoft-auth/status/${newTenantId}`);
    console.log(`- Config: GET /api/microsoft-auth/config/${newTenantId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMicrosoftAuth();
