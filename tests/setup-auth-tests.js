/**
 * Setup script for Authentication Path Testing
 * Checks dependencies and environment before running tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function checkDependency(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
}

function checkService(url, name) {
  try {
    const axios = require('axios');
    return axios.get(url, { timeout: 2000 })
      .then(() => ({ available: true, name }))
      .catch(() => ({ available: false, name }));
  } catch (e) {
    return Promise.resolve({ available: false, name });
  }
}

async function setupTests() {
  logSection('Authentication Path Test Setup');

  // 1. Check Node version
  log('1. Checking Node.js version...', colors.yellow);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`   ✓ Node.js ${nodeVersion} (OK)`, colors.green);
  } else {
    log(`   ✗ Node.js ${nodeVersion} (Requires >= 18.0.0)`, colors.red);
    process.exit(1);
  }

  // 2. Check required dependencies
  log('\n2. Checking required dependencies...', colors.yellow);
  const requiredDeps = ['axios'];
  const missingDeps = [];

  for (const dep of requiredDeps) {
    if (checkDependency(dep)) {
      log(`   ✓ ${dep}`, colors.green);
    } else {
      log(`   ✗ ${dep} (missing)`, colors.red);
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    log(`\n   Installing missing dependencies...`, colors.yellow);
    try {
      execSync(`npm install ${missingDeps.join(' ')}`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      log(`   ✓ Dependencies installed successfully`, colors.green);
    } catch (error) {
      log(`   ✗ Failed to install dependencies`, colors.red);
      console.error(error.message);
      process.exit(1);
    }
  }

  // 3. Check test file exists
  log('\n3. Checking test files...', colors.yellow);
  const testFile = path.join(__dirname, 'auth-path-test.js');
  if (fs.existsSync(testFile)) {
    log(`   ✓ auth-path-test.js found`, colors.green);
  } else {
    log(`   ✗ auth-path-test.js not found`, colors.red);
    process.exit(1);
  }

  // 4. Check environment configuration
  log('\n4. Checking environment configuration...', colors.yellow);
  const BASE_URLS = {
    web: process.env.WEB_URL || 'http://localhost:5173',
    bff: process.env.BFF_URL || 'http://localhost:3001',
    api: process.env.API_URL || 'http://localhost:5001'
  };

  console.log(`   Web Frontend: ${BASE_URLS.web}`);
  console.log(`   BFF Service:  ${BASE_URLS.bff}`);
  console.log(`   API Service:  ${BASE_URLS.api}`);

  // 5. Check service availability
  log('\n5. Checking service availability...', colors.yellow);
  
  // Need axios for service checks
  const axios = require('axios');
  
  const serviceChecks = [
    { url: `${BASE_URLS.bff}/health`, name: 'BFF' },
    { url: `${BASE_URLS.api}/health`, name: 'API' },
    { url: BASE_URLS.web, name: 'Web Frontend' }
  ];

  let availableServices = 0;
  
  for (const check of serviceChecks) {
    try {
      await axios.get(check.url, { timeout: 3000, validateStatus: () => true });
      log(`   ✓ ${check.name} is running`, colors.green);
      availableServices++;
    } catch (error) {
      log(`   ✗ ${check.name} is not available`, colors.yellow);
    }
  }

  if (availableServices === 0) {
    log('\n⚠️  Warning: No services are currently running', colors.yellow);
    log('   Tests will be skipped for unavailable services', colors.yellow);
    log('\n   To start services, run:', colors.blue);
    log('   npm run infra:up      # Start infrastructure', colors.blue);
    log('   npm run dev:bff       # Start BFF service', colors.blue);
    log('   npm run dev:web       # Start Web frontend', colors.blue);
    log('   npm run start:grc-api # Start API service', colors.blue);
  } else {
    log(`\n   ${availableServices} of ${serviceChecks.length} services are available`, colors.green);
  }

  // 6. Create results directory if it doesn't exist
  log('\n6. Preparing test results directory...', colors.yellow);
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    log(`   ✓ Created results directory`, colors.green);
  } else {
    log(`   ✓ Results directory exists`, colors.green);
  }

  // 7. Ready to run
  logSection('Setup Complete');
  log('✓ All checks passed - Ready to run tests!\n', colors.green);
  log('Run tests with:', colors.blue);
  log('  npm run test:auth-paths', colors.cyan);
  log('or', colors.blue);
  log('  node tests/auth-path-test.js\n', colors.cyan);

  return true;
}

// Run setup if called directly
if (require.main === module) {
  setupTests().catch(error => {
    log(`\n✗ Setup failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { setupTests };
