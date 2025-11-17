/**
 * GRC APPLICABILITY ENGINE
 *
 * Intelligent system that determines which regulatory frameworks and controls
 * apply to an organization based on multiple factors:
 * - Sector & Sub-sector
 * - Company Size (employees, revenue, assets)
 * - Legal Type (LLC, PLC, Branch, etc.)
 * - Business Activities
 * - Geographic Operations
 * - Data Sensitivity
 * - Technology Stack
 * - And many more...
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface OrganizationProfile {
  organizationId: string;
  tenantId: string;

  // Basic Profile
  sector: string;
  subSector?: string;
  legalType: string;
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

  // Size Metrics
  employeeCount?: number;
  annualRevenueSar?: number;
  totalAssetsSar?: number;

  // Business Activities
  businessActivities: string[];
  serviceTypes: string[];

  // Geographic & Technology
  operatesRegions: string[];
  hasInternational: boolean;
  dataRecords?: number;
  storesPii: boolean;
  processesPayments: boolean;
  hasOnlinePlatform: boolean;
  usesCloudServices: boolean;

  // Compliance & Risk
  existingCertifications: string[];
  complianceMaturity?: string;
  criticalInfrastructure: boolean;
  handlesGovtData: boolean;
}

export interface ApplicabilityResult {
  organizationId: string;
  applicableFrameworks: ApplicableFramework[];
  totalFrameworks: number;
  mandatoryCount: number;
  optionalCount: number;
  calculatedAt: Date;
}

export interface ApplicableFramework {
  frameworkId: string;
  frameworkName: string;
  isApplicable: boolean;
  isMandatory: boolean;
  applicabilityScore: number; // 0.0 to 1.0
  reason: string;
  matchingFactors: string[];
  totalControls: number;
  applicableControls: number;
  mandatoryControls: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendedTimeline: string;
  complianceDeadline?: Date;
}

export interface ControlApplicability {
  controlId: string;
  isApplicable: boolean;
  isMandatory: boolean;
  reason: string;
  weightMultiplier: number;
  riskMultiplier: number;
}

// ============================================
// COMPANY SIZE CLASSIFICATION
// ============================================

export function classifyCompanySize(
  employeeCount?: number,
  revenue?: number
): 'micro' | 'small' | 'medium' | 'large' | 'enterprise' {
  // Saudi SME Definition + Custom Classification
  if (employeeCount) {
    if (employeeCount <= 5) return 'micro';
    if (employeeCount <= 49) return 'small';
    if (employeeCount <= 249) return 'medium';
    if (employeeCount <= 999) return 'large';
    return 'enterprise';
  }

  if (revenue) {
    // Revenue in SAR
    if (revenue <= 3000000) return 'micro';      // ≤3M SAR
    if (revenue <= 40000000) return 'small';     // ≤40M SAR
    if (revenue <= 200000000) return 'medium';   // ≤200M SAR
    if (revenue <= 1000000000) return 'large';   // ≤1B SAR
    return 'enterprise';                          // >1B SAR
  }

  return 'medium'; // Default
}

// ============================================
// SECTOR-SPECIFIC FRAMEWORK MAPPING
// ============================================

export const SECTOR_FRAMEWORKS: Record<string, string[]> = {
  // Financial Services
  'banking': [
    'SAMA-CSF',        // SAMA Cybersecurity Framework (MANDATORY)
    'SAMA-ERM',        // SAMA Enterprise Risk Management
    'SAMA-BCM',        // SAMA Business Continuity Management
    'NCA-ECC',         // NCA Essential Cybersecurity Controls
    'PDPL',            // Personal Data Protection Law
    'PCI-DSS',         // Payment Card Industry
    'ISO27001',        // Information Security
    'AML-CFT',         // Anti-Money Laundering
    'BASEL-III'        // Banking Regulations
  ],

  'insurance': [
    'SAMA-INS',        // SAMA Insurance Regulations (MANDATORY)
    'SAMA-CSF',        // SAMA Cybersecurity Framework
    'ICSQ',            // Insurance Cybersecurity Self-Assessment (NEW!)
    'NCA-ECC',         // NCA Essential Controls
    'PDPL',            // Data Protection
    'ISO27001',        // Information Security
    'SOC2',            // Service Organization Controls
    'AML-CFT'          // Anti-Money Laundering
  ],

  'investment': [
    'CMA-CG',          // CMA Corporate Governance (MANDATORY)
    'CMA-MR',          // CMA Market Regulations
    'CMA-DR',          // CMA Disclosure Requirements
    'CMA-IC',          // CMA Internal Controls
    'CMA-AML',         // CMA Anti-Money Laundering
    'NCA-ECC',         // NCA Controls
    'PDPL',            // Data Protection
    'ISO27001'         // Information Security
  ],

  // Healthcare
  'healthcare': [
    'MOH-PS',          // MOH Patient Safety (MANDATORY)
    'MOH-QM',          // MOH Quality Management
    'MOH-EMR',         // MOH Electronic Medical Records
    'MOH-HIS',         // Health Information System Standards
    'CHI-NPHIES',      // Council of Health Insurance - NPHIES
    'PDPL',            // Data Protection (CRITICAL for healthcare)
    'NCA-ECC',         // NCA Controls
    'HIPAA-SEC',       // HIPAA Security Rule (if US patients)
    'ISO27001',        // Information Security
    'HL7-FHIR'         // Healthcare Interoperability
  ],

  'pharmaceuticals': [
    'SFDA-DATA',       // SFDA Data Protection (MANDATORY)
    'SFDA-QM',         // SFDA Quality Management
    'SFDA-GMP',        // Good Manufacturing Practice
    'MOH-QM',          // MOH Quality Standards
    'PDPL',            // Data Protection
    'NCA-ECC',         // NCA Controls
    'ISO27001',        // Information Security
    'ISO13485',        // Medical Devices
    'GxP'              // Good Practice Standards
  ],

  // Telecommunications
  'telecom': [
    'CITC-REG',        // CITC Telecom Regulations (MANDATORY)
    'CITC-CS',         // CITC Cybersecurity
    'CITC-CP',         // CITC Consumer Protection
    'NCA-ECC',         // NCA Essential Controls (MANDATORY for ISPs)
    'NCA-CNCA',        // NCA Critical National Assets
    'PDPL',            // Data Protection
    'ISO27001',        // Information Security
    'ETSI',            // European Telecom Standards
    'ITU'              // International Telecom Union
  ],

  // Energy & Utilities
  'oil_gas': [
    'NCA-CNCA',        // Critical National Assets (MANDATORY)
    'NCA-ECC',         // NCA Essential Controls
    'ARAMCO-SEC',      // Saudi Aramco Security Standards
    'ISO27001',        // Information Security
    'IEC62443',        // Industrial Control Systems Security
    'NIST-CSF',        // NIST Cybersecurity Framework
    'NERC-CIP',        // Energy Security
    'PDPL'             // Data Protection
  ],

  'electricity': [
    'NCA-CNCA',        // Critical Infrastructure (MANDATORY)
    'NCA-ECC',         // NCA Controls
    'SEC-REG',         // Saudi Electricity Company Regulations
    'IEC62443',        // ICS Security
    'NERC-CIP',        // Energy Security
    'ISO27001',        // Information Security
    'NIST-CSF',        // Cybersecurity Framework
    'PDPL'             // Data Protection
  ],

  // Government & Public Sector
  'government': [
    'NCA-ECC',         // NCA Essential Controls (MANDATORY)
    'DGA-DG',          // Digital Government Authority
    'DGA-CLOUD',       // DGA Cloud Computing Framework
    'NCA-CNCA',        // Critical Infrastructure (if applicable)
    'PDPL',            // Data Protection
    'ISO27001',        // Information Security
    'NIST-SP800',      // NIST Special Publications
    'SAMA-CSF'         // If handling financial data
  ],

  // Technology & Digital Services
  'fintech': [
    'SAMA-FST',        // SAMA Financial Technology (MANDATORY)
    'SAMA-CSF',        // SAMA Cybersecurity
    'SAMA-OPSR',       // SAMA Operational Risk
    'NCA-ECC',         // NCA Controls
    'PDPL',            // Data Protection (CRITICAL)
    'PCI-DSS',         // Payment Security
    'ISO27001',        // Information Security
    'SOC2',            // Service Organization Controls
    'GDPR'             // If serving EU customers
  ],

  'ecommerce': [
    'MOCI-CP',         // Ministry of Commerce Consumer Protection (MANDATORY)
    'MOCI-EC',         // E-Commerce Regulations
    'PCI-DSS',         // Payment Security (if processing cards)
    'PDPL',            // Data Protection
    'NCA-ECC',         // NCA Controls (if large)
    'ISO27001',        // Information Security
    'WCAG',            // Web Accessibility
    'GDPR'             // If serving EU customers
  ],

  // Education
  'education': [
    'MOE-EDU',         // Ministry of Education Standards (MANDATORY)
    'MOE-HE',          // Higher Education Standards
    'PDPL',            // Student Data Protection
    'NCA-ECC',         // NCA Controls
    'ISO27001',        // Information Security
    'FERPA'            // If US students
  ],

  // Retail & Consumer
  'retail': [
    'MOCI-CP',         // Consumer Protection
    'PCI-DSS',         // Payment Security (if accepting cards)
    'PDPL',            // Customer Data Protection
    'NCA-ECC',         // NCA Controls (if large)
    'ISO27001'         // Information Security
  ],

  // Transportation & Logistics
  'aviation': [
    'GACA-SEC',        // General Authority of Civil Aviation Security (MANDATORY)
    'GACA-SAFETY',     // Aviation Safety
    'NCA-CNCA',        // Critical Infrastructure
    'NCA-ECC',         // NCA Controls
    'ICAO',            // International Civil Aviation Org
    'TSA',             // Transportation Security
    'PDPL',            // Data Protection
    'ISO27001'         // Information Security
  ],

  'ports': [
    'MAWANI-SEC',      // Saudi Ports Authority Security (MANDATORY)
    'NCA-CNCA',        // Critical Infrastructure
    'NCA-ECC',         // NCA Controls
    'ISPS',            // International Ship & Port Facility Security
    'ISO27001',        // Information Security
    'PDPL'             // Data Protection
  ],

  // Default for unlisted sectors
  'other': [
    'NCA-ECC',         // NCA Essential Controls (if >500 employees or critical)
    'PDPL',            // Data Protection (if handling personal data)
    'ISO27001'         // Information Security (recommended)
  ]
};

// ============================================
// MANDATORY FRAMEWORKS BY REGULATOR
// ============================================

export interface MandatoryRule {
  frameworkId: string;
  regulator: string;
  mandatoryFor: {
    sectors?: string[];
    minEmployees?: number;
    minRevenue?: number;
    conditions?: string[];
  };
  deadline?: string;
  penalties?: string;
}

export const MANDATORY_FRAMEWORKS: MandatoryRule[] = [
  {
    frameworkId: 'NCA-ECC',
    regulator: 'NCA - National Cybersecurity Authority',
    mandatoryFor: {
      sectors: ['banking', 'telecom', 'government', 'healthcare', 'oil_gas', 'electricity', 'aviation', 'ports'],
      minEmployees: 500,
      conditions: [
        'Critical Infrastructure Entities',
        'Organizations processing sensitive government data',
        'Financial institutions (all sizes)',
        'Telecom operators (all sizes)',
        'Healthcare entities processing >100K patient records'
      ]
    },
    deadline: 'Immediate - Already in effect',
    penalties: 'Up to SAR 10 million for non-compliance'
  },
  {
    frameworkId: 'SAMA-CSF',
    regulator: 'SAMA - Saudi Central Bank',
    mandatoryFor: {
      sectors: ['banking', 'insurance', 'fintech', 'payment_services'],
      conditions: [
        'All banks (regardless of size)',
        'All insurance companies',
        'FinTech companies licensed by SAMA',
        'Payment service providers'
      ]
    },
    deadline: 'Immediate - Must maintain continuous compliance',
    penalties: 'License suspension, fines up to SAR 50 million'
  },
  {
    frameworkId: 'PDPL',
    regulator: 'SDAIA - Saudi Data & AI Authority',
    mandatoryFor: {
      conditions: [
        'Any entity collecting, processing, or storing personal data of Saudi residents',
        'Applies to ALL sectors if handling personal data',
        'Extra-territorial application (even if entity outside KSA)'
      ]
    },
    deadline: 'September 14, 2023 (grace period ended)',
    penalties: 'Up to SAR 3 million or 1% of annual revenue (whichever is higher)'
  },
  {
    frameworkId: 'PCI-DSS',
    regulator: 'PCI Security Standards Council',
    mandatoryFor: {
      conditions: [
        'Any entity that stores, processes, or transmits credit card data',
        'E-commerce platforms',
        'Payment gateways',
        'Retail with card payments'
      ]
    },
    deadline: 'Before processing any card transactions',
    penalties: 'Fines from card brands (Visa, Mastercard), potential business suspension'
  },
  {
    frameworkId: 'ICSQ',
    regulator: 'SAMA - Insurance Supervision',
    mandatoryFor: {
      sectors: ['insurance'],
      conditions: [
        'All licensed insurance companies in Saudi Arabia',
        'Annual self-assessment requirement'
      ]
    },
    deadline: 'Annual submission to SAMA',
    penalties: 'Regulatory warnings, operational restrictions'
  }
];

// ============================================
// APPLICABILITY ENGINE CORE LOGIC
// ============================================

export class ApplicabilityEngine {
  /**
   * Calculate which frameworks apply to an organization
   */
  async calculateApplicability(
    profile: OrganizationProfile
  ): Promise<ApplicabilityResult> {
    const startTime = Date.now();

    // Get all frameworks from database
    const allFrameworks = await prisma.grc_frameworks.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        authority: true,
        mandatory: true,
        industry_sector: true,
        total_controls: true
      }
    });

    // Get applicability rules
    const rules = await prisma.regulatory_applicability_rules.findMany({
      where: { tenant_id: profile.tenantId }
    });

    const applicableFrameworks: ApplicableFramework[] = [];

    // Evaluate each framework
    for (const framework of allFrameworks) {
      const result = await this.evaluateFramework(framework, profile, rules);
      if (result.isApplicable) {
        applicableFrameworks.push(result);
      }
    }

    // Sort by priority (mandatory first, then by applicability score)
    applicableFrameworks.sort((a, b) => {
      if (a.isMandatory !== b.isMandatory) {
        return a.isMandatory ? -1 : 1;
      }
      return b.applicabilityScore - a.applicabilityScore;
    });

    // Save to database
    await this.saveApplicabilityResults(profile.organizationId, applicableFrameworks);

    // Update organization profile with cached results
    await prisma.organization_profile_factors.upsert({
      where: { organization_id: profile.organizationId },
      update: {
        applicable_frameworks: JSON.stringify(applicableFrameworks.map(f => f.frameworkId)),
        last_calculated: new Date()
      },
      create: {
        organization_id: profile.organizationId,
        tenant_id: profile.tenantId,
        sector: profile.sector,
        sub_sector: profile.subSector,
        legal_type: profile.legalType,
        company_size: profile.companySize,
        employee_count: profile.employeeCount,
        annual_revenue_sar: profile.annualRevenueSar,
        business_activities: JSON.stringify(profile.businessActivities),
        operates_regions: JSON.stringify(profile.operatesRegions),
        has_international: profile.hasInternational,
        stores_pii: profile.storesPii,
        processes_payments: profile.processesPayments,
        has_online_platform: profile.hasOnlinePlatform,
        uses_cloud_services: profile.usesCloudServices,
        existing_certifications: JSON.stringify(profile.existingCertifications),
        critical_infrastructure: profile.criticalInfrastructure,
        handles_govt_data: profile.handlesGovtData,
        applicable_frameworks: JSON.stringify(applicableFrameworks.map(f => f.frameworkId)),
        last_calculated: new Date()
      }
    });

    const calculationTime = Date.now() - startTime;
    console.log(`✅ Applicability calculated in ${calculationTime}ms`);

    return {
      organizationId: profile.organizationId,
      applicableFrameworks,
      totalFrameworks: applicableFrameworks.length,
      mandatoryCount: applicableFrameworks.filter(f => f.isMandatory).length,
      optionalCount: applicableFrameworks.filter(f => !f.isMandatory).length,
      calculatedAt: new Date()
    };
  }

  /**
   * Evaluate a single framework against organization profile
   */
  private async evaluateFramework(
    framework: any,
    profile: OrganizationProfile,
    rules: any[]
  ): Promise<ApplicableFramework> {
    const matchingFactors: string[] = [];
    let score = 0.0;
    let isMandatory = false;
    let reason = '';

    // Check for mandatory frameworks
    const mandatoryRule = MANDATORY_FRAMEWORKS.find(r =>
      framework.id.startsWith(r.frameworkId)
    );

    if (mandatoryRule) {
      const { mandatoryFor } = mandatoryRule;

      // Check sector
      if (mandatoryFor.sectors?.includes(profile.sector)) {
        isMandatory = true;
        score = 1.0;
        matchingFactors.push(`Mandatory for ${profile.sector} sector`);
        reason = `${mandatoryRule.regulator} requires this framework for all ${profile.sector} entities`;
      }

      // Check employee count threshold
      if (mandatoryFor.minEmployees && profile.employeeCount &&
          profile.employeeCount >= mandatoryFor.minEmployees) {
        isMandatory = true;
        score = 1.0;
        matchingFactors.push(`Company size (${profile.employeeCount} employees) exceeds threshold`);
        reason += ` | Mandatory for organizations with ${mandatoryFor.minEmployees}+ employees`;
      }

      // Check special conditions
      if (profile.criticalInfrastructure &&
          mandatoryFor.conditions?.some(c => c.includes('Critical Infrastructure'))) {
        isMandatory = true;
        score = 1.0;
        matchingFactors.push('Designated as Critical Infrastructure');
        reason += ' | Critical Infrastructure entity';
      }

      if (profile.handlesGovtData &&
          mandatoryRule.frameworkId === 'NCA-ECC') {
        isMandatory = true;
        score = 1.0;
        matchingFactors.push('Processes government data');
        reason += ' | Handles sensitive government data';
      }
    }

    // Check sector-specific frameworks
    const sectorFrameworks = SECTOR_FRAMEWORKS[profile.sector] || SECTOR_FRAMEWORKS['other'];
    if (sectorFrameworks.some(f => framework.id.startsWith(f))) {
      score += 0.6;
      matchingFactors.push(`Relevant to ${profile.sector} sector`);
      if (!reason) reason = `Recommended framework for ${profile.sector} sector`;
    }

    // Check business activities
    const businessActivityMatches = profile.businessActivities.filter(activity => {
      const activityLower = activity.toLowerCase();
      const frameworkNameLower = framework.name.toLowerCase();
      return frameworkNameLower.includes(activityLower) ||
             activityLower.includes(frameworkNameLower.split(' ')[0]);
    });

    if (businessActivityMatches.length > 0) {
      score += 0.3 * (businessActivityMatches.length / profile.businessActivities.length);
      matchingFactors.push(`Business activities: ${businessActivityMatches.join(', ')}`);
    }

    // Data protection requirement
    if (profile.storesPii && framework.id.includes('PDPL')) {
      isMandatory = true;
      score = 1.0;
      matchingFactors.push('Stores personal identifiable information');
      reason = 'PDPL is mandatory for any entity processing personal data of Saudi residents';
    }

    // Payment processing
    if (profile.processesPayments && framework.id.includes('PCI')) {
      isMandatory = true;
      score = 1.0;
      matchingFactors.push('Processes payment card transactions');
      reason = 'PCI-DSS is mandatory for all entities handling credit card data';
    }

    // International operations
    if (profile.hasInternational && framework.id.includes('ISO')) {
      score += 0.4;
      matchingFactors.push('International operations benefit from ISO certifications');
    }

    // Existing certifications
    if (profile.existingCertifications.some(cert => framework.name.includes(cert))) {
      score += 0.2;
      matchingFactors.push('Aligns with existing certifications');
    }

    // Determine priority and timeline
    let priorityLevel: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let recommendedTimeline = '12_months';
    let complianceDeadline: Date | undefined;

    if (isMandatory) {
      priorityLevel = 'critical';
      recommendedTimeline = 'immediate';
      if (mandatoryRule?.deadline) {
        // Set deadline based on rule
        complianceDeadline = new Date();
        complianceDeadline.setMonth(complianceDeadline.getMonth() + 3); // 3 months for immediate
      }
    } else if (score >= 0.8) {
      priorityLevel = 'high';
      recommendedTimeline = '3_months';
    } else if (score >= 0.5) {
      priorityLevel = 'medium';
      recommendedTimeline = '6_months';
    } else {
      priorityLevel = 'low';
      recommendedTimeline = '12_months';
    }

    // Calculate control applicability (simplified - can be enhanced)
    const totalControls = framework.total_controls || 0;
    const applicableControls = Math.round(totalControls * score);
    const mandatoryControls = isMandatory ? Math.round(totalControls * 0.7) : Math.round(totalControls * 0.3);

    return {
      frameworkId: framework.id,
      frameworkName: framework.name,
      isApplicable: score >= 0.3, // 30% threshold for applicability
      isMandatory,
      applicabilityScore: score,
      reason: reason || `Relevance score: ${(score * 100).toFixed(0)}% based on organization profile`,
      matchingFactors,
      totalControls,
      applicableControls,
      mandatoryControls,
      priorityLevel,
      recommendedTimeline,
      complianceDeadline
    };
  }

  /**
   * Calculate control-level applicability
   */
  async calculateControlApplicability(
    controlId: string,
    profile: OrganizationProfile
  ): Promise<ControlApplicability> {
    // Get control applicability logic
    const logic = await prisma.control_applicability_logic.findFirst({
      where: { control_id: controlId }
    });

    if (!logic) {
      // No specific logic - control applies by default
      return {
        controlId,
        isApplicable: true,
        isMandatory: false,
        reason: 'No specific applicability rules defined',
        weightMultiplier: 1.0,
        riskMultiplier: 1.0
      };
    }

    let isApplicable = true;
    const isMandatory = false;
    const reasons: string[] = [];

    // Check sector applicability
    const applicableSectors = logic.applicable_sectors as string[];
    const excludedSectors = logic.excluded_sectors as string[];

    if (excludedSectors.includes(profile.sector)) {
      isApplicable = false;
      reasons.push(`Not applicable to ${profile.sector} sector`);
    } else if (applicableSectors.length > 0 && !applicableSectors.includes(profile.sector)) {
      isApplicable = false;
      reasons.push(`Only applicable to: ${applicableSectors.join(', ')}`);
    } else if (applicableSectors.includes(profile.sector)) {
      reasons.push(`Applicable to ${profile.sector} sector`);
    }

    // Check size thresholds
    if (logic.min_employee_count && profile.employeeCount) {
      if (profile.employeeCount < logic.min_employee_count) {
        isApplicable = false;
        reasons.push(`Requires minimum ${logic.min_employee_count} employees`);
      } else {
        reasons.push('Meets employee threshold');
      }
    }

    // Check technology requirements
    if (logic.requires_online && !profile.hasOnlinePlatform) {
      isApplicable = false;
      reasons.push('Requires online platform');
    }

    if (logic.requires_payment && !profile.processesPayments) {
      isApplicable = false;
      reasons.push('Requires payment processing');
    }

    if (logic.requires_pii && !profile.storesPii) {
      isApplicable = false;
      reasons.push('Requires PII storage');
    }

    // Check business activities
    const requiredActivities = logic.required_activities as string[];
    if (requiredActivities.length > 0) {
      const hasAllRequired = requiredActivities.every(req =>
        profile.businessActivities.includes(req)
      );
      if (!hasAllRequired) {
        isApplicable = false;
        reasons.push(`Missing required activities: ${requiredActivities.join(', ')}`);
      }
    }

    return {
      controlId,
      isApplicable,
      isMandatory,
      reason: reasons.join(' | '),
      weightMultiplier: logic.weight_multiplier,
      riskMultiplier: logic.risk_multiplier
    };
  }

  /**
   * Save applicability results to database
   */
  private async saveApplicabilityResults(
    organizationId: string,
    frameworks: ApplicableFramework[]
  ): Promise<void> {
    // Delete old results
    await prisma.applicable_frameworks_matrix.deleteMany({
      where: { organization_id: organizationId }
    });

    // Insert new results
    for (const framework of frameworks) {
      await prisma.applicable_frameworks_matrix.create({
        data: {
          organization_id: organizationId,
          framework_id: framework.frameworkId,
          tenant_id: '', // Will be filled by caller
          is_applicable: framework.isApplicable,
          is_mandatory: framework.isMandatory,
          applicability_score: framework.applicabilityScore,
          applicability_reason: framework.reason,
          matching_factors: JSON.stringify(framework.matchingFactors),
          total_controls: framework.totalControls,
          applicable_controls: framework.applicableControls,
          mandatory_controls: framework.mandatoryControls,
          priority_level: framework.priorityLevel,
          recommended_timeline: framework.recommendedTimeline,
          compliance_deadline: framework.complianceDeadline,
          calculated_at: new Date(),
          calculation_version: '1.0'
        }
      });
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const applicabilityEngine = new ApplicabilityEngine();
