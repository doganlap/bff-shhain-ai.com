/**
 * REPORTING ENGINE
 *
 * Generates comprehensive reports and proposals based on:
 * - Control scoring (0% if no evidence, 20-100% if evidence delivered)
 * - Evidence validation results
 * - Gap analysis
 * - Remediation recommendations
 *
 * All reports reflect the critical rule:
 * - NO evidence = 0% score
 * - Evidence delivered = scored based on maturity level
 */

import { PrismaClient } from '@prisma/client';
import { controlScorer, ControlScore, AssessmentScore, MaturityLevel, MATURITY_SCORES } from './control-scoring-engine';
import { evidenceValidator } from './evidence-validation-engine';

const prisma = new PrismaClient();

// ============================================
// REPORT TYPES
// ============================================

export interface AssessmentReport {
  reportId: string;
  assessmentId: string;
  organizationName: string;
  frameworkName: string;
  reportDate: Date;
  executiveSummary: ExecutiveSummary;
  scoreBreakdown: ScoreBreakdown;
  controlDetails: ControlReportItem[];
  gapAnalysis: GapAnalysisReport;
  complianceStatus: ComplianceStatus;
  recommendations: Recommendation[];
  actionPlan: ActionPlanItem[];
}

export interface ExecutiveSummary {
  overallScore: number; // 0-100%
  complianceLevel: string; // Non-Compliant, Partial, Compliant, Excellent
  totalControls: number;
  implementedControls: number; // Evidence delivered
  notImplementedControls: number; // No evidence
  passedControls: number;
  failedControls: number;
  mandatoryControlsStatus: string; // All passed / Some failed
  criticalIssues: number;
  highIssues: number;
  estimatedRemediationTime: string;
  estimatedRemediationCost: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  mandatoryControlsScore: number;
  criticalControlsScore: number;
  optionalControlsScore: number;
  byMaturityLevel: Record<MaturityLevel, number>; // Count per level
  byCategory: Record<string, number>; // Score by control category
  byDomain: Record<string, number>; // Score by domain
}

export interface ControlReportItem {
  controlId: string;
  controlTitle: string;
  category: string;
  domain: string;
  isMandatory: boolean;
  isCritical: boolean;

  // Evidence status
  evidenceDelivered: boolean; // KEY FIELD
  evidenceCount: number;
  evidenceTypes: string[];

  // Scoring
  score: number; // 0-100%
  maturityLevel: MaturityLevel;
  maturityLabel: string;

  // Status
  status: 'not_implemented' | 'partial' | 'implemented' | 'excellent';
  passed: boolean;

  // Issues
  issues: string[];
  recommendations: string[];
}

export interface GapAnalysisReport {
  totalGaps: number;
  criticalGaps: ControlReportItem[];
  highPriorityGaps: ControlReportItem[];
  mediumPriorityGaps: ControlReportItem[];
  lowPriorityGaps: ControlReportItem[];

  // Gap categories
  noEvidenceGaps: ControlReportItem[]; // 0% score
  insufficientEvidenceGaps: ControlReportItem[]; // < 3 evidence
  qualityIssuesGaps: ControlReportItem[]; // Evidence exists but quality issues

  costEstimate: RemediationCostEstimate;
}

export interface ComplianceStatus {
  overall: 'non_compliant' | 'partial_compliance' | 'compliant' | 'excellent';
  mandatoryControls: 'failed' | 'passed';
  criticalControls: 'failed' | 'passed';
  regulatoryReadiness: boolean; // Can pass audit?
  certificationReadiness: Record<string, boolean>; // Ready for ISO/SOC/etc?
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  affectedControls: string[];
  estimatedEffort: string;
  estimatedCost: string;
  timeline: string;
}

export interface ActionPlanItem {
  phase: number;
  title: string;
  description: string;
  tasks: string[];
  timeline: string;
  dependencies: string[];
  estimatedCost: string;
}

export interface RemediationCostEstimate {
  totalEstimate: string;
  breakdown: {
    documentation: string;
    technicalImplementation: string;
    training: string;
    externalAudits: string;
    tools: string;
  };
}

