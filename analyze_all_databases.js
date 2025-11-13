const { Client } = require('pg');

async function analyzeAllDatabases() {
  // First get list of all databases
  const mainClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await mainClient.connect();
    
    // Get all databases
    const dbResult = await mainClient.query(`
      SELECT datname as database_name 
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `);

    console.log('🔍 ANALYZING ALL DATABASES - DETAILED BREAKDOWN');
    console.log('='.repeat(80));
    
    for (const db of dbResult.rows) {
      const dbName = db.database_name;
      console.log(`\n📊 DATABASE: ${dbName.toUpperCase()}`);
      console.log('='.repeat(50));
      
      // Connect to each database
      const dbClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: dbName,
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        port: 5432,
      });

      try {
        await dbClient.connect();
        
        // Get all tables in this database
        const tablesResult = await dbClient.query(`
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
          FROM pg_tables 
          WHERE schemaname = 'public'
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        `);

        if (tablesResult.rows.length === 0) {
          console.log('   📋 No tables found in public schema');
          continue;
        }

        console.log(`   📋 TABLES: ${tablesResult.rows.length} total`);
        console.log('   ' + '-'.repeat(45));

        let totalRows = 0;
        let totalColumns = 0;

        for (const table of tablesResult.rows) {
          const tableName = table.tablename;
          
          try {
            // Get column count
            const columnsResult = await dbClient.query(`
              SELECT COUNT(*) as column_count
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = $1
            `, [tableName]);

            // Get row count
            const rowCountResult = await dbClient.query(`
              SELECT COUNT(*) as row_count FROM "${tableName}"
            `);

            const columnCount = parseInt(columnsResult.rows[0].column_count);
            const rowCount = parseInt(rowCountResult.rows[0].row_count);
            
            totalColumns += columnCount;
            totalRows += rowCount;

            console.log(`   📄 ${tableName}`);
            console.log(`      Columns: ${columnCount} | Rows: ${rowCount.toLocaleString()} | Size: ${table.table_size}`);

            // Show column details for smaller tables
            if (columnCount <= 20) {
              const columnDetails = await dbClient.query(`
                SELECT 
                  column_name,
                  data_type,
                  is_nullable,
                  column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1
                ORDER BY ordinal_position
              `, [tableName]);

              console.log(`      📝 Columns:`);
              columnDetails.rows.forEach((col, idx) => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                console.log(`         ${idx + 1}. ${col.column_name} (${col.data_type}) ${nullable}${defaultVal}`);
              });
            } else {
              console.log(`      📝 Too many columns (${columnCount}) - skipping details`);
            }
            
            console.log('');

          } catch (tableError) {
            console.log(`   ❌ Error analyzing table ${tableName}: ${tableError.message}`);
          }
        }

        console.log(`   📊 SUMMARY FOR ${dbName}:`);
        console.log(`      Total Tables: ${tablesResult.rows.length}`);
        console.log(`      Total Columns: ${totalColumns}`);
        console.log(`      Total Rows: ${totalRows.toLocaleString()}`);

      } catch (dbError) {
        console.log(`   ❌ Cannot connect to ${dbName}: ${dbError.message}`);
      } finally {
        await dbClient.end();
      }
    }

    // Overall summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Databases Analyzed: ${dbResult.rows.length}`);

  } catch (error) {
    console.error('❌ Error analyzing databases:', error.message);
  } finally {
    await mainClient.end();
  }
}

analyzeAllDatabases();
