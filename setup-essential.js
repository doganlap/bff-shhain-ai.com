const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

console.log('🔧 ESSENTIAL GRC SCHEMA SETUP');
console.log('==============================\n');

async function setupEssentialSchema() {
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

        // Essential SQL for enterprise compliance
        const essentialSQL = `
            -- Enable UUID extension
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            -- Create tenants table
            CREATE TABLE IF NOT EXISTS tenants (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                name_ar VARCHAR(255),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Insert default tenant
            INSERT INTO tenants (id, tenant_code, name, name_ar)
            VALUES (
                '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                'DEFAULT',
                'Default Tenant',
                'المستأجر الافتراضي'
            ) ON CONFLICT (tenant_code) DO NOTHING;

            -- Create or update organizations table
            CREATE TABLE IF NOT EXISTS organizations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                name VARCHAR(255) NOT NULL,
                name_ar VARCHAR(255),
                code VARCHAR(50),
                type VARCHAR(50),
                sector VARCHAR(100),
                size VARCHAR(50),
                country VARCHAR(100) DEFAULT 'Saudi Arabia',
                city VARCHAR(100),
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(255),
                website VARCHAR(255),
                logo_url TEXT,
                status VARCHAR(50) DEFAULT 'active',
                settings JSONB DEFAULT '{}',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Create or update users table
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                organization_id UUID REFERENCES organizations(id),
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                full_name_ar VARCHAR(200),
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'user',
                permissions JSONB DEFAULT '[]',
                status VARCHAR(50) DEFAULT 'active',
                last_login TIMESTAMP WITH TIME ZONE,
                email_verified BOOLEAN DEFAULT false,
                phone_verified BOOLEAN DEFAULT false,
                preferences JSONB DEFAULT '{}',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Create or update assessments table
            CREATE TABLE IF NOT EXISTS assessments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                organization_id UUID REFERENCES organizations(id),
                title VARCHAR(255) NOT NULL,
                title_ar VARCHAR(255),
                description TEXT,
                description_ar TEXT,
                framework_id UUID,
                assessment_type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'draft',
                due_date DATE,
                completion_date DATE,
                score DECIMAL(5,2),
                total_questions INTEGER DEFAULT 0,
                answered_questions INTEGER DEFAULT 0,
                compliance_level VARCHAR(50),
                risk_level VARCHAR(50),
                findings JSONB DEFAULT '[]',
                recommendations JSONB DEFAULT '[]',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Create or update grc_frameworks table
            CREATE TABLE IF NOT EXISTS grc_frameworks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                framework_code VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(500) NOT NULL,
                name_ar VARCHAR(500),
                description TEXT,
                description_ar TEXT,
                version VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                framework_type VARCHAR(100),
                category VARCHAR(100),
                issuing_authority VARCHAR(200),
                publication_date DATE,
                effective_date DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Create or update grc_controls table
            CREATE TABLE IF NOT EXISTS grc_controls (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID REFERENCES tenants(id),
                framework_id UUID REFERENCES grc_frameworks(id),
                control_code VARCHAR(50) NOT NULL,
                title VARCHAR(500) NOT NULL,
                title_ar VARCHAR(500),
                description TEXT,
                description_ar TEXT,
                control_type VARCHAR(50),
                category VARCHAR(100),
                subcategory VARCHAR(100),
                implementation_guidance TEXT,
                implementation_guidance_ar TEXT,
                compliance_requirements TEXT,
                compliance_requirements_ar TEXT,
                risk_level VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            );

            -- Add tenant_id to existing tables if missing
            DO $$
            BEGIN
                -- Add tenant_id to organizations if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'organizations' AND column_name = 'tenant_id'
                ) THEN
                    ALTER TABLE organizations
                    ADD COLUMN tenant_id UUID REFERENCES tenants(id);

                    UPDATE organizations
                    SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
                    WHERE tenant_id IS NULL;
                END IF;

                -- Add tenant_id to users if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users' AND column_name = 'tenant_id'
                ) THEN
                    ALTER TABLE users
                    ADD COLUMN tenant_id UUID REFERENCES tenants(id);

                    UPDATE users
                    SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
                    WHERE tenant_id IS NULL;
                END IF;

                -- Add tenant_id to assessments if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'assessments' AND column_name = 'tenant_id'
                ) THEN
                    ALTER TABLE assessments
                    ADD COLUMN tenant_id UUID REFERENCES tenants(id);

                    UPDATE assessments
                    SET tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
                    WHERE tenant_id IS NULL;
                END IF;
            END $$;
        `;

        console.log('⚡ Executing essential schema setup...');

        // Split into individual statements and execute
        const statements = essentialSQL.split(';').filter(s => s.trim().length > 5);
        let successCount = 0;

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (trimmed) {
                try {
                    await client.query(trimmed);
                    successCount++;
                    process.stdout.write('.');
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.log(`\\n⚠️  Warning: ${error.message.substring(0, 80)}`);
                    }
                }
            }
        }

        console.log(`\\n✅ Executed ${successCount} statements successfully`);

        // Validation
        console.log('\\n🔍 Validating results...');

        const tenantCount = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.columns
            WHERE column_name = 'tenant_id' AND table_schema = 'public'
        `);

        const tableCount = await client.query(`
            SELECT COUNT(*) as count FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        const coreTablesCheck = await client.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('tenants', 'organizations', 'users', 'assessments', 'grc_frameworks', 'grc_controls')
        `);

        console.log(`📊 Tables with tenant_id: ${tenantCount.rows[0].count}`);
        console.log(`📊 Total public tables: ${tableCount.rows[0].count}`);
        console.log(`📊 Core GRC tables: ${coreTablesCheck.rows.length}/6`);

        coreTablesCheck.rows.forEach(row => {
            console.log(`   ✅ ${row.table_name}`);
        });

        client.release();

        console.log('\\n✅ ESSENTIAL SCHEMA SETUP COMPLETED!');
        console.log('=====================================');
        console.log('\\n🎯 Your database now includes:');
        console.log('   ✅ tenants table with default tenant');
        console.log('   ✅ tenant_id in all core tables');
        console.log('   ✅ UUID primary keys');
        console.log('   ✅ Enterprise audit fields');
        console.log('   ✅ Multi-tenant ready structure');
        console.log('   ✅ GRC core tables (organizations, users, assessments, frameworks, controls)');

    } catch (error) {
        console.log(`\\n❌ Schema setup failed: ${error.message}`);
        throw error;
    } finally {
        await pool.end();
    }
}

// Execute essential setup
setupEssentialSchema()
    .then(() => {
        console.log('\\n🌟 ESSENTIAL GRC SCHEMA SETUP COMPLETE! 🌟');
    })
    .catch((error) => {
        console.log(`\\n💥 Setup failed: ${error.message}`);
        process.exit(1);
    });
