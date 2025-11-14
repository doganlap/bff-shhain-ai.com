/**
 * KSA Payment Integration Test Script
 * Tests Saudi Arabia payment features including SAR currency, VAT, and Mada cards
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test data
const testCustomer = {
  email: 'test.customer@example.sa',
  name: 'أحمد محمد عبدالله',
  phone: '+966501234567',
  region: 'KSA',
  metadata: {
    vat_number: '300000000000003',
    company_name: 'شركة المثال المحدودة',
    address: {
      city: 'Riyadh',
      country: 'SA'
    }
  }
};

const testPayment = {
  amount: 1000, // 1000 SAR before VAT
  currency: 'sar',
  region: 'KSA',
  metadata: {
    invoice_number: 'INV-2024-KSA-001',
    product: 'Enterprise GRC License',
    duration: 'Annual'
  }
};

// API Helper
async function apiCall(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test Functions

async function testKSAConfig() {
  console.log('\n📋 Test 1: Get KSA Configuration');
  console.log('=' .repeat(60));

  const result = await apiCall('GET', '/api/payments/ksa/config');

  if (result.success) {
    console.log('✅ SUCCESS');
    console.log('Currency:', result.data.config.currency);
    console.log('VAT Rate:', result.data.config.vatRate * 100 + '%');
    console.log('Locale:', result.data.config.locale);
    console.log('Supported Payment Methods:', result.data.config.supportedPaymentMethods.join(', '));
  } else {
    console.log('❌ FAILED:', result.error);
  }

  return result;
}

async function testVATCalculation() {
  console.log('\n💰 Test 2: Calculate VAT (15%)');
  console.log('=' .repeat(60));

  const amounts = [1000, 5000, 10000];

  for (const amount of amounts) {
    const result = await apiCall('POST', '/api/payments/ksa/calculate-vat', { amount });

    if (result.success) {
      const calc = result.data.calculation;
      console.log(`\n  Amount: ${amount} SAR`);
      console.log(`  Subtotal: ${calc.subtotal} SAR`);
      console.log(`  VAT (15%): ${calc.vat} SAR`);
      console.log(`  Total: ${calc.total} SAR ✅`);
    } else {
      console.log(`  ❌ FAILED for ${amount} SAR:`, result.error);
    }
  }
}

async function testCreateKSACustomer() {
  console.log('\n👤 Test 3: Create KSA Customer');
  console.log('=' .repeat(60));

  const result = await apiCall('POST', '/api/payments/customers', testCustomer);

  if (result.success) {
    console.log('✅ SUCCESS - Customer created');
    console.log('Customer ID:', result.data.customer.id);
    console.log('Email:', result.data.customer.email);
    console.log('Name:', result.data.customer.name);
    console.log('Phone:', testCustomer.phone);
    console.log('Region: KSA (Saudi Arabia)');
    console.log('Preferred Locale: Arabic (ar)');

    return result.data.customer;
  } else {
    console.log('❌ FAILED:', result.error);
    return null;
  }
}

async function testCreateKSAPayment(customerId) {
  console.log('\n💳 Test 4: Create KSA Payment Intent (with VAT)');
  console.log('=' .repeat(60));

  const paymentData = {
    ...testPayment,
    customerId
  };

  const result = await apiCall('POST', '/api/payments/intents', paymentData);

  if (result.success) {
    const payment = result.data.paymentIntent;
    console.log('✅ SUCCESS - Payment Intent created');
    console.log('Payment Intent ID:', payment.id);
    console.log('Amount:', payment.amount / 100, 'SAR (including VAT)');
    console.log('Currency:', payment.currency.toUpperCase());
    console.log('Status:', payment.status);
    console.log('\nMetadata:');
    console.log('  Region:', payment.metadata.region);
    console.log('  Subtotal:', payment.metadata.subtotal, 'SAR');
    console.log('  VAT (15%):', payment.metadata.vat_amount, 'SAR');
    console.log('  Total:', payment.amount / 100, 'SAR');
    console.log('  Invoice:', payment.metadata.invoice_number);
    console.log('\nClient Secret (for frontend):', payment.client_secret?.substring(0, 30) + '...');

    return payment;
  } else {
    console.log('❌ FAILED:', result.error);
    return null;
  }
}

async function testPaymentMethods(customerId) {
  console.log('\n💳 Test 5: Get Payment Methods for Customer');
  console.log('=' .repeat(60));

  const result = await apiCall('GET', `/api/payments/methods/${customerId}`);

  if (result.success) {
    console.log('✅ SUCCESS');
    console.log('Payment Methods:', result.data.paymentMethods.length);

    if (result.data.paymentMethods.length > 0) {
      result.data.paymentMethods.forEach((pm, index) => {
        console.log(`\n  Method ${index + 1}:`);
        console.log('    Type:', pm.type);
        console.log('    ID:', pm.id);
      });
    } else {
      console.log('No payment methods attached yet.');
    }
  } else {
    console.log('❌ FAILED:', result.error);
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('\n🇸🇦 KSA PAYMENT INTEGRATION TESTS');
  console.log('=' .repeat(60));
  console.log('Testing Stripe integration with Saudi Arabia support');
  console.log('Features: SAR currency, 15% VAT, Mada cards, Arabic locale');
  console.log('=' .repeat(60));

  try {
    // Test 1: Get KSA configuration
    await testKSAConfig();

    // Test 2: Calculate VAT for different amounts
    await testVATCalculation();

    // Test 3: Create KSA customer
    const customer = await testCreateKSACustomer();

    if (customer) {
      // Test 4: Create payment intent with VAT
      const payment = await testCreateKSAPayment(customer.id);

      // Test 5: Get payment methods
      await testPaymentMethods(customer.id);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ TEST SUITE COMPLETED');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
  }
}

// Example: Manual testing functions
function printTestExamples() {
  console.log('\n📝 Manual Testing Examples (cURL)');
  console.log('=' .repeat(60));

  console.log('\n1. Get KSA Configuration:');
  console.log(`curl ${BASE_URL}/api/payments/ksa/config`);

  console.log('\n2. Calculate VAT:');
  console.log(`curl -X POST ${BASE_URL}/api/payments/ksa/calculate-vat \\`);
  console.log(`  -H "Authorization: Bearer ${AUTH_TOKEN}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"amount": 1000}'`);

  console.log('\n3. Create KSA Customer:');
  console.log(`curl -X POST ${BASE_URL}/api/payments/customers \\`);
  console.log(`  -H "Authorization: Bearer ${AUTH_TOKEN}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(testCustomer, null, 2)}'`);

  console.log('\n4. Create Payment Intent (SAR with VAT):');
  console.log(`curl -X POST ${BASE_URL}/api/payments/intents \\`);
  console.log(`  -H "Authorization: Bearer ${AUTH_TOKEN}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(testPayment, null, 2)}'`);
}

// Run tests if executed directly
if (require.main === module) {
  if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  Please set AUTH_TOKEN in the script before running tests');
    console.log('You can get a token by logging in to the application');
    printTestExamples();
  } else {
    runAllTests();
  }
}

// Export for use in other scripts
module.exports = {
  testKSAConfig,
  testVATCalculation,
  testCreateKSACustomer,
  testCreateKSAPayment,
  testPaymentMethods,
  runAllTests
};
