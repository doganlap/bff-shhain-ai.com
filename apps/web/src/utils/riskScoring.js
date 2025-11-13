/**
 * Risk Scoring Utilities
 * Based on: Shahin GRC Master Spec - Appendix B
 * 
 * Implements risk assessment scoring:
 * - Likelihood × Impact matrix (1-25 scale)
 * - Heat band classification
 * - Auto-SLA assignment
 * - Risk prioritization
 */

/**
 * Heat band thresholds and classifications
 */
export const HEAT_BANDS = {
  low: { min: 1, max: 5, label: 'Low', color: 'green', sla: null },
  'med-': { min: 6, max: 10, label: 'Medium-', color: 'yellow', sla: null },
  'med+': { min: 11, max: 15, label: 'Medium+', color: 'orange', sla: null },
  high: { min: 16, max: 20, label: 'High', color: 'red', sla: 7 }, // 7 days SLA
  critical: { min: 21, max: 25, label: 'Critical', color: 'darkred', sla: 3 }, // 3 days SLA
};

/**
 * Likelihood scale (1-5)
 */
export const LIKELIHOOD_SCALE = {
  1: { label: 'Rare', description: 'May occur only in exceptional circumstances', percentage: '<10%' },
  2: { label: 'Unlikely', description: 'Could occur at some time', percentage: '10-30%' },
  3: { label: 'Possible', description: 'Might occur at some time', percentage: '30-50%' },
  4: { label: 'Likely', description: 'Will probably occur', percentage: '50-70%' },
  5: { label: 'Almost Certain', description: 'Expected to occur', percentage: '>70%' },
};

/**
 * Impact scale (1-5)
 */
export const IMPACT_SCALE = {
  1: { label: 'Insignificant', description: 'Minimal impact on operations', financial: '<$10K' },
  2: { label: 'Minor', description: 'Some impact, manageable', financial: '$10K-$50K' },
  3: { label: 'Moderate', description: 'Noticeable impact', financial: '$50K-$250K' },
  4: { label: 'Major', description: 'Significant impact', financial: '$250K-$1M' },
  5: { label: 'Severe', description: 'Catastrophic impact', financial: '>$1M' },
};

/**
 * Calculate risk score from likelihood and impact
 * 
 * @param {number} likelihood - Likelihood rating (1-5)
 * @param {number} impact - Impact rating (1-5)
 * @returns {Object} { score, heat_band, sla, color, label }
 */
export function calculateRiskScore(likelihood, impact) {
  // Validate inputs
  const validatedLikelihood = Math.max(1, Math.min(5, likelihood || 1));
  const validatedImpact = Math.max(1, Math.min(5, impact || 1));
  
  // Calculate score: likelihood × impact (1-25)
  const score = validatedLikelihood * validatedImpact;
  
  // Determine heat band
  const heatBand = getHeatBand(score);
  
  return {
    score,
    likelihood: validatedLikelihood,
    impact: validatedImpact,
    heat_band: heatBand.label,
    heat_band_key: getHeatBandKey(score),
    color: heatBand.color,
    sla_days: heatBand.sla,
    requires_immediate_action: heatBand.sla !== null,
  };
}

/**
 * Get heat band classification for a risk score
 * 
 * @param {number} score - Risk score (1-25)
 * @returns {Object} Heat band object
 */
export function getHeatBand(score) {
  for (const [key, band] of Object.entries(HEAT_BANDS)) {
    if (score >= band.min && score <= band.max) {
      return { ...band, key };
    }
  }
  return HEAT_BANDS.low; // Default
}

/**
 * Get heat band key for a risk score
 * 
 * @param {number} score - Risk score (1-25)
 * @returns {string} Heat band key
 */
export function getHeatBandKey(score) {
  for (const [key, band] of Object.entries(HEAT_BANDS)) {
    if (score >= band.min && score <= band.max) {
      return key;
    }
  }
  return 'low';
}

/**
 * Calculate risk assessment with full details
 * 
 * @param {Object} risk - Risk object
 * @returns {Object} Comprehensive assessment
 */
export function assessRisk(risk) {
  const {
    likelihood = 3,
    impact = 3,
    residual_likelihood = null,
    residual_impact = null,
    treatment_cost = 0,
  } = risk;
  
  // Inherent risk (before treatment)
  const inherent = calculateRiskScore(likelihood, impact);
  
  // Residual risk (after treatment, if provided)
  const residual = residual_likelihood && residual_impact
    ? calculateRiskScore(residual_likelihood, residual_impact)
    : null;
  
  // Risk reduction
  const reduction = residual
    ? {
        score_reduction: inherent.score - residual.score,
        percentage_reduction: Math.round(((inherent.score - residual.score) / inherent.score) * 100),
        is_effective: residual.score < inherent.score,
      }
    : null;
  
  // Cost-benefit analysis
  const costBenefit = residual && treatment_cost
    ? {
        treatment_cost,
        risk_reduction: inherent.score - residual.score,
        roi: treatment_cost > 0 ? (inherent.score - residual.score) / treatment_cost : 0,
        is_worthwhile: (inherent.score - residual.score) > (treatment_cost / 1000), // Simplified
      }
    : null;
  
  return {
    inherent_risk: inherent,
    residual_risk: residual,
    reduction,
    cost_benefit: costBenefit,
    recommendation: generateRiskRecommendation(inherent, residual),
  };
}

/**
 * Generate risk recommendation based on assessment
 * 
 * @param {Object} inherent - Inherent risk score
 * @param {Object} residual - Residual risk score (optional)
 * @returns {string} Recommendation text
 */
