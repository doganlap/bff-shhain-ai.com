/**
 * Validation script to verify all authentication testing files
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════╗`);
console.log(`║  Authentication Testing Suite - File Validation          ║`);
console.log(`╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

const requiredFiles = [
  {
    path: 'tests/auth-path-test.js',
    description: 'Main test script',
    required: true
  },
  {
    path: 'tests/setup-auth-tests.js',
    description: 'Setup and validation script',
    required: true
  },
  {
    path: 'tests/quick-start-auth-test.js',
    description: 'Interactive quick start guide',
    required: true
  },
  {
    path: 'tests/AUTH_PATH_TESTING.md',
    description: 'Complete testing documentation',
    required: true
  },
  {
    path: 'tests/AUTH_TEST_SUMMARY.md',
    description: 'Implementation summary',
    required: true
  },
  {
    path: 'tests/README_AUTH_TESTING.md',
    description: 'Quick reference guide',
    required: true
  },
  {
    path: 'package.json',
    description: 'Package configuration',
    required: true,
    validate: (content) => {
      return content.includes('test:auth-paths') && 
             content.includes('test:auth-paths:setup') &&
             content.includes('test:auth-paths:guide');
    }
  }
];

let allValid = true;

console.log('Checking required files...\n');

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`${colors.green}✓${colors.reset} ${file.description}`);
    console.log(`  ${file.path}`);
    
    // Additional validation if provided
    if (file.validate) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (file.validate(content)) {
        console.log(`  ${colors.green}✓ Content validation passed${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ Content validation failed${colors.reset}`);
        allValid = false;
      }
    }
  } else {
    console.log(`${colors.red}✗${colors.reset} ${file.description}`);
    console.log(`  ${file.path} - NOT FOUND`);
    if (file.required) {
      allValid = false;
    }
  }
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');

if (allValid) {
  console.log(`${colors.green}✓ All files validated successfully!${colors.reset}\n`);
  console.log('You can now run the authentication tests:\n');
  console.log('  npm run test:auth-paths:guide   # Interactive guide');
  console.log('  npm run test:auth-paths:setup   # Setup and verify');
  console.log('  npm run test:auth-paths         # Run tests\n');
  process.exit(0);
} else {
  console.log(`${colors.red}✗ Validation failed - some files are missing or invalid${colors.reset}\n`);
  process.exit(1);
}
