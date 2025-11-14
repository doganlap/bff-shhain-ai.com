const express = require('express');
const router = express.Router();
const {
    getAgentById,
    validateAgentAccess,
    recordAgentMetric,
    getAgentMetrics,
    getAllAgents
} = require('../services/agentRegistry');

// Response cache for agent queries (1-minute TTL)
const responseCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

function getCachedResponse(key) {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedResponse(key, data) {
    responseCache.set(key, { data, timestamp: Date.now() });
    // Auto-cleanup
    if (responseCache.size > 500) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }
}

// GET /api/agents - List all registered agents
router.get('/', async (req, res) => {
    const startTime = Date.now();

    try {
        // Check cache first
        const cacheKey = 'agents:all';
        const cached = getCachedResponse(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.json({
                success: true,
                data: cached,
                cached: true,
                responseTime: Date.now() - startTime
            });
        }

        const agents = getAllAgents();
        setCachedResponse(cacheKey, agents);

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json({
            success: true,
            data: agents,
            cached: false,
            responseTime: Date.now() - startTime
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agents',
            details: error.message
        });
    }
});

// GET /api/agents/:agentId - Get specific agent details
router.get('/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const startTime = Date.now();

    try {
        const cacheKey = `agent:${agentId}`;
        const cached = getCachedResponse(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json({
                success: true,
                data: cached,
                responseTime: Date.now() - startTime
            });
        }

        const agent = getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                agentId
            });
        }

        const metrics = getAgentMetrics(agentId);
        const agentWithMetrics = { ...agent, metrics };

        setCachedResponse(cacheKey, agentWithMetrics);
        res.setHeader('X-Cache', 'MISS');

        res.json({
            success: true,
            data: agentWithMetrics,
            responseTime: Date.now() - startTime
        });
    } catch (error) {
        console.error(`Error fetching agent ${agentId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent details',
            details: error.message
        });
    }
});

// POST /api/agents/:agentId/validate - Validate agent access
router.post('/:agentId/validate', async (req, res) => {
    const { agentId } = req.params;
    const { resource, capability } = req.body;

    try {
        if (!resource || !capability) {
            return res.status(400).json({
                success: false,
                error: 'Resource and capability are required'
            });
        }

        const validation = validateAgentAccess(agentId, resource, capability);

        res.json({
            success: true,
            validation,
            agentId,
            resource,
            capability
        });
    } catch (error) {
        console.error('Error validating agent access:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate agent access',
            details: error.message
        });
    }
});

// GET /api/agents/:agentId/metrics - Get agent performance metrics
router.get('/:agentId/metrics', async (req, res) => {
    const { agentId } = req.params;
    const startTime = Date.now();

    try {
        const agent = getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        const metrics = getAgentMetrics(agentId);

        // Calculate summary statistics
        const summary = {
            totalOperations: metrics.reduce((sum, m) => sum + m.count, 0),
            totalErrors: metrics.reduce((sum, m) => sum + m.errors, 0),
            avgDuration: metrics.length > 0
                ? metrics.reduce((sum, m) => sum + m.avgDuration, 0) / metrics.length
                : 0,
            successRate: metrics.reduce((sum, m) => sum + m.count, 0) > 0
                ? ((metrics.reduce((sum, m) => sum + (m.count - m.errors), 0) /
                    metrics.reduce((sum, m) => sum + m.count, 0)) * 100).toFixed(2)
                : 100
        };

        res.json({
            success: true,
            agentId,
            summary,
            metrics,
            responseTime: Date.now() - startTime
        });
    } catch (error) {
        console.error('Error fetching agent metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent metrics',
            details: error.message
        });
    }
});

// POST /api/agents/:agentId/metrics/record - Record agent operation metric
router.post('/:agentId/metrics/record', async (req, res) => {
    const { agentId } = req.params;
    const { operation, duration, success = true } = req.body;

    try {
        if (!operation || duration === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Operation and duration are required'
            });
        }

        const agent = getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        recordAgentMetric(agentId, operation, duration, success);

        res.json({
            success: true,
            message: 'Metric recorded successfully',
            agentId,
            operation,
            duration,
            success
        });
    } catch (error) {
        console.error('Error recording agent metric:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record metric',
            details: error.message
        });
    }
});

module.exports = router;
