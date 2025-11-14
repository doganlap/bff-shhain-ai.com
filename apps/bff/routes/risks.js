const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

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

// GET /api/risks/metrics - Get risk metrics and statistics
router.get('/metrics', async (req, res) => {
  try {
    const totalRisks = await prisma.risk.count();
    const highRisks = await prisma.risk.count({
      where: { impact: 'high', likelihood: 'high' }
    });
    const mediumRisks = await prisma.risk.count({
      where: { 
        OR: [
          { impact: 'medium', likelihood: 'high' },
          { impact: 'high', likelihood: 'medium' },
          { impact: 'medium', likelihood: 'medium' }
        ]
      }
    });
    const lowRisks = await prisma.risk.count({
      where: { 
        OR: [
          { impact: 'low', likelihood: 'low' },
          { impact: 'low', likelihood: 'medium' },
          { impact: 'medium', likelihood: 'low' }
        ]
      }
    });
    
    const risksByCategory = await prisma.risk.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    });
    
    const risksByStatus = await prisma.risk.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const metrics = {
      totalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      riskScore: totalRisks > 0 ? Math.round(((highRisks * 3 + mediumRisks * 2 + lowRisks) / totalRisks) * 100) / 100 : 0,
      risksByCategory: risksByCategory.reduce((acc, item) => {
        acc[item.categoryId] = item._count.id;
        return acc;
      }, {}),
      risksByStatus: risksByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {})
    };

    res.json(metrics);
  } catch (error) {
    handleError(res, error, 'Error fetching risk metrics');
  }
});

// GET /api/risks/realtime - Get real-time risk metrics (simulated)
router.get('/realtime', async (req, res) => {
  try {
    // Simulate real-time metrics with current timestamp
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newRisks = await prisma.risk.count({
      where: { createdAt: { gte: last24Hours } }
    });
    
    const updatedRisks = await prisma.risk.count({
      where: { updatedAt: { gte: last24Hours } }
    });

    const realtimeMetrics = {
      timestamp: now.toISOString(),
      newRisksLast24h: newRisks,
      updatedRisksLast24h: updatedRisks,
      activeAlerts: Math.floor(Math.random() * 10), // Simulated
      riskTrend: Math.random() > 0.5 ? 'increasing' : 'stable', // Simulated
      monitoringStatus: 'active'
    };

    res.json(realtimeMetrics);
  } catch (error) {
    handleError(res, error, 'Error fetching real-time risk metrics');
  }
});

// GET /api/risks/trends - Get risk trends over time
router.get('/trends', async (req, res) => {
  try {
    const { period = '6m' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
      default:
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
    }
    
    // Get monthly risk counts for the period
    const monthlyRisks = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "Risk"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
    
    // Format data for chart
    const trendData = monthlyRisks.map(item => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: parseInt(item.count)
    }));
    
    res.json(trendData);
  } catch (error) {
    handleError(res, error, 'Error fetching risk trends');
  }
});

module.exports = router;
