# GRC Ecosystem Unified Configuration

This directory contains the unified configuration system for the GRC Ecosystem. The configuration system provides standardized, environment-specific settings for all services in the ecosystem.

## 📁 Configuration Files

### Core Configuration Files

- **`ecosystem.config.js`** - Main configuration definition with all service settings, database configuration, authentication, and feature flags
- **`loader.js`** - Configuration loading utility with validation and environment file generation
- **`serviceRouter.js`** - Service-to-service communication layer with health checks and circuit breakers

### Environment Templates

- **`.env.unified`** - Template file with all available configuration options
- **Service-specific `.env` files** - Generated in each service directory

## 🚀 Quick Start

### 1. Apply Unified Configuration

```bash
# Apply configuration to all services for development environment
node scripts/setup-unified-config.js development

# For production environment
node scripts/setup-unified-config.js production
```

### 2. Verify Configuration

```bash
# Run health checks on all services
node scripts/health-check-unified.js development

# Generate detailed health report
node scripts/health-check-unified.js development report

# Test database connectivity only
node scripts/health-check-unified.js development db-test

# Test authentication system only
node scripts/health-check-unified.js development auth-test
```

### 3. Use Configuration in Services

```javascript
// Load unified configuration
const { loadConfig, loadServiceConfig } = require('../../config/loader');

// Get environment-specific configuration
const config = loadConfig('development');

// Get service-specific configuration
const serviceConfig = loadServiceConfig('grc_api', 'development');

// Use service router for inter-service communication
const { createServiceRouter } = require('../../config/serviceRouter');
const router = createServiceRouter('my-service', 'development');

// Make requests to other services
const data = await router.get('grc_api', '/api/endpoint');
```

## 🔧 Configuration Structure

### Service Registry

All services use standardized ports:

| Service | Port | Description |
|---------|------|-------------|
| Web Frontend | 5173 | React/Vite application |
| BFF (Backend for Frontend) | 5001 | API Gateway and proxy |
| GRC API | 3000 | Main business logic API |
| Auth Service | 3001 | Authentication and authorization |
| Document Service | 3002 | Document processing and storage |
| Partner Service | 3003 | Partner management |
| Notification Service | 3004 | Email and SMS notifications |
| AI Scheduler Service | 3005 | AI task scheduling |
| RAG Service | 3006 | Retrieval-Augmented Generation |
| Regulatory Service | 3008 | Regulatory intelligence |

### Database Configuration

Choose between two approaches:

#### 1. Unified Database (Recommended)
- Single PostgreSQL database for all services
- Simpler setup and maintenance
- Good for most use cases

#### 2. Multi-Database Architecture
- Separate databases for different domains
- Compliance, Finance, and Auth databases
- Better for large-scale deployments

### Authentication & Security

- **JWT-based authentication** with configurable expiration
- **Rate limiting** per endpoint and globally
- **CORS configuration** for cross-origin requests
- **Service-to-service authentication** using JWT tokens

### Feature Flags

- `ENABLE_MULTI_TENANCY` - Multi-tenant support
- `ENABLE_AI_FEATURES` - AI and ML capabilities
- `ENABLE_NOTIFICATIONS` - Email/SMS notifications
- `ENABLE_REGULATORY_INTELLIGENCE` - Regulatory compliance features
- `ENABLE_RAG_SERVICE` - Document search and retrieval

## 🌍 Environment-Specific Configuration

### Development Environment
- All services run on localhost
- Debug logging enabled
- Authentication bypass available for testing
- CORS enabled for all origins

### Docker Environment
- Services communicate via Docker networking
- Service names used instead of localhost
- Health checks and service discovery enabled

### Production Environment
- HTTPS/TLS encryption
- Secure JWT secrets
- Rate limiting enabled
- Monitoring and logging configured

## 📊 Health Checks

The configuration system includes comprehensive health checking:

### Service Health
- Individual service health endpoints
- Batch health checks for all services
- Response time monitoring
- Circuit breaker patterns for resilience

### Configuration Validation
- Port conflict detection
- URL consistency checks
- Database connectivity tests
- Authentication system validation

### Monitoring
- Request/response logging
- Error tracking and reporting
- Performance metrics collection
- Service dependency mapping

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Check if ports are already in use: `netstat -an | grep :PORT`
   - Update port assignments in configuration

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Test connection: `node scripts/health-check-unified.js development db-test`

3. **Service Communication Failures**
   - Ensure all services are running
   - Check firewall settings
   - Verify service URLs in configuration

4. **Authentication Problems**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Test auth system: `node scripts/health-check-unified.js development auth-test`

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment configuration.

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Secrets**
   - Update JWT secrets from default values
   - Use strong, randomly generated secrets
   - Rotate secrets regularly

2. **Enable HTTPS**
   - Configure SSL certificates
   - Enable secure headers
   - Use secure cookie settings

3. **Database Security**
   - Use strong database passwords
   - Enable SSL/TLS for database connections
   - Implement proper backup strategies

4. **Rate Limiting**
   - Configure appropriate rate limits
   - Monitor for abuse patterns
   - Implement IP whitelisting if needed

## 📚 API Documentation

### Configuration Loader API

```javascript
const { loadConfig, loadServiceConfig } = require('./config/loader');

// Load full configuration
const config = loadConfig('development');

// Load service-specific configuration
const serviceConfig = loadServiceConfig('grc_api', 'development');

// Display configuration summary
displayConfigSummary('development');

// Create environment file
createEnvFile('development', './.env');
```

### Service Router API

```javascript
const { createServiceRouter } = require('./config/serviceRouter');

// Create router instance
const router = createServiceRouter('my-service', 'development');

// Make HTTP requests
const data = await router.get('target-service', '/api/endpoint');
const result = await router.post('target-service', '/api/endpoint', { data: 'payload' });

// Health checks
const health = await router.healthCheck('target-service');
const batchHealth = await router.batchHealthCheck(['service1', 'service2']);

// Circuit breaker
const circuitBreaker = router.createCircuitBreaker('target-service');
const result = await circuitBreaker.call(() => router.get('target-service', '/api/endpoint'));
```

## 🤝 Contributing

When adding new services or configuration options:

1. Update `ecosystem.config.js` with new service definitions
2. Add service-specific configuration generation in `setup-unified-config.js`
3. Update health check scripts to include new services
4. Test configuration with all environments
5. Update this README with new information

## 📞 Support

For configuration issues:
1. Check the health check output for specific errors
2. Review service logs for detailed error messages
3. Verify environment variables are properly set
4. Run configuration validation scripts
5. Check network connectivity between services