/**
 * Compliance Service - Business logic for compliance management
 * Handles compliance scoring, gap analysis, and automated checks
 */

const prisma = require('../../db/prisma');

/**
 * Calculate compliance score for a framework
 * @param {string} frameworkId - Framework identifier
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Compliance score and details
 */
async function calculateComplianceScore(frameworkId, tenantId) {
  try {
    const requirements = await prisma.grc_compliance.findMany({
      where: {
        framework_id: frameworkId,
        ...(tenantId && { tenant_id: tenantId })
      }
    });

    if (requirements.length === 0) {
      return { score: 0, total: 0, compliant: 0, nonCompliant: 0, partial: 0 };
    }

    const statusCount = {
      compliant: 0,
      non_compliant: 0,
      partial: 0,
      not_assessed: 0
    };

    requirements.forEach(req => {
      const status = req.status || 'not_assessed';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Scoring: Compliant = 100%, Partial = 50%, Others = 0%
    const weightedScore = (statusCount.compliant * 100) + (statusCount.partial * 50);
    const maxScore = requirements.length * 100;
    const score = Math.round((weightedScore / maxScore) * 100);

    return {
      score,
      total: requirements.length,
      compliant: statusCount.compliant,
      nonCompliant: statusCount.non_compliant,
      partial: statusCount.partial,
      notAssessed: statusCount.not_assessed,
      level: getComplianceLevel(score)
    };
  } catch (err) {
    console.error('Error calculating compliance score:', err.message);
    return { score: 0, total: 0, compliant: 0, nonCompliant: 0, partial: 0 };
  }
}

/**
 * Get compliance level from score
 * @param {number} score - Compliance score (0-100)
 * @returns {string} Compliance level
 */
function getComplianceLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Identify compliance gaps
 * @param {string} frameworkId - Framework identifier
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Array>} List of compliance gaps
 */
async function identifyGaps(frameworkId, tenantId) {
  try {
    const gaps = await prisma.grc_compliance.findMany({
      where: {
        framework_id: frameworkId,
        status: { in: ['non_compliant', 'not_assessed'] },
        ...(tenantId && { tenant_id: tenantId })
      },
      orderBy: { compliance_level: 'desc' }
    });

    return gaps.map(gap => ({
      ...gap,
      priority: calculateGapPriority(gap),
      daysOverdue: gap.next_review_date ?
        Math.floor((new Date() - new Date(gap.next_review_date)) / (1000 * 60 * 60 * 24)) : 0
    }));
  } catch (err) {
    console.error('Error identifying gaps:', err.message);
    return [];
  }
}

/**
 * Calculate gap priority based on compliance level and status
 * @param {Object} gap - Gap object
 * @returns {string} Priority level
 */
function calculateGapPriority(gap) {
  const level = gap.compliance_level || 0;
  const isOverdue = gap.next_review_date && new Date(gap.next_review_date) < new Date();

  if (level >= 3 || isOverdue) return 'Critical';
  if (level >= 2) return 'High';
  if (level >= 1) return 'Medium';
  return 'Low';
}

/**
 * Get overall compliance dashboard
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Compliance dashboard data
 */
async function getComplianceDashboard(tenantId) {
  try {
    const frameworks = await prisma.grc_frameworks.findMany({
      where: tenantId ? { tenant_id: tenantId } : {},
      take: 20
    });

    const dashboardData = await Promise.all(
      frameworks.map(async (framework) => {
        const score = await calculateComplianceScore(framework.framework_id, tenantId);
        return {
          framework_id: framework.framework_id,
          framework_name: framework.name || framework.framework_name,
          ...score
        };
      })
    );

    const totalScore = dashboardData.reduce((sum, f) => sum + f.score, 0);
    const avgScore = dashboardData.length > 0 ? Math.round(totalScore / dashboardData.length) : 0;

    return {
      frameworks: dashboardData,
      averageScore: avgScore,
      overallLevel: getComplianceLevel(avgScore),
      totalFrameworks: frameworks.length
    };
  } catch (err) {
    console.error('Error generating compliance dashboard:', err.message);
    return { frameworks: [], averageScore: 0, overallLevel: 'Not Assessed', totalFrameworks: 0 };
  }
}

/**
 * Check if compliance requirements need review
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Array>} Requirements needing review
 */
async function getReviewDue(tenantId) {
  try {
    const today = new Date();
    const reviewDue = await prisma.grc_compliance.findMany({
      where: {
        next_review_date: { lte: today },
        ...(tenantId && { tenant_id: tenantId })
      },
      orderBy: { next_review_date: 'asc' }
    });

    return reviewDue.map(req => ({
      ...req,
      daysOverdue: Math.floor((today - new Date(req.next_review_date)) / (1000 * 60 * 60 * 24))
    }));
  } catch (err) {
    console.error('Error fetching review due items:', err.message);
    return [];
  }
}

/**
 * Update compliance status with automatic scoring
 * @param {string} complianceId - Compliance requirement ID
 * @param {Object} updates - Updated fields
 * @returns {Promise<Object>} Updated compliance record
 */
async function updateComplianceStatus(complianceId, updates) {
  try {
    // Auto-set last_review_date if status is being updated
    if (updates.status && !updates.last_review_date) {
      updates.last_review_date = new Date();
    }

    // Auto-calculate next review date (90 days from now)
    if (updates.status && !updates.next_review_date) {
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 90);
      updates.next_review_date = nextReview;
    }

    return await prisma.grc_compliance.update({
      where: { compliance_id: complianceId },
      data: updates
    });
  } catch (err) {
    console.error('Error updating compliance status:', err.message);
    throw err;
  }
}

/**
 * Get compliance trends over time
 * @param {string} frameworkId - Framework identifier
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Compliance trend data
 */
async function getComplianceTrends(frameworkId, days = 30) {
  // This would require audit/history table
  // Placeholder implementation
  try {
    const current = await calculateComplianceScore(frameworkId);
    return {
      current: current.score,
      trend: 'stable',
      note: 'Historical tracking requires audit logging'
    };
  } catch (err) {
    console.error('Error calculating trends:', err.message);
    return { current: 0, trend: 'unknown', note: 'Data not available' };
  }
}

module.exports = {
  calculateComplianceScore,
  getComplianceLevel,
  identifyGaps,
  calculateGapPriority,
  getComplianceDashboard,
  getReviewDue,
  updateComplianceStatus,
  getComplianceTrends
};
