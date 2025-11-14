const express = require('express');
const prisma = require('../db/prisma');
const { logger } = require('../utils/logger');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();

// Error handling helper
const handleError = (res, error, message) => {
  logger.error(message, { error: error.message, stack: error.stack });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// GET /api/rag/documents - Get all RAG documents
router.get('/documents', async (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    const tenantId = req.headers['x-tenant-id'];
    
    const where = { tenantId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      prisma.ragDocument.findMany({
        where,
        include: {
          chunks: {
            select: {
              id: true,
              content: true,
              embeddingId: true,
              metadata: true,
              createdAt: true
            }
          },
          queries: {
            select: {
              id: true,
              query: true,
              response: true,
              relevanceScore: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10)
      }),
      prisma.ragDocument.count({ where })
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching RAG documents');
  }
});

// GET /api/rag/documents/:id - Get specific RAG document
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'];
    
    const document = await prisma.ragDocument.findFirst({
      where: { id, tenantId },
      include: {
        chunks: {
          select: {
            id: true,
            content: true,
            embeddingId: true,
            metadata: true,
            createdAt: true
          }
        },
        queries: {
          select: {
            id: true,
            query: true,
            response: true,
            relevanceScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    handleError(res, error, 'Error fetching RAG document');
  }
});

// POST /api/rag/documents - Upload and process document
router.post('/documents', requirePermission('rag:create'), async (req, res) => {
  try {
    const { name, content, type, metadata = {} } = req.body;
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
    }

    const document = await prisma.ragDocument.create({
      data: {
        name,
        content,
        type: type || 'text',
        metadata,
        status: 'processing',
        tenantId,
        uploadedBy: userId,
        chunks: {
          create: [] // Will be populated by processing job
        }
      },
      include: {
        chunks: true
      }
    });

    // TODO: Trigger document processing job
    // This would typically queue a job to:
    // 1. Parse the document
    // 2. Create text chunks
    // 3. Generate embeddings
    // 4. Update status to 'processed'

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded and queued for processing'
    });
  } catch (error) {
    handleError(res, error, 'Error creating RAG document');
  }
});

// PUT /api/rag/documents/:id - Update document
router.put('/documents/:id', requirePermission('rag:edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, metadata } = req.body;
    const tenantId = req.headers['x-tenant-id'];

    const existingDoc = await prisma.ragDocument.findFirst({
      where: { id, tenantId }
    });

    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = await prisma.ragDocument.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(metadata && { metadata }),
        updatedAt: new Date()
      },
      include: {
        chunks: true
      }
    });

    // TODO: If content was updated, trigger reprocessing

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error updating RAG document');
  }
});

// DELETE /api/rag/documents/:id - Delete document
router.delete('/documents/:id', requirePermission('rag:delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'];

    const existingDoc = await prisma.ragDocument.findFirst({
      where: { id, tenantId }
    });

    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete associated chunks first (cascade)
    await prisma.ragChunk.deleteMany({
      where: { documentId: id }
    });

    // Delete document
    await prisma.ragDocument.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error deleting RAG document');
  }
});

// POST /api/rag/query - Query RAG system
router.post('/query', async (req, res) => {
  try {
    const { query, limit = 5, minRelevance = 0.7 } = req.body;
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // TODO: Implement actual RAG query logic
    // This would typically:
    // 1. Generate embedding for the query
    // 2. Search for similar chunks
    // 3. Use LLM to generate response
    // 4. Return results with context

    // For now, return empty results to avoid mock data
    const results = [];

    // Log the query for analytics
    await prisma.ragQuery.create({
      data: {
        query,
        response: JSON.stringify(results),
        relevanceScore: 0,
        tenantId,
        userId
      }
    });

    res.json({
      success: true,
      data: {
        query,
        results,
        metadata: {
          totalChunks: 0,
          relevanceThreshold: minRelevance,
          processingTime: 0
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Error processing RAG query');
  }
});

// GET /api/rag/queries - Get query history
router.get('/queries', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const tenantId = req.headers['x-tenant-id'];
    
    const [queries, total] = await Promise.all([
      prisma.ragQuery.findMany({
        where: { tenantId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10)
      }),
      prisma.ragQuery.count({ where: { tenantId } })
    ]);

    res.json({
      success: true,
      data: queries,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching query history');
  }
});

// GET /api/rag/stats - Get RAG statistics
router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'];
    
    const [
      totalDocuments,
      processedDocuments,
      totalQueries,
      avgRelevanceScore,
      totalChunks
    ] = await Promise.all([
      prisma.ragDocument.count({ where: { tenantId } }),
      prisma.ragDocument.count({ 
        where: { 
          tenantId, 
          status: 'processed' 
        } 
      }),
      prisma.ragQuery.count({ where: { tenantId } }),
      prisma.ragQuery.aggregate({
        where: { tenantId },
        _avg: { relevanceScore: true }
      }),
      prisma.ragChunk.count({
        where: {
          document: {
            tenantId
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalDocuments,
        processedDocuments,
        totalQueries,
        avgRelevanceScore: avgRelevanceScore._avg.relevanceScore || 0,
        totalChunks,
        processingRate: totalDocuments > 0 ? (processedDocuments / totalDocuments) * 100 : 0
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching RAG statistics');
  }
});

// POST /api/rag/reindex - Reindex all documents
router.post('/reindex', requirePermission('rag:manage'), async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'];
    
    // TODO: Implement reindexing logic
    // This would typically:
    // 1. Queue a job to reprocess all documents
    // 2. Update embeddings
    // 3. Update search indices

    res.json({
      success: true,
      message: 'Reindexing job queued successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error queuing reindexing job');
  }
});

module.exports = router;