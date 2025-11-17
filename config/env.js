/**
 * Environment Configuration (CommonJS)
 * Centralized environment variable management for BFF
 */

function parseEnv() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const allowMissingDatabaseUrl =
    process.env.VERCEL ||
    process.env.ALLOW_DBLESS_START === 'true';

  if (!DATABASE_URL && !allowMissingDatabaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!DATABASE_URL && allowMissingDatabaseUrl) {
    console.warn('Warning: DATABASE_URL is not set. Database-backed routes will be unavailable until it is configured.');
  }

  // Parse comma-separated frontend origins
  const originsStr = process.env.FRONTEND_ORIGINS || 'http://localhost:5173';
  const FRONTEND_ORIGINS = originsStr.split(',').map(o => o.trim());

  return {
    DATABASE_URL: DATABASE_URL || null,
    FRONTEND_ORIGINS,
    PUBLIC_BFF_URL: process.env.PUBLIC_BFF_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3005', 10),
    JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret',
    SERVICE_TOKEN: process.env.SERVICE_TOKEN || 'default-service-token'
  };
}

const ENV = parseEnv();

// Log configuration on startup (without sensitive data)
console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${ENV.NODE_ENV}`);
console.log(`   PORT: ${ENV.PORT}`);
console.log(`   DATABASE_URL: ${ENV.DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`   FRONTEND_ORIGINS: ${ENV.FRONTEND_ORIGINS.join(', ')}`);
console.log(`   PUBLIC_BFF_URL: ${ENV.PUBLIC_BFF_URL || 'Not set'}`);

module.exports = { ENV };
