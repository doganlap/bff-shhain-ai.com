/**
 * TASK MANAGEMENT ROUTES
 * REST API endpoints for GRC task operations
 */

const express = require('express');
const router = express.Router();
const taskService = require('../services/task.service');
const evidenceService = require('../services/evidence.service');

/**
 * GET /api/tasks
 * List tasks with filters and pagination (optimized)
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      tenant_id: req.query.tenant_id || 'default',
      task_type: req.query.task_type,
      status: req.query.status,
      priority: req.query.priority,
      assigned_to: req.query.assigned_to,
      control_id: req.query.control_id,
      framework: req.query.framework,
      domain: req.query.domain,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 50, 100), // Cap at 100 for performance
      sortBy: req.query.sortBy || 'due_date',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await taskService.getTasks(filters);

    // Set cache headers
    res.set('Cache-Control', 'private, max-age=5');

    res.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/stats
 * Get task statistics (optimized with caching)
 */
router.get('/stats', async (req, res) => {
  try {
    const tenant_id = req.query.tenant_id || 'default';

    // Set cache headers for faster subsequent requests
    res.set('Cache-Control', 'public, max-age=1');

    const stats = await taskService.getTaskStats(tenant_id);

    res.json({
      success: true,
      stats: {
        total: stats.total,
        by_status: stats.byStatus,
        by_priority: stats.byPriority,
        by_framework: stats.byFramework,
        completion_rate: parseFloat(stats.completionRate)
      }
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/my-tasks
 * Get tasks assigned to current user
 */
router.get('/my-tasks', async (req, res) => {
  try {
    const userId = req.query.user_id || req.headers['x-user-id'];
    const tenant_id = req.query.tenant_id || 'default';

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await taskService.getMyTasks(userId, tenant_id, filters);

    res.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/evidence-stats
 * Get evidence statistics
 */
router.get('/evidence-stats', async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || 'default';
    const stats = await evidenceService.getEvidenceStats(tenantId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching evidence stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/evidence/upload
 * Upload evidence file for a task
 */
router.post('/evidence/upload', evidenceService.getUploadMiddleware(), async (req, res) => {
  try {
    const { taskId } = req.body;
    const uploadedBy = req.body.uploadedBy || 'system';

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'taskId is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const evidence = await evidenceService.uploadEvidence(taskId, req.file, uploadedBy);

    res.json({
      success: true,
      data: { evidence },
      message: 'Evidence uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/evidence/upload-multiple
 * Upload multiple evidence files for a task
 */
router.post('/evidence/upload-multiple', evidenceService.getMultipleUploadMiddleware(), async (req, res) => {
  try {
    const { taskId } = req.body;
    const uploadedBy = req.body.uploadedBy || 'system';

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'taskId is required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const { results, errors } = await evidenceService.uploadMultipleEvidence(taskId, req.files, uploadedBy);

    res.json({
      success: true,
      data: {
        uploaded: results,
        failed: errors
      },
      message: `${results.length} file(s) uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/evidence/:filename
 * Download evidence file
 */
router.get('/evidence/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = await evidenceService.getFile(filename);

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || 'default';

    const task = await taskService.getTaskById(id, tenant_id);

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    const status = error.message === 'Task not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    const taskData = req.body;
    const task = await taskService.createTask(taskData);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || req.body.tenant_id || 'default';
    const updates = req.body;

    const task = await taskService.updateTask(id, updates, tenant_id);

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || 'default';

    const result = await taskService.deleteTask(id, tenant_id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    const status = error.message === 'Task not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/:id/assign
 * Assign task to a user
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || req.body.tenant_id || 'default';
    const { assigned_to, assigned_to_email, assigned_to_name } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        error: 'assigned_to is required'
      });
    }

    const task = await taskService.assignTask(id, {
      assigned_to,
      assigned_to_email,
      assigned_to_name
    }, tenant_id);

    res.json({
      success: true,
      data: task,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tasks/:id/claim
 * Claim task (self-assignment)
 */
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || req.body.tenant_id || 'default';
    const { user_id, user_email, user_name } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const task = await taskService.claimTask(id, user_id, user_email, user_name, tenant_id);

    res.json({
      success: true,
      data: task,
      message: 'Task claimed successfully'
    });
  } catch (error) {
    console.error('Error claiming task:', error);
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Update task status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.query.tenant_id || req.body.tenant_id || 'default';
    const { status, completion_notes, completion_evidence } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status is required'
      });
    }

    const validStatuses = ['pending', 'in_progress', 'review', 'completed', 'cancelled', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const completionData = {
      notes: completion_notes,
      evidence: completion_evidence
    };

    const task = await taskService.updateTaskStatus(id, status, tenant_id, completionData);

    res.json({
      success: true,
      data: task,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    const status = error.message === 'Task not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/:id/evidence
 * Get all evidence for a task
 */
router.get('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const evidence = await evidenceService.getTaskEvidence(id);

    res.json({
      success: true,
      data: { evidence },
      count: evidence.length
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    const status = error.message === 'Task not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/tasks/:id/evidence/:index
 * Delete evidence file
 */
router.delete('/:id/evidence/:index', async (req, res) => {
  try {
    const { id, index } = req.params;
    const evidenceIndex = parseInt(index);

    if (isNaN(evidenceIndex) || evidenceIndex < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid evidence index'
      });
    }

    await evidenceService.deleteEvidence(id, evidenceIndex);

    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    const status = error.message === 'Task not found' || error.message === 'Evidence not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
