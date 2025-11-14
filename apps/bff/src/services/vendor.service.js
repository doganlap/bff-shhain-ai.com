/**
 * Vendor Service
 * Handles vendor/third-party risk management (TPRM)
 */

const prisma = require('../../db/prisma');

/**
 * Calculate vendor risk score
 */
function calculateVendorRisk(vendor) {
  let score = 0;
  let factors = [];

  // Criticality (0-30 points)
  const criticalityScores = { low: 5, medium: 15, high: 30 };
  score += criticalityScores[vendor.criticality] || 15;
  factors.push({ factor: 'Criticality', score: criticalityScores[vendor.criticality] || 15 });

  // Data access (0-25 points)
  const dataAccessScores = { none: 0, read: 10, write: 20, admin: 25 };
  score += dataAccessScores[vendor.dataAccess] || 10;
  factors.push({ factor: 'Data Access', score: dataAccessScores[vendor.dataAccess] || 10 });

  // Compliance status (0-20 points)
  const complianceScore = vendor.complianceStatus === 'compliant' ? 5 : 20;
  score += complianceScore;
  factors.push({ factor: 'Compliance', score: complianceScore });

  // Assessment overdue (0-15 points)
  if (vendor.lastAssessmentDate) {
    const daysSinceAssessment = Math.floor((Date.now() - vendor.lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceAssessment > 365) {
      score += 15;
      factors.push({ factor: 'Overdue Assessment', score: 15 });
    } else if (daysSinceAssessment > 180) {
      score += 8;
      factors.push({ factor: 'Assessment Due Soon', score: 8 });
    }
  } else {
    score += 15;
    factors.push({ factor: 'Never Assessed', score: 15 });
  }

  // Known incidents (0-10 points)
  const incidentScore = Math.min((vendor.incidentCount || 0) * 5, 10);
  score += incidentScore;
  if (incidentScore > 0) {
    factors.push({ factor: 'Security Incidents', score: incidentScore });
  }

  return { score, factors, level: getVendorRiskLevel(score) };
}

/**
 * Get vendor risk level
 */
function getVendorRiskLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Create vendor
 */
async function createVendor(data) {
  const riskAssessment = calculateVendorRisk({
    criticality: data.criticality,
    dataAccess: data.dataAccess,
    complianceStatus: data.complianceStatus,
    lastAssessmentDate: null,
    incidentCount: 0
  });

  return await prisma.vendors.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      criticality: data.criticality,
      dataAccess: data.dataAccess,
      status: data.status || 'active',
      complianceStatus: data.complianceStatus || 'pending',
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      tenantId: data.tenantId,
      createdBy: data.createdBy
    }
  });
}

/**
 * Get all vendors
 */
async function getVendors(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.status) where.status = filters.status;
  if (filters.criticality) where.criticality = filters.criticality;
  if (filters.riskLevel) where.riskLevel = filters.riskLevel;
  if (filters.category) where.category = filters.category;

  return await prisma.vendors.findMany({
    where,
    include: {
      _count: {
        select: {
          risks: true,
          assessments: true
        }
      }
    },
    orderBy: [
      { riskScore: 'desc' },
      { name: 'asc' }
    ]
  });
}

/**
 * Get vendor by ID
 */
async function getVendorById(id) {
  return await prisma.vendors.findUnique({
    where: { id },
    include: {
      risks: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      assessments: {
        orderBy: { assessmentDate: 'desc' },
        take: 5
      }
    }
  });
}

/**
 * Update vendor
 */
