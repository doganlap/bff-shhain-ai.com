const express = require('express');
const {
  requireAdminAuth,
  requireSupervisorAuth,
  requirePlatformAuth,
  logAdminRequest,
  createAdminProxy
} = require('../middleware/adminAuth');

const router = express.Router();

// Get services configuration from environment
const services = {
  'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
  'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002',
  'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004'
};

// Apply admin authentication and logging to all admin routes
router.use(requireAdminAuth);
router.use(logAdminRequest);

// ==========================================
// ORGANIZATION ADMIN ROUTES
// ==========================================

// Organization management
router.use('/organization/users',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/organization/users': '/api/admin/users'
  })
);

router.use('/organization/settings',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/organization/settings': '/api/admin/organization'
  })
);

router.use('/organization/departments',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/organization/departments': '/api/admin/departments'
  })
);

router.use('/organization/reports',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/organization/reports': '/api/admin/reports'
  })
);

// ==========================================
// SUPERVISOR ADMIN ROUTES
// ==========================================

// Department management (supervisor admin only)
router.use('/supervisor/departments',
  requireSupervisorAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/supervisor/departments': '/api/supervisor/departments'
  })
);

// User management within departments
router.use('/supervisor/users',
  requireSupervisorAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/supervisor/users': '/api/supervisor/users'
  })
);

// Assessment supervision
router.use('/supervisor/assessments',
  requireSupervisorAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/supervisor/assessments': '/api/supervisor/assessments'
  })
);

// Workflow supervision
router.use('/supervisor/workflows',
  requireSupervisorAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/supervisor/workflows': '/api/supervisor/workflows'
  })
);

// Supervisor dashboard
router.use('/supervisor/dashboard',
  requireSupervisorAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/supervisor/dashboard': '/api/supervisor/dashboard'
  })
);

// ==========================================
// PLATFORM ADMIN ROUTES
// ==========================================

// System monitoring (platform admin only)
router.use('/platform/system',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/system': '/api/platform/system'
  })
);

// Tenant management for platform admins
router.use('/platform/tenants',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/tenants': '/api/platform/tenants'
  })
);

// Performance monitoring
router.use('/platform/performance',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/performance': '/api/platform/performance'
  })
);

// Security monitoring
router.use('/platform/security',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/security': '/api/platform/security'
  })
);

// Service management
router.use('/platform/services',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/services': '/api/platform/services'
  })
);

// Infrastructure monitoring
router.use('/platform/infrastructure',
  requirePlatformAuth,
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/platform/infrastructure': '/api/platform/infrastructure'
  })
);

// ==========================================
// GENERAL ADMIN ROUTES
// ==========================================

// User management (all admin roles)
router.use('/users',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/users': '/api/admin/users'
  })
);

// Role management
router.use('/roles',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/roles': '/api/admin/roles'
  })
);

// Audit logs
router.use('/audit',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/audit': '/api/admin/audit'
  })
);

// Compliance reporting
router.use('/compliance',
  createAdminProxy(services['grc-api'], 'grc-api', {
    '^/api/admin/compliance': '/api/admin/compliance'
  })
);

// Document management
router.use('/documents',
  createAdminProxy(services['document-service'], 'document-service', {
    '^/api/admin/documents': '/api/admin/documents'
  })
);

// Partner management
router.use('/partners',
  createAdminProxy(services['partner-service'], 'partner-service', {
    '^/api/admin/partners': '/api/admin/partners'
  })
);

// Notification management
router.use('/notifications',
  createAdminProxy(services['notification-service'], 'notification-service', {
    '^/api/admin/notifications': '/api/admin/notifications'
  })
);

// ==========================================
// ADMIN DASHBOARD AGGREGATION
// ==========================================

const axios = require('axios');

// Admin dashboard with aggregated data
router.get('/dashboard', async (req, res) => {
  try {
    const { role, tenantId, permissions } = req.adminContext;

    const headers = {
      'Authorization': req.headers.authorization,
      'X-Tenant-ID': tenantId,
      'X-Admin-Role': role,
      'X-Admin-Permissions': JSON.stringify(permissions)
    };

    // Different data based on admin role
    let dashboardData = {};

    if (role === 'platform_admin') {
      // Platform admin sees system-wide metrics
      const [systemHealth, tenantStats, performanceMetrics] = await Promise.allSettled([
        axios.get(`${services['grc-api']}/api/platform/system/health`, { headers }),
        axios.get(`${services['grc-api']}/api/platform/tenants/stats`, { headers }),
        axios.get(`${services['grc-api']}/api/platform/performance/metrics`, { headers })
      ]);

      dashboardData = {
        type: 'platform_admin',
        systemHealth: systemHealth.status === 'fulfilled' ? systemHealth.value.data : null,
        tenantStats: tenantStats.status === 'fulfilled' ? tenantStats.value.data : null,
        performance: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value.data : null
      };

    } else if (role === 'supervisor_admin') {
      // Supervisor admin sees department-level data
      const [departmentStats, assessmentStatus, userActivity] = await Promise.allSettled([
        axios.get(`${services['grc-api']}/api/supervisor/departments/stats`, { headers }),
        axios.get(`${services['grc-api']}/api/supervisor/assessments/status`, { headers }),
        axios.get(`${services['grc-api']}/api/supervisor/users/activity`, { headers })
      ]);

      dashboardData = {
        type: 'supervisor_admin',
        departmentStats: departmentStats.status === 'fulfilled' ? departmentStats.value.data : null,
        assessmentStatus: assessmentStatus.status === 'fulfilled' ? assessmentStatus.value.data : null,
        userActivity: userActivity.status === 'fulfilled' ? userActivity.value.data : null
      };

    } else {
      // Organization admin sees organization-wide data
      const [orgStats, complianceStatus, recentActivity] = await Promise.allSettled([
        axios.get(`${services['grc-api']}/api/admin/organization/stats`, { headers }),
        axios.get(`${services['grc-api']}/api/admin/compliance/status`, { headers }),
        axios.get(`${services['grc-api']}/api/admin/audit/recent`, { headers })
      ]);

      dashboardData = {
        type: 'org_admin',
        organizationStats: orgStats.status === 'fulfilled' ? orgStats.value.data : null,
        complianceStatus: complianceStatus.status === 'fulfilled' ? complianceStatus.value.data : null,
        recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value.data : null
      };
    }

    res.json({
      success: true,
      data: dashboardData,
      adminContext: {
        role: role,
        tenantId: tenantId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ADMIN] Dashboard aggregation error:', error);
    res.status(500).json({
      success: false,
      error: 'Dashboard unavailable',
      message: 'Unable to aggregate admin dashboard data'
    });
  }
});

// Admin health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    services: Object.keys(services),
    adminRole: req.adminContext.role,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
