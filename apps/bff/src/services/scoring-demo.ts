/**
 * SCORING SYSTEM DEMO
 *
 * Demonstrates the critical scoring rules:
 * ========================================
 *
 * RULE 1: NO EVIDENCE = 0% SCORE
 * - If control has no evidence delivered
 * - Score = 0% (Level 0: Not Implemented)
 * - Status = FAILED
 *
 * RULE 2: EVIDENCE DELIVERED = SCORED BY MATURITY
 * - If evidence exists
 * - Score = 20-100% based on maturity level
 * - Level 1 (Initial) = 20%
 * - Level 2 (Developing) = 40%
 * - Level 3 (Defined) = 60%
 * - Level 4 (Managed) = 80%
 * - Level 5 (Optimizing) = 100%
 *
 * RULE 3: EVIDENCE QUALITY LIMITS MAX SCORE
 * - < 3 evidence pieces = Max 40% (Level 2)
 * - Missing required types = Max 60% (Level 3)
 * - Missing trusted sources = Max 60% (Level 3)
 * - Excellent evidence = Can reach 100% (Level 5)
 *
 * RULE 4: MANDATORY CONTROLS STRICTER
 * - Must have 3+ evidence pieces
 * - Must achieve 60%+ to pass
 * - Must pass to achieve compliance
 */

import { controlScorer, MaturityLevel } from './control-scoring-engine';
import { evidenceValidator } from './evidence-validation-engine';
import { reportingEngine } from './reporting-engine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// EXAMPLE 1: CONTROL WITH NO EVIDENCE
// ============================================

