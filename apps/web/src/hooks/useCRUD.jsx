import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRBAC } from './useRBAC';

/**
 * Global CRUD Hook
 *
 * Provides reusable CRUD operations for any entity
 * Eliminates code duplication across pages
 *
 * @param {Object} apiService - API service object with CRUD methods
 * @param {string} entityName - Name of entity for toast messages
 * @param {Object} options - Configuration options
 * @param {boolean} options.optimisticUpdates - Enable optimistic UI updates
 * @param {boolean} options.requirePermission - Check permissions before operations
 * @param {string} options.permissionPrefix - Permission prefix (e.g., 'assessments')
 *
 * @example
 * const {
 *   data,
 *   loading,
 *   create,
 *   update,
 *   remove,
 *   fetchAll,
 *   formData,
 *   setFormData,
 *   resetForm
 * } = useCRUD(apiService.assessments, 'Assessment', {
 *   optimisticUpdates: true,
 *   requirePermission: true,
 *   permissionPrefix: 'assessments'
 * });
 */
export const useCRUD = (apiService, entityName = 'Item', options = {}) => {
  const { user, hasPermission } = useRBAC();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(new Set());

  /**
   * Fetch all items
   */
  const fetchAll = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAll(params);
      setData(response.data?.data || []);
      return response.data?.data || [];
    } catch (err) {
      setError(err);
      console.error(`Error fetching ${entityName}:`, err);
      toast.error(`Failed to load ${entityName.toLowerCase()}s`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiService, entityName]);

  /**
   * Fetch single item by ID
   */
  const fetchById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getById(id);
      const item = response.data?.data;
      setSelectedItem(item);
      return item;
    } catch (err) {
      setError(err);
      console.error(`Error fetching ${entityName}:`, err);
      toast.error(`Failed to load ${entityName.toLowerCase()}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService, entityName]);

  /**
   * Check permissions for an operation
   */
  const checkPermission = useCallback((operation) => {
    if (!options.requirePermission || !options.permissionPrefix) {
      return true;
    }
    
    const permissionMap = {
      create: `${options.permissionPrefix}:create`,
      read: `${options.permissionPrefix}:view`,
      update: `${options.permissionPrefix}:edit`,
      delete: `${options.permissionPrefix}:delete`
    };
    
    const requiredPermission = permissionMap[operation];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      toast.error(`You don't have permission to ${operation} ${entityName.toLowerCase()}s`);
      return false;
    }
    return true;
  }, [options.requirePermission, options.permissionPrefix, hasPermission, entityName]);

  /**
   * Create new item with optimistic updates
   */
  const create = useCallback(async (data) => {
    if (!checkPermission('create')) return null;
    
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      ...data,
      id: tempId,
      isOptimistic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistic update
    if (options.optimisticUpdates) {
      setData(prev => [optimisticItem, ...prev]);
      setPendingOperations(prev => new Set([...prev, tempId]));
    }

    try {
      setError(null);
      const response = await apiService.create(data);
      
      if (response.data?.success) {
        const newItem = response.data.data;
        
        // Replace optimistic item with real item
        if (options.optimisticUpdates) {
          setData(prev => prev.map(item => 
            item.id === tempId ? { ...newItem, isOptimistic: false } : item
          ));
          setPendingOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(tempId);
            return newSet;
          });
        } else {
          await fetchAll(); // Refresh list
        }
        
        toast.success(`${entityName} created successfully!`);
        return newItem;
      } else {
        throw new Error('Creation failed');
      }
    } catch (err) {
      // Rollback optimistic update
      if (options.optimisticUpdates) {
        setData(prev => prev.filter(item => item.id !== tempId));
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      }
      
      setError(err);
      console.error(`Error creating ${entityName}:`, err);
      toast.error(`Failed to create ${entityName.toLowerCase()}`);
      return null;
    }
  }, [apiService, entityName, fetchAll, options.optimisticUpdates, checkPermission]);

  /**
   * Update existing item with optimistic updates
   */
  const update = useCallback(async (id, data) => {
    if (!checkPermission('update')) return null;
    
    // Find the item to update
    const itemToUpdate = data.find(item => item.id === id);
    if (!itemToUpdate) return null;
    
    // Store original data for rollback
    const originalData = { ...itemToUpdate };
    
    // Optimistic update
    if (options.optimisticUpdates) {
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...data, isOptimistic: true } : item
      ));
      setPendingOperations(prev => new Set([...prev, id]));
    }

    try {
      setError(null);
      const response = await apiService.update(id, data);
      
      if (response.data?.success) {
        const updatedItem = response.data.data;
        
        // Replace optimistic update with real data
        if (options.optimisticUpdates) {
          setData(prev => prev.map(item => 
            item.id === id ? { ...updatedItem, isOptimistic: false } : item
          ));
          setPendingOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        } else {
          await fetchAll(); // Refresh list
        }
        
        toast.success(`${entityName} updated successfully!`);
        return updatedItem;
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      // Rollback optimistic update
      if (options.optimisticUpdates) {
        setData(prev => prev.map(item => 
          item.id === id ? { ...originalData, isOptimistic: false } : item
        ));
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      setError(err);
      console.error(`Error updating ${entityName}:`, err);
      toast.error(`Failed to update ${entityName.toLowerCase()}`);
      return null;
    }
  }, [apiService, entityName, fetchAll, options.optimisticUpdates, checkPermission, data]);

  /**
   * Delete item with optimistic updates
   */
  const remove = useCallback(async (id) => {
    if (!checkPermission('delete')) return false;
    
    // Store item for rollback
    const itemToDelete = data.find(item => item.id === id);
    if (!itemToDelete) return false;
    
    // Optimistic update - remove item immediately
    if (options.optimisticUpdates) {
      setData(prev => prev.filter(item => item.id !== id));
      setPendingOperations(prev => new Set([...prev, id]));
    }

    try {
      setError(null);
      const response = await apiService.delete(id);
      
      if (response.data?.success) {
        if (!options.optimisticUpdates) {
          await fetchAll(); // Refresh list
        } else {
          setPendingOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
        
        toast.success(`${entityName} deleted successfully!`);
        return true;
      } else {
        throw new Error('Deletion failed');
      }
    } catch (err) {
      // Rollback optimistic update
      if (options.optimisticUpdates) {
        setData(prev => [...prev, itemToDelete]);
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      setError(err);
      console.error(`Error deleting ${entityName}:`, err);
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
      return false;
    }
  }, [apiService, entityName, fetchAll, options.optimisticUpdates, checkPermission, data]);

  /**
   * Reset form data
   */
  const resetForm = useCallback((initialData = {}) => {
    setFormData(initialData);
    setSelectedItem(null);
    setError(null);
  }, []);

  /**
   * Prepare form for editing
   */
  const prepareEdit = useCallback((item) => {
    setSelectedItem(item);
    setFormData(item);
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    selectedItem,
    pendingOperations,
    
    // Permission info
    canCreate: checkPermission('create'),
    canRead: checkPermission('read'),
    canUpdate: checkPermission('update'),
    canDelete: checkPermission('delete'),

    // CRUD operations
    fetchAll,
    fetchById,
    create,
    update,
    remove,

    // Form management
    formData,
    setFormData,
    resetForm,
    prepareEdit,
    setSelectedItem,
    
    // Utility functions
    checkPermission,
    isOptimistic: (id) => pendingOperations.has(id)
  };
};

/**
 * Extended CRUD Hook with additional operations
 */
export const useCRUDExtended = (apiService, entityName = 'Item', options = {}) => {
  const crudHook = useCRUD(apiService, entityName);
  const [filters, setFilters] = useState(options.initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: options.pageSize || 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Fetch with filters and pagination
   */
  const fetchWithFilters = useCallback(async () => {
    const params = {
      ...filters,
      search: searchTerm,
      page: pagination.page,
      limit: pagination.limit,
    };
    await crudHook.fetchAll(params);
  }, [crudHook, filters, searchTerm, pagination]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(options.initialFilters || {});
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [options.initialFilters]);

  return {
    ...crudHook,

    // Extended features
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    pagination,
    setPagination,
    fetchWithFilters,
    clearFilters,
  };
};

export default useCRUD;
