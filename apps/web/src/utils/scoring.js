/**
 * Compliance Scoring Utilities
 * Based on: Shahin GRC Master Spec - Appendix A
 * 
 * Implements framework compliance score calculation:
 * - Control weights (critical/high/medium/low)
 * - Status to score mapping
 * - Framework score aggregation
 */

/**
 * Control weight mapping based on criticality
 */
export const CONTROL_WEIGHTS = {
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
};

/**
 * Implementation status to score mapping
 */
export const STATUS_SCORES = {
  effective: 1.0,      // Fully implemented and effective
  in_progress: 0.6,    // Implementation in progress
  pending: 0.2,        // Not yet started but planned
  not_applicable: 0,   // Excluded from calculation
  na: 0,              // Alias for not_applicable
};

/**
 * Calculate score for a single control implementation
 * 
 * @param {Object} control - Control object
 * @param {string} control.criticality - Control criticality (critical/high/medium/low)
 * @param {string} control.status - Implementation status
 * @returns {Object} { weight, score, weighted_score }
 */
export function calculateControlScore(control) {
  const { criticality = 'medium', status = 'pending' } = control;
  
  const weight = CONTROL_WEIGHTS[criticality] || CONTROL_WEIGHTS.medium;
  const score = STATUS_SCORES[status] || STATUS_SCORES.pending;
  
  // If status is N/A, exclude from calculation
  const isApplicable = status !== 'not_applicable' && status !== 'na';
  
  return {
    weight: isApplicable ? weight : 0,
    score: isApplicable ? score : 0,
    weighted_score: isApplicable ? weight * score : 0,
    is_applicable: isApplicable,
  };
}

/**
 * Calculate compliance score for a framework
 * 
 * @param {Array<Object>} controls - Array of control implementations
 * @returns {Object} { score, total_controls, applicable_controls, breakdown }
 */
export function calculateFrameworkScore(controls) {
  if (!controls || controls.length === 0) {
    return {
      score: 0,
      percentage: 0,
      total_controls: 0,
      applicable_controls: 0,
      breakdown: {},
    };
  }

  let totalWeight = 0;
  let totalWeightedScore = 0;
  let applicableControls = 0;
  
  const breakdown = {
    by_status: {},
    by_criticality: {},
  };

  controls.forEach((control) => {
    const result = calculateControlScore(control);
    
    if (result.is_applicable) {
      totalWeight += result.weight;
      totalWeightedScore += result.weighted_score;
      applicableControls++;
      
      // Track by status
      const status = control.status || 'pending';
      breakdown.by_status[status] = (breakdown.by_status[status] || 0) + 1;
      
      // Track by criticality
      const criticality = control.criticality || 'medium';
      breakdown.by_criticality[criticality] = (breakdown.by_criticality[criticality] || 0) + 1;
    }
  });

  // Calculate final score: Σ(weight×score)/Σ(weight)
  const score = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const percentage = Math.round(score * 100 * 10) / 10; // Round to 1 decimal

  return {
    score,
    percentage,
    total_controls: controls.length,
    applicable_controls: applicableControls,
    breakdown,
  };
}

/**
 * Calculate overall compliance across multiple frameworks
 * 
 * @param {Array<Object>} frameworks - Array of frameworks with controls
 * @returns {Object} { overall_score, frameworks_summary }
 */
export function calculateOverallCompliance(frameworks) {
  if (!frameworks || frameworks.length === 0) {
    return {
      overall_score: 0,
      overall_percentage: 0,
      frameworks_summary: [],
    };
  }

  let totalWeight = 0;
  let totalWeightedScore = 0;
  const frameworksSummary = [];

  frameworks.forEach((framework) => {
    const controls = framework.controls || framework.control_implementations || [];
    const frameworkScore = calculateFrameworkScore(controls);
    
    // Add to overall calculation
    const frameworkWeight = frameworkScore.applicable_controls;
    totalWeight += frameworkWeight;
    totalWeightedScore += frameworkScore.score * frameworkWeight;
    
    frameworksSummary.push({
      framework_id: framework.id,
      framework_code: framework.code,
      framework_name: framework.name,
      ...frameworkScore,
    });
  });

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const overallPercentage = Math.round(overallScore * 100 * 10) / 10;

  return {
    overall_score: overallScore,
    overall_percentage: overallPercentage,
    total_frameworks: frameworks.length,
    frameworks_summary: frameworksSummary,
  };
}

