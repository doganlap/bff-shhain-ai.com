/**
 * Structured Logging Utility for BFF
 * Provides consistent logging format across the application
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor(context = 'BFF') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  _shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  _formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...meta
    });
  }

  error(message, error, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message, {
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined,
        ...meta
      }));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.log(this._formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  // Log HTTP requests
  logRequest(req) {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      tenantId: req.user?.tenantId
    });
  }

  // Log HTTP responses
  logResponse(req, res, duration) {
    this.info('HTTP Response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });
  }

  // Log service calls
  logServiceCall(serviceName, endpoint, method) {
    this.debug('Service Call', {
      service: serviceName,
      endpoint,
      method
    });
  }

  // Log security events
  logSecurityEvent(event, details) {
    this.warn('Security Event', {
      event,
      ...details
    });
  }
}

// Create singleton instance
const logger = new Logger('BFF');

module.exports = { Logger, logger };
