/**
 * CONTROL SCORING ENGINE
 *
 * CRITICAL SCORING RULES:
 * ========================
 *
 * EVIDENCE DELIVERY STATUS:
 * - NO evidence delivered = Score 0 (Not Implemented)
 * - Evidence delivered = Score based on maturity level (1-5)
 *
 * MATURITY LEVELS (when evidence EXISTS):
 * - Level 0: Not Implemented = 0% (no evidence)
 * - Level 1: Initial/Ad-hoc = 20% (evidence exists but minimal)
 * - Level 2: Developing = 40% (some documentation)
 * - Level 3: Defined = 60% (well documented)
 * - Level 4: Managed = 80% (monitored and measured)
 * - Level 5: Optimizing = 100% (continuous improvement)
 *
 * EVIDENCE VALIDATION IMPACT:
 * - Evidence quality affects maturity level assessment
 * - Insufficient evidence (< 3 pieces) = Maximum Level 2 (40%)
 * - Missing required types = Maximum Level 3 (60%)
 * - Missing trusted sources = Cannot achieve Level 4+ (80-100%)
 *
 * MANDATORY CONTROLS:
 * - Must have evidence to be considered implemented
 * - Must achieve minimum Level 3 (60%) to pass
 * - Must have 3+ evidence pieces from trusted sources
 *
 * This engine integrates with:
 * - Evidence Validation Engine (validates quality)
 * - Assessment Template Generator (sets requirements)
 * - Reporting Engine (calculates final scores)
 */

import { PrismaClient } from '@prisma/client';
import { evidenceValidator } from './evidence-validation-engine';

const prisma = new PrismaClient();

// ============================================
// SCORING LEVELS
// ============================================

export enum MaturityLevel {
  NOT_IMPLEMENTED = 0,    // 0% - No evidence
  INITIAL = 1,            // 20% - Ad-hoc, minimal evidence
  DEVELOPING = 2,         // 40% - Some documentation
  DEFINED = 3,            // 60% - Well documented
  MANAGED = 4,            // 80% - Monitored & measured
  OPTIMIZING = 5          // 100% - Continuous improvement
}

export interface MaturityScore {
  level: MaturityLevel;
  percentage: number;
  label: string;
  description: string;
}

export const MATURITY_SCORES: Record<MaturityLevel, MaturityScore> = {
  [MaturityLevel.NOT_IMPLEMENTED]: {
    level: MaturityLevel.NOT_IMPLEMENTED,
    percentage: 0,
    label: 'Not Implemented',
    description: 'No evidence of implementation. Control does not exist.'
  },
  [MaturityLevel.INITIAL]: {
    level: MaturityLevel.INITIAL,
    percentage: 20,
    label: 'Initial/Ad-hoc',
    description: 'Minimal evidence. Implementation is ad-hoc and undocumented.'
  },
  [MaturityLevel.DEVELOPING]: {
    level: MaturityLevel.DEVELOPING,
    percentage: 40,
    label: 'Developing/Repeatable',
    description: 'Some documentation exists. Processes are developing but not consistent.'
  },
  [MaturityLevel.DEFINED]: {
    level: MaturityLevel.DEFINED,
    percentage: 60,
    label: 'Defined/Consistent',
    description: 'Well documented and consistently implemented across organization.'
  },
  [MaturityLevel.MANAGED]: {
    level: MaturityLevel.MANAGED,
    percentage: 80,
    label: 'Managed/Measured',
    description: 'Actively managed, measured, and monitored with metrics.'
  },
  [MaturityLevel.OPTIMIZING]: {
    level: MaturityLevel.OPTIMIZING,
    percentage: 100,
    label: 'Optimizing/Excellence',
    description: 'Continuously improved through automation and best practices.'
  }
};

// ============================================
// CONTROL SCORING ENGINE
// ============================================

export class ControlScoringEngine {

