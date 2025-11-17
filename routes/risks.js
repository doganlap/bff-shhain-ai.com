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
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const risks = await prisma.risk.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.risk.count();

    res.json({
      success: true,
      data: risks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching risks:', error.message);
    res.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      note: 'Risks table not yet populated'
    });
  }
});

// GET /api/risks/heatmap - Get risk heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    // This is a simplified example. A real implementation would involve aggregation.
    const buckets = await prisma.risk.findMany({ select: { impact: true, likelihood: true } });
    const grid = {};
    const lvl = (n) => (n >= 4 ? 'high' : n === 3 ? 'medium' : 'low');
    buckets.forEach(r => {
      const key = `${lvl(r.impact)}_${lvl(r.likelihood)}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    res.json(Object.entries(grid).map(([k,v]) => ({ bucket: k, count: v })));
  } catch (error) {
    handleError(res, error, 'Error fetching risk heatmap data');
  }
});

// GET /api/risks/:id - Get a single risk by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const risk = await prisma.risk.findUnique({
      where: { id },
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
    const newRisk = await prisma.risk.create({ data: req.body });
    res.status(201).json(newRisk);
  } catch (error) {
    handleError(res, error, 'Error creating risk');
  }
});

// PUT /api/risks/:id - Update an existing risk
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRisk = await prisma.risk.update({ where: { id }, data: req.body });
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

    // Get real alert counts and risk trend
    const activeAlerts = await prisma.alert.count({
      where: { 
        status: 'active',
        createdAt: { gte: last24Hours }
      }
    });

    // Calculate risk trend based on recent risk changes
    const risksLastWeek = await prisma.risk.count({
      where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
    });
    
    const risksPreviousWeek = await prisma.risk.count({
      where: { 
        createdAt: { 
          gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    let riskTrend = 'stable';
    if (risksLastWeek > risksPreviousWeek * 1.2) {
      riskTrend = 'increasing';
    } else if (risksLastWeek < risksPreviousWeek * 0.8) {
      riskTrend = 'decreasing';
    }

    const realtimeMetrics = {
      timestamp: now.toISOString(),
      newRisksLast24h: newRisks,
      updatedRisksLast24h: updatedRisks,
      activeAlerts: activeAlerts,
      riskTrend: riskTrend,
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
