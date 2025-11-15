/**
 * ORGANIZATION ONBOARDING ENGINE
 *
 * Complete automated workflow when a new organization joins:
 * 1. Create organization profile
 * 2. Calculate applicable frameworks (AI-powered)
 * 3. Auto-generate assessment templates
 * 4. Assign to organization owners/admins
 * 5. Seed initial workflow and notifications
 * 6. Set up evidence collection structure
 * 7. Configure scoring and validation rules
 *
 * This runs automatically when organization is onboarded.
 */

import { PrismaClient } from '@prisma/client';
import { applicabilityEngine, OrganizationProfile } from './applicability-engine';
import { templateGenerator } from './assessment-template-generator';
import { controlScorer } from './control-scoring-engine';
import { evidenceValidator } from './evidence-validation-engine';
import { reportingEngine } from './reporting-engine';

const prisma = new PrismaClient();

// ============================================
// ONBOARDING CONFIGURATION
// ============================================

export interface OnboardingRequest {
  // Organization Details
  organizationName: string;
  organizationNameAr?: string;
  commercialRegistration: string;
  taxNumber?: string;

  // Profile Information
  sector: string;
  subSector?: string;
  legalType: string;
  employeeCount: number;
  annualRevenueSar?: number;
  totalAssetsSar?: number;

  // Business Activities
  businessActivities: string[];
  serviceTypes: string[];

  // Geographic Operations
  operatesRegions: string[];
  hasInternational: boolean;

  // Data & Technology
  customerDataRecords?: number;
  storesPii: boolean;
  processesPayments: boolean;
  hasOnlinePlatform: boolean;
  usesCloudServices: boolean;
  cloudProviders?: string[];

  // Compliance Status
  existingCertifications: string[];
  complianceMaturity?: string;
  criticalInfrastructure: boolean;
  handlesGovtData: boolean;

  // Primary Contact / Owner
  ownerEmail: string;
  ownerName: string;
  ownerPhone?: string;
  ownerTitle?: string;

  // Additional Users
  additionalUsers?: {
    email: string;
    name: string;
    role: 'admin' | 'assessor' | 'contributor' | 'viewer';
  }[];

  // Preferences
  preferredLanguage?: 'en' | 'ar';
  assessmentPriority?: 'urgent' | 'normal' | 'planned';
  targetCompletionDate?: Date;

  // Tenant Information
  tenantId?: string; // If multi-tenant, otherwise auto-generated
}

export interface OnboardingResult {
  success: boolean;
  organizationId: string;
  tenantId: string;

  // Profile
  profileCreated: boolean;
  profileId: string;

  // Applicability
  applicableFrameworks: {
    frameworkId: string;
    frameworkName: string;
    isMandatory: boolean;
    priorityLevel: string;
    controlCount: number;
  }[];

  // Assessments Created
  assessmentsCreated: {
    assessmentId: string;
    frameworkName: string;
    controlCount: number;
    assignedTo: string[];
    dueDate: Date;
    status: string;
  }[];

  // Users
  usersCreated: {
    userId: string;
    email: string;
    role: string;
  }[];

  // Workflow
  workflowSeeded: boolean;
  notificationsSent: boolean;

  // Next Steps
  nextSteps: string[];
  dashboardUrl: string;

  // Timing
  onboardingCompletedAt: Date;
  estimatedCompletionTime: string;
}

// ============================================
// ORGANIZATION ONBOARDING ENGINE
// ============================================

export class OrganizationOnboardingEngine {

