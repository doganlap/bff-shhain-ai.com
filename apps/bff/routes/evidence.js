const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Use temp directory for serverless environments (e.g., Vercel) which have read-only /var/task
const isServerless = process.env.VERCEL_ENV || process.env.VERCEL || process.env.LAMBDA_TASK_ROOT;
const localUploadRoot = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const uploadDir = isServerless ? os.tmpdir() : localUploadRoot;

// Only create local uploads directory when not in serverless environment
if (!isServerless && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// GET /api/evidence - Get all evidence
router.get('/', async (req, res) => {
  try {
    const evidence = await prisma.evidence.findMany({
      include: { control: true, author: true },
    });
    res.json(evidence);
  } catch (error) {
    handleError(res, error, 'Error fetching evidence');
  }
});

// GET /api/evidence/stats - Get evidence statistics
router.get('/stats', async (req, res) => {
    try {
        const totalEvidence = await prisma.evidence.count();
        const byStatus = await prisma.evidence.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        res.json({ totalEvidence, byStatus });
    } catch (error) {
        handleError(res, error, 'Error fetching evidence stats');
    }
});

// GET /api/evidence/analytics - Get evidence analytics
router.get('/analytics', async (req, res) => {
    try {
        // Example analytics: evidence count by type over time
        const analytics = await prisma.evidence.groupBy({
            by: ['fileType', 'createdAt'],
            _count: { id: true },
            orderBy: { createdAt: 'asc' },
        });
        res.json(analytics);
    } catch (error) {
        handleError(res, error, 'Error fetching evidence analytics');
    }
});

// GET /api/evidence/categories - Get evidence categories
router.get('/categories', async (req, res) => {
    try {
        // Assuming categories are stored in a separate model or as an enum
        const categories = await prisma.evidenceCategory.findMany();
        res.json(categories);
    } catch (error) {
        handleError(res, error, 'Error fetching evidence categories');
    }
});


// GET /api/evidence/:id - Get a single piece of evidence by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const singleEvidence = await prisma.evidence.findUnique({
      where: { id: parseInt(id, 10) },
      include: { control: true, author: true },
    });
    if (!singleEvidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    res.json(singleEvidence);
  } catch (error) {
    handleError(res, error, 'Error fetching evidence by ID');
  }
});

// POST /api/evidence - Create a new evidence record
router.post('/', async (req, res) => {
  try {
    const newEvidence = await prisma.evidence.create({ data: req.body });
    res.status(201).json(newEvidence);
  } catch (error) {
    handleError(res, error, 'Error creating evidence');
  }
});

// POST /api/evidence/upload - Upload a file and create evidence
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, mimetype, path, size } = req.file;
    const { name, description, controlId, authorId } = req.body;

    const newEvidence = await prisma.evidence.create({
      data: {
        name: name || originalname,
        description: description || '',
        filePath: path,
        fileType: mimetype,
        fileSize: size,
        controlId: controlId ? parseInt(controlId) : undefined,
        authorId: authorId ? parseInt(authorId) : undefined,
      },
    });
    res.status(201).json(newEvidence);
  } catch (error) {
    handleError(res, error, 'Error uploading evidence');
  }
});

// PUT /api/evidence/:id - Update an evidence record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedEvidence = await prisma.evidence.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedEvidence);
  } catch (error) {
    handleError(res, error, 'Error updating evidence');
  }
});

// PATCH /api/evidence/:id/status - Update the status of an evidence record
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedEvidence = await prisma.evidence.update({
            where: { id: parseInt(id, 10) },
            data: { status },
        });
        res.json(updatedEvidence);
    } catch (error) {
        handleError(res, error, 'Error updating evidence status');
    }
});

// DELETE /api/evidence/:id - Delete an evidence record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // In a real app, you should also delete the file from the 'uploads' directory
    await prisma.evidence.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Error deleting evidence');
  }
});

module.exports = router;
