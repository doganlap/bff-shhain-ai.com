/**
 * ORGANIZATION ONBOARDING EXAMPLES
 *
 * Real-world scenarios demonstrating complete onboarding workflow
 */

import { onboardingEngine, OnboardingRequest } from './organization-onboarding';

// ============================================
// EXAMPLE 1: SAUDI INSURANCE COMPANY
// ============================================

export async function onboard_InsuranceCompany() {

  console.log('\n' + '='.repeat(100));
  console.log('EXAMPLE 1: SAUDI INSURANCE COMPANY ONBOARDING');
  console.log('='.repeat(100));

  const request: OnboardingRequest = {
    // Organization Details
    organizationName: 'Al-Ameen Insurance Company',
    organizationNameAr: 'شركة الأمين للتأمين',
    commercialRegistration: '1010123456',
    taxNumber: '300123456789003',

    // Profile
    sector: 'insurance',
    subSector: 'general_insurance',
    legalType: 'joint_stock',
    employeeCount: 450,
    annualRevenueSar: 850_000_000, // 850M SAR
    totalAssetsSar: 2_500_000_000, // 2.5B SAR

    // Business Activities
    businessActivities: [
      'property_insurance',
      'motor_insurance',
      'health_insurance',
      'liability_insurance'
    ],
    serviceTypes: [
      'retail_insurance',
      'corporate_insurance',
      'reinsurance'
    ],

    // Geography
    operatesRegions: ['riyadh', 'jeddah', 'dammam', 'makkah', 'madinah'],
    hasInternational: false,

    // Data & Technology
    customerDataRecords: 500_000,
    storesPii: true,
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    cloudProviders: ['aws', 'microsoft_azure'],

    // Compliance
    existingCertifications: ['ISO27001', 'SOC2'],
    complianceMaturity: 'managed',
    criticalInfrastructure: false,
    handlesGovtData: false,

    // Owner
    ownerEmail: 'ahmed.almalki@alameen-insurance.sa',
    ownerName: 'Ahmed Al-Malki',
    ownerPhone: '+966501234567',
    ownerTitle: 'Chief Compliance Officer',

    // Additional Users
    additionalUsers: [
      {
        email: 'fatima.alharbi@alameen-insurance.sa',
        name: 'Fatima Al-Harbi',
        role: 'assessor'
      },
      {
        email: 'mohammed.alghamdi@alameen-insurance.sa',
        name: 'Mohammed Al-Ghamdi',
        role: 'contributor'
      },
      {
        email: 'sara.alotaibi@alameen-insurance.sa',
        name: 'Sara Al-Otaibi',
        role: 'admin'
      }
    ],

    // Preferences
    preferredLanguage: 'ar',
    assessmentPriority: 'urgent',
    targetCompletionDate: new Date('2025-12-31')
  };

  const result = await onboardingEngine.onboardOrganization(request);

  console.log('\n🎉 INSURANCE COMPANY ONBOARDED SUCCESSFULLY!');
  console.log('\nExpected Results:');
  console.log('   ✅ 6 Mandatory Frameworks:');
  console.log('      - SAMA Cybersecurity Framework (SAMA-CSF)');
  console.log('      - SAMA Insurance Regulations (SAMA-INS)');
  console.log('      - Insurance Cybersecurity Questionnaire (ICSQ)');
  console.log('      - Personal Data Protection Law (PDPL)');
  console.log('      - Payment Card Industry (PCI-DSS)');
  console.log('      - NCA Essential Cybersecurity Controls (NCA-ECC)');
  console.log('   ✅ ~287 applicable controls');
  console.log('   ✅ 4 users created and assigned');
  console.log('   ✅ Assessments ready for evidence collection');

  return result;
}

// ============================================
// EXAMPLE 2: FINTECH STARTUP
// ============================================

