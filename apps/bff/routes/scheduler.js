/**
 * AI Scheduler Routes - Full CRUD Operations
 * Handles job scheduling, triggers, and execution management
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
// const schedulerService = require('../src/services/scheduler.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

async function fetchIgnoreList() {
  try {
    const rows = await prisma.$queryRaw`SELECT value, is_regex, regex_pattern, scope FROM scheduler_ignore_list`;
    return rows.map(r => ({ value: String(r.value || '').toUpperCase(), isRegex: Boolean(r.is_regex), pattern: r.regex_pattern || null, scope: r.scope || 'task' }));
  } catch (e) {
    return [];
  }
}

function shouldIgnoreJob(job, entries) {
  const name = String(job?.name || '').toUpperCase();
  const type = String(job?.type || '').toUpperCase();
  for (const e of entries) {
    if (e.isRegex && e.pattern) {
      try {
        const re = new RegExp(e.pattern);
        if (re.test(job?.name || '') || re.test(job?.type || '')) return true;
      } catch (e) { void e; }
    } else {
      if (e.value && (e.value === name || e.value === type)) return true;
    }
  }
  return false;
}

// GET /api/scheduler/jobs - Get all scheduler jobs
router.get('/jobs', async (req, res) => {
  const { status, type, assignedTo, limit = 50, offset = 0 } = req.query;
  
  try {
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (assignedTo) where.assignedTo = parseInt(assignedTo, 10);

    const jobsRaw = await prisma.scheduled_tasks.findMany({
      where,
      include: {
        automation_rules: true,
        task_executions: {
          orderBy: { created_at: 'desc' },
          take: 5
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10)
    });
    const entries = await fetchIgnoreList();
    const jobs = jobsRaw.filter(j => !shouldIgnoreJob(j, entries));
    const total = jobs.length;

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: total > (parseInt(offset, 10) + parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Database error fetching scheduler jobs:', error.message);
    // Return empty data when database is unavailable
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: false
      }
    });
  }
});

// GET /api/scheduler/jobs/:id - Get a specific scheduler job
router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.scheduled_tasks.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        automation_rules: true,
        task_executions: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Database error fetching scheduler job:', error.message);
    res.status(500).json({ error: 'Scheduler job not found' });
  }
});

// POST /api/scheduler/jobs - Create a new scheduler job
router.post('/jobs', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      schedule_expression,
      task_parameters,
      organization_id,
      created_by,
      priority = 5,
      is_active = true
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        error: 'Name and type are required'
      });
    }

    const entries = await fetchIgnoreList();
    if (shouldIgnoreJob({ name, type }, entries)) {
      return res.status(400).json({ success: false, error: 'Job ignored by policy' });
    }
    const job = await prisma.scheduled_tasks.create({
      data: {
        name,
        description,
        type,
        schedule_expression,
        task_parameters: task_parameters || {},
        organization_id: organization_id || 1,
        created_by: created_by || null,
        priority,
        is_active,
        status: 'active',
        timezone: 'UTC',
        next_execution: new Date(Date.now() + 3600000)
      },
      include: {
        automation_rules: true,
        task_executions: true
      }
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Database error creating scheduler job:', error.message);
    res.status(500).json({ error: 'Failed to create scheduler job' });
  }
});

// PUT /api/scheduler/jobs/:id - Update a scheduler job
router.put('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      description,
      type,
      schedule_expression,
      task_parameters,
      priority,
      is_active
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (schedule_expression !== undefined) updateData.schedule_expression = schedule_expression;
    if (task_parameters !== undefined) updateData.task_parameters = task_parameters;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;

    const job = await prisma.scheduled_tasks.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        automation_rules: true,
        task_executions: {
          orderBy: { created_at: 'desc' },
          take: 5
        }
      }
    });

    res.json({ success: true, data: job });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }
    console.error('Database error updating scheduler job:', error.message);
    res.status(500).json({ error: 'Failed to update scheduler job' });
  }
});

// DELETE /api/scheduler/jobs/:id - Delete a scheduler job
router.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First delete related dependencies, rules and executions
    await prisma.task_dependencies.deleteMany({
      where: { 
        OR: [
          { task_id: parseInt(id, 10) },
          { depends_on_task_id: parseInt(id, 10) }
        ]
      }
    });

    await prisma.automation_rules.deleteMany({
      where: { organization_id: parseInt(id, 10) }
    });

    await prisma.ai_suggestions.deleteMany({
      where: { task_id: parseInt(id, 10) }
    });

    await prisma.task_executions.deleteMany({
      where: { task_id: parseInt(id, 10) }
    });

    // Then delete the job
    await prisma.scheduled_tasks.delete({
      where: { id: parseInt(id, 10) }
    });

    res.json({ success: true, message: 'Scheduler job deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }
    console.error('Database error deleting scheduler job:', error.message);
    res.status(500).json({ error: 'Failed to delete scheduler job' });
  }
});

// POST /api/scheduler/jobs/:id/execute - Execute a scheduler job immediately
router.post('/jobs/:id/execute', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.scheduled_tasks.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!job) {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }

    if (!job.is_active) {
      return res.status(400).json({ error: 'Cannot execute inactive job' });
    }
    const entries = await fetchIgnoreList();
    if (shouldIgnoreJob(job, entries)) {
      return res.status(400).json({ success: false, error: 'Job execution blocked by policy' });
    }

    // Create a run record
    const run = await prisma.task_executions.create({
      data: {
        task_id: parseInt(id, 10),
        status: 'running',
        started_at: new Date(),
        input_data: job.task_parameters || {},
        execution_id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trigger_type: 'manual'
      }
    });

    // Update job status
    await prisma.scheduled_tasks.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'running',
        last_execution: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        jobId: parseInt(id, 10),
        runId: run.id,
        status: 'running',
        message: 'Job execution started'
      }
    });
  } catch (error) {
    console.error('Database error executing scheduler job:', error.message);
    res.status(500).json({ error: 'Failed to execute scheduler job' });
  }
});

// GET /api/scheduler/runs - Get all scheduler runs
router.get('/runs', async (req, res) => {
  try {
    const { jobId, status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (jobId) where.task_id = parseInt(jobId, 10);
    if (status) where.status = status;

    const runs = await prisma.task_executions.findMany({
      where,
      include: {
        scheduled_tasks: true
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10)
    });

    const total = await prisma.task_executions.count({ where });

    res.json({
      success: true,
      data: runs,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: total > (parseInt(offset, 10) + parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Database error fetching scheduler runs:', error.message);
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      }
    });
  }
});

// GET /api/scheduler/runs/:id - Get a specific scheduler run
router.get('/runs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const run = await prisma.task_executions.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        scheduled_tasks: true
      }
    });

    if (!run) {
      return res.status(404).json({ error: 'Scheduler run not found' });
    }

    res.json({ success: true, data: run });
  } catch (error) {
    console.error('Database error fetching scheduler run:', error.message);
    res.status(500).json({ error: 'Scheduler run not found' });
  }
});

// PUT /api/scheduler/runs/:id - Update a scheduler run (e.g., mark as completed/failed)
router.put('/runs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { status, output_data, error_details } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (output_data !== undefined) updateData.output_data = output_data;
    if (error_details !== undefined) updateData.error_details = error_details;

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date();
      // Calculate duration if started_at exists
      const existingRun = await prisma.task_executions.findUnique({
        where: { id: parseInt(id, 10) },
        select: { started_at: true, task_id: true }
      });
      
      if (existingRun && existingRun.started_at) {
        const duration = Math.floor((new Date() - new Date(existingRun.started_at)) / 1000);
        updateData.duration = duration;
      }
    }

    const run = await prisma.task_executions.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        scheduled_tasks: true
      }
    });

    // Update job status if run is completed/failed
    if (status === 'completed' || status === 'failed') {
      await prisma.scheduled_tasks.update({
        where: { id: run.task_id },
        data: { status: 'active' }
      });
    }

    res.json({ success: true, data: run });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler run not found' });
    }
    console.error('Database error updating scheduler run:', error.message);
    res.status(500).json({ error: 'Failed to update scheduler run' });
  }
});

// POST /api/scheduler/triggers - Create a new trigger
router.post('/triggers', async (req, res) => {
  try {
    const { jobId, type, configuration, isActive = true } = req.body;

    if (!jobId || !type) {
      return res.status(400).json({
        error: 'Job ID and type are required'
      });
    }

    const trigger = await prisma.automation_rules.create({
      data: {
        organization_id: parseInt(jobId, 10),
        rule_type: type,
        conditions: configuration || {},
        actions: { action: 'trigger_task', task_id: parseInt(jobId, 10) },
        is_active: isActive,
        name: `Auto-trigger for job ${jobId}`,
        description: `Automatically triggered rule for task ${jobId}`
      },
      include: {
        scheduled_tasks: true
      }
    });

    res.status(201).json({ success: true, data: trigger });
  } catch (error) {
    console.error('Database error creating scheduler trigger:', error.message);
    res.status(500).json({ error: 'Failed to create scheduler trigger' });
  }
});

// GET /api/scheduler/stats - Get scheduler statistics
router.get('/stats', async (req, res) => {
  try {
    const totalJobs = await prisma.scheduled_tasks.count();
    const activeJobs = await prisma.scheduled_tasks.count({ where: { is_active: true } });
    const runningJobs = await prisma.scheduled_tasks.count({ where: { status: 'running' } });

    const totalRuns = await prisma.task_executions.count();
    const successfulRuns = await prisma.task_executions.count({ where: { status: 'completed' } });
    const failedRuns = await prisma.task_executions.count({ where: { status: 'failed' } });

    const stats = {
      totalJobs,
      activeJobs,
      runningJobs,
      inactiveJobs: totalJobs - activeJobs,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Database error fetching scheduler statistics:', error.message);
    res.json({ 
      success: true, 
      data: {
        totalJobs: 0,
        activeJobs: 0,
        runningJobs: 0,
        inactiveJobs: 0,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0
      }
    });
  }
});

module.exports = router;
