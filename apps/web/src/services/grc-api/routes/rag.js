const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../data/rag-documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating upload directory:', err);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Mock vector database (in production, use Pinecone, Chroma, or similar)
const mockVectorDB = {
  documents: [
    {
      id: 1,
      name: 'SAMA Cybersecurity Framework.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      status: 'processed',
      chunks: 156,
      embeddings: 156,
      path: '/mock/sama_framework.pdf'
    },
    {
      id: 2,
      name: 'ISO 27001 Implementation Guide.docx',
      type: 'DOCX',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      status: 'processed',
      chunks: 98,
      embeddings: 98,
      path: '/mock/iso27001_guide.docx'
    },
    {
      id: 3,
      name: 'NCA Compliance Checklist.xlsx',
      type: 'XLSX',
      size: '0.5 MB',
      uploaded: '2024-01-13',
      status: 'processing',
      chunks: 0,
      embeddings: 0,
      path: '/mock/nca_checklist.xlsx'
    },
    {
      id: 4,
      name: 'PCI DSS Requirements.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploaded: '2024-01-12',
      status: 'processed',
      chunks: 203,
      embeddings: 203,
      path: '/mock/pci_dss.pdf'
    }
  ],
  chunks: [
    {
      id: 1,
      documentId: 1,
      content: 'Organizations must implement multi-factor authentication for all privileged accounts accessing critical systems. This requirement applies to both internal users and third-party service providers.',
      page: 45,
      section: 'Access Control Requirements',
      embedding: [0.1, 0.2, 0.3, 0.4], // Mock embedding vector
      metadata: { context: 'Authentication and Authorization' }
    },
    {
      id: 2,
      documentId: 2,
      content: 'Access control procedures should be documented and regularly reviewed. Organizations must maintain an inventory of all user accounts and their associated privileges.',
      page: 23,
      section: 'A.9.1 Access Control Management',
      embedding: [0.2, 0.3, 0.4, 0.5],
      metadata: { context: 'User Access Management' }
    },
    {
      id: 3,
      documentId: 4,
      content: 'Strong authentication mechanisms must be implemented for all system components. Default passwords and authentication parameters must be changed before systems are put into production.',
      page: 67,
      section: 'Requirement 8: Authentication',
      embedding: [0.3, 0.4, 0.5, 0.6],
      metadata: { context: 'Identity and Access Management' }
    }
  ],
  stats: {
    totalDocuments: 4,
    processedDocuments: 3,
    totalChunks: 657,
    totalEmbeddings: 657,
    queriesProcessed: 1234
  }
};

// Text extraction functions
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
}

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw error;
  }
}

async function extractTextFromXlsx(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      text += xlsx.utils.sheet_to_txt(worksheet) + '\n';
    });
    return text;
  } catch (error) {
    console.error('Error extracting XLSX text:', error);
    throw error;
  }
}

// Utility function to chunk text
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const words = text.split(' ');

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}

// Mock similarity search function
function mockSimilaritySearch(query, chunks, topK = 5) {
  // In production, this would use actual vector similarity
  // For now, we'll use simple keyword matching
  const queryLower = query.toLowerCase();
  const scoredChunks = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    // Simple keyword matching score
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 1;
      }
    });

    return { ...chunk, relevance: score / queryWords.length };
  });

  return scoredChunks
    .filter(chunk => chunk.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topK);
}

// Routes

// Get RAG statistics
router.get('/stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockVectorDB.stats
    });
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get RAG statistics',
      error: error.message
    });
  }
});

