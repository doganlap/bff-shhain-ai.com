const { Pool } = require('pg');
require('dotenv').config();

let pool;

const createPool = async () => {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'grc_template',
        user: process.env.DB_USER || 'grc_user',
        password: process.env.DB_PASSWORD,
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

    return new Pool(dbConfig);
};

const getPool = async () => {
    if (!pool) {
        pool = await createPool();
        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
};

const testConnection = async () => {
    try {
        const p = await getPool();
        const client = await p.connect();
        console.log('[AUTH-SERVICE] Database connected successfully');
        const result = await client.query('SELECT NOW() as current_time');
        console.log('[AUTH-SERVICE] Database time:', result.rows[0].current_time);
        client.release();
        return true;
    } catch (err) {
        console.error('[AUTH-SERVICE] Database connection failed:', err.message);
        return false;
    }
};

const query = async (text, params) => {
    const p = await getPool();
    const start = Date.now();
    try {
        const result = await p.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`[AUTH-SERVICE] Slow query detected (${duration}ms):`, text.substring(0, 100));
        }
        return result;
    } catch (error) {
        console.error('[AUTH-SERVICE] Database query error:', error.message);
        console.error('[AUTH-SERVICE] Query:', text);
        console.error('[AUTH-SERVICE] Params:', params);
        throw error;
    }
};

const transaction = async (callback) => {
    const p = await getPool();
    const client = await p.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const gracefulShutdown = async () => {
    if (pool) {
        console.log('[AUTH-SERVICE] Closing database connections...');
        await pool.end();
        console.log('[AUTH-SERVICE] Database connections closed');
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
    query,
    transaction,
    testConnection,
    gracefulShutdown
};
