/**
 * Framework Service
 * Handles framework controls mapping, analytics, and coverage analysis
 */

const prisma = require('../../db/prisma');

/**
 * Calculate framework coverage
 */
function calculateCoverage(framework, controls) {
  const totalControls = controls.length;
  if (totalControls === 0) return { percentage: 0, implemented: 0, notImplemented: totalControls };

  const implemented = controls.filter(c =>
    c.implementationStatus === 'implemented' ||
    c.implementationStatus === 'optimized'
  ).length;

  return {
    percentage: ((implemented / totalControls) * 100).toFixed(2),
    implemented,
    notImplemented: totalControls - implemented,
    total: totalControls
  };
}

/**
 * Calculate framework compliance score
 */
function calculateComplianceScore(controls) {
  if (controls.length === 0) return 0;

  const statusScores = {
    'not_started': 0,
    'in_progress': 25,
    'implemented': 75,
    'optimized': 100
  };

  const totalScore = controls.reduce((sum, c) =>
    sum + (statusScores[c.implementationStatus] || 0), 0
  );

  return (totalScore / (controls.length * 100) * 100).toFixed(2);
}

/**
 * Create framework
 */
async function createFramework(data) {
  return await prisma.grc_frameworks.create({
    data: {
      name: data.name,
      shortName: data.shortName,
      version: data.version,
      description: data.description,
      category: data.category,
      industry: data.industry || [],
      geography: data.geography || [],
      status: 'draft',
      regulatoryBody: data.regulatoryBody,
      officialUrl: data.officialUrl,
      effectiveDate: data.effectiveDate,
      metadata: data.metadata || {},
      tenantId: data.tenantId,
      createdBy: data.createdBy
    }
  });
}

/**
 * Get all frameworks
 */
