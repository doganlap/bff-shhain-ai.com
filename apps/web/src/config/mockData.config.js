/**
 * Government-Grade Mock Data Configuration
 * Centralized mock data generation for development and testing
 */

export const MOCK_DATA_CONFIG = {
  // KPI Ranges
  KPI_RANGES: {
    COMPLIANCE: { min: 80, max: 100 },
    RISKS: { min: 5, max: 15 },
    ASSESSMENTS: { min: 2, max: 7 },
    GAPS: { min: 0, max: 25 },
    HOTSPOTS: { min: 0, max: 12 }
  },
  
  // Heatmap Configuration
  HEATMAP: {
    FRAMEWORKS: ['ISO 27001', 'NIST', 'SOC 2', 'GDPR', 'SAMA'],
    STATUSES: ['Compliant', 'Partial', 'Non-Compliant', 'Not Assessed'],
    VALUE_RANGE: { min: 10, max: 60 }
  },
  
  // Activity Feed Configuration
  ACTIVITIES: {
    TYPES: ['assessment', 'risk', 'control', 'compliance'],
    ACTIONS: ['completed', 'identified', 'updated', 'reviewed', 'started'],
    USERS: ['أحمد محمد', 'سارة أحمد', 'محمد علي', 'فاطمة حسن', 'عبدالله خالد'],
    TIME_RANGES: ['2 hours ago', '4 hours ago', '6 hours ago', '8 hours ago', '1 day ago'],
    STATUSES: ['success', 'warning', 'info']
  },
  
  // Trend Data Configuration
  TREND_DATA: {
    DAYS: 30,
    VARIATION: 20,
    BASELINE_COMPLIANCE: 85,
    BASELINE_RISKS: 8,
    BASELINE_ASSESSMENTS: 4
  }
};

// Mock Data Generators
export const generateRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockTrendData = () => {
  const data = [];
  for (let i = MOCK_DATA_CONFIG.TREND_DATA.DAYS; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      compliance: generateRandomValue(
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_COMPLIANCE - MOCK_DATA_CONFIG.TREND_DATA.VARIATION / 2,
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_COMPLIANCE + MOCK_DATA_CONFIG.TREND_DATA.VARIATION / 2
      ),
      risks: generateRandomValue(
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_RISKS - 2,
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_RISKS + 2
      ),
      assessments: generateRandomValue(
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_ASSESSMENTS - 1,
        MOCK_DATA_CONFIG.TREND_DATA.BASELINE_ASSESSMENTS + 1
      )
    });
  }
  return data;
};

export const generateMockHeatmapData = () => {
  const data = [];
  MOCK_DATA_CONFIG.HEATMAP.FRAMEWORKS.forEach((framework, i) => {
    MOCK_DATA_CONFIG.HEATMAP.STATUSES.forEach((status, j) => {
      data.push({
        framework,
        status,
        value: generateRandomValue(MOCK_DATA_CONFIG.HEATMAP.VALUE_RANGE.min, MOCK_DATA_CONFIG.HEATMAP.VALUE_RANGE.max),
        x: i,
        y: j
      });
    });
  });
  return data;
};

export const generateMockActivityFeed = () => {
  const activities = [];
  const config = MOCK_DATA_CONFIG.ACTIVITIES;
  
  for (let i = 0; i < 5; i++) {
    activities.push({
      type: config.TYPES[i % config.TYPES.length],
      action: config.ACTIONS[i % config.ACTIONS.length],
      item: `${config.TYPES[i % config.TYPES.length]} ${config.ACTIONS[i % config.ACTIONS.length]}`,
      user: config.USERS[i % config.USERS.length],
      time: config.TIME_RANGES[i % config.TIME_RANGES.length],
      status: config.STATUSES[i % config.STATUSES.length]
    });
  }
  return activities;
};

export const generateMockKPIs = (complianceData = [], riskData = [], assessmentData = []) => {
  const complianceScore = complianceData.length > 0 ? 
    Math.floor(complianceData.reduce((sum, item) => sum + (item.score || 80), 0) / complianceData.length) :
    generateRandomValue(MOCK_DATA_CONFIG.KPI_RANGES.COMPLIANCE.min, MOCK_DATA_CONFIG.KPI_RANGES.COMPLIANCE.max);
  
  const riskCount = riskData.length > 0 ? riskData.length : generateRandomValue(MOCK_DATA_CONFIG.KPI_RANGES.RISKS.min, MOCK_DATA_CONFIG.KPI_RANGES.RISKS.max);
  const assessmentCount = assessmentData.length > 0 ? assessmentData.length : generateRandomValue(MOCK_DATA_CONFIG.KPI_RANGES.ASSESSMENTS.min, MOCK_DATA_CONFIG.KPI_RANGES.ASSESSMENTS.max);
  const gapsCount = generateRandomValue(MOCK_DATA_CONFIG.KPI_RANGES.GAPS.min, MOCK_DATA_CONFIG.KPI_RANGES.GAPS.max);
  const hotspotsCount = generateRandomValue(MOCK_DATA_CONFIG.KPI_RANGES.HOTSPOTS.min, MOCK_DATA_CONFIG.KPI_RANGES.HOTSPOTS.max);
  
  return {
    compliance: {
      value: `${complianceScore}%`,
      trend: complianceScore >= 90 ? 'up' : complianceScore >= 70 ? 'neutral' : 'down',
      delta: complianceScore >= 90 ? '+5%' : complianceScore >= 70 ? '+0%' : '-3%',
      status: complianceScore >= 90 ? 'success' : complianceScore >= 70 ? 'warning' : 'danger'
    },
    openGaps: {
      value: gapsCount,
      trend: gapsCount <= 5 ? 'up' : 'down',
      delta: gapsCount <= 5 ? `-${gapsCount}` : `+${gapsCount - 8}`,
      status: gapsCount <= 5 ? 'success' : gapsCount <= 15 ? 'warning' : 'danger'
    },
    riskHotspots: {
      value: hotspotsCount,
      trend: hotspotsCount <= 3 ? 'up' : 'down',
      delta: hotspotsCount <= 3 ? '0' : `+${hotspotsCount - 3}`,
      status: hotspotsCount <= 3 ? 'success' : hotspotsCount <= 8 ? 'warning' : 'danger'
    },
    activeAssessments: {
      value: assessmentCount,
      trend: 'up',
      delta: '+2',
      status: 'info'
    }
  };
};

export default {
  MOCK_DATA_CONFIG,
  generateRandomValue,
  generateMockTrendData,
  generateMockHeatmapData,
  generateMockActivityFeed,
  generateMockKPIs
};