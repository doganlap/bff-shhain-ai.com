const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const { authenticateToken } = require('../middleware/enhancedAuth');
const { requirePermission } = require('../middleware/rbac');
const { logger } = require('../utils/logger');

/**
 * Get table data with pagination, search, and sorting
 * Access Control: Requires 'tables:view' permission
 */
router.get('/data', async (req, res) => {
  // Development bypass for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devBypass = isDevelopment && (req.headers['x-dev-bypass'] === 'true' || req.query.dev === 'true');
  
  if (!devBypass) {
    // Apply authentication and permission checks
    try {
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        requirePermission('tables:view')(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission: tables:view',
        code: 'FORBIDDEN',
        required_permission: 'tables:view'
      });
    }
  } else {
    // Development bypass - create mock user
    req.user = { 
      id: 'dev-user-123', 
      email: 'dev@example.com',
      tenantId: 'dev-tenant-123',
      roles: ['platform_admin'],
      permissions: ['tables:view', 'tables:export', '*']
    };
  }
  try {
    const { 
      table, 
      page = 1, 
      limit = 20, 
      search = '', 
      sort = '',
      tenantId = req.user?.tenantId 
    } = req.query;

    if (!table) {
      return res.status(400).json({
        success: false,
        error: 'Table name is required',
        message: 'Please provide a table name parameter'
      });
    }

    // Security: Validate table name to prevent SQL injection
    // Support both table names and Prisma model names
    const allowedTables = [
      // Table names (lowercase)
      'tenants', 'users', 'organizations', 'frameworks', 'controls', 
      'assessments', 'risks', 'evidence', 'documents', 'audit_logs',
      'demo_requests', 'poc_requests', 'partner_invitations', 'activity_logs',
      'assessment_controls', 'assessment_evidence', 'assessment_findings',
      'gap_analysis', 'grc_controls', 'grc_frameworks', 'notifications',
      'remediation_plans', 'remediation_tasks', 'tasks', 'users',
      // Prisma model names (PascalCase)
      'Tenant', 'User', 'Organization', 'Framework', 'Control', 
      'Assessment', 'Risk', 'Evidence', 'Document', 'AuditLog',
      'DemoRequest', 'PocRequest', 'PartnerInvitation', 'ActivityLog',
      'AssessmentControl', 'AssessmentEvidence', 'AssessmentFinding',
      'GapAnalysis', 'GrcControl', 'GrcFramework', 'Notification',
      'RemediationPlan', 'RemediationTask', 'Task', 'User'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Access to this table is not allowed'
      });
    }

    // Map table names to Prisma model names
    const modelMap = {
      // Table names to Prisma models
      'tenants': 'tenants',
      'users': 'users',
      'organizations': 'organizations',
      'frameworks': 'Framework',
      'controls': 'Control',
      'assessments': 'Assessment',
      'risks': 'Risk',
      'evidence': 'Evidence',
      'documents': 'Document',
      'audit_logs': 'audit_logs',
      'demo_requests': 'demo_requests',
      'poc_requests': 'poc_requests',
      'partner_invitations': 'partner_invitations',
      'activity_logs': 'activity_logs',
      'assessment_controls': 'assessment_controls',
      'assessment_evidence': 'assessment_evidence',
      'assessment_findings': 'assessment_findings',
      'gap_analysis': 'gap_analysis',
      'grc_controls': 'grc_controls',
      'grc_frameworks': 'grc_frameworks',
      'notifications': 'notifications',
      'remediation_plans': 'remediation_plans',
      'remediation_tasks': 'remediation_tasks',
      'tasks': 'tasks',
      // Prisma model names (direct mapping)
      'Tenant': 'tenants',
      'User': 'users',
      'Organization': 'organizations',
      'Framework': 'Framework',
      'Control': 'Control',
      'Assessment': 'Assessment',
      'Risk': 'Risk',
      'Evidence': 'Evidence',
      'Document': 'Document',
      'AuditLog': 'audit_logs',
      'DemoRequest': 'demo_requests',
      'PocRequest': 'poc_requests',
      'PartnerInvitation': 'partner_invitations',
      'ActivityLog': 'activity_logs',
      'AssessmentControl': 'assessment_controls',
      'AssessmentEvidence': 'assessment_evidence',
      'AssessmentFinding': 'assessment_findings',
      'GapAnalysis': 'gap_analysis',
      'GrcControl': 'grc_controls',
      'GrcFramework': 'grc_frameworks',
      'Notification': 'notifications',
      'RemediationPlan': 'remediation_plans',
      'RemediationTask': 'remediation_tasks',
      'Task': 'tasks'
    };
    
    const prismaModelName = modelMap[table] || table;
    const model = prisma[prismaModelName];

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
        message: `Table '${table}' does not exist in the database`
      });
    }

    // Build where clause with tenant isolation
    const where = {};
    
    // Only apply tenant isolation for tables that have tenant_id field
    // and it's not the tenants table itself
    if (tenantId && table !== 'tenants' && table !== 'Tenant') {
      // Models that have tenant_id field
      const tenantAwareModels = [
        'users', 'User',
        'organizations', 'Organization', 
        'frameworks', 'Framework',
        'controls', 'Control',
        'assessments', 'Assessment',
        'risks', 'Risk',
        'evidence', 'Evidence',
        'documents', 'Document',
        'audit_logs', 'AuditLog',
        'demo_requests', 'DemoRequest',
        'poc_requests', 'PocRequest',
        'partner_invitations', 'PartnerInvitation',
        'activity_logs', 'ActivityLog',
        'assessment_controls', 'AssessmentControl',
        'assessment_evidence', 'AssessmentEvidence',
        'assessment_findings', 'AssessmentFinding',
        'gap_analysis', 'GapAnalysis',
        'grc_controls', 'GrcControl',
        'grc_frameworks', 'GrcFramework',
        'notifications', 'Notification',
        'remediation_plans', 'RemediationPlan',
        'remediation_tasks', 'RemediationTask',
        'tasks', 'Task'
      ];
      
      if (tenantAwareModels.includes(table)) {
        // Use the correct field name based on the model
        const tenantFieldMap = {
          'users': 'tenant_id', 'User': 'tenantId',
          'organizations': 'tenant_id', 'Organization': 'tenantId',
          'frameworks': 'tenant_id', 'Framework': 'organizationId',
          'controls': 'tenant_id', 'Control': 'frameworkId',
          'assessments': 'tenant_id', 'Assessment': 'controlId',
          'risks': 'tenant_id', 'Risk': 'organizationId',
          'evidence': 'tenant_id', 'Evidence': 'assessmentId',
          'documents': 'tenant_id', 'Document': 'authorId',
          'audit_logs': 'tenant_id', 'AuditLog': 'userId',
          'demo_requests': 'tenant_id', 'DemoRequest': 'tenant_id',
          'poc_requests': 'tenant_id', 'PocRequest': 'tenant_id',
          'partner_invitations': 'partner_tenant_id', 'PartnerInvitation': 'partner_tenant_id',
          'activity_logs': 'tenant_id', 'ActivityLog': 'tenant_id',
          'assessment_controls': 'tenant_id', 'AssessmentControl': 'tenant_id',
          'assessment_evidence': 'tenant_id', 'AssessmentEvidence': 'tenant_id',
          'assessment_findings': 'tenant_id', 'AssessmentFinding': 'tenant_id',
          'gap_analysis': 'tenant_id', 'GapAnalysis': 'tenant_id',
          'grc_controls': 'tenant_id', 'GrcControl': 'tenant_id',
          'grc_frameworks': 'tenant_id', 'GrcFramework': 'tenant_id',
          'notifications': 'tenant_id', 'Notification': 'tenant_id',
          'remediation_plans': 'tenant_id', 'RemediationPlan': 'tenant_id',
          'remediation_tasks': 'tenant_id', 'RemediationTask': 'tenant_id',
          'tasks': 'tenant_id', 'Task': 'tenant_id'
        };
        
        const tenantField = tenantFieldMap[table];
        if (tenantField) {
          where[tenantField] = tenantId;
        }
      }
    }

    // Add search functionality
    if (search) {
      // Get table columns to build search conditions
      const columns = await getTableColumns(table);
      const searchableColumns = columns.filter(col => 
        ['String', 'Text'].includes(col.dataType) && 
        !['id', 'password', 'token'].includes(col.name)
      );

      if (searchableColumns.length > 0) {
        where.OR = searchableColumns.map(col => ({
          [col.name]: { contains: search, mode: 'insensitive' }
        }));
      }
    }

    // Parse sort parameter (format: "column:direction")
    let orderBy = {};
    if (sort) {
      const [column, direction = 'asc'] = sort.split(':');
      orderBy = { [column]: direction.toLowerCase() };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
        skip,
        take
      }),
      model.count({ where })
    ]);

    logger.info('Table data retrieved', {
      table,
      userId: req.user.id,
      tenantId,
      page,
      limit,
      total,
      search: search ? 'yes' : 'no',
      sort: sort || 'none'
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error retrieving table data', {
      error: error.message,
      table: req.query.table,
      userId: req.user?.id,
      tenantId: req.user?.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve table data',
      message: error.message
    });
  }
});

