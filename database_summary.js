const { Client } = require('pg');

async function getDatabaseSummary() {
  const mainClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await mainClient.connect();
    
    const dbResult = await mainClient.query(`
      SELECT datname as database_name,
             pg_size_pretty(pg_database_size(datname)) as size
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY pg_database_size(datname) DESC
    `);

    console.log('📊 DATABASE SUMMARY - TABLES, COLUMNS & ROWS');
    console.log('='.repeat(80));
    
    let grandTotalTables = 0;
    let grandTotalColumns = 0;
    let grandTotalRows = 0;

    for (const db of dbResult.rows) {
      const dbName = db.database_name;
      
      const dbClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: dbName,
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        port: 5432,
      });

      try {
        await dbClient.connect();
        
        // Get table count
        const tableCountResult = await dbClient.query(`
          SELECT COUNT(*) as table_count
          FROM pg_tables 
          WHERE schemaname = 'public'
        `);

        // Get total columns across all tables
        const columnCountResult = await dbClient.query(`
          SELECT COUNT(*) as total_columns
          FROM information_schema.columns 
          WHERE table_schema = 'public'
        `);

        // Get total rows (this might be slow for large databases)
        const tablesResult = await dbClient.query(`
          SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        `);

        let totalRows = 0;
        for (const table of tablesResult.rows) {
          try {
            const rowResult = await dbClient.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
            totalRows += parseInt(rowResult.rows[0].count);
          } catch (e) {
            // Skip if table can't be counted
          }
        }

        const tableCount = parseInt(tableCountResult.rows[0].table_count);
        const columnCount = parseInt(columnCountResult.rows[0].total_columns);

        grandTotalTables += tableCount;
        grandTotalColumns += columnCount;
        grandTotalRows += totalRows;

        console.log(`\n🗄️  ${dbName.toUpperCase()}`);
        console.log(`    Size: ${db.size}`);
        console.log(`    📋 Tables: ${tableCount}`);
        console.log(`    📝 Columns: ${columnCount}`);
        console.log(`    📊 Rows: ${totalRows.toLocaleString()}`);
        
        if (tableCount > 0) {
          console.log(`    📈 Avg Columns/Table: ${Math.round(columnCount / tableCount)}`);
          console.log(`    📈 Avg Rows/Table: ${Math.round(totalRows / tableCount).toLocaleString()}`);
        }

        // Show top 5 largest tables
        if (tableCount > 0) {
          const topTablesResult = await dbClient.query(`
            SELECT 
              tablename,
              pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size('public.' || tablename) DESC
            LIMIT 5
          `);

          console.log(`    🔝 Top Tables:`);
          topTablesResult.rows.forEach((table, idx) => {
            console.log(`       ${idx + 1}. ${table.tablename} (${table.size})`);
          });
        }

      } catch (dbError) {
        console.log(`\n🗄️  ${dbName.toUpperCase()}`);
        console.log(`    ❌ Cannot analyze: ${dbError.message}`);
      } finally {
        await dbClient.end();
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 GRAND TOTALS ACROSS ALL DATABASES');
    console.log('='.repeat(80));
    console.log(`🗄️  Total Databases: ${dbResult.rows.length}`);
    console.log(`📋 Total Tables: ${grandTotalTables}`);
    console.log(`📝 Total Columns: ${grandTotalColumns}`);
    console.log(`📊 Total Rows: ${grandTotalRows.toLocaleString()}`);
    console.log(`📈 Average Tables/DB: ${Math.round(grandTotalTables / dbResult.rows.length)}`);
    console.log(`📈 Average Columns/DB: ${Math.round(grandTotalColumns / dbResult.rows.length)}`);
    console.log(`📈 Average Rows/DB: ${Math.round(grandTotalRows / dbResult.rows.length).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mainClient.end();
  }
}

getDatabaseSummary();
