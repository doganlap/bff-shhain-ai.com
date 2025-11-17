// routes/frameworks.js

const express = require('express');
const prisma = require('../db/prisma');
// const frameworkService = require('../src/services/framework.service');
const router = express.Router();

// GET /api/frameworks - Replicated from grc-api
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  try {

    const where = {};

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
      take: parsedLimit,
      orderBy: { name: 'asc' },
    });

    const total = await prisma.framework.count({ where });
    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      success: true,
      data: frameworks,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        hasNext: parsedPage < totalPages,
        hasPrev: parsedPage > 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch frameworks:', error.message);
    return res.json({
      success: true,
      data: [],
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    });
  }
});

// GET /api/frameworks/:id - Replicated from grc-api
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const framework = await prisma.framework.findUnique({
      where: { id },
    });

    if (!framework) {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }

    res.json({ success: true, data: framework });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch framework' });
  }
});

// POST /api/frameworks - Create a new framework
router.post('/', async (req, res) => {
  try {
    const { name, description, category, version, isActive = true } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const framework = await prisma.grc_frameworks.create({
      data: {
        framework_name: name,
        description,
        category,
        version: version || '1.0',
      },
    });

    res.status(201).json({ success: true, data: framework });
  } catch (error) {
    console.error('❌ Error creating framework:', error);
    res.status(500).json({ success: false, error: 'Failed to create framework' });
  }
});

// PUT /api/frameworks/:id - Update an existing framework
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, category, version, isActive } = req.body;

    const framework = await prisma.framework.update({
      where: { id },
      data: {
        name,
        description,
        category,
        version,
        updatedAt: new Date(),
      },
    });

    res.json({ success: true, data: framework });
  } catch (error) {
    console.error(`❌ Error updating framework ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update framework' });
  }
});

// DELETE /api/frameworks/:id - Delete a framework
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.framework.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Framework deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting framework ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete framework' });
  }
});

// GET /api/frameworks/:id/controls - Get controls for a framework
router.get('/:id/controls', async (req, res) => {
  const { id } = req.params;
  try {
    const controls = await prisma.control.findMany({
      where: { frameworkId: id },
      orderBy: { controlId: 'asc' },
    });

    res.json({ success: true, data: controls });
  } catch (error) {
    console.error(`❌ Error fetching controls for framework ${id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch controls' });
  }
});

// GET /api/frameworks/:id/analytics - Get analytics for a framework
router.get('/:id/analytics', async (req, res) => {
  const { id } = req.params;
  try {
    const framework = await prisma.framework.findUnique({
      where: { id },
      include: {
        controls: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            implementationStatus: true,
          },
        },
      },
    });

    if (!framework) {
      return res.status(404).json({ success: false, error: 'Framework not found' });
    }

    const totalControls = framework.controls.length;
    const implementedControls = framework.controls.filter(
      c => c.implementationStatus === 'implemented'
    ).length;
    const complianceRate = totalControls > 0 ? (implementedControls / totalControls) * 100 : 0;

    const analytics = {
      totalControls,
      implementedControls,
      complianceRate: Math.round(complianceRate * 100) / 100,
      controlsByStatus: framework.controls.reduce((acc, control) => {
        acc[control.status] = (acc[control.status] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error(`❌ Error fetching analytics for framework ${id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
