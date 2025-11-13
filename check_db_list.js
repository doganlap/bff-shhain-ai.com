const { Client } = require('pg');

async function checkDatabases() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default postgres db to list all databases
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('🔍 Checking PostgreSQL databases...\n');

    // List all databases
    const result = await client.query(`
      SELECT 
        datname as database_name, 
        pg_size_pretty(pg_database_size(datname)) as size,
        datcollate as collation
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `);

    console.log('📊 DATABASES FOUND:');
    console.log('==================');
    result.rows.forEach((db, index) => {
      console.log(`${index + 1}. ${db.database_name}`);
      console.log(`   Size: ${db.size}`);
      console.log(`   Collation: ${db.collation}`);
      console.log('');
    });

    console.log(`📈 Total Databases: ${result.rows.length}`);

    // Check current database being used by the app
    console.log('\n🔗 CURRENT APP CONNECTION:');
    console.log('==========================');
    console.log(`Database: ${process.env.POSTGRES_DB || 'grc_master'}`);
    console.log(`Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.POSTGRES_PORT || '5432'}`);
    console.log(`User: ${process.env.POSTGRES_USER || 'postgres'}`);

  } catch (error) {
    console.error('❌ Error checking databases:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabases();
