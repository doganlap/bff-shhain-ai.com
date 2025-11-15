const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const organizationService = require('../src/services/organization.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/organizations - Get all organizations
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const organizations = await prisma.organizations.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.organizations.count();

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching organizations');
  }
});

// GET /api/organizations/:id - Get a single organization by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(id, 10) },
      include: { units: true, users: true },
    });
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    handleError(res, error, 'Error fetching organization by ID');
  }
});

// PUT /api/organizations/:id - Update an existing organization
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedOrganization = await prisma.organization.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedOrganization);
  } catch (error) {
    handleError(res, error, 'Error updating organization');
  }
});

// GET /api/organizations/:id/units - Get business units for an organization
router.get('/:id/units', async (req, res) => {
  const { id } = req.params;
  try {
    const units = await prisma.businessUnit.findMany({
      where: { organizationId: parseInt(id, 10) },
    });
    res.json(units);
  } catch (error) {
    handleError(res, error, 'Error fetching business units');
  }
});

// POST /api/organizations - Create a new organization
router.post('/', async (req, res) => {
  try {
    const { name, description, type, industry, size, website, contactEmail, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        type,
        industry,
        size,
        website,
        contactEmail,
        isActive,
      },
    });

    res.status(201).json(organization);
  } catch (error) {
    handleError(res, error, 'Error creating organization');
  }
});

// DELETE /api/organizations/:id - Delete an organization
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.organization.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    handleError(res, error, 'Error deleting organization');
  }
});

// POST /api/organizations/:id/units - Create a business unit for an organization
router.post('/:id/units', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, type, managerId, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Business unit name is required' });
    }

    const unit = await prisma.businessUnit.create({
      data: {
        name,
        description,
        type,
        managerId,
        organizationId: parseInt(id, 10),
        isActive,
      },
    });

    res.status(201).json(unit);
  } catch (error) {
    handleError(res, error, 'Error creating business unit');
  }
});

module.exports = router;