// ============================================
// REPORTING ENGINE
// ============================================

export class ReportingEngine {

  /**
   * Generate comprehensive assessment report
   */
  async generateAssessmentReport(assessmentId: string): Promise<AssessmentReport> {

    console.log(`\n📊 Generating comprehensive report for assessment ${assessmentId}`);

    // Step 1: Score the assessment
    const assessmentScore = await controlScorer.scoreAssessment(assessmentId);

    // Step 2: Get assessment details
    const assessment = await prisma.assessments.findUnique({
      where: { id: assessmentId },
      include: {
        organizations: true,
        grc_frameworks: true
      }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Step 3: Build report sections
    const executiveSummary = this.buildExecutiveSummary(assessmentScore, assessment);
    const scoreBreakdown = await this.buildScoreBreakdown(assessmentScore, assessmentId);
    const controlDetails = await this.buildControlDetails(assessmentScore);
    const gapAnalysis = this.buildGapAnalysis(controlDetails);
    const complianceStatus = this.determineComplianceStatus(assessmentScore, gapAnalysis);
    const recommendations = this.generateRecommendations(gapAnalysis, controlDetails);
    const actionPlan = this.buildActionPlan(gapAnalysis, recommendations);

    const report: AssessmentReport = {
      reportId: `RPT-${Date.now()}`,
      assessmentId,
      organizationName: assessment.organizations?.name || 'Unknown Organization',
      frameworkName: assessment.grc_frameworks?.name || 'Unknown Framework',
      reportDate: new Date(),
      executiveSummary,
      scoreBreakdown,
      controlDetails,
      gapAnalysis,
      complianceStatus,
      recommendations,
      actionPlan
    };

    console.log(`✅ Report generated successfully`);
    console.log(`   Overall Score: ${report.executiveSummary.overallScore}%`);
    console.log(`   Compliance Level: ${report.executiveSummary.complianceLevel}`);
    console.log(`   Total Gaps: ${report.gapAnalysis.totalGaps}`);

    return report;
  }

  /**
   * Build executive summary
   */
  private buildExecutiveSummary(
    score: AssessmentScore,
    assessment: any
  ): ExecutiveSummary {

    const implementedControls = score.controlScores.filter(c => c.evidenceDelivered).length;
    const notImplementedControls = score.controlScores.filter(c => !c.evidenceDelivered).length;

    const criticalIssues = score.controlScores
      .flatMap(c => c.issues)
      .filter(i => i.severity === 'critical')
      .length;

    const highIssues = score.controlScores
      .flatMap(c => c.issues)
      .filter(i => i.severity === 'high')
      .length;

    const complianceLevel =
      score.overallScore >= 90 ? 'Excellent' :
      score.overallScore >= 70 ? 'Compliant' :
      score.overallScore >= 50 ? 'Partial Compliance' :
      'Non-Compliant';

    const mandatoryPassed = score.controlScores
      .filter(c => c.isMandatory)
      .every(c => c.passed);

    return {
      overallScore: score.overallScore,
      complianceLevel,
      totalControls: score.totalControls,
      implementedControls,
      notImplementedControls,
      passedControls: score.passedControls,
      failedControls: score.failedControls,
      mandatoryControlsStatus: mandatoryPassed ? 'All Passed' : 'Some Failed',
      criticalIssues,
      highIssues,
      estimatedRemediationTime: this.estimateRemediationTime(score.failedControls),
      estimatedRemediationCost: this.estimateRemediationCost(score.failedControls, criticalIssues)
    };
  }

  /**
   * Build detailed score breakdown
   */
  private async buildScoreBreakdown(
    score: AssessmentScore,
    assessmentId: string
  ): Promise<ScoreBreakdown> {

    // Count by maturity level
    const byMaturityLevel: Record<MaturityLevel, number> = {
      [MaturityLevel.NOT_IMPLEMENTED]: 0,
      [MaturityLevel.INITIAL]: 0,
      [MaturityLevel.DEVELOPING]: 0,
      [MaturityLevel.DEFINED]: 0,
      [MaturityLevel.MANAGED]: 0,
      [MaturityLevel.OPTIMIZING]: 0
    };

    for (const control of score.controlScores) {
      byMaturityLevel[control.maturityLevel]++;
    }

    // Calculate optional controls score
    const optionalControls = score.controlScores.filter(c => !c.isMandatory && !c.isCritical);
    const optionalScore = optionalControls.length > 0
      ? Math.round(optionalControls.reduce((sum, c) => sum + c.percentage, 0) / optionalControls.length)
      : 0;

    // Get category breakdown
    const byCategory: Record<string, number> = {};
    const controlsByCategory = await this.groupControlsByCategory(score.controlScores);

    for (const [category, controls] of Object.entries(controlsByCategory)) {
      byCategory[category] = controls.length > 0
        ? Math.round(controls.reduce((sum, c) => sum + c.percentage, 0) / controls.length)
        : 0;
    }

    // Get domain breakdown
    const byDomain: Record<string, number> = {};
    const controlsByDomain = await this.groupControlsByDomain(score.controlScores);

    for (const [domain, controls] of Object.entries(controlsByDomain)) {
      byDomain[domain] = controls.length > 0
        ? Math.round(controls.reduce((sum, c) => sum + c.percentage, 0) / controls.length)
        : 0;
    }

    return {
      overallScore: score.overallScore,
      mandatoryControlsScore: score.mandatoryScore,
      criticalControlsScore: score.criticalScore,
      optionalControlsScore: optionalScore,
      byMaturityLevel,
      byCategory,
      byDomain
    };
  }

  /**
   * Build control details for report
   */
  private async buildControlDetails(score: AssessmentScore): Promise<ControlReportItem[]> {

    const items: ControlReportItem[] = [];

    for (const controlScore of score.controlScores) {
      // Get control details
      const control = await prisma.grc_controls.findUnique({
        where: { id: controlScore.controlId }
      });

      if (!control) continue;

      // Get evidence types
      const evidence = await prisma.assessment_evidence.findMany({
        where: { control_id: controlScore.controlId },
        select: { evidence_type: true }
      });

      const evidenceTypes = [...new Set(evidence.map(e => e.evidence_type))];

      // Determine status
      let status: 'not_implemented' | 'partial' | 'implemented' | 'excellent';
      if (controlScore.percentage === 0) {
        status = 'not_implemented';
      } else if (controlScore.percentage < 60) {
        status = 'partial';
      } else if (controlScore.percentage < 90) {
        status = 'implemented';
      } else {
        status = 'excellent';
      }

      items.push({
        controlId: controlScore.controlId,
        controlTitle: controlScore.controlTitle,
        category: control.category || 'General',
        domain: control.domain || 'General',
        isMandatory: controlScore.isMandatory,
        isCritical: controlScore.isCritical,
        evidenceDelivered: controlScore.evidenceDelivered,
        evidenceCount: controlScore.evidenceCount,
        evidenceTypes,
        score: controlScore.percentage,
        maturityLevel: controlScore.maturityLevel,
        maturityLabel: controlScore.maturityScore.label,
        status,
        passed: controlScore.passed,
        issues: controlScore.issues.map(i => i.message),
        recommendations: controlScore.issues.map(i => i.recommendation)
      });
    }

    return items;
  }

  /**
   * Build gap analysis
   */
  private buildGapAnalysis(controls: ControlReportItem[]): GapAnalysisReport {

    // Identify gaps (controls that failed)
    const gaps = controls.filter(c => !c.passed);

    // Categorize by priority
    const criticalGaps = gaps.filter(c => c.isMandatory || c.isCritical);
    const highPriorityGaps = gaps.filter(c => !c.isMandatory && !c.isCritical && c.score < 40);
    const mediumPriorityGaps = gaps.filter(c => !c.isMandatory && !c.isCritical && c.score >= 40 && c.score < 60);
    const lowPriorityGaps = gaps.filter(c => !c.isMandatory && !c.isCritical && c.score >= 60);

    // Categorize by gap type
    const noEvidenceGaps = gaps.filter(c => !c.evidenceDelivered); // Score 0%
    const insufficientEvidenceGaps = gaps.filter(c => c.evidenceDelivered && c.evidenceCount < 3);
    const qualityIssuesGaps = gaps.filter(c => c.evidenceDelivered && c.evidenceCount >= 3);

    // Cost estimate
    const costEstimate = this.calculateRemediationCost(
      noEvidenceGaps.length,
      insufficientEvidenceGaps.length,
      qualityIssuesGaps.length
    );

    return {
      totalGaps: gaps.length,
      criticalGaps,
      highPriorityGaps,
      mediumPriorityGaps,
      lowPriorityGaps,
      noEvidenceGaps,
      insufficientEvidenceGaps,
      qualityIssuesGaps,
      costEstimate
    };
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(
    score: AssessmentScore,
    gaps: GapAnalysisReport
  ): ComplianceStatus {

    const mandatoryPassed = score.controlScores
      .filter(c => c.isMandatory)
      .every(c => c.passed);

    const criticalPassed = score.controlScores
      .filter(c => c.isCritical)
      .every(c => c.passed);

    let overall: 'non_compliant' | 'partial_compliance' | 'compliant' | 'excellent';
    if (score.overallScore >= 90 && mandatoryPassed && criticalPassed) {
      overall = 'excellent';
    } else if (score.overallScore >= 70 && mandatoryPassed) {
      overall = 'compliant';
    } else if (score.overallScore >= 50) {
      overall = 'partial_compliance';
    } else {
      overall = 'non_compliant';
    }

    const regulatoryReadiness = mandatoryPassed && criticalPassed && gaps.criticalGaps.length === 0;

    return {
      overall,
      mandatoryControls: mandatoryPassed ? 'passed' : 'failed',
      criticalControls: criticalPassed ? 'passed' : 'failed',
      regulatoryReadiness,
      certificationReadiness: {
        'ISO27001': score.overallScore >= 80 && mandatoryPassed,
        'SOC2': score.overallScore >= 75 && criticalPassed,
        'SAMA-CSF': score.mandatoryScore >= 70,
        'NCA-ECC': score.criticalScore >= 80
      }
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    gaps: GapAnalysisReport,
    controls: ControlReportItem[]
  ): Recommendation[] {

    const recommendations: Recommendation[] = [];

    // Critical: No evidence gaps
    if (gaps.noEvidenceGaps.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Evidence Collection',
        title: 'Implement Missing Controls',
        description: `${gaps.noEvidenceGaps.length} controls have no evidence of implementation. These must be implemented immediately.`,
        affectedControls: gaps.noEvidenceGaps.map(c => c.controlId),
        estimatedEffort: `${gaps.noEvidenceGaps.length * 8} hours`,
        estimatedCost: `${gaps.noEvidenceGaps.length * 5000} SAR`,
        timeline: '30 days'
      });
    }

    // High: Insufficient evidence
    if (gaps.insufficientEvidenceGaps.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Evidence Enhancement',
        title: 'Add Additional Evidence',
        description: `${gaps.insufficientEvidenceGaps.length} controls need additional evidence pieces (minimum 3 required).`,
        affectedControls: gaps.insufficientEvidenceGaps.map(c => c.controlId),
        estimatedEffort: `${gaps.insufficientEvidenceGaps.length * 4} hours`,
        estimatedCost: `${gaps.insufficientEvidenceGaps.length * 2000} SAR`,
        timeline: '14 days'
      });
    }

    // Medium: Quality issues
    if (gaps.qualityIssuesGaps.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Evidence Quality',
        title: 'Improve Evidence Quality',
        description: `${gaps.qualityIssuesGaps.length} controls have evidence quality issues that need to be addressed.`,
        affectedControls: gaps.qualityIssuesGaps.map(c => c.controlId),
        estimatedEffort: `${gaps.qualityIssuesGaps.length * 2} hours`,
        estimatedCost: `${gaps.qualityIssuesGaps.length * 1000} SAR`,
        timeline: '21 days'
      });
    }

    return recommendations;
  }

  /**
   * Build action plan
   */
  private buildActionPlan(
    gaps: GapAnalysisReport,
    recommendations: Recommendation[]
  ): ActionPlanItem[] {

    const plan: ActionPlanItem[] = [];

    // Phase 1: Critical gaps
    if (gaps.criticalGaps.length > 0) {
      plan.push({
        phase: 1,
        title: 'Address Critical Gaps',
        description: 'Implement mandatory and critical controls immediately',
        tasks: [
          'Review all mandatory control requirements',
          'Collect minimum 3 evidence pieces per control',
          'Validate evidence from trusted sources',
          'Conduct internal review'
        ],
        timeline: '30 days',
        dependencies: [],
        estimatedCost: gaps.costEstimate.breakdown.documentation
      });
    }

    // Phase 2: High priority gaps
    if (gaps.highPriorityGaps.length > 0) {
      plan.push({
        phase: 2,
        title: 'Resolve High Priority Issues',
        description: 'Address high-priority control gaps',
        tasks: [
          'Enhance existing controls',
          'Add missing evidence types',
          'Conduct technical implementations',
          'External audit where required'
        ],
        timeline: '45 days',
        dependencies: ['Phase 1'],
        estimatedCost: gaps.costEstimate.breakdown.technicalImplementation
      });
    }

    // Phase 3: Medium/Low priority
    if (gaps.mediumPriorityGaps.length > 0 || gaps.lowPriorityGaps.length > 0) {
      plan.push({
        phase: 3,
        title: 'Continuous Improvement',
        description: 'Optimize remaining controls and achieve excellence',
        tasks: [
          'Improve evidence quality',
          'Implement automation',
          'Conduct training programs',
          'Prepare for certification audits'
        ],
        timeline: '90 days',
        dependencies: ['Phase 2'],
        estimatedCost: gaps.costEstimate.breakdown.training
      });
    }

    return plan;
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  private async groupControlsByCategory(controls: ControlScore[]): Promise<Record<string, ControlScore[]>> {
    const grouped: Record<string, ControlScore[]> = {};

    for (const control of controls) {
      const dbControl = await prisma.grc_controls.findUnique({
        where: { id: control.controlId },
        select: { category: true }
      });

      const category = dbControl?.category || 'General';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(control);
    }

    return grouped;
  }

  private async groupControlsByDomain(controls: ControlScore[]): Promise<Record<string, ControlScore[]>> {
    const grouped: Record<string, ControlScore[]> = {};

    for (const control of controls) {
      const dbControl = await prisma.grc_controls.findUnique({
        where: { id: control.controlId },
        select: { domain: true }
      });

      const domain = dbControl?.domain || 'General';
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(control);
    }

    return grouped;
  }

  private estimateRemediationTime(failedControls: number): string {
    const days = failedControls * 2;
    return days < 30 ? `${days} days` : `${Math.ceil(days / 30)} months`;
  }

  private estimateRemediationCost(failedControls: number, criticalIssues: number): string {
    const baseCost = failedControls * 3000;
    const criticalCost = criticalIssues * 5000;
    const total = baseCost + criticalCost;
    return `${total.toLocaleString()} SAR`;
  }

  private calculateRemediationCost(
    noEvidence: number,
    insufficient: number,
    qualityIssues: number
  ): RemediationCostEstimate {

    const documentation = noEvidence * 5000;
    const technical = noEvidence * 10000;
    const training = (noEvidence + insufficient) * 2000;
    const audits = Math.ceil(noEvidence / 10) * 50000;
    const tools = (noEvidence + insufficient) * 1000;
    const total = documentation + technical + training + audits + tools;

    return {
      totalEstimate: `${total.toLocaleString()} SAR`,
      breakdown: {
        documentation: `${documentation.toLocaleString()} SAR`,
        technicalImplementation: `${technical.toLocaleString()} SAR`,
        training: `${training.toLocaleString()} SAR`,
        externalAudits: `${audits.toLocaleString()} SAR`,
        tools: `${tools.toLocaleString()} SAR`
      }
    };
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const reportingEngine = new ReportingEngine();
