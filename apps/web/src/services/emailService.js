/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EMAIL SERVICE - Registration Confirmations & Agent Notifications
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🔧 DATABASE INTEGRATION REQUIREMENTS:
 * ────────────────────────────────────────────────────────────────────────────
 * 
 * 1. DATABASE TABLE SCHEMA (PostgreSQL/MySQL):
 * 
 *    CREATE TABLE registrations (
 *      id SERIAL PRIMARY KEY,
 *      registration_id VARCHAR(50) UNIQUE NOT NULL,
 *      
 *      -- Personal Information
 *      first_name VARCHAR(100) NOT NULL,
 *      last_name VARCHAR(100) NOT NULL,
 *      email VARCHAR(255) UNIQUE NOT NULL,
 *      country_code VARCHAR(10) NOT NULL,
 *      phone VARCHAR(20) NOT NULL,
 *      job_title VARCHAR(150),
 *      department VARCHAR(100),
 *      
 *      -- Organization Information
 *      organization_name VARCHAR(255) NOT NULL,
 *      legal_structure VARCHAR(100) NOT NULL,
 *      industry VARCHAR(100) NOT NULL,
 *      employee_count VARCHAR(50) NOT NULL,
 *      looking_for VARCHAR(150) NOT NULL,
 *      
 *      -- Address Information
 *      address TEXT NOT NULL,
 *      country VARCHAR(100) NOT NULL,
 *      city VARCHAR(100) NOT NULL,
 *      website VARCHAR(255),
 *      has_internal_office VARCHAR(20) NOT NULL,
 *      
 *      -- System Fields
 *      status VARCHAR(50) DEFAULT 'pending_verification',
 *      locale VARCHAR(10) DEFAULT 'ar-SA',
 *      source VARCHAR(100) DEFAULT 'shahin-ai-ksa-platform',
 *      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *      email_verified BOOLEAN DEFAULT FALSE,
 *      email_verified_at TIMESTAMP,
 *      last_contacted_at TIMESTAMP,
 *      
 *      -- Metadata
 *      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *      
 *      INDEX idx_email (email),
 *      INDEX idx_registration_id (registration_id),
 *      INDEX idx_status (status),
 *      INDEX idx_created_at (created_at)
 *    );
 * 
 * 2. API ENDPOINT INTEGRATION:
 *    - POST /api/v1/registrations
 *    - Body: All registration data from form
 *    - Response: { success: true, registrationId: "REG-123456", data: {...} }
 * 
 * 3. EMAIL SERVICE INTEGRATION:
 *    - Service: SendGrid / AWS SES / Mailgun / Brevo
 *    - Templates: registration_confirmation, agent_notification
 *    - Configuration: SMTP or API-based
 * 
 * 4. AGENT NOTIFICATION:
 *    - Email: registrations@shahin-ai.com, sales@shahin-ai.com
 *    - Slack/Teams webhook (optional)
 *    - Real-time dashboard notification
 * 
 * 5. EMAIL VERIFICATION FLOW:
 *    - Generate verification token
 *    - Send verification link via email
 *    - Create verification endpoint: GET /api/v1/verify-email?token=xxx
 *    - Update email_verified = true on successful verification
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

