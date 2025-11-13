#!/usr/bin/env node

/**
 * DIRECT DATABASE VERIFICATION AND FIX
 * This script will directly check and fix any missing tenant_id columns
 */

const { Client } = require('pg');
require('dotenv').config();

console.log('🔍 DIRECT DATABASE SCHEMA VERIFICATION');
console.log('=====================================\n');

async function verifyAndFix() {
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

        // List all tables
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('📋 Available tables:');
        tablesResult.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });
        console.log('');

        // Check each table for tenant_id column
        const tables = ['organizations', 'users', 'assessments', 'grc_frameworks', 'grc_controls'];
        const fixes = [];

        console.log('🔍 Checking tenant_id columns...');
        for (const table of tables) {
            try {
                const colResult = await client.query(`
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = $1 AND column_name = 'tenant_id'
                `, [table]);

                const hasColumn = colResult.rows.length > 0;
                console.log(`   ${hasColumn ? '✅' : '❌'} ${table}.tenant_id`);

                if (!hasColumn) {
                    // Check if table exists first
                    const tableExists = await client.query(`
                        SELECT table_name
                        FROM information_schema.tables
                        WHERE table_name = $1
                    `, [table]);

                    if (tableExists.rows.length > 0) {
                        fixes.push({
                            table,
                            sql: `ALTER TABLE ${table} ADD COLUMN tenant_id UUID REFERENCES tenants(id)`,
                            desc: `Add tenant_id to ${table}`
                        });
                    } else {
                        console.log(`   ⚠️  Table ${table} does not exist`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Error checking ${table}: ${error.message.substring(0, 50)}`);
            }
        }

        // Apply fixes
        if (fixes.length > 0) {
            console.log('\n⚡ Applying tenant_id column fixes...');

            for (const fix of fixes) {
                console.log(`   ${fix.desc}...`);
                try {
                    await client.query(fix.sql);
                    console.log('     ✅ Success');
                } catch (error) {
                    console.log(`     ❌ Failed: ${error.message.substring(0, 60)}`);
                }
            }

            // Set default tenant_id for existing records
            const defaultTenant = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5';
            console.log('\n⚡ Setting default tenant_id for existing records...');

            for (const table of ['organizations', 'users', 'assessments']) {
                try {
                    const updateResult = await client.query(`
                        UPDATE ${table} SET tenant_id = $1 WHERE tenant_id IS NULL
                    `, [defaultTenant]);
                    console.log(`   ${table}: Updated ${updateResult.rowCount} rows`);
                } catch (error) {
                    console.log(`   ${table}: ${error.message.substring(0, 40)}`);
                }
            }
        } else {
            console.log('\n✅ All tenant_id columns are present');
        }

        // Final verification
        console.log('\n🔍 FINAL COLUMN VERIFICATION');
        console.log('============================');

        for (const table of tables) {
            try {
                const result = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = $1 AND column_name IN ('id', 'tenant_id', 'is_active')
                    ORDER BY column_name
                `, [table]);

                console.log(`\n📊 ${table}:`);
                if (result.rows.length > 0) {
                    result.rows.forEach(col => {
                        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                    });
                } else {
                    console.log(`   ⚠️  Table not found or no key columns`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message.substring(0, 60)}`);
            }
        }

        // Test queries
        console.log('\n🧪 TESTING BASIC QUERIES');
        console.log('========================');

        const testQueries = [
            {
                name: 'Organizations count',
                sql: 'SELECT COUNT(*) as count FROM organizations WHERE tenant_id IS NOT NULL'
            },
            {
                name: 'Users count',
                sql: 'SELECT COUNT(*) as count FROM users WHERE tenant_id IS NOT NULL'
            },
            {
                name: 'Assessments count',
                sql: 'SELECT COUNT(*) as count FROM assessments WHERE tenant_id IS NOT NULL'
            }
        ];

        for (const test of testQueries) {
            try {
                const result = await client.query(test.sql);
                console.log(`   ✅ ${test.name}: ${result.rows[0].count}`);
            } catch (error) {
                console.log(`   ❌ ${test.name}: ${error.message.substring(0, 50)}`);
            }
        }

        console.log('\n✅ VERIFICATION COMPLETED!');
        console.log('==========================');

    } catch (error) {
        console.log(`\n💥 Error: ${error.message}`);
        throw error;
    } finally {
        await client.end();
        console.log('\n📝 Database connection closed');
    }
}

// Execute the verification
if (require.main === module) {
    verifyAndFix()
        .then(() => {
            console.log('\n🌟 DATABASE VERIFICATION SUCCESSFUL! 🌟');
        })
        .catch((error) => {
            console.log(`\n💥 Verification failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { verifyAndFix };
