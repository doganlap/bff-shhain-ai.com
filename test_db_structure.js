const { query } = require('./apps/services/grc-api/config/database');

async function testDB() {
  try {
    console.log('Testing database structure...');
    
    // Test frameworks table
    const frameworks = await query('SELECT * FROM grc_frameworks LIMIT 1');
    console.log('Frameworks table:', frameworks.rows);
    
    // Test column existence
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'grc_frameworks' 
      ORDER BY column_name
    `);
    console.log('Framework columns:', columns.rows);
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDB();
