/**
 * CORS Configuration for BFF
 * Centralized CORS settings for all environments
 */

const { ENV } = require('./env');

// Parse frontend origins from environment variable
const getFrontendOrigins = () => {
  const origins = ENV.FRONTEND_ORIGINS || 'http://localhost:5173';
  return origins.split(',').map(origin => origin.trim());
};

// Development CORS configuration
const developmentCors = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://172.21.160.1:5173',
    ...getFrontendOrigins()
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Tenant-Id',
    'X-User-Id',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Response-Time'],
  maxAge: 86400 // 24 hours
};

// Production CORS configuration
const productionCors = {
  origin: [
    'https://shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://app.shahin-ai.com',
    'https://app-shahin-ai-com.vercel.app',
    'https://bff-shahin-ai-com.vercel.app',
    ...getFrontendOrigins()
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Tenant-Id',
    'X-User-Id',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Response-Time'],
  maxAge: 86400 // 24 hours
};

// Staging CORS configuration
const stagingCors = {
  origin: [
    'https://staging.shahin-ai.com',
    'https://app-shahin-ai-staging.vercel.app',
    'https://bff-shahin-ai-staging.vercel.app',
    ...getFrontendOrigins()
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Tenant-Id',
    'X-User-Id',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Response-Time'],
  maxAge: 86400 // 24 hours
};

// Get CORS configuration based on environment
const getCorsConfig = () => {
  const env = ENV.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionCors;
    case 'staging':
      return stagingCors;
    case 'development':
    default:
      return developmentCors;
  }
};

// CORS middleware with logging
const corsWithLogging = (corsOptions) => {
  return (req, res, next) => {
    const origin = req.get('Origin');
    const allowedOrigins = corsOptions.origin;
    
    // Log CORS requests for debugging
    if (origin) {
      const isAllowed = Array.isArray(allowedOrigins) 
        ? allowedOrigins.includes(origin)
        : allowedOrigins === origin || allowedOrigins === true;
        
      console.log(`CORS Request: ${req.method} ${req.path} from ${origin} - ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
      
      if (!isAllowed && ENV.NODE_ENV !== 'development') {
        console.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      }
    }
    
    next();
  };
};

module.exports = {
  getCorsConfig,
  corsWithLogging,
  developmentCors,
  productionCors,
  stagingCors
};
