const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/compliance/gaps - Get all compliance gaps
router.get('/gaps', async (req, res) => {
  try {
    // Assuming a 'ComplianceGap' model exists
    const gaps = await prisma.complianceGap.findMany({
      include: { control: true, framework: true },
    });
    res.json(gaps);
  } catch (error) {
    handleError(res, error, 'Error fetching compliance gaps');
  }
});

// GET /api/compliance/score - Calculate the overall compliance score
router.get('/score', async (req, res) => {
  try {
    // This is a simplified calculation. A real implementation would be more complex.
    const totalControls = await prisma.control.count();
    const compliantControls = await prisma.control.count({
      where: { status: 'COMPLIANT' }, // Assuming a 'status' field
    });
    const score = totalControls > 0 ? (compliantControls / totalControls) * 100 : 0;
    res.json({ score: Math.round(score), total: totalControls, compliant: compliantControls });
  } catch (error) {
    handleError(res, error, 'Error calculating compliance score');
  }
});

// Note: The tasks-related endpoints (createTask, getTasks, updateTask) from complianceAPI
// should likely be in their own 'tasks.js' route file. They are omitted here for clarity.

module.exports = router;
