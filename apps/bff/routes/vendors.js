const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/vendors - Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { risks: true, assessments: true },
    });
    res.json(vendors);
  } catch (error) {
    handleError(res, error, 'Error fetching vendors');
  }
});

// GET /api/vendors/:id - Get a single vendor by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id, 10) },
      include: { risks: true, assessments: true },
    });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    handleError(res, error, 'Error fetching vendor by ID');
  }
});

// POST /api/vendors - Create a new vendor
router.post('/', async (req, res) => {
  try {
    const newVendor = await prisma.vendor.create({ data: req.body });
    res.status(201).json(newVendor);
  } catch (error) {
    handleError(res, error, 'Error creating vendor');
  }
});

// GET /api/vendors/:id/risks - Get all risks associated with a vendor
router.get('/:id/risks', async (req, res) => {
  const { id } = req.params;
  try {
    const risks = await prisma.risk.findMany({
      where: { vendorId: parseInt(id, 10) },
    });
    res.json(risks);
  } catch (error) {
    handleError(res, error, 'Error fetching vendor risks');
  }
});

// POST /api/vendors/:id/assess - Create a new assessment for a vendor
router.post('/:id/assess', async (req, res) => {
  const { id } = req.params;
  try {
    // Assuming a 'VendorAssessment' model exists
    const assessment = await prisma.vendorAssessment.create({
      data: {
        vendorId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(assessment);
  } catch (error) {
    handleError(res, error, 'Error creating vendor assessment');
  }
});

module.exports = router;
