/**
 * VERIFY INTELLIGENT GRC SYSTEM
 *
 * Quick verification script to check if all components are working
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySystem() {
  console.log('\n🔍 VERIFYING INTELLIGENT GRC SYSTEM');
  console.log('=====================================\n');

  try {
    // 1. Check Core Tables
    console.log('📊 Checking core tables...');
    const frameworks = await prisma.grc_frameworks.count();
    const controls = await prisma.grc_controls.count();
    console.log(`   ✅ Frameworks: ${frameworks}`);
    console.log(`   ✅ Controls: ${controls}\n`);

    // 2. Check Intelligence Tables
    console.log('🧠 Checking intelligence tables...');

    try {
      await prisma.regulatory_applicability_rules.findMany({ take: 1 });
      console.log('   ✅ regulatory_applicability_rules');
    } catch (e) {
      console.log('   ❌ regulatory_applicability_rules - Table may not exist');
    }

    try {
      await prisma.organization_profile_factors.findMany({ take: 1 });
      console.log('   ✅ organization_profile_factors');
    } catch (e) {
      console.log('   ❌ organization_profile_factors - Table may not exist');
    }

    try {
      await prisma.applicable_frameworks_matrix.findMany({ take: 1 });
      console.log('   ✅ applicable_frameworks_matrix');
    } catch (e) {
      console.log('   ❌ applicable_frameworks_matrix - Table may not exist');
    }

    try {
      await prisma.control_applicability_logic.findMany({ take: 1 });
      console.log('   ✅ control_applicability_logic');
    } catch (e) {
      console.log('   ❌ control_applicability_logic - Table may not exist');
    }

    console.log();

    // 3. Check Assessment Tables
    console.log('📋 Checking assessment workflow tables...');

    try {
      await prisma.assessment_evidence.findMany({ take: 1 });
      console.log('   ✅ assessment_evidence');
    } catch (e) {
      console.log('   ❌ assessment_evidence - Table may not exist');
    }

    try {
      await prisma.evidence_validation.findMany({ take: 1 });
      console.log('   ✅ evidence_validation');
    } catch (e) {
      console.log('   ❌ evidence_validation - Table may not exist');
    }

    try {
      await prisma.assessment_findings.findMany({ take: 1 });
      console.log('   ✅ assessment_findings');
    } catch (e) {
      console.log('   ❌ assessment_findings - Table may not exist');
    }

    try {
      await prisma.gap_analysis.findMany({ take: 1 });
      console.log('   ✅ gap_analysis');
    } catch (e) {
      console.log('   ❌ gap_analysis - Table may not exist');
    }

    try {
      await prisma.remediation_plans.findMany({ take: 1 });
      console.log('   ✅ remediation_plans');
    } catch (e) {
      console.log('   ❌ remediation_plans - Table may not exist');
    }

    try {
      await prisma.remediation_tasks.findMany({ take: 1 });
      console.log('   ✅ remediation_tasks');
    } catch (e) {
      console.log('   ❌ remediation_tasks - Table may not exist');
    }

    try {
      await prisma.follow_up_schedule.findMany({ take: 1 });
      console.log('   ✅ follow_up_schedule');
    } catch (e) {
      console.log('   ❌ follow_up_schedule - Table may not exist');
    }

    console.log();

    // 4. Check Services
    console.log('🔧 Checking services...');

    try {
      const { applicabilityEngine } = await import('./applicability-engine');
      console.log('   ✅ ApplicabilityEngine');
    } catch (e) {
      console.log('   ❌ ApplicabilityEngine - Import failed');
    }

    try {
      const { templateGenerator } = await import('./assessment-template-generator');
      console.log('   ✅ TemplateGenerator');
    } catch (e) {
      console.log('   ❌ TemplateGenerator - Import failed');
    }

    console.log();

    // 5. Show Sample Data
    console.log('📋 Sample Frameworks:');
    const sampleFrameworks = await prisma.grc_frameworks.findMany({ take: 5 });
    for (const fw of sampleFrameworks) {
      console.log(`   - ${fw.id}: ${fw.name}`);
    }

    console.log();
    console.log('✅ VERIFICATION COMPLETE\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySystem();
