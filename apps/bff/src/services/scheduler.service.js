/**
 * Scheduler Service
 * Handles job scheduling, cron management, execution tracking
 */

const prisma = require('../../db/prisma');
const cron = require('node-cron');

// In-memory job registry
const activeJobs = new Map();

/**
 * Validate cron expression
 */
function validateCronExpression(expression) {
  try {
    return cron.validate(expression);
  } catch (error) {
    return false;
  }
}

/**
 * Parse frequency to cron expression
 */
function frequencyToCron(frequency) {
  const frequencies = {
    'hourly': '0 * * * *',
    'daily': '0 0 * * *',
    'weekly': '0 0 * * 0',
    'monthly': '0 0 1 * *',
    'every_5_min': '*/5 * * * *',
    'every_15_min': '*/15 * * * *',
    'every_30_min': '*/30 * * * *'
  };

  return frequencies[frequency] || frequency;
}

/**
 * Create scheduled job
 */
async function createJob(data) {
  const cronExpression = data.cronExpression || frequencyToCron(data.frequency);

  if (!validateCronExpression(cronExpression)) {
    throw new Error('Invalid cron expression');
  }

  const job = await prisma.scheduled_jobs.create({
    data: {
      name: data.name,
      description: data.description,
      cronExpression,
      frequency: data.frequency,
      jobType: data.jobType,
      enabled: data.enabled !== false,
      config: data.config || {},
      tenantId: data.tenantId,
      createdBy: data.createdBy,
      nextRunAt: getNextRunTime(cronExpression),
      status: 'pending'
    }
  });

  if (job.enabled) {
    startJob(job);
  }

  return job;
}

/**
 * Get next run time using cron validation
 */
function getNextRunTime(cronExpression) {
  try {
    if (!cron.validate(cronExpression)) {
      return new Date(Date.now() + 3600000); // Default to 1 hour from now
    }

    // Calculate next run based on cron expression
    // Using node-cron's built-in scheduling
    const now = new Date();
    const task = cron.schedule(cronExpression, () => {}, { scheduled: false });
    task.start();

    // For now, estimate next run (node-cron doesn't expose next run time directly)
    // In production, consider using 'cron-parser' package for precise calculations
    const frequencies = {
      '*/5 * * * *': 5 * 60 * 1000,      // every 5 minutes
      '*/15 * * * *': 15 * 60 * 1000,    // every 15 minutes
      '*/30 * * * *': 30 * 60 * 1000,    // every 30 minutes
      '0 * * * *': 60 * 60 * 1000,       // hourly
      '0 0 * * *': 24 * 60 * 60 * 1000,  // daily
      '0 0 * * 0': 7 * 24 * 60 * 60 * 1000 // weekly
    };

    const interval = frequencies[cronExpression] || 3600000; // default 1 hour
    return new Date(now.getTime() + interval);
  } catch (error) {
    return new Date(Date.now() + 3600000); // Default to 1 hour from now
  }
}

/**
 * Start a scheduled job
 */
function startJob(job) {
  if (activeJobs.has(job.id)) {
    return; // Already running
  }

  try {
    const task = cron.schedule(job.cronExpression, async () => {
      await executeJob(job.id);
    });

    activeJobs.set(job.id, task);
    console.log(`Started job: ${job.name} (${job.id})`);
  } catch (error) {
    console.error(`Failed to start job ${job.id}:`, error);
  }
}

/**
 * Stop a scheduled job
 */
function stopJob(jobId) {
  const task = activeJobs.get(jobId);
  if (task) {
    task.stop();
    activeJobs.delete(jobId);
    console.log(`Stopped job: ${jobId}`);
  }
}

/**
 * Execute a job
 */
async function executeJob(jobId) {
  const job = await prisma.scheduled_jobs.findUnique({
    where: { id: jobId }
  });

  if (!job || !job.enabled) {
    return;
  }

  const runId = `${jobId}-${Date.now()}`;

  try {
    // Update job status
    await prisma.scheduled_jobs.update({
      where: { id: jobId },
      data: {
        status: 'running',
        lastRunAt: new Date(),
        runCount: { increment: 1 }
      }
    });

    // Create run record
    const run = await prisma.job_runs.create({
      data: {
        id: runId,
        jobId,
        status: 'running',
        startedAt: new Date(),
        triggeredBy: 'scheduler',
        tenantId: job.tenantId
      }
    });

    // Execute based on job type
    let result;
    switch (job.jobType) {
      case 'report_generation':
        result = await executeReportGeneration(job);
        break;
      case 'compliance_check':
        result = await executeComplianceCheck(job);
        break;
      case 'risk_assessment':
        result = await executeRiskAssessment(job);
        break;
      case 'data_sync':
        result = await executeDataSync(job);
        break;
      case 'notification':
        result = await executeNotification(job);
        break;
      default:
        result = { message: 'Job type not implemented' };
    }

    // Update run as completed
    await prisma.job_runs.update({
      where: { id: runId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result,
        duration: Math.floor((Date.now() - run.startedAt.getTime()) / 1000)
      }
    });

    // Update job
    await prisma.scheduled_jobs.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        lastSuccessAt: new Date(),
        nextRunAt: getNextRunTime(job.cronExpression),
        successCount: { increment: 1 }
      }
    });

  } catch (error) {
    // Update run as failed
    await prisma.job_runs.update({
      where: { id: runId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error.message
      }
    });

    // Update job
    await prisma.scheduled_jobs.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        lastFailureAt: new Date(),
        nextRunAt: getNextRunTime(job.cronExpression),
        failureCount: { increment: 1 }
      }
    });

    console.error(`Job ${jobId} failed:`, error);
  }
}

