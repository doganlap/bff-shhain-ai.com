const express = require('express');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

/**
 * GET /api/regulators
 * Get all regulators with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { sector, country, is_active = true } = req.query;

    let whereConditions = ['r.is_active = $1'];
    let queryParams = [is_active];
    let paramCount = 1;

    if (sector) {
      paramCount++;
      whereConditions.push(`(r.sector_id = $${paramCount} OR r.sector_id = 'all')`);
      queryParams.push(sector);
    }

    if (country) {
      paramCount++;
      whereConditions.push(`r.country_code = $${paramCount}`);
      queryParams.push(country);
    }

    const whereClause = whereConditions.join(' AND ');

    const result = await query(`
      SELECT
        r.*,
        COUNT(f.id) as framework_count,
        COUNT(DISTINCT c.id) as control_count
      FROM unified_regulatory_authorities r
      LEFT JOIN unified_frameworks f ON r.id = f.regulator_id AND f.is_active = true
      LEFT JOIN unified_controls_master c ON f.id = c.framework_id AND c.is_active = true
      WHERE ${whereClause}
      GROUP BY r.id
      ORDER BY r.name_en
    `, queryParams);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching regulators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regulators',
      message: error.message
    });
  }
});

/**
 * GET /api/regulators/:id
 * Get regulator by ID with frameworks
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const regulatorResult = await query(`
      SELECT * FROM unified_regulatory_authorities WHERE id = $1 AND is_active = true
    `, [id]);

    if (regulatorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regulator not found'
      });
    }

    const frameworksResult = await query(`
      SELECT
        f.*,
        COUNT(c.id) as control_count
      FROM unified_frameworks f
      LEFT JOIN unified_controls_master c ON f.id = c.framework_id AND c.is_active = true
      WHERE f.regulator_id = $1 AND f.is_active = true
      GROUP BY f.id
      ORDER BY f.name_en
    `, [id]);

    res.json({
      success: true,
      data: {
        regulator: regulatorResult.rows[0],
        frameworks: frameworksResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Error fetching regulator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regulator',
      message: error.message
    });
  }
});

module.exports = router;
