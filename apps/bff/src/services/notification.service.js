/**
 * Notification Service
 * Handles notification delivery, preferences, and read/unread state management
 */

const prisma = require('../lib/prisma');

// Notification types and priorities
const NOTIFICATION_TYPES = {
  info: { priority: 'low', icon: 'info' },
  success: { priority: 'low', icon: 'check' },
  warning: { priority: 'medium', icon: 'alert' },
  error: { priority: 'high', icon: 'error' },
  alert: { priority: 'high', icon: 'bell' },
  reminder: { priority: 'medium', icon: 'clock' },
  system: { priority: 'medium', icon: 'settings' }
};

/**
 * Create notification
 */
async function createNotification(data) {
  const typeConfig = NOTIFICATION_TYPES[data.type] || NOTIFICATION_TYPES.info;

  return await prisma.notifications.create({
    data: {
      userId: data.userId,
      tenantId: data.tenantId,
      type: data.type,
      priority: data.priority || typeConfig.priority,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata || {},
      isRead: false,
      isArchived: false,
      expiresAt: data.expiresAt
    }
  });
}

/**
 * Bulk create notifications (for broadcasting)
 */
async function broadcastNotification(userIds, data) {
  const notifications = userIds.map(userId => ({
    userId,
    tenantId: data.tenantId,
    type: data.type,
    priority: data.priority || NOTIFICATION_TYPES[data.type]?.priority || 'low',
    title: data.title,
    message: data.message,
    link: data.link,
    metadata: data.metadata || {},
    isRead: false,
    isArchived: false,
    expiresAt: data.expiresAt
  }));

  const result = await prisma.notifications.createMany({
    data: notifications
  });

  return {
    sent: result.count,
    recipients: userIds.length
  };
}

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, filters = {}) {
  const where = { userId };

  if (filters.isRead !== undefined) where.isRead = filters.isRead;
  if (filters.isArchived !== undefined) where.isArchived = filters.isArchived;
  if (filters.type) where.type = filters.type;
  if (filters.priority) where.priority = filters.priority;

  // Don't show expired notifications
  where.OR = [
    { expiresAt: null },
    { expiresAt: { gt: new Date() } }
  ];

  return await prisma.notifications.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: filters.limit || 50
  });
}

/**
 * Get notification by ID
 */
async function getNotificationById(id) {
  return await prisma.notifications.findUnique({
    where: { id }
  });
}

/**
 * Mark notification as read
 */
async function markAsRead(id, userId) {
  const notification = await prisma.notifications.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
}

/**
 * Mark notification as unread
 */
async function markAsUnread(id, userId) {
  const notification = await prisma.notifications.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.update({
    where: { id },
    data: {
      isRead: false,
      readAt: null
    }
  });
}

/**
 * Mark all as read
 */
async function markAllAsRead(userId) {
  const result = await prisma.notifications.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  return { updated: result.count };
}

/**
 * Archive notification
 */
async function archiveNotification(id, userId) {
  const notification = await prisma.notifications.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: new Date()
    }
  });
}

/**
 * Unarchive notification
 */
async function unarchiveNotification(id, userId) {
  const notification = await prisma.notifications.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.update({
    where: { id },
    data: {
      isArchived: false,
      archivedAt: null
    }
  });
}

/**
 * Delete notification
 */
