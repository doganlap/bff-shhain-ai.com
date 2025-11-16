#!/usr/bin/env node

/**
 * Phase 2 Infrastructure Verification Script
 * Tests local PostgreSQL, Redis, and BFF container setup
 */

const { execSync } = require('child_process');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, successMessage, errorMessage) {
  try {
    execSync(command, { stdio: 'pipe' });
    log(`✅ ${successMessage}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${errorMessage}`, 'red');
    return false;
  }
}

function checkHttpHealth(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        log(`✅ Health check passed: ${url}`, 'green');
        resolve(true);
      } else {
        log(`❌ Health check failed: ${url} (status: ${res.statusCode})`, 'red');
        resolve(false);
      }
    }).on('error', (err) => {
      log(`❌ Health check error: ${url} (${err.message})`, 'red');
      resolve(false);
    });
  });
}

async function main() {
  log('\n🚀 Shahin GRC Platform - Phase 2 Infrastructure Verification\n', 'blue');

  // Check Docker availability
  log('\n📋 Checking Docker availability...', 'yellow');
  const dockerAvailable = checkCommand(
    'docker --version',
    'Docker is available',
    'Docker is not available - please install Docker'
  );

  if (!dockerAvailable) {
    log('\n❌ Cannot proceed without Docker. Please install Docker and try again.', 'red');
    process.exit(1);
  }

  // Check Docker Compose availability
  const composeAvailable = checkCommand(
    'docker compose version',
    'Docker Compose is available',
    'Docker Compose is not available - please install Docker Compose'
  );

  if (!composeAvailable) {
    log('\n❌ Cannot proceed without Docker Compose. Please install Docker Compose and try again.', 'red');
    process.exit(1);
  }

  // Check if infrastructure is running
  log('\n🔍 Checking infrastructure services...', 'yellow');
  
  const postgresRunning = checkCommand(
    'docker ps --filter "name=shahin-db-local" --filter "status=running" --format "table {{.Names}}" | grep shahin-db-local',
    'PostgreSQL container is running',
    'PostgreSQL container is not running'
  );

  const redisRunning = checkCommand(
    'docker ps --filter "name=shahin-redis-local" --filter "status=running" --format "table {{.Names}}" | grep shahin-redis-local',
    'Redis container is running',
    'Redis container is not running'
  );

  const bffRunning = checkCommand(
    'docker ps --filter "name=shahin-bff-local" --filter "status=running" --format "table {{.Names}}" | grep shahin-bff-local',
    'BFF container is running',
    'BFF container is not running'
  );

  // Health checks
  log('\n🏥 Performing health checks...', 'yellow');
  
  const healthChecks = [];
  
  if (postgresRunning) {
    healthChecks.push(
      checkCommand(
        'docker exec shahin-db-local pg_isready -U shahin_local -d shahin_local_db',
        'PostgreSQL database is ready',
        'PostgreSQL database is not ready'
      )
    );
  }

  if (redisRunning) {
    healthChecks.push(
      checkCommand(
        'docker exec shahin-redis-local redis-cli ping',
        'Redis is responding',
        'Redis is not responding'
      )
    );
  }

  if (bffRunning) {
    healthChecks.push(await checkHttpHealth('http://localhost:3005/health'));
    healthChecks.push(await checkHttpHealth('http://localhost:3005/api/ai/health'));
  }

  // Check environment files
  log('\n📄 Checking environment configuration...', 'yellow');
  
  const envFiles = [
    'apps/bff/.env.local.example',
    'apps/bff/.env.docker.example',
    'docker-compose.db.yml',
    'docker-compose.local.yml'
  ];

  envFiles.forEach(file => {
    checkCommand(
      `test -f ${file}`,
      `Environment file exists: ${file}`,
      `Environment file missing: ${file}`
    );
  });

  // Summary
  log('\n📊 Verification Summary:', 'blue');
  
  const allServicesRunning = postgresRunning && redisRunning && bffRunning;
  const allHealthChecksPassed = healthChecks.every(check => check === true);
  
  if (allServicesRunning && allHealthChecksPassed) {
    log('\n🎉 SUCCESS: All Phase 2 infrastructure components are working correctly!', 'green');
    log('\n🚀 Ready for development:', 'green');
    log('   • Frontend: http://localhost:5173', 'green');
    log('   • BFF Health: http://localhost:3005/health', 'green');
    log('   • AI Health: http://localhost:3005/api/ai/health', 'green');
    log('   • Foundation Test: http://localhost:5173/foundation-test', 'green');
    log('\n💡 Next steps:', 'yellow');
    log('   1. Run database migrations: cd apps/bff && npm run migrate:local', 'yellow');
    log('   2. Seed the database: cd apps/bff && npm run db:local:seed', 'yellow');
    log('   3. Start frontend development: cd apps/web && pnpm dev', 'yellow');
  } else {
    log('\n⚠️  Some infrastructure components need attention:', 'yellow');
    
    if (!allServicesRunning) {
      log('\n   To start infrastructure services, run:', 'yellow');
      log('   docker compose -f docker-compose.local.yml up -d', 'yellow');
    }
    
    if (!allHealthChecksPassed) {
      log('\n   Check service logs for issues:', 'yellow');
      log('   docker compose -f docker-compose.local.yml logs', 'yellow');
    }
  }

  log('\n📚 Documentation:', 'blue');
  log('   • Infrastructure Plan: docs/INFRA_PHASE2_PLAN.md', 'blue');
  log('   • Technical Summary: docs/TECHNICAL_SUMMARY_COMPLETE.md', 'blue');
  log('   • Setup Guide: docs/RESTORE_PLAN_PHASE2.md', 'blue');
  
  process.exit(allServicesRunning && allHealthChecksPassed ? 0 : 1);
}

// Run verification
main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});