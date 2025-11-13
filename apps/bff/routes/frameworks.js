// routes/frameworks.js

const express = require('express');
const prisma = require('../db/prisma');
const router = express.Router();

// GET /api/frameworks - Replicated from grc-api
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const frameworks = await prisma.framework.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { name: 'asc' },
    });

    const total = await prisma.framework.count({ where });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: frameworks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching frameworks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch frameworks' });
  }
});

// GET /api/frameworks/:id - Replicated from grc-api
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const framework = await prisma.framework.findUnique({
      where: { id },
      include: {
        controls: {
          where: { isActive: true },
          orderBy: { controlId: 'asc' },
        },
      },
    });

    if (!framework) {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }

    res.json({ success: true, data: framework });
  } catch (error) {
    console.error(`❌ Error fetching framework ${id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch framework' });
  }
});

module.exports = router;
