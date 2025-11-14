require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const app = express();
const server = createServer(app);

// CORS configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5175",
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Redis client for storing session data
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Rate limiter configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ws_rate_limit',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5175",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'websocket-service',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

// Active rooms and users tracking
const activeRooms = new Map(); // roomId -> { users, type, metadata }
const userSessions = new Map(); // socketId -> { userId, tenantId, rooms }

// Authentication middleware for Socket.IO
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Apply rate limiting
    await rateLimiter.consume(decoded.userId);

    socket.userId = decoded.userId;
    socket.tenantId = decoded.tenantId;
    socket.userRole = decoded.role;

    console.log(`[WebSocket] User ${decoded.userId} connected from tenant ${decoded.tenantId}`);

    next();
  } catch (error) {
    console.error('[WebSocket] Authentication failed:', error.message);
    next(new Error('Authentication failed'));
  }
};

// Apply authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id} (User: ${socket.userId})`);

  // Store user session
  userSessions.set(socket.id, {
    userId: socket.userId,
    tenantId: socket.tenantId,
    rooms: new Set(),
    connectedAt: new Date()
  });

  // Join assessment room
  socket.on('join_assessment', async (data) => {
    try {
      const { assessmentId } = data;
      const roomId = `assessment_${assessmentId}`;

      // Verify user has access to this assessment (in production, check database)
      // For now, we assume tenant-based access control

      socket.join(roomId);

      // Track room membership
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          users: new Map(),
          type: 'assessment',
          metadata: { assessmentId },
          createdAt: new Date()
        });
      }

      const room = activeRooms.get(roomId);
      room.users.set(socket.userId, {
        socketId: socket.id,
        joinedAt: new Date(),
        role: socket.userRole
      });

      userSessions.get(socket.id).rooms.add(roomId);

      // Notify other users in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date().toISOString()
      });

      // Send current room status to new user
      socket.emit('room_status', {
        roomId,
        activeUsers: Array.from(room.users.keys()),
        userCount: room.users.size
      });

      console.log(`[WebSocket] User ${socket.userId} joined assessment ${assessmentId}`);

    } catch (error) {
      console.error('[WebSocket] Error joining assessment:', error);
      socket.emit('error', { message: 'Failed to join assessment room' });
    }
  });

  // Handle real-time assessment updates
  socket.on('assessment_update', async (data) => {
    try {
      const { assessmentId, field, value, timestamp } = data;
      const roomId = `assessment_${assessmentId}`;

      // Verify user is in the room
      const session = userSessions.get(socket.id);
      if (!session || !session.rooms.has(roomId)) {
        return socket.emit('error', { message: 'Not authorized for this assessment' });
      }

      // Broadcast update to other users in the assessment
      socket.to(roomId).emit('assessment_updated', {
        assessmentId,
        field,
        value,
        updatedBy: socket.userId,
        timestamp: timestamp || new Date().toISOString()
      });

      // Store the update in Redis for conflict resolution
      await redisClient.setEx(
        `assessment_update_${assessmentId}_${field}`,
        3600, // 1 hour TTL
        JSON.stringify({
          value,
          updatedBy: socket.userId,
          timestamp: timestamp || new Date().toISOString()
        })
      );

      console.log(`[WebSocket] Assessment ${assessmentId} updated: ${field} by user ${socket.userId}`);

    } catch (error) {
      console.error('[WebSocket] Error handling assessment update:', error);
      socket.emit('error', { message: 'Failed to update assessment' });
    }
  });

  // Handle document collaboration
  socket.on('document_edit', async (data) => {
    try {
      const { documentId, operation, cursor, content } = data;
      const roomId = `document_${documentId}`;

      socket.join(roomId);

      // Broadcast edit to other users
      socket.to(roomId).emit('document_edited', {
        documentId,
        operation,
        cursor,
        content,
        editedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] Document ${documentId} edited by user ${socket.userId}`);

    } catch (error) {
      console.error('[WebSocket] Error handling document edit:', error);
      socket.emit('error', { message: 'Failed to sync document edit' });
    }
  });

  // Handle workflow notifications
  socket.on('workflow_action', async (data) => {
    try {
      const { workflowId, action, targetUserId, metadata } = data;

      // Find target user's socket if online
      let targetSocket = null;
      for (const [socketId, session] of userSessions) {
        if (session.userId === targetUserId && session.tenantId === socket.tenantId) {
          targetSocket = io.sockets.sockets.get(socketId);
          break;
        }
      }

      if (targetSocket) {
        targetSocket.emit('workflow_notification', {
          workflowId,
          action,
          fromUser: socket.userId,
          metadata,
          timestamp: new Date().toISOString()
        });
      }

      // Also broadcast to workflow room
      const roomId = `workflow_${workflowId}`;
      socket.to(roomId).emit('workflow_updated', {
        workflowId,
        action,
        actor: socket.userId,
        metadata,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] Workflow ${workflowId} action: ${action} by user ${socket.userId}`);

    } catch (error) {
      console.error('[WebSocket] Error handling workflow action:', error);
      socket.emit('error', { message: 'Failed to process workflow action' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { resourceType, resourceId } = data;
    const roomId = `${resourceType}_${resourceId}`;

    socket.to(roomId).emit('user_typing', {
      userId: socket.userId,
      resourceType,
      resourceId,
      action: 'start'
    });
  });

  socket.on('typing_stop', (data) => {
    const { resourceType, resourceId } = data;
    const roomId = `${resourceType}_${resourceId}`;

    socket.to(roomId).emit('user_typing', {
      userId: socket.userId,
      resourceType,
      resourceId,
      action: 'stop'
    });
  });

  // Handle cursor position sharing
  socket.on('cursor_position', (data) => {
    const { resourceType, resourceId, position, selection } = data;
    const roomId = `${resourceType}_${resourceId}`;

    socket.to(roomId).emit('cursor_updated', {
      userId: socket.userId,
      position,
      selection,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id} (User: ${socket.userId})`);

    const session = userSessions.get(socket.id);
    if (session) {
      // Remove user from all rooms
      session.rooms.forEach(roomId => {
        const room = activeRooms.get(roomId);
        if (room) {
          room.users.delete(socket.userId);

          // Notify other users in the room
          socket.to(roomId).emit('user_left', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });

          // Clean up empty rooms
          if (room.users.size === 0) {
            activeRooms.delete(roomId);
          }
        }
      });

      userSessions.delete(socket.id);
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[WebSocket] Received SIGTERM, shutting down gracefully');

  // Close Redis connection
  await redisClient.quit();

  // Close Socket.IO server
  io.close(() => {
    console.log('[WebSocket] Socket.IO server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3008;

// Initialize Redis connection
redisClient.connect()
  .then(() => {
    console.log('[WebSocket] Redis connected successfully');

    server.listen(PORT, () => {
      console.log(`[WebSocket] Service running on port ${PORT}`);
      console.log(`[WebSocket] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[WebSocket] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5175'}`);
    });
  })
  .catch(error => {
    console.error('[WebSocket] Redis connection failed:', error);
    process.exit(1);
  });

module.exports = { app, io, server };
