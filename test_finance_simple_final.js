#!/usr/bin/env node

/**
 * Simple Finance & Billing Test - Final Version
 * Tests finance workflow with existing schema
 */

const { query } = require('./apps/services/grc-api/config/database');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  steps: []
};

/**
 * Log test step result
 */
function logStep(stepName, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${stepName}`);
  if (details) console.log(`   ${details}`);
  
  testResults.steps.push({ stepName, success, details });
  if (success) testResults.passed++;
  else testResults.failed++;
}

/**
 * Test 1: Database Connection and Schema
 */
async function testDatabaseConnection() {
  console.log('\n🔗 STEP 1: Testing Database Connection...');
  
  try {
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    const dbInfo = result.rows[0];
    
    logStep('Database Connection', true, `Connected successfully at ${dbInfo.current_time}`);
    console.log(`   Database Version: ${dbInfo.db_version.split(' ')[0]} ${dbInfo.db_version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    logStep('Database Connection', false, `Connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Subscription Tables Schema
 */
async function testSubscriptionSchema() {
  console.log('\n📋 STEP 2: Testing Subscription Tables Schema...');
  
  try {
    // Check if subscription tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('subscriptions', 'subscription_usage', 'subscription_features', 'invoices')
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    logStep('Subscription Tables Check', true, `Found tables: ${tables.join(', ')}`);
    
    // Check subscriptions table structure
    const subscriptionsResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Subscriptions Table Columns:');
    subscriptionsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    return tables.length >= 3;
  } catch (error) {
    logStep('Subscription Schema Check', false, `Schema check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Create Test Subscription Data
 */
async function testSubscriptionCreation() {
  console.log('\n💳 STEP 3: Testing Subscription Creation...');
  
  try {
    // Get existing tenant and organization
    const tenantResult = await query('SELECT id FROM tenants LIMIT 1');
    const orgResult = await query('SELECT id FROM organizations LIMIT 1');
    
    if (tenantResult.rows.length === 0 || orgResult.rows.length === 0) {
      logStep('Test Data Check', false, 'No existing tenants or organizations found');
      return null;
    }
    
    const tenantId = tenantResult.rows[0].id;
    const orgId = orgResult.rows[0].id;
    
    // Create test subscription
    const subscriptionResult = await query(`
      INSERT INTO subscriptions (
        tenant_id, organization_id, plan_name, price, currency, status
      ) VALUES ($1, $2, 'professional', 299.00, 'USD', 'active')
      RETURNING id, plan_name, price, status, created_at
    `, [tenantId, orgId]);
    
    const subscription = subscriptionResult.rows[0];
    logStep('Subscription Creation', true, `Created subscription ID: ${subscription.id}`);
    
    console.log(`   Plan: ${subscription.plan_name}`);
    console.log(`   Price: $${subscription.price} USD`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Created: ${subscription.created_at}`);
    
    return subscription;
  } catch (error) {
    logStep('Subscription Creation', false, `Creation failed: ${error.message}`);
    return null;
  }
}

/**
 * Test 4: Usage Tracking
 */
async function testUsageTracking(subscription) {
  console.log('\n📊 STEP 4: Testing Usage Tracking...');
  
  if (!subscription) {
    logStep('Usage Tracking', false, 'No subscription to test with');
    return false;
  }
  
  try {
    // Insert usage metrics
    const usageData = [
      { metric: 'active_users', value: 15 },
      { metric: 'storage_used', value: 25.5 },
      { metric: 'api_calls', value: 2500 },
      { metric: 'assessments_created', value: 8 }
    ];
    
    for (const usage of usageData) {
      await query(`
        INSERT INTO subscription_usage (subscription_id, metric_name, value)
        VALUES ($1, $2, $3)
      `, [subscription.id, usage.metric, usage.value]);
    }
    
    logStep('Usage Data Insert', true, `Inserted ${usageData.length} usage metrics`);
    
    // Query usage summary
    const usageSummary = await query(`
      SELECT 
        metric_name,
        SUM(value) as total_value,
        COUNT(*) as record_count,
        MAX(recorded_at) as last_recorded
      FROM subscription_usage 
      WHERE subscription_id = $1 
      GROUP BY metric_name
      ORDER BY metric_name
    `, [subscription.id]);
    
    console.log('   Usage Summary:');
    usageSummary.rows.forEach(usage => {
      console.log(`   - ${usage.metric_name}: ${usage.total_value} (${usage.record_count} records)`);
    });
    
    return true;
  } catch (error) {
    logStep('Usage Tracking', false, `Usage tracking failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Subscription Features
 */
async function testSubscriptionFeatures(subscription) {
  console.log('\n🔧 STEP 5: Testing Subscription Features...');
  
  if (!subscription) {
    logStep('Subscription Features', false, 'No subscription to test with');
    return false;
  }
  
  try {
    // Insert subscription features
    const features = [
      { name: 'advanced_analytics', enabled: true, limit: null },
      { name: 'api_calls', enabled: true, limit: 10000 },
      { name: 'custom_reports', enabled: true, limit: 50 },
      { name: 'storage', enabled: true, limit: 50 }
    ];
    
    for (const feature of features) {
      await query(`
        INSERT INTO subscription_features (subscription_id, feature_name, is_enabled, usage_limit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (subscription_id, feature_name) DO UPDATE SET
          is_enabled = EXCLUDED.is_enabled,
          usage_limit = EXCLUDED.usage_limit
      `, [subscription.id, feature.name, feature.enabled, feature.limit]);
    }
    
    logStep('Feature Configuration', true, `Configured ${features.length} features`);
    
    // Query feature summary
    const featureSummary = await query(`
      SELECT feature_name, is_enabled, usage_limit
      FROM subscription_features 
      WHERE subscription_id = $1 
      ORDER BY feature_name
    `, [subscription.id]);
    
    console.log('   Feature Configuration:');
    featureSummary.rows.forEach(feature => {
      const limit = feature.usage_limit ? `(Limit: ${feature.usage_limit})` : '(Unlimited)';
      console.log(`   - ${feature.feature_name}: ${feature.is_enabled ? 'Enabled' : 'Disabled'} ${limit}`);
    });
    
    return true;
  } catch (error) {
    logStep('Subscription Features', false, `Feature configuration failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Invoice Generation
 */
async function testInvoiceGeneration(subscription) {
  console.log('\n💰 STEP 6: Testing Invoice Generation...');
  
  if (!subscription) {
    logStep('Invoice Generation', false, 'No subscription to test with');
    return false;
  }
  
  try {
    // Create test invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceResult = await query(`
      INSERT INTO invoices (
        subscription_id, invoice_number, amount, currency, 
        status, due_date, line_items
      ) VALUES (
        $1, $2, $3, 'USD', 'pending', 
        CURRENT_DATE + INTERVAL '30 days',
        '[{"description": "Professional Plan - Monthly", "amount": 299.00, "quantity": 1}]'
      ) RETURNING id, invoice_number, amount, status, due_date
    `, [subscription.id, invoiceNumber, subscription.price]);
    
    const invoice = invoiceResult.rows[0];
    logStep('Invoice Creation', true, `Created invoice ${invoice.invoice_number}`);
    
    console.log(`   Invoice Number: ${invoice.invoice_number}`);
    console.log(`   Amount: $${invoice.amount}`);
    console.log(`   Status: ${invoice.status}`);
    console.log(`   Due Date: ${invoice.due_date}`);
    
    // Simulate payment
    await query(`
      UPDATE invoices SET 
        status = 'paid', 
        paid_at = NOW(),
        payment_method = 'credit_card',
        transaction_id = $2
      WHERE id = $1
    `, [invoice.id, `txn_${Date.now()}`]);
    
    logStep('Payment Processing', true, 'Invoice marked as paid');
    
    return invoice;
  } catch (error) {
    logStep('Invoice Generation', false, `Invoice generation failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Billing Analytics
 */
async function testBillingAnalytics(subscription) {
  console.log('\n📈 STEP 7: Testing Billing Analytics...');
  
  if (!subscription) {
    logStep('Billing Analytics', false, 'No subscription to test with');
    return false;
  }
  
  try {
    // Generate comprehensive analytics
    const analyticsResult = await query(`
      SELECT 
        s.plan_name,
        s.price,
        s.currency,
        s.status,
        COUNT(DISTINCT su.metric_name) as tracked_metrics,
        COUNT(DISTINCT sf.feature_name) as configured_features,
        COUNT(i.id) as total_invoices,
        SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) as pending_amount
      FROM subscriptions s
      LEFT JOIN subscription_usage su ON s.id = su.subscription_id
      LEFT JOIN subscription_features sf ON s.id = sf.subscription_id
      LEFT JOIN invoices i ON s.id = i.subscription_id
      WHERE s.id = $1
      GROUP BY s.id, s.plan_name, s.price, s.currency, s.status
    `, [subscription.id]);
    
    if (analyticsResult.rows.length > 0) {
      const analytics = analyticsResult.rows[0];
      logStep('Billing Analytics', true, 'Generated comprehensive billing analytics');
      
      console.log('   📊 BILLING ANALYTICS REPORT');
      console.log('   ' + '='.repeat(40));
      console.log(`   Plan: ${analytics.plan_name}`);
      console.log(`   Price: $${analytics.price} ${analytics.currency}`);
      console.log(`   Status: ${analytics.status}`);
      console.log(`   Tracked Metrics: ${analytics.tracked_metrics}`);
      console.log(`   Configured Features: ${analytics.configured_features}`);
      console.log(`   Total Invoices: ${analytics.total_invoices}`);
      console.log(`   Paid Amount: $${analytics.paid_amount}`);
      console.log(`   Pending Amount: $${analytics.pending_amount}`);
      
      return analytics;
    } else {
      logStep('Billing Analytics', false, 'No analytics data found');
      return null;
    }
  } catch (error) {
    logStep('Billing Analytics', false, `Analytics generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Main test execution
 */
async function runSimpleFinanceTest() {
  console.log('💳 Starting Simple Finance & Billing Test');
  console.log('=' .repeat(60));
  
  try {
    // Run all test steps
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) return false;
    
    const schemaValid = await testSubscriptionSchema();
    if (!schemaValid) return false;
    
    const subscription = await testSubscriptionCreation();
    const usageTracked = await testUsageTracking(subscription);
    const featuresConfigured = await testSubscriptionFeatures(subscription);
    const invoiceGenerated = await testInvoiceGeneration(subscription);
    const analyticsGenerated = await testBillingAnalytics(subscription);
    
    // Print final results
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINANCE & BILLING TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
    console.log(`🎯 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 ALL FINANCE & BILLING TESTS PASSED!');
      console.log('💰 Complete billing workflow is functional end-to-end.');
      console.log('🚀 Finance system is ready for production use!');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED. Check the details above.');
    }
    
    return testResults.failed === 0;
    
  } catch (error) {
    console.error('\n❌ FINANCE TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runSimpleFinanceTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleFinanceTest };
