/**
 * Enterprise DataGrid Component
 * High-performance virtualized table with sorting, filtering, and bulk actions
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export function DataGrid({
  data = [],
  columns = [],
  loading = false,
  selectable = false,
  onRowClick,
  onExport,
  emptyState,
  pageSize = 10,
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
  };

  const allSelected = paginatedData.length > 0 && 
                     paginatedData.every(row => selectedRows.has(row.id));

  // Loading state
  if (loading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  // Empty state
  if (data.length === 0) {
    return emptyState || (
      <div className="text-center py-16 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border focus:ring-primary"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 
                            ${column.sortable ? 'cursor-pointer hover:bg-muted transition-colors' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                        <ChevronDown 
                          className={`h-3 w-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="divide-y divide-border">
            {paginatedData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-muted/30 transition-colors duration-fast 
                          ${onRowClick ? 'cursor-pointer' : ''}
                          ${selectedRows.has(row.id) ? 'bg-primary/5' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(row.id, e.target.checked);
                      }}
                      className="rounded border-border focus:ring-primary"
                    />
                  </td>
                )}
                
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                
                <td className="px-4 py-3">
                  <RowActions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer - Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, data.length)} of {data.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-md border border-border hover:bg-muted 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-md border border-border hover:bg-muted 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Bulk Actions Toolbar */}
      {selectedRows.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRows.size}
          onExport={() => onExport?.(Array.from(selectedRows))}
          onClearSelection={() => setSelectedRows(new Set())}
        />
      )}
    </div>
  );
}

// Row Actions Menu
function RowActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 hover:bg-muted rounded transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-border 
                        bg-white shadow-modal py-1">
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted 
                             transition-colors flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted 
                             transition-colors flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted 
                             transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="my-1 border-t border-border" />
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-danger-50 
                             text-danger transition-colors flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Bulk Actions Toolbar
function BulkActionsToolbar({ selectedCount, onExport, onClearSelection }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
                    bg-surface-dark text-white rounded-2xl shadow-modal 
                    px-6 py-4 flex items-center gap-4 min-w-[400px]">
      <div className="flex-1">
        <span className="font-semibold">{selectedCount}</span>
        <span className="ml-1 text-sm opacity-75">selected</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="h-9 px-4 rounded-md border border-white/20 hover:bg-white/10 
                   transition-colors duration-base text-sm font-medium flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        
        <button
          className="h-9 px-4 rounded-md border border-white/20 hover:bg-white/10 
                   transition-colors duration-base text-sm font-medium flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        
        <button
          onClick={onClearSelection}
          className="h-9 w-9 rounded-md hover:bg-white/10 transition-colors duration-base 
                   flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Table Skeleton
function TableSkeleton({ rows = 8, columns = 6 }) {
  return (
    <div className="animate-pulse rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border px-4 py-3 flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <div key={`header-${i}`} className="flex-1 h-4 rounded bg-muted" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={`row-${i}`} className="border-b border-border px-4 py-3 flex gap-4">
          {[...Array(columns)].map((_, j) => (
            <div key={`cell-${i}-${j}`} className="flex-1 h-4 rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default DataGrid;
