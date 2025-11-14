const axios = require('axios');

async function testMultiTenant() {
  try {
    console.log('🏢 Testing Multi-Tenant System...\n');
    
    // Test 1: Get tenants
    console.log('1. Testing tenants endpoint...');
    try {
      const tenantsResponse = await axios.get('http://localhost:5001/api/tenants');
      console.log('❌ Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Tenants endpoint properly protected');
      }
    }
    
    // Test 2: Login with existing admin user
    console.log('\n2. Testing login with admin user...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('User data:', loginResponse.data.data?.user);
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    // Test 3: Get tenants with authentication
    console.log('\n3. Testing authenticated tenants request...');
    const tenantsResponse = await axios.get('http://localhost:5001/api/tenants', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Tenants request successful!');
    console.log('Tenants:', tenantsResponse.data.data);
    
    // Test 4: Register new user
    console.log('\n4. Testing user registration...');
    const registerResponse = await axios.post('http://localhost:5001/api/auth/register', {
      email: 'testuser@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      role: 'user'
    });
    
    console.log('✅ Registration successful!');
    console.log('New user:', registerResponse.data.data?.user);
    
    // Test 5: Login with new user
    console.log('\n5. Testing login with new user...');
    const newUserLogin = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    console.log('✅ New user login successful!');
    console.log('New user data:', newUserLogin.data.data?.user);
    
    console.log('\n🎉 Multi-tenant system working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMultiTenant();
