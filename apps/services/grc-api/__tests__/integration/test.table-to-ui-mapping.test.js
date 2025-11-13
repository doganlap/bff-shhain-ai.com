const fs = require('fs');
const path = require('path');
const { query } = require('./backend/config/database');

/**
 * Comprehensive Database Table to UI Mapping Test
 * Tests all database tables, their API routes, and UI components
 */

// Table Groups and Tags
const TABLE_GROUPS = {
  AUTHENTICATION: {
    name: 'Authentication & User Management',
    tags: ['auth', 'user-management', 'security', 'identity'],
    service: 'auth-service',
    color: '#FF6B6B'
  },
  TENANT: {
    name: 'Multi-Tenant Architecture',
    tags: ['tenant', 'multi-tenant', 'isolation', 'organization'],
    service: 'tenant-service',
    color: '#4ECDC4'
  },
  RBAC: {
    name: 'Role-Based Access Control',
    tags: ['rbac', 'permissions', 'roles', 'access-control'],
    service: 'rbac-service',
    color: '#45B7D1'
  },
  GRC: {
    name: 'GRC Core System',
    tags: ['grc', 'compliance', 'regulatory', 'frameworks', 'controls'],
    service: 'grc-service',
    color: '#96CEB4'
  },
  ASSESSMENT: {
    name: 'Assessment System',
    tags: ['assessment', 'evaluation', 'compliance-check', 'template'],
    service: 'assessment-service',
    color: '#FFEAA7'
  },
  DOCUMENT: {
    name: 'Document Processing',
    tags: ['document', 'rag', 'ai', 'processing', 'search'],
    service: 'document-service',
    color: '#DDA15E'
  },
  EVIDENCE: {
    name: 'Evidence & Workflow',
    tags: ['evidence', 'workflow', 'approval', 'library'],
    service: 'evidence-service',
    color: '#BC6C25'
  },
  REPORTING: {
    name: 'Reporting & Analytics',
    tags: ['reporting', 'analytics', 'metrics', 'compliance-report'],
    service: 'reporting-service',
    color: '#6C5CE7'
  },
  SYSTEM: {
    name: 'System & Audit',
    tags: ['system', 'audit', 'logging', 'settings', 'admin'],
    service: 'system-service',
    color: '#A29BFE'
  }
};

