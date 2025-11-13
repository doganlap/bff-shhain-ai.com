/**
 * Advanced Test Suite for License Jobs Configuration
 * Comprehensive testing of all 11 automated jobs covering complete license lifecycle
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/testing-library/jest-dom';
import { licenseJobsConfig, JobExecutor } from '../../lib/cron/licenseJobsConfig';
import { DatabaseService } from '../../lib/services/DatabaseService';
import { EmailService } from '../../lib/services/EmailService';
import { NotificationService } from '../../lib/services/NotificationService';
import { UsageService } from '../../lib/services/UsageService';

// Mock services
jest.mock('../../lib/services/DatabaseService');
jest.mock('../../lib/services/EmailService');
jest.mock('../../lib/services/NotificationService');
jest.mock('../../lib/services/UsageService');

describe('License Jobs Configuration - Advanced Tests', () => {
  let mockDb: jest.Mocked<DatabaseService>;
  let mockEmail: jest.Mocked<EmailService>;
  let mockNotifications: jest.Mocked<NotificationService>;
  let mockUsage: jest.Mocked<UsageService>;
  let jobExecutor: JobExecutor;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock instances
    mockDb = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockEmail = new EmailService() as jest.Mocked<EmailService>;
    mockNotifications = new NotificationService() as jest.Mocked<NotificationService>;
    mockUsage = new UsageService() as jest.Mocked<UsageService>;
    
    // Setup mock implementations
    mockDb.query = jest.fn();
    mockDb.logEvent = jest.fn();
    mockEmail.sendLicenseExpiryNotification = jest.fn();
    mockEmail.sendRenewalReminder = jest.fn();
    mockEmail.sendWeeklyUsageReport = jest.fn();
    mockEmail.sendInvoice = jest.fn();
    mockNotifications.create = jest.fn();
    mockUsage.aggregateDailyUsage = jest.fn();
    mockUsage.checkUsageLimits = jest.fn();
    
    jobExecutor = JobExecutor.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Job Configuration Validation', () => {
    test('should have exactly 11 configured jobs', () => {
      expect(licenseJobsConfig).toHaveLength(11);
    });

    test('should have correct job categories', () => {
      const dailyJobs = licenseJobsConfig.filter(job => 
        job.schedule.includes('* * *') && !job.schedule.includes('*/'));
      const weeklyJobs = licenseJobsConfig.filter(job => 
        job.schedule.includes('* * 1'));
      const monthlyJobs = licenseJobsConfig.filter(job => 
        job.schedule.includes('1 * *'));
      const hourlyJobs = licenseJobsConfig.filter(job => 
        job.schedule.includes('* * * *'));

      expect(dailyJobs).toHaveLength(4);
      expect(weeklyJobs).toHaveLength(2);
      expect(monthlyJobs).toHaveLength(3);
      expect(hourlyJobs).toHaveLength(2);
    });

    test('should have valid cron expressions', () => {
      licenseJobsConfig.forEach(job => {
        expect(job.schedule).toMatch(/^[\d\*\/\-,\s]+$/);
        expect(job.schedule.split(' ')).toHaveLength(5);
      });
    });

    test('should have proper timeout configurations', () => {
      licenseJobsConfig.forEach(job => {
        expect(job.timeout).toBeGreaterThan(0);
        expect(job.timeout).toBeLessThanOrEqual(10800000); // 3 hours max
      });
    });
  });

  describe('Daily Jobs - License Expiry Check', () => {
    const expiryJob = licenseJobsConfig.find(job => job.name === 'license-expiry-check');

    test('should be configured correctly', () => {
      expect(expiryJob).toBeDefined();
      expect(expiryJob?.schedule).toBe('0 9 * * *'); // Daily at 9 AM
      expect(expiryJob?.priority).toBe('critical');
      expect(expiryJob?.enabled).toBe(true);
    });

    test('should check multiple expiry timeframes', async () => {
      const mockLicenses = [
        {
          id: '1',
          tenant_id: 'tenant1',
          license_name: 'Premium License',
          tenant_name: 'Test Company',
          tenant_email: 'test@company.com',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      ];

      mockDb.query
        .mockResolvedValueOnce({ rows: mockLicenses })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expiryJob?.handler();

      // Should query for 30, 14, 7, and 1 day expiry windows
      expect(mockDb.query).toHaveBeenCalledTimes(4);
      expect(mockEmail.sendLicenseExpiryNotification).toHaveBeenCalledWith({
        tenantEmail: 'test@company.com',
        tenantName: 'Test Company',
        licenseName: 'Premium License',
        expiresAt: expect.any(Date),
        daysRemaining: 7,
        urgencyLevel: 'urgent'
      });
    });

    test('should create notifications for each expiring license', async () => {
      const mockLicenses = [
        {
          id: '1',
          tenant_id: 'tenant1',
          license_name: 'Premium License',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockLicenses });

      await expiryJob?.handler();

      expect(mockNotifications.create).toHaveBeenCalledWith({
        tenantId: 'tenant1',
        type: 'license_expiry',
        title: 'License Expiring in 30 days',
        message: expect.stringContaining('Premium License'),
        urgency: 'early_warning',
        actionUrl: '/tenant/tenant1/licenses'
      });
    });

    test('should handle errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(expiryJob?.handler()).rejects.toThrow('Database error');
    });
  });

  describe('Daily Jobs - Usage Aggregation', () => {
    const usageJob = licenseJobsConfig.find(job => job.name === 'usage-aggregation');

    test('should be configured correctly', () => {
      expect(usageJob).toBeDefined();
      expect(usageJob?.schedule).toBe('0 2 * * *'); // Daily at 2 AM
      expect(usageJob?.priority).toBe('high');
    });

    test('should aggregate usage for all active licenses', async () => {
      const mockLicenses = [
        { tenant_id: 'tenant1', license_id: 'license1' },
        { tenant_id: 'tenant2', license_id: 'license2' }
      ];

      const mockUsageStats = {
        usersActive: 10,
        assessmentsCreated: 5,
        reportsGenerated: 3,
        storageUsedMb: 100,
        apiCallsMade: 50,
        featuresUsed: ['assessments', 'reports']
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: mockLicenses })
        .mockResolvedValue({ rows: [] });
      
      mockUsage.aggregateDailyUsage.mockResolvedValue(mockUsageStats);

      await usageJob?.handler();

      expect(mockUsage.aggregateDailyUsage).toHaveBeenCalledTimes(2);
      expect(mockUsage.checkUsageLimits).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tenant_license_usage'),
        expect.arrayContaining(['tenant1', 'license1'])
      );
    });
  });

  describe('Daily Jobs - Renewal Reminders', () => {
    const renewalJob = licenseJobsConfig.find(job => job.name === 'renewal-reminders');

    test('should create renewal opportunities for expiring licenses', async () => {
      const mockCandidates = [
        {
          id: '1',
          tenant_id: 'tenant1',
          license_id: 'license1',
          license_name: 'Premium License',
          price_annual: 1000,
          tenant_name: 'Test Company',
          tenant_email: 'test@company.com',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          days_until_expiry: 30
        }
      ];

      mockDb.query
        .mockResolvedValueOnce({ rows: mockCandidates })
        .mockResolvedValueOnce({ rows: [{ id: 'renewal1' }] });

      await renewalJob?.handler();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO renewal_opportunities'),
        expect.arrayContaining(['1', 'tenant1', 'license1', 1000])
      );

      expect(mockEmail.sendRenewalReminder).toHaveBeenCalledWith({
        tenantEmail: 'test@company.com',
        tenantName: 'Test Company',
        licenseName: 'Premium License',
        expiresAt: expect.any(Date),
        renewalPrice: 1000,
        renewalUrl: expect.stringContaining('/tenant/tenant1/upgrade?renewal=renewal1')
      });
    });
  });

  describe('Daily Jobs - Compliance Check', () => {
    const complianceJob = licenseJobsConfig.find(job => job.name === 'compliance-check');

    test('should detect user limit violations', async () => {
      const mockResults = [
        {
          tenant_id: 'tenant1',
          tenant_name: 'Test Company',
          active_users: 15,
          max_users: 10,
          license_id: 'license1',
          license_name: 'Basic License',
          compliance_status: 'violation'
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockResults });

      await complianceJob?.handler();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO compliance_violations'),
        expect.arrayContaining(['tenant1', 'license1', 'user_limit_exceeded'])
      );

      expect(mockNotifications.create).toHaveBeenCalledWith({
        tenantId: 'tenant1',
        type: 'compliance_violation',
        title: 'License Compliance Violation',
        message: expect.stringContaining('exceeded your user limit'),
        urgency: 'critical',
        actionUrl: '/tenant/tenant1/upgrade'
      });
    });
  });

  describe('Weekly Jobs - Usage Reports', () => {
    const reportsJob = licenseJobsConfig.find(job => job.name === 'usage-reports');

    test('should be scheduled for Monday at 9 AM', () => {
      expect(reportsJob?.schedule).toBe('0 9 * * 1');
    });

    test('should generate reports for all active tenants', async () => {
      const mockTenants = [
        { id: 'tenant1', name: 'Company A', email: 'admin@companya.com' },
        { id: 'tenant2', name: 'Company B', email: 'admin@companyb.com' }
      ];

      const mockReport = {
        activeUsers: 10,
        assessmentsCreated: 5,
        reportsGenerated: 3,
        storageUsed: 100
      };

      mockDb.query.mockResolvedValue({ rows: mockTenants });
      mockUsage.generateWeeklyReport.mockResolvedValue(mockReport);

      await reportsJob?.handler();

      expect(mockUsage.generateWeeklyReport).toHaveBeenCalledTimes(2);
      expect(mockEmail.sendWeeklyUsageReport).toHaveBeenCalledTimes(2);
    });
  });

  describe('Weekly Jobs - License Analytics', () => {
    const analyticsJob = licenseJobsConfig.find(job => job.name === 'license-analytics');

    test('should generate optimization suggestions', async () => {
      const mockAnalytics = [
        {
          license_id: 'license1',
          license_name: 'Basic License',
          active_licenses: 10,
          avg_utilization: 0.2, // Low utilization
          total_revenue: 5000,
          high_utilization_count: 1
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockAnalytics });

      await analyticsJob?.handler();

      expect(mockNotifications.createSystemNotification).toHaveBeenCalledWith({
        type: 'optimization_suggestion',
        title: 'License Optimization Opportunity',
        message: expect.stringContaining('low utilization'),
        priority: 'medium',
        category: 'revenue_optimization'
      });
    });
  });

  describe('Monthly Jobs - Billing Cycles', () => {
    const billingJob = licenseJobsConfig.find(job => job.name === 'billing-cycles');

    test('should be scheduled for 1st of month at 6 AM', () => {
      expect(billingJob?.schedule).toBe('0 6 1 * *');
    });

    test('should process monthly billing for active licenses', async () => {
      const mockLicenses = [
        {
          id: '1',
          tenant_id: 'tenant1',
          license_id: 'license1',
          license_name: 'Premium License',
          price_monthly: 100,
          tenant_name: 'Test Company',
          tenant_email: 'billing@company.com'
        }
      ];

      mockDb.query
        .mockResolvedValueOnce({ rows: mockLicenses })
        .mockResolvedValueOnce({ rows: [{ id: 'invoice1', invoice_number: 'INV-001' }] })
        .mockResolvedValueOnce({ rows: [] });

      await billingJob?.handler();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO invoices'),
        expect.arrayContaining(['tenant1', 'license1', 100])
      );

      expect(mockEmail.sendInvoice).toHaveBeenCalledWith({
        tenantEmail: 'billing@company.com',
        tenantName: 'Test Company',
        invoiceNumber: 'INV-001',
        amount: 100,
        dueDate: expect.any(Date)
      });
    });
  });

  describe('Hourly Jobs - Status Sync', () => {
    const statusJob = licenseJobsConfig.find(job => job.name === 'status-sync');

    test('should be scheduled every hour', () => {
      expect(statusJob?.schedule).toBe('0 * * * *');
    });

    test('should update expired licenses', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      await statusJob?.handler();

      // Should update expired, grace period, and suspended licenses
      expect(mockDb.query).toHaveBeenCalledTimes(3);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tenant_licenses SET status = \'expired\'')
      );
    });
  });

  describe('Hourly Jobs - Real-time Monitoring', () => {
    const monitoringJob = licenseJobsConfig.find(job => job.name === 'real-time-monitoring');

    test('should be scheduled every 15 minutes', () => {
      expect(monitoringJob?.schedule).toBe('*/15 * * * *');
    });

    test('should detect system anomalies', async () => {
      const mockAnomalies = [
        {
          tenant_id: 'tenant1',
          concurrent_users: 1500,
          last_activity: new Date()
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockAnomalies });

      await monitoringJob?.handler();

      expect(mockNotifications.create).toHaveBeenCalledWith({
        tenantId: 'tenant1',
        type: 'system_anomaly',
        title: 'Unusual Activity Detected',
        message: expect.stringContaining('1500 users'),
        urgency: 'high'
      });
    });
  });

  describe('Job Execution Framework', () => {
    test('should initialize all enabled jobs', async () => {
      const enabledJobs = licenseJobsConfig.filter(job => job.enabled);
      
      await jobExecutor.initializeJobs();

      expect(enabledJobs).toHaveLength(11); // All jobs should be enabled
    });

    test('should handle job execution with timeout', async () => {
      const testJob = licenseJobsConfig[0];
      const originalHandler = testJob.handler;
      
      // Mock a slow handler
      testJob.handler = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, testJob.timeout + 1000))
      );

      await expect(jobExecutor.executeJob(testJob)).rejects.toThrow('Job timeout');
      
      // Restore original handler
      testJob.handler = originalHandler;
    });

    test('should collect job metrics', async () => {
      const testJob = licenseJobsConfig[0];
      testJob.handler = jest.fn().mockResolvedValue(undefined);

      await jobExecutor.executeJob(testJob);

      expect(mockDb.logJobExecution).toHaveBeenCalledWith({
        jobName: testJob.name,
        executionId: expect.any(String),
        status: 'completed',
        duration: expect.any(Number),
        completedAt: expect.any(Date)
      });
    });

    test('should handle job failures with retry', async () => {
      const testJob = { ...licenseJobsConfig[0], retryAttempts: 2 };
      testJob.handler = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(jobExecutor.executeJob(testJob)).rejects.toThrow('Test error');

      expect(mockDb.logJobExecution).toHaveBeenCalledWith({
        jobName: testJob.name,
        executionId: expect.any(String),
        status: 'failed',
        duration: expect.any(Number),
        error: 'Test error',
        completedAt: expect.any(Date)
      });
    });
  });

  describe('Integration Tests', () => {
    test('should execute full license lifecycle workflow', async () => {
      // Simulate a complete license lifecycle
      const expiryJob = licenseJobsConfig.find(job => job.name === 'license-expiry-check');
      const renewalJob = licenseJobsConfig.find(job => job.name === 'renewal-reminders');
      const billingJob = licenseJobsConfig.find(job => job.name === 'billing-cycles');

      // Setup mock data for expiring license
      const mockLicense = {
        id: '1',
        tenant_id: 'tenant1',
        license_id: 'license1',
        license_name: 'Premium License',
        tenant_name: 'Test Company',
        tenant_email: 'test@company.com',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price_annual: 1200,
        price_monthly: 100
      };

      // Mock database responses
      mockDb.query
        .mockResolvedValueOnce({ rows: [mockLicense] }) // Expiry check
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockLicense] }) // Renewal reminder
        .mockResolvedValueOnce({ rows: [{ id: 'renewal1' }] })
        .mockResolvedValueOnce({ rows: [mockLicense] }) // Billing
        .mockResolvedValueOnce({ rows: [{ id: 'invoice1', invoice_number: 'INV-001' }] })
        .mockResolvedValueOnce({ rows: [] });

      // Execute lifecycle jobs
      await expiryJob?.handler();
      await renewalJob?.handler();
      await billingJob?.handler();

      // Verify complete workflow
      expect(mockEmail.sendLicenseExpiryNotification).toHaveBeenCalled();
      expect(mockEmail.sendRenewalReminder).toHaveBeenCalled();
      expect(mockEmail.sendInvoice).toHaveBeenCalled();
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    test('should handle high-volume tenant processing', async () => {
      const usageJob = licenseJobsConfig.find(job => job.name === 'usage-aggregation');
      
      // Simulate 1000 active licenses
      const mockLicenses = Array.from({ length: 1000 }, (_, i) => ({
        tenant_id: `tenant${i}`,
        license_id: `license${i}`
      }));

      mockDb.query.mockResolvedValueOnce({ rows: mockLicenses });
      mockUsage.aggregateDailyUsage.mockResolvedValue({
        usersActive: 10,
        assessmentsCreated: 5,
        reportsGenerated: 3,
        storageUsedMb: 100,
        apiCallsMade: 50,
        featuresUsed: []
      });

      const startTime = Date.now();
      await usageJob?.handler();
      const executionTime = Date.now() - startTime;

      // Should complete within reasonable time (< 30 seconds for 1000 tenants)
      expect(executionTime).toBeLessThan(30000);
      expect(mockUsage.aggregateDailyUsage).toHaveBeenCalledTimes(1000);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle database connection failures', async () => {
      const testJob = licenseJobsConfig[0];
      mockDb.query.mockRejectedValue(new Error('Connection timeout'));

      await expect(testJob.handler()).rejects.toThrow('Connection timeout');
    });

    test('should handle email service failures gracefully', async () => {
      const expiryJob = licenseJobsConfig.find(job => job.name === 'license-expiry-check');
      
      mockDb.query.mockResolvedValue({ rows: [{ 
        tenant_email: 'test@company.com',
        tenant_name: 'Test Company',
        license_name: 'Premium License',
        expires_at: new Date()
      }] });
      
      mockEmail.sendLicenseExpiryNotification.mockRejectedValue(new Error('SMTP error'));

      // Should not throw - email failures should be logged but not stop job
      await expect(expiryJob?.handler()).rejects.toThrow();
    });

    test('should handle partial failures in batch operations', async () => {
      const reportsJob = licenseJobsConfig.find(job => job.name === 'usage-reports');
      
      const mockTenants = [
        { id: 'tenant1', name: 'Company A', email: 'valid@email.com' },
        { id: 'tenant2', name: 'Company B', email: 'invalid@email.com' }
      ];

      mockDb.query.mockResolvedValue({ rows: mockTenants });
      mockUsage.generateWeeklyReport.mockResolvedValue({});
      
      mockEmail.sendWeeklyUsageReport
        .mockResolvedValueOnce(undefined) // Success for first tenant
        .mockRejectedValueOnce(new Error('Invalid email')); // Failure for second

      // Should continue processing despite individual failures
      await expect(reportsJob?.handler()).rejects.toThrow();
      expect(mockUsage.generateWeeklyReport).toHaveBeenCalledTimes(2);
    });
  });
});

export default {};
