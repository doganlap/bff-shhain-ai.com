const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

// ==========================================
// ADMIN ROUTE MIDDLEWARE
// ==========================================

/**
 * Admin authentication middleware
 * Validates that user has admin-level access
 */
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Admin access requires valid JWT token'
    });
  }

  // Extract user role from JWT (will be validated by downstream service)
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // Check if user has admin-level role
    const adminRoles = ['super_admin', 'platform_admin', 'org_admin', 'supervisor_admin'];
    if (!adminRoles.includes(payload.roles?.[0]?.name)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient privileges',
        message: 'Admin access required',
        requiredRoles: adminRoles
      });
    }

    // Add admin context to request
    req.adminContext = {
      userId: payload.userId,
      role: payload.roles[0].name,
      tenantId: payload.tenantId,
      permissions: payload.roles[0].permissions || []
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Unable to verify admin credentials'
    });
  }
};

/**
 * Supervisor admin specific middleware
 */
const requireSupervisorAuth = (req, res, next) => {
  if (!req.adminContext) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const supervisorRoles = ['super_admin', 'supervisor_admin'];
  if (!supervisorRoles.includes(req.adminContext.role)) {
    return res.status(403).json({
      success: false,
      error: 'Supervisor access required',
      userRole: req.adminContext.role,
      requiredRoles: supervisorRoles
    });
  }

  next();
};

/**
 * Platform admin specific middleware
 */
const requirePlatformAuth = (req, res, next) => {
  if (!req.adminContext) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const platformRoles = ['super_admin', 'platform_admin'];
  if (!platformRoles.includes(req.adminContext.role)) {
    return res.status(403).json({
      success: false,
      error: 'Platform access required',
      userRole: req.adminContext.role,
      requiredRoles: platformRoles
    });
  }

  next();
};

/**
 * Admin request logging middleware
 */
const logAdminRequest = (req, res, next) => {
  const startTime = Date.now();

  // Log admin action
  console.log(`[ADMIN] ${req.method} ${req.originalUrl}`, {
    userId: req.adminContext?.userId,
    role: req.adminContext?.role,
    tenantId: req.adminContext?.tenantId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[ADMIN] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// ==========================================
// SERVICE PROXY HELPERS
// ==========================================

const createAdminProxy = (targetUrl, serviceName, pathRewrite = {}) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req, res) => {
      // Forward admin context headers
      if (req.adminContext) {
        proxyReq.setHeader('X-Admin-User-ID', req.adminContext.userId);
        proxyReq.setHeader('X-Admin-Role', req.adminContext.role);
        proxyReq.setHeader('X-Admin-Tenant-ID', req.adminContext.tenantId);
        proxyReq.setHeader('X-Admin-Permissions', JSON.stringify(req.adminContext.permissions));
      }

      // Forward original headers
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      if (req.headers['x-tenant-id']) {
        proxyReq.setHeader('X-Tenant-ID', req.headers['x-tenant-id']);
      }

      // Add service identification
      proxyReq.setHeader('X-Service-Source', 'bff-admin');
      proxyReq.setHeader('X-Target-Service', serviceName);
      proxyReq.setHeader('X-Request-ID', `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    },
    onError: (err, req, res) => {
      console.error(`[ADMIN] Proxy error to ${serviceName}:`, err.message);
      res.status(500).json({
        success: false,
        error: 'Service unavailable',
        message: `Unable to connect to ${serviceName}`,
        service: serviceName
      });
    }
  });
};

module.exports = {
  router,
  requireAdminAuth,
  requireSupervisorAuth,
  requirePlatformAuth,
  logAdminRequest,
  createAdminProxy
};