  /**
   * MAIN SCORING FUNCTION
   *
   * Logic:
   * 1. Check if evidence exists
   *    - NO evidence = Score 0 (Level 0: Not Implemented)
   *    - Evidence exists = Calculate maturity level
   *
   * 2. Validate evidence quality
   *    - Run evidence validation checks
   *    - Determine maximum achievable maturity level
   *
   * 3. Assess implementation maturity
   *    - Based on evidence quality and implementation depth
   *    - Apply constraints from validation results
   *
   * 4. Calculate final score
   *    - Convert maturity level to percentage
   *    - Apply risk multipliers for critical controls
   */
  async scoreControl(
    assessmentId: string,
    controlId: string,
    assessorMaturityLevel?: MaturityLevel // Manual assessment by auditor
  ): Promise<ControlScore> {

    console.log(`\n📊 Scoring control ${controlId} for assessment ${assessmentId}`);

    // Step 1: Get control details
    const control = await prisma.grc_controls.findUnique({
      where: { id: controlId }
    });

    if (!control) {
      throw new Error(`Control ${controlId} not found`);
    }

    const isMandatory = control.implementation_status === 'mandatory';
    const isCritical = control.risk_level === 'critical';

    // Step 2: Check evidence existence
    const evidence = await prisma.assessment_evidence.findMany({
      where: {
        assessment_id: assessmentId,
        control_id: controlId
      }
    });

    console.log(`   Evidence count: ${evidence.length}`);

    // CRITICAL RULE: No evidence = Score 0
    if (evidence.length === 0) {
      console.log(`   ⚠️  NO EVIDENCE DELIVERED → Score = 0%`);

      return {
        controlId,
        controlTitle: control.title || control.title_ar || 'Unknown',
        isMandatory,
        isCritical,
        evidenceCount: 0,
        evidenceDelivered: false,
        maturityLevel: MaturityLevel.NOT_IMPLEMENTED,
        maturityScore: MATURITY_SCORES[MaturityLevel.NOT_IMPLEMENTED],
        percentage: 0,
        maxAchievableLevel: MaturityLevel.NOT_IMPLEMENTED,
        constraintReason: 'No evidence provided',
        validationScore: 0,
        issues: [{
          severity: isMandatory ? 'critical' : 'high',
          message: 'No evidence delivered for this control',
          recommendation: 'Upload minimum 3 pieces of evidence from different types'
        }],
        passed: false,
        assessmentDate: new Date()
      };
    }

    // Step 3: Evidence delivered - Validate quality
    console.log(`   ✅ EVIDENCE DELIVERED → Validating quality...`);

    const validationResult = await evidenceValidator.validateEvidence(
      assessmentId,
      controlId
    );

    console.log(`   Validation score: ${validationResult.score}/100`);

    // Step 4: Determine maximum achievable maturity level based on evidence
    const maxLevel = this.calculateMaxAchievableLevel(
      evidence.length,
      validationResult,
      isMandatory,
      isCritical
    );

    console.log(`   Max achievable level: ${maxLevel} (${MATURITY_SCORES[maxLevel].label})`);

    // Step 5: Determine actual maturity level
    let actualLevel: MaturityLevel;

    if (assessorMaturityLevel !== undefined) {
      // Manual assessment provided by auditor
      actualLevel = Math.min(assessorMaturityLevel, maxLevel) as MaturityLevel;
      console.log(`   Assessor rated: ${assessorMaturityLevel} → Constrained to: ${actualLevel}`);
    } else {
      // Auto-calculate based on evidence quality
      actualLevel = this.autoCalculateMaturityLevel(
        evidence.length,
        validationResult,
        maxLevel
      );
      console.log(`   Auto-calculated level: ${actualLevel}`);
    }

    // Step 6: Calculate final score
    const maturityScore = MATURITY_SCORES[actualLevel];
    const percentage = maturityScore.percentage;

    // Step 7: Determine pass/fail
    const passed = this.determinePassStatus(
      actualLevel,
      isMandatory,
      isCritical,
      validationResult
    );

    console.log(`   Final score: ${percentage}% (${maturityScore.label}) - ${passed ? '✅ PASSED' : '❌ FAILED'}`);

    // Step 8: Build result
    return {
      controlId,
      controlTitle: control.title || control.title_ar || 'Unknown',
      isMandatory,
      isCritical,
      evidenceCount: evidence.length,
      evidenceDelivered: true,
      maturityLevel: actualLevel,
      maturityScore,
      percentage,
      maxAchievableLevel: maxLevel,
      constraintReason: maxLevel < MaturityLevel.OPTIMIZING
        ? this.getConstraintReason(evidence.length, validationResult)
        : undefined,
      validationScore: validationResult.score,
      issues: validationResult.issues,
      passed,
      assessmentDate: new Date()
    };
  }

