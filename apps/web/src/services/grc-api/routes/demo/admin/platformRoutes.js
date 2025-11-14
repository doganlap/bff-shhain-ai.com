const express = require('express');
const { query } = require('../../../config/database');
const { authenticateToken } = require('../../../middleware/auth');
const { requireRole } = require('../../../middleware/rbac');
const os = require('os');
const axios = require('axios');
const router = express.Router();

/**
 * GET /api/platform/system/health
 * System health monitoring for platform admins
 */
router.get('/system/health',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/system/health called. This API uses mocked data.');
    try {
      const systemHealth = {
        timestamp: new Date().toISOString(),
        server: {
          hostname: os.hostname(),
          platform: os.platform(),
          uptime: os.uptime(),
          loadAverage: os.loadavg(),
          memory: {
            total: os.totalmem(),
            free: os.freemem(),
            usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
          },
          cpu: {
            count: os.cpus().length,
            model: os.cpus()[0]?.model || 'Unknown'
          }
        },
        database: {
          status: 'connected',
          connections: null,
          performance: null
        },
        services: {
          grcApi: 'healthy',
          documentService: 'healthy',
          partnerService: 'healthy',
          notificationService: 'healthy'
        }
      };

      // Get database statistics
      try {
        const dbStats = await query(`
          SELECT
            (SELECT count(*) FROM pg_stat_activity) as active_connections,
            (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries,
            pg_database_size(current_database()) as database_size
        `);

        systemHealth.database.connections = dbStats.rows[0].active_connections;
        systemHealth.database.activeQueries = dbStats.rows[0].active_queries;
        systemHealth.database.size = dbStats.rows[0].database_size;
      } catch (dbError) {
        systemHealth.database.status = 'error';
        systemHealth.database.error = dbError.message;
      }

      res.json({
        success: true,
        data: systemHealth
      });

    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch system health',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/platform/tenants
 * Tenant management for platform admins
 */
router.get('/tenants',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/tenants called. This API uses mocked data.');
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let whereCondition = '';
      let params = [];

      if (status) {
        whereCondition = 'WHERE t.status = $1';
        params.push(status);
      }

      const queryText = `
        SELECT
          t.id,
          t.name,
          t.code,
          t.status,
          t.subscription_type,
          t.created_at,
          t.updated_at,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(DISTINCT a.id) as assessment_count,
          COUNT(DISTINCT d.id) as department_count,
          MAX(u.last_login) as last_user_activity
        FROM tenants t
        LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'active'
        LEFT JOIN assessments a ON t.id = a.tenant_id
        LEFT JOIN departments d ON t.id = d.tenant_id
        ${whereCondition}
        GROUP BY t.id, t.name, t.code, t.status, t.subscription_type, t.created_at, t.updated_at
        ORDER BY t.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const [tenantsResult, countResult] = await Promise.all([
        query(queryText, params),
        query(`
          SELECT COUNT(*) as total
          FROM tenants t
          ${whereCondition}
        `, params.slice(0, status ? 1 : 0))
      ]);

      res.json({
        success: true,
        data: tenantsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(countResult.rows[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Platform tenants error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch tenants',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/platform/tenants/stats
 * Tenant statistics for platform dashboard
 */
router.get('/tenants/stats',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/tenants/stats called. This API uses mocked data.');
    try {
      const [tenantStats, userStats, assessmentStats] = await Promise.all([
        // Tenant statistics
        query(`
          SELECT
            COUNT(*) as total_tenants,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
            COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_tenants,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_tenants_30d
          FROM tenants
        `),

        // User statistics across all tenants
        query(`
          SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
            COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
          FROM users
        `),

        // Assessment statistics across all tenants
        query(`
          SELECT
            COUNT(*) as total_assessments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assessments,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assessments,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_assessments_30d
          FROM assessments
        `)
      ]);

      res.json({
        success: true,
        data: {
          tenants: tenantStats.rows[0],
          users: userStats.rows[0],
          assessments: assessmentStats.rows[0]
        }
      });

    } catch (error) {
      console.error('Platform tenant stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch tenant statistics',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/platform/performance/metrics
 * Performance monitoring for platform admins
 */
router.get('/performance/metrics',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/performance/metrics called. This API uses mocked data.');
    try {
      const { timeframe = '24h' } = req.query;

      let timeCondition;
      switch (timeframe) {
        case '1h':
          timeCondition = "NOW() - INTERVAL '1 hour'";
          break;
        case '24h':
          timeCondition = "NOW() - INTERVAL '24 hours'";
          break;
        case '7d':
          timeCondition = "NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          timeCondition = "NOW() - INTERVAL '30 days'";
          break;
        default:
          timeCondition = "NOW() - INTERVAL '24 hours'";
      }

      const [dbMetrics, requestMetrics, errorMetrics] = await Promise.all([
        // Database performance metrics
        query(`
          SELECT
            schemaname,
            tablename,
            seq_scan,
            seq_tup_read,
            idx_scan,
            idx_tup_fetch,
            n_tup_ins,
            n_tup_upd,
            n_tup_del
          FROM pg_stat_user_tables
          ORDER BY seq_tup_read DESC
          LIMIT 10
        `),

        // Request metrics from audit logs
        query(`
          SELECT
            DATE_TRUNC('hour', created_at) as hour,
            COUNT(*) as request_count,
            COUNT(CASE WHEN action LIKE '%_ERROR' THEN 1 END) as error_count
          FROM audit_logs
          WHERE created_at > ${timeCondition}
          GROUP BY DATE_TRUNC('hour', created_at)
          ORDER BY hour DESC
          LIMIT 24
        `),

        // Error rate by tenant
        query(`
          SELECT
            t.name as tenant_name,
            COUNT(al.id) as error_count
          FROM audit_logs al
          JOIN tenants t ON al.tenant_id = t.id
          WHERE al.created_at > ${timeCondition}
            AND al.action LIKE '%_ERROR'
          GROUP BY t.id, t.name
          ORDER BY error_count DESC
          LIMIT 10
        `)
      ]);

      res.json({
        success: true,
        data: {
          timeframe,
          database: {
            tableStats: dbMetrics.rows
          },
          requests: {
            hourlyStats: requestMetrics.rows
          },
          errors: {
            byTenant: errorMetrics.rows
          }
        }
      });

    } catch (error) {
      console.error('Platform performance metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch performance metrics',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/platform/security/events
 * Security event monitoring for platform admins
 */
router.get('/security/events',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/security/events called. This API uses mocked data.');
    try {
      const { severity, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      let whereCondition = "WHERE se.created_at > NOW() - INTERVAL '7 days'";
      let params = [];

      if (severity) {
        whereCondition += ' AND se.severity = $1';
        params.push(severity);
      }

      const queryText = `
        SELECT
          se.id,
          se.event_type,
          se.severity,
          se.description,
          se.ip_address,
          se.user_agent,
          se.details,
          se.created_at,
          u.email as user_email,
          t.name as tenant_name
        FROM security_events se
        LEFT JOIN users u ON se.user_id = u.id
        LEFT JOIN tenants t ON se.tenant_id = t.id
        ${whereCondition}
        ORDER BY se.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const [eventsResult, countResult] = await Promise.all([
        query(queryText, params),
        query(`
          SELECT COUNT(*) as total
          FROM security_events se
          ${whereCondition}
        `, params.slice(0, severity ? 1 : 0))
      ]);

      res.json({
        success: true,
        data: eventsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(countResult.rows[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Platform security events error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch security events',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/platform/services/status
 * Service status monitoring
 */
router.get('/services/status',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/services/status called. This API uses mocked data.');
    try {
      const services = [
        { name: 'grc-api', url: process.env.GRC_API_URL || 'http://grc-api:3000' },
        { name: 'document-service', url: process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002' },
        { name: 'partner-service', url: process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003' },
        { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004' }
      ];

      const axios = require('axios');
      const serviceChecks = await Promise.allSettled(
        services.map(async service => {
          try {
            const start = Date.now();
            await axios.get(`${service.url}/healthz`, { timeout: 5000 });
            const responseTime = Date.now() - start;

            return {
              name: service.name,
              status: 'healthy',
              responseTime: responseTime,
              url: service.url
            };
          } catch (error) {
            return {
              name: service.name,
              status: 'unhealthy',
              error: error.message,
              url: service.url
            };
          }
        })
      );

      const serviceStatuses = serviceChecks.map((check, index) => {
        return check.status === 'fulfilled' ? check.value : {
          name: services[index].name,
          status: 'error',
          error: check.reason?.message || 'Service check failed'
        };
      });

      res.json({
        success: true,
        data: {
          services: serviceStatuses,
          timestamp: new Date().toISOString(),
          overallHealth: serviceStatuses.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        }
      });

    } catch (error) {
      console.error('Platform services status error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to check service status',
        message: error.message
      });
    }
  }
);

/**
 * Anthropic Admin API Key Management
 * GET /api/platform/anthropic/api-keys/:id
 * DELETE /api/platform/anthropic/api-keys/:id
 * Requires roles: platform_admin or super_admin
 */
router.get('/anthropic/api-keys/:id',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/anthropic/api-keys/:id called. This API uses mocked data.');
    try {
      const adminKey = process.env.ANTHROPIC_ADMIN_API_KEY;
      if (!adminKey) {
        return res.status(500).json({
          success: false,
          error: 'Configuration error',
          message: 'ANTHROPIC_ADMIN_API_KEY is not set'
        });
      }

      const { id } = req.params;
      const url = `https://api.anthropic.com/v1/api-keys/${encodeURIComponent(id)}`;

      const response = await axios.get(url, {
        headers: {
          'x-api-key': adminKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return res.json({ success: true, data: response.data });
    } catch (error) {
      const status = error.response?.status || 500;
      return res.status(status).json({
        success: false,
        error: 'Unable to fetch Anthropic API key',
        message: error.response?.data?.error || error.message
      });
    }
  }
);

router.delete('/anthropic/api-keys/:id',
  authenticateToken,
  requireRole(['platform_admin', 'super_admin']),
  async (req, res) => {
    console.warn('DEMO API: /api/platform/anthropic/api-keys/:id called. This API uses mocked data.');
    try {
      const adminKey = process.env.ANTHROPIC_ADMIN_API_KEY;
      if (!adminKey) {
        return res.status(500).json({
          success: false,
          error: 'Configuration error',
          message: 'ANTHROPIC_ADMIN_API_KEY is not set'
        });
      }

      const { id } = req.params;
      const url = `https://api.anthropic.com/v1/api-keys/${encodeURIComponent(id)}`;

      const response = await axios.delete(url, {
        headers: {
          'x-api-key': adminKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return res.json({ success: true, data: response.data || null });
    } catch (error) {
      const status = error.response?.status || 500;
      return res.status(status).json({
        success: false,
        error: 'Unable to revoke Anthropic API key',
        message: error.response?.data?.error || error.message
      });
    }
  }
);

module.exports = router;
