const axios = require('axios');

async function analyzeDatabaseStructure() {
  try {
    console.log('📊 Analyzing Database Structure - Tables and Columns...\n');
    
    // Step 1: Login as DoganConsult owner
    console.log('1. Logging in as DoganConsult owner...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'ahmet@doganconsult.com',
      password: 'As$123456'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    // Step 2: Get database statistics using our function
    console.log('\n2. Getting database statistics...');
    let schemaTableCount = 0;
    try {
      const statsResponse = await axios.post('http://localhost:5001/api/health', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Database connection status:', statsResponse.data);
    } catch (error) {
      console.log('Health check info:', error.response?.data || 'Not available');
    }
    
    // Step 3: Analyze each table endpoint
    console.log('\n3. Analyzing table structures through API endpoints...\n');
    
    const endpoints = [
      { name: 'Users', url: '/api/users', description: 'User management and authentication' },
      { name: 'Tenants', url: '/api/tenants', description: 'Multi-tenant organization management' },
      { name: 'Regulators', url: '/api/regulators', description: 'Regulatory authorities' },
      { name: 'GRC Frameworks', url: '/api/grc-frameworks', description: 'Compliance frameworks' },
      { name: 'GRC Controls', url: '/api/grc-controls', description: 'Control requirements' },
      { name: 'Assessment Templates', url: '/api/assessment-templates', description: 'Assessment templates' },
      { name: 'Assessments', url: '/api/assessments', description: 'Assessment instances' },
      { name: 'Documents', url: '/api/documents', description: 'Document processing system' },
      { name: 'Organizations', url: '/api/organizations', description: 'Legacy organizations' }
    ];
    
    let totalTables = 0;
    let totalRecords = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:5001${endpoint.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = response.data.data || [];
        const recordCount = Array.isArray(data) ? data.length : (data.length || 0);
        
        console.log(`📋 ${endpoint.name}:`);
        console.log(`   Records: ${recordCount}`);
        console.log(`   Description: ${endpoint.description}`);
        
        if (Array.isArray(data) && data.length > 0) {
          const sampleRecord = data[0];
          const columnCount = Object.keys(sampleRecord).length;
          console.log(`   Columns: ${columnCount}`);
          console.log(`   Sample columns: ${Object.keys(sampleRecord).slice(0, 5).join(', ')}${Object.keys(sampleRecord).length > 5 ? '...' : ''}`);
        } else {
          console.log(`   Columns: Unable to determine (no data)`);
        }
        
        totalTables++;
        totalRecords += recordCount;
        console.log('');
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.data?.message || error.message}`);
        console.log('');
      }
    }
    
    // Step 4: Database Schema Analysis
    console.log('4. Database Schema Analysis from Files...\n');
    
    // Read and analyze schema files
    const fs = require('fs');
    const path = require('path');
    
    try {
      const schemaPath = path.join(__dirname, 'database-schema', 'base_schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Count CREATE TABLE statements
      const tableMatches = schemaContent.match(/CREATE TABLE[^(]*\(/gi);
      schemaTableCount = tableMatches ? tableMatches.length : 0;
      
      console.log(`📊 Schema Analysis:`);
      console.log(`   Tables defined in base_schema.sql: ${schemaTableCount}`);
      
      // Extract table names and approximate column counts
      const tableRegex = /CREATE TABLE[^(]*\s+(\w+)\s*\(([\s\S]*?)\);/gi;
      let match;
      const tableDetails = [];
      
      while ((match = tableRegex.exec(schemaContent)) !== null) {
        const tableName = match[1];
        const tableContent = match[2];
        
        // Count columns (approximate by counting commas and field definitions)
        const columnMatches = tableContent.match(/^\s*\w+\s+/gm);
        const columnCount = columnMatches ? columnMatches.length : 0;
        
        tableDetails.push({
          name: tableName,
          columns: columnCount
        });
      }
      
      console.log('\n📋 Table Details from Schema:');
      tableDetails.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.name}: ~${table.columns} columns`);
      });
      
    } catch (error) {
      console.log('Schema file analysis error:', error.message);
    }
    
    // Step 5: Migration Files Analysis
    console.log('\n5. Migration Files Analysis...\n');
    
    let migrationFiles = [];
    try {
      const migrationsPath = path.join(__dirname, 'backend', 'migrations');
      migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
      
      console.log(`📁 Migration Files: ${migrationFiles.length}`);
      migrationFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
      
    } catch (error) {
      console.log('Migration files analysis error:', error.message);
    }
    
    // Step 6: Summary
    console.log('\n📊 DATABASE STRUCTURE SUMMARY:');
    console.log('==========================================');
    console.log(`🗄️  Active API Tables: ${totalTables}`);
    console.log(`📊 Total Records: ${totalRecords}`);
    const schemaTableCountSafe = typeof schemaTableCount === 'number' ? schemaTableCount : 0;
    const migrationFilesSafe = Array.isArray(migrationFiles) ? migrationFiles : [];
    console.log(`📋 Schema Tables: ${schemaTableCountSafe}`);
    console.log(`🔄 Migration Files: ${migrationFilesSafe.length}`);
    
    console.log('\n🎯 KEY TABLES:');
    console.log('- Users (Authentication & RBAC)');
    console.log('- Tenants (Multi-tenant architecture)');
    console.log('- Regulators (Regulatory authorities)');
    console.log('- GRC Frameworks (Compliance frameworks)');
    console.log('- GRC Controls (Control requirements)');
    console.log('- Assessment Templates (Template system)');
    console.log('- Documents (Document processing)');
    console.log('- Processing Jobs (Async processing)');
    console.log('- Search Queries (Search analytics)');
    console.log('- RAG Responses (AI responses)');
    
    console.log('\n✅ Database structure analysis complete!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data || error.message);
  }
}

analyzeDatabaseStructure();
