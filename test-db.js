const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing database connection...');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'grc_ecosystem',
    user: process.env.DB_USER || 'grc_user',
    password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
    connectionTimeoutMillis: 3000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.log('❌ Connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connection successful!');
        client.query('SELECT current_database()', (err, result) => {
            release();
            if (err) {
                console.log('❌ Query failed:', err.message);
            } else {
                console.log('📊 Connected to database:', result.rows[0].current_database);
                console.log('🎯 Ready to run migration!');
            }
            pool.end();
        });
    }
});
