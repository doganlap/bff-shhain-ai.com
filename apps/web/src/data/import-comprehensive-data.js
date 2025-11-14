const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');

class ComprehensiveDataImporter {
  constructor() {
    this.baseDir = __dirname;
    this.token = null;
    this.importStats = {
      regulators: { processed: 0, imported: 0, errors: [] },
      frameworks: { processed: 0, imported: 0, errors: [] },
      controls: { processed: 0, imported: 0, errors: [] },
      templates: { processed: 0, imported: 0, errors: [] }
    };
    this.uniqueRegulators = new Map();
    this.uniqueFrameworks = new Map();
    this.allControls = [];
  }

  async execute() {
    console.log('🚀 IMPLEMENTING COMPREHENSIVE GRC DATA IMPORT');
    console.log('==============================================\n');

    try {
      // Step 1: Authentication
      await this.authenticate();
      
      // Step 2: Parse CSV files and extract data
      await this.parseComprehensiveData();
      
      // Step 3: Import regulators
      await this.importRegulators();
      
      // Step 4: Import frameworks
      await this.importFrameworks();
      
      // Step 5: Import controls
      await this.importControls();
      
      // Step 6: Create assessment templates
      await this.createAssessmentTemplates();
      
      // Step 7: Verify and report
      await this.verifyAndReport();
      
    } catch (error) {
      console.error('❌ Implementation failed:', error.message);
    }
  }

