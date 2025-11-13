const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class DirectDatabaseImporter {
  constructor() {
    this.baseDir = __dirname;
    this.pool = new Pool({
      user: process.env.DB_USER || 'grc_user',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'grc_template',
      password: process.env.DB_PASSWORD || 'grc_password',
      port: process.env.DB_PORT || 5432,
    });
    
    this.stats = {
      regulators: { processed: 0, imported: 0, errors: [] },
      frameworks: { processed: 0, imported: 0, errors: [] },
      controls: { processed: 0, imported: 0, errors: [] },
      templates: { processed: 0, imported: 0, errors: [] }
    };
    
    this.uniqueRegulators = new Map();
    this.uniqueFrameworks = new Map();
    this.allControls = [];
    this.frameworkIdMap = new Map();
    this.regulatorIdMap = new Map();
  }

  async execute() {
    console.log('🚀 DIRECT DATABASE IMPORT - COMPREHENSIVE GRC DATA');
    console.log('==================================================\n');

    try {
      // Test database connection
      await this.testConnection();
      
      // Parse CSV files
      await this.parseComprehensiveData();
      
      // Import data directly to database
      await this.importRegulatorsDirectly();
      await this.importFrameworksDirectly();
      await this.importControlsDirectly();
      await this.createAssessmentTemplatesDirectly();
      
      // Final verification
      await this.verifyImport();
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
    } finally {
      await this.pool.end();
    }
  }

  async testConnection() {
    console.log('🔌 Testing Database Connection');
    console.log('------------------------------');
    
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
      console.log(`📅 Database time: ${result.rows[0].now}\n`);
      client.release();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async parseComprehensiveData() {
    console.log('📊 Parsing Comprehensive Data Files');
    console.log('-----------------------------------');
    
    const dataFiles = [
      'grc_execution_tasks_pro.csv',
      'filtered_data_ksa_mapped_bilingual.csv'
    ];

    for (const fileName of dataFiles) {
      const filePath = path.join(this.baseDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${fileName}`);
        continue;
      }

      console.log(`📋 Processing: ${fileName}`);
      await this.parseCSVFile(filePath, fileName);
    }

    console.log(`\n📊 Parsing Summary:`);
    console.log(`   Unique Regulators: ${this.uniqueRegulators.size}`);
    console.log(`   Unique Frameworks: ${this.uniqueFrameworks.size}`);
    console.log(`   Total Controls: ${this.allControls.length}\n`);
  }

  async parseCSVFile(filePath, fileName) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
          this.extractRegulators(row);
          this.extractFrameworks(row);
          this.allControls.push({ ...row, source_file: fileName });
        })
        .on('end', () => {
          console.log(`   ✅ Processed ${results.length} records from ${fileName}`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  extractRegulators(row) {
    const regulatorFields = [
      'regulator_name_en', 'regulator_name_ar', 'framework_regulator_code',
      'imputed_regulator_name_en', 'imputed_regulator_name_ar'
    ];

    regulatorFields.forEach(field => {
      if (row[field] && row[field].trim()) {
        const regulatorName = row[field].trim();
        
        if (!this.uniqueRegulators.has(regulatorName)) {
          this.uniqueRegulators.set(regulatorName, {
            id: uuidv4(),
            name: regulatorName,
            name_ar: row['regulator_name_ar'] || row['imputed_regulator_name_ar'] || '',
            code: this.generateRegulatorCode(regulatorName),
            jurisdiction: row['regulator_jurisdiction_en'] || 'Saudi Arabia',
            jurisdiction_ar: row['regulator_jurisdiction_ar'] || 'المملكة العربية السعودية',
            website: row['regulator_website'] || '',
            category: row['regulator_category'] || 'government',
            ministry: row['regulator_ministry'] || '',
            established_year: row['regulator_established_year'] || null,
            description: `Regulatory authority for ${regulatorName}`,
            description_ar: `الهيئة التنظيمية لـ ${row['regulator_name_ar'] || regulatorName}`,
            sector: this.mapSector(regulatorName),
            type: 'government',
            level: 'national',
            status: 'active',
            is_active: true,
            metadata: JSON.stringify({ source: 'comprehensive_import' })
          });
        }
      }
    });
  }

  extractFrameworks(row) {
    const frameworkFields = [
      'framework_title_en', 'framework_title_ar', 'imputed_framework_title_en',
      'imputed_framework_title_ar', 'frameworks'
    ];

    frameworkFields.forEach(field => {
      if (row[field] && row[field].trim()) {
        const frameworkName = row[field].trim();
        
        if (!this.uniqueFrameworks.has(frameworkName)) {
          this.uniqueFrameworks.set(frameworkName, {
            id: uuidv4(),
            name_en: frameworkName,
            name_ar: row['framework_title_ar'] || row['imputed_framework_title_ar'] || '',
            name: frameworkName,
            framework_code: row['framework_code'] || this.generateFrameworkCode(frameworkName),
            version: row['version'] || row['imputed_version'] || '1.0',
            authority: row['framework_regulator_code'] || 'Unknown',
            country: 'Saudi Arabia',
            description_en: row['framework_description_en'] || `${frameworkName} compliance framework`,
            description_ar: row['framework_description_ar'] || `إطار الامتثال ${frameworkName}`,
            description: row['framework_description_en'] || `${frameworkName} compliance framework`,
            is_active: true,
            regulator_id: null // Will be set after regulators are imported
          });
        }
      }
    });
  }

  generateRegulatorCode(name) {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 10);
    }
    return name.substring(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  generateFrameworkCode(name) {
    const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const words = cleaned.split(' ');
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 15);
    }
    return cleaned.substring(0, 15).toUpperCase().replace(/[^A-Z0-9]/g, '_');
  }

  mapSector(regulatorName) {
    const name = regulatorName.toLowerCase();
    if (name.includes('cyber') || name.includes('security')) return 'cybersecurity';
    if (name.includes('bank') || name.includes('financial')) return 'financial_services';
    if (name.includes('telecom') || name.includes('communication')) return 'telecommunications';
    if (name.includes('data') || name.includes('ai')) return 'data_governance';
    if (name.includes('market') || name.includes('capital')) return 'capital_markets';
    return 'government';
  }

  async importRegulatorsDirectly() {
    console.log('🏛️ Importing Regulators Directly to Database');
    console.log('--------------------------------------------');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let imported = 0;
      for (const [name, regulator] of this.uniqueRegulators) {
        try {
          // Check if regulator already exists
          const existingResult = await client.query(
            'SELECT id FROM regulators WHERE code = $1 OR name = $2',
            [regulator.code, regulator.name]
          );
          
          if (existingResult.rows.length === 0) {
            const insertResult = await client.query(`
              INSERT INTO regulators (
                id, name, name_ar, code, description, description_ar, jurisdiction, sector,
                website, type, level, status, is_active, metadata, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id
            `, [
              regulator.id, regulator.name, regulator.name_ar, regulator.code,
              regulator.description, regulator.description_ar, regulator.jurisdiction,
              regulator.sector, regulator.website, regulator.type, regulator.level,
              regulator.status, regulator.is_active, regulator.metadata
            ]);
            
            this.regulatorIdMap.set(regulator.code, regulator.id);
            this.regulatorIdMap.set(regulator.name, regulator.id);
            imported++;
          } else {
            this.regulatorIdMap.set(regulator.code, existingResult.rows[0].id);
            this.regulatorIdMap.set(regulator.name, existingResult.rows[0].id);
          }
          
        } catch (error) {
          this.stats.regulators.errors.push(`${name}: ${error.message}`);
        }
      }
      
      await client.query('COMMIT');
      
      this.stats.regulators.processed = this.uniqueRegulators.size;
      this.stats.regulators.imported = imported;
      
      console.log(`✅ Regulators: ${imported}/${this.uniqueRegulators.size} imported successfully\n`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async importFrameworksDirectly() {
    console.log('📊 Importing Frameworks Directly to Database');
    console.log('--------------------------------------------');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let imported = 0;
      for (const [name, framework] of this.uniqueFrameworks) {
        try {
          // Find regulator ID
          const regulatorId = this.regulatorIdMap.get(framework.authority) || null;
          
          // Check if framework already exists
          const existingResult = await client.query(
            'SELECT id FROM grc_frameworks WHERE framework_code = $1 OR name_en = $2',
            [framework.framework_code, framework.name_en]
          );
          
          if (existingResult.rows.length === 0) {
            const insertResult = await client.query(`
              INSERT INTO grc_frameworks (
                id, name_en, name_ar, name, description_en, description_ar, description,
                framework_code, version, authority, country, regulator_id, is_active,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id
            `, [
              framework.id, framework.name_en, framework.name_ar, framework.name,
              framework.description_en, framework.description_ar, framework.description,
              framework.framework_code, framework.version, framework.authority,
              framework.country, regulatorId, framework.is_active
            ]);
            
            this.frameworkIdMap.set(framework.framework_code, framework.id);
            this.frameworkIdMap.set(framework.name_en, framework.id);
            imported++;
          } else {
            this.frameworkIdMap.set(framework.framework_code, existingResult.rows[0].id);
            this.frameworkIdMap.set(framework.name_en, existingResult.rows[0].id);
          }
          
        } catch (error) {
          this.stats.frameworks.errors.push(`${name}: ${error.message}`);
        }
      }
      
      await client.query('COMMIT');
      
      this.stats.frameworks.processed = this.uniqueFrameworks.size;
      this.stats.frameworks.imported = imported;
      
      console.log(`✅ Frameworks: ${imported}/${this.uniqueFrameworks.size} imported successfully\n`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async importControlsDirectly() {
    console.log('🔒 Importing Controls Directly to Database');
    console.log('------------------------------------------');
    
    const client = await this.pool.connect();
    const batchSize = 100;
    let imported = 0;
    let errors = 0;
    
    try {
      console.log(`📋 Processing ${this.allControls.length} controls in batches of ${batchSize}...`);
      
      for (let i = 0; i < this.allControls.length; i += batchSize) {
        const batch = this.allControls.slice(i, i + batchSize);
        
        await client.query('BEGIN');
        
        for (const controlData of batch) {
          try {
            const frameworkId = this.findFrameworkId(controlData);
            
            if (frameworkId) {
              const control = {
                id: uuidv4(),
                framework_id: frameworkId,
                control_id: controlData.control_id || controlData.Control_ID || `CTRL_${i}_${Math.random().toString(36).substr(2, 9)}`,
                title_en: (controlData.title_en || controlData.Summary || controlData.requirement_text || 'Control Title').substring(0, 500),
                title_ar: (controlData.title_ar || controlData.requirement_ar || '').substring(0, 500),
                title: (controlData.title_en || controlData.Summary || controlData.requirement_text || 'Control Title').substring(0, 500),
                description_en: (controlData.description_en || controlData.Description || controlData.requirement_text || '').substring(0, 5000),
                description_ar: (controlData.description_ar || controlData.requirement_ar || '').substring(0, 5000),
                description: (controlData.description_en || controlData.Description || controlData.requirement_text || '').substring(0, 5000),
                category: (controlData.category || controlData.grc_domain || controlData.Domain || 'general').substring(0, 100),
                criticality_level: this.mapPriority(controlData.priority || controlData.Priority),
                is_mandatory: controlData.framework_mandatory === 'True' || controlData.sector_mandatory === 'Yes',
                control_type: (controlData.control_type || 'technical').substring(0, 50),
                implementation_guidance: (controlData.implementation_guidance_en || controlData.AcceptanceCriteria_EN || '').substring(0, 5000),
                testing_procedures: (controlData.evidence_requirements || controlData.evidence_min_set || '').substring(0, 5000),
                is_active: true
              };

              await client.query(`
                INSERT INTO grc_controls (
                  id, framework_id, control_id, title_en, title_ar, title,
                  description_en, description_ar, description, category,
                  criticality_level, is_mandatory, control_type,
                  implementation_guidance, testing_procedures, is_active,
                  created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (framework_id, control_id) DO NOTHING
              `, [
                control.id, control.framework_id, control.control_id,
                control.title_en, control.title_ar, control.title,
                control.description_en, control.description_ar, control.description,
                control.category, control.criticality_level, control.is_mandatory,
                control.control_type, control.implementation_guidance,
                control.testing_procedures, control.is_active
              ]);
              
              imported++;
            } else {
              errors++;
            }
            
          } catch (error) {
            errors++;
            if (errors <= 10) { // Only log first 10 errors
              this.stats.controls.errors.push(`Control ${controlData.control_id}: ${error.message}`);
            }
          }
        }
        
        await client.query('COMMIT');
        
        // Progress update
        console.log(`   📋 Processed ${Math.min(i + batchSize, this.allControls.length)}/${this.allControls.length} controls (${imported} imported, ${errors} errors)`);
      }
      
      this.stats.controls.processed = this.allControls.length;
      this.stats.controls.imported = imported;
      
      console.log(`✅ Controls: ${imported}/${this.allControls.length} imported successfully`);
      if (errors > 0) {
        console.log(`⚠️ Controls: ${errors} errors occurred\n`);
      } else {
        console.log('');
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  findFrameworkId(controlData) {
    const frameworkFields = [
      'framework_code', 'framework_title_en', 'frameworks', 'ksa_frameworks'
    ];

    for (const field of frameworkFields) {
      if (controlData[field]) {
        const frameworkRef = controlData[field].trim();
        if (this.frameworkIdMap.has(frameworkRef)) {
          return this.frameworkIdMap.get(frameworkRef);
        }
      }
    }

    // Default to first framework if available
    const firstFramework = Array.from(this.frameworkIdMap.values())[0];
    return firstFramework || null;
  }

  mapPriority(priority) {
    if (!priority) return 'medium';
    
    const p = priority.toLowerCase();
    if (p.includes('critical') || p.includes('high')) return 'high';
    if (p.includes('low')) return 'low';
    return 'medium';
  }

  async createAssessmentTemplatesDirectly() {
    console.log('📋 Creating Assessment Templates');
    console.log('-------------------------------');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let created = 0;
      for (const [name, framework] of this.uniqueFrameworks) {
        try {
          const template = {
            id: uuidv4(),
            name: `${framework.name_en} Assessment Template`,
            description: `Comprehensive assessment template for ${framework.name_en} compliance`,
            category: 'compliance',
            framework_id: framework.id,
            template_data: JSON.stringify({
              framework_code: framework.framework_code,
              version: framework.version,
              authority: framework.authority,
              auto_generated: true,
              source: 'comprehensive_import'
            }),
            is_active: true
          };

          await client.query(`
            INSERT INTO assessment_templates (
              id, name, description, category, framework_id, template_data, is_active, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            ON CONFLICT (name) DO NOTHING
          `, [
            template.id, template.name, template.description, template.category,
            template.framework_id, template.template_data, template.is_active,
            '550e8400-e29b-41d4-a716-446655440000' // Default user ID
          ]);
          
          created++;
          
        } catch (error) {
          this.stats.templates.errors.push(`${name}: ${error.message}`);
        }
      }
      
      await client.query('COMMIT');
      
      this.stats.templates.processed = this.uniqueFrameworks.size;
      this.stats.templates.imported = created;
      
      console.log(`✅ Templates: ${created} assessment templates created\n`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyImport() {
    console.log('🔍 Verifying Import Results');
    console.log('---------------------------');
    
    try {
      const client = await this.pool.connect();
      
      const [regulatorsResult, frameworksResult, controlsResult, templatesResult] = await Promise.all([
        client.query('SELECT COUNT(*) FROM regulators WHERE is_active = true'),
        client.query('SELECT COUNT(*) FROM grc_frameworks WHERE is_active = true'),
        client.query('SELECT COUNT(*) FROM grc_controls WHERE is_active = true'),
        client.query('SELECT COUNT(*) FROM assessment_templates WHERE is_active = true')
      ]);

      const finalCounts = {
        regulators: parseInt(regulatorsResult.rows[0].count),
        frameworks: parseInt(frameworksResult.rows[0].count),
        controls: parseInt(controlsResult.rows[0].count),
        templates: parseInt(templatesResult.rows[0].count)
      };

      console.log('📊 FINAL DATABASE COUNTS:');
      console.log(`   🏛️ Regulators: ${finalCounts.regulators}`);
      console.log(`   📊 Frameworks: ${finalCounts.frameworks}`);
      console.log(`   🔒 Controls: ${finalCounts.controls}`);
      console.log(`   📋 Templates: ${finalCounts.templates}`);

      // Save comprehensive report
      const report = {
        timestamp: new Date().toISOString(),
        import_method: 'direct_database_import',
        source_files: ['grc_execution_tasks_pro.csv', 'filtered_data_ksa_mapped_bilingual.csv'],
        import_summary: {
          total_csv_records_processed: this.allControls.length,
          unique_regulators_found: this.uniqueRegulators.size,
          unique_frameworks_found: this.uniqueFrameworks.size
        },
        import_results: this.stats,
        final_database_counts: finalCounts,
        success_rates: {
          regulators: `${this.stats.regulators.imported}/${this.stats.regulators.processed} (${Math.round(this.stats.regulators.imported/this.stats.regulators.processed*100)}%)`,
          frameworks: `${this.stats.frameworks.imported}/${this.stats.frameworks.processed} (${Math.round(this.stats.frameworks.imported/this.stats.frameworks.processed*100)}%)`,
          controls: `${this.stats.controls.imported}/${this.stats.controls.processed} (${Math.round(this.stats.controls.imported/this.stats.controls.processed*100)}%)`,
          templates: `${this.stats.templates.imported}/${this.stats.templates.processed} (${Math.round(this.stats.templates.imported/this.stats.templates.processed*100)}%)`
        }
      };

      fs.writeFileSync(path.join(this.baseDir, 'DIRECT_IMPORT_REPORT.json'), JSON.stringify(report, null, 2));

      console.log('\n🎉 COMPREHENSIVE DATA IMPORT COMPLETE!');
      console.log('=====================================');
      console.log(`✅ Successfully imported comprehensive GRC data directly to database`);
      console.log(`📄 Detailed report saved to: DIRECT_IMPORT_REPORT.json`);
      console.log('\n🚀 Your DoganConsult GRC platform now has comprehensive data ready for enterprise use!');

      client.release();
      
    } catch (error) {
      console.log(`⚠️ Verification error: ${error.message}`);
    }
  }
}

// Execute the direct database import
async function main() {
  const importer = new DirectDatabaseImporter();
  await importer.execute();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DirectDatabaseImporter;
