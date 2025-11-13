import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Global CRUD Hook
 *
 * Provides reusable CRUD operations for any entity
 * Eliminates code duplication across pages
 *
 * @param {Object} apiService - API service object with CRUD methods
 * @param {string} entityName - Name of entity for toast messages
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
 * } = useCRUD(apiService.assessments, 'Assessment');
 */
export const useCRUD = (apiService, entityName = 'Item') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

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
   * Create new item
   */
  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.create(data);
      if (response.data?.success) {
        toast.success(`${entityName} created successfully!`);
        await fetchAll(); // Refresh list
        return response.data?.data;
      }
      return null;
    } catch (err) {
      setError(err);
      console.error(`Error creating ${entityName}:`, err);
      toast.error(`Failed to create ${entityName.toLowerCase()}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService, entityName, fetchAll]);

  /**
   * Update existing item
   */
  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.update(id, data);
      if (response.data?.success) {
        toast.success(`${entityName} updated successfully!`);
        await fetchAll(); // Refresh list
        return response.data?.data;
      }
      return null;
    } catch (err) {
      setError(err);
      console.error(`Error updating ${entityName}:`, err);
      toast.error(`Failed to update ${entityName.toLowerCase()}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService, entityName, fetchAll]);

  /**
   * Delete item
   */
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.delete(id);
      if (response.data?.success) {
        toast.success(`${entityName} deleted successfully!`);
        await fetchAll(); // Refresh list
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error(`Error deleting ${entityName}:`, err);
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiService, entityName, fetchAll]);

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
