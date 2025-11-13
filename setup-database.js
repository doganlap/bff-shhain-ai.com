const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🏗️  SETTING UP GRC DATABASE');
    console.log('============================');

    // First connect to postgres database to create our target database
    const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // Connect to default postgres database
        user: process.env.DB_USER || 'grc_user',
        password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
        connectionTimeoutMillis: 5000,
    });

    try {
        const client = await adminPool.connect();
        console.log('✅ Connected to PostgreSQL server');

        // Check if database exists
        const dbExists = await client.query(`
            SELECT 1 FROM pg_database WHERE datname = $1
        `, [process.env.DB_NAME || 'grc_ecosystem']);

        if (dbExists.rows.length === 0) {
            console.log(`📊 Creating database: ${process.env.DB_NAME || 'grc_ecosystem'}`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME || 'grc_ecosystem'}"`);
            console.log('✅ Database created successfully');
        } else {
            console.log(`📊 Database already exists: ${process.env.DB_NAME || 'grc_ecosystem'}`);
        }

        client.release();
    } catch (error) {
        console.log(`❌ Database setup failed: ${error.message}`);
        throw error;
    } finally {
        await adminPool.end();
    }

    // Now run the migration
    console.log('\n🚀 RUNNING MIGRATIONS');
    console.log('======================');

    const { runAllMigrations } = require('./execute-all-migrations');
    await runAllMigrations();
}

setupDatabase()
    .then(() => {
        console.log('\n🌟 DATABASE SETUP AND MIGRATION COMPLETED! 🌟');
    })
    .catch((error) => {
        console.log(`\n💥 Setup failed: ${error.message}`);
        process.exit(1);
    });
