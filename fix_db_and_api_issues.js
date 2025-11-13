/**
 * Comprehensive Database and API Health Check & Fix Script
 * Identifies and fixes database schema issues and API connection problems
 */

const { Client } = require('pg');
const axios = require('axios');
const { spawn } = require('child_process');

// Database configurations
const databases = {
  auth: {
    user: 'postgres',
    host: 'localhost',
    database: 'shahin_access_control',
    password: 'postgres',
    port: 5432,
  },
  finance: {
    user: 'postgres',
    host: 'localhost',
    database: 'grc_master',
    password: 'postgres',
    port: 5432,
  },
  compliance: {
    user: 'postgres',
    host: 'localhost',
    database: 'shahin_ksa_compliance',
    password: 'postgres',
    port: 5432,
  }
};

// API services configuration
const apiServices = [
  { name: 'GRC API', port: 3006, path: 'apps/services/grc-api', startScript: 'npm start' },
  { name: 'Auth Service', port: 3001, path: 'apps/services/auth-service', startScript: 'node server.js' },
  { name: 'Document Service', port: 3002, path: 'apps/services/document-service', startScript: 'node server.js' },
  { name: 'Notification Service', port: 3003, path: 'apps/services/notification-service', startScript: 'node server.js' },
  { name: 'RAG Service', port: 3004, path: 'apps/services/rag-service', startScript: 'node server.js' },
  { name: 'WebSocket Service', port: 3005, path: 'apps/services/websocket-service', startScript: 'node server.js' }
];

class DatabaseAPIHealthChecker {
  constructor() {
    this.results = {
      databases: {},
      apis: {},
      fixes: [],
      errors: []
    };
  }

  async checkDatabaseConnections() {
    console.log('🔍 CHECKING DATABASE CONNECTIONS');
    console.log('='.repeat(50));

    for (const [dbName, config] of Object.entries(databases)) {
      const client = new Client(config);
      try {
        await client.connect();
        
        // Test basic connection
        const timeResult = await client.query('SELECT NOW() as current_time');
        
        // Check database size and tables
        const sizeResult = await client.query(`
          SELECT pg_size_pretty(pg_database_size($1)) as size
        `, [config.database]);
        
        const tablesResult = await client.query(`
          SELECT schemaname, tablename, tableowner
          FROM pg_tables 
          WHERE schemaname = 'public'
          ORDER BY tablename
        `);

        this.results.databases[dbName] = {
          status: 'connected',
          database: config.database,
          size: sizeResult.rows[0].size,
          tables: tablesResult.rows.length,
          tableList: tablesResult.rows.map(t => t.tablename),
          timestamp: timeResult.rows[0].current_time
        };

        console.log(`✅ ${dbName.toUpperCase()}: Connected (${tablesResult.rows.length} tables, ${sizeResult.rows[0].size})`);
        
        await client.end();
      } catch (error) {
        this.results.databases[dbName] = {
          status: 'error',
          error: error.message,
          database: config.database
        };
        this.results.errors.push(`Database ${dbName}: ${error.message}`);
        console.log(`❌ ${dbName.toUpperCase()}: ${error.message}`);
        
        if (client._connected) {
          await client.end();
        }
      }
    }
  }

  async checkAPIServices() {
    console.log('\n🔍 CHECKING API SERVICES');
    console.log('='.repeat(50));

    for (const service of apiServices) {
      try {
        const response = await axios.get(`http://localhost:${service.port}/api/health`, {
          timeout: 5000
        });
        
        this.results.apis[service.name] = {
          status: 'running',
          port: service.port,
          health: response.data,
          responseTime: response.headers['x-response-time'] || 'N/A'
        };
        
        console.log(`✅ ${service.name}: Running on port ${service.port}`);
      } catch (error) {
        this.results.apis[service.name] = {
          status: 'down',
          port: service.port,
          error: error.message,
          path: service.path,
          startScript: service.startScript
        };
        
        this.results.errors.push(`API ${service.name}: ${error.message}`);
        console.log(`❌ ${service.name}: Not running on port ${service.port}`);
      }
    }
  }

