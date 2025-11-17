const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/reports/templates - Get available report templates
router.get('/templates', (req, res) => {
  // In a real app, this would come from a database or config file
  const templates = [
    { id: 'compliance_summary', name: 'Compliance Summary Report' },
    { id: 'risk_assessment', name: 'Risk Assessment Report' },
  ];
  res.json(templates);
});

// GET /api/reports/runs - Get a list of previously run reports
router.get('/runs', async (req, res) => {
  try {
    const runs = await prisma.reportRun.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(runs);
  } catch (error) {
    handleError(res, error, 'Error fetching report runs');
  }
});

// POST /api/reports/run - Run a new report
router.post('/run', async (req, res) => {
  const { template, params } = req.body;

  try {
    // 1. Create a record for the report run
    const reportRun = await prisma.reportRun.create({
      data: {
        templateId: template,
        status: 'PENDING',
        parameters: params ? JSON.stringify(params) : '{}',
      },
    });

    // 2. Asynchronously generate the report
    generateReport(reportRun.id, template, params);

    res.status(202).json(reportRun);
  } catch (error) {
    handleError(res, error, 'Error initiating report run');
  }
});

// GET /api/reports/runs/:id/download - Download a generated report
router.get('/runs/:id/download', async (req, res) => {
    const { id } = req.params;
    try {
        const reportRun = await prisma.reportRun.findUnique({ where: { id: parseInt(id, 10) } });
        if (!reportRun || !reportRun.filePath) {
            return res.status(404).json({ error: 'Report not found or not generated yet.' });
        }

        res.download(reportRun.filePath, reportRun.fileName);
    } catch (error) {
        handleError(res, error, 'Error downloading report');
    }
});

// --- Helper function for report generation ---
async function generateReport(runId, template, _params) {
  const doc = new PDFDocument();
  const fileName = `report-${runId}-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  try {
    await prisma.reportRun.update({ where: { id: runId }, data: { status: 'RUNNING' } });

    doc.pipe(fs.createWriteStream(filePath));

    // --- Report Content Generation ---
    doc.fontSize(25).text(`Report: ${template}`, { align: 'center' });
    doc.moveDown();

    if (template === 'compliance_summary') {
      const compliantControls = await prisma.control.count({ where: { status: 'COMPLIANT' } });
      const totalControls = await prisma.control.count();
      doc.fontSize(16).text('Compliance Summary');
      doc.text(`Total Controls: ${totalControls}`);
      doc.text(`Compliant Controls: ${compliantControls}`);
      doc.text(`Compliance Score: ${totalControls > 0 ? ((compliantControls / totalControls) * 100).toFixed(2) : 0}%`);
    } else if (template === 'risk_assessment') {
      const risks = await prisma.risk.findMany();
      doc.fontSize(16).text('Risk Assessment Summary');
      risks.forEach(risk => {
        doc.moveDown();
        doc.text(`Risk: ${risk.name} (Impact: ${risk.impact}, Likelihood: ${risk.likelihood})`);
      });
    }

    doc.end();

    // 4. Update the report run record with the file path
    await prisma.reportRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', filePath, fileName },
    });

  } catch (error) {
    console.error(`Error generating report ${runId}:`, error);
    await prisma.reportRun.update({
      where: { id: runId },
      data: { status: 'FAILED' },
    });
  }
}

module.exports = router;
