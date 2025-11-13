/**
 * RLS (Row-Level Security) Context Middleware
 * Sets PostgreSQL session variables for tenant isolation
 */

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Middleware to set RLS context in PostgreSQL session
 * Must be used after tenantContext middleware
 */
const setRLSContext = async (req, res, next) => {
  const tenantId = req.tenantId;
  const isSuperAdmin = req.isSuperAdmin || false;

  // Skip for public endpoints or if no tenant
  if (!tenantId) {
    return next();
  }

  try {
    // Get database client from pool
    const client = await pool.connect();
    
    try {
      // Set session variables for RLS policies
      await client.query(
        `SET LOCAL app.current_tenant_id = $1;
         SET LOCAL app.is_super_admin = $2;`,
        [tenantId, isSuperAdmin]
      );
      
      logger.debug('RLS context set', {
        tenantId,
        isSuperAdmin,
        requestId: req.id,
      });
      
      // Attach client to request for use in route handlers
      req.dbClient = client;
      
      // Ensure client is released after response
      const originalEnd = res.end;
      res.end = function(...args) {
        if (req.dbClient) {
          req.dbClient.release();
          req.dbClient = null;
        }
        originalEnd.apply(this, args);
      };
      
      // Also release on error
      res.on('close', () => {
        if (req.dbClient) {
          req.dbClient.release();
          req.dbClient = null;
        }
      });
      
      next();
      
    } catch (error) {
      // Release client on error
      client.release();
      throw error;
    }
    
  } catch (error) {
    logger.error('Failed to set RLS context', error, {
      tenantId,
      requestId: req.id,
    });
    
    return res.status(500).json({
      error: 'Database configuration error',
      message: 'Failed to set tenant context',
      code: 'RLS_CONTEXT_ERROR',
      requestId: req.id,
    });
  }
};

/**
 * Get database client with RLS context
 * Use this instead of direct pool.query()
 */
function getClient(req) {
  if (req.dbClient) {
    return req.dbClient;
  }
  
  logger.warn('No RLS context client available, using pool', {
    path: req.path,
    tenantId: req.tenantId,
  });
  
  return pool;
}

/**
 * Execute query with RLS context
 */
async function query(req, text, params) {
  const client = getClient(req);
  return client.query(text, params);
}

/**
 * Health check for database connection
 */
async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      return {
        status: 'healthy',
        timestamp: result.rows[0].now,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

/**
 * Graceful shutdown
 */
async function closePool() {
  await pool.end();
  logger.info('Database connection pool closed');
}

// Handle process termination
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

module.exports = {
  setRLSContext,
  pool,
  getClient,
  query,
  checkDatabaseHealth,
  closePool,
};
