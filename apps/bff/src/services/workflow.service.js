/**
 * Workflow Service
 * Handles workflow templates, instances, and state management
 */

const prisma = require('../../db/prisma');

// Workflow state machine
const WORKFLOW_STATES = {
  draft: ['submitted', 'cancelled'],
  submitted: ['in_review', 'rejected', 'cancelled'],
  in_review: ['approved', 'rejected', 'on_hold'],
  on_hold: ['in_review', 'cancelled'],
  approved: ['completed', 'cancelled'],
  rejected: ['draft', 'cancelled'],
  completed: [],
  cancelled: []
};

/**
 * Validate state transition
 */
function canTransitionTo(currentState, newState) {
  return WORKFLOW_STATES[currentState]?.includes(newState) || false;
}

/**
 * Get next possible states
 */
function getNextStates(currentState) {
  return WORKFLOW_STATES[currentState] || [];
}

/**
 * Create workflow template
 */
async function createWorkflowTemplate(data) {
  return await prisma.workflow_templates.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      steps: data.steps || [],
      approvers: data.approvers || [],
      sla: data.sla, // in hours
      autoApprove: data.autoApprove || false,
      requiresEvidence: data.requiresEvidence || false,
      notificationConfig: data.notificationConfig || {},
      tenantId: data.tenantId,
      createdBy: data.createdBy,
      isActive: true
    }
  });
}

/**
 * Get all workflow templates
 */
