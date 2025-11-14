/**
 * GRC Ecosystem Service Router
 * Unified service routing and communication layer
 */

const axios = require('axios');
const { loadConfig } = require('./loader');

class ServiceRouter {
  constructor(serviceName, environment) {
    this.serviceName = serviceName;
    this.environment = environment || process.env.NODE_ENV || 'development';
    this.config = loadConfig(this.environment);
    this.serviceUrls = this.config.serviceUrls;
    this.timeout = 30000; // 30 seconds default timeout
  }

  /**
   * Get service URL by name
   * @param {string} targetService - Target service name
   * @returns {string} Service URL
   */
  getServiceUrl(targetService) {
    const url = this.serviceUrls[targetService];
    if (!url) {
      throw new Error(`Service URL not found: ${targetService}`);
    }
    return url;
  }

  /**
   * Make HTTP request to another service
   * @param {string} targetService - Target service name
   * @param {Object} options - Request options
   * @returns {Promise} Axios response
   */
  async request(targetService, options = {}) {
    const baseURL = this.getServiceUrl(targetService);
    const config = {
      baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `grc-${this.serviceName}-service`,
        'X-Source-Service': this.serviceName,
        'X-Request-ID': this.generateRequestId(),
        ...options.headers
      },
      ...options
    };

    // Add authorization if available
    if (options.token) {
      config.headers.Authorization = `Bearer ${options.token}`;
    }

    try {
      const response = await axios(config);
      return response;
    } catch (error) {
      this.handleRequestError(error, targetService, config);
      throw error;
    }
  }

  /**
   * GET request helper
   * @param {string} targetService - Target service name
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async get(targetService, endpoint, params = {}, options = {}) {
    const response = await this.request(targetService, {
      method: 'GET',
      url: endpoint,
      params,
      ...options
    });
    return response.data;
  }

  /**
   * POST request helper
   * @param {string} targetService - Target service name
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async post(targetService, endpoint, data = {}, options = {}) {
    const response = await this.request(targetService, {
      method: 'POST',
      url: endpoint,
      data,
      ...options
    });
    return response.data;
  }

  /**
   * PUT request helper
   * @param {string} targetService - Target service name
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async put(targetService, endpoint, data = {}, options = {}) {
    const response = await this.request(targetService, {
      method: 'PUT',
      url: endpoint,
      data,
      ...options
    });
    return response.data;
  }

  /**
   * DELETE request helper
   * @param {string} targetService - Target service name
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async delete(targetService, endpoint, options = {}) {
    const response = await this.request(targetService, {
      method: 'DELETE',
      url: endpoint,
      ...options
    });
    return response.data;
  }

  /**
   * Health check for target service
   * @param {string} targetService - Target service name
   * @returns {Promise} Health status
   */
  async healthCheck(targetService) {
    try {
      const healthEndpoint = this.config.services[targetService]?.health || '/health';
      const response = await this.get(targetService, healthEndpoint, {}, { timeout: 5000 });
      return {
        service: targetService,
        status: 'healthy',
        response: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: targetService,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Batch health check for multiple services
   * @param {Array} services - Array of service names
   * @returns {Promise} Health status for all services
   */
  async batchHealthCheck(services) {
    const healthChecks = services.map(service => this.healthCheck(service));
    return Promise.all(healthChecks);
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle request errors
   * @param {Error} error - Axios error
   * @param {string} targetService - Target service name
   * @param {Object} config - Request configuration
   */
  handleRequestError(error, targetService, config) {
    console.error(`❌ Service request failed:`, {
      service: targetService,
      url: config.baseURL + config.url,
      method: config.method,
      status: error.response?.status,
      message: error.message,
      requestId: config.headers['X-Request-ID']
    });
  }

  /**
   * Create circuit breaker for service calls
   * @param {string} targetService - Target service name
   * @param {Object} options - Circuit breaker options
   * @returns {Object} Circuit breaker instance
   */
  createCircuitBreaker(targetService, options = {}) {
    const defaultOptions = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000 // 1 minute
    };

    const config = { ...defaultOptions, ...options };
    let failures = 0;
    let lastFailureTime = null;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

    return {
      async call(operation) {
        if (state === 'OPEN') {
          if (Date.now() - lastFailureTime > config.resetTimeout) {
            state = 'HALF_OPEN';
          } else {
            throw new Error(`Circuit breaker is OPEN for service: ${targetService}`);
          }
        }

        try {
          const result = await operation();
          if (state === 'HALF_OPEN') {
            state = 'CLOSED';
            failures = 0;
          }
          return result;
        } catch (error) {
          failures++;
          lastFailureTime = Date.now();

          if (failures >= config.failureThreshold) {
            state = 'OPEN';
            console.error(`🚨 Circuit breaker OPENED for service: ${targetService}`);
          }

          throw error;
        }
      },

      getState() {
        return {
          state,
          failures,
          lastFailureTime,
          targetService
        };
      }
    };
  }
}

/**
 * Create service router instance
 * @param {string} serviceName - Name of the calling service
 * @param {string} environment - Environment name
 * @returns {ServiceRouter} Service router instance
 */
function createServiceRouter(serviceName, environment) {
  return new ServiceRouter(serviceName, environment);
}

/**
 * Initialize service communication infrastructure
 * @param {string} environment - Environment name
 * @returns {Promise} Initialization result
 */
async function initializeServiceCommunication(environment) {
  const config = loadConfig(environment);
  const services = Object.keys(config.services);
  
  console.log('🔧 Initializing service communication...');
  
  // Health check all services
  const router = createServiceRouter('initializer', environment);
  const healthResults = await router.batchHealthCheck(services);
  
  const healthyServices = healthResults.filter(result => result.status === 'healthy');
  const unhealthyServices = healthResults.filter(result => result.status === 'unhealthy');
  
  console.log(`✅ Healthy services: ${healthyServices.length}/${services.length}`);
  
  if (unhealthyServices.length > 0) {
    console.warn('⚠️  Unhealthy services:', unhealthyServices.map(s => s.service));
  }
  
  return {
    healthy: healthyServices,
    unhealthy: unhealthyServices,
    total: services.length
  };
}

module.exports = {
  ServiceRouter,
  createServiceRouter,
  initializeServiceCommunication
};