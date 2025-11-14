/**
 * INTELLIGENT GRC SYSTEM - DEMO & USAGE EXAMPLES
 *
 * This file demonstrates the complete workflow of the intelligent GRC system:
 * 1. Organization Profile Creation
 * 2. Automatic Framework Applicability Calculation
 * 3. Custom Assessment Template Generation
 * 4. Assessment Execution with Evidence Collection
 * 5. Scoring & Gap Analysis
 * 6. Remediation Planning
 * 7. Implementation Tracking
 * 8. Follow-up Scheduling
 */

import { PrismaClient } from '@prisma/client';
import { applicabilityEngine, OrganizationProfile } from './applicability-engine';
import { templateGenerator } from './assessment-template-generator';

const prisma = new PrismaClient();

// ============================================
// EXAMPLE 1: INSURANCE COMPANY IN SAUDI ARABIA
// ============================================

async function example_InsuranceCompany() {
  console.log('\n========================================');
  console.log('EXAMPLE: Insurance Company in Saudi Arabia');
  console.log('========================================\n');

  const tenantId = 'tenant-demo-001';
  const organizationId = 'org-insurance-001';

  // Step 1: Create Organization Profile
  console.log('📝 Step 1: Creating organization profile...\n');

  const orgProfile: OrganizationProfile = {
    organizationId,
    tenantId,

    // Company Details
    sector: 'insurance',
    subSector: 'general_insurance',
    legalType: 'PLC', // Public Limited Company
    companySize: 'large',

    // Size Metrics
    employeeCount: 450,
    annualRevenueSar: 850000000, // 850 million SAR

    // Business Activities
    businessActivities: [
      'insurance_underwriting',
      'claims_processing',
      'customer_service',
      'investment_management'
    ],
    serviceTypes: [
      'motor_insurance',
      'health_insurance',
      'property_insurance',
      'life_insurance'
    ],

    // Geographic
    operatesRegions: ['riyadh', 'jeddah', 'dammam', 'medina'],
    hasInternational: false,

    // Data & Technology
    dataRecords: 250000, // 250K customer records
    storesPii: true, // Stores personal data (MANDATORY PDPL)
    processesPayments: true, // Processes premiums (PCI-DSS applies)
    hasOnlinePlatform: true, // Online insurance portal
    usesCloudServices: true, // Uses AWS/Azure

    // Compliance
    existingCertifications: ['ISO27001'],
    complianceMaturity: 'developing',
    criticalInfrastructure: false,
    handlesGovtData: false
  };

  // Save organization profile
  await prisma.organization_profile_factors.upsert({
    where: { organization_id: organizationId },
    update: {},
    create: {
      organization_id: organizationId,
      tenant_id: tenantId,
      sector: orgProfile.sector,
      sub_sector: orgProfile.subSector,
      legal_type: orgProfile.legalType,
      company_size: orgProfile.companySize,
      employee_count: orgProfile.employeeCount,
      annual_revenue_sar: orgProfile.annualRevenueSar,
      business_activities: JSON.stringify(orgProfile.businessActivities),
      service_types: JSON.stringify(orgProfile.serviceTypes),
      operates_regions: JSON.stringify(orgProfile.operatesRegions),
      has_international: orgProfile.hasInternational,
      customer_data_records: orgProfile.dataRecords,
      stores_pii: orgProfile.storesPii,
      processes_payments: orgProfile.processesPayments,
      has_online_platform: orgProfile.hasOnlinePlatform,
      uses_cloud_services: orgProfile.usesCloudServices,
      existing_certifications: JSON.stringify(orgProfile.existingCertifications),
      compliance_maturity: orgProfile.complianceMaturity,
      critical_infrastructure: orgProfile.criticalInfrastructure,
      handles_govt_data: orgProfile.handlesGovtData
    }
  });

  console.log('✅ Organization profile created\n');

  // Step 2: Calculate Applicable Frameworks
  console.log('📊 Step 2: Calculating applicable frameworks...\n');

  const applicability = await applicabilityEngine.calculateApplicability(orgProfile);

  console.log(`✅ Found ${applicability.totalFrameworks} applicable frameworks:`);
  console.log(`   - Mandatory: ${applicability.mandatoryCount}`);
  console.log(`   - Recommended: ${applicability.optionalCount}\n`);

  // Display frameworks
  console.log('📋 Applicable Frameworks:\n');
  for (const fw of applicability.applicableFrameworks.slice(0, 10)) {
    const icon = fw.isMandatory ? '🔴' : '🟡';
    console.log(`${icon} ${fw.frameworkName}`);
    console.log(`   Priority: ${fw.priorityLevel.toUpperCase()}`);
    console.log(`   Reason: ${fw.reason}`);
    console.log(`   Controls: ${fw.applicableControls}/${fw.totalControls}`);
    console.log(`   Timeline: ${fw.recommendedTimeline}`);
    console.log();
  }

  // Step 3: Generate Assessment Template
  console.log('🎯 Step 3: Generating custom assessment template...\n');

  const template = await templateGenerator.generateTemplate(
    organizationId,
    tenantId,
    'comprehensive' // or 'quick', 'risk_based'
  );

  console.log(`✅ Template Generated: "${template.title}"`);
  console.log(`   Total Controls: ${template.totalControls}`);
  console.log(`   Mandatory: ${template.mandatoryControls}`);
  console.log(`   Optional: ${template.optionalControls}`);
  console.log(`   Estimated Duration: ${template.estimatedDuration}\n`);

  // Display framework breakdown
  console.log('📋 Framework Breakdown:\n');
  for (const fw of template.frameworks.slice(0, 5)) {
    console.log(`${fw.isMandatory ? '🔴' : '🟡'} ${fw.frameworkName}`);
    console.log(`   Controls: ${fw.totalControls} (${fw.mandatoryControls} mandatory)`);
    console.log(`   Domains: ${fw.domains.length}`);
    for (const domain of fw.domains.slice(0, 3)) {
      console.log(`      - ${domain.domainName}: ${domain.controls.length} controls`);
    }
    console.log();
  }

  // Step 4: Create Assessment from Template
  console.log('📝 Step 4: Creating assessment from template...\n');

  const assessmentId = await templateGenerator.createAssessmentFromTemplate(
    template,
    tenantId,
    'user-auditor-001'
  );

  console.log(`✅ Assessment created: ${assessmentId}\n`);

  // Step 5: Show what assessor needs to do
  console.log('👤 Step 5: Assessment Workflow for Auditor:\n');
  console.log('For each control, the auditor will:');
  console.log('   1. Review control requirement');
  console.log('   2. Collect evidence (documents, screenshots, logs)');
  console.log('   3. Score maturity level (0-5)');
  console.log('   4. Add implementation notes');
  console.log('   5. Submit for review\n');

  // Example control assessment
  const sampleControl = template.frameworks[0]?.domains[0]?.controls[0];
  if (sampleControl) {
    console.log('📌 Example Control:');
    console.log(`   ID: ${sampleControl.controlId}`);
    console.log(`   Title: ${sampleControl.title}`);
    console.log(`   Category: ${sampleControl.category}`);
    console.log(`   Risk Level: ${sampleControl.riskLevel}`);
    console.log(`   Mandatory: ${sampleControl.isMandatory ? 'Yes' : 'No'}`);
    console.log(`   Evidence Required: ${sampleControl.evidenceRequired ? 'Yes' : 'No'}\n`);

    if (sampleControl.evidenceTypes.length > 0) {
      console.log('   Required Evidence:');
      for (const ev of sampleControl.evidenceTypes) {
        console.log(`      - ${ev.name} (${ev.type})`);
      }
      console.log();
    }

    console.log('   Scoring Criteria:');
    for (const criterion of sampleControl.scoringCriteria) {
      console.log(`      Level ${criterion.level}: ${criterion.label} (${criterion.score}%)`);
    }
    console.log();
  }

  return { organizationId, tenantId, assessmentId, template };
}