async function getWorkflowTemplates(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.category) where.category = filters.category;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return await prisma.workflow_templates.findMany({
    where,
    include: {
      _count: {
        select: { instances: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Get workflow template by ID
 */
async function getWorkflowTemplateById(id) {
  return await prisma.workflow_templates.findUnique({
    where: { id },
    include: {
      instances: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
}

/**
 * Update workflow template
 */
async function updateWorkflowTemplate(id, updates) {
  return await prisma.workflow_templates.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete workflow template
 */
async function deleteWorkflowTemplate(id) {
  // Check if template has active instances
  const activeInstances = await prisma.workflow_instances.count({
    where: {
      templateId: id,
      status: { notIn: ['completed', 'cancelled'] }
    }
  });

  if (activeInstances > 0) {
    throw new Error('Cannot delete template with active instances');
  }

  return await prisma.workflow_templates.delete({
    where: { id }
  });
}

/**
 * Create workflow instance
 */
async function createWorkflowInstance(data) {
  const template = await prisma.workflow_templates.findUnique({
    where: { id: data.templateId }
  });

  if (!template) {
    throw new Error('Workflow template not found');
  }

  if (!template.isActive) {
    throw new Error('Workflow template is not active');
  }

  // Calculate due date based on SLA
  const dueDate = template.sla
    ? new Date(Date.now() + (template.sla * 60 * 60 * 1000))
    : null;

  const instance = await prisma.workflow_instances.create({
    data: {
      templateId: data.templateId,
      title: data.title,
      description: data.description,
      status: 'draft',
      currentStep: 0,
      steps: template.steps,
      assignedTo: data.assignedTo,
      priority: data.priority || 'medium',
      dueDate,
      metadata: data.metadata || {},
      tenantId: data.tenantId,
      createdBy: data.createdBy
    }
  });

  // Create audit log
  await createWorkflowLog(instance.id, {
    action: 'created',
    fromStatus: null,
    toStatus: 'draft',
    userId: data.createdBy,
    comment: 'Workflow instance created'
  });

  return instance;
}

/**
 * Get workflow instances
 */
async function getWorkflowInstances(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.templateId) where.templateId = filters.templateId;
  if (filters.status) where.status = filters.status;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;
  if (filters.priority) where.priority = filters.priority;

  return await prisma.workflow_instances.findMany({
    where,
    include: {
      template: true,
      _count: {
        select: { logs: true }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Get workflow instance by ID
 */
async function getWorkflowInstanceById(id) {
  return await prisma.workflow_instances.findUnique({
    where: { id },
    include: {
      template: true,
      logs: {
        orderBy: { timestamp: 'desc' }
      }
    }
  });
}

/**
 * Update workflow instance
 */
async function updateWorkflowInstance(id, updates, userId) {
  const instance = await prisma.workflow_instances.findUnique({
    where: { id }
  });

  if (!instance) {
    throw new Error('Workflow instance not found');
  }

  // Validate state transition
  if (updates.status && updates.status !== instance.status) {
    if (!canTransitionTo(instance.status, updates.status)) {
      throw new Error(`Cannot transition from ${instance.status} to ${updates.status}`);
    }

    // Create audit log for status change
    await createWorkflowLog(id, {
      action: 'status_changed',
      fromStatus: instance.status,
      toStatus: updates.status,
      userId,
      comment: updates.comment || `Status changed to ${updates.status}`
    });
  }

  // Auto-complete if all steps done
  if (updates.currentStep !== undefined) {
    const template = await prisma.workflow_templates.findUnique({
      where: { id: instance.templateId }
    });

    if (updates.currentStep >= template.steps.length) {
      updates.status = 'completed';
      updates.completedAt = new Date();
    }
  }

  return await prisma.workflow_instances.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Advance workflow to next step
 */
async function advanceWorkflow(id, userId, comment) {
  const instance = await getWorkflowInstanceById(id);

  if (!instance) {
    throw new Error('Workflow instance not found');
  }

  if (instance.status === 'completed' || instance.status === 'cancelled') {
    throw new Error('Workflow is already closed');
  }

  const nextStep = instance.currentStep + 1;
  const isLastStep = nextStep >= instance.steps.length;

  const updates = {
    currentStep: nextStep,
    status: isLastStep ? 'completed' : instance.status,
    completedAt: isLastStep ? new Date() : null
  };

  await createWorkflowLog(id, {
    action: 'step_completed',
    fromStatus: instance.status,
    toStatus: updates.status,
    userId,
    comment: comment || `Advanced to step ${nextStep + 1}`
  });

  return await updateWorkflowInstance(id, updates, userId);
}

/**
 * Approve workflow
 */
async function approveWorkflow(id, userId, comment) {
  const instance = await getWorkflowInstanceById(id);

  if (!instance) {
    throw new Error('Workflow instance not found');
  }

  // Check if user is an approver
  const template = instance.template;
  if (template.approvers && !template.approvers.includes(userId)) {
    throw new Error('User is not authorized to approve this workflow');
  }

  await createWorkflowLog(id, {
    action: 'approved',
    fromStatus: instance.status,
    toStatus: 'approved',
    userId,
    comment: comment || 'Workflow approved'
  });

  return await updateWorkflowInstance(id, {
    status: 'approved',
    approvedBy: userId,
    approvedAt: new Date()
  }, userId);
}

/**
 * Reject workflow
 */
async function rejectWorkflow(id, userId, reason) {
  await createWorkflowLog(id, {
    action: 'rejected',
    fromStatus: 'in_review',
    toStatus: 'rejected',
    userId,
    comment: reason || 'Workflow rejected'
  });

  return await updateWorkflowInstance(id, {
    status: 'rejected',
    rejectedBy: userId,
    rejectedAt: new Date(),
    rejectionReason: reason
  }, userId);
}

/**
 * Cancel workflow
 */
async function cancelWorkflow(id, userId, reason) {
  await createWorkflowLog(id, {
    action: 'cancelled',
    userId,
    comment: reason || 'Workflow cancelled'
  });

  return await updateWorkflowInstance(id, {
    status: 'cancelled',
    cancelledAt: new Date(),
    cancellationReason: reason
  }, userId);
}

/**
 * Delete workflow instance
 */
async function deleteWorkflowInstance(id) {
  const instance = await prisma.workflow_instances.findUnique({
    where: { id }
  });

  if (instance.status === 'in_review' || instance.status === 'approved') {
    throw new Error('Cannot delete workflow in review or approved state');
  }

  return await prisma.workflow_instances.delete({
    where: { id }
  });
}

/**
 * Create workflow log entry
 */
async function createWorkflowLog(instanceId, data) {
  return await prisma.workflow_logs.create({
    data: {
      instanceId,
      action: data.action,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      userId: data.userId,
      comment: data.comment,
      metadata: data.metadata || {}
    }
  });
}

/**
 * Get workflow statistics
 */
async function getWorkflowStats(tenantId) {
  const instances = await prisma.workflow_instances.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const templates = await prisma.workflow_templates.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const now = Date.now();
  const overdue = instances.filter(i =>
    i.dueDate &&
    i.dueDate < now &&
    !['completed', 'cancelled'].includes(i.status)
  ).length;

  const completed = instances.filter(i => i.status === 'completed');
  const avgCompletionTime = completed.length > 0
    ? completed.reduce((sum, i) => {
        if (i.completedAt && i.createdAt) {
          return sum + (i.completedAt.getTime() - i.createdAt.getTime());
        }
        return sum;
      }, 0) / completed.length / (1000 * 60 * 60) // Convert to hours
    : 0;

  return {
    templates: {
      total: templates.length,
      active: templates.filter(t => t.isActive).length
    },
    instances: {
      total: instances.length,
      byStatus: {
        draft: instances.filter(i => i.status === 'draft').length,
        submitted: instances.filter(i => i.status === 'submitted').length,
        in_review: instances.filter(i => i.status === 'in_review').length,
        approved: instances.filter(i => i.status === 'approved').length,
        completed: instances.filter(i => i.status === 'completed').length,
        rejected: instances.filter(i => i.status === 'rejected').length,
        cancelled: instances.filter(i => i.status === 'cancelled').length
      },
      byPriority: {
        critical: instances.filter(i => i.priority === 'critical').length,
        high: instances.filter(i => i.priority === 'high').length,
        medium: instances.filter(i => i.priority === 'medium').length,
        low: instances.filter(i => i.priority === 'low').length
      },
      overdue,
      avgCompletionTime: avgCompletionTime.toFixed(2)
    }
  };
}

module.exports = {
  createWorkflowTemplate,
  getWorkflowTemplates,
  getWorkflowTemplateById,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  createWorkflowInstance,
  getWorkflowInstances,
  getWorkflowInstanceById,
  updateWorkflowInstance,
  advanceWorkflow,
  approveWorkflow,
  rejectWorkflow,
  cancelWorkflow,
  deleteWorkflowInstance,
  getWorkflowStats,
  canTransitionTo,
  getNextStates,
  WORKFLOW_STATES
};
