/**
 * Request tracking middleware
 * Adds unique request ID for tracing and logging
 */

const crypto = require('crypto');

/**
 * Generate a unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Middleware to add request ID to all requests
 */
function requestIdMiddleware(req, res, next) {
  // Use existing request ID from header or generate new one
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // Add to request object
  req.id = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Track request start time for duration calculation
  req.startTime = Date.now();
  
  next();
}

/**
 * Middleware to log request duration
 */
function requestDurationMiddleware(req, res, next) {
  // Capture the original res.json method
  const originalJson = res.json.bind(res);
  
  // Override res.json to calculate duration
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log if enabled
    if (process.env.LOG_REQUEST_DURATION === 'true') {
      console.log(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
    
    return originalJson(data);
  };
  
  next();
}

module.exports = {
  generateRequestId,
  requestIdMiddleware,
  requestDurationMiddleware
};