async function updateVendor(id, updates) {
  const vendor = await prisma.vendors.findUnique({ where: { id } });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Recalculate risk if relevant fields changed
  if (updates.criticality || updates.dataAccess || updates.complianceStatus) {
    const riskAssessment = calculateVendorRisk({
      ...vendor,
      ...updates
    });
    updates.riskScore = riskAssessment.score;
    updates.riskLevel = riskAssessment.level;
  }

  return await prisma.vendors.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete vendor
 */
async function deleteVendor(id) {
  return await prisma.vendors.delete({
    where: { id }
  });
}

/**
 * Assess vendor
 */
async function assessVendor(vendorId, assessmentData) {
  const vendor = await prisma.vendors.findUnique({ where: { id: vendorId } });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Create assessment record
  const assessment = await prisma.vendor_assessments.create({
    data: {
      vendorId,
      assessmentDate: new Date(),
      assessmentType: assessmentData.type,
      score: assessmentData.score,
      findings: assessmentData.findings,
      recommendations: assessmentData.recommendations,
      assessedBy: assessmentData.assessedBy,
      tenantId: vendor.tenantId
    }
  });

  // Update vendor with assessment info
  await prisma.vendors.update({
    where: { id: vendorId },
    data: {
      lastAssessmentDate: new Date(),
      complianceStatus: assessmentData.score >= 80 ? 'compliant' : 'non_compliant'
    }
  });

  // Recalculate risk score
  const updatedVendor = await prisma.vendors.findUnique({ where: { id: vendorId } });
  const riskAssessment = calculateVendorRisk(updatedVendor);

  await prisma.vendors.update({
    where: { id: vendorId },
    data: {
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level
    }
  });

  return assessment;
}

/**
 * Get vendor risks
 */
async function getVendorRisks(vendorId) {
  return await prisma.vendor_risks.findMany({
    where: { vendorId },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Create vendor risk
 */
async function createVendorRisk(data) {
  const risk = await prisma.vendor_risks.create({
    data: {
      vendorId: data.vendorId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      likelihood: data.likelihood,
      impact: data.impact,
      mitigation: data.mitigation,
      status: data.status || 'open',
      identifiedBy: data.identifiedBy,
      tenantId: data.tenantId
    }
  });

  // Increment vendor incident count if severity is high
  if (data.severity === 'high' || data.severity === 'critical') {
    await prisma.vendors.update({
      where: { id: data.vendorId },
      data: { incidentCount: { increment: 1 } }
    });
  }

  return risk;
}

/**
 * Get vendor statistics
 */
async function getVendorStats(tenantId) {
  const vendors = await prisma.vendors.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const assessments = await prisma.vendor_assessments.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { assessmentDate: 'desc' }
  });

  const risks = await prisma.vendor_risks.findMany({
    where: tenantId ? { tenantId } : {}
  });

  // Calculate assessment compliance
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
  const vendorsWithRecentAssessment = vendors.filter(v =>
    v.lastAssessmentDate && v.lastAssessmentDate > oneYearAgo
  ).length;

  return {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    inactive: vendors.filter(v => v.status === 'inactive').length,
    byRiskLevel: {
      critical: vendors.filter(v => v.riskLevel === 'critical').length,
      high: vendors.filter(v => v.riskLevel === 'high').length,
      medium: vendors.filter(v => v.riskLevel === 'medium').length,
      low: vendors.filter(v => v.riskLevel === 'low').length
    },
    byCriticality: {
      high: vendors.filter(v => v.criticality === 'high').length,
      medium: vendors.filter(v => v.criticality === 'medium').length,
      low: vendors.filter(v => v.criticality === 'low').length
    },
    assessments: {
      total: assessments.length,
      recent: assessments.filter(a => a.assessmentDate > oneYearAgo).length,
      compliance: vendors.length > 0
        ? ((vendorsWithRecentAssessment / vendors.length) * 100).toFixed(2)
        : 0
    },
    risks: {
      total: risks.length,
      open: risks.filter(r => r.status === 'open').length,
      bySeverity: {
        critical: risks.filter(r => r.severity === 'critical').length,
        high: risks.filter(r => r.severity === 'high').length,
        medium: risks.filter(r => r.severity === 'medium').length,
        low: risks.filter(r => r.severity === 'low').length
      }
    },
    avgRiskScore: vendors.length > 0
      ? (vendors.reduce((sum, v) => sum + (v.riskScore || 0), 0) / vendors.length).toFixed(2)
      : 0
  };
}

/**
 * Get vendors needing assessment
 */
async function getVendorsNeedingAssessment(tenantId, daysThreshold = 365) {
  const cutoffDate = new Date(Date.now() - (daysThreshold * 24 * 60 * 60 * 1000));

  const vendors = await prisma.vendors.findMany({
    where: {
      tenantId,
      status: 'active',
      OR: [
        { lastAssessmentDate: null },
        { lastAssessmentDate: { lt: cutoffDate } }
      ]
    },
    orderBy: [
      { riskScore: 'desc' },
      { criticality: 'desc' }
    ]
  });

  return vendors.map(v => ({
    ...v,
    daysSinceAssessment: v.lastAssessmentDate
      ? Math.floor((Date.now() - v.lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24))
      : null,
    neverAssessed: !v.lastAssessmentDate
  }));
}

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  assessVendor,
  getVendorRisks,
  createVendorRisk,
  getVendorStats,
  getVendorsNeedingAssessment,
  calculateVendorRisk,
  getVendorRiskLevel
};
