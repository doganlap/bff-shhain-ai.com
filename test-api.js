const axios = require('axios');

async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API...');

    const response = await axios.get('http://localhost:3006/api/dashboard/stats', {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
      }
    });

    console.log('✅ API Response:', response.status);
    console.log('📊 Dashboard Data:', response.data);

  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
  }
}

testDashboardAPI();
