// Health check endpoints for microservices
// Add this to each service's route configuration

const express = require('express');
const router = express.Router();

// Basic health check endpoint
const createHealthRoutes = (serviceName, version = '1.0.0', additionalChecks = {}) => {

  // Basic health endpoint
  router.get('/health', async (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: serviceName,
        version: version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        ...additionalChecks
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Detailed health check
  router.get('/health/detailed', async (req, res) => {
    try {
      const detailedHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: serviceName,
        version: version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        system: {
          platform: process.platform,
          arch: process.arch,
          node_version: process.version,
          pid: process.pid,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024)
          },
          cpu: process.cpuUsage()
        },
        dependencies: {
          database: 'healthy', // Override in specific services
          redis: 'healthy',
          ...additionalChecks
        }
      };

      res.status(200).json(detailedHealth);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Liveness probe for Kubernetes/Docker
  router.get('/health/live', (req, res) => {
    res.status(200).send('OK');
  });

  // Readiness probe for Kubernetes/Docker
  router.get('/health/ready', async (req, res) => {
    try {
      // Add service-specific readiness checks here
      const isReady = true;

      if (isReady) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
};

module.exports = { createHealthRoutes };

// Usage example:
// const { createHealthRoutes } = require('./health');
// app.use('/api', createHealthRoutes('grc-api', '1.0.0', {
//   database: 'connected',
//   cache: 'operational'
// }));
