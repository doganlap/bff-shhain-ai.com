/**
 * Document Service
 * Handles document management, versioning, and file uploads
 */

const prisma = require('../../db/prisma');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate document version number
 */
function generateVersion(currentVersion) {
  if (!currentVersion) return '1.0';

  const [major, minor] = currentVersion.split('.').map(Number);
  return `${major}.${minor + 1}`;
}

/**
 * Calculate document hash (for change detection)
 */
function calculateHash(content) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Parse file metadata
 */
function parseFileMetadata(file) {
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    extension: path.extname(file.originalname).toLowerCase()
  };
}

/**
 * Create document
 */
async function createDocument(data) {
  return await prisma.documents.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      version: '1.0',
      status: data.status || 'draft',
      filePath: data.filePath,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      hash: data.hash,
      tags: data.tags || [],
      metadata: data.metadata || {},
      ownerId: data.ownerId,
      tenantId: data.tenantId,
      createdBy: data.createdBy
    }
  });
}

/**
 * Get all documents
 */
async function getDocuments(filters = {}) {
  const where = {};

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.ownerId) where.ownerId = filters.ownerId;

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  return await prisma.documents.findMany({
    where,
    include: {
      _count: {
        select: { versions: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

/**
 * Get document by ID
 */
async function getDocumentById(id) {
  return await prisma.documents.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
}

/**
 * Update document
 */
async function updateDocument(id, updates) {
  return await prisma.documents.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete document
 */
async function deleteDocument(id) {
  const document = await prisma.documents.findUnique({
    where: { id },
    include: { versions: true }
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete physical files
  try {
    if (document.filePath) {
      await fs.unlink(document.filePath);
    }

    for (const version of document.versions) {
      if (version.filePath) {
        await fs.unlink(version.filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }

  // Delete from database
  return await prisma.documents.delete({
    where: { id }
  });
}

/**
 * Upload new version of document
 */
async function uploadVersion(documentId, file, userId, comment) {
  const document = await prisma.documents.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const fileMetadata = parseFileMetadata(file);
  const hash = calculateHash(file.buffer || file.path);

  // Check if content actually changed
  if (hash === document.hash) {
    return {
      uploaded: false,
      reason: 'No changes detected',
      document
    };
  }

  const newVersion = generateVersion(document.version);

  // Create version record
  const version = await prisma.document_versions.create({
    data: {
      documentId,
      version: newVersion,
      filePath: file.path,
      fileSize: file.size,
      hash,
      changes: comment || 'Version updated',
      createdBy: userId
    }
  });

  // Update main document
  const updated = await prisma.documents.update({
    where: { id: documentId },
    data: {
      version: newVersion,
      filePath: file.path,
      fileSize: file.size,
      hash,
      updatedAt: new Date()
    }
  });

  return {
    uploaded: true,
    version,
    document: updated
  };
}

/**
 * Get document versions
 */
async function getDocumentVersions(documentId) {
  return await prisma.document_versions.findMany({
    where: { documentId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Restore document to specific version
 */
async function restoreVersion(documentId, versionId, userId) {
  const version = await prisma.document_versions.findUnique({
    where: { id: versionId }
  });

  if (!version || version.documentId !== documentId) {
    throw new Error('Version not found');
  }

  // Create new version record for current state before restore
  const document = await prisma.documents.findUnique({
    where: { id: documentId }
  });

  await prisma.document_versions.create({
    data: {
      documentId,
      version: `${document.version}-backup`,
      filePath: document.filePath,
      fileSize: document.fileSize,
      hash: document.hash,
      changes: 'Backup before restore',
      createdBy: userId
    }
  });

  // Restore to selected version
  return await prisma.documents.update({
    where: { id: documentId },
    data: {
      version: `${version.version}-restored`,
      filePath: version.filePath,
      fileSize: version.fileSize,
      hash: version.hash,
      updatedAt: new Date()
    }
  });
}

/**
 * Get document statistics
 */
async function getDocumentStats(tenantId) {
  const documents = await prisma.documents.findMany({
    where: tenantId ? { tenantId } : {},
    include: { versions: true }
  });

  const totalSize = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  const versionCount = documents.reduce((sum, d) => sum + d.versions.length, 0);

  return {
    total: documents.length,
    byStatus: {
      draft: documents.filter(d => d.status === 'draft').length,
      review: documents.filter(d => d.status === 'review').length,
      approved: documents.filter(d => d.status === 'approved').length,
      archived: documents.filter(d => d.status === 'archived').length
    },
    byCategory: documents.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {}),
    byType: documents.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {}),
    storage: {
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      avgSizeMB: documents.length > 0
        ? (totalSize / documents.length / (1024 * 1024)).toFixed(2)
        : 0
    },
    versions: {
      total: versionCount,
      avgPerDoc: documents.length > 0
        ? (versionCount / documents.length).toFixed(2)
        : 0
    }
  };
}

/**
 * Search documents
 */
async function searchDocuments(query, filters = {}) {
  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { has: query } }
    ]
  };

  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;

  return await prisma.documents.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: filters.limit || 50
  });
}

/**
 * Link document to entity (risk, control, assessment, etc.)
 */
async function linkDocument(documentId, entityType, entityId) {
  return await prisma.document_links.create({
    data: {
      documentId,
      entityType,
      entityId
    }
  });
}

/**
 * Get documents linked to entity
 */
async function getLinkedDocuments(entityType, entityId) {
  const links = await prisma.document_links.findMany({
    where: { entityType, entityId },
    include: { document: true }
  });

  return links.map(l => l.document);
}

/**
 * Archive old documents
 */
async function archiveOldDocuments(daysThreshold = 365) {
  const cutoffDate = new Date(Date.now() - (daysThreshold * 24 * 60 * 60 * 1000));

  const result = await prisma.documents.updateMany({
    where: {
      updatedAt: { lt: cutoffDate },
      status: { notIn: ['archived'] }
    },
    data: {
      status: 'archived',
      archivedAt: new Date()
    }
  });

  return { archived: result.count };
}

/**
 * Bulk upload documents
 */
async function bulkUpload(files, metadata, tenantId, userId) {
  const uploaded = [];
  const failed = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      const meta = metadata[i] || {};
      const fileMetadata = parseFileMetadata(file);
      const hash = calculateHash(file.buffer || file.path);

      const document = await createDocument({
        title: meta.title || file.originalname,
        description: meta.description,
        category: meta.category || 'general',
        type: fileMetadata.extension,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        hash,
        tags: meta.tags || [],
        tenantId,
        createdBy: userId
      });

      uploaded.push(document);
    } catch (error) {
      failed.push({
        filename: files[i].originalname,
        error: error.message
      });
    }
  }

  return {
    uploaded: uploaded.length,
    failed: failed.length,
    details: { uploaded, failed }
  };
}

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadVersion,
  getDocumentVersions,
  restoreVersion,
  getDocumentStats,
  searchDocuments,
  linkDocument,
  getLinkedDocuments,
  archiveOldDocuments,
  bulkUpload,
  generateVersion,
  calculateHash,
  parseFileMetadata
};
