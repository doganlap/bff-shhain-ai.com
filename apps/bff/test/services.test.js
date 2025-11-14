/**
 * BFF Service Test Suite
 * Comprehensive tests for all service layer business logic
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// Import services
const riskService = require('../src/services/risk.service');
const complianceService = require('../src/services/compliance.service');
const assessmentService = require('../src/services/assessment.service');

describe('Risk Service Tests', () => {
  test('calculateRiskScore should return correct score', () => {
    expect(riskService.calculateRiskScore('High', 'High')).toBe(9);
    expect(riskService.calculateRiskScore('Medium', 'Medium')).toBe(4);
    expect(riskService.calculateRiskScore('Low', 'Low')).toBe(1);
    expect(riskService.calculateRiskScore('High', 'Low')).toBe(3);
  });

  test('getRiskLevel should categorize scores correctly', () => {
    expect(riskService.getRiskLevel(1)).toBe('Low');
    expect(riskService.getRiskLevel(2)).toBe('Low');
    expect(riskService.getRiskLevel(3)).toBe('Medium');
    expect(riskService.getRiskLevel(4)).toBe('Medium');
    expect(riskService.getRiskLevel(5)).toBe('High');
    expect(riskService.getRiskLevel(6)).toBe('High');
    expect(riskService.getRiskLevel(7)).toBe('Critical');
    expect(riskService.getRiskLevel(9)).toBe('Critical');
  });

  test('calculateResidualRisk should reduce risk by mitigation', () => {
    const risk = {
      likelihood_level: 'High',
      impact_level: 'High',
      mitigation_effectiveness: 50 // 50% reduction
    };
    const residual = riskService.calculateResidualRisk(risk);
    expect(residual).toBeLessThan(9); // Original score is 9
    expect(residual).toBeGreaterThanOrEqual(1); // Minimum is 1
  });

  test('calculateResidualRisk with no mitigation should return same as inherent', () => {
    const risk = {
      likelihood_level: 'Medium',
      impact_level: 'High',
      mitigation_effectiveness: 0
    };
    const residual = riskService.calculateResidualRisk(risk);
    const inherent = riskService.calculateRiskScore('Medium', 'High');
    expect(residual).toBe(inherent);
  });
});

describe('Compliance Service Tests', () => {
  test('getComplianceLevel should categorize scores correctly', () => {
    expect(complianceService.getComplianceLevel(95)).toBe('Excellent');
    expect(complianceService.getComplianceLevel(85)).toBe('Good');
    expect(complianceService.getComplianceLevel(60)).toBe('Needs Improvement');
    expect(complianceService.getComplianceLevel(30)).toBe('Critical');
  });

  test('calculateGapPriority should prioritize correctly', () => {
    const criticalGap = {
      compliance_level: 3,
      next_review_date: new Date(Date.now() - 86400000) // Yesterday
    };
    expect(complianceService.calculateGapPriority(criticalGap)).toBe('Critical');

    const highGap = {
      compliance_level: 2,
      next_review_date: new Date(Date.now() + 86400000) // Tomorrow
    };
    expect(complianceService.calculateGapPriority(highGap)).toBe('High');

    const lowGap = {
      compliance_level: 0,
      next_review_date: new Date(Date.now() + 86400000)
    };
    expect(complianceService.calculateGapPriority(lowGap)).toBe('Low');
  });
});

describe('Assessment Service Tests', () => {
  test('calculateProgress should handle different formats', () => {
    expect(assessmentService.calculateProgress({ progress: 50 })).toBe(50);
    expect(assessmentService.calculateProgress({ progress: 120 })).toBe(100); // Cap at 100
    expect(assessmentService.calculateProgress({ progress: -10 })).toBe(0); // Floor at 0

    const stepsAssessment = {
      steps_completed: 3,
      total_steps: 10
    };
    expect(assessmentService.calculateProgress(stepsAssessment)).toBe(30);
  });

  test('isOverdue should detect overdue assessments', () => {
    const overdueAssessment = {
      due_date: new Date(Date.now() - 86400000), // Yesterday
      status: 'in_progress'
    };
    expect(assessmentService.isOverdue(overdueAssessment)).toBe(true);

    const futureAssessment = {
      due_date: new Date(Date.now() + 86400000), // Tomorrow
      status: 'in_progress'
    };
    expect(assessmentService.isOverdue(futureAssessment)).toBe(false);

    const completedOverdue = {
      due_date: new Date(Date.now() - 86400000),
      status: 'completed'
    };
    expect(assessmentService.isOverdue(completedOverdue)).toBe(false);
  });

  test('getDaysUntilDue should calculate correctly', () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const assessment = { due_date: tomorrow };
    const days = assessmentService.getDaysUntilDue(assessment);
    expect(days).toBe(1);

    const yesterday = new Date(Date.now() - 86400000);
    const overdueAssessment = { due_date: yesterday };
    const overdueDays = assessmentService.getDaysUntilDue(overdueAssessment);
    expect(overdueDays).toBe(-1);
  });

  test('ASSESSMENT_STATES should be defined', () => {
    expect(assessmentService.ASSESSMENT_STATES.NOT_STARTED).toBe('not_started');
    expect(assessmentService.ASSESSMENT_STATES.IN_PROGRESS).toBe('in_progress');
    expect(assessmentService.ASSESSMENT_STATES.COMPLETED).toBe('completed');
  });
});

describe('Integration Tests (Mock Data)', () => {
  test('Risk and Compliance integration', () => {
    // Test workflow: High risk should trigger compliance review
    const riskScore = riskService.calculateRiskScore('High', 'High');
    const riskLevel = riskService.getRiskLevel(riskScore);

    expect(riskLevel).toBe('Critical');

    // Critical risk should require immediate compliance check
    const gapPriority = complianceService.calculateGapPriority({
      compliance_level: 3,
      next_review_date: new Date()
    });

    expect(gapPriority).toBe('Critical');
  });

  test('Assessment and Compliance workflow', () => {
    // Low compliance should trigger assessment
    const complianceLevel = complianceService.getComplianceLevel(40);
    expect(complianceLevel).toBe('Critical');

    // Create mock assessment for remediation
    const mockAssessment = {
      progress: 0,
      status: 'not_started',
      due_date: new Date(Date.now() + 7 * 86400000) // 7 days
    };

    expect(assessmentService.isOverdue(mockAssessment)).toBe(false);
    expect(assessmentService.getDaysUntilDue(mockAssessment)).toBe(7);
  });
});

describe('Performance Tests', () => {
  test('Risk calculation should be fast', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      riskService.calculateRiskScore('High', 'Medium');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });

  test('Compliance level calculation should be fast', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      complianceService.getComplianceLevel(75);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });
});

console.log('✅ All service tests configured');
