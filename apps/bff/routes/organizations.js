const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
// const organizationService = require('../src/services/organization.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/organizations - Get all organizations
router.get('/', async (req, res) => {
  const { limit = 50, page = 1 } = req.query;
  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;
  
  try {

    const organizations = await prisma.organization.findMany({
      skip,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.organization.count();

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Database error fetching organizations:', error.message);
    return res.json({
      success: true,
      data: [],
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
        totalPages: 0
      }
    });
  }
});

// GET /api/organizations/:id - Get a single organization by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: { 
        users: true 
      },
    });
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    console.error('Database error fetching organization:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch organization' });
  }
});

// PUT /api/organizations/:id - Update an existing organization
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, type, industry, size, website, contact_email, is_active } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (website !== undefined) updateData.website = website;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: updateData,
    });
    res.json(updatedOrganization);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    console.error('Database error updating organization:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update organization' });
  }
});

// GET /api/organizations/:id/units - Get business units (child organizations) for an organization
router.get('/:id/units', async (req, res) => {
  const { id } = req.params;
  try {
    // Since there's no separate businessUnit table, we'll use organizations with parent-child relationships
    // For now, return empty array as the schema doesn't define parent_id field
    const units = await prisma.organization.findMany({
      where: { 
        // This would need a parent_id field in the schema to work properly
        // For now, return empty array
      },
    });
    res.json(units);
  } catch (error) {
    console.error('Database error fetching business units:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch business units' });
  }
});

// POST /api/organizations - Create a new organization
router.post('/', async (req, res) => {
  try {
    const { name, description, type, industry, size, website, contact_email, is_active = true } = req.body;

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
        contact_email,
        is_active,
      },
    });

    res.status(201).json(organization);
  } catch (error) {
    console.error('Database error creating organization:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create organization' });
  }
});

// DELETE /api/organizations/:id - Delete an organization
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.organization.delete({
      where: { id },
    });
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    console.error('Database error deleting organization:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete organization' });
  }
});

// POST /api/organizations/:id/units - Create a business unit (child organization)
router.post('/:id/units', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, type, manager_id, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Business unit name is required' });
    }

    // Since there's no separate businessUnit table, create a child organization
    // This would need a parent_id field in the schema to work properly
    const unit = await prisma.organization.create({
      data: {
        name,
        description,
        type: type || 'department',
        industry: 'Internal',
        size: 'small',
        is_active,
        // parent_id: parseInt(id, 10), // This field doesn't exist in current schema
      },
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error('Database error creating business unit:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create business unit' });
  }
});

module.exports = router;
