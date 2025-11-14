const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      queryParams.push(category);
    }

    if (search) {
      paramCount++;
      whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM grc_frameworks WHERE ${whereClause}
    `, queryParams);

    // Get frameworks with pagination
    queryParams.push(limit, offset);
    const { rows } = await query(`
      SELECT
        id, name, name_ar, version, category, description,
        issuing_authority, effective_date, status, is_active,
        created_at, updated_at
      FROM grc_frameworks
      WHERE ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching frameworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frameworks',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(`
      SELECT
        f.id,
        f.framework_code,
        f.name_en,
        f.name_ar,
        f.description_en,
        f.description_ar,
        f.framework_type,
        f.category,
        f.industry_sectors,
        f.issuing_authority_id,
        r.name_en as authority_name_en,
        r.name_ar as authority_name_ar
      FROM
        unified_frameworks f
      LEFT JOIN
        unified_regulatory_authorities r
      ON
        f.issuing_authority_id = r.id
      WHERE
        f.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Framework not found'
      });
    }

    const controlsResult = await query(`
      SELECT * FROM unified_controls_master
      WHERE framework_id = $1 AND is_active = true
      ORDER BY control_id
    `, [id]);

    res.json({
      success: true,
      data: {
        framework: frameworkResult.rows[0],
        controls: controlsResult.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch framework',
      message: error.message
    });
  }
});

module.exports = router;
