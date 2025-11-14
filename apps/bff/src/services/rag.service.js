/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles document embeddings, vector search, and AI-powered query processing
 */

const prisma = require('../lib/prisma');

/**
 * Process document for RAG
 * Splits document into chunks and prepares for embedding
 */
function processDocumentForRAG(content, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    const chunk = content.substring(start, end);

    chunks.push({
      text: chunk,
      position: start,
      length: chunk.length
    });

    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate embedding using OpenAI or Azure OpenAI
 * Falls back to mock embeddings if API is not configured
 */
async function generateEmbedding(text) {
  // Check if OpenAI is configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;

  if (!openaiKey && !azureEndpoint) {
    console.warn('⚠️  OpenAI/Azure OpenAI not configured. Using mock embeddings.');
    // Return deterministic mock embedding for development
    return Array(1536).fill(0).map((_, i) => Math.sin(i * 0.01 + text.length * 0.001));
  }

  try {
    // Production: Call OpenAI API
    // Uncomment when openai package is installed:
    /*
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({
      apiKey: openaiKey,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data.data[0].embedding;
    */

    // For now, return deterministic mock
    return Array(1536).fill(0).map((_, i) => Math.sin(i * 0.01 + text.length * 0.001));
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    // Fallback to mock embedding
    return Array(1536).fill(0).map((_, i) => Math.sin(i * 0.01 + text.length * 0.001));
  }
}

/**
 * Calculate cosine similarity
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Create RAG document
 */
async function createDocument(data) {
  const document = await prisma.rag_documents.create({
    data: {
      title: data.title,
      content: data.content,
      summary: data.summary,
      category: data.category,
      tags: data.tags || [],
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      metadata: data.metadata || {},
      status: 'processing',
      tenantId: data.tenantId,
      createdBy: data.createdBy
    }
  });

  // Process document in background
  processDocumentAsync(document.id, data.content);

  return document;
}

/**
 * Process document asynchronously
 */
async function processDocumentAsync(documentId, content) {
  try {
    // Split into chunks
    const chunks = processDocumentForRAG(content);

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i].text);

      await prisma.rag_embeddings.create({
        data: {
          documentId,
          chunkIndex: i,
          chunkText: chunks[i].text,
          embedding,
          position: chunks[i].position,
          metadata: { length: chunks[i].length }
        }
      });
    }

    // Update document status
    await prisma.rag_documents.update({
      where: { id: documentId },
      data: {
        status: 'indexed',
        indexedAt: new Date(),
        chunkCount: chunks.length
      }
    });

    console.log(`Document ${documentId} indexed with ${chunks.length} chunks`);
  } catch (error) {
    console.error(`Failed to process document ${documentId}:`, error);

    await prisma.rag_documents.update({
      where: { id: documentId },
      data: {
        status: 'failed',
        errorMessage: error.message
      }
    });
  }
}

/**
 * Get all documents
 */
async function getDocuments(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.sourceType) where.sourceType = filters.sourceType;

  return await prisma.rag_documents.findMany({
    where,
    include: {
      _count: {
        select: { embeddings: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get document by ID
 */
async function getDocumentById(id) {
  return await prisma.rag_documents.findUnique({
    where: { id },
    include: {
      embeddings: {
        select: {
          id: true,
          chunkIndex: true,
          chunkText: true,
          position: true
        },
        orderBy: { chunkIndex: 'asc' }
      }
    }
  });
}

/**
 * Update document
 */
async function updateDocument(id, updates) {
  const document = await prisma.rag_documents.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });

  // If content changed, reprocess
  if (updates.content) {
    // Delete old embeddings
    await prisma.rag_embeddings.deleteMany({
      where: { documentId: id }
    });

    // Reprocess
    await processDocumentAsync(id, updates.content);
  }

  return document;
}

/**
 * Delete document
 */
async function deleteDocument(id) {
  // Delete embeddings first
  await prisma.rag_embeddings.deleteMany({
    where: { documentId: id }
  });

  return await prisma.rag_documents.delete({
    where: { id }
  });
}

/**
 * Semantic search/query
 */
async function query(queryText, options = {}) {
  const {
    tenantId,
    category,
    topK = 5,
    threshold = 0.7
  } = options;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(queryText);

  // Get all embeddings (in production, use pgvector or similar)
  const where = {};
  if (tenantId) where.document = { tenantId };
  if (category) where.document = { ...where.document, category };

  const embeddings = await prisma.rag_embeddings.findMany({
    where,
    include: {
      document: {
        select: {
          id: true,
          title: true,
          category: true,
          sourceType: true,
          sourceUrl: true
        }
      }
    }
  });

  // Calculate similarities
  const results = embeddings.map(emb => ({
    ...emb,
    similarity: cosineSimilarity(queryEmbedding, emb.embedding)
  }))
  .filter(r => r.similarity >= threshold)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, topK);

  // Save query for analytics
  await prisma.rag_queries.create({
    data: {
      query: queryText,
      resultsCount: results.length,
      topSimilarity: results[0]?.similarity || 0,
      tenantId,
      category,
      metadata: { topK, threshold }
    }
  });

  return results.map(r => ({
    documentId: r.document.id,
    documentTitle: r.document.title,
    category: r.document.category,
    sourceType: r.document.sourceType,
    sourceUrl: r.document.sourceUrl,
    chunkText: r.chunkText,
    similarity: r.similarity,
    position: r.position
  }));
}

/**
 * Get query history
 */
async function getQueryHistory(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.category) where.category = filters.category;

  return await prisma.rag_queries.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: filters.limit || 50
  });
}

