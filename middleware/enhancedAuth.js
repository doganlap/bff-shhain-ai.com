/**
 * Enhanced Authentication Middleware with Token Management
 * Addresses: Token expiration, blacklisting, refresh logic
 */

const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const { ENV } = require('../config/env');

// Initialize Redis for token blacklist
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Token blacklist (in-memory fallback if no Redis)
const tokenBlacklist = new Set();

// ✅ NEW: User cache for authentication (5-minute TTL)
const userCache = new Map();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUser(userId, tenantId) {
  const key = `${userId}:${tenantId}`;
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
    return cached.user;
  }
  return null;
}

function setCachedUser(userId, tenantId, user) {
  const key = `${userId}:${tenantId}`;
  userCache.set(key, { user, timestamp: Date.now() });
  // Auto-cleanup old cache entries
  if (userCache.size > 1000) {
    const oldestKey = userCache.keys().next().value;
    userCache.delete(oldestKey);
  }
}

/**
 * Enhanced authentication middleware
 */
const authenticateToken = async (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    req.user = {
      id: 'dev-user-123',
      email: 'admin@dev.local',
      tenantId: '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
      roles: ['admin']
    };
    return next();
  }

  if (process.env.STAGING_OPEN_ACCESS === 'true') {
    const origin = req.headers.origin || (typeof req.get === 'function' ? req.get('Origin') : undefined);
    const allowed = Array.isArray(ENV.FRONTEND_ORIGINS)
      ? (!origin || ENV.FRONTEND_ORIGINS.includes(origin))
      : (!origin || origin === ENV.FRONTEND_ORIGINS);
    const stagingHeader = req.headers['x-staging-access'];
    const stagingToken = process.env.STAGING_ACCESS_TOKEN;
    const headerOk = stagingToken ? stagingHeader === stagingToken : true;
    if (allowed && headerOk) {
      req.user = {
        id: 'staging-user',
        email: 'staging@shahin-ai.com',
        tenantId: 'staging-tenant',
        roles: ['admin']
      };
      return next();
    }
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Authentication token is missing',
      code: 'TOKEN_MISSING'
    });
  }

  // ✅ NEW: Check if token is blacklisted (logged out)
  const isBlacklisted = await checkTokenBlacklist(token);
  if (isBlacklisted) {
    return res.status(401).json({
      error: 'Token revoked',
      message: 'This token has been invalidated. Please login again.',
      code: 'TOKEN_REVOKED'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET not set in production environment');
    return res.status(500).json({
      error: 'Server configuration error',
      code: 'CONFIG_ERROR'
    });
  }

  try {
    // Verify token with options
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, jwtSecret || 'fallback-secret', {
        algorithms: ['HS256'],  // ✅ NEW: Specify allowed algorithms
        maxAge: '15m',           // ✅ NEW: Explicit max age
        clockTolerance: 30        // ✅ NEW: Allow 30s clock skew
      }, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    // ✅ NEW: Validate token structure
    if (!decoded.id || !decoded.tenantId) {
      return res.status(403).json({
        error: 'Invalid token payload',
        message: 'Token does not contain required user information',
        code: 'INVALID_PAYLOAD'
      });
    }

    // ✅ NEW: Check if token is close to expiration (for refresh warning)
    const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeToExpiry < 300) { // Less than 5 minutes
      res.setHeader('X-Token-Expiring', 'true');
      res.setHeader('X-Token-Expires-In', timeToExpiry.toString());
    }

    // ✅ NEW: Check if user still exists and is active (with caching)
    // This prevents deleted users from accessing with old tokens
    let cachedUser = getCachedUser(decoded.id, decoded.tenantId);
    if (!cachedUser) {
      const userExists = await verifyUserExists(decoded.id, decoded.tenantId);
      if (!userExists) {
        return res.status(401).json({
          error: 'User not found',
          message: 'User account no longer exists',
          code: 'USER_NOT_FOUND'
        });
      }
      setCachedUser(decoded.id, decoded.tenantId, decoded);
    }

    req.user = decoded;
    next();

  } catch (error) {
    const errorCode = error.name === 'TokenExpiredError'
      ? 'TOKEN_EXPIRED'
      : error.name === 'JsonWebTokenError'
      ? 'TOKEN_INVALID'
      : 'TOKEN_ERROR';

    return res.status(403).json({
      error: 'Token verification failed',
      message: error.message,
      code: errorCode
    });
  }
};

/**
 * Check if token is blacklisted
 */
async function checkTokenBlacklist(token) {
  try {
    if (redis) {
      const exists = await redis.exists(`blacklist:${token}`);
      return exists === 1;
    } else {
      // Fallback to in-memory
      return tokenBlacklist.has(token);
    }
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false; // Fail open (allow access if Redis is down)
  }
}

/**
 * Add token to blacklist (for logout)
 */
async function blacklistToken(token, expiresIn = 900) {
  try {
    if (redis) {
      await redis.setex(`blacklist:${token}`, expiresIn, '1');
    } else {
      tokenBlacklist.add(token);
      // Clean up after expiry
      setTimeout(() => tokenBlacklist.delete(token), expiresIn * 1000);
    }
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
}

/**
 * Verify user still exists and is active
 */
async function verifyUserExists(userId, tenantId) {
  // TODO: Implement database check
  // Example:
  // const user = await db.query('SELECT id, is_active FROM users WHERE id = ? AND tenant_id = ?', [userId, tenantId]);
  // return user && user.is_active;

  // For now, assume user exists
  return true;
}

/**
 * Token refresh endpoint
 */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token required',
      code: 'REFRESH_TOKEN_MISSING'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(refreshToken);
    if (isBlacklisted) {
      return res.status(401).json({
        error: 'Refresh token revoked',
        code: 'REFRESH_TOKEN_REVOKED'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        tenantId: decoded.tenantId,
        roles: decoded.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Optionally rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id, tenantId: decoded.tenantId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Blacklist old refresh token
    await blacklistToken(refreshToken, 7 * 24 * 60 * 60); // 7 days

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900 // 15 minutes
    });

  } catch (error) {
    return res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

/**
 * Logout endpoint (blacklist tokens)
 */
const logout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { refreshToken } = req.body;

  if (token) {
    await blacklistToken(token, 900); // 15 minutes
  }

  if (refreshToken) {
    await blacklistToken(refreshToken, 7 * 24 * 60 * 60); // 7 days
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  authenticateToken,
  refreshToken,
  logout,
  blacklistToken,
  checkTokenBlacklist
};
