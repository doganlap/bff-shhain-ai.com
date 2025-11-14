/**
 * Risk Service - Business logic for risk management
 * Handles risk scoring, heat maps, and residual risk tracking
 */

const prisma = require('../../db/prisma');

/**
 * Calculate risk score based on likelihood and impact
 * @param {string} likelihood - High, Medium, Low
 * @param {string} impact - High, Medium, Low
 * @returns {number} Risk score (1-9)
 */
function calculateRiskScore(likelihood, impact) {
  const scoreMap = { Low: 1, Medium: 2, High: 3 };
  const l = scoreMap[likelihood] || 2;
  const i = scoreMap[impact] || 2;
  return l * i; // 1-9 scale
}

/**
 * Determine risk level from score
 * @param {number} score - Risk score (1-9)
 * @returns {string} Risk level (Low, Medium, High, Critical)
 */
function getRiskLevel(score) {
  if (score <= 2) return 'Low';
  if (score <= 4) return 'Medium';
  if (score <= 6) return 'High';
  return 'Critical';
}

/**
 * Calculate residual risk after mitigation
 * @param {Object} risk - Risk object with mitigation_effectiveness
 * @returns {number} Residual risk score
 */
function calculateResidualRisk(risk) {
  const inherentScore = calculateRiskScore(risk.likelihood_level, risk.impact_level);
  const effectiveness = risk.mitigation_effectiveness || 0; // 0-100%
  const reduction = (inherentScore * effectiveness) / 100;
  return Math.max(1, Math.round(inherentScore - reduction));
}

/**
 * Get risk heat map data
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Heat map matrix with counts
 */
async function getRiskHeatMap(tenantId) {
  try {
    const risks = await prisma.grc_risks.findMany({
      where: tenantId ? { tenant_id: tenantId } : {},
      select: {
        likelihood_level: true,
        impact_level: true,
        risk_status: true
      }
    });

    const heatMap = {
      High: { High: 0, Medium: 0, Low: 0 },
      Medium: { High: 0, Medium: 0, Low: 0 },
      Low: { High: 0, Medium: 0, Low: 0 }
    };

    risks.forEach(risk => {
      const likelihood = risk.likelihood_level || 'Medium';
      const impact = risk.impact_level || 'Medium';
      if (heatMap[likelihood] && heatMap[likelihood][impact] !== undefined) {
        heatMap[likelihood][impact]++;
      }
    });

    return {
      matrix: heatMap,
      total: risks.length,
      byStatus: risks.reduce((acc, r) => {
        acc[r.risk_status] = (acc[r.risk_status] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (err) {
    console.error('Error generating risk heat map:', err.message);
    return { matrix: {}, total: 0, byStatus: {} };
  }
}

/**
 * Get top risks by score
 * @param {string} tenantId - Tenant identifier
 * @param {number} limit - Number of risks to return
 * @returns {Promise<Array>} Top risks sorted by score
 */
async function getTopRisks(tenantId, limit = 10) {
  try {
    const risks = await prisma.grc_risks.findMany({
      where: tenantId ? { tenant_id: tenantId } : {},
      take: 100 // Get more to sort and filter
    });

    const scoredRisks = risks.map(risk => ({
      ...risk,
      risk_score: calculateRiskScore(risk.likelihood_level, risk.impact_level),
      risk_level: getRiskLevel(calculateRiskScore(risk.likelihood_level, risk.impact_level))
    }));

    return scoredRisks
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching top risks:', err.message);
    return [];
  }
}

/**
 * Create risk with automatic scoring
 * @param {Object} riskData - Risk data
 * @returns {Promise<Object>} Created risk with score
 */
async function createRiskWithScore(riskData) {
  const score = calculateRiskScore(riskData.likelihood_level, riskData.impact_level);
  const level = getRiskLevel(score);

  return await prisma.grc_risks.create({
    data: {
      ...riskData,
      risk_score: score,
      risk_level: level,
      residual_risk: calculateResidualRisk({ ...riskData, mitigation_effectiveness: 0 })
    }
  });
}

/**
 * Update risk and recalculate scores
 * @param {string} riskId - Risk identifier
 * @param {Object} updates - Updated fields
 * @returns {Promise<Object>} Updated risk
 */
async function updateRiskWithScore(riskId, updates) {
  const current = await prisma.grc_risks.findUnique({ where: { risk_id: riskId } });
  if (!current) throw new Error('Risk not found');

  const likelihood = updates.likelihood_level || current.likelihood_level;
  const impact = updates.impact_level || current.impact_level;
  const score = calculateRiskScore(likelihood, impact);
  const level = getRiskLevel(score);

  const updatedData = {
    ...updates,
    risk_score: score,
    risk_level: level,
    residual_risk: calculateResidualRisk({
      likelihood_level: likelihood,
      impact_level: impact,
      mitigation_effectiveness: updates.mitigation_effectiveness || current.mitigation_effectiveness || 0
    })
  };

  return await prisma.grc_risks.update({
    where: { risk_id: riskId },
    data: updatedData
  });
}

/**
 * Get risk statistics
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} Risk statistics
 */
async function getRiskStats(tenantId) {
  try {
    const risks = await prisma.grc_risks.findMany({
      where: tenantId ? { tenant_id: tenantId } : {}
    });

    const stats = {
      total: risks.length,
      byLevel: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      byStatus: {},
      avgScore: 0,
      criticalCount: 0
    };

    let totalScore = 0;
    risks.forEach(risk => {
      const score = calculateRiskScore(risk.likelihood_level, risk.impact_level);
      const level = getRiskLevel(score);
      stats.byLevel[level]++;
      stats.byStatus[risk.risk_status] = (stats.byStatus[risk.risk_status] || 0) + 1;
      totalScore += score;
      if (level === 'Critical') stats.criticalCount++;
    });

    stats.avgScore = risks.length > 0 ? (totalScore / risks.length).toFixed(2) : 0;

    return stats;
  } catch (err) {
    console.error('Error calculating risk stats:', err.message);
    return { total: 0, byLevel: {}, byStatus: {}, avgScore: 0, criticalCount: 0 };
  }
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  calculateResidualRisk,
  getRiskHeatMap,
  getTopRisks,
  createRiskWithScore,
  updateRiskWithScore,
  getRiskStats
};
