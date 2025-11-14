const express = require('express');
const { dbQueries } = require('../config/database');
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

    const result = await dbQueries.compliance.query(`
      SELECT
        f.id,
        f.name,
        f.description,
        0 as control_count,
        'regulator' as type,
        true as is_active,
        NOW() as created_at
      FROM frameworks f
      WHERE f.is_active = $1
      ORDER BY f.name
    `, [is_active]);

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

    const regulatorResult = await dbQueries.compliance.query(`
      SELECT 
        f.id,
        f.name,
        f.description,
        'regulator' as type,
        true as is_active,
        NOW() as created_at
      FROM frameworks f
      WHERE f.id = $1 AND f.is_active = true
    `, [id]);

    if (regulatorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regulator not found'
      });
    }

    const frameworksResult = await dbQueries.compliance.query(`
      SELECT
        f.id,
        f.name,
        f.description,
        'framework' as type,
        true as is_active
      FROM frameworks f
      WHERE f.id != $1 AND f.is_active = true
      ORDER BY f.name
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