function generateRiskRecommendation(inherent, residual) {
  if (inherent.score >= 16) {
    return 'Immediate action required. Escalate to senior management.';
  }
  if (inherent.score >= 11) {
    return 'Develop treatment plan within SLA timeframe.';
  }
  if (residual && residual.score >= 11 && inherent.score >= 11) {
    return 'Current treatment insufficient. Review and enhance controls.';
  }
  if (residual && residual.score < 6) {
    return 'Risk adequately managed. Continue monitoring.';
  }
  return 'Monitor and review regularly.';
}

/**
 * Calculate risk priority for sorting
 * 
 * @param {Object} risk - Risk object with assessment
 * @returns {number} Priority score (0-100)
 */
export function calculateRiskPriority(risk) {
  const assessment = risk.assessment || assessRisk(risk);
  const inherent = assessment.inherent_risk;
  
  let priority = inherent.score * 4; // Base score (0-100)
  
  // Add urgency factors
  if (risk.due_date) {
    const daysUntilDue = Math.floor((new Date(risk.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) {
      priority += 20; // Overdue
    } else if (daysUntilDue < 7) {
      priority += 10; // Due soon
    }
  }
  
  // Add status factors
  if (risk.status === 'open' || risk.status === 'identified') {
    priority += 5; // Untreated risks
  }
  
  return Math.min(100, priority);
}

/**
 * Generate risk heat map data matrix (5x5)
 * 
 * @param {Array<Object>} risks - Array of risks
 * @returns {Array<Array<Object>>} 5x5 matrix with risk counts
 */
export function generateRiskHeatMap(risks) {
  // Initialize 5x5 matrix
  const matrix = Array(5).fill(null).map(() =>
    Array(5).fill(null).map(() => ({ count: 0, risks: [] }))
  );
  
  if (!risks || risks.length === 0) {
    return matrix;
  }
  
  risks.forEach((risk) => {
    const likelihood = Math.max(1, Math.min(5, risk.likelihood || 3)) - 1; // 0-4 index
    const impact = Math.max(1, Math.min(5, risk.impact || 3)) - 1; // 0-4 index
    
    matrix[4 - likelihood][impact].count++; // Flip likelihood for visual representation
    matrix[4 - likelihood][impact].risks.push({
      id: risk.id,
      title: risk.title,
      score: calculateRiskScore(risk.likelihood, risk.impact).score,
    });
  });
  
  return matrix;
}

/**
 * Calculate risk metrics for dashboard
 * 
 * @param {Array<Object>} risks - Array of risks
 * @returns {Object} Risk metrics
 */
export function calculateRiskMetrics(risks) {
  if (!risks || risks.length === 0) {
    return {
      total: 0,
      by_heat_band: {},
      average_score: 0,
      high_priority_count: 0,
      overdue_count: 0,
      untreated_count: 0,
    };
  }
  
  const byHeatBand = {};
  let totalScore = 0;
  let highPriorityCount = 0;
  let overdueCount = 0;
  let untreatedCount = 0;
  
  const now = new Date();
  
  risks.forEach((risk) => {
    const assessment = assessRisk(risk);
    const inherent = assessment.inherent_risk;
    
    // Count by heat band
    const heatBandKey = inherent.heat_band_key;
    byHeatBand[heatBandKey] = (byHeatBand[heatBandKey] || 0) + 1;
    
    // Total score
    totalScore += inherent.score;
    
    // High priority (score >= 16)
    if (inherent.score >= 16) {
      highPriorityCount++;
    }
    
    // Overdue
    if (risk.due_date && new Date(risk.due_date) < now) {
      overdueCount++;
    }
    
    // Untreated
    if (risk.status === 'open' || risk.status === 'identified') {
      untreatedCount++;
    }
  });
  
  return {
    total: risks.length,
    by_heat_band: byHeatBand,
    average_score: totalScore / risks.length,
    high_priority_count: highPriorityCount,
    overdue_count: overdueCount,
    untreated_count: untreatedCount,
  };
}

/**
 * Calculate risk appetite compliance
 * 
 * @param {Array<Object>} risks - Array of risks
 * @param {Object} appetite - Risk appetite thresholds
 * @returns {Object} Appetite compliance status
 */
export function calculateRiskAppetiteCompliance(risks, appetite = {}) {
  const {
    max_critical = 0,
    max_high = 5,
    max_medium = 15,
    max_total_score = 200,
  } = appetite;
  
  const metrics = calculateRiskMetrics(risks);
  
  const critical = metrics.by_heat_band.critical || 0;
  const high = metrics.by_heat_band.high || 0;
  const medium = (metrics.by_heat_band['med+'] || 0) + (metrics.by_heat_band['med-'] || 0);
  const totalScore = metrics.average_score * metrics.total;
  
  return {
    within_appetite: critical <= max_critical && high <= max_high && medium <= max_medium && totalScore <= max_total_score,
    critical: { current: critical, max: max_critical, within: critical <= max_critical },
    high: { current: high, max: max_high, within: high <= max_high },
    medium: { current: medium, max: max_medium, within: medium <= max_medium },
    total_score: { current: totalScore, max: max_total_score, within: totalScore <= max_total_score },
  };
}

export default {
  HEAT_BANDS,
  LIKELIHOOD_SCALE,
  IMPACT_SCALE,
  calculateRiskScore,
  getHeatBand,
  getHeatBandKey,
  assessRisk,
  calculateRiskPriority,
  generateRiskHeatMap,
  calculateRiskMetrics,
  calculateRiskAppetiteCompliance,
};
