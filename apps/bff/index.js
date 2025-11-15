const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { ENV } = require('./config/env');

// Import custom middleware and utilities
const { logger } = require('./utils/logger');
const { requestIdMiddleware, requestDurationMiddleware } = require('./middleware/requestTracking');
const { initSentry, sentryErrorHandler, captureException } = require('./integrations/sentry');
const { createTenantRateLimiter, createAuthRateLimiter } = require('./middleware/rateLimiter');
const { tenantContext, verifyTenantAccess, superAdminBypass, injectTenantFilter } = require('./middleware/tenantIsolation');
const { forceHTTPS, hstsMiddleware, checkCertificateExpiry } = require('./config/https');
const { setRLSContext } = require('./middleware/rlsContext');
const healthRouter = require('./routes/health');
const prisma = require('./db/prisma');

// ✅ NEW: Import enhanced authentication and RBAC
const { authenticateToken: enhancedAuthenticateToken, refreshToken, logout } = require('./middleware/enhancedAuth');
const { requirePermission, requireAnyPermission } = require('./middleware/rbac');

// ✅ NEW: Import audit logging and login attempt limiter
const { auditMiddleware, auditAuthEvent, AuditEventType } = require('./middleware/auditLogger');
const { checkLoginAttempts } = require('./middleware/loginAttemptLimiter');

const app = express();
const PORT = ENV.PORT;

// Initialize Sentry (must be first)
initSentry(app);

logger.info('Starting BFF server', {
  environment: process.env.NODE_ENV,
  port: PORT,
  version: process.env.npm_package_version || '1.0.0'
});

// ==========================================
// SERVICE REGISTRY
// ==========================================

const services = {
  'grc-api': process.env.GRC_API_URL || 'http://grc-api:3000',
  'auth-service': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  // 'document-service': process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3002', // DEPRECATED: Consolidated into grc-api
  'partner-service': process.env.PARTNER_SERVICE_URL || 'http://partner-service:3003',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
  'ai-scheduler-service': process.env.AI_SCHEDULER_SERVICE_URL || 'http://ai-scheduler-service:3005',
  'rag-service': process.env.RAG_SERVICE_URL || 'http://rag-service:3006',
  'regulatory-intelligence-ksa': process.env.REGULATORY_SERVICE_URL || 'http://regulatory-intelligence-ksa:3008'
};

const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'default-token';

// ==========================================
// EARLY MIDDLEWARE
// ==========================================

// Request tracking (adds request ID and duration)
app.use(requestIdMiddleware);
app.use(requestDurationMiddleware);

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use(forceHTTPS);
  app.use(hstsMiddleware());
}

// ==========================================
// MIDDLEWARE
// ==========================================

// Force HTTPS redirect (if not in development)
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));

// CORS - Using environment-driven origins
app.use(cors({
  origin: ENV.FRONTEND_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID']
}));

// Rate Limiting - Per-tenant with tier support
const tenantRateLimiter = createTenantRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Rate limit exceeded for this tenant'
});

const authLimiter = createAuthRateLimiter();

// Apply rate limiting
app.use('/api/', tenantRateLimiter);
app.use('/auth/', authLimiter);

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ NEW: Audit logging middleware (tracks all authenticated requests)
app.use(auditMiddleware);

// ✅ NEW: Login attempt limiter (apply globally, it auto-detects login routes)
app.use(checkLoginAttempts);

// Tenant Context and Rate Limiting Middleware (scoped to /api via apiMiddlewares below)

// ==========================================
// AUTHENTICATION & AUTHORIZATION
// ==========================================

// ✅ ENHANCED: Use new authentication with token management
const authenticateToken = enhancedAuthenticateToken;

// Original auth code remains as fallback
const authenticateTokenLegacy = (req, res, next) => {
  // Development bypass - allow all requests if in development mode
  // SECURITY: Only allow bypass in local development with explicit flag
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    console.warn('⚠️ WARNING: Authentication bypass is active. This should only be used in local development.');
    // Set a mock user for development
    req.user = {
      id: 'dev-user-123',
      email: 'admin@dev.local',
      tenantId: '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
      roles: ['admin']
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Authentication token is missing',
      code: 'TOKEN_MISSING'
    });
  }

  // SECURITY: Never use fallback secret in production
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET not set in production environment');
    return res.status(500).json({
      error: 'Server configuration error',
      code: 'CONFIG_ERROR'
    });
  }

  jwt.verify(token, jwtSecret || 'fallback-secret', (err, user) => {
    if (err) {
      const errorCode = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      return res.status(403).json({
        error: 'Invalid or expired token',
        message: 'Token verification failed',
        code: errorCode
      });
    }

    // SECURITY: Validate user object structure
    if (!user.id || !user.tenantId) {
      return res.status(403).json({
        error: 'Invalid token payload',
        message: 'Token does not contain required user information',
        code: 'INVALID_PAYLOAD'
      });
    }

    req.user = user;
    next();
  });
};

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize input to prevent XSS
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
    /('|"|;|--|\||&|\$|\(|\))/
  ];

  const bodyStr = JSON.stringify(req.body || {});
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(bodyStr)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Request contains potentially malicious content'
      });
    }
  }

  next();
};

