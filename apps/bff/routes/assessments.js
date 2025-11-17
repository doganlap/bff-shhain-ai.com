const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
let S3Client, PutObjectCommand, getSignedUrl;
try {
  ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  ({ getSignedUrl } = require('@aws-sdk/s3-request-presigner'));
} catch (_) {}

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/assessments - Get all assessments
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1, framework_id, organization_id } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;
    const whereClauses = [];
    if (framework_id) whereClauses.push(`framework_id = '${framework_id}'`);
    if (organization_id) whereClauses.push(`organization_id = '${organization_id}'`);
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const rows = await prisma.$queryRawUnsafe(`SELECT id, title, title_ar AS "titleAr", framework_id AS "frameworkId", organization_id AS "organizationId", assessment_type AS "assessmentType", status, progress, score, created_at AS "createdAt", updated_at AS "updatedAt" FROM "assessments" ${whereSql} ORDER BY created_at DESC LIMIT ${parsedLimit} OFFSET ${offset}`);
    const countRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS cnt FROM "assessments" ${whereSql}`);
    const total = countRows[0]?.cnt || 0;
    res.json({ success: true, data: rows, pagination: { page: parsedPage, limit: parsedLimit, total, totalPages: Math.ceil(total / parsedLimit) } });
  } catch (error) {
    console.error('Error fetching assessments:', error.message);
    res.json({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  }
});

// GET /api/assessments/:id - Get a single assessment by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await prisma.$queryRaw`SELECT id, title, title_ar AS "titleAr", framework_id AS "frameworkId", organization_id AS "organizationId", assessment_type AS "assessmentType", status, progress, score, section_1_score, section_2_score, section_3_score, section_4_score, section_5_score, section_6_score, section_7_score, section_8_score, section_9_score, section_10_score, section_11_score, section_12_score, section_1_status, section_2_status, section_3_status, section_4_status, section_5_status, section_6_status, section_7_status, section_8_status, section_9_status, section_10_status, section_11_status, section_12_status, created_at AS "createdAt", updated_at AS "updatedAt" FROM "assessments" WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: 'Assessment not found' });
    res.json(rows[0]);
  } catch (error) {
    handleError(res, error, 'Error fetching assessment by ID');
  }
});

// POST /api/assessments - Create a new assessment
router.post('/', async (req, res) => {
  try {
    const { id, title, framework_id, organization_id, assessment_type = 'standard', status = 'draft' } = req.body;
    await prisma.$executeRaw`INSERT INTO "assessments" (id, title, framework_id, organization_id, assessment_type, status, progress, created_at, updated_at) VALUES (${id}, ${title}, ${framework_id}, ${organization_id}, ${assessment_type}, ${status}, 0, NOW(), NOW())`;
    res.status(201).json({ success: true });
  } catch (error) {
    handleError(res, error, 'Error creating assessment');
  }
});