class EmailService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.templates = {
      registration_confirmation: {
        subject: {
          en: 'Shahin-AI KSA Registration Confirmation',
          ar: 'تأكيد التسجيل في شاهين الذكي السعودية'
        },
        template: 'registration_confirmation'
      },
      agent_notification: {
        subject: {
          en: 'New Registration - Action Required',
          ar: 'تسجيل جديد - مطلوب إجراء'
        },
        template: 'agent_notification'
      }
    };
  }

  async sendRegistrationConfirmation(registrationData) {
    const emailData = {
      to: registrationData.email,
      cc: ['registrations@shahin-ai.com'],
      subject: this.templates.registration_confirmation.subject.en,
      template: 'registration_confirmation',
      data: {
        // User Information
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        fullName: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        phone: registrationData.phone,
        
        // Organization Information
        organizationName: registrationData.organizationName,
        organizationType: registrationData.organizationType,
        industry: registrationData.industry,
        city: registrationData.city,
        country: registrationData.country,
        
        // Registration Details
        registrationId: `SAI-${Date.now()}`,
        registrationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        registrationDateAr: new Date().toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        
        // Process Information
        approvalTimeframe: '24-48 hours',
        approvalTimeframeAr: '24-48 ساعة',
        
        // Contact Information
        supportEmail: 'support@shahin-ai.com',
        supportPhone: '+966 11 123 4567',
        websiteUrl: 'https://shahin-ai.com',
        
        // Next Steps
        nextSteps: [
          {
            step: 1,
            description: 'Application review by our compliance team',
            descriptionAr: 'مراجعة الطلب من قبل فريق الامتثال'
          },
          {
            step: 2,
            description: 'Background verification and organization validation',
            descriptionAr: 'التحقق من الخلفية والتحقق من صحة المؤسسة'
          },
          {
            step: 3,
            description: 'Access credentials and onboarding materials sent via email',
            descriptionAr: 'إرسال بيانات الوصول ومواد التأهيل عبر البريد الإلكتروني'
          },
          {
            step: 4,
            description: 'Dedicated agent assignment and initial consultation',
            descriptionAr: 'تعيين وكيل مخصص واستشارة أولية'
          }
        ]
      }
    };

    try {
      // Simulate email sending - replace with actual email service
      console.log('📧 Sending registration confirmation email:', emailData);
      
      // In production, this would call your email service API
      // const response = await fetch(`${this.apiUrl}/api/email/send`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // });
      
      // Simulate successful email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'Registration confirmation email sent successfully'
      };
      
    } catch (error) {
      console.error('Failed to send registration confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  async sendAgentNotification(registrationData) {
    const agentEmailData = {
      to: ['agents@shahin-ai.com', 'compliance@shahin-ai.com'],
      subject: this.templates.agent_notification.subject.en,
      template: 'agent_notification',
      priority: 'high',
      data: {
        // Registration Summary
        registrationId: `SAI-${Date.now()}`,
        submissionTime: new Date().toISOString(),
        
        // Applicant Information
        applicant: {
          name: `${registrationData.firstName} ${registrationData.lastName}`,
          email: registrationData.email,
          phone: registrationData.phone
        },
        
        // Organization Information
        organization: {
          name: registrationData.organizationName,
          type: registrationData.organizationType,
          industry: registrationData.industry,
          location: `${registrationData.city}, ${registrationData.country}`
        },
        
        // Required Actions
        requiredActions: [
          {
            action: 'Review application documents',
            priority: 'high',
            deadline: '24 hours'
          },
          {
            action: 'Verify organization credentials',
            priority: 'high',
            deadline: '24 hours'
          },
          {
            action: 'Conduct background check',
            priority: 'medium',
            deadline: '48 hours'
          },
          {
            action: 'Assign dedicated agent',
            priority: 'medium',
            deadline: '48 hours'
          },
          {
            action: 'Prepare onboarding materials',
            priority: 'low',
            deadline: '72 hours'
          }
        ],
        
        // Dashboard Links
        dashboardUrl: 'https://admin.shahin-ai.com/registrations',
        applicantProfileUrl: `https://admin.shahin-ai.com/registrations/SAI-${Date.now()}`,
        
        // Compliance Notes
        complianceNotes: [
          'Verify SAMA registration if financial institution',
          'Check against sanctions lists',
          'Validate business license',
          'Confirm authorized signatory'
        ]
      }
    };

    try {
      console.log('📧 Sending agent notification email:', agentEmailData);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `agent_msg_${Date.now()}`,
        message: 'Agent notification sent successfully'
      };
      
    } catch (error) {
      console.error('Failed to send agent notification:', error);
      throw new Error('Failed to send agent notification');
    }
  }

  async sendApprovalNotification(registrationData, approvalData) {
    const approvalEmailData = {
      to: registrationData.email,
      subject: 'Shahin-AI KSA Access Approved - Welcome!',
      template: 'approval_notification',
      data: {
        ...registrationData,
        ...approvalData,
        loginUrl: 'https://app.shahin-ai.com/login',
        agentContact: approvalData.assignedAgent,
        onboardingSchedule: approvalData.onboardingDate
      }
    };

    try {
      console.log('📧 Sending approval notification:', approvalEmailData);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `approval_${Date.now()}`,
        message: 'Approval notification sent successfully'
      };
      
    } catch (error) {
      console.error('Failed to send approval notification:', error);
      throw new Error('Failed to send approval notification');
    }
  }

  // Database registration simulation
  async saveRegistrationToDatabase(registrationData) {
    const dbRecord = {
      id: `SAI-${Date.now()}`,
      ...registrationData,
      status: 'pending_review',
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      reviewStatus: {
        documentsReviewed: false,
        backgroundCheckCompleted: false,
        organizationVerified: false,
        agentAssigned: false
      },
      assignedAgent: null,
      approvalDate: null,
      rejectionReason: null,
      notes: []
    };

    try {
      console.log('💾 Saving registration to database:', dbRecord);
      
      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store in localStorage for demo purposes
      const existingRegistrations = JSON.parse(localStorage.getItem('shahin_registrations') || '[]');
      existingRegistrations.push(dbRecord);
      localStorage.setItem('shahin_registrations', JSON.stringify(existingRegistrations));
      
      return {
        success: true,
        registrationId: dbRecord.id,
        record: dbRecord
      };
      
    } catch (error) {
      console.error('Failed to save registration:', error);
      throw new Error('Failed to save registration to database');
    }
  }

  // Complete registration process
  async processRegistration(registrationData) {
    try {
      // 1. Save to database
      const dbResult = await this.saveRegistrationToDatabase(registrationData);
      
      // 2. Send confirmation email to user
      const confirmationResult = await this.sendRegistrationConfirmation({
        ...registrationData,
        registrationId: dbResult.registrationId
      });
      
      // 3. Send notification to agents
      const agentNotificationResult = await this.sendAgentNotification({
        ...registrationData,
        registrationId: dbResult.registrationId
      });
      
      return {
        success: true,
        registrationId: dbResult.registrationId,
        confirmationSent: confirmationResult.success,
        agentNotified: agentNotificationResult.success,
        message: 'Registration processed successfully'
      };
      
    } catch (error) {
      console.error('Registration process failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