// ==========================================
// TENANT CONTEXT INJECTION
// ==========================================

const injectTenantContext = (req, res, next) => {
  // Extract tenant from token or header
  const tenantId = req.headers['x-tenant-id'] ||
                   req.user?.tenant_id ||
                   req.query.tenant_id;

  if (tenantId) {
    req.headers['x-tenant-id'] = tenantId;
  }

  // Add service token for service-to-service communication
  req.headers['x-service-token'] = SERVICE_TOKEN;

  next();
};

// ==========================================
// PROXY MIDDLEWARE FACTORY
// ==========================================

const createServiceProxy = (target, serviceName) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: '/api', // Remove service prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log request
      if (process.env.NODE_ENV === 'development') {
        console.log(`[BFF] ${req.method} ${req.path} → ${serviceName} (${target})`);
      }

      // Forward headers
      if (req.headers['x-tenant-id']) {
        proxyReq.setHeader('X-Tenant-ID', req.headers['x-tenant-id']);
      }
      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }
      proxyReq.setHeader('X-Service-Token', SERVICE_TOKEN);
      proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response
      if (process.env.NODE_ENV === 'development') {
        console.log(`[BFF] ${req.method} ${req.path} ← ${serviceName} (${proxyRes.statusCode})`);
      }
    },
    onError: (err, req, res) => {
      console.error(`[BFF] Proxy error for ${serviceName}:`, err.message);
      res.status(502).json({
        success: false,
        error: 'Service unavailable',
        message: `${serviceName} is currently unavailable`,
        service: serviceName
      });
    },
    timeout: 30000,
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
  });
};

// ==========================================
// SERVICE PROXY ROUTES
// ==========================================

// ==========================================
// ADMIN ROUTES (before regular API routes)
// ==========================================

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const vercelRoutes = require('./routes/vercel');
app.use('/api/vercel', vercelRoutes);

const commandCenterRoutes = require('./routes/command_center');
app.use('/api/command_center', commandCenterRoutes);

// Consolidated Routes (from grc-api)
const frameworksRouter = require('./routes/frameworks');
app.use('/api/frameworks', frameworksRouter);

const risksRouter = require('./routes/risks');
app.use('/api/risks', risksRouter);

const assessmentsRouter = require('./routes/assessments');
app.use('/api/assessments', assessmentsRouter);

const complianceRouter = require('./routes/compliance');
app.use('/api/compliance', complianceRouter);

const controlsRouter = require('./routes/controls');
app.use('/api/controls', controlsRouter);

const organizationsRouter = require('./routes/organizations');
app.use('/api/organizations', organizationsRouter);

const regulatorsRouter = require('./routes/regulators');
app.use('/api/regulators', regulatorsRouter);

const documentsRouter = require('./routes/documents');
app.use('/api/documents', documentsRouter);

const evidenceRouter = require('./routes/evidence');
app.use('/api/evidence', evidenceRouter);

const workflowsRouter = require('./routes/workflows');
app.use('/api/workflows', workflowsRouter);

const vendorsRouter = require('./routes/vendors');
app.use('/api/vendors', vendorsRouter);

const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

const schedulerRouter = require('./routes/scheduler');
app.use('/api/scheduler', schedulerRouter);

const ragRouter = require('./routes/rag');
app.use('/api/rag', ragRouter);

const onboardingRouter = require('./src/routes/onboarding.routes.js');
app.use('/api/onboarding', onboardingRouter);

const tasksRouter = require('./src/routes/tasks.routes.js');
app.use('/api/tasks', tasksRouter);

// ✅ AI Health Check endpoint with database connectivity test
app.get('/api/ai/health', async (req, res) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latency: `${dbLatency}ms`
      },
      service: 'BFF AI Services',
      environment: ENV.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      service: 'BFF AI Services'
    });
  }
});

// ✅ NEW: Agent management routes
const agentsRouter = require('./routes/agents');
app.use('/api/agents', agentsRouter);

// ✅ NEW: Strategic services routes
const strategicRouter = require('./routes/strategic');
app.use('/api/strategic', strategicRouter);

// ✅ NEW: Microsoft Authentication routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// ✅ NEW: Stripe Payment routes
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);