export async function example_NoEvidence_Score0() {

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 1: CONTROL WITH NO EVIDENCE → SCORE 0%');
  console.log('='.repeat(80));

  // Scenario: Access Control Policy - MANDATORY control
  // Evidence delivered: NONE
  // Expected score: 0%

  const controlId = 'CTRL-ACCESS-001';
  const assessmentId = 'ASSESS-001';

  console.log('\n📋 Control: Access Control Policy (MANDATORY)');
  console.log('   Category: Identity & Access Management');
  console.log('   Risk Level: Critical');
  console.log('   Evidence Delivered: NO');

  // Mock database state - no evidence records
  console.log('\n   Database check:');
  console.log('   SELECT COUNT(*) FROM assessment_evidence');
  console.log('   WHERE control_id = CTRL-ACCESS-001');
  console.log('   Result: 0 records');

  // Score the control
  const score = await controlScorer.scoreControl(assessmentId, controlId);

  console.log('\n📊 SCORING RESULT:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Evidence Delivered: ${score.evidenceDelivered ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Evidence Count: ${score.evidenceCount}`);
  console.log(`   Maturity Level: ${score.maturityLevel} - ${score.maturityScore.label}`);
  console.log(`   Score: ${score.percentage}% ${score.percentage === 0 ? '💀' : ''}`);
  console.log(`   Status: ${score.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔍 INTERPRETATION:');
  console.log('   ❌ NO evidence has been delivered for this control');
  console.log('   ❌ Score = 0% (Not Implemented)');
  console.log('   ❌ Mandatory control FAILED');
  console.log('   ⚠️  CRITICAL: Cannot achieve compliance without this control');

  console.log('\n💡 REMEDIATION:');
  console.log('   1. Create Access Control Policy document');
  console.log('   2. Upload policy as evidence (Document type)');
  console.log('   3. Add implementation evidence (Screenshots/Configurations)');
  console.log('   4. Get external validation (Audit report)');
  console.log('   5. Minimum 3 evidence pieces from 3 different types');

  return score;
}

// ============================================
// EXAMPLE 2: CONTROL WITH 1 EVIDENCE PIECE
// ============================================

export async function example_OneEvidence_Score40() {

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 2: CONTROL WITH 1 EVIDENCE → SCORE 20-40%');
  console.log('='.repeat(80));

  // Scenario: Encryption Policy
  // Evidence delivered: 1 piece (policy document)
  // Expected score: 20-40% (evidence exists but insufficient)

  const controlId = 'CTRL-ENCRYPT-001';
  const assessmentId = 'ASSESS-001';

  console.log('\n📋 Control: Data Encryption Policy (MANDATORY)');
  console.log('   Category: Data Protection');
  console.log('   Risk Level: High');
  console.log('   Evidence Delivered: YES (1 piece)');

  console.log('\n   Evidence:');
  console.log('   1. Policy Document - "Encryption Standard v1.2.pdf"');
  console.log('      Type: Policy');
  console.log('      Source: Internal');
  console.log('      Date: 2025-01-15');

  // Score the control
  const score = await controlScorer.scoreControl(assessmentId, controlId);

  console.log('\n📊 SCORING RESULT:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Evidence Delivered: ${score.evidenceDelivered ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Evidence Count: ${score.evidenceCount}/3 minimum`);
  console.log(`   Maturity Level: ${score.maturityLevel} - ${score.maturityScore.label}`);
  console.log(`   Max Achievable Level: ${score.maxAchievableLevel} (${score.constraintReason})`);
  console.log(`   Score: ${score.percentage}% ⚠️`);
  console.log(`   Status: ${score.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔍 INTERPRETATION:');
  console.log('   ✅ Evidence HAS been delivered (policy exists)');
  console.log('   ✅ Score > 0% (implementation started)');
  console.log('   ⚠️  Only 1 evidence piece (need 3 minimum)');
  console.log('   ⚠️  Max achievable: Level 2 (40%) - insufficient evidence');
  console.log('   ❌ Mandatory control FAILED (needs 60%+ to pass)');

  console.log('\n💡 REMEDIATION:');
  console.log('   1. Add technical evidence (Configuration screenshots)');
  console.log('   2. Add validation evidence (Scan results showing encryption)');
  console.log('   3. Add external evidence (Security audit report)');
  console.log('   → With 3+ evidence, can achieve Level 3 (60%) and PASS');

  return score;
}

// ============================================
// EXAMPLE 3: CONTROL WITH 3+ QUALITY EVIDENCE
// ============================================

export async function example_ThreeQualityEvidence_Score80() {

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 3: CONTROL WITH 3+ QUALITY EVIDENCE → SCORE 60-80%');
  console.log('='.repeat(80));

  // Scenario: Backup & Recovery
  // Evidence delivered: 3 pieces (policy + config + test results)
  // Expected score: 60-80% (sufficient evidence, good quality)

  const controlId = 'CTRL-BACKUP-001';
  const assessmentId = 'ASSESS-001';

  console.log('\n📋 Control: Backup & Disaster Recovery (MANDATORY)');
  console.log('   Category: Business Continuity');
  console.log('   Risk Level: Critical');
  console.log('   Evidence Delivered: YES (3 pieces)');

  console.log('\n   Evidence:');
  console.log('   1. Policy Document - "DR Policy 2025.pdf"');
  console.log('      Type: Policy');
  console.log('      Source: Internal');
  console.log('   2. Configuration File - "backup_config.json"');
  console.log('      Type: Configuration');
  console.log('      Source: Technical');
  console.log('   3. Test Report - "DR Test Results Q1-2025.pdf"');
  console.log('      Type: Report');
  console.log('      Source: Internal Audit');

  // Score the control
  const score = await controlScorer.scoreControl(assessmentId, controlId);

  console.log('\n📊 SCORING RESULT:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Evidence Delivered: ${score.evidenceDelivered ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Evidence Count: ${score.evidenceCount} ✅`);
  console.log(`   Evidence Types: 3 different types ✅`);
  console.log(`   Maturity Level: ${score.maturityLevel} - ${score.maturityScore.label}`);
  console.log(`   Max Achievable Level: ${score.maxAchievableLevel}`);
  console.log(`   Score: ${score.percentage}% ✅`);
  console.log(`   Status: ${score.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔍 INTERPRETATION:');
  console.log('   ✅ Evidence delivered (3 pieces)');
  console.log('   ✅ Score = 60-80% (Defined/Managed level)');
  console.log('   ✅ Meets minimum requirements');
  console.log('   ✅ Mandatory control PASSED');
  console.log('   ✅ Can contribute to compliance');

  console.log('\n💡 TO ACHIEVE EXCELLENCE (90-100%):');
  console.log('   1. Add external audit validation');
  console.log('   2. Show continuous monitoring evidence');
  console.log('   3. Document improvement metrics');
  console.log('   4. Add automation evidence');
  console.log('   → Can reach Level 5 (100%) - Optimizing');

  return score;
}

// ============================================
// EXAMPLE 4: CONTROL WITH EXCELLENT EVIDENCE
// ============================================

export async function example_ExcellentEvidence_Score100() {

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 4: CONTROL WITH EXCELLENT EVIDENCE → SCORE 100%');
  console.log('='.repeat(80));

  // Scenario: Incident Response
  // Evidence delivered: 6 pieces (comprehensive, from trusted sources)
  // Expected score: 100% (excellence achieved)

  const controlId = 'CTRL-INCIDENT-001';
  const assessmentId = 'ASSESS-001';

  console.log('\n📋 Control: Incident Response Management (MANDATORY)');
  console.log('   Category: Security Operations');
  console.log('   Risk Level: Critical');
  console.log('   Evidence Delivered: YES (6 pieces)');

  console.log('\n   Evidence:');
  console.log('   1. Policy - "Incident Response Plan 2025.pdf"');
  console.log('      Source: Approved by Board');
  console.log('   2. Procedure - "IR Playbooks & Runbooks.pdf"');
  console.log('      Source: CISO Office');
  console.log('   3. Configuration - "SIEM & SOAR Integration"');
  console.log('      Source: Technical Team');
  console.log('   4. External Audit - "SOC2 Type II Report 2025"');
  console.log('      Source: KPMG (Trusted)');
  console.log('   5. Training Records - "IR Team Certifications"');
  console.log('      Source: HR Training System');
  console.log('   6. Testing Results - "Annual IR Simulation Report"');
  console.log('      Source: Red Team Exercise');

  // Score the control
  const score = await controlScorer.scoreControl(assessmentId, controlId);

  console.log('\n📊 SCORING RESULT:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Evidence Delivered: ${score.evidenceDelivered ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Evidence Count: ${score.evidenceCount} 🌟`);
  console.log(`   Evidence Types: 6 different types 🌟`);
  console.log(`   Trusted Sources: External audit from Big 4 🌟`);
  console.log(`   Maturity Level: ${score.maturityLevel} - ${score.maturityScore.label} 🏆`);
  console.log(`   Score: ${score.percentage}% 🏆`);
  console.log(`   Status: ${score.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔍 INTERPRETATION:');
  console.log('   🌟 Evidence delivered (6 comprehensive pieces)');
  console.log('   🌟 Score = 100% (Optimizing - Excellence)');
  console.log('   🌟 External validation from trusted source');
  console.log('   🌟 Mandatory control PASSED with excellence');
  console.log('   🏆 Best practice implementation');
  console.log('   🏆 Audit-ready and certification-ready');

  return score;
}

// ============================================
// EXAMPLE 5: COMPLETE ASSESSMENT SCORING
// ============================================

export async function example_CompleteAssessment() {

  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 5: COMPLETE ASSESSMENT SCORING');
  console.log('='.repeat(80));

  const assessmentId = 'ASSESS-BANK-001';

  console.log('\n🏦 Organization: Saudi Digital Bank');
  console.log('   Framework: SAMA Cybersecurity Framework');
  console.log('   Total Controls: 50');
  console.log('   Mandatory Controls: 20');
  console.log('   Optional Controls: 30');

  console.log('\n   Control Distribution:');
  console.log('   - 5 controls: No evidence (0%)');
  console.log('   - 10 controls: 1 evidence piece (20-40%)');
  console.log('   - 20 controls: 3 evidence pieces (60-80%)');
  console.log('   - 15 controls: Excellent evidence (90-100%)');

  // Score the complete assessment
  const assessmentScore = await controlScorer.scoreAssessment(assessmentId);

  console.log('\n📊 ASSESSMENT SCORING RESULTS:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Overall Score: ${assessmentScore.overallScore}%`);
  console.log(`   Mandatory Controls: ${assessmentScore.mandatoryScore}%`);
  console.log(`   Critical Controls: ${assessmentScore.criticalScore}%`);
  console.log(`   Passed Controls: ${assessmentScore.passedControls}/${assessmentScore.totalControls}`);
  console.log(`   Failed Controls: ${assessmentScore.failedControls}/${assessmentScore.totalControls}`);
  console.log(`   Status: ${assessmentScore.status.toUpperCase()}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📈 MATURITY LEVEL DISTRIBUTION:');
  const distribution = assessmentScore.controlScores.reduce((acc, c) => {
    acc[c.maturityLevel] = (acc[c.maturityLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log(`   Level 0 (Not Implemented): ${distribution[0] || 0} controls (0%)`);
  console.log(`   Level 1 (Initial): ${distribution[1] || 0} controls (20%)`);
  console.log(`   Level 2 (Developing): ${distribution[2] || 0} controls (40%)`);
  console.log(`   Level 3 (Defined): ${distribution[3] || 0} controls (60%)`);
  console.log(`   Level 4 (Managed): ${distribution[4] || 0} controls (80%)`);
  console.log(`   Level 5 (Optimizing): ${distribution[5] || 0} controls (100%)`);

  // Generate comprehensive report
  console.log('\n📄 Generating comprehensive report...');
  const report = await reportingEngine.generateAssessmentReport(assessmentId);

  console.log('\n📊 EXECUTIVE SUMMARY:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Compliance Level: ${report.executiveSummary.complianceLevel}`);
  console.log(`   Implemented: ${report.executiveSummary.implementedControls} controls`);
  console.log(`   Not Implemented: ${report.executiveSummary.notImplementedControls} controls`);
  console.log(`   Mandatory Status: ${report.executiveSummary.mandatoryControlsStatus}`);
  console.log(`   Critical Issues: ${report.executiveSummary.criticalIssues}`);
  console.log(`   Remediation Time: ${report.executiveSummary.estimatedRemediationTime}`);
  console.log(`   Remediation Cost: ${report.executiveSummary.estimatedRemediationCost}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🎯 GAP ANALYSIS:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Total Gaps: ${report.gapAnalysis.totalGaps}`);
  console.log(`   Critical Gaps: ${report.gapAnalysis.criticalGaps.length}`);
  console.log(`   No Evidence: ${report.gapAnalysis.noEvidenceGaps.length} controls (SCORE = 0%)`);
  console.log(`   Insufficient Evidence: ${report.gapAnalysis.insufficientEvidenceGaps.length} controls (< 3 pieces)`);
  console.log(`   Quality Issues: ${report.gapAnalysis.qualityIssuesGaps.length} controls`);
  console.log(`   Total Cost: ${report.gapAnalysis.costEstimate.totalEstimate}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n✅ COMPLIANCE STATUS:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Overall: ${report.complianceStatus.overall.toUpperCase()}`);
  console.log(`   Mandatory Controls: ${report.complianceStatus.mandatoryControls.toUpperCase()}`);
  console.log(`   Regulatory Readiness: ${report.complianceStatus.regulatoryReadiness ? 'YES ✅' : 'NO ❌'}`);
  console.log('   Certification Readiness:');
  for (const [cert, ready] of Object.entries(report.complianceStatus.certificationReadiness)) {
    console.log(`   - ${cert}: ${ready ? 'READY ✅' : 'NOT READY ❌'}`);
  }
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n💡 TOP RECOMMENDATIONS:');
  for (let i = 0; i < Math.min(3, report.recommendations.length); i++) {
    const rec = report.recommendations[i];
    console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
    console.log(`      ${rec.description}`);
    console.log(`      Effort: ${rec.estimatedEffort} | Cost: ${rec.estimatedCost} | Timeline: ${rec.timeline}`);
  }

  console.log('\n📋 ACTION PLAN:');
  for (const phase of report.actionPlan) {
    console.log(`   Phase ${phase.phase}: ${phase.title}`);
    console.log(`   Timeline: ${phase.timeline} | Cost: ${phase.estimatedCost}`);
    console.log(`   Tasks:`);
    phase.tasks.forEach(task => console.log(`   - ${task}`));
    console.log('');
  }

  return { assessmentScore, report };
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

export async function runAllScoringExamples() {

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                       ║');
  console.log('║              SHAHIN GRC - SCORING SYSTEM DEMONSTRATION                ║');
  console.log('║                                                                       ║');
  console.log('║  CRITICAL RULE: Evidence Delivery Determines Base Score              ║');
  console.log('║  ═══════════════════════════════════════════════════════             ║');
  console.log('║  NO Evidence = 0% Score (Not Implemented)                            ║');
  console.log('║  Evidence Delivered = 20-100% (Based on Quality & Maturity)          ║');
  console.log('║                                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');

  try {
    // Example 1: No evidence
    await example_NoEvidence_Score0();

    // Example 2: One evidence
    await example_OneEvidence_Score40();

    // Example 3: Three quality evidence
    await example_ThreeQualityEvidence_Score80();

    // Example 4: Excellent evidence
    await example_ExcellentEvidence_Score100();

    // Example 5: Complete assessment
    await example_CompleteAssessment();

    console.log('\n✅ All scoring examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllScoringExamples()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
