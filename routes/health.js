/**
 * Health Check Router for BFF
 * Provides health status for the BFF and connected services
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Service registry (should match main index.js)
const services = {
  'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
  'ai-scheduler-service': process.env.AI_SCHEDULER_SERVICE_URL || 'http://ai-scheduler-service:3005',
  'rag-service': process.env.RAG_SERVICE_URL || 'http://rag-service:3006',
  'regulatory-intelligence-ksa': process.env.REGULATORY_SERVICE_URL || 'http://regulatory-intelligence-ksa:3008'
};

/**
 * Basic health check - BFF only
 * GET /health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BFF',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * Detailed health check - includes all services
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  const serviceStatuses = {};
  const timeout = 3000; // 3 seconds timeout per service

  // Check each service
  await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, {
          timeout,
          validateStatus: () => true // Accept any status code
        });
        
        serviceStatuses[name] = {
          status: response.status === 200 ? 'healthy' : 'degraded',
          statusCode: response.status,
          url: url,
          responseTime: response.headers['x-response-time'] || 'N/A'
        };
      } catch (error) {
        serviceStatuses[name] = {
          status: 'unhealthy',
          error: error.code || error.message,
          url: url
        };
      }
    })
  );

  // Calculate overall status
  const allHealthy = Object.values(serviceStatuses).every(s => s.status === 'healthy');
  const someHealthy = Object.values(serviceStatuses).some(s => s.status === 'healthy');
  
  const overallStatus = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy';

  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    status: overallStatus,
    service: 'BFF',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: serviceStatuses,
    summary: {
      total: Object.keys(serviceStatuses).length,
      healthy: Object.values(serviceStatuses).filter(s => s.status === 'healthy').length,
      degraded: Object.values(serviceStatuses).filter(s => s.status === 'degraded').length,
      unhealthy: Object.values(serviceStatuses).filter(s => s.status === 'unhealthy').length
    }
  });
});

/**
 * Readiness check - for Kubernetes/Docker health probes
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  // Check critical services only
  const criticalServices = ['grc-api'];
  
  try {
    await Promise.all(
      criticalServices.map(async (name) => {
        const url = services[name];
        const response = await axios.get(`${url}/health`, { timeout: 2000 });
        if (response.status !== 200) {
          throw new Error(`${name} not ready`);
        }
      })
    );

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check - for Kubernetes/Docker health probes
 * GET /health/live
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

const { exec } = require('child_process');
const prisma = require('../db/prisma');

/**
 * Git Status Check
 * GET /health/git
 */
router.get('/git', (req, res) => {
  exec('git rev-parse --abbrev-ref HEAD && git status --porcelain', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ status: 'unhealthy', error: stderr });
    }
    const [branch, ...changes] = stdout.trim().split('\n').filter(Boolean);
    res.json({
      status: 'healthy',
      branch,
      hasUncommittedChanges: changes.length > 0,
      changes: changes.map(line => line.trim()),
    });
  });
});

/**
 * Database Health Check
 * GET /health/database
 */
router.get('/database', async (req, res) => {
  try {
    // Use a simple, fast query to check the connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', message: 'Database connection successful.' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed.', details: error.message });
  }
});

/**
 * Vercel Status Check
 * GET /health/vercel/status
 */
router.get('/vercel/status', async (req, res) => {
  try {
    const vercelApi = axios.create({
      baseURL: 'https://api.vercel.com',
      headers: { 'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` }
    });
    const projectId = process.env.VERCEL_PROJECT_ID || 'shainpag';
    const response = await vercelApi.get(`/v9/projects/${projectId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Failed to fetch Vercel project status.', details: error.message });
  }
});

module.exports = router;
