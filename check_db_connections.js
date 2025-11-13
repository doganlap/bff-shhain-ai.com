const { Client } = require('pg');

async function checkConnections() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('🔍 CHECKING DATABASE CONNECTIONS & BLOCKING ISSUES...\n');

    // Check active connections to all databases
    const connections = await client.query(`
      SELECT 
        datname as database_name,
        pid,
        usename as username,
        application_name,
        client_addr,
        state,
        query_start,
        state_change
      FROM pg_stat_activity 
      WHERE datname IS NOT NULL
      ORDER BY datname, pid
    `);

    console.log('📊 ACTIVE DATABASE CONNECTIONS:');
    console.log('===============================');
    
    const connectionsByDB = {};
    connections.rows.forEach(conn => {
      if (!connectionsByDB[conn.database_name]) {
        connectionsByDB[conn.database_name] = [];
      }
      connectionsByDB[conn.database_name].push(conn);
    });

    Object.keys(connectionsByDB).forEach(dbName => {
      console.log(`\n🗄️ ${dbName}:`);
      connectionsByDB[dbName].forEach(conn => {
        console.log(`   PID: ${conn.pid} | User: ${conn.username} | App: ${conn.application_name || 'N/A'}`);
        console.log(`   State: ${conn.state} | Client: ${conn.client_addr || 'local'}`);
      });
    });

    // Check specifically for assessment_module
    console.log('\n🎯 ASSESSMENT_MODULE CONNECTIONS:');
    console.log('=================================');
    const assessmentConns = connections.rows.filter(conn => conn.database_name === 'assessment_module');
    
    if (assessmentConns.length === 0) {
      console.log('✅ No active connections to assessment_module');
    } else {
      console.log('❌ Active connections found:');
      assessmentConns.forEach(conn => {
        console.log(`   PID: ${conn.pid} | User: ${conn.username} | State: ${conn.state}`);
        console.log(`   App: ${conn.application_name || 'Unknown'}`);
      });
    }

    // Show how to force drop
    console.log('\n💡 SOLUTIONS TO DROP DATABASE:');
    console.log('==============================');
    console.log('1. Terminate active connections first:');
    if (assessmentConns.length > 0) {
      assessmentConns.forEach(conn => {
        console.log(`   SELECT pg_terminate_backend(${conn.pid});`);
      });
    }
    console.log('\n2. Then drop the database:');
    console.log('   DROP DATABASE assessment_module;');
    
    console.log('\n3. Or use force drop (terminates connections automatically):');
    console.log('   DROP DATABASE assessment_module WITH (FORCE);');

  } catch (error) {
    console.error('❌ Error checking connections:', error.message);
  } finally {
    await client.end();
  }
}

checkConnections();