export async function onboard_FintechStartup() {

  console.log('\n' + '='.repeat(100));
  console.log('EXAMPLE 2: FINTECH STARTUP ONBOARDING');
  console.log('='.repeat(100));

  const request: OnboardingRequest = {
    organizationName: 'PayFlow Digital Payments',
    organizationNameAr: 'باي فلو للمدفوعات الرقمية',
    commercialRegistration: '1010987654',
    taxNumber: '300987654321003',

    sector: 'fintech',
    subSector: 'digital_payments',
    legalType: 'limited_liability',
    employeeCount: 35,
    annualRevenueSar: 15_000_000, // 15M SAR

    businessActivities: [
      'digital_payments',
      'mobile_wallet',
      'payment_gateway',
      'bill_payments'
    ],
    serviceTypes: [
      'consumer_fintech',
      'merchant_services',
      'api_services'
    ],

    operatesRegions: ['riyadh', 'jeddah'],
    hasInternational: true, // Cross-border payments

    customerDataRecords: 50_000,
    storesPii: true,
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    cloudProviders: ['aws'],

    existingCertifications: [],
    complianceMaturity: 'initial',
    criticalInfrastructure: false,
    handlesGovtData: false,

    ownerEmail: 'khalid.alajmi@payflow.sa',
    ownerName: 'Khalid Al-Ajmi',
    ownerPhone: '+966507654321',
    ownerTitle: 'CEO & Co-Founder',

    additionalUsers: [
      {
        email: 'noura.alsaeed@payflow.sa',
        name: 'Noura Al-Saeed',
        role: 'admin'
      }
    ],

    preferredLanguage: 'en',
    assessmentPriority: 'urgent',
    targetCompletionDate: new Date('2025-06-30')
  };

  const result = await onboardingEngine.onboardOrganization(request);

  console.log('\n🎉 FINTECH STARTUP ONBOARDED SUCCESSFULLY!');
  console.log('\nExpected Results:');
  console.log('   ✅ 3 Critical Mandatory Frameworks:');
  console.log('      - SAMA FinTech Regulations (SAMA-FST)');
  console.log('      - Payment Card Industry (PCI-DSS)');
  console.log('      - Personal Data Protection Law (PDPL)');
  console.log('   ✅ ~145 applicable controls');
  console.log('   ✅ 2 users created');
  console.log('   ✅ Fast-track 25-day timeline');

  return result;
}

// ============================================
// EXAMPLE 3: HEALTHCARE PROVIDER
// ============================================

export async function onboard_HealthcareProvider() {

  console.log('\n' + '='.repeat(100));
  console.log('EXAMPLE 3: HEALTHCARE PROVIDER ONBOARDING');
  console.log('='.repeat(100));

  const request: OnboardingRequest = {
    organizationName: 'Al-Shifa Medical Group',
    organizationNameAr: 'مجموعة الشفاء الطبية',
    commercialRegistration: '1010555666',
    taxNumber: '300555666777003',

    sector: 'healthcare',
    subSector: 'hospitals',
    legalType: 'joint_stock',
    employeeCount: 3500,
    annualRevenueSar: 2_500_000_000, // 2.5B SAR
    totalAssetsSar: 8_000_000_000, // 8B SAR

    businessActivities: [
      'hospital_services',
      'outpatient_clinics',
      'emergency_services',
      'laboratory_services',
      'radiology_services'
    ],
    serviceTypes: [
      'primary_care',
      'specialized_care',
      'emergency_care'
    ],

    operatesRegions: ['riyadh', 'jeddah', 'dammam', 'makkah'],
    hasInternational: false,

    customerDataRecords: 2_000_000, // 2M patient records
    storesPii: true, // PHI - Protected Health Information
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    cloudProviders: ['microsoft_azure', 'google_cloud'],

    existingCertifications: ['ISO27001', 'JCI'], // Joint Commission International
    complianceMaturity: 'managed',
    criticalInfrastructure: true, // Healthcare is critical infrastructure
    handlesGovtData: true, // Government health insurance data

    ownerEmail: 'dr.abdullah.alshehri@alshifa.sa',
    ownerName: 'Dr. Abdullah Al-Shehri',
    ownerPhone: '+966503334444',
    ownerTitle: 'Chief Medical Officer',

    additionalUsers: [
      {
        email: 'hanan.almutairi@alshifa.sa',
        name: 'Hanan Al-Mutairi',
        role: 'admin'
      },
      {
        email: 'omar.alqahtani@alshifa.sa',
        name: 'Omar Al-Qahtani',
        role: 'assessor'
      },
      {
        email: 'layla.aldosari@alshifa.sa',
        name: 'Layla Al-Dosari',
        role: 'assessor'
      },
      {
        email: 'majed.alharbi@alshifa.sa',
        name: 'Majed Al-Harbi',
        role: 'contributor'
      }
    ],

    preferredLanguage: 'ar',
    assessmentPriority: 'normal',
    targetCompletionDate: new Date('2026-03-31')
  };

  const result = await onboardingEngine.onboardOrganization(request);

  console.log('\n🎉 HEALTHCARE PROVIDER ONBOARDED SUCCESSFULLY!');
  console.log('\nExpected Results:');
  console.log('   ✅ 7 Mandatory Frameworks:');
  console.log('      - MOH Patient Safety Standards (MOH-PS)');
  console.log('      - MOH Quality Management (MOH-QM)');
  console.log('      - MOH Electronic Medical Records (MOH-EMR)');
  console.log('      - Council of Health Insurance (CHI-NPHIES)');
  console.log('      - Personal Data Protection Law (PDPL)');
  console.log('      - NCA Essential Controls (NCA-ECC)');
  console.log('      - NCA Critical National Assets (NCA-CNCA)');
  console.log('   ✅ ~425 applicable controls');
  console.log('   ✅ 5 users created');
  console.log('   ✅ 90-day comprehensive assessment');

  return result;
}

