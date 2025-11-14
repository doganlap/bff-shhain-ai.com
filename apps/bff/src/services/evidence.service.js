/**
 * EVIDENCE SERVICE
 * Handles file uploads and evidence management for GRC tasks
 */

const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/evidence');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class EvidenceService {
  /**
   * Get multer middleware for single file upload
   */
  getUploadMiddleware() {
    return upload.single('file');
  }

  /**
   * Get multer middleware for multiple files upload
   */
  getMultipleUploadMiddleware(maxCount = 10) {
    return upload.array('files', maxCount);
  }

  /**
   * Upload evidence file for a task
   */
  async uploadEvidence(taskId, file, uploadedBy) {
    try {
      // Verify task exists
      const task = await prisma.tasks.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Create evidence record
      const evidence = {
        file_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        file_type: file.mimetype,
        file_url: `/api/tasks/evidence/${path.basename(file.path)}`,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        uploaded_by_name: uploadedBy // Can be enhanced with user lookup
      };

      // Update task's completion_evidence field
      const currentEvidence = task.completion_evidence
        ? (typeof task.completion_evidence === 'string'
            ? JSON.parse(task.completion_evidence)
            : task.completion_evidence)
        : [];

      const updatedEvidence = Array.isArray(currentEvidence)
        ? [...currentEvidence, evidence]
        : [evidence];

      await prisma.tasks.update({
        where: { id: taskId },
        data: {
          completion_evidence: JSON.stringify(updatedEvidence),
          updated_at: new Date()
        }
      });

      return evidence;
    } catch (error) {
      // Clean up uploaded file on error
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to delete file:', unlinkError);
        }
      }
      throw error;
    }
  }

  /**
   * Upload multiple evidence files for a task
   */
  async uploadMultipleEvidence(taskId, files, uploadedBy) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const evidence = await this.uploadEvidence(taskId, file, uploadedBy);
        results.push(evidence);
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  /**
   * Get evidence for a task
   */
  async getTaskEvidence(taskId) {
    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      select: { completion_evidence: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.completion_evidence) {
      return [];
    }

    const evidence = typeof task.completion_evidence === 'string'
      ? JSON.parse(task.completion_evidence)
      : task.completion_evidence;

    return Array.isArray(evidence) ? evidence : [];
  }

  /**
   * Delete evidence file
   */
  async deleteEvidence(taskId, evidenceIndex) {
    const task = await prisma.tasks.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const currentEvidence = task.completion_evidence
      ? (typeof task.completion_evidence === 'string'
          ? JSON.parse(task.completion_evidence)
          : task.completion_evidence)
      : [];

    if (!Array.isArray(currentEvidence) || evidenceIndex >= currentEvidence.length) {
      throw new Error('Evidence not found');
    }

    const evidenceToDelete = currentEvidence[evidenceIndex];

    // Delete physical file
    if (evidenceToDelete.file_path) {
      try {
        await fs.unlink(evidenceToDelete.file_path);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }

    // Remove from array
    currentEvidence.splice(evidenceIndex, 1);

    // Update task
    await prisma.tasks.update({
      where: { id: taskId },
      data: {
        completion_evidence: JSON.stringify(currentEvidence),
        updated_at: new Date()
      }
    });

    return { success: true };
  }

  /**
   * Get file from disk
   */
  async getFile(filename) {
    const filePath = path.join(__dirname, '../../uploads/evidence', filename);

    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      throw new Error('File not found');
    }
  }

  /**
   * Get evidence statistics
   */
  async getEvidenceStats(tenantId = 'default') {
    const tasks = await prisma.tasks.findMany({
      where: { tenant_id: tenantId },
      select: { completion_evidence: true, status: true }
    });

    let totalFiles = 0;
    let totalSize = 0;
    const fileTypes = {};

    tasks.forEach(task => {
      if (task.completion_evidence) {
        try {
          // Safely parse evidence - handle string, object, or invalid data
          let evidence;
          if (typeof task.completion_evidence === 'string') {
            // Try to parse as JSON, but handle malformed data
            try {
              evidence = JSON.parse(task.completion_evidence);
            } catch (parseError) {
              // If JSON parse fails, skip this task
              console.warn('Invalid JSON in completion_evidence:', parseError.message);
              return;
            }
          } else if (typeof task.completion_evidence === 'object') {
            evidence = task.completion_evidence;
          } else {
            // Not string or object, skip
            return;
          }

          if (Array.isArray(evidence)) {
            evidence.forEach(file => {
              totalFiles++;
              totalSize += file.file_size || 0;

              const type = file.file_type || 'unknown';
              fileTypes[type] = (fileTypes[type] || 0) + 1;
            });
          }
        } catch (error) {
          // Catch any other errors and continue
          console.warn('Error processing evidence for task:', error.message);
        }
      }
    });

    const tasksWithEvidence = tasks.filter(task => {
      if (!task.completion_evidence) return false;
      try {
        let evidence;
        if (typeof task.completion_evidence === 'string') {
          evidence = JSON.parse(task.completion_evidence);
        } else if (typeof task.completion_evidence === 'object') {
          evidence = task.completion_evidence;
        } else {
          return false;
        }
        return Array.isArray(evidence) && evidence.length > 0;
      } catch (error) {
        return false;
      }
    }).length;

    return {
      total_files: totalFiles,
      total_size_bytes: totalSize,
      total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
      tasks_with_evidence: tasksWithEvidence,
      total_tasks: tasks.length,
      evidence_completion_rate: ((tasksWithEvidence / tasks.length) * 100).toFixed(2),
      file_types: fileTypes
    };
  }
}

module.exports = new EvidenceService();
