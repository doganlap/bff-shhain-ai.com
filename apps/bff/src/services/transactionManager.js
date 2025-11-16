/**
 * Transaction Manager
 * Handles database transactions for complex multi-step operations
 */

const prisma = require('../../db/prisma');
const { logger } = require('../../utils/logger');

class TransactionManager {
  /**
   * Execute operations within a transaction
   * @param {Function} operations - Async function containing transaction operations
   * @param {Object} context - Transaction context (userId, tenantId, etc.)
   */
  async executeTransaction(operations, context = {}) {
    const startTime = Date.now();
    const transactionId = this.generateTransactionId();

    logger.info('Starting transaction', {
      transactionId,
      userId: context.userId,
      tenantId: context.tenantId
    });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Set transaction context
        if (context.tenantId) {
          await tx.$executeRaw`SET app.current_tenant_id = ${context.tenantId}`;
        }

        // Execute operations
        return await operations(tx);
      }, {
        maxWait: 5000, // 5 seconds max wait to start transaction
        timeout: 30000, // 30 seconds max transaction time
        isolationLevel: 'ReadCommitted' // Default isolation level
      });

      const duration = Date.now() - startTime;
      logger.info('Transaction completed successfully', {
        transactionId,
        durationMs: duration
      });

      return {
        success: true,
        data: result,
        transactionId,
        durationMs: duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Transaction failed', {
        transactionId,
        error: error.message,
        durationMs: duration
      });

      throw {
        success: false,
        error: error.message,
        transactionId,
        durationMs: duration
      };
    }
  }

  /**
   * Create assessment with controls in a transaction
   */
  async createAssessmentWithControls(assessmentData, controlIds, userId, tenantId) {
    return this.executeTransaction(async (tx) => {
      // 1. Create assessment
      const assessment = await tx.assessments.create({
        data: {
          ...assessmentData,
          created_by: userId,
          tenant_id: tenantId,
          status: 'draft',
          progress: 0,
          controls_total: controlIds.length
        }
      });

      // 2. Link controls to assessment
      const assessmentControls = await Promise.all(
        controlIds.map(controlId =>
          tx.assessment_controls.create({
            data: {
              assessment_id: assessment.id,
              control_id: controlId,
              status: 'not_started',
              assigned_to: userId,
              tenant_id: tenantId
            }
          })
        )
      );

      // 3. Create audit log entry
      await tx.activity_logs.create({
        data: {
          user_id: userId,
          action: 'CREATE',
          entity_type: 'assessment',
          entity_id: assessment.id,
          new_values: {
            title: assessment.title,
            framework_id: assessment.framework_id,
            controls_count: controlIds.length
          }
        }
      });

      // 4. Create initial workflow
      await tx.assessment_workflow.create({
        data: {
          assessment_id: assessment.id,
          workflow_type: 'assessment_creation',
          status: 'pending',
          priority: assessmentData.priority || 'medium',
          assigned_to: userId,
          assigned_by: userId
        }
      });

      return {
        assessment,
        controls: assessmentControls,
        controlsCount: assessmentControls.length
      };
    }, { userId, tenantId });
  }

  /**
   * Update assessment control with evidence
   */
  async updateControlWithEvidence(controlId, updateData, evidenceFiles, userId, tenantId) {
    return this.executeTransaction(async (tx) => {
      // 1. Get current control data
      const currentControl = await tx.assessment_controls.findUnique({
        where: { id: controlId }
      });

      if (!currentControl) {
        throw new Error('Assessment control not found');
      }

      // 2. Update control
      const updatedControl = await tx.assessment_controls.update({
        where: { id: controlId },
        data: {
          ...updateData,
          evidence_files: evidenceFiles,
          last_reviewed_date: new Date(),
          reviewed_by: userId,
          updated_at: new Date()
        }
      });

      // 3. Create history entry
      await tx.assessment_history.create({
        data: {
          assessment_id: currentControl.assessment_id,
          control_id: controlId,
          user_id: userId,
          action: 'UPDATE_EVIDENCE',
          old_value: JSON.stringify(currentControl),
          new_value: JSON.stringify(updatedControl),
          description: `Evidence updated for control ${controlId}`
        }
      });

      // 4. Update assessment progress
      const assessment = await tx.assessments.findUnique({
        where: { id: currentControl.assessment_id },
        include: {
          assessment_controls: true
        }
      });

      const completedControls = assessment.assessment_controls.filter(
        c => c.status === 'completed'
      ).length;

      const progress = Math.round(
        (completedControls / assessment.controls_total) * 100
      );

      await tx.assessments.update({
        where: { id: currentControl.assessment_id },
        data: {
          progress,
          controls_completed: completedControls,
          updated_at: new Date()
        }
      });

      return {
        control: updatedControl,
        assessmentProgress: progress
      };
    }, { userId, tenantId });
  }

  /**
   * Complete assessment workflow
   */
  async completeAssessment(assessmentId, completionData, userId, tenantId) {
    return this.executeTransaction(async (tx) => {
      // 1. Verify all controls are completed
      const controls = await tx.assessment_controls.findMany({
        where: { 
          assessment_id: assessmentId,
          tenant_id: tenantId
        }
      });

      const incompleteControls = controls.filter(
        c => c.status !== 'completed' && c.status !== 'not_applicable'
      );

      if (incompleteControls.length > 0) {
        throw new Error(
          `Cannot complete assessment: ${incompleteControls.length} controls are incomplete`
        );
      }

      // 2. Calculate final score
      const passedControls = controls.filter(
        c => c.compliance_status === 'compliant'
      ).length;

      const totalApplicable = controls.filter(
        c => c.status !== 'not_applicable'
      ).length;

      const compliancePercentage = totalApplicable > 0
        ? Math.round((passedControls / totalApplicable) * 100)
        : 0;

      // 3. Update assessment
      const assessment = await tx.assessments.update({
        where: { id: assessmentId },
        data: {
          status: 'completed',
          completed_date: new Date(),
          progress: 100,
          compliance_percentage: compliancePercentage,
          controls_passed: passedControls,
          controls_failed: totalApplicable - passedControls,
          overall_score: compliancePercentage,
          ...completionData
        }
      });

      // 4. Complete workflow
      await tx.assessment_workflow.updateMany({
        where: {
          assessment_id: assessmentId,
          status: { in: ['pending', 'in_progress'] }
        },
        data: {
          status: 'completed',
          approved_at: new Date(),
          approved_by: userId
        }
      });

      // 5. Create completion audit log
      await tx.activity_logs.create({
        data: {
          user_id: userId,
          action: 'COMPLETE',
          entity_type: 'assessment',
          entity_id: assessmentId,
          old_values: { status: 'in_progress' },
          new_values: {
            status: 'completed',
            compliance_percentage: compliancePercentage,
            completed_by: userId
          }
        }
      });

      return {
        assessment,
        compliancePercentage,
        controlsSummary: {
          total: controls.length,
          passed: passedControls,
          failed: totalApplicable - passedControls,
          notApplicable: controls.length - totalApplicable
        }
      };
    }, { userId, tenantId });
  }

  /**
   * Bulk update controls (for batch operations)
   */
  async bulkUpdateControls(controlIds, updateData, userId, tenantId) {
    return this.executeTransaction(async (tx) => {
      const results = await Promise.all(
        controlIds.map(async (controlId) => {
          const updated = await tx.assessment_controls.update({
            where: { id: controlId },
            data: {
              ...updateData,
              reviewed_by: userId,
              updated_at: new Date()
            }
          });

          // Create history entry for each
          await tx.assessment_history.create({
            data: {
              assessment_id: updated.assessment_id,
              control_id: controlId,
              user_id: userId,
              action: 'BULK_UPDATE',
              new_value: JSON.stringify(updateData),
              description: `Bulk update applied to control ${controlId}`
            }
          });

          return updated;
        })
      );

      return {
        updatedCount: results.length,
        controls: results
      };
    }, { userId, tenantId });
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

module.exports = new TransactionManager();
