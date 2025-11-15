const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and tables...\n');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`📊 Found ${tables.length} tables in database:`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    
    console.log('\n📋 Table details:');
    
    // Get detailed info for each table
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get column count
      const columnCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
      `;
      
      // Get row count
      let rowCount = 0;
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
        rowCount = result[0].count;
      } catch (error) {
        rowCount = 'error';
      }
      
      console.log(`\n📄 ${tableName}:`);
      console.log(`   Columns: ${columnCount[0].count}`);
      console.log(`   Rows: ${rowCount}`);
      
      // Get column details
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      console.log('   Structure:');
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
    // Get indexes
    console.log('\n🔑 Indexes:');
    const indexes = await prisma.$queryRaw`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    
    let currentTable = '';
    indexes.forEach(index => {
      if (currentTable !== index.tablename) {
        console.log(`\n📄 ${index.tablename}:`);
        currentTable = index.tablename;
      }
      console.log(`   - ${index.indexname}`);
    });
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();