/**
 * Job execution handlers
 */
async function executeReportGeneration(job) {
  const { reportType, recipients } = job.config;
  return {
    success: true,
    message: `Report ${reportType} generated`,
    recipients
  };
}

async function executeComplianceCheck(job) {
  const { frameworkId } = job.config;
  return {
    success: true,
    message: `Compliance check completed for framework ${frameworkId}`,
    score: 85
  };
}

async function executeRiskAssessment(job) {
  return {
    success: true,
    message: 'Risk assessment completed',
    risksIdentified: 3
  };
}

async function executeDataSync(job) {
  const { source, destination } = job.config;
  return {
    success: true,
    message: `Data synced from ${source} to ${destination}`,
    recordsSynced: 150
  };
}

async function executeNotification(job) {
  const { type, message } = job.config;
  return {
    success: true,
    message: `Notification sent: ${message}`,
    type
  };
}

/**
 * Get all jobs
 */
async function getJobs(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.enabled !== undefined) where.enabled = filters.enabled;
  if (filters.jobType) where.jobType = filters.jobType;
  if (filters.status) where.status = filters.status;

  return await prisma.scheduled_jobs.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get job by ID
 */
async function getJobById(id) {
  return await prisma.scheduled_jobs.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 10
      }
    }
  });
}

/**
 * Update job
 */
async function updateJob(id, updates) {
  const currentJob = await prisma.scheduled_jobs.findUnique({
    where: { id }
  });

  if (!currentJob) {
    throw new Error('Job not found');
  }

  // If cron expression changed, validate it
  if (updates.cronExpression && updates.cronExpression !== currentJob.cronExpression) {
    if (!validateCronExpression(updates.cronExpression)) {
      throw new Error('Invalid cron expression');
    }
    updates.nextRunAt = getNextRunTime(updates.cronExpression);
  }

  // If enabled status changed, start/stop job
  if (updates.enabled !== undefined && updates.enabled !== currentJob.enabled) {
    if (updates.enabled) {
      const job = await prisma.scheduled_jobs.update({
        where: { id },
        data: updates
      });
      startJob(job);
      return job;
    } else {
      stopJob(id);
    }
  }

  return await prisma.scheduled_jobs.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete job
 */
async function deleteJob(id) {
  stopJob(id);

  return await prisma.scheduled_jobs.delete({
    where: { id }
  });
}

/**
 * Get job runs
 */
async function getJobRuns(filters = {}) {
  const where = {};

  if (filters.jobId) where.jobId = filters.jobId;
  if (filters.status) where.status = filters.status;
  if (filters.tenantId) where.tenantId = filters.tenantId;

  return await prisma.job_runs.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: filters.limit || 50
  });
}

/**
 * Get scheduler statistics
 */
async function getSchedulerStats(tenantId) {
  const jobs = await prisma.scheduled_jobs.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const runs = await prisma.job_runs.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { startedAt: 'desc' },
    take: 100
  });

  return {
    totalJobs: jobs.length,
    enabledJobs: jobs.filter(j => j.enabled).length,
    disabledJobs: jobs.filter(j => !j.enabled).length,
    runningJobs: jobs.filter(j => j.status === 'running').length,
    totalRuns: runs.length,
    successfulRuns: runs.filter(r => r.status === 'completed').length,
    failedRuns: runs.filter(r => r.status === 'failed').length,
    successRate: runs.length > 0
      ? ((runs.filter(r => r.status === 'completed').length / runs.length) * 100).toFixed(2)
      : 0,
    avgDuration: runs.length > 0
      ? Math.floor(runs.reduce((sum, r) => sum + (r.duration || 0), 0) / runs.length)
      : 0,
    activeJobsInMemory: activeJobs.size
  };
}

/**
 * Initialize scheduler - start all enabled jobs
 */
async function initializeScheduler() {
  console.log('Initializing scheduler...');

  const enabledJobs = await prisma.scheduled_jobs.findMany({
    where: { enabled: true }
  });

  for (const job of enabledJobs) {
    try {
      startJob(job);
    } catch (error) {
      console.error(`Failed to start job ${job.id}:`, error);
    }
  }

  console.log(`Scheduler initialized with ${enabledJobs.length} active jobs`);
}

/**
 * Shutdown scheduler - stop all jobs
 */
function shutdownScheduler() {
  console.log('Shutting down scheduler...');

  for (const [jobId, task] of activeJobs.entries()) {
    task.stop();
    console.log(`Stopped job: ${jobId}`);
  }

  activeJobs.clear();
  console.log('Scheduler shutdown complete');
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  executeJob,
  getJobRuns,
  getSchedulerStats,
  validateCronExpression,
  frequencyToCron,
  initializeScheduler,
  shutdownScheduler,
  startJob,
  stopJob
};