/**
 * Get table schema/metadata
 * Access Control: Requires 'tables:view' permission
 */
router.get('/schema', async (req, res) => {
  // Development bypass for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devBypass = isDevelopment && (req.headers['x-dev-bypass'] === 'true' || req.query.dev === 'true');
  
  if (!devBypass) {
    // Apply authentication and permission checks
    try {
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        requirePermission('tables:view')(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission: tables:view',
        code: 'FORBIDDEN',
        required_permission: 'tables:view'
      });
    }
  } else {
    // Development bypass - create mock user
    req.user = { 
      id: 'dev-user-123', 
      email: 'dev@example.com',
      tenantId: 'dev-tenant-123',
      roles: ['platform_admin'],
      permissions: ['tables:view', 'tables:export', '*']
    };
  }
  try {
    const { table, tenantId = req.user?.tenantId } = req.query;

    if (!table) {
      return res.status(400).json({
        success: false,
        error: 'Table name is required',
        message: 'Please provide a table name parameter'
      });
    }

    // Security: Validate table name - use same mapping as data endpoint
    const allowedTables = [
      // Table names (lowercase)
      'tenants', 'users', 'organizations', 'frameworks', 'controls', 
      'assessments', 'risks', 'evidence', 'documents', 'audit_logs',
      'demo_requests', 'poc_requests', 'partner_invitations', 'activity_logs',
      'assessment_controls', 'assessment_evidence', 'assessment_findings',
      'gap_analysis', 'grc_controls', 'grc_frameworks', 'notifications',
      'remediation_plans', 'remediation_tasks', 'tasks', 'users',
      // Prisma model names (PascalCase)
      'Tenant', 'User', 'Organization', 'Framework', 'Control', 
      'Assessment', 'Risk', 'Evidence', 'Document', 'AuditLog',
      'DemoRequest', 'PocRequest', 'PartnerInvitation', 'ActivityLog',
      'AssessmentControl', 'AssessmentEvidence', 'AssessmentFinding',
      'GapAnalysis', 'GrcControl', 'GrcFramework', 'Notification',
      'RemediationPlan', 'RemediationTask', 'Task', 'User',
      'Session'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Access to this table schema is not allowed'
      });
    }

    const columns = await getTableColumns(table);
    
    // Filter sensitive columns based on user permissions
    const filteredColumns = columns.filter(col => {
      // Hide sensitive columns from non-admin users
      if (['password', 'token', 'secret', 'api_key'].includes(col.name)) {
        return req.user?.roles?.includes('super_admin') || req.user?.roles?.includes('system_admin');
      }
      return true;
    });

    logger.info('Table schema retrieved', {
      table,
      userId: req.user.id,
      tenantId,
      columns: filteredColumns.length
    });

    res.json({
      success: true,
      columns: filteredColumns.map(col => ({
        name: col.name,
        label: col.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: (col.dataType || 'text').toLowerCase(),
        sortable: !['text', 'json', 'jsonb'].includes((col.dataType || 'text').toLowerCase()),
        filterable: ['String', 'Int', 'Float', 'Boolean', 'DateTime'].includes(col.dataType || ''),
        required: !col.isNullable
      }))
    });

  } catch (error) {
    logger.error('Error retrieving table schema', {
      error: error.message,
      table: req.query.table,
      userId: req.user?.id,
      tenantId: req.user?.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve table schema',
      message: error.message
    });
  }
});

