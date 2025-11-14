const { Client } = require('pg');
require('dotenv').config({ path: 'd:/Projects/ShahinAI/src/api/.env' });

async function getDatabaseAssetSummary() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    const query = `
      SELECT 'Tables' as asset_type, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'
      UNION ALL
      SELECT 'Views' as asset_type, COUNT(*) as count FROM information_schema.views WHERE table_schema = 'public'
      UNION ALL
      SELECT 'Functions' as asset_type, COUNT(*) as count FROM information_schema.routines WHERE specific_schema = 'public'
      UNION ALL
      SELECT 'Indexes' as asset_type, COUNT(*) as count FROM pg_indexes WHERE schemaname = 'public'
      UNION ALL
      SELECT 'Triggers' as asset_type, COUNT(*) as count FROM information_schema.triggers WHERE trigger_schema = 'public'
      ORDER BY asset_type;
    `;

    const res = await client.query(query);
    let totalAssets = 0;
    res.rows.forEach(row => {
      totalAssets += parseInt(row.count, 10);
    });

    console.log('\n--- Database Asset Summary ---');
    console.table(res.rows);
    console.log(`Total Database Assets: ${totalAssets}`);
    console.log('----------------------------\n');

  } catch (err) {
    console.error('Error connecting to or querying the database', err);
  } finally {
    await client.end();
    console.log('Disconnected from the database.');
  }
}

getDatabaseAssetSummary();