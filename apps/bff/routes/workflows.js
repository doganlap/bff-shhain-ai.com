const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const workflowService = require('../src/services/workflow.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// ====================================
// SPECIFIC ROUTES (must come first)
// ====================================

// GET /api/workflows/templates - Get workflow templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.workflowTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(templates);
  } catch (error) {
    handleError(res, error, 'Error fetching workflow templates');
  }
});

// GET /api/workflows/stats - Get workflow statistics
router.get('/stats', async (req, res) => {
  try {
    const totalWorkflows = await prisma.workflow.count();
    const activeWorkflows = await prisma.workflow.count({
      where: { isActive: true }
    });
    const totalInstances = await prisma.workflowInstance.count();
    const completedInstances = await prisma.workflowInstance.count({
      where: { status: 'completed' }
    });

    const stats = {
      totalWorkflows,
      activeWorkflows,
      totalInstances,
      completedInstances,
      completionRate: totalInstances > 0 ? (completedInstances / totalInstances) * 100 : 0
    };

    res.json(stats);
  } catch (error) {
    handleError(res, error, 'Error fetching workflow statistics');
  }
});

// ====================================
// INSTANCES SUB-ROUTES (before generic /:id)
// ====================================

// GET /api/workflows/instances/:id - Get a single workflow instance by ID
router.get('/instances/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: parseInt(id, 10) },
      include: { workflow: true, steps: true },
    });
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }
    res.json(instance);
  } catch (error) {
    handleError(res, error, 'Error fetching workflow instance');
  }
});

// PUT /api/workflows/instances/:id - Update a workflow instance
router.put('/instances/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedInstance = await prisma.workflowInstance.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedInstance);
  } catch (error) {
    handleError(res, error, 'Error updating workflow instance');
  }
});

// DELETE /api/workflows/instances/:id - Delete a workflow instance
router.delete('/instances/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.workflowInstance.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Workflow instance deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Error deleting workflow instance');
  }
});

// ====================================
// GENERIC ROUTES (must come last)
// ====================================

// GET /api/workflows - Get all workflow definitions
router.get('/', async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: { instances: true },
    });
    res.json(workflows);
  } catch (error) {
    handleError(res, error, 'Error fetching workflows');
  }
});

// POST /api/workflows - Create a new workflow definition
router.post('/', async (req, res) => {
  try {
    const newWorkflow = await prisma.workflow.create({ data: req.body });
    res.status(201).json(newWorkflow);
  } catch (error) {
    handleError(res, error, 'Error creating workflow');
  }
});

// GET /api/workflows/:id - Get a single workflow definition by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: parseInt(id, 10) },
      include: { instances: true },
    });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    handleError(res, error, 'Error fetching workflow by ID');
  }
});

// POST /api/workflows/:id/instances - Create a new instance of a workflow
router.post('/:id/instances', async (req, res) => {
  const { id } = req.params;
  try {
    const newInstance = await prisma.workflowInstance.create({
      data: {
        workflowId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(newInstance);
  } catch (error) {
    handleError(res, error, 'Error creating workflow instance');
  }
});

// PUT /api/workflows/:id - Update a workflow definition
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedWorkflow);
  } catch (error) {
    handleError(res, error, 'Error updating workflow');
  }
});

// DELETE /api/workflows/:id - Delete a workflow definition
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.workflow.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Error deleting workflow');
  }
});

module.exports = router;
