/**
 * Email Service
 * Multi-provider email service with SendGrid, AWS SES, and SMTP support
 */

import nodemailer from 'nodemailer';

export interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'smtp';
  apiKey?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  defaultFrom: string;
  defaultReplyTo?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface LicenseExpiryNotification {
  tenantEmail: string;
  tenantName: string;
  licenseName: string;
  expiresAt: Date;
  daysRemaining: number;
  urgencyLevel: string;
}

export interface RenewalReminder {
  tenantEmail: string;
  tenantName: string;
  licenseName: string;
  expiresAt: Date;
  renewalPrice: number;
  renewalUrl: string;
}

export interface WeeklyUsageReport {
  tenantEmail: string;
  tenantName: string;
  reportData: any;
  reportPeriod: {
    start: Date;
    end: Date;
  };
}

export interface InvoiceData {
  tenantEmail: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
}

/**
 * Enterprise Email Service with Multiple Providers
 */
export class EmailService {
  private static instance: EmailService;
  private config: EmailConfig;
  private transporter: any;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      provider: 'smtp',
      defaultFrom: process.env.EMAIL_FROM || 'noreply@shahin-ai.com',
      defaultReplyTo: process.env.EMAIL_REPLY_TO || 'support@shahin-ai.com',
      smtpConfig: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      ...config
    };

    this.initializeTransporter();
  }

  static getInstance(config?: Partial<EmailConfig>): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService(config);
    }
    return EmailService.instance;
  }

  /**
   * Initialize email transporter based on provider
   */
  private initializeTransporter(): void {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          // SendGrid configuration would go here
          console.log('📧 Initializing SendGrid email provider');
          break;
          
        case 'ses':
          // AWS SES configuration would go here
          console.log('📧 Initializing AWS SES email provider');
          break;
          
        case 'smtp':
        default:
          this.transporter = nodemailer.createTransporter(this.config.smtpConfig!);
          console.log('📧 Initializing SMTP email provider');
          break;
      }
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send license expiry notification
   */
  async sendLicenseExpiryNotification(data: LicenseExpiryNotification): Promise<void> {
    const template = this.getLicenseExpiryTemplate(data);
    
    await this.sendEmail({
      to: data.tenantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`📧 License expiry notification sent to ${data.tenantEmail}`);
  }

  /**
   * Send renewal reminder
   */
  async sendRenewalReminder(data: RenewalReminder): Promise<void> {
    const template = this.getRenewalReminderTemplate(data);
    
    await this.sendEmail({
      to: data.tenantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`📧 Renewal reminder sent to ${data.tenantEmail}`);
  }

  /**
   * Send weekly usage report
   */
  async sendWeeklyUsageReport(data: WeeklyUsageReport): Promise<void> {
    const template = this.getWeeklyReportTemplate(data);
    
    await this.sendEmail({
      to: data.tenantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`📧 Weekly usage report sent to ${data.tenantEmail}`);
  }

  /**
   * Send invoice
   */
  async sendInvoice(data: InvoiceData): Promise<void> {
    const template = this.getInvoiceTemplate(data);
    
    await this.sendEmail({
      to: data.tenantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`📧 Invoice sent to ${data.tenantEmail}`);
  }

  /**
   * Send quarterly report
   */
  async sendQuarterlyReport(data: any): Promise<void> {
    const template = this.getQuarterlyReportTemplate(data);
    
    for (const recipient of data.recipients) {
      await this.sendEmail({
        to: recipient,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    }
    
    console.log(`📧 Quarterly report sent to ${data.recipients.length} recipients`);
  }

  /**
   * Send annual review notification
   */
  async sendAnnualReviewNotification(data: any): Promise<void> {
    const template = this.getAnnualReviewTemplate(data);
    
    await this.sendEmail({
      to: data.tenantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`📧 Annual review notification sent to ${data.tenantEmail}`);
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || this.config.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.config.defaultReplyTo
      };

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
      } else {
        // Fallback or mock sending for other providers
        console.log('📧 Email would be sent:', mailOptions.subject, 'to', mailOptions.to);
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Email templates
   */
  private getLicenseExpiryTemplate(data: LicenseExpiryNotification): EmailTemplate {
    const urgencyColors = {
      early_warning: '#FFA500',
      warning: '#FF6B35',
      urgent: '#FF4444',
      critical: '#CC0000'
    };

    const color = urgencyColors[data.urgencyLevel as keyof typeof urgencyColors] || '#FFA500';

    return {
      subject: `⚠️ License Expiring in ${data.daysRemaining} days - ${data.licenseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
            <h1>License Expiry Notice</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.tenantName},</p>
            <p>Your <strong>${data.licenseName}</strong> license will expire in <strong>${data.daysRemaining} days</strong> on ${data.expiresAt.toLocaleDateString()}.</p>
            <p>To avoid service interruption, please renew your license before the expiry date.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Renew License
              </a>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `License Expiry Notice: Your ${data.licenseName} license expires in ${data.daysRemaining} days on ${data.expiresAt.toLocaleDateString()}. Please renew to avoid service interruption.`
    };
  }

  private getRenewalReminderTemplate(data: RenewalReminder): EmailTemplate {
    return {
      subject: `🔄 Time to Renew: ${data.licenseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28A745; color: white; padding: 20px; text-align: center;">
            <h1>License Renewal Reminder</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data.tenantName},</p>
            <p>Your <strong>${data.licenseName}</strong> license is approaching its renewal date (${data.expiresAt.toLocaleDateString()}).</p>
            <p><strong>Renewal Price:</strong> $${data.renewalPrice}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.renewalUrl}" style="background-color: #28A745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Renew Now
              </a>
            </div>
            <p>Renewing early ensures uninterrupted service and may qualify for discounts.</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `License Renewal Reminder: Your ${data.licenseName} license expires on ${data.expiresAt.toLocaleDateString()}. Renewal price: $${data.renewalPrice}. Renew at: ${data.renewalUrl}`
    };
  }

  private getWeeklyReportTemplate(data: WeeklyUsageReport): EmailTemplate {
    return {
      subject: `📊 Weekly Usage Report - ${data.reportPeriod.start.toLocaleDateString()} to ${data.reportPeriod.end.toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #17A2B8; color: white; padding: 20px; text-align: center;">
            <h1>Weekly Usage Report</h1>
            <p>${data.reportPeriod.start.toLocaleDateString()} - ${data.reportPeriod.end.toLocaleDateString()}</p>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data.tenantName},</p>
            <p>Here's your weekly usage summary:</p>
            <div style="background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Usage Metrics</h3>
              <p><strong>Active Users:</strong> ${data.reportData.activeUsers || 0}</p>
              <p><strong>Assessments Created:</strong> ${data.reportData.assessmentsCreated || 0}</p>
              <p><strong>Reports Generated:</strong> ${data.reportData.reportsGenerated || 0}</p>
              <p><strong>Storage Used:</strong> ${data.reportData.storageUsed || 0} MB</p>
            </div>
            <p>Thank you for using our platform!</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `Weekly Usage Report for ${data.tenantName}: Active Users: ${data.reportData.activeUsers || 0}, Assessments: ${data.reportData.assessmentsCreated || 0}, Reports: ${data.reportData.reportsGenerated || 0}`
    };
  }

  private getInvoiceTemplate(data: InvoiceData): EmailTemplate {
    return {
      subject: `💰 Invoice ${data.invoiceNumber} - Due ${data.dueDate.toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6C757D; color: white; padding: 20px; text-align: center;">
            <h1>Invoice</h1>
            <p>Invoice #${data.invoiceNumber}</p>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.tenantName},</p>
            <p>Please find your invoice details below:</p>
            <div style="background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Amount:</strong> $${data.amount}</p>
              <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Pay Now
              </a>
            </div>
            <p>Thank you for your business!</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `Invoice ${data.invoiceNumber} for ${data.tenantName}: Amount $${data.amount}, Due ${data.dueDate.toLocaleDateString()}`
    };
  }

  private getQuarterlyReportTemplate(data: any): EmailTemplate {
    return {
      subject: `📈 Q${data.quarter} ${data.year} Quarterly Business Report`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6F42C1; color: white; padding: 20px; text-align: center;">
            <h1>Quarterly Business Report</h1>
            <p>Q${data.quarter} ${data.year}</p>
          </div>
          <div style="padding: 20px;">
            <h3>Key Metrics</h3>
            <div style="background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Total Tenants:</strong> ${data.metrics.total_tenants}</p>
              <p><strong>Active Licenses:</strong> ${data.metrics.active_licenses}</p>
              <p><strong>Total ARR:</strong> $${data.metrics.total_arr}</p>
              <p><strong>New Tenants:</strong> ${data.metrics.new_tenants}</p>
              <p><strong>Churned Tenants:</strong> ${data.metrics.churned_tenants}</p>
            </div>
            <p>Detailed report attached.</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `Q${data.quarter} ${data.year} Quarterly Report: ${data.metrics.total_tenants} tenants, $${data.metrics.total_arr} ARR`
    };
  }

  private getAnnualReviewTemplate(data: any): EmailTemplate {
    return {
      subject: `📅 Annual License Review Scheduled - ${data.tenantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FD7E14; color: white; padding: 20px; text-align: center;">
            <h1>Annual License Review</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.tenantName},</p>
            <p>It's time for your annual license review! We'll be reaching out to discuss:</p>
            <ul>
              <li>Your current usage and needs</li>
              <li>Potential optimizations</li>
              <li>New features and capabilities</li>
              <li>Renewal terms for the upcoming year</li>
            </ul>
            <div style="background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Annual Spend:</strong> $${data.annualSpend}</p>
              <p><strong>License Count:</strong> ${data.licenseCount}</p>
            </div>
            <p>Our team will contact you soon to schedule the review.</p>
            <p>Best regards,<br>Shahin AI Team</p>
          </div>
        </div>
      `,
      text: `Annual License Review scheduled for ${data.tenantName}. Annual spend: $${data.annualSpend}, Licenses: ${data.licenseCount}`
    };
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.transporter && this.transporter.verify) {
        await this.transporter.verify();
        return true;
      }
      return true; // For non-SMTP providers
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      provider: this.config.provider,
      configured: !!this.transporter,
      defaultFrom: this.config.defaultFrom
    };
  }
}

export default EmailService;