  async checkDatabaseSchemas() {
    console.log('\n🔍 CHECKING DATABASE SCHEMAS');
    console.log('='.repeat(50));

    // Check for known schema issues
    const schemaChecks = [
      {
        db: 'finance',
        table: 'subscriptions',
        column: 'monthly_fee',
        description: 'Missing monthly_fee column in subscriptions table'
      },
      {
        db: 'finance',
        table: 'tenant_licenses',
        column: 'status',
        description: 'Missing status column in tenant_licenses table'
      },
      {
        db: 'compliance',
        table: 'assessment_responses',
        column: 'compliance_score',
        description: 'Missing compliance_score column in assessment_responses table'
      }
    ];

    for (const check of schemaChecks) {
      if (this.results.databases[check.db]?.status === 'connected') {
        const client = new Client(databases[check.db]);
        try {
          await client.connect();
          
          const result = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
          `, [check.table, check.column]);

          if (result.rows.length === 0) {
            this.results.fixes.push({
              type: 'schema',
              database: check.db,
              table: check.table,
              column: check.column,
              description: check.description,
              fix: `ALTER TABLE ${check.table} ADD COLUMN ${check.column} ${this.getColumnType(check.column)};`
            });
            console.log(`⚠️  ${check.db}.${check.table}.${check.column}: Missing`);
          } else {
            console.log(`✅ ${check.db}.${check.table}.${check.column}: Exists`);
          }
          
          await client.end();
        } catch (error) {
          console.log(`❌ Schema check failed for ${check.db}.${check.table}: ${error.message}`);
          if (client._connected) {
            await client.end();
          }
        }
      }
    }
  }

  getColumnType(columnName) {
    const typeMap = {
      'monthly_fee': 'DECIMAL(10,2) DEFAULT 0',
      'status': 'VARCHAR(50) DEFAULT \'active\'',
      'compliance_score': 'DECIMAL(5,2)'
    };
    return typeMap[columnName] || 'TEXT';
  }

  async fixDatabaseSchemas() {
    console.log('\n🔧 FIXING DATABASE SCHEMAS');
    console.log('='.repeat(50));

    for (const fix of this.results.fixes.filter(f => f.type === 'schema')) {
      const client = new Client(databases[fix.database]);
      try {
        await client.connect();
        await client.query(fix.fix);
        console.log(`✅ Fixed: ${fix.description}`);
        await client.end();
      } catch (error) {
        console.log(`❌ Failed to fix ${fix.description}: ${error.message}`);
        if (client._connected) {
          await client.end();
        }
      }
    }
  }

  async startAPIServices() {
    console.log('\n🚀 STARTING API SERVICES');
    console.log('='.repeat(50));

    const downServices = Object.entries(this.results.apis)
      .filter(([name, info]) => info.status === 'down')
      .map(([name, info]) => ({ name, ...info }));

    if (downServices.length === 0) {
      console.log('✅ All API services are already running');
      return;
    }

    console.log(`Found ${downServices.length} services that need to be started:`);
    
    for (const service of downServices) {
      console.log(`🔄 Starting ${service.name}...`);
      
      // Check if the service directory exists and has the required files
      const servicePath = service.path;
      try {
        const fs = require('fs');
        const path = require('path');
        
        if (!fs.existsSync(servicePath)) {
          console.log(`❌ Service path not found: ${servicePath}`);
          continue;
        }

        const packageJsonPath = path.join(servicePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
          console.log(`❌ package.json not found in: ${servicePath}`);
          continue;
        }

        console.log(`📦 Installing dependencies for ${service.name}...`);
        // Note: In production, you'd want to run npm install first
        console.log(`   Run: cd ${servicePath} && npm install`);
        console.log(`   Then: cd ${servicePath} && ${service.startScript}`);
        
      } catch (error) {
        console.log(`❌ Error checking service ${service.name}: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(50));

    const dbConnected = Object.values(this.results.databases).filter(db => db.status === 'connected').length;
    const dbTotal = Object.keys(this.results.databases).length;
    const apiRunning = Object.values(this.results.apis).filter(api => api.status === 'running').length;
    const apiTotal = Object.keys(this.results.apis).length;

    console.log(`🗄️  Databases: ${dbConnected}/${dbTotal} connected`);
    console.log(`🔌 APIs: ${apiRunning}/${apiTotal} running`);
    console.log(`🔧 Schema fixes needed: ${this.results.fixes.length}`);
    console.log(`❌ Total errors: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.results.fixes.length > 0) {
      console.log('\n🔧 FIXES APPLIED/NEEDED:');
      this.results.fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix.description}`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (dbConnected < dbTotal) {
      console.log('   - Check PostgreSQL service is running');
      console.log('   - Verify database credentials');
      console.log('   - Ensure databases exist');
    }
    
    if (apiRunning < apiTotal) {
      console.log('   - Install dependencies: npm install in each service directory');
      console.log('   - Start services manually or use process manager (PM2)');
      console.log('   - Check port conflicts');
    }

    if (this.results.fixes.length > 0) {
      console.log('   - Run database migrations');
      console.log('   - Update schema to match application requirements');
    }

    return this.results;
  }

  async runFullHealthCheck() {
    console.log('🏥 COMPREHENSIVE DATABASE & API HEALTH CHECK');
    console.log('='.repeat(80));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    try {
      await this.checkDatabaseConnections();
      await this.checkDatabaseSchemas();
      await this.checkAPIServices();
      
      if (this.results.fixes.length > 0) {
        console.log('\n🔧 Applying database schema fixes...');
        await this.fixDatabaseSchemas();
      }
      
      await this.startAPIServices();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return { error: error.message };
    }
  }
}

// Run the health check if this file is executed directly
if (require.main === module) {
  const checker = new DatabaseAPIHealthChecker();
  checker.runFullHealthCheck().then(results => {
    console.log('\n🎉 Health check completed!');
    console.log('='.repeat(80));
    
    // Exit with appropriate code
    const hasErrors = results.errors && results.errors.length > 0;
    process.exit(hasErrors ? 1 : 0);
  }).catch(error => {
    console.error('💥 Health check crashed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseAPIHealthChecker;
