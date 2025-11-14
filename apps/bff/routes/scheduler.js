/**
 * AI Scheduler Routes - Full CRUD Operations
 * Handles job scheduling, triggers, and execution management
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const schedulerService = require('../src/services/scheduler.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/scheduler/jobs - Get all scheduler jobs
router.get('/jobs', async (req, res) => {
  try {
    const { status, type, assignedTo, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (assignedTo) where.assignedTo = parseInt(assignedTo, 10);

    const jobs = await prisma.schedulerJob.findMany({
      where,
      include: {
        triggers: true,
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10)
    });

    const total = await prisma.schedulerJob.count({ where });

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
    handleError(res, error, 'Error fetching scheduler jobs');
  }
});

// GET /api/scheduler/jobs/:id - Get a specific scheduler job
router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.schedulerJob.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        triggers: true,
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    handleError(res, error, 'Error fetching scheduler job');
  }
});

// POST /api/scheduler/jobs - Create a new scheduler job
router.post('/jobs', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      cronExpression,
      payload,
      assignedTo,
      priority = 'medium',
      isActive = true
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        error: 'Name and type are required'
      });
    }

    const job = await prisma.schedulerJob.create({
      data: {
        name,
        description,
        type,
        cronExpression,
        payload: payload ? JSON.stringify(payload) : null,
        assignedTo: assignedTo ? parseInt(assignedTo, 10) : null,
        priority,
        isActive,
        status: 'pending'
      },
      include: {
        triggers: true,
        runs: true
      }
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    handleError(res, error, 'Error creating scheduler job');
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
      cronExpression,
      payload,
      assignedTo,
      priority,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (cronExpression !== undefined) updateData.cronExpression = cronExpression;
    if (payload !== undefined) updateData.payload = JSON.stringify(payload);
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? parseInt(assignedTo, 10) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    const job = await prisma.schedulerJob.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        triggers: true,
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.json({ success: true, data: job });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }
    handleError(res, error, 'Error updating scheduler job');
  }
});

// DELETE /api/scheduler/jobs/:id - Delete a scheduler job
router.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First delete related triggers and runs
    await prisma.schedulerTrigger.deleteMany({
      where: { jobId: parseInt(id, 10) }
    });

    await prisma.schedulerRun.deleteMany({
      where: { jobId: parseInt(id, 10) }
    });

    // Then delete the job
    await prisma.schedulerJob.delete({
      where: { id: parseInt(id, 10) }
    });

    res.json({ success: true, message: 'Scheduler job deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }
    handleError(res, error, 'Error deleting scheduler job');
  }
});

// POST /api/scheduler/jobs/:id/execute - Execute a scheduler job immediately
router.post('/jobs/:id/execute', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.schedulerJob.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!job) {
      return res.status(404).json({ error: 'Scheduler job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ error: 'Cannot execute inactive job' });
    }

    // Create a run record
    const run = await prisma.schedulerRun.create({
      data: {
        jobId: parseInt(id, 10),
        status: 'running',
        startedAt: new Date(),
        payload: job.payload
      }
    });

    // Update job status
    await prisma.schedulerJob.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'running',
        lastRunAt: new Date()
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
    handleError(res, error, 'Error executing scheduler job');
  }
});

// GET /api/scheduler/runs - Get all scheduler runs
router.get('/runs', async (req, res) => {
  try {
    const { jobId, status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (jobId) where.jobId = parseInt(jobId, 10);
    if (status) where.status = status;

    const runs = await prisma.schedulerRun.findMany({
      where,
      include: {
        job: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10)
    });

    const total = await prisma.schedulerRun.count({ where });

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
    handleError(res, error, 'Error fetching scheduler runs');
  }
});

// GET /api/scheduler/runs/:id - Get a specific scheduler run
router.get('/runs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const run = await prisma.schedulerRun.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        job: true
      }
    });

    if (!run) {
      return res.status(404).json({ error: 'Scheduler run not found' });
    }

    res.json({ success: true, data: run });
  } catch (error) {
    handleError(res, error, 'Error fetching scheduler run');
  }
});

// PUT /api/scheduler/runs/:id - Update a scheduler run (e.g., mark as completed/failed)
router.put('/runs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { status, output, error: runError } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (output !== undefined) updateData.output = output;
    if (runError !== undefined) updateData.error = runError;

    if (status === 'completed' || status === 'failed') {
      updateData.finishedAt = new Date();
    }

    const run = await prisma.schedulerRun.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        job: true
      }
    });

    // Update job status if run is completed/failed
    if (status === 'completed' || status === 'failed') {
      await prisma.schedulerJob.update({
        where: { id: run.jobId },
        data: { status: 'pending' }
      });
    }

    res.json({ success: true, data: run });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Scheduler run not found' });
    }
    handleError(res, error, 'Error updating scheduler run');
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

    const trigger = await prisma.schedulerTrigger.create({
      data: {
        jobId: parseInt(jobId, 10),
        type,
        configuration: configuration ? JSON.stringify(configuration) : null,
        isActive
      },
      include: {
        job: true
      }
    });

    res.status(201).json({ success: true, data: trigger });
  } catch (error) {
    handleError(res, error, 'Error creating scheduler trigger');
  }
});

// GET /api/scheduler/stats - Get scheduler statistics
router.get('/stats', async (req, res) => {
  try {
    const totalJobs = await prisma.schedulerJob.count();
    const activeJobs = await prisma.schedulerJob.count({ where: { isActive: true } });
    const runningJobs = await prisma.schedulerJob.count({ where: { status: 'running' } });

    const totalRuns = await prisma.schedulerRun.count();
    const successfulRuns = await prisma.schedulerRun.count({ where: { status: 'completed' } });
    const failedRuns = await prisma.schedulerRun.count({ where: { status: 'failed' } });

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
    handleError(res, error, 'Error fetching scheduler statistics');
  }
});

module.exports = router;
