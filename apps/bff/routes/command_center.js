// routes/command_center.js

const express = require('express');
const prisma = require('../db/prisma');
const router = express.Router();

// A secure endpoint to fetch data from the GRC database
router.post('/query', async (req, res) => {
  const { resource, params } = req.body;

  // A simple, secure way to allow fetching different resources
  // In a real application, you would have more robust permission checks here
  try {
    let data;
    switch (resource) {
      case 'risks':
        data = await prisma.risk.findMany({ where: params, take: 10 });
        break;
      case 'controls':
        data = await prisma.control.findMany({ where: params, take: 10 });
        break;
      case 'frameworks':
        data = await prisma.framework.findMany({ where: params, take: 10 });
        break;
      default:
        return res.status(400).json({ error: 'Invalid resource specified.' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to query the database.', details: error.message });
  }
});

// A secure endpoint for AI agents to perform actions
const { getAgentById } = require('../services/agentRegistry');

router.post('/action', async (req, res) => {
  const { resource, action, payload, agentId } = req.body;

  // In a real-world scenario, you would have extensive validation and permission checks here.
  // For now, we'll allow the actions we need for our agents.

  try {
        // --- ENFORCER GUARDRAILS ---
    const agent = getAgentById(agentId);
    if (!agent) {
      return res.status(403).json({ error: 'Unauthorized: Unknown agent.' });
    }
    if (!agent.scope.includes(resource) && !agent.scope.includes('all')) {
      return res.status(403).json({ error: `Unauthorized: Agent '${agentId}' cannot access resource '${resource}'.` });
    }
    if (!agent.capabilities.includes(action)) {
      return res.status(403).json({ error: `Unauthorized: Agent '${agentId}' cannot perform action '${action}'.` });
    }
    // --- END ENFORCER ---

    if (!prisma[resource] || !prisma[resource][action]) {
      return res.status(400).json({ error: `Invalid resource or action: ${resource}.${action}` });
    }

    const result = await prisma[resource][action]({ data: payload });

    // Create an audit log entry for the AI's action
    await prisma.auditLog.create({
      data: {
        action: `ai_${action}`,
        resource: resource,
        details: {
          agentId: agentId || 'unknown_agent',
          payload: payload,
          resultId: result.id
        },
        // In a real app, this would be the ID of the user who gave the command
        userId: 'clxrz8422000008l8c5z6g1j1' 
      }
    });

    res.json({ success: true, result });

  } catch (error) {
    res.status(500).json({ error: `Failed to perform action: ${action} on ${resource}.`, details: error.message });
  }
});

module.exports = router;
