const fs = require('fs');
const path = require('path');

function collectSqlFiles(dir) {
  const sqlFiles = [];

  if (!dir || !fs.existsSync(dir)) {
    return sqlFiles;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sqlFiles.push(...collectSqlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) {
      sqlFiles.push(fullPath);
    }
  });

  return sqlFiles;
}

function parseTablesFromSql(filePath) {
  const tables = [];
  const sql = fs.readFileSync(filePath, 'utf8');
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w\.]+"?)\s*\(([\s\S]*?)\);/gi;

  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    let tableName = match[1].replace(/"/g, '');
    if (tableName.includes('.')) {
      tableName = tableName.split('.').pop();
    }

    const tableContent = match[2];
    const columnCount = countColumns(tableContent);
    tables.push({ name: tableName, columns: columnCount });
  }

  return tables;
}

function countColumns(tableBody) {
  const lines = tableBody.split('\n');
  let columnCount = 0;
  let pendingDefinition = '';

  lines.forEach(rawLine => {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('--')) {
      pendingDefinition = '';
      return;
    }

    if (/^(CONSTRAINT|PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK|INDEX|KEY|REFERENCES|WITH|COMMENT|PARTITION|GRANT)\b/i.test(trimmed)) {
      pendingDefinition = '';
      return;
    }

    if (/^[\)\(]$/.test(trimmed)) {
      pendingDefinition = '';
      return;
    }

    const merged = pendingDefinition ? `${pendingDefinition} ${trimmed}` : trimmed;
    const cleaned = merged.replace(/,$/, '');

    if (/^"[^"]+"\s+/u.test(cleaned) || /^[a-zA-Z_][\w$]*\s+/u.test(cleaned)) {
      columnCount += 1;
      pendingDefinition = '';
    } else {
      pendingDefinition = merged;
    }
  });

  return columnCount;
}

function addTablesToCatalog(tables, sourceLabel, sourceType, catalog) {
  tables.forEach(({ name, columns }) => {
    const key = name.toLowerCase();
    const existing = catalog.get(key);

    if (existing) {
      existing.columns = Math.max(existing.columns, columns);
      if (sourceLabel) {
        existing.sources.add(sourceLabel);
      }
      if (sourceType) {
        existing.types.add(sourceType);
      }
    } else {
      const entry = {
        name,
        columns,
        sources: new Set(sourceLabel ? [sourceLabel] : []),
        types: new Set(sourceType ? [sourceType] : [])
      };
      catalog.set(key, entry);
    }
  });
}

function getTableEntry(catalog, tableName) {
  if (!tableName) {
    return undefined;
  }
  return catalog.get(tableName.toLowerCase());
}

function formatSources(sourceSet) {
  if (!sourceSet || sourceSet.size === 0) {
    return 'unknown source';
  }
  return Array.from(sourceSet).join(', ');
}