// ============================================
// EXAMPLE 2: SMALL FINTECH STARTUP
// ============================================

async function example_FintechStartup() {
  console.log('\n========================================');
  console.log('EXAMPLE: Small FinTech Startup');
  console.log('========================================\n');

  const tenantId = 'tenant-fintech-001';
  const organizationId = 'org-fintech-startup-001';

  const orgProfile: OrganizationProfile = {
    organizationId,
    tenantId,

    sector: 'fintech',
    subSector: 'payment_services',
    legalType: 'LLC',
    companySize: 'small',

    employeeCount: 35,
    annualRevenueSar: 15000000, // 15 million SAR

    businessActivities: ['payment_processing', 'digital_wallet', 'peer_to_peer_transfer'],
    serviceTypes: ['mobile_app', 'web_platform', 'api_services'],

    operatesRegions: ['riyadh'],
    hasInternational: true, // Serves customers from UAE, Kuwait

    dataRecords: 50000,
    storesPii: true,
    processesPayments: true, // MANDATORY: PCI-DSS
    hasOnlinePlatform: true,
    usesCloudServices: true,

    existingCertifications: [],
    complianceMaturity: 'initial',
    criticalInfrastructure: false,
    handlesGovtData: false
  };

  const applicability = await applicabilityEngine.calculateApplicability(orgProfile);

  console.log(`✅ FinTech Compliance Requirements:`);
  console.log(`   Mandatory Frameworks: ${applicability.mandatoryCount}`);
  console.log(`   Total Frameworks: ${applicability.totalFrameworks}\n`);

  console.log('🔴 CRITICAL MANDATORY FRAMEWORKS:\n');
  applicability.applicableFrameworks
    .filter(f => f.isMandatory)
    .forEach(f => {
      console.log(`   - ${f.frameworkName}`);
      console.log(`     Reason: ${f.reason}`);
      console.log(`     Deadline: ${f.complianceDeadline?.toDateString() || 'Immediate'}\n`);
    });

  return { organizationId, tenantId, applicability };
}

