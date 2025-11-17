// routes/command_center.js

const express = require('express');
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const router = express.Router();

function requireCenterBasicAuth(req, res, next) {
  if (process.env.STAGING_CENTER_BASIC_AUTH === 'true') {
    const header = req.headers['authorization'] || '';
    let u = '', p = '';
    if (header.startsWith('Basic ')) {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const i = decoded.indexOf(':');
      if (i >= 0) {
        u = decoded.slice(0, i);
        p = decoded.slice(i + 1);
      }
    }
    const ok = u === process.env.CENTER_BASIC_USER && p === process.env.CENTER_BASIC_PASS;
    if (!ok) {
      res.setHeader('WWW-Authenticate', 'Basic realm="CommandCenter"');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
}

router.use(requireCenterBasicAuth);

async function requireCenterDbAuth(req, res, next) {
  if (process.env.STAGING_CENTER_DB_AUTH === 'true') {
    const header = req.headers['authorization'] || '';
    let u = '', p = '';
    if (header.startsWith('Basic ')) {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const i = decoded.indexOf(':');
      if (i >= 0) {
        u = decoded.slice(0, i);
        p = decoded.slice(i + 1);
      }
    }
    if (!u || !p) {
      res.setHeader('WWW-Authenticate', 'Basic realm="CommandCenter"');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  try {
      const user = await prisma.users.findFirst({ where: { email: u } });
      if (!user) {
        res.setHeader('WWW-Authenticate', 'Basic realm="CommandCenter"');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const allowedUsersStr = process.env.STAGING_ALLOWED_USERS || '';
      const allowedUsers = allowedUsersStr.split(',').map(s => s.trim()).filter(Boolean);
      if (allowedUsers.length && !allowedUsers.includes(user.email)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const ok = await bcrypt.compare(p, user.password_hash);
      if (!ok) {
        res.setHeader('WWW-Authenticate', 'Basic realm="CommandCenter"');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      req.user = { id: user.id, email: user.email, tenantId: user.tenant_id, role: user.role };
    } catch (e) {
      return res.status(503).json({ error: 'Auth unavailable' });
    }
  }
  next();
}

router.use(requireCenterDbAuth);

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
