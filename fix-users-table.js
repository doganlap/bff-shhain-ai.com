#!/usr/bin/env node

/**
 * FINAL USERS TABLE FIX
 * This script will add missing position column to users table
 */

const { Client } = require('pg');
require('dotenv').config();

console.log('🔧 FIXING USERS TABLE');
console.log('====================\n');

async function fixUsersTable() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'grc_ecosystem',
        user: process.env.DB_USER || 'grc_user',
        password: process.env.DB_PASSWORD || 'grc_secure_password_2024',
    });

    try {
        console.log('🔗 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully\n');

        // Check current users table structure
        console.log('🔍 Checking current users table...');
        const currentCols = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('   Current columns:');
        const columnNames = currentCols.rows.map(col => col.column_name);
        currentCols.rows.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        // Add missing columns
        const missingColumns = [
            { name: 'position', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100)' },
            { name: 'department', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)' },
            { name: 'phone', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)' },
            { name: 'language', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT \'en\'' },
            { name: 'timezone', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT \'UTC\'' },
            { name: 'status', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\'' }
        ];

        console.log('\n⚡ Adding missing columns...');
        for (const col of missingColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`   Adding ${col.name}...`);
                try {
                    await client.query(col.sql);
                    console.log(`     ✅ Added ${col.name}`);
                } catch (error) {
                    console.log(`     ❌ Failed to add ${col.name}: ${error.message.substring(0, 50)}`);
                }
            } else {
                console.log(`   ✅ Column ${col.name} already exists`);
            }
        }

        // Create a sample user for testing
        console.log('\n⚡ Creating sample user...');
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log(`   📊 Current users count: ${userCount.rows[0].count}`);

        if (userCount.rows[0].count === '0') {
            try {
                await client.query(`
                    INSERT INTO users (
                        id, tenant_id, first_name, last_name, email, role,
                        status, is_active, position, department, phone,
                        language, timezone, created_at, updated_at
                    ) VALUES (
                        uuid_generate_v4(),
                        '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5',
                        'Admin',
                        'User',
                        'admin@example.com',
                        'admin',
                        'active',
                        true,
                        'System Administrator',
                        'IT',
                        '+1234567890',
                        'en',
                        'UTC',
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                `);
                console.log('   ✅ Sample user created');
            } catch (error) {
                console.log(`   ⚠️  Sample user creation: ${error.message.substring(0, 60)}`);
            }
        } else {
            console.log('   ✅ Users already exist');
        }

        // Final validation
        console.log('\n🔍 FINAL VALIDATION');
        console.log('==================');

        const finalCols = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('   Final users table structure:');
        finalCols.rows.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            console.log(`     - ${col.column_name} (${col.data_type}) ${nullable}`);
        });

        // Test query
        const testResult = await client.query(`
            SELECT id, first_name, last_name, email, position, department
            FROM users
            WHERE tenant_id = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'
            LIMIT 5
        `);

        console.log(`\n   📊 Test query returned ${testResult.rows.length} users`);
        testResult.rows.forEach(user => {
            console.log(`     • ${user.first_name} ${user.last_name} (${user.position || 'No Position'})`);
        });

        console.log('\n✅ USERS TABLE FIX COMPLETED!');
        console.log('=============================');

    } catch (error) {
        console.log(`\n💥 Error: ${error.message}`);
        throw error;
    } finally {
        await client.end();
        console.log('\n📝 Database connection closed');
    }
}

// Execute the fix
if (require.main === module) {
    fixUsersTable()
        .then(() => {
            console.log('\n🌟 USERS TABLE FIX SUCCESSFUL! 🌟');
        })
        .catch((error) => {
            console.log(`\n💥 Users table fix failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { fixUsersTable };