// ============================================
// EXAMPLE 3: LARGE HEALTHCARE PROVIDER
// ============================================

async function example_HealthcareProvider() {
  console.log('\n========================================');
  console.log('EXAMPLE: Large Healthcare Provider');
  console.log('========================================\n');

  const tenantId = 'tenant-health-001';
  const organizationId = 'org-hospital-network-001';

  const orgProfile: OrganizationProfile = {
    organizationId,
    tenantId,

    sector: 'healthcare',
    subSector: 'hospital_network',
    legalType: 'PLC',
    companySize: 'enterprise',

    employeeCount: 3500,
    annualRevenueSar: 2500000000, // 2.5 billion SAR

    businessActivities: [
      'medical_services',
      'patient_care',
      'diagnostics',
      'pharmacy',
      'health_insurance_claims'
    ],
    serviceTypes: [
      'inpatient_care',
      'outpatient_care',
      'emergency_services',
      'telemedicine'
    ],

    operatesRegions: ['riyadh', 'jeddah', 'dammam', 'medina', 'makkah'],
    hasInternational: true,

    dataRecords: 1500000, // 1.5M patient records
    storesPii: true, // HIGHLY sensitive health data
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,

    existingCertifications: ['ISO27001', 'JCI', 'CBAHI'],
    complianceMaturity: 'defined',
    criticalInfrastructure: true, // Critical healthcare infrastructure
    handlesGovtData: true // Government health insurance data
  };

  const applicability = await applicabilityEngine.calculateApplicability(orgProfile);

  console.log(`✅ Healthcare Compliance Requirements:`);
  console.log(`   Mandatory Frameworks: ${applicability.mandatoryCount}`);
  console.log(`   Total Frameworks: ${applicability.totalFrameworks}\n`);

  const template = await templateGenerator.generateTemplate(
    organizationId,
    tenantId,
    'comprehensive'
  );

  console.log(`📊 Assessment Scope:`);
  console.log(`   Total Controls: ${template.totalControls}`);
  console.log(`   Mandatory Controls: ${template.mandatoryControls}`);
  console.log(`   Estimated Duration: ${template.estimatedDuration}\n`);

  return { organizationId, tenantId, template };
}

