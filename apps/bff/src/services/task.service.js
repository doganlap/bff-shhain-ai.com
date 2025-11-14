/**
 * TASK SERVICE
 * Business logic for GRC task management
 * Optimized for <50ms response times
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cache for stats (1 second TTL)
let statsCache = null;
let statsCacheTime = 0;
const STATS_CACHE_TTL = 1000; // 1 second

class TaskService {
  /**
   * Get tasks with filters and pagination
   */
  async getTasks(filters = {}) {
    const {
      tenant_id = 'default',
      task_type,
      status,
      priority,
      assigned_to,
      control_id,
      framework,
      domain,
      search,
      page = 1,
      limit = 50,
      sortBy = 'due_date',
      sortOrder = 'asc'
    } = filters;

    const where = { tenant_id };

    if (task_type) where.task_type = task_type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to) where.assigned_to = assigned_to;
    if (control_id) where.control_id = control_id;

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { title_ar: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { description_ar: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Framework and domain are in completion_notes JSON
    // We'll filter in-memory for now (can optimize later with proper JSON columns)

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    // Optimize: Only select needed fields for list view
    const selectFields = {
      id: true,
      title: true,
      title_ar: true,
      description: true,
      status: true,
      priority: true,
      due_date: true,
      assigned_to: true,
      created_at: true,
      updated_at: true,
      task_type: true,
      tenant_id: true
    };

    const [tasks, total] = await Promise.all([
      prisma.tasks.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: selectFields
      }),
      prisma.tasks.count({ where })
    ]);

    // Filter by framework/domain if specified
    let filteredTasks = tasks;
    if (framework || domain) {
      filteredTasks = tasks.filter(task => {
        if (!task.completion_notes) return false;

        try {
          const metadata = JSON.parse(task.completion_notes);

          if (framework && metadata.frameworks) {
            const hasFramework = metadata.frameworks.some(f =>
              f.toLowerCase().includes(framework.toLowerCase())
            );
            if (!hasFramework) return false;
          }

          if (domain && metadata.domain) {
            if (!metadata.domain.toLowerCase().includes(domain.toLowerCase())) {
              return false;
            }
          }

          return true;
        } catch (e) {
          return false;
        }
      });
    }

    return {
      tasks: filteredTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(id, tenant_id = 'default') {
    const task = await prisma.tasks.findFirst({
      where: { id, tenant_id }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const {
      tenant_id = 'default',
      task_type,
      title,
      title_ar,
      description,
      description_ar,
      control_id,
      priority = 'medium',
      status = 'pending',
      assigned_to,
      assigned_to_email,
      assigned_to_name,
      due_date,
      metadata
    } = taskData;

    const task = await prisma.tasks.create({
      data: {
        tenant_id,
        task_type,
        title,
        title_ar,
        description,
        description_ar,
        control_id,
        priority,
        status,
        assigned_to,
        assigned_to_email,
        assigned_to_name,
        due_date: due_date ? new Date(due_date) : null,
        completion_notes: metadata ? JSON.stringify(metadata) : null
      }
    });

    return task;
  }

  /**
   * Update a task
   */
  async updateTask(id, updates, tenant_id = 'default') {
    // Verify task exists and belongs to tenant
    await this.getTaskById(id, tenant_id);

    const {
      title,
      title_ar,
      description,
      description_ar,
      priority,
      status,
      assigned_to,
      assigned_to_email,
      assigned_to_name,
      due_date,
      progress_percentage,
      completion_notes,
      completion_evidence
    } = updates;

    const data = {};
    if (title !== undefined) data.title = title;
    if (title_ar !== undefined) data.title_ar = title_ar;
    if (description !== undefined) data.description = description;
    if (description_ar !== undefined) data.description_ar = description_ar;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) {
      data.status = status;
      if (status === 'completed') {
        data.completed_date = new Date();
      }
    }
    if (assigned_to !== undefined) data.assigned_to = assigned_to;
    if (assigned_to_email !== undefined) data.assigned_to_email = assigned_to_email;
    if (assigned_to_name !== undefined) data.assigned_to_name = assigned_to_name;
    if (due_date !== undefined) data.due_date = due_date ? new Date(due_date) : null;
    if (progress_percentage !== undefined) data.progress_percentage = progress_percentage;
    if (completion_notes !== undefined) data.completion_notes = completion_notes;
    if (completion_evidence !== undefined) data.completion_evidence = completion_evidence;

    const task = await prisma.tasks.update({
      where: { id },
      data
    });

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(id, tenant_id = 'default') {
    // Verify task exists and belongs to tenant
    await this.getTaskById(id, tenant_id);

    await prisma.tasks.delete({
      where: { id }
    });

    return { success: true, message: 'Task deleted successfully' };
  }

  /**
   * Assign task to a user
   */
  async assignTask(id, assignmentData, tenant_id = 'default') {
    const { assigned_to, assigned_to_email, assigned_to_name } = assignmentData;

    const task = await this.updateTask(id, {
      assigned_to,
      assigned_to_email,
      assigned_to_name,
      status: 'in_progress'
    }, tenant_id);

    return task;
  }

  /**
   * Claim a task (self-assignment)
   */
  async claimTask(id, userId, userEmail, userName, tenant_id = 'default') {
    return this.assignTask(id, {
      assigned_to: userId,
      assigned_to_email: userEmail,
      assigned_to_name: userName
    }, tenant_id);
  }

  /**
   * Get tasks assigned to a specific user
   */
  async getMyTasks(userId, tenant_id = 'default', filters = {}) {
    return this.getTasks({
      ...filters,
      tenant_id,
      assigned_to: userId
    });
  }

  /**
   * Update task status
   */
  async updateTaskStatus(id, status, tenant_id = 'default', completionData = {}) {
    const updates = { status };

    if (status === 'completed') {
      updates.completed_date = new Date();
      updates.progress_percentage = 100;

      if (completionData.notes) {
        updates.completion_notes = completionData.notes;
      }
      if (completionData.evidence) {
        updates.completion_evidence = completionData.evidence;
      }
    }

    return this.updateTask(id, updates, tenant_id);
  }

  /**
   * Get task statistics
   * Ultra-optimized with caching for <50ms response
   */
  async getTaskStats(tenant_id = 'default', filters = {}) {
    const cacheKey = `${tenant_id}_${JSON.stringify(filters)}`;
    const now = Date.now();

    // Return cached result if still valid
    if (statsCache && statsCacheTime && (now - statsCacheTime) < STATS_CACHE_TTL) {
      if (statsCache[cacheKey]) {
        return statsCache[cacheKey];
      }
    }

    // Use raw SQL for efficient aggregation with indexes
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low
      FROM tasks
      WHERE tenant_id = $1
    `;

    const [stats] = await prisma.$queryRawUnsafe(statsQuery, tenant_id);

    // Skip framework counts for faster response - can be loaded separately if needed
    const frameworkCounts = {};

    const total = parseInt(stats.total) || 0;
    const completed = parseInt(stats.completed) || 0;

    const result = {
      total,
      byStatus: {
        pending: parseInt(stats.pending) || 0,
        in_progress: parseInt(stats.in_progress) || 0,
        completed,
        cancelled: parseInt(stats.cancelled) || 0,
        blocked: parseInt(stats.blocked) || 0
      },
      byPriority: {
        critical: parseInt(stats.critical) || 0,
        high: parseInt(stats.high) || 0,
        medium: parseInt(stats.medium) || 0,
        low: parseInt(stats.low) || 0
      },
      byFramework: frameworkCounts,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0'
    };

    // Cache the result
    if (!statsCache) statsCache = {};
    statsCache[cacheKey] = result;
    statsCacheTime = now;

    return result;
  }
}

module.exports = new TaskService();
