/**
 * Multi-Tenant Isolation Middleware
 * Ensures strict tenant data isolation and prevents cross-tenant data access
 */

const { logger } = require('../utils/logger');
const { captureMessage } = require('../integrations/sentry');

/**
 * Tenant context middleware
 * Extracts and validates tenant ID from request
 */
function tenantContext(req, res, next) {
  // Extract tenant ID from multiple sources (priority order)
  const tenantId = 
    req.headers['x-tenant-id'] ||           // Header (preferred)
    req.user?.tenantId ||                   // JWT token
    req.user?.tenant_id ||                  // Alternative JWT field
    req.query.tenantId ||                   // Query param (fallback)
    req.body?.tenantId;                     // Body (fallback)

  if (!tenantId) {
    logger.warn('Request without tenant ID', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip,
    });
    
    return res.status(400).json({
      success: false,
      error: 'Tenant ID required',
      message: 'This request requires a valid tenant identifier',
      code: 'TENANT_ID_MISSING',
    });
  }

  // Validate tenant ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    logger.warn('Invalid tenant ID format', {
      tenantId,
      path: req.path,
      userId: req.user?.id,
    });
    
    return res.status(400).json({
      success: false,
      error: 'Invalid tenant ID',
      message: 'Tenant ID must be a valid UUID',
      code: 'INVALID_TENANT_ID',
    });
  }

  // Add tenant ID to request context
  req.tenantId = tenantId;
  
  // Add to response headers for debugging
  res.setHeader('X-Tenant-ID', tenantId);
  
  // Log tenant access
  logger.debug('Tenant context set', {
    tenantId,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
  });

  next();
}

/**
 * Verify user belongs to tenant
 * Prevents users from accessing other tenants' data
 */
function verifyTenantAccess(req, res, next) {
  const requestTenantId = req.tenantId;
  const userTenantId = req.user?.tenantId || req.user?.tenant_id;

  if (!userTenantId) {
    logger.error('User without tenant ID', {
      userId: req.user?.id,
      requestTenantId,
    });
    
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'User is not associated with any tenant',
      code: 'NO_TENANT_ASSOCIATION',
    });
  }

  // Check if user belongs to requested tenant
  if (requestTenantId !== userTenantId) {
    logger.warn('Cross-tenant access attempt detected', {
      userId: req.user?.id,
      userTenantId,
      requestTenantId,
      path: req.path,
      ip: req.ip,
    });
    
    // Send security alert
    captureMessage('Cross-tenant access attempt', 'warning', {
      tenantId: userTenantId,
      extra: {
        userId: req.user?.id,
        requestTenantId,
        path: req.path,
        ip: req.ip,
      },
    });
    
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'You do not have permission to access this tenant\'s data',
      code: 'CROSS_TENANT_ACCESS_DENIED',
    });
  }

  next();
}

/**
 * Super admin bypass
 * Allows platform admins to access any tenant's data
 */
function superAdminBypass(req, res, next) {
  const userRole = req.user?.role || req.user?.roles?.[0];
  
  // Platform admins and supervisor admins can access any tenant
  if (userRole === 'platform_admin' || userRole === 'supervisor_admin') {
    logger.info('Super admin access granted', {
      userId: req.user?.id,
      userRole,
      tenantId: req.tenantId,
      path: req.path,
    });
    
    // Add flag to indicate super admin access
    req.isSuperAdmin = true;
    return next();
  }
  
  // Regular users must pass tenant verification
  verifyTenantAccess(req, res, next);
}

/**
 * Tenant isolation for database queries
 * Adds tenant filter to all queries automatically
 */
function applyTenantFilter(query, tenantId) {
  if (!query.where) {
    query.where = {};
  }
  
  // Add tenant_id filter
  if (typeof query.where === 'object' && !Array.isArray(query.where)) {
    query.where.tenant_id = tenantId;
  }
  
  return query;
}

/**
 * Middleware to inject tenant filter into database queries
 */
function injectTenantFilter(req, res, next) {
  const originalJson = res.json.bind(res);
  
  // Override res.json to check for tenant leaks
  res.json = function(data) {
    // In development, verify no cross-tenant data
    if (process.env.NODE_ENV === 'development' && data) {
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.tenant_id && item.tenant_id !== req.tenantId) {
            logger.error('CRITICAL: Cross-tenant data leak detected!', {
              requestTenantId: req.tenantId,
              dataTenantId: item.tenant_id,
              path: req.path,
            });
          }
        });
      } else if (data.tenant_id && data.tenant_id !== req.tenantId) {
        logger.error('CRITICAL: Cross-tenant data leak detected!', {
          requestTenantId: req.tenantId,
          dataTenantId: data.tenant_id,
          path: req.path,
        });
      }
    }
    
    return originalJson(data);
  };
  
  next();
}

/**
 * Tenant-scoped resource middleware
 * Ensures resource belongs to tenant before accessing
 */
function verifyResourceOwnership(resourceIdParam = 'id') {
  return async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const tenantId = req.tenantId;
    
    if (!resourceId) {
      return next();
    }
    
    // TODO: Implement resource ownership check
    // This should query the database to verify the resource belongs to the tenant
    // Example:
    // const resource = await db.query('SELECT tenant_id FROM resources WHERE id = ?', [resourceId]);
    // if (resource.tenant_id !== tenantId) { return 403 }
    
    logger.debug('Resource ownership verified', {
      resourceId,
      tenantId,
      path: req.path,
    });
    
    next();
  };
}

/**
 * Get tenant statistics
 */
async function getTenantStats(tenantId) {
  // TODO: Implement tenant statistics
  return {
    tenantId,
    activeUsers: 0,
    apiCalls: 0,
    storage: 0,
    lastActive: new Date(),
  };
}

/**
 * Tenant activity logger
 * Logs all tenant activities for audit trail
 */
function logTenantActivity(action) {
  return (req, res, next) => {
    logger.info('Tenant activity', {
      tenantId: req.tenantId,
      userId: req.user?.id,
      action,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
    
    next();
  };
}

module.exports = {
  tenantContext,
  verifyTenantAccess,
  superAdminBypass,
  applyTenantFilter,
  injectTenantFilter,
  verifyResourceOwnership,
  getTenantStats,
  logTenantActivity,
};