  /**
   * Calculate maximum achievable maturity level based on evidence quality
   *
   * Rules:
   * - < 3 evidence = Max Level 2 (40%)
   * - Missing required types = Max Level 3 (60%)
   * - Missing trusted sources = Max Level 3 (60%)
   * - Critical issues = Max Level 2 (40%)
   * - Insufficient diversity = Max Level 3 (60%)
   */
  private calculateMaxAchievableLevel(
    evidenceCount: number,
    validation: any,
    isMandatory: boolean,
    isCritical: boolean
  ): MaturityLevel {

    // Critical validation issues = Max Level 2
    const hasCriticalIssues = validation.issues.some(
      (i: any) => i.severity === 'critical'
    );
    if (hasCriticalIssues) {
      return MaturityLevel.DEVELOPING; // 40%
    }

    // Insufficient evidence count = Max Level 2
    if (evidenceCount < 3) {
      return MaturityLevel.DEVELOPING; // 40%
    }

    // Check for high severity issues
    const hasHighIssues = validation.issues.some(
      (i: any) => i.severity === 'high'
    );

    // Missing required types or trusted sources = Max Level 3
    if (hasHighIssues) {
      return MaturityLevel.DEFINED; // 60%
    }

    // Medium issues = Max Level 4
    const hasMediumIssues = validation.issues.some(
      (i: any) => i.severity === 'medium'
    );
    if (hasMediumIssues) {
      return MaturityLevel.MANAGED; // 80%
    }

    // Excellent evidence = Can achieve Level 5
    if (validation.score >= 90 && evidenceCount >= 5) {
      return MaturityLevel.OPTIMIZING; // 100%
    }

    // Good evidence = Max Level 4
    return MaturityLevel.MANAGED; // 80%
  }

  /**
   * Auto-calculate maturity level based on evidence quality
   * (when assessor doesn't provide manual rating)
   */
  private autoCalculateMaturityLevel(
    evidenceCount: number,
    validation: any,
    maxLevel: MaturityLevel
  ): MaturityLevel {

    // Start with max achievable level
    let level = maxLevel;

    // Validation score affects level
    if (validation.score < 50) {
      level = Math.min(level, MaturityLevel.INITIAL); // 20%
    } else if (validation.score < 60) {
      level = Math.min(level, MaturityLevel.DEVELOPING); // 40%
    } else if (validation.score < 75) {
      level = Math.min(level, MaturityLevel.DEFINED); // 60%
    } else if (validation.score < 85) {
      level = Math.min(level, MaturityLevel.MANAGED); // 80%
    }
    // >= 85 can achieve OPTIMIZING if max allows

    return level as MaturityLevel;
  }

  /**
   * Determine pass/fail status
   *
   * Rules:
   * - Mandatory controls: Must achieve Level 3+ (60%)
   * - Critical controls: Must achieve Level 3+ (60%)
   * - Regular controls: Must achieve Level 2+ (40%)
   * - Must have no critical validation issues
   */
  private determinePassStatus(
    level: MaturityLevel,
    isMandatory: boolean,
    isCritical: boolean,
    validation: any
  ): boolean {

    // Critical validation issues = Always fail
    const hasCriticalIssues = validation.issues.some(
      (i: any) => i.severity === 'critical'
    );
    if (hasCriticalIssues) {
      return false;
    }

    // Mandatory or critical controls require Level 3+ (60%)
    if (isMandatory || isCritical) {
      return level >= MaturityLevel.DEFINED; // 60%
    }

    // Regular controls require Level 2+ (40%)
    return level >= MaturityLevel.DEVELOPING; // 40%
  }

  /**
   * Get human-readable constraint reason
   */
  private getConstraintReason(
    evidenceCount: number,
    validation: any
  ): string {

    const criticalIssues = validation.issues.filter(
      (i: any) => i.severity === 'critical'
    );
    if (criticalIssues.length > 0) {
      return `Critical issues: ${criticalIssues.map((i: any) => i.message).join(', ')}`;
    }

    if (evidenceCount < 3) {
      return `Insufficient evidence (${evidenceCount}/3 minimum required)`;
    }

    const highIssues = validation.issues.filter(
      (i: any) => i.severity === 'high'
    );
    if (highIssues.length > 0) {
      return `High priority issues: ${highIssues.map((i: any) => i.message).join(', ')}`;
    }

    const mediumIssues = validation.issues.filter(
      (i: any) => i.severity === 'medium'
    );
    if (mediumIssues.length > 0) {
      return `Medium priority issues: ${mediumIssues.map((i: any) => i.message).join(', ')}`;
    }

    return 'Evidence quality limits maximum achievable maturity level';
  }

