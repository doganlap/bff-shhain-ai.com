/**
 * ASSESSMENT TEMPLATE GENERATOR
 *
 * Automatically generates customized assessment templates based on:
 * - Organization profile
 * - Applicable frameworks (calculated by ApplicabilityEngine)
 * - Control applicability rules
 * - Scoring factors and risk analysis requirements
 */

import { PrismaClient } from '@prisma/client';
import { applicabilityEngine, OrganizationProfile } from './applicability-engine';

const prisma = new PrismaClient();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  frameworks: FrameworkSection[];
  totalControls: number;
  mandatoryControls: number;
  optionalControls: number;
  estimatedDuration: string;
  createdAt: Date;
}

export interface FrameworkSection {
  frameworkId: string;
  frameworkName: string;
  version?: string;
  isMandatory: boolean;
  priorityLevel: string;
  domains: DomainSection[];
  totalControls: number;
  mandatoryControls: number;
}

export interface DomainSection {
  domainName: string;
  controls: ControlItem[];
}

export interface ControlItem {
  controlId: string;
  title: string;
  title_ar?: string;
  description?: string;
  category: string;
  riskLevel: string;
  isMandatory: boolean;
  evidenceRequired: boolean;
  evidenceTypes: EvidenceRequirement[];
  scoringCriteria: ScoringCriterion[];
  implementationGuidance?: string;
  weightMultiplier: number;
  riskMultiplier: number;
}

export interface EvidenceRequirement {
  type: string;
  name: string;
  description?: string;
  isMandatory: boolean;
  weightPercentage?: number;
  validationCriteria?: any;
}

export interface ScoringCriterion {
  level: number; // 0-5 maturity levels
  label: string;
  description: string;
  score: number;
}

// ============================================
// SCORING MATURITY LEVELS
// ============================================

export const MATURITY_LEVELS: ScoringCriterion[] = [
  {
    level: 0,
    label: 'Not Implemented',
    description: 'Control is not implemented at all. No processes, policies, or technical measures exist.',
    score: 0
  },
  {
    level: 1,
    label: 'Initial/Ad-hoc',
    description: 'Control is implemented in an ad-hoc manner. Processes are undocumented and inconsistent.',
    score: 20
  },
  {
    level: 2,
    label: 'Developing/Repeatable',
    description: 'Control processes are documented and somewhat repeatable. Basic policies exist.',
    score: 40
  },
  {
    level: 3,
    label: 'Defined/Consistent',
    description: 'Control is well-defined, documented, and consistently implemented across the organization.',
    score: 60
  },
  {
    level: 4,
    label: 'Managed/Measured',
    description: 'Control is actively managed, measured, and continuously monitored. Metrics exist.',
    score: 80
  },
  {
    level: 5,
    label: 'Optimizing/Excellent',
    description: 'Control is continuously improved through metrics, automation, and best practices.',
    score: 100
  }
];

// ============================================
// EVIDENCE TYPE DEFINITIONS
// ============================================

export const EVIDENCE_TYPES: Record<string, { name: string; description: string }> = {
  'policy': {
    name: 'Policy Document',
    description: 'Formal policy document approved by management'
  },
  'procedure': {
    name: 'Procedure/Process Document',
    description: 'Step-by-step procedures or process documentation'
  },
  'screenshot': {
    name: 'Screenshot/Visual Evidence',
    description: 'Screenshots showing system configuration or implementation'
  },
  'log': {
    name: 'System Log/Audit Trail',
    description: 'System-generated logs or audit trails'
  },
  'certificate': {
    name: 'Certificate/Attestation',
    description: 'Certificates, licenses, or third-party attestations'
  },
  'report': {
    name: 'Report/Analysis',
    description: 'Analysis reports, risk assessments, or audit reports'
  },
  'configuration': {
    name: 'Configuration File/Settings',
    description: 'System configuration files or settings exports'
  },
  'training': {
    name: 'Training Records',
    description: 'Training completion records, attendance sheets, or certificates'
  },
  'contract': {
    name: 'Contract/Agreement',
    description: 'Contracts, SLAs, or legal agreements'
  },
  'interview': {
    name: 'Interview Notes/Observation',
    description: 'Interview notes or direct observations'
  }
};

// ============================================
// ASSESSMENT TEMPLATE GENERATOR
// ============================================

