/**
 * GRC Ecosystem Unified Configuration
 * Centralized configuration for all services and environments
 */

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  
  // Service Registry - Standardized Ports
  services: {
    // Core API Services
    grc_api: {
      name: 'grc-api',
      port: process.env.GRC_API_PORT || 3000,
      host: process.env.GRC_API_HOST || 'localhost',
      health: '/health'
    },
    
    // Backend for Frontend
    bff: {
      name: 'bff',
      port: process.env.BFF_PORT || 5001,
      host: process.env.BFF_HOST || 'localhost',
      health: '/health'
    },
    
    // Authentication Service
    auth: {
      name: 'auth-service',
      port: process.env.AUTH_SERVICE_PORT || 3001,
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // Document Processing Service
    document: {
      name: 'document-service',
      port: process.env.DOCUMENT_SERVICE_PORT || 3002,
      host: process.env.DOCUMENT_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // Partner Management Service
    partner: {
      name: 'partner-service',
      port: process.env.PARTNER_SERVICE_PORT || 3003,
      host: process.env.PARTNER_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // Notification Service
    notification: {
      name: 'notification-service',
      port: process.env.NOTIFICATION_SERVICE_PORT || 3004,
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // AI Scheduler Service
    ai_scheduler: {
      name: 'ai-scheduler-service',
      port: process.env.AI_SCHEDULER_SERVICE_PORT || 3005,
      host: process.env.AI_SCHEDULER_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // RAG Service
    rag: {
      name: 'rag-service',
      port: process.env.RAG_SERVICE_PORT || 3006,
      host: process.env.RAG_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // Regulatory Intelligence Service
    regulatory: {
      name: 'regulatory-intelligence-service',
      port: process.env.REGULATORY_SERVICE_PORT || 3008,
      host: process.env.REGULATORY_SERVICE_HOST || 'localhost',
      health: '/health'
    },
    
    // Web Frontend
    web: {
      name: 'web',
      port: process.env.WEB_PORT || 5173,
      host: process.env.WEB_HOST || 'localhost',
      health: '/health'
    }
  },
  
  // Database Configuration
  database: {
    // Primary Database (Unified Approach)
    primary: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'grc_ecosystem',
      user: process.env.DB_USER || 'grc_user',
      password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
      },
      ssl: process.env.DB_SSL === 'true'
    },
    
    // Multi-database Architecture (Alternative)
    multi: {
      compliance: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.COMPLIANCE_DB || 'shahin_ksa_compliance',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      },
      finance: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.FINANCE_DB || 'grc_master',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      },
      auth: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.AUTH_DB || 'shahin_access_control',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      }
    }
  },
  
  // Authentication Configuration
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'grc_jwt_secret_key_ecosystem_2024_secure_change_in_production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'grc_jwt_refresh_secret_ecosystem_2024',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    bypass: process.env.BYPASS_AUTH === 'true',
    rateLimit: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10
    }
  },
  
  // Security Configuration
  security: {
    cors: {
      enabled: process.env.ENABLE_CORS !== 'false',
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Id']
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    helmet: {
      enabled: process.env.ENABLE_HELMET !== 'false'
    }
  },
  
  // Service URLs (Environment-specific)
  urls: {
    development: {
      grc_api: 'http://localhost:3000',
      bff: 'http://localhost:5001',
      auth: 'http://localhost:3001',
      document: 'http://localhost:3002',
      partner: 'http://localhost:3003',
      notification: 'http://localhost:3004',
      ai_scheduler: 'http://localhost:3005',
      rag: 'http://localhost:3006',
      regulatory: 'http://localhost:3008',
      web: 'http://localhost:5173'
    },
    docker: {
      grc_api: 'http://grc-api:3000',
      bff: 'http://bff:5001',
      auth: 'http://auth-service:3001',
      document: 'http://document-service:3002',
      partner: 'http://partner-service:3003',
      notification: 'http://notification-service:3004',
      ai_scheduler: 'http://ai-scheduler-service:3005',
      rag: 'http://rag-service:3006',
      regulatory: 'http://regulatory-intelligence-service:3008',
      web: 'http://web:5173'
    },
    production: {
      grc_api: process.env.GRC_API_URL || 'https://api.grc-ecosystem.com',
      bff: process.env.BFF_URL || 'https://bff.grc-ecosystem.com',
      auth: process.env.AUTH_SERVICE_URL || 'https://auth.grc-ecosystem.com',
      document: process.env.DOCUMENT_SERVICE_URL || 'https://docs.grc-ecosystem.com',
      partner: process.env.PARTNER_SERVICE_URL || 'https://partners.grc-ecosystem.com',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'https://notifications.grc-ecosystem.com',
      ai_scheduler: process.env.AI_SCHEDULER_SERVICE_URL || 'https://ai.grc-ecosystem.com',
      rag: process.env.RAG_SERVICE_URL || 'https://rag.grc-ecosystem.com',
      regulatory: process.env.REGULATORY_SERVICE_URL || 'https://regulatory.grc-ecosystem.com',
      web: process.env.WEB_URL || 'https://grc-ecosystem.com'
    }
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
  },
  
  // Notification Configuration
  notifications: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || 'noreply@grc-system.com'
    },
    emailTracking: process.env.EMAIL_TRACKING === 'true'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    requestDuration: process.env.LOG_REQUEST_DURATION === 'true'
  },
  
  // Feature Flags
  features: {
    multiTenancy: process.env.ENABLE_MULTI_TENANCY === 'true',
    microsoftAuth: process.env.ENABLE_MICROSOFT_AUTH === 'true',
    aiFeatures: process.env.ENABLE_AI_FEATURES !== 'false',
    notifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    regulatoryIntelligence: process.env.ENABLE_REGULATORY_INTELLIGENCE !== 'false',
    ragService: process.env.ENABLE_RAG_SERVICE !== 'false'
  }
};

// Environment-specific configuration loader
const getConfig = (environment = config.env) => {
  const baseConfig = { ...config };
  
  // Merge environment-specific URLs
  if (config.urls[environment]) {
    baseConfig.serviceUrls = config.urls[environment];
  } else {
    baseConfig.serviceUrls = config.urls.development;
  }
  
  return baseConfig;
};

// Service configuration helper
const getServiceConfig = (serviceName, environment = config.env) => {
  const currentConfig = getConfig(environment);
  const service = currentConfig.services[serviceName];
  
  if (!service) {
    throw new Error(`Service '${serviceName}' not found in configuration`);
  }
  
  return {
    ...service,
    url: currentConfig.serviceUrls[serviceName],
    database: currentConfig.database.primary,
    auth: currentConfig.auth,
    security: currentConfig.security
  };
};

module.exports = {
  config,
  getConfig,
  getServiceConfig
};