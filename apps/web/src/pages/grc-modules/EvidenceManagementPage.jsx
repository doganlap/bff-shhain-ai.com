import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Upload, Download, Eye, Trash2, Search, Filter,
  Calendar, CheckCircle, Clock, XCircle, AlertTriangle,
  Grid, List, ChevronUp, ChevronDown, RefreshCw, Plus, Shield, Folder, TrendingUp
} from 'lucide-react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { format } from 'date-fns';

const EvidenceManagementPage = () => {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    totalEvidence: 0,
    recentUploads: 0,
    approvedCount: 0,
    pendingCount: 0
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch evidence data
  const fetchEvidence = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.evidence.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort: sortField,
        include_metadata: true
      });

      if (response?.data) {
        setEvidence(response.data.data || response.data || []);
      } else {
        setEvidence([]);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('Failed to load evidence');
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy, categoryFilter, sortField]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.evidence.getStats();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching evidence stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
    fetchStats();
  }, [fetchEvidence, fetchStats]);

  // Calculate metrics
  const calculateMetrics = () => {
    const totalEvidence = stats.totalEvidence || evidence.length;
    const recentUploads = stats.recentUploads || evidence.filter(e => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 7);
      return new Date(e.created_at) > dayAgo;
    }).length;
    const approvedCount = stats.approvedCount || evidence.filter(e => e.status === 'approved').length;
    const pendingCount = stats.pendingCount || evidence.filter(e => e.status === 'pending').length;

    return [
      {
        title: 'Total Evidence',
        value: totalEvidence,
        icon: FileText,
        color: 'blue',
        trend: `${evidence.length} items`
      },
      {
        title: 'Recent Uploads',
        value: recentUploads,
        icon: TrendingUp,
        color: 'green',
        trend: 'Last 7 days'
      },
      {
        title: 'Approved',
        value: approvedCount,
        icon: CheckCircle,
        color: 'green',
        trend: `${((approvedCount / totalEvidence) * 100 || 0).toFixed(0)}% of total`
      },
      {
        title: 'Pending Review',
        value: pendingCount,
        icon: Clock,
        color: 'yellow',
        trend: 'Needs attention'
      }
    ];
  };

  const statsCards = calculateMetrics();

  // File upload handler
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', categoryFilter !== 'all' ? categoryFilter : 'general');
        formData.append('auto_classify', 'true');
        formData.append('name', file.name);

        return apiService.evidence.upload(formData);
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} evidence file(s) uploaded successfully`);
      setIsUploadModalOpen(false);
      fetchEvidence();
      fetchStats();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  // Delete evidence
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this evidence? This action cannot be undone.')) {
      try {
        await apiService.evidence.delete(id);
        toast.success('Evidence deleted successfully');
        fetchEvidence();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete evidence');
      }
    }
  };

  // Filter and sort data
  const filteredData = evidence.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || item.status === filterBy;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading && evidence.length === 0) {
    return (
      <EnterprisePageLayout
        title="Evidence Management"
        subtitle="Manage and track compliance evidence and documentation"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="Evidence Management"
      subtitle="Manage and track compliance evidence and documentation"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={`Switch to ${viewMode === 'grid' ? 'table' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Evidence
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search evidence by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="compliance">Compliance</option>
              <option value="audit">Audit</option>
              <option value="policy">Policy</option>
              <option value="control">Control</option>
              <option value="assessment">Assessment</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedData.length === 0 ? (
              <div className="col-span-full">
                <div className="border-2 border-dashed rounded-lg p-12 text-center border-gray-300 dark:border-gray-600">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No evidence found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Upload your first evidence file to get started
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Evidence
                  </button>
                </div>
              </div>
            ) : (
              sortedData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name || 'Untitled Evidence'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(item.file_url, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.created_at || Date.now()), 'MMM d, yyyy')}
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status || 'pending'}
                    </span>
                  </div>

                  {item.uploaded_by && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      By {item.uploaded_by.name || item.uploaded_by.email}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Date
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name || 'Untitled Evidence'}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.category || 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(item.created_at || Date.now()), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.uploaded_by?.name || item.uploaded_by?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(item.file_url, '_blank')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedData.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No evidence found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Evidence
                </h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300 dark:border-gray-600">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Select evidence files to upload
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Supports PDF, DOC, images, and more
                </p>
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                />
                <button
                  onClick={() => document.getElementById('evidence-upload').click()}
                  disabled={uploading}
                  className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Browse Files'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterprisePageLayout>
  );
};

export default EvidenceManagementPage;
