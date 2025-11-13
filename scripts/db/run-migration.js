const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigration(migrationFile) {
  try {
    console.log(`🔄 Running migration: ${migrationFile}`);
    
    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log(`✅ Migration completed: ${migrationFile}`);
    
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`);
    console.error('Error:', error.message);
    throw error;
  }
}

// Run specific migration if provided as argument
if (require.main === module) {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('Usage: node run-migration.js <migration-file>');
    console.error('Example: node run-migration.js 001_add_tenants_table.sql');
    process.exit(1);
  }
  
  runMigration(migrationFile)
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigration };
