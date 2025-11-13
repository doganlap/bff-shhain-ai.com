const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/risks - Get all risks
router.get('/', async (req, res) => {
  try {
    const risks = await prisma.risk.findMany({
      include: { // Include related data if needed by the frontend
        category: true,
        owner: true,
        treatment: true,
      },
    });
    res.json(risks);
  } catch (error) {
    handleError(res, error, 'Error fetching risks');
  }
});

// GET /api/risks/heatmap - Get risk heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    // This is a simplified example. A real implementation would involve aggregation.
    const heatmapData = await prisma.risk.groupBy({
      by: ['impact', 'likelihood'],
      _count: {
        id: true,
      },
    });
    res.json(heatmapData);
  } catch (error) {
    handleError(res, error, 'Error fetching risk heatmap data');
  }
});

// GET /api/risks/:id - Get a single risk by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const risk = await prisma.risk.findUnique({
      where: { id: parseInt(id, 10) },
       include: {
        category: true,
        owner: true,
        treatment: true,
        assessments: true, // Assuming a relation exists
      },
    });
    if (!risk) {
      return res.status(404).json({ error: 'Risk not found' });
    }
    res.json(risk);
  } catch (error) {
    handleError(res, error, 'Error fetching risk by ID');
  }
});

// POST /api/risks - Create a new risk
router.post('/', async (req, res) => {
  try {
    const newRisk = await prisma.risk.create({
      data: req.body,
    });
    res.status(201).json(newRisk);
  } catch (error) {
    handleError(res, error, 'Error creating risk');
  }
});

// PUT /api/risks/:id - Update an existing risk
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRisk = await prisma.risk.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedRisk);
  } catch (error) {
    handleError(res, error, 'Error updating risk');
  }
});

// POST /api/risks/:id/assess - Create a new assessment for a risk
router.post('/:id/assess', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming you have a 'RiskAssessment' model
    const assessment = await prisma.riskAssessment.create({
      data: {
        riskId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(assessment);
  } catch (error) {
    handleError(res, error, 'Error creating risk assessment');
  }
});

// POST /api/risks/:id/treatments - Add a treatment to a risk
router.post('/:id/treatments', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming you have a 'RiskTreatment' model
    const treatment = await prisma.riskTreatment.create({
      data: {
        riskId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(treatment);
  } catch (error) {
    handleError(res, error, 'Error adding risk treatment');
  }
});

module.exports = router;
