const { Client } = require('pg');

async function analyzeDatabases() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('🔍 ANALYZING DATABASE USAGE...\n');

    // Get all databases with detailed info
    const result = await client.query(`
      SELECT 
        datname as database_name, 
        pg_size_pretty(pg_database_size(datname)) as size,
        pg_database_size(datname) as size_bytes,
        datcollate as collation,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = pg_database.datname) as active_connections
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY pg_database_size(datname) DESC
    `);

    console.log('📊 DATABASE ANALYSIS (Sorted by Size):');
    console.log('=====================================');
    
    let totalSize = 0;
    const recommendations = {
      keep: [],
      consolidate: [],
      delete: []
    };

    result.rows.forEach((db, index) => {
      totalSize += parseInt(db.size_bytes);
      console.log(`${index + 1}. ${db.database_name}`);
      console.log(`   Size: ${db.size} (${db.size_bytes} bytes)`);
      console.log(`   Active Connections: ${db.active_connections}`);
      
      // Categorize databases
      if (db.database_name === 'postgres') {
        recommendations.keep.push({name: db.database_name, reason: 'System default database'});
      } else if (db.database_name === 'grc_master') {
        recommendations.keep.push({name: db.database_name, reason: 'Current production database'});
      } else if (db.database_name.includes('test_')) {
        recommendations.delete.push({name: db.database_name, reason: 'Test database - can be recreated'});
      } else if (db.size_bytes < 8000000) { // Less than 8MB
        recommendations.delete.push({name: db.database_name, reason: 'Small size - likely unused or test data'});
      } else if (db.database_name.includes('grc_') || db.database_name.includes('assessment_')) {
        recommendations.consolidate.push({name: db.database_name, reason: 'Similar to grc_master - consider merging'});
      } else {
        recommendations.consolidate.push({name: db.database_name, reason: 'Review for consolidation'});
      }
      
      console.log('');
    });

    console.log(`📈 TOTAL STORAGE: ${(totalSize / 1024 / 1024).toFixed(2)} MB across ${result.rows.length} databases\n`);

    // Show recommendations
    console.log('🎯 CLEANUP RECOMMENDATIONS:');
    console.log('===========================');
    
    console.log('\n✅ KEEP (Essential):');
    recommendations.keep.forEach(db => {
      console.log(`   • ${db.name} - ${db.reason}`);
    });
    
    console.log('\n🔄 CONSOLIDATE (Review & Merge):');
    recommendations.consolidate.forEach(db => {
      console.log(`   • ${db.name} - ${db.reason}`);
    });
    
    console.log('\n🗑️ SAFE TO DELETE:');
    recommendations.delete.forEach(db => {
      console.log(`   • ${db.name} - ${db.reason}`);
    });

    console.log('\n💡 CONSOLIDATION PLAN:');
    console.log('=====================');
    console.log('1. Keep: postgres (system) + grc_master (production)');
    console.log('2. Backup important data from other GRC databases');
    console.log('3. Merge useful data into grc_master');
    console.log('4. Drop unused/test databases');
    console.log('5. Target: 2-3 databases maximum');

  } catch (error) {
    console.error('❌ Error analyzing databases:', error.message);
  } finally {
    await client.end();
  }
}

analyzeDatabases();