// ============================================
// EXAMPLE 4: E-COMMERCE PLATFORM
// ============================================

export async function onboard_EcommercePlatform() {

  console.log('\n' + '='.repeat(100));
  console.log('EXAMPLE 4: E-COMMERCE PLATFORM ONBOARDING');
  console.log('='.repeat(100));

  const request: OnboardingRequest = {
    organizationName: 'SouqLink E-Commerce',
    organizationNameAr: 'سوق لينك للتجارة الإلكترونية',
    commercialRegistration: '1010777888',
    taxNumber: '300777888999003',

    sector: 'retail',
    subSector: 'ecommerce',
    legalType: 'limited_liability',
    employeeCount: 180,
    annualRevenueSar: 350_000_000, // 350M SAR

    businessActivities: [
      'online_retail',
      'marketplace',
      'logistics',
      'payment_processing'
    ],
    serviceTypes: [
      'b2c_ecommerce',
      'marketplace_platform',
      'delivery_services'
    ],

    operatesRegions: ['all_saudi'], // Nationwide
    hasInternational: true, // Cross-border shopping

    customerDataRecords: 1_500_000,
    storesPii: true,
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    cloudProviders: ['aws', 'cloudflare'],

    existingCertifications: ['PCI-DSS'],
    complianceMaturity: 'defined',
    criticalInfrastructure: false,
    handlesGovtData: false,

    ownerEmail: 'rania.alotaibi@souqlink.sa',
    ownerName: 'Rania Al-Otaibi',
    ownerPhone: '+966509998888',
    ownerTitle: 'Chief Technology Officer',

    additionalUsers: [
      {
        email: 'youssef.alghamdi@souqlink.sa',
        name: 'Youssef Al-Ghamdi',
        role: 'admin'
      },
      {
        email: 'amal.alsalem@souqlink.sa',
        name: 'Amal Al-Salem',
        role: 'assessor'
      }
    ],

    preferredLanguage: 'en',
    assessmentPriority: 'normal'
  };

  const result = await onboardingEngine.onboardOrganization(request);

  console.log('\n🎉 E-COMMERCE PLATFORM ONBOARDED SUCCESSFULLY!');
  console.log('\nExpected Results:');
  console.log('   ✅ 4 Mandatory Frameworks:');
  console.log('      - Personal Data Protection Law (PDPL)');
  console.log('      - Payment Card Industry (PCI-DSS)');
  console.log('      - E-Commerce Law (ECL)');
  console.log('      - Consumer Protection Law (CPL)');
  console.log('   ✅ 3 Recommended:');
  console.log('      - ISO27001');
  console.log('      - NCA-ECC');
  console.log('      - SOC2');
  console.log('   ✅ ~210 applicable controls');
  console.log('   ✅ 3 users created');

  return result;
}

// ============================================
// EXAMPLE 5: GOVERNMENT ENTITY
// ============================================

export async function onboard_GovernmentEntity() {

  console.log('\n' + '='.repeat(100));
  console.log('EXAMPLE 5: GOVERNMENT ENTITY ONBOARDING');
  console.log('='.repeat(100));

  const request: OnboardingRequest = {
    organizationName: 'Saudi Digital Government Authority',
    organizationNameAr: 'هيئة الحكومة الرقمية السعودية',
    commercialRegistration: '1010000001', // Government entities

    sector: 'government',
    subSector: 'digital_government',
    legalType: 'government_entity',
    employeeCount: 800,

    businessActivities: [
      'digital_transformation',
      'government_services',
      'data_management',
      'cybersecurity'
    ],
    serviceTypes: [
      'government_platform',
      'citizen_services',
      'government_cloud'
    ],

    operatesRegions: ['all_saudi'],
    hasInternational: false,

    customerDataRecords: 10_000_000, // 10M citizen records
    storesPii: true,
    processesPayments: true,
    hasOnlinePlatform: true,
    usesCloudServices: true,
    cloudProviders: ['government_cloud', 'aws_gcc'],

    existingCertifications: ['ISO27001', 'NCA-ECC'],
    complianceMaturity: 'optimizing',
    criticalInfrastructure: true,
    handlesGovtData: true,

    ownerEmail: 'faisal.alrajhi@digitalgovt.gov.sa',
    ownerName: 'Faisal Al-Rajhi',
    ownerTitle: 'Director of Cybersecurity',

    additionalUsers: [
      {
        email: 'maha.alsubaie@digitalgovt.gov.sa',
        name: 'Maha Al-Subaie',
        role: 'admin'
      },
      {
        email: 'abdulaziz.alshammari@digitalgovt.gov.sa',
        name: 'Abdulaziz Al-Shammari',
        role: 'assessor'
      }
    ],

    preferredLanguage: 'ar',
    assessmentPriority: 'urgent'
  };

  const result = await onboardingEngine.onboardOrganization(request);

  console.log('\n🎉 GOVERNMENT ENTITY ONBOARDED SUCCESSFULLY!');
  console.log('\nExpected Results:');
  console.log('   ✅ 8 Mandatory Frameworks:');
  console.log('      - NCA Essential Controls (NCA-ECC) ');
  console.log('      - NCA Critical National Assets (NCA-CNCA)');
  console.log('      - SDAIA Data Governance (SDAIA-DG)');
  console.log('      - Cloud Computing Regulations (NCA-CLOUD)');
  console.log('      - Personal Data Protection Law (PDPL)');
  console.log('      - ISO27001 (Government Standard)');
  console.log('      - NIST Cybersecurity Framework');
  console.log('      - Government Digital Standards');
  console.log('   ✅ ~500 applicable controls');
  console.log('   ✅ Highest compliance requirements');

  return result;
}

