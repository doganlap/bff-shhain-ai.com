const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * JWT Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database with tenant information
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.tenant_id,
        u.permissions,
        u.status,
        u.last_login,
        t.name as tenant_name,
        t.tenant_code,
        t.subscription_tier
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.status = 'active'
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found or inactive'
      });
    }

    // Add user info to request
    req.user = userResult.rows[0];
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Authentication token has expired'
      });
    }

    console.error('[AUTH-SERVICE] Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Internal authentication error'
    });
  }
};

/**
 * Role-based Access Control Middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    const userRole = req.user.role;
    const hasPermission = Array.isArray(allowedRoles) 
      ? allowedRoles.includes(userRole)
      : allowedRoles === userRole;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. Required role: ${Array.isArray(allowedRoles) ? allowedRoles.join(' or ') : allowedRoles}`,
        userRole
      });
    }

    next();
  };
};

/**
 * Tenant Access Control - Multi-tenant isolation
 */
const requireTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Add tenant context to request
  req.tenant = {
    id: req.user.tenant_id,
    name: req.user.tenant_name,
    code: req.user.tenant_code,
    subscription_tier: req.user.subscription_tier
  };

  next();
};

/**
 * Permission-based Access Control
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = userPermissions.includes(permission) || 
                         userPermissions.includes('*') ||
                         req.user.role === 'super_admin';

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: `Required permission: ${permission}`,
        userPermissions
      });
    }

    next();
  };
};

/**
 * Optional Authentication (for public endpoints with enhanced features for authenticated users)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.tenant_id,
        u.permissions,
        u.status,
        t.name as tenant_name,
        t.tenant_code
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.status = 'active'
    `, [decoded.userId]);

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    }

    next();

  } catch (error) {
    // Token verification failed, but continue without authentication
    next();
  }
};

/**
 * Service Token Authentication (for inter-service communication)
 */
const authenticateServiceToken = (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];

    if (!serviceToken) {
      return res.status(401).json({
        success: false,
        error: 'Service token required',
        message: 'Inter-service communication requires a valid service token'
      });
    }

    // Verify service token
    if (serviceToken !== process.env.SERVICE_TOKEN) {
      return res.status(401).json({
        success: false,
        error: 'Invalid service token',
        message: 'Service token is invalid'
      });
    }

    // Add service context
    req.isServiceRequest = true;
    next();

  } catch (error) {
    console.error('[AUTH-SERVICE] Service token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Service authentication failed',
      message: 'Internal service authentication error'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireTenantAccess,
  requirePermission,
  optionalAuth,
  authenticateServiceToken
};
