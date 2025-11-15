/**
 * Regulator Service
 * Handles regulatory intelligence, change tracking, and compliance calendar
 */

const prisma = require('../../db/prisma');

/**
 * Calculate regulatory impact score
 */
function calculateImpactScore(change) {
  let score = 0;
  let factors = [];

  // Scope impact (0-30 points)
  const scopeScores = { minor: 5, moderate: 15, major: 30 };
  score += scopeScores[change.scope] || 15;
  factors.push({ factor: 'Scope', score: scopeScores[change.scope] || 15 });

  // Urgency (0-25 points)
  if (change.effectiveDate) {
    const daysUntilEffective = Math.floor((change.effectiveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilEffective <= 30) {
      score += 25;
      factors.push({ factor: 'Urgency', score: 25 });
    } else if (daysUntilEffective <= 90) {
      score += 15;
      factors.push({ factor: 'Urgency', score: 15 });
    } else if (daysUntilEffective <= 180) {
      score += 5;
      factors.push({ factor: 'Urgency', score: 5 });
    }
  }

  // Compliance complexity (0-25 points)
  const complexityScores = { low: 5, medium: 15, high: 25 };
  score += complexityScores[change.complexity] || 15;
  factors.push({ factor: 'Complexity', score: complexityScores[change.complexity] || 15 });

  // Penalty risk (0-20 points)
  const penaltyScores = { none: 0, low: 5, medium: 10, high: 20 };
  score += penaltyScores[change.penaltyRisk] || 10;
  factors.push({ factor: 'Penalty Risk', score: penaltyScores[change.penaltyRisk] || 10 });

  return { score, factors, level: getImpactLevel(score) };
}

/**
 * Get impact level
 */
function getImpactLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Create regulator
 */
async function createRegulator(data) {
  return await prisma.regulators.create({
    data: {
      name: data.name,
      shortName: data.shortName,
      country: data.country,
      region: data.region,
      type: data.type,
      website: data.website,
      description: data.description,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      jurisdiction: data.jurisdiction || [],
      isActive: true,
      metadata: data.metadata || {},
      tenantId: data.tenantId
    }
  });
}

/**
 * Get all regulators
 */
async function getRegulators(filters = {}) {
  const where = {};

  if (filters.country) where.country = filters.country;
  if (filters.region) where.region = filters.region;
  if (filters.type) where.type = filters.type;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return await prisma.regulators.findMany({
    where,
    include: {
      _count: {
        select: {
          publications: true,
          changes: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Get regulator by ID
 */
async function getRegulatorById(id) {
  return await prisma.regulators.findUnique({
    where: { id },
    include: {
      publications: {
        orderBy: { publishDate: 'desc' },
        take: 10
      },
      changes: {
        orderBy: { announcedDate: 'desc' },
        take: 10
      }
    }
  });
}

/**
 * Update regulator
 */
async function updateRegulator(id, updates) {
  return await prisma.regulators.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete regulator
 */
async function deleteRegulator(id) {
  return await prisma.regulators.delete({
    where: { id }
  });
}

/**
 * Get regulator publications
 */
async function getRegulatorPublications(regulatorId) {
  return await prisma.regulator_publications.findMany({
    where: { regulatorId },
    orderBy: { publishDate: 'desc' }
  });
}

/**
 * Create regulatory change
 */
async function createRegulatoryChange(data) {
  const impact = calculateImpactScore({
    scope: data.scope,
    effectiveDate: data.effectiveDate,
    complexity: data.complexity,
    penaltyRisk: data.penaltyRisk
  });

  return await prisma.regulatory_changes.create({
    data: {
      regulatorId: data.regulatorId,
      title: data.title,
      description: data.description,
      changeType: data.changeType,
      scope: data.scope,
      complexity: data.complexity,
      penaltyRisk: data.penaltyRisk,
      status: 'announced',
      announcedDate: data.announcedDate || new Date(),
      effectiveDate: data.effectiveDate,
      impactScore: impact.score,
      impactLevel: impact.level,
      affectedFrameworks: data.affectedFrameworks || [],
      source: data.source,
      sourceUrl: data.sourceUrl,
      metadata: data.metadata || {},
      tenantId: data.tenantId
    }
  });
}

/**
 * Get all regulatory changes
 */
async function getRegulatoryChanges(filters = {}) {
  const where = {};

  if (filters.regulatorId) where.regulatorId = filters.regulatorId;
  if (filters.changeType) where.changeType = filters.changeType;
  if (filters.status) where.status = filters.status;
  if (filters.impactLevel) where.impactLevel = filters.impactLevel;
  if (filters.tenantId) where.tenantId = filters.tenantId;

  return await prisma.regulatory_changes.findMany({
    where,
    include: { regulator: true },
    orderBy: [
      { impactScore: 'desc' },
      { announcedDate: 'desc' }
    ]
  });
}

/**
 * Get changes by regulator
 */
async function getChangesByRegulator(regulatorId) {
  return await prisma.regulatory_changes.findMany({
    where: { regulatorId },
    orderBy: { announcedDate: 'desc' }
  });
}

/**
 * Get regulatory intelligence stats
 */
async function getRegulatoryIntelligenceStats(tenantId) {
  const changes = await prisma.regulatory_changes.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const regulators = await prisma.regulators.count({
    where: { isActive: true }
  });

  const upcoming = changes.filter(c =>
    c.effectiveDate &&
    c.effectiveDate > new Date() &&
    c.status !== 'completed'
  );

  const now = Date.now();
  const urgent = upcoming.filter(c =>
    (c.effectiveDate.getTime() - now) <= (30 * 24 * 60 * 60 * 1000) // 30 days
  );

  return {
    regulators: {
      total: regulators,
      monitored: regulators
    },
    changes: {
      total: changes.length,
      byStatus: {
        announced: changes.filter(c => c.status === 'announced').length,
        in_progress: changes.filter(c => c.status === 'in_progress').length,
        implemented: changes.filter(c => c.status === 'implemented').length,
        completed: changes.filter(c => c.status === 'completed').length
      },
      byImpact: {
        critical: changes.filter(c => c.impactLevel === 'critical').length,
        high: changes.filter(c => c.impactLevel === 'high').length,
        medium: changes.filter(c => c.impactLevel === 'medium').length,
        low: changes.filter(c => c.impactLevel === 'low').length
      },
      upcoming: upcoming.length,
      urgent: urgent.length
    },
    avgImpactScore: changes.length > 0
      ? (changes.reduce((sum, c) => sum + c.impactScore, 0) / changes.length).toFixed(2)
      : 0
  };
}

/**
 * Get regulatory intelligence feed
 */
async function getRegulatoryFeed(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.impactLevel) where.impactLevel = { in: filters.impactLevel };
  if (filters.status) where.status = filters.status;

  // Only show recent or upcoming changes
  where.OR = [
    { announcedDate: { gte: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)) } }, // Last 90 days
    { effectiveDate: { gte: new Date() } } // Future effective dates
  ];

  return await prisma.regulatory_changes.findMany({
    where,
    include: {
      regulator: {
        select: { name: true, shortName: true, country: true }
      }
    },
    orderBy: [
      { impactScore: 'desc' },
      { effectiveDate: 'asc' }
    ],
    take: filters.limit || 50
  });
}

/**
 * Get regulatory calendar
 */
async function getRegulatoryCalendar(filters = {}) {
  const where = {
    effectiveDate: { not: null },
    status: { notIn: ['completed'] }
  };

  if (filters.tenantId) where.tenantId = filters.tenantId;

  // Filter by date range
  if (filters.startDate) {
    where.effectiveDate = { ...where.effectiveDate, gte: filters.startDate };
  }
  if (filters.endDate) {
    where.effectiveDate = { ...where.effectiveDate, lte: filters.endDate };
  }

  const changes = await prisma.regulatory_changes.findMany({
    where,
    include: {
      regulator: {
        select: { name: true, shortName: true }
      }
    },
    orderBy: { effectiveDate: 'asc' }
  });

  // Group by month
  const calendar = changes.reduce((acc, change) => {
    const monthKey = `${change.effectiveDate.getFullYear()}-${(change.effectiveDate.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }

    acc[monthKey].push(change);
    return acc;
  }, {});

  return calendar;
}

/**
 * Get change impact analysis
 */
async function getChangeImpact(changeId) {
  const change = await prisma.regulatory_changes.findUnique({
    where: { id: changeId },
    include: {
      regulator: true
    }
  });

  if (!change) {
    throw new Error('Regulatory change not found');
  }

  // Analyze affected frameworks
  const affectedControls = await prisma.grc_controls.count({
    where: {
      frameworkId: { in: change.affectedFrameworks }
    }
  });

  // Estimate implementation effort
  const complexityEffort = {
    low: { hours: 20, cost: 2000 },
    medium: { hours: 80, cost: 8000 },
    high: { hours: 200, cost: 20000 }
  };

  const effort = complexityEffort[change.complexity] || complexityEffort.medium;

  return {
    change,
    impact: {
      score: change.impactScore,
      level: change.impactLevel,
      affectedFrameworks: change.affectedFrameworks.length,
      affectedControls,
      estimatedEffort: effort,
      daysUntilEffective: change.effectiveDate
        ? Math.floor((change.effectiveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    },
    recommendations: generateRecommendations(change)
  };
}

/**
 * Generate recommendations for regulatory change
 */
function generateRecommendations(change) {
  const recommendations = [];
  const daysUntilEffective = change.effectiveDate
    ? Math.floor((change.effectiveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (daysUntilEffective !== null && daysUntilEffective <= 30) {
    recommendations.push({
      priority: 'critical',
      action: 'Immediate action required',
      description: `Effective date is in ${daysUntilEffective} days. Begin implementation immediately.`
    });
  }

  if (change.impactLevel === 'critical' || change.impactLevel === 'high') {
    recommendations.push({
      priority: 'high',
      action: 'Conduct gap analysis',
      description: 'Perform detailed gap analysis against current controls and policies.'
    });
  }

  if (change.complexity === 'high') {
    recommendations.push({
      priority: 'high',
      action: 'Engage external consultants',
      description: 'Consider engaging regulatory compliance experts for implementation guidance.'
    });
  }

  recommendations.push({
    priority: 'medium',
    action: 'Update documentation',
    description: 'Review and update all relevant policies, procedures, and controls.'
  });

  recommendations.push({
    priority: 'low',
    action: 'Train staff',
    description: 'Plan and conduct training sessions for affected team members.'
  });

  return recommendations;
}

/**
 * Subscribe to regulatory updates
 */
async function subscribeToRegulator(userId, regulatorId, preferences = {}) {
  return await prisma.regulatory_subscriptions.create({
    data: {
      userId,
      regulatorId,
      notifyEmail: preferences.notifyEmail !== false,
      notifyInApp: preferences.notifyInApp !== false,
      frequency: preferences.frequency || 'immediate',
      impactLevels: preferences.impactLevels || ['high', 'critical']
    }
  });
}

/**
 * Get regulator statistics
 */
async function getRegulatorStats() {
  const regulators = await prisma.regulators.findMany({
    include: {
      _count: {
        select: {
          publications: true,
          changes: true
        }
      }
    }
  });

  return {
    total: regulators.length,
    active: regulators.filter(r => r.isActive).length,
    byCountry: regulators.reduce((acc, r) => {
      acc[r.country] = (acc[r.country] || 0) + 1;
      return acc;
    }, {}),
    byType: regulators.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {}),
    totalPublications: regulators.reduce((sum, r) => sum + r._count.publications, 0),
    totalChanges: regulators.reduce((sum, r) => sum + r._count.changes, 0)
  };
}

module.exports = {
  createRegulator,
  getRegulators,
  getRegulatorById,
  updateRegulator,
  deleteRegulator,
  getRegulatorPublications,
  createRegulatoryChange,
  getRegulatoryChanges,
  getChangesByRegulator,
  getRegulatoryIntelligenceStats,
  getRegulatoryFeed,
  getRegulatoryCalendar,
  getChangeImpact,
  subscribeToRegulator,
  getRegulatorStats,
  calculateImpactScore,
  getImpactLevel
};
