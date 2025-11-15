const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const documentService = require('../src/services/document.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Use temp directory for Vercel serverless (read-only filesystem)
const uploadDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '..', 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware for consistent error handling
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message || 'Internal Server Error' });
};

// POST /api/documents/upload - Upload a new document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, mimetype, path, size } = req.file;
    const { name, description, authorId } = req.body;

    const newDocument = await prisma.document.create({
      data: {
        name: name || originalname,
        description: description || '',
        authorId: authorId ? parseInt(authorId) : undefined,
        versions: {
          create: [{
            fileName: originalname,
            filePath: path,
            fileType: mimetype,
            fileSize: size,
          }],
        },
      },
      include: { versions: true },
    });
    res.status(201).json(newDocument);
  } catch (error) {
    handleError(res, error, 'Error uploading document');
  }
});

// GET /api/documents - Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({ include: { versions: true, author: true } });
    res.json(documents);
  } catch (error) {
    handleError(res, error, 'Error fetching documents');
  }
});

// GET /api/documents/stats - Get document statistics
router.get('/stats', async (req, res) => {
  try {
    const totalDocuments = await prisma.document.count();
    const totalVersions = await prisma.documentVersion.count();
    // Add more stats as needed
    res.json({ totalDocuments, totalVersions });
  } catch (error) {
    handleError(res, error, 'Error fetching document stats');
  }
});

// GET /api/documents/:id - Get a single document by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id, 10) },
      include: { versions: true, author: true },
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    handleError(res, error, 'Error fetching document by ID');
  }
});

// GET /api/documents/:id/versions - Get all versions for a document
router.get('/:id/versions', async (req, res) => {
  const { id } = req.params;
  try {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: parseInt(id, 10) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(versions);
  } catch (error) {
    handleError(res, error, 'Error fetching document versions');
  }
});

// POST /api/documents/:id/upload - Upload a new version of an existing document
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  try {
    const { originalname, mimetype, path, size } = req.file;
    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId: parseInt(id, 10),
        fileName: originalname,
        filePath: path,
        fileType: mimetype,
        fileSize: size,
      },
    });
    res.status(201).json(newVersion);
  } catch (error) {
    handleError(res, error, 'Error uploading new document version');
  }
});

// DELETE /api/documents/:id - Delete a document and its versions
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // In a real app, you might want to delete files from storage as well
    await prisma.document.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Error deleting document');
  }
});

// POST /api/documents - Create a document metadata entry (without upload)
router.post('/', async (req, res) => {
    try {
        const newDocument = await prisma.document.create({ data: req.body });
        res.status(201).json(newDocument);
    } catch (error) {
        handleError(res, error, 'Error creating document metadata');
    }
});

module.exports = router;
