/**
 * Advanced Test Suite for Cron Scheduler Engine
 * Enterprise-grade scheduler testing with monitoring, health checks, and recovery
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CronScheduler } from '../../lib/cron/cronScheduler';
import { DatabaseService } from '../../lib/services/DatabaseService';
import { NotificationService } from '../../lib/services/NotificationService';

// Mock dependencies
jest.mock('../../lib/services/DatabaseService');
jest.mock('../../lib/services/NotificationService');

describe('Cron Scheduler Engine - Advanced Tests', () => {
  let scheduler: CronScheduler;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockNotifications: jest.Mocked<NotificationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockNotifications = new NotificationService() as jest.Mocked<NotificationService>;
    
    // Setup mock implementations
    mockDb.query = jest.fn().mockResolvedValue({ rows: [] });
    mockDb.logJobExecution = jest.fn().mockResolvedValue(undefined);
    mockNotifications.createSystemNotification = jest.fn().mockResolvedValue(undefined);
    
    scheduler = CronScheduler.getInstance({
      maxConcurrentJobs: 5,
      healthCheckInterval: 1000, // 1 second for testing
      failureThreshold: 2,
      recoveryDelay: 100, // 100ms for testing
      enableMetrics: true,
      enableAutoRecovery: true
    });
  });

  afterEach(async () => {
    await scheduler.stop();
    jest.restoreAllMocks();
  });

  describe('Scheduler Initialization', () => {
    test('should initialize with correct configuration', () => {
      const status = scheduler.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.totalJobs).toBeGreaterThan(0);
      expect(status.config.maxConcurrentJobs).toBe(5);
      expect(status.config.enableMetrics).toBe(true);
    });

    test('should create database tables on initialization', async () => {
      await scheduler.start();
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS job_executions')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS scheduler_health')
      );
    });

    test('should load job configurations correctly', async () => {
      await scheduler.start();
      
      const status = scheduler.getStatus();
      expect(status.totalJobs).toBe(11); // All license jobs
      expect(status.isRunning).toBe(true);
    });
  });

  describe('Job Execution Monitoring', () => {
    test('should track job execution metrics', async () => {
      await scheduler.start();
      
      // Trigger a job manually
      await scheduler.triggerJob('license-expiry-check');
      
      const metrics = scheduler.getJobMetrics('license-expiry-check');
      expect(metrics).toBeDefined();
      expect(metrics.totalExecutions).toBe(1);
    });

    test('should handle concurrent job limits', async () => {
      await scheduler.start();
      
      // Try to trigger more jobs than the limit
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(scheduler.triggerJob('status-sync'));
      }
      
      // Some should be rejected due to concurrent limit
      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected');
      expect(rejected.length).toBeGreaterThan(0);
    });

    test('should log job executions to database', async () => {
      await scheduler.start();
      
      await scheduler.triggerJob('status-sync');
      
      expect(mockDb.logJobExecution).toHaveBeenCalledWith({
        jobName: 'status-sync',
        executionId: expect.any(String),
        status: 'running',
        startedAt: expect.any(Date)
      });
      
      expect(mockDb.logJobExecution).toHaveBeenCalledWith({
        jobName: 'status-sync',
        executionId: expect.any(String),
        status: 'completed',
        duration: expect.any(Number),
        completedAt: expect.any(Date)
      });
    });

    test('should handle job execution timeouts', async () => {
      // Mock a job that takes too long
      const originalJob = scheduler.getJobStatus('real-time-monitoring');
      
      await scheduler.start();
      
      // This should timeout based on job configuration
      await expect(scheduler.triggerJob('real-time-monitoring')).rejects.toThrow();
    });
  });

  describe('Health Monitoring System', () => {
    test('should perform regular health checks', async () => {
      await scheduler.start();
      
      // Wait for health check to run
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const health = await scheduler.getSystemHealth();
      expect(health).toBeDefined();
      expect(health.status).toMatch(/healthy|degraded|critical/);
      expect(health.lastHealthCheck).toBeInstanceOf(Date);
    });

    test('should detect high system load', async () => {
      // Mock high system load
      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 900000,
        system: 100000
      });
      
      await scheduler.start();
      
      const health = await scheduler.getSystemHealth();
      expect(health.systemLoad).toBeGreaterThan(80);
      expect(health.status).toBe('degraded');
    });

    test('should detect high memory usage', async () => {
      // Mock high memory usage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 1000000000,
        heapTotal: 1000000000,
        heapUsed: 950000000, // 95% usage
        external: 0,
        arrayBuffers: 0
      });
      
      await scheduler.start();
      
      const health = await scheduler.getSystemHealth();
      expect(health.memoryUsage).toBeGreaterThan(90);
      expect(health.status).toBe('critical');
    });

    test('should save health status to database', async () => {
      await scheduler.start();
      
      // Wait for health check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO scheduler_health'),
        expect.arrayContaining([
          expect.any(String), // status
          expect.any(Number), // active_jobs
          expect.any(Number), // failed_jobs
          expect.any(Number), // system_load
          expect.any(Number), // memory_usage
          expect.any(String), // issues JSON
          expect.any(Date)    // checked_at
        ])
      );
    });
  });

  describe('Automatic Failure Handling', () => {
    test('should detect consecutive job failures', async () => {
      await scheduler.start();
      
      // Mock a job that always fails
      const failingJob = {
        name: 'test-failing-job',
        schedule: '* * * * *',
        enabled: true,
        priority: 'medium' as const,
        timeout: 5000,
        retryAttempts: 1,
        retryDelay: 100,
        handler: jest.fn().mockRejectedValue(new Error('Test failure'))
      };
      
      // Simulate multiple failures
      for (let i = 0; i < 3; i++) {
        try {
          await scheduler.triggerJob(failingJob.name);
        } catch (error) {
          // Expected to fail
        }
      }
      
      expect(mockNotifications.createSystemNotification).toHaveBeenCalledWith({
        type: 'job_failure',
        title: expect.stringContaining('Job Failure Alert'),
        message: expect.stringContaining('failed'),
        priority: 'high',
        category: 'job_monitoring'
      });
    });

    test('should attempt automatic recovery', async () => {
      await scheduler.start();
      
      // Simulate critical health condition
      const criticalHealth = {
        status: 'critical' as const,
        activeJobs: 0,
        failedJobs: 5,
        systemLoad: 95,
        memoryUsage: 95,
        lastHealthCheck: new Date(),
        issues: ['High system load', 'High memory usage', 'Multiple job failures']
      };
      
      // Trigger recovery
      await scheduler['handleCriticalHealth'](criticalHealth);
      
      expect(mockNotifications.createSystemNotification).toHaveBeenCalledWith({
        type: 'system_critical',
        title: 'Scheduler Critical Health Alert',
        message: expect.stringContaining('critical'),
        priority: 'critical',
        category: 'system_health'
      });
    });

    test('should restart failed jobs during recovery', async () => {
      await scheduler.start();
      
      // Mock failed jobs
      const metrics = scheduler.getJobMetrics() as Map<string, any>;
      metrics.set('test-job', {
        totalExecutions: 5,
        successfulExecutions: 2,
        failedExecutions: 3,
        consecutiveFailures: 3,
        uptime: 40
      });
      
      // Trigger recovery
      await scheduler['restartFailedJobs']();
      
      // Should reset consecutive failures
      const updatedMetrics = scheduler.getJobMetrics('test-job');
      expect(updatedMetrics?.consecutiveFailures).toBe(0);
    });
  });

  describe('Metrics Collection and Performance Tracking', () => {
    test('should collect execution metrics', async () => {
      await scheduler.start();
      
      // Execute a job multiple times
      for (let i = 0; i < 5; i++) {
        await scheduler.triggerJob('status-sync');
      }
      
      const metrics = scheduler.getJobMetrics('status-sync');
      expect(metrics?.totalExecutions).toBe(5);
      expect(metrics?.averageExecutionTime).toBeGreaterThan(0);
      expect(metrics?.uptime).toBe(100); // All successful
    });

    test('should calculate uptime correctly', async () => {
      await scheduler.start();
      
      // Mock mixed success/failure results
      const testJob = {
        name: 'test-uptime-job',
        schedule: '* * * * *',
        enabled: true,
        priority: 'medium' as const,
        timeout: 5000,
        retryAttempts: 0,
        retryDelay: 100,
        handler: jest.fn()
          .mockResolvedValueOnce(undefined) // Success
          .mockRejectedValueOnce(new Error('Failure')) // Failure
          .mockResolvedValueOnce(undefined) // Success
      };
      
      // Execute 3 times
      await scheduler.triggerJob(testJob.name);
      try { await scheduler.triggerJob(testJob.name); } catch {}
      await scheduler.triggerJob(testJob.name);
      
      const metrics = scheduler.getJobMetrics(testJob.name);
      expect(metrics?.uptime).toBeCloseTo(66.67, 1); // 2/3 success rate
    });

    test('should save metrics to database periodically', async () => {
      await scheduler.start();
      
      // Execute some jobs
      await scheduler.triggerJob('status-sync');
      
      // Manually trigger metrics save
      await scheduler['saveMetrics']();
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO job_metrics'),
        expect.arrayContaining([
          'status-sync',
          expect.any(Number), // total_executions
          expect.any(Number), // successful_executions
          expect.any(Number), // failed_executions
          expect.any(Number), // average_execution_time
          expect.any(Number), // uptime
          expect.any(Number), // consecutive_failures
          expect.any(Date)    // last_execution_time
        ])
      );
    });
  });

  describe('Resource Management', () => {
    test('should enforce concurrent job limits', async () => {
      const limitedScheduler = CronScheduler.getInstance({
        maxConcurrentJobs: 2
      });
      
      await limitedScheduler.start();
      
      // Try to run 5 jobs simultaneously
      const promises = Array(5).fill(null).map(() => 
        limitedScheduler.triggerJob('status-sync')
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      // Should have limited concurrent execution
      expect(failed.length).toBeGreaterThan(0);
    });

    test('should monitor system resources during execution', async () => {
      await scheduler.start();
      
      const initialHealth = await scheduler.getSystemHealth();
      
      // Execute resource-intensive job
      await scheduler.triggerJob('usage-aggregation');
      
      const postHealth = await scheduler.getSystemHealth();
      
      expect(postHealth.lastHealthCheck.getTime()).toBeGreaterThan(
        initialHealth.lastHealthCheck.getTime()
      );
    });

    test('should reduce concurrent jobs under high load', async () => {
      // Mock high system load
      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 850000,
        system: 150000
      });
      
      await scheduler.start();
      
      const criticalHealth = {
        status: 'critical' as const,
        activeJobs: 5,
        failedJobs: 0,
        systemLoad: 85,
        memoryUsage: 70,
        lastHealthCheck: new Date(),
        issues: ['High system load']
      };
      
      await scheduler['attemptAutoRecovery'](criticalHealth);
      
      const status = scheduler.getStatus();
      expect(status.config.maxConcurrentJobs).toBeLessThan(5);
    });
  });

  describe('Event-Driven Architecture', () => {
    test('should emit events for job lifecycle', async () => {
      await scheduler.start();
      
      const successHandler = jest.fn();
      const failureHandler = jest.fn();
      
      scheduler.on('job:success', successHandler);
      scheduler.on('job:failed', failureHandler);
      
      await scheduler.triggerJob('status-sync');
      
      expect(successHandler).toHaveBeenCalledWith({
        jobName: 'status-sync',
        duration: expect.any(Number),
        executionId: expect.any(String)
      });
    });

    test('should emit health check events', async () => {
      await scheduler.start();
      
      const healthHandler = jest.fn();
      scheduler.on('health:check', healthHandler);
      
      // Wait for health check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(healthHandler).toHaveBeenCalledWith({
        status: expect.any(String),
        activeJobs: expect.any(Number),
        failedJobs: expect.any(Number),
        systemLoad: expect.any(Number),
        memoryUsage: expect.any(Number),
        lastHealthCheck: expect.any(Date),
        issues: expect.any(Array)
      });
    });

    test('should emit recovery events', async () => {
      await scheduler.start();
      
      const recoveryHandler = jest.fn();
      scheduler.on('recovery:success', recoveryHandler);
      
      // Trigger recovery
      await scheduler['attemptAutoRecovery']({
        status: 'degraded',
        activeJobs: 2,
        failedJobs: 1,
        systemLoad: 60,
        memoryUsage: 70,
        lastHealthCheck: new Date(),
        issues: []
      });
      
      expect(recoveryHandler).toHaveBeenCalled();
    });
  });

  describe('Manual Job Control', () => {
    test('should allow manual job triggering', async () => {
      await scheduler.start();
      
      const result = await scheduler.triggerJob('status-sync');
      expect(result).toBeUndefined(); // Successful execution
    });

    test('should allow pausing and resuming jobs', async () => {
      await scheduler.start();
      
      const pauseResult = scheduler.pauseJob('status-sync');
      expect(pauseResult).toBe(true);
      
      const resumeResult = scheduler.resumeJob('status-sync');
      expect(resumeResult).toBe(true);
    });

    test('should handle invalid job names', async () => {
      await scheduler.start();
      
      await expect(scheduler.triggerJob('non-existent-job')).rejects.toThrow('Job non-existent-job not found');
      
      expect(scheduler.pauseJob('non-existent-job')).toBe(false);
      expect(scheduler.resumeJob('non-existent-job')).toBe(false);
    });
  });

  describe('Graceful Shutdown', () => {
    test('should stop all jobs gracefully', async () => {
      await scheduler.start();
      
      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(true);
      
      await scheduler.stop();
      
      const stoppedStatus = scheduler.getStatus();
      expect(stoppedStatus.isRunning).toBe(false);
    });

    test('should save final metrics on shutdown', async () => {
      await scheduler.start();
      
      // Execute some jobs
      await scheduler.triggerJob('status-sync');
      
      await scheduler.stop();
      
      // Should have saved metrics
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO job_metrics'),
        expect.any(Array)
      );
    });

    test('should handle shutdown errors gracefully', async () => {
      await scheduler.start();
      
      // Mock save error
      mockDb.query.mockRejectedValueOnce(new Error('Save failed'));
      
      // Should not throw
      await expect(scheduler.stop()).resolves.toBeUndefined();
    });
  });

  describe('Load Testing and Performance', () => {
    test('should handle high-frequency job execution', async () => {
      await scheduler.start();
      
      const startTime = Date.now();
      const promises = [];
      
      // Execute 100 jobs rapidly
      for (let i = 0; i < 100; i++) {
        promises.push(scheduler.triggerJob('real-time-monitoring'));
      }
      
      await Promise.allSettled(promises);
      const executionTime = Date.now() - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(10000); // 10 seconds
    });

    test('should maintain performance under sustained load', async () => {
      await scheduler.start();
      
      const iterations = 50;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await scheduler.triggerJob('status-sync');
        times.push(Date.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Performance should remain consistent
      expect(maxTime).toBeLessThan(avgTime * 3); // Max time shouldn't be more than 3x average
    });

    test('should handle memory efficiently with many executions', async () => {
      await scheduler.start();
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Execute many jobs
      for (let i = 0; i < 200; i++) {
        await scheduler.triggerJob('status-sync');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Integration with External Systems', () => {
    test('should integrate with database service', async () => {
      await scheduler.start();
      
      // Database should be called for initialization
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
    });

    test('should integrate with notification service', async () => {
      await scheduler.start();
      
      // Simulate critical condition
      const criticalHealth = {
        status: 'critical' as const,
        activeJobs: 0,
        failedJobs: 10,
        systemLoad: 95,
        memoryUsage: 95,
        lastHealthCheck: new Date(),
        issues: ['System overload']
      };
      
      await scheduler['handleCriticalHealth'](criticalHealth);
      
      expect(mockNotifications.createSystemNotification).toHaveBeenCalled();
    });

    test('should handle external service failures', async () => {
      // Mock database failure
      mockDb.query.mockRejectedValue(new Error('Database unavailable'));
      
      // Should handle gracefully during startup
      await expect(scheduler.start()).rejects.toThrow('Database unavailable');
    });
  });
});

export default {};
