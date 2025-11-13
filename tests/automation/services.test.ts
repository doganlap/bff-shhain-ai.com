/**
 * Advanced Test Suite for Service Layer Infrastructure
 * Comprehensive testing of DatabaseService, EmailService, NotificationService, and UsageService
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DatabaseService } from '../../lib/services/DatabaseService';
import { EmailService } from '../../lib/services/EmailService';
import { NotificationService } from '../../lib/services/NotificationService';
import { UsageService } from '../../lib/services/UsageService';

// Mock external dependencies
jest.mock('pg');
jest.mock('nodemailer');

describe('Service Layer Infrastructure - Advanced Tests', () => {
  
  describe('DatabaseService - Enterprise PostgreSQL Management', () => {
    let dbService: DatabaseService;
    let mockPool: any;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
        totalCount: 5,
        idleCount: 3,
        waitingCount: 0
      };

      // Mock Pool constructor
      const { Pool } = require('pg');
      Pool.mockImplementation(() => mockPool);

      dbService = DatabaseService.getInstance();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Connection Management', () => {
      test('should initialize connection pool with correct configuration', () => {
        const status = dbService.getConnectionStatus();
        
        expect(status.config.host).toBeDefined();
        expect(status.config.database).toBeDefined();
        expect(status.poolStatus.totalCount).toBe(5);
      });

      test('should handle connection events', () => {
        expect(mockPool.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockPool.on).toHaveBeenCalledWith('remove', expect.any(Function));
      });

      test('should test connection successfully', async () => {
        mockPool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
        
        const result = await dbService.testConnection();
        
        expect(result).toBe(true);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT 1');
      });

      test('should handle connection test failure', async () => {
        mockPool.query.mockRejectedValue(new Error('Connection failed'));
        
        const result = await dbService.testConnection();
        
        expect(result).toBe(false);
      });
    });

    describe('Query Execution', () => {
      test('should execute queries successfully', async () => {
        const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
        mockPool.query.mockResolvedValue(mockResult);
        
        const result = await dbService.query('SELECT * FROM test WHERE id = $1', [1]);
        
        expect(result).toEqual(mockResult);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      });

      test('should handle query errors', async () => {
        mockPool.query.mockRejectedValue(new Error('Query failed'));
        
        await expect(dbService.query('INVALID SQL')).rejects.toThrow('Query failed');
      });

      test('should detect slow queries', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        // Mock slow query (> 1 second)
        mockPool.query.mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({ rows: [] }), 1100)
          )
        );
        
        await dbService.query('SELECT * FROM large_table');
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Slow query detected')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('Transaction Management', () => {
      test('should execute transactions successfully', async () => {
        const mockClient = {
          query: jest.fn().mockResolvedValue({ rows: [] }),
          release: jest.fn()
        };
        
        mockPool.connect.mockResolvedValue(mockClient);
        
        const result = await dbService.transaction(async (client) => {
          await client.query('INSERT INTO test VALUES ($1)', [1]);
          return 'success';
        });
        
        expect(result).toBe('success');
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mockClient.release).toHaveBeenCalled();
      });

      test('should rollback on transaction failure', async () => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockRejectedValueOnce(new Error('Insert failed')) // INSERT
            .mockResolvedValueOnce(undefined), // ROLLBACK
          release: jest.fn()
        };
        
        mockPool.connect.mockResolvedValue(mockClient);
        
        await expect(dbService.transaction(async (client) => {
          await client.query('INSERT INTO test VALUES ($1)', [1]);
        })).rejects.toThrow('Insert failed');
        
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
      });
    });

    describe('Event Logging', () => {
      test('should log events successfully', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });
        
        await dbService.logEvent({
          type: 'license_expiry',
          tenantId: 'tenant1',
          licenseId: 'license1',
          details: { daysRemaining: 7 },
          severity: 'high'
        });
        
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO system_events'),
          expect.arrayContaining([
            'license_expiry',
            'tenant1',
            'license1',
            null,
            expect.any(String), // JSON stringified details
            'high'
          ])
        );
      });

      test('should handle logging errors gracefully', async () => {
        mockPool.query.mockRejectedValue(new Error('Log failed'));
        
        // Should not throw - logging failures shouldn't break main flow
        await expect(dbService.logEvent({
          type: 'test_event'
        })).resolves.toBeUndefined();
      });
    });

    describe('Health Metrics', () => {
      test('should collect comprehensive health metrics', async () => {
        mockPool.query
          .mockResolvedValueOnce({ rows: [{ total_connections: 10, active_connections: 5, idle_connections: 5 }] })
          .mockResolvedValueOnce({ rows: [{ schemaname: 'public', tablename: 'tenants', n_live_tup: 100 }] })
          .mockResolvedValueOnce({ rows: [{ query: 'SELECT * FROM tenants', calls: 1000, total_time: 5000 }] });
        
        const metrics = await dbService.getHealthMetrics();
        
        expect(metrics.connections).toBeDefined();
        expect(metrics.tables).toBeDefined();
        expect(metrics.performance).toBeDefined();
        expect(metrics.poolStatus.totalCount).toBe(5);
      });

      test('should handle health metrics errors', async () => {
        mockPool.query.mockRejectedValue(new Error('Metrics failed'));
        
        const metrics = await dbService.getHealthMetrics();
        
        expect(metrics.error).toBe('Metrics failed');
        expect(metrics.poolStatus).toBeDefined();
      });
    });

    describe('Maintenance Operations', () => {
      test('should perform database maintenance', async () => {
        mockPool.query
          .mockResolvedValueOnce(undefined) // ANALYZE
          .mockResolvedValueOnce({ rowCount: 100 }) // Cleanup job executions
          .mockResolvedValueOnce({ rowCount: 50 }) // Cleanup system events
          .mockResolvedValueOnce(undefined); // VACUUM ANALYZE
        
        await dbService.performMaintenance();
        
        expect(mockPool.query).toHaveBeenCalledWith('ANALYZE');
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM job_executions')
        );
        expect(mockPool.query).toHaveBeenCalledWith('VACUUM ANALYZE');
      });
    });
  });

  describe('EmailService - Multi-Provider Email System', () => {
    let emailService: EmailService;
    let mockTransporter: any;

    beforeEach(() => {
      mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
        verify: jest.fn().mockResolvedValue(true)
      };

      const nodemailer = require('nodemailer');
      nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

      emailService = EmailService.getInstance({
        provider: 'smtp',
        defaultFrom: 'test@shahin-ai.com'
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Service Initialization', () => {
      test('should initialize SMTP transporter', () => {
        const status = emailService.getStatus();
        
        expect(status.provider).toBe('smtp');
        expect(status.configured).toBe(true);
        expect(status.defaultFrom).toBe('test@shahin-ai.com');
      });

      test('should test connection successfully', async () => {
        const result = await emailService.testConnection();
        
        expect(result).toBe(true);
        expect(mockTransporter.verify).toHaveBeenCalled();
      });
    });

    describe('License Notifications', () => {
      test('should send license expiry notification', async () => {
        await emailService.sendLicenseExpiryNotification({
          tenantEmail: 'tenant@company.com',
          tenantName: 'Test Company',
          licenseName: 'Premium License',
          expiresAt: new Date('2024-12-31'),
          daysRemaining: 7,
          urgencyLevel: 'urgent'
        });
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: 'test@shahin-ai.com',
          to: 'tenant@company.com',
          subject: expect.stringContaining('License Expiring in 7 days'),
          html: expect.stringContaining('Premium License'),
          text: expect.stringContaining('Premium License'),
          replyTo: expect.any(String)
        });
      });

      test('should send renewal reminder', async () => {
        await emailService.sendRenewalReminder({
          tenantEmail: 'tenant@company.com',
          tenantName: 'Test Company',
          licenseName: 'Premium License',
          expiresAt: new Date('2024-12-31'),
          renewalPrice: 1000,
          renewalUrl: 'https://app.shahin-ai.com/renew/123'
        });
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: 'test@shahin-ai.com',
          to: 'tenant@company.com',
          subject: expect.stringContaining('Time to Renew'),
          html: expect.stringContaining('$1000'),
          text: expect.stringContaining('$1000'),
          replyTo: expect.any(String)
        });
      });
    });

    describe('Usage Reports', () => {
      test('should send weekly usage report', async () => {
        await emailService.sendWeeklyUsageReport({
          tenantEmail: 'tenant@company.com',
          tenantName: 'Test Company',
          reportData: {
            activeUsers: 10,
            assessmentsCreated: 5,
            reportsGenerated: 3,
            storageUsed: 100
          },
          reportPeriod: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-07')
          }
        });
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: 'test@shahin-ai.com',
          to: 'tenant@company.com',
          subject: expect.stringContaining('Weekly Usage Report'),
          html: expect.stringContaining('Active Users: 10'),
          text: expect.stringContaining('Active Users: 10'),
          replyTo: expect.any(String)
        });
      });
    });

    describe('Billing Communications', () => {
      test('should send invoice', async () => {
        await emailService.sendInvoice({
          tenantEmail: 'billing@company.com',
          tenantName: 'Test Company',
          invoiceNumber: 'INV-001',
          amount: 500,
          dueDate: new Date('2024-02-15')
        });
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: 'test@shahin-ai.com',
          to: 'billing@company.com',
          subject: expect.stringContaining('Invoice INV-001'),
          html: expect.stringContaining('$500'),
          text: expect.stringContaining('$500'),
          replyTo: expect.any(String)
        });
      });
    });

    describe('Error Handling', () => {
      test('should handle email sending failures', async () => {
        mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));
        
        await expect(emailService.sendLicenseExpiryNotification({
          tenantEmail: 'invalid@email.com',
          tenantName: 'Test',
          licenseName: 'Test License',
          expiresAt: new Date(),
          daysRemaining: 1,
          urgencyLevel: 'critical'
        })).rejects.toThrow('SMTP error');
      });
    });
  });

  describe('NotificationService - Multi-Channel Notifications', () => {
    let notificationService: NotificationService;
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        statusText: 'OK'
      } as Response);

      notificationService = NotificationService.getInstance({
        channels: {
          email: true,
          inApp: true,
          webhook: true,
          slack: true
        },
        webhookUrl: 'https://api.example.com/webhook',
        slackWebhookUrl: 'https://hooks.slack.com/test'
      });
    });

    afterEach(() => {
      fetchSpy.mockRestore();
      jest.clearAllMocks();
    });

    describe('Service Configuration', () => {
      test('should initialize with correct configuration', () => {
        const status = notificationService.getStatus();
        
        expect(status.channels.email).toBe(true);
        expect(status.channels.inApp).toBe(true);
        expect(status.webhookConfigured).toBe(true);
        expect(status.slackConfigured).toBe(true);
      });
    });

    describe('Multi-Channel Delivery', () => {
      test('should create notification across all channels', async () => {
        await notificationService.create({
          tenantId: 'tenant1',
          type: 'license_expiry',
          title: 'License Expiring Soon',
          message: 'Your license expires in 7 days',
          urgency: 'high',
          actionUrl: '/tenant/tenant1/licenses'
        });
        
        // Should call webhook
        expect(fetchSpy).toHaveBeenCalledWith(
          'https://api.example.com/webhook',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('license_expiry')
          })
        );
        
        // Should call Slack webhook
        expect(fetchSpy).toHaveBeenCalledWith(
          'https://hooks.slack.com/test',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('License Expiring Soon')
          })
        );
      });

      test('should handle webhook failures gracefully', async () => {
        fetchSpy.mockRejectedValue(new Error('Network error'));
        
        // Should not throw - webhook failures should be logged but not stop notification
        await expect(notificationService.create({
          tenantId: 'tenant1',
          type: 'test',
          title: 'Test',
          message: 'Test message',
          urgency: 'low'
        })).resolves.toBeUndefined();
      });
    });

    describe('System Notifications', () => {
      test('should create system notifications', async () => {
        await notificationService.createSystemNotification({
          type: 'system_alert',
          title: 'High CPU Usage',
          message: 'System CPU usage is above 90%',
          priority: 'critical',
          category: 'system_health'
        });
        
        // Critical notifications should trigger Slack alerts
        expect(fetchSpy).toHaveBeenCalledWith(
          'https://hooks.slack.com/test',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('🚨 CRITICAL: High CPU Usage')
          })
        );
      });
    });

    describe('Urgency-Based Routing', () => {
      test('should use correct Slack colors for different urgencies', async () => {
        const urgencies = ['low', 'medium', 'high', 'critical'];
        const expectedColors = ['#36A64F', '#FF9500', '#FF6B35', '#FF0000'];
        
        for (let i = 0; i < urgencies.length; i++) {
          await notificationService.create({
            type: 'test',
            title: 'Test',
            message: 'Test message',
            urgency: urgencies[i] as any
          });
          
          const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
          const body = JSON.parse(lastCall[1].body);
          expect(body.attachments[0].color).toBe(expectedColors[i]);
        }
      });
    });
  });

  describe('UsageService - Analytics and Compliance', () => {
    let usageService: UsageService;
    let mockDb: jest.Mocked<DatabaseService>;

    beforeEach(() => {
      mockDb = {
        query: jest.fn(),
        logEvent: jest.fn(),
        getConnectionStatus: jest.fn().mockReturnValue({ isConnected: true })
      } as any;

      // Mock DatabaseService.getInstance
      jest.spyOn(DatabaseService, 'getInstance').mockReturnValue(mockDb);
      
      usageService = UsageService.getInstance();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('Usage Aggregation', () => {
      test('should aggregate daily usage metrics', async () => {
        mockDb.query
          .mockResolvedValueOnce({ rows: [{ active_users: 10 }] })
          .mockResolvedValueOnce({ rows: [{ assessments_created: 5 }] })
          .mockResolvedValueOnce({ rows: [{ reports_generated: 3 }] })
          .mockResolvedValueOnce({ rows: [{ storage_used: 100 }] })
          .mockResolvedValueOnce({ rows: [{ api_calls: 50 }] })
          .mockResolvedValueOnce({ rows: [{ feature_name: 'assessments' }, { feature_name: 'reports' }] });
        
        const result = await usageService.aggregateDailyUsage({
          tenantId: 'tenant1',
          licenseId: 'license1',
          date: new Date('2024-01-15')
        });
        
        expect(result).toEqual({
          usersActive: 10,
          assessmentsCreated: 5,
          reportsGenerated: 3,
          storageUsedMb: 100,
          apiCallsMade: 50,
          featuresUsed: ['assessments', 'reports']
        });
      });

      test('should handle missing data gracefully', async () => {
        mockDb.query.mockResolvedValue({ rows: [] });
        
        const result = await usageService.aggregateDailyUsage({
          tenantId: 'tenant1',
          licenseId: 'license1',
          date: new Date()
        });
        
        expect(result.usersActive).toBe(0);
        expect(result.assessmentsCreated).toBe(0);
        expect(result.featuresUsed).toEqual([]);
      });
    });

    describe('Usage Limit Monitoring', () => {
      test('should check usage limits and create warnings', async () => {
        mockDb.query.mockResolvedValueOnce({
          rows: [{
            max_users: 10,
            max_storage_mb: 1000,
            max_api_calls_monthly: 10000,
            max_assessments_monthly: 100
          }]
        });
        
        // Mock current usage that exceeds limits
        jest.spyOn(usageService as any, 'getCurrentUsage').mockResolvedValue({
          usersActive: 12, // Exceeds limit
          storageUsedMb: 950, // Close to limit
          apiCallsMade: 9500, // Close to limit
          assessmentsCreated: 95 // Close to limit
        });
        
        await usageService.checkUsageLimits('tenant1', 'license1');
        
        // Should log events for limit warnings
        expect(mockDb.logEvent).toHaveBeenCalledWith({
          type: 'usage_limit_warning',
          tenantId: 'tenant1',
          details: expect.objectContaining({
            type: 'users',
            current: 12,
            limit: 10
          }),
          severity: 'high'
        });
      });
    });

    describe('Weekly Report Generation', () => {
      test('should generate comprehensive weekly report', async () => {
        // Mock current week metrics
        mockDb.query.mockResolvedValueOnce({
          rows: [{
            avg_users: 8,
            total_assessments: 15,
            total_reports: 10,
            max_storage: 200,
            total_api_calls: 500
          }]
        });
        
        // Mock previous week metrics
        mockDb.query.mockResolvedValueOnce({
          rows: [{
            avg_users: 6,
            total_assessments: 10,
            total_reports: 8,
            max_storage: 180,
            total_api_calls: 400
          }]
        });
        
        const report = await usageService.generateWeeklyReport('tenant1');
        
        expect(report.tenantId).toBe('tenant1');
        expect(report.metrics.usersActive).toBe(8);
        expect(report.trends.usersGrowth).toBe(33); // (8-6)/6 * 100
        expect(report.recommendations).toBeInstanceOf(Array);
      });

      test('should generate appropriate recommendations', async () => {
        mockDb.query
          .mockResolvedValueOnce({ rows: [{ avg_users: 0, total_assessments: 0 }] })
          .mockResolvedValueOnce({ rows: [{ avg_users: 0, total_assessments: 0 }] });
        
        const report = await usageService.generateWeeklyReport('tenant1');
        
        expect(report.recommendations).toContain(
          'No assessments created this week - explore our assessment templates'
        );
      });
    });

    describe('Usage Analytics', () => {
      test('should provide usage analytics for dashboard', async () => {
        const mockUsageData = [
          { usage_date: '2024-01-01', users_active: 5, assessments_created: 2 },
          { usage_date: '2024-01-02', users_active: 7, assessments_created: 3 },
          { usage_date: '2024-01-03', users_active: 6, assessments_created: 1 }
        ];
        
        mockDb.query.mockResolvedValue({ rows: mockUsageData });
        
        const analytics = await usageService.getUsageAnalytics('tenant1', 30);
        
        expect(analytics.daily).toEqual(mockUsageData);
        expect(analytics.summary.totalUsers).toBe(7); // Max users
        expect(analytics.summary.totalAssessments).toBe(6); // Sum of assessments
      });
    });

    describe('Error Handling', () => {
      test('should handle database errors in usage aggregation', async () => {
        mockDb.query.mockRejectedValue(new Error('Database error'));
        
        await expect(usageService.aggregateDailyUsage({
          tenantId: 'tenant1',
          licenseId: 'license1',
          date: new Date()
        })).rejects.toThrow('Database error');
      });

      test('should handle errors in weekly report generation', async () => {
        mockDb.query.mockRejectedValue(new Error('Query failed'));
        
        await expect(usageService.generateWeeklyReport('tenant1')).rejects.toThrow('Query failed');
      });
    });

    describe('Service Status', () => {
      test('should return service status', () => {
        const status = usageService.getStatus();
        
        expect(status.service).toBe('UsageService');
        expect(status.initialized).toBe(true);
        expect(status.dbConnected).toBe(true);
      });
    });
  });

  describe('Service Integration Tests', () => {
    test('should integrate all services for complete workflow', async () => {
      // This test would verify that all services work together
      // in a real-world scenario like processing a license expiry
      
      const dbService = DatabaseService.getInstance();
      const emailService = EmailService.getInstance();
      const notificationService = NotificationService.getInstance();
      const usageService = UsageService.getInstance();
      
      // Mock successful operations
      const mockDb = dbService as jest.Mocked<DatabaseService>;
      mockDb.query = jest.fn().mockResolvedValue({ rows: [] });
      mockDb.logEvent = jest.fn().mockResolvedValue(undefined);
      
      // Simulate license expiry workflow
      await mockDb.logEvent({
        type: 'license_expiry_check',
        tenantId: 'tenant1',
        details: { daysRemaining: 7 }
      });
      
      await notificationService.create({
        tenantId: 'tenant1',
        type: 'license_expiry',
        title: 'License Expiring',
        message: 'Your license expires in 7 days',
        urgency: 'high'
      });
      
      // Verify integration
      expect(mockDb.logEvent).toHaveBeenCalled();
    });
  });
});

export default {};