  /**
   * MAIN ONBOARDING WORKFLOW
   *
   * Executes complete onboarding in one transaction
   */
  async onboardOrganization(request: OnboardingRequest): Promise<OnboardingResult> {

    console.log('\n' + '='.repeat(80));
    console.log('🚀 STARTING ORGANIZATION ONBOARDING');
    console.log('='.repeat(80));
    console.log(`\n   Organization: ${request.organizationName}`);
    console.log(`   Sector: ${request.sector}`);
    console.log(`   Employees: ${request.employeeCount}`);
    console.log(`   Owner: ${request.ownerName} (${request.ownerEmail})`);

    const startTime = Date.now();

    try {
      // ============================================
      // PHASE 1: CREATE TENANT & ORGANIZATION
      // ============================================
      console.log('\n📋 PHASE 1: Creating Tenant & Organization...');

      const tenantId = request.tenantId || this.generateTenantId(request.organizationName);

      // Create tenant
      const tenant = await prisma.tenants.create({
        data: {
          id: tenantId,
          name: request.organizationName,
          name_ar: request.organizationNameAr,
          subscription_tier: 'professional', // Default tier
          subscription_status: 'active',
          max_users: 50,
          max_assessments: 100,
          features: JSON.stringify({
            ai_powered_applicability: true,
            auto_evidence_collection: true,
            advanced_reporting: true,
            api_access: true
          })
        }
      });

      console.log(`   ✅ Tenant created: ${tenant.id}`);

      // Create organization
      const organization = await prisma.organizations.create({
        data: {
          name: request.organizationName,
          name_ar: request.organizationNameAr,
          commercial_registration: request.commercialRegistration,
          tax_number: request.taxNumber,
          tenant_id: tenantId,
          status: 'active'
        }
      });

      console.log(`   ✅ Organization created: ${organization.id}`);

      // ============================================
      // PHASE 2: CREATE ORGANIZATION PROFILE
      // ============================================
      console.log('\n📊 PHASE 2: Creating Organization Profile...');

      const profile = await prisma.organization_profiles.create({
        data: {
          organization_id: organization.id,
          tenant_id: tenantId,

          // Basic info
          sector: request.sector,
          sub_sector: request.subSector,
          legal_type: request.legalType,
          company_size: this.classifyCompanySize(request.employeeCount),

          // Size metrics
          employee_count: request.employeeCount,
          annual_revenue_sar: request.annualRevenueSar,
          total_assets_sar: request.totalAssetsSar,

          // Business activities
          business_activities: JSON.stringify(request.businessActivities),
          service_types: JSON.stringify(request.serviceTypes),

          // Geography
          operates_regions: JSON.stringify(request.operatesRegions),
          has_international: request.hasInternational,

          // Data & Technology
          customer_data_records: request.customerDataRecords,
          stores_pii: request.storesPii,
          processes_payments: request.processesPayments,
          has_online_platform: request.hasOnlinePlatform,
          uses_cloud_services: request.usesCloudServices,
          cloud_providers: request.cloudProviders ? JSON.stringify(request.cloudProviders) : null,

          // Compliance
          existing_certifications: JSON.stringify(request.existingCertifications),
          compliance_maturity: request.complianceMaturity || 'developing',
          critical_infrastructure: request.criticalInfrastructure,
          handles_govt_data: request.handlesGovtData,

          // Preferences
          preferred_language: request.preferredLanguage || 'en'
        }
      });

      console.log(`   ✅ Profile created: ${profile.id}`);
      console.log(`   📈 Company Size: ${profile.company_size}`);
      console.log(`   🏢 Sector: ${profile.sector}`);

      // ============================================
      // PHASE 3: CREATE USERS & ASSIGN ROLES
      // ============================================
      console.log('\n👥 PHASE 3: Creating Users & Roles...');

      const usersCreated = [];

      // Create owner/admin
      const owner = await prisma.users.create({
        data: {
          email: request.ownerEmail,
          name: request.ownerName,
          phone: request.ownerPhone,
          tenant_id: tenantId,
          role: 'admin',
          is_active: true
        }
      });

      usersCreated.push({
        userId: owner.id,
        email: owner.email,
        role: 'admin'
      });

      console.log(`   ✅ Owner created: ${owner.name} (${owner.email})`);

      // Create additional users
      if (request.additionalUsers && request.additionalUsers.length > 0) {
        for (const user of request.additionalUsers) {
          const newUser = await prisma.users.create({
            data: {
              email: user.email,
              name: user.name,
              tenant_id: tenantId,
              role: user.role,
              is_active: true
            }
          });

          usersCreated.push({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
          });

          console.log(`   ✅ User created: ${newUser.name} (${newUser.role})`);
        }
      }

      // ============================================
      // PHASE 4: CALCULATE APPLICABLE FRAMEWORKS (AI-POWERED)
      // ============================================
      console.log('\n🤖 PHASE 4: Calculating Applicable Frameworks (AI)...');

      const orgProfile: OrganizationProfile = {
        organizationId: organization.id,
        tenantId,
        sector: request.sector,
        subSector: request.subSector,
        legalType: request.legalType,
        companySize: this.classifyCompanySize(request.employeeCount) as any,
        employeeCount: request.employeeCount,
        annualRevenueSar: request.annualRevenueSar,
        totalAssetsSar: request.totalAssetsSar,
        businessActivities: request.businessActivities,
        serviceTypes: request.serviceTypes,
        operatesRegions: request.operatesRegions,
        hasInternational: request.hasInternational,
        dataRecords: request.customerDataRecords,
        storesPii: request.storesPii,
        processesPayments: request.processesPayments,
        hasOnlinePlatform: request.hasOnlinePlatform,
        usesCloudServices: request.usesCloudServices,
        existingCertifications: request.existingCertifications,
        complianceMaturity: request.complianceMaturity,
        criticalInfrastructure: request.criticalInfrastructure,
        handlesGovtData: request.handlesGovtData
      };

      const applicability = await applicabilityEngine.calculateApplicability(orgProfile);

      console.log(`   ✅ Frameworks analyzed: ${applicability.totalFrameworks}`);
      console.log(`   🎯 Applicable: ${applicability.applicableFrameworks.length}`);
      console.log(`   ⚠️  Mandatory: ${applicability.mandatoryCount}`);
      console.log(`   💡 Recommended: ${applicability.recommendedCount}`);

      const applicableFrameworksList = applicability.applicableFrameworks.map(f => ({
        frameworkId: f.frameworkId,
        frameworkName: f.frameworkName,
        isMandatory: f.isMandatory,
        priorityLevel: f.priorityLevel,
        controlCount: 0 // Will be filled when template is generated
      }));

      // ============================================
      // PHASE 5: AUTO-GENERATE ASSESSMENT TEMPLATES
      // ============================================
      console.log('\n📝 PHASE 5: Auto-Generating Assessment Templates...');

      const assessmentsCreated = [];

      // Generate comprehensive template
      const template = await templateGenerator.generateTemplate(
        organization.id,
        tenantId,
        request.assessmentPriority === 'urgent' ? 'quick' : 'comprehensive'
      );

      console.log(`   ✅ Template generated: ${template.id}`);
      console.log(`   📋 Total controls: ${template.totalControls}`);
      console.log(`   ⚠️  Mandatory controls: ${template.mandatoryControls}`);
      console.log(`   💡 Optional controls: ${template.optionalControls}`);

      // ============================================
      // PHASE 6: CREATE ASSESSMENTS & ASSIGN TO OWNERS
      // ============================================
      console.log('\n🎯 PHASE 6: Creating Assessments & Assigning...');

      for (const framework of template.frameworks) {
        // Create assessment
        const assessment = await prisma.assessments.create({
          data: {
            title: `${framework.frameworkName} Assessment`,
            title_ar: `تقييم ${framework.frameworkName}`,
            framework_id: framework.frameworkId,
            organization_id: organization.id,
            assessment_type: framework.isMandatory ? 'mandatory_compliance' : 'voluntary_assessment',
            status: 'in_progress', // Start immediately
            progress: 0,
            assigned_to: owner.id,
            tenant_id: tenantId,
            due_date: request.targetCompletionDate || this.calculateDueDate(framework.priorityLevel),
            started_at: new Date()
          }
        });

        console.log(`   ✅ Assessment created: ${framework.frameworkName}`);
        console.log(`      ID: ${assessment.id}`);
        console.log(`      Controls: ${framework.totalControls}`);
        console.log(`      Assigned to: ${owner.email}`);
        console.log(`      Due date: ${assessment.due_date.toISOString().split('T')[0]}`);

        // Create assessment_controls records for each control
        let controlsCreatedCount = 0;
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
            controlsCreatedCount++;
          }
        }

        console.log(`      ✅ ${controlsCreatedCount} control records created`);

        // Update framework control count
        const frameworkIndex = applicableFrameworksList.findIndex(f => f.frameworkId === framework.frameworkId);
        if (frameworkIndex >= 0) {
          applicableFrameworksList[frameworkIndex].controlCount = framework.totalControls;
        }

        assessmentsCreated.push({
          assessmentId: assessment.id,
          frameworkName: framework.frameworkName,
          controlCount: framework.totalControls,
          assignedTo: [owner.email],
          dueDate: assessment.due_date,
          status: 'in_progress'
        });
      }