// Table to API Route Mapping (from code analysis)
const TABLE_TO_API_MAPPING = {
  // Authentication & User Management
  users: {
    apiRoute: '/api/users',
    routeFile: 'backend/routes/users.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/SettingsPage.jsx',
    relatedTables: ['organizations', 'user_roles', 'roles'],
    group: 'AUTHENTICATION',
    tags: ['auth', 'user-management', 'security'],
    service: 'user-service'
  },
  user_sessions: {
    apiRoute: '/api/auth/sessions',
    routeFile: 'backend/routes/auth.js',
    methods: ['GET', 'DELETE'],
    uiComponent: null, // Internal use
    relatedTables: ['users'],
    group: 'AUTHENTICATION',
    tags: ['auth', 'session', 'security'],
    service: 'auth-service'
  },
  approved_users: {
    apiRoute: '/api/users/approved',
    routeFile: 'backend/routes/users.js',
    methods: ['GET', 'POST'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['users', 'organizations'],
    group: 'AUTHENTICATION',
    tags: ['auth', 'user-management', 'approval'],
    service: 'user-service'
  },
  password_reset_tokens: {
    apiRoute: '/api/auth/reset-password',
    routeFile: 'backend/routes/auth.js',
    methods: ['POST'],
    uiComponent: 'frontend/src/pages/auth',
    relatedTables: ['users'],
    group: 'AUTHENTICATION',
    tags: ['auth', 'password', 'security'],
    service: 'auth-service'
  },
  email_verification_codes: {
    apiRoute: '/api/auth/verify-email',
    routeFile: 'backend/routes/auth.js',
    methods: ['POST'],
    uiComponent: 'frontend/src/pages/auth',
    relatedTables: [],
    group: 'AUTHENTICATION',
    tags: ['auth', 'verification', 'email'],
    service: 'auth-service'
  },
  notification_settings: {
    apiRoute: '/api/users/:id/notifications',
    routeFile: 'backend/routes/users.js',
    methods: ['GET', 'PUT'],
    uiComponent: 'frontend/src/pages/SettingsPage.jsx',
    relatedTables: ['users'],
    group: 'AUTHENTICATION',
    tags: ['user-management', 'notifications', 'settings'],
    service: 'user-service'
  },

  // Multi-Tenant Architecture
  tenants: {
    apiRoute: '/api/tenants',
    routeFile: 'backend/routes/tenants.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['users', 'organizations'],
    group: 'TENANT',
    tags: ['tenant', 'multi-tenant', 'isolation'],
    service: 'tenant-service'
  },
  organizations: {
    apiRoute: '/api/organizations',
    routeFile: 'backend/routes/organizations.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/OrganizationsPage.jsx',
    relatedTables: ['assessments', 'users', 'evidence_library', 'compliance_metrics'],
    group: 'TENANT',
    tags: ['organization', 'tenant', 'business'],
    service: 'organization-service'
  },
  sectors: {
    apiRoute: '/api/sector-controls',
    routeFile: 'backend/routes/sector-controls.js',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/SectorIntelligence.js',
    relatedTables: ['organizations', 'grc_controls'],
    group: 'TENANT',
    tags: ['sector', 'intelligence', 'organization'],
    service: 'sector-service'
  },

  // RBAC System
  roles: {
    apiRoute: '/api/admin/roles',
    routeFile: 'backend/routes/admin',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['user_roles', 'permissions'],
    group: 'RBAC',
    tags: ['rbac', 'roles', 'access-control'],
    service: 'rbac-service'
  },
  permissions: {
    apiRoute: '/api/admin/permissions',
    routeFile: 'backend/routes/admin',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['roles'],
    group: 'RBAC',
    tags: ['rbac', 'permissions', 'access-control'],
    service: 'rbac-service'
  },
  user_roles: {
    apiRoute: '/api/users/:id/roles',
    routeFile: 'backend/routes/users.js',
    methods: ['GET', 'POST', 'DELETE'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['users', 'roles'],
    group: 'RBAC',
    tags: ['rbac', 'user-management', 'roles'],
    service: 'rbac-service'
  },

  // GRC Core System
  regulators: {
    apiRoute: '/api/regulators',
    routeFile: 'backend/routes/regulators.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/RegulatorsPage.jsx',
    relatedTables: ['grc_frameworks'],
    group: 'GRC',
    tags: ['grc', 'regulatory', 'compliance'],
    service: 'grc-service'
  },
  grc_frameworks: {
    apiRoute: '/api/grc-frameworks',
    routeFile: 'backend/routes/frameworks.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedFrameworkManager.jsx',
    relatedTables: ['regulators', 'grc_controls', 'assessments'],
    group: 'GRC',
    tags: ['grc', 'frameworks', 'compliance'],
    service: 'grc-service'
  },
  grc_controls: {
    apiRoute: '/api/grc-controls',
    routeFile: 'backend/routes/controls.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/pages/ControlsPage.jsx',
    relatedTables: ['grc_frameworks', 'assessment_responses', 'risk_controls'],
    group: 'GRC',
    tags: ['grc', 'controls', 'compliance'],
    service: 'grc-service'
  },

  // Assessment System
  assessments: {
    apiRoute: '/api/assessments',
    routeFile: 'backend/routes/assessments.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['organizations', 'grc_frameworks', 'assessment_templates', 'assessment_responses'],
    group: 'ASSESSMENT',
    tags: ['assessment', 'evaluation', 'compliance-check'],
    service: 'assessment-service'
  },
  assessment_templates: {
    apiRoute: '/api/assessment-templates',
    routeFile: 'backend/routes/assessment-templates.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['grc_frameworks', 'assessment_template_sections', 'assessments'],
    group: 'ASSESSMENT',
    tags: ['assessment', 'template', 'compliance-check'],
    service: 'assessment-service'
  },
  assessment_template_sections: {
    apiRoute: '/api/assessment-templates/:id/sections',
    routeFile: 'backend/routes/assessment-templates.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessment_templates'],
    group: 'ASSESSMENT',
    tags: ['assessment', 'template', 'section'],
    service: 'assessment-service'
  },
  assessment_sections: {
    apiRoute: '/api/assessments/:id/sections',
    routeFile: 'backend/routes/assessments.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'assessment_template_sections'],
    group: 'ASSESSMENT',
    tags: ['assessment', 'section', 'evaluation'],
    service: 'assessment-service'
  },
  assessment_responses: {
    apiRoute: '/api/assessment-responses',
    routeFile: 'backend/routes/assessment-responses.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'grc_controls', 'assessment_evidence'],
    group: 'ASSESSMENT',
    tags: ['assessment', 'response', 'evaluation'],
    service: 'assessment-service'
  },
  assessment_forms: {
    apiRoute: '/api/assessments/:id/forms',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'assessment_form_sections']
  },
  assessment_form_sections: {
    apiRoute: '/api/assessments/:id/forms/:formId/sections',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessment_forms', 'assessment_form_questions']
  },
  assessment_form_questions: {
    apiRoute: '/api/assessments/:id/forms/:formId/sections/:sectionId/questions',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessment_form_sections']
  },
  assessment_schedules: {
    apiRoute: '/api/assessments/:id/schedules',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'users']
  },

  // Document Processing
  documents: {
    apiRoute: '/api/documents',
    routeFile: 'backend/routes/documents.js',
    methods: ['GET', 'POST', 'DELETE'],
    uiComponent: 'frontend/src/pages/documents',
    relatedTables: ['tenants', 'users', 'document_chunks'],
    group: 'DOCUMENT',
    tags: ['document', 'file', 'upload', 'processing'],
    service: 'document-service'
  },
  document_chunks: {
    apiRoute: '/api/documents/:id/chunks',
    routeFile: 'backend/routes/documents.js',
    methods: ['GET'],
    uiComponent: null, // Internal use for RAG
    relatedTables: ['documents', 'tenants'],
    group: 'DOCUMENT',
    tags: ['document', 'rag', 'ai', 'chunk'],
    service: 'document-service'
  },
  processing_jobs: {
    apiRoute: '/api/documents/jobs',
    routeFile: 'backend/routes/documents.js',
    methods: ['GET'],
    uiComponent: null, // Internal use
    relatedTables: ['documents'],
    group: 'DOCUMENT',
    tags: ['document', 'processing', 'job', 'async'],
    service: 'document-service'
  },
  search_queries: {
    apiRoute: '/api/documents/search',
    routeFile: 'backend/routes/documents.js',
    methods: ['POST'],
    uiComponent: 'frontend/src/pages/documents',
    relatedTables: ['tenants', 'users'],
    group: 'DOCUMENT',
    tags: ['document', 'search', 'rag', 'ai'],
    service: 'document-service'
  },
  rag_responses: {
    apiRoute: '/api/documents/rag',
    routeFile: 'backend/routes/documents.js',
    methods: ['POST'],
    uiComponent: 'frontend/src/pages/documents',
    relatedTables: ['search_queries', 'tenants', 'users'],
    group: 'DOCUMENT',
    tags: ['document', 'rag', 'ai', 'response'],
    service: 'document-service'
  },
  embedding_models: {
    apiRoute: '/api/admin/embedding-models',
    routeFile: 'backend/routes/admin',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: [],
    group: 'DOCUMENT',
    tags: ['document', 'ai', 'embedding', 'model'],
    service: 'document-service'
  },

  // Evidence & Workflow
  assessment_evidence: {
    apiRoute: '/api/assessment-evidence',
    routeFile: 'backend/routes/assessment-evidence.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'assessment_responses', 'grc_controls', 'users'],
    group: 'EVIDENCE',
    tags: ['evidence', 'assessment', 'file', 'attachment'],
    service: 'evidence-service'
  },
  evidence_library: {
    apiRoute: '/api/evidence-library',
    routeFile: 'backend/routes/evidence-library.js',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['organizations', 'users'],
    group: 'EVIDENCE',
    tags: ['evidence', 'library', 'repository'],
    service: 'evidence-service'
  },
  assessment_workflow: {
    apiRoute: '/api/workflow/assessments/:id',
    routeFile: 'backend/routes/workflow.js',
    methods: ['GET', 'POST'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'users'],
    group: 'EVIDENCE',
    tags: ['workflow', 'assessment', 'process'],
    service: 'workflow-service'
  },
  approval_workflows: {
    apiRoute: '/api/workflow/approvals',
    routeFile: 'backend/routes/workflow.js',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['users', 'approval_steps'],
    group: 'EVIDENCE',
    tags: ['workflow', 'approval', 'process'],
    service: 'workflow-service'
  },
  approval_steps: {
    apiRoute: '/api/workflow/approvals/:id/steps',
    routeFile: 'backend/routes/workflow.js',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['approval_workflows', 'users'],
    group: 'EVIDENCE',
    tags: ['workflow', 'approval', 'step'],
    service: 'workflow-service'
  },

  // Reporting & Analytics
  assessment_reports: {
    apiRoute: '/api/reports/assessments/:id',
    routeFile: 'backend/routes/compliance-reports.js',
    methods: ['GET', 'POST'],
    uiComponent: 'frontend/src/pages/ReportsPage.jsx',
    relatedTables: ['assessments', 'organizations', 'users'],
    group: 'REPORTING',
    tags: ['reporting', 'assessment', 'compliance-report'],
    service: 'reporting-service'
  },
  compliance_metrics: {
    apiRoute: '/api/reports/compliance',
    routeFile: 'backend/routes/compliance-reports.js',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/ReportsPage.jsx',
    relatedTables: ['organizations', 'grc_frameworks'],
    group: 'REPORTING',
    tags: ['reporting', 'metrics', 'compliance', 'analytics'],
    service: 'reporting-service'
  },
  risk_assessments: {
    apiRoute: '/api/assessments/:id/risks',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'PUT'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['assessments', 'organizations', 'users', 'risk_controls'],
    group: 'REPORTING',
    tags: ['risk', 'assessment', 'analytics'],
    service: 'risk-service'
  },
  risk_controls: {
    apiRoute: '/api/assessments/:id/risks/:riskId/controls',
    routeFile: 'backend/routes/assessments',
    methods: ['GET', 'POST', 'DELETE'],
    uiComponent: 'frontend/src/components/AdvancedAssessmentManager.jsx',
    relatedTables: ['risk_assessments', 'grc_controls'],
    group: 'REPORTING',
    tags: ['risk', 'controls', 'mitigation'],
    service: 'risk-service'
  },

  // System & Audit
  audit_logs: {
    apiRoute: '/api/admin/audit-logs',
    routeFile: 'backend/routes/admin',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['users'],
    group: 'SYSTEM',
    tags: ['audit', 'logging', 'system', 'admin'],
    service: 'system-service'
  },
  system_logs: {
    apiRoute: '/api/admin/system-logs',
    routeFile: 'backend/routes/admin',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: [],
    group: 'SYSTEM',
    tags: ['logging', 'system', 'admin'],
    service: 'system-service'
  },
  system_settings: {
    apiRoute: '/api/admin/settings',
    routeFile: 'backend/routes/admin',
    methods: ['GET', 'PUT'],
    uiComponent: 'frontend/src/pages/SettingsPage.jsx',
    relatedTables: ['users'],
    group: 'SYSTEM',
    tags: ['system', 'settings', 'configuration', 'admin'],
    service: 'system-service'
  },
  user_auth_tokens: {
    apiRoute: '/api/microsoft-auth/tokens',
    routeFile: 'backend/routes/microsoft-auth.js',
    methods: ['GET', 'DELETE'],
    uiComponent: 'frontend/src/pages/auth',
    relatedTables: ['users'],
    group: 'AUTHENTICATION',
    tags: ['auth', 'microsoft', 'sso', 'token'],
    service: 'auth-service'
  },
  security_audit_log: {
    apiRoute: '/api/admin/security-audit',
    routeFile: 'backend/routes/admin',
    methods: ['GET'],
    uiComponent: 'frontend/src/pages/admin',
    relatedTables: ['users'],
    group: 'SYSTEM',
    tags: ['audit', 'security', 'logging', 'admin'],
    service: 'system-service'
  }
};

