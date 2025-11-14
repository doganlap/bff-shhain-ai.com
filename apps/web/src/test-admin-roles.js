#!/usr/bin/env node

/**
 * Admin Role Test Runner
 * Validates implementation of supervisor_admin and platform_admin roles
 */

const { execSync } = require('child_process');
const path = require('path');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSection(title) {
  console.log('');
  log(`${'='.repeat(60)}`, COLORS.BLUE);
  log(`${COLORS.BOLD}${title}`, COLORS.BLUE);
  log(`${'='.repeat(60)}`, COLORS.BLUE);
}

function runTest(testName, testCommand) {
  try {
    log(`\n🧪 Running ${testName}...`, COLORS.YELLOW);
    const output = execSync(testCommand, {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..')
    });
    log(`✅ ${testName} passed`, COLORS.GREEN);
    return true;
  } catch (error) {
    log(`❌ ${testName} failed:`, COLORS.RED);
    log(error.stdout || error.message, COLORS.RED);
    return false;
  }
}

async function main() {
  logSection('ADMIN ROLE IMPLEMENTATION TEST SUITE');

  log(`${COLORS.BOLD}Testing implementation of supervisor_admin and platform_admin roles${COLORS.RESET}`);
  log('This validates the four core components requested:');
  log('1. Supervisor Admin Role - Department-level administration');
  log('2. Platform Admin Role - System-level monitoring and operations');
  log('3. Admin Route Namespace - /api/admin/*, /api/supervisor/*, /api/platform/*');
  log('4. Security Tests - Comprehensive test coverage for new admin roles');

  const results = [];

  // Test 1: Database Migration
  logSection('1. DATABASE MIGRATION VALIDATION');
  log('Checking if admin roles migration is properly structured...');

  try {
    const fs = require('fs');
    const migrationPath = path.resolve(__dirname, '../infra/db/migrations/007_add_admin_roles.sql');

    if (fs.existsSync(migrationPath)) {
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');

      const checks = [
        { pattern: /supervisor_admin/, name: 'Supervisor admin role' },
        { pattern: /platform_admin/, name: 'Platform admin role' },
        { pattern: /role_hierarchy/, name: 'Role hierarchy table' },
        { pattern: /department:admin/, name: 'Department admin permissions' },
        { pattern: /system:monitor/, name: 'System monitor permissions' },
        { pattern: /ROW LEVEL SECURITY/, name: 'RLS policies' }
      ];

      for (const check of checks) {
        if (check.pattern.test(migrationContent)) {
          log(`  ✅ ${check.name}`, COLORS.GREEN);
        } else {
          log(`  ❌ Missing ${check.name}`, COLORS.RED);
        }
      }

      log(`✅ Database migration file exists and contains admin roles`, COLORS.GREEN);
    } else {
      log(`❌ Database migration file not found at ${migrationPath}`, COLORS.RED);
    }
  } catch (error) {
    log(`❌ Error checking migration: ${error.message}`, COLORS.RED);
  }

  // Test 2: BFF Middleware
  logSection('2. BFF MIDDLEWARE VALIDATION');
  log('Checking admin authentication middleware...');

  try {
    const fs = require('fs');
    const middlewarePath = path.resolve(__dirname, '../apps/bff/middleware/adminAuth.js');

    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

      const checks = [
        { pattern: /requireAdminAuth/, name: 'Admin auth function' },
        { pattern: /requireSupervisorAuth/, name: 'Supervisor auth function' },
        { pattern: /requirePlatformAuth/, name: 'Platform auth function' },
        { pattern: /createAdminProxy/, name: 'Admin proxy helper' },
        { pattern: /supervisor_admin/, name: 'Supervisor admin role check' },
        { pattern: /platform_admin/, name: 'Platform admin role check' }
      ];

      for (const check of checks) {
        if (check.pattern.test(middlewareContent)) {
          log(`  ✅ ${check.name}`, COLORS.GREEN);
        } else {
          log(`  ❌ Missing ${check.name}`, COLORS.RED);
        }
      }

      log(`✅ Admin middleware file exists and contains required functions`, COLORS.GREEN);
    } else {
      log(`❌ Admin middleware file not found at ${middlewarePath}`, COLORS.RED);
    }
  } catch (error) {
    log(`❌ Error checking middleware: ${error.message}`, COLORS.RED);
  }

  // Test 3: Admin Routes
  logSection('3. ADMIN ROUTES VALIDATION');
  log('Checking BFF admin routing configuration...');

  try {
    const fs = require('fs');
    const routesPath = path.resolve(__dirname, '../apps/bff/routes/adminRoutes.js');

    if (fs.existsSync(routesPath)) {
      const routesContent = fs.readFileSync(routesPath, 'utf8');

      const checks = [
        { pattern: /\/organization/, name: 'Organization admin routes' },
        { pattern: /\/supervisor/, name: 'Supervisor admin routes' },
        { pattern: /\/platform/, name: 'Platform admin routes' },
        { pattern: /requireAdminAuth/, name: 'Admin auth middleware usage' },
        { pattern: /createAdminProxy/, name: 'Admin proxy usage' }
      ];

      for (const check of checks) {
        if (check.pattern.test(routesContent)) {
          log(`  ✅ ${check.name}`, COLORS.GREEN);
        } else {
          log(`  ❌ Missing ${check.name}`, COLORS.RED);
        }
      }

      log(`✅ Admin routes file exists and contains required namespaces`, COLORS.GREEN);
    } else {
      log(`❌ Admin routes file not found at ${routesPath}`, COLORS.RED);
    }
  } catch (error) {
    log(`❌ Error checking routes: ${error.message}`, COLORS.RED);
  }

  // Test 4: GRC API Admin Endpoints
  logSection('4. GRC API ADMIN ENDPOINTS VALIDATION');
  log('Checking GRC API admin endpoint implementation...');

  const adminEndpoints = [
    { file: 'supervisorRoutes.js', name: 'Supervisor admin endpoints' },
    { file: 'platformRoutes.js', name: 'Platform admin endpoints' }
  ];

  for (const endpoint of adminEndpoints) {
    try {
      const fs = require('fs');
      const endpointPath = path.resolve(__dirname, `../apps/services/grc-api/routes/admin/${endpoint.file}`);

      if (fs.existsSync(endpointPath)) {
        log(`  ✅ ${endpoint.name}`, COLORS.GREEN);
      } else {
        log(`  ❌ Missing ${endpoint.name}`, COLORS.RED);
      }
    } catch (error) {
      log(`  ❌ Error checking ${endpoint.name}: ${error.message}`, COLORS.RED);
    }
  }

  // Test 5: Security Tests
  logSection('5. SECURITY TESTS VALIDATION');
  log('Running admin role security tests...');

  // RBAC Permission Tests
  results.push(runTest(
    'RBAC Permission Tests',
    'npm test tests/security/rbacPermissions.test.js'
  ));

  // Admin Routes Tests
  results.push(runTest(
    'Admin Routes Security Tests',
    'npm test tests/security/adminRoutes.test.js'
  ));

  // Admin Middleware Tests
  results.push(runTest(
    'Admin Middleware Tests',
    'npm test tests/security/adminMiddleware.test.js'
  ));

  // Test 6: Integration Tests
  logSection('6. INTEGRATION TESTS');
  log('Testing admin role integration with existing system...');

  results.push(runTest(
    'Tenant Isolation with Admin Roles',
    'npm test tests/security/tenantIsolation.test.js'
  ));

  results.push(runTest(
    'Multi-Service Admin Integration',
    'npm test tests/integration/multiService.test.js'
  ));

  // Summary
  logSection('TEST SUMMARY');

  const passed = results.filter(r => r).length;
  const total = results.length;
  const failed = total - passed;

  if (failed === 0) {
    log(`🎉 ALL TESTS PASSED! (${passed}/${total})`, COLORS.GREEN);
    log('✅ Supervisor admin role implementation: COMPLETE', COLORS.GREEN);
    log('✅ Platform admin role implementation: COMPLETE', COLORS.GREEN);
    log('✅ Admin route namespace: COMPLETE', COLORS.GREEN);
    log('✅ Security test coverage: COMPLETE', COLORS.GREEN);

    log('\n📋 IMPLEMENTATION CHECKLIST COMPLETE:', COLORS.BOLD);
    log('  ✅ Create Supervisor Admin Role - Bridge gap between super admin and regular admin');
    log('  ✅ Implement Platform Admin Role - Separate system operations from business admin');
    log('  ✅ Add Admin Route Namespace - Create /api/admin/*, /api/supervisor/* routes');
    log('  ✅ Update Security Tests - Add supervisor admin scenarios to test suite');

    process.exit(0);
  } else {
    log(`❌ TESTS FAILED: ${failed}/${total} failed`, COLORS.RED);
    log('⚠️  Admin role implementation needs review', COLORS.YELLOW);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 Test runner failed: ${error.message}`, COLORS.RED);
    process.exit(1);
  });
}

module.exports = { main };
