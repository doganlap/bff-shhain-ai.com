#!/usr/bin/env node

/**
 * Shahin-AI KSA GRC Platform - Development Server (No Auth)
 * For development purposes without authentication requirements
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'shahin-ai-grc-dev',
    auth: false,
    timestamp: new Date().toISOString()
  });
});

// Mock endpoints for development
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalAssessments: 156,
      completedAssessments: 134, 
      pendingRisks: 23,
      complianceScore: 94,
      activeFrameworks: 8,
      totalUsers: 45
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Shahin-AI GRC Development Server (No Auth)
Server running on port ${PORT}
Health: http://localhost:${PORT}/health
  `);
});

module.exports = app;