// Get all documents
router.get('/documents', (req, res) => {
  try {
    const { status, type } = req.query;
    let documents = mockVectorDB.documents;

    if (status) {
      documents = documents.filter(doc => doc.status === status);
    }

    if (type) {
      documents = documents.filter(doc => doc.type === type);
    }

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
});

// Get document by ID
router.get('/documents/:id', (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const document = mockVectorDB.documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
});

// Upload and process document
router.post('/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    const ext = path.extname(originalname).toLowerCase();

    // Extract text based on file type
    let extractedText = '';
    try {
      switch (ext) {
        case '.pdf':
          extractedText = await extractTextFromPDF(filePath);
          break;
        case '.docx':
          extractedText = await extractTextFromDocx(filePath);
          break;
        case '.xlsx':
        case '.xls':
          extractedText = await extractTextFromXlsx(filePath);
          break;
        case '.txt':
          extractedText = await fs.readFile(filePath, 'utf8');
          break;
        default:
          throw new Error('Unsupported file type');
      }
    } catch (extractError) {
      console.error('Error extracting text:', extractError);
      // Clean up uploaded file
      await fs.unlink(filePath).catch(console.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to extract text from document',
        error: extractError.message
      });
    }

    // Chunk the text
    const chunks = chunkText(extractedText);

    // Create document record
    const newDocument = {
      id: mockVectorDB.documents.length + 1,
      name: originalname,
      type: ext.substring(1).toUpperCase(),
      size: `${(size / 1024 / 1024).toFixed(1)} MB`,
      uploaded: new Date().toISOString().split('T')[0],
      status: 'processed',
      chunks: chunks.length,
      embeddings: chunks.length,
      path: filePath,
      filename
    };

    // Add to mock database
    mockVectorDB.documents.push(newDocument);

    // Update stats
    mockVectorDB.stats.totalDocuments++;
    mockVectorDB.stats.processedDocuments++;
    mockVectorDB.stats.totalChunks += chunks.length;
    mockVectorDB.stats.totalEmbeddings += chunks.length;

    res.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const documentIndex = mockVectorDB.documents.findIndex(doc => doc.id === documentId);

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = mockVectorDB.documents[documentIndex];

    // Delete file if it exists
    if (document.path && document.path !== '/mock/sama_framework.pdf') {
      try {
        await fs.unlink(document.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Remove from database
    mockVectorDB.documents.splice(documentIndex, 1);

    // Update stats
    mockVectorDB.stats.totalDocuments--;
    if (document.status === 'processed') {
      mockVectorDB.stats.processedDocuments--;
    }
    mockVectorDB.stats.totalChunks -= document.chunks || 0;
    mockVectorDB.stats.totalEmbeddings -= document.embeddings || 0;

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// Query documents (RAG search)
router.post('/query', (req, res) => {
  try {
    const { query, maxResults = 5, minRelevance = 0.1 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Perform similarity search
    const results = mockSimilaritySearch(query, mockVectorDB.chunks, maxResults);

    // Filter by minimum relevance
    const filteredResults = results.filter(result => result.relevance >= minRelevance);

    // Format results with document information
    const formattedResults = filteredResults.map(chunk => {
      const document = mockVectorDB.documents.find(doc => doc.id === chunk.documentId);
      return {
        id: chunk.id,
        document: document?.name || 'Unknown Document',
        relevance: chunk.relevance,
        chunk: chunk.content,
        page: chunk.page,
        section: chunk.section,
        context: chunk.metadata?.context || 'General'
      };
    });

    // Update query stats
    mockVectorDB.stats.queriesProcessed++;

    res.json({
      success: true,
      data: formattedResults,
      metadata: {
        query,
        totalResults: formattedResults.length,
        maxResults,
        minRelevance
      }
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process query',
      error: error.message
    });
  }
});

// Search endpoint (alias for query)
router.post('/search', (req, res) => {
  // Use the same logic as query endpoint
  const queryReq = { ...req, body: { query: req.body.query, ...req.body.filters } };
  return router.handle(queryReq, res);
});

// Get document chunks
router.get('/documents/:id/chunks', (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const chunks = mockVectorDB.chunks.filter(chunk => chunk.documentId === documentId);

    res.json({
      success: true,
      data: chunks
    });
  } catch (error) {
    console.error('Error getting document chunks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document chunks',
      error: error.message
    });
  }
});

// Get RAG settings (mock)
router.get('/settings', (req, res) => {
  try {
    const settings = {
      model: 'gpt-4',
      maxResults: 5,
      minRelevance: 0.7,
      chunkSize: 500,
      chunkOverlap: 50,
      embeddingModel: 'text-embedding-ada-002',
      temperature: 0.1
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting RAG settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get RAG settings',
      error: error.message
    });
  }
});

// Update RAG settings (mock)
router.put('/settings', (req, res) => {
  try {
    const { settings } = req.body;

    // In production, save settings to database
    console.log('Updating RAG settings:', settings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating RAG settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update RAG settings',
      error: error.message
    });
  }
});

module.exports = router;
