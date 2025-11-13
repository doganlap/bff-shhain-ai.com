import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronUp, ChevronDown, Search, Filter, 
  MoreVertical, Eye, Edit, Trash2
} from 'lucide-react';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { CRUDActions } from './ActionButtons';
import BulkOperationsBar from './BulkOperationsBar';
import { Tooltip } from '../ui/Tooltip';
import { AnimatedCard } from '../Animation/InteractiveAnimationToolkit';

/**
 * Enhanced Data Table with Bulk Operations
 * Supports sorting, filtering, pagination, and bulk operations
 */
const DataTable = ({
  data = [],
  columns = [],
  resource,
  onAction,
  onRefresh,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  emptyMessage,
  loading = false
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Bulk operations hook
  const {
    selectedItems,
    selectedCount,
    selectItem,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    getAvailableBulkActions,
    handleBulkAction,
    isProcessing,
    processingProgress
  } = useBulkOperations(resource, onRefresh);

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = getNestedValue(item, column.key);
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          const itemValue = getNestedValue(item, key);
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Utility function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle bulk operations
  const handleBulkOperationAction = async (actionKey) => {
    try {
      const result = await handleBulkAction(actionKey);
      if (result.success) {
        console.log('Bulk operation completed:', result.message);
      }
    } catch (error) {
      console.error('Bulk operation failed:', error.message);
    }
  };

  // Render cell content
  const renderCell = (item, column) => {
    const value = getNestedValue(item, column.key);

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'status') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      );
    }

    return value?.toString() || '-';
  };

  // Get unique filter values for a column
  const getFilterOptions = (columnKey) => {
    const values = data.map(item => getNestedValue(item, columnKey))
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return values;
  };

  if (loading) {
    return (
      <AnimatedCard>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.messages.loading')}</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.actions.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {filterable && (
            <div className="flex gap-2">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <select
                    key={column.key}
                    value={filters[column.key] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [column.key]: e.target.value
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{column.filterLabel || `All ${column.label}`}</option>
                    {getFilterOptions(column.key).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <AnimatedCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected(paginatedData)}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate(paginatedData);
                      }}
                      onChange={() => selectAll(paginatedData)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={`h-3 w-3 ${
                              sortConfig.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-blue-600' : 'text-gray-400'
                            }`} 
                          />
                          <ChevronDown 
                            className={`h-3 w-3 -mt-1 ${
                              sortConfig.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-blue-600' : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 2 : 1)} 
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage || t('common.messages.noData')}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50 ${
                      isSelected(item.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected(item.id)}
                          onChange={() => selectItem(item.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td 
                        key={column.key} 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <CRUDActions
                        resource={resource}
                        resourceId={item.id}
                        resourceOwnerId={item.created_by}
                        onAction={(action, data) => onAction?.(action, { ...data, item })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-700">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* Bulk Operations Bar */}
      <BulkOperationsBar
        selectedCount={selectedCount}
        availableActions={getAvailableBulkActions()}
        onAction={handleBulkOperationAction}
        onClearSelection={clearSelection}
        isProcessing={isProcessing}
        processingProgress={processingProgress}
      />
    </div>
  );
};

export default DataTable;
