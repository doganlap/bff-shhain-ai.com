const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals');
const TestFixtures = require('../fixtures/testFixtures');
const adminAuth = require('../../apps/bff/middleware/adminAuth');

/**
 * Admin Authentication Middleware Test Suite
 * Validates admin middleware functionality and security
 */

describe('Admin Authentication Middleware Tests', () => {
  let fixtures;
  let mockReq, mockRes, mockNext;

  beforeEach(async () => {
    fixtures = new TestFixtures();
    await fixtures.setupDatabase();

    // Mock Express request, response, and next
    mockReq = {
      headers: {},
      user: null,
      adminContext: null
    };

    mockRes = {
      statusCode: 200,
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(async () => {
    await fixtures.cleanupDatabase();
    jest.clearAllMocks();
  });

  describe('requireAdminAuth Middleware', () => {
    it('should allow super_admin access', () => {
      const superAdminToken = fixtures.createSuperAdminToken();
      mockReq.headers.authorization = `Bearer ${superAdminToken}`;

      // Decode JWT and set user
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(superAdminToken, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'super_admin',
        canAccessOrganization: true,
        canAccessSupervisor: true,
        canAccessPlatform: true
      });
    });

    it('should allow org_admin access', () => {
      const orgAdmin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(orgAdmin.id, orgAdmin.tenantId);
      mockReq.headers.authorization = `Bearer ${token}`;

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'org_admin',
        canAccessOrganization: true,
        canAccessSupervisor: false,
        canAccessPlatform: false
      });
    });

    it('should reject non-admin users', () => {
      const regularUser = fixtures.getUserByEmail('member@testa.com');
      const token = fixtures.createTestJWT(regularUser.id, regularUser.tenantId);
      mockReq.headers.authorization = `Bearer ${token}`;

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'insufficient_permissions',
        message: 'Admin access required'
      });
    });

    it('should reject requests without user context', () => {
      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'authentication_required',
        message: 'User authentication required'
      });
    });
  });

  describe('requireSupervisorAuth Middleware', () => {
    it('should allow supervisor_admin access', () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireSupervisorAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext.canAccessSupervisor).toBe(true);
    });

    it('should allow super_admin access', () => {
      const token = fixtures.createSuperAdminToken();

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireSupervisorAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext.canAccessSupervisor).toBe(true);
    });

    it('should reject org_admin access', () => {
      const orgAdmin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(orgAdmin.id, orgAdmin.tenantId);

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireSupervisorAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'insufficient_permissions',
        message: 'Supervisor admin access required'
      });
    });
  });

  describe('requirePlatformAuth Middleware', () => {
    it('should allow platform_admin access', () => {
      const platformAdmin = fixtures.getUserByEmail('platform@testb.com');
      const token = fixtures.createTestJWT(
        platformAdmin.id,
        platformAdmin.tenantId,
        ['platform_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requirePlatformAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext.canAccessPlatform).toBe(true);
    });

    it('should allow super_admin access', () => {
      const token = fixtures.createSuperAdminToken();

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requirePlatformAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.adminContext.canAccessPlatform).toBe(true);
    });

    it('should reject supervisor_admin access', () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requirePlatformAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'insufficient_permissions',
        message: 'Platform admin access required'
      });
    });
  });

  describe('createAdminProxy Helper', () => {
    it('should create proxy with admin headers', () => {
      const token = fixtures.createSuperAdminToken();

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');

      mockReq.user = decoded;
      mockReq.adminContext = {
        isAdmin: true,
        role: 'super_admin',
        permissions: ['system:admin']
      };

      const proxyOptions = adminAuth.createAdminProxy(mockReq, 'grc-api', '/admin/test');

      expect(proxyOptions.target).toBe('http://grc-api:3001');
      expect(proxyOptions.pathRewrite['^/api']).toBe('');
      expect(proxyOptions.onProxyReq).toBeDefined();

      // Test header injection
      const mockProxyReq = {
        setHeader: jest.fn()
      };

      proxyOptions.onProxyReq(mockProxyReq, mockReq, mockRes);

      expect(mockProxyReq.setHeader).toHaveBeenCalledWith(
        'X-Admin-Context',
        JSON.stringify(mockReq.adminContext)
      );
      expect(mockProxyReq.setHeader).toHaveBeenCalledWith(
        'X-Admin-Role',
        'super_admin'
      );
    });

    it('should handle proxy errors gracefully', () => {
      const token = fixtures.createSupervisorAdminToken('550e8400-e29b-41d4-a716-446655440001');

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');

      mockReq.user = decoded;
      mockReq.adminContext = {
        isAdmin: true,
        role: 'supervisor_admin'
      };

      const proxyOptions = adminAuth.createAdminProxy(mockReq, 'grc-api', '/supervisor/test');

      // Test error handling
      const mockError = new Error('Service unavailable');
      proxyOptions.onError(mockError, mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'service_unavailable',
        message: 'Admin service temporarily unavailable'
      });
    });
  });

  describe('Admin Context Generation', () => {
    it('should generate correct context for super_admin', () => {
      const token = fixtures.createSuperAdminToken();

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'super_admin',
        tenantId: expect.any(String),
        userId: expect.any(String),
        permissions: expect.arrayContaining(['system:admin']),
        canAccessOrganization: true,
        canAccessSupervisor: true,
        canAccessPlatform: true,
        isSuperAdmin: true
      });
    });

    it('should generate correct context for org_admin', () => {
      const orgAdmin = fixtures.getUserByEmail('admin@testa.com');
      const token = fixtures.createTestJWT(orgAdmin.id, orgAdmin.tenantId);

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'org_admin',
        tenantId: orgAdmin.tenantId,
        canAccessOrganization: true,
        canAccessSupervisor: false,
        canAccessPlatform: false,
        isSuperAdmin: false
      });
    });

    it('should generate correct context for supervisor_admin', () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requireSupervisorAuth(mockReq, mockRes, mockNext);

      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'supervisor_admin',
        tenantId: supervisor.tenantId,
        canAccessOrganization: false,
        canAccessSupervisor: true,
        canAccessPlatform: false,
        isSuperAdmin: false
      });
    });

    it('should generate correct context for platform_admin', () => {
      const platformAdmin = fixtures.getUserByEmail('platform@testb.com');
      const token = fixtures.createTestJWT(
        platformAdmin.id,
        platformAdmin.tenantId,
        ['platform_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      adminAuth.requirePlatformAuth(mockReq, mockRes, mockNext);

      expect(mockReq.adminContext).toMatchObject({
        isAdmin: true,
        role: 'platform_admin',
        tenantId: platformAdmin.tenantId,
        canAccessOrganization: false,
        canAccessSupervisor: false,
        canAccessPlatform: true,
        isSuperAdmin: false
      });
    });
  });

  describe('Middleware Chain Integration', () => {
    it('should work correctly in middleware chain', () => {
      const supervisor = fixtures.getUserByEmail('supervisor@testa.com');
      const token = fixtures.createTestJWT(
        supervisor.id,
        supervisor.tenantId,
        ['supervisor_admin']
      );

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      mockReq.user = decoded;

      // First call admin auth
      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset next mock
      mockNext.mockClear();

      // Then call supervisor auth
      adminAuth.requireSupervisorAuth(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should preserve existing req properties', () => {
      mockReq.customProperty = 'test-value';
      mockReq.user = {
        userId: 'test-user',
        roles: ['super_admin']
      };

      adminAuth.requireAdminAuth(mockReq, mockRes, mockNext);

      expect(mockReq.customProperty).toBe('test-value');
      expect(mockReq.user.userId).toBe('test-user');
      expect(mockReq.adminContext).toBeDefined();
    });
  });
});

module.exports = {};
