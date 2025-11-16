/**
 * Multi-Tenant Rate Limiting
 * Provides per-tenant rate limiting to prevent abuse and ensure fair usage
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Initialize Redis client (optional, falls back to memory store)
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
    });
    
    redisClient.on('connect', () => {
      console.log('[Rate Limiter] Connected to Redis');
    });
    
    redisClient.on('error', (err) => {
      console.error('[Rate Limiter] Redis error:', err);
      redisClient = null; // Fall back to memory store
    });
  }
} catch (error) {
  console.warn('[Rate Limiter] Redis not available, using memory store');
}

/**
 * Get tenant ID from request
 */
function getTenantId(req) {
  return req.headers['x-tenant-id'] || 
         req.user?.tenantId || 
         req.user?.tenant_id || 
         'default';
}

/**
 * Create per-tenant rate limiter
 */
function createTenantRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests from this tenant',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    skip = undefined,
  } = options;

  const storeConfig = {};

  return rateLimit({
    windowMs,
    max,
    ...storeConfig,
    
    // Use tenant ID as key
    keyGenerator: (req) => {
      const tenantId = getTenantId(req);
      return tenantId || 'default';
    },
    
    // Custom handler
    handler: (req, res) => {
      const tenantId = getTenantId(req);
      
      // Log rate limit hit
      console.warn('[Rate Limiter] Tenant rate limit exceeded', {
        tenantId,
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      
      // Send error tracking
      if (process.env.SENTRY_ENABLED === 'true') {
        const { captureMessage } = require('./sentry');
        captureMessage('Rate limit exceeded', 'warning', {
          tenantId,
          extra: {
            ip: req.ip,
            path: req.path,
            method: req.method,
          },
        });
      }
      
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: message,
        code: 'RATE_LIMIT_EXCEEDED',
        tenantId,
        retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes',
      });
    },
    
    skipSuccessfulRequests,
    skipFailedRequests,
    ...(typeof skip === 'function' ? { skip } : {}),
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Tier-based rate limiting
 * Different limits for different subscription tiers
 */
function createTierBasedRateLimiter() {
  // Define tier limits
  const tierLimits = {
    free: { windowMs: 15 * 60 * 1000, max: 100 },      // 100 req / 15min
    starter: { windowMs: 15 * 60 * 1000, max: 500 },   // 500 req / 15min
    professional: { windowMs: 15 * 60 * 1000, max: 2000 }, // 2000 req / 15min
    enterprise: { windowMs: 15 * 60 * 1000, max: 10000 },  // 10000 req / 15min
  };

  return async (req, res, next) => {
    const tenantId = getTenantId(req);
    
    // Get tenant tier from database or cache
    // TODO: Implement tenant tier lookup
    const tenantTier = req.user?.subscriptionTier || 'free';
    
    const limits = tierLimits[tenantTier] || tierLimits.free;
    
    // Create rate limiter for this tier
    const limiter = createTenantRateLimiter({
      windowMs: limits.windowMs,
      max: limits.max,
      message: `Rate limit exceeded for ${tenantTier} tier`,
    });
    
    // Apply rate limiter
    return limiter(req, res, next);
  };
}

/**
 * Authentication-specific rate limiter
 * Stricter limits for auth endpoints to prevent brute force
 */
function createAuthRateLimiter() {
  const { ENV } = require('../config/env');
  const isProduction = ENV.NODE_ENV === 'production';
  return createTenantRateLimiter({
    windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000,
    max: isProduction ? 5 : 1000,
    message: 'Too many authentication attempts',
    skipSuccessfulRequests: true,
    skip: (req) => !isProduction,
  });
}

/**
 * API key rate limiter
 * For API key based authentication
 */
function createApiKeyRateLimiter() {
  const storeConfig = {};

  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute per API key
    ...storeConfig,
    
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] || 'anonymous';
      return apiKey;
    },
    
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'API rate limit exceeded',
        message: 'Too many requests with this API key',
        code: 'API_RATE_LIMIT_EXCEEDED',
      });
    },
  });
}

/**
 * Whitelist middleware
 * Bypass rate limiting for whitelisted IPs or tenants
 */
function createWhitelistMiddleware(whitelist = []) {
  return (req, res, next) => {
    const tenantId = getTenantId(req);
    const ip = req.ip || req.connection.remoteAddress;
    
    // Check if tenant or IP is whitelisted
    if (whitelist.includes(tenantId) || whitelist.includes(ip)) {
      return next('route'); // Skip rate limiter
    }
    
    next();
  };
}

/**
 * Get rate limit status for a tenant
 */
async function getRateLimitStatus(tenantId, ip) {
  if (!redisClient) {
    return { available: true, message: 'Rate limiting not configured' };
  }

  try {
    const key = `rl:tenant:${tenantId}:${ip}`;
    const count = await redisClient.get(key);
    
    return {
      available: true,
      current: parseInt(count) || 0,
      limit: 100, // TODO: Get actual limit from tier
      remaining: Math.max(0, 100 - (parseInt(count) || 0)),
    };
  } catch (error) {
    console.error('[Rate Limiter] Failed to get status:', error);
    return { available: false, error: error.message };
  }
}

module.exports = {
  createTenantRateLimiter,
  createTierBasedRateLimiter,
  createAuthRateLimiter,
  createApiKeyRateLimiter,
  createWhitelistMiddleware,
  getRateLimitStatus,
  redisClient,
};
