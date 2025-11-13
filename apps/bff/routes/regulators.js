const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/regulators - Get all regulators
router.get('/', async (req, res) => {
  try {
    const regulators = await prisma.regulator.findMany({
      include: { publications: true },
    });
    res.json(regulators);
  } catch (error) {
    handleError(res, error, 'Error fetching regulators');
  }
});

// GET /api/regulators/:id - Get a single regulator by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const regulator = await prisma.regulator.findUnique({
      where: { id: parseInt(id, 10) },
      include: { publications: true },
    });
    if (!regulator) {
      return res.status(404).json({ error: 'Regulator not found' });
    }
    res.json(regulator);
  } catch (error) {
    handleError(res, error, 'Error fetching regulator by ID');
  }
});

// GET /api/regulators/:id/publications - Get publications for a regulator
router.get('/:id/publications', async (req, res) => {
  const { id } = req.params;
  try {
    const publications = await prisma.publication.findMany({
      where: { regulatorId: parseInt(id, 10) },
    });
    res.json(publications);
  } catch (error) {
    handleError(res, error, 'Error fetching regulator publications');
  }
});

module.exports = router;
