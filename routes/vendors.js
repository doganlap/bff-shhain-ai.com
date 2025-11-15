const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const vendorService = require('../src/services/vendor.service');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/vendors/stats - Get vendor statistics
router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const stats = await vendorService.getVendorStats(tenantId);
    res.json({ success: true, data: stats });
  } catch (error) {
    handleError(res, error, 'Error fetching vendor statistics');
  }
});

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

// PUT /api/vendors/:id - Update an existing vendor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedVendor);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    handleError(res, error, 'Error updating vendor');
  }
});

// DELETE /api/vendors/:id - Delete a vendor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.vendor.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    handleError(res, error, 'Error deleting vendor');
  }
});

// POST /api/vendors/:id/risks - Add a risk to a vendor
router.post('/:id/risks', async (req, res) => {
  const { id } = req.params;
  try {
    const risk = await prisma.risk.create({
      data: {
        vendorId: parseInt(id, 10),
        ...req.body,
      },
    });
    res.status(201).json(risk);
  } catch (error) {
    handleError(res, error, 'Error creating vendor risk');
  }
});

// GET /api/vendors/stats - Get vendor statistics
router.get('/stats', async (req, res) => {
  try {
    const totalVendors = await prisma.vendor.count();
    const activeVendors = await prisma.vendor.count({
      where: { isActive: true }
    });
    const highRiskVendors = await prisma.vendor.count({
      where: { riskLevel: 'high' }
    });

    const vendorsByCategory = await prisma.vendor.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    const vendorsByRiskLevel = await prisma.vendor.groupBy({
      by: ['riskLevel'],
      _count: { id: true }
    });

    const stats = {
      totalVendors,
      activeVendors,
      highRiskVendors,
      vendorsByCategory: vendorsByCategory.reduce((acc, item) => {
        acc[item.category] = item._count.id;
        return acc;
      }, {}),
      vendorsByRiskLevel: vendorsByRiskLevel.reduce((acc, item) => {
        acc[item.riskLevel] = item._count.id;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    handleError(res, error, 'Error fetching vendor statistics');
  }
});

module.exports = router;
