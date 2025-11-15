/**
 * Control Service
 * Handles control testing, evidence linking, and implementation tracking
 */

const prisma = require('../../db/prisma');

/**
 * Calculate control effectiveness score
 */
function calculateEffectivenessScore(control, tests, evidence) {
  let score = 0;
  let factors = [];

  // Implementation status (0-30 points)
  const statusScores = {
    'not_started': 0,
    'in_progress': 10,
    'implemented': 25,
    'optimized': 30
  };
  score += statusScores[control.implementationStatus] || 0;
  factors.push({
    factor: 'Implementation',
    score: statusScores[control.implementationStatus] || 0
  });

  // Evidence coverage (0-30 points)
  const evidenceScore = Math.min(evidence.length * 10, 30);
  score += evidenceScore;
  if (evidenceScore > 0) {
    factors.push({ factor: 'Evidence', score: evidenceScore });
  }

  // Testing coverage (0-25 points)
  if (tests.length > 0) {
    const passedTests = tests.filter(t => t.result === 'pass').length;
    const testScore = (passedTests / tests.length) * 25;
    score += testScore;
    factors.push({ factor: 'Testing', score: testScore.toFixed(2) });
  }

  // Recency (0-15 points)
  if (control.lastTestDate) {
    const daysSinceTest = Math.floor((Date.now() - control.lastTestDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceTest <= 30) {
      score += 15;
      factors.push({ factor: 'Recency', score: 15 });
    } else if (daysSinceTest <= 90) {
      score += 10;
      factors.push({ factor: 'Recency', score: 10 });
    } else if (daysSinceTest <= 180) {
      score += 5;
      factors.push({ factor: 'Recency', score: 5 });
    }
  }

  return { score, factors, level: getEffectivenessLevel(score) };
}

/**
 * Get effectiveness level
 */
function getEffectivenessLevel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'adequate';
  return 'poor';
}

/**
 * Get control by ID
 */