/**
 * Export table data
 * Access Control: Requires 'tables:export' permission
 */
router.get('/:table/export/:format', authenticateToken, requirePermission('tables:export'), async (req, res) => {
  try {
    const { table, format } = req.params;
    const { tenantId = req.user?.tenantId, search = '', sort = '' } = req.query;

    // Validate format
    if (!['csv', 'json', 'xlsx'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: 'Supported formats: csv, json, xlsx'
      });
    }

    // Security: Validate table name
    const allowedTables = [
      'tenants', 'users', 'organizations', 'frameworks', 'controls', 
      'assessments', 'risks', 'compliance', 'evidence', 'documents',
      'regulators', 'vendors', 'workflows', 'notifications', 'reports',
      'demo_requests', 'poc_requests', 'partner_invitations'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Export of this table is not allowed'
      });
    }

    // Get the Prisma model
    const modelName = table.charAt(0).toUpperCase() + table.slice(1);
    const model = prisma[modelName];

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
        message: `Table '${table}' does not exist in the database`
      });
    }

    // Build where clause
    const where = {};
    if (tenantId && table !== 'tenants') {
      where.tenant_id = tenantId;
    }

    // Add search functionality
    if (search) {
      const columns = await getTableColumns(table);
      const searchableColumns = columns.filter(col => 
        ['String', 'Text'].includes(col.dataType) && 
        !['id', 'password', 'token'].includes(col.name)
      );

      if (searchableColumns.length > 0) {
        where.OR = searchableColumns.map(col => ({
          [col.name]: { contains: search, mode: 'insensitive' }
        }));
      }
    }

    // Parse sort parameter
    let orderBy = {};
    if (sort) {
      const [column, direction = 'asc'] = sort.split(':');
      orderBy = { [column]: direction.toLowerCase() };
    }

    // Fetch all data (no pagination for export)
    const data = await model.findMany({
      where,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined
    });

    logger.info('Table export completed', {
      table,
      format,
      userId: req.user.id,
      tenantId,
      records: data.length
    });

    // Set appropriate headers for file download
    const filename = `${table}_${new Date().toISOString().split('T')[0]}.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    switch (format) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.send(convertToCSV(data));
        break;
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
        break;
      case 'xlsx':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // For now, send CSV data for Excel format
        res.send(convertToCSV(data));
        break;
    }

  } catch (error) {
    logger.error('Error exporting table data', {
      error: error.message,
      table: req.params.table,
      format: req.params.format,
      userId: req.user?.id,
      tenantId: req.user?.tenantId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to export table data',
      message: error.message
    });
  }
});

/**
 * Helper function to get table column information
 */
async function getTableColumns(tableName) {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        column_name as name,
        data_type as dataType,
        is_nullable as isNullable,
        column_default as defaultValue
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    return result;
  } catch (error) {
    logger.error('Error getting table columns', { tableName, error: error.message });
    return [];
  }
}

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;