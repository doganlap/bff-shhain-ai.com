/**
 * Simple Working WebSocket Server
 * Real-time communication for GRC Platform
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3006"
        ],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3005;

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'websocket-service',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        connections: io.engine.clientsCount
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`[WebSocket] User ${userId} joined personal room`);
    });

    // Join assessment room
    socket.on('join-assessment', (assessmentId) => {
        socket.join(`assessment-${assessmentId}`);
        console.log(`[WebSocket] Client joined assessment: ${assessmentId}`);
        socket.to(`assessment-${assessmentId}`).emit('user-joined-assessment', {
            socketId: socket.id,
            assessmentId,
            timestamp: new Date().toISOString()
        });
    });

    // Handle assessment updates
    socket.on('assessment-update', (data) => {
        console.log(`[WebSocket] Assessment update:`, data);
        socket.to(`assessment-${data.assessmentId}`).emit('assessment-updated', {
            ...data,
            timestamp: new Date().toISOString(),
            updatedBy: socket.id
        });
    });

    // Handle compliance notifications
    socket.on('compliance-notification', (data) => {
        console.log(`[WebSocket] Compliance notification:`, data);
        if (data.userId) {
            io.to(`user-${data.userId}`).emit('notification', {
                ...data,
                timestamp: new Date().toISOString()
            });
        } else {
            // Broadcast to all connected clients
            io.emit('notification', {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle document collaboration
    socket.on('document-edit', (data) => {
        console.log(`[WebSocket] Document edit:`, data);
        socket.to(`document-${data.documentId}`).emit('document-updated', {
            ...data,
            timestamp: new Date().toISOString(),
            editedBy: socket.id
        });
    });

    // Handle real-time chat
    socket.on('chat-message', (data) => {
        console.log(`[WebSocket] Chat message:`, data);
        io.to(`assessment-${data.assessmentId}`).emit('new-message', {
            ...data,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    // Send welcome message
    socket.emit('connected', {
        message: 'Connected to GRC WebSocket Service',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });
});

// Error handling
server.on('error', (error) => {
    console.error('[WebSocket] Server error:', error);
});

// Start server
server.listen(PORT, () => {
    console.log('===============================================');
    console.log('[WebSocket] GRC WebSocket Service Started');
    console.log('===============================================');
    console.log(`[WebSocket] Server running on port ${PORT}`);
    console.log(`[WebSocket] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[WebSocket] Health check: http://localhost:${PORT}/api/health`);
    console.log('===============================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[WebSocket] Shutting down gracefully...');
    server.close(() => {
        console.log('[WebSocket] Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };
