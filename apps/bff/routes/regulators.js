const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const axios = require('axios');

// Configuration for regulatory intelligence service
const REGULATORY_SERVICE_URL = process.env.REGULATORY_SERVICE_URL || 'http://localhost:3004';

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/regulators - Get all regulators
router.get('/', async (req, res) => {
  try {
    const regulators = await prisma.regulator.findMany({
      include: { publications: true },
    });
    res.json(regulators);
  } catch (error) {
    handleError(res, error, 'Error fetching regulators');
  }
});

// GET /api/regulators/:id - Get a single regulator by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const regulator = await prisma.regulator.findUnique({
      where: { id: parseInt(id, 10) },
      include: { publications: true },
    });
    if (!regulator) {
      return res.status(404).json({ error: 'Regulator not found' });
    }
    res.json(regulator);
  } catch (error) {
    handleError(res, error, 'Error fetching regulator by ID');
  }
});

// GET /api/regulators/:id/publications - Get publications for a regulator
router.get('/:id/publications', async (req, res) => {
  const { id } = req.params;
  try {
    const publications = await prisma.publication.findMany({
      where: { regulatorId: parseInt(id, 10) },
    });
    res.json(publications);
  } catch (error) {
    handleError(res, error, 'Error fetching regulator publications');
  }
});

// POST /api/regulators - Create a new regulator
router.post('/', async (req, res) => {
  try {
    const { name, description, type, website, contactEmail, isActive = true } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const regulator = await prisma.regulator.create({
      data: { 
        name, 
        description, 
        type, 
        website, 
        contactEmail, 
        isActive 
      },
    });
    
    res.status(201).json({ success: true, data: regulator });
  } catch (error) {
    handleError(res, error, 'Error creating regulator');
  }
});

// PUT /api/regulators/:id - Update a regulator
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, type, website, contactEmail, isActive } = req.body;
    
    const updatedRegulator = await prisma.regulator.update({
      where: { id: parseInt(id, 10) },
      data: { 
        name, 
        description, 
        type, 
        website, 
        contactEmail, 
        isActive 
      },
    });
    
    res.json({ success: true, data: updatedRegulator });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Regulator not found' });
    }
    handleError(res, error, 'Error updating regulator');
  }
});

// DELETE /api/regulators/:id - Delete a regulator
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.regulator.delete({
      where: { id: parseInt(id, 10) },
    });
    
    res.json({ success: true, message: 'Regulator deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Regulator not found' });
    }
    handleError(res, error, 'Error deleting regulator');
  }
});

// GET /api/regulators/stats - Get regulatory statistics
router.get('/stats', async (req, res) => {
  try {
    const totalRegulators = await prisma.regulator.count();
    const activeRegulators = await prisma.regulator.count({ where: { isActive: true } });
    const totalPublications = await prisma.publication.count();
    
    const stats = {
      totalRegulators,
      activeRegulators,
      totalPublications,
      inactiveRegulators: totalRegulators - activeRegulators
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    handleError(res, error, 'Error fetching regulatory statistics');
  }
});

// Regulatory Intelligence Integration Routes

// GET /api/regulators/changes - Get regulatory changes from intelligence service
router.get('/changes', async (req, res) => {
  try {
    const { regulator, limit = 50, language } = req.query;
    
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/changes`, {
      params: { regulator, limit },
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching regulatory changes:', error.message);
    // Return empty array instead of mock data
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/regulators/:regulatorId/changes - Get changes for specific regulator
router.get('/:regulatorId/changes', async (req, res) => {
  try {
    const { regulatorId } = req.params;
    const { limit = 50, language } = req.query;
    
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/changes`, {
      params: { regulator: regulatorId, limit },
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching regulator changes:', error.message);
    // Return empty array instead of mock data
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/regulators/regulatory-intelligence/stats - Get regulatory intelligence statistics
router.get('/regulatory-intelligence/stats', async (req, res) => {
  try {
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/stats`, {
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching regulatory stats:', error.message);
    // Return empty stats instead of mock data
    res.json({ 
      success: true, 
      data: { 
        total_changes: 0, 
        critical_changes: 0, 
        high_changes: 0,
        changes_last_week: 0,
        changes_last_month: 0
      } 
    });
  }
});

// GET /api/regulators/regulatory-intelligence/feed - Get regulatory intelligence feed
router.get('/regulatory-intelligence/feed', async (req, res) => {
  try {
    const { regulator, urgency, limit = 50 } = req.query;
    
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/changes`, {
      params: { regulator, limit },
      timeout: 10000
    });
    
    let changes = response.data?.data || [];
    
    // Apply urgency filter if specified
    if (urgency && urgency !== 'all') {
      changes = changes.filter(change => change.urgency_level === urgency);
    }
    
    res.json({ 
      success: true, 
      count: changes.length,
      data: changes 
    });
  } catch (error) {
    console.error('Error fetching regulatory feed:', error.message);
    // Return empty feed instead of mock data
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/regulators/regulatory-intelligence/calendar - Get compliance calendar
router.get('/regulatory-intelligence/calendar', async (req, res) => {
  try {
    const { organizationId, days = 90 } = req.query;
    
    if (!organizationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'organizationId is required' 
      });
    }
    
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/calendar/${organizationId}`, {
      params: { days },
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching compliance calendar:', error.message);
    // Return empty calendar instead of mock data
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/regulators/regulatory-intelligence/impact/:changeId - Get impact assessment
router.get('/regulatory-intelligence/impact/:changeId', async (req, res) => {
  try {
    const { changeId } = req.params;
    
    const response = await axios.get(`${REGULATORY_SERVICE_URL}/api/regulatory/changes/${changeId}`, {
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching impact assessment:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch impact assessment' 
    });
  }
});

// POST /api/regulators/regulatory-intelligence/subscribe - Subscribe to updates
router.post('/regulatory-intelligence/subscribe', async (req, res) => {
  try {
    const response = await axios.post(`${REGULATORY_SERVICE_URL}/api/regulatory/subscribe`, req.body, {
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error subscribing to updates:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe to updates' 
    });
  }
});

module.exports = router;
