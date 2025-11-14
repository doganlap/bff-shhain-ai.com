#!/usr/bin/env node

/**
 * GRC Ecosystem Health Check Script
 * Verifies unified configuration and service connectivity
 */

const { createServiceRouter, initializeServiceCommunication } = require('../config/serviceRouter');
const { loadConfig, displayConfigSummary } = require('../config/loader');

/**
 * Main health check function
 */
async function performHealthCheck() {
  console.log('🏥 GRC Ecosystem Health Check');
  console.log('==============================\n');

  try {
    // Get environment from command line
    const environment = process.argv[2] || 'development';
    
    console.log(`📋 Environment: ${environment}\n`);

    // Load configuration
    const config = loadConfig(environment);
    
    // Display configuration summary
    displayConfigSummary(environment);
    
    console.log('\n🔍 Performing service health checks...\n');

    // Initialize service communication and perform health checks
    const healthResults = await initializeServiceCommunication(environment);
    
    // Display health check results
    displayHealthResults(healthResults);
    
    // Test service connectivity
    await testServiceConnectivity(environment);
    
    // Configuration validation
    await validateConfiguration(environment);
    
    console.log('\n✅ Health check completed successfully!');
    
    if (healthResults.unhealthy.length > 0) {
      console.log('\n⚠️  Some services are unhealthy. Please check the logs above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
  }
}

/**
 * Display health check results
 */
function displayHealthResults(results) {
  console.log('\n📊 Health Check Results:');
  console.log('========================');
  
  console.log(`✅ Healthy Services: ${results.healthy.length}/${results.total}`);
  results.healthy.forEach(service => {
    console.log(`   ✓ ${service.service}`);
  });
  
  if (results.unhealthy.length > 0) {
    console.log(`\n❌ Unhealthy Services: ${results.unhealthy.length}`);
    results.unhealthy.forEach(service => {
      console.log(`   ✗ ${service.service} - ${service.error}`);
    });
  }
}

/**
 * Test service connectivity
 */
async function testServiceConnectivity(environment) {
  console.log('\n🔗 Testing Service Connectivity...');
  console.log('===================================');
  
  const router = createServiceRouter('health-check', environment);
  const config = loadConfig(environment);
  const services = Object.keys(config.services);
  
  for (const serviceName of services) {
    try {
      console.log(`Testing ${serviceName}...`);
      
      // Test basic connectivity
      const startTime = Date.now();
      await router.healthCheck(serviceName);
      const responseTime = Date.now() - startTime;
      
      console.log(`   ✅ ${serviceName} responded in ${responseTime}ms`);
      
    } catch (error) {
      console.log(`   ❌ ${serviceName} failed: ${error.message}`);
    }
  }
}

/**
 * Validate configuration consistency
 */
async function validateConfiguration(environment) {
  console.log('\n🔧 Validating Configuration...');
  console.log('============================');
  
  const config = loadConfig(environment);
  const issues = [];
  
  // Check port conflicts
  const ports = new Set();
  Object.entries(config.services).forEach(([name, service]) => {
    if (ports.has(service.port)) {
      issues.push(`Port conflict: ${name} uses port ${service.port} which is already assigned`);
    }
    ports.add(service.port);
  });
  
  // Check URL consistency
  Object.entries(config.serviceUrls).forEach(([service, url]) => {
    const expectedPort = config.services[service]?.port;
    if (expectedPort && !url.includes(`:${expectedPort}`) && !url.includes('localhost')) {
      issues.push(`URL inconsistency: ${service} URL ${url} doesn't match expected port ${expectedPort}`);
    }
  });
  
  // Check database configuration
  if (!config.database.primary.host || !config.database.primary.name) {
    issues.push('Database configuration incomplete: missing host or database name');
  }
  
  // Check authentication configuration
  if (!config.auth.jwt.secret || config.auth.jwt.secret.includes('change_in_production')) {
    issues.push('JWT secret not properly configured - using default value');
  }
  
  // Display validation results
  if (issues.length === 0) {
    console.log('✅ Configuration validation passed');
  } else {
    console.log(`⚠️  Found ${issues.length} configuration issues:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnectivity(environment) {
  console.log('\n🗄️  Testing Database Connectivity...');
  console.log('===================================');
  
  try {
    const config = loadConfig(environment);
    const { Client } = require('pg');
    
    const client = new Client({
      host: config.database.primary.host,
      port: config.database.primary.port,
      database: config.database.primary.name,
      user: config.database.primary.user,
      password: config.database.primary.password,
      connectionTimeoutMillis: 5000
    });
    
    await client.connect();
    console.log('✅ Database connection successful');
    
    const result = await client.query('SELECT current_database(), version()');
    console.log(`   Connected to: ${result.rows[0].current_database}`);
    console.log(`   PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
    
    await client.end();
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test authentication system
 */
async function testAuthenticationSystem(environment) {
  console.log('\n🔐 Testing Authentication System...');
  console.log('===================================');
  
  try {
    const config = loadConfig(environment);
    const jwt = require('jsonwebtoken');
    
    // Test JWT token generation and validation
    const testPayload = { test: 'health-check', timestamp: Date.now() };
    const token = jwt.sign(testPayload, config.auth.jwt.secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    
    console.log('✅ JWT token generation and validation successful');
    console.log(`   Token expires in: ${config.auth.jwt.expiresIn}`);
    
  } catch (error) {
    console.log(`❌ Authentication system test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Generate health check report
 */
async function generateHealthReport(environment) {
  console.log('\n📄 Generating Health Check Report...');
  
  const config = loadConfig(environment);
  const router = createServiceRouter('reporter', environment);
  
  const report = {
    timestamp: new Date().toISOString(),
    environment,
    configuration: {
      services: Object.keys(config.services),
      database: {
        host: config.database.primary.host,
        port: config.database.primary.port,
        name: config.database.primary.name
      },
      auth: {
        jwtExpiresIn: config.auth.jwt.expiresIn,
        bypassAuth: config.auth.bypass
      }
    },
    services: {},
    summary: {
      total: 0,
      healthy: 0,
      unhealthy: 0
    }
  };
  
  // Check each service
  const services = Object.keys(config.services);
  for (const serviceName of services) {
    try {
      const health = await router.healthCheck(serviceName);
      report.services[serviceName] = health;
      report.summary.total++;
      if (health.status === 'healthy') {
        report.summary.healthy++;
      } else {
        report.summary.unhealthy++;
      }
    } catch (error) {
      report.services[serviceName] = {
        service: serviceName,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      report.summary.unhealthy++;
      report.summary.total++;
    }
  }
  
  // Save report to file
  const reportPath = `health-report-${environment}-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Health report saved to: ${reportPath}`);
  return report;
}

// Add command-line options
const command = process.argv[3];

if (command === 'report') {
  // Generate detailed report
  performHealthCheck().then(async () => {
    const environment = process.argv[2] || 'development';
    await generateHealthReport(environment);
    process.exit(0);
  }).catch(error => {
    console.error('Report generation failed:', error.message);
    process.exit(1);
  });
} else if (command === 'db-test') {
  // Test database only
  const environment = process.argv[2] || 'development';
  testDatabaseConnectivity(environment).then(() => {
    console.log('\n✅ Database test completed');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Database test failed:', error.message);
    process.exit(1);
  });
} else if (command === 'auth-test') {
  // Test authentication only
  const environment = process.argv[2] || 'development';
  testAuthenticationSystem(environment).then(() => {
    console.log('\n✅ Authentication test completed');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Authentication test failed:', error.message);
    process.exit(1);
  });
} else {
  // Run full health check
  performHealthCheck();
}

module.exports = {
  performHealthCheck,
  testDatabaseConnectivity,
  testAuthenticationSystem,
  generateHealthReport
};