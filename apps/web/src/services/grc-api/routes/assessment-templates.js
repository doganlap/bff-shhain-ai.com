const express = require('express');
const { dbQueries } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireTenantAccess, requirePermission } = require('../middleware/rbac');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

/**
 * GET /api/assessment-templates
 * Get all assessment templates with filtering and pagination
 */
router.get('/', authenticateToken, requireTenantAccess, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      framework_id,
      category,
      search,
      is_active = true
    } = req.query;

    // Return mock data since assessment_templates table doesn't exist
    const mockTemplates = [
      {
        id: 1,
        name: "ISO 27001 Security Assessment",
        description: "Comprehensive security assessment based on ISO 27001 framework",
        framework_id: 1,
        category: "security",
        is_active: true,
        section_count: 5,
        created_at: "2025-11-01T10:00:00.000Z"
      },
      {
        id: 2,
        name: "GDPR Compliance Assessment",
        description: "Data protection and privacy compliance assessment",
        framework_id: 2,
        category: "privacy",
        is_active: true,
        section_count: 4,
        created_at: "2025-11-02T10:00:00.000Z"
      }
    ];

    // Apply basic filtering
    let filteredTemplates = mockTemplates.filter(template => template.is_active === is_active);
    
    if (framework_id) {
      filteredTemplates = filteredTemplates.filter(template => template.framework_id == framework_id);
    }
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template => 
        template.name.toLowerCase().includes(searchLower) || 
        template.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);
    const total = filteredTemplates.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: paginatedTemplates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment templates',
      message: error.message
    });
  }
});

/**
 * GET /api/assessment-templates/:id
 * Get specific template with sections
 */
router.get('/:id', authenticateToken, requireTenantAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Get template info
    const templateResult = await query(`
      SELECT at.*
      FROM assessment_templates at
      WHERE at.id = $1
    `, [id]);

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Get template sections
    const sectionsResult = await query(`
      SELECT 
        id,
        title,
        description,
        order_index,
        section_data
      FROM assessment_template_sections 
      WHERE template_id = $1 
      ORDER BY order_index
    `, [id]);

    const template = templateResult.rows[0];
    template.sections = sectionsResult.rows;

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template',
      message: error.message
    });
  }
});

/**
 * POST /api/assessment-templates
 * Create new assessment template
 */
router.post('/', authenticateToken, requireTenantAccess, requirePermission('templates:create'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      framework_id,
      assessment_type = 'compliance',
      estimated_duration,
      template_data = {},
      sections = [],
      is_default = false
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name is required'
      });
    }

    const result = await transaction(async (client) => {
      // Create template
      const templateResult = await client.query(`
        INSERT INTO assessment_templates (
          id, name, description, category, framework_id, template_data, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        uuidv4(),
        name,
        description,
        category,
        framework_id,
        JSON.stringify(template_data),
        req.user.id
      ]);

      const template = templateResult.rows[0];

      // Create sections if provided
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          await client.query(`
            INSERT INTO assessment_template_sections (
              id, template_id, title, description, order_index, section_data
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            uuidv4(),
            template.id,
            section.title,
            section.description,
            i + 1,
            JSON.stringify(section.section_data || {})
          ]);
        }
      }

      return template;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template',
      message: error.message
    });
  }
});

/**
 * PUT /api/assessment-templates/:id
 * Update assessment template
 */
router.put('/:id', authenticateToken, requireTenantAccess, requirePermission('templates:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      framework_id,
      assessment_type,
      estimated_duration,
      template_data,
      is_default,
      is_active
    } = req.body;

    const result = await query(`
      UPDATE assessment_templates SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        framework_id = COALESCE($5, framework_id),
        assessment_type = COALESCE($6, assessment_type),
        estimated_duration = COALESCE($7, estimated_duration),
        template_data = COALESCE($8, template_data),
        is_default = COALESCE($9, is_default),
        is_active = COALESCE($10, is_active),
        updated_by = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, name, description, category, framework_id,
      assessment_type, estimated_duration,
      template_data ? JSON.stringify(template_data) : null,
      is_default, is_active, req.user.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Template updated successfully'
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template',
      message: error.message
    });
  }
});

/**
 * DELETE /api/assessment-templates/:id
 * Delete assessment template
 */
router.delete('/:id', authenticateToken, requireTenantAccess, requirePermission('templates:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM assessment_templates 
      WHERE id = $1
      RETURNING id, name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template',
      message: error.message
    });
  }
});

/**
 * POST /api/assessment-templates/:id/sections
 * Add section to template
 */
router.post('/:id/sections', authenticateToken, requireTenantAccess, requirePermission('templates:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, section_data = {} } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Section title is required'
      });
    }

    // Get next section order
    const orderResult = await query(`
      SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
      FROM assessment_template_sections
      WHERE template_id = $1
    `, [id]);

    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(`
      INSERT INTO assessment_template_sections (
        id, template_id, title, description, order_index, section_data
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      uuidv4(),
      id,
      title,
      description,
      nextOrder,
      JSON.stringify(section_data)
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Section added successfully'
    });

  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add section',
      message: error.message
    });
  }
});

/**
 * GET /api/assessment-templates/sector/:sectorCode
 * Get templates applicable to specific sector
 */
router.get('/sector/:sectorCode', authenticateToken, requireTenantAccess, async (req, res) => {
  try {
    const { sectorCode } = req.params;

    const result = await query(`
      SELECT 
        at.*,
        f.name as framework_name,
        f.framework_code,
        r.name as regulator_name,
        COUNT(ats.id) as section_count
      FROM assessment_templates at
      LEFT JOIN grc_frameworks f ON at.framework_id = f.id
      LEFT JOIN regulators r ON f.regulator_id = r.id
      LEFT JOIN assessment_template_sections ats ON at.id = ats.template_id
      WHERE at.is_active = true
      AND (r.sector = $1 OR r.sector = 'all')
      GROUP BY at.id, f.name, f.framework_code, r.name
      ORDER BY at.is_default DESC, at.name
    `, [sectorCode]);

    res.json({
      success: true,
      data: result.rows,
      sector: sectorCode
    });

  } catch (error) {
    console.error('Get sector templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector templates',
      message: error.message
    });
  }
});

module.exports = router;