async function deleteNotification(id, userId) {
  const notification = await prisma.notifications.findFirst({
    where: { id, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.delete({
    where: { id }
  });
}

/**
 * Delete all archived notifications
 */
async function deleteAllArchived(userId) {
  const result = await prisma.notifications.deleteMany({
    where: {
      userId,
      isArchived: true
    }
  });

  return { deleted: result.count };
}

/**
 * Get notification statistics
 */
async function getNotificationStats(userId) {
  const all = await prisma.notifications.findMany({
    where: {
      userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });

  const unread = all.filter(n => !n.isRead && !n.isArchived);

  return {
    total: all.length,
    unread: unread.length,
    read: all.filter(n => n.isRead && !n.isArchived).length,
    archived: all.filter(n => n.isArchived).length,
    byType: {
      info: all.filter(n => n.type === 'info').length,
      success: all.filter(n => n.type === 'success').length,
      warning: all.filter(n => n.type === 'warning').length,
      error: all.filter(n => n.type === 'error').length,
      alert: all.filter(n => n.type === 'alert').length,
      reminder: all.filter(n => n.type === 'reminder').length,
      system: all.filter(n => n.type === 'system').length
    },
    byPriority: {
      high: unread.filter(n => n.priority === 'high').length,
      medium: unread.filter(n => n.priority === 'medium').length,
      low: unread.filter(n => n.priority === 'low').length
    }
  };
}

/**
 * Get user notification preferences
 */
async function getUserPreferences(userId) {
  let prefs = await prisma.notification_preferences.findUnique({
    where: { userId }
  });

  // Create default preferences if not exists
  if (!prefs) {
    prefs = await prisma.notification_preferences.create({
      data: {
        userId,
        email: true,
        push: true,
        inApp: true,
        digest: 'daily',
        types: {
          info: true,
          success: true,
          warning: true,
          error: true,
          alert: true,
          reminder: true,
          system: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    });
  }

  return prefs;
}

/**
 * Update user notification preferences
 */
async function updateUserPreferences(userId, updates) {
  const existing = await getUserPreferences(userId);

  return await prisma.notification_preferences.update({
    where: { userId },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Check if user should receive notification based on preferences
 */
async function shouldNotify(userId, notificationType) {
  const prefs = await getUserPreferences(userId);

  // Check if notification type is enabled
  if (prefs.types && !prefs.types[notificationType]) {
    return false;
  }

  // Check quiet hours
  if (prefs.quietHours?.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (currentTime >= prefs.quietHours.start || currentTime <= prefs.quietHours.end) {
      return false;
    }
  }

  return true;
}

/**
 * Send notification with preference check
 */
async function sendNotification(data) {
  // Check if user should receive this notification
  const shouldSend = await shouldNotify(data.userId, data.type);

  if (!shouldSend) {
    return { sent: false, reason: 'User preferences' };
  }

  const notification = await createNotification(data);

  // Here you would integrate with actual notification channels
  // - Email (SendGrid, AWS SES, etc.)
  // - Push notifications (FCM, APNS, etc.)
  // - SMS (Twilio, etc.)

  return { sent: true, notification };
}

/**
 * Clean up expired notifications
 */
async function cleanupExpired() {
  const result = await prisma.notifications.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  console.log(`Cleaned up ${result.count} expired notifications`);
  return { deleted: result.count };
}

/**
 * Send reminder notifications
 * Used for deadlines, assessments due, etc.
 */
async function sendReminders(tenantId) {
  const reminders = [];

  // Example: Assessment reminders
  const assessments = await prisma.grc_assessments.findMany({
    where: {
      tenantId,
      status: { notIn: ['completed', 'cancelled'] },
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    }
  });

  for (const assessment of assessments) {
    if (assessment.assignedTo) {
      const notification = await createNotification({
        userId: assessment.assignedTo,
        tenantId,
        type: 'reminder',
        title: 'Assessment Due Soon',
        message: `Assessment "${assessment.title}" is due on ${assessment.dueDate.toLocaleDateString()}`,
        link: `/assessments/${assessment.id}`,
        metadata: { assessmentId: assessment.id }
      });
      reminders.push(notification);
    }
  }

  return {
    sent: reminders.length,
    notifications: reminders
  };
}

module.exports = {
  createNotification,
  broadcastNotification,
  sendNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  deleteAllArchived,
  getNotificationStats,
  getUserPreferences,
  updateUserPreferences,
  shouldNotify,
  cleanupExpired,
  sendReminders,
  NOTIFICATION_TYPES
};