// Test database connection and get all tables
async function getAllTables() {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

// Get foreign key relationships
async function getTableRelationships() {
  try {
    const result = await query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return [];
  }
}

// Check if route file exists
function checkRouteFile(routeFile) {
  const fullPath = path.join(__dirname, routeFile);
  return fs.existsSync(fullPath);
}

// Check if UI component exists
function checkUIComponent(uiComponent) {
  if (!uiComponent) return { exists: false, path: null };
  const fullPath = path.join(__dirname, uiComponent);
  return { exists: fs.existsSync(fullPath), path: fullPath };
}

// Generate comprehensive report
async function generateReport() {
  console.log('🔍 Starting Comprehensive Table-to-UI Mapping Analysis...\n');

  const tables = await getAllTables();
  const relationships = await getTableRelationships();
  
  console.log(`📊 Found ${tables.length} tables in database\n`);
  console.log(`🔗 Found ${relationships.length} foreign key relationships\n`);

  const report = {
    summary: {
      totalTables: tables.length,
      tablesWithAPI: 0,
      tablesWithUI: 0,
      tablesWithoutAPI: [],
      tablesWithoutUI: [],
      totalRelationships: relationships.length
    },
    tables: {},
    relationships: {},
    missingMappings: []
  };

  // Process each table
  for (const table of tables) {
    const mapping = TABLE_TO_API_MAPPING[table];
    const routeExists = mapping ? checkRouteFile(mapping.routeFile) : false;
    const uiCheck = mapping ? checkUIComponent(mapping.uiComponent) : { exists: false, path: null };
    
    // Find relationships for this table
    const tableRelations = relationships.filter(r => 
      r.table_name === table || r.foreign_table_name === table
    );

    const groupInfo = mapping?.group ? TABLE_GROUPS[mapping.group] : null;
    
    report.tables[table] = {
      hasMapping: !!mapping,
      apiRoute: mapping?.apiRoute || null,
      routeFile: mapping?.routeFile || null,
      routeFileExists: routeExists,
      uiComponent: mapping?.uiComponent || null,
      uiComponentExists: uiCheck.exists,
      methods: mapping?.methods || [],
      relatedTables: mapping?.relatedTables || [],
      group: mapping?.group || null,
      groupName: groupInfo?.name || null,
      groupColor: groupInfo?.color || null,
      tags: mapping?.tags || [],
      service: mapping?.service || null,
      relationships: tableRelations.map(r => ({
        type: r.table_name === table ? 'outgoing' : 'incoming',
        column: r.column_name,
        references: `${r.foreign_table_name}.${r.foreign_column_name}`,
        constraint: r.constraint_name
      }))
    };

    if (mapping) {
      report.summary.tablesWithAPI++;
      if (uiCheck.exists) {
        report.summary.tablesWithUI++;
      } else {
        report.summary.tablesWithoutUI.push(table);
      }
    } else {
      report.summary.tablesWithoutAPI.push(table);
      report.missingMappings.push({
        table,
        note: 'No API route mapping found'
      });
    }
  }

  // Build relationship graph
  for (const rel of relationships) {
    if (!report.relationships[rel.table_name]) {
      report.relationships[rel.table_name] = [];
    }
    report.relationships[rel.table_name].push({
      column: rel.column_name,
      references: rel.foreign_table_name,
      foreignColumn: rel.foreign_column_name,
      constraint: rel.constraint_name
    });
  }

  return report;
}

// Print formatted report
function printReport(report) {
  console.log('='.repeat(80));
  console.log('📋 COMPREHENSIVE TABLE-TO-UI MAPPING REPORT');
  console.log('='.repeat(80));
  console.log();

  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Tables: ${report.summary.totalTables}`);
  console.log(`Tables with API Routes: ${report.summary.tablesWithAPI}`);
  console.log(`Tables with UI Components: ${report.summary.tablesWithUI}`);
  console.log(`Total Relationships: ${report.summary.totalRelationships}`);
  console.log();

  // Tables without API
  if (report.summary.tablesWithoutAPI.length > 0) {
    console.log('⚠️  TABLES WITHOUT API ROUTES:');
    console.log('-'.repeat(80));
    report.summary.tablesWithoutAPI.forEach(table => {
      console.log(`  - ${table}`);
    });
    console.log();
  }

  // Tables without UI
  if (report.summary.tablesWithoutUI.length > 0) {
    console.log('⚠️  TABLES WITHOUT UI COMPONENTS:');
    console.log('-'.repeat(80));
    report.summary.tablesWithoutUI.forEach(table => {
      const tableInfo = report.tables[table];
      console.log(`  - ${table} (API: ${tableInfo.apiRoute || 'N/A'})`);
    });
    console.log();
  }

  // Group tables by category
  const tablesByGroup = {};
  Object.entries(report.tables).forEach(([table, info]) => {
    const group = info.group || 'UNCATEGORIZED';
    if (!tablesByGroup[group]) {
      tablesByGroup[group] = [];
    }
    tablesByGroup[group].push({ table, ...info });
  });

  // Detailed table information by group
  console.log('📋 DETAILED TABLE MAPPINGS BY GROUP');
  console.log('='.repeat(80));
  
  Object.entries(tablesByGroup).forEach(([group, tables]) => {
    const groupInfo = TABLE_GROUPS[group] || { name: group, color: '#999999' };
    console.log(`\n\n🏷️  ${groupInfo.name.toUpperCase()} [${group}]`);
    console.log(`   Service: ${tables[0]?.service || 'N/A'} | Tags: ${tables[0]?.tags?.join(', ') || 'N/A'}`);
    console.log('-'.repeat(80));
    
    tables.forEach(({ table, ...info }) => {
      console.log(`\n  📌 ${table}`);
      console.log(`     API Route: ${info.apiRoute || '❌ Not mapped'}`);
      console.log(`     Route File: ${info.routeFile || 'N/A'} ${info.routeFileExists ? '✅' : '❌'}`);
      console.log(`     UI Component: ${info.uiComponent || 'N/A'} ${info.uiComponentExists ? '✅' : '❌'}`);
      console.log(`     Methods: ${info.methods.join(', ') || 'N/A'}`);
      console.log(`     Service: ${info.service || 'N/A'}`);
      console.log(`     Tags: ${info.tags.join(', ') || 'N/A'}`);
      
      if (info.relationships.length > 0) {
        console.log(`     Relationships:`);
        info.relationships.forEach(rel => {
          const direction = rel.type === 'outgoing' ? '→' : '←';
          console.log(`       ${direction} ${rel.references}`);
        });
      }
    });
  });

  // Relationship graph
  console.log('\n\n🔗 RELATIONSHIP GRAPH');
  console.log('='.repeat(80));
  Object.entries(report.relationships).forEach(([table, rels]) => {
    if (rels.length > 0) {
      console.log(`\n${table}:`);
      rels.forEach(rel => {
        console.log(`  ${rel.column} → ${rel.references}.${rel.foreignColumn}`);
      });
    }
  });
}

// Main execution
async function main() {
  try {
    const report = await generateReport();
    printReport(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, 'reports', 'TABLE_TO_UI_MAPPING_REPORT.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n\n✅ Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateReport, TABLE_TO_API_MAPPING };