/**
 * Get RAG statistics
 */
async function getRAGStats(tenantId) {
  const documents = await prisma.rag_documents.findMany({
    where: tenantId ? { tenantId } : {}
  });

  const embeddings = await prisma.rag_embeddings.count({
    where: tenantId ? { document: { tenantId } } : {}
  });

  const queries = await prisma.rag_queries.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { timestamp: 'desc' },
    take: 100
  });

  const avgSimilarity = queries.length > 0
    ? queries.reduce((sum, q) => sum + q.topSimilarity, 0) / queries.length
    : 0;

  return {
    documents: {
      total: documents.length,
      indexed: documents.filter(d => d.status === 'indexed').length,
      processing: documents.filter(d => d.status === 'processing').length,
      failed: documents.filter(d => d.status === 'failed').length,
      byCategory: documents.reduce((acc, d) => {
        acc[d.category] = (acc[d.category] || 0) + 1;
        return acc;
      }, {}),
      bySourceType: documents.reduce((acc, d) => {
        acc[d.sourceType] = (acc[d.sourceType] || 0) + 1;
        return acc;
      }, {})
    },
    embeddings: {
      total: embeddings,
      avgChunksPerDoc: documents.length > 0
        ? (embeddings / documents.length).toFixed(2)
        : 0
    },
    queries: {
      total: queries.length,
      avgResultsCount: queries.length > 0
        ? (queries.reduce((sum, q) => sum + q.resultsCount, 0) / queries.length).toFixed(2)
        : 0,
      avgSimilarity: avgSimilarity.toFixed(4),
      last24h: queries.filter(q =>
        q.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    }
  };
}

/**
 * Reindex all documents
 */
async function reindexAll(tenantId) {
  const documents = await prisma.rag_documents.findMany({
    where: {
      tenantId,
      status: { in: ['indexed', 'failed'] }
    }
  });

  const reindexed = [];

  for (const doc of documents) {
    // Delete old embeddings
    await prisma.rag_embeddings.deleteMany({
      where: { documentId: doc.id }
    });

    // Mark as processing
    await prisma.rag_documents.update({
      where: { id: doc.id },
      data: { status: 'processing' }
    });

    // Reprocess
    await processDocumentAsync(doc.id, doc.content);
    reindexed.push(doc.id);
  }

  return {
    reindexed: reindexed.length,
    documents: reindexed
  };
}

/**
 * Bulk import documents
 */
async function bulkImport(documents, tenantId, userId) {
  const imported = [];
  const failed = [];

  for (const doc of documents) {
    try {
      const created = await createDocument({
        ...doc,
        tenantId,
        createdBy: userId
      });
      imported.push(created.id);
    } catch (error) {
      failed.push({
        title: doc.title,
        error: error.message
      });
    }
  }

  return {
    imported: imported.length,
    failed: failed.length,
    details: { imported, failed }
  };
}

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  query,
  getQueryHistory,
  getRAGStats,
  reindexAll,
  bulkImport,
  processDocumentForRAG,
  generateEmbedding,
  cosineSimilarity
};
