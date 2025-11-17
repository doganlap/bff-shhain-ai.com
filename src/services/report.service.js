/**
 * Report Service - PDF and Excel report generation
 * Handles automated reporting, scheduling, and export formats
 */

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const prisma = require('../../db/prisma');

// Report templates configuration
const REPORT_TEMPLATES = {
  COMPLIANCE_SUMMARY: {
    id: 'compliance_summary',
    name: 'Compliance Summary Report',
    formats: ['pdf', 'excel']
  },
  RISK_ASSESSMENT: {
    id: 'risk_assessment',
    name: 'Risk Assessment Report',
    formats: ['pdf', 'excel']
  },
  AUDIT_TRAIL: {
    id: 'audit_trail',
    name: 'Audit Trail Report',
    formats: ['pdf', 'excel']
  },
  FRAMEWORK_COVERAGE: {
    id: 'framework_coverage',
    name: 'Framework Coverage Report',
    formats: ['pdf', 'excel']
  }
};

/**
 * Generate compliance summary PDF
 * @param {string} tenantId - Tenant identifier
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Generated file path
 */
async function generateCompliancePDF(tenantId, outputPath) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  doc.fontSize(20).text('Compliance Summary Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  const { calculateComplianceScore } = require('./compliance.service');
  const frameworks = await prisma.grc_frameworks.findMany({
    where: tenantId ? { tenant_id: tenantId } : {},
    take: 10
  });

  for (const framework of frameworks) {
    const score = await calculateComplianceScore(framework.framework_id, tenantId);
    doc.fontSize(14).text(framework.name || framework.framework_name);
    doc.fontSize(10).text(`Compliance Score: ${score.score}% (${score.level})`);
    doc.text(`Total Requirements: ${score.total}`);
    doc.text(`Compliant: ${score.compliant} | Non-Compliant: ${score.nonCompliant}`);
    doc.moveDown();
  }

  doc.end();

  return await new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

/**
 * Generate risk assessment Excel report
 * @param {string} tenantId - Tenant identifier
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Generated file path
 */
async function generateRiskExcel(tenantId, outputPath) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Risk Assessment');

    // Header
    worksheet.columns = [
      { header: 'Risk ID', key: 'risk_id', width: 15 },
      { header: 'Title', key: 'risk_title', width: 30 },
      { header: 'Likelihood', key: 'likelihood_level', width: 12 },
      { header: 'Impact', key: 'impact_level', width: 12 },
      { header: 'Score', key: 'risk_score', width: 10 },
      { header: 'Status', key: 'risk_status', width: 15 },
      { header: 'Owner', key: 'owner', width: 20 }
    ];

    // Get risk data
    const { getTopRisks } = require('./risk.service');
    const risks = await getTopRisks(tenantId, 100);

    // Add rows
    risks.forEach(risk => {
      worksheet.addRow({
        risk_id: risk.risk_id,
        risk_title: risk.risk_title,
        likelihood_level: risk.likelihood_level,
        impact_level: risk.impact_level,
        risk_score: risk.risk_score,
        risk_status: risk.risk_status,
        owner: risk.owner
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
  } catch (err) {
    console.error('Error generating risk Excel:', err.message);
    throw err;
  }
}

/**
 * Generate framework coverage report
 * @param {string} frameworkId - Framework identifier
 * @param {string} format - Output format (pdf/excel)
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Generated file path
 */
async function generateFrameworkCoverageReport(frameworkId, format, outputPath) {
  try {
    const framework = await prisma.grc_frameworks.findUnique({
      where: { framework_id: frameworkId }
    });

    const { calculateComplianceScore } = require('./compliance.service');
    const score = await calculateComplianceScore(frameworkId);

    if (format === 'pdf') {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        doc.fontSize(20).text('Framework Coverage Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(framework.name || framework.framework_name);
        doc.moveDown();
        doc.fontSize(12).text(`Compliance Score: ${score.score}%`);
        doc.text(`Level: ${score.level}`);
        doc.text(`Total Requirements: ${score.total}`);
        doc.text(`Compliant: ${score.compliant}`);
        doc.text(`Non-Compliant: ${score.nonCompliant}`);
        doc.text(`Partially Compliant: ${score.partial}`);

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Framework Coverage');

      worksheet.addRow(['Framework', framework.name || framework.framework_name]);
      worksheet.addRow(['Compliance Score', `${score.score}%`]);
      worksheet.addRow(['Level', score.level]);
      worksheet.addRow(['Total Requirements', score.total]);
      worksheet.addRow(['Compliant', score.compliant]);
      worksheet.addRow(['Non-Compliant', score.nonCompliant]);
      worksheet.addRow(['Partially Compliant', score.partial]);

      await workbook.xlsx.writeFile(outputPath);
      return outputPath;
    }
  } catch (err) {
    console.error('Error generating framework coverage report:', err.message);
    throw err;
  }
}

/**
 * Schedule report generation
 * @param {Object} scheduleConfig - Schedule configuration
 * @returns {Promise<Object>} Scheduled job info
 */
async function scheduleReport(scheduleConfig) {
  // This would integrate with a job scheduler (Bull, node-cron, etc.)
  // Placeholder implementation
  try {
    const { template, format, frequency, tenantId } = scheduleConfig;

    // Create schedule record
    const schedule = await prisma.reportSchedule.create({
      data: {
        template_id: template,
        format,
        frequency, // daily, weekly, monthly
        tenant_id: tenantId,
        is_active: true,
        next_run: calculateNextRun(frequency),
        created_at: new Date()
      }
    });

    return {
      scheduleId: schedule.id,
      nextRun: schedule.next_run,
      message: 'Report scheduled successfully'
    };
  } catch (err) {
    console.error('Error scheduling report:', err.message);
    throw err;
  }
}

/**
 * Calculate next run date based on frequency
 * @param {string} frequency - Frequency (daily/weekly/monthly)
 * @returns {Date} Next run date
 */
function calculateNextRun(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now;
}

/**
 * Get available report templates
 * @returns {Array} Report templates
 */
function getTemplates() {
  return Object.values(REPORT_TEMPLATES);
}

/**
 * Run scheduled reports (called by cron job)
 * @returns {Promise<Array>} Report run results
 */
async function runScheduledReports() {
  try {
    const dueReports = await prisma.reportSchedule.findMany({
      where: {
        is_active: true,
        next_run: { lte: new Date() }
      }
    });

    const results = [];
    for (const schedule of dueReports) {
      try {
        const outputDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `${schedule.template_id}_${Date.now()}.${schedule.format}`;
        const outputPath = path.join(outputDir, filename);

        // Generate report based on template
        let filePath;
        switch (schedule.template_id) {
          case 'compliance_summary':
            filePath = await generateCompliancePDF(schedule.tenant_id, outputPath);
            break;
          case 'risk_assessment':
            filePath = await generateRiskExcel(schedule.tenant_id, outputPath);
            break;
          // Add other templates
        }

        // Update schedule
        await prisma.reportSchedule.update({
          where: { id: schedule.id },
          data: {
            last_run: new Date(),
            next_run: calculateNextRun(schedule.frequency)
          }
        });

        results.push({ scheduleId: schedule.id, filePath, status: 'success' });
      } catch (err) {
        results.push({ scheduleId: schedule.id, status: 'error', error: err.message });
      }
    }

    return results;
  } catch (err) {
    console.error('Error running scheduled reports:', err.message);
    return [];
  }
}

module.exports = {
  REPORT_TEMPLATES,
  generateCompliancePDF,
  generateRiskExcel,
  generateFrameworkCoverageReport,
  scheduleReport,
  getTemplates,
  runScheduledReports
};