/**
 * Identify compliance gaps (controls not effective)
 * 
 * @param {Array<Object>} controls - Array of control implementations
 * @returns {Array<Object>} Array of gap objects
 */
export function identifyComplianceGaps(controls) {
  if (!controls || controls.length === 0) {
    return [];
  }

  return controls
    .filter((control) => {
      const status = control.status || 'pending';
      return status !== 'effective' && status !== 'not_applicable' && status !== 'na';
    })
    .map((control) => {
      const result = calculateControlScore(control);
      const daysOverdue = control.due_date
        ? Math.max(0, Math.floor((new Date() - new Date(control.due_date)) / (1000 * 60 * 60 * 24)))
        : 0;
      
      return {
        control_id: control.id || control.control_id,
        control_code: control.code,
        control_title: control.title,
        status: control.status,
        criticality: control.criticality || 'medium',
        owner_id: control.owner_id,
        owner_name: control.owner_name,
        due_date: control.due_date,
        days_overdue: daysOverdue,
        is_overdue: daysOverdue > 0,
        current_score: result.score,
        potential_impact: result.weight, // How much this affects overall score
        priority: calculateGapPriority(control, daysOverdue),
      };
    })
    .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
}

/**
 * Calculate priority for a compliance gap
 * 
 * @param {Object} control - Control object
 * @param {number} daysOverdue - Days past due date
 * @returns {number} Priority score (0-100)
 */
function calculateGapPriority(control, daysOverdue) {
  const criticalityScores = {
    critical: 40,
    high: 30,
    medium: 20,
    low: 10,
  };
  
  const statusScores = {
    pending: 30,
    in_progress: 20,
    effective: 0,
  };
  
  const criticalityScore = criticalityScores[control.criticality] || 20;
  const statusScore = statusScores[control.status] || 25;
  const overdueScore = Math.min(30, daysOverdue * 2); // Max 30 points for overdue
  
  return criticalityScore + statusScore + overdueScore;
}

/**
 * Calculate trend data for compliance over time
 * 
 * @param {Array<Object>} historicalData - Array of { date, controls } objects
 * @returns {Array<Object>} Trend data points
 */
export function calculateComplianceTrend(historicalData) {
  if (!historicalData || historicalData.length === 0) {
    return [];
  }

  return historicalData.map((dataPoint) => {
    const score = calculateFrameworkScore(dataPoint.controls);
    return {
      date: dataPoint.date,
      score: score.score,
      percentage: score.percentage,
      applicable_controls: score.applicable_controls,
    };
  });
}

/**
 * Generate compliance status color based on percentage
 * 
 * @param {number} percentage - Compliance percentage (0-100)
 * @returns {string} Color code (red/yellow/green)
 */
export function getComplianceStatusColor(percentage) {
  if (percentage >= 90) return 'green';
  if (percentage >= 70) return 'yellow';
  return 'red';
}

/**
 * Generate compliance status label
 * 
 * @param {number} percentage - Compliance percentage (0-100)
 * @returns {string} Status label
 */
export function getComplianceStatusLabel(percentage) {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Good';
  if (percentage >= 70) return 'Fair';
  if (percentage >= 50) return 'Poor';
  return 'Critical';
}

export default {
  CONTROL_WEIGHTS,
  STATUS_SCORES,
  calculateControlScore,
  calculateFrameworkScore,
  calculateOverallCompliance,
  identifyComplianceGaps,
  calculateComplianceTrend,
  getComplianceStatusColor,
  getComplianceStatusLabel,
};
