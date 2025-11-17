const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.json({
    success: true,
    data: {},
    message,
  });
};

// GET /api/dashboard/kpis - Get dashboard KPIs
router.get('/kpis', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const [frameworks, controls, assessments, risks] = await Promise.all([
      prisma.framework.count(),
      prisma.control.count(),
      prisma.assessment.count(),
      prisma.risk.count()
    ]);

    const compliantAssessments = await prisma.assessment.count({ where: { result: 'Compliant' } });
    const complianceScore = controls > 0 ? Math.round((compliantAssessments / controls) * 100) : 0;

    const kpis = {
      compliance_score: complianceScore,
      open_gaps: Math.max(controls - compliantAssessments, 0),
      risk_hotspots: risks,
      active_assessments: assessments,
      total_frameworks: frameworks,
      completed_controls: compliantAssessments,
      total_controls: controls,
      recent_activities: assessments
    };

    res.json({ success: true, data: kpis, range: '30d' });
  } catch (error) {
    const kpis = {
      compliance_score: 0,
      open_gaps: 0,
      risk_hotspots: 0,
      active_assessments: 0,
      total_frameworks: 0,
      completed_controls: 0,
      total_controls: 0,
      recent_activities: 0
    };
    res.json({ success: true, data: kpis, range: '30d' });
  }
});

// GET /api/dashboard/trends - Get compliance trends
router.get('/trends', async (req, res) => {
  const { range = '30d' } = req.query;
  
  try {
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 180;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const daily = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        COUNT(*) FILTER (WHERE "result" = 'Compliant') AS compliant
      FROM "Assessment"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `;

    const dates = [];
    const compliance = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dates.push(key);
      const row = daily.find(r => new Date(r.day).toISOString().split('T')[0] === key);
      compliance.push(row ? Number(row.compliant) : 0);
    }

    res.json({ success: true, data: { dates, compliance }, range });
  } catch (error) {
    console.error('Error in trends endpoint:', error);
    const dates = [];
    const compliance = [];
    res.json({ success: true, data: { dates, compliance }, range });
  }
});

// GET /api/dashboard/heatmap - Get dashboard heatmap data
router.get('/heatmap', async (req, res) => {
  const { framework_id = 'all' } = req.query;
  try {
    const byFamily = await prisma.control.groupBy({
      by: ['family'],
      _count: { id: true }
    });
    const data = byFamily.map(r => ({ x: r.family || 'Unassigned', y: 'Controls', value: r._count.id }));
    res.json({ success: true, data: { type: 'controls', framework_id, data } });
  } catch (error) {
    res.json({ success: true, data: { type: 'controls', framework_id, data: [] } });
  }
});

// GET /api/dashboard/activity - Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const logs = await prisma.activity_logs.findMany({
      orderBy: { id: 'desc' },
      take: parseInt(limit)
    });
    res.json({ success: true, data: logs, total: logs.length });
  } catch (error) {
    res.json({ success: true, data: [], total: 0 });
  }
});

module.exports = router;
// GET /api/dashboard/stats - Aggregated dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [frameworks, controls, assessments, organizations] = await Promise.all([
      prisma.framework.count(),
      prisma.control.count(),
      prisma.assessment.count(),
      prisma.organization.count()
    ]);
    const compliantAssessments = await prisma.assessment.count({ where: { result: 'Compliant' } });
    const compliance_score = controls > 0 ? Math.round((compliantAssessments / controls) * 100) : 0;
    res.json({ success: true, data: { frameworks, controls, assessments, organizations, compliance_score } });
  } catch (error) {
    res.json({ success: true, data: { frameworks: 0, controls: 0, assessments: 0, organizations: 0, compliance_score: 0 } });
  }
});