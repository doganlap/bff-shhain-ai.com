/**
 * Cron Scheduler Engine
 * Advanced job scheduling with monitoring, health checks, and automatic recovery
 */

import { CronJob } from 'cron';
import { EventEmitter } from 'events';
import { JobExecutor, licenseJobsConfig, JobConfig } from './licenseJobsConfig';
import { DatabaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';

export interface SchedulerConfig {
  maxConcurrentJobs: number;
  healthCheckInterval: number; // milliseconds
  failureThreshold: number;
  recoveryDelay: number; // milliseconds
  enableMetrics: boolean;
  enableAutoRecovery: boolean;
}

export interface JobMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: Date | null;
  lastExecutionStatus: 'success' | 'failed' | 'timeout' | null;
  consecutiveFailures: number;
  uptime: number; // percentage
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  activeJobs: number;
  failedJobs: number;
  systemLoad: number;
  memoryUsage: number;
  lastHealthCheck: Date;
  issues: string[];
}

/**
 * Advanced Cron Scheduler with Enterprise Features
 */
export class CronScheduler extends EventEmitter {
  private static instance: CronScheduler;
  private config: SchedulerConfig;
  private jobExecutor: JobExecutor;
  private db: DatabaseService;
  private notifications: NotificationService;
  private jobs: Map<string, CronJob> = new Map();
  private jobMetrics: Map<string, JobMetrics> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private startTime: Date = new Date();

  constructor(config: Partial<SchedulerConfig> = {}) {
    super();
    
    this.config = {
      maxConcurrentJobs: 10,
      healthCheckInterval: 60000, // 1 minute
      failureThreshold: 3,
      recoveryDelay: 300000, // 5 minutes
      enableMetrics: true,
      enableAutoRecovery: true,
      ...config
    };
    
    this.jobExecutor = JobExecutor.getInstance();
    this.db = new DatabaseService();
    this.notifications = new NotificationService();
    
    this.setupEventHandlers();
  }

