const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration for setup
const setupConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: 'postgres', // Use postgres superuser for setup
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: 'postgres' // Connect to default postgres database
};

const targetConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'grc_template',
  user: process.env.DB_USER || 'grc_user',
  password: process.env.DB_PASSWORD || 'grc_secure_password_2024'
};

async function setupDatabase() {
  const setupPool = new Pool(setupConfig);
  
  try {
    console.log('🔄 Setting up GRC Template database...');
    
    // Drop and recreate the database for a clean setup
    try {
      // Terminate all connections to the target database
      await setupPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${targetConfig.database}'
          AND pid <> pg_backend_pid();
      `);
      await setupPool.query(`DROP DATABASE IF EXISTS "${targetConfig.database}"`);
      console.log(`ℹ️  Dropped existing database "${targetConfig.database}"`);
      await setupPool.query(`CREATE DATABASE "${targetConfig.database}"`);
      console.log(`✅ Database "${targetConfig.database}" created`);
    } catch (error) {
      if (error.code === '3D000') { // database_does_not_exist
        // This is fine, we'll create it next
        await setupPool.query(`CREATE DATABASE "${targetConfig.database}"`);
        console.log(`✅ Database "${targetConfig.database}" created`);
      } else {
        throw error;
      }
    }
    
    // Create user if it doesn't exist
    try {
      await setupPool.query(`CREATE USER "${targetConfig.user}" WITH PASSWORD '${targetConfig.password}'`);
      console.log(`✅ User "${targetConfig.user}" created`);
    } catch (error) {
      if (error.code === '42710') {
        console.log(`ℹ️  User "${targetConfig.user}" already exists`);
      } else {
        throw error;
      }
    }
    
    // Grant privileges
    await setupPool.query(`GRANT ALL PRIVILEGES ON DATABASE "${targetConfig.database}" TO "${targetConfig.user}"`);
    await setupPool.query(`ALTER USER "${targetConfig.user}" CREATEDB`);
    
    // Connect to target database to grant schema permissions
    const tempPool = new Pool({...setupConfig, database: targetConfig.database});
    await tempPool.query(`GRANT ALL ON SCHEMA public TO "${targetConfig.user}"`);
    await tempPool.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${targetConfig.user}"`);
    await tempPool.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${targetConfig.user}"`);
    await tempPool.end();
    
    console.log(`✅ Privileges granted to "${targetConfig.user}"`);
    
    await setupPool.end();
    
    // Now connect to the target database and create schema
    const targetPool = new Pool(targetConfig);
    
    try {
      // Read and execute base schema
      const schemaPath = path.join(__dirname, '../../database-schema/base_schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await targetPool.query(schema);
        console.log('✅ Base schema created');
      }
      
      // Read and execute sector intelligence fields
      const sectorPath = path.join(__dirname, '../../database-schema/sector_intelligence_fields.sql');
      if (fs.existsSync(sectorPath)) {
        const sectorSchema = fs.readFileSync(sectorPath, 'utf8');
        await targetPool.query(sectorSchema);
        console.log('✅ Sector intelligence fields added');
      }
      
      // Read and execute organizations comprehensive schema
      const orgPath = path.join(__dirname, '../../database-schema/organizations_comprehensive.sql');
      if (fs.existsSync(orgPath)) {
        const orgSchema = fs.readFileSync(orgPath, 'utf8');
        await targetPool.query(orgSchema);
        console.log('✅ Organizations comprehensive schema applied');
      }
      
    } catch (error) {
      // Create basic organizations table
      await targetPool.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          sector VARCHAR(100),
          country VARCHAR(100),
          email VARCHAR(255),
          phone VARCHAR(50),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Basic organizations table created');
    }

    // Read and execute all migration files
    const migrationsPath = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.sql')).sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsPath, file);
      const migration = fs.readFileSync(filePath, 'utf8');
      await targetPool.query(migration);
      console.log(`✅ Migration applied: ${file}`);
    }
    
    await targetPool.end();
    
    console.log('🎉 Database setup completed successfully!');
    console.log(`📊 Database: ${targetConfig.database}`);
    console.log(`👤 User: ${targetConfig.user}`);
    console.log(`🔗 Connection: ${targetConfig.host}:${targetConfig.port}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
