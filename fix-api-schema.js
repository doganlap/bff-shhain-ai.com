const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 FIXING API SCHEMA COMPATIBILITY');
console.log('===================================\n');

async function fixSchemaCompatibility() {
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

        // Fix organizations table to match API expectations
        console.log('⚡ Fixing organizations table...');
        await client.query(`
            -- Add missing columns for organizations
            ALTER TABLE organizations
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

            -- Set default values for existing records
            UPDATE organizations
            SET is_active = true,
                industry = COALESCE(sector, 'Technology'),
                description = COALESCE(name || ' - ' || COALESCE(sector, 'Organization'), name)
            WHERE is_active IS NULL OR industry IS NULL OR description IS NULL;
        `);
        console.log('   ✅ organizations table updated');

        // Fix users table for authentication
        console.log('⚡ Fixing users table...');
        await client.query(`
            -- Add missing columns for users
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);

            -- Set default values
            UPDATE users
            SET is_active = true,
                department = COALESCE(department, 'General'),
                job_title = COALESCE(job_title, 'User')
            WHERE is_active IS NULL;
        `);
        console.log('   ✅ users table updated');

        // Fix assessments table
        console.log('⚡ Fixing assessments table...');
        await client.query(`
            -- Add missing columns for assessments
            ALTER TABLE assessments
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

            -- Set default values
            UPDATE assessments
            SET is_active = true
            WHERE is_active IS NULL;
        `);
        console.log('   ✅ assessments table updated');

        // Create missing framework and control routes compatibility
        console.log('⚡ Adding framework compatibility...');
        await client.query(`
            -- Add missing columns for grc_frameworks
            ALTER TABLE grc_frameworks
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

            ALTER TABLE grc_controls
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

            -- Set defaults
            UPDATE grc_frameworks SET is_active = true WHERE is_active IS NULL;
            UPDATE grc_controls SET is_active = true WHERE is_active IS NULL;
        `);
        console.log('   ✅ frameworks and controls updated');

        // Create dashboard-specific tables/views if needed
        console.log('⚡ Adding dashboard compatibility...');
        await client.query(`
            -- Create a simple activities table for dashboard
            CREATE TABLE IF NOT EXISTS activities (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                activity_type VARCHAR(50),
                entity_type VARCHAR(50),
                entity_id UUID,
                user_id UUID REFERENCES users(id),
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Insert some sample activities
            INSERT INTO activities (tenant_id, title, description, activity_type, entity_type)
            VALUES
            ('42c676e2-8d5e-4b1d-ae80-3986b82dd5c5', 'System Initialized', 'GRC system has been initialized', 'system', 'system'),
            ('42c676e2-8d5e-4b1d-ae80-3986b82dd5c5', 'Database Migration Completed', 'Database schema migration completed successfully', 'migration', 'system'),
            ('42c676e2-8d5e-4b1d-ae80-3986b82dd5c5', 'Tenant Setup', 'Default tenant has been configured', 'setup', 'tenant')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✅ dashboard tables created');

        // Create sample data for testing
        console.log('⚡ Creating sample data...');
        await client.query(`
            -- Insert sample organization if none exists
            INSERT INTO organizations (
                tenant_id, name, name_ar, code, type, sector, industry,
                country, city, is_active, description
            )
            VALUES (
                '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                'Sample Organization',
                'منظمة نموذجية',
                'SAMPLE-ORG',
                'Private',
                'Technology',
                'Technology',
                'Saudi Arabia',
                'Riyadh',
                true,
                'A sample organization for testing the GRC system'
            ) ON CONFLICT (code) DO NOTHING;

            -- Insert sample user if none exists
            INSERT INTO users (
                tenant_id, username, email, first_name, last_name,
                role, is_active, department, job_title
            )
            VALUES (
                '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                'admin',
                'admin@example.com',
                'Admin',
                'User',
                'admin',
                true,
                'Administration',
                'System Administrator'
            ) ON CONFLICT (username) DO NOTHING;

            -- Insert sample framework
            INSERT INTO grc_frameworks (
                tenant_id, framework_code, name, name_ar, description,
                framework_type, category, is_active
            )
            VALUES (
                '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                'SAMPLE-FWK',
                'Sample Framework',
                'إطار عمل نموذجي',
                'A sample compliance framework for testing',
                'Regulation',
                'General',
                true
            ) ON CONFLICT (framework_code) DO NOTHING;
        `);
        console.log('   ✅ sample data created');

        // Validation
        console.log('\n🔍 Validating schema fixes...');

        const orgCheck = await client.query('SELECT COUNT(*) as count FROM organizations WHERE is_active = true');
        console.log(`📊 Active organizations: ${orgCheck.rows[0].count}`);

        const userCheck = await client.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
        console.log(`📊 Active users: ${userCheck.rows[0].count}`);

        const activitiesCheck = await client.query('SELECT COUNT(*) as count FROM activities');
        console.log(`📊 Dashboard activities: ${activitiesCheck.rows[0].count}`);

        client.release();

        console.log('\n✅ SCHEMA COMPATIBILITY FIXES COMPLETED!');
        console.log('=========================================');
        console.log('\n🎯 Fixed issues:');
        console.log('   ✅ Added is_active columns');
        console.log('   ✅ Added missing organization fields');
        console.log('   ✅ Added user profile fields');
        console.log('   ✅ Created activities table for dashboard');
        console.log('   ✅ Added sample data for testing');

    } catch (error) {
        console.log(`\n❌ Schema fix failed: ${error.message}`);
        throw error;
    } finally {
        await pool.end();
    }
}

// Execute schema fixes
fixSchemaCompatibility()
    .then(() => {
        console.log('\n🌟 API COMPATIBILITY FIXES COMPLETE! 🌟');
        console.log('Now restart your services and test again.');
    })
    .catch((error) => {
        console.log(`\n💥 Fix failed: ${error.message}`);
        process.exit(1);
    });