  static getInstance(config?: Partial<SchedulerConfig>): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler(config);
    }
    return CronScheduler.instance;
  }

  /**
   * Initialize and start the scheduler
   */
  async start(): Promise<void> {
    try {
      console.log('🚀 Starting Cron Scheduler Engine...');
      
      // Initialize database tables if needed
      await this.initializeDatabase();
      
      // Load job configurations
      await this.loadJobConfigurations();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Initialize job metrics
      this.initializeMetrics();
      
      // Start all enabled jobs
      await this.startAllJobs();
      
      this.isRunning = true;
      this.startTime = new Date();
      
      console.log('✅ Cron Scheduler Engine started successfully');
      this.emit('scheduler:started');
      
    } catch (error) {
      console.error('❌ Failed to start Cron Scheduler:', error);
      this.emit('scheduler:error', error);
      throw error;
    }
  }

  /**
   * Stop the scheduler gracefully
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping Cron Scheduler Engine...');
      
      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = null;
      }
      
      // Stop all jobs
      this.stopAllJobs();
      
      // Save final metrics
      await this.saveMetrics();
      
      this.isRunning = false;
      
      console.log('✅ Cron Scheduler Engine stopped');
      this.emit('scheduler:stopped');
      
    } catch (error) {
      console.error('❌ Error stopping scheduler:', error);
      this.emit('scheduler:error', error);
    }
  }

  /**
   * Initialize database tables for scheduler
   */
  private async initializeDatabase(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS job_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_name VARCHAR(255) NOT NULL,
        execution_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        duration INTEGER,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS scheduler_health (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status VARCHAR(50) NOT NULL,
        active_jobs INTEGER,
        failed_jobs INTEGER,
        system_load DECIMAL(5,2),
        memory_usage DECIMAL(5,2),
        issues JSONB DEFAULT '[]',
        checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_executions_job_name 
      ON job_executions(job_name, started_at DESC)
    `);
  }

  /**
   * Load job configurations and create cron jobs
   */
  private async loadJobConfigurations(): Promise<void> {
    for (const jobConfig of licenseJobsConfig) {
      if (jobConfig.enabled) {
        await this.createJob(jobConfig);
      }
    }
  }

  /**
   * Create a cron job from configuration
   */
  private async createJob(config: JobConfig): Promise<void> {
    const cronJob = new CronJob(
      config.schedule,
      () => this.executeJobWithMonitoring(config),
      null,
      false, // Don't start automatically
      'UTC'
    );
    
    this.jobs.set(config.name, cronJob);
    
    // Initialize metrics for this job
    this.jobMetrics.set(config.name, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: null,
      lastExecutionStatus: null,
      consecutiveFailures: 0,
      uptime: 100
    });
    
    console.log(`📅 Job "${config.name}" configured: ${config.schedule}`);
  }

  /**
   * Execute job with comprehensive monitoring
   */
  private async executeJobWithMonitoring(config: JobConfig): Promise<void> {
    const startTime = Date.now();
    const executionId = `${config.name}_${startTime}`;
    const metrics = this.jobMetrics.get(config.name)!;
    
    try {
      // Check if we're within concurrent job limits
      const activeJobs = await this.getActiveJobCount();
      if (activeJobs >= this.config.maxConcurrentJobs) {
        throw new Error(`Maximum concurrent jobs limit reached (${this.config.maxConcurrentJobs})`);
      }
      
      console.log(`🔄 Executing job: ${config.name} (${executionId})`);
      
      // Log execution start
      await this.db.logJobExecution({
        jobName: config.name,
        executionId,
        status: 'running',
        startedAt: new Date()
      });
      
      // Execute the job with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Job execution timeout')), config.timeout);
      });
      
      await Promise.race([config.handler(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      
      // Update metrics
      metrics.totalExecutions++;
      metrics.successfulExecutions++;
      metrics.lastExecutionTime = new Date();
      metrics.lastExecutionStatus = 'success';
      metrics.consecutiveFailures = 0;
      metrics.averageExecutionTime = this.calculateAverageExecutionTime(config.name, duration);
      metrics.uptime = (metrics.successfulExecutions / metrics.totalExecutions) * 100;
      
      // Log success
      await this.db.logJobExecution({
        jobName: config.name,
        executionId,
        status: 'completed',
        duration,
        completedAt: new Date()
      });
      
      console.log(`✅ Job completed: ${config.name} (${duration}ms)`);
      this.emit('job:success', { jobName: config.name, duration, executionId });
      
      // Execute success callback
      if (config.onSuccess) {
        config.onSuccess({ duration, executionId });
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update metrics
      metrics.totalExecutions++;
      metrics.failedExecutions++;
      metrics.lastExecutionTime = new Date();
      metrics.lastExecutionStatus = 'failed';
      metrics.consecutiveFailures++;
      metrics.uptime = (metrics.successfulExecutions / metrics.totalExecutions) * 100;
      
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
      
      this.emit('job:failed', { jobName: config.name, error, executionId });
      
      // Execute error callback
      if (config.onError) {
        config.onError(error as Error);
      }
      
      // Check if we need to trigger recovery
      await this.checkJobRecovery(config.name, metrics);
      
      // Retry logic
      if (metrics.consecutiveFailures <= config.retryAttempts) {
        console.log(`🔄 Scheduling retry for ${config.name} (attempt ${metrics.consecutiveFailures})`);
        setTimeout(() => {
          this.executeJobWithMonitoring(config);
        }, config.retryDelay);
      }
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        await this.saveHealthStatus(health);
        
        if (health.status === 'critical') {
          await this.handleCriticalHealth(health);
        }
        
        this.emit('health:check', health);
        
      } catch (error) {
        console.error('❌ Health check failed:', error);
        this.emit('health:error', error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<SystemHealth> {
    const activeJobs = await this.getActiveJobCount();
    const failedJobs = await this.getFailedJobCount();
    const systemLoad = await this.getSystemLoad();
    const memoryUsage = await this.getMemoryUsage();
    const issues: string[] = [];
    
    // Determine health status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (failedJobs > 0) {
      issues.push(`${failedJobs} jobs have failed`);
      status = 'degraded';
    }
    
    if (systemLoad > 80) {
      issues.push(`High system load: ${systemLoad}%`);
      status = 'degraded';
    }
    
    if (memoryUsage > 90) {
      issues.push(`High memory usage: ${memoryUsage}%`);
      status = 'critical';
    }
    
    if (activeJobs === 0 && this.isRunning) {
      issues.push('No active jobs running');
      status = 'critical';
    }
    
    return {
      status,
      activeJobs,
      failedJobs,
      systemLoad,
      memoryUsage,
      lastHealthCheck: new Date(),
      issues
    };
  }

  /**
   * Handle critical health situations
   */
  private async handleCriticalHealth(health: SystemHealth): Promise<void> {
    console.error('🚨 Critical health status detected:', health);
    
    // Send critical alert
    await this.notifications.createSystemNotification({
      type: 'system_critical',
      title: 'Scheduler Critical Health Alert',
      message: `Scheduler health is critical: ${health.issues.join(', ')}`,
      priority: 'critical',
      category: 'system_health'
    });
    
    // Attempt automatic recovery if enabled
    if (this.config.enableAutoRecovery) {
      await this.attemptAutoRecovery(health);
    }
    
    this.emit('health:critical', health);
  }

  /**
   * Attempt automatic recovery
   */
  private async attemptAutoRecovery(health: SystemHealth): Promise<void> {
    console.log('🔧 Attempting automatic recovery...');
    
    try {
      // Restart failed jobs
      if (health.failedJobs > 0) {
        await this.restartFailedJobs();
      }
      
      // Clear memory if usage is high
      if (health.memoryUsage > 90) {
        if (global.gc) {
          global.gc();
          console.log('🧹 Garbage collection triggered');
        }
      }
      
      // Reduce concurrent jobs if system load is high
      if (health.systemLoad > 80) {
        this.config.maxConcurrentJobs = Math.max(1, Math.floor(this.config.maxConcurrentJobs * 0.7));
        console.log(`📉 Reduced max concurrent jobs to ${this.config.maxConcurrentJobs}`);
      }
      
      console.log('✅ Auto-recovery completed');
      this.emit('recovery:success');
      
    } catch (error) {
      console.error('❌ Auto-recovery failed:', error);
      this.emit('recovery:failed', error);
    }
  }

  /**
   * Check if job needs recovery
   */
  private async checkJobRecovery(jobName: string, metrics: JobMetrics): Promise<void> {
    if (metrics.consecutiveFailures >= this.config.failureThreshold) {
      console.log(`🚨 Job ${jobName} has failed ${metrics.consecutiveFailures} times consecutively`);
      
      // Create alert
      await this.notifications.createSystemNotification({
        type: 'job_failure',
        title: `Job Failure Alert: ${jobName}`,
        message: `Job has failed ${metrics.consecutiveFailures} times consecutively`,
        priority: 'high',
        category: 'job_monitoring'
      });
      
      this.emit('job:recovery_needed', { jobName, metrics });
    }
  }

  /**
   * Restart failed jobs
   */
  private async restartFailedJobs(): Promise<void> {
    for (const [jobName, metrics] of this.jobMetrics.entries()) {
      if (metrics.consecutiveFailures > 0) {
        const job = this.jobs.get(jobName);
        if (job && !job.running) {
          console.log(`🔄 Restarting failed job: ${jobName}`);
          job.start();
          metrics.consecutiveFailures = 0;
        }
      }
    }
  }

  /**
   * Start all configured jobs
   */
  private async startAllJobs(): Promise<void> {
    let startedCount = 0;
    
    for (const [jobName, job] of this.jobs.entries()) {
      try {
        job.start();
        startedCount++;
        console.log(`✅ Started job: ${jobName}`);
      } catch (error) {
        console.error(`❌ Failed to start job ${jobName}:`, error);
      }
    }
    
    console.log(`🎉 Started ${startedCount}/${this.jobs.size} jobs`);
  }

  /**
   * Stop all jobs
   */
  private stopAllJobs(): void {
    for (const [jobName, job] of this.jobs.entries()) {
      try {
        job.stop();
        console.log(`⏹️ Stopped job: ${jobName}`);
      } catch (error) {
        console.error(`❌ Error stopping job ${jobName}:`, error);
      }
    }
  }

  /**
   * Initialize metrics collection
   */
  private initializeMetrics(): void {
    if (this.config.enableMetrics) {
      // Load historical metrics from database
      this.loadHistoricalMetrics();
      
      // Set up periodic metrics saving
      setInterval(() => {
        this.saveMetrics();
      }, 300000); // Save every 5 minutes
    }
  }

  /**
   * Load historical metrics from database
   */
  private async loadHistoricalMetrics(): Promise<void> {
    try {
      const results = await this.db.query(`
        SELECT 
          job_name,
          COUNT(*) as total_executions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_executions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
          AVG(duration) as avg_duration,
          MAX(started_at) as last_execution
        FROM job_executions
        WHERE started_at >= NOW() - INTERVAL '30 days'
        GROUP BY job_name
      `);
      
      for (const row of results.rows) {
        const metrics = this.jobMetrics.get(row.job_name);
        if (metrics) {
          metrics.totalExecutions = parseInt(row.total_executions);
          metrics.successfulExecutions = parseInt(row.successful_executions);
          metrics.failedExecutions = parseInt(row.failed_executions);
          metrics.averageExecutionTime = parseFloat(row.avg_duration) || 0;
          metrics.lastExecutionTime = row.last_execution;
          metrics.uptime = (metrics.successfulExecutions / metrics.totalExecutions) * 100;
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to load historical metrics:', error);
    }
  }

  /**
   * Save current metrics to database
   */
  private async saveMetrics(): Promise<void> {
    if (!this.config.enableMetrics) return;
    
    try {
      for (const [jobName, metrics] of this.jobMetrics.entries()) {
        await this.db.query(`
          INSERT INTO job_metrics (
            job_name, total_executions, successful_executions,
            failed_executions, average_execution_time, uptime,
            consecutive_failures, last_execution_time, recorded_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          jobName, metrics.totalExecutions, metrics.successfulExecutions,
          metrics.failedExecutions, metrics.averageExecutionTime, metrics.uptime,
          metrics.consecutiveFailures, metrics.lastExecutionTime
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to save metrics:', error);
    }
  }

  /**
   * Save health status to database
   */
  private async saveHealthStatus(health: SystemHealth): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO scheduler_health (
          status, active_jobs, failed_jobs, system_load,
          memory_usage, issues, checked_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        health.status, health.activeJobs, health.failedJobs,
        health.systemLoad, health.memoryUsage,
        JSON.stringify(health.issues), health.lastHealthCheck
      ]);
    } catch (error) {
      console.error('❌ Failed to save health status:', error);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('job:failed', async ({ jobName, error }) => {
      console.error(`🚨 Job ${jobName} failed:`, error.message);
    });
    
    this.on('health:critical', async (health) => {
      console.error('🚨 System health is critical:', health);
    });
    
    this.on('recovery:success', () => {
      console.log('✅ Auto-recovery successful');
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async getActiveJobCount(): Promise<number> {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.running) count++;
    }
    return count;
  }

  private async getFailedJobCount(): Promise<number> {
    let count = 0;
    for (const metrics of this.jobMetrics.values()) {
      if (metrics.consecutiveFailures > 0) count++;
    }
    return count;
  }

  private async getSystemLoad(): Promise<number> {
    // Simplified system load calculation
    const usage = process.cpuUsage();
    return Math.min(100, (usage.user + usage.system) / 10000);
  }

  private async getMemoryUsage(): Promise<number> {
    const usage = process.memoryUsage();
    return (usage.heapUsed / usage.heapTotal) * 100;
  }

  private calculateAverageExecutionTime(jobName: string, newDuration: number): number {
    const metrics = this.jobMetrics.get(jobName)!;
    const totalTime = metrics.averageExecutionTime * (metrics.totalExecutions - 1) + newDuration;
    return totalTime / metrics.totalExecutions;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get scheduler status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      uptime: Date.now() - this.startTime.getTime(),
      totalJobs: this.jobs.size,
      activeJobs: Array.from(this.jobs.values()).filter(job => job.running).length,
      config: this.config
    };
  }

  /**
   * Get job metrics
   */
  getJobMetrics(jobName?: string): JobMetrics | Map<string, JobMetrics> {
    if (jobName) {
      return this.jobMetrics.get(jobName) || null;
    }
    return this.jobMetrics;
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return await this.performHealthCheck();
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName: string): Promise<void> {
    const jobConfig = licenseJobsConfig.find(config => config.name === jobName);
    if (!jobConfig) {
      throw new Error(`Job ${jobName} not found`);
    }
    
    console.log(`🔄 Manually triggering job: ${jobName}`);
    await this.executeJobWithMonitoring(jobConfig);
  }

  /**
   * Pause a specific job
   */
  pauseJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`⏸️ Paused job: ${jobName}`);
      return true;
    }
    return false;
  }

  /**
   * Resume a specific job
   */
  resumeJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`▶️ Resumed job: ${jobName}`);
      return true;
    }
    return false;
  }
}

export default CronScheduler;
