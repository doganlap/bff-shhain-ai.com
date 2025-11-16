import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security middleware for shahin-ai.com domains
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://grc-backend.shahin-ai.com",
        "wss://grc-backend.shahin-ai.com",
        "https://www.shahin-ai.com",
        "https://shahin-ai.com",
        "https://grc.shahin-ai.com",
        "https://bff-shahin-ai-com.vercel.app"
      ]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration for shahin-ai.com domains
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5177',
    'https://app.shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://shahin-ai.com',
    'https://grc.shahin-ai.com',
    'https://grc-backend.shahin-ai.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'shahin-ai-grc-backend',
    version: '1.0.0'
  });
});


// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Shahin AI GRC API is working!',
    timestamp: new Date().toISOString(),
    domain: 'shahin-ai.com'
  });
});

app.get('/api/regulators/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRegulators: 3,
      activeRegulators: 3,
      totalPublications: 0,
      inactiveRegulators: 0
    }
  });
});

app.get('/api/regulators', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'SEC', type: 'federal', isActive: true },
      { id: 2, name: 'FINRA', type: 'self_regulatory', isActive: true },
      { id: 3, name: 'CFTC', type: 'federal', isActive: true }
    ]
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple auth for testing (replace with real auth)
  if (email === 'admin@shahin-ai.com' && password === 'admin123') {
    res.json({
      token: 'test-jwt-token',
      user: {
        id: 1,
        email: 'admin@shahin-ai.com',
        name: 'Admin User',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
      code: 'AUTH_FAILED'
    });
  }
});

// Users routes
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Admin User', email: 'admin@shahin-ai.com', role: 'admin' },
    { id: 2, name: 'Manager User', email: 'manager@shahin-ai.com', role: 'manager' },
    { id: 3, name: 'User One', email: 'user1@shahin-ai.com', role: 'user' }
  ]);
});

// Dashboard data
app.get('/api/dashboard', (req, res) => {
  res.json({
    totalAssessments: 45,
    completedAssessments: 32,
    pendingAssessments: 13,
    complianceScore: 87,
    riskScore: 23,
    recentActivities: [
      { id: 1, action: 'Assessment completed', user: 'Admin User', timestamp: new Date().toISOString() },
      { id: 2, action: 'New control added', user: 'Manager User', timestamp: new Date().toISOString() },
      { id: 3, action: 'Compliance report generated', user: 'System', timestamp: new Date().toISOString() }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

export default app;