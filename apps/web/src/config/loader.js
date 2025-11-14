/**
 * GRC Ecosystem Configuration Loader
 * Provides unified configuration loading for all services
 */

const path = require('path');
const fs = require('fs');

// Load the unified configuration
const { getConfig, getServiceConfig } = require('./ecosystem.config');

/**
 * Load environment-specific configuration
 * @param {string} environment - Environment name (development, docker, production)
 * @returns {Object} Unified configuration object
 */
function loadConfig(environment) {
  try {
    // Determine environment
    const env = environment || process.env.NODE_ENV || 'development';
    
    // Load base configuration
    const config = getConfig(env);
    
    // Validate required environment variables
    validateConfig(config, env);
    
    console.log(`✅ Configuration loaded for environment: ${env}`);
    return config;
  } catch (error) {
    console.error('❌ Configuration loading failed:', error.message);
    throw error;
  }
}

/**
 * Load service-specific configuration
 * @param {string} serviceName - Name of the service
 * @param {string} environment - Environment name
 * @returns {Object} Service configuration object
 */
function loadServiceConfig(serviceName, environment) {
  try {
    const env = environment || process.env.NODE_ENV || 'development';
    const serviceConfig = getServiceConfig(serviceName, env);
    
    console.log(`✅ Service configuration loaded: ${serviceName} (${env})`);
    return serviceConfig;
  } catch (error) {
    console.error(`❌ Service configuration loading failed for ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * Validate configuration for required fields
 * @param {Object} config - Configuration object
 * @param {string} environment - Environment name
 */
function validateConfig(config, environment) {
  const required = {
    development: ['database.primary.host', 'database.primary.name'],
    production: ['database.primary.host', 'database.primary.name', 'auth.jwt.secret']
  };
  
  const requiredFields = required[environment] || required.development;
  
  for (const field of requiredFields) {
    const value = getNestedValue(config, field);
    if (!value || value === '') {
      throw new Error(`Required configuration field missing: ${field}`);
    }
  }
}

/**
 * Get nested object value using dot notation
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @returns {*} Value at the path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

/**
 * Create environment-specific .env file
 * @param {string} environment - Target environment
 * @param {string} outputPath - Output file path
 */
function createEnvFile(environment, outputPath) {
  const config = loadConfig(environment);
  const envContent = generateEnvContent(config);
  
  fs.writeFileSync(outputPath, envContent);
  console.log(`📝 Environment file created: ${outputPath}`);
}

/**
 * Generate .env file content from configuration
 * @param {Object} config - Configuration object
 * @returns {string} .env file content
 */
function generateEnvContent(config) {
  const lines = [
    `# GRC Ecosystem - ${config.env.toUpperCase()} Environment`,
    `# Generated on: ${new Date().toISOString()}`,
    '',
    '# Environment',
    `NODE_ENV=${config.env}`,
    `LOG_LEVEL=${config.logging.level}`,
    '',
    '# Service Ports',
    `GRC_API_PORT=${config.services.grc_api.port}`,
    `BFF_PORT=${config.services.bff.port}`,
    `WEB_PORT=${config.services.web.port}`,
    `AUTH_SERVICE_PORT=${config.services.auth.port}`,
    `DOCUMENT_SERVICE_PORT=${config.services.document.port}`,
    `PARTNER_SERVICE_PORT=${config.services.partner.port}`,
    `NOTIFICATION_SERVICE_PORT=${config.services.notification.port}`,
    `AI_SCHEDULER_SERVICE_PORT=${config.services.ai_scheduler.port}`,
    `RAG_SERVICE_PORT=${config.services.rag.port}`,
    `REGULATORY_SERVICE_PORT=${config.services.regulatory.port}`,
    '',
    '# Database',
    `DB_HOST=${config.database.primary.host}`,
    `DB_PORT=${config.database.primary.port}`,
    `DB_NAME=${config.database.primary.name}`,
    `DB_USER=${config.database.primary.user}`,
    `DB_PASSWORD=${config.database.primary.password}`,
    `DB_POOL_MIN=${config.database.primary.pool.min}`,
    `DB_POOL_MAX=${config.database.primary.pool.max}`,
    `DB_SSL=${config.database.primary.ssl}`,
    '',
    '# Authentication',
    `JWT_SECRET=${config.auth.jwt.secret}`,
    `JWT_EXPIRES_IN=${config.auth.jwt.expiresIn}`,
    `JWT_REFRESH_SECRET=${config.auth.jwt.refreshSecret}`,
    `JWT_REFRESH_EXPIRES_IN=${config.auth.jwt.refreshExpiresIn}`,
    `BCRYPT_ROUNDS=${config.auth.bcrypt.rounds}`,
    `BYPASS_AUTH=${config.auth.bypass}`,
    '',
    '# Security',
    `ENABLE_CORS=${config.security.cors.enabled}`,
    `CORS_ORIGIN=${config.security.cors.origin.join(',')}`,
    `RATE_LIMIT_WINDOW_MS=${config.security.rateLimit.windowMs}`,
    `RATE_LIMIT_MAX_REQUESTS=${config.security.rateLimit.maxRequests}`,
    '',
    '# Frontend',
    `VITE_API_URL=${config.serviceUrls.bff}`,
    `VITE_API_BASE_URL=${config.serviceUrls.bff}/api`,
    `VITE_APP_NAME=${config.services.web.name}`,
    '',
    '# File Upload',
    `MAX_FILE_SIZE=${config.upload.maxFileSize}`,
    `UPLOAD_DIR=${config.upload.uploadDir}`,
    '',
    '# Notifications',
    `SMTP_HOST=${config.notifications.smtp.host}`,
    `SMTP_PORT=${config.notifications.smtp.port}`,
    `SMTP_FROM=${config.notifications.smtp.from}`,
    `EMAIL_TRACKING=${config.notifications.emailTracking}`,
    ''
  ];
  
  return lines.join('\n');
}

/**
 * Display configuration summary
 * @param {string} environment - Environment name
 */
function displayConfigSummary(environment) {
  const config = loadConfig(environment);
  
  console.log('\n📋 Configuration Summary');
  console.log('========================');
  console.log(`Environment: ${config.env}`);
  console.log(`Database: ${config.database.primary.host}:${config.database.primary.port}/${config.database.primary.name}`);
  console.log(`Auth Bypass: ${config.auth.bypass ? 'Enabled' : 'Disabled'}`);
  console.log(`CORS: ${config.security.cors.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`Rate Limiting: ${config.security.rateLimit.maxRequests} requests per ${config.security.rateLimit.windowMs}ms`);
  
  console.log('\n🌐 Service URLs:');
  Object.entries(config.serviceUrls).forEach(([service, url]) => {
    console.log(`  ${service}: ${url}`);
  });
  
  console.log('\n🔧 Features:');
  Object.entries(config.features).forEach(([feature, enabled]) => {
    console.log(`  ${feature}: ${enabled ? 'Enabled' : 'Disabled'}`);
  });
}

module.exports = {
  loadConfig,
  loadServiceConfig,
  createEnvFile,
  displayConfigSummary,
  validateConfig
};