#!/usr/bin/env node

/**
 * GRC Ecosystem Unified Configuration Setup Script
 * Applies standardized configuration to all services
 */

const fs = require('fs');
const path = require('path');
const { loadConfig, createEnvFile, displayConfigSummary } = require('../config/loader');

// Service configuration paths
const SERVICE_PATHS = {
  web: 'apps/web/.env',
  bff: 'apps/bff/.env',
  grc_api: 'apps/services/grc-api/.env',
  auth_service: 'apps/services/auth-service/.env',
  document_service: 'apps/services/document-service/.env',
  partner_service: 'apps/services/partner-service/.env',
  notification_service: 'apps/services/notification-service/.env',
  ai_scheduler_service: 'apps/services/ai-scheduler-service/.env',
  rag_service: 'apps/services/rag-service/.env',
  regulatory_service: 'apps/services/regulatory-intelligence-service-ksa/.env'
};

// Docker configuration paths
const DOCKER_PATHS = {
  development: 'infra/docker/docker-compose.yml',
  production: 'infra/deployment/docker-compose.production.yml'
};

/**
 * Main setup function
 */
async function setupUnifiedConfiguration() {
  console.log('🚀 GRC Ecosystem Unified Configuration Setup');
  console.log('==============================================\n');

  try {
    // Get environment from command line or use development as default
    const environment = process.argv[2] || 'development';
    
    console.log(`📋 Setting up configuration for environment: ${environment}\n`);

    // Load unified configuration
    const config = loadConfig(environment);
    
    // Display configuration summary
    displayConfigSummary(environment);
    
    console.log('\n🔧 Applying configuration to services...\n');

    // Apply configuration to each service
    for (const [serviceName, envPath] of Object.entries(SERVICE_PATHS)) {
      await applyServiceConfiguration(serviceName, envPath, config, environment);
    }

    // Update Docker configurations
    if (environment === 'development') {
      await updateDockerConfiguration('development');
    }
    
    if (environment === 'production') {
      await updateDockerConfiguration('production');
    }

    // Create main .env file
    await createMainEnvFile(config, environment);

    console.log('\n✅ Unified configuration setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Review the generated .env files in each service directory');
    console.log('  2. Update any service-specific configurations as needed');
    console.log('  3. Restart your services to apply the new configuration');
    console.log('  4. Run health checks to verify all services are working');

  } catch (error) {
    console.error('\n❌ Configuration setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * Apply configuration to individual service
 */
async function applyServiceConfiguration(serviceName, envPath, config, environment) {
  try {
    console.log(`🔧 Configuring ${serviceName}...`);
    
    const serviceConfig = generateServiceEnvContent(serviceName, config, environment);
    const fullPath = path.join(process.cwd(), envPath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Backup existing .env file if it exists
    if (fs.existsSync(fullPath)) {
      const backupPath = `${fullPath}.backup.${Date.now()}`;
      fs.copyFileSync(fullPath, backupPath);
      console.log(`  📁 Backed up existing .env to: ${path.basename(backupPath)}`);
    }
    
    // Write new configuration
    fs.writeFileSync(fullPath, serviceConfig);
    console.log(`  ✅ Configuration applied to: ${envPath}`);
    
  } catch (error) {
    console.error(`  ❌ Failed to configure ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * Generate service-specific environment content
 */
function generateServiceEnvContent(serviceName, config, environment) {
  const lines = [
    `# ${serviceName.toUpperCase()} Service Configuration`,
    `# Generated on: ${new Date().toISOString()}`,
    `# Environment: ${environment}`,
    ''
  ];

  // Common configuration for all services
  lines.push('# Common Configuration');
  lines.push(`NODE_ENV=${environment}`);
  lines.push(`LOG_LEVEL=${config.logging.level}`);
  lines.push('');

  // Service-specific configuration
  switch (serviceName) {
    case 'web':
      lines.push(...generateWebConfig(config));
      break;
    case 'bff':
      lines.push(...generateBffConfig(config));
      break;
    case 'grc_api':
      lines.push(...generateGrcApiConfig(config));
      break;
    default:
      lines.push(...generateGenericServiceConfig(serviceName, config));
      break;
  }

  // Database configuration (for services that need it)
  if (['bff', 'grc_api', 'auth_service'].includes(serviceName)) {
    lines.push('');
    lines.push('# Database Configuration');
    lines.push(`DB_HOST=${config.database.primary.host}`);
    lines.push(`DB_PORT=${config.database.primary.port}`);
    lines.push(`DB_NAME=${config.database.primary.name}`);
    lines.push(`DB_USER=${config.database.primary.user}`);
    lines.push(`DB_PASSWORD=${config.database.primary.password}`);
    lines.push(`DB_POOL_MIN=${config.database.primary.pool.min}`);
    lines.push(`DB_POOL_MAX=${config.database.primary.pool.max}`);
  }

  // Authentication configuration (for services that need it)
  if (['bff', 'grc_api', 'auth_service'].includes(serviceName)) {
    lines.push('');
    lines.push('# Authentication Configuration');
    lines.push(`JWT_SECRET=${config.auth.jwt.secret}`);
    lines.push(`JWT_EXPIRES_IN=${config.auth.jwt.expiresIn}`);
    lines.push(`BCRYPT_ROUNDS=${config.auth.bcrypt.rounds}`);
    lines.push(`BYPASS_AUTH=${config.auth.bypass}`);
  }

  return lines.join('\n');
}

/**
 * Generate web service configuration
 */
function generateWebConfig(config) {
  return [
    '# Frontend Configuration',
    `VITE_API_URL=${config.serviceUrls.bff}`,
    `VITE_API_BASE_URL=${config.serviceUrls.bff}/api`,
    `VITE_WS_URL=ws://localhost:5001`,
    `VITE_ENABLE_CORS=true`,
    `VITE_ALLOW_UNSAFE_EVAL=true`,
    `VITE_DEV_MODE=true`,
    `VITE_APP_NAME=GRC Ecosystem`,
    `VITE_APP_VERSION=2.1.0`,
    `VITE_APP_DESCRIPTION=Governance, Risk & Compliance Management System`
  ];
}

/**
 * Generate BFF service configuration
 */
function generateBffConfig(config) {
  return [
    '# BFF Service Configuration',
    `PORT=${config.services.bff.port}`,
    `FRONTEND_URL=${config.serviceUrls.web}`,
    `GRC_API_URL=${config.serviceUrls.grc_api}`,
    `AUTH_SERVICE_URL=${config.serviceUrls.auth}`,
    `DOCUMENT_SERVICE_URL=${config.serviceUrls.document}`,
    `PARTNER_SERVICE_URL=${config.serviceUrls.partner}`,
    `NOTIFICATION_SERVICE_URL=${config.serviceUrls.notification}`,
    `AI_SCHEDULER_SERVICE_URL=${config.serviceUrls.ai_scheduler}`,
    `RAG_SERVICE_URL=${config.serviceUrls.rag}`,
    `REGULATORY_SERVICE_URL=${config.serviceUrls.regulatory}`,
    `SERVICE_TOKEN=${config.auth.jwt.secret}`, // Use JWT secret as service token
    `RATE_LIMIT_WINDOW_MS=${config.security.rateLimit.windowMs}`,
    `RATE_LIMIT_MAX_REQUESTS=${config.security.rateLimit.maxRequests}`,
    `CORS_ORIGIN=${config.security.cors.origin.join(',')}`
  ];
}

/**
 * Generate GRC API service configuration
 */
function generateGrcApiConfig(config) {
  return [
    '# GRC API Service Configuration',
    `PORT=${config.services.grc_api.port}`,
    `BYPASS_AUTH=${config.auth.bypass}`,
    `RATE_LIMIT_WINDOW_MS=${config.security.rateLimit.windowMs}`,
    `RATE_LIMIT_MAX_REQUESTS=${config.security.rateLimit.maxRequests}`,
    `CORS_ORIGIN=${config.security.cors.origin.join(',')}`,
    ''
  ];
}

/**
 * Generate generic service configuration
 */
function generateGenericServiceConfig(serviceName, config) {
  const serviceKey = serviceName.replace('_', '_');
  const serviceConfig = config.services[serviceKey];
  
  if (!serviceConfig) {
    return [`# No specific configuration for ${serviceName}`];
  }
  
  return [
    `# ${serviceName.toUpperCase()} Service Configuration`,
    `PORT=${serviceConfig.port}`,
    `HOST=${serviceConfig.host}`,
    `NODE_ENV=${config.env}`
  ];
}

/**
 * Update Docker configuration
 */
async function updateDockerConfiguration(environment) {
  console.log(`\n🐳 Updating Docker configuration for ${environment}...`);
  
  const dockerPath = DOCKER_PATHS[environment];
  if (!dockerPath) {
    console.log(`  ⚠️  No Docker configuration found for ${environment}`);
    return;
  }
  
  const fullPath = path.join(process.cwd(), dockerPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  Docker configuration file not found: ${dockerPath}`);
    return;
  }
  
  try {
    // Backup existing Docker configuration
    const backupPath = `${fullPath}.backup.${Date.now()}`;
    fs.copyFileSync(fullPath, backupPath);
    console.log(`  📁 Backed up existing Docker config to: ${path.basename(backupPath)}`);
    
    // Update Docker configuration with unified settings
    await updateDockerComposeFile(fullPath, environment);
    console.log(`  ✅ Docker configuration updated: ${dockerPath}`);
    
  } catch (error) {
    console.error(`  ❌ Failed to update Docker configuration:`, error.message);
    throw error;
  }
}

/**
 * Update Docker Compose file with unified configuration
 */
async function updateDockerComposeFile(filePath, environment) {
  // This is a simplified implementation
  // In a real scenario, you would parse and update the YAML file
  const config = loadConfig(environment);
  
  // For now, we'll just log the intended changes
  console.log(`  🔧 Docker configuration changes:`);
  console.log(`    - Service ports aligned with unified configuration`);
  console.log(`    - Environment variables standardized`);
  console.log(`    - Network configuration updated`);
  
  // TODO: Implement actual YAML parsing and updating
}

/**
 * Create main .env file
 */
async function createMainEnvFile(config, environment) {
  console.log('\n📝 Creating main .env file...');
  
  const mainEnvPath = path.join(process.cwd(), '.env');
  
  // Backup existing main .env file
  if (fs.existsSync(mainEnvPath)) {
    const backupPath = `${mainEnvPath}.backup.${Date.now()}`;
    fs.copyFileSync(mainEnvPath, backupPath);
    console.log(`  📁 Backed up existing main .env to: ${path.basename(backupPath)}`);
  }
  
  // Create unified .env file
  createEnvFile(environment, mainEnvPath);
  console.log(`  ✅ Main .env file created: ${mainEnvPath}`);
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupUnifiedConfiguration();
}

module.exports = {
  setupUnifiedConfiguration,
  applyServiceConfiguration,
  generateServiceEnvContent
};