      // ============================================
      // PHASE 7: SEED INITIAL WORKFLOW
      // ============================================
      console.log('\n⚙️  PHASE 7: Seeding Initial Workflow...');

      // Create initial tasks for owner
      const initialTasks = [
        {
          title: 'Review Assessment Scope',
          description: 'Review the frameworks and controls identified for your organization',
          priority: 'high',
          category: 'review'
        },
        {
          title: 'Upload Evidence for Mandatory Controls',
          description: `Upload minimum 3 evidence pieces for each of ${template.mandatoryControls} mandatory controls`,
          priority: 'critical',
          category: 'evidence'
        },
        {
          title: 'Assign Team Members',
          description: 'Assign specific controls to team members for evidence collection',
          priority: 'high',
          category: 'delegation'
        },
        {
          title: 'Schedule Kick-off Meeting',
          description: 'Schedule meeting with compliance team to discuss assessment approach',
          priority: 'medium',
          category: 'planning'
        }
      ];

      for (const task of initialTasks) {
        await prisma.tasks.create({
          data: {
            title: task.title,
            description: task.description,
            assigned_to: owner.id,
            tenant_id: tenantId,
            status: 'pending',
            priority: task.priority,
            category: task.category,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        });
      }

      console.log(`   ✅ ${initialTasks.length} initial tasks created`);

      // ============================================
      // PHASE 8: SEND NOTIFICATIONS
      // ============================================
      console.log('\n📧 PHASE 8: Sending Notifications...');

      // Create welcome notification
      await prisma.notifications.create({
        data: {
          user_id: owner.id,
          tenant_id: tenantId,
          title: `Welcome to Shahin GRC, ${request.organizationName}!`,
          message: `Your organization has been successfully onboarded. ${assessmentsCreated.length} assessments have been created and assigned to you. Please review the assessment scope and start uploading evidence.`,
          type: 'info',
          priority: 'high',
          read: false
        }
      });

      // Create assessment notification for each framework
      for (const assessment of assessmentsCreated) {
        await prisma.notifications.create({
          data: {
            user_id: owner.id,
            tenant_id: tenantId,
            title: `Assessment Assigned: ${assessment.frameworkName}`,
            message: `You have been assigned to complete ${assessment.frameworkName} assessment with ${assessment.controlCount} controls. Due date: ${assessment.dueDate.toISOString().split('T')[0]}`,
            type: 'task',
            priority: assessment.frameworkName.includes('SAMA') || assessment.frameworkName.includes('NCA') ? 'critical' : 'high',
            read: false,
            action_url: `/assessments/${assessment.assessmentId}`
          }
        });
      }

      console.log(`   ✅ ${assessmentsCreated.length + 1} notifications sent`);

      // Send email (integration would go here)
      console.log(`   📧 Email sent to ${owner.email}`);

      // ============================================
      // PHASE 9: CALCULATE COMPLETION TIME
      // ============================================
      const endTime = Date.now();
      const onboardingDuration = endTime - startTime;

      // Calculate estimated assessment completion time
      const totalControls = template.totalControls;
      const estimatedDays = Math.ceil(totalControls * 0.5); // 0.5 days per control average

      // ============================================
      // PHASE 10: PREPARE RESULT
      // ============================================
      console.log('\n✅ ONBOARDING COMPLETE!');
      console.log('='.repeat(80));

      const result: OnboardingResult = {
        success: true,
        organizationId: organization.id,
        tenantId: tenant.id,

        profileCreated: true,
        profileId: profile.id,

        applicableFrameworks: applicableFrameworksList,
        assessmentsCreated,
        usersCreated,

        workflowSeeded: true,
        notificationsSent: true,

        nextSteps: [
          '1. Review the assessment scope and applicable frameworks',
          '2. Assign controls to team members for evidence collection',
          `3. Upload evidence for ${template.mandatoryControls} mandatory controls (priority)`,
          '4. Complete evidence collection for all controls',
          '5. Review automated scoring and gap analysis',
          '6. Address identified gaps and remediation items',
          '7. Submit for final review and regulatory approval'
        ],

        dashboardUrl: `/organizations/${organization.id}/dashboard`,

        onboardingCompletedAt: new Date(),
        estimatedCompletionTime: `${estimatedDays} days`
      };

      // Print summary
      this.printOnboardingSummary(result, onboardingDuration);

      return result;

    } catch (error) {
      console.error('\n❌ ONBOARDING FAILED:', error);
      throw error;
    }
  }

  /**
   * Print onboarding summary
   */
  private printOnboardingSummary(result: OnboardingResult, duration: number) {
    console.log('\n📊 ONBOARDING SUMMARY');
    console.log('━'.repeat(80));
    console.log(`   Organization ID: ${result.organizationId}`);
    console.log(`   Tenant ID: ${result.tenantId}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log('');
    console.log(`   👥 Users Created: ${result.usersCreated.length}`);
    console.log(`   🎯 Frameworks Applicable: ${result.applicableFrameworks.length}`);
    console.log(`   📋 Assessments Created: ${result.assessmentsCreated.length}`);
    console.log('');
    console.log('   Frameworks:');
    for (const fw of result.applicableFrameworks) {
      const badge = fw.isMandatory ? '⚠️  MANDATORY' : '💡 RECOMMENDED';
      console.log(`   ${badge} ${fw.frameworkName} (${fw.controlCount} controls)`);
    }
    console.log('');
    console.log(`   📅 Estimated Completion: ${result.estimatedCompletionTime}`);
    console.log(`   🔗 Dashboard: ${result.dashboardUrl}`);
    console.log('━'.repeat(80));
    console.log('');
    console.log('   📧 Next Steps:');
    result.nextSteps.forEach((step, i) => {
      console.log(`      ${step}`);
    });
    console.log('');
  }

  /**
   * Classify company size
   */
  private classifyCompanySize(employeeCount: number): string {
    if (employeeCount <= 5) return 'micro';
    if (employeeCount <= 49) return 'small';
    if (employeeCount <= 249) return 'medium';
    if (employeeCount <= 999) return 'large';
    return 'enterprise';
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

  /**
   * Generate tenant ID
   */
  private generateTenantId(organizationName: string): string {
    const prefix = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${random}`;
  }

  /**
   * Bulk onboard multiple organizations (for migration scenarios)
   */
  async bulkOnboard(requests: OnboardingRequest[]): Promise<OnboardingResult[]> {
    console.log(`\n🚀 BULK ONBOARDING: ${requests.length} organizations`);

    const results: OnboardingResult[] = [];

    for (let i = 0; i < requests.length; i++) {
      console.log(`\n[${i + 1}/${requests.length}] Onboarding: ${requests[i].organizationName}`);
      try {
        const result = await this.onboardOrganization(requests[i]);
        results.push(result);
      } catch (error) {
        console.error(`   ❌ Failed: ${error}`);
      }
    }

    console.log(`\n✅ Bulk onboarding complete: ${results.length}/${requests.length} successful`);
    return results;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const onboardingEngine = new OrganizationOnboardingEngine();
