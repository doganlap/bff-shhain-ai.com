// ============================================================================
// CORE BUSINESS DATABASE CONFIGURATION
// 3-Database Architecture for Shahin KSA Platform
// ============================================================================

const { Pool } = require('pg');

// Database connection configurations
const DATABASE_CONFIGS = {
  // 1. Core Business Workflow - KSA Compliance
  compliance: {
    database: 'shahin_ksa_compliance',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // 2. Finance & Administration
  finance: {
    database: 'grc_master',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // 3. Access & Authority Control
  auth: {
    database: 'shahin_access_control',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};

// Create connection pools
const pools = {
  compliance: new Pool(DATABASE_CONFIGS.compliance),
  finance: new Pool(DATABASE_CONFIGS.finance),
  auth: new Pool(DATABASE_CONFIGS.auth)
};

// Database query functions
const dbQueries = {
  // Compliance database queries
  compliance: {
    async query(text, params) {
      const client = await pools.compliance.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    }
  },

  // Finance database queries
  finance: {
    async query(text, params) {
      const client = await pools.finance.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    }
  },

  // Auth database queries
  auth: {
    async query(text, params) {
      const client = await pools.auth.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    }
  }
};

// Cross-database operations
const crossDbOperations = {
  // Get user with compliance and finance data
  async getUserWithFullProfile(userId) {
    const [user, complianceData, financeData] = await Promise.all([
      dbQueries.auth.query('SELECT * FROM users WHERE id = $1', [userId]),
      dbQueries.compliance.query('SELECT COUNT(*) as assessment_count FROM assessments WHERE created_by_user_id = $1', [userId]),
      dbQueries.finance.query('SELECT COUNT(*) as license_count FROM tenant_licenses tl JOIN tenants t ON tl.tenant_id = t.id WHERE t.primary_admin_user_id = $1', [userId])
    ]);

    return {
      user: user.rows[0],
      compliance: complianceData.rows[0],
      finance: financeData.rows[0]
    };
  },

  // Create assessment with user validation
  async createAssessmentWithAuth(assessmentData, userId) {
    // Validate user exists and has permissions
    const user = await dbQueries.auth.query('SELECT id, roles FROM users WHERE id = $1 AND is_active = true', [userId]);
    if (!user.rows.length) {
      throw new Error('User not found or inactive');
    }

    // Create assessment in compliance database
    const assessment = await dbQueries.compliance.query(`
      INSERT INTO assessments (name, description, created_by_user_id, auth_database, finance_database)
      VALUES ($1, $2, $3, 'shahin_access_control', 'grc_master')
      RETURNING *
    `, [assessmentData.name, assessmentData.description, userId]);

    // Log in audit table
    await dbQueries.auth.query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'create', 'assessment', $2, $3)
    `, [userId, assessment.rows[0].id, JSON.stringify(assessmentData)]);

    return assessment.rows[0];
  }
};

// Health check function
async function healthCheck() {
  const results = {};
  
  for (const [name, pool] of Object.entries(pools)) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      results[name] = { status: 'healthy', database: DATABASE_CONFIGS[name].database };
    } catch (error) {
      results[name] = { status: 'error', error: error.message };
    }
  }
  
  return results;
}

// Graceful shutdown
async function closeAllConnections() {
  await Promise.all([
    pools.compliance.end(),
    pools.finance.end(),
    pools.auth.end()
  ]);
}

module.exports = {
  pools,
  dbQueries,
  crossDbOperations,
  healthCheck,
  closeAllConnections,
  DATABASE_CONFIGS
};

// Usage Examples:
/*
const { dbQueries, crossDbOperations, healthCheck } = require('./core_business_config');

// Simple queries
const users = await dbQueries.auth.query('SELECT * FROM users WHERE is_active = true');
const assessments = await dbQueries.compliance.query('SELECT * FROM assessments ORDER BY created_at DESC');
const licenses = await dbQueries.finance.query('SELECT * FROM licenses WHERE is_active = true');

// Cross-database operations
const userProfile = await crossDbOperations.getUserWithFullProfile('user-uuid');
const newAssessment = await crossDbOperations.createAssessmentWithAuth({
  name: 'SAMA Compliance Assessment',
  description: 'Annual SAMA compliance review'
}, 'user-uuid');

// Health check
const health = await healthCheck();
console.log('Database Health:', health);
*/
