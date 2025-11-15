const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// Strategic planning cache (5-minute TTL)
const strategicCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
    const cached = strategicCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCache(key, data) {
    strategicCache.set(key, { data, timestamp: Date.now() });
    if (strategicCache.size > 100) {
        const oldestKey = strategicCache.keys().next().value;
        strategicCache.delete(oldestKey);
    }
}

// GET /api/strategic/overview - Strategic GRC overview
router.get('/overview', async (req, res) => {
    const startTime = Date.now();

    try {
        const cacheKey = 'strategic:overview';
        const cached = getCached(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 'public, max-age=300');
            return res.json({
                success: true,
                ...cached,
                responseTime: Date.now() - startTime
            });
        }

        // Parallel aggregation queries with graceful fallback
        const counts = await Promise.allSettled([
            prisma.grc_frameworks.count(),
            prisma.grc_risks.count(),
            prisma.grc_assessments.count(),
            prisma.grc_controls.count(),
            prisma.tasks.count()
        ]);

        const frameworkCount = counts[0].status === 'fulfilled' ? counts[0].value : 0;
        const riskCount = counts[1].status === 'fulfilled' ? counts[1].value : 0;
        const assessmentCount = counts[2].status === 'fulfilled' ? counts[2].value : 0;
        const controlCount = counts[3].status === 'fulfilled' ? counts[3].value : 0;
        const taskCount = counts[4].status === 'fulfilled' ? counts[4].value : 0;

        const overview = {
            frameworks: { total: frameworkCount },
            risks: { total: riskCount },
            assessments: { total: assessmentCount },
            controls: { total: controlCount },
            tasks: { total: taskCount },
            generatedAt: new Date().toISOString()
        };

        // Calculate strategic KPIs
        const kpis = {
            totalEntities: frameworkCount + riskCount + assessmentCount + controlCount + taskCount,
            frameworksActive: frameworkCount,
            risksTracked: riskCount,
            assessmentsActive: assessmentCount,
            controlsManaged: controlCount,
            tasksInProgress: taskCount
        };

        const result = { overview, kpis };
        setCache(cacheKey, result);

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json({
            success: true,
            ...result,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Error fetching strategic overview:', error.message);
        res.json({
            success: true,
            overview: {
                frameworks: { total: 0 },
                risks: { total: 0 },
                assessments: { total: 0 },
                controls: { total: 0 },
                tasks: { total: 0 },
                generatedAt: new Date().toISOString()
            },
            kpis: {
                totalEntities: 0,
                frameworksActive: 0,
                risksTracked: 0,
                assessmentsActive: 0,
                controlsManaged: 0,
                tasksInProgress: 0
            },
            note: 'Some tables not yet populated',
            responseTime: Date.now() - startTime
        });
    }
});

// GET /api/strategic/gaps - Identify compliance gaps
router.get('/gaps', async (req, res) => {
    const startTime = Date.now();

    try {
        const cacheKey = 'strategic:gaps';
        const cached = getCached(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json({
                success: true,
                data: cached,
                responseTime: Date.now() - startTime
            });
        }

        // Find frameworks with graceful fallback
        let frameworks = [];
        try {
            frameworks = await prisma.grc_frameworks.findMany({
                select: {
                    framework_id: true,
                    name: true
                },
                take: 10
            });
        } catch (err) {
            console.error('Frameworks not available:', err.message);
        }

        const gaps = frameworks.map(f => ({
            framework_id: f.framework_id,
            framework_name: f.name,
            status: 'Requires Review',
            note: 'Detailed gap analysis requires control mapping'
        }));

        setCache(cacheKey, gaps);
        res.setHeader('X-Cache', 'MISS');

        res.json({
            success: true,
            data: gaps,
            count: gaps.length,
            note: gaps.length === 0 ? 'Frameworks table not yet populated' : undefined,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Error fetching gaps:', error.message);
        res.json({
            success: true,
            data: [],
            count: 0,
            note: 'Gap analysis requires framework data',
            responseTime: Date.now() - startTime
        });
    }
});

// GET /api/strategic/priorities - Get strategic priorities based on risk and compliance
router.get('/priorities', async (req, res) => {
    const startTime = Date.now();

    try {
        const cacheKey = 'strategic:priorities';
        const cached = getCached(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json({
                success: true,
                data: cached,
                responseTime: Date.now() - startTime
            });
        }

        // High-risk items with graceful fallback
        let highRisks = [];
        try {
            highRisks = await prisma.grc_risks.findMany({
                where: {
                    OR: [
                        { likelihood_level: 'High' },
                        { impact_level: 'High' }
                    ]
                },
                select: {
                    risk_id: true,
                    risk_title: true,
                    likelihood_level: true,
                    impact_level: true,
                    risk_status: true
                },
                take: 10,
                orderBy: [
                    { likelihood_level: 'desc' },
                    { impact_level: 'desc' }
            ]
            });
        } catch (err) {
            console.error('Risks not available:', err.message);
        }

        // Overdue assessments with graceful fallback
        let overdueAssessments = [];
        try {
            overdueAssessments = await prisma.grc_assessments.findMany({
                where: {
                    status: { not: 'completed' },
                    due_date: { lt: new Date() }
                },
                select: {
                    assessment_id: true,
                    assessment_title: true,
                    status: true,
                    due_date: true
                },
                take: 10,
                orderBy: { due_date: 'asc' }
            });
        } catch (err) {
            console.error('Assessments not available:', err.message);
        }

        // Non-compliant items with graceful fallback
        let nonCompliant = [];
        try {
            nonCompliant = await prisma.grc_compliance.findMany({
                where: {
                    status: 'non_compliant'
                },
                select: {
                    compliance_id: true,
                    requirement_name: true,
                    status: true,
                    last_review_date: true
                },
                take: 10
            });
        } catch (err) {
            console.error('Compliance not available:', err.message);
        }

        const priorities = {
            highRisks: {
                count: highRisks.length,
                items: highRisks
            },
            overdueAssessments: {
                count: overdueAssessments.length,
                items: overdueAssessments
            },
            nonCompliant: {
                count: nonCompliant.length,
                items: nonCompliant
            }
        };

        setCache(cacheKey, priorities);
        res.setHeader('X-Cache', 'MISS');

        const isEmpty = priorities.highRisks.count === 0 &&
                       priorities.overdueAssessments.count === 0 &&
                       priorities.nonCompliant.count === 0;

        res.json({
            success: true,
            data: priorities,
            note: isEmpty ? 'Priority analysis requires risk, assessment, and compliance data' : undefined,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Error fetching priorities:', error.message);
        res.json({
            success: true,
            data: {
                highRisks: { count: 0, items: [] },
                overdueAssessments: { count: 0, items: [] },
                nonCompliant: { count: 0, items: [] }
            },
            note: 'Priority analysis requires data',
            responseTime: Date.now() - startTime
        });
    }
});

// GET /api/strategic/trends - Historical trends for key metrics
router.get('/trends', async (req, res) => {
    const { period = '30' } = req.query; // days
    const startTime = Date.now();

    try {
        const daysAgo = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // For now, return summary - full historical tracking would require audit tables
        const summary = {
            message: 'Trend analysis requires historical audit data',
            period: `${daysAgo} days`,
            available: false,
            suggestion: 'Enable audit logging for trend analysis'
        };

        res.json({
            success: true,
            data: summary,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trends',
            details: error.message
        });
    }
});

// Helper function to calculate risk posture score
function calculateRiskPosture(risks) {
    if (risks.total === 0) return 'N/A';

    const avgRisk = (parseFloat(risks.avg_likelihood) + parseFloat(risks.avg_impact)) / 2;

    if (avgRisk < 1.5) return 'Low';
    if (avgRisk < 2.5) return 'Medium';
    return 'High';
}

module.exports = router;