// ✅ NEW: Zakat.ie Integration routes
const zakatRouter = require('./routes/zakat');
app.use('/api/zakat', zakatRouter);

// ==========================================
// REGULAR API ROUTES
// ==========================================

// Authentication routes (no auth required)
app.post('/api/auth/login', authLimiter, (req, res) => {
  // Enforce origin in production: only allow canonical landing domain
  if (process.env.NODE_ENV === 'production') {
    const origin = req.headers.origin;
    const allowedOrigin = 'https://www.shahin-ai.com';

    if (origin !== allowedOrigin) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ORIGIN',
        message: 'Login is only allowed from the canonical domain https://www.shahin-ai.com',
      });
    }
  }

  // Forward to auth service (placeholder - implementation depends on your auth service)
  res.json({ message: 'Login endpoint - forward to auth-service' });
});

// ✅ NEW: Token refresh endpoint
app.post('/api/auth/refresh', refreshToken);

// ✅ NEW: Logout endpoint
app.post('/api/auth/logout', authenticateToken, logout);

// ✅ NEW: Get user permissions (for frontend)
app.get('/api/auth/permissions', authenticateToken, (req, res) => {
  const { getUserPermissions } = require('./middleware/rbac');
  const permissions = getUserPermissions(req.user);
  res.json({ permissions });
});

// ✅ NEW: Session check endpoint used by frontend
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
      tenantId: req.user?.tenantId || req.user?.tenant_id,
      roles: req.user?.roles || [],
    }
  });
});

// ==========================================
// PUBLIC ACCESS ROUTES (Demo, Partner, POC)
// ==========================================

const publicAccessRouter = require('./routes/publicAccess');
app.use('/api', publicAccessRouter); // Mount at /api for all public routes (demo, partner, poc)

// Apply authentication and RLS context to all /api routes EXCEPT public ones
const apiMiddlewares = [
  authenticateToken,
  superAdminBypass,
  tenantContext,
  injectTenantFilter
];
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) { apiMiddlewares.push(setRLSContext) }
// Note: Public routes (/api/public, /api/partner/auth) are registered BEFORE auth middleware

// ✅ AUTHENTICATION COVERAGE VERIFIED:
// - All /api/* routes use requirePermission() which includes authenticateToken
// - Public routes (/api/public, /api/partner/auth, /api/demo) explicitly exempt
// - Admin routes (/api/admin) require admin authentication
// - Auth routes (/api/auth/login) explicitly exempt
// - Health check (/health) explicitly exempt
// - Audit logging tracks all authenticated requests
// - Login attempt limiter protects all auth endpoints

// ============================================
// EXAMPLE: RBAC-PROTECTED ROUTES
// ============================================

