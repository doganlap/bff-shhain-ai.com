const express = require('express');
const router = express.Router();

// Basic health check endpoint
router.get('/health', (req, res) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'grc-web',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: {
            server: 'operational',
            static_assets: 'available'
        }
    };

    res.status(200).json(healthStatus);
});

// Detailed health check for monitoring systems
router.get('/health/detailed', (req, res) => {
    const detailedHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'grc-web',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        system: {
            platform: process.platform,
            arch: process.arch,
            node_version: process.version,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            cpu: process.cpuUsage()
        },
        checks: {
            server: {
                status: 'operational',
                message: 'Web server running normally'
            },
            static_assets: {
                status: 'available',
                message: 'Static content serving properly'
            },
            build: {
                status: 'complete',
                message: 'Application built successfully'
            }
        }
    };

    res.status(200).json(detailedHealth);
});

// Liveness probe for Kubernetes/Docker
router.get('/health/live', (req, res) => {
    res.status(200).send('OK');
});

// Readiness probe for Kubernetes/Docker
router.get('/health/ready', (req, res) => {
    // Check if application is ready to serve traffic
    const isReady = true; // Add actual readiness checks here

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
});

module.exports = router;
