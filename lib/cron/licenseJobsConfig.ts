/**
 * License Jobs Configuration
 * Comprehensive automation for license management, renewals, and compliance
 */

import { CronJob } from 'cron';
import { EmailService } from '../services/EmailService';
import { NotificationService } from '../services/NotificationService';
import { DatabaseService } from '../services/DatabaseService';
import { UsageService } from '../services/UsageService';

export interface JobConfig {
  name: string;
  description: string;
  schedule: string; // Cron expression
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
  handler: () => Promise<void>;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * 11 Automated Jobs for Complete License Management
 */
export const licenseJobsConfig: JobConfig[] = [
  
  // ============================================================================
  // DAILY JOBS (4 jobs)
  // ============================================================================
  
  {
    name: 'license-expiry-check',
    description: 'Check for licenses expiring in the next 30, 14, 7, and 1 days',
    schedule: '0 9 * * *', // Daily at 9 AM
    enabled: true,
    priority: 'critical',
    timeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 60000, // 1 minute
    handler: async () => {
      console.log('🔍 Running license expiry check...');
      
      const db = new DatabaseService();
      const email = new EmailService();
      const notifications = new NotificationService();
      
      // Check for licenses expiring in different timeframes
      const expiryChecks = [
        { days: 30, type: 'early_warning' },
        { days: 14, type: 'warning' },
        { days: 7, type: 'urgent' },
        { days: 1, type: 'critical' }
      ];
      
      for (const check of expiryChecks) {
        const expiringLicenses = await db.query(`
          SELECT 
            tl.*,
            l.name as license_name,
            t.name as tenant_name,
            t.email as tenant_email
          FROM tenant_licenses tl
          JOIN licenses l ON tl.license_id = l.id
          JOIN tenants t ON tl.tenant_id = t.id
          WHERE tl.expires_at BETWEEN NOW() AND NOW() + INTERVAL '${check.days} days'
            AND tl.status = 'active'
            AND tl.auto_renewal = false
        `);
        
        for (const license of expiringLicenses.rows) {
          // Send email notification
          await email.sendLicenseExpiryNotification({
            tenantEmail: license.tenant_email,
            tenantName: license.tenant_name,
            licenseName: license.license_name,
            expiresAt: license.expires_at,
            daysRemaining: check.days,
            urgencyLevel: check.type
          });
          
          // Create in-app notification
          await notifications.create({
            tenantId: license.tenant_id,
            type: 'license_expiry',
            title: `License Expiring in ${check.days} days`,
            message: `Your ${license.license_name} license expires on ${license.expires_at}`,
            urgency: check.type,
            actionUrl: `/tenant/${license.tenant_id}/licenses`
          });
          
          // Log event
          await db.logEvent({
            type: 'license_expiry_check',
            tenantId: license.tenant_id,
            licenseId: license.id,
            details: { daysRemaining: check.days, urgencyLevel: check.type }
          });
        }
      }
      
      console.log('✅ License expiry check completed');
    }
  },

  {
    name: 'usage-aggregation',
    description: 'Aggregate daily usage statistics and update tenant usage records',
    schedule: '0 2 * * *', // Daily at 2 AM
    enabled: true,
    priority: 'high',
    timeout: 600000, // 10 minutes
    retryAttempts: 2,
    retryDelay: 120000, // 2 minutes
    handler: async () => {
      console.log('📊 Running daily usage aggregation...');
      
      const usage = new UsageService();
      const db = new DatabaseService();
      
      // Get all active tenant licenses
      const activeLicenses = await db.query(`
        SELECT DISTINCT tenant_id, license_id
        FROM tenant_licenses
        WHERE status = 'active'
          AND expires_at > NOW()
      `);
      
      for (const license of activeLicenses.rows) {
        // Aggregate usage for yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const usageStats = await usage.aggregateDailyUsage({
          tenantId: license.tenant_id,
          licenseId: license.license_id,
          date: yesterday
        });
        
        // Update tenant license usage
        await db.query(`
          INSERT INTO tenant_license_usage (
            tenant_id, license_id, usage_date, 
            users_active, assessments_created, reports_generated,
            storage_used_mb, api_calls_made, features_used
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (tenant_id, license_id, usage_date)
          DO UPDATE SET
            users_active = EXCLUDED.users_active,
            assessments_created = EXCLUDED.assessments_created,
            reports_generated = EXCLUDED.reports_generated,
            storage_used_mb = EXCLUDED.storage_used_mb,
            api_calls_made = EXCLUDED.api_calls_made,
            features_used = EXCLUDED.features_used,
            updated_at = NOW()
        `, [
          license.tenant_id, license.license_id, yesterday,
          usageStats.usersActive, usageStats.assessmentsCreated,
          usageStats.reportsGenerated, usageStats.storageUsedMb,
          usageStats.apiCallsMade, JSON.stringify(usageStats.featuresUsed)
        ]);
        
        // Check for usage limit warnings
        await usage.checkUsageLimits(license.tenant_id, license.license_id);
      }
      
      console.log('✅ Usage aggregation completed');
    }
  },

  {
    name: 'renewal-reminders',
    description: 'Send automated renewal reminders based on license expiry dates',
    schedule: '0 10 * * *', // Daily at 10 AM
    enabled: true,
    priority: 'high',
    timeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 60000,
    handler: async () => {
      console.log('📧 Sending renewal reminders...');
      
      const db = new DatabaseService();
      const email = new EmailService();
      
      // Get licenses that need renewal reminders
      const renewalCandidates = await db.query(`
        SELECT 
          tl.*,
          l.name as license_name,
          l.price_annual,
          t.name as tenant_name,
          t.email as tenant_email,
          EXTRACT(DAYS FROM (tl.expires_at - NOW())) as days_until_expiry
        FROM tenant_licenses tl
        JOIN licenses l ON tl.license_id = l.id
        JOIN tenants t ON tl.tenant_id = t.id
        WHERE tl.expires_at BETWEEN NOW() + INTERVAL '25 days' AND NOW() + INTERVAL '35 days'
          AND tl.status = 'active'
          AND tl.auto_renewal = false
          AND NOT EXISTS (
            SELECT 1 FROM renewal_opportunities ro
            WHERE ro.tenant_license_id = tl.id
              AND ro.status IN ('pending', 'in_progress')
          )
      `);
      
      for (const license of renewalCandidates.rows) {
        // Create renewal opportunity
        const renewalId = await db.query(`
          INSERT INTO renewal_opportunities (
            tenant_license_id, tenant_id, license_id,
            current_price, renewal_price, discount_percentage,
            opportunity_stage, priority_score, expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, 'identified', $7, $8)
          RETURNING id
        `, [
          license.id, license.tenant_id, license.license_id,
          license.price_annual, license.price_annual, 0,
          85, // Priority score for 30-day renewals
          license.expires_at
        ]);
        
        // Send renewal reminder email
        await email.sendRenewalReminder({
          tenantEmail: license.tenant_email,
          tenantName: license.tenant_name,
          licenseName: license.license_name,
          expiresAt: license.expires_at,
          renewalPrice: license.price_annual,
          renewalUrl: `/tenant/${license.tenant_id}/upgrade?renewal=${renewalId.rows[0].id}`
        });
      }
      
      console.log('✅ Renewal reminders sent');
    }
  },

  {
    name: 'compliance-check',
    description: 'Daily compliance status check and violation detection',
    schedule: '0 8 * * *', // Daily at 8 AM
    enabled: true,
    priority: 'high',
    timeout: 900000, // 15 minutes
    retryAttempts: 2,
    retryDelay: 180000, // 3 minutes
    handler: async () => {
      console.log('⚖️ Running compliance check...');
      
      const db = new DatabaseService();
      const notifications = new NotificationService();
      
      // Check license compliance for all active tenants
      const complianceResults = await db.query(`
        SELECT 
          t.id as tenant_id,
          t.name as tenant_name,
          COUNT(u.id) as active_users,
          tl.max_users,
          tl.id as license_id,
          l.name as license_name,
          CASE 
            WHEN COUNT(u.id) > tl.max_users THEN 'violation'
            WHEN COUNT(u.id) > (tl.max_users * 0.9) THEN 'warning'
            ELSE 'compliant'
          END as compliance_status
        FROM tenants t
        JOIN tenant_licenses tl ON t.id = tl.tenant_id
        JOIN licenses l ON tl.license_id = l.id
        LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'active'
        WHERE tl.status = 'active'
          AND tl.expires_at > NOW()
        GROUP BY t.id, t.name, tl.max_users, tl.id, l.name
        HAVING COUNT(u.id) > (tl.max_users * 0.9)
      `);
      
      for (const result of complianceResults.rows) {
        if (result.compliance_status === 'violation') {
          // Create compliance violation record
          await db.query(`
            INSERT INTO compliance_violations (
              tenant_id, license_id, violation_type, 
              severity, description, detected_at
            ) VALUES ($1, $2, 'user_limit_exceeded', 'high', $3, NOW())
          `, [
            result.tenant_id, result.license_id,
            `Tenant has ${result.active_users} active users but license allows only ${result.max_users}`
          ]);
          
          // Send violation notification
          await notifications.create({
            tenantId: result.tenant_id,
            type: 'compliance_violation',
            title: 'License Compliance Violation',
            message: `You have exceeded your user limit (${result.active_users}/${result.max_users})`,
            urgency: 'critical',
            actionUrl: `/tenant/${result.tenant_id}/upgrade`
          });
        }
      }
      
      console.log('✅ Compliance check completed');
    }
  },

  // ============================================================================
  // WEEKLY JOBS (2 jobs)
  // ============================================================================

  {
    name: 'usage-reports',
    description: 'Generate and send weekly usage reports to tenants',
    schedule: '0 9 * * 1', // Monday at 9 AM
    enabled: true,
    priority: 'medium',
    timeout: 1800000, // 30 minutes
    retryAttempts: 2,
    retryDelay: 300000, // 5 minutes
    handler: async () => {
      console.log('📈 Generating weekly usage reports...');
      
      const usage = new UsageService();
      const email = new EmailService();
      const db = new DatabaseService();
      
      // Get all active tenants
      const tenants = await db.query(`
        SELECT DISTINCT t.id, t.name, t.email
        FROM tenants t
        JOIN tenant_licenses tl ON t.id = tl.tenant_id
        WHERE tl.status = 'active'
          AND tl.expires_at > NOW()
      `);
      
      for (const tenant of tenants.rows) {
        // Generate weekly usage report
        const weeklyReport = await usage.generateWeeklyReport(tenant.id);
        
        // Send email with report
        await email.sendWeeklyUsageReport({
          tenantEmail: tenant.email,
          tenantName: tenant.name,
          reportData: weeklyReport,
          reportPeriod: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        });
      }
      
      console.log('✅ Weekly usage reports sent');
    }
  },

  {
    name: 'license-analytics',
    description: 'Generate weekly license analytics and optimization suggestions',
    schedule: '0 11 * * 1', // Monday at 11 AM
    enabled: true,
    priority: 'medium',
    timeout: 1200000, // 20 minutes
    retryAttempts: 2,
    retryDelay: 240000, // 4 minutes
    handler: async () => {
      console.log('🔍 Generating license analytics...');
      
      const db = new DatabaseService();
      const notifications = new NotificationService();
      
      // Analyze license utilization patterns
      const analytics = await db.query(`
        SELECT 
          l.id as license_id,
          l.name as license_name,
          COUNT(tl.id) as active_licenses,
          AVG(tlu.users_active::float / tl.max_users) as avg_utilization,
          SUM(l.price_annual * tl.quantity) as total_revenue,
          COUNT(CASE WHEN tlu.users_active::float / tl.max_users > 0.8 THEN 1 END) as high_utilization_count
        FROM licenses l
        JOIN tenant_licenses tl ON l.id = tl.license_id
        LEFT JOIN tenant_license_usage tlu ON tl.id = tlu.tenant_license_id
        WHERE tl.status = 'active'
          AND tlu.usage_date >= NOW() - INTERVAL '7 days'
        GROUP BY l.id, l.name
        ORDER BY total_revenue DESC
      `);
      
      // Generate optimization suggestions
      for (const license of analytics.rows) {
        if (license.avg_utilization < 0.3) {
          // Low utilization - suggest downgrades
          await notifications.createSystemNotification({
            type: 'optimization_suggestion',
            title: 'License Optimization Opportunity',
            message: `${license.license_name} has low utilization (${Math.round(license.avg_utilization * 100)}%). Consider offering downgrades.`,
            priority: 'medium',
            category: 'revenue_optimization'
          });
        } else if (license.high_utilization_count > license.active_licenses * 0.7) {
          // High utilization - suggest upgrades
          await notifications.createSystemNotification({
            type: 'upsell_opportunity',
            title: 'Upsell Opportunity Detected',
            message: `${license.license_name} has high utilization across ${license.high_utilization_count} tenants. Consider proactive upselling.`,
            priority: 'high',
            category: 'revenue_growth'
          });
        }
      }
      
      console.log('✅ License analytics completed');
    }
  },

  // ============================================================================
  // MONTHLY JOBS (3 jobs)
  // ============================================================================

  {
    name: 'billing-cycles',
    description: 'Process monthly billing cycles and generate invoices',
    schedule: '0 6 1 * *', // 1st of every month at 6 AM
    enabled: true,
    priority: 'critical',
    timeout: 3600000, // 1 hour
    retryAttempts: 3,
    retryDelay: 600000, // 10 minutes
    handler: async () => {
      console.log('💰 Processing monthly billing cycles...');
      
      const db = new DatabaseService();
      const email = new EmailService();
      
      // Get licenses with monthly billing
      const monthlyLicenses = await db.query(`
        SELECT 
          tl.*,
          l.name as license_name,
          l.price_monthly,
          t.name as tenant_name,
          t.email as tenant_email,
          t.billing_address
        FROM tenant_licenses tl
        JOIN licenses l ON tl.license_id = l.id
        JOIN tenants t ON tl.tenant_id = t.id
        WHERE tl.billing_cycle = 'monthly'
          AND tl.status = 'active'
          AND tl.next_billing_date <= NOW()
      `);
      
      for (const license of monthlyLicenses.rows) {
        // Generate invoice
        const invoice = await db.query(`
          INSERT INTO invoices (
            tenant_id, license_id, amount, currency,
            billing_period_start, billing_period_end,
            due_date, status
          ) VALUES ($1, $2, $3, 'USD', $4, $5, $6, 'pending')
          RETURNING id, invoice_number
        `, [
          license.tenant_id, license.license_id, license.price_monthly,
          new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days to pay
        ]);
        
        // Update next billing date
        await db.query(`
          UPDATE tenant_licenses 
          SET next_billing_date = next_billing_date + INTERVAL '1 month'
          WHERE id = $1
        `, [license.id]);
        
        // Send invoice email
        await email.sendInvoice({
          tenantEmail: license.tenant_email,
          tenantName: license.tenant_name,
          invoiceNumber: invoice.rows[0].invoice_number,
          amount: license.price_monthly,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });
      }
      
      console.log('✅ Monthly billing completed');
    }
  },

  {
    name: 'quarterly-reports',
    description: 'Generate comprehensive quarterly business reports',
    schedule: '0 8 1 */3 *', // 1st of every quarter at 8 AM
    enabled: true,
    priority: 'medium',
    timeout: 7200000, // 2 hours
    retryAttempts: 2,
    retryDelay: 900000, // 15 minutes
    handler: async () => {
      console.log('📊 Generating quarterly reports...');
      
      const db = new DatabaseService();
      const email = new EmailService();
      
      // Generate comprehensive quarterly metrics
      const quarterlyMetrics = await db.query(`
        SELECT 
          COUNT(DISTINCT t.id) as total_tenants,
          COUNT(DISTINCT tl.id) as active_licenses,
          SUM(l.price_annual * tl.quantity) as total_arr,
          AVG(tlu.users_active) as avg_users_per_tenant,
          COUNT(DISTINCT CASE WHEN tl.created_at >= NOW() - INTERVAL '3 months' THEN t.id END) as new_tenants,
          COUNT(DISTINCT CASE WHEN tl.status = 'cancelled' AND tl.updated_at >= NOW() - INTERVAL '3 months' THEN t.id END) as churned_tenants
        FROM tenants t
        LEFT JOIN tenant_licenses tl ON t.id = tl.tenant_id
        LEFT JOIN licenses l ON tl.license_id = l.id
        LEFT JOIN tenant_license_usage tlu ON tl.id = tlu.tenant_license_id
        WHERE tlu.usage_date >= NOW() - INTERVAL '3 months'
      `);
      
      // Send quarterly report to stakeholders
      await email.sendQuarterlyReport({
        recipients: ['admin@shahin-ai.com', 'finance@shahin-ai.com'],
        metrics: quarterlyMetrics.rows[0],
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        year: new Date().getFullYear()
      });
      
      console.log('✅ Quarterly reports generated');
    }
  },

  {
    name: 'annual-reviews',
    description: 'Conduct annual license reviews and contract renewals',
    schedule: '0 9 1 1 *', // January 1st at 9 AM
    enabled: true,
    priority: 'high',
    timeout: 10800000, // 3 hours
    retryAttempts: 2,
    retryDelay: 1800000, // 30 minutes
    handler: async () => {
      console.log('📅 Conducting annual reviews...');
      
      const db = new DatabaseService();
      const email = new EmailService();
      
      // Get all tenants for annual review
      const tenants = await db.query(`
        SELECT 
          t.*,
          COUNT(tl.id) as license_count,
          SUM(l.price_annual * tl.quantity) as annual_spend,
          AVG(tlu.users_active) as avg_monthly_users
        FROM tenants t
        JOIN tenant_licenses tl ON t.id = tl.tenant_id
        JOIN licenses l ON tl.license_id = l.id
        LEFT JOIN tenant_license_usage tlu ON tl.id = tlu.tenant_license_id
        WHERE tl.status = 'active'
          AND tlu.usage_date >= NOW() - INTERVAL '12 months'
        GROUP BY t.id
        ORDER BY annual_spend DESC
      `);
      
      for (const tenant of tenants.rows) {
        // Create annual review record
        await db.query(`
          INSERT INTO annual_reviews (
            tenant_id, review_year, annual_spend,
            license_count, avg_users, review_status
          ) VALUES ($1, $2, $3, $4, $5, 'scheduled')
        `, [
          tenant.id, new Date().getFullYear(),
          tenant.annual_spend, tenant.license_count,
          tenant.avg_monthly_users
        ]);
        
        // Send annual review notification
        await email.sendAnnualReviewNotification({
          tenantEmail: tenant.email,
          tenantName: tenant.name,
          annualSpend: tenant.annual_spend,
          licenseCount: tenant.license_count
        });
      }
      
      console.log('✅ Annual reviews scheduled');
    }
  },

  // ============================================================================
  // HOURLY JOBS (2 jobs)
  // ============================================================================

  {
    name: 'status-sync',
    description: 'Synchronize license status across all systems',
    schedule: '0 * * * *', // Every hour
    enabled: true,
    priority: 'medium',
    timeout: 300000, // 5 minutes
    retryAttempts: 2,
    retryDelay: 60000,
    handler: async () => {
      console.log('🔄 Synchronizing license status...');
      
      const db = new DatabaseService();
      
      // Update expired licenses
      await db.query(`
        UPDATE tenant_licenses 
        SET status = 'expired', updated_at = NOW()
        WHERE expires_at < NOW() 
          AND status = 'active'
      `);
      
      // Update grace period licenses
      await db.query(`
        UPDATE tenant_licenses 
        SET status = 'grace_period', updated_at = NOW()
        WHERE expires_at < NOW() 
          AND expires_at > NOW() - INTERVAL '7 days'
          AND status = 'expired'
      `);
      
      // Suspend overdue licenses
      await db.query(`
        UPDATE tenant_licenses 
        SET status = 'suspended', updated_at = NOW()
        WHERE expires_at < NOW() - INTERVAL '7 days'
          AND status IN ('expired', 'grace_period')
      `);
      
      console.log('✅ Status sync completed');
    }
  },

  {
    name: 'real-time-monitoring',
    description: 'Monitor system health and license usage in real-time',
    schedule: '*/15 * * * *', // Every 15 minutes
    enabled: true,
    priority: 'high',
    timeout: 180000, // 3 minutes
    retryAttempts: 3,
    retryDelay: 30000,
    handler: async () => {
      console.log('📡 Real-time monitoring check...');
      
      const db = new DatabaseService();
      const notifications = new NotificationService();
      
      // Check for system anomalies
      const anomalies = await db.query(`
        SELECT 
          tenant_id,
          COUNT(*) as concurrent_users,
          MAX(created_at) as last_activity
        FROM user_sessions 
        WHERE created_at > NOW() - INTERVAL '15 minutes'
        GROUP BY tenant_id
        HAVING COUNT(*) > 1000 -- Unusual activity threshold
      `);
      
      for (const anomaly of anomalies.rows) {
        await notifications.create({
          tenantId: anomaly.tenant_id,
          type: 'system_anomaly',
          title: 'Unusual Activity Detected',
          message: `High concurrent user activity: ${anomaly.concurrent_users} users`,
          urgency: 'high'
        });
      }
      
      console.log('✅ Real-time monitoring completed');
    }
  }
];