async function getFrameworks(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.industry) {
    where.industry = { has: filters.industry };
  }

  return await prisma.grc_frameworks.findMany({
    where,
    include: {
      _count: {
        select: { controls: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Get framework by ID
 */
async function getFrameworkById(id) {
  return await prisma.grc_frameworks.findUnique({
    where: { id },
    include: {
      controls: {
        orderBy: { controlId: 'asc' }
      }
    }
  });
}

/**
 * Update framework
 */
async function updateFramework(id, updates) {
  return await prisma.grc_frameworks.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete framework
 */
async function deleteFramework(id) {
  // Check if framework has associated data
  const hasControls = await prisma.grc_controls.count({
    where: { frameworkId: id }
  });

  if (hasControls > 0) {
    throw new Error('Cannot delete framework with associated controls');
  }

  return await prisma.grc_frameworks.delete({
    where: { id }
  });
}

/**
 * Get framework controls
 */
async function getFrameworkControls(frameworkId, filters = {}) {
  const where = { frameworkId };

  if (filters.domain) where.domain = filters.domain;
  if (filters.implementationStatus) {
    where.implementationStatus = filters.implementationStatus;
  }
  if (filters.priority) where.priority = filters.priority;

  return await prisma.grc_controls.findMany({
    where,
    include: {
      _count: {
        select: {
          evidence: true,
          tests: true
        }
      }
    },
    orderBy: { controlId: 'asc' }
  });
}

/**
 * Create control
 */
async function createControl(data) {
  return await prisma.grc_controls.create({
    data: {
      frameworkId: data.frameworkId,
      controlId: data.controlId,
      title: data.title,
      description: data.description,
      domain: data.domain,
      category: data.category,
      objectiv: data.objective,
      implementationGuidance: data.implementationGuidance,
      testingProcedure: data.testingProcedure,
      implementationStatus: 'not_started',
      priority: data.priority || 'medium',
      owner: data.owner,
      frequency: data.frequency,
      metadata: data.metadata || {},
      tenantId: data.tenantId
    }
  });
}

/**
 * Update control
 */
async function updateControl(id, updates) {
  return await prisma.grc_controls.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Get framework analytics
 */
async function getFrameworkAnalytics(frameworkId) {
  const framework = await prisma.grc_frameworks.findUnique({
    where: { id: frameworkId },
    include: {
      controls: {
        include: {
          _count: {
            select: {
              evidence: true,
              tests: true
            }
          }
        }
      }
    }
  });

  if (!framework) {
    throw new Error('Framework not found');
  }

  const controls = framework.controls;
  const coverage = calculateCoverage(framework, controls);
  const complianceScore = calculateComplianceScore(controls);

  // Group by domain
  const byDomain = controls.reduce((acc, c) => {
    if (!acc[c.domain]) {
      acc[c.domain] = [];
    }
    acc[c.domain].push(c);
    return acc;
  }, {});

  const domainAnalytics = Object.entries(byDomain).map(([domain, domainControls]) => ({
    domain,
    total: domainControls.length,
    coverage: calculateCoverage(framework, domainControls),
    complianceScore: calculateComplianceScore(domainControls)
  }));

  // Implementation status breakdown
  const statusBreakdown = {
    not_started: controls.filter(c => c.implementationStatus === 'not_started').length,
    in_progress: controls.filter(c => c.implementationStatus === 'in_progress').length,
    implemented: controls.filter(c => c.implementationStatus === 'implemented').length,
    optimized: controls.filter(c => c.implementationStatus === 'optimized').length
  };

  // Evidence coverage
  const withEvidence = controls.filter(c => c._count.evidence > 0).length;
  const evidenceCoverage = controls.length > 0
    ? ((withEvidence / controls.length) * 100).toFixed(2)
    : 0;

  // Testing coverage
  const withTests = controls.filter(c => c._count.tests > 0).length;
  const testingCoverage = controls.length > 0
    ? ((withTests / controls.length) * 100).toFixed(2)
    : 0;

  // Priority distribution
  const priorityDistribution = {
    critical: controls.filter(c => c.priority === 'critical').length,
    high: controls.filter(c => c.priority === 'high').length,
    medium: controls.filter(c => c.priority === 'medium').length,
    low: controls.filter(c => c.priority === 'low').length
  };

  return {
    framework: {
      id: framework.id,
      name: framework.name,
      shortName: framework.shortName,
      version: framework.version
    },
    summary: {
      totalControls: controls.length,
      coverage: coverage.percentage,
      complianceScore,
      evidenceCoverage,
      testingCoverage
    },
    implementation: statusBreakdown,
    priority: priorityDistribution,
    domains: domainAnalytics,
    gaps: {
      controlsWithoutEvidence: controls.length - withEvidence,
      controlsWithoutTests: controls.length - withTests,
      controlsNotStarted: statusBreakdown.not_started
    }
  };
}

/**
 * Get framework coverage report
 */
async function getFrameworkCoverage(tenantId) {
  const frameworks = await prisma.grc_frameworks.findMany({
    where: tenantId ? { tenantId } : {},
    include: {
      controls: true
    }
  });

  return frameworks.map(framework => {
    const coverage = calculateCoverage(framework, framework.controls);
    const complianceScore = calculateComplianceScore(framework.controls);

    return {
      id: framework.id,
      name: framework.name,
      shortName: framework.shortName,
      totalControls: framework.controls.length,
      coverage: coverage.percentage,
      complianceScore,
      status: framework.status
    };
  });
}

/**
 * Map control to another framework (control mapping)
 */
async function mapControls(sourceControlId, targetControlId, mappingType = 'equivalent') {
  return await prisma.control_mappings.create({
    data: {
      sourceControlId,
      targetControlId,
      mappingType,
      confidence: mappingType === 'equivalent' ? 100 : 75
    }
  });
}

/**
 * Get control mappings
 */
async function getControlMappings(controlId) {
  const sourceMappings = await prisma.control_mappings.findMany({
    where: { sourceControlId: controlId },
    include: {
      targetControl: {
        include: { framework: true }
      }
    }
  });

  const targetMappings = await prisma.control_mappings.findMany({
    where: { targetControlId: controlId },
    include: {
      sourceControl: {
        include: { framework: true }
      }
    }
  });

  return {
    mappedTo: sourceMappings,
    mappedFrom: targetMappings
  };
}

/**
 * Get framework gaps
 */
async function getFrameworkGaps(frameworkId) {
  const controls = await prisma.grc_controls.findMany({
    where: { frameworkId },
    include: {
      _count: {
        select: {
          evidence: true,
          tests: true
        }
      }
    }
  });

  const gaps = controls.filter(c =>
    c.implementationStatus === 'not_started' ||
    c._count.evidence === 0 ||
    c._count.tests === 0
  );

  return gaps.map(c => ({
    controlId: c.controlId,
    title: c.title,
    domain: c.domain,
    priority: c.priority,
    issues: {
      notImplemented: c.implementationStatus === 'not_started',
      noEvidence: c._count.evidence === 0,
      notTested: c._count.tests === 0
    }
  }));
}

/**
 * Bulk import controls for framework
 */
async function bulkImportControls(frameworkId, controls) {
  const imported = [];
  const failed = [];

  for (const control of controls) {
    try {
      const created = await createControl({
        ...control,
        frameworkId
      });
      imported.push(created);
    } catch (error) {
      failed.push({
        controlId: control.controlId,
        error: error.message
      });
    }
  }

  return {
    imported: imported.length,
    failed: failed.length,
    details: { imported, failed }
  };
}

module.exports = {
  createFramework,
  getFrameworks,
  getFrameworkById,
  updateFramework,
  deleteFramework,
  getFrameworkControls,
  createControl,
  updateControl,
  getFrameworkAnalytics,
  getFrameworkCoverage,
  mapControls,
  getControlMappings,
  getFrameworkGaps,
  bulkImportControls,
  calculateCoverage,
  calculateComplianceScore
};
