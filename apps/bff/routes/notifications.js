const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/notifications - Get all notifications for the user
router.get('/', async (req, res) => {
  try {
    // Assuming userId is available from auth middleware (req.user.id)
    const userId = req.user?.id;
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) }, // Fetch notifications for the logged-in user
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    handleError(res, error, 'Error fetching notifications');
  }
});

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', async (req, res) => {
    const userId = req.user?.id;
    try {
        const total = await prisma.notification.count({ where: { userId: parseInt(userId) } });
        const unread = await prisma.notification.count({ where: { userId: parseInt(userId), isRead: false } });
        res.json({ total, unread });
    } catch (error) {
        handleError(res, error, 'Error fetching notification stats');
    }
});

// GET /api/notifications/preferences - Get user notification preferences
router.get('/preferences', async (req, res) => {
    const userId = req.user?.id;
    try {
        const preferences = await prisma.notificationPreference.findUnique({
            where: { userId: parseInt(userId) },
        });
        res.json(preferences || {}); // Return empty object if no preferences are set
    } catch (error) {
        handleError(res, error, 'Error fetching notification preferences');
    }
});

// PUT /api/notifications/preferences - Update user notification preferences
router.put('/preferences', async (req, res) => {
    const userId = req.user?.id;
    try {
        const updatedPreferences = await prisma.notificationPreference.upsert({
            where: { userId: parseInt(userId) },
            update: req.body,
            create: { userId: parseInt(userId), ...req.body },
        });
        res.json(updatedPreferences);
    } catch (error) {
        handleError(res, error, 'Error updating notification preferences');
    }
});

// POST /api/notifications/send - Send a notification (admin/system action)
router.post('/send', async (req, res) => {
  try {
    const newNotification = await prisma.notification.create({ data: req.body });
    res.status(201).json(newNotification);
  } catch (error) {
    handleError(res, error, 'Error sending notification');
  }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(id, 10) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    handleError(res, error, 'Error marking notification as read');
  }
});

// PUT /api/notifications/:id/unread - Mark a notification as unread
router.put('/:id/unread', async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await prisma.notification.update({
            where: { id: parseInt(id, 10) },
            data: { isRead: false },
        });
        res.json(notification);
    } catch (error) {
        handleError(res, error, 'Error marking notification as unread');
    }
});

// PUT /api/notifications/:id/archive - Archive a notification
router.put('/:id/archive', async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await prisma.notification.update({
            where: { id: parseInt(id, 10) },
            data: { isArchived: true },
        });
        res.json(notification);
    } catch (error) {
        handleError(res, error, 'Error archiving notification');
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Error deleting notification');
  }
});

module.exports = router;