/**
 * Job execution wrapper with error handling and logging
 */
export class JobExecutor {
  private static instance: JobExecutor;
  private jobs: Map<string, CronJob> = new Map();
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  static getInstance(): JobExecutor {
    if (!JobExecutor.instance) {
      JobExecutor.instance = new JobExecutor();
    }
    return JobExecutor.instance;
  }

  async initializeJobs(): Promise<void> {
    console.log('🚀 Initializing license automation jobs...');
    
    for (const config of licenseJobsConfig) {
      if (config.enabled) {
        const job = new CronJob(
          config.schedule,
          () => this.executeJob(config),
          null,
          false, // Don't start immediately
          'UTC'
        );
        
        this.jobs.set(config.name, job);
        job.start();
        
        console.log(`✅ Job "${config.name}" scheduled: ${config.schedule}`);
      }
    }
    
    console.log(`🎉 ${this.jobs.size} automation jobs initialized successfully`);
  }

  private async executeJob(config: JobConfig): Promise<void> {
    const startTime = Date.now();
    const executionId = `${config.name}_${startTime}`;
    
    try {
      console.log(`🔄 Starting job: ${config.name} (${executionId})`);
      
      // Log job start
      await this.db.logJobExecution({
        jobName: config.name,
        executionId,
        status: 'running',
        startedAt: new Date()
      });
      
      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), config.timeout);
      });
      
      await Promise.race([config.handler(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      
      // Log success
      await this.db.logJobExecution({
        jobName: config.name,
        executionId,
        status: 'completed',
        duration,
        completedAt: new Date()
      });
      
      console.log(`✅ Job completed: ${config.name} (${duration}ms)`);
      
      if (config.onSuccess) {
        config.onSuccess({ duration, executionId });
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ Job failed: ${config.name}`, error);
      
      // Log failure
      await this.db.logJobExecution({
        jobName: config.name,
        executionId,
        status: 'failed',
        duration,
        error: error.message,
        completedAt: new Date()
      });
      
      if (config.onError) {
        config.onError(error as Error);
      }
      
      // Retry logic could be implemented here
    }
  }

  getJobStatus(jobName: string): any {
    const job = this.jobs.get(jobName);
    if (!job) return null;
    
    return {
      name: jobName,
      running: job.running,
      lastDate: job.lastDate(),
      nextDate: job.nextDate()
    };
  }

  getAllJobsStatus(): any[] {
    return Array.from(this.jobs.keys()).map(name => this.getJobStatus(name));
  }

  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      return true;
    }
    return false;
  }

  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      return true;
    }
    return false;
  }
}

export default licenseJobsConfig;
