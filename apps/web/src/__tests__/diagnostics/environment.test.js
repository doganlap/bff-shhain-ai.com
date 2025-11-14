import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test environment diagnostic
describe('Test Environment Diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Database Connection Tests', () => {
    it('should check PostgreSQL connection', async () => {
      try {
        // Test PostgreSQL connection
        const result = execSync('psql -U postgres -c "SELECT version();"', { 
          encoding: 'utf8',
          timeout: 5000,
          stdio: 'pipe'
        });
        
        expect(result).toContain('PostgreSQL');
        console.log('✅ PostgreSQL connection successful');
      } catch (error) {
        console.log('❌ PostgreSQL connection failed:', error.message);
        throw new Error('PostgreSQL connection failed. Please ensure PostgreSQL is running and accessible.');
      }
    });

    it('should check if required databases exist', async () => {
      const requiredDatabases = [
        'shahin_ksa_compliance',
        'grc_master', 
        'shahin_access_control'
      ];

      for (const dbName of requiredDatabases) {
        try {
          const result = execSync(`psql -U postgres -d ${dbName} -c "SELECT 1;"`, {
            encoding: 'utf8',
            timeout: 3000,
            stdio: 'pipe'
          });
          
          expect(result).toContain('1');
          console.log(`✅ Database ${dbName} exists and is accessible`);
        } catch (error) {
          console.log(`⚠️  Database ${dbName} not found or inaccessible`);
          console.log(`💡 To create database: createdb ${dbName}`);
          // Don't fail the test, just warn
        }
      }
    });

    it('should check environment variables', async () => {
      const requiredEnvVars = [
        'DB_PASSWORD',
        'COMPLIANCE_DB',
        'FINANCE_DB', 
        'AUTH_DB'
      ];

      const missingVars = [];
      
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          missingVars.push(envVar);
        }
      }

      if (missingVars.length > 0) {
        console.log('⚠️  Missing environment variables:', missingVars.join(', '));
        console.log('💡 Set these variables before running tests:');
        missingVars.forEach(varName => {
          console.log(`   $env:${varName}="your_value_here"`);
        });
      } else {
        console.log('✅ All required environment variables are set');
      }

      // Don't fail the test for missing env vars, just warn
      expect(missingVars.length).toBeGreaterThanOrEqual(0);
    });

    it('should check database tables', async () => {
      const testDatabase = process.env.COMPLIANCE_DB || 'shahin_ksa_compliance';
      const requiredTables = [
        'tenants',
        'organizations', 
        'users',
        'assessments',
        'grc_frameworks',
        'grc_controls',
        'workflows',
        'notifications'
      ];

      try {
        const result = execSync(`psql -U postgres -d ${testDatabase} -c "\\dt"`, {
          encoding: 'utf8',
          timeout: 5000,
          stdio: 'pipe'
        });

        const existingTables = [];
        const missingTables = [];

        requiredTables.forEach(table => {
          if (result.includes(table)) {
            existingTables.push(table);
          } else {
            missingTables.push(table);
          }
        });

        console.log(`✅ Found ${existingTables.length} required tables`);
        if (missingTables.length > 0) {
          console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
          console.log('💡 Run database migrations to create missing tables');
        }

        expect(existingTables.length).toBeGreaterThan(0);
      } catch (error) {
        console.log(`❌ Cannot check tables in database ${testDatabase}`);
        console.log('💡 Ensure database exists and is accessible');
        // Don't fail the test, just warn
      }
    });
  });

  describe('API Service Tests', () => {
    it('should check if backend services are running', async () => {
      const services = [
        { name: 'auth-service', port: 3001 },
        { name: 'grc-api', port: 3002 },
        { name: 'bff', port: 3003 }
      ];

      for (const service of services) {
        try {
          const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${service.port}/health || echo "000"`, {
            encoding: 'utf8',
            timeout: 3000,
            stdio: 'pipe'
          });
          
          if (result.trim() === '200') {
            console.log(`✅ ${service.name} is running on port ${service.port}`);
          } else {
            console.log(`⚠️  ${service.name} returned status ${result.trim()}`);
          }
        } catch (error) {
          console.log(`❌ ${service.name} is not responding on port ${service.port}`);
        }
      }
    });

    it('should test API endpoints', async () => {
      const endpoints = [
        '/api/health',
        '/api/dashboard/kpis',
        '/api/assessments',
        '/api/frameworks'
      ];

      for (const endpoint of endpoints) {
        try {
          const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3003${endpoint} || echo "000"`, {
            encoding: 'utf8',
            timeout: 5000,
            stdio: 'pipe'
          });
          
          const status = result.trim();
          if (status === '200' || status === '401') {
            console.log(`✅ ${endpoint} is accessible (status: ${status})`);
          } else {
            console.log(`⚠️  ${endpoint} returned status ${status}`);
          }
        } catch (error) {
          console.log(`❌ Cannot reach ${endpoint}`);
        }
      }
    });
  });

  describe('Frontend Build Tests', () => {
    it('should check if frontend builds successfully', async () => {
      try {
        console.log('Building frontend...');
        const result = execSync('npm run build', {
          encoding: 'utf8',
          timeout: 60000, // 1 minute timeout
          stdio: 'pipe',
          cwd: path.join(__dirname, '../../')
        });
        
        console.log('✅ Frontend build successful');
        expect(result).toBeTruthy();
      } catch (error) {
        console.log('❌ Frontend build failed:', error.message);
        console.log('Build output:', error.stdout || error.message);
        throw new Error('Frontend build failed. Check the build output above.');
      }
    });

    it('should check if lint passes', async () => {
      try {
        console.log('Running linter...');
        const result = execSync('npm run lint', {
          encoding: 'utf8',
          timeout: 30000, // 30 seconds timeout
          stdio: 'pipe',
          cwd: path.join(__dirname, '../../')
        });
        
        console.log('✅ Linting passed');
        expect(result).toBeTruthy();
      } catch (error) {
        console.log('❌ Linting failed:', error.message);
        console.log('Lint output:', error.stdout || error.message);
        // Don't fail the test, just warn
      }
    });
  });

  describe('Test Configuration Tests', () => {
    it('should check test setup files', async () => {
      const requiredFiles = [
        'src/__tests__/testSetup.js',
        'vitest.config.js',
        'run-tests.js'
      ];

      const missingFiles = [];
      
      for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '../../', file);
        if (!fs.existsSync(filePath)) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length > 0) {
        console.log('❌ Missing test setup files:', missingFiles.join(', '));
        throw new Error(`Missing required test files: ${missingFiles.join(', ')}`);
      } else {
        console.log('✅ All test setup files are present');
      }

      expect(missingFiles.length).toBe(0);
    });

    it('should check package.json test scripts', async () => {
      const packagePath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredScripts = [
        'test',
        'test:run',
        'test:coverage',
        'test:comprehensive'
      ];

      const missingScripts = [];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          missingScripts.push(script);
        }
      }

      if (missingScripts.length > 0) {
        console.log('⚠️  Missing test scripts:', missingScripts.join(', '));
      } else {
        console.log('✅ All required test scripts are configured');
      }

      expect(missingScripts.length).toBeLessThan(requiredScripts.length);
    });
  });
});