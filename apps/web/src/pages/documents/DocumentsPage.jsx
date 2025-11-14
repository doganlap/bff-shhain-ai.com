import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileText, Upload, Download, Eye, Edit, Trash2, Plus, Search, Filter,
  Calendar, Tag, AlertCircle, CheckCircle, Clock, X, Save, FileImage,
  FileSpreadsheet, FileCode, FileArchive, MoreVertical, Share2, Copy,
  Grid, List, TrendingUp, HardDrive, FolderOpen, ChevronUp, ChevronDown
} from 'lucide-react';
import { EnterprisePageLayout } from '../../components/layout/AdvancedShell';
import { useCRUD } from '../../hooks/useCRUD';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DocumentsPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalVersions: 0,
    totalSize: 0,
    recentUploads: 0
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const fileInputRef = useRef(null);

  // Use the CRUD hook for documents
  const {
    data: documents,
    loading,
    remove,
    fetchAll
  } = useCRUD(apiService.documents, 'Document');

  // Fetch documents function
  const fetchDocuments = useCallback(async () => {
    try {
      await fetchAll({
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, [fetchAll, searchTerm, filterCategory, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.documents.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch documents and stats on component mount
  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', filterCategory !== 'all' ? filterCategory : 'uncategorized');
        formData.append('name', file.name);
        formData.append('description', `Uploaded on ${format(new Date(), 'PPP')}`);

        return apiService.documents.upload(formData);
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} document(s) uploaded successfully`);
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      fetchDocuments();
      fetchStats();
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    }
  }, [filterCategory, fetchDocuments, fetchStats]);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconProps = { className: "h-8 w-8" };

    switch (ext) {
      case 'pdf':
        return <FileText {...iconProps} className="h-8 w-8 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText {...iconProps} className="h-8 w-8 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet {...iconProps} className="h-8 w-8 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage {...iconProps} className="h-8 w-8 text-purple-600" />;
      case 'zip':
      case 'rar':
        return <FileArchive {...iconProps} className="h-8 w-8 text-yellow-600" />;
      case 'js':
      case 'html':
      case 'css':
        return <FileCode {...iconProps} className="h-8 w-8 text-gray-600" />;
      default:
        return <FileText {...iconProps} className="h-8 w-8 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle document actions
  const handleViewDocument = async (document) => {
    setSelectedDocument(document);
    if (document.versions && document.versions.length > 0) {
      const latestVersion = document.versions[document.versions.length - 1];
      if (latestVersion.filePath) {
        window.open(`${import.meta.env.VITE_API_BASE_URL}/${latestVersion.filePath}`, '_blank');
      }
    } else {
      toast.error('No file available for preview');
    }
  };

  const handleDownloadDocument = async (document) => {
    if (document.versions && document.versions.length > 0) {
      const latestVersion = document.versions[document.versions.length - 1];
      if (latestVersion.filePath) {
        const link = window.document.createElement('a');
        link.href = `${import.meta.env.VITE_API_BASE_URL}/${latestVersion.filePath}`;
        link.download = document.name;
        link.click();
        toast.success('Download started');
      }
    } else {
      toast.error('No file available for download');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await remove(id);
        toast.success('Document deleted successfully');
        fetchDocuments();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleViewVersions = async (document) => {
    try {
      const response = await apiService.documents.getVersions(document.id);
      setSelectedDocument({ ...document, versionHistory: response.data });
      setShowVersions(true);
    } catch (error) {
      toast.error('Failed to load version history');
    }
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments || documents.length,
      icon: FileText,
      color: 'blue',
      trend: '+12% from last month'
    },
    {
      title: 'Total Size',
      value: formatFileSize(stats.totalSize || documents.reduce((sum, doc) => sum + (doc.size || 0), 0)),
      icon: HardDrive,
      color: 'purple',
      trend: '2.4 GB used'
    },
    {
      title: 'Recent Uploads',
      value: stats.recentUploads || documents.filter(d => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 7);
        return new Date(d.createdAt) > dayAgo;
      }).length,
      icon: TrendingUp,
      color: 'green',
      trend: 'Last 7 days'
    },
    {
      title: 'Categories',
      value: new Set(documents.map(d => d.category || 'uncategorized')).size,
      icon: FolderOpen,
      color: 'orange',
      trend: `${stats.totalVersions || 0} versions`
    }
  ];

  if (loading && documents.length === 0) {
    return (
      <EnterprisePageLayout
        title="Document Management"
        subtitle="Upload, organize, and manage your compliance documents"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="Document Management"
      subtitle="Upload, organize, and manage your compliance documents"
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
            Upload Documents
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
                placeholder="Search documents by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="compliance">Compliance</option>
              <option value="policy">Policy</option>
              <option value="report">Report</option>
              <option value="framework">Framework</option>
              <option value="vendor">Vendor</option>
              <option value="evidence">Evidence</option>
              <option value="contract">Contract</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Documents Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedDocuments.length === 0 ? (
              <div className="col-span-full">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Upload your first document or drag and drop files here
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </button>
                </div>
              </div>
            ) : (
              sortedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.name)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {document.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {document.versions && document.versions[0] ?
                            formatFileSize(document.versions[0].fileSize) : '0 KB'}
                          {document.versions && document.versions[0]?.fileType &&
                            ` • ${document.versions[0].fileType.split('/')[1]?.toUpperCase()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(document.createdAt), 'MMM d, yyyy')}
                    </div>

                    {document.versions && document.versions.length > 1 && (
                      <button
                        onClick={() => handleViewVersions(document)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {document.versions.length} versions
                      </button>
                    )}
                  </div>

                  {document.author && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      By {document.author.name || document.author.email}
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('size')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Size
                        {sortField === 'size' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Date
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Versions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getFileIcon(document.name)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {document.name}
                            </div>
                            {document.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {document.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {document.versions && document.versions[0]?.fileType?.split('/')[1]?.toUpperCase() || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {document.versions && document.versions[0] ? formatFileSize(document.versions[0].fileSize) : '0 KB'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {document.author?.name || document.author?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.versions && document.versions.length > 1 ? (
                          <button
                            onClick={() => handleViewVersions(document)}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {document.versions.length} versions
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">1 version</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
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

            {sortedDocuments.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documents found
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
                  Upload Documents
                </h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  Supports PDF, DOC, XLS, images, and more
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version History Modal */}
        {showVersions && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Version History: {selectedDocument.name}
                </h2>
                <button
                  onClick={() => setShowVersions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedDocument.versionHistory?.map((version, index) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Version {selectedDocument.versionHistory.length - index}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(version.createdAt), 'PPP p')} • {formatFileSize(version.fileSize)}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${version.filePath}`, '_blank')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterprisePageLayout>
  );
};

export default DocumentsPage;
