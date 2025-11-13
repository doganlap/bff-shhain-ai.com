/**
 * Renewal Automation Workflows
 * Automated license renewal pipeline with dunning schedules
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = yaml.load(
  fs.readFileSync(path.join(__dirname, '../config/license.config.yaml'), 'utf8')
);

class RenewalAutomation {
  constructor() {
    this.config = config.renewal_cadence;
    this.dunningEnabled = config.dunning.enabled;
  }

  /**
   * Main cron job - Run daily to process all renewal milestones
   */
  async processRenewalPipeline() {
    console.log('[Renewal Automation] Starting daily renewal pipeline processing...');
    
    try {
      // Get all active tenant licenses expiring within 120 days
      const upcomingRenewals = await this.getUpcomingRenewals();
      console.log(`[Renewal Automation] Found ${upcomingRenewals.length} licenses to process`);
      
      // Process each milestone
      for (const milestone of this.config.milestones) {
        await this.processMilestone(milestone, upcomingRenewals);
      }
      
      console.log('[Renewal Automation] Daily renewal pipeline completed');
    } catch (error) {
      console.error('[Renewal Automation] Error processing renewal pipeline:', error);
      throw error;
    }
  }

  /**
   * Get all licenses expiring within 120 days
   */
  async getUpcomingRenewals() {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 120);
    
    return await prisma.tenant_licenses.findMany({
      where: {
        status: 'active',
        end_date: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        license: true,
        renewal_opportunity: {
          where: {
            status: {
              in: ['open', 'in_progress'],
            },
          },
        },
      },
    });
  }

  /**
   * Process a specific milestone (e.g., 120d, 90d, 60d, etc.)
   */
  async processMilestone(milestone, tenantLicenses) {
    const { days_before, name, actions } = milestone;
    console.log(`[Renewal Automation] Processing milestone: ${name} (${days_before} days)`);
    
    // Filter licenses that match this milestone (±1 day tolerance)
    const matchingLicenses = tenantLicenses.filter(tl => {
      const daysUntilExpiry = this.getDaysUntilExpiry(tl.end_date);
      return Math.abs(daysUntilExpiry - days_before) <= 1;
    });
    
    console.log(`[Renewal Automation] ${matchingLicenses.length} licenses match milestone ${name}`);
    
    // Execute actions for each matching license
    for (const tenantLicense of matchingLicenses) {
      // Check if this action was already executed
      const alreadyExecuted = await this.wasActionExecuted(tenantLicense.id, days_before);
      if (alreadyExecuted) {
        console.log(`[Renewal Automation] Skipping ${tenantLicense.id} - already executed`);
        continue;
      }
      
      await this.executeActions(tenantLicense, actions, days_before);
    }
  }

  /**
   * Execute all actions for a tenant license
   */
  async executeActions(tenantLicense, actions, daysBefore) {
    console.log(`[Renewal Automation] Executing actions for license ${tenantLicense.id}`);
    
    for (const action of actions) {
      try {
        await this.executeAction(tenantLicense, action, daysBefore);
      } catch (error) {
        console.error(`[Renewal Automation] Error executing action ${action.type}:`, error);
        
        // Log failed execution
        await this.logDunningExecution(tenantLicense.id, daysBefore, action.type, 'failed', error.message);
      }
    }
  }

  /**
   * Execute a single action
   */
  async executeAction(tenantLicense, action, daysBefore) {
    const { type } = action;
    
    console.log(`[Renewal Automation] Executing action: ${type} for ${tenantLicense.id}`);
    
    let result = {};
    
    switch (type) {
      case 'create_renewal_opportunity':
        result = await this.createRenewalOpportunity(tenantLicense, action);
        break;
        
      case 'generate_pre_quote':
        result = await this.generatePreQuote(tenantLicense, action);
        break;
        
      case 'create_proposal':
        result = await this.createProposal(tenantLicense, action);
        break;
        
      case 'generate_final_quote':
        result = await this.generateFinalQuote(tenantLicense, action);
        break;
        
      case 'create_proforma_invoice':
        result = await this.createProformaInvoice(tenantLicense, action);
        break;
        
      case 'send_email':
        result = await this.sendEmail(tenantLicense, action);
        break;
        
      case 'create_task':
        result = await this.createTask(tenantLicense, action);
        break;
        
      case 'schedule_success_checkin':
        result = await this.scheduleSuccessCheckin(tenantLicense, action);
        break;
        
      case 'check_payment_status':
        result = await this.checkPaymentStatus(tenantLicense);
        break;
        
      case 'auto_renew':
        if (tenantLicense.auto_renew) {
          result = await this.autoRenew(tenantLicense);
        }
        break;
        
      case 'enable_grace_period':
        result = await this.enableGracePeriod(tenantLicense, action);
        break;
        
      case 'suspend_license':
        result = await this.suspendLicense(tenantLicense, action);
        break;
        
      case 'create_churn_prevention_task':
        result = await this.createChurnPreventionTask(tenantLicense, action);
        break;
        
      case 'suspend_all_features':
        result = await this.suspendAllFeatures(tenantLicense, action);
        break;
        
      case 'create_escalation_case':
        result = await this.createEscalationCase(tenantLicense, action);
        break;
        
      default:
        console.warn(`[Renewal Automation] Unknown action type: ${type}`);
    }
    
    // Log successful execution
    await this.logDunningExecution(tenantLicense.id, daysBefore, type, 'success', null, result);
    
    // Create license event
    await this.createLicenseEvent(tenantLicense.id, `renewal_action_${type}`, result);
  }

  /**
   * Create renewal opportunity (Layer 10)
   */
  async createRenewalOpportunity(tenantLicense, action) {
    // Check if opportunity already exists
    const existing = await prisma.renewal_opportunities.findFirst({
      where: {
        tenant_license_id: tenantLicense.id,
        status: {
          in: ['open', 'in_progress'],
        },
      },
    });
    
    if (existing) {
      return { opportunity_id: existing.id, action: 'already_exists' };
    }
    
    // Calculate proposed ARR with uplift
    const currentARR = tenantLicense.price_paid;
    const priceIncreasePct = config.defaults.default_price_increase_pct;
    const proposedARR = currentARR * (1 + priceIncreasePct / 100);
    
    const opportunity = await prisma.renewal_opportunities.create({
      data: {
        tenant_license_id: tenantLicense.id,
        status: 'open',
        renewal_type: 'renewal',
        current_arr: currentARR,
        proposed_arr: proposedARR,
        value_change: proposedARR - currentARR,
        license_end_date: tenantLicense.end_date,
        renewal_target_date: new Date(tenantLicense.end_date.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before
        price_increase_pct: priceIncreasePct,
        assigned_to: action.assign_to || null,
      },
    });
    
    return { opportunity_id: opportunity.id, action: 'created', arr: proposedARR };
  }

  /**
   * Generate pre-quote
   */
  async generatePreQuote(tenantLicense, action) {
    // Integration point with Layer 4 (Quotes)
    console.log(`[Renewal Automation] Generating pre-quote for ${tenantLicense.id}`);
    
    const priceIncreasePct = action.default_price_increase_pct || config.defaults.default_price_increase_pct;
    const newPrice = tenantLicense.price_paid * (1 + priceIncreasePct / 100);
    
    // TODO: Create quote in quotes table (Layer 4)
    return {
      quote_type: 'pre_quote',
      current_price: tenantLicense.price_paid,
      new_price: newPrice,
      increase_pct: priceIncreasePct,
    };
  }

  /**
   * Send email notification
   */
  async sendEmail(tenantLicense, action) {
    const { template, recipients } = action;
    
    console.log(`[Renewal Automation] Sending email: ${template} to ${recipients}`);
    
    // TODO: Integrate with email service
    // await emailService.send({
    //   template: template,
    //   to: recipients,
    //   data: {
    //     tenant_license: tenantLicense,
    //     license: tenantLicense.license,
    //   },
    // });
    
    return {
      email_sent: true,
      template: template,
      recipients: recipients,
    };
  }

  /**
   * Auto-renew license
   */
  async autoRenew(tenantLicense) {
    console.log(`[Renewal Automation] Auto-renewing license ${tenantLicense.id}`);
    
    const newStartDate = new Date(tenantLicense.end_date);
    newStartDate.setDate(newStartDate.getDate() + 1);
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    const renewed = await prisma.tenant_licenses.update({
      where: { id: tenantLicense.id },
      data: {
        start_date: newStartDate,
        end_date: newEndDate,
        last_renewal_date: new Date(),
        status: 'active',
      },
    });
    
    // Create invoice (Layer 8)
    // await createInvoice(tenantLicense);
    
    return {
      renewed: true,
      new_start_date: newStartDate,
      new_end_date: newEndDate,
    };
  }

  /**
   * Suspend license
   */
  async suspendLicense(tenantLicense, action) {
    console.log(`[Renewal Automation] Suspending license ${tenantLicense.id}`);
    
    await prisma.tenant_licenses.update({
      where: { id: tenantLicense.id },
      data: {
        status: 'suspended',
        suspended_at: new Date(),
        suspended_reason: 'Payment overdue - grace period expired',
      },
    });
    
    return { suspended: true, readonly_mode: action.keep_readonly || false };
  }

  /**
   * Helper: Get days until expiry
   */
  getDaysUntilExpiry(endDate) {
    const now = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if action was already executed
   */
  async wasActionExecuted(tenantLicenseId, daysBefore) {
    const existing = await prisma.dunning_execution_log.findFirst({
      where: {
        tenant_license_id: tenantLicenseId,
        days_until_expiry: daysBefore,
        status: 'success',
      },
    });
    
    return !!existing;
  }

  /**
   * Log dunning execution
   */
  async logDunningExecution(tenantLicenseId, daysBefore, actionType, status, error = null, metadata = {}) {
    await prisma.dunning_execution_log.create({
      data: {
        tenant_license_id: tenantLicenseId,
        days_until_expiry: daysBefore,
        action_taken: actionType,
        status: status,
        error_message: error,
        email_sent: metadata.email_sent || false,
        opportunity_created: metadata.opportunity_id || null,
        metadata: metadata,
      },
    });
  }

  /**
   * Create license event (audit trail)
   */
  async createLicenseEvent(tenantLicenseId, eventType, metadata = {}) {
    await prisma.license_events.create({
      data: {
        tenant_license_id: tenantLicenseId,
        event_type: eventType,
        event_status: 'success',
        triggered_by: 'system',
        metadata: metadata,
      },
    });
  }

  // Stub methods (to be implemented with full integration)
  async createProposal(tenantLicense, action) {
    return { proposal_created: true };
  }

  async generateFinalQuote(tenantLicense, action) {
    return { quote_generated: true };
  }

  async createProformaInvoice(tenantLicense, action) {
    return { invoice_created: true };
  }

  async createTask(tenantLicense, action) {
    return { task_created: true };
  }

  async scheduleSuccessCheckin(tenantLicense, action) {
    return { checkin_scheduled: true };
  }

  async checkPaymentStatus(tenantLicense) {
    return { payment_status: 'pending' };
  }

  async enableGracePeriod(tenantLicense, action) {
    return { grace_enabled: true, grace_days: action.grace_days || 7 };
  }

  async createChurnPreventionTask(tenantLicense, action) {
    return { churn_task_created: true };
  }

  async suspendAllFeatures(tenantLicense, action) {
    return { all_features_suspended: true };
  }

  async createEscalationCase(tenantLicense, action) {
    return { escalation_case_created: true };
  }
}

// Export singleton instance
module.exports = new RenewalAutomation();

// If run directly, execute the pipeline
if (require.main === module) {
  const automation = new RenewalAutomation();
  automation.processRenewalPipeline()
    .then(() => {
      console.log('[Renewal Automation] Pipeline completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Renewal Automation] Pipeline failed:', error);
      process.exit(1);
    });
}
