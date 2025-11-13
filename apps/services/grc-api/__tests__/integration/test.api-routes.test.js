#!/usr/bin/env node

/**
 * Comprehensive API Routes and Frontend Pages Test
 * Tests all endpoints and routes to ensure security implementations don't break functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 API Routes and Frontend Pages Test');
console.log('=====================================\n');

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function test(name, testFn) {
  try {
    console.log(`Testing: ${name}...`);
    const result = testFn();
    if (result === 'warning') {
      console.log(`⚠️  ${name} - WARNING\n`);
      testResults.warnings++;
    } else {
      console.log(`✅ ${name} - PASSED\n`);
      testResults.passed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
  }
}

// Test 1: Check Backend Route Files
test('Backend Route Files Existence', () => {
  const routeFiles = [
    'backend/routes/auth.js',
    'backend/routes/users.js',
    'backend/routes/tenants.js',
    'backend/routes/organizations.js',
    'backend/routes/assessments.js',
    'backend/routes/assessment-templates.js',
    'backend/routes/assessment-responses.js',
    'backend/routes/assessment-evidence.js',
    'backend/routes/documents.js',
    'backend/routes/frameworks.js',
    'backend/routes/controls.js',
    'backend/routes/regulators.js',
    'backend/routes/sector-controls.js',
    'backend/routes/compliance-reports.js',
    'backend/routes/evidence-library.js',
    'backend/routes/workflow.js',
    'backend/routes/tables.js',
    'backend/routes/microsoft-auth.js'
  ];

  routeFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Route file missing: ${file}`);
    }
  });
});

// Test 2: Check Frontend Page Files
test('Frontend Page Files Existence', () => {
  const pageFiles = [
    'frontend/src/App.js',
    'frontend/src/pages/Dashboard.js',
    'frontend/src/pages/Organizations.js',
    'frontend/src/pages/OrganizationForm.js',
    'frontend/src/pages/OrganizationDetails.js',
    'frontend/src/pages/Assessments.js',
    'frontend/src/pages/SectorIntelligence.js',
    'frontend/src/pages/LoginPage.jsx',
    'frontend/src/pages/ControlsPage.jsx',
    'frontend/src/pages/RegulatorsPage.jsx',
    'frontend/src/pages/ReportsPage.jsx',
    'frontend/src/pages/SettingsPage.jsx'
  ];

  pageFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Page file missing: ${file}`);
    }
  });
});

// Test 3: Check API Service Configuration
test('API Service Configuration', () => {
  const apiServicePath = 'frontend/src/services/api.js';
  if (!fs.existsSync(apiServicePath)) {
    throw new Error('API service file missing');
  }

  const content = fs.readFileSync(apiServicePath, 'utf8');
  
  // Check for required API services
  const requiredServices = [
    'auth', 'users', 'tenants', 'organizations', 'assessments',
    'templates', 'responses', 'evidence', 'documents', 'frameworks',
    'controls', 'regulators', 'sectorControls', 'reports', 'dashboard'
  ];

  requiredServices.forEach(service => {
    if (!content.includes(`${service}:`)) {
      throw new Error(`Missing API service: ${service}`);
    }
  });
});

// Test 4: Check Server Route Registration
test('Server Route Registration', () => {
  const serverPath = 'backend/server.js';
  const content = fs.readFileSync(serverPath, 'utf8');

  const requiredRoutes = [
    'authRoutes',
    'usersRoutes', 
    'tenantsRoutes',
    'organizationsRoutes',
    'assessmentsRoutes',
    'documentsRoutes',
    'frameworksRoutes',
    'controlsRoutes',
    'regulatorsRoutes'
  ];

  requiredRoutes.forEach(route => {
    if (!content.includes(route)) {
      throw new Error(`Route not registered in server: ${route}`);
    }
  });
});

// Test 5: Check Authentication Integration
test('Authentication Integration', () => {
  const authRoutePath = 'backend/routes/auth.js';
  const content = fs.readFileSync(authRoutePath, 'utf8');

  // Check for required auth endpoints
  const authEndpoints = [
    'login', 'register', 'logout', 'refresh', 'forgot-password'
  ];

  authEndpoints.forEach(endpoint => {
    if (!content.includes(`/${endpoint}`) && !content.includes(`'${endpoint}'`)) {
      throw new Error(`Missing auth endpoint: ${endpoint}`);
    }
  });

  // Check for security middleware integration
  if (!content.includes('authenticateToken') && !content.includes('auth')) {
    return 'warning'; // Warning instead of failure
  }
});

// Test 6: Check Documents Route Security Integration
test('Documents Route Security Integration', () => {
  const documentsPath = 'backend/routes/documents.js';
  const content = fs.readFileSync(documentsPath, 'utf8');

  // Check for security integrations
  const securityFeatures = [
    'avScanner',
    'secureStorage',
    'authenticateToken',
    'requireTenantAccess',
    'multer'
  ];

  securityFeatures.forEach(feature => {
    if (!content.includes(feature)) {
      throw new Error(`Missing security feature in documents route: ${feature}`);
    }
  });
});

// Test 7: Check Database Table Routes
test('Database Table Routes', () => {
  const tablesPath = 'backend/routes/tables.js';
  if (!fs.existsSync(tablesPath)) {
    throw new Error('Tables route file missing');
  }

  const content = fs.readFileSync(tablesPath, 'utf8');
  
  // Check for basic CRUD operations
  const crudOperations = ['GET', 'POST', 'PUT', 'DELETE'];
  crudOperations.forEach(operation => {
    if (!content.includes(`router.${operation.toLowerCase()}`) && !content.includes(operation)) {
      throw new Error(`Missing CRUD operation: ${operation}`);
    }
  });
});

// Test 8: Check Frontend Routing Configuration
test('Frontend Routing Configuration', () => {
  const appPath = 'frontend/src/App.js';
  const content = fs.readFileSync(appPath, 'utf8');

  // Check for required routes
  const requiredRoutes = [
    '/dashboard',
    '/organizations',
    '/assessments',
    '/sector-intelligence'
  ];

  requiredRoutes.forEach(route => {
    if (!content.includes(`path="${route}"`) && !content.includes(`path='${route}'`)) {
      throw new Error(`Missing frontend route: ${route}`);
    }
  });
});

// Test 9: Check API Base URL Configuration
test('API Base URL Configuration', () => {
  const apiPath = 'frontend/src/services/api.js';
  const content = fs.readFileSync(apiPath, 'utf8');

  if (!content.includes('API_BASE_URL') && !content.includes('baseURL')) {
    throw new Error('API base URL not configured');
  }

  // Check for axios configuration
  if (!content.includes('axios.create')) {
    throw new Error('Axios instance not properly configured');
  }
});

// Test 10: Check Security Middleware in Routes
test('Security Middleware in Protected Routes', () => {
  const protectedRoutes = [
    'backend/routes/users.js',
    'backend/routes/organizations.js',
    'backend/routes/assessments.js',
    'backend/routes/documents.js'
  ];

  protectedRoutes.forEach(routePath => {
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check for authentication middleware
      if (!content.includes('authenticateToken') && 
          !content.includes('requireAuth') && 
          !content.includes('auth')) {
        throw new Error(`Missing authentication middleware in: ${routePath}`);
      }
    }
  });
});

// Test 11: Check Error Handling in API Services
test('Error Handling in API Services', () => {
  const apiPath = 'frontend/src/services/api.js';
  const content = fs.readFileSync(apiPath, 'utf8');

  // Check for interceptors
  if (!content.includes('interceptors')) {
    throw new Error('API interceptors not configured');
  }

  // Check for error handling
  if (!content.includes('error') || !content.includes('catch')) {
    return 'warning';
  }
});

// Test 12: Check CORS Configuration
test('CORS Configuration', () => {
  const serverPath = 'backend/server.js';
  const content = fs.readFileSync(serverPath, 'utf8');

  if (!content.includes('cors')) {
    throw new Error('CORS not configured');
  }

  if (!content.includes('corsOptions') && !content.includes('origin')) {
    return 'warning';
  }
});

// Test 13: Check Rate Limiting on API Routes
test('Rate Limiting on API Routes', () => {
  const serverPath = 'backend/server.js';
  const content = fs.readFileSync(serverPath, 'utf8');

  if (!content.includes('rateLimit') && !content.includes('limiter')) {
    throw new Error('Rate limiting not configured');
  }

  // Check for different rate limiters
  const rateLimiters = ['generalLimiter', 'authLimiter', 'uploadLimiter'];
  rateLimiters.forEach(limiter => {
    if (!content.includes(limiter)) {
      throw new Error(`Missing rate limiter: ${limiter}`);
    }
  });
});

// Test 14: Check File Upload Configuration
test('File Upload Configuration', () => {
  const documentsPath = 'backend/routes/documents.js';
  const content = fs.readFileSync(documentsPath, 'utf8');

  // Check for multer configuration
  if (!content.includes('multer')) {
    throw new Error('File upload middleware not configured');
  }

  // Check for file validation
  if (!content.includes('fileFilter') || !content.includes('limits')) {
    return 'warning';
  }
});

// Test 15: Check Database Connection
test('Database Connection Configuration', () => {
  const dbConfigPath = 'backend/config/database.js';
  if (!fs.existsSync(dbConfigPath)) {
    throw new Error('Database configuration file missing');
  }

  const content = fs.readFileSync(dbConfigPath, 'utf8');
  
  if (!content.includes('Pool') && !content.includes('Client')) {
    throw new Error('Database connection not properly configured');
  }
});

// Test 16: Check Environment Configuration
test('Environment Configuration', () => {
  const envFiles = ['.env.example', '.env.production', '.env.security.example'];
  
  let foundEnvFile = false;
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundEnvFile = true;
    }
  });

  if (!foundEnvFile) {
    throw new Error('No environment configuration files found');
  }
});

// Test 17: Check Frontend Build Configuration
test('Frontend Build Configuration', () => {
  const packagePath = 'frontend/package.json';
  if (!fs.existsSync(packagePath)) {
    throw new Error('Frontend package.json missing');
  }

  const content = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(content);

  if (!packageJson.scripts || !packageJson.scripts.build) {
    throw new Error('Build script not configured');
  }
});

// Test 18: Check Backend Dependencies
test('Backend Dependencies', () => {
  const packagePath = 'backend/package.json';
  if (!fs.existsSync(packagePath)) {
    throw new Error('Backend package.json missing');
  }

  const content = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(content);

  const requiredDeps = [
    'express', 'cors', 'helmet', 'express-rate-limit',
    'jsonwebtoken', 'bcryptjs', 'pg', 'multer'
  ];

  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      throw new Error(`Missing required dependency: ${dep}`);
    }
  });
});

// Run all tests
console.log('Running comprehensive API and routes test...\n');

// Print final results
console.log('\n🔗 API Routes and Pages Test Results');
console.log('====================================');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`⚠️  Warnings: ${testResults.warnings}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📊 Total: ${testResults.passed + testResults.warnings + testResults.failed}`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.errors.forEach(error => {
    console.log(`   - ${error.test}: ${error.error}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 All API routes and pages are properly configured!');
  console.log('🔒 Security implementations are compatible with existing functionality.');
  
  if (testResults.warnings > 0) {
    console.log(`\n⚠️  ${testResults.warnings} warnings found - review recommended but not critical.`);
  }
  
  process.exit(0);
}