/**
 * Audit Logging Middleware for Security Events
 * Tracks authentication, authorization, data access, and security-related activities
 */

const prisma = require('../db/prisma');
const { logger } = require('../utils/logger');

// Audit event types
const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_LOCKED: 'LOGIN_LOCKED',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',

  // Authorization events
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  ROLE_CHANGE: 'ROLE_CHANGE',

  // Data access events
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_CREATE: 'DATA_CREATE',
  DATA_UPDATE: 'DATA_UPDATE',
  DATA_DELETE: 'DATA_DELETE',
  DATA_EXPORT: 'DATA_EXPORT',

  // Security events
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',

  // Admin events
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  TENANT_ACCESS: 'TENANT_ACCESS'
};

// Severity levels
const AuditSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * Log audit event to database and logging system
 */
async function logAuditEvent({
  eventType,
  severity = AuditSeverity.INFO,
  userId = null,
  tenantId = null,
  ipAddress = null,
  userAgent = null,
  resource = null,
  action = null,
  details = {},
  success = true,
  errorMessage = null
}) {
  try {
    const auditLog = {
      eventType,
      severity,
      userId,
      tenantId,
      ipAddress,
      userAgent,
      resource,
      action,
      details: JSON.stringify(details),
      success,
      errorMessage,
      timestamp: new Date()
    };

    // Log to structured logger
    logger.info('Audit Event', auditLog);

    // Store in database (if audit_logs table exists)
    try {
      // Note: This requires audit_logs table to be created
      // await prisma.auditLog.create({ data: auditLog });
    } catch (dbError) {
      // Fail silently if table doesn't exist yet
      logger.debug('Audit log table not available', { error: dbError.message });
    }

    return auditLog;
  } catch (error) {
    logger.error('Failed to log audit event', { error: error.message });
  }
}

/**
 * Extract request metadata for audit logging
 */
function extractRequestMetadata(req) {
  return {
    userId: req.user?.id || null,
    tenantId: req.user?.tenantId || req.headers['x-tenant-id'] || null,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path,
    query: req.query,
    requestId: req.headers['x-request-id'],
    auditAction: req.headers['x-audit-action']
  };
}

/**
 * Middleware to audit all authenticated requests
 */
function auditMiddleware(req, res, next) {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;

    const duration = Date.now() - startTime;
    const metadata = extractRequestMetadata(req);

    // Only audit specific methods and sensitive routes
    const shouldAudit =
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) ||
      req.path.includes('/admin') ||
      req.path.includes('/auth') ||
      req.path.includes('/users') ||
      req.path.includes('/organizations');

    if (shouldAudit) {
      logAuditEvent({
        eventType: AuditEventType.DATA_ACCESS,
        severity: res.statusCode >= 400 ? AuditSeverity.WARNING : AuditSeverity.INFO,
        userId: metadata.userId,
        tenantId: metadata.tenantId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        resource: req.path,
        action: metadata.auditAction || req.method,
        details: {
          statusCode: res.statusCode,
          duration,
          query: metadata.query,
          requestId: metadata.requestId,
          auditAction: metadata.auditAction
        },
        success: res.statusCode < 400
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Audit authentication events
 */
function auditAuthEvent(eventType, req, { success, userId, errorMessage, details = {} }) {
  const metadata = extractRequestMetadata(req);

  return logAuditEvent({
    eventType,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    userId: userId || metadata.userId,
    tenantId: metadata.tenantId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    resource: 'authentication',
    action: eventType,
    details: {
      ...details,
      path: req.path,
      method: req.method
    },
    success,
    errorMessage
  });
}

/**
 * Audit authorization events
 */
function auditAuthzEvent(eventType, req, { success, permission, resource, errorMessage }) {
  const metadata = extractRequestMetadata(req);

  return logAuditEvent({
    eventType,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    userId: metadata.userId,
    tenantId: metadata.tenantId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    resource: resource || req.path,
    action: 'authorization_check',
    details: {
      permission,
      method: req.method,
      path: req.path
    },
    success,
    errorMessage
  });
}

/**
 * Audit security events (rate limiting, suspicious activity, etc.)
 */
function auditSecurityEvent(eventType, req, { severity = AuditSeverity.WARNING, details = {}, errorMessage }) {
  const metadata = extractRequestMetadata(req);

  return logAuditEvent({
    eventType,
    severity,
    userId: metadata.userId,
    tenantId: metadata.tenantId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    resource: req.path,
    action: 'security_event',
    details: {
      ...details,
      method: req.method,
      headers: req.headers
    },
    success: false,
    errorMessage
  });
}

/**
 * Audit data modification events
 */
function auditDataEvent(eventType, req, { resource, recordId, changes = {}, success = true }) {
  const metadata = extractRequestMetadata(req);

  return logAuditEvent({
    eventType,
    severity: success ? AuditSeverity.INFO : AuditSeverity.ERROR,
    userId: metadata.userId,
    tenantId: metadata.tenantId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    resource,
    action: eventType,
    details: {
      recordId,
      changes,
      method: req.method
    },
    success
  });
}

module.exports = {
  AuditEventType,
  AuditSeverity,
  logAuditEvent,
  extractRequestMetadata,
  auditMiddleware,
  auditAuthEvent,
  auditAuthzEvent,
  auditSecurityEvent,
  auditDataEvent
};
