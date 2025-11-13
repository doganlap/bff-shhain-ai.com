const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 SIMPLE API SCHEMA FIX');
console.log('=========================\n');

async function simpleSchemaFix() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'grc_ecosystem',
        user: process.env.DB_USER || 'grc_user',
        password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connected to database');

        // Add missing columns
        const fixes = [
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
            "ALTER TABLE grc_frameworks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
            "ALTER TABLE grc_controls ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",

            // Update existing records
            "UPDATE organizations SET is_active = true WHERE is_active IS NULL",
            "UPDATE organizations SET industry = COALESCE(sector, 'Technology') WHERE industry IS NULL",
            "UPDATE organizations SET description = name WHERE description IS NULL",
            "UPDATE users SET is_active = true WHERE is_active IS NULL",
            "UPDATE assessments SET is_active = true WHERE is_active IS NULL",
            "UPDATE grc_frameworks SET is_active = true WHERE is_active IS NULL",
            "UPDATE grc_controls SET is_active = true WHERE is_active IS NULL"
        ];

        console.log('⚡ Applying schema fixes...');
        for (const fix of fixes) {
            try {
                await client.query(fix);
                process.stdout.write('.');
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.log(`\n⚠️  Warning: ${error.message.substring(0, 80)}`);
                }
            }
        }

        console.log('\n✅ Schema fixes applied');

        // Create activities table
        console.log('⚡ Creating activities table...');
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS activities (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    tenant_id UUID REFERENCES tenants(id),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    activity_type VARCHAR(50),
                    entity_type VARCHAR(50),
                    entity_id UUID,
                    user_id UUID,
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    created_by UUID,
                    updated_by UUID
                )
            `);

            // Add some sample activities
            await client.query(`
                INSERT INTO activities (tenant_id, title, description, activity_type)
                SELECT
                    '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                    'Database Schema Updated',
                    'Database schema has been updated for API compatibility',
                    'system'
                WHERE NOT EXISTS (SELECT 1 FROM activities WHERE title = 'Database Schema Updated')
            `);

            console.log('   ✅ activities table ready');
        } catch (error) {
            console.log(`   ⚠️  Activities table: ${error.message.substring(0, 80)}`);
        }

        // Add sample data if tables are empty
        console.log('⚡ Adding sample data...');

        const orgCount = await client.query('SELECT COUNT(*) as count FROM organizations');
        if (orgCount.rows[0].count === 0) {
            try {
                await client.query(`
                    INSERT INTO organizations (
                        tenant_id, name, name_ar, code, type, sector, industry,
                        country, city, is_active, description
                    ) VALUES (
                        '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                        'Sample Organization',
                        'منظمة نموذجية',
                        'SAMPLE-001',
                        'Private',
                        'Technology',
                        'Technology',
                        'Saudi Arabia',
                        'Riyadh',
                        true,
                        'Sample organization for testing'
                    )
                `);
                console.log('   ✅ Sample organization added');
            } catch (error) {
                console.log(`   ⚠️  Sample org: ${error.message.substring(0, 50)}`);
            }
        }

        client.release();

        // Final validation
        console.log('\n🔍 Final validation...');
        const validationClient = await pool.connect();

        const tables = ['organizations', 'users', 'assessments', 'grc_frameworks', 'grc_controls'];
        for (const table of tables) {
            try {
                const result = await validationClient.query(`
                    SELECT COUNT(*) as count FROM ${table} WHERE is_active = true
                `);
                console.log(`📊 ${table}: ${result.rows[0].count} active records`);
            } catch (error) {
                console.log(`📊 ${table}: validation failed`);
            }
        }

        validationClient.release();

        console.log('\n✅ SIMPLE SCHEMA FIX COMPLETED!');
        console.log('================================');

    } catch (error) {
        console.log(`\n❌ Schema fix failed: ${error.message}`);
        throw error;
    } finally {
        await pool.end();
    }
}

// Execute fixes
simpleSchemaFix()
    .then(() => {
        console.log('\n🌟 SCHEMA FIXES COMPLETE!');
        console.log('Now restart your API service and test endpoints.');
    })
    .catch((error) => {
        console.log(`\n💥 Fix failed: ${error.message}`);
        process.exit(1);
    });