  /**
   * Score entire assessment
   */
  async scoreAssessment(assessmentId: string): Promise<AssessmentScore> {

    console.log(`\n🎯 Scoring assessment ${assessmentId}`);

    // Get all assessment controls
    const assessmentControls = await prisma.assessment_controls.findMany({
      where: { assessment_id: assessmentId },
      include: {
        grc_controls: true
      }
    });

    console.log(`   Total controls: ${assessmentControls.length}`);

    const controlScores: ControlScore[] = [];
    let totalScore = 0;
    let mandatoryScore = 0;
    let criticalScore = 0;
    let mandatoryCount = 0;
    let criticalCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    // Score each control
    for (const ac of assessmentControls) {
      const score = await this.scoreControl(
        assessmentId,
        ac.control_id,
        ac.maturity_level as MaturityLevel | undefined
      );

      controlScores.push(score);
      totalScore += score.percentage;

      if (score.isMandatory) {
        mandatoryScore += score.percentage;
        mandatoryCount++;
      }

      if (score.isCritical) {
        criticalScore += score.percentage;
        criticalCount++;
      }

      if (score.passed) {
        passedCount++;
      } else {
        failedCount++;
      }
    }

    // Calculate averages
    const averageScore = assessmentControls.length > 0
      ? Math.round(totalScore / assessmentControls.length)
      : 0;

    const mandatoryAverage = mandatoryCount > 0
      ? Math.round(mandatoryScore / mandatoryCount)
      : 0;

    const criticalAverage = criticalCount > 0
      ? Math.round(criticalScore / criticalCount)
      : 0;

    // Determine overall status
    const allMandatoryPassed = controlScores
      .filter(s => s.isMandatory)
      .every(s => s.passed);

    const overallStatus = allMandatoryPassed && failedCount === 0
      ? 'passed'
      : allMandatoryPassed
      ? 'partial'
      : 'failed';

    console.log(`\n   📈 Assessment Results:`);
    console.log(`      Overall Score: ${averageScore}%`);
    console.log(`      Mandatory Controls: ${mandatoryAverage}% (${mandatoryCount} controls)`);
    console.log(`      Critical Controls: ${criticalAverage}% (${criticalCount} controls)`);
    console.log(`      Status: ${overallStatus.toUpperCase()}`);
    console.log(`      Passed: ${passedCount} | Failed: ${failedCount}`);

    return {
      assessmentId,
      totalControls: assessmentControls.length,
      controlScores,
      overallScore: averageScore,
      mandatoryScore: mandatoryAverage,
      criticalScore: criticalAverage,
      passedControls: passedCount,
      failedControls: failedCount,
      mandatoryControls: mandatoryCount,
      criticalControls: criticalCount,
      status: overallStatus,
      assessmentDate: new Date()
    };
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ControlScore {
  controlId: string;
  controlTitle: string;
  isMandatory: boolean;
  isCritical: boolean;
  evidenceCount: number;
  evidenceDelivered: boolean; // KEY: true if evidence exists, false if not
  maturityLevel: MaturityLevel;
  maturityScore: MaturityScore;
  percentage: number; // 0-100%
  maxAchievableLevel: MaturityLevel;
  constraintReason?: string;
  validationScore: number;
  issues: any[];
  passed: boolean;
  assessmentDate: Date;
}

export interface AssessmentScore {
  assessmentId: string;
  totalControls: number;
  controlScores: ControlScore[];
  overallScore: number; // 0-100%
  mandatoryScore: number; // 0-100%
  criticalScore: number; // 0-100%
  passedControls: number;
  failedControls: number;
  mandatoryControls: number;
  criticalControls: number;
  status: 'passed' | 'partial' | 'failed';
  assessmentDate: Date;
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const controlScorer = new ControlScoringEngine();