async function getControlById(id) {
  return await prisma.grc_controls.findUnique({
    where: { id },
    include: {
      framework: true,
      evidence: true,
      tests: {
        orderBy: { testDate: 'desc' },
        take: 10
      }
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
 * Update control implementation status
 */
async function updateImplementationStatus(id, status, userId, notes) {
  const updates = {
    implementationStatus: status,
    implementationNotes: notes
  };

  if (status === 'implemented' || status === 'optimized') {
    updates.implementedBy = userId;
    updates.implementedAt = new Date();
  }

  return await updateControl(id, updates);
}

/**
 * Create control test
 */
async function createControlTest(data) {
  const test = await prisma.control_tests.create({
    data: {
      controlId: data.controlId,
      testType: data.testType,
      testDate: data.testDate || new Date(),
      tester: data.tester,
      result: data.result,
      findings: data.findings,
      recommendations: data.recommendations,
      evidenceCollected: data.evidenceCollected,
      metadata: data.metadata || {},
      tenantId: data.tenantId
    }
  });

  // Update control's lastTestDate
  await prisma.grc_controls.update({
    where: { id: data.controlId },
    data: { lastTestDate: test.testDate }
  });

  return test;
}

/**
 * Get control tests
 */
async function getControlTests(controlId) {
  return await prisma.control_tests.findMany({
    where: { controlId },
    orderBy: { testDate: 'desc' }
  });
}

/**
 * Link evidence to control
 */
async function linkEvidence(controlId, evidenceId, relevance = 'direct') {
  return await prisma.evidence_control_links.create({
    data: {
      controlId,
      evidenceId,
      relevance,
      linkedAt: new Date()
    }
  });
}

/**
 * Unlink evidence from control
 */
async function unlinkEvidence(controlId, evidenceId) {
  return await prisma.evidence_control_links.deleteMany({
    where: {
      controlId,
      evidenceId
    }
  });
}

/**
 * Get control evidence
 */
async function getControlEvidence(controlId) {
  const links = await prisma.evidence_control_links.findMany({
    where: { controlId },
    include: { evidence: true }
  });

  return links.map(l => ({
    ...l.evidence,
    relevance: l.relevance,
    linkedAt: l.linkedAt
  }));
}

/**
 * Get control implementation details
 */
async function getControlImplementation(controlId) {
  const control = await getControlById(controlId);

  if (!control) {
    throw new Error('Control not found');
  }

  const tests = await getControlTests(controlId);
  const evidence = await getControlEvidence(controlId);
  const effectiveness = calculateEffectivenessScore(control, tests, evidence);

  return {
    control: {
      id: control.id,
      controlId: control.controlId,
      title: control.title,
      framework: control.framework.name,
      status: control.implementationStatus,
      priority: control.priority,
      owner: control.owner
    },
    implementation: {
      status: control.implementationStatus,
      implementedBy: control.implementedBy,
      implementedAt: control.implementedAt,
      notes: control.implementationNotes,
      guidance: control.implementationGuidance
    },
    effectiveness,
    testing: {
      total: tests.length,
      passed: tests.filter(t => t.result === 'pass').length,
      failed: tests.filter(t => t.result === 'fail').length,
      lastTest: tests[0]?.testDate,
      frequency: control.frequency
    },
    evidence: {
      total: evidence.length,
      direct: evidence.filter(e => e.relevance === 'direct').length,
      supporting: evidence.filter(e => e.relevance === 'supporting').length
    }
  };
}

/**
 * Update control implementation
 */
async function updateControlImplementation(controlId, data, userId) {
  const updates = {
    implementationStatus: data.status,
    implementationNotes: data.notes,
    implementationGuidance: data.guidance,
    owner: data.owner,
    frequency: data.frequency
  };

  if (data.status === 'implemented' || data.status === 'optimized') {
    updates.implementedBy = userId;
    updates.implementedAt = new Date();
  }

  return await updateControl(controlId, updates);
}

/**
 * Get controls needing testing
 */
async function getControlsNeedingTesting(tenantId, daysThreshold = 90) {
  const cutoffDate = new Date(Date.now() - (daysThreshold * 24 * 60 * 60 * 1000));

  const controls = await prisma.grc_controls.findMany({
    where: {
      tenantId,
      OR: [
        { lastTestDate: null },
        { lastTestDate: { lt: cutoffDate } }
      ]
    },
    include: {
      framework: {
        select: { name: true, shortName: true }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { lastTestDate: 'asc' }
    ]
  });

  return controls.map(c => ({
    ...c,
    daysSinceTest: c.lastTestDate
      ? Math.floor((Date.now() - c.lastTestDate.getTime()) / (1000 * 60 * 60 * 24))
      : null,
    neverTested: !c.lastTestDate
  }));
}

/**
 * Get control statistics
 */
async function getControlStats(tenantId) {
  const controls = await prisma.grc_controls.findMany({
    where: tenantId ? { tenantId } : {},
    include: {
      _count: {
        select: {
          evidence: true,
          tests: true
        }
      }
    }
  });

  const tests = await prisma.control_tests.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const withEvidence = controls.filter(c => c._count.evidence > 0).length;
  const withTests = controls.filter(c => c._count.tests > 0).length;

  return {
    total: controls.length,
    byStatus: {
      not_started: controls.filter(c => c.implementationStatus === 'not_started').length,
      in_progress: controls.filter(c => c.implementationStatus === 'in_progress').length,
      implemented: controls.filter(c => c.implementationStatus === 'implemented').length,
      optimized: controls.filter(c => c.implementationStatus === 'optimized').length
    },
    byPriority: {
      critical: controls.filter(c => c.priority === 'critical').length,
      high: controls.filter(c => c.priority === 'high').length,
      medium: controls.filter(c => c.priority === 'medium').length,
      low: controls.filter(c => c.priority === 'low').length
    },
    evidence: {
      controlsWithEvidence: withEvidence,
      controlsWithoutEvidence: controls.length - withEvidence,
      coverageRate: controls.length > 0
        ? ((withEvidence / controls.length) * 100).toFixed(2)
        : 0
    },
    testing: {
      controlsTested: withTests,
      controlsNotTested: controls.length - withTests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.result === 'pass').length,
      failedTests: tests.filter(t => t.result === 'fail').length,
      testingRate: controls.length > 0
        ? ((withTests / controls.length) * 100).toFixed(2)
        : 0
    }
  };
}

/**
 * Run control assessment
 */
async function runControlAssessment(controlId, userId) {
  const control = await getControlById(controlId);

  if (!control) {
    throw new Error('Control not found');
  }

  const tests = await getControlTests(controlId);
  const evidence = await getControlEvidence(controlId);
  const effectiveness = calculateEffectivenessScore(control, tests, evidence);

  // Generate recommendations
  const recommendations = [];

  if (control.implementationStatus === 'not_started') {
    recommendations.push({
      priority: 'high',
      action: 'Begin implementation',
      description: 'Control has not been implemented yet'
    });
  }

  if (evidence.length === 0) {
    recommendations.push({
      priority: 'high',
      action: 'Collect evidence',
      description: 'No evidence has been linked to this control'
    });
  }

  if (tests.length === 0) {
    recommendations.push({
      priority: 'medium',
      action: 'Conduct initial testing',
      description: 'Control has never been tested'
    });
  } else if (control.lastTestDate) {
    const daysSinceTest = Math.floor((Date.now() - control.lastTestDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceTest > 90) {
      recommendations.push({
        priority: 'medium',
        action: 'Schedule retest',
        description: `Last tested ${daysSinceTest} days ago`
      });
    }
  }

  const failedTests = tests.filter(t => t.result === 'fail');
  if (failedTests.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Address test failures',
      description: `${failedTests.length} failed test(s) need attention`
    });
  }

  // Create assessment record
  await prisma.control_assessments.create({
    data: {
      controlId,
      assessmentDate: new Date(),
      assessedBy: userId,
      effectivenessScore: effectiveness.score,
      effectivenessLevel: effectiveness.level,
      findings: JSON.stringify(effectiveness.factors),
      recommendations: JSON.stringify(recommendations)
    }
  });

  return {
    control: {
      id: control.id,
      controlId: control.controlId,
      title: control.title
    },
    effectiveness,
    recommendations,
    summary: {
      evidenceCount: evidence.length,
      testCount: tests.length,
      implementationStatus: control.implementationStatus
    }
  };
}

module.exports = {
  getControlById,
  updateControl,
  updateImplementationStatus,
  createControlTest,
  getControlTests,
  linkEvidence,
  unlinkEvidence,
  getControlEvidence,
  getControlImplementation,
  updateControlImplementation,
  getControlsNeedingTesting,
  getControlStats,
  runControlAssessment,
  calculateEffectivenessScore,
  getEffectivenessLevel
};