// ============================================
// RUN ALL ONBOARDING EXAMPLES
// ============================================

export async function runAllOnboardingExamples() {

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                       ║');
  console.log('║         SHAHIN GRC - ORGANIZATION ONBOARDING DEMONSTRATION            ║');
  console.log('║                                                                       ║');
  console.log('║  Automated onboarding workflow:                                       ║');
  console.log('║  ✅ Organization & profile creation                                   ║');
  console.log('║  ✅ AI-powered framework applicability                                ║');
  console.log('║  ✅ Auto-generate assessment templates                                ║');
  console.log('║  ✅ Assign to owners and team members                                 ║');
  console.log('║  ✅ Seed initial workflow and notifications                           ║');
  console.log('║                                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');

  const results = [];

  try {
    // Example 1: Insurance Company
    const insurance = await onboard_InsuranceCompany();
    results.push(insurance);

    // Example 2: Fintech Startup
    const fintech = await onboard_FintechStartup();
    results.push(fintech);

    // Example 3: Healthcare Provider
    const healthcare = await onboard_HealthcareProvider();
    results.push(healthcare);

    // Example 4: E-Commerce Platform
    const ecommerce = await onboard_EcommercePlatform();
    results.push(ecommerce);

    // Example 5: Government Entity
    const government = await onboard_GovernmentEntity();
    results.push(government);

    console.log('\n' + '='.repeat(100));
    console.log('✅ ALL ONBOARDING EXAMPLES COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(100));
    console.log(`\n   Total Organizations Onboarded: ${results.length}`);
    console.log(`   Total Assessments Created: ${results.reduce((sum, r) => sum + r.assessmentsCreated.length, 0)}`);
    console.log(`   Total Users Created: ${results.reduce((sum, r) => sum + r.usersCreated.length, 0)}`);
    console.log(`   Total Frameworks Assigned: ${results.reduce((sum, r) => sum + r.applicableFrameworks.length, 0)}`);

    console.log('\n📊 BREAKDOWN BY SECTOR:');
    results.forEach((result, index) => {
      const examples = ['Insurance', 'Fintech', 'Healthcare', 'E-Commerce', 'Government'];
      console.log(`\n   ${examples[index]}:`);
      console.log(`      Organization: ${result.organizationId}`);
      console.log(`      Frameworks: ${result.applicableFrameworks.length}`);
      console.log(`      Assessments: ${result.assessmentsCreated.length}`);
      console.log(`      Users: ${result.usersCreated.length}`);
      console.log(`      Estimated Time: ${result.estimatedCompletionTime}`);
    });

    console.log('\n🎯 SYSTEM BENEFITS DEMONSTRATED:');
    console.log('   ✅ Intelligent framework selection (AI-powered)');
    console.log('   ✅ Automated template generation (no manual setup)');
    console.log('   ✅ Instant user assignment (ready to work)');
    console.log('   ✅ Workflow automation (tasks & notifications)');
    console.log('   ✅ Sector-specific compliance (insurance, fintech, healthcare, etc.)');
    console.log('   ✅ Scalable (from 35 to 3500 employees)');
    console.log('   ✅ Bilingual support (Arabic & English)');

  } catch (error) {
    console.error('\n❌ Error running onboarding examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllOnboardingExamples()
    .then(() => {
      console.log('\n✅ Onboarding demonstration complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}