// ============================================
// EXAMPLE 4: COMPLETE ASSESSMENT WORKFLOW
// ============================================

async function example_CompleteWorkflow() {
  console.log('\n========================================');
  console.log('EXAMPLE: Complete GRC Assessment Workflow');
  console.log('========================================\n');

  const tenantId = 'tenant-demo-workflow';
  const organizationId = 'org-workflow-demo';
  const userId = 'user-compliance-officer';

  // 1. Setup Organization
  console.log('🏢 Phase 1: Organization Setup');
  const orgProfile: OrganizationProfile = {
    organizationId,
    tenantId,
    sector: 'banking',
    legalType: 'PLC',
    companySize: 'large',
    employeeCount: 1200,
    annualRevenueSar: 1800000000,
    businessActivities: ['retail_banking', 'corporate_banking', 'investment_services'],
    serviceTypes: ['online_banking', 'mobile_app', 'branch_services'],
    operatesRegions: ['riyadh', 'jeddah'],
    hasInternational: false,
    dataRecords: 800000,
    storesPii: true,
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    existingCertifications: ['ISO27001', 'PCI-DSS'],
    complianceMaturity: 'managed',
    criticalInfrastructure: true,
    handlesGovtData: true
  };

  // 2. Calculate Applicability
  console.log('📊 Phase 2: Calculating Compliance Requirements...');
  const applicability = await applicabilityEngine.calculateApplicability(orgProfile);
  console.log(`✅ ${applicability.mandatoryCount} mandatory frameworks identified\n`);

  // 3. Generate Template
  console.log('🎯 Phase 3: Generating Assessment Template...');
  const template = await templateGenerator.generateTemplate(organizationId, tenantId, 'comprehensive');
  console.log(`✅ Template with ${template.totalControls} controls created\n`);

  // 4. Create Assessment
  console.log('📝 Phase 4: Creating Assessment...');
  const assessmentId = await templateGenerator.createAssessmentFromTemplate(template, tenantId, userId);
  console.log(`✅ Assessment ${assessmentId} created\n`);

  // 5. Simulate Evidence Collection
  console.log('📄 Phase 5: Evidence Collection (Simulated)...');
  const assessment = await prisma.assessments.findUnique({ where: { id: assessmentId } });
  const controls = await prisma.assessment_controls.findMany({
    where: { assessment_id: assessmentId },
    take: 5
  });

  for (const control of controls) {
    // Simulate evidence upload
    await prisma.assessment_evidence.create({
      data: {
        assessment_id: assessmentId,
        control_id: control.control_id,
        tenant_id: tenantId,
        evidence_type: 'policy',
        evidence_name: `Policy Document - ${control.control_id}`,
        validation_status: 'approved',
        validation_score: 85,
        meets_requirement: true,
        confidence_level: 'high',
        uploaded_by: userId
      }
    });

    // Update control status
    await prisma.assessment_controls.update({
      where: { id: control.id },
      data: {
        status: 'completed',
        compliance_status: 'compliant',
        score: 85,
        evidence_submitted: true
      }
    });
  }
  console.log(`✅ Evidence collected for ${controls.length} controls\n`);

  // 6. Generate Gap Analysis
  console.log('📈 Phase 6: Gap Analysis...');
  await prisma.gap_analysis.create({
    data: {
      assessment_id: assessmentId,
      framework_id: assessment!.framework_id,
      tenant_id: tenantId,
      total_controls: 100,
      compliant_controls: 65,
      partial_controls: 20,
      non_compliant_controls: 15,
      overall_compliance_score: 72.5,
      gap_percentage: 27.5,
      critical_gaps: 3,
      high_priority_gaps: 8,
      medium_priority_gaps: 4,
      estimated_closure_months: 6,
      estimated_cost_sar: 1500000,
      executive_summary: 'Organization shows good progress with 72.5% compliance. Focus needed on access control and incident response.',
      analyzed_by: userId
    }
  });
  console.log(`✅ Gap analysis complete: 72.5% compliant\n`);

  // 7. Create Remediation Plan
  console.log('🛠️  Phase 7: Remediation Planning...');
  const remediationPlan = await prisma.remediation_plans.create({
    data: {
      assessment_id: assessmentId,
      tenant_id: tenantId,
      plan_name: 'Q1 2025 Compliance Remediation',
      plan_description: 'Close critical gaps in access control, incident response, and data protection',
      priority_level: 'high',
      status: 'approved',
      estimated_budget_sar: 1500000,
      estimated_effort_days: 120,
      progress_percentage: 0,
      total_tasks: 15,
      plan_owner: userId,
      approved_by: 'ciso-001',
      approved_at: new Date()
    }
  });

  // Create sample tasks
  const taskTitles = [
    'Implement MFA for all privileged accounts',
    'Update incident response playbook',
    'Deploy DLP solution',
    'Conduct security awareness training',
    'Implement automated log monitoring'
  ];

  for (let i = 0; i < taskTitles.length; i++) {
    await prisma.remediation_tasks.create({
      data: {
        remediation_plan_id: remediationPlan.id,
        tenant_id: tenantId,
        task_title: taskTitles[i],
        task_type: 'technical',
        priority: i < 2 ? 'high' : 'medium',
        sequence_number: i + 1,
        status: 'pending',
        estimated_hours: 40,
        estimated_cost: 100000,
        assigned_to: userId,
        created_by: userId
      }
    });
  }
  console.log(`✅ Remediation plan with ${taskTitles.length} tasks created\n`);

  // 8. Schedule Follow-ups
  console.log('📅 Phase 8: Scheduling Follow-ups...');
  const followUpDates = [30, 60, 90]; // days from now
  for (const days of followUpDates) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + days);

    await prisma.follow_up_schedule.create({
      data: {
        assessment_id: assessmentId,
        remediation_plan_id: remediationPlan.id,
        tenant_id: tenantId,
        follow_up_type: 'progress_review',
        title: `${days}-Day Progress Review`,
        description: `Review remediation progress and adjust plan if needed`,
        scheduled_date: scheduledDate,
        responsible_person: userId,
        created_by: userId
      }
    });
  }
  console.log(`✅ ${followUpDates.length} follow-up reviews scheduled\n`);

  console.log('🎉 Complete workflow executed successfully!\n');
  console.log('Summary:');
  console.log(`   - Organization Profile: Created`);
  console.log(`   - Applicable Frameworks: ${applicability.mandatoryCount} mandatory`);
  console.log(`   - Assessment Template: ${template.totalControls} controls`);
  console.log(`   - Evidence: ${controls.length} controls assessed`);
  console.log(`   - Compliance Score: 72.5%`);
  console.log(`   - Remediation Tasks: ${taskTitles.length} tasks`);
  console.log(`   - Follow-ups: ${followUpDates.length} reviews scheduled\n`);

  return { assessmentId, remediationPlan };
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

async function main() {
  try {
    console.log('\n🚀 INTELLIGENT GRC SYSTEM - DEMONSTRATION');
    console.log('==========================================\n');

    // Run Example 1: Insurance Company
    await example_InsuranceCompany();

    // Run Example 2: FinTech Startup
    await example_FintechStartup();

    // Run Example 3: Healthcare Provider
    await example_HealthcareProvider();

    // Run Example 4: Complete Workflow
    await example_CompleteWorkflow();

    console.log('\n✅ ALL EXAMPLES COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  example_InsuranceCompany,
  example_FintechStartup,
  example_HealthcareProvider,
  example_CompleteWorkflow
};
