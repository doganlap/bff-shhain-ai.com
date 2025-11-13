import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRolePermissions } from './useRolePermissions';
import { apiServices } from '../services/api';

/**
 * Bulk Operations Hook
 * Manages multi-select operations with permission checks and batch processing
 */
export const useBulkOperations = (resource, onRefresh) => {
  const { t } = useTranslation();
  const { canUpdate, canDelete, canApprove, canReject } = useRolePermissions();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Selection management
  const selectItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, []);

  const selectAll = useCallback((items) => {
    const allIds = items.map(item => item.id);
    setSelectedItems(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((itemId) => {
    return selectedItems.includes(itemId);
  }, [selectedItems]);

  const isAllSelected = useCallback((items) => {
    return items.length > 0 && selectedItems.length === items.length;
  }, [selectedItems]);

  const isIndeterminate = useCallback((items) => {
    return selectedItems.length > 0 && selectedItems.length < items.length;
  }, [selectedItems]);

  // Bulk operations with progress tracking
  const executeBulkOperation = useCallback(async (operation, items, options = {}) => {
    if (!items || items.length === 0) return { success: false, error: 'No items selected' };

    setIsProcessing(true);
    setProcessingProgress(0);

    const results = {
      success: [],
      failed: [],
      total: items.length
    };

    try {
      // Process items in batches to avoid overwhelming the server
      const batchSize = options.batchSize || 10;
      const batches = [];
      
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      let processedCount = 0;

      for (const batch of batches) {
        const batchPromises = batch.map(async (itemId) => {
          try {
            let result;
            
            switch (operation) {
              case 'delete':
                result = await apiServices[resource].delete(itemId);
                break;
              case 'update':
                result = await apiServices[resource].update(itemId, options.updateData);
                break;
              case 'approve':
                result = await apiServices[resource].approve(itemId, options.approvalData);
                break;
              case 'reject':
                result = await apiServices[resource].reject(itemId, options.rejectionData);
                break;
              case 'export':
                result = await apiServices[resource].export([itemId]);
                break;
              case 'assign':
                result = await apiServices[resource].assign(itemId, options.assigneeId);
                break;
              default:
                throw new Error(`Unknown operation: ${operation}`);
            }

            results.success.push({ id: itemId, result });
            return { success: true, id: itemId };
          } catch (error) {
            results.failed.push({ id: itemId, error: error.message });
            return { success: false, id: itemId, error };
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        processedCount += batch.length;
        setProcessingProgress((processedCount / items.length) * 100);
      }

      // Clear selection after successful operation
      if (results.success.length > 0) {
        clearSelection();
        
        // Refresh data if callback provided
        if (onRefresh) {
          await onRefresh();
        }
      }

      return {
        success: true,
        results,
        message: t('bulkOperations.completed', { 
          success: results.success.length, 
          failed: results.failed.length 
        })
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results
      };
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [resource, clearSelection, onRefresh, t]);

  // Specific bulk operations
  const bulkDelete = useCallback(async (items, options = {}) => {
    if (!canDelete(resource)) {
      throw new Error(t('permissions.insufficientPermissions'));
    }

    const confirmed = options.skipConfirmation || 
      window.confirm(t('bulkOperations.confirmations.bulkDelete', { count: items.length }));
    
    if (!confirmed) return { success: false, cancelled: true };

    return executeBulkOperation('delete', items, options);
  }, [resource, canDelete, executeBulkOperation, t]);

  const bulkUpdate = useCallback(async (items, updateData, options = {}) => {
    if (!canUpdate(resource)) {
      throw new Error(t('permissions.insufficientPermissions'));
    }

    return executeBulkOperation('update', items, { ...options, updateData });
  }, [resource, canUpdate, executeBulkOperation, t]);

  const bulkApprove = useCallback(async (items, approvalData = {}, options = {}) => {
    if (!canApprove(resource)) {
      throw new Error(t('permissions.insufficientPermissions'));
    }

    const confirmed = options.skipConfirmation || 
      window.confirm(t('bulkOperations.confirmations.bulkApprove', { count: items.length }));
    
    if (!confirmed) return { success: false, cancelled: true };

    return executeBulkOperation('approve', items, { ...options, approvalData });
  }, [resource, canApprove, executeBulkOperation, t]);

  const bulkReject = useCallback(async (items, rejectionData = {}, options = {}) => {
    if (!canReject(resource)) {
      throw new Error(t('permissions.insufficientPermissions'));
    }

    const confirmed = options.skipConfirmation || 
      window.confirm(t('bulkOperations.confirmations.bulkReject', { count: items.length }));
    
    if (!confirmed) return { success: false, cancelled: true };

    return executeBulkOperation('reject', items, { ...options, rejectionData });
  }, [resource, canReject, executeBulkOperation, t]);

  const bulkExport = useCallback(async (items, options = {}) => {
    return executeBulkOperation('export', items, options);
  }, [executeBulkOperation]);

  const bulkAssign = useCallback(async (items, assigneeId, options = {}) => {
    if (!canUpdate(resource)) {
      throw new Error(t('permissions.insufficientPermissions'));
    }

    return executeBulkOperation('assign', items, { ...options, assigneeId });
  }, [resource, canUpdate, executeBulkOperation, t]);

  // Get available bulk actions based on permissions
  const getAvailableBulkActions = useCallback(() => {
    const actions = [];

    if (canUpdate(resource)) {
      actions.push({
        key: 'bulkEdit',
        label: t('bulkOperations.actions.bulkEdit'),
        icon: 'Edit',
        variant: 'secondary'
      });
    }

    if (canDelete(resource)) {
      actions.push({
        key: 'bulkDelete',
        label: t('bulkOperations.actions.bulkDelete'),
        icon: 'Trash2',
        variant: 'danger'
      });
    }

    if (canApprove(resource)) {
      actions.push({
        key: 'bulkApprove',
        label: t('bulkOperations.actions.bulkApprove'),
        icon: 'CheckCircle',
        variant: 'success'
      });
    }

    if (canReject(resource)) {
      actions.push({
        key: 'bulkReject',
        label: t('bulkOperations.actions.bulkReject'),
        icon: 'XCircle',
        variant: 'danger'
      });
    }

    // Export is always available
    actions.push({
      key: 'bulkExport',
      label: t('bulkOperations.actions.bulkExport'),
      icon: 'Download',
      variant: 'ghost'
    });

    if (canUpdate(resource)) {
      actions.push({
        key: 'bulkAssign',
        label: t('bulkOperations.actions.bulkAssign'),
        icon: 'UserPlus',
        variant: 'secondary'
      });
    }

    return actions;
  }, [resource, canUpdate, canDelete, canApprove, canReject, t]);

  // Bulk operation handler
  const handleBulkAction = useCallback(async (actionKey, options = {}) => {
    if (selectedItems.length === 0) {
      throw new Error(t('bulkOperations.noItemsSelected'));
    }

    switch (actionKey) {
      case 'bulkDelete':
        return bulkDelete(selectedItems, options);
      case 'bulkUpdate':
        return bulkUpdate(selectedItems, options.updateData, options);
      case 'bulkApprove':
        return bulkApprove(selectedItems, options.approvalData, options);
      case 'bulkReject':
        return bulkReject(selectedItems, options.rejectionData, options);
      case 'bulkExport':
        return bulkExport(selectedItems, options);
      case 'bulkAssign':
        return bulkAssign(selectedItems, options.assigneeId, options);
      default:
        throw new Error(`Unknown bulk action: ${actionKey}`);
    }
  }, [selectedItems, bulkDelete, bulkUpdate, bulkApprove, bulkReject, bulkExport, bulkAssign, t]);

  return {
    // Selection state
    selectedItems,
    selectedCount: selectedItems.length,
    
    // Selection methods
    selectItem,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    
    // Bulk operations
    bulkDelete,
    bulkUpdate,
    bulkApprove,
    bulkReject,
    bulkExport,
    bulkAssign,
    handleBulkAction,
    
    // Available actions
    getAvailableBulkActions,
    
    // Processing state
    isProcessing,
    processingProgress,
    
    // Utilities
    hasSelection: selectedItems.length > 0,
    canPerformBulkOperations: selectedItems.length > 0
  };
};
