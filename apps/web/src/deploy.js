#!/usr/bin/env node
/**
 * Production Deployment Automation Script
 * Handles blue-green deployment with rollback capabilities
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const CONFIG = {
  dockerRegistry: process.env.DOCKER_REGISTRY || 'ghcr.io',
  imageTag: process.env.IMAGE_TAG || 'latest',
  kubeNamespace: process.env.KUBE_NAMESPACE || 'default',
  healthCheckTimeout: 300, // 5 minutes
  monitoringDuration: 300, // 5 minutes
  services: [
    'web', 'bff', 'grc-api', 'auth-service',
    'document-service', 'partner-service', 'notification-service'
  ]
};

// Logging utilities
function log(level, message) {
  const timestamp = new Date().toISOString();
  const colors = {
    INFO: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    WARNING: '\x1b[33m',
    ERROR: '\x1b[31m',
    RESET: '\x1b[0m'
  };

  console.log(`${colors[level]}[${timestamp}] [${level}] ${message}${colors.RESET}`);
}

// Execute shell command with error handling
function execCommand(command, options = {}) {
  try {
    log('INFO', `Executing: ${command}`);
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    log('ERROR', `Command failed: ${command}`);
    log('ERROR', error.message);
    return { success: false, error: error.message };
  }
}

// Check if a deployment is ready
async function waitForDeployment(deploymentName, timeout = CONFIG.healthCheckTimeout) {
  log('INFO', `Waiting for deployment ${deploymentName} to be ready (timeout: ${timeout}s)`);

  const command = `kubectl rollout status deployment/${deploymentName} --timeout=${timeout}s`;
  const result = execCommand(command);

  if (result.success) {
    log('SUCCESS', `Deployment ${deploymentName} is ready`);
    return true;
  } else {
    log('ERROR', `Deployment ${deploymentName} failed to become ready`);
    return false;
  }
}

// Run health checks
async function runHealthChecks(environment) {
  log('INFO', `Running health checks for ${environment} environment`);

  // Port forward for health checks
  execCommand(
    `kubectl port-forward service/grc-platform-${environment} 8080:80 &`,
    { silent: true }
  );

  // Wait a bit for port forward to establish
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Run health check script
  const healthCheckResult = execCommand('./scripts/health-check.sh http://localhost:8080');

  // Cleanup port forward
  execCommand('pkill -f "kubectl port-forward"', { silent: true });

  return healthCheckResult.success;
}

// Deploy to specific environment (blue or green)
async function deployEnvironment(environment) {
  log('INFO', `Starting deployment to ${environment} environment`);

  // Update deployment manifest with current image tags
  const deploymentFile = `infra/k8s/deployment-${environment}.yaml`;
  let manifest = fs.readFileSync(deploymentFile, 'utf8');

  // Replace image placeholders
  CONFIG.services.forEach(service => {
    const imagePattern = new RegExp(`\\$\\{DOCKER_REGISTRY\\}/\\$\\{GITHUB_REPOSITORY\\}/${service}:\\$\\{IMAGE_TAG\\}`, 'g');
    const imageUrl = `${CONFIG.dockerRegistry}/${process.env.GITHUB_REPOSITORY}/${service}:${CONFIG.imageTag}`;
    manifest = manifest.replace(imagePattern, imageUrl);
  });

  // Write updated manifest to temporary file
  const tempManifestFile = `/tmp/deployment-${environment}-${Date.now()}.yaml`;
  fs.writeFileSync(tempManifestFile, manifest);

  // Apply deployment
  const deployResult = execCommand(`kubectl apply -f ${tempManifestFile}`);

  // Cleanup temp file
  fs.unlinkSync(tempManifestFile);

  if (!deployResult.success) {
    log('ERROR', `Failed to apply ${environment} deployment`);
    return false;
  }

  // Wait for deployment to be ready
  const isReady = await waitForDeployment(`grc-platform-${environment}`);
  if (!isReady) {
    return false;
  }

  // Run health checks
  const isHealthy = await runHealthChecks(environment);
  if (!isHealthy) {
    log('ERROR', `Health checks failed for ${environment} environment`);
    return false;
  }

  log('SUCCESS', `${environment} environment deployed successfully`);
  return true;
}

// Switch traffic to new environment
async function switchTraffic(toEnvironment) {
  log('INFO', `Switching traffic to ${toEnvironment} environment`);

  const patchCommand = `kubectl patch service grc-platform -p '{"spec":{"selector":{"version":"${toEnvironment}"}}}'`;
  const result = execCommand(patchCommand);

  if (result.success) {
    log('SUCCESS', `Traffic switched to ${toEnvironment} environment`);
    return true;
  } else {
    log('ERROR', `Failed to switch traffic to ${toEnvironment} environment`);
    return false;
  }
}

// Monitor the new environment
async function monitorEnvironment(environment) {
  log('INFO', `Monitoring ${environment} environment for ${CONFIG.monitoringDuration} seconds`);

  const startTime = Date.now();
  const endTime = startTime + (CONFIG.monitoringDuration * 1000);

  while (Date.now() < endTime) {
    // Check for errors in logs
    const logsResult = execCommand(
      `kubectl logs -l app=grc-platform,version=${environment} --tail=50 --since=1m`,
      { silent: true }
    );

    if (logsResult.success && logsResult.output.includes('ERROR')) {
      log('ERROR', 'Error detected in application logs during monitoring');
      return false;
    }

    // Check deployment health
    const healthResult = execCommand(
      `kubectl get deployment grc-platform-${environment} -o jsonpath='{.status.readyReplicas}'`,
      { silent: true }
    );

    if (healthResult.success) {
      const readyReplicas = parseInt(healthResult.output) || 0;
      if (readyReplicas < 3) { // Expecting 3 replicas
        log('WARNING', `Only ${readyReplicas} replicas are ready`);
      }
    }

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
  }

  log('SUCCESS', `Monitoring completed successfully for ${environment} environment`);
  return true;
}

// Rollback to previous environment
async function rollback(fromEnvironment, toEnvironment) {
  log('WARNING', `Rolling back from ${fromEnvironment} to ${toEnvironment}`);

  // Switch traffic back
  const switchResult = await switchTraffic(toEnvironment);
  if (!switchResult) {
    log('ERROR', 'Failed to switch traffic during rollback');
    return false;
  }

  // Scale up the previous environment if needed
  const scaleResult = execCommand(`kubectl scale deployment grc-platform-${toEnvironment} --replicas=3`);
  if (!scaleResult.success) {
    log('ERROR', `Failed to scale up ${toEnvironment} deployment during rollback`);
    return false;
  }

  // Wait for rollback deployment to be ready
  const isReady = await waitForDeployment(`grc-platform-${toEnvironment}`);
  if (!isReady) {
    log('ERROR', `Rollback deployment ${toEnvironment} failed to become ready`);
    return false;
  }

  log('SUCCESS', `Successfully rolled back to ${toEnvironment} environment`);
  return true;
}

// Get current active environment
function getCurrentEnvironment() {
  const result = execCommand(
    `kubectl get service grc-platform -o jsonpath='{.spec.selector.version}'`,
    { silent: true }
  );

  if (result.success) {
    const currentEnv = result.output.trim();
    log('INFO', `Current active environment: ${currentEnv}`);
    return currentEnv;
  } else {
    log('WARNING', 'Could not determine current environment, defaulting to green');
    return 'green';
  }
}

// Main deployment function
async function deploy() {
  log('INFO', '🚀 Starting Blue-Green Deployment for GRC Platform');
  log('INFO', `Docker Registry: ${CONFIG.dockerRegistry}`);
  log('INFO', `Image Tag: ${CONFIG.imageTag}`);

  try {
    // Determine current and next environments
    const currentEnv = getCurrentEnvironment();
    const nextEnv = currentEnv === 'blue' ? 'green' : 'blue';

    log('INFO', `Deploying to ${nextEnv} environment (current: ${currentEnv})`);

    // Deploy to next environment
    const deploySuccess = await deployEnvironment(nextEnv);
    if (!deploySuccess) {
      log('ERROR', `Deployment to ${nextEnv} environment failed`);
      process.exit(1);
    }

    // Switch traffic to new environment
    const switchSuccess = await switchTraffic(nextEnv);
    if (!switchSuccess) {
      log('ERROR', 'Failed to switch traffic');
      await rollback(nextEnv, currentEnv);
      process.exit(1);
    }

    // Monitor new environment
    const monitorSuccess = await monitorEnvironment(nextEnv);
    if (!monitorSuccess) {
      log('ERROR', 'Monitoring detected issues');
      await rollback(nextEnv, currentEnv);
      process.exit(1);
    }

    // Scale down old environment
    log('INFO', `Scaling down ${currentEnv} environment`);
    execCommand(`kubectl scale deployment grc-platform-${currentEnv} --replicas=0`);

    log('SUCCESS', '🎉 Blue-Green deployment completed successfully!');
    log('SUCCESS', `✅ GRC Platform is now running on ${nextEnv} environment`);

  } catch (error) {
    log('ERROR', `Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'deploy':
      deploy();
      break;
    case 'rollback':
      {
        const fromEnv = process.argv[3] || getCurrentEnvironment();
        const toEnv = fromEnv === 'blue' ? 'green' : 'blue';
        rollback(fromEnv, toEnv);
      }
      break;
    case 'status':
      getCurrentEnvironment();
      break;
    default:
      console.log('Usage:');
      console.log('  node deploy.js deploy    # Start blue-green deployment');
      console.log('  node deploy.js rollback  # Rollback to previous environment');
      console.log('  node deploy.js status    # Check current environment');
      break;
  }
}

module.exports = { deploy, rollback, getCurrentEnvironment };
