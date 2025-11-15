const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const controlService = require('../src/services/control.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/controls - Get all controls
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const controls = await prisma.grc_controls.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.grc_controls.count();

    res.json({
      success: true,
      data: controls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching controls');
  }
});

// GET /api/controls/:id - Get a single control by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const control = await prisma.control.findUnique({
      where: { id: parseInt(id, 10) },
      include: { tests: true, evidence: true, implementation: true },
    });
    if (!control) {
      return res.status(404).json({ error: 'Control not found' });
    }
    res.json(control);
  } catch (error) {
    handleError(res, error, 'Error fetching control by ID');
  }
});

// POST /api/controls/:id/tests - Create a new test for a control
router.post('/:id/tests', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming a 'ControlTest' model exists
    const test = await prisma.controlTest.create({
      data: {
        controlId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(test);
  } catch (error) {
    handleError(res, error, 'Error creating control test');
  }
});

// POST /api/controls/:id/evidence - Add evidence to a control
router.post('/:id/evidence', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming an 'Evidence' model that can be linked to a control
    const evidence = await prisma.evidence.create({
      data: {
        controlId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(evidence);
  } catch (error) {
    handleError(res, error, 'Error adding evidence to control');
  }
});

// GET /api/controls/:id/implementation - Get implementation details for a control
router.get('/:id/implementation', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming a 'ControlImplementation' model exists
    const implementation = await prisma.controlImplementation.findUnique({
      where: { controlId: parseInt(id, 10) },
    });
    res.json(implementation);
  } catch (error) {
    handleError(res, error, 'Error fetching control implementation details');
  }
});

// PUT /api/controls/:id/implementation - Update implementation details for a control
router.put('/:id/implementation', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedImplementation = await prisma.controlImplementation.update({
      where: { controlId: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedImplementation);
  } catch (error) {
    handleError(res, error, 'Error updating control implementation');
  }
});

module.exports = router;
