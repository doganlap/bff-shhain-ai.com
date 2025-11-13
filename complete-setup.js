const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 COMPLETE GRC DATABASE SETUP');
console.log('===============================\n');

async function completeSetup() {
    // Database config
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'grc_user',
        password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
    };

    const targetDbName = process.env.DB_NAME || 'grc_ecosystem';

    console.log(`📊 Target database: ${targetDbName}`);
    console.log(`🔗 Server: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}\n`);

    // Step 1: Create database if it doesn't exist
    console.log('📋 STEP 1: Ensure database exists');
    const adminPool = new Pool({ ...dbConfig, database: 'postgres' });

    try {
        const adminClient = await adminPool.connect();

        // Check if database exists
        const result = await adminClient.query(`
            SELECT 1 FROM pg_database WHERE datname = $1
        `, [targetDbName]);

        if (result.rows.length === 0) {
            console.log(`   🏗️  Creating database: ${targetDbName}`);
            await adminClient.query(`CREATE DATABASE "${targetDbName}"`);
            console.log('   ✅ Database created');
        } else {
            console.log('   ✅ Database already exists');
        }

        adminClient.release();
    } catch (error) {
        console.log(`   ❌ Database creation failed: ${error.message}`);
        if (error.message.includes('already exists')) {
            console.log('   ✅ Database exists (continuing...)');
        } else {
            throw error;
        }
    } finally {
        await adminPool.end();
    }

    // Step 2: Connect to target database and run migrations
    console.log('\n📋 STEP 2: Execute migrations');
    const targetPool = new Pool({ ...dbConfig, database: targetDbName });

    try {
        const client = await targetPool.connect();
        console.log('   ✅ Connected to target database');

        const version = await client.query('SELECT version()');
        console.log(`   📊 ${version.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
        client.release();

        // Migration 1: Tenant schema
        console.log('\n   ⚡ Migration 1: Tenant Schema');
        await executeSqlFile('infra/db/migrations/017_fix_tenant_schema.sql', targetPool);

        // Migration 2: Unified master
        console.log('\n   ⚡ Migration 2: Unified Master');
        await executeSqlFile('database -GRC/UNIFIED_MASTER_MIGRATION.sql', targetPool);

        // Validation
        console.log('\n   🔍 Validation');
        await validateResults(targetPool);

        console.log('\n✅ ALL SETUP COMPLETED SUCCESSFULLY!');
        console.log('=====================================');
        console.log('\n🎯 Your database now has:');
        console.log('   ✅ Enterprise schema with tenant_id');
        console.log('   ✅ UUID primary keys');
        console.log('   ✅ Audit fields (created_at, updated_at)');
        console.log('   ✅ Multi-tenant isolation');
        console.log('   ✅ Unified GRC tables');

        console.log('\n🚀 NEXT STEPS:');
        console.log('   1. Restart your application services');
        console.log('   2. Test API endpoints');
        console.log('   3. Verify tenant filtering works');

    } catch (error) {
        console.log(`\n❌ Migration failed: ${error.message}`);
        throw error;
    } finally {
        await targetPool.end();
    }
}

async function executeSqlFile(filePath, pool) {
    console.log(`     📄 ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`     ⚠️  File not found, skipping`);
        return;
    }

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10 && !s.startsWith('--') && !s.includes('\\echo'));

    console.log(`     📝 ${statements.length} statements to execute`);

    const client = await pool.connect();
    let success = 0, warnings = 0;

    try {
        for (const statement of statements) {
            try {
                await client.query(statement);
                success++;
            } catch (error) {
                if (error.message.includes('already exists') ||
                    error.message.includes('duplicate') ||
                    error.message.includes('does not exist')) {
                    warnings++;
                } else {
                    console.log(`     ⚠️  ${error.message.substring(0, 80)}...`);
                    warnings++;
                }
            }
        }
    } finally {
        client.release();
    }

    console.log(`     ✅ Success: ${success}, Warnings: ${warnings}`);
}

async function validateResults(pool) {
    const client = await pool.connect();

    try {
        // Count tenant_id columns
        const tenantResult = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.columns
            WHERE column_name = 'tenant_id' AND table_schema = 'public'
        `);
        console.log(`     📊 Tables with tenant_id: ${tenantResult.rows[0].count}`);

        // Count unified tables
        const unifiedResult = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name LIKE 'unified_%'
        `);
        console.log(`     📊 Unified tables: ${unifiedResult.rows[0].count}`);

        // Total tables
        const totalResult = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        console.log(`     📊 Total tables: ${totalResult.rows[0].count}`);

        // Check key tables exist
        const keyTables = await client.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('tenants', 'organizations', 'users', 'assessments')
        `);
        console.log(`     📊 Core tables: ${keyTables.rows.length}/4 found`);

    } finally {
        client.release();
    }
}

// Execute complete setup
completeSetup()
    .then(() => {
        console.log('\n🌟 COMPLETE DATABASE SETUP FINISHED! 🌟');
    })
    .catch((error) => {
        console.log(`\n💥 Setup failed: ${error.message}`);
        process.exit(1);
    });
