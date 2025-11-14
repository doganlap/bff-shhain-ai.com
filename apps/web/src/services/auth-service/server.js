const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');

// Import middleware
const { authenticateServiceToken } = require('./middleware/auth');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', generalLimiter);

// ==========================================
// GENERAL MIDDLEWARE
// ==========================================

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5001',
    'http://127.0.0.1:5487',
    /^http:\/\/127\.0\.0\.1:\d+$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// API ROUTES
// ==========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// Simple health endpoint for load balancers
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Detailed health check
app.get('/api/health/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      system: {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        pid: process.pid,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },
      dependencies: {
        database: 'checking...',
        jwt_validation: 'operational'
      }
    };

    // Test database connection
    try {
      await testConnection();
      detailedHealth.dependencies.database = 'connected';
    } catch (error) {
      detailedHealth.dependencies.database = `error: ${error.message}`;
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe
app.get('/health/live', (req, res) => {
  res.status(200).send('OK');
});

// Readiness probe
app.get('/health/ready', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Service info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'GRC Authentication Service',
    version: process.env.npm_package_version || '1.0.0',
    description: 'JWT-based authentication service with RBAC and multi-tenant support',
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      refresh: 'POST /api/auth/refresh',
      logout: 'POST /api/auth/logout',
      profile: 'GET /api/auth/me',
      changePassword: 'POST /api/auth/change-password'
    },
    features: [
      'JWT Authentication',
      'Role-Based Access Control (RBAC)',
      'Multi-tenant Support',
      'Account Lockout Protection',
      'Refresh Token Rotation',
      'Service Token Authentication'
    ]
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Service token validation endpoint (for other services)
app.post('/api/validate-token', authenticateServiceToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required',
        message: 'Please provide a token to validate'
      });
    }

    const jwt = require('jsonwebtoken');
    const { query } = require('./config/database');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details from database
    const userResult = await query(`
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.tenant_id,
        u.permissions,
        u.status,
        t.name as tenant_name,
        t.tenant_code
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.status = 'active'
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      valid: true,
      user: userResult.rows[0]
    });

  } catch (error) {
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    service: 'auth-service',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'GET /api/auth/me',
      'POST /api/auth/change-password',
      'POST /api/validate-token'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('[AUTH-SERVICE] Global error handler:', error);

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }

  // Database errors
  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.message
    });
  }

  // Default error response
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    success: false,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    service: 'auth-service',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================

const startServer = async () => {
  try {
    // Test database connection
    console.log('[AUTH-SERVICE] Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('[AUTH-SERVICE] Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('===============================================');
      console.log('[AUTH-SERVICE] Authentication Service Started');
      console.log('===============================================');
      console.log(`[AUTH-SERVICE] Server running on port ${PORT}`);
      console.log(`[AUTH-SERVICE] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[AUTH-SERVICE] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[AUTH-SERVICE] Service info: http://localhost:${PORT}/api/info`);
      console.log('===============================================');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n[AUTH-SERVICE] Received ${signal}. Graceful shutdown...`);
      server.close(() => {
        console.log('[AUTH-SERVICE] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('[AUTH-SERVICE] Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
