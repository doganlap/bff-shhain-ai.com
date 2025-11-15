/**
 * Login Attempt Limiter Middleware
 * Implements:
 * - Max 5 login attempts per 15 minutes
 * - Account lockout after 10 failed attempts
 * - Audit logging for all login attempts
 */

const { auditAuthEvent, auditSecurityEvent, AuditEventType, AuditSeverity } = require('./auditLogger');
const { logger } = require('../utils/logger');

// In-memory store for login attempts (use Redis in production)
const loginAttempts = new Map();
const lockedAccounts = new Map();

// Configuration
const MAX_ATTEMPTS_SHORT = 5;      // Max attempts in short window
const SHORT_WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const MAX_ATTEMPTS_LONG = 10;      // Max attempts before lockout
const LOCKOUT_DURATION_MS = 60 * 60 * 1000;  // 1 hour

/**
 * Get login attempts for a user/IP combination
 */
function getAttempts(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];

  // Filter out attempts outside the window
  const recentAttempts = attempts.filter(timestamp =>
    now - timestamp < SHORT_WINDOW_MS
  );

  loginAttempts.set(identifier, recentAttempts);
  return recentAttempts;
}

/**
 * Record a failed login attempt
 */
function recordFailedAttempt(identifier) {
  const attempts = getAttempts(identifier);
  attempts.push(Date.now());
  loginAttempts.set(identifier, attempts);

  return attempts.length;
}

/**
 * Clear login attempts (on successful login)
 */
function clearAttempts(identifier) {
  loginAttempts.delete(identifier);
  lockedAccounts.delete(identifier);
}

/**
 * Check if account is locked
 */
function isAccountLocked(identifier) {
  const lockUntil = lockedAccounts.get(identifier);
  if (!lockUntil) return false;

  const now = Date.now();
  if (now < lockUntil) {
    return true;
  }

  // Lock expired, clear it
  lockedAccounts.delete(identifier);
  return false;
}

/**
 * Lock account after too many failed attempts
 */
function lockAccount(identifier) {
  const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
  lockedAccounts.set(identifier, lockUntil);

  logger.warn('Account locked due to too many failed login attempts', {
    identifier,
    lockUntil: new Date(lockUntil).toISOString()
  });
}

/**
 * Get remaining lock time in minutes
 */
function getRemainingLockTime(identifier) {
  const lockUntil = lockedAccounts.get(identifier);
  if (!lockUntil) return 0;

  const remaining = lockUntil - Date.now();
  return Math.ceil(remaining / 60000); // Convert to minutes
}

/**
 * Middleware to check login attempts before authentication
 * Apply this BEFORE the authentication logic
 */
function checkLoginAttempts(req, res, next) {
  // Only apply to login endpoints
  if (!req.path.includes('/login') && !req.path.includes('/auth')) {
    return next();
  }

  const identifier = `${req.body.email || req.body.username}:${req.ip}`;

  // Check if account is locked
  if (isAccountLocked(identifier)) {
    const remainingMinutes = getRemainingLockTime(identifier);

    auditSecurityEvent(AuditEventType.LOGIN_LOCKED, req, {
      severity: AuditSeverity.WARNING,
      details: {
        identifier,
        remainingMinutes,
        reason: 'Account locked due to too many failed login attempts'
      },
      errorMessage: 'Account temporarily locked'
    });

    return res.status(429).json({
      success: false,
      error: 'Account temporarily locked',
      message: `Too many failed login attempts. Account locked for ${remainingMinutes} minutes.`,
      code: 'ACCOUNT_LOCKED',
      remainingMinutes
    });
  }

  // Check rate limiting
  const attempts = getAttempts(identifier);
  if (attempts.length >= MAX_ATTEMPTS_SHORT) {
    auditSecurityEvent(AuditEventType.RATE_LIMIT_EXCEEDED, req, {
      severity: AuditSeverity.WARNING,
      details: {
        identifier,
        attempts: attempts.length,
        maxAttempts: MAX_ATTEMPTS_SHORT,
        windowMinutes: SHORT_WINDOW_MS / 60000
      },
      errorMessage: 'Rate limit exceeded for login attempts'
    });

    return res.status(429).json({
      success: false,
      error: 'Too many login attempts',
      message: `Maximum ${MAX_ATTEMPTS_SHORT} login attempts per 15 minutes exceeded. Please try again later.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900 // 15 minutes in seconds
    });
  }

  // Attach helper functions to request for use in auth handlers
  req.loginAttemptHelpers = {
    recordFailure: () => {
      const count = recordFailedAttempt(identifier);

      // Lock account if max attempts reached
      if (count >= MAX_ATTEMPTS_LONG) {
        lockAccount(identifier);
      }

      return {
        attempts: count,
        locked: count >= MAX_ATTEMPTS_LONG,
        remaining: MAX_ATTEMPTS_SHORT - count
      };
    },
    recordSuccess: () => {
      clearAttempts(identifier);
    }
  };

  next();
}

/**
 * Utility to manually lock an account (e.g., from admin panel)
 */
function manualLockAccount(identifier, durationMs = LOCKOUT_DURATION_MS) {
  const lockUntil = Date.now() + durationMs;
  lockedAccounts.set(identifier, lockUntil);

  logger.warn('Account manually locked', {
    identifier,
    lockUntil: new Date(lockUntil).toISOString()
  });
}

/**
 * Utility to manually unlock an account
 */
function manualUnlockAccount(identifier) {
  lockedAccounts.delete(identifier);
  loginAttempts.delete(identifier);

  logger.info('Account manually unlocked', { identifier });
}

/**
 * Get statistics for monitoring
 */
function getStats() {
  return {
    totalTrackedAttempts: loginAttempts.size,
    lockedAccounts: lockedAccounts.size,
    lockedAccountsList: Array.from(lockedAccounts.entries()).map(([identifier, lockUntil]) => ({
      identifier,
      lockUntil: new Date(lockUntil).toISOString(),
      remainingMinutes: Math.ceil((lockUntil - Date.now()) / 60000)
    }))
  };
}

module.exports = {
  checkLoginAttempts,
  manualLockAccount,
  manualUnlockAccount,
  getStats,
  // Export for testing
  clearAttempts,
  isAccountLocked,
  getAttempts
};