export class AssessmentTemplateGenerator {
  /**
   * Generate a complete assessment template for an organization
   */
  async generateTemplate(
    organizationId: string,
    tenantId: string,
    templateType: 'comprehensive' | 'quick' | 'risk_based' = 'comprehensive'
  ): Promise<AssessmentTemplate> {
    console.log(`🎯 Generating ${templateType} assessment template for organization ${organizationId}`);

    // Step 1: Get organization profile
    const orgProfile = await this.getOrganizationProfile(organizationId, tenantId);

    // Step 2: Calculate applicable frameworks
    console.log('📊 Calculating applicable frameworks...');
    const applicability = await applicabilityEngine.calculateApplicability(orgProfile);

    // Step 3: Build framework sections with controls
    console.log('📋 Building control sections...');
    const frameworks: FrameworkSection[] = [];
    let totalControls = 0;
    let mandatoryControls = 0;

    for (const applicableFramework of applicability.applicableFrameworks) {
      // Only include applicable frameworks
      if (!applicableFramework.isApplicable) continue;

      // Get framework controls
      const frameworkSection = await this.buildFrameworkSection(
        applicableFramework.frameworkId,
        applicableFramework,
        orgProfile,
        templateType
      );

      frameworks.push(frameworkSection);
      totalControls += frameworkSection.totalControls;
      mandatoryControls += frameworkSection.mandatoryControls;
    }

    // Step 4: Calculate estimated duration
    const estimatedHours = Math.ceil(totalControls * 0.5); // 30 min per control
    const estimatedDays = Math.ceil(estimatedHours / 8);
    const estimatedDuration = estimatedDays <= 1
      ? `${estimatedHours} hours`
      : `${estimatedDays} days`;

    // Step 5: Create template
    const template: AssessmentTemplate = {
      id: this.generateTemplateId(),
      title: `${orgProfile.sector.charAt(0).toUpperCase() + orgProfile.sector.slice(1)} Compliance Assessment`,
      description: `Customized GRC assessment template for ${orgProfile.sector} sector (${orgProfile.companySize} company). ` +
                   `Includes ${applicability.mandatoryCount} mandatory frameworks and ${applicability.optionalCount} recommended frameworks.`,
      organizationId,
      frameworks,
      totalControls,
      mandatoryControls,
      optionalControls: totalControls - mandatoryControls,
      estimatedDuration,
      createdAt: new Date()
    };

    console.log(`✅ Template generated: ${totalControls} controls across ${frameworks.length} frameworks`);

    return template;
  }

  /**
   * Build a framework section with domains and controls
   */
  private async buildFrameworkSection(
    frameworkId: string,
    applicableFramework: any,
    orgProfile: OrganizationProfile,
    templateType: string
  ): Promise<FrameworkSection> {
    // Get framework details
    const framework = await prisma.grc_frameworks.findUnique({
      where: { id: frameworkId }
    });

    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    // Get all controls for this framework
    let controls = await prisma.grc_controls.findMany({
      where: { framework_id: frameworkId },
      orderBy: [
        { category: 'asc' },
        { control_id: 'asc' }
      ]
    });

    // Apply template type filtering
    if (templateType === 'quick') {
      // Quick assessment: Only mandatory and high-risk controls
      controls = controls.filter(c =>
        c.implementation_status === 'mandatory' ||
        c.risk_level === 'high' ||
        c.risk_level === 'critical'
      );
    } else if (templateType === 'risk_based') {
      // Risk-based: Filter by organization's risk profile
      controls = controls.filter(c => {
        if (applicableFramework.isMandatory) return true; // Keep all mandatory framework controls
        return c.risk_level === 'high' || c.risk_level === 'critical';
      });
    }

    // Filter controls by applicability
    const applicableControls: ControlItem[] = [];
    let mandatoryCount = 0;

    for (const control of controls) {
      const controlApplicability = await applicabilityEngine.calculateControlApplicability(
        control.id,
        orgProfile
      );

      if (controlApplicability.isApplicable) {
        // Get evidence requirements
        const evidenceReqs = await this.getEvidenceRequirements(control.id);

        // Build control item
        const controlItem: ControlItem = {
          controlId: control.id,
          title: control.title,
          title_ar: control.title_ar || undefined,
          description: control.description || undefined,
          category: control.category || 'General',
          riskLevel: control.risk_level || 'medium',
          isMandatory: applicableFramework.isMandatory || controlApplicability.isMandatory,
          evidenceRequired: control.evidence_required,
          evidenceTypes: evidenceReqs,
          scoringCriteria: MATURITY_LEVELS,
          implementationGuidance: control.implementation_guidance || undefined,
          weightMultiplier: controlApplicability.weightMultiplier,
          riskMultiplier: controlApplicability.riskMultiplier
        };

        applicableControls.push(controlItem);

        if (controlItem.isMandatory) {
          mandatoryCount++;
        }
      }
    }

    // Group controls by domain/category
    const domains = this.groupControlsByDomain(applicableControls);

    return {
      frameworkId: framework.id,
      frameworkName: framework.name,
      version: framework.version || undefined,
      isMandatory: applicableFramework.isMandatory,
      priorityLevel: applicableFramework.priorityLevel,
      domains,
      totalControls: applicableControls.length,
      mandatoryControls: mandatoryCount
    };
  }