function analyzeDatabaseStructure() {
  console.log('📊 DATABASE STRUCTURE ANALYSIS\n');

  const tableCatalog = new Map();

  // 1. Schema Analysis
  console.log('1. SCHEMA ANALYSIS (base_schema.sql):');
  console.log('=====================================');

  const schemaDir = path.join(__dirname, 'database-schema');
  const baseSchemaPath = path.join(schemaDir, 'base_schema.sql');
  let baseTables = [];

  try {
    baseTables = parseTablesFromSql(baseSchemaPath);
    addTablesToCatalog(baseTables, path.relative(__dirname, baseSchemaPath), 'Base Schema', tableCatalog);

    console.log(`📋 Total Tables: ${baseTables.length}`);
    if (baseTables.length) {
      console.log('📊 Table Details:');
    }

    let totalColumns = 0;
    baseTables.forEach((table, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${table.name.padEnd(30)} : ${table.columns} columns`);
      totalColumns += table.columns;
    });

    if (baseTables.length) {
      const averageColumns = Math.round(totalColumns / baseTables.length);
      console.log('\n📊 SUMMARY:');
      console.log(`   Total Tables: ${baseTables.length}`);
      console.log(`   Total Columns: ${totalColumns}`);
      console.log(`   Average Columns per Table: ${averageColumns}`);
    }
  } catch (error) {
    console.log('❌ Error reading schema:', error.message);
  }

  // 2. Migration Analysis
  console.log('\n2. MIGRATION FILES ANALYSIS:');
  console.log('============================');

  try {
    const migrationsPath = path.join(__dirname, 'backend', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));

    console.log(`📁 Migration Files: ${migrationFiles.length}`);
    migrationFiles.forEach((file, index) => {
      const filePath = path.join(migrationsPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(35)} : ${sizeKB} KB`);
    });
  } catch (error) {
    console.log('❌ Error reading migrations:', error.message);
  }

  // 3. Data Files Analysis
  console.log('\n3. DATA FILES ANALYSIS:');
  console.log('======================');

  const dataFiles = [
    'grc_execution_tasks_pro.csv',
    'filtered_data_ksa_mapped_bilingual.csv',
    'azdo_bulk_import.csv',
    'grc_execution_tasks_smart.csv',
    'grc_execution_tasks.csv'
  ];

  dataFiles.forEach((file, index) => {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length - 1;

        console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(40)} : ${lines.toLocaleString()} records, ${sizeMB} MB`);
      } else {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(40)} : Not found`);
      }
    } catch (error) {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${file.padEnd(40)} : Error reading`);
    }
  });

  // 4. ETL/Seed Tables Analysis
  console.log('\n4. ETL/SEED TABLES ANALYSIS:');
  console.log('============================');

  const etlDirectories = [
    path.join(__dirname, 'database-schema'),
    path.join(__dirname, 'database', 'seeds'),
    path.join(__dirname, 'database', 'schema')
  ];

  const baseFileNamesToSkip = new Set(['base_schema.sql']);
  const etlSqlFiles = new Set();

  etlDirectories.forEach(dir => {
    collectSqlFiles(dir).forEach(file => {
      if (!file) {
        return;
      }
      const fileName = path.basename(file).toLowerCase();
      if (baseFileNamesToSkip.has(fileName)) {
        return;
      }
      etlSqlFiles.add(file);
    });
  });

  const etlTableBreakdown = [];

  etlSqlFiles.forEach(filePath => {
    try {
      const tables = parseTablesFromSql(filePath);
      if (!tables.length) {
        return;
      }

      const newTables = tables.filter(table => !tableCatalog.has(table.name.toLowerCase()));
      const relativePath = path.relative(__dirname, filePath);

      addTablesToCatalog(tables, relativePath, 'ETL/Seed', tableCatalog);
      etlTableBreakdown.push({
        file: relativePath,
        total: tables.length,
        newTables
      });
    } catch (error) {
      console.log(`   ⚠️ Skipped ${path.relative(__dirname, filePath)}: ${error.message}`);
    }
  });

  if (!etlTableBreakdown.length) {
    console.log('   ℹ️ No additional tables defined in ETL/seed SQL files.');
  } else {
    console.log(`   📁 SQL files scanned: ${etlTableBreakdown.length}`);
    etlTableBreakdown
      .sort((a, b) => a.file.localeCompare(b.file))
      .forEach((entry, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${entry.file} → ${entry.total} tables (${entry.newTables.length} new)`);
        if (entry.newTables.length) {
          entry.newTables
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(table => {
              console.log(`       - ${table.name} (${table.columns} columns)`);
            });
        }
      });
  }

  const etlTables = Array.from(tableCatalog.values()).filter(entry => entry.types.has('ETL/Seed'));
  const seedOnlyTables = etlTables.filter(entry => !entry.types.has('Base Schema'));

  if (seedOnlyTables.length) {
    console.log('\n   🆕 New tables introduced by ETL/seed scripts:');
    seedOnlyTables
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(table => {
        console.log(`      - ${table.name} (${table.columns} columns, sources: ${formatSources(table.sources)})`);
      });
  } else if (etlTables.length) {
    console.log('\n   ℹ️ ETL/seed scripts reuse or extend existing base tables (no brand-new tables).');
  }

  const aggregatedTables = Array.from(tableCatalog.values());
  const totalColumns = aggregatedTables.reduce((sum, table) => {
    return sum + (Number.isFinite(table.columns) ? table.columns : 0);
  }, 0);

  console.log('\n📊 COMBINED TABLE INVENTORY:');
  console.log(`   Total unique tables: ${aggregatedTables.length}`);
  console.log(`   Total columns (max per table): ${totalColumns}`);
  console.log(`   Tables touched by ETL/Seed scripts: ${etlTables.length}`);
  console.log(`   Tables introduced exclusively by ETL/Seed: ${seedOnlyTables.length}`);

  // 5. Key Tables Summary
  console.log('\n5. KEY TABLES BY CATEGORY:');
  console.log('=========================');

  const categories = {
    'Authentication & Users': ['users', 'user_sessions', 'password_reset_tokens', 'email_verification_codes', 'notification_settings'],
    'Multi-Tenant & Isolation': ['tenants', 'tenant_schemas', 'tenant_features', 'tenant_quotas', 'organizations', 'approved_users'],
    'GRC Core': ['regulators', 'grc_frameworks', 'grc_controls', 'sectors'],
    'Assessments': ['assessments', 'assessment_templates', 'assessment_template_sections', 'assessment_responses', 'assessment_forms', 'assessment_form_sections'],
    'Document Processing & AI': ['documents', 'document_chunks', 'processing_jobs', 'search_queries', 'rag_responses'],
    'Workflow & Evidence': ['assessment_workflow', 'assessment_workflow_history', 'assessment_evidence', 'evidence_library', 'evidence_assessment_relations', 'evidence_download_log'],
    'Reporting & Analytics': ['assessment_reports', 'compliance_reports', 'report_templates', 'compliance_metrics', 'system_logs'],
    'Risk & Vendor Management': ['risk_assessments', 'risk_control_mappings', 'vendors', 'vendor_risk_assessments'],
    'Compliance Logging & Monitoring': ['audit_logs', 'audit_log', 'data_processing_log', 'system_events']
  };

  Object.entries(categories).forEach(([category, tableList]) => {
    console.log(`\n📂 ${category}:`);
    tableList.forEach(tableName => {
      const table = getTableEntry(tableCatalog, tableName);
      if (table) {
        const hasBase = table.types.has('Base Schema');
        const hasSeed = table.types.has('ETL/Seed');
        let originLabel;
        if (hasBase && hasSeed) {
          originLabel = 'base + seed';
        } else if (hasSeed) {
          originLabel = 'seed only';
        } else if (hasBase) {
          originLabel = 'base';
        } else {
          originLabel = Array.from(table.types).join(', ') || 'unknown';
        }
        const columnLabel = Number.isFinite(table.columns) ? `${table.columns}` : 'unknown';
        console.log(`   ✅ ${tableName.padEnd(30)} : ${columnLabel} columns (${originLabel})`);
      } else {
        console.log(`   ❓ ${tableName.padEnd(30)} : Not found in analyzed SQL files`);
      }
    });
  });

  console.log('\n🎉 Database structure analysis complete!');
}

analyzeDatabaseStructure();
