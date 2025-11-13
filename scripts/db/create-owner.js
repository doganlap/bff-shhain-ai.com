const axios = require('axios');

async function createOwner() {
  try {
    console.log('👤 Creating DoganConsult Owner Account...\n');
    
    // Create DoganConsult tenant first
    console.log('1. Creating DoganConsult tenant...');
    
    // Skip registration, user already exists
    console.log('2. User already exists, proceeding to login...');
    
    // Test login
    console.log('\n3. Testing owner login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'ahmet@doganconsult.com',
      password: 'As$123456'
    });
    
    console.log('✅ Owner login successful!');
    console.log('Login data:', loginResponse.data.data?.user);
    
    // Get tenants
    console.log('\n4. Getting tenants...');
    const ownerToken = loginResponse.data.data?.token || loginResponse.data.token;
    const tenantsResponse = await axios.get('http://localhost:5001/api/tenants', {
      headers: {
        'Authorization': `Bearer ${ownerToken}`
      }
    });
    
    console.log('✅ Tenants retrieved!');
    console.log('Available tenants:', tenantsResponse.data.data);
    
    console.log('\n🎉 DoganConsult owner account created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: ahmet@doganconsult.com');
    console.log('Password: As$123456');
    console.log('Role: Super Admin');
    
  } catch (error) {
    console.error('❌ Creation failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createOwner();
