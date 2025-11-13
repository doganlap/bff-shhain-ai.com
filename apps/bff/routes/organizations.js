const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/organizations - Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: { units: true },
    });
    res.json(organizations);
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

module.exports = router;
