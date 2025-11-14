/**
 * Vector Search API Routes
 * Connects RAG service to vector database for semantic search
 */

const express = require('express');
const { query } = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');
const axios = require('axios');
const router = express.Router();

// RAG Service Configuration
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:3005';

/**
 * POST /api/vector-search/documents
 * Search documents using vector similarity
 */
router.post('/documents', authenticateToken, async (req, res) => {
  console.warn('DEMO API: /api/vector-search/documents called. This API uses mocked data.');
  try {
    const { query: searchQuery, limit = 10, threshold = 0.7 } = req.body;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Call RAG service for vector search
    const ragResponse = await axios.post(`${RAG_SERVICE_URL}/api/search`, {
      query: searchQuery,
      limit,
      threshold,
      tenant_id: req.user.tenant_id
    });

    if (ragResponse.data.success) {
      res.json({
        success: true,
        data: ragResponse.data.results,
        query: searchQuery,
        count: ragResponse.data.results.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Vector search failed',
        message: ragResponse.data.error
      });
    }

  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({
      success: false,
      error: 'Vector search service unavailable',
      message: error.message
    });
  }
});

/**
 * POST /api/vector-search/embed
 * Create embeddings for documents
 */
router.post('/embed', authenticateToken, async (req, res) => {
  console.warn('DEMO API: /api/vector-search/embed called. This API uses mocked data.');
  try {
    const { text, document_id, metadata = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }

    // Call RAG service to create embeddings
    const ragResponse = await axios.post(`${RAG_SERVICE_URL}/api/embed`, {
      text,
      document_id,
      metadata: {
        ...metadata,
        tenant_id: req.user.tenant_id,
        created_by: req.user.id
      }
    });

    if (ragResponse.data.success) {
      res.json({
        success: true,
        data: ragResponse.data.embedding,
        document_id,
        message: 'Document embedded successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Embedding creation failed',
        message: ragResponse.data.error
      });
    }

  } catch (error) {
    console.error('Embedding creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Embedding service unavailable',
      message: error.message
    });
  }
});

/**
 * GET /api/vector-search/similar/:documentId
 * Find similar documents to a given document
 */
router.get('/similar/:documentId', authenticateToken, async (req, res) => {
  console.warn('DEMO API: /api/vector-search/similar/:documentId called. This API uses mocked data.');
  try {
    const { documentId } = req.params;
    const { limit = 5, threshold = 0.8 } = req.query;

    // Call RAG service for similarity search
    const ragResponse = await axios.get(`${RAG_SERVICE_URL}/api/similar/${documentId}`, {
      params: {
        limit,
        threshold,
        tenant_id: req.user.tenant_id
      }
    });

    if (ragResponse.data.success) {
      res.json({
        success: true,
        data: ragResponse.data.similar_documents,
        source_document: documentId,
        count: ragResponse.data.similar_documents.length
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found or no similar documents',
        message: ragResponse.data.error
      });
    }

  } catch (error) {
    console.error('Similar documents search error:', error);
    res.status(500).json({
      success: false,
      error: 'Similarity search service unavailable',
      message: error.message
    });
  }
});

/**
 * POST /api/vector-search/rag
 * Retrieval Augmented Generation - Answer questions using document context
 */
router.post('/rag', authenticateToken, async (req, res) => {
  console.warn('DEMO API: /api/vector-search/rag called. This API uses mocked data.');
  try {
    const { question, context_limit = 5, temperature = 0.7 } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Call RAG service for question answering
    const ragResponse = await axios.post(`${RAG_SERVICE_URL}/api/rag`, {
      question,
      context_limit,
      temperature,
      tenant_id: req.user.tenant_id
    });

    if (ragResponse.data.success) {
      res.json({
        success: true,
        data: {
          answer: ragResponse.data.answer,
          context_documents: ragResponse.data.context,
          confidence: ragResponse.data.confidence
        },
        question,
        message: 'Question answered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'RAG processing failed',
        message: ragResponse.data.error
      });
    }

  } catch (error) {
    console.error('RAG processing error:', error);
    res.status(500).json({
      success: false,
      error: 'RAG service unavailable',
      message: error.message
    });
  }
});

/**
 * GET /api/vector-search/health
 * Check vector search service health
 */
router.get('/health', async (req, res) => {
  console.warn('DEMO API: /api/vector-search/health called. This API uses mocked data.');
  try {
    const ragResponse = await axios.get(`${RAG_SERVICE_URL}/api/health`);
    
    res.json({
      success: true,
      data: {
        vector_search: 'connected',
        rag_service: ragResponse.data.status,
        url: RAG_SERVICE_URL
      }
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Vector search service unavailable',
      data: {
        vector_search: 'disconnected',
        rag_service: 'unavailable',
        url: RAG_SERVICE_URL
      }
    });
  }
});

/**
 * GET /api/vector-search/stats
 * Get vector database statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  console.warn('DEMO API: /api/vector-search/stats called. This API uses mocked data.');
  try {
    const ragResponse = await axios.get(`${RAG_SERVICE_URL}/api/stats`, {
      params: {
        tenant_id: req.user.tenant_id
      }
    });

    if (ragResponse.data.success) {
      res.json({
        success: true,
        data: ragResponse.data.stats
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get vector database stats'
      });
    }

  } catch (error) {
    console.error('Vector stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Vector stats service unavailable',
      message: error.message
    });
  }
});

module.exports = router;
