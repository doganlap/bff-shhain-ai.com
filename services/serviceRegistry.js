/**
 * Service Registry and Discovery Mechanism
 * Manages microservice endpoints and health monitoring
 */

const axios = require('axios');
const { logger } = require('../utils/logger');

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimeout = 5000; // 5 seconds
    this.retryAttempts = 3;
    this.circuitBreaker = new Map();
    
    this.initializeServices();
    this.startHealthChecking();
  }

  /**
   * Initialize services from environment variables
   */
  initializeServices() {
    const serviceConfigs = {
      'grc-api': {
        url: process.env.GRC_API_URL || 'http://localhost:3006',
        healthPath: '/health',
        critical: true,
        timeout: 5000
      },
      'auth-service': {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        healthPath: '/health',
        critical: true,
        timeout: 5000
      },
      'partner-service': {
        url: process.env.PARTNER_SERVICE_URL || 'http://localhost:3005',
        healthPath: '/health',
        critical: false,
        timeout: 5000
      },
      'notification-service': {
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
        healthPath: '/health',
        critical: false,
        timeout: 5000
      },
      'ai-scheduler-service': {
        url: process.env.AI_SCHEDULER_SERVICE_URL || 'http://localhost:3002',
        healthPath: '/health',
        critical: false,
        timeout: 10000
      },
      'rag-service': {
        url: process.env.RAG_SERVICE_URL || 'http://localhost:3003',
        healthPath: '/health',
        critical: false,
        timeout: 10000
      },
      'regulatory-service': {
        url: process.env.REGULATORY_SERVICE_URL || 'http://localhost:3008',
        healthPath: '/health',
        critical: false,
        timeout: 5000
      }
    };

    Object.entries(serviceConfigs).forEach(([name, config]) => {
      this.registerService(name, config);
    });

    logger.info(`Service Registry initialized with ${this.services.size} services`);
  }

  /**
   * Register a new service
   */
  registerService(name, config) {
    const service = {
      name,
      url: config.url,
      healthPath: config.healthPath || '/health',
      critical: config.critical || false,
      timeout: config.timeout || 5000,
      status: 'unknown',
      lastCheck: null,
      lastSuccess: null,
      failureCount: 0,
      responseTime: null,
      metadata: config.metadata || {}
    };

    this.services.set(name, service);
    this.circuitBreaker.set(name, { state: 'closed', failures: 0, lastFailure: null });
    
    logger.info(`Registered service: ${name} at ${config.url}`);
  }

  /**
   * Get service URL with circuit breaker logic
   */
  getServiceUrl(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in registry`);
    }

    const breaker = this.circuitBreaker.get(serviceName);
    
    // Check circuit breaker state
    if (breaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailure;
      const cooldownPeriod = 60000; // 1 minute
      
      if (timeSinceLastFailure < cooldownPeriod) {
        throw new Error(`Service ${serviceName} is currently unavailable (circuit breaker open)`);
      } else {
        // Try to close the circuit breaker
        breaker.state = 'half-open';
      }
    }

    return service.url;
  }

  /**
   * Get all services with their status
   */
  getAllServices() {
    const services = {};
    this.services.forEach((service, name) => {
      services[name] = {
        url: service.url,
        status: service.status,
        critical: service.critical,
        lastCheck: service.lastCheck,
        lastSuccess: service.lastSuccess,
        failureCount: service.failureCount,
        responseTime: service.responseTime,
        circuitBreakerState: this.circuitBreaker.get(name).state
      };
    });
    return services;
  }

  /**
   * Get healthy services only
   */
  getHealthyServices() {
    const healthy = {};
    this.services.forEach((service, name) => {
      if (service.status === 'healthy') {
        healthy[name] = service.url;
      }
    });
    return healthy;
  }

  /**
   * Check health of a single service
   */
  async checkServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return false;

    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${service.url}${service.healthPath}`, {
        timeout: service.timeout,
        validateStatus: (status) => status === 200
      });

      const responseTime = Date.now() - startTime;
      
      // Update service status
      service.status = 'healthy';
      service.lastCheck = new Date();
      service.lastSuccess = new Date();
      service.failureCount = 0;
      service.responseTime = responseTime;

      // Reset circuit breaker
      const breaker = this.circuitBreaker.get(serviceName);
      breaker.state = 'closed';
      breaker.failures = 0;

      logger.debug(`Health check passed for ${serviceName} (${responseTime}ms)`);
      return true;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Update service status
      service.status = 'unhealthy';
      service.lastCheck = new Date();
      service.failureCount++;
      service.responseTime = responseTime;

      // Update circuit breaker
      const breaker = this.circuitBreaker.get(serviceName);
      breaker.failures++;
      breaker.lastFailure = Date.now();

      // Open circuit breaker after 3 failures
      if (breaker.failures >= 3) {
        breaker.state = 'open';
        logger.warn(`Circuit breaker opened for ${serviceName} after ${breaker.failures} failures`);
      }

      logger.error(`Health check failed for ${serviceName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Start periodic health checking
   */
  startHealthChecking() {
    setInterval(async () => {
      const promises = Array.from(this.services.keys()).map(serviceName =>
        this.checkServiceHealth(serviceName)
      );

      await Promise.allSettled(promises);
      
      // Log summary
      const healthy = Array.from(this.services.values()).filter(s => s.status === 'healthy').length;
      const total = this.services.size;
      
      if (healthy < total) {
        logger.warn(`Health check summary: ${healthy}/${total} services healthy`);
      } else {
        logger.debug(`Health check summary: ${healthy}/${total} services healthy`);
      }
      
    }, this.healthCheckInterval);

    logger.info(`Started health checking with ${this.healthCheckInterval}ms interval`);
  }

  /**
   * Make a request to a service with retry logic
   */
  async makeServiceRequest(serviceName, path, options = {}) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${this.getServiceUrl(serviceName)}${path}`;
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios({
          url,
          timeout: service.timeout,
          ...options
        });

        // Reset failure count on success
        service.failureCount = 0;
        const breaker = this.circuitBreaker.get(serviceName);
        if (breaker.state === 'half-open') {
          breaker.state = 'closed';
          breaker.failures = 0;
        }

        return response;

      } catch (error) {
        lastError = error;
        service.failureCount++;
        
        logger.warn(`Request to ${serviceName} failed (attempt ${attempt}/${this.retryAttempts}): ${error.message}`);
        
        if (attempt < this.retryAttempts) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get service registry status
   */
  getRegistryStatus() {
    const services = this.getAllServices();
    const total = Object.keys(services).length;
    const healthy = Object.values(services).filter(s => s.status === 'healthy').length;
    const critical = Object.values(services).filter(s => s.critical).length;
    const criticalHealthy = Object.values(services).filter(s => s.critical && s.status === 'healthy').length;

    return {
      status: criticalHealthy === critical ? 'healthy' : 'degraded',
      services: services,
      summary: {
        total,
        healthy,
        unhealthy: total - healthy,
        critical,
        criticalHealthy
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const serviceRegistry = new ServiceRegistry();

module.exports = {
  ServiceRegistry,
  serviceRegistry
};