// PUT /api/assessments/:id - Update an existing assessment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { status, progress, score } = req.body;
    await prisma.$executeRaw`UPDATE "assessments" SET status = COALESCE(${status}, status), progress = COALESCE(${progress}, progress), score = COALESCE(${score}, score), updated_at = NOW() WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, 'Error updating assessment');
  }
});

// DELETE /api/assessments/:id - Delete an assessment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$executeRaw`DELETE FROM "assessments" WHERE id = ${id}`;
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Error deleting assessment');
  }
});

// GET /api/assessments/:id/questions - Get questions for an assessment
router.get('/:id/questions', async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    handleError(res, error, 'Error fetching assessment questions');
  }
});

// POST /api/assessments/:id/responses/:qid - Submit a response to a question
router.post('/:id/responses/:qid', async (req, res) => {
  try {
    res.status(400).json({ error: 'Responses storage not configured' });
  } catch (error) {
    handleError(res, error, 'Error submitting assessment response');
  }
});

// GET /api/assessments/:id/progress - Get the progress of an assessment
router.get('/:id/progress', async (req, res) => {
  const { id } = req.params;
  try {
    const evCountRows = await prisma.$queryRaw`SELECT COUNT(*)::int AS cnt FROM "assessment_evidence" WHERE assessment_id = ${id}`;
    const evCount = evCountRows[0]?.cnt || 0;
    const progressRows = await prisma.$queryRaw`SELECT progress::float AS progress, score::float AS score FROM "assessments" WHERE id = ${id}`;
    const progress = progressRows[0]?.progress ?? (evCount > 0 ? 10 : 0);
    res.json({ progress, totalEvidence: evCount, score: progressRows[0]?.score ?? 0 });
  } catch (error) {
    handleError(res, error, 'Error fetching assessment progress');
  }
});

// GET /api/assessments/:id/sections/:sectionId/controls - Controls for a section
router.get('/:id/sections/:sectionId/controls', async (req, res) => {
  const { id, sectionId } = req.params;
  try {
    const assessRows = await prisma.$queryRaw`SELECT framework_id FROM "assessments" WHERE id = ${id} LIMIT 1`;
    if (!assessRows.length) return res.json([]);
    const frameworkId = assessRows[0].framework_id;
    const controls = await prisma.$queryRaw`SELECT id, control_id AS "controlId", title, title_ar AS "titleAr", maturity_level AS "maturityLevel" FROM "grc_controls" WHERE framework_id = ${frameworkId} ORDER BY control_id LIMIT 50`;
    const counts = await prisma.$queryRaw`SELECT control_id, COUNT(*)::int AS cnt FROM "assessment_evidence" WHERE assessment_id = ${id} GROUP BY control_id`;
    const byId = new Map(counts.map(r => [r.control_id, r.cnt]));
    const result = controls.map(c => ({ ...c, evidenceCount: byId.get(c.controlId) || 0, score: 0, isMandatory: false }));
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Error fetching section controls');
  }
});

// Evidence: list for a control
router.get('/:id/controls/:controlId/evidence', async (req, res) => {
  const { id, controlId } = req.params;
  try {
    const rows = await prisma.$queryRaw`SELECT id, file_name AS "fileName", file_type AS "fileType", storage_location AS "storageLocation", collected_date AS "collectedDate" FROM "assessment_evidence" WHERE assessment_id = ${id} AND control_id = ${controlId} ORDER BY collected_date DESC`;
    res.json({ success: true, data: rows });
  } catch (error) {
    handleError(res, error, 'Error fetching evidence');
  }
});

// Evidence: upload record (metadata)
router.post('/:id/controls/:controlId/evidence', async (req, res) => {
  const { id, controlId } = req.params;
  try {
    const { file_name, file_type, storage_location, tenant_id } = req.body;
    await prisma.$executeRaw`INSERT INTO "assessment_evidence" (assessment_id, control_id, tenant_id, file_name, file_type, storage_location, collected_date, created_at, updated_at) VALUES (${id}, ${controlId}, ${tenant_id || 'public'}, ${file_name || 'evidence.txt'}, ${file_type || 'text/plain'}, ${storage_location || ''}, NOW(), NOW(), NOW())`;
    res.status(201).json({ success: true });
  } catch (error) {
    handleError(res, error, 'Error uploading evidence');
  }
});

// Section-level score/status update
router.put('/:id/sections/:sectionId', async (req, res) => {
  const { id, sectionId } = req.params;
  try {
    const scoreCol = `section_${sectionId}_score`;
    const statusCol = `section_${sectionId}_status`;
    const { score, status } = req.body;
    await prisma.$executeRawUnsafe(`UPDATE "assessments" SET ${scoreCol} = COALESCE(${Number(score)}, ${scoreCol}), ${statusCol} = COALESCE('${status || ''}', ${statusCol}), updated_at = NOW() WHERE id = '${id}'`);
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, 'Error updating section score/status');
  }
});

// Multipart file upload with pluggable backend
const STORAGE_BACKEND = process.env.STORAGE_BACKEND || 'disk';
const s3Configured = STORAGE_BACKEND === 's3' && process.env.S3_BUCKET && process.env.S3_REGION;
const s3 = s3Configured ? new S3Client({ region: process.env.S3_REGION }) : null;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id, controlId } = req.params;
    const dir = path.join(process.cwd(), 'uploads', 'evidence', id, controlId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
  if (allowed.includes(file.mimetype)) cb(null, true); else cb(new Error('Unsupported file type'));
};

const upload = STORAGE_BACKEND === 's3'
  ? multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
  : multer({ storage: diskStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/:id/controls/:controlId/evidence/upload', upload.single('file'), async (req, res) => {
  try {
    const { id, controlId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const type = file.mimetype;
    const name = file.originalname;
    let loc = file.path || '';
    if (STORAGE_BACKEND === 's3' && s3Configured && s3) {
      const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `evidence/${id}/${controlId}/${Date.now()}_${safeName}`;
      const cmd = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: file.buffer, ContentType: type });
      await s3.send(cmd);
      loc = `s3://${process.env.S3_BUCKET}/${key}`;
    }
    await prisma.$executeRaw`INSERT INTO "assessment_evidence" (assessment_id, control_id, tenant_id, file_name, file_type, storage_location, collected_date, created_at, updated_at) VALUES (${id}, ${controlId}, ${'public'}, ${name}, ${type}, ${loc}, NOW(), NOW(), NOW())`;
    res.status(201).json({ success: true, location: loc });
  } catch (error) {
    handleError(res, error, 'Error uploading evidence file');
  }
});

// Signed URL for client-side S3 upload
router.get('/:id/controls/:controlId/evidence/sign', async (req, res) => {
  try {
    if (!(STORAGE_BACKEND === 's3' && s3Configured && s3 && getSignedUrl)) {
      return res.status(400).json({ error: 'S3 not configured' });
    }
    const { id, controlId } = req.params;
    const contentType = req.query.contentType || 'application/octet-stream';
    const safeBase = (req.query.filename || 'evidence').replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `evidence/${id}/${controlId}/${Date.now()}_${safeBase}`;
    const cmd = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });
    res.json({ success: true, url, key });
  } catch (error) {
    handleError(res, error, 'Error generating signed URL');
  }
});

// Confirm an S3 upload and record evidence metadata
router.post('/:id/controls/:controlId/evidence/confirm', async (req, res) => {
  try {
    const { id, controlId } = req.params;
    const { key, file_name, file_type } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing S3 key' });
    const loc = `s3://${process.env.S3_BUCKET}/${key}`;
    await prisma.$executeRaw`INSERT INTO "assessment_evidence" (assessment_id, control_id, tenant_id, file_name, file_type, storage_location, collected_date, created_at, updated_at) VALUES (${id}, ${controlId}, ${'public'}, ${file_name || 'evidence'}, ${file_type || 'application/octet-stream'}, ${loc}, NOW(), NOW(), NOW())`;
    res.status(201).json({ success: true });
  } catch (error) {
    handleError(res, error, 'Error confirming S3 evidence');
  }
});

// POST /api/assessments/:id/questions/generate - Placeholder for question generation
router.post('/:id/questions/generate', (req, res) => {
    // This would typically involve a more complex logic, possibly calling an AI service.
    res.status(501).json({ message: 'Question generation not implemented yet.' });
});

module.exports = router;