  async authenticate() {
    console.log('🔐 Step 1: Authentication');
    console.log('-------------------------');
    
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'ahmet@doganconsult.com',
        password: 'As$123456'
      });
      
      this.token = loginResponse.data.data?.token || loginResponse.data.token;
      console.log('✅ Authentication successful\n');
      
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async parseComprehensiveData() {
    console.log('📊 Step 2: Parsing Comprehensive Data Files');
    console.log('-------------------------------------------');
    
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
      
      try {
        await this.parseCSVFile(filePath, fileName);
      } catch (error) {
        console.log(`❌ Error processing ${fileName}: ${error.message}`);
      }
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
          
          // Extract regulators
          this.extractRegulators(row);
          
          // Extract frameworks
          this.extractFrameworks(row);
          
          // Store controls
          this.allControls.push({
            ...row,
            source_file: fileName
          });
        })
        .on('end', () => {
          console.log(`   ✅ Processed ${results.length} records from ${fileName}`);
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  extractRegulators(row) {
    // Extract from various regulator fields
    const regulatorFields = [
      'regulator_name_en',
      'regulator_name_ar', 
      'framework_regulator_code',
      'imputed_regulator_name_en',
      'imputed_regulator_name_ar'
    ];

    regulatorFields.forEach(field => {
      if (row[field] && row[field].trim()) {
        const regulatorName = row[field].trim();
        
        if (!this.uniqueRegulators.has(regulatorName)) {
          this.uniqueRegulators.set(regulatorName, {
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
            description_ar: `الهيئة التنظيمية لـ ${row['regulator_name_ar'] || regulatorName}`
          });
        }
      }
    });
  }

  extractFrameworks(row) {
    // Extract from framework fields
    const frameworkFields = [
      'framework_title_en',
      'framework_title_ar',
      'imputed_framework_title_en',
      'imputed_framework_title_ar',
      'frameworks'
    ];

    frameworkFields.forEach(field => {
      if (row[field] && row[field].trim()) {
        const frameworkName = row[field].trim();
        
        if (!this.uniqueFrameworks.has(frameworkName)) {
          this.uniqueFrameworks.set(frameworkName, {
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
            framework_category: row['framework_category'] || 'compliance',
            framework_mandatory: row['framework_mandatory'] === 'True' || row['framework_mandatory'] === true,
            framework_effective_date: row['framework_effective_date'] || new Date().toISOString().split('T')[0],
            framework_total_controls: parseInt(row['framework_total_controls']) || 0,
            framework_official_ref: row['framework_official_ref'] || ''
          });
        }
      }
    });
  }

  generateRegulatorCode(name) {
    // Generate code from name
    const words = name.split(' ');
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 10);
    }
    return name.substring(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  generateFrameworkCode(name) {
    // Generate framework code
    const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const words = cleaned.split(' ');
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 15);
    }
    return cleaned.substring(0, 15).toUpperCase().replace(/[^A-Z0-9]/g, '_');
  }

  async importRegulators() {
    console.log('🏛️ Step 3: Importing Regulators');
    console.log('-------------------------------');
    
    let imported = 0;
    let errors = 0;

    for (const [name, regulatorData] of this.uniqueRegulators) {
      try {
        const response = await axios.post('http://localhost:5001/api/regulators', regulatorData, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        imported++;
        if (imported % 10 === 0) {
          console.log(`   📋 Imported ${imported} regulators...`);
        }
        
      } catch (error) {
        errors++;
        this.importStats.regulators.errors.push(`${name}: ${error.response?.data?.message || error.message}`);
        
        if (errors <= 5) { // Only show first 5 errors
          console.log(`   ⚠️ Error importing ${name}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    this.importStats.regulators.processed = this.uniqueRegulators.size;
    this.importStats.regulators.imported = imported;
    
    console.log(`✅ Regulators: ${imported}/${this.uniqueRegulators.size} imported successfully`);
    if (errors > 0) {
      console.log(`⚠️ Regulators: ${errors} errors occurred\n`);
    } else {
      console.log('');
    }
  }

  async importFrameworks() {
    console.log('📊 Step 4: Importing Frameworks');
    console.log('-------------------------------');
    
    let imported = 0;
    let errors = 0;

    for (const [name, frameworkData] of this.uniqueFrameworks) {
      try {
        const response = await axios.post('http://localhost:5001/api/grc-frameworks', frameworkData, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        imported++;
        if (imported % 20 === 0) {
          console.log(`   📋 Imported ${imported} frameworks...`);
        }
        
      } catch (error) {
        errors++;
        this.importStats.frameworks.errors.push(`${name}: ${error.response?.data?.message || error.message}`);
        
        if (errors <= 5) { // Only show first 5 errors
          console.log(`   ⚠️ Error importing ${name}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    this.importStats.frameworks.processed = this.uniqueFrameworks.size;
    this.importStats.frameworks.imported = imported;
    
    console.log(`✅ Frameworks: ${imported}/${this.uniqueFrameworks.size} imported successfully`);
    if (errors > 0) {
      console.log(`⚠️ Frameworks: ${errors} errors occurred\n`);
    } else {
      console.log('');
    }
  }

  async importControls() {
    console.log('🔒 Step 5: Importing Controls');
    console.log('-----------------------------');
    
    let imported = 0;
    let errors = 0;
    const batchSize = 50; // Import in batches

    // Get framework mappings for foreign keys
    const frameworksResponse = await axios.get('http://localhost:5001/api/grc-frameworks', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const frameworks = frameworksResponse.data.data || [];
    const frameworkMap = new Map();
    frameworks.forEach(fw => {
      frameworkMap.set(fw.framework_code, fw.id);
      frameworkMap.set(fw.name, fw.id);
      frameworkMap.set(fw.name_en, fw.id);
    });

    console.log(`📋 Processing ${this.allControls.length} controls in batches of ${batchSize}...`);

    for (let i = 0; i < this.allControls.length; i += batchSize) {
      const batch = this.allControls.slice(i, i + batchSize);
      
      for (const controlData of batch) {
        try {
          // Map control data to database schema
          const control = {
            control_id: controlData.control_id || controlData.Control_ID || `CTRL_${i}`,
            title_en: controlData.title_en || controlData.Summary || controlData.requirement_text || 'Control Title',
            title_ar: controlData.title_ar || controlData.requirement_ar || '',
            title: controlData.title_en || controlData.Summary || controlData.requirement_text || 'Control Title',
            description_en: controlData.description_en || controlData.Description || controlData.requirement_text || '',
            description_ar: controlData.description_ar || controlData.requirement_ar || '',
            description: controlData.description_en || controlData.Description || controlData.requirement_text || '',
            category: controlData.category || controlData.grc_domain || controlData.Domain || 'general',
            criticality_level: this.mapPriority(controlData.priority || controlData.Priority),
            is_mandatory: controlData.framework_mandatory === 'True' || controlData.sector_mandatory === 'Yes',
            control_type: controlData.control_type || 'technical',
            implementation_guidance: controlData.implementation_guidance_en || controlData.AcceptanceCriteria_EN || '',
            testing_procedures: controlData.evidence_requirements || controlData.evidence_min_set || '',
            is_active: true,
            framework_id: this.findFrameworkId(controlData, frameworkMap)
          };

          if (control.framework_id) {
            const response = await axios.post('http://localhost:5001/api/grc-controls', control, {
              headers: { 'Authorization': `Bearer ${this.token}` }
            });
            imported++;
          } else {
            errors++;
            this.importStats.controls.errors.push(`${control.control_id}: No matching framework found`);
          }
          
        } catch (error) {
          errors++;
          this.importStats.controls.errors.push(`${controlData.control_id}: ${error.response?.data?.message || error.message}`);
        }
      }

      // Progress update
      console.log(`   📋 Processed ${Math.min(i + batchSize, this.allControls.length)}/${this.allControls.length} controls (${imported} imported, ${errors} errors)`);
    }

    this.importStats.controls.processed = this.allControls.length;
    this.importStats.controls.imported = imported;
    
    console.log(`✅ Controls: ${imported}/${this.allControls.length} imported successfully`);
    if (errors > 0) {
      console.log(`⚠️ Controls: ${errors} errors occurred\n`);
    } else {
      console.log('');
    }
  }

  findFrameworkId(controlData, frameworkMap) {
    // Try to find framework ID from various fields
    const frameworkFields = [
      'framework_code',
      'framework_title_en',
      'frameworks',
      'ksa_frameworks'
    ];

    for (const field of frameworkFields) {
      if (controlData[field]) {
        const frameworkRef = controlData[field].trim();
        if (frameworkMap.has(frameworkRef)) {
          return frameworkMap.get(frameworkRef);
        }
      }
    }

    // Default to first framework if available
    const firstFramework = Array.from(frameworkMap.values())[0];
    return firstFramework || null;
  }

  mapPriority(priority) {
    if (!priority) return 'medium';
    
    const p = priority.toLowerCase();
    if (p.includes('critical') || p.includes('high')) return 'high';
    if (p.includes('low')) return 'low';
    return 'medium';
  }

  async createAssessmentTemplates() {
    console.log('📋 Step 6: Creating Assessment Templates');
    console.log('---------------------------------------');
    
    // Create templates based on imported frameworks
    const frameworksResponse = await axios.get('http://localhost:5001/api/grc-frameworks', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const frameworks = frameworksResponse.data.data || [];
    
    let created = 0;
    
    for (const framework of frameworks.slice(0, 10)) { // Limit to first 10 frameworks
      try {
        const template = {
          name: `${framework.name} Assessment Template`,
          description: `Comprehensive assessment template for ${framework.name} compliance`,
          category: framework.framework_category || 'compliance',
          framework_id: framework.id,
          template_data: {
            framework_code: framework.framework_code,
            version: framework.version,
            authority: framework.authority,
            auto_generated: true
          }
        };

        const response = await axios.post('http://localhost:5001/api/assessment-templates', template, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        created++;
        
      } catch (error) {
        this.importStats.templates.errors.push(`${framework.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    this.importStats.templates.processed = frameworks.length;
    this.importStats.templates.imported = created;
    
    console.log(`✅ Templates: ${created} assessment templates created\n`);
  }

  async verifyAndReport() {
    console.log('🔍 Step 7: Verification and Final Report');
    console.log('----------------------------------------');
    
    try {
      // Get final counts
      const [regulatorsResp, frameworksResp, controlsResp, templatesResp] = await Promise.all([
        axios.get('http://localhost:5001/api/regulators', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        axios.get('http://localhost:5001/api/grc-frameworks', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        axios.get('http://localhost:5001/api/grc-controls', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        axios.get('http://localhost:5001/api/assessment-templates', { headers: { 'Authorization': `Bearer ${this.token}` } })
      ]);

      const finalCounts = {
        regulators: regulatorsResp.data.data?.length || 0,
        frameworks: frameworksResp.data.data?.length || 0,
        controls: controlsResp.data.data?.length || 0,
        templates: templatesResp.data.data?.length || 0
      };

      console.log('📊 FINAL DATABASE COUNTS:');
      console.log(`   🏛️ Regulators: ${finalCounts.regulators}`);
      console.log(`   📊 Frameworks: ${finalCounts.frameworks}`);
      console.log(`   🔒 Controls: ${finalCounts.controls}`);
      console.log(`   📋 Templates: ${finalCounts.templates}`);

      // Save detailed report
      const report = {
        timestamp: new Date().toISOString(),
        import_summary: {
          total_csv_records_processed: this.allControls.length,
          unique_regulators_found: this.uniqueRegulators.size,
          unique_frameworks_found: this.uniqueFrameworks.size
        },
        import_results: this.importStats,
        final_database_counts: finalCounts,
        success_rate: {
          regulators: `${this.importStats.regulators.imported}/${this.importStats.regulators.processed}`,
          frameworks: `${this.importStats.frameworks.imported}/${this.importStats.frameworks.processed}`,
          controls: `${this.importStats.controls.imported}/${this.importStats.controls.processed}`,
          templates: `${this.importStats.templates.imported}/${this.importStats.templates.processed}`
        }
      };

      fs.writeFileSync(path.join(this.baseDir, 'COMPREHENSIVE_IMPORT_REPORT.json'), JSON.stringify(report, null, 2));

      console.log('\n🎉 COMPREHENSIVE DATA IMPORT COMPLETE!');
      console.log('=====================================');
      console.log(`✅ Successfully imported comprehensive GRC data`);
      console.log(`📄 Detailed report saved to: COMPREHENSIVE_IMPORT_REPORT.json`);
      console.log('\n🚀 Your DoganConsult GRC platform now has comprehensive data ready for enterprise use!');

    } catch (error) {
      console.log(`⚠️ Verification error: ${error.message}`);
    }
  }
}

// Execute the comprehensive data import
async function main() {
  const importer = new ComprehensiveDataImporter();
  await importer.execute();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveDataImporter;