  /**
   * Get evidence requirements for a control
   */
  private async getEvidenceRequirements(controlId: string): Promise<EvidenceRequirement[]> {
    const requirements = await prisma.control_evidence_requirements.findMany({
      where: { control_id: controlId }
    });

    return requirements.map(req => ({
      type: req.evidence_type,
      name: req.evidence_name,
      description: req.description || undefined,
      isMandatory: req.is_mandatory,
      weightPercentage: req.weight_percentage || undefined,
      validationCriteria: req.validation_criteria as any
    }));
  }

  /**
   * Group controls by domain/category
   */
  private groupControlsByDomain(controls: ControlItem[]): DomainSection[] {
    const domainMap = new Map<string, ControlItem[]>();

    for (const control of controls) {
      const domain = control.category || 'General';
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(control);
    }

    const domains: DomainSection[] = [];
    for (const [domainName, domainControls] of domainMap.entries()) {
      domains.push({
        domainName,
        controls: domainControls
      });
    }

    return domains;
  }

  /**
   * Get organization profile from database
   */
  private async getOrganizationProfile(
    organizationId: string,
    tenantId: string
  ): Promise<OrganizationProfile> {
    const profile = await prisma.organization_profile_factors.findUnique({
      where: { organization_id: organizationId }
    });

    if (!profile) {
      throw new Error(`Organization profile not found for ${organizationId}`);
    }

    return {
      organizationId,
      tenantId,
      sector: profile.sector,
      subSector: profile.sub_sector || undefined,
      legalType: profile.legal_type,
      companySize: profile.company_size as any,
      employeeCount: profile.employee_count || undefined,
      annualRevenueSar: profile.annual_revenue_sar || undefined,
      totalAssetsSar: profile.total_assets_sar || undefined,
      businessActivities: JSON.parse(profile.business_activities as string),
      serviceTypes: JSON.parse(profile.service_types as string),
      operatesRegions: JSON.parse(profile.operates_regions as string),
      hasInternational: profile.has_international,
      dataRecords: profile.customer_data_records || undefined,
      storesPii: profile.stores_pii,
      processesPayments: profile.processes_payments,
      hasOnlinePlatform: profile.has_online_platform,
      usesCloudServices: profile.uses_cloud_services,
      existingCertifications: JSON.parse(profile.existing_certifications as string),
      complianceMaturity: profile.compliance_maturity || undefined,
      criticalInfrastructure: profile.critical_infrastructure,
      handlesGovtData: profile.handles_govt_data
    };
  }

  /**
   * Generate unique template ID
   */
  private generateTemplateId(): string {
    return `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create actual assessment from template
   */
  async createAssessmentFromTemplate(
    template: AssessmentTemplate,
    tenantId: string,
    assignedTo?: string
  ): Promise<string> {
    console.log(`📝 Creating assessment from template ${template.id}`);

    // Create assessment record for each framework
    const assessmentIds: string[] = [];

    for (const framework of template.frameworks) {
      const assessment = await prisma.assessments.create({
        data: {
          title: `${framework.frameworkName} Assessment`,
          title_ar: undefined,
          framework_id: framework.frameworkId,
          organization_id: template.organizationId,
          assessment_type: framework.isMandatory ? 'mandatory_compliance' : 'voluntary_assessment',
          status: 'draft',
          progress: 0,
          assigned_to: assignedTo,
          tenant_id: tenantId,
          due_date: this.calculateDueDate(framework.priorityLevel)
        }
      });

      assessmentIds.push(assessment.id);

      // Create assessment_controls records
      for (const domain of framework.domains) {
        for (const control of domain.controls) {
          await prisma.assessment_controls.create({
            data: {
              assessment_id: assessment.id,
              control_id: control.controlId,
              status: 'not_started',
              implementation_status: control.isMandatory ? 'mandatory' : 'optional',
              compliance_status: 'pending',
              evidence_submitted: false,
              tenant_id: tenantId
            }
          });
        }
      }
    }

    console.log(`✅ Created ${assessmentIds.length} assessments with ${template.totalControls} total controls`);

    return assessmentIds[0]; // Return primary assessment ID
  }

  /**
   * Calculate due date based on priority
   */
  private calculateDueDate(priorityLevel: string): Date {
    const now = new Date();
    const daysToAdd = {
      'critical': 30,
      'high': 90,
      'medium': 180,
      'low': 365
    }[priorityLevel] || 180;

    now.setDate(now.getDate() + daysToAdd);
    return now;
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const templateGenerator = new AssessmentTemplateGenerator();
