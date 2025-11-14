/**
 * Assessment Service - Business logic for assessment workflow management
 * Handles assessment lifecycle, progress tracking, and deadline alerts
 */

const prisma = require('../../db/prisma');

/**
 * Assessment workflow states
 */
const ASSESSMENT_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Calculate assessment progress percentage
 * @param {Object} assessment - Assessment object
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(assessment) {
  if (!assessment) return 0;

  const progress = assessment.progress || 0;
  if (typeof progress === 'number') return Math.min(100, Math.max(0, progress));

  // If progress is stored as steps completed
  if (assessment.steps_completed && assessment.total_steps) {
    return Math.round((assessment.steps_completed / assessment.total_steps) * 100);
  }

  return 0;
}

/**
 * Determine if assessment is overdue
 * @param {Object} assessment - Assessment object
 * @returns {boolean} True if overdue
 */
function isOverdue(assessment) {
  if (!assessment.due_date) return false;
  if (assessment.status === ASSESSMENT_STATES.COMPLETED) return false;
  return new Date(assessment.due_date) < new Date();
}

/**
 * Get days until due date
 * @param {Object} assessment - Assessment object
 * @returns {number} Days until due (negative if overdue)
 */
function getDaysUntilDue(assessment) {
  if (!assessment.due_date) return null;
  const today = new Date();
  const dueDate = new Date(assessment.due_date);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Create new assessment with automatic status
 * @param {Object} assessmentData - Assessment data
 * @returns {Promise<Object>} Created assessment
 */
async function createAssessment(assessmentData) {
  try {
    const data = {
      ...assessmentData,
      status: assessmentData.status || ASSESSMENT_STATES.NOT_STARTED,
      progress: assessmentData.progress || 0,
      start_date: assessmentData.start_date || new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    return await prisma.grc_assessments.create({ data });
  } catch (err) {
    console.error('Error creating assessment:', err.message);
    throw err;
  }
}

/**
 * Update assessment progress and status
 * @param {string} assessmentId - Assessment identifier
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated assessment
 */
async function updateAssessment(assessmentId, updates) {
  try {
    const current = await prisma.grc_assessments.findUnique({
      where: { assessment_id: assessmentId }
    });

    if (!current) throw new Error('Assessment not found');

    // Auto-transition status based on progress
    if (updates.progress !== undefined) {
      if (updates.progress >= 100 && !updates.status) {
        updates.status = ASSESSMENT_STATES.COMPLETED;
        updates.completed_date = new Date();
      } else if (updates.progress > 0 && current.status === ASSESSMENT_STATES.NOT_STARTED) {
        updates.status = ASSESSMENT_STATES.IN_PROGRESS;
      }
    }

    // Set completion date if status is completed
    if (updates.status === ASSESSMENT_STATES.COMPLETED && !updates.completed_date) {
      updates.completed_date = new Date();
    }

    updates.updated_at = new Date();

    return await prisma.grc_assessments.update({
      where: { assessment_id: assessmentId },
      data: updates
    });
  } catch (err) {
    console.error('Error updating assessment:', err.message);
    throw err;
  }
}

/**
 * Get assessments by status
 * @param {string} status - Assessment status
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Array>} Filtered assessments
 */
async function getAssessmentsByStatus(status, tenantId) {
  try {
    return await prisma.grc_assessments.findMany({
      where: {
        status,
        ...(tenantId && { tenant_id: tenantId })
      },
      orderBy: { due_date: 'asc' }
    });
  } catch (err) {
    console.error('Error fetching assessments by status:', err.message);
    return [];
  }
}

/**
 * Get overdue assessments
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Array>} Overdue assessments
 */
async function getOverdueAssessments(tenantId) {
  try {
    const assessments = await prisma.grc_assessments.findMany({
      where: {
        status: { notIn: [ASSESSMENT_STATES.COMPLETED, ASSESSMENT_STATES.CANCELLED] },
        due_date: { lt: new Date() },
        ...(tenantId && { tenant_id: tenantId })
      },
      orderBy: { due_date: 'asc' }
    });

    return assessments.map(a => ({
      ...a,
      daysOverdue: Math.abs(getDaysUntilDue(a))
    }));
  } catch (err) {
    console.error('Error fetching overdue assessments:', err.message);
    return [];
  }
}

/**
 * Get assessment statistics
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Assessment statistics
 */
async function getAssessmentStats(tenantId) {
  try {
    const assessments = await prisma.grc_assessments.findMany({
      where: tenantId ? { tenant_id: tenantId } : {}
    });

    const stats = {
      total: assessments.length,
      byStatus: {},
      overdue: 0,
      avgProgress: 0,
      completionRate: 0
    };

    let totalProgress = 0;
    let completed = 0;

    assessments.forEach(a => {
      stats.byStatus[a.status] = (stats.byStatus[a.status] || 0) + 1;
      totalProgress += calculateProgress(a);
      if (a.status === ASSESSMENT_STATES.COMPLETED) completed++;
      if (isOverdue(a)) stats.overdue++;
    });

    stats.avgProgress = assessments.length > 0 ?
      Math.round(totalProgress / assessments.length) : 0;
    stats.completionRate = assessments.length > 0 ?
      Math.round((completed / assessments.length) * 100) : 0;

    return stats;
  } catch (err) {
    console.error('Error calculating assessment stats:', err.message);
    return { total: 0, byStatus: {}, overdue: 0, avgProgress: 0, completionRate: 0 };
  }
}

/**
 * Get assessments needing attention (overdue or due soon)
 * @param {string} tenantId - Tenant identifier
 * @param {number} daysThreshold - Days threshold for "due soon"
 * @returns {Promise<Array>} Assessments needing attention
 */
async function getAssessmentsNeedingAttention(tenantId, daysThreshold = 7) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    const assessments = await prisma.grc_assessments.findMany({
      where: {
        status: { notIn: [ASSESSMENT_STATES.COMPLETED, ASSESSMENT_STATES.CANCELLED] },
        due_date: { lte: futureDate },
        ...(tenantId && { tenant_id: tenantId })
      },
      orderBy: { due_date: 'asc' }
    });

    return assessments.map(a => ({
      ...a,
      daysUntilDue: getDaysUntilDue(a),
      isOverdue: isOverdue(a),
      urgency: isOverdue(a) ? 'overdue' :
               getDaysUntilDue(a) <= 3 ? 'critical' :
               getDaysUntilDue(a) <= 7 ? 'high' : 'medium'
    }));
  } catch (err) {
    console.error('Error fetching assessments needing attention:', err.message);
    return [];
  }
}

/**
 * Bulk update assessment statuses
 * @param {Array<string>} assessmentIds - Assessment identifiers
 * @param {string} status - New status
 * @returns {Promise<number>} Number of updated assessments
 */
async function bulkUpdateStatus(assessmentIds, status) {
  try {
    const result = await prisma.grc_assessments.updateMany({
      where: { assessment_id: { in: assessmentIds } },
      data: {
        status,
        updated_at: new Date(),
        ...(status === ASSESSMENT_STATES.COMPLETED && { completed_date: new Date() })
      }
    });
    return result.count;
  } catch (err) {
    console.error('Error bulk updating assessments:', err.message);
    throw err;
  }
}

module.exports = {
  ASSESSMENT_STATES,
  calculateProgress,
  isOverdue,
  getDaysUntilDue,
  createAssessment,
  updateAssessment,
  getAssessmentsByStatus,
  getOverdueAssessments,
  getAssessmentStats,
  getAssessmentsNeedingAttention,
  bulkUpdateStatus
};
