#!/usr/bin/env node

/**
 * Database Connection Testing Script
 * Tests database connectivity across all environments
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Environment configurations
const environments = {
  development: {
    envFile: path.join(__dirname, '../apps/bff/.env'),
    description: 'Local Development Environment'
  },
  staging: {
    envFile: path.join(__dirname, '../apps/bff/.env.staging'),
    description: 'Staging Environment'
  },
  production: {
    envFile: path.join(__dirname, '../apps/bff/.env.production'),
    description: 'Production Environment'
  }
};

/**
 * Load environment variables from file
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });

  return envVars;
}

/**
 * Test database connection
 */
async function testDatabaseConnection(databaseUrl, shadowUrl = null) {
  const results = {
    main: { status: 'unknown', error: null, responseTime: null },
    shadow: { status: 'unknown', error: null, responseTime: null }
  };

  // Test main database
  try {
    const startTime = Date.now();
    const prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      }
    });

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();

    results.main.status = 'connected';
    results.main.responseTime = Date.now() - startTime;
  } catch (error) {
    results.main.status = 'failed';
    results.main.error = error.message;
  }

  // Test shadow database if provided
  if (shadowUrl) {
    try {
      const startTime = Date.now();
      const shadowPrisma = new PrismaClient({
        datasources: {
          db: { url: shadowUrl }
        }
      });

      await shadowPrisma.$connect();
      await shadowPrisma.$queryRaw`SELECT 1 as test`;
      await shadowPrisma.$disconnect();

      results.shadow.status = 'connected';
      results.shadow.responseTime = Date.now() - startTime;
    } catch (error) {
      results.shadow.status = 'failed';
      results.shadow.error = error.message;
    }
  }

  return results;
}

/**
 * Test Redis connection
 */
async function testRedisConnection(redisUrl) {
  if (!redisUrl) {
    return { status: 'not_configured' };
  }

  try {
    const Redis = require('ioredis');
    const startTime = Date.now();
    
    const redis = new Redis(redisUrl);
    await redis.ping();
    await redis.disconnect();

    return {
      status: 'connected',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Validate database URL format
 */
function validateDatabaseUrl(url) {
  if (!url) {
    return { valid: false, error: 'URL is empty' };
  }

  try {
    const parsed = new URL(url);
    
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Not a PostgreSQL URL' };
    }

    if (!parsed.hostname) {
      return { valid: false, error: 'Missing hostname' };
    }

    if (!parsed.pathname || parsed.pathname === '/') {
      return { valid: false, error: 'Missing database name' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Main testing function
 */
async function runDatabaseTests() {
  console.log('🔍 Testing Database Connections Across All Environments\n');
  console.log('=' .repeat(60));

  const results = {};

  for (const [envName, config] of Object.entries(environments)) {
    console.log(`\n📋 Testing ${config.description}`);
    console.log('-'.repeat(40));

    const envVars = loadEnvFile(config.envFile);
    
    if (!envVars) {
      console.log(`❌ Environment file not found: ${config.envFile}`);
      results[envName] = { status: 'file_not_found' };
      continue;
    }

    const databaseUrl = envVars.DATABASE_URL;
    const shadowUrl = envVars.SHADOW_DATABASE_URL;
    const redisUrl = envVars.REDIS_URL;

    // Validate URLs
    const mainValidation = validateDatabaseUrl(databaseUrl);
    const shadowValidation = shadowUrl ? validateDatabaseUrl(shadowUrl) : { valid: true };

    console.log(`📊 Configuration:`);
    console.log(`   Main DB: ${databaseUrl ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Shadow DB: ${shadowUrl ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Redis: ${redisUrl ? '✅ Configured' : '⚠️  Not configured'}`);

    if (!mainValidation.valid) {
      console.log(`❌ Main database URL validation failed: ${mainValidation.error}`);
      results[envName] = { status: 'invalid_url', error: mainValidation.error };
      continue;
    }

    if (shadowUrl && !shadowValidation.valid) {
      console.log(`❌ Shadow database URL validation failed: ${shadowValidation.error}`);
    }

    // Test connections
    console.log(`\n🔗 Testing connections...`);

    try {
      const dbResults = await testDatabaseConnection(databaseUrl, shadowUrl);
      const redisResult = await testRedisConnection(redisUrl);

      // Main database
      if (dbResults.main.status === 'connected') {
        console.log(`✅ Main database: Connected (${dbResults.main.responseTime}ms)`);
      } else {
        console.log(`❌ Main database: Failed - ${dbResults.main.error}`);
      }

      // Shadow database
      if (shadowUrl) {
        if (dbResults.shadow.status === 'connected') {
          console.log(`✅ Shadow database: Connected (${dbResults.shadow.responseTime}ms)`);
        } else {
          console.log(`❌ Shadow database: Failed - ${dbResults.shadow.error}`);
        }
      }

      // Redis
      if (redisResult.status === 'connected') {
        console.log(`✅ Redis: Connected (${redisResult.responseTime}ms)`);
      } else if (redisResult.status === 'not_configured') {
        console.log(`⚠️  Redis: Not configured`);
      } else {
        console.log(`❌ Redis: Failed - ${redisResult.error}`);
      }

      results[envName] = {
        status: 'tested',
        database: dbResults,
        redis: redisResult
      };

    } catch (error) {
      console.log(`❌ Testing failed: ${error.message}`);
      results[envName] = { status: 'test_failed', error: error.message };
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([env, result]) => {
    const status = result.status === 'tested' && 
                  result.database?.main?.status === 'connected' ? '✅' : '❌';
    console.log(`${status} ${env.toUpperCase()}: ${result.status}`);
  });

  console.log('\n🔧 RECOMMENDATIONS:');
  
  Object.entries(results).forEach(([env, result]) => {
    if (result.status === 'file_not_found') {
      console.log(`   • Create ${env} environment file`);
    } else if (result.status === 'invalid_url') {
      console.log(`   • Fix ${env} database URL format`);
    } else if (result.database?.main?.status === 'failed') {
      console.log(`   • Check ${env} database connectivity and credentials`);
    }
  });

  console.log('\n✨ Database connection testing completed!');
}

// Run the tests
if (require.main === module) {
  runDatabaseTests().catch(console.error);
}

module.exports = {
  testDatabaseConnection,
  testRedisConnection,
  validateDatabaseUrl,
  runDatabaseTests
};