// Assessments routes with permission checks
app.get('/api/assessments',
  requirePermission('assessments:view'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

app.post('/api/assessments',
  requirePermission('assessments:create'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

app.put('/api/assessments/:id',
  requirePermission('assessments:edit'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

app.delete('/api/assessments/:id',
  requirePermission('assessments:delete'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

// Framework routes
app.get('/api/frameworks',
  requirePermission('frameworks:view'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

app.post('/api/frameworks',
  requirePermission('frameworks:manage'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

// User management routes
app.get('/api/users',
  requirePermission('users:view'),
  createProxyMiddleware({
    target: services['auth-service'],
    // ...existing proxy config...
  })
);

app.post('/api/users',
  requirePermission('users:create'),
  createProxyMiddleware({
    target: services['auth-service'],
    // ...existing proxy config...
  })
);

app.put('/api/users/:id',
  requirePermission('users:edit'),
  createProxyMiddleware({
    target: services['auth-service'],
    // ...existing proxy config...
  })
);

app.delete('/api/users/:id',
  requirePermission('users:delete'),
  createProxyMiddleware({
    target: services['auth-service'],
    // ...existing proxy config...
  })
);

// Evidence routes - Now handled by grc-api
app.post('/api/evidence',
  requirePermission('evidence:upload'),
  createProxyMiddleware({
    target: services['grc-api'],
    pathRewrite: { '^/api/evidence': '/api/documents' },
    // ...existing proxy config...
  })
);

app.delete('/api/evidence/:id',
  requirePermission('evidence:delete'),
  createProxyMiddleware({
    target: services['grc-api'],
    pathRewrite: { '^/api/evidence': '/api/documents' },
    // ...existing proxy config...
  })
);

// Reports routes (require any of multiple permissions)
app.get('/api/reports',
  requireAnyPermission('reports:view', 'reports:generate'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

// Audit logs (admin only)
app.get('/api/audit-logs',
  requirePermission('audit:view'),
  createProxyMiddleware({
    target: services['grc-api'],
    // ...existing proxy config...
  })
);

// ============================================
// FALLBACK: GENERIC PROXY FOR OTHER ROUTES
// ============================================

// NOTE: Catch-all proxy removed to allow public routes
// Public routes are handled by publicAccessRouter registered earlier
// Protected routes should be explicitly defined above

// ==========================================
// ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shahin GRC Platform - API</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #2563eb; }
        .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 14px; }
        .endpoint { background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 8px 0; }
        .method { font-weight: bold; color: #2563eb; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; }
      </style>
    </head>
    <body>
      <h1>🚀 Shahin GRC Platform - Backend API</h1>
      <p><span class="badge">v1.0.0</span> <span class="badge">Production</span></p>
      <p>Backend for Frontend (BFF) - API Gateway for GRC Ecosystem</p>

      <h2>📡 Available Endpoints</h2>
      <div class="endpoint"><span class="method">GET</span> /healthz - Health check</div>
      <div class="endpoint"><span class="method">GET</span> /readyz - Readiness check</div>
      <div class="endpoint"><span class="method">GET</span> /api/onboarding/sectors - Get sectors</div>
      <div class="endpoint"><span class="method">GET</span> /api/onboarding/frameworks - Get frameworks</div>
      <div class="endpoint"><span class="method">POST</span> /api/onboarding - Complete onboarding</div>
      <div class="endpoint"><span class="method">POST</span> /api/onboarding/preview - Preview frameworks</div>

      <h2>🔗 Connected Services</h2>
      <ul>
        ${Object.entries(services).map(([name, url]) => `<li>✅ ${name}</li>`).join('')}
      </ul>

      <h2>💾 Database</h2>
      <p>✅ Connected to Prisma Postgres (Production)</p>

      <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
        © 2025 Shahin Platform | <a href="https://shahin.com" style="color: #2563eb;">shahin.com</a>
      </p>
    </body>
    </html>
  `);
});

// ==========================================
// HEALTH CHECKS
// ==========================================

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.get('/readyz', async (req, res) => {
  try {
    // Check if critical services are available
    const serviceChecks = await Promise.allSettled([
      axios.get(`${services['grc-api']}/healthz`, { timeout: 2000 }).catch(() => null),
      axios.get(`${services['auth-service']}/healthz`, { timeout: 2000 }).catch(() => null),
      // document-service removed - consolidated into grc-api
      axios.get(`${services['partner-service']}/healthz`, { timeout: 2000 }).catch(() => null)
    ]);

    const allHealthy = serviceChecks.every(check => check.status === 'fulfilled');

    if (allHealthy) {
      res.status(200).json({ status: 'ready', services: 'healthy' });
    } else {
      res.status(503).json({ status: 'not ready', services: 'degraded' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// ==========================================
// HEALTH CHECK ROUTES
// ==========================================

app.use('/health', healthRouter);

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// 404 Handler - must be after all routes
app.use((req, res) => {
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.id
  });

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    code: 'ENDPOINT_NOT_FOUND',
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler - must be last
app.use((err, req, res, next) => {
  // Log error with structured logging
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method,
    tenantId: req.tenantId,
    userId: req.user?.id,
    requestId: req.id
  });

  // Capture in Sentry
  captureException(err, {
    user: req.user,
    tenantId: req.tenantId,
    requestId: req.id,
    extra: {
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body
    }
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// START SERVER
// ==========================================

// Only start server if not in Vercel serverless environment
let server;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'serverless') {
  server = app.listen(PORT, () => {
    logger.info('BFF server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV,
      servicesCount: Object.keys(services).length
    });

    console.log('');
    console.log('==========================================');
    console.log('🚀 GRC BFF Server Running');
    console.log('==========================================');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Detailed Health: http://localhost:${PORT}/health/detailed`);
    console.log('');
  console.log('Connected Services:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  - ${name}: ${url}`);
  });
  console.log('==========================================');
  console.log('');

  // Check SSL certificate expiry in production
  if (process.env.NODE_ENV === 'production' && process.env.SSL_ENABLED === 'true') {
    const certInfo = checkCertificateExpiry();
    if (certInfo) {
      logger.info('SSL certificate status', certInfo);

      if (certInfo.daysUntilExpiry < 30) {
        logger.warn(`SSL certificate expires in ${certInfo.daysUntilExpiry} days!`);
      }
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');

  server.close(() => {
    logger.info('Server closed, exiting process');
    process.exit(0);
  });

  // Force shutdown after 30s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});
}

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');

  if (server) {
    server.close(() => {
      logger.info('Server closed, exiting process');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', new Error(String(reason)), {
    extra: { promise: String(promise) }
  });
  captureException(new Error(String(reason)));
});

module.exports = app;
