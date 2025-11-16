#!/usr/bin/env node
/**
 * Quick Start Script for Authentication Path Testing
 * Provides guided setup and execution of auth tests
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function banner() {
  console.clear();
  log('\n╔═══════════════════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                                           ║', colors.cyan);
  log('║        Authentication Path Testing - Quick Start Guide                   ║', colors.cyan);
  log('║        Shahin GRC Platform                                               ║', colors.cyan);
  log('║                                                                           ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════════════════════╝\n', colors.cyan);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function checkServiceRunning(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`\n${description}...`, colors.yellow);
    log(`Running: ${command}\n`, colors.blue);
    
    const child = spawn(command, [], {
      shell: true,
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✓ ${description} completed successfully\n`, colors.green);
        resolve();
      } else {
        log(`✗ ${description} failed with code ${code}\n`, colors.red);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      log(`✗ ${description} error: ${error.message}\n`, colors.red);
      reject(error);
    });
  });
}

async function main() {
  try {
    banner();

    log('This guide will help you run authentication path tests.\n', colors.blue);
    log('Testing Options:', colors.cyan);
    log('1. Test with existing running services (recommended if services are already up)', colors.reset);
    log('2. Start services and then test (starts infrastructure, BFF, and runs tests)', colors.reset);
    log('3. Test against Docker services (requires docker-compose)', colors.reset);
    log('4. Test against production/staging environment', colors.reset);
    log('5. Just run tests without checking services', colors.reset);
    log('6. Exit\n', colors.reset);

    const choice = await question('Select an option (1-6): ');

    switch (choice.trim()) {
      case '1':
        await testExistingServices();
        break;
      case '2':
        await startAndTest();
        break;
      case '3':
        await testDocker();
        break;
      case '4':
        await testRemote();
        break;
      case '5':
        await runTestsOnly();
        break;
      case '6':
        log('\nGoodbye! 👋\n', colors.cyan);
        process.exit(0);
        break;
      default:
        log('\nInvalid option. Please run again and select 1-6.\n', colors.red);
        process.exit(1);
    }

  } catch (error) {
    log(`\n✗ Error: ${error.message}\n`, colors.red);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function testExistingServices() {
  log('\n📊 Checking for running services...', colors.cyan);
  
  const services = [
    { name: 'BFF', port: 3001, url: 'http://localhost:3001' },
    { name: 'API', port: 5001, url: 'http://localhost:5001' },
    { name: 'Web', port: 5173, url: 'http://localhost:5173' }
  ];

  const runningServices = services.filter(s => checkServiceRunning(s.port));
  
  if (runningServices.length === 0) {
    log('\n⚠️  No services detected running on expected ports.\n', colors.yellow);
    log('Expected services:', colors.blue);
    services.forEach(s => log(`  - ${s.name} on port ${s.port}`, colors.reset));
    
    const proceed = await question('\nDo you want to run tests anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      log('\nPlease start services first. Run:', colors.blue);
      log('  npm run infra:up', colors.cyan);
      log('  npm run dev:bff', colors.cyan);
      log('  npm run dev:web\n', colors.cyan);
      process.exit(0);
    }
  } else {
    log(`\n✓ Found ${runningServices.length} service(s) running:`, colors.green);
    runningServices.forEach(s => log(`  - ${s.name} (port ${s.port})`, colors.green));
  }

  await runTestsOnly();
}

async function startAndTest() {
  log('\n🚀 Starting services for testing...', colors.cyan);
  
  // Check if infrastructure is running
  const redisRunning = checkServiceRunning(6379);
  const postgresRunning = checkServiceRunning(5432);
  
  if (!redisRunning || !postgresRunning) {
    log('\n📦 Starting infrastructure (PostgreSQL, Redis)...', colors.yellow);
    const startInfra = await question('Start infrastructure? (y/n): ');
    
    if (startInfra.toLowerCase() === 'y') {
      try {
        await executeCommand('npm run infra:up', 'Starting infrastructure');
        log('✓ Waiting 10 seconds for infrastructure to be ready...', colors.yellow);
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        log('⚠️  Infrastructure start failed, but continuing...', colors.yellow);
      }
    }
  } else {
    log('✓ Infrastructure already running', colors.green);
  }

  // Start BFF
  const bffRunning = checkServiceRunning(3001);
  if (!bffRunning) {
    log('\n⚠️  BFF service needs to be started manually in a separate terminal.', colors.yellow);
    log('Please run in another terminal:', colors.blue);
    log('  npm run dev:bff\n', colors.cyan);
    
    const bffReady = await question('Press Enter when BFF is running...');
  } else {
    log('✓ BFF service already running', colors.green);
  }

  await runTestsOnly();
}

async function testDocker() {
  log('\n🐳 Testing against Docker services...', colors.cyan);
  
  // Check if docker is running
  try {
    execSync('docker ps', { stdio: 'ignore' });
  } catch (error) {
    log('\n✗ Docker is not running or not installed.\n', colors.red);
    log('Please start Docker Desktop and try again.\n', colors.blue);
    process.exit(1);
  }

  const startDocker = await question('Start Docker Compose services? (y/n): ');
  
  if (startDocker.toLowerCase() === 'y') {
    await executeCommand('npm run docker:up', 'Starting Docker services');
    log('✓ Waiting 30 seconds for services to be ready...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  await runTestsOnly();
}

async function testRemote() {
  log('\n🌐 Testing against remote environment...', colors.cyan);
  
  log('\nPlease enter the URLs for your environment:', colors.blue);
  
  const webUrl = await question('Web Frontend URL (e.g., https://shahin-ai.com): ');
  const bffUrl = await question('BFF Service URL (e.g., https://api.shahin-ai.com): ');
  const apiUrl = await question('API Service URL (e.g., https://grc-api.shahin-ai.com): ');
  
  if (!webUrl || !bffUrl || !apiUrl) {
    log('\n✗ All URLs are required.\n', colors.red);
    process.exit(1);
  }

  // Set environment variables
  process.env.WEB_URL = webUrl.trim();
  process.env.BFF_URL = bffUrl.trim();
  process.env.API_URL = apiUrl.trim();
  
  log(`\n✓ Configuration set:`, colors.green);
  log(`  Web: ${process.env.WEB_URL}`, colors.reset);
  log(`  BFF: ${process.env.BFF_URL}`, colors.reset);
  log(`  API: ${process.env.API_URL}\n`, colors.reset);

  await runTestsOnly();
}

async function runTestsOnly() {
  log('\n🧪 Running authentication path tests...\n', colors.magenta);
  
  try {
    await executeCommand('node tests/auth-path-test.js', 'Authentication Path Tests');
    
    // Show report location
    const reportPath = path.join(__dirname, 'auth-path-test-results.json');
    if (fs.existsSync(reportPath)) {
      log('\n📄 Test report generated:', colors.green);
      log(`   ${reportPath}\n`, colors.cyan);
      
      const viewReport = await question('View JSON report? (y/n): ');
      if (viewReport.toLowerCase() === 'y') {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        console.log('\n' + JSON.stringify(report, null, 2));
      }
    }

    log('\n✅ Testing complete!\n', colors.green);
    
  } catch (error) {
    log('\n⚠️  Tests completed with errors. Check the output above for details.\n', colors.yellow);
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
