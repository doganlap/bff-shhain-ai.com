// services/agentRegistry.js

// This is the official rulebook for the AI Agentic System.
// It defines the scope and capabilities of each agent.

const agents = [
    {
      id: 'compliance-scanner',
      name: 'Compliance Scanner',
      scope: ['framework', 'control', 'grc_frameworks', 'grc_controls'],
      capabilities: ['findMany', 'findUnique', 'count'],
      priority: 'high',
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes
      rateLimitPerMinute: 100
    },
    {
      id: 'risk-analyzer',
      name: 'Risk Analyzer',
      scope: ['risk', 'grc_risks'],
      capabilities: ['findMany', 'update', 'create', 'aggregate'],
      priority: 'high',
      cacheEnabled: true,
      cacheTTL: 60, // 1 minute
      rateLimitPerMinute: 50
    },
    {
      id: 'evidence-collector',
      name: 'Evidence Collector',
      scope: ['evidence', 'assessment', 'grc_assessments', 'tasks'],
      capabilities: ['create', 'findMany', 'update'],
      priority: 'medium',
      cacheEnabled: false, // Real-time data needed
      rateLimitPerMinute: 200
    },
    {
      id: 'grc-assistant',
      name: 'GRC Assistant',
      scope: ['all'],
      capabilities: ['findMany', 'findUnique', 'count'],
      priority: 'medium',
      cacheEnabled: true,
      cacheTTL: 120, // 2 minutes
      rateLimitPerMinute: 150
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      scope: ['risk', 'assessment', 'compliance', 'grc_risks', 'grc_assessments', 'grc_compliance'],
      capabilities: ['findMany', 'aggregate', 'groupBy'],
      priority: 'low',
      cacheEnabled: true,
      cacheTTL: 600, // 10 minutes
      rateLimitPerMinute: 30
    },
    {
      id: 'strategic-planner',
      name: 'Strategic Planning Agent',
      scope: ['all'],
      capabilities: ['findMany', 'aggregate', 'create', 'update'],
      priority: 'high',
      cacheEnabled: true,
      cacheTTL: 180, // 3 minutes
      rateLimitPerMinute: 75,
      description: 'Analyzes organizational GRC posture and creates strategic plans'
    },
    {
      id: 'audit-tracker',
      name: 'Audit Trail Agent',
      scope: ['audit', 'tasks', 'evidence', 'grc_controls'],
      capabilities: ['findMany', 'create', 'findUnique'],
      priority: 'high',
      cacheEnabled: false,
      rateLimitPerMinute: 500,
      description: 'Tracks and logs audit activities across the platform'
    }
];

// Agent performance tracking
const agentMetrics = new Map();

const getAgentById = (agentId) => {
    return agents.find(a => a.id === agentId);
};

const validateAgentAccess = (agentId, resource, capability) => {
    const agent = getAgentById(agentId);
    if (!agent) return { valid: false, reason: 'Agent not found' };

    // Check scope
    if (!agent.scope.includes('all') && !agent.scope.includes(resource)) {
        return { valid: false, reason: `Agent ${agentId} cannot access resource: ${resource}` };
    }

    // Check capability
    if (!agent.capabilities.includes(capability)) {
        return { valid: false, reason: `Agent ${agentId} lacks capability: ${capability}` };
    }

    return { valid: true };
};

const recordAgentMetric = (agentId, operation, duration, success) => {
    const key = `${agentId}:${operation}`;
    const existing = agentMetrics.get(key) || { count: 0, totalDuration: 0, errors: 0 };

    agentMetrics.set(key, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + duration,
        errors: existing.errors + (success ? 0 : 1),
        avgDuration: (existing.totalDuration + duration) / (existing.count + 1),
        lastAccess: Date.now()
    });

    // Auto-cleanup old metrics (keep last 10000 entries)
    if (agentMetrics.size > 10000) {
        const oldestKey = agentMetrics.keys().next().value;
        agentMetrics.delete(oldestKey);
    }
};

const getAgentMetrics = (agentId) => {
    const metrics = [];
    agentMetrics.forEach((value, key) => {
        if (key.startsWith(agentId + ':')) {
            metrics.push({ operation: key.split(':')[1], ...value });
        }
    });
    return metrics;
};

const getAllAgents = () => {
    return agents.map(agent => ({
        ...agent,
        metrics: getAgentMetrics(agent.id)
    }));
};

module.exports = {
    getAgentById,
    validateAgentAccess,
    recordAgentMetric,
    getAgentMetrics,
    getAllAgents
};
