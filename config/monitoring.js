/**
 * Monitoring and Observability Configuration
 * Centralized configuration for metrics, logging, and health monitoring
 */

const { logger } = require('../utils/logger');

class MonitoringConfig {
  constructor() {
    this.metrics = {
      requests: new Map(),
      errors: new Map(),
      responseTime: [],
      activeConnections: 0
    };
    
    this.startMetricsCollection();
  }

  /**
   * Record request metrics
   */
  recordRequest(req, res, responseTime) {
    const key = `${req.method} ${req.route?.path || req.path}`;
    const current = this.metrics.requests.get(key) || { count: 0, totalTime: 0 };
    
    current.count++;
    current.totalTime += responseTime;
    current.avgTime = current.totalTime / current.count;
    
    this.metrics.requests.set(key, current);
    
    // Keep only last 1000 response times for percentile calculation
    this.metrics.responseTime.push(responseTime);
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  /**
   * Record error metrics
   */
  recordError(error, context = 'unknown') {
    const key = `${error.name || 'Error'}_${context}`;
    const current = this.metrics.errors.get(key) || 0;
    this.metrics.errors.set(key, current + 1);
    
    logger.error('Error recorded', {
      error: error.message,
      context,
      stack: error.stack
    });
  }

  /**
   * Get current metrics summary
   */
  getMetrics() {
    const responseTimes = [...this.metrics.responseTime].sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      requests: Object.fromEntries(this.metrics.requests),
      errors: Object.fromEntries(this.metrics.errors),
      responseTime: {
        count: responseTimes.length,
        avg: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        min: responseTimes[0] || 0,
        max: responseTimes[responseTimes.length - 1] || 0,
        p95: responseTimes[p95Index] || 0,
        p99: responseTimes[p99Index] || 0
      },
      activeConnections: this.metrics.activeConnections,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Start periodic metrics collection
   */
  startMetricsCollection() {
    setInterval(() => {
      const metrics = this.getMetrics();
      
      // Log metrics summary every 5 minutes
      logger.info('Metrics Summary', {
        totalRequests: Object.values(metrics.requests).reduce((sum, req) => sum + req.count, 0),
        totalErrors: Object.values(metrics.errors).reduce((sum, count) => sum + count, 0),
        avgResponseTime: metrics.responseTime.avg,
        p95ResponseTime: metrics.responseTime.p95,
        activeConnections: metrics.activeConnections
      });
      
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Middleware for request tracking
   */
  requestTrackingMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Track active connections
      this.metrics.activeConnections++;
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;
        this.recordRequest(req, res, responseTime);
        
        // Decrease active connections
        this.metrics.activeConnections--;
        
        // Add response time header
        res.set('X-Response-Time', `${responseTime}ms`);
        
        originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  /**
   * Error tracking middleware
   */
  errorTrackingMiddleware() {
    return (error, req, res, next) => {
      this.recordError(error, `${req.method} ${req.path}`);
      next(error);
    };
  }
}

// Health check configuration
const healthCheckConfig = {
  interval: 30000, // 30 seconds
  timeout: 5000,   // 5 seconds
  retries: 3,
  endpoints: [
    { name: 'database', check: () => require('../db/prisma').$queryRaw`SELECT 1` },
    { name: 'redis', check: () => require('ioredis').createClient(process.env.REDIS_URL).ping() }
  ]
};

// Alerting configuration
const alertingConfig = {
  thresholds: {
    errorRate: 0.05,        // 5% error rate
    responseTime: 2000,     // 2 seconds
    memoryUsage: 0.85,      // 85% memory usage
    cpuUsage: 0.80          // 80% CPU usage
  },
  channels: {
    email: process.env.ALERT_EMAIL,
    slack: process.env.SLACK_WEBHOOK_URL,
    sentry: process.env.SENTRY_DSN
  }
};

// Performance monitoring
const performanceConfig = {
  enableAPM: process.env.ENABLE_APM === 'true',
  sampleRate: parseFloat(process.env.APM_SAMPLE_RATE) || 0.1,
  enableTracing: process.env.ENABLE_TRACING === 'true',
  enableProfiling: process.env.ENABLE_PROFILING === 'true'
};

// Singleton instance
const monitoring = new MonitoringConfig();

module.exports = {
  MonitoringConfig,
  monitoring,
  healthCheckConfig,
  alertingConfig,
  performanceConfig
};
