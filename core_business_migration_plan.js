const { Client } = require('pg');

async function createCoreBusiness() {
  console.log('🏗️ CORE BUSINESS DATABASE MIGRATION PLAN');
  console.log('='.repeat(60));
  
  // Analyze existing databases for finance/admin selection
  const mainClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await mainClient.connect();
    
    console.log('📊 STEP 1: Analyzing existing databases for finance/admin selection...\n');
    
    // Check each database for finance/admin related tables
    const databases = ['grc_master', 'doganhubstore', 'shahin_platform', 'studio_app'];
    
    for (const dbName of databases) {
      const dbClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: dbName,
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        port: 5432,
      });

      try {
        await dbClient.connect();
        
        // Look for finance/admin related tables
        const financeTablesResult = await dbClient.query(`
          SELECT tablename, 
                 pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
          FROM pg_tables 
          WHERE schemaname = 'public'
          AND (
            tablename ILIKE '%finance%' OR
            tablename ILIKE '%accounting%' OR
            tablename ILIKE '%invoice%' OR
            tablename ILIKE '%payment%' OR
            tablename ILIKE '%billing%' OR
            tablename ILIKE '%revenue%' OR
            tablename ILIKE '%expense%' OR
            tablename ILIKE '%transaction%' OR
            tablename ILIKE '%admin%' OR
            tablename ILIKE '%license%' OR
            tablename ILIKE '%subscription%'
          )
          ORDER BY pg_total_relation_size('public.' || tablename) DESC
        `);

        if (financeTablesResult.rows.length > 0) {
          console.log(`💰 ${dbName.toUpperCase()} - Finance/Admin Tables Found:`);
          financeTablesResult.rows.forEach(table => {
            console.log(`   📋 ${table.tablename} (${table.size})`);
          });
          
          // Count rows in these tables
          let totalRows = 0;
          for (const table of financeTablesResult.rows) {
            try {
              const rowResult = await dbClient.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
              const rows = parseInt(rowResult.rows[0].count);
              totalRows += rows;
              console.log(`      📊 ${rows} rows`);
            } catch (e) {
              console.log(`      ❌ Cannot count rows`);
            }
          }
          console.log(`   📈 Total Finance/Admin Rows: ${totalRows}`);
          console.log('');
        }

      } catch (dbError) {
        console.log(`   ❌ Cannot analyze ${dbName}: ${dbError.message}`);
      } finally {
        await dbClient.end();
      }
    }

    console.log('🎯 STEP 2: Recommended Core Business Structure:\n');
    
    console.log('1️⃣ CORE COMPLIANCE DATABASE:');
    console.log('   📂 shahin_ksa_compliance (18MB) - KEEP AS-IS');
    console.log('   🎯 Purpose: KSA compliance workflows, assessments, frameworks');
    console.log('   ✅ Status: Production ready\n');
    
    console.log('2️⃣ FINANCE/ADMIN DATABASE:');
    console.log('   📂 Recommended: grc_master (10MB)');
    console.log('   🎯 Purpose: Licenses, billing, subscriptions, admin');
    console.log('   💡 Reason: Has license management and tenant admin tables');
    console.log('   ✅ Status: Currently connected to your app\n');
    
    console.log('3️⃣ ACCESS/AUTHORITY DATABASE:');
    console.log('   📂 Create: shahin_access_control (NEW)');
    console.log('   🎯 Purpose: Authentication, authorization, RBAC, sessions');
    console.log('   💡 Features: Users, roles, permissions, tokens, audit logs');
    console.log('   ✅ Status: Will be created safely\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mainClient.end();
  }
}

createCoreBusiness